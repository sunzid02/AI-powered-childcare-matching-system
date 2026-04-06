import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import AvailabilityTable from "../components/common/AvailabilityTable";
import { getChildminderById } from "../api/childminderApi";
import type { ChildminderDetail } from "../types/childminder";

function formatTime(value: string) {
  return value?.slice(0, 5) ?? "-";
}

export default function ChildminderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [childminder, setChildminder] = useState<ChildminderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChildminder = async () => {
      if (!id) {
        setError("Missing childminder ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getChildminderById(Number(id));
        setChildminder(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load childminder details.");
      } finally {
        setLoading(false);
      }
    };

    loadChildminder();
  }, [id]);

  return (
    <PageContainer>
      <div style={{ display: "grid", gap: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 className="page-title">Childminder Profile</h1>
            <p className="page-subtitle">
              Review caregiver profile, care window, capacity, and weekly availability.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              className="button"
              onClick={() => navigate(-1)}
            >
              Back
            </button>

            <Link
              to="/request"
              style={{
                color: "#275efe",
                textDecoration: "none",
                fontWeight: 600,
                alignSelf: "center",
              }}
            >
              Go to request form
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <p>Loading childminder details...</p>
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
        ) : !childminder ? (
          <div className="card">
            <p>Childminder not found.</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ display: "grid", gap: 20 }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: 8 }}>
                  {childminder.full_name}
                </h2>
                <div style={{ color: "#5d7288", display: "grid", gap: 6 }}>
                  <div>
                    <strong>Zone:</strong> {childminder.location_zone}
                  </div>
                  <div>
                    <strong>Email:</strong> {childminder.email}
                  </div>
                </div>
              </div>

              <div
                className="grid-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 16,
                }}
              >
                <div>
                  <div className="kpi-label">Experience</div>
                  <div>{childminder.years_experience} years</div>
                </div>

                <div>
                  <div className="kpi-label">Special support</div>
                  <div>{childminder.supports_special_needs ? "Yes" : "No"}</div>
                </div>

                <div>
                  <div className="kpi-label">Capacity</div>
                  <div>
                    {childminder.current_capacity} / {childminder.max_capacity}
                  </div>
                </div>

                <div>
                  <div className="kpi-label">Profile cluster</div>
                  <div>{childminder.cluster_label ?? "-"}</div>
                </div>

                <div>
                  <div className="kpi-label">Earliest start</div>
                  <div>{formatTime(childminder.earliest_start_time)}</div>
                </div>

                <div>
                  <div className="kpi-label">Latest end</div>
                  <div>{formatTime(childminder.latest_end_time)}</div>
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "#f8fbff",
                  color: "#4b6075",
                  lineHeight: 1.6,
                }}
              >
                <strong>Profile summary:</strong>{" "}
                {childminder.profile_summary ||
                  "Experienced childminder with a reliable and family-centered care approach."}
              </div>

              {childminder.tags ? (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "#f6f9fc",
                    color: "#4b6075",
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Tags:</strong> {childminder.tags}
                </div>
              ) : null}

              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "#f6f9fc",
                  color: "#4b6075",
                  lineHeight: 1.6,
                }}
              >
                <strong>Coordinates:</strong> {childminder.latitude}, {childminder.longitude}
              </div>
            </div>

            <AvailabilityTable availability={childminder.availabilities} />
          </>
        )}
      </div>
    </PageContainer>
  );
}