import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

const StatsBar = () => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const customers = useCountUp(18, 2000, inView);
  const productsCount = useCountUp(700, 2000, inView);
  const satisfaction = useCountUp(95, 2000, inView);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8" ref={sectionRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="font-heading text-3xl md:text-5xl font-bold mb-2">
              {customers}K+
            </p>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
              Happy and loyal customers that use our products
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="font-heading text-3xl md:text-5xl font-bold mb-2">
              {productsCount}+
            </p>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
              Products that we have created and sell on the market
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="font-heading text-3xl md:text-5xl font-bold mb-2">
              {satisfaction}%
            </p>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
              Customers who have purchased and have came back
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
