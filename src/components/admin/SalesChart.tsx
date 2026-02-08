import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

interface ChartDataPoint {
  label: string;
  sales: number;
}

const SalesChart = () => {
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, [period]);

  const fetchSalesData = async () => {
    setLoading(true);
    const { data: orders, error } = await supabase
      .from("orders")
      .select("total_amount, order_date")
      .eq("is_trashed", false);

    if (error || !orders) {
      setLoading(false);
      return;
    }

    if (period === "monthly") {
      const now = new Date();
      const start = subMonths(now, 11);
      const months = eachMonthOfInterval({ start: startOfMonth(start), end: endOfMonth(now) });

      const monthlyData: ChartDataPoint[] = months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const total = orders
          .filter((o) => {
            const d = new Date(o.order_date);
            return d >= monthStart && d <= monthEnd;
          })
          .reduce((sum, o) => sum + Number(o.total_amount), 0);

        return { label: format(month, "MMM"), sales: total };
      });

      setData(monthlyData);
    } else {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });

      const weeklyData: ChartDataPoint[] = weeks.map((weekStart, i) => {
        const wStart = startOfWeek(weekStart, { weekStartsOn: 0 });
        const wEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
        const total = orders
          .filter((o) => {
            const d = new Date(o.order_date);
            return d >= wStart && d <= wEnd;
          })
          .reduce((sum, o) => sum + Number(o.total_amount), 0);

        return { label: `Week ${i + 1}`, sales: total };
      });

      setData(weeklyData);
    }

    setLoading(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-semibold text-lg">Sales Statistic</h3>
          <p className="text-sm text-muted-foreground">
            {period === "monthly" ? "Last 12 months revenue" : "Current month weekly revenue"}
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as "monthly" | "weekly")}
          className="text-sm bg-secondary rounded-lg px-3 py-1.5 border-none outline-none text-foreground"
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <div className="h-[280px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Sales"]}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#salesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesChart;
