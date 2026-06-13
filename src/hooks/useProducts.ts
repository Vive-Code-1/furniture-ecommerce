import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string | null;
  thumbnail_url: string | null;
  stock_quantity: number;
  is_active: boolean;
  materials?: string;
  dimensions?: string;
}

const DEFAULT_CATEGORIES = ["All", "Chair", "Office Chair", "Cabinet", "Sofa", "Bed", "Bench", "Table"];

async function fetchProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, category, description, thumbnail_url, stock_quantity, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image: p.thumbnail_url || "/placeholder.svg",
    category: p.category,
    description: p.description,
    thumbnail_url: p.thumbnail_url,
    stock_quantity: p.stock_quantity,
    is_active: p.is_active,
  }));
}

export function useProducts() {
  const { data: products = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["products", "active"],
    queryFn: fetchProducts,
    staleTime: 5 * 60_000,
  });

  const categories = useMemo(() => {
    const dbCats = products.map((p) => p.category);
    const allCats = new Set([...DEFAULT_CATEGORIES, ...dbCats]);
    const sorted = Array.from(allCats).filter((c) => c !== "All").sort();
    return ["All", ...sorted];
  }, [products]);

  return { products, categories, loading, refetch };
}
