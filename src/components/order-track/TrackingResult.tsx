import { motion } from "framer-motion";
import type { OrderResult } from "@/lib/orderTracking";
import StatusBadge from "./StatusBadge";
import OrderTimeline from "./OrderTimeline";

interface TrackingResultProps {
  result: OrderResult;
}

const TrackingResult = ({ result }: TrackingResultProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    role="status"
    aria-live="polite"
    className="bg-card rounded-2xl border border-border p-6 md:p-8"
  >
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <p className="text-sm text-muted-foreground">Order ID</p>
        <p className="font-heading font-bold text-lg">{result.orderNumber}</p>
      </div>
      <StatusBadge status={result.status} />
    </div>
    <OrderTimeline steps={result.steps} />
  </motion.div>
);

export default TrackingResult;
