import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import Card from "../components/common/Card";
import { getRequests, updateRequestStatus } from "../api/requestApi";
import type { ChildcareRequest, RequestStatus } from "../types/request";

const FILTERS: { label: string; value: "all" | RequestStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

function formatWeekdays(value: string) {
  return value.split(",").join(", ");
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function getStatusStyles(status: RequestStatus) {
  if (status === "approved") {
    return {
      background: "#eaf8ef",
      color: "#1f7a3f",
      border: "1px solid #cfead8",
    };
  }

  if (status === "rejected") {
    return {
      background: "#fff1f1",
      color: "#b54747",
      border: "1px solid #f3d0d0",
    };
  }

  return {
    background: "#eef4ff",
    color: "#275efe",
    border: "1px solid #d9e5ff",
  };
}

export default function ApprovalPage() {
  const [requests, setRequests] = useState<ChildcareRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | RequestStatus>("pending");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadRequests = async (filter: "all" | RequestStatus) => {
    try {
      setLoading(true);
      setError("");

      const data =
        filter === "all" ? await getRequests() : await getRequests(filter);

      setRequests(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(activeFilter);
  }, [activeFilter]);

  const counts = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((item) => item.status === "pending").length,
      approved: requests.filter((item) => item.status === "approved").length,
      rejected: requests.filter((item) => item.status === "rejected").length,
    };
  }, [requests]);

  const handleStatusChange = async (
    requestId: number,
    status: RequestStatus
  ) => {
    try {
      setUpdatingId(requestId);
      await updateRequestStatus(requestId, { status });

      if (activeFilter === "pending") {
        setRequests((prev) => prev.filter((item) => item.id !== requestId));
      } else {
        setRequests((prev) =>
          prev.map((item) =>
            item.id === requestId ? { ...item, status } : item
          )
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update request status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const showActionsColumn =
    activeFilter === "pending" || activeFilter === "all";

  return (
    <PageContainer
      title="Approval Flow"
      subtitle="Review parent-selected childcare connections and approve or reject them in a simple municipal-style workflow."
    >
      <div style={{ display: "grid", gap: 20 }}>
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          <Card>
            <div className="kpi-label">Visible requests</div>
            <div className="kpi">{counts.total}</div>
          </Card>

          <Card>
            <div className="kpi-label">Pending</div>
            <div className="kpi">{counts.pending}</div>
          </Card>

          <Card>
            <div className="kpi-label">Approved</div>
            <div className="kpi">{counts.approved}</div>
          </Card>

          <Card>
            <div className="kpi-label">Rejected</div>
            <div className="kpi">{counts.rejected}</div>
          </Card>
        </section>

        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div>
              <h2 className="section-title" style={{ marginBottom: 6 }}>
                Request review queue
              </h2>
              <div style={{ color: "#5d7288", fontSize: 14 }}>
                Switch between pending, approved, rejected, or all requests.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {FILTERS.map((filter) => {
                const active = activeFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    className="button"
                    onClick={() => setActiveFilter(filter.value)}
                    style={{
                      background: active ? "#275efe" : "#e8eef7",
                      color: active ? "#ffffff" : "#16324f",
                    }}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <p>Loading requests...</p>
          ) : error ? (
            <div
              style={{
                border: "1px solid #f0c7c7",
                background: "#fff6f6",
                color: "#9b2c2c",
                padding: 14,
                borderRadius: 12,
              }}
            >
              {error}
            </div>
          ) : requests.length === 0 ? (
            <div
              style={{
                padding: 18,
                borderRadius: 12,
                background: "#f8fbff",
                border: "1px solid #e8eef7",
                color: "#5d7288",
              }}
            >
              No requests found for this filter.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Parent / Child</th>
                    <th>Zone</th>
                    <th>Time range</th>
                    <th>Weekdays</th>
                    <th>Special support</th>
                    <th>Selected childminder</th>
                    <th>Selected score</th>
                    <th>Status</th>
                    {showActionsColumn && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request) => {
                    const hasSelection = request.selected_childminder_id !== null;

                    return (
                      <tr key={request.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>#{request.id}</div>
                          <div style={{ color: "#6a7f93", fontSize: 13 }}>
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </td>

                        <td>
                          <div>
                            <strong>Parent:</strong> {request.parent_id}
                          </div>
                          <div>
                            <strong>Child:</strong> {request.child_id}
                          </div>
                        </td>

                        <td>{request.requested_location_zone}</td>

                        <td>
                          {formatTime(request.requested_start_time)} -{" "}
                          {formatTime(request.requested_end_time)}
                        </td>

                        <td>{formatWeekdays(request.requested_weekdays)}</td>

                        <td>{request.needs_special_support ? "Yes" : "No"}</td>

                        <td >
                          {hasSelection
                            ? `${request.selected_childminder_name ?? "Unknown"} (#${request.selected_childminder_id})`
                            : "Not selected yet"}
                        </td>

                        <td>
                          {request.selected_match_score !== null
                            ? request.selected_match_score.toFixed(2)
                            : "-"}
                        </td>

                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              borderRadius: 999,
                              padding: "6px 10px",
                              fontSize: 13,
                              fontWeight: 700,
                              textTransform: "capitalize",
                              ...getStatusStyles(request.status),
                            }}
                          >
                            {request.status}
                          </span>
                        </td>

                        {showActionsColumn && (
                          <td>
                            {request.status === "pending" ? (
                              hasSelection ? (
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  <button
                                    type="button"
                                    className="button"
                                    disabled={updatingId === request.id}
                                    onClick={() => handleStatusChange(request.id, "approved")}
                                    style={{
                                      padding: "10px 14px",
                                      opacity: updatingId === request.id ? 0.7 : 1,
                                    }}
                                  >
                                    {updatingId === request.id ? "Saving..." : "Approve"}
                                  </button>

                                  <button
                                    type="button"
                                    className="button secondary"
                                    disabled={updatingId === request.id}
                                    onClick={() => handleStatusChange(request.id, "rejected")}
                                    style={{
                                      padding: "10px 14px",
                                      opacity: updatingId === request.id ? 0.7 : 1,
                                    }}
                                  >
                                    {updatingId === request.id ? "Saving..." : "Reject"}
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: "#6a7f93", fontSize: 14 }}>
                                  Waiting for parent selection
                                </span>
                              )
                            ) : (
                              <span style={{ color: "#6a7f93", fontSize: 14 }}>Finalized</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}