import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Star, User, LogOut, ChevronRight, Clock, CheckCircle2, Truck, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WriteReviewDialog from "@/components/account/WriteReviewDialog";

interface Order {
  id: string;
  order_number: string;
  order_date: string;
  status: string;
  total_amount: number;
  customer_name: string;
  shipping_address: string | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Review {
  id: string;
  rating: number;
  review_text: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
  product_id: string | null;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  pending: { icon: Clock, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  processing: { icon: Package, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped: { icon: Truck, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  delivered: { icon: PackageCheck, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  cancelled: { icon: Clock, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null; email: string | null } | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setDataLoading(true);

    const [ordersRes, profileRes, reviewsRes] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", user.id).order("order_date", { ascending: false }),
      supabase.from("profiles").select("full_name, email").eq("user_id", user.id).maybeSingle(),
      supabase.from("reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (ordersRes.data) {
      setOrders(ordersRes.data);
      // Fetch order items for all orders
      const orderIds = ordersRes.data.map((o) => o.id);
      if (orderIds.length > 0) {
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds);
        if (items) {
          const grouped: Record<string, OrderItem[]> = {};
          items.forEach((item) => {
            if (!grouped[item.order_id]) grouped[item.order_id] = [];
            grouped[item.order_id].push(item);
          });
          setOrderItems(grouped);
        }
      }
    }
    if (profileRes.data) setProfile(profileRes.data);
    if (reviewsRes.data) setReviews(reviewsRes.data);

    setDataLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const openReviewDialog = (order: Order) => {
    setSelectedOrder(order);
    setReviewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold">My Account</h1>
                <p className="text-muted-foreground text-sm mt-1">{profile?.email || user.email}</p>
              </div>
              <Button variant="outline" className="rounded-full gap-2" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>

            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList className="bg-card border border-border rounded-full p-1">
                <TabsTrigger value="orders" className="rounded-full gap-2 data-[state=active]:bg-foreground data-[state=active]:text-primary-foreground">
                  <Package className="w-4 h-4" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-full gap-2 data-[state=active]:bg-foreground data-[state=active]:text-primary-foreground">
                  <Star className="w-4 h-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="profile" className="rounded-full gap-2 data-[state=active]:bg-foreground data-[state=active]:text-primary-foreground">
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-4">
                {dataLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button asChild className="rounded-full">
                      <Link to="/products">Start Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  orders.map((order) => {
                    const config = statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    const items = orderItems[order.id] || [];

                    return (
                      <div key={order.id} className="bg-card rounded-2xl border border-border p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-heading font-bold text-sm">{order.order_number}</span>
                            <Badge variant="secondary" className={`rounded-full text-xs ${config.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                          <span className="font-heading font-bold">${order.total_amount.toFixed(2)}</span>
                        </div>

                        {items.length > 0 && (
                          <div className="text-sm text-muted-foreground mb-3">
                            {items.map((item) => (
                              <span key={item.id} className="mr-3">
                                {item.product_name} × {item.quantity}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(order.order_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                          {order.status === "delivered" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full gap-1 text-xs"
                              onClick={() => openReviewDialog(order)}
                            >
                              <Star className="w-3 h-3" />
                              Write Review
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
                {dataLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews yet. Order and review products!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-card rounded-2xl border border-border p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${s < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                            />
                          ))}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`rounded-full text-xs ${
                            review.is_approved
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {review.is_approved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.review_text}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg">{profile?.full_name || "User"}</h3>
                      <p className="text-sm text-muted-foreground">{profile?.email || user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                      <p className="font-heading font-bold text-lg">{orders.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Reviews</p>
                      <p className="font-heading font-bold text-lg">{reviews.length}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />

      {selectedOrder && (
        <WriteReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          order={selectedOrder}
          orderItems={orderItems[selectedOrder.id] || []}
          onReviewSubmitted={fetchData}
        />
      )}
    </div>
  );
};

export default Account;
