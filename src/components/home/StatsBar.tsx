import { useState, useEffect, useRef } from "react";
import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  { value: 18, suffix: "K+", label: "Happy and loyal customers that use our products" },
  { value: 700, suffix: "+", label: "Products that we have created and sell on the market" },
  { value: 95, suffix: "%", label: "Customers who have purchased and have came back" },
];

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

  const customers = useCountUp(stats[0].value, 2000, inView);
  const productsCount = useCountUp(stats[1].value, 2000, inView);
  const satisfaction = useCountUp(stats[2].value, 2000, inView);
  const values = [customers, productsCount, satisfaction];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8" ref={sectionRef}>
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`bg-card rounded-2xl border border-border p-8 text-center shadow-sm hover:shadow-md transition-shadow lv-reveal ${inView ? "is-visible" : ""}`}
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <p className="font-heading text-3xl md:text-5xl font-bold mb-2">
                {values[i]}{s.suffix}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
