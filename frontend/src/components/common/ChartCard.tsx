import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function ChartCard({ title, subtitle, children }: Props) {
  return (
    <div className="card" style={{ display: "grid", gap: 14 }}>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle ? (
          <p style={{ color: "#5d7288", marginTop: 6 }}>{subtitle}</p>
        ) : null}
      </div>

      <div style={{ width: "100%", height: 320 }}>{children}</div>
    </div>
  );
}