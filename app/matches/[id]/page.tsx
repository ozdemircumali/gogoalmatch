import React from 'react';

interface MatchPageProps {
  params: {
    id: string;
  };
}

// Doğrudan API-Football'dan maç detayını çeken fonksiyon
async function getMatchDataDirect(id: string) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    console.error('API_FOOTBALL_KEY Vercel üzerinde tanımlı değil!');
    return null;
  }

  try {
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=${id}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': apiKey,
      },
      next: { revalidate: 30 }, // 30 saniyede bir önbellek tazeleme
    });

    if (!res.ok) {
      console.error(`API-Football HTTP Hatası: ${res.status}`);
      return null;
    }

    const data = await res.json();

    // API-Football veriyi "response" dizisinde döner
    if (!data.response || data.response.length === 0) {
      console.warn(`ID: ${id} için maç bulunamadı.`);
      return null;
    }

    return data.response[0];
  } catch (error) {
    console.error('Maç verisi çekilirken hata oluştu:', error);
    return null;
  }
}

export default async function MatchDetailPage({ params }: MatchPageProps) {
  const matchId = params.id;
  const match = await getMatchDataDirect(matchId);

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center p-4">
        <h1 className="text-2xl font-bold text-red-500">Match Not Found</h1>
        <p className="text-gray-400 max-w-md">
          Maç bilgisi alınamadı. (Maç ID: <code className="text-amber-400">{matchId}</code>)
        </p>
        <span className="text-xs text-gray-500">
          Lütfen Vercel panelinde `API_FOOTBALL_KEY` ortam değişkeninin ekli olduğunu ve maç ID'sinin geçerliliğini kontrol edin.
        </span>
      </div>
    );
  }

  const { fixture, teams, goals, league } = match;

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Lig & Stadyum */}
      <div className="text-center border-b border-gray-800 pb-4">
        <h2 className="text-lg font-semibold text-white">{league?.name}</h2>
        <p className="text-sm text-gray-400">{fixture.venue?.name} - {fixture.status.long}</p>
      </div>

      {/* Skor Skorbordu */}
      <div className="flex items-center justify-around bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800">
        {/* Ev Sahibi */}
        <div className="flex flex-col items-center gap-2 w-1/3 text-center">
          <img src={teams.home.logo} alt={teams.home.name} className="w-16 h-16 object-contain" />
          <span className="font-bold text-base md:text-lg">{teams.home.name}</span>
        </div>

        {/* Skor Bilgisi */}
        <div className="flex flex-col items-center w-1/3">
          <div className="text-3xl md:text-5xl font-extrabold tracking-wider">
            {goals.home ?? 0} - {goals.away ?? 0}
          </div>
          <span className="text-xs text-green-400 font-mono mt-2 bg-green-950/50 px-2 py-1 rounded border border-green-800/50">
            {fixture.status.elapsed ? `${fixture.status.elapsed}'` : fixture.status.short}
          </span>
        </div>

        {/* Deplasman */}
        <div className="flex flex-col items-center gap-2 w-1/3 text-center">
          <img src={teams.away.logo} alt={teams.away.name} className="w-16 h-16 object-contain" />
          <span className="font-bold text-base md:text-lg">{teams.away.name}</span>
        </div>
      </div>
    </main>
  );
}
