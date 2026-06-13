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
    (async () => {
      const { data, error } = await supabase.rpc("get_category_sales");
      if (error || !data) {
        setLoading(false);
        return;
      }
      const rows = data as Array<{ category: string; total: number }>;
      const grandTotal = rows.reduce((s, r) => s + Number(r.total), 0);
      if (grandTotal === 0) {
        setCategories([]);
        setLoading(false);
        return;
      }
      setCategories(
        rows.slice(0, 7).map((r, i) => ({
          name: r.category,
          percentage: parseFloat(((Number(r.total) / grandTotal) * 100).toFixed(1)),
          color: COLORS[i % COLORS.length],
        }))
      );
      setLoading(false);
    })();
  }, []);

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
