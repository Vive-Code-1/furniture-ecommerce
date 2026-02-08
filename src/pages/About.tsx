import { motion } from "framer-motion";
import { Award, Leaf, Heart, Users, Pencil, Hammer, Truck, ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import workshopImage from "@/assets/quality-banner.jpg";
import avatar1 from "@/assets/avatars/avatar-1.jpg";
import avatar2 from "@/assets/avatars/avatar-2.jpg";
import avatar3 from "@/assets/avatars/avatar-3.jpg";

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

const milestones = [
  { year: "2015", title: "Founded", description: "Started as a small workshop with a vision for sustainable furniture." },
  { year: "2018", title: "50+ Artisans", description: "Expanded our team of skilled craftspeople from around the world." },
  { year: "2020", title: "International", description: "Began shipping to over 30 countries across 4 continents." },
  { year: "2023", title: "18K+ Customers", description: "Reached a milestone of 18,000 happy customers worldwide." },
];

const team = [
  { name: "Sarah Mitchell", role: "Founder & CEO", image: avatar1, bio: "Visionary leader with 15+ years in sustainable design." },
  { name: "James Cooper", role: "Head of Design", image: avatar2, bio: "Award-winning designer passionate about modern aesthetics." },
  { name: "Emily Chen", role: "Lead Artisan", image: avatar3, bio: "Master craftsperson with expertise in fine woodworking." },
];

const process = [
  { icon: Pencil, step: "01", title: "Design", description: "Our designers create unique concepts blending modern style with timeless elegance." },
  { icon: Hammer, step: "02", title: "Craft", description: "Skilled artisans handcraft each piece using sustainably sourced premium materials." },
  { icon: Truck, step: "03", title: "Deliver", description: "We carefully package and deliver your furniture right to your doorstep." },
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

          {/* Story Section with Workshop Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20"
          >
            <div className="rounded-2xl overflow-hidden">
              <img
                src={workshopImage}
                alt="Our furniture workshop interior"
                className="w-full h-[300px] md:h-[400px] object-cover"
              />
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

          {/* Our Journey Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {milestones.map((milestone, i) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative bg-card rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
                >
                  <span className="font-heading text-3xl md:text-4xl font-bold text-primary/20">{milestone.year}</span>
                  <h3 className="font-heading font-semibold mt-2 mb-1">{milestone.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{milestone.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Our Process */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-4">Our Process</h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
              From concept to your home, every step is handled with care and precision.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {process.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-card rounded-2xl border border-border p-8 text-center hover:shadow-md transition-shadow group"
                >
                  <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-5 group-hover:bg-foreground/10 transition-colors">
                    <item.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/50 tracking-widest uppercase">Step {item.step}</span>
                  <h3 className="font-heading text-xl font-semibold mt-2 mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
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

          {/* Meet the Team */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-4">Meet the Team</h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
              The passionate people behind every piece of Modulive furniture.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-card rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-border"
                  />
                  <h3 className="font-heading font-semibold">{member.name}</h3>
                  <p className="text-xs text-primary/60 font-medium mt-1 mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl md:rounded-3xl overflow-hidden"
          >
            <img
              src={workshopImage}
              alt="Premium furniture showcase"
              className="w-full h-[260px] md:h-[340px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/50 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-14">
              <h2 className="font-heading text-2xl md:text-4xl font-bold text-primary-foreground leading-tight max-w-md mb-4">
                Ready to Transform Your Space?
              </h2>
              <p className="text-primary-foreground/80 max-w-md mb-6 text-sm md:text-base">
                Explore our collection or book a free consultation with our design experts.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full gap-2 px-6">
                  <Link to="/products">
                    Browse Collection
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30 backdrop-blur-sm hover:bg-primary-foreground/20 gap-2">
                  <Link to="/contact">
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
