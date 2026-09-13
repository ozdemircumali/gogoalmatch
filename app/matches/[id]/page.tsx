"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type EventItem = {
  time?: {
    elapsed?: number;
    extra?: number | null;
  };
  team?: {
    id?: number;
    name?: string;
    logo?: string;
  };
  player?: {
    id?: number;
    name?: string;
  };
  assist?: {
    id?: number;
    name?: string;
  };
  type?: string;
  detail?: string;
  comments?: string | null;
};

type StatItem = {
  type?: string;
  value?: string | number | null;
};

type TeamStats = {
  team?: {
    id?: number;
    name?: string;
    logo?: string;
  };
  statistics?: StatItem[];
};

type PlayerItem = {
  player?: {
    id?: number;
    name?: string;
    photo?: string;
  };
  games?: {
    number?: number;
    position?: string;
    rating?: string;
    captain?: boolean;
    substitute?: boolean;
  };
  substitutes?: {
    in?: number | null;
    out?: number | null;
  };
  shots?: {
    total?: number | null;
    on?: number | null;
  };
  goals?: {
    total?: number | null;
    assists?: number | null;
    conceded?: number | null;
  };
  passes?: {
    total?: number | null;
    key?: number | null;
    accuracy?: string | number | null;
  };
  tackles?: {
    total?: number | null;
    blocks?: number | null;
    interceptions?: number | null;
  };
  duels?: {
    total?: number | null;
    won?: number | null;
  };
  dribbles?: {
    attempts?: number | null;
    success?: number | null;
  };
  fouls?: {
    drawn?: number | null;
    committed?: number | null;
  };
  cards?: {
    yellow?: number | null;
    red?: number | null;
  };
  penalty?: {
    won?: number | null;
    committed?: number | null;
    scored?: number | null;
    missed?: number | null;
    saved?: number | null;
  };
};

type LineupItem = {
  team?: {
    id?: number;
    name?: string;
    logo?: string;
    colors?: any;
  };
  formation?: string;
  startXI?: {
    player?: PlayerItem["player"];
    games?: PlayerItem["games"];
  }[];
  substitutes?: {
    player?: PlayerItem["player"];
    games?: PlayerItem["games"];
  }[];
  coach?: {
    id?: number;
    name?: string;
    photo?: string;
  };
};

type MatchDetail = {
  fixture?: {
    id?: number;
    referee?: string | null;
    timezone?: string;
    date?: string;
    timestamp?: number;
    periods?: {
      first?: number | null;
      second?: number | null;
    };
    venue?: {
      id?: number | null;
      name?: string | null;
      city?: string | null;
    };
    status?: {
      long?: string;
      short?: string;
      elapsed?: number | null;
      extra?: number | null;
    };
  };
  league?: {
    id?: number;
    name?: string;
    country?: string;
    logo?: string;
  };
  teams?: {
    home?: {
      id?: number;
      name?: string;
      logo?: string;
      winner?: boolean | null;
    };
    away?: {
      id?: number;
      name?: string;
      logo?: string;
      winner?: boolean | null;
    };
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  };
  score?: any;
  events?: EventItem[];
  statistics?: TeamStats[];
  lineups?: LineupItem[];
};

const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED_STATUSES = ["FT", "AET", "PEN"];

type TabType = "SUMMARY" | "STATS" | "LINEUPS";

const FAVORITES_KEY = "ggm_favorites";

function getEventKey(event: EventItem) {
  return [
    event.time?.elapsed ?? "",
    event.time?.extra ?? "",
    event.team?.id ?? "",
    event.player?.id ?? event.player?.name ?? "",
    event.type ?? "",
    event.detail ?? "",
    event.comments ?? "",
  ].join("|");
}

function getEventIcon(event: EventItem) {
  const type = event.type?.toLowerCase() || "";
  const detail = event.detail?.toLowerCase() || "";

  if (type === "goal") return "⚽";
  if (type === "card" && detail.includes("red")) return "🟥";
  if (type === "card") return "🟨";
  if (type === "subst") return "↕";
  if (type === "var") return "VAR";
  if (detail.includes("penalty")) return "P";
  return "•";
}

function getEventTitle(event: EventItem) {
  const type = event.type?.toLowerCase() || "";
  const detail = event.detail || "";

  if (type === "goal") return detail || "Goal";
  if (type === "card") return detail || "Card";
  if (type === "subst") return "Substitution";
  if (type === "var") return detail || "VAR";

  return detail || event.type || "Event";
}

function parseStatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;

  const numeric = parseFloat(String(value).replace("%", ""));

  if (Number.isNaN(numeric)) return null;

  return numeric;
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </div>

      <div className="break-words text-sm font-semibold leading-5 text-white">
        {value || "—"}
      </div>
    </div>
  );
}

function TabNavButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 border-b-2 px-3 py-3 text-xs font-bold tracking-wide transition ${
        active
          ? "border-orange-500 text-orange-400"
          : "border-transparent text-gray-500 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function MatchStatisticsSection({
  statistics,
}: {
  statistics?: TeamStats[];
}) {
  if (!statistics || statistics.length < 2) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="text-sm font-semibold text-gray-300">
          Statistics are not available for this match.
        </div>
      </div>
    );
  }

  const home = statistics[0];
  const away = statistics[1];

  const homeStats = home.statistics || [];
  const awayStats = away.statistics || [];

  if (!homeStats.length && !awayStats.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="text-sm font-semibold text-gray-300">
          Statistics are not available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {homeStats.map((homeStat, index) => {
        const type = homeStat.type || `Stat ${index + 1}`;

        const awayStat =
          awayStats.find((item) => item.type === type) || {};

        const homeValue = homeStat.value;
        const awayValue = awayStat.value;

        const homeNumber = parseStatValue(homeValue);
        const awayNumber = parseStatValue(awayValue);

        let homePercent = 50;
        let awayPercent = 50;

        if (
          homeNumber !== null &&
          awayNumber !== null &&
          homeNumber + awayNumber > 0
        ) {
          homePercent =
            (homeNumber / (homeNumber + awayNumber)) * 100;
          awayPercent =
            (awayNumber / (homeNumber + awayNumber)) * 100;
        }

        return (
          <div
            key={`${type}-${index}`}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="min-w-0 text-xs font-semibold text-gray-400">
                {type}
              </span>

              <span className="shrink-0 text-xs font-bold text-white">
                {homeValue ?? "—"} — {awayValue ?? "—"}
              </span>
            </div>

            <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="bg-orange-500 transition-all"
                style={{ width: `${homePercent}%` }}
              />

              <div
                className="bg-gray-600 transition-all"
                style={{ width: `${awayPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatchEventsSummary({
  events,
  homeTeamId,
}: {
  events?: EventItem[];
  homeTeamId?: number;
}) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="text-sm font-semibold text-gray-300">
          No events recorded.
        </div>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => {
    const aTime = (a.time?.elapsed || 0) * 100 + (a.time?.extra || 0);
    const bTime = (b.time?.elapsed || 0) * 100 + (b.time?.extra || 0);

    return aTime - bTime;
  });

  return (
    <div className="space-y-2">
      {sortedEvents.map((event, index) => {
        const isHome = event.team?.id === homeTeamId;

        return (
          <div
            key={`${getEventKey(event)}-${index}`}
            className="grid grid-cols-[minmax(0,1fr)_60px_minmax(0,1fr)] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3"
          >
            <div
              className={`min-w-0 ${
                isHome ? "text-right" : "text-left"
              }`}
            >
              {isHome && (
                <>
                  <div className="break-words text-sm font-semibold text-white">
                    {event.player?.name || "Unknown"}
                  </div>

                  {event.assist?.name && (
                    <div className="mt-1 break-words text-[11px] text-gray-500">
                      Assist: {event.assist.name}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xs font-black text-orange-400">
                {event.time?.elapsed ?? "—"}
                {event.time?.extra ? `+${event.time.extra}` : ""}
            </div>

              <div className="mt-1 text-base">
                {getEventIcon(event)}
              </div>
            </div>

            <div className="min-w-0 text-left">
              {!isHome && (
                <>
                  <div className="break-words text-sm font-semibold text-white">
                    {event.player?.name || "Unknown"}
                  </div>

                  {event.assist?.name && (
                    <div className="mt-1 break-words text-[11px] text-gray-500">
                      Assist: {event.assist.name}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlayerRow({
  player,
}: {
  player: PlayerItem;
}) {
  const name = player.player?.name || "Unknown player";

  return (
    <div className="flex items-center gap-3 border-b border-white/5 px-3 py-3 last:border-0">
      {player.player?.photo ? (
        <img
          src={player.player.photo}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
          {player.games?.number || "—"}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="break-words text-sm font-semibold leading-5 text-white">
          {name}
        </div>

        <div className="mt-0.5 text-[10px] text-gray-500">
          {player.games?.position || "Player"}
          {player.games?.captain ? " • Captain" : ""}
        </div>
      </div>

      {player.games?.rating && (
        <div className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-xs font-bold text-orange-400">
          {player.games.rating}
        </div>
      )}
    </div>
  );
}

function LineupList({
  lineup,
}: {
  lineup: LineupItem;
}) {
  const startXI = lineup.startXI || [];
  const substitutes = lineup.substitutes || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center gap-3 border-b border-white/10 p-4">
        {lineup.team?.logo && (
          <img
            src={lineup.team.logo}
            alt=""
            className="h-9 w-9 shrink-0 object-contain"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="break-words text-sm font-bold text-white">
            {lineup.team?.name || "Team"}
          </div>

          {lineup.formation && (
            <div className="mt-1 text-xs text-gray-500">
              Formation: {lineup.formation}
            </div>
          )}
        </div>
      </div>

      <div className="px-1">
        {startXI.length > 0 && (
          <>
            <div className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-orange-400">
              Starting XI
            </div>

            {startXI.map((item, index) => (
              <PlayerRow
                key={`start-${item.player?.id || index}`}
                player={{
                  player: item.player,
                  games: item.games,
                }}
              />
            ))}
          </>
        )}

        {substitutes.length > 0 && (
          <>
            <div className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-orange-400">
              Substitutes
            </div>

            {substitutes.map((item, index) => (
              <PlayerRow
                key={`sub-${item.player?.id || index}`}
                player={{
                  player: item.player,
                  games: item.games,
                }}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function MatchLineupsSection({
  lineups,
}: {
  lineups?: LineupItem[];
}) {
  if (!lineups || lineups.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="text-sm font-semibold text-gray-300">
          Lineups are not available for this match.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {lineups.map((lineup, index) => (
        <LineupList
          key={lineup.team?.id || index}
          lineup={lineup}
        />
      ))}
    </div>
  );
}

export default function MatchDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("STATS");
  const [isFavorite, setIsFavorite] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const firstLoadRef = useRef(true);
  const knownEventsRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !id) return;

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);

      if (stored) {
        const favorites = JSON.parse(stored) as number[];

        setIsFavorite(
          favorites.map(String).includes(String(id))
        );
      }
    } catch (error) {
      console.error("Favorite read error:", error);
    }
  }, [id]);

  function getAudioContext() {
    if (typeof window === "undefined") return null;

    if (!audioContextRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as any).webkitAudioContext;

      if (!AudioCtx) return null;

      audioContextRef.current = new AudioCtx();
    }

    return audioContextRef.current;
  }

  function playEventSound(event: EventItem) {
    if (!soundEnabled) return;

    const context = getAudioContext();

    if (!context) return;

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const type = event.type?.toLowerCase() || "";
    const detail = event.detail?.toLowerCase() || "";

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime;

    if (type === "goal") {
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(700, now);
      oscillator.frequency.setValueAtTime(1000, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      oscillator.start(now);
      oscillator.stop(now + 0.6);

      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance("GOAL!");
        speech.volume = 0.8;
        speech.rate = 0.9;
        window.speechSynthesis.speak(speech);
      }

      return;
    }

    if (type === "card") {
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(
        detail.includes("red") ? 250 : 500,
        now
      );

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      oscillator.start(now);
      oscillator.stop(now + 0.25);

      return;
    }

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    oscillator.start(now);
    oscillator.stop(now + 0.25);
  }

  function toggleFavorite() {
    if (!id || typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);

      let favorites: number[] = stored
        ? JSON.parse(stored)
        : [];

      const numericId = Number(id);

      if (favorites.includes(numericId)) {
        favorites = favorites.filter(
          (favoriteId) => favoriteId !== numericId
        );

        setIsFavorite(false);
      } else {
        favorites.push(numericId);

        setIsFavorite(true);

        const context = getAudioContext();

        if (context?.state === "suspended") {
          context.resume().catch(() => {});
        }
      }

      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error("Favorite update error:", error);
    }
  }

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadMatchDetail() {
      try {
        const response = await fetch(`/api/fixtures/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load match data");
        }

        const data = await response.json();

        if (cancelled) return;

        if (data.response && data.response.length > 0) {
          const newMatch: MatchDetail = data.response[0];

          const currentEvents = newMatch.events || [];

          if (firstLoadRef.current) {
            knownEventsRef.current = new Set(
              currentEvents.map(getEventKey)
            );

            firstLoadRef.current = false;
          } else {
            const newEvents = currentEvents.filter(
              (event) =>
                !knownEventsRef.current.has(
                  getEventKey(event)
                )
            );

            if (newEvents.length > 0 && isFavorite && soundEnabled) {
              const importantEvents = newEvents.filter(
                (event) => {
                  const type =
                    event.type?.toLowerCase() || "";

                  const detail =
                    event.detail?.toLowerCase() || "";

                  return (
                    type === "goal" ||
                    type === "card" ||
                    type === "var" ||
                    detail.includes("penalty")
                  );
                }
              );

              importantEvents.forEach((event, index) => {
                setTimeout(() => {
                  playEventSound(event);
                }, index * 1200);
              });
            }
          }

          currentEvents.forEach((event) => {
            knownEventsRef.current.add(
              getEventKey(event)
            );
          });

          setMatch(newMatch);
        } else {
          setMatch(null);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading match detail:", error);

        if (!cancelled) {
          setMatch(null);
          setLoading(false);
        }
      }
    }

    loadMatchDetail();

    const interval = setInterval(
      loadMatchDetail,
      30000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, isFavorite, soundEnabled]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07100d]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />
      </main>
    );
  }

  if (!match) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07100d] px-4 text-white">
        <div className="text-center">
          <div className="mb-2 text-2xl font-black">
            Match Not Found
          </div>

          <div className="mb-6 text-sm text-gray-500">
            This match could not be loaded.
          </div>

          <Link
            href="/matches"
            className="inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-orange-400"
          >
            Back to Matches
          </Link>
        </div>
      </main>
    );
  }

  const status = match.fixture?.status?.short || "";

  const isLive = LIVE_STATUSES.includes(status);
  const isFinished = FINISHED_STATUSES.includes(status);

  const matchDate = match.fixture?.date
    ? new Date(match.fixture.date)
    : null;

  const matchTime = matchDate
    ? matchDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const formattedDate = matchDate
    ? matchDate.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const statusText =
    isLive
      ? `${match.fixture?.status?.elapsed ?? ""}'`
      : isFinished
      ? "FULL TIME"
      : match.fixture?.status?.long || status || "UPCOMING";

  const homeTeam = match.teams?.home;
  const awayTeam = match.teams?.away;

  const homeScore = match.goals?.home;
  const awayScore = match.goals?.away;

  const scoreAvailable =
    homeScore !== null &&
    homeScore !== undefined &&
    awayScore !== null &&
    awayScore !== undefined;

  return (
    <main className="min-h-screen bg-[#07100d] text-white">
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-5 sm:py-6">
        {/* HEADER */}
        <header className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/matches"
            className="min-w-0"
          >
            <div className="text-xl font-black tracking-tight sm:text-2xl">
              <span className="text-white">GoGoal</span>
              <span className="text-orange-500">Match</span>
            </div>

            <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-600">
              Live Football
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((value) => !value)}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold text-gray-300 transition hover:bg-white/[0.08]"
            >
              {soundEnabled ? "SOUND ON" : "SOUND OFF"}
            </button>

            <button
              type="button"
              onClick={toggleFavorite}
              aria-label={
                isFavorite
                  ? "Remove favorite"
                  : "Add favorite"
              }
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                isFavorite
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                  : "border-white/10 bg-white/[0.04] text-gray-400"
              }`}
            >
              {isFavorite ? "★" : "☆"}
            </button>
          </div>
        </header>

        {/* BREADCRUMB */}
        <div className="mb-3 flex items-center gap-2 overflow-hidden text-xs text-gray-500">
          <Link
            href="/matches"
            className="shrink-0 hover:text-white"
          >
            Matches
          </Link>

          <span>›</span>

          <span className="min-w-0 truncate">
            {match.league?.name || "Football"}
          </span>
        </div>

        {/* SCOREBOARD */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1713] shadow-2xl">
          <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />

          <div className="p-4 sm:p-6">
            {/* LEAGUE */}
            <div className="mb-5 flex items-center justify-center gap-2">
              {match.league?.logo && (
                <img
                  src={match.league.logo}
                  alt=""
                  className="h-7 w-7 shrink-0 object-contain"
                />
              )}

              <div className="min-w-0 text-center">
                <div className="break-words text-sm font-bold text-white">
                  {match.league?.name || "Football"}
                </div>

                <div className="text-[10px] text-gray-500">
                  {match.league?.country || ""}
                </div>
              </div>
            </div>

            {/* STATUS */}
            <div className="mb-5 flex justify-center">
              <div
                className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                  isLive
                    ? "bg-orange-500/15 text-orange-400"
                    : isFinished
                    ? "bg-white/10 text-gray-400"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                {statusText}
              </div>
            </div>

            {/* TEAMS + SCORE */}
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 sm:gap-6">
              {/* HOME */}
              <div className="min-w-0 text-center">
                <div className="mb-3 flex justify-center">
                  {homeTeam?.logo ? (
                    <img
                      src={homeTeam.logo}
                      alt=""
                      className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-white/10 sm:h-16 sm:w-16" />
                  )}
                </div>

                {/* IMPORTANT: NO TRUNCATE */}
                <div className="mx-auto max-w-[150px] break-words whitespace-normal text-xs font-bold leading-5 text-white sm:max-w-[220px] sm:text-lg sm:leading-6">
                  {homeTeam?.name || "Home Team"}
                </div>

                <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-600">
                  HOME
                </div>
              </div>

              {/* SCORE */}
              <div className="flex min-w-[64px] flex-col items-center justify-center pt-12 sm:min-w-[90px]">
                {scoreAvailable ? (
                  <div className="text-3xl font-black tracking-tight sm:text-5xl">
                    {homeScore}
                    <span className="mx-1 text-gray-600 sm:mx-2">
                      -
                    </span>
                    {awayScore}
                  </div>
                ) : (
                  <div className="text-xl font-black text-gray-300 sm:text-2xl">
                    {matchTime}
                  </div>
                )}
              </div>

              {/* AWAY */}
              <div className="min-w-0 text-center">
                <div className="mb-3 flex justify-center">
                  {awayTeam?.logo ? (
                    <img
                      src={awayTeam.logo}
                      alt=""
                      className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-white/10 sm:h-16 sm:w-16" />
                  )}
                </div>

                {/* IMPORTANT: NO TRUNCATE */}
                <div className="mx-auto max-w-[150px] break-words whitespace-normal text-xs font-bold leading-5 text-white sm:max-w-[220px] sm:text-lg sm:leading-6">
                  {awayTeam?.name || "Away Team"}
                </div>

                <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-600">
                  AWAY
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAVORITE NOTICE */}
        {isFavorite && (
          <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/[0.06] px-4 py-3 text-center text-[11px] text-orange-300">
            This match is in your favorites. You will receive
            sound alerts for important live events.
          </div>
        )}

        {/* INFO */}
        <section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoCard label="Date" value={formattedDate} />
          <InfoCard label="Kick-off" value={matchTime} />
          <InfoCard
            label="Venue"
            value={match.fixture?.venue?.name || "—"}
          />
          <InfoCard
            label="Referee"
            value={match.fixture?.referee || "—"}
          />
        </section>

        {/* TABS */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1713]">
          <div className="flex border-b border-white/10">
            <TabNavButton
              active={activeTab === "STATS"}
              onClick={() => setActiveTab("STATS")}
            >
              STATISTICS
            </TabNavButton>

            <TabNavButton
              active={activeTab === "SUMMARY"}
              onClick={() => setActiveTab("SUMMARY")}
            >
              SUMMARY & EVENTS
            </TabNavButton>

            <TabNavButton
              active={activeTab === "LINEUPS"}
              onClick={() => setActiveTab("LINEUPS")}
            >
              LINEUPS
            </TabNavButton>
          </div>

          <div className="p-3 sm:p-5">
            {activeTab === "STATS" && (
              <MatchStatisticsSection
                statistics={match.statistics}
              />
            )}

            {activeTab === "SUMMARY" && (
              <MatchEventsSummary
                events={match.events}
                homeTeamId={homeTeam?.id}
              />
            )}

            {activeTab === "LINEUPS" && (
              <MatchLineupsSection
                lineups={match.lineups}
              />
            )}
          </div>
        </section>

        <div className="py-6 text-center text-[10px] text-gray-700">
          GoGoalMatch • Live Football Scores & Statistics
        </div>
      </div>
    </main>
  );
}
