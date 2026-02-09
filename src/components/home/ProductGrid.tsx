import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import type { DbProduct } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import QuickViewModal from "@/components/product/QuickViewModal";

const ProductGrid = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const { addItem } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<DbProduct | null>(null);
  const { products, categories, loading } = useProducts();

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-2xl md:text-4xl font-bold text-center mb-8"
        >
          Our Best Quality Products
        </motion.h2>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-foreground text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <div className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow duration-300">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-52 md:h-72 object-cover rounded-xl p-1 group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 md:p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-sm md:text-base font-semibold">{product.name}</h3>
                      <p className="text-sm md:text-base font-bold mt-0.5">${product.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="relative w-9 h-9 md:w-10 md:h-10 bg-foreground text-primary-foreground rounded-full flex items-center justify-center hover:bg-foreground/80 transition-colors"
                      aria-label={`Quick view ${product.name}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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

export default ProductGrid;
