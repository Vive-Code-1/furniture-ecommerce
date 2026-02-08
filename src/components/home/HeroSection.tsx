import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroSofa from "@/assets/hero-sofa.png";
import muffinChair from "@/assets/products/muffin-chair.png";
import ellaChair from "@/assets/products/ella-chair.png";

const HeroSection = () => {
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
            className="flex flex-col md:flex-row gap-4 items-center md:items-end"
          >
            {/* Main Sofa Image */}
            <div className="relative w-full md:w-2/3 rounded-2xl overflow-hidden bg-secondary">
              <img
                src={heroSofa}
                alt="Premium sustainable sofa"
                className="w-full h-[280px] md:h-[420px] object-cover"
                loading="eager"
              />

              {/* Check Reviews */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-card" />
                  <div className="w-6 h-6 rounded-full bg-accent border-2 border-card" />
                  <div className="w-6 h-6 rounded-full bg-secondary border-2 border-card" />
                </div>
                <span className="text-xs font-medium">Check reviews</span>
              </div>

              {/* Shop Now CTA */}
              <div className="absolute bottom-4 right-4">
                <Button asChild className="rounded-full gap-2 px-6" size="lg">
                  <Link to="/products">
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Floating Product Cards */}
            <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex-1 bg-card rounded-xl p-3 shadow-sm border border-border"
              >
                <img
                  src={muffinChair}
                  alt="Muffin Chair"
                  className="w-full h-28 md:h-32 object-cover rounded-lg mb-2"
                />
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-semibold">Muffin Chair</span>
                  <span className="text-sm font-bold">$119.00</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex-1 bg-card rounded-xl p-3 shadow-sm border border-border"
              >
                <img
                  src={ellaChair}
                  alt="Ella Chair"
                  className="w-full h-28 md:h-32 object-cover rounded-lg mb-2"
                />
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-semibold">Ella Chair</span>
                  <span className="text-sm font-bold">$161.00</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
