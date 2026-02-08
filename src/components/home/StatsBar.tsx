import { motion } from "framer-motion";

const stats = [
  { value: "18K+", label: "Happy and loyal customers that use our products" },
  { value: "700+", label: "Products that we have created and sell on the market" },
  { value: "95%", label: "Customers who have purchased and have came back" },
];

const StatsBar = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <p className="font-heading text-3xl md:text-5xl font-bold mb-2">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
