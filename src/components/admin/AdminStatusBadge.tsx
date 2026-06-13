import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  returned: "bg-orange-100 text-orange-700",
  canceled: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

interface Props {
  status: string;
  className?: string;
}

const AdminStatusBadge = ({ status, className = "" }: Props) => {
  const cls = STATUS_COLORS[status?.toLowerCase()] || "bg-muted text-foreground";
  return (
    <Badge className={`rounded-full font-medium border-0 ${cls} ${className}`}>
      {status}
    </Badge>
  );
};

export default AdminStatusBadge;
