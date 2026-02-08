import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import QuickViewModal from "@/components/product/QuickViewModal";
import type { DbProduct } from "@/hooks/useProducts";
import heroSofa from "@/assets/hero-sofa.png";
import muffinChair from "@/assets/products/muffin-chair.png";
import ellaChair from "@/assets/products/ella-chair.png";
import avatar1 from "@/assets/avatars/avatar-1.jpg";
import avatar2 from "@/assets/avatars/avatar-2.jpg";
import avatar3 from "@/assets/avatars/avatar-3.jpg";

const heroProductDetails: DbProduct[] = [
  {
    id: "hero-1",
    name: "Muffin Chair",
    price: 119,
    image: muffinChair,
    category: "Chair",
    description: "A cozy, round-back accent chair with soft upholstery and solid wood legs. Perfect for reading corners and living rooms.",
    dimensions: "70 x 72 x 80 cm",
    materials: "Premium fabric, solid oak legs",
    thumbnail_url: null,
    stock_quantity: 0,
    is_active: true,
  },
  {
    id: "hero-2",
    name: "Ella Chair",
    price: 161,
    image: ellaChair,
    category: "Chair",
    description: "An elegant mid-century dining chair with gently curved wooden frame and woven seat. Timeless design for any space.",
    dimensions: "55 x 58 x 82 cm",
    materials: "Wool blend fabric, oak legs",
    thumbnail_url: null,
    stock_quantity: 0,
    is_active: true,
  },
];

const HeroSection = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<DbProduct | null>(null);

  return (
    <section className="relative pt-24 pb-8 md:pt-32 md:pb-16 overflow-hidden">
      <div className="container mx-auto">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Transform Your Space with
            <br />
            Sustainable Furniture
          </h1>
        </motion.div>

        {/* Hero Image + Floating Cards */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 items-stretch"
          >
            {/* Main Sofa Image */}
            <div className="relative w-full md:w-2/3 rounded-2xl overflow-hidden bg-secondary min-h-[280px] md:min-h-[420px]">
              <img
                src={heroSofa}
                alt="Premium sustainable sofa"
                className="w-full h-full object-cover absolute inset-0"
                loading="eager"
              />

              {/* Check Reviews - corner cutout */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute top-0 left-0"
              >
                <div className="bg-background rounded-br-2xl pr-3 pb-3">
                  <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <div className="flex -space-x-2">
                      <img src={avatar1} alt="Customer" className="w-7 h-7 rounded-full border-2 border-card object-cover" />
                      <img src={avatar2} alt="Customer" className="w-7 h-7 rounded-full border-2 border-card object-cover" />
                      <img src={avatar3} alt="Customer" className="w-7 h-7 rounded-full border-2 border-card object-cover" />
                    </div>
                    <span className="text-xs font-medium">Check reviews</span>
                  </div>
                </div>
              </motion.div>

              {/* Shop Now CTA - corner cutout */}
              <div className="absolute bottom-0 right-0">
                <div className="bg-background rounded-tl-2xl pl-3 pt-3">
                  <Button asChild className="rounded-full gap-2 px-6" size="lg">
                    <Link to="/products">
                      Shop Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Product Cards */}
            <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-3">
              {heroProductDetails.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.2 }}
                  whileHover={{ y: -4 }}
                  className="flex-1 cursor-pointer"
                  onClick={() => setQuickViewProduct(product)}
                >
                  <div className="bg-card rounded-xl p-3 shadow-sm border border-border h-full hover:shadow-md transition-shadow flex flex-col">
                    <div className="h-[140px] md:h-[180px] overflow-hidden rounded-lg bg-secondary/30 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-heading text-xs font-semibold">{product.name}</span>
                      <span className="text-sm font-bold">${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </section>
  );
};

export default HeroSection;
