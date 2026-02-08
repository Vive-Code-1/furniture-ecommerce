import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, SlidersHorizontal, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import type { DbProduct } from "@/hooks/useProducts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QuickViewModal from "@/components/product/QuickViewModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SortOption = "default" | "price-low" | "price-high" | "name";

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [quickViewProduct, setQuickViewProduct] = useState<DbProduct | null>(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const { products, categories, loading } = useProducts();

  const filteredProducts = (() => {
    let result =
      activeCategory === "All"
        ? [...products]
        : products.filter((p) => p.category === activeCategory);

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  })();

  const CategorySidebar = () => (
    <div className="space-y-2">
      <h3 className="font-heading text-lg font-bold mb-4">Categories</h3>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => {
            setActiveCategory(cat);
            setShowMobileFilter(false);
          }}
          className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeCategory === cat
              ? "bg-foreground text-primary-foreground"
              : "text-foreground hover:bg-accent"
          }`}
        >
          {cat}
        </button>
      ))}

      <div className="pt-6">
        <h3 className="font-heading text-lg font-bold mb-4">Sort By</h3>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="rounded-xl bg-card border-border">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name: A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-2">Our Products</h1>
            <p className="text-muted-foreground">
              Discover our collection of {filteredProducts.length} premium furniture pieces
            </p>
          </motion.div>

          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => setShowMobileFilter(!showMobileFilter)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showMobileFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden bg-card rounded-2xl border border-border p-4 mb-6 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="font-heading font-semibold">Filters</span>
                  <button onClick={() => setShowMobileFilter(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <CategorySidebar />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-60 shrink-0">
              <div className="sticky top-28 bg-card rounded-2xl border border-border p-6">
                <CategorySidebar />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
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
                            className="w-full h-52 md:h-72 object-contain p-4 group-hover:scale-105 transition-transform duration-500"
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
          </div>
        </div>
      </main>
      <Footer />

      <QuickViewModal
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => !open && setQuickViewProduct(null)}
      />
    </div>
  );
};

export default Products;
