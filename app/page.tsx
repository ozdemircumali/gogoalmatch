{/* TEAM ROW */}
<div
  className="grid w-full grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center gap-1 sm:grid-cols-[minmax(0,1fr)_90px_minmax(0,1fr)] sm:gap-3"
  style={{
    width: "100%",
    minWidth: 0,
  }}
>
  {/* HOME */}
  <div
    className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-3"
    style={{
      width: "100%",
      minWidth: 0,
    }}
  >
    <div
      style={{
        minWidth: 0,
        width: 0,
        flex: "1 1 0%",
        textAlign: "right",
      }}
    >
      <div
        style={{
          display: "block",
          width: "100%",
          minWidth: 0,
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 700,
          lineHeight: "1.2",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          visibility: "visible",
          opacity: 1,
        }}
      >
        {String(match.homeTeam || "Home")}
      </div>
    </div>

    {match.homeLogo ? (
      <div
        style={{
          width: 36,
          height: 36,
          minWidth: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={match.homeLogo}
          alt=""
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    ) : (
      <div
        style={{
          width: 36,
          height: 36,
          minWidth: 36,
          borderRadius: "9999px",
          background: "#1e293b",
        }}
      />
    )}
  </div>

  {/* SCORE */}
  <div
    style={{
      width: "72px",
      minWidth: "72px",
      textAlign: "center",
    }}
  >
    {match.isLive ? (
      <>
        <div
          style={{
            marginBottom: "4px",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "#f87171",
          }}
        >
          LIVE
        </div>

        <div
          style={{
            fontSize: "21px",
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {match.homeScore}
          <span
            style={{
              margin: "0 4px",
              color: "#475569",
            }}
          >
            -
          </span>
          {match.awayScore}
        </div>

        <div
          style={{
            marginTop: "4px",
            fontSize: "10px",
            fontWeight: 700,
            color: "#34d399",
          }}
        >
          {match.minute}
        </div>
      </>
    ) : match.isFinished ? (
      <>
        <div
          style={{
            marginBottom: "4px",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "#64748b",
          }}
        >
          FT
        </div>

        <div
          style={{
            fontSize: "21px",
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {match.homeScore}
          <span
            style={{
              margin: "0 4px",
              color: "#475569",
            }}
          >
            -
          </span>
          {match.awayScore}
        </div>
      </>
    ) : (
      <>
        <div
          style={{
            marginBottom: "4px",
            fontSize: "9px",
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: "#60a5fa",
          }}
        >
          UPCOMING
        </div>

        <div
          style={{
            fontSize: "13px",
            fontWeight: 900,
            color: "#cbd5e1",
            whiteSpace: "nowrap",
          }}
        >
          {match.minute}
        </div>
      </>
    )}
  </div>

  {/* AWAY */}
  <div
    className="flex min-w-0 items-center gap-1.5 sm:gap-3"
    style={{
      width: "100%",
      minWidth: 0,
    }}
  >
    {match.awayLogo ? (
      <div
        style={{
          width: 36,
          height: 36,
          minWidth: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={match.awayLogo}
          alt=""
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    ) : (
      <div
        style={{
          width: 36,
          height: 36,
          minWidth: 36,
          borderRadius: "9999px",
          background: "#1e293b",
        }}
      />
    )}

    <div
      style={{
        minWidth: 0,
        width: 0,
        flex: "1 1 0%",
        textAlign: "left",
      }}
    >
      <div
        style={{
          display: "block",
          width: "100%",
          minWidth: 0,
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 700,
          lineHeight: "1.2",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          visibility: "visible",
          opacity: 1,
        }}
      >
        {String(match.awayTeam || "Away")}
      </div>
    </div>
  </div>
</div>
