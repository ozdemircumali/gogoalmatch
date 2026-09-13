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
    return "GOOOOOL!";
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

function urlBase64ToUint8Array(
  base64String: string
): Uint8Array {
  const padding =
    "=".repeat(
      (4 -
        (base64String.length %
          4)) %
        4
    );

  const base64 =
    (
      base64String +
      padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    Array.from(rawData).map(
      (char) =>
        char.charCodeAt(0)
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
          typeof window ===
          "undefined"
        ) {
          return false;
        }

        if (
          !("serviceWorker" in
            navigator)
        ) {
          console.error(
            "Service Worker is not supported."
          );
          return false;
        }

        if (
          !("PushManager" in
            window)
        ) {
          console.error(
            "Web Push is not supported."
          );
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

        if (!subscription) {
          return;
        }

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

  const enableAlerts = async () => {
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
        console.error(
          "Notification permission was not granted."
        );
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
        favorites.length ===
        0
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
      typeof window ===
        "undefined" ||
      !("serviceWorker" in
        navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log(
          "GoGoalMatch Service Worker registered."
        );
      })
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

        if (
          Array.isArray(parsed)
        ) {
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
    if (
      !alertsEnabled
    ) {
      return;
    }

    if (
      typeof window ===
        "undefined" ||
      !("serviceWorker" in
        navigator) ||
      !("PushManager" in
        window)
    ) {
      return;
    }

    const restorePush =
      async () => {
        try {
          const permission =
            "Notification" in
            window
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

          if (!subscription) {
            return;
          }

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
    if (
      favorites.length ===
      0
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

        if (
          pushSubscriptionRef.current &&
          alertsEnabledRef.current
        ) {
          void updatePushFavorites(
            next
          );
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
      favorites
