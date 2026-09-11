export default function MatchesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
      }}
    >
      <header
        style={{
          background: "#111827",
          color: "white",
          padding: "18px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <a
            href="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            GoGoalMatch
          </a>

          <a
            href="/"
            style={{
              color: "white",
              textDecoration: "none",
            }}
          >
            ← Home
          </a>
        </div>
      </header>

      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "30px 20px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "14px",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1 style={{ marginTop: 0 }}>Today's Matches</h1>

          <p style={{ color: "#6b7280" }}>
            Today's upcoming football matches will appear here.
          </p>

          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: "15px",
              background: "#111827",
              color: "white",
              padding: "11px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            View All Matches
          </a>
        </div>
      </section>
    </main>
  );
}
