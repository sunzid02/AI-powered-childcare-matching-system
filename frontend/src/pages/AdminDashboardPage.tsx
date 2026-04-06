import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import StatCard from "../components/common/StatCard";
import ChartCard from "../components/common/ChartCard";
import DemandSupplyChart from "../components/common/DemandSupplyChart";
import ClusterPieChart from "../components/common/ClusterPieChart";
import ClusterBarChart from "../components/common/ClusterBarChart";
import { getAnalyticsOverview } from "../api/analyticsApi";
import type { AnalyticsOverview } from "../types/analytics";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAnalyticsOverview();
        setData(response);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalShortage = useMemo(() => {
    if (!data) return 0;
    return data.demand_supply.reduce((sum, item) => sum + item.shortage, 0);
  }, [data]);

  return (
    <PageContainer>
      <div style={{ display: "grid", gap: 24 }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Monitor request demand, provider capacity, cluster distribution, and shortage areas across the childcare system.
          </p>
        </div>

        {loading ? (
          <div className="card">
            <p>Loading admin analytics...</p>
          </div>
        ) : error ? (
          <div
            className="card"
            style={{
              borderColor: "#f0c7c7",
              background: "#fff6f6",
              color: "#9b2c2c",
            }}
          >
            {error}
          </div>
        ) : !data ? (
          <div className="card">
            <p>No analytics data available.</p>
          </div>
        ) : (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <StatCard label="Total Parents" value={String(data.totals.total_parents)} />
              <StatCard label="Total Childminders" value={String(data.totals.total_childminders)} />
              <StatCard label="Total Requests" value={String(data.totals.total_requests)} />
              <StatCard label="Total Generated Match Results" value={String(data.totals.total_matches)} />
              <StatCard label="Total Shortage" value={String(totalShortage)} />
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
                alignItems: "stretch",
              }}
            >
              <ChartCard
                title="Request demand vs available capacity by zone"
                subtitle="Compare childcare request volume against currently available provider capacity."
              >
                <DemandSupplyChart data={data.demand_supply} />
              </ChartCard>

              <div className="card" style={{ display: "grid", gap: 14 }}>
                <h2 className="section-title">Zone shortage snapshot</h2>
                {data.demand_supply.map((item) => (
                  <div
                    key={item.zone}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      paddingBottom: 10,
                      borderBottom: "1px solid #eef3f8",
                    }}
                  >
                    <span>{item.zone}</span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: item.shortage > 0 ? "#fff1f1" : "#eaf8ef",
                        color: item.shortage > 0 ? "#b54747" : "#1f7a3f",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Shortage: {item.shortage}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 16,
              }}
            >
              <ChartCard
                title="Parent cluster distribution"
                subtitle="Shows which family need profiles are most represented."
              >
                <ClusterPieChart data={data.parent_clusters} />
              </ChartCard>

              <ChartCard
                title="Childminder cluster distribution"
                subtitle="Shows how provider profiles are distributed across the system."
              >
                <ClusterBarChart data={data.childminder_clusters} />
              </ChartCard>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              <div className="card" style={{ display: "grid", gap: 14 }}>
                <h2 className="section-title">Pending requests by family cluster</h2>
                {data.waiting_list.length === 0 ? (
                  <p>No waiting list data.</p>
                ) : (
                  data.waiting_list.map((item) => (
                    <div
                      key={item.cluster_label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        paddingBottom: 10,
                        borderBottom: "1px solid #eef3f8",
                      }}
                    >
                      <span>{item.cluster_label}</span>
                      <strong>{item.pending_requests}</strong>
                    </div>
                  ))
                )}
              </div>

              <div className="card" style={{ display: "grid", gap: 14 }}>
                <h2 className="section-title">Zone request and provider snapshot</h2>
                {data.heatmap.map((item) => (
                  <div
                    key={item.zone}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: "#f8fbff",
                      border: "1px solid #e8eef7",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <strong>{item.zone}</strong>
                    <div style={{ color: "#5d7288" }}>
                      Request count: {item.demand_intensity}
                    </div>
                    <div style={{ color: "#5d7288" }}>
                      Childminder count: {item.supply_intensity}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </PageContainer>
  );
}