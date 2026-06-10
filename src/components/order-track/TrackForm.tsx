import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TrackFormProps {
  loading: boolean;
  onTrack: (orderId: string) => void;
}

const TrackForm = ({ loading, onTrack }: TrackFormProps) => {
  const [orderId, setOrderId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    onTrack(orderId);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onSubmit={handleSubmit}
      className="flex gap-3 mb-10"
    >
      <div className="relative flex-1">
        <Label htmlFor="order-id-input" className="sr-only">
          Order ID
        </Label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="order-id-input"
          placeholder="Enter Order ID (e.g. ORD-ABC123)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="pl-10 rounded-full bg-card border-border"
        />
      </div>
      <Button type="submit" className="rounded-full px-6" disabled={loading}>
        {loading ? "Tracking..." : "Track"}
      </Button>
    </motion.form>
  );
};

export default TrackForm;
