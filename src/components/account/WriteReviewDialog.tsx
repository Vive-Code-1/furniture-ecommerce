import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: { id: string; order_number: string };
  orderItems: OrderItem[];
  onReviewSubmitted: () => void;
}

const WriteReviewDialog = ({
  open,
  onOpenChange,
  order,
  orderItems,
  onReviewSubmitted,
}: WriteReviewDialogProps) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      toast({ title: "Error", description: "Please write your review.", variant: "destructive" });
      return;
    }
    if (!selectedItemId) {
      toast({ title: "Error", description: "Please select a product.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setSaving(true);
    const selectedItem = orderItems.find((i) => i.id === selectedItemId);

    // If the item doesn't have a product_id, try to look it up by name
    let productId = selectedItem?.product_id || null;
    if (!productId && selectedItem) {
      const { data: matchedProduct } = await supabase
        .from("products")
        .select("id")
        .eq("name", selectedItem.product_name)
        .maybeSingle();
      productId = matchedProduct?.id || null;
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      product_id: productId,
      order_id: order.id,
      reviewer_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer",
      rating,
      review_text: reviewText.trim(),
      is_featured: false,
      is_approved: false,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Review Submitted!",
        description: "Your review will appear after admin approval.",
      });
      setRating(5);
      setReviewText("");
      setSelectedItemId("");
      onOpenChange(false);
      onReviewSubmitted();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review — {order.order_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {orderItems.length > 0 ? (
            <div className="space-y-2">
              <Label>Select Product</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {orderItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No products available for review.</p>
          )}

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= rating ? "fill-amber-400 text-amber-400" : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your Review</Label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
              className="rounded-xl"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saving || !selectedItemId}
            className="w-full rounded-full"
          >
            {saving ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewDialog;
