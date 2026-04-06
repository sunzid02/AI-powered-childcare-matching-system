import { Link } from "react-router-dom";
import type { MatchResultItem } from "../../types/match";

type Props = {
  match: MatchResultItem;
  onSelect?: (match: MatchResultItem) => void;
  isSelecting?: boolean;
  isSelected?: boolean;
};

function ScoreBadge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        background: "#f4f7fb",
        border: "1px solid #e3ebf5",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        fontSize: 13,
      }}
    >
      <span>{label}</span>
      <strong>{value.toFixed(2)}</strong>
    </div>
  );
}

export default function MatchCard({
  match,
  onSelect,
  isSelecting = false,
  isSelected = false,
}: Props) {
  return (
    <div className="card" style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 className="section-title" style={{ marginBottom: 6 }}>
            {match.childminder_name}
          </h2>
          <div style={{ color: "#5d7288" }}>
            Rank #{match.rank_position}
          </div>
        </div>

        <div
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            background: "#eaf2ff",
            color: "#1f57d6",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Final Score: {match.final_score.toFixed(2)}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
        }}
      >
        <ScoreBadge label="Location" value={match.location_score} />
        <ScoreBadge label="Time" value={match.time_score} />
        <ScoreBadge label="Cluster" value={match.cluster_score} />
        <ScoreBadge label="Vector" value={match.vector_score} />
        <ScoreBadge label="Final" value={match.final_score} />
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
        <strong>Why this match:</strong> {match.explanation}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Link
          to={`/childminders/${match.childminder_id}`}
          style={{
            color: "#275efe",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          View childminder details →
        </Link>

        {onSelect && (
          <button
            type="button"
            className="button"
            onClick={() => onSelect(match)}
            disabled={isSelecting || isSelected}
            style={{
              opacity: isSelecting || isSelected ? 0.7 : 1,
            }}
          >
            {isSelected
              ? "Selected"
              : isSelecting
              ? "Saving..."
              : "Select this childminder"}
          </button>
        )}
      </div>
    </div>
  );
}