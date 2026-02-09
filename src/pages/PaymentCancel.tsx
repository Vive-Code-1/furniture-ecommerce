import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-lg text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <XCircle className="w-16 h-16 text-muted-foreground mx-auto" />
            <h1 className="font-heading text-3xl font-bold">Payment Cancelled</h1>
            <p className="text-muted-foreground">
              Your payment was cancelled. Your order is still pending — you can try again or choose a different payment method.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="rounded-full" asChild>
                <Link to="/checkout">Back to Checkout</Link>
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCancel;
