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

    if (!groups[key]) groups[key] = [];
    groups[key].push(match);
  });

  return Object.values(groups);
}

export default function Home()
