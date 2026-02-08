import { motion } from "framer-motion";
import { Award, Leaf, Heart, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const values = [
  {
    icon: Leaf,
    title: "Sustainability",
    description: "We use ethically sourced materials and eco-friendly manufacturing to minimize our environmental footprint.",
  },
  {
    icon: Award,
    title: "Quality Craftsmanship",
    description: "Every piece is handcrafted by skilled artisans who take pride in creating furniture that lasts for generations.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Your satisfaction drives everything we do. From design to delivery, we ensure a seamless experience.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We support local communities and craftspeople, ensuring fair wages and working conditions for all.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-6">About Modulive</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Founded with a passion for sustainable living, Modulive creates premium furniture that transforms spaces
              while respecting the planet. Our designs blend modern aesthetics with timeless craftsmanship.
            </p>
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20"
          >
            <div className="bg-secondary rounded-2xl h-[300px] md:h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground font-heading text-lg">Our Workshop</p>
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                What started as a small workshop in 2015 has grown into one of the most trusted furniture brands.
                Our founder envisioned a world where beautiful furniture doesn't come at the expense of the environment.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Today, we work with over 50 skilled artisans and sustainable suppliers worldwide. Every piece in our
                collection tells a story of dedication, creativity, and responsibility.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With 18,000+ happy customers and 700+ unique products, we continue to push the boundaries
                of sustainable furniture design.
              </p>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
