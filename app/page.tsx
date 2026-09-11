    const leagueGroups = groupMatchesByLeague(filteredMatches);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #060a13 0%, #0a0f1c 40%, #0b1120 100%)",
        color: "#e5e7eb",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(8, 12, 22, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(34, 197, 94, 0.15)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "18px",
                color: "#04170c",
              }}
            >
              G
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              GoGoal<span style={{ color: "#22c55e" }}>Match</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <HeroStat
              label="Live"
              value={loading ? "–" : String(liveCount)}
              accent="#ef4444"
            />
            <HeroStat
              label="Total"
              value={loading ? "–" : String(matches.length)}
              accent="#22c55e"
            />
            <HeroStat
              label="Leagues"
              value={loading ? "–" : String(totalLeagues)}
              accent="#38bdf8"
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
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "#0f1626",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              padding: "8px 14px",
              color: "#fff",
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
                activeTab === "ALL" ? "active" : ""
              }`}
              onClick={() => setActiveTab("ALL")}
            >
              ALL ({matches.length})
            </button>

            <button
              className={`ggm-filter-btn ${
                activeTab === "LIVE" ? "active" : ""
              }`}
              onClick={() => setActiveTab("LIVE")}
            >
              <span className="ggm-live-dot" /> LIVE ({liveCount})
            </button>

            <button
              className={`ggm-filter-btn ${
                activeTab === "UPCOMING" ? "active" : ""
              }`}
              onClick={() => setActiveTab("UPCOMING")}
            >
              UPCOMING
            </button>

            <button
              className={`ggm-filter-btn ${
                activeTab === "FINISHED" ? "active" : ""
              }`}
              onClick={() => setActiveTab("FINISHED")}
            >
              FINISHED
            </button>

            <button
              className={`ggm-filter-btn ${
                activeTab === "FAV" ? "active" : ""
              }`}
              onClick={() => setActiveTab("FAV")}
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
                  selectedDate === item.iso ? "active" : ""
                }`}
                onClick={() => setSelectedDate(item.iso)}
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
          <div
            style={{
              background: "#0f1626",
              border: "1px solid #1e293b",
              padding: "40px 20px",
              borderRadius: "14px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            Loading matches...
          </div>
        ) : leagueGroups.length === 0 ? (
          <div
            style={{
              background: "#0f1626",
              borderRadius: "14px",
              padding: "30px",
              color: "#64748b",
              fontSize: "13px",
              border: "1px solid #1e293b",
              textAlign: "center",
            }}
          >
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
          borderTop: "1px solid #1e293b",
          padding: "24px 20px",
          textAlign: "center",
          color: "#475569",
          fontSize: "12px",
        }}
      >
        © {new Date().getFullYear()} GoGoalMatch — Live sports scores &
        standings.
      </footer>

      <style jsx global>{`
        .ggm-filter-btn {
          background: #0f1626;
          border: 1px solid #1e293b;
          color: #94a3b8;
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
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border-color: #22c55e;
        }

        .ggm-date-btn {
          background: #0b1120;
          border: 1px solid #1e293b;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
        }

        .ggm-date-btn.active {
          color: #22c55e;
          border-color: #22c55e;
        }

        .ggm-fav-star {
          cursor: pointer;
          font-size: 15px;
          color: #334155;
        }

        .ggm-fav-star.active {
          color: #f59e0b;
        }

        .ggm-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
          display: inline-block;
          box-shadow: 0 0 6px #ef4444;
        }

        .ggm-league-group {
          background: #0f1626;
          border: 1px solid #1e293b;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .ggm-row {
          display: block;
          text-decoration: none;
          color: #e5e7eb;
        }

        .ggm-row + .ggm-row {
          border-top: 1px solid #1e293b;
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
