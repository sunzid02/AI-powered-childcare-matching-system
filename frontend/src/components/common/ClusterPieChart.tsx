import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ClusterDistributionItem } from "../../types/analytics";

type Props = {
  data: ClusterDistributionItem[];
};

const COLORS = ["#275efe", "#00a6ed", "#7b61ff", "#36b37e", "#ff8b00", "#ff5630"];

export default function ClusterPieChart({ data }: Props) {
  const chartData = data.map((item) => ({
    name: item.cluster_label,
    value: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={95}
          label
        >
          {chartData.map((entry, index) => (
            <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}