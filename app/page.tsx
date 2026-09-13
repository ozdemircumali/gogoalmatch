// app/page.tsx

"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Trophy,
  Search,
  Star,
  ChevronRight,
  RefreshCw,
  Menu,
  X,
  ChevronDown,
  Volume2,
  BellOff,
} from "lucide-react";
import { LEAGUES } from "../lib/leagues";

interface ApiTeam {
  id?: number;
  name?: string;
  logo?: string;
}

interface ApiLeague {
  id?: number;
  name?: string;
  country?: string;
  logo?: string;
}

interface ApiEvent {
  time?: {
    elapsed?: number | null;
    extra?: number | null;
  };
  team?: {
    id?: number;
    name?: string;
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
}

interface ApiFixture {
  fixture?: {
    id?: number;
    date?: string;
    timestamp?: number;
    status?: {
      long?: string;
      short?: string;
      elapsed?: number | null;
    };
  };
  league?: ApiLeague;
  teams?: {
    home?: ApiTeam;
    away?: ApiTeam;
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  };
  events?: ApiEvent[];
}

interface Match {
  id: string;
  minute: string;
  status: string;
  isLive: boolean;
  isFinished: boolean;
  isUpcoming: boolean;
  homeTeam: string;
  homeLogo: string;
  homeScore: number | string;
  awayTeam: string;
  awayLogo: string;
  awayScore: number | string;
  leagueId: string;
  leagueName: string;
  country: string;
}

type Filter =
  | "all"
  | "live"
  | "upcoming"
  | "finished"
  | "favorites";

type AlertType =
  | "goal"
  | "yellow"
  | "red"
  | "penalty"
  | "var";

interface AlertMessage {
  id: string;
  type: AlertType;
  title: string;
  text: string;
}

const LIVE_STATUSES = [
  "1H",
  "2H",
  "HT",
  "ET",
  "BT",
  "P",
];

const FINISHED_STATUSES = [
  "FT",
  "AET",
  "PEN",
];

const FAVORITES_KEY = "ggm_favorites";
const ALERTS_ENABLED_KEY = "ggm_alerts_enabled";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (audioContext) {
    return audioContext;
  }

  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    audioContext = new AudioContextClass();

    return audioContext;
  } catch (error) {
    console.error("Audio error:", error);
    return null;
  }
}

function playTone(
  frequency: number,
  duration: number,
  delay = 0,
  volume = 0.2,
  type: OscillatorType = "sine"
) {
  const ctx = getAudioContext();

  if (!ctx) {
    return;
  }

  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const start = ctx.currentTime + delay;
    const end = start + duration;

    gain.gain.setValueAtTime(
      0.0001,
      start
    );

    gain.gain.exponentialRampToValueAtTime(
      volume,
      start + 0.025
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      end
    );

    oscillator.start(start);
    oscillator.stop(end + 0.03);
  } catch (error) {
    console.error(
      "Tone playback error:",
      error
    );
  }
}

function playTestSound() {
  const ctx = getAudioContext();

  if (!ctx) {
    return;
  }

  /*
   * IMPORTANT:
   * The oscillators are created immediately
   * from the button interaction.
   */
  playTone(
    600,
    0.18,
    0,
    0.22,
    "sine"
  );

  playTone(
    800,
    0.18,
    0.22,
    0.22,
    "sine"
  );

  playTone(
    1000,
    0.28,
    0.44,
    0.24,
    "sine"
  );
}

function playGoalSound() {
  playTone(
    523,
    0.18,
    0,
    0.18,
    "sawtooth"
  );

  playTone(
    659,
    0.18,
    0.18,
    0.18,
    "sawtooth"
  );

  playTone(
    784,
    0.2,
    0.36,
    0.2,
    "sawtooth"
  );

  playTone(
    1047,
    0.5,
    0.56,
    0.22,
    "sawtooth"
  );
}

function playYellowSound() {
  playTone(
    880,
    0.15,
    0,
    0.16,
    "square"
  );

  playTone(
    660,
    0.2,
    0.18,
    0.14,
    "square"
  );
}

