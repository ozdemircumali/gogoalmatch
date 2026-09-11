"use client";

import { useEffect, useState } from "react";

type Match = {
  fixture: {
    id: number;
    date?: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id?: number;
    name: string;
    country: string;
    logo: string;
  };
  teams: {
    home: {
      name: string;
      logo: string;
    };
    away: {
      name: string;
      logo: string;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

type FilterTab = "ALL" | "LIVE" | "UPCOMING" | "FINISHED" | "FAV";

const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED_STATUSES = ["FT", "AET", "PEN"];

function groupMatchesByLeague(matches: Match[]) {
  const groups: Record<string, Match[]> = {};

  matches.forEach((match) => {
    const key =
      match.league.id !== undefined
        ? `id-${match.league.id}`
        : `${match.league.country}-${match.league.name}`;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(match);
  });

  return Object.values(groups);
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("ggm_favorites");

    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  async function loadMatches() {
    try {
      const response = await fetch(
        `/api/fixtures?date=${selectedDate}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (Array.isArray(data.response)) {
        setMatches(data.response);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error("Failed to load matches:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadMatches();

    const interval = setInterval(loadMatches, 30000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  const toggleFavorite = (
    e: React.MouseEvent,
    id: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    let updated = [...favorites];

    if (updated.includes(id)) {
      updated = updated.filter((favId) => favId !== id);
    } else {
      updated.push(id);
    }

    setFavorites(updated);
    localStorage.setItem(
      "ggm_favorites",
      JSON.stringify(updated)
    );
  };

  const generateDateTabs = () => {
    const dates = [];

    for (let i = -2; i <= 2; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      const iso = d.toISOString().split("T")[0];

      const label =
        i === 0
          ? "Today"
          : i === -1
          ? "Yesterday"
          : i === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-US", {
              weekday: "short",
              month: "numeric",
              day: "numeric",
            });

      dates.push({ iso, label });
    }

    return dates;
  };

  const filteredMatches = matches.filter((match) => {
    const status = match.fixture.status.short;

    const isLive = LIVE_STATUSES.includes(status);
    const isFinished = FINISHED_STATUSES.includes(status);
    const isUpcoming = !isLive && !isFinished;
    const isFav = favorites.includes(match.fixture.id);

    if (activeTab === "LIVE" && !isLive) return false;
    if (activeTab === "UPCOMING" && !isUpcoming) return false;
    if (activeTab === "FINISHED" && !isFinished) return false;
    if (activeTab === "FAV" && !isFav) return false;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      const home = match.teams.home.name.toLowerCase();
      const away = match.teams.away.name.toLowerCase();
      const league = match.league.name.toLowerCase();

      return (
        home.includes(query) ||
        away.includes(query) ||
        league.includes(query)
      );
    }

    return true;
  });

  const liveCount = matches.filter((match) =>
    LIVE_STATUSES.includes(match.fixture.status.short)
  ).length;

  const leagueGroups =
    groupMatchesByLeague(filteredMatches);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        color: "#222",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e5e5",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "18px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 15,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#f97316",
                }}
              >
                GoGoalMatch
              </h1>

              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 13,
                  color: "#777",
                }}
              >
                Live Scores, Results & Statistics
              </p>
            </div>

            <div
              style={{
                background: "#fff7ed",
                color: "#ea580c",
                padding: "8px 12px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {liveCount} LIVE
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <input
              type="text"
              placeholder="Search team or league..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                border: "1px solid #ddd",
                borderRadius: 10,
                background: "#fff",
                color: "#222",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 6,
          }}
        >
          {generateDateTabs().map((date) => (
            <button
              key={date.iso}
              onClick={() =>
                setSelectedDate(date.iso)
              }
              style={{
                flex: "0 0 auto",
                padding: "9px 14px",
                borderRadius: 9,
                border:
                  selectedDate === date.iso
                    ? "1px solid #f97316"
                    : "1px solid #ddd",
                background:
                  selectedDate === date.iso
                    ? "#f97316"
                    : "#fff",
                color:
                  selectedDate === date.iso
                    ? "#fff"
                    : "#555",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {date.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 14,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {(
            [
              ["ALL", "All"],
              ["LIVE", "Live"],
              ["UPCOMING", "Upcoming"],
              ["FINISHED", "Finished"],
              ["FAV", "Favorites"],
            ] as [FilterTab, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              style={{
                flex: "0 0 auto",
                padding: "8px 13px",
                border: "none",
                borderRadius: 8,
                background:
                  activeTab === value
                    ? "#ea580c"
                    : "#ffffff",
                color:
                  activeTab === value
                    ? "#ffffff"
                    : "#555",
                boxShadow:
                  activeTab === value
                    ? "0 2px 6px rgba(234,88,12,0.25)"
                    : "0 1px 3px rgba(0,0,0,0.08)",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#777",
            }}
          >
            Loading matches...
          </div>
        ) : filteredMatches.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "50px 20px",
              marginTop: 18,
              textAlign: "center",
              border: "1px solid #e5e5e5",
            }}
          >
            <div
              style={{
                fontSize: 40,
                marginBottom: 10,
              }}
            >
              ⚽
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 20,
              }}
            >
              No matches found
            </h2>

            <p
              style={{
                color: "#777",
                marginTop: 8,
              }}
            >
              Try another date or search.
            </p>
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            {leagueGroups.map((leagueMatches) => {
              const league = leagueMatches[0].league;

              return (
                <section
                  key={
                    league.id ??
                    `${league.country}-${league.name}`
                  }
                  style={{
                    marginBottom: 18,
                    background: "#fff",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid #e5e5e5",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      background: "#fff7ed",
                      borderBottom:
                        "1px solid #fed7aa",
                    }}
                  >
                    {league.logo && (
                      <img
                        src={league.logo}
                        alt=""
                        width={28}
                        height={28}
                        style={{
                          objectFit: "contain",
                        }}
                      />
                    )}

                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#222",
                        }}
                      >
                        {league.name}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "#888",
                        }}
                      >
                        {league.country}
                      </div>
                    </div>
                  </div>

                  {leagueMatches.map((match) => {
                    const status =
                      match.fixture.status.short;

                    const isLive =
                      LIVE_STATUSES.includes(status);

                    const isFinished =
                      FINISHED_STATUSES.includes(status);

                    const time = match.fixture.date
                      ? new Date(
                          match.fixture.date
                        ).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "--:--";

                    return (
                      <a
                        key={match.fixture.id}
                        href={`/matches/${match.fixture.id}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "70px 1fr 80px 34px",
                          alignItems: "center",
                          gap: 10,
                          padding: "14px",
                          textDecoration: "none",
                          color: "#222",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "center",
                            fontSize: 13,
                            color: isLive
                              ? "#ea580c"
                              : "#777",
                            fontWeight: isLive
                              ? 800
                              : 600,
                          }}
                        >
                          {isLive
                            ? `${status}${
                                match.fixture.status
                                  .elapsed
                                  ? ` ${match.fixture.status.elapsed}'`
                                  : ""
                              }`
                            : isFinished
                            ? status
                            : time}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {match.teams.home.logo && (
                              <img
                                src={
                                  match.teams.home.logo
                                }
                                alt=""
                                width={24}
                                height={24}
                                style={{
                                  objectFit: "contain",
                                }}
                              />
                            )}

                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {match.teams.home.name}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {match.teams.away.logo && (
                              <img
                                src={
                                  match.teams.away.logo
                                }
                                alt=""
                                width={24}
                                height={24}
                                style={{
                                  objectFit: "contain",
                                }}
                              />
                            )}

                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {match.teams.away.name}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            textAlign: "center",
                            fontSize: 16,
                            fontWeight: 800,
                            lineHeight: 1.8,
                          }}
                        >
                          <div>
                            {match.goals.home ?? "-"}
                          </div>

                          <div>
                            {match.goals.away ?? "-"}
                          </div>
                        </div>

                        <button
                          onClick={(e) =>
                            toggleFavorite(
                              e,
                              match.fixture.id
                            )
                          }
                          style={{
                            border: "none",
                            background: "transparent",
                            fontSize: 20,
                            cursor: "pointer",
                            color: favorites.includes(
                              match.fixture.id
                            )
                              ? "#f97316"
                              : "#bbb",
                          }}
                        >
                          ★
                        </button>
                      </a>
                    );
                  })}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
