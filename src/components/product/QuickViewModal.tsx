import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Heart, X, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border">
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
                      className={`w-4 h-4 ${star <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">4.7 Rating (5 customer reviews)</span>
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
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
