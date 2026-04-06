import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ZoneDemandSupplyItem } from "../../types/analytics";

type Props = {
  data: ZoneDemandSupplyItem[];
};

export default function DemandSupplyChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="zone" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="demand_count" name="Demand" radius={[6, 6, 0, 0]} />
        <Bar dataKey="supply_count" name="Supply" radius={[6, 6, 0, 0]} />
        <Bar dataKey="shortage" name="Shortage" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}