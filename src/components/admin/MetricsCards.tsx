import { DollarSign, Users, Package, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface MetricsData {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
}

const MetricsCards = ({ data }: { data: MetricsData }) => {
  const cards = [
    {
      label: "Total Sales",
      value: `$${(data.totalSales / 1000).toFixed(1)}K`,
      icon: DollarSign,
      change: "+12.5%",
      trend: "up" as const,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Customers",
      value: data.totalCustomers.toLocaleString(),
      icon: Users,
      change: "+8.2%",
      trend: "up" as const,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Products",
      value: data.totalProducts.toLocaleString(),
      icon: Package,
      change: "+3.1%",
      trend: "up" as const,
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "Total Orders",
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: "-2.4%",
      trend: "down" as const,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${
              card.trend === "up" ? "text-emerald-600" : "text-red-500"
            }`}>
              {card.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {card.change}
            </div>
          </div>
          <p className="text-2xl font-heading font-bold">{card.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default MetricsCards;
