export default function Home() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>GoGoalMatch</h1>
      <p>Live Scores • Results • Statistics</p>

      <nav style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
        <a href="#">LIVE</a>
        <a href="#">Matches</a>
        <a href="#">Results</a>
        <a href="#">Standings</a>
        <a href="#">Statistics</a>
      </nav>

      <section style={{ marginTop: "50px" }}>
        <h2>Live Matches</h2>
        <p>No live matches available.</p>
      </section>
    </main>
  );
}
