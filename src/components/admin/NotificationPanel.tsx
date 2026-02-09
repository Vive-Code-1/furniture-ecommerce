import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ShoppingCart, Star, Mail, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface PendingOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
}

interface PendingReview {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
}

interface RecentSubscriber {
  id: string;
  email: string;
  created_at: string;
}

interface UnreadContact {
  id: string;
  name: string;
  subject: string;
}

const NotificationPanel = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<RecentSubscriber[]>([]);
  const [unreadContacts, setUnreadContacts] = useState<UnreadContact[]>([]);

  const [counts, setCounts] = useState({ orders: 0, reviews: 0, newsletter: 0, contacts: 0 });

  const fetchCounts = useCallback(async () => {
    const [ordersRes, reviewsRes, newsletterRes, contactsRes] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending").eq("is_trashed", false),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      supabase.from("contact_leads").select("id", { count: "exact", head: true }).eq("is_read", false),
    ]);

    const newCounts = {
      orders: ordersRes.count || 0,
      reviews: reviewsRes.count || 0,
      newsletter: newsletterRes.count || 0,
      contacts: contactsRes.count || 0,
    };
    setCounts(newCounts);
    setTotalCount(newCounts.orders + newCounts.reviews + newCounts.newsletter + newCounts.contacts);
  }, []);

  const fetchDetails = useCallback(async () => {
    const [ordersRes, reviewsRes, subscribersRes, contactsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, customer_name, total_amount")
        .eq("status", "pending")
        .eq("is_trashed", false)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("reviews")
        .select("id, reviewer_name, rating, review_text")
        .eq("is_approved", false)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("newsletter_subscribers")
        .select("id, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("contact_leads")
        .select("id, name, subject")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    setPendingOrders(ordersRes.data || []);
    setPendingReviews(reviewsRes.data || []);
    setRecentSubscribers(subscribersRes.data || []);
    setUnreadContacts(contactsRes.data || []);
  }, []);

  // Fetch counts on mount and every 30s
  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  // Fetch details when panel opens
  useEffect(() => {
    if (open) {
      fetchDetails();
    }
  }, [open, fetchDetails]);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleMarkAllRead = async () => {
    await supabase.from("contact_leads").update({ is_read: true }).eq("is_read", false);
    fetchCounts();
    fetchDetails();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`} />
    ));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {counts.contacts > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7 text-primary" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[420px]">
          {totalCount === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="divide-y">
              {/* Pending Orders */}
              {counts.orders > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Orders
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {counts.orders}
                      </Badge>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs h-auto p-0 text-primary"
                      onClick={() => handleNavigate("/admin/orders")}
                    >
                      View All →
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {pendingOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleNavigate("/admin/orders")}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium">{order.order_number}</span>
                          <span className="text-xs text-muted-foreground ml-2">{order.customer_name}</span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          ৳{Number(order.total_amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Reviews */}
              {counts.reviews > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Reviews
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {counts.reviews}
                      </Badge>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs h-auto p-0 text-primary"
                      onClick={() => handleNavigate("/admin/reviews")}
                    >
                      View All →
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {pendingReviews.map((review) => (
                      <div
                        key={review.id}
                        className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleNavigate("/admin/reviews")}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium">{review.reviewer_name}</span>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            "{review.review_text.slice(0, 50)}…"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter Subscribers */}
              {counts.newsletter > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Newsletter
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {counts.newsletter}
                      </Badge>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs h-auto p-0 text-primary"
                      onClick={() => handleNavigate("/admin/newsletter-leads")}
                    >
                      View All →
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {recentSubscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleNavigate("/admin/newsletter-leads")}
                      >
                        <span className="text-xs text-foreground truncate">{sub.email}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {format(new Date(sub.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unread Contacts */}
              {counts.contacts > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Contacts
                      </span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {counts.contacts}
                      </Badge>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-xs h-auto p-0 text-primary"
                      onClick={() => handleNavigate("/admin/contact-leads")}
                    >
                      View All →
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {unreadContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleNavigate("/admin/contact-leads")}
                      >
                        <span className="text-xs font-medium">{contact.name}</span>
                        <span className="text-xs text-muted-foreground truncate">"{contact.subject}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPanel;
