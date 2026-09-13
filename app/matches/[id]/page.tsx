"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type EventItem = {
  time: {
    elapsed: number;
    extra?: number;
  };
  team: {
    id: number;
    name: string;
  };
  player?: {
    name?: string;
  };
  assist?: {
    name?: string;
  };
  type: string;
  detail: string;
};

type StatItem = {
  type: string;
  value: number | string | null;
};

type TeamStats = {
  team: {
    id: number;
    name: string;
  };
  statistics: StatItem[];
};

type PlayerItem = {
  id: number;
  name: string;
  number: number;
  pos: string;
};

type LineupItem = {
  team: {
    id: number;
    name: string;
  };
  formation: string;
  startXI: Array<{
    player: PlayerItem;
  }>;
  substitutes: Array<{
    player: PlayerItem;
  }>;
};

type MatchDetail = {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
    venue?: {
      name?: string | null;
      city?: string | null;
    };
    referee?: string | null;
  };
  league: {
    name: string;
    country: string;
    logo: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
  events?: EventItem[];
  statistics?: TeamStats[];
  lineups?: LineupItem[];
};

const LIVE_STATUSES = ["1H", "2H", "HT", "ET", "BT", "P"];
const FINISHED_STATUSES = ["FT", "AET", "PEN"];

type SubTab = "SUMMARY" | "STATS" | "LINEUPS";

const FAVORITES_KEY = "ggm_favorites";

/* =========================================================
   SOUND ENGINE
   No external audio files are required.
   ========================================================= */

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioContextClass) return null;

    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.12,
  startDelay = 0
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startDelay);
  gain.gain.exponentialRampToValueAtTime(
    volume,
    ctx.currentTime + startDelay + 0.02
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + startDelay + duration
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(ctx.currentTime + startDelay);
  oscillator.stop(ctx.currentTime + startDelay + duration + 0.05);
}

function playWhistleSound() {
  playTone(2100, 0.18, "sine", 0.16);
  playTone(2500, 0.22, "sine", 0.14, 0.18);
  playTone(2100, 0.18, "sine", 0.16, 0.42);
}

function playYellowCardSound() {
  playTone(850, 0.12, "square", 0.08);
  playTone(1100, 0.12, "square", 0.07, 0.14);
}

function playRedCardSound() {
  playWhistleSound();
  playTone(350, 0.35, "sawtooth", 0.07, 0.65);
}

function playPenaltySound() {
  playWhistleSound();
  playTone(1300, 0.15, "sine", 0.09, 0.55);
}

function playGoalSound() {
  const ctx = getAudioContext();

  if (ctx) {
    // Stadium-style rising goal sequence.
    playTone(523, 0.18, "sawtooth", 0.09);
    playTone(659, 0.18, "sawtooth", 0.09, 0.16);
    playTone(784, 0.22, "sawtooth", 0.10, 0.32);
    playTone(1047, 0.40, "sawtooth", 0.12, 0.54);

    // Short "crowd" burst.
    for (let i = 0; i < 8; i++) {
      const frequency = 250 + Math.random() * 900;
      playTone(frequency, 0.12, "square", 0.025, 0.8 + i * 0.045);
    }
  }

  // Browser voice: GOAL!
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.setTimeout(() => {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance("GOAL!");
        utterance.rate = 0.72;
        utterance.pitch = 0.75;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore browser speech errors.
      }
    }, 850);
  }
}

function playEventSound(event: EventItem) {
  const type = event.type?.toLowerCase() || "";
  const detail = event.detail?.toLowerCase() || "";

  if (
    type === "goal" ||
    detail.includes("goal") ||
    detail.includes("penalty - scored")
  ) {
    playGoalSound();
    return;
  }

  if (type === "card") {
    if (detail.includes("red")) {
      playRedCardSound();
      return;
    }

    if (detail.includes("yellow")) {
      playYellowCardSound();
      return;
    }
  }

  if (type === "var" && detail.includes("penalty")) {
    playPenaltySound();
    return;
  }

  if (detail.includes("penalty")) {
    playPenaltySound();
  }
}

function getEventKey(event: EventItem) {
  return [
    event.time?.elapsed ?? 0,
    event.time?.extra ?? 0,
    event.team?.id ?? 0,
    event.player?.name ?? "",
    event.type ?? "",
    event.detail ?? "",
  ].join("|");
}

