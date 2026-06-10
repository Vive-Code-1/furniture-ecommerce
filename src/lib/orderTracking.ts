import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type StepKey =
  | "pending"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

export type OrderStatus = StepKey | "cancelled";

export const STEP_ORDER: StepKey[] = [
  "pending",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

interface StepMeta {
  label: string;
  description: string;
  icon: LucideIcon;
}

export const STEP_META: Record<StepKey, StepMeta> = {
  pending: {
    label: "Order Placed",
    description: "We've received your order",
    icon: Package,
  },
  processing: {
    label: "Confirmed",
    description: "Order confirmed and being prepared",
    icon: CheckCircle2,
  },
  shipped: {
    label: "Shipped",
    description: "Package picked up by courier",
    icon: Truck,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    description: "Your package is on its way",
    icon: MapPin,
  },
  delivered: {
    label: "Delivered",
    description: "Package delivered successfully",
    icon: CheckCircle2,
  },
};

export interface BadgeMeta {
  label: string;
  icon: LucideIcon;
  className: string;
}

export const STATUS_BADGE: Record<OrderStatus, BadgeMeta> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className:
      "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  },
  processing: {
    label: "Processing",
    icon: CheckCircle2,
    className:
      "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    className:
      "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: MapPin,
    className:
      "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    className:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
  },
};

export const FALLBACK_BADGE: BadgeMeta = {
  label: "Unknown",
  icon: Clock,
  className: "bg-secondary text-foreground",
};

export interface TimelineStep {
  key: StepKey;
  label: string;
  description: string;
  icon: LucideIcon;
  completed: boolean;
  date?: string;
  time?: string;
}

export interface OrderResult {
  orderNumber: string;
  status: string;
  steps: TimelineStep[];
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

export const getBadge = (status: string): BadgeMeta =>
  (STATUS_BADGE as Record<string, BadgeMeta>)[status] ?? FALLBACK_BADGE;

export interface HistoryRow {
  status: string;
  changed_at: string;
}

export const buildTimeline = (
  history: HistoryRow[],
  createdAt: string | null,
): TimelineStep[] => {
  const firstSeen = new Map<string, string>();
  history.forEach((h) => {
    if (!firstSeen.has(h.status)) firstSeen.set(h.status, h.changed_at);
  });
  if (!firstSeen.has("pending") && createdAt) {
    firstSeen.set("pending", createdAt);
  }

  return STEP_ORDER.map((key) => {
    const ts = firstSeen.get(key);
    const meta = STEP_META[key];
    return {
      key,
      label: meta.label,
      description: meta.description,
      icon: meta.icon,
      completed: Boolean(ts),
      date: ts ? formatDate(ts) : undefined,
      time: ts ? formatTime(ts) : undefined,
    };
  });
};
