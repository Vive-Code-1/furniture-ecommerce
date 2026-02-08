import { useState, useEffect, useMemo } from "react";
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

export function useProducts() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(
        data.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image: p.thumbnail_url || "/placeholder.svg",
          category: p.category,
          description: p.description,
          thumbnail_url: p.thumbnail_url,
          stock_quantity: p.stock_quantity,
          is_active: p.is_active,
        }))
      );
    }
    setLoading(false);
  };

  const categories = useMemo(() => {
    const dbCats = products.map((p) => p.category);
    const allCats = new Set([...DEFAULT_CATEGORIES, ...dbCats]);
    // Keep "All" first, sort the rest
    const sorted = Array.from(allCats)
      .filter((c) => c !== "All")
      .sort();
    return ["All", ...sorted];
  }, [products]);

  return { products, categories, loading, refetch: fetchProducts };
}
