import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLocation } from "react-router-dom";

const trackingSteps = [
  { status: "Order Placed", description: "Your order has been confirmed", icon: Package, date: "Feb 5, 2026", time: "10:30 AM", completed: true },
  { status: "Confirmed", description: "Order confirmed by warehouse", icon: CheckCircle2, date: "Feb 5, 2026", time: "2:15 PM", completed: true },
  { status: "Shipped", description: "Package picked up by courier", icon: Truck, date: "Feb 6, 2026", time: "9:00 AM", completed: true },
  { status: "Out for Delivery", description: "Your package is on its way", icon: MapPin, date: "Feb 8, 2026", time: "8:00 AM", completed: false },
  { status: "Delivered", description: "Package delivered successfully", icon: CheckCircle2, date: "-", time: "-", completed: false },
];

const OrderTrack = () => {
  const location = useLocation();
  const orderNumber = (location.state as any)?.orderNumber as string | undefined;
  const [orderId, setOrderId] = useState(orderNumber || "");
  const [tracked, setTracked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setTracked(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order ID to see the latest status and delivery updates.</p>

            {/* Thank you + Order ID banner (shown after placing order) */}
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
                <div className="flex items-center gap-2 bg-secondary text-foreground px-3 py-1 rounded-full text-sm font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  In Transit
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                {trackingSteps.map((step, index) => (
                  <div key={step.status} className="flex gap-4">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          step.completed
                            ? "bg-foreground text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <step.icon className="w-4 h-4" />
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-12 ${
                            step.completed ? "bg-foreground" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-8">
                      <p className={`font-heading font-semibold ${!step.completed && "text-muted-foreground"}`}>
                        {step.status}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.completed && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.date} at {step.time}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
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
