"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const response = await fetch("/api/fixtures", {
          cache: "no-store",
        });

        const data = await response.json();

        setMatches(data.response || []);
      } catch (error) {
        console.error("Failed to load matches:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>GoGoalMatch</h1>
      <p>Live Scores, Results and Football Statistics</p>

      <h2>Live Matches</h2>

      {loading ? (
        <p>Loading matches...</p>
      ) : matches.length === 0 ? (
        <p>There are no live matches right now.</p>
      ) : (
        matches.map((match) => (
          <a
            key={match.fixture.id}
            href={`/matches/${match.fixture.id}`}
            style={{
              display: "block",
              padding: 15,
              marginBottom: 10,
              border: "1px solid #ddd",
              borderRadius: 8,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <strong>
              {match.teams.home.name} {match.goals.home ?? 0} -{" "}
              {match.goals.away ?? 0} {match.teams.away.name}
            </strong>

            <div>
              {match.fixture.status?.long}
            </div>
          </a>
        ))
      )}
    </main>
  );
}
