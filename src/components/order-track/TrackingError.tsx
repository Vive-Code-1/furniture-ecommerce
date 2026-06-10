import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface TrackingErrorProps {
  message: string;
}

const TrackingError = ({ message }: TrackingErrorProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    role="alert"
    className="bg-card rounded-2xl border border-border p-6 flex items-start gap-3"
  >
    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
    <p className="text-sm">{message}</p>
  </motion.div>
);

export default TrackingError;
