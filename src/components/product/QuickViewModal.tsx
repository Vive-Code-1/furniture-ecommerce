import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Heart, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import type { DbProduct } from "@/hooks/useProducts";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  rating: number;
  review_text: string;
}

interface QuickViewModalProps {
  product: DbProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    if (product && open) {
      fetchReviews(product.id);
    }
  }, [product, open]);

  const fetchReviews = async (productId: string) => {
    const { data } = await supabase
      .from("reviews")
      .select("id, reviewer_name, reviewer_avatar, rating, review_text")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setReviews(data);
  };

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
    setQuantity(1);
    onOpenChange(false);
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{product.name} Quick View</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="bg-secondary p-8 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-h-[400px] object-contain"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 md:p-8 flex flex-col gap-4">
            <div>
              <h2 className="font-heading text-xl md:text-2xl font-bold">{product.name}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {reviews.length > 0
                    ? `${avgRating.toFixed(1)} Rating (${reviews.length} review${reviews.length !== 1 ? "s" : ""})`
                    : "No reviews yet"}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Premium quality furniture for modern living spaces."}
            </p>

            {/* Price & Quantity */}
            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Price</p>
                <p className="font-heading text-2xl font-bold">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-foreground text-primary-foreground flex items-center justify-center hover:bg-foreground/80 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full bg-foreground text-primary-foreground flex items-center justify-center hover:bg-foreground/80 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-2">
              <Button onClick={handleAddToCart} className="rounded-full flex-1">
                ADD TO CART
              </Button>
              <Button variant="outline" className="rounded-full gap-2">
                <Heart className="w-4 h-4" />
                Add To Wishlist
              </Button>
            </div>

            {/* Meta */}
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="font-semibold">SKU:</span> <span className="text-muted-foreground">PRT{product.id}84E63A</span></p>
              <p><span className="font-semibold">Category:</span> <span className="text-muted-foreground">{product.category}</span></p>
              {product.materials && (
                <p><span className="font-semibold">Materials:</span> <span className="text-muted-foreground">{product.materials}</span></p>
              )}
              {product.dimensions && (
                <p><span className="font-semibold">Dimensions:</span> <span className="text-muted-foreground">{product.dimensions}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="border-t border-border p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold mb-4">Customer Reviews ({reviews.length})</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-3">
                  {review.reviewer_avatar ? (
                    <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{review.reviewer_name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.reviewer_name}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} className={`w-3 h-3 ${s < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.review_text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
