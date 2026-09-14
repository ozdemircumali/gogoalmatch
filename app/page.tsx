{/* TEAM ROW - TEAM NAMES FIX */}
<div
  style={{
    width: "100%",
    minWidth: 0,
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) 38px 72px 38px minmax(0, 1fr)",
    alignItems: "center",
    columnGap: "6px",
  }}
>
  {/* HOME TEAM NAME */}
  <div
    style={{
      width: "100%",
      minWidth: 0,
      display: "block",
      textAlign: "right",
      overflow: "visible",
    }}
  >
    <span
      style={{
        display: "block",
        width: "100%",
        minWidth: 0,
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 800,
        lineHeight: "18px",
        textAlign: "right",
        whiteSpace: "normal",
        overflow: "visible",
        textOverflow: "clip",
        overflowWrap: "break-word",
        wordBreak: "normal",
        visibility: "visible",
        opacity: 1,
      }}
    >
      {match.homeTeam}
    </span>
  </div>

  {/* HOME LOGO */}
  <div
    style={{
      width: "38px",
      height: "38px",
      minWidth: "38px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {match.homeLogo ? (
      <img
        src={match.homeLogo}
        alt={match.homeTeam}
        width={38}
        height={38}
        style={{
          display: "block",
          width: "38px",
          height: "38px",
          objectFit: "contain",
        }}
      />
    ) : (
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
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
            color: "#f87171",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "1px",
          }}
        >
          LIVE
        </div>

        <div
          style={{
            color: "#ffffff",
            fontSize: "21px",
            fontWeight: 900,
            lineHeight: "24px",
            whiteSpace: "nowrap",
          }}
        >
          {match.homeScore}
          <span
            style={{
              color: "#64748b",
              margin: "0 4px",
            }}
          >
            -
          </span>
          {match.awayScore}
        </div>

        <div
          style={{
            marginTop: "4px",
            color: "#34d399",
            fontSize: "10px",
            fontWeight: 800,
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
            color: "#64748b",
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: "1px",
          }}
        >
          FT
        </div>

        <div
          style={{
            color: "#ffffff",
            fontSize: "21px",
            fontWeight: 900,
            lineHeight: "24px",
            whiteSpace: "nowrap",
          }}
        >
          {match.homeScore}
          <span
            style={{
              color: "#64748b",
              margin: "0 4px",
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
            color: "#60a5fa",
            fontSize: "9px",
            fontWeight: 900,
            letterSpacing: "0.5px",
          }}
        >
          UPCOMING
        </div>

        <div
          style={{
            color: "#cbd5e1",
            fontSize: "13px",
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {match.minute}
        </div>
      </>
    )}
  </div>

  {/* AWAY LOGO */}
  <div
    style={{
      width: "38px",
      height: "38px",
      minWidth: "38px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {match.awayLogo ? (
      <img
        src={match.awayLogo}
        alt={match.awayTeam}
        width={38}
        height={38}
        style={{
          display: "block",
          width: "38px",
          height: "38px",
          objectFit: "contain",
        }}
      />
    ) : (
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          background: "#1e293b",
        }}
      />
    )}
  </div>

  {/* AWAY TEAM NAME */}
  <div
    style={{
      width: "100%",
      minWidth: 0,
      display: "block",
      textAlign: "left",
      overflow: "visible",
    }}
  >
    <span
      style={{
        display: "block",
        width: "100%",
        minWidth: 0,
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 800,
        lineHeight: "18px",
        textAlign: "left",
        whiteSpace: "normal",
        overflow: "visible",
        textOverflow: "clip",
        overflowWrap: "break-word",
        wordBreak: "normal",
        visibility: "visible",
        opacity: 1,
      }}
    >
      {match.awayTeam}
    </span>
  </div>
</div>
