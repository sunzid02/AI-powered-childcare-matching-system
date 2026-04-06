import type { ChildminderAvailability } from "../../types/childminder";

type Props = {
  availability: ChildminderAvailability[];
};

const WEEKDAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function formatTime(value: string) {
  return value?.slice(0, 5) ?? "-";
}

export default function AvailabilityTable({ availability }: Props) {
  const sortedAvailability = [...availability].sort((a, b) => {
    return WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday);
  });

  if (sortedAvailability.length === 0) {
    return (
      <div className="card">
        <p>No availability data found.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">Weekly Availability</h2>

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5edf5" }}>
              <th style={{ padding: "10px 8px" }}>Day</th>
              <th style={{ padding: "10px 8px" }}>Start</th>
              <th style={{ padding: "10px 8px" }}>End</th>
              <th style={{ padding: "10px 8px" }}>Open Slots</th>
            </tr>
          </thead>
          <tbody>
            {sortedAvailability.map((slot) => (
              <tr key={slot.id} style={{ borderBottom: "1px solid #eef3f8" }}>
                <td style={{ padding: "10px 8px" }}>{slot.weekday}</td>
                <td style={{ padding: "10px 8px" }}>{formatTime(slot.start_time)}</td>
                <td style={{ padding: "10px 8px" }}>{formatTime(slot.end_time)}</td>
                <td style={{ padding: "10px 8px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      minWidth: 36,
                      textAlign: "center",
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: slot.available_slots > 0 ? "#eaf8ef" : "#fff1f1",
                      color: slot.available_slots > 0 ? "#1f7a3f" : "#b54747",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {slot.available_slots}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}