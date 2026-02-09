import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MetricsCards from "@/components/admin/MetricsCards";
import SalesChart from "@/components/admin/SalesChart";
import ShipmentChart from "@/components/admin/ShipmentChart";
import RecentOrders from "@/components/admin/RecentOrders";
import SalesOverview from "@/components/admin/SalesOverview";
import NotificationPanel from "@/components/admin/NotificationPanel";

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
  });
  const [shipment, setShipment] = useState({
    delivered: 0,
    onDelivery: 0,
    returned: 0,
    canceled: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMetrics();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setProfile(data);
  };

  const fetchMetrics = async () => {
    const [productsRes, ordersRes, profilesRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, total_amount, status").eq("is_trashed", false),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const orders = ordersRes.data || [];
    const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    setMetrics({
      totalSales,
      totalCustomers: profilesRes.count || 0,
      totalProducts: productsRes.count || 0,
      totalOrders: orders.length,
    });

    setShipment({
      delivered: orders.filter((o) => o.status === "delivered").length,
      onDelivery: orders.filter((o) => o.status === "shipped" || o.status === "processing").length,
      returned: orders.filter((o) => o.status === "returned").length,
      canceled: orders.filter((o) => o.status === "canceled").length,
    });
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Admin";

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {displayName}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 w-[240px] rounded-full bg-card" />
          </div>
          <NotificationPanel />
          <Avatar className="w-9 h-9">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-xs font-semibold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Metrics */}
      <MetricsCards data={metrics} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <ShipmentChart data={shipment} />
      </div>

      {/* Orders + Sales Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <SalesOverview />
      </div>
    </div>
  );
};

export default Dashboard;
