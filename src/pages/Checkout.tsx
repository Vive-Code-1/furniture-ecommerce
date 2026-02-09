import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, CreditCard, Banknote, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "",
  });

  const deliveryCharge = 15;

  const discount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? totalPrice * appliedCoupon.discount_value / 100
      : Math.min(appliedCoupon.discount_value, totalPrice)
    : 0;

  const grandTotal = totalPrice - discount + deliveryCharge;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({ title: "Invalid Coupon", description: "This coupon code doesn't exist or is inactive.", variant: "destructive" });
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({ title: "Expired Coupon", description: "This coupon has expired.", variant: "destructive" });
        return;
      }
      if (data.max_uses && data.used_count >= data.max_uses) {
        toast({ title: "Usage Limit", description: "This coupon has reached its usage limit.", variant: "destructive" });
        return;
      }
      if (totalPrice < data.min_order_amount) {
        toast({ title: "Minimum Not Met", description: `Minimum order of $${data.min_order_amount} required.`, variant: "destructive" });
        return;
      }

      setAppliedCoupon({ code: data.code, discount_type: data.discount_type, discount_value: data.discount_value });
      toast({ title: "Coupon Applied!", description: `${data.discount_type === "percentage" ? `${data.discount_value}%` : `$${data.discount_value}`} discount applied.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.zip}, ${formData.country}`;

      // Look up product IDs by name from the database
      const productNames = items.map((item) => item.name);
      const { data: dbProducts } = await supabase
        .from("products")
        .select("id, name")
        .in("name", productNames);

      const nameToId: Record<string, string> = {};
      dbProducts?.forEach((p) => { nameToId[p.name] = p.id; });

      // Build order items payload
      const orderItems = items.map((item) => ({
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        product_id: nameToId[item.name] || null,
      }));

      // Create order atomically via SECURITY DEFINER function
      const { data: orderResult, error: orderError } = await supabase.rpc("create_order", {
        p_customer_name: formData.name.trim(),
        p_customer_email: formData.email.trim(),
        p_shipping_address: shippingAddress,
        p_total_amount: grandTotal,
        p_user_id: user?.id || null,
        p_items: orderItems,
        p_coupon_code: appliedCoupon?.code || null,
        p_discount_amount: discount,
      });

      if (orderError) throw orderError;

      const result = orderResult as { id: string; order_number: string };

      if (paymentMethod === "online") {
        // Online payment: call UddoktaPay checkout
        const origin = window.location.origin;
        const { data: payData, error: payError } = await supabase.functions.invoke("uddoktapay-checkout", {
          body: {
            full_name: formData.name.trim(),
            email: formData.email.trim(),
            amount: grandTotal.toFixed(2),
            order_id: result.id,
            order_number: result.order_number,
            redirect_url: `${origin}/payment/success`,
            cancel_url: `${origin}/payment/cancel`,
          },
        });

        if (payError || !payData?.payment_url) {
          throw new Error(payData?.error || payError?.message || "Payment gateway error");
        }

        clearCart();
        // Navigate to payment URL - try multiple approaches for iframe compatibility
        try {
          window.open(payData.payment_url, "_blank");
        } catch {
          // Silently fail - the window.open should work in most cases
        }
        // Show success message with payment link as fallback
        toast({
          title: "Redirecting to Payment...",
          description: "A new tab should open. If not, click the link below.",
        });
        // Set a small timeout then navigate current window as last resort
        setTimeout(() => {
          try {
            window.location.href = payData.payment_url;
          } catch {
            // If even this fails (sandboxed iframe), show manual link
          }
        }, 1500);
        return;
      }

      // COD flow
      toast({
        title: "Order Placed Successfully!",
        description: `Your order ${result.order_number} has been confirmed. Pay on delivery.`,
      });
      clearCart();

      if (user) {
        navigate("/account", { state: { orderNumber: result.order_number } });
      } else {
        navigate("/track-order", { state: { orderNumber: result.order_number } });
      }
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12 md:pt-32 md:pb-20">
          <div className="container mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
              <h1 className="font-heading text-2xl md:text-3xl font-bold mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-6">Add some products to proceed with checkout.</p>
              <Button asChild className="rounded-full px-8">
                <Link to="/products">Browse Products</Link>
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">Checkout</h1>
          </motion.div>

          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 space-y-6"
              >
                {/* Shipping Address */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                      <Input placeholder="John Doe" value={formData.name} onChange={(e) => updateField("name", e.target.value)} className="rounded-xl bg-secondary border-border" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email</label>
                      <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="rounded-xl bg-secondary border-border" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Phone</label>
                      <Input placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="rounded-xl bg-secondary border-border" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Country</label>
                      <Input placeholder="United States" value={formData.country} onChange={(e) => updateField("country", e.target.value)} className="rounded-xl bg-secondary border-border" required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium mb-1.5 block">Address</label>
                      <Input placeholder="123 Main Street, Apt 4B" value={formData.address} onChange={(e) => updateField("address", e.target.value)} className="rounded-xl bg-secondary border-border" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">City</label>
                      <Input placeholder="New York" value={formData.city} onChange={(e) => updateField("city", e.target.value)} className="rounded-xl bg-secondary border-border" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">ZIP Code</label>
                      <Input placeholder="10001" value={formData.zip} onChange={(e) => updateField("zip", e.target.value)} className="rounded-xl bg-secondary border-border" required />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === "cod"
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-heading text-sm font-semibold">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay when you receive</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === "online"
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-heading text-sm font-semibold">Online Payment</p>
                        <p className="text-xs text-muted-foreground">Pay full amount online</p>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-28">
                  <h2 className="font-heading text-lg font-bold mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-secondary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code */}
                  <div className="border-t border-border pt-4">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-primary/10 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{appliedCoupon.code}</span>
                          <span className="text-xs text-muted-foreground">
                            (-{appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : `$${appliedCoupon.discount_value}`})
                          </span>
                        </div>
                        <button type="button" onClick={removeCoupon} className="text-muted-foreground hover:text-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="rounded-xl bg-secondary border-border uppercase text-sm"
                        />
                        <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={couponLoading} className="rounded-xl shrink-0">
                          {couponLoading ? "..." : "Apply"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-primary">
                        <span>Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>${deliveryCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-heading font-bold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                    {paymentMethod === "online" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Full amount will be charged online
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full rounded-full mt-6" size="lg" disabled={loading}>
                    {loading ? "Processing..." : paymentMethod === "cod" ? "Place Order (COD)" : `Pay $${grandTotal.toFixed(2)} & Order`}
                  </Button>
                </div>
              </motion.div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
