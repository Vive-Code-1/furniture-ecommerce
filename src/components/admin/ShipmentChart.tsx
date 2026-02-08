import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface ShipmentData {
  delivered: number;
  onDelivery: number;
  returned: number;
  canceled: number;
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

const ShipmentChart = ({ data }: { data: ShipmentData }) => {
  const chartData = [
    { name: "Delivered", value: data.delivered },
    { name: "On Delivery", value: data.onDelivery },
    { name: "Returned", value: data.returned },
    { name: "Canceled", value: data.canceled },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="font-heading font-semibold text-lg mb-2">Shipment Status</h3>
      <p className="text-sm text-muted-foreground mb-4">Overview of all shipments</p>

      <div className="h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-heading font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {chartData.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-xs text-muted-foreground">{item.name}</span>
            <span className="text-xs font-semibold ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipmentChart;
