import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import bannerImage from "@/assets/quality-banner.jpg";

const QualityBanner = () => {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden"
        >
          <img
            src={bannerImage}
            alt="Premium furniture interior"
            className="w-full h-[320px] md:h-[420px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />

          {/* Book an Appointment - top right with curved background */}
          <div className="absolute top-0 right-0">
            <div className="bg-background rounded-bl-2xl pl-3 pb-3">
              <Button asChild variant="outline" className="rounded-full bg-card/80 text-foreground border-border/50 backdrop-blur-md hover:bg-card/90 shadow-sm gap-2">
                <Link to="/contact">
                  Book an appointment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
            <h2 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight max-w-lg mb-6">
              When We Create Furniture, We Strive For The Finest Quality.
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-full bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 backdrop-blur-sm hover:bg-primary-foreground/20">
                <Link to="/products">See Products</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QualityBanner;
