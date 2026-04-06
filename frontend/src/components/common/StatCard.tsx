type Props = {
  label: string;
  value: string | number;
};

export default function StatCard({ label, value }: Props) {
  return (
    <div className="card">
      <div className="kpi-label">{label}</div>
      <div className="kpi">{value}</div>
    </div>
  );
}