import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
import PageContainer from "../components/layout/PageContainer";

export default function LandingPage() {
  return (
    <PageContainer
      title="AI-powered childcare matching with parent-driven selection"
      subtitle="A demo-ready civic-tech prototype where parents receive top childminder matches, choose their preferred option, and admins review the selected connection."
    >
      <section className="hero">
        <div className="grid-2">
          <Card>
            <h2 className="section-title">Smarter childcare placement</h2>
            <p className="hero-text">
              This prototype shows how explainable matching can support childcare
              placement using distance, time compatibility, family needs, and
              provider fit, while keeping parents involved in the final choice.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/request" className="button">
                Start childcare request
              </Link>
              <Link to="/admin" className="button secondary">
                View admin dashboard
              </Link>
            </div>
          </Card>

          <Card>
            <h2 className="section-title">Demo flow</h2>
            <div className="grid">
              <div>1. Parent submits childcare request</div>
              <div>2. System recommends top 3 childminders</div>
              <div>3. Parent selects a preferred childminder</div>
              <div>4. Admin approves or rejects the selected connection</div>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid-3">
        <StatCard label="Matching inputs" value="Location + time + cluster fit" />
        <StatCard label="Primary users" value="Parents, childminders, admins" />
        <StatCard label="Workflow" value="Parent selects, admin reviews" />
      </section>


    </PageContainer>
  );
}