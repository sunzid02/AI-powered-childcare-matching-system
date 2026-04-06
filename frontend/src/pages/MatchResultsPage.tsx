import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import MatchCard from "../components/common/MatchCard";
import { getMatchesByRequest } from "../api/matchApi";
import { selectChildminderForRequest } from "../api/requestApi";
import type { MatchResultItem } from "../types/match";

export default function MatchResultsPage() {
  const { requestId } = useParams();
  const [matches, setMatches] = useState<MatchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [selectedChildminderId, setSelectedChildminderId] = useState<number | null>(null);
  const [selectionMessage, setSelectionMessage] = useState("");

  useEffect(() => {
    const loadMatches = async () => {
      if (!requestId) {
        setError("Missing request ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMatchesByRequest(Number(requestId));
        setMatches(data.results.slice(0, 3));
      } catch (err) {
        console.error(err);
        setError("Failed to load match results.");
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [requestId]);

  const handleSelectChildminder = async (match: MatchResultItem) => {
    if (!requestId) return;

    try {
      setSelectingId(match.childminder_id);
      setError("");
      setSelectionMessage("");

      await selectChildminderForRequest(Number(requestId), {
        selected_childminder_id: match.childminder_id,
        selected_match_score: match.final_score,
      });

      setSelectedChildminderId(match.childminder_id);
      setSelectionMessage(
        `${match.childminder_name} has been selected successfully. Your request is now waiting for admin review.`
      );
    } catch (err) {
      console.error(err);
      setError("Failed to save selected childminder.");
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <PageContainer>
      <div style={{ display: "grid", gap: 20 }}>
        <div>
          <h1 className="page-title">Top Matches</h1>
          <p className="page-subtitle">
            These are the top recommended childminders for this request based on location, time compatibility, family cluster, and vector similarity.
          </p>
        </div>

        {selectionMessage && (
          <div
            className="card"
            style={{
              borderColor: "#cfead8",
              background: "#f2fbf5",
              color: "#1f7a3f",
            }}
          >
            {selectionMessage}
          </div>
        )}

        {loading ? (
          <div className="card">
            <p>Loading matches...</p>
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
        ) : matches.length === 0 ? (
          <div className="card">
            <p>No matches found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {matches.map((match) => (
              <MatchCard
                key={match.childminder_id}
                match={match}
                onSelect={handleSelectChildminder}
                isSelecting={selectingId === match.childminder_id}
                isSelected={selectedChildminderId === match.childminder_id}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}