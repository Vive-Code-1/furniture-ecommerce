import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TrackForm from "@/components/order-track/TrackForm";
import TrackingError from "@/components/order-track/TrackingError";
import TrackingResult from "@/components/order-track/TrackingResult";
import { useTrackOrder } from "@/hooks/useTrackOrder";

const OrderTrack = () => {
  const { loading, error, result, track } = useTrackOrder();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">
              Enter your order ID to see the latest status and delivery updates.
            </p>
          </motion.div>

          <TrackForm loading={loading} onTrack={track} />

          {error && <TrackingError message={error} />}
          {result && <TrackingResult result={result} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTrack;
