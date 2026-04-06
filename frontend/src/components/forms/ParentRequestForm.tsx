import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import type {
  // Child,
  // Parent,
  RequestCreatePayload,
  // ChildcareRequest,
} from "../../types";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function ParentRequestForm() {
  const navigate = useNavigate();

  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const [selectedParentId, setSelectedParentId] = useState<number | "">("");
  const [selectedChildId, setSelectedChildId] = useState<number | "">("");
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
  ]);
  const [requestedStartTime, setRequestedStartTime] = useState("08:00:00");
  const [requestedEndTime, setRequestedEndTime] = useState("16:00:00");
  const [needsSpecialSupport, setNeedsSpecialSupport] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [parentsRes, childrenRes] = await Promise.all([
          api.get<Parent[]>("/parents"),
          api.get<Child[]>("/children"),
        ]);

        setParents(parentsRes.data);
        setChildren(childrenRes.data);

        if (parentsRes.data.length > 0) {
          const firstParent = parentsRes.data[0];
          setSelectedParentId(firstParent.id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load parents and children. Please seed the backend first.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredChildren = useMemo(() => {
    if (!selectedParentId) return [];
    return children.filter((child) => child.parent_id === selectedParentId);
  }, [children, selectedParentId]);

  useEffect(() => {
    if (filteredChildren.length > 0) {
      const firstChild = filteredChildren[0];
      setSelectedChildId(firstChild.id);
      setNeedsSpecialSupport(firstChild.has_special_needs);
    } else {
      setSelectedChildId("");
    }
  }, [filteredChildren]);

  const selectedParent = useMemo(() => {
    return parents.find((parent) => parent.id === selectedParentId) ?? null;
  }, [parents, selectedParentId]);

  const selectedChild = useMemo(() => {
    return filteredChildren.find((child) => child.id === selectedChildId) ?? null;
  }, [filteredChildren, selectedChildId]);

  useEffect(() => {
    if (selectedChild) {
      setNeedsSpecialSupport(selectedChild.has_special_needs);
    } else if (selectedParent) {
      setNeedsSpecialSupport(selectedParent.requires_special_support);
    }
  }, [selectedChild, selectedParent]);

  const toggleWeekday = (day: string) => {
    setSelectedWeekdays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((item) => item !== day);
      }
      return [...prev, day];
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedParent || !selectedChild) {
      setError("Please select both a parent and a child.");
      return;
    }

    if (selectedWeekdays.length === 0) {
      setError("Please select at least one weekday.");
      return;
    }

    if (requestedEndTime <= requestedStartTime) {
      setError("End time must be later than start time.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload: RequestCreatePayload = {
        parent_id: selectedParent.id,
        child_id: selectedChild.id,
        requested_weekdays: selectedWeekdays,
        requested_start_time: requestedStartTime,
        requested_end_time: requestedEndTime,
        requested_location_zone: selectedParent.location_zone,
        needs_special_support: needsSpecialSupport,
      };

      const requestRes = await api.post<ChildcareRequest>("/requests", payload);
      const createdRequest = requestRes.data;

      await api.post<MatchResponse>(`/match/${createdRequest.id}`);

      navigate(`/matches/${createdRequest.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create request or generate matches.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading parent and child profiles...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 24 }}>
      {error ? (
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
      ) : null}

      <div className="card">
        <h2 className="section-title">Step 1. Family profile</h2>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="parent">Parent</label>
            <select
              id="parent"
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(Number(e.target.value))}
            >
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.full_name} · {parent.location_zone} · {parent.cluster_label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="child">Child</label>
            <select
              id="child"
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(Number(e.target.value))}
              disabled={filteredChildren.length === 0}
            >
              {filteredChildren.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.child_name} · age {child.age_years}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedParent ? (
          <div
            style={{
              marginTop: 18,
              display: "grid",
              gap: 10,
              color: "#5d7288",
            }}
          >
            <div>
              <strong>Zone:</strong> {selectedParent.location_zone}
            </div>
            <div>
              <strong>Work type:</strong> {selectedParent.work_type}
            </div>
            <div>
              <strong>Parent cluster:</strong> {selectedParent.cluster_label}
            </div>
          </div>
        ) : null}
      </div>

      <div className="card">
        <h2 className="section-title">Step 2. Care schedule</h2>

        <div className="grid" style={{ gap: 16 }}>
          <div className="field">
            <label>Requested weekdays</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {WEEKDAYS.map((day) => {
                const active = selectedWeekdays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    className="button"
                    onClick={() => toggleWeekday(day)}
                    style={{
                      background: active ? "#275efe" : "#e8eef7",
                      color: active ? "white" : "#16324f",
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="start-time">Start time</label>
              <input
                id="start-time"
                type="time"
                step={60}
                value={requestedStartTime.slice(0, 5)}
                onChange={(e) => setRequestedStartTime(`${e.target.value}:00`)}
              />
            </div>

            <div className="field">
              <label htmlFor="end-time">End time</label>
              <input
                id="end-time"
                type="time"
                step={60}
                value={requestedEndTime.slice(0, 5)}
                onChange={(e) => setRequestedEndTime(`${e.target.value}:00`)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Step 3. Support needs</h2>

        <div className="field">
          <label
            htmlFor="special-support"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <input
              id="special-support"
              type="checkbox"
              checked={needsSpecialSupport}
              onChange={(e) => setNeedsSpecialSupport(e.target.checked)}
            />
            Needs special support
          </label>
        </div>

        {selectedChild?.special_needs_notes ? (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              background: "#f6f9fc",
              borderRadius: 12,
              color: "#4b6075",
            }}
          >
            <strong>Child note:</strong> {selectedChild.special_needs_notes}
          </div>
        ) : null}
      </div>

      <div className="card">
        <h2 className="section-title">Step 4. Review and submit</h2>

        <div className="grid-2">
          <div>
            <div className="kpi-label">Parent</div>
            <div>{selectedParent?.full_name ?? "Not selected"}</div>
          </div>
          <div>
            <div className="kpi-label">Child</div>
            <div>{selectedChild?.child_name ?? "Not selected"}</div>
          </div>
          <div>
            <div className="kpi-label">Zone</div>
            <div>{selectedParent?.location_zone ?? "-"}</div>
          </div>
          <div>
            <div className="kpi-label">Weekdays</div>
            <div>{selectedWeekdays.join(", ")}</div>
          </div>
          <div>
            <div className="kpi-label">Requested hours</div>
            <div>
              {requestedStartTime.slice(0, 5)} - {requestedEndTime.slice(0, 5)}
            </div>
          </div>
          <div>
            <div className="kpi-label">Special support</div>
            <div>{needsSpecialSupport ? "Yes" : "No"}</div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Creating request and matching..." : "Submit and generate matches"}
          </button>
        </div>
      </div>
    </form>
  );
}