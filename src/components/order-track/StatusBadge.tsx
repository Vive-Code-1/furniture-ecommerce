import { getBadge } from "@/lib/orderTracking";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const badge = getBadge(status);
  const Icon = badge.icon;
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {badge.label}
    </div>
  );
};

export default StatusBadge;
