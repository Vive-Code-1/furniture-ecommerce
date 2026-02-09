import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const invoiceId = searchParams.get("invoice_id");
    if (!invoiceId) {
      setStatus("failed");
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("uddoktapay-verify", {
          body: { invoice_id: invoiceId },
        });

        if (error) throw error;

        if (data.status === "COMPLETED") {
          setStatus("success");
          setPaymentData(data);
        } else {
          setStatus("failed");
          setPaymentData(data);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-lg text-center">
          {status === "loading" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <h1 className="font-heading text-2xl font-bold">Verifying Payment...</h1>
              <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h1 className="font-heading text-3xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Your payment of ${paymentData?.amount} has been confirmed.
              </p>
              {paymentData?.order_number && (
                <div className="bg-card rounded-2xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-heading text-lg font-bold">{paymentData.order_number}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="rounded-full"
                  onClick={() =>
                    navigate(user ? "/account" : "/track-order", {
                      state: { orderNumber: paymentData?.order_number },
                    })
                  }
                >
                  {user ? "View My Orders" : "Track Order"}
                </Button>
                <Button variant="outline" className="rounded-full" asChild>
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <XCircle className="w-16 h-16 text-destructive mx-auto" />
              <h1 className="font-heading text-3xl font-bold">Payment Failed</h1>
              <p className="text-muted-foreground">
                Your payment could not be verified. Please try again or contact support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="rounded-full" asChild>
                  <Link to="/checkout">Try Again</Link>
                </Button>
                <Button variant="outline" className="rounded-full" asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
