export default function Home() {
  return (
    <main>
      <header>
        <h1>GoGoalMatch</h1>
        <nav>
          <a href="/">Live</a>
          <a href="/matches">Matches</a>
          <a href="/results">Results</a>
          <a href="/standings">Standings</a>
          <a href="/stats">Stats</a>
        </nav>
      </header>
      <section>
        <h2>LIVE MATCHES</h2>
        <div>
          <p>Manchester United vs Chelsea</p>
          <strong>2 - 1</strong>
          <small>72'</small>
        </div>
        <div>
          <p>Real Madrid vs Barcelona</p>
          <strong>1 - 1</strong>
          <small>58'</small>
        </div>
        <div>
          <p>Galatasaray vs Fenerbahce</p>
          <strong>0 - 0</strong>
          <small>34'</small>
        </div>
      </section>
      <section>
        <h2>UPCOMING MATCHES</h2>
        <div>
          <p>Liverpool vs Arsenal</p>
          <small>20:00</small>
        </div>
        <div>
          <p>Inter vs Juventus</p>
          <small>21:45</small>
        </div>
      </section>
    </main>
  );
}
