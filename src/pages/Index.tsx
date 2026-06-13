import { lazy, Suspense } from "react";
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
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <ProductGrid />
        <Suspense fallback={<SectionPlaceholder minHeight={420} />}>
          <WhyChooseUs />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder minHeight={420} />}>
          <ReviewsSection />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder minHeight={480} />}>
          <QualityBanner />
        </Suspense>
        <Suspense fallback={<SectionPlaceholder minHeight={320} />}>
          <Newsletter />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
