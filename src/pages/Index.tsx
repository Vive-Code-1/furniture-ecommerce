import { lazy, Suspense } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import ProductGrid from "@/components/home/ProductGrid";

// Below-the-fold sections — defer to keep initial JS small and FCP fast.
const WhyChooseUs = lazy(() => import("@/components/home/WhyChooseUs"));
const ReviewsSection = lazy(() => import("@/components/home/ReviewsSection"));
const QualityBanner = lazy(() => import("@/components/home/QualityBanner"));
const Newsletter = lazy(() => import("@/components/home/Newsletter"));

// Reserve vertical space so lazy sections don't cause layout shift.
const SectionPlaceholder = ({ minHeight }: { minHeight: number }) => (
  <div style={{ minHeight }} aria-hidden />
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Modulive — Premium Sustainable Furniture for Modern Homes"
        description="Shop sustainable sofas, chairs, beds and cabinets handcrafted for modern living. Premium quality, ethically sourced materials, free shipping over $50."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Modulive",
          url: "https://furniture-ecommerce.lovable.app",
          image:
            "https://storage.googleapis.com/gpt-engineer-file-uploads/a7uxPWDUuQTJL38PxBQzg0idiRd2/social-images/social-1770596993181-Furniture_Ecommerce.png",
          priceRange: "$$",
          description:
            "Premium sustainable furniture: sofas, chairs, beds, cabinets and tables for modern homes.",
        }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <ScrollReveal><StatsBar /></ScrollReveal>
        <ScrollReveal><ProductGrid /></ScrollReveal>
        <Suspense fallback={<SectionPlaceholder minHeight={420} />}>
          <ScrollReveal><WhyChooseUs /></ScrollReveal>
        </Suspense>
        <Suspense fallback={<SectionPlaceholder minHeight={420} />}>
          <ScrollReveal><ReviewsSection /></ScrollReveal>
        </Suspense>
        <Suspense fallback={<SectionPlaceholder minHeight={480} />}>
          <ScrollReveal><QualityBanner /></ScrollReveal>
        </Suspense>
        <Suspense fallback={<SectionPlaceholder minHeight={320} />}>
          <ScrollReveal><Newsletter /></ScrollReveal>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
