import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, PartyPopper, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", description: "Your order has been placed", icon: Package },
  { key: "processing", label: "Confirmed", description: "Order confirmed by warehouse", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", description: "Package picked up by courier", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", description: "Your package is on its way", icon: MapPin },
  { key: "delivered", label: "Delivered", description: "Package delivered successfully", icon: CheckCircle2 },
];

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  processing: { label: "Processing", className: "bg-blue-100 text-blue-700" },
  shipped: { label: "Shipped", className: "bg-violet-100 text-violet-700" },
  out_for_delivery: { label: "Out for Delivery", className: "bg-orange-100 text-orange-700" },
  delivered: { label: "Delivered", className: "bg-emerald-100 text-emerald-700" },
  canceled: { label: "Canceled", className: "bg-red-100 text-red-700" },
  returned: { label: "Returned", className: "bg-red-100 text-red-700" },
};

interface StatusHistory {
  status: string;
  changed_at: string;
}

const OrderTrack = () => {
  const location = useLocation();
  const orderNumber = (location.state as any)?.orderNumber as string | undefined;
  const [orderId, setOrderId] = useState(orderNumber || "");
  const [tracked, setTracked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const [historyMap, setHistoryMap] = useState<Record<string, string>>({});

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setNotFound(false);
    setTracked(false);

    // Fetch order by order_number
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, order_number")
      .eq("order_number", orderId.trim().toUpperCase())
      .maybeSingle();

    if (orderError || !order) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Fetch status history
    const { data: history } = await supabase
      .from("order_status_history" as any)
      .select("status, changed_at")
      .eq("order_id", order.id)
      .order("changed_at", { ascending: true });

    const map: Record<string, string> = {};
    if (history) {
      (history as unknown as StatusHistory[]).forEach((h) => {
        map[h.status] = h.changed_at;
      });
    }

    setCurrentStatus(order.status);
    setHistoryMap(map);
    setTracked(true);
    setLoading(false);
  };

  const badge = statusBadgeMap[currentStatus] || { label: currentStatus, className: "bg-secondary text-foreground" };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order ID to see the latest status and delivery updates.</p>

            {orderNumber && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 bg-card border border-border rounded-2xl p-5 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <PartyPopper className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-lg">Thank you for your order! 🎉</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your tracking ID is{" "}
                      <span className="font-semibold text-foreground">{orderNumber}</span>.
                      You can use this ID anytime to track your order status from here.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleTrack}
            className="flex gap-3 mb-10"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter Order ID (e.g. ORD-ABC123)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="pl-10 rounded-full bg-card border-border"
                required
              />
            </div>
            <Button type="submit" className="rounded-full px-6" disabled={loading}>
              {loading ? "Tracking..." : "Track"}
            </Button>
          </motion.form>

          {/* Not Found */}
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 text-center"
            >
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-heading font-semibold text-lg">Order not found</p>
              <p className="text-sm text-muted-foreground mt-1">
                No order found with ID <span className="font-semibold">{orderId.toUpperCase()}</span>. Please check and try again.
              </p>
            </motion.div>
          )}

          {/* Tracking Result */}
          {tracked && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-heading font-bold text-lg">{orderId.toUpperCase()}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
                  <Clock className="w-3.5 h-3.5" />
                  {badge.label}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                {STATUS_STEPS.map((step, index) => {
                  const completedAt = historyMap[step.key];
                  const isCompleted = !!completedAt;

                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? "bg-foreground text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          <step.icon className="w-4 h-4" />
                        </div>
                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className={`w-0.5 h-12 ${
                              isCompleted ? "bg-foreground" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-8">
                        <p className={`font-heading font-semibold ${!isCompleted && "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {isCompleted && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(completedAt), "MMM dd, yyyy")} at {format(new Date(completedAt), "hh:mm a")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTrack;
