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
  if (typeof window === "undefined") return null;

  if (audioContext) return audioContext;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return null;

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

  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const start = ctx.currentTime + delay;
    const end = start + duration;

    gain.gain.setValueAtTime(0.0001, start);

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
    console.error("Tone playback error:", error);
  }
}

function playTestSound() {
  playTone(600, 0.18, 0, 0.22, "sine");
  playTone(800, 0.18, 0.22, 0.22, "sine");
  playTone(1000, 0.28, 0.44, 0.24, "sine");
}

function playGoalSound() {
  playTone(523, 0.18, 0, 0.18, "sawtooth");
  playTone(659, 0.18, 0.18, 0.18, "sawtooth");
  playTone(784, 0.2, 0.36, 0.2, "sawtooth");
  playTone(1047, 0.5, 0.56, 0.22, "sawtooth");
}

function playYellowSound() {
  playTone(880, 0.15, 0, 0.16, "square");
  playTone(660, 0.2, 0.18, 0.14, "square");
}

function playRedSound() {
  playTone(900, 0.15, 0, 0.18, "sawtooth");
  playTone(450, 0.3, 0.2, 0.16, "sawtooth");
  playTone(900, 0.15, 0.55, 0.18, "sawtooth");
}

function playPenaltySound() {
  playTone(1000, 0.13, 0, 0.17, "square");
  playTone(700, 0.2, 0.18, 0.15, "square");
  playTone(1000, 0.13, 0.45, 0.17, "square");
}

function playVarSound() {
  playTone(660, 0.14, 0, 0.14, "triangle");
  playTone(880, 0.14, 0.17, 0.14, "triangle");
}

function playAlertSound(type: AlertType) {
  if (type === "goal") playGoalSound();
  else if (type === "yellow") playYellowSound();
  else if (type === "red") playRedSound();
  else if (type === "penalty") playPenaltySound();
  else if (type === "var") playVarSound();
}

function convertFixture(
  fixture: ApiFixture
): Match | null {
  const id = fixture.fixture?.id;

  if (!id) return null;

  const status =
    fixture.fixture?.status?.short || "NS";

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
    if (status === "HT") minute = "HT";
    else if (status === "BT") minute = "BT";
    else if (status === "P") minute = "P";
    else if (
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
    isUpcoming: !isLive && !isFinished,
    homeTeam: home?.name || "Home",
    homeLogo: home?.logo || "",
    homeScore: fixture.goals?.home ?? "-",
    awayTeam: away?.name || "Away",
    awayLogo: away?.logo || "",
    awayScore: fixture.goals?.away ?? "-",
    leagueId: String(
      fixture.league?.id || "unknown"
    ),
    leagueName:
      fixture.league?.name || "Unknown League",
    country:
      fixture.league?.country || "",
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
    if (detail.includes("missed")) return null;
    return "goal";
  }

  if (type === "card") {
    if (detail.includes("red")) return "red";
    return "yellow";
  }

  if (type === "var") {
    if (detail.includes("penalty")) {
      return "penalty";
    }

    return "var";
  }

  if (detail.includes("penalty")) {
    return "penalty";
  }

  return null;
}

function getEventTitle(
  type: AlertType
) {
  if (type === "goal") return "GOOOOOL!";
  if (type === "yellow") return "YELLOW CARD";
  if (type === "red") return "RED CARD";
  if (type === "penalty") return "PENALTY";
  return "VAR";
}

function getEventIcon(
  type: AlertType
) {
  if (type === "goal") return "⚽";
  if (type === "yellow") return "🟨";
  if (type === "red") return "🟥";
  if (type === "penalty") return "⚽";
  return "📺";
}

function urlBase64ToUint8Array(
  base64String: string
): Uint8Array {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    Array.from(rawData).map(
      (char) => char.charCodeAt(0)
    )
  );
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
    useRef<Map<string, Set<string>>>(
      new Map()
    );

  const previousScoresRef =
    useRef<Map<string, string>>(
      new Map()
    );

  const alertsEnabledRef =
    useRef(false);

  const pushSubscriptionRef =
    useRef<PushSubscription | null>(
      null
    );

  const savePushSubscription =
    useCallback(
      async (
        subscription: PushSubscription,
        favoriteIds: string[]
      ) => {
        try {
          const response =
            await fetch(
              "/api/push/subscribe",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  subscription,
                  favorites:
                    favoriteIds,
                }),
              }
            );

          if (!response.ok) {
            console.error(
              "Push subscription save failed:",
              response.status
            );
            return false;
          }

          return true;
        } catch (error) {
          console.error(
            "Push subscription save error:",
            error
          );

          return false;
        }
      },
      []
    );

  const setupPushSubscription =
    useCallback(
      async (
        favoriteIds: string[]
      ) => {
        if (
          typeof window === "undefined"
        ) {
          return false;
        }

        if (
          !("serviceWorker" in navigator)
        ) {
          return false;
        }

        if (
          !("PushManager" in window)
        ) {
          return false;
        }

        const publicKey =
          process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          console.error(
            "NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing."
          );
          return false;
        }

        try {
          const registration =
            await navigator.serviceWorker.register(
              "/sw.js"
            );

          await navigator.serviceWorker.ready;

          let subscription =
            await registration.pushManager.getSubscription();

          if (!subscription) {
            subscription =
              await registration.pushManager.subscribe(
                {
                  userVisibleOnly: true,
                  applicationServerKey:
                    urlBase64ToUint8Array(
                      publicKey
                    ),
                }
              );
          }

          pushSubscriptionRef.current =
            subscription;

          return await savePushSubscription(
            subscription,
            favoriteIds
          );
        } catch (error) {
          console.error(
            "Push setup error:",
            error
          );

          return false;
        }
      },
      [savePushSubscription]
    );

  const updatePushFavorites =
    useCallback(
      async (
        favoriteIds: string[]
      ) => {
        const subscription =
          pushSubscriptionRef.current;

        if (!subscription) return;

        await savePushSubscription(
          subscription,
          favoriteIds
        );
      },
      [savePushSubscription]
    );

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

  const enableAlerts =
    async () => {
      const ctx =
        getAudioContext();

      if (ctx) {
        if (
          ctx.state ===
          "suspended"
        ) {
          void ctx.resume();
        }

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

      if (
        typeof window ===
          "undefined" ||
        !("Notification" in window)
      ) {
        return;
      }

      try {
        let permission =
          Notification.permission;

        if (
          permission === "default"
        ) {
          permission =
            await Notification.requestPermission();
        }

        if (
          permission !== "granted"
        ) {
          return;
        }

        await setupPushSubscription(
          favorites
        );
      } catch (error) {
        console.error(
          "Alert enable error:",
          error
        );
      }
    };

  const disableAlerts =
    () => {
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
      if (favorites.length === 0) {
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
        favoriteMatches.length === 0
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

              if (!response.ok) {
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

              if (!detail) return;

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

              if (!known) {
                knownEventsRef.current.set(
                  match.id,
                  currentKeys
                );

                previousScoresRef.current.set(
                  match.id,
                  `${detail.goals?.home ?? "-"}-${detail.goals?.away ?? "-"}`
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

              for (
                const event of newEvents
              ) {
                const type =
                  getAlertType(event);

                if (!type) continue;

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
                  text +=
                    ` · ${event.player.name}${minute}`;
                }

                if (
                  type === "yellow" ||
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
                  type === "penalty" ||
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
                  playAlertSound(type);
                  sendBrowserNotification(
                    alert
                  );
                }
              }

              if (
                scoreChanged &&
                newEvents.length ===
                  0
              ) {
                const alert: AlertMessage =
                  {
                    id: `${match.id}-${currentScore}-${Date.now()}`,
                    type: "goal",
                    title: "GOOOOOL!",
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
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .catch((error) => {
        console.error(
          "Service Worker registration failed:",
          error
        );
      });
  }, []);

  useEffect(() => {
    try {
      const savedFavorites =
        localStorage.getItem(
          FAVORITES_KEY
        );

      if (savedFavorites) {
        const parsed =
          JSON.parse(
            savedFavorites
          );

        if (Array.isArray(parsed)) {
          setFavorites(
            parsed.map(String)
          );
        }
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
      !alertsEnabled ||
      favorites.length === 0
    ) {
      return;
    }

    if (
      !pushSubscriptionRef.current
    ) {
      return;
    }

    void updatePushFavorites(
      favorites
    );
  }, [
    favorites,
    alertsEnabled,
    updatePushFavorites,
  ]);

  useEffect(() => {
    if (!alertsEnabled) return;

    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    const restorePush =
      async () => {
        try {
          const permission =
            "Notification" in window
              ? Notification.permission
              : "default";

          if (
            permission !==
            "granted"
          ) {
            return;
          }

          const registration =
            await navigator.serviceWorker.ready;

          const subscription =
            await registration.pushManager.getSubscription();

          if (!subscription) return;

          pushSubscriptionRef.current =
            subscription;

          await savePushSubscription(
            subscription,
            favorites
          );
        } catch (error) {
          console.error(
            "Push restore error:",
            error
          );
        }
      };

    void restorePush();
  }, [
    alertsEnabled,
    favorites,
    savePushSubscription,
  ]);

  useEffect(() => {
    if (favorites.length === 0) {
      return;
    }

    void checkFavoriteMatchAlerts();

    const interval =
      window.setInterval(
        () =>
          void checkFavoriteMatchAlerts(),
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
            JSON.stringify(next)
          );
        } catch {}

        if (
          pushSubscriptionRef.current &&
          alertsEnabledRef.current
        ) {
          void updatePushFavorites(next);
        }

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
          !map.has(league.country)
        ) {
          map.set(
            league.country,
            []
          );
        }

        map
          .get(league.country)!
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
            String(league.id) ===
            selectedLeagueId
        ) || null,
      [selectedLeagueId]
    );

  const filteredMatches =
    useMemo(() => {
      let result = matches;

      if (selectedLeagueId) {
        result =
          result.filter(
            (match) =>
              match.leagueId ===
              selectedLeagueId
          );
      }

      if (filter === "live") {
        result =
          result.filter(
            (m) => m.isLive
          );
      }

      if (filter === "upcoming") {
        result =
          result.filter(
            (m) => m.isUpcoming
          );
      }

      if (filter === "finished") {
        result =
          result.filter(
            (m) => m.isFinished
          );
      }

      if (filter === "favorites") {
        result =
          result.filter(
            (m) =>
              favorites.includes(
                m.id
              )
          );
      }

      if (searchQuery.trim()) {
        const search =
          searchQuery
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (m) =>
              m.homeTeam
                .toLowerCase()
                .includes(search) ||
              m.awayTeam
                .toLowerCase()
                .includes(search) ||
              m.leagueName
                .toLowerCase()
                .includes(search) ||
              m.country
                .toLowerCase()
                .includes(search)
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

  const liveCount =
    matches.filter(
      (m) => m.isLive
    ).length;

  const upcomingCount =
    matches.filter(
      (m) => m.isUpcoming
    ).length;

  const finishedCount =
    matches.filter(
      (m) => m.isFinished
    ).length;

  const clearLeague =
    () => {
      setSelectedLeagueId(null);
      setMenuOpen(false);
    };

  const chooseLeague =
    (leagueId: number) => {
      setSelectedLeagueId(
        String(leagueId)
      );
      setFilter("all");
      setMenuOpen(false);
    };

  return (
    <main className="min-h-screen bg-[#07140f] text-white">
      <header className="sticky top-0 z-50 border-b border-emerald-900/60 bg-[#081812]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <a
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-[#06120d]">
              <Trophy size={20} />
            </div>

            <div>
              <div className="text-lg font-black tracking-tight">
                GoGoalMatch
              </div>

              <div className="hidden text-[10px] uppercase tracking-[0.18em] text-emerald-400 sm:block">
                Live Football
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            <a
              href="/"
              className="rounded-lg bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-400"
            >
              LIVE
            </a>

            <a
              href="/matches"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Matches
            </a>

            <a
              href="/matches?filter=finished"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Results
            </a>

            <a
              href="#"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Standings
            </a>

            <a
              href="#"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Stats
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={
                alertsEnabled
                  ? disableAlerts
                  : enableAlerts
              }
              className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition ${
                alertsEnabled
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                  : "border-slate-700 bg-slate-900 text-slate-300"
              }`}
              title={
                alertsEnabled
                  ? "Alerts ON"
                  : "Enable alerts"
              }
            >
              {alertsEnabled ? (
                <Volume2 size={16} />
              ) : (
                <BellOff size={16} />
              )}

              <span className="hidden sm:inline">
                {alertsEnabled
                  ? "Alerts ON"
                  : "Alerts"}
              </span>
            </button>

            <button
              onClick={() =>
                setMenuOpen(
                  (value) => !value
                )
              }
              className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-200 md:hidden"
            >
              {menuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-emerald-900/50 bg-[#081812] px-4 py-3 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/"
                className="rounded-lg bg-emerald-500/15 p-3 text-center text-sm font-bold text-emerald-400"
              >
                LIVE
              </a>

              <a
                href="/matches"
                className="rounded-lg bg-white/5 p-3 text-center text-sm font-bold"
              >
                Matches
              </a>

              <a
                href="/matches?filter=finished"
                className="rounded-lg bg-white/5 p-3 text-center text-sm font-bold"
              >
                Results
              </a>

              <a
                href="#"
                className="rounded-lg bg-white/5 p-3 text-center text-sm font-bold"
              >
                Stats
              </a>
            </div>
          </div>
        )}
      </header>

      <div className="mx-auto flex max-w-7xl gap-5 px-4 py-5">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-21 overflow-hidden rounded-2xl border border-emerald-900/50 bg-[#0a1b14]">
            <div className="border-b border-emerald-900/50 p-4">
              <div className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                Leagues
              </div>

              <button
                onClick={clearLeague}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                  !selectedLeagueId
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>All Leagues</span>
                {!selectedLeagueId && (
                  <ChevronRight size={16} />
                )}
              </button>
            </div>

            <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-2">
              {countries.map(
                ([country, leagues]) => {
                  const open =
                    openCountry ===
                    country;

                  return (
                    <div
                      key={country}
                      className="mb-1"
                    >
                      <button
                        onClick={() =>
                          setOpenCountry(
                            open
                              ? null
                              : country
                          )
                        }
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/5"
                      >
                        <span>
                          {country}
                        </span>

                        <ChevronDown
                          size={15}
                          className={`transition-transform ${
                            open
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

                      {open && (
                        <div className="ml-2 space-y-1 border-l border-emerald-900/60 pl-2">
                          {leagues.map(
                            (league) => (
                              <button
                                key={
                                  league.id
                                }
                                onClick={() =>
                                  chooseLeague(
                                    league.id
                                  )
                                }
                                className={`w-full rounded-md px-3 py-2 text-left text-xs ${
                                  selectedLeagueId ===
                                  String(
                                    league.id
                                  )
                                    ? "bg-emerald-500/15 font-bold text-emerald-400"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
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
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-5">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                  Football Scores
                </p>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  {selectedLeague
                    ? selectedLeague.name
                    : "Today's Matches"}
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Live scores, results and match statistics
                </p>
              </div>

              <button
                onClick={() =>
                  void loadMatches()
                }
                className="flex w-fit items-center gap-2 rounded-lg border border-emerald-900/60 bg-[#0a1b14] px-3 py-2 text-xs font-bold text-slate-300 hover:border-emerald-500/40 hover:text-white"
              >
                <RefreshCw
                  size={15}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-2">
              <button
                onClick={() =>
                  setFilter("all")
                }
                className={`rounded-xl border p-3 text-left ${
                  filter === "all"
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-emerald-900/50 bg-[#0a1b14]"
                }`}
              >
                <div className="text-lg font-black">
                  {matches.length}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  All
                </div>
              </button>

              <button
                onClick={() =>
                  setFilter("live")
                }
                className={`rounded-xl border p-3 text-left ${
                  filter === "live"
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-emerald-900/50 bg-[#0a1b14]"
                }`}
              >
                <div className="text-lg font-black text-red-400">
                  {liveCount}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Live
                </div>
              </button>

              <button
                onClick={() =>
                  setFilter("upcoming")
                }
                className={`rounded-xl border p-3 text-left ${
                  filter === "upcoming"
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-emerald-900/50 bg-[#0a1b14]"
                }`}
              >
                <div className="text-lg font-black text-blue-400">
                  {upcomingCount}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Upcoming
                </div>
              </button>

              <button
                onClick={() =>
                  setFilter("favorites")
                }
                className={`rounded-xl border p-3 text-left ${
                  filter === "favorites"
                    ? "border-yellow-500/50 bg-yellow-500/10"
                    : "border-emerald-900/50 bg-[#0a1b14]"
                }`}
              >
                <div className="text-lg font-black text-yellow-400">
                  {favorites.length}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Favorites
                </div>
              </button>
            </div>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search team, league or country..."
                className="w-full rounded-xl border border-emerald-900/50 bg-[#0a1b14] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/60"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {loading &&
            matches.length === 0 && (
              <div className="rounded-2xl border border-emerald-900/50 bg-[#0a1b14] p-10 text-center">
                <RefreshCw
                  size={28}
                  className="mx-auto mb-3 animate-spin text-emerald-400"
                />
                <p className="text-sm font-semibold text-slate-300">
                  Loading matches...
                </p>
              </div>
            )}

          {!loading &&
            filteredMatches.length ===
              0 && (
              <div className="rounded-2xl border border-emerald-900/50 bg-[#0a1b14] p-10 text-center">
                <Trophy
                  size={30}
                  className="mx-auto mb-3 text-slate-600"
                />

                <h2 className="font-bold text-slate-300">
                  No matches found
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Try another filter or search.
                </p>
              </div>
            )}

          <div className="space-y-3">
            {filteredMatches.map(
              (match) => (
                <a
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="group block rounded-2xl border border-emerald-900/50 bg-[#0a1b14] p-4 transition hover:border-emerald-500/40 hover:bg-[#0d2119]"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold text-emerald-400">
                          {match.country}
                        </span>

                        <span className="text-slate-700">
                          /
                        </span>

                        <span className="truncate text-xs text-slate-400">
                          {match.leagueName}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(event) =>
                        toggleFavorite(
                          match.id,
                          event
                        )
                      }
                      className="shrink-0 rounded-lg p-1.5 hover:bg-white/5"
                      aria-label="Favorite"
                    >
                      <Star
                        size={19}
                        className={
                          favorites.includes(
                            match.id
                          )
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-600 group-hover:text-slate-400"
                        }
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="flex min-w-0 items-center justify-end gap-3">
                      <span className="truncate text-right text-sm font-bold sm:text-base">
                        {match.homeTeam}
                      </span>

                      {match.homeLogo ? (
                        <img
                          src={
                            match.homeLogo
                          }
                          alt=""
                          className="h-9 w-9 shrink-0 object-contain"
                        />
                      ) : (
                        <div className="h-9 w-9 shrink-0 rounded-full bg-slate-800" />
                      )}
                    </div>

                    <div className="min-w-[58px] text-center">
                      {match.isLive ? (
                        <>
                          <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-red-400">
                            LIVE
                          </div>

                          <div className="text-xl font-black">
                            {match.homeScore}
                            <span className="mx-1 text-slate-600">
                              -
                            </span>
                            {match.awayScore}
                          </div>

                          <div className="text-[10px] font-bold text-emerald-400">
                            {match.minute}
                          </div>
                        </>
                      ) : match.isFinished ? (
                        <>
                          <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            FT
                          </div>

                          <div className="text-xl font-black">
                            {match.homeScore}
                            <span className="mx-1 text-slate-600">
                              -
                            </span>
                            {match.awayScore}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-blue-400">
                            UPCOMING
                          </div>

                          <div className="text-sm font-black text-slate-300">
                            {match.minute}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                      {match.awayLogo ? (
                        <img
                          src={
                            match.awayLogo
                          }
                          alt=""
                          className="h-9 w-9 shrink-0 object-contain"
                        />
                      ) : (
                        <div className="h-9 w-9 shrink-0 rounded-full bg-slate-800" />
                      )}

                      <span className="truncate text-sm font-bold sm:text-base">
                        {match.awayTeam}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-emerald-900/30 pt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      Match details
                    </span>

                    <ChevronRight
                      size={15}
                      className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400"
                    />
                  </div>
                </a>
              )
            )}
          </div>

          <footer className="mt-10 border-t border-emerald-900/40 pt-6 pb-5">
            <div className="text-center">
              <p className="text-xs text-slate-500">
                GoGoalMatch · Live Scores, Results and Football Statistics
              </p>

              <p className="mt-1 text-[10px] text-slate-700">
                {finishedCount} finished matches available today
              </p>
            </div>

            <nav
              aria-label="Legal"
              className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            >
              <a
                href="/privacy"
                className="text-[11px] text-slate-500 transition hover:text-emerald-400"
              >
                Privacy Policy
              </a>

              <a
                href="/terms"
                className="text-[11px] text-slate-500 transition hover:text-emerald-400"
              >
                Terms of Use
              </a>

              <a
                href="/cookies"
                className="text-[11px] text-slate-500 transition hover:text-emerald-400"
              >
                Cookie Policy
              </a>

              <a
                href="/disclaimer"
                className="text-[11px] text-slate-500 transition hover:text-emerald-400"
              >
                Disclaimer
              </a>

              <a
                href="/contact"
                className="text-[11px] text-slate-500 transition hover:text-emerald-400"
              >
                Contact
              </a>
            </nav>

            <p className="mt-5 text-center text-[10px] text-slate-700">
              © {new Date().getFullYear()} GoGoalMatch. All rights reserved.
            </p>
          </footer>
        </section>
      </div>

      {alertMessage && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-32px)] max-w-md -translate-x-1/2">
          <div className="overflow-hidden rounded-2xl border border-emerald-500/40 bg-[#07140f]/95 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-xl">
                {getEventIcon(
                  alertMessage.type
                )}
              </div>

              <div className="min-w-0">
                <div className="text-sm font-black text-emerald-400">
                  {alertMessage.title}
                </div>

                <div className="mt-0.5 truncate text-sm font-semibold text-white">
                  {alertMessage.text}
                </div>
              </div>
            </div>

            <div className="h-1 bg-emerald-500/20">
              <div className="h-full w-full animate-[shrink_6s_linear_forwards] bg-emerald-500" />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        html {
          background: #07140f;
        }

        body {
          margin: 0;
        }

        ::-webkit-scrollbar {
          width: 7px;
        }

        ::-webkit-scrollbar-track {
          background: #07140f;
        }

        ::-webkit-scrollbar-thumb {
          background: #183c2d;
          border-radius: 999px;
        }
      `}</style>
    </main>
  );
}
