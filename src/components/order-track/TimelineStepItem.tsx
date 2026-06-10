import type { TimelineStep } from "@/lib/orderTracking";

interface TimelineStepItemProps {
  step: TimelineStep;
  isLast: boolean;
}

const TimelineStepItem = ({ step, isLast }: TimelineStepItemProps) => {
  const Icon = step.icon;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            step.completed
              ? "bg-foreground text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && (
          <div
            className={`w-0.5 h-12 ${
              step.completed ? "bg-foreground" : "bg-border"
            }`}
          />
        )}
      </div>
      <div className={isLast ? "" : "pb-8"}>
        <p
          className={`font-heading font-semibold ${
            step.completed ? "" : "text-muted-foreground"
          }`}
        >
          {step.label}
        </p>
        <p className="text-sm text-muted-foreground">{step.description}</p>
        {step.completed && step.date && (
          <p className="text-xs text-muted-foreground mt-1">
            {step.date} at {step.time}
          </p>
        )}
      </div>
    </div>
  );
};

export default TimelineStepItem;
