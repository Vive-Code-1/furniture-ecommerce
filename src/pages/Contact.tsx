import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const contactInfo = [
  { icon: MapPin, label: "Address", value: "12-B Street Lorem, Ipsum, NY 10001" },
  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
  { icon: Mail, label: "Email", value: "studio@modulive.com" },
  { icon: Clock, label: "Hours", value: "Mon-Fri: 9AM - 6PM" },
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("contact_leads").insert({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });

    if (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }
    setLoading(false);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground">
              Have a question or want to book an appointment? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {contactInfo.map((item) => (
                <div key={item.label} className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="rounded-xl bg-secondary border-border"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="rounded-xl bg-secondary border-border"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Phone</label>
                    <Input
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="rounded-xl bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Subject</label>
                    <Input
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                      className="rounded-xl bg-secondary border-border"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="rounded-xl bg-secondary border-border min-h-[140px]"
                    required
                  />
                </div>
                <Button type="submit" className="rounded-full px-8" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
