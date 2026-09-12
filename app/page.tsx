"use client";

import { useEffect, useRef, useState } from "react";

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

type FilterTab =
  | "ALL"
  | "LIVE"
  | "UPCOMING"
  | "FINISHED"
  | "FAV";

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
  const [activeTab, setActiveTab] =
    useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [favorites, setFavorites] = useState<number[]>([]);

  // Favorileri interval içinde güncel tutar
  const favoritesRef = useRef<number[]>([]);

  // Her maçın son bilinen skoru
  const previousScores = useRef<
    Record<
      number,
      {
        home: number | null;
        away: number | null;
      }
    >
  >({});

  // Ses sistemi
  const audioContextRef = useRef<AudioContext | null>(null);

  // İlk API cevabında ses çalmaması için
  const scoresInitializedRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("ggm_favorites");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          const ids = parsed.filter(
            (id): id is number =>
              typeof id === "number"
          );

          setFavorites(ids);
          favoritesRef.current = ids;
        }
      } catch {
        setFavorites([]);
        favoritesRef.current = [];
      }
    }
  }, []);

  /*
   * Tarayıcının ses sistemini hazırlar.
   * Özellikle iPhone/Safari için yıldız tıklamasında çağrılır.
   */
  function unlockAudio() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current =
          new AudioContextClass();
      }

      if (
        audioContextRef.current.state ===
        "suspended"
      ) {
        audioContextRef.current.resume();
      }
    } catch (error) {
      console.error(
        "Audio initialization error:",
        error
      );
    }
  }

  /*
   * Gol sesi.
   * Harici mp3 dosyası gerektirmez.
   */
  function playGoalSound() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current =
          new AudioContextClass();
      }

      const audioContext =
        audioContextRef.current;

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const now = audioContext.currentTime;

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        520,
        now
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        880,
        now + 0.12
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        660,
        now + 0.35
      );

      gain.gain.setValueAtTime(
        0.0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        0.28,
        now + 0.03
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.5
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.5);
    } catch (error) {
      console.error(
        "Goal sound error:",
        error
      );
    }
  }

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
        const newMatches: Match[] =
          data.response;

        /*
         * İlk veri yüklemesinde sadece skorları
         * hafızaya alıyoruz.
         *
         * Böylece site açıldığında mevcut 2-1,
         * 3-0 gibi skorlar gol sesi oluşturmaz.
         */
        if (!scoresInitializedRef.current) {
          newMatches.forEach((match) => {
            previousScores.current[
              match.fixture.id
            ] = {
              home: match.goals.home,
              away: match.goals.away,
            };
          });

          scoresInitializedRef.current = true;
        } else {
          newMatches.forEach((match) => {
            const id = match.fixture.id;

            const newHome = match.goals.home;
            const newAway = match.goals.away;

            const previous =
              previousScores.current[id];

            if (previous) {
              const oldHome =
                previous.home ?? 0;

              const oldAway =
                previous.away ?? 0;

              const currentHome =
                newHome ?? 0;

              const currentAway =
                newAway ?? 0;

              const oldTotal =
                oldHome + oldAway;

              const newTotal =
                currentHome + currentAway;

              const scoreIncreased =
                newTotal > oldTotal;

              const isFavorite =
                favoritesRef.current.includes(
                  id
                );

              const isLive =
                LIVE_STATUSES.includes(
                  match.fixture.status.short
                );

              /*
               * Sadece favori + canlı maç + skor artışı
               * olduğunda ses çıkar.
               */
              if (
                isFavorite &&
                isLive &&
                scoreIncreased
              ) {
                playGoalSound();
              }
            }

            previousScores.current[id] = {
              home: newHome,
              away: newAway,
            };
          });
        }

        setMatches(newMatches);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error(
        "Failed to load matches:",
        error
      );

      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    /*
     * Tarih değişince eski günün skorlarını
     * yeni günle karşılaştırmıyoruz.
     */
    previousScores.current = {};
    scoresInitializedRef.current = false;

    setLoading(true);

    loadMatches();

    const interval = setInterval(
      loadMatches,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, [selectedDate]);

  const toggleFavorite = (
    e: React.MouseEvent,
    id: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    /*
     * Kullanıcının yıldız tıklaması ses sistemini
     * iPhone/Safari'de etkinleştirmek için kullanılır.
     */
    unlockAudio();

    const isAlreadyFavorite =
      favoritesRef.current.includes(id);

    const updated = isAlreadyFavorite
      ? favoritesRef.current.filter(
          (favId) => favId !== id
        )
      : [...favoritesRef.current, id];

    favoritesRef.current = updated;
    setFavorites(updated);

    localStorage.setItem(
      "ggm_favorites",
      JSON.stringify(updated)
    );
  };

  const generateDateTabs = () => {
    const dates: {
      iso: string;
      label: string;
    }[] = [];

    for (let i = -2; i <= 2; i++) {
      const d = new Date();

      d.setDate(d.getDate() + i);

      const iso =
        d.toISOString().split("T")[0];

      const label =
        i === 0
          ? "Today"
          : i === -1
          ? "Yesterday"
          : i === 1
          ? "Tomorrow"
          : d.toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "numeric",
                day: "numeric",
              }
            );

      dates.push({
        iso,
        label,
      });
    }

    return dates;
  };

  const filteredMatches = matches.filter(
    (match) => {
      const status =
        match.fixture.status.short;

      const isLive =
        LIVE_STATUSES.includes(status);

      const isFinished =
        FINISHED_STATUSES.includes(status);

      const isUpcoming =
        !isLive && !isFinished;

      const isFav =
        favorites.includes(
          match.fixture.id
        );

      if (
        activeTab === "LIVE" &&
        !isLive
      ) {
        return false;
      }

      if (
        activeTab === "UPCOMING" &&
        !isUpcoming
      ) {
        return false;
      }

      if (
        activeTab === "FINISHED" &&
        !isFinished
      ) {
        return false;
      }

      if (
        activeTab === "FAV" &&
        !isFav
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const query =
          searchQuery
            .toLowerCase()
            .trim();

        return (
          match.teams.home.name
            .toLowerCase()
            .includes(query) ||
          match.teams.away.name
            .toLowerCase()
            .includes(query) ||
          match.league.name
            .toLowerCase()
            .includes(query)
        );
      }

      return true;
    }
  );

  const liveCount = matches.filter(
    (match) =>
      LIVE_STATUSES.includes(
        match.fixture.status.short
      )
  ).length;

  const leagueGroups =
    groupMatchesByLeague(
      filteredMatches
    );

  return (
    <main className="page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f5f5f5;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Helvetica,
            Arial,
            sans-serif;
          color: #171717;
        }

        button,
        input {
          font-family: inherit;
        }

        .page {
          min-height: 100vh;
          background:
            linear-gradient(
              180deg,
              #fff7ed 0px,
              #ffffff 230px,
              #f6f6f6 520px
            );
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(
            255,
            255,
            255,
            0.96
          );
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #eeeeee;
        }

        .header {
          max-width: 1150px;
          margin: auto;
          padding: 18px 18px 16px;
        }

        .brandRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .brandMark {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f97316;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 900;
          box-shadow:
            0 5px 14px
              rgba(
                249,
                115,
                22,
                0.28
              );
        }

        .brandTitle {
          margin: 0;
          font-size: 25px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.7px;
          color: #171717;
        }

        .brandTitle span {
          color: #f97316;
        }

        .subtitle {
          margin: 5px 0 0;
          color: #888;
          font-size: 12px;
        }

        .liveBadge {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #fff1e7;
          border: 1px solid #fed7aa;
          color: #ea580c;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 800;
        }

        .liveDot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f97316;
          box-shadow:
            0 0 0 4px #ffedd5;
        }

        .search {
          margin-top: 17px;
          position: relative;
        }

        .search input {
          width: 100%;
          height: 46px;
          border: 1px solid #dedede;
          border-radius: 11px;
          background: white;
          padding: 0 15px;
          font-size: 14px;
          outline: none;
          transition: 0.2s;
        }

        .search input:focus {
          border-color: #f97316;
          box-shadow:
            0 0 0 3px #ffedd5;
        }

        .content {
          max-width: 1150px;
          margin: auto;
          padding: 18px;
        }

        .dateBar,
        .filterBar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .dateBar::-webkit-scrollbar,
        .filterBar::-webkit-scrollbar {
          display: none;
        }

        .dateButton {
          flex: 0 0 auto;
          min-width: 82px;
          padding: 10px 13px;
          border-radius: 10px;
          border: 1px solid #dddddd;
          background: white;
          color: #555;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .dateButton.active {
          background: #f97316;
          color: white;
          border-color: #f97316;
          box-shadow:
            0 4px 10px
              rgba(
                249,
                115,
                22,
                0.22
              );
        }

        .filterBar {
          margin-top: 12px;
          padding-bottom: 2px;
        }

        .filterButton {
          flex: 0 0 auto;
          border: 1px solid #e2e2e2;
          background: white;
          color: #555;
          padding: 9px 15px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .filterButton.active {
          background: #171717;
          color: white;
          border-color: #171717;
        }

        .section {
          margin-top: 20px;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          background: white;
          overflow: hidden;
          box-shadow:
            0 2px 8px
              rgba(
                0,
                0,
                0,
                0.035
              );
        }

        .leagueHeader {
          min-height: 55px;
          padding: 10px 15px;
          display: flex;
          align-items: center;
          gap: 11px;
          background:
            linear-gradient(
              90deg,
              #fff7ed,
              #ffffff
            );
          border-bottom: 1px solid #eeeeee;
        }

        .leagueLogo {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .leagueName {
          font-size: 14px;
          font-weight: 850;
          color: #202020;
        }

        .leagueCountry {
          margin-top: 2px;
          color: #999;
          font-size: 11px;
        }

        .match {
          position: relative;
          display: grid;
          grid-template-columns:
            70px
            minmax(0, 1fr)
            55px
            34px;
          align-items: center;
          gap: 9px;
          min-height: 88px;
          padding: 12px 14px;
          text-decoration: none;
          color: inherit;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.15s;
        }

        .match:last-child {
          border-bottom: none;
        }

        .match:hover {
          background: #fffaf6;
        }

        .matchTime {
          text-align: center;
          color: #777;
          font-size: 11px;
          font-weight: 800;
        }

        .matchTime.live {
          color: #f97316;
        }

        .teams {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .team {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .teamLogo {
          width: 25px;
          height: 25px;
          flex: 0 0 25px;
          object-fit: contain;
        }

        .teamName {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 650;
        }

        .scores {
          text-align: center;
          font-size: 15px;
          line-height: 1.7;
          font-weight: 900;
        }

        .favorite {
          border: none;
          background: transparent;
          color: #c7c7c7;
          font-size: 21px;
          cursor: pointer;
          padding: 5px;
        }

        .favorite.active {
          color: #f97316;
        }

        .empty,
        .loading {
          margin-top: 20px;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          text-align: center;
          padding: 60px 20px;
        }

        .emptyIcon {
          width: 54px;
          height: 54px;
          margin: 0 auto 13px;
          border-radius: 50%;
          background: #fff1e7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
        }

        .empty h2 {
          margin: 0;
          font-size: 18px;
        }

        .empty p {
          margin: 7px 0 0;
          color: #888;
          font-size: 13px;
        }

        .loading {
          color: #777;
          font-size: 14px;
        }

        @media (max-width: 600px) {
          .header {
            padding: 14px 12px;
          }

          .content {
            padding: 13px 12px;
          }

          .brandMark {
            width: 39px;
            height: 39px;
            font-size: 19px;
            border-radius: 10px;
          }

          .brandTitle {
            font-size: 21px;
          }

          .subtitle {
            font-size: 10px;
          }

          .liveBadge {
            padding: 7px 9px;
            font-size: 10px;
          }

          .match {
            grid-template-columns:
              54px
              minmax(0, 1fr)
              42px
              30px;
            padding: 11px 9px;
            gap: 6px;
          }

          .teamName {
            font-size: 12px;
          }

          .teamLogo {
            width: 23px;
            height: 23px;
            flex-basis: 23px;
          }

          .scores {
            font-size: 14px;
          }

          .leagueHeader {
            padding: 9px 11px;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="header">
          <div className="brandRow">
            <div className="brand">
              <div className="brandMark">
                G
              </div>

              <div>
                <h1 className="brandTitle">
                  GoGoal<span>Match</span>
                </h1>

                <p className="subtitle">
                  Live Scores, Results &
                  Statistics
                </p>
              </div>
            </div>

            <div className="liveBadge">
              <span className="liveDot" />
              {liveCount} LIVE
            </div>
          </div>

          <div className="search">
            <input
              type="text"
              placeholder="Search team or league..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
            />
          </div>
        </div>
      </header>

      <div className="content">
        <div className="dateBar">
          {generateDateTabs().map(
            (date) => (
              <button
                key={date.iso}
                className={`dateButton ${
                  selectedDate ===
                  date.iso
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedDate(
                    date.iso
                  )
                }
              >
                {date.label}
              </button>
            )
          )}
        </div>

        <div className="filterBar">
          {(
            [
              ["ALL", "All"],
              ["LIVE", "Live"],
              [
                "UPCOMING",
                "Upcoming",
              ],
              [
                "FINISHED",
                "Finished",
              ],
              [
                "FAV",
                "Favorites",
              ],
            ] as [
              FilterTab,
              string
            ][]
          ).map(
            ([value, label]) => (
              <button
                key={value}
                className={`filterButton ${
                  activeTab ===
                  value
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    value
                  )
                }
              >
                {label}
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="loading">
            Loading matches...
          </div>
        ) : filteredMatches.length ===
          0 ? (
          <div className="empty">
            <div className="emptyIcon">
              ⚽
            </div>

            <h2>
              No matches found
            </h2>

            <p>
              Try another date,
              filter or search.
            </p>
          </div>
        ) : (
          <div>
            {leagueGroups.map(
              (leagueMatches) => {
                const league =
                  leagueMatches[0]
                    .league;

                return (
                  <section
                    key={
                      league.id ??
                      `${league.country}-${league.name}`
                    }
                    className="section"
                  >
                    <div className="leagueHeader">
                      {league.logo && (
                        <img
                          src={
                            league.logo
                          }
                          alt=""
                          className="leagueLogo"
                        />
                      )}

                      <div>
                        <div className="leagueName">
                          {
                            league.name
                          }
                        </div>

                        <div className="leagueCountry">
                          {
                            league.country
                          }
                        </div>
                      </div>
                    </div>

                    {leagueMatches.map(
                      (match) => {
                        const status =
                          match
                            .fixture
                            .status
                            .short;

                        const isLive =
                          LIVE_STATUSES.includes(
                            status
                          );

                        const isFinished =
                          FINISHED_STATUSES.includes(
                            status
                          );

                        const time =
                          match
                            .fixture
                            .date
                            ? new Date(
                                match
                                  .fixture
                                  .date
                              ).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute:
                                    "2-digit",
                                }
                              )
                            : "--:--";

                        return (
                          <a
                            key={
                              match
                                .fixture
                                .id
                            }
                            href={`/matches/${match.fixture.id}`}
                            className="match"
                          >
                            <div
                              className={`matchTime ${
                                isLive
                                  ? "live"
                                  : ""
                              }`}
                            >
                              {isLive
                                ? `${status}${
                                    match
                                      .fixture
                                      .status
                                      .elapsed
                                      ? ` ${match.fixture.status.elapsed}'`
                                      : ""
                                  }`
                                : isFinished
                                ? status
                                : time}
                            </div>

                            <div className="teams">
                              <div className="team">
                                {match
                                  .teams
                                  .home
                                  .logo && (
                                  <img
                                    src={
                                      match
                                        .teams
                                        .home
                                        .logo
                                    }
                                    alt=""
                                    className="teamLogo"
                                  />
                                )}

                                <span className="teamName">
                                  {
                                    match
                                      .teams
                                      .home
                                      .name
                                  }
                                </span>
                              </div>

                              <div className="team">
                                {match
                                  .teams
                                  .away
                                  .logo && (
                                  <img
                                    src={
                                      match
                                        .teams
                                        .away
                                        .logo
                                    }
                                    alt=""
                                    className="teamLogo"
                                  />
                                )}

                                <span className="teamName">
                                  {
                                    match
                                      .teams
                                      .away
                                      .name
                                  }
                                </span>
                              </div>
                            </div>

                            <div className="scores">
                              <div>
                                {match
                                  .goals
                                  .home ??
                                  "-"}
                              </div>

                              <div>
                                {match
                                  .goals
                                  .away ??
                                  "-"}
                              </div>
                            </div>

                            <button
                              type="button"
                              aria-label={
                                favorites.includes(
                                  match
                                    .fixture
                                    .id
                                )
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                              className={`favorite ${
                                favorites.includes(
                                  match
                                    .fixture
                                    .id
                                )
                                  ? "active"
                                  : ""
                              }`}
                              onClick={(e) =>
                                toggleFavorite(
                                  e,
                                  match
                                    .fixture
                                    .id
                                )
                              }
                            >
                              ★
                            </button>
                          </a>
                        );
                      }
                    )}
                  </section>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}
