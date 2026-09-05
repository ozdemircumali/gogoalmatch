export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#f5f6f8",
      fontFamily: "Arial, sans-serif",
      color: "#111827"
    }}>

      <header style={{
        background: "#111827",
        color: "white",
        padding: "18px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "26px"
        }}>
          GoGoalMatch
        </h1>

        <nav style={{
          display: "flex",
          gap: "22px",
          flexWrap: "wrap"
        }}>
          <a href="/" style={{ color: "white", textDecoration: "none" }}>Live</a>
          <a href="/matches" style={{ color: "white", textDecoration: "none" }}>Matches</a>
          <a href="/results" style={{ color: "white", textDecoration: "none" }}>Results</a>
          <a href="/standings" style={{ color: "white", textDecoration: "none" }}>Standings</a>
          <a href="/stats" style={{ color: "white", textDecoration: "none" }}>Stats</a>
        </nav>
      </header>

      <section style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px 20px"
      }}>

        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "25px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <h2 style={{ marginTop: 0 }}>LIVE MATCHES</h2>

          <div style={{
            borderTop: "1px solid #e5e7eb",
            padding: "18px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <strong>Manchester United</strong>
              <br />
              Chelsea
            </div>

            <div style={{ textAlign: "center" }}>
              <strong style={{ fontSize: "24px" }}>2 - 1</strong>
              <br />
              <span style={{ color: "#dc2626" }}>72'</span>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid #e5e7eb",
            padding: "18px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <strong>Real Madrid</strong>
              <br />
              Barcelona
            </div>

            <div style={{ textAlign: "center" }}>
              <strong style={{ fontSize: "24px" }}>1 - 1</strong>
              <br />
              <span style={{ color: "#dc2626" }}>58'</span>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid #e5e7eb",
            padding: "18px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <strong>Galatasaray</strong>
              <br />
              Fenerbahce
            </div>

            <div style={{ textAlign: "center" }}>
              <strong style={{ fontSize: "24px" }}>0 - 0</strong>
              <br />
              <span style={{ color: "#dc2626" }}>34'</span>
            </div>
          </div>
        </div>

        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <h2 style={{ marginTop: 0 }}>UPCOMING MATCHES</h2>

          <div style={{
            borderTop: "1px solid #e5e7eb",
            padding: "18px 0",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <strong>Liverpool vs Arsenal</strong>
            <span>20:00</span>
          </div>

          <div style={{
            borderTop: "1px solid #e5e7eb",
            padding: "18px 0",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <strong>Inter vs Juventus</strong>
            <span>21:45</span>
          </div>
        </div>

      </section>

    </main>
  );
}
