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
      } catch (e) {
        console.error("Failed to load favorites", e);
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
      updated = updated.filter(
        (favId) => favId !== id
      );
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
    const isLive = LIVE_STATUSES.includes(
      match.fixture.status.short
    );

    const isFinished = FINISHED_STATUSES.includes(
      match.fixture.status.short
    );

    const isUpcoming = !isLive && !isFinished;

    const isFav = favorites.includes(
      match.fixture.id
    );

    if (activeTab === "LIVE" && !isLive) return false;
    if (activeTab === "UPCOMING" && !isUpcoming)
      return false;
    if (activeTab === "FINISHED" && !isFinished)
      return false;
    if (activeTab === "FAV" && !isFav) return false;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      const home =
        match.teams.home.name.toLowerCase();

      const away =
        match.teams.away.name.toLowerCase();

      const league =
        match.league.name.toLowerCase();

      return (
        home.includes(query) ||
        away.includes(query) ||
        league.includes(query)
      );
    }

    return true;
  });

  const liveCount = matches.filter((m) =>
    LIVE_STATUSES.includes(
      m.fixture.status.short
    )
  ).length;

  const totalLeagues = new Set(
    matches.map((match) =>
      match.league.id !== undefined &&
      match.league.id !== null
        ? `id-${match.league.id}`
        : `${match.league.country}-${match.league.name}`
    )
  ).size;

  const leagueGroups =
    groupMatchesByLeague(filteredMatches);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        color: "#171717",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, #fb923c, #ea580c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "18px",
                color: "#ffffff",
                boxShadow:
                  "0 3px 10px rgba(249,115,22,0.25)",
              }}
            >
              G
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                lineHeight: 1,
                color: "#171717",
              }}
            >
              GoGoal
              <span style={{ color: "#f97316" }}>
                Match
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <HeroStat
              label="Live"
              value={
                loading ? "–" : String(liveCount)
              }
              accent="#ef4444"
            />

            <HeroStat
              label="Total"
              value={
                loading
                  ? "–"
                  : String(matches.length)
              }
              accent="#f97316"
            />

            <HeroStat
              label="Leagues"
              value={
                loading
                  ? "–"
                  : String(totalLeagues)
              }
              accent="#2563eb"
            />
          </div>
        </div>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px 12px",
          }}
        >
          <input
            type="text"
            placeholder="Search team or league..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            style={{
              width: "100%",
              background: "#ffffff",
              border: "1px solid #d4d4d4",
              borderRadius: "8px",
              padding: "9px 14px",
              color: "#171717",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "6px",
              marginTop: "10px",
              overflowX: "auto",
              paddingBottom: "2px",
            }}
          >
            <button
              className={`ggm-filter-btn ${
                activeTab === "ALL"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("ALL")
              }
            >
              ALL ({matches.length})
            </button>

            <button
              className={`ggm-filter-btn ${
                activeTab === "LIVE"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("LIVE")
              }
            >
              <span className="ggm-live-dot" />
              LIVE ({liveCount})
            </button>

            <button
              className={`ggm-filter-btn ${
                activeTab === "UPCOMING"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("UPCOMING")
              }
            >
              UPCOMING
            </button>

            <button
              className={`ggm-filter-btn ${
                activeTab === "FINISHED"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("FINISHED")
              }
            >
              FINISHED
            </button>

            <button
              className={`ggm-filter-btn ${
                activeTab === "FAV"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveTab("FAV")
              }
            >
              ★ FAV ({favorites.length})
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "6px",
              marginTop: "8px",
              overflowX: "auto",
            }}
          >
            {generateDateTabs().map((item) => (
              <button
                key={item.iso}
                className={`ggm-date-btn ${
                  selectedDate === item.iso
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedDate(item.iso)
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 20px 60px",
        }}
      >
        {loading ? (
          <div className="ggm-message">
            Loading matches...
          </div>
        ) : leagueGroups.length === 0 ? (
          <div className="ggm-message">
            No matches found for the selected filter.
          </div>
        ) : (
          leagueGroups.map((group) => (
            <LeagueGroup
              key={group.key}
              league={group.league}
              matches={group.matches}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </section>

      <footer
        style={{
          borderTop: "1px solid #e5e5e5",
          padding: "24px 20px",
          textAlign: "center",
          color: "#737373",
          fontSize: "12px",
          background: "#ffffff",
        }}
      >
        © {new Date().getFullYear()} GoGoalMatch —
        Live sports scores & standings.
      </footer>

      <style jsx global>{`
        .ggm-filter-btn {
          background: #ffffff;
          border: 1px solid #d4d4d4;
          color: #525252;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .ggm-filter-btn.active {
          background: #fff7ed;
          color: #ea580c;
          border-color: #f97316;
        }

        .ggm-date-btn {
          background: #ffffff;
          border: 1px solid #d4d4d4;
          color: #737373;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
        }

        .ggm-date-btn.active {
          color: #ea580c;
          border-color: #f97316;
          background: #fff7ed;
        }

        .ggm-fav-star {
          cursor: pointer;
          font-size: 15px;
          color: #a3a3a3;
        }

        .ggm-fav-star.active {
          color: #f97316;
        }

        .ggm-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
          display: inline-block;
        }

        .ggm-league-group {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .ggm-row {
          display: block;
          text-decoration: none;
          color: #171717;
          transition: background 0.15s ease;
        }

        .ggm-row:hover {
          background: #fff7ed;
        }

        .ggm-row + .ggm-row {
          border-top: 1px solid #eeeeee;
        }

        .ggm-message {
          background: #ffffff;
          border: 1px solid #e5e5e5;
          padding: 40px 20px;
          border-radius: 14px;
          text-align: center;
          color: #737373;
          font-size: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        @media (max-width: 640px) {
          .ggm-team-name {
            font-size: 12px !important;
          }

          .ggm-team-logo {
            width: 22px !important;
            height: 22px !important;
          }

          .ggm-score {
            font-size: 15px !important;
          }
        }
      `}</style>
    </main>
  );
}

function HeroStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        padding: "6px 12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 900,
          color: accent,
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "2px",
          fontSize: "9px",
          fontWeight: 700,
          color: "#737373",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function getLeagueKey(
  league: Match["league"]
): string {
  if (
    league.id !== undefined &&
    league.id !== null
  ) {
    return `league-${league.id}`;
  }

  return `fallback-${league.country
    .trim()
    .toLowerCase()}-${league.name
    .trim()
    .toLowerCase()}`;
}

function groupMatchesByLeague(
  matches: Match[]
) {
  const groups = new Map<
    string,
    {
      league: Match["league"];
      matches: Match[];
    }
  >();

  for (const match of matches) {
    const key = getLeagueKey(match.league);
    const existing = groups.get(key);

    if (existing) {
      existing.matches.push(match);
    } else {
      groups.set(key, {
        league: match.league,
        matches: [match],
      });
    }
  }

  return Array.from(groups.entries()).map(
    ([key, value]) => ({
      key,
      league: value.league,
      matches: value.matches,
    })
  );
}

function formatKickoffTime(
  dateString?: string
): string {
  if (!dateString) return "--:--";

  const parsed = new Date(dateString);

  if (Number.isNaN(parsed.getTime())) {
    return "--:--";
  }

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LeagueGroup({
  league,
  matches,
  favorites,
  onToggleFavorite,
}: {
  league: Match["league"];
  matches: Match[];
  favorites: number[];
  onToggleFavorite: (
    e: React.MouseEvent,
    id: number
  ) => void;
}) {
  return (
    <div className="ggm-league-group">
      <div
        style={{
          background: "#fffaf5",
          padding: "8px 12px",
          borderBottom: "1px solid #eeeeee",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {league.logo && (
          <img
            src={league.logo}
            alt=""
            width="20"
            height="20"
            style={{
              objectFit: "contain",
            }}
          />
        )}

        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 800,
              color: "#171717",
            }}
          >
            {league.name}
          </div>

          <div
            style={{
              fontSize: "10px",
              color: "#737373",
            }}
          >
            {league.country}
          </div>
        </div>

        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#737373",
          }}
        >
          {matches.length}
        </div>
      </div>

      <div>
        {matches.map((match) => (
          <MatchRow
            key={match.fixture.id}
            match={match}
            isFav={favorites.includes(
              match.fixture.id
            )}
            onToggleFav={(e) =>
              onToggleFavorite(
                e,
                match.fixture.id
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function MatchRow({
  match,
  isFav,
  onToggleFav,
}: {
  match: Match;
  isFav: boolean;
  onToggleFav: (
    e: React.MouseEvent
  ) => void;
}) {
  const isLive = LIVE_STATUSES.includes(
    match.fixture.status.short
  );

  const isFinished =
    FINISHED_STATUSES.includes(
      match.fixture.status.short
    );

  const statusText = isLive
    ? match.fixture.status.elapsed != null
      ? `${match.fixture.status.elapsed}'`
      : match.fixture.status.short
    : isFinished
    ? "FT"
    : formatKickoffTime(
        match.fixture.date
      );

  return (
    <a
      href={`/matches/${match.fixture.id}`}
      className="ggm-row"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "24px 1fr 70px 1fr",
          alignItems: "center",
          padding: "10px 12px",
          gap: "6px",
          minHeight: "48px",
        }}
      >
        <span
          className={`ggm-fav-star ${
            isFav ? "active" : ""
          }`}
          onClick={onToggleFav}
        >
          ★
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "6px",
            minWidth: 0,
          }}
        >
          <strong
            className="ggm-team-name"
            style={{
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {match.teams.home.name}
          </strong>

          <img
            src={match.teams.home.logo}
            alt=""
            width="22"
            height="22"
            className="ggm-team-logo"
            style={{
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
          }}
        >
          {!isLive && !isFinished ? (
            <div
              className="ggm-score"
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#f97316",
              }}
            >
              {statusText}
            </div>
          ) : (
            <>
              <div
                className="ggm-score"
                style={{
                  fontSize: "16px",
                  fontWeight: 900,
                  color: "#171717",
                }}
              >
                {`${match.goals.home ?? 0} - ${
                  match.goals.away ?? 0
                }`}
              </div>

              <div
                style={{
                  marginTop: "2px",
                  fontSize: "9px",
                  fontWeight: 800,
                  color: isLive
                    ? "#ef4444"
                    : "#737373",
                }}
              >
                {statusText}
              </div>
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            minWidth: 0,
          }}
        >
          <img
            src={match.teams.away.logo}
            alt=""
            width="22"
            height="22"
            className="ggm-team-logo"
            style={{
              objectFit: "contain",
              flexShrink: 0,
            }}
          />

          <strong
            className="ggm-team-name"
            style={{
              fontSize: "12px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {match.teams.away.name}
          </strong>
        </div>
      </div>
    </a>
  );
}
