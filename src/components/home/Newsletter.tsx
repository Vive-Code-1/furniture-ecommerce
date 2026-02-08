import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({
      title: "Subscribed!",
      description: "Thank you for subscribing. Your 30% OFF code will arrive shortly.",
    });
    setEmail("");
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg mx-auto"
        >
          <h2 className="font-heading text-xl md:text-3xl font-semibold mb-2">
            Subscribe to our newsletter and
          </h2>
          <p className="font-heading text-2xl md:text-4xl font-bold mb-8">
            grab 30% OFF
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Your E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-full bg-card border-border"
                required
              />
            </div>
            <Button type="submit" className="rounded-full px-6">
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
