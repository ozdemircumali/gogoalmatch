“use client”;

import { useEffect, useState } from “react”;
import { useParams } from “next/navigation”;
import Link from “next/link”;

type MatchDetail = {
fixture: {
id: number;
date: string;
status: {
long: string;
short: string;
elapsed: number | null;
};
};
league: {
name: string;
country: string;
logo: string;
};
teams: {
home: { id: number; name: string; logo: string; winner: boolean | null };
away: { id: number; name: string; logo: string; winner: boolean | null };
};
goals: {
home: number | null;
away: number | null;
};
score: {
halftime: { home: number | null; away: number | null };
fulltime: { home: number | null; away: number | null };
};
events?: Array<{
time: { elapsed: number; extra?: number };
team: { id: number; name: string };
player: { name: string };
assist?: { name: string };
type: string;
detail: string;
}>;
statistics?: Array<{
team: { id: number; name: string };
statistics: Array<{
type: string;
value: number | string | null;
}>;
}>;
lineups?: Array<{
team: { id: number; name: string };
formation: string;
startXI: Array<{
player: {
id: number;
name: string;
number: number;
pos: string;
};
}>;
substitutes: Array<{
player: {
id: number;
name: string;
number: number;
pos: string;
};
}>;
}>;
};

const LIVE_STATUSES = [“1H”, “2H”, “HT”, “ET”, “BT”, “P”];
const FINISHED_STATUSES = [“FT”, “AET”, “PEN”];

type SubTab = “SUMMARY” | “STATS” | “LINEUPS”;

