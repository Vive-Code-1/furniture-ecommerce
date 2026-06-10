import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

type StepKey =
  | "pending"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

const STEP_ORDER: StepKey[] = [
  "pending",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const STEP_META: Record<
  StepKey,
  { label: string; description: string; icon: typeof Package }
> = {
  pending: {
    label: "Order Placed",
    description: "We've received your order",
    icon: Package,
  },
  processing: {
    label: "Confirmed",
    description: "Order confirmed and being prepared",
    icon: CheckCircle2,
  },
  shipped: {
    label: "Shipped",
    description: "Package picked up by courier",
    icon: Truck,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    description: "Your package is on its way",
    icon: MapPin,
  },
  delivered: {
    label: "Delivered",
    description: "Package delivered successfully",
    icon: CheckCircle2,
  },
};

const STATUS_BADGE: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  },
  processing: {
    label: "Processing",
    icon: CheckCircle2,
    className: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    className: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: MapPin,
    className: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    className:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
  },
};

interface TimelineStep {
  key: StepKey;
  label: string;
  description: string;
  icon: typeof Package;
  completed: boolean;
  date?: string;
  time?: string;
}

interface OrderResult {
  orderNumber: string;
  status: string;
  steps: TimelineStep[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const OrderTrack = () => {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("id, order_number, status, created_at")
        .eq("order_number", trimmed.toUpperCase())
        .maybeSingle();

      if (orderErr) throw orderErr;
      if (!order) {
        setError(
          `We couldn't find an order with ID "${trimmed.toUpperCase()}". Please double-check and try again.`,
        );
        return;
      }

      const { data: history, error: histErr } = await supabase
        .from("order_status_history")
        .select("status, changed_at")
        .eq("order_id", order.id)
        .order("changed_at", { ascending: true });

      if (histErr) throw histErr;

      // First-seen timestamp per status from history
      const firstSeen = new Map<string, string>();
      (history ?? []).forEach((h) => {
        if (!firstSeen.has(h.status)) firstSeen.set(h.status, h.changed_at);
      });
      // Fallback: if pending has no history row, use order.created_at
      if (!firstSeen.has("pending") && order.created_at) {
        firstSeen.set("pending", order.created_at);
      }

      const steps: TimelineStep[] = STEP_ORDER.map((key) => {
        const ts = firstSeen.get(key);
        const meta = STEP_META[key];
        return {
          key,
          label: meta.label,
          description: meta.description,
          icon: meta.icon,
          completed: Boolean(ts),
          date: ts ? formatDate(ts) : undefined,
          time: ts ? formatTime(ts) : undefined,
        };
      });

      setResult({
        orderNumber: order.order_number,
        status: order.status,
        steps,
      });
    } catch (err) {
      console.error("Order tracking error:", err);
      setError("Something went wrong while fetching your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const badge =
    result && STATUS_BADGE[result.status]
      ? STATUS_BADGE[result.status]
      : result
        ? {
            label: result.status,
            icon: Clock,
            className: "bg-secondary text-foreground",
          }
        : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">
              Enter your order ID to see the latest status and delivery updates.
            </p>
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
              <Label htmlFor="order-id-input" className="sr-only">
                Order ID
              </Label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="order-id-input"
                placeholder="Enter Order ID (e.g. ORD-ABC123)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="pl-10 rounded-full bg-card border-border"
              />
            </div>
            <Button type="submit" className="rounded-full px-6" disabled={loading}>
              {loading ? "Tracking..." : "Track"}
            </Button>
          </motion.form>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Tracking Result */}
          {result && badge && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-heading font-bold text-lg">
                    {result.orderNumber}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}
                >
                  <badge.icon className="w-3.5 h-3.5" />
                  {badge.label}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                {result.steps.map((step, index) => {
                  const Icon = step.icon;
                  const isLast = index === result.steps.length - 1;
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            step.completed
                              ? "bg-foreground text-primary-foreground"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 h-12 ${
                              step.completed ? "bg-foreground" : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                      <div className={isLast ? "" : "pb-8"}>
                        <p
                          className={`font-heading font-semibold ${
                            step.completed ? "" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        {step.completed && step.date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {step.date} at {step.time}
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
