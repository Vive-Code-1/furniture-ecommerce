import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import ProductGrid from "@/components/home/ProductGrid";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import QualityBanner from "@/components/home/QualityBanner";
import Newsletter from "@/components/home/Newsletter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <ProductGrid />
        <WhyChooseUs />
        <QualityBanner />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