export default function MatchDetailPage() {
const params = useParams();
const id = params?.id;

const [match, setMatch] = useState<MatchDetail | null>(null);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState(“SUMMARY”);

async function loadMatchDetail() {
if (!id) return;

try {
  const response = await fetch(`/api/fixtures/${id}`, {
    cache: "no-store",
  });
  const data = await response.json();
  if (data.response && data.response.length > 0) {
    setMatch(data.response[0]);
  }
} catch (error) {
  console.error("Failed to load match detail:", error);
} finally {
  setLoading(false);
}

}

useEffect(() => {
loadMatchDetail();

const interval = setInterval(loadMatchDetail, 30000);
return () => clearInterval(interval);

}, [id]);

if (loading) {
return (
Maç detayları yükleniyor…
);
}

if (!match) {
return (
Maç bilgisi bulunamadı veya silinmiş.
    <Link
      href="/"
      className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
    >
      Ana Sayfaya Dön
    </Link>
  </div>
);

}

const isLive = LIVE_STATUSES.includes(match.fixture.status.short);
const isFinished = FINISHED_STATUSES.includes(match.fixture.status.short);

const statusText = isLive
? match.fixture.status.elapsed != null
? ${match.fixture.status.elapsed}'
: match.fixture.status.short
: isFinished
? “MS”
: new Date(match.fixture.date).toLocaleTimeString([], {
hour: “2-digit”,
minute: “2-digit”,
});

return (
← Maçlara Dön
      <div className="flex items-center gap-2 min-w-0">
        {match.league.logo && (
          <img
            src={match.league.logo}
            alt=""
            width={16}
            height={16}
            className="!w-4 !h-4 max-w-4 max-h-4 object-contain shrink-0"
          />
        )}
        <span className="text-xs font-black text-white truncate max-w-[200px]">
          {match.league.name}
        </span>
      </div>
    </div>
  </header>
  <div className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
    <div className="bg-[#12161c] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600" />
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex-1 min-w-0 flex flex-col items-center text-center gap-2.5">
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <img
              src={match.teams.home.logo}
              alt={match.teams.home.name}
              width={56}
              height={56}
              className="!w-14 !h-14 max-w-14 max-h-14 object-contain drop-shadow-md"
            />
          </div>
          <span className="text-sm font-black text-white leading-tight max-w-[130px]">
            {match.teams.home.name}
          </span>
        </div>
        <div className="px-2 sm:px-6 text-center shrink-0">
          {!isLive && !isFinished ? (
            <div className="text-lg font-black text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded-xl tracking-wider">
              {statusText}
            </div>
          ) : (
            <div>
              <div className="text-3xl font-black text-white tracking-widest whitespace-nowrap">
                {match.goals.home ?? 0} - {match.goals.away ?? 0}
              </div>
              <div
                className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                  isLive
                    ? "text-orange-500 animate-pulse"
                    : "text-slate-400"
                }`}
              >
                {statusText}
              </div>
              {match.score.halftime.home != null && (
                <div className="text-[10px] text-slate-500 mt-1 whitespace-nowrap">
                  (İY: {match.score.halftime.home} -{" "}
                  {match.score.halftime.away})
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col items-center text-center gap-2.5">
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <img
              src={match.teams.away.logo}
              alt={match.teams.away.name}
              width={56}
              height={56}
              className="!w-14 !h-14 max-w-14 max-h-14 object-contain drop-shadow-md"
            />
          </div>
          <span className="text-sm font-black text-white leading-tight max-w-[130px]">
            {match.teams.away.name}
          </span>
        </div>
      </div>
    </div>
    <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
      <SubTabButton
        active={activeTab === "SUMMARY"}
        onClick={() => setActiveTab("SUMMARY")}
      >
        Anlatım & Özet
      </SubTabButton>
      <SubTabButton
        active={activeTab === "STATS"}
        onClick={() => setActiveTab("STATS")}
      >
        İstatistikler
      </SubTabButton>
      <SubTabButton
        active={activeTab === "LINEUPS"}
        onClick={() => setActiveTab("LINEUPS")}
      >
        İlk 11'ler
      </SubTabButton>
    </div>
    <div className="bg-[#12161c] border border-slate-800/80 rounded-2xl p-5 shadow-xl min-h-[300px]">
      {activeTab === "SUMMARY" && (
        <MatchSummary
          events={match.events || []}
          homeId={match.teams.home.id}
        />
      )}
      {activeTab === "STATS" && (
        <MatchStatistics statistics={match.statistics || []} />
      )}
      {activeTab === "LINEUPS" && (
        <MatchLineups
          lineups={match.lineups || []}
          homeId={match.teams.home.id}
        />
      )}
    </div>
  </div>
</main>

);
}

function SubTabButton({
active,
children,
onClick,
}: {
active: boolean;
children: React.ReactNode;
onClick: () => void;
}) {
return (
<button
onClick={onClick}
className={px-4 py-2 rounded-xl text-xs font-extrabold tracking-wider transition-all whitespace-nowrap ${ active ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 border border-orange-500" : "bg-[#181d26] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700" }}
>
{children}
);
}

function MatchSummary({
events,
homeId,
}: {
events: MatchDetail[“events”];
homeId: number;
}) {
if (!events || events.length === 0) {
return (
Bu maç için henüz olay verisi bulunmuyor.
);
}

return (
{events.map((event, index) => {
const isHome = event.team.id === homeId;
const isGoal = event.type.toLowerCase() === “goal”;
const isCard = event.type.toLowerCase() === “card”;

    return (
      <div
        key={index}
        className={`flex items-center gap-3 ${
          isHome ? "flex-row" : "flex-row-reverse text-right"
        }`}
      >
        <div className="w-10 shrink-0 text-center font-black text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 py-1 rounded-lg">
          {event.time.elapsed}'
        </div>
        <div
          className={`flex items-center gap-2 flex-1 bg-[#181d26] border border-slate-800/80 px-4 py-2.5 rounded-xl ${
            isHome ? "" : "flex-row-reverse"
          }`}
        >
          <span className="text-base">
            {isGoal
              ? "⚽"
              : isCard
                ? event.detail.includes("Red")
                  ? "🟥"
                  : "🟨"
                : "🔄"}
          </span>
          <div>
            <div className="text-xs font-bold text-white">
              {event.player.name}
            </div>
            {event.assist && (
              <div className="text-[10px] text-slate-400">
                Asist: {event.assist.name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  })}
</div>

);
}

function MatchStatistics({
statistics,
}: {
statistics: MatchDetail[“statistics”];
}) {
if (!statistics || statistics.length < 2) {
return (
İstatistik verisi bulunmuyor.
);
}

const homeStats = statistics[0].statistics;
const awayStats = statistics[1].statistics;

return (
{homeStats.map((item, idx) => {
const awayItem = awayStats[idx];

    const homeVal = Number(item.value) || 0;
    const awayVal = Number(awayItem?.value) || 0;
    const total =
      homeVal + awayVal === 0 ? 1 : homeVal + awayVal;
    const homePercent = Math.round((homeVal / total) * 100);
    return (
      <div key={idx} className="space-y-1">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-white">{item.value ?? 0}</span>
          <span className="text-slate-400 text-[11px] uppercase tracking-wider text-center">
            {item.type}
          </span>
          <span className="text-white">
            {awayItem?.value ?? 0}
          </span>
        </div>
        <div className="flex h-2 bg-slate-800 rounded-full overflow-hidden gap-1">
          <div
            className="bg-orange-500 transition-all duration-500 rounded-l-full"
            style={{ width: `${homePercent}%` }}
          />
          <div className="bg-slate-600 transition-all duration-500 rounded-r-full flex-1" />
        </div>
      </div>
    );
  })}
</div>

);
}

function MatchLineups({
lineups,
homeId,
}: {
lineups: MatchDetail[“lineups”];
homeId: number;
}) {
if (!lineups || lineups.length === 0) {
return (
Kadro verileri henüz açıklanmadı.
);
}

const homeLineup =
lineups.find((l) => l.team.id === homeId) || lineups[0];

const awayLineup =
lineups.find((l) => l.team.id !== homeId) || lineups[1];

return (
  <TeamLineupBox
    title="Deplasman İlk 11"
    lineup={awayLineup}
  />
</div>

);
}

function TeamLineupBox({
title,
lineup,
}: {
title: string;
lineup: any;
}) {
if (!lineup) {
return (
Kadro yok
);
}

return (
{title}
    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
      Diziliş: {lineup.formation}
    </span>
  </div>
  <div className="space-y-1.5">
    {lineup.startXI?.map((item: any, idx: number) => (
      <div
        key={idx}
        className="flex items-center gap-3 text-xs"
      >
        <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-orange-400">
          {item.player.number}
        </span>
        <span className="text-slate-200 font-medium">
          {item.player.name}
        </span>
        <span className="text-[9px] text-slate-500 ml-auto">
          {item.player.pos}
        </span>
      </div>
    ))}
  </div>
</div>

);
}