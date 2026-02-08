import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CategorySales {
  name: string;
  percentage: number;
  color: string;
}

const COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-pink-500",
  "bg-cyan-500",
];

const SalesOverview = () => {
  const [categories, setCategories] = useState<CategorySales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorySales();
  }, []);

  const fetchCategorySales = async () => {
    const { data: items, error } = await supabase
      .from("order_items")
      .select("unit_price, quantity, product_id");

    if (error || !items) {
      setLoading(false);
      return;
    }

    // Get products to map categories
    const { data: products } = await supabase
      .from("products")
      .select("id, category");

    const productCategoryMap: Record<string, string> = {};
    (products || []).forEach((p) => {
      productCategoryMap[p.id] = p.category;
    });

    // Aggregate sales by category
    const categoryTotals: Record<string, number> = {};
    let grandTotal = 0;

    items.forEach((item) => {
      const cat = item.product_id ? (productCategoryMap[item.product_id] || "Uncategorized") : "Uncategorized";
      const amount = Number(item.unit_price) * item.quantity;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
      grandTotal += amount;
    });

    if (grandTotal === 0) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const sorted = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, total], i) => ({
        name,
        percentage: parseFloat(((total / grandTotal) * 100).toFixed(1)),
        color: COLORS[i % COLORS.length],
      }));

    setCategories(sorted);
    setLoading(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="font-heading font-semibold text-lg mb-2">Sales Overview</h3>
      <p className="text-sm text-muted-foreground mb-6">Category wise performance</p>

      {loading ? (
        <div className="space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-secondary/50 rounded animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
      ) : (
        <div className="space-y-5">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{cat.name}</span>
                <span className="text-muted-foreground">{cat.percentage}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cat.color}`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesOverview;