/* =========================================================
   PAGE
   ========================================================= */

export default function MatchDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SubTab>("STATS");
  const [isFavorite, setIsFavorite] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const firstLoadRef = useRef(true);
  const knownEventsRef = useRef<Set<string>>(new Set());

  /* =========================================================
     FAVORITE STATE
     ========================================================= */

  useEffect(() => {
    if (!id || typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);

      if (!stored) {
        setIsFavorite(false);
        return;
      }

      const favorites = JSON.parse(stored);

      if (Array.isArray(favorites)) {
        setIsFavorite(
          favorites.some((item) => String(item) === String(id))
        );
      }
    } catch {
      setIsFavorite(false);
    }
  }, [id]);

  function toggleFavorite() {
    if (!id || typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      let favorites: string[] = [];

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          favorites = parsed.map(String);
        }
      }

      const matchId = String(id);

      if (favorites.includes(matchId)) {
        favorites = favorites.filter((favoriteId) => favoriteId !== matchId);
        setIsFavorite(false);
      } else {
        favorites.push(matchId);
        setIsFavorite(true);

        // Unlock browser audio after a real user interaction.
        getAudioContext();
      }

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Favorite error:", error);
    }
  }

  /* =========================================================
     MATCH DATA + LIVE EVENT SOUND MONITOR
     ========================================================= */

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

          /*
           * On first load we only create the baseline.
           * This prevents old goals/cards from making a sound
           * immediately when the page opens.
           */
          const currentEvents = newMatch.events || [];

          if (firstLoadRef.current) {
            knownEventsRef.current = new Set(
              currentEvents.map(getEventKey)
            );

            firstLoadRef.current = false;
          } else if (isFavorite) {
            const newEvents = currentEvents.filter(
              (event) => !knownEventsRef.current.has(getEventKey(event))
            );

            if (newEvents.length > 0 && soundEnabled) {
              /*
               * Only important match events create sounds.
               */
              const importantEvents = newEvents.filter((event) => {
                const type = event.type?.toLowerCase() || "";
                const detail = event.detail?.toLowerCase() || "";

                return (
                  type === "goal" ||
                  type === "card" ||
                  type === "var" ||
                  detail.includes("penalty")
                );
              });

              importantEvents.forEach((event, index) => {
                window.setTimeout(() => {
                  playEventSound(event);
                }, index * 1200);
              });
            }
          }

          // Always update known events.
          currentEvents.forEach((event) => {
            knownEventsRef.current.add(getEventKey(event));
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

    const interval = setInterval(loadMatchDetail, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, isFavorite, soundEnabled]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Loading Match Center...
          </span>
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">
        <div className="mx-auto max-w-xl text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-orange-500 hover:underline mb-6"
          >
            ← Back to Matches
          </Link>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h1 className="text-xl font-black text-white">
              Match Not Found
            </h1>

            <p className="mt-2 text-xs text-slate-400">
              The requested match data could not be retrieved or is unavailable.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const status = match.fixture.status.short;
  const isLive = LIVE_STATUSES.includes(status);
  const isFinished = FINISHED_STATUSES.includes(status);

  const matchDate = new Date(match.fixture.date);

  const matchTime = matchDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const formattedDate = matchDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const statusText = isLive
    ? match.fixture.status.elapsed != null
      ? `${match.fixture.status.elapsed}'`
      : "LIVE"
    : isFinished
    ? "FULL TIME"
    : matchTime;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 font-black text-white">
              G
            </div>

            <div className="leading-none">
              <span className="text-base font-black tracking-tight text-white">
                GoGoal<span className="text-orange-500">Match</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* SOUND BUTTON */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled((value) => !value);
                getAudioContext();
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                soundEnabled
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                  : "border-slate-700 bg-slate-800 text-slate-400"
              }`}
              title={
                soundEnabled
                  ? "Match event sounds are ON"
                  : "Match event sounds are OFF"
              }
            >
              {soundEnabled ? "Sound ON" : "Sound OFF"}
            </button>

            {/* FAVORITE */}
            <button
              type="button"
              onClick={toggleFavorite}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                isFavorite
                  ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                  : "border-slate-700 bg-slate-800 text-slate-300"
              }`}
              title={
                isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              <span className="text-base leading-none">
                {isFavorite ? "★" : "☆"}
              </span>
            </button>

            <Link
              href="/"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              ← Matches
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="text-orange-500 hover:underline">
            Home
          </Link>

          <span>/</span>

          <span className="text-slate-300">{match.league.name}</span>
        </div>

        {/* Favorite Sound Notice */}
        {isFavorite && isLive && soundEnabled && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-2.5 text-[10px] font-bold text-orange-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
            LIVE ALERTS ACTIVE — goals, cards and penalties will play a sound.
          </div>
        )}

        {/* Main Scoreboard Card */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

          {/* League Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-5 py-3">
            <div className="flex items-center gap-3">
              {match.league.logo && (
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={match.league.logo}
                    alt={match.league.name}
                    style={{
                      width: "24px",
                      height: "24px",
                      maxWidth: "24px",
                      maxHeight: "24px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>
              )}

              <div>
                <div className="text-xs font-bold text-slate-200">
                  {match.league.name}
                </div>

                <div className="text-[10px] text-slate-400">
                  {match.league.country}
                </div>
              </div>
            </div>

            <div>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-[10px] font-black text-red-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  {statusText}
                </span>
              ) : isFinished ? (
                <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-[10px] font-black text-slate-400">
                  FINISHED
                </span>
              ) : (
                <span className="rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-[10px] font-black text-orange-400">
                  UPCOMING
                </span>
              )}
            </div>
          </div>

          {/* Teams & Score */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              {/* Home */}
              <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    minWidth: "56px",
                    maxWidth: "56px",
                    minHeight: "56px",
                    maxHeight: "56px",
                  }}
                  className="rounded-full bg-slate-800 p-2 border border-slate-700/50 flex items-center justify-center shrink-0 overflow-hidden"
                >
                  <img
                    src={match.teams.home.logo}
                    alt={match.teams.home.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "40px",
                      maxHeight: "40px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>

                <h2 className="mt-3 text-sm sm:text-lg font-black tracking-tight text-white">
                  {match.teams.home.name}
                </h2>

                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  HOME
                </span>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center px-2">
                {isLive || isFinished ? (
                  <>
                    <div className="flex items-center gap-2 text-4xl sm:text-6xl font-black text-white tracking-tight">
                      <span>{match.goals.home ?? 0}</span>
                      <span className="text-slate-600">:</span>
                      <span>{match.goals.away ?? 0}</span>
                    </div>

                    {match.score?.halftime?.home !== null && (
                      <div className="mt-2 text-[11px] font-bold text-slate-400">
                        HT: {match.score.halftime.home} -{" "}
                        {match.score.halftime.away}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      {matchTime}
                    </div>

                    <div className="text-[10px] font-semibold text-slate-400 mt-1">
                      {formattedDate}
                    </div>
                  </div>
                )}
              </div>

              {/* Away */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    minWidth: "56px",
                    maxWidth: "56px",
                    minHeight: "56px",
                    maxHeight: "56px",
                  }}
                  className="rounded-full bg-slate-800 p-2 border border-slate-700/50 flex items-center justify-center shrink-0 overflow-hidden"
                >
                  <img
                    src={match.teams.away.logo}
                    alt={match.teams.away.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxWidth: "40px",
                      maxHeight: "40px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </div>

                <h2 className="mt-3 text-sm sm:text-lg font-black tracking-tight text-white">
                  {match.teams.away.name}
                </h2>

                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  AWAY
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Match Info */}
        <section className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <InfoCard label="DATE" value={formattedDate} />
          <InfoCard label="KICK-OFF" value={matchTime} />

          <InfoCard
            label="VENUE"
            value={match.fixture.venue?.name || "N/A"}
            subValue={match.fixture.venue?.city || undefined}
          />

          <InfoCard
            label="REFEREE"
            value={match.fixture.referee || "N/A"}
          />
        </section>

        {/* Tabs */}
        <div className="mt-4 border-b border-slate-800 flex gap-2">
          <TabNavButton
            active={activeTab === "STATS"}
            onClick={() => setActiveTab("STATS")}
          >
            Statistics
          </TabNavButton>

          <TabNavButton
            active={activeTab === "SUMMARY"}
            onClick={() => setActiveTab("SUMMARY")}
          >
            Summary & Events
          </TabNavButton>

          <TabNavButton
            active={activeTab === "LINEUPS"}
            onClick={() => setActiveTab("LINEUPS")}
          >
            Lineups
          </TabNavButton>
        </div>

        {/* Content */}
        <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-xl">
          {activeTab === "STATS" && (
            <MatchStatisticsSection
              statistics={match.statistics || []}
              homeTeamName={match.teams.home.name}
              awayTeamName={match.teams.away.name}
            />
          )}

          {activeTab === "SUMMARY" && (
            <MatchEventsSummary
              events={match.events || []}
              homeId={match.teams.home.id}
            />
          )}

          {activeTab === "LINEUPS" && (
            <MatchLineupsSection
              lineups={match.lineups || []}
              homeId={match.teams.home.id}
            />
          )}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   INFO CARD
   ========================================================= */

function InfoCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
      <div className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
        {label}
      </div>

      <div className="mt-1 truncate text-xs font-bold text-slate-200">
        {value}
      </div>

      {subValue && (
        <div className="truncate text-[10px] text-slate-400">
          {subValue}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TAB BUTTON
   ========================================================= */

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
      className={`pb-3 px-4 text-xs font-black transition relative ${
        active
          ? "text-orange-500 border-b-2 border-orange-500"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   STATISTICS
   ========================================================= */

function MatchStatisticsSection({
  statistics,
  homeTeamName,
  awayTeamName,
}: {
  statistics: TeamStats[];
  homeTeamName: string;
  awayTeamName: string;
}) {
  if (!statistics || statistics.length < 2) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-semibold">
        Detailed statistics are not available for this match yet.
      </div>
    );
  }

  const homeStats = statistics[0]?.statistics || [];
  const awayStats = statistics[1]?.statistics || [];

  const combinedStats = homeStats.map((item) => {
    const awayItem = awayStats.find((s) => s.type === item.type);

    return {
      type: item.type,
      home: item.value,
      away: awayItem?.value ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs font-black text-slate-300 border-b border-slate-800 pb-3">
        <span className="w-1/3 truncate text-left">
          {homeTeamName}
        </span>

        <span className="w-1/3 text-center text-[10px] tracking-widest text-slate-400 uppercase">
          STATISTIC
        </span>

        <span className="w-1/3 truncate text-right">
          {awayTeamName}
        </span>
      </div>

      <div className="space-y-5">
        {combinedStats.map((stat, idx) => {
          const homeVal = parseStatValue(stat.home);
          const awayVal = parseStatValue(stat.away);
          const total = homeVal + awayVal || 1;

          const homePercent = Math.round((homeVal / total) * 100);
          const awayPercent = 100 - homePercent;

          const isHomeDominant = homeVal > awayVal;
          const isAwayDominant = awayVal > homeVal;

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span
                  className={
                    isHomeDominant
                      ? "text-orange-500 font-black"
                      : "text-slate-300"
                  }
                >
                  {stat.home ?? 0}
                </span>

                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  {formatStatLabel(stat.type)}
                </span>

                <span
                  className={
                    isAwayDominant
                      ? "text-orange-500 font-black"
                      : "text-slate-300"
                  }
                >
                  {stat.away ?? 0}
                </span>
              </div>

              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    isHomeDominant
                      ? "bg-orange-500"
                      : "bg-slate-600"
                  }`}
                  style={{ width: `${homePercent}%` }}
                />

                <div
                  className={`h-full transition-all duration-300 ${
                    isAwayDominant
                      ? "bg-orange-500"
                      : "bg-slate-700"
                  }`}
                  style={{ width: `${awayPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function parseStatValue(val: number | string | null): number {
  if (typeof val === "number") return val;

  if (typeof val === "string") {
    const parsed = parseFloat(val.replace("%", ""));
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function formatStatLabel(label: string): string {
  return label
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/* =========================================================
   EVENTS
   ========================================================= */

function getEventIcon(event: EventItem) {
  const type = event.type?.toLowerCase() || "";
  const detail = event.detail?.toLowerCase() || "";

  if (type === "goal") {
    if (detail.includes("penalty")) return "⚽";
    if (detail.includes("missed")) return "❌";
    if (detail.includes("own goal")) return "⚽";
    return "⚽";
  }

  if (type === "card") {
    if (detail.includes("red")) return "🟥";
    if (detail.includes("yellow")) return "🟨";
    return "🟨";
  }

  if (type === "subst") {
    return "🔄";
  }

  if (type === "var") {
    if (detail.includes("penalty")) return "⚽";
    return "📺";
  }

  if (detail.includes("penalty")) {
    return "⚽";
  }

  return "•";
}

function getEventTitle(event: EventItem) {
  const type = event.type?.toLowerCase() || "";
  const detail = event.detail?.toLowerCase() || "";

  if (type === "goal") {
    if (detail.includes("missed")) return "Penalty Missed";
    if (detail.includes("own goal")) return "Own Goal";
    if (detail.includes("penalty")) return "Penalty Goal";
    return "Goal";
  }

  if (type === "card") {
    if (detail.includes("red")) return "Red Card";
    if (detail.includes("yellow")) return "Yellow Card";
    return "Card";
  }

  if (type === "subst") {
    return "Substitution";
  }

  if (type === "var") {
    return "VAR";
  }

  if (detail.includes("penalty")) {
    return "Penalty";
  }

  return event.type || "Event";
}

function MatchEventsSummary({
  events,
  homeId,
}: {
  events: EventItem[];
  homeId: number;
}) {
  if (!events || events.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-semibold">
        No key events available for this match.
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => {
    const aTime =
      (a.time?.elapsed || 0) * 100 + (a.time?.extra || 0);

    const bTime =
      (b.time?.elapsed || 0) * 100 + (b.time?.extra || 0);

    return aTime - bTime;
  });

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
          Timeline Events
        </h3>
      </div>

      <div className="divide-y divide-slate-800/60">
        {sortedEvents.map((event, idx) => {
          const isHome = event.team.id === homeId;

          const timeDisplay = event.time.extra
            ? `${event.time.elapsed}+${event.time.extra}'`
            : `${event.time.elapsed}'`;

          const icon = getEventIcon(event);
          const title = getEventTitle(event);

          return (
            <div
              key={`${getEventKey(event)}-${idx}`}
              className="grid grid-cols-[1fr_76px_1fr] items-center py-3 text-xs"
            >
              {/* HOME */}
              <div className="text-right pr-3">
                {isHome && (
                  <div>
                    <div className="font-bold text-slate-100">
                      {event.player?.name || title}
                    </div>

                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {event.assist?.name
                        ? `Assist: ${event.assist.name}`
                        : title}
                    </div>
                  </div>
                )}
              </div>

              {/* CENTER */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-orange-500">
                  {timeDisplay}
                </span>

                <span className="mt-1 flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[12px] font-bold">
                  <span>{icon}</span>
                  <span className="text-[9px] text-slate-300">
                    {title}
                  </span>
                </span>
              </div>

              {/* AWAY */}
              <div className="text-left pl-3">
                {!isHome && (
                  <div>
                    <div className="font-bold text-slate-100">
                      {event.player?.name || title}
                    </div>

                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {event.assist?.name
                        ? `Assist: ${event.assist.name}`
                        : title}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   LINEUPS
   ========================================================= */

function MatchLineupsSection({
  lineups,
  homeId,
}: {
  lineups: LineupItem[];
  homeId: number;
}) {
  if (!lineups || lineups.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-semibold">
        Starting lineups are not yet available.
      </div>
    );
  }

  const homeLineup =
    lineups.find((l) => l.team.id === homeId) || lineups[0];

  const awayLineup =
    lineups.find((l) => l.team.id !== homeId) || lineups[1];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <LineupList
        teamTitle="HOME"
        lineup={homeLineup}
      />

      <LineupList
        teamTitle="AWAY"
        lineup={awayLineup}
      />
    </div>
  );
}

function LineupList({
  teamTitle,
  lineup,
}: {
  teamTitle: string;
  lineup?: LineupItem;
}) {
  if (!lineup) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <span className="text-[9px] font-black text-orange-500 tracking-wider">
            {teamTitle}
          </span>

          <h4 className="text-sm font-bold text-white">
            {lineup.team.name}
          </h4>
        </div>

        <span className="rounded bg-slate-800 px-2 py-1 text-[10px] font-black text-slate-300">
          {lineup.formation || "N/A"}
        </span>
      </div>

      <div className="space-y-1.5">
        {lineup.startXI?.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-1.5 text-xs border border-slate-800/60"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-black text-slate-300">
                {item.player.number || "-"}
              </span>

              <span className="font-semibold text-slate-200">
                {item.player.name}
              </span>
            </div>

            <span className="text-[10px] font-bold text-slate-500">
              {item.player.pos}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
