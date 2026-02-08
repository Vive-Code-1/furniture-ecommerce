import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import videoThumb from "@/assets/why-choose-video.jpg";

const features = [
  {
    title: "Sustainability",
    content:
      "We are committed to sustainable practices in every aspect of our production. From ethically sourced materials to eco-friendly manufacturing processes.",
  },
  {
    title: "Unrivaled quality",
    content:
      "Lorem ipsum dolor sit amet, consectetur. This helps us provide durable furniture that lasts for years without compromise.",
  },
  {
    title: "Unmatched variety",
    content:
      "Our extensive collection offers styles for every taste — from minimalist Scandinavian to bold contemporary designs.",
  },
  {
    title: "Legacy of excellence",
    content:
      "With decades of experience, we have built a legacy of craftsmanship and customer satisfaction that stands the test of time.",
  },
];

const WhyChooseUs = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
          {/* Video Thumbnail */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => setVideoOpen(true)}
            >
              <img
                src={videoThumb}
                alt="Watch the video and learn more about Modulive"
                className="w-full h-[280px] md:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-foreground/20" />
              {/* Play button at bottom-right with curved background */}
              <div className="absolute bottom-0 right-0">
                <div className="bg-background rounded-tl-2xl pl-3 pt-3">
                  <div className="w-12 h-12 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 ml-0.5 text-foreground" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="font-heading text-2xl md:text-4xl font-bold mb-8">Why Choose Us</h2>
            <Accordion type="single" collapsible defaultValue="item-0">
              {features.map((feature, i) => (
                <AccordionItem key={feature.title} value={`item-${i}`} className="border-border">
                  <AccordionTrigger className="font-heading text-base md:text-lg font-semibold hover:no-underline">
                    {feature.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-body">
                    {feature.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>

      {/* YouTube Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-foreground border-none">
          <DialogTitle className="sr-only">Furniture Video</DialogTitle>
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Furniture Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-none"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default WhyChooseUs;
