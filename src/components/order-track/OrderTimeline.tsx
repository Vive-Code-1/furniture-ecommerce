import type { TimelineStep } from "@/lib/orderTracking";
import TimelineStepItem from "./TimelineStepItem";

interface OrderTimelineProps {
  steps: TimelineStep[];
}

const OrderTimeline = ({ steps }: OrderTimelineProps) => (
  <div className="space-y-0">
    {steps.map((step, index) => (
      <TimelineStepItem
        key={step.key}
        step={step}
        isLast={index === steps.length - 1}
      />
    ))}
  </div>
);

export default OrderTimeline;