function playRedSound() {
  playTone(
    900,
    0.15,
    0,
    0.18,
    "sawtooth"
  );

  playTone(
    450,
    0.3,
    0.2,
    0.16,
    "sawtooth"
  );

  playTone(
    900,
    0.15,
    0.55,
    0.18,
    "sawtooth"
  );
}

function playPenaltySound() {
  playTone(
    1000,
    0.13,
    0,
    0.17,
    "square"
  );

  playTone(
    700,
    0.2,
    0.18,
    0.15,
    "square"
  );

  playTone(
    1000,
    0.13,
    0.45,
    0.17,
    "square"
  );
}

function playVarSound() {
  playTone(
    660,
    0.14,
    0,
    0.14,
    "triangle"
  );

  playTone(
    880,
    0.14,
    0.17,
    0.14,
    "triangle"
  );
}

function playAlertSound(type: AlertType) {
  if (type === "goal") {
    playGoalSound();
  } else if (type === "yellow") {
    playYellowSound();
  } else if (type === "red") {
    playRedSound();
  } else if (type === "penalty") {
    playPenaltySound();
  } else if (type === "var") {
    playVarSound();
  }
}

function convertFixture(
  fixture: ApiFixture
): Match | null {
  const id = fixture.fixture?.id;

  if (!id) {
    return null;
  }

  const status =
    fixture.fixture?.status?.short ||
    "NS";

  const elapsed =
    fixture.fixture?.status?.elapsed;

  const home = fixture.teams?.home;
  const away = fixture.teams?.away;

  const isLive =
    LIVE_STATUSES.includes(status);

  const isFinished =
    FINISHED_STATUSES.includes(status);

  let minute = "";

  if (isLive) {
    if (status === "HT") {
      minute = "HT";
    } else if (status === "BT") {
      minute = "BT";
    } else if (status === "P") {
      minute = "P";
    } else if (
      elapsed !== null &&
      elapsed !== undefined
    ) {
      minute = `${elapsed}'`;
    } else {
      minute = "LIVE";
    }
  } else if (isFinished) {
    minute = "FT";
  } else if (fixture.fixture?.date) {
    minute = new Date(
      fixture.fixture.date
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    minute = status;
  }

  return {
    id: String(id),
    minute,
    status,
    isLive,
    isFinished,
    isUpcoming:
      !isLive && !isFinished,

    homeTeam:
      home?.name || "Home",
    homeLogo:
      home?.logo || "",
    homeScore:
      fixture.goals?.home ??
      "-",

    awayTeam:
      away?.name || "Away",
    awayLogo:
      away?.logo || "",
    awayScore:
      fixture.goals?.away ??
      "-",

    leagueId: String(
      fixture.league?.id ||
        "unknown"
    ),

    leagueName:
      fixture.league?.name ||
      "Unknown League",

    country:
      fixture.league?.country ||
      "",
  };
}

function getEventKey(
  event: ApiEvent
): string {
  return [
    event.time?.elapsed ?? "",
    event.time?.extra ?? "",
    event.team?.id ?? "",
    event.player?.id ??
      event.player?.name ??
      "",
    event.type ?? "",
    event.detail ?? "",
    event.comments ?? "",
  ].join("|");
}

function getAlertType(
  event: ApiEvent
): AlertType | null {
  const type =
    event.type?.toLowerCase() || "";

  const detail =
    event.detail?.toLowerCase() || "";

  if (type === "goal") {
    if (
      detail.includes("missed")
    ) {
      return null;
    }

    return "goal";
  }

  if (type === "card") {
    if (
      detail.includes("red")
    ) {
      return "red";
    }

    return "yellow";
  }

  if (type === "var") {
    if (
      detail.includes("penalty")
    ) {
      return "penalty";
    }

    return "var";
  }

  if (
    detail.includes("penalty")
  ) {
    return "penalty";
  }

  return null;
}

function getEventTitle(
  type: AlertType
) {
  if (type === "goal") {
    return "GOAL!";
  }

  if (type === "yellow") {
    return "YELLOW CARD";
  }

  if (type === "red") {
    return "RED CARD";
  }

  if (type === "penalty") {
    return "PENALTY";
  }

  return "VAR";
}

function getEventIcon(
  type: AlertType
) {
  if (type === "goal") {
    return "⚽";
  }

  if (type === "yellow") {
    return "🟨";
  }

  if (type === "red") {
    return "🟥";
  }

  if (type === "penalty") {
    return "⚽";
  }

  return "📺";
}

export default function HomePage() {
  const [matches, setMatches] =
    useState<Match[]>([]);

  const [filter, setFilter] =
    useState<Filter>("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [favorites, setFavorites] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [openCountry, setOpenCountry] =
    useState<string | null>(null);

  const [selectedLeagueId, setSelectedLeagueId] =
    useState<string | null>(null);

  const [alertsEnabled, setAlertsEnabled] =
    useState(false);

  const [alertMessage, setAlertMessage] =
    useState<AlertMessage | null>(null);

  const knownEventsRef =
    useRef<
      Map<string, Set<string>>
    >(new Map());

  const previousScoresRef =
    useRef<Map<string, string>>(
      new Map()
    );

  const initializedMatchesRef =
    useRef<Set<string>>(new Set());

  const alertsEnabledRef =
    useRef(false);

  const loadMatches =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/fixtures",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status}`
          );
        }

        const data =
          await response.json();

        const fixtures: ApiFixture[] =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.response
              )
            ? data.response
            : [];

        const converted =
          fixtures
            .map(convertFixture)
            .filter(
              (
                match
              ): match is Match =>
                match !== null
            );

        setMatches(converted);
      } catch (err) {
        console.error(
          "Fixtures error:",
          err
        );

        setError(
          "Unable to load matches."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  const showAlert =
    useCallback(
      (alert: AlertMessage) => {
        setAlertMessage(alert);

        window.setTimeout(() => {
          setAlertMessage(
            (current) =>
              current?.id ===
              alert.id
                ? null
                : current
          );
        }, 6000);
      },
      []
    );

  const sendBrowserNotification =
    useCallback(
      (alert: AlertMessage) => {
        if (
          typeof window ===
            "undefined" ||
          !("Notification" in window)
        ) {
          return;
        }

        if (
          Notification.permission !==
          "granted"
        ) {
          return;
        }

        try {
          new Notification(
            `${getEventIcon(
              alert.type
            )} ${alert.title}`,
            {
              body: alert.text,
              icon: "/favicon.ico",
            }
          );
        } catch {}
      },
      []
    );

  /*
   * FIXED ALERT BUTTON
   *
   * No await before the test sound.
   * The sound starts directly from the
   * user's button tap.
   */
  const enableAlerts = () => {
    const ctx =
      getAudioContext();

    if (ctx) {
      /*
       * Resume immediately.
       */
      if (
        ctx.state ===
        "suspended"
      ) {
        void ctx.resume();
      }

      /*
       * Start the test sound
       * immediately.
       */
      playTestSound();
    }

    alertsEnabledRef.current =
      true;

    setAlertsEnabled(true);

    try {
      localStorage.setItem(
        ALERTS_ENABLED_KEY,
        "true"
      );
    } catch {}

    /*
     * Notification permission is
     * deliberately requested AFTER
     * the audio has been started.
     */
    if (
      typeof window !==
        "undefined" &&
      "Notification" in window
    ) {
      window.setTimeout(() => {
        if (
          Notification.permission ===
          "default"
        ) {
          Notification.requestPermission().catch(
            () => {}
          );
        }
      }, 100);
    }
  };

  const disableAlerts = () => {
    alertsEnabledRef.current =
      false;

    setAlertsEnabled(false);

    try {
      localStorage.setItem(
        ALERTS_ENABLED_KEY,
        "false"
      );
    } catch {}
  };

  const checkFavoriteMatchAlerts =
    useCallback(async () => {
      if (
        favorites.length === 0
      ) {
        return;
      }

      const favoriteMatches =
        matches.filter(
          (match) =>
            favorites.includes(
              match.id
            ) &&
            match.isLive
        );

      if (
        favoriteMatches.length ===
        0
      ) {
        return;
      }

      await Promise.all(
        favoriteMatches.map(
          async (match) => {
            try {
              const response =
                await fetch(
                  `/api/fixtures/${match.id}`,
                  {
                    cache:
                      "no-store",
                  }
                );

              if (
                !response.ok
              ) {
                return;
              }

              const data =
                await response.json();

              const detail:
                | ApiFixture
                | undefined =
                Array.isArray(
                  data?.response
                )
                  ? data.response[0]
                  : undefined;

              if (!detail) {
                return;
              }

              const events =
                Array.isArray(
                  detail.events
                )
                  ? detail.events
                  : [];

              const currentKeys =
                new Set(
                  events.map(
                    getEventKey
                  )
                );

              const known =
                knownEventsRef.current.get(
                  match.id
                );

              /*
               * First check:
               * establish baseline.
               */
              if (!known) {
                knownEventsRef.current.set(
                  match.id,
                  currentKeys
                );

                previousScoresRef.current.set(
                  match.id,
                  `${detail.goals?.home ?? "-"}-${detail.goals?.away ?? "-"}`
                );

                initializedMatchesRef.current.add(
                  match.id
                );

                return;
              }

              const newEvents =
                events.filter(
                  (event) =>
                    !known.has(
                      getEventKey(
                        event
                      )
                    )
                );

              const currentScore =
                `${detail.goals?.home ?? "-"}-${detail.goals?.away ?? "-"}`;

              const previousScore =
                previousScoresRef.current.get(
                  match.id
                );

              const scoreChanged =
                previousScore !==
                  undefined &&
                previousScore !==
                  currentScore;

              previousScoresRef.current.set(
                match.id,
                currentScore
              );

              for (const event of newEvents) {
                const type =
                  getAlertType(event);

                if (!type) {
                  continue;
                }

                const minute =
                  event.time?.elapsed !==
                    null &&
                  event.time?.elapsed !==
                    undefined
                    ? ` · ${event.time.elapsed}'`
                    : "";

                let text =
                  `${match.homeTeam} ${detail.goals?.home ?? "-"} - ${detail.goals?.away ?? "-"} ${match.awayTeam}`;

                if (
                  type === "goal" &&
                  event.player?.name
                ) {
                  text += ` · ${event.player.name}${minute}`;
                }

                if (
                  type ===
                    "yellow" ||
                  type === "red"
                ) {
                  text =
                    `${
                      event.player
                        ?.name ||
                      "Player"
                    }${minute}`;
                }

                if (
                  type ===
                    "penalty" ||
                  type === "var"
                ) {
                  text =
                    `${match.homeTeam} vs ${match.awayTeam}${minute}`;
                }

                const alert: AlertMessage =
                  {
                    id: `${match.id}-${getEventKey(event)}`,
                    type,
                    title:
                      getEventTitle(
                        type
                      ),
                    text,
                  };

                showAlert(alert);

                if (
                  alertsEnabledRef.current
                ) {
                  playAlertSound(
                    type
                  );

                  sendBrowserNotification(
                    alert
                  );
                }
              }

              /*
               * Score fallback.
               */
              if (
                scoreChanged &&
                newEvents.length ===
                  0
              ) {
                const alert: AlertMessage =
                  {
                    id: `${match.id}-${currentScore}-${Date.now()}`,
                    type: "goal",
                    title: "GOAL!",
                    text: `${match.homeTeam} ${currentScore.replace(
                      "-",
                      " - "
                    )} ${match.awayTeam}`,
                  };

                showAlert(alert);

                if (
                  alertsEnabledRef.current
                ) {
                  playGoalSound();

                  sendBrowserNotification(
                    alert
                  );
                }
              }

              currentKeys.forEach(
                (key) =>
                  known.add(key)
              );
            } catch (error) {
              console.error(
                "Alert check error:",
                error
              );
            }
          }
        )
      );
    }, [
      favorites,
      matches,
      sendBrowserNotification,
      showAlert,
    ]);

  useEffect(() => {
    loadMatches();

    const interval =
      window.setInterval(
        loadMatches,
        30000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [loadMatches]);

  useEffect(() => {
    try {
      const savedFavorites =
        localStorage.getItem(
          FAVORITES_KEY
        );

      if (savedFavorites) {
        setFavorites(
          JSON.parse(
            savedFavorites
          )
        );
      }

      const savedAlerts =
        localStorage.getItem(
          ALERTS_ENABLED_KEY
        );

      if (
        savedAlerts === "true"
      ) {
        alertsEnabledRef.current =
          true;

        setAlertsEnabled(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (
      favorites.length === 0
    ) {
      return;
    }

    checkFavoriteMatchAlerts();

    const interval =
      window.setInterval(
        checkFavoriteMatchAlerts,
        30000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [
    favorites,
    checkFavoriteMatchAlerts,
  ]);

  const toggleFavorite = (
    matchId: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setFavorites(
      (previous) => {
        const next =
          previous.includes(matchId)
            ? previous.filter(
                (id) =>
                  id !== matchId
              )
            : [
                ...previous,
                matchId,
              ];

        try {
          localStorage.setItem(
            FAVORITES_KEY,
            JSON.stringify(
              next
            )
          );
        } catch {}

        return next;
      }
    );
  };

  const countries = useMemo(() => {
    const map = new Map<
      string,
      typeof LEAGUES
    >();

    LEAGUES.forEach(
      (league) => {
        if (
          !map.has(
            league.country
          )
        ) {
          map.set(
            league.country,
            []
          );
        }

        map
          .get(
            league.country
          )!
          .push(league);
      }
    );

    return Array.from(
      map.entries()
    );
  }, []);

  const selectedLeague =
    useMemo(
      () =>
        LEAGUES.find(
          (league) =>
            String(
              league.id
            ) ===
            selectedLeagueId
        ) || null,
      [selectedLeagueId]
    );

  const filteredMatches =
    useMemo(() => {
      let result = matches;

      if (
        selectedLeagueId
      ) {
        result =
          result.filter(
            (match) =>
              match.leagueId ===
              selectedLeagueId
          );
      }

      if (
        filter === "live"
      ) {
        result =
          result.filter(
            (m) => m.isLive
          );
      }

      if (
        filter === "upcoming"
      ) {
        result =
          result.filter(
            (m) =>
              m.isUpcoming
          );
      }

      if (
        filter === "finished"
      ) {
        result =
          result.filter(
            (m) =>
              m.isFinished
          );
      }

      if (
        filter === "favorites"
      ) {
        result =
          result.filter(
            (m) =>
              favorites.includes(
                m.id
              )
          );
      }

      if (
        searchQuery.trim()
      ) {
        const search =
          searchQuery.toLowerCase();

        result =
          result.filter(
            (m) =>
              m.homeTeam
                .toLowerCase()
                .includes(
                  search
                ) ||
              m.awayTeam
                .toLowerCase()
                .includes(
                  search
                ) ||
              m.leagueName
                .toLowerCase()
                .includes(
                  search
                ) ||
              m.country
                .toLowerCase()
                .includes(
                  search
                )
          );
      }

      return result;
    }, [
      matches,
      selectedLeagueId,
      filter,
      favorites,
      searchQuery,
    ]);

  const groupedLeagues =
    useMemo(() => {
      const map = new Map<
        string,
        Match[]
      >();

      filteredMatches.forEach(
        (match) => {
          const key =
            `${match.leagueId}-${match.leagueName}`;

          if (!map.has(key)) {
            map.set(
              key,
              []
            );
          }

          map
            .get(key)!
            .push(match);
        }
      );

      return Array.from(
        map.entries()
      ).map(
        ([id, leagueMatches]) => ({
          id,
          name:
            leagueMatches[0]
              .leagueName,
          country:
            leagueMatches[0]
              .country,
          matches:
            leagueMatches,
        })
      );
    }, [filteredMatches]);

  const liveCount =
    matches.filter(
      (m) => m.isLive
    ).length;

  const selectLeague = (
    id: number
  ) => {
    setSelectedLeagueId(
      String(id)
    );

    setFilter("all");
    setMenuOpen(false);
    setOpenCountry(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const showAllMatches = () => {
    setSelectedLeagueId(null);
    setFilter("all");
    setMenuOpen(false);
    setOpenCountry(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100">
      {alertMessage && (
        <div className="fixed top-20 right-4 z-[200] w-[340px] max-w-[calc(100vw-32px)]">
          <div className="bg-[#111827] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1 bg-emerald-500" />

            <div className="p-4 flex gap-3 items-start">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl shrink-0">
                {getEventIcon(
                  alertMessage.type
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-black text-emerald-400">
                  {
                    alertMessage.title
                  }
                </div>

                <div className="text-sm font-semibold text-white mt-1">
                  {
                    alertMessage.text
                  }
                </div>
              </div>

              <button
                onClick={() =>
                  setAlertMessage(
                    null
                  )
                }
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#121721]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setMenuOpen(true)
              }
              className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl">
              G
            </div>

            <span className="text-xl font-bold">
              GoGoal
              <span className="text-emerald-400">
                Match
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

              <input
                value={
                  searchQuery
                }
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Search team or league..."
                className="w-64 bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={
                alertsEnabled
                  ? disableAlerts
                  : enableAlerts
              }
              className={`h-9 px-3 rounded-lg border flex items-center gap-2 ${
                alertsEnabled
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                  : "bg-slate-900 border-slate-800 text-slate-400"
              }`}
            >
              {alertsEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}

              <span className="text-[10px] font-bold hidden sm:block">
                {alertsEnabled
                  ? "ALERTS ON"
                  : "ALERTS OFF"}
              </span>
            </button>

            <button
              onClick={
                loadMatches
              }
              className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

            <div className="px-3 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE {liveCount}
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[100]"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          <div className="absolute inset-0 bg-black/70" />

          <aside
            className="absolute left-0 top-0 h-full w-[330px] max-w-[88vw] bg-[#10151f] border-r border-slate-800 overflow-y-auto"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="sticky top-0 bg-[#10151f] border-b border-slate-800">
              <div className="h-16 px-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">
                    Football Leagues
                  </span>
                </div>

                <button
                  onClick={() =>
                    setMenuOpen(
                      false
                    )
                  }
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={
                  showAllMatches
                }
                className={`w-full px-5 py-3 text-left text-sm font-semibold ${
                  !selectedLeagueId
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-slate-300"
                }`}
              >
                All Matches
              </button>
            </div>

            <div className="p-3">
              {countries.map(
                ([
                  country,
                  countryLeagues,
                ]) => {
                  const isOpen =
                    openCountry ===
                    country;

                  return (
                    <div
                      key={country}
                    >
                      <button
                        onClick={() =>
                          setOpenCountry(
                            isOpen
                              ? null
                              : country
                          )
                        }
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-900 rounded-xl"
                      >
                        <span className="text-sm font-semibold">
                          {country}
                        </span>

                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 ${
                            isOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="ml-3 border-l border-slate-800">
                          {countryLeagues.map(
                            (league) => (
                              <button
                                key={`${country}-${league.id}`}
                                onClick={() =>
                                  selectLeague(
                                    league.id
                                  )
                                }
                                className={`w-full px-4 py-2.5 text-left text-sm ${
                                  selectedLeagueId ===
                                  String(
                                    league.id
                                  )
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                {
                                  league.name
                                }
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </aside>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {selectedLeague && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">
                Selected League
              </div>

              <div className="font-bold">
                {
                  selectedLeague.name
                }
              </div>

              <div className="text-xs text-slate-400">
                {
                  selectedLeague.country
                }
              </div>
            </div>

            <button
              onClick={
                showAllMatches
              }
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
            >
              Show All
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-[#121721] border border-slate-800 rounded-xl p-4 sticky top-24">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">
                Today's Leagues
              </h3>

              <div className="space-y-1">
                {groupedLeagues.map(
                  (league) => (
                    <div
                      key={
                        league.id
                      }
                      className="px-3 py-2 rounded-lg hover:bg-slate-800"
                    >
                      <div className="text-sm font-medium truncate">
                        {
                          league.name
                        }
                      </div>

                      <div className="text-[11px] text-slate-500">
                        {
                          league.country
                        }{" "}
                        ·{" "}
                        {
                          league.matches
                            .length
                        }
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-4 space-y-4">
            <div className="bg-[#121721] border border-slate-800 rounded-xl p-2 flex items-center gap-1 overflow-x-auto">
              {(
                [
                  [
                    "all",
                    `All (${matches.length})`,
                  ],
                  [
                    "live",
                    `Live (${liveCount})`,
                  ],
                  [
                    "upcoming",
                    "Upcoming",
                  ],
                  [
                    "finished",
                    "Finished",
                  ],
                  [
                    "favorites",
                    "Favorites",
                  ],
                ] as [
                  Filter,
                  string
                ][]
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <button
                    key={value}
                    onClick={() =>
                      setFilter(
                        value
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      filter ===
                      value
                        ? "bg-emerald-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {value ===
                      "favorites" && (
                      <Star className="w-3.5 h-3.5 inline mr-1" />
                    )}

                    {label}
                  </button>
                )
              )}
            </div>

            {loading &&
              matches.length ===
                0 && (
                <div className="bg-[#121721] border border-slate-800 rounded-xl p-10 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />

                  <p className="text-sm text-slate-400">
                    Loading
                    matches...
                  </p>
                </div>
              )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center text-red-400 text-sm">
                {error}
              </div>
            )}

            {!loading &&
              !error &&
              filteredMatches.length ===
                0 && (
                <div className="bg-[#121721] border border-slate-800 rounded-xl p-10 text-center">
                  <Trophy className="w-8 h-8 text-slate-600 mx-auto mb-3" />

                  <p className="text-sm text-slate-400">
                    No matches
                    found.
                  </p>
                </div>
              )}

            <div className="space-y-4">
              {groupedLeagues.map(
                (league) => (
                  <div
                    key={
                      league.id
                    }
                    className="bg-[#121721] border border-slate-800 rounded-xl overflow-hidden"
                  >
                    <div className="bg-slate-900/60 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-emerald-400">
                          {
                            league.name
                          }
                        </div>

                        <div className="text-[10px] text-slate-500">
                          {
                            league.country
                          }
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-500">
                        {
                          league.matches
                            .length
                        }{" "}
                        matches
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800/50">
                      {league.matches.map(
                        (match) => (
                          <a
                            key={
                              match.id
                            }
                            href={`/matches/${match.id}`}
                            className="p-4 hover:bg-slate-800/30 transition flex items-center gap-3 group"
                          >
                            <div className="w-20 shrink-0 flex items-center gap-3">
                              <button
                                onClick={(
                                  e
                                ) =>
                                  toggleFavorite(
                                    match.id,
                                    e
                                  )
                                }
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    favorites.includes(
                                      match.id
                                    )
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-600"
                                  }`}
                                />
                              </button>

                              <span
                                className={`text-xs font-semibold ${
                                  match.isLive
                                    ? "text-red-400 animate-pulse"
                                    : "text-slate-500"
                                }`}
                              >
                                {
                                  match.minute
                                }
                              </span>
                            </div>

                            <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                              <div className="flex items-center justify-end gap-3 text-right min-w-0">
                                <span className="text-sm font-semibold truncate group-hover:text-emerald-400">
                                  {
                                    match.homeTeam
                                  }
                                </span>

                                {match.homeLogo ? (
                                  <img
                                    src={
                                      match.homeLogo
                                    }
                                    alt=""
                                    className="w-7 h-7 object-contain shrink-0"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-slate-800 shrink-0" />
                                )}
                              </div>

                              <div className="min-w-[64px] text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-sm font-black">
                                {
                                  match.homeScore
                                }{" "}
                                -{" "}
                                {
                                  match.awayScore
                                }
                              </div>

                              <div className="flex items-center gap-3 min-w-0">
                                {match.awayLogo ? (
                                  <img
                                    src={
                                      match.awayLogo
                                    }
                                    alt=""
                                    className="w-7 h-7 object-contain shrink-0"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-slate-800 shrink-0" />
                                )}

                                <span className="text-sm font-semibold truncate group-hover:text-emerald-400">
                                  {
                                    match.awayTeam
                                  }
                                </span>
                              </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 shrink-0" />
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
