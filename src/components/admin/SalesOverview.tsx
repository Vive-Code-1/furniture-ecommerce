import { Progress } from "@/components/ui/progress";

const categories = [
  { name: "Chair", percentage: 81.2, color: "bg-emerald-500" },
  { name: "Sofa", percentage: 70.2, color: "bg-blue-500" },
  { name: "Table", percentage: 55.8, color: "bg-violet-500" },
  { name: "Cabinet", percentage: 42.3, color: "bg-amber-500" },
  { name: "Bench", percentage: 35.1, color: "bg-red-500" },
];

const SalesOverview = () => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="font-heading font-semibold text-lg mb-2">Sales Overview</h3>
      <p className="text-sm text-muted-foreground mb-6">Category wise performance</p>

      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{cat.name}</span>
              <span className="text-muted-foreground">{cat.percentage}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${cat.color}`}
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesOverview;
