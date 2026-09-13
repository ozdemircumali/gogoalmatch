export type LeagueItem = {
  id: number;
  name: string;
  country: string;
  slug: string;
};

export const LEAGUES: LeagueItem[] = [
  // ENGLAND
  { id: 39, name: "Premier League", country: "England", slug: "premier-league" },
  { id: 40, name: "Championship", country: "England", slug: "championship" },
  { id: 41, name: "League One", country: "England", slug: "league-one" },
  { id: 42, name: "League Two", country: "England", slug: "league-two" },

  // SPAIN
  { id: 140, name: "La Liga", country: "Spain", slug: "la-liga" },
  { id: 141, name: "La Liga 2", country: "Spain", slug: "la-liga-2" },

  // ITALY
  { id: 135, name: "Serie A", country: "Italy", slug: "serie-a" },
  { id: 136, name: "Serie B", country: "Italy", slug: "serie-b" },

  // GERMANY
  { id: 78, name: "Bundesliga", country: "Germany", slug: "bundesliga" },
  { id: 79, name: "2. Bundesliga", country: "Germany", slug: "2-bundesliga" },
  { id: 80, name: "3. Liga", country: "Germany", slug: "3-liga" },

  // FRANCE
  { id: 61, name: "Ligue 1", country: "France", slug: "ligue-1" },
  { id: 62, name: "Ligue 2", country: "France", slug: "ligue-2" },

  // TURKEY
  { id: 203, name: "Super Lig", country: "Turkey", slug: "super-lig" },
  { id: 204, name: "1. Lig", country: "Turkey", slug: "1-lig" },

  // NETHERLANDS
  { id: 88, name: "Eredivisie", country: "Netherlands", slug: "eredivisie" },
  { id: 89, name: "Eerste Divisie", country: "Netherlands", slug: "eerste-divisie" },

  // PORTUGAL
  { id: 94, name: "Primeira Liga", country: "Portugal", slug: "primeira-liga" },
  { id: 95, name: "Liga Portugal 2", country: "Portugal", slug: "liga-portugal-2" },

  // ARGENTINA
  { id: 128, name: "Liga Profesional", country: "Argentina", slug: "liga-profesional" },
  { id: 129, name: "Primera Nacional", country: "Argentina", slug: "primera-nacional" },

  // BRAZIL
  { id: 71, name: "Serie A", country: "Brazil", slug: "serie-a" },
  { id: 72, name: "Serie B", country: "Brazil", slug: "serie-b" },
  { id: 73, name: "Serie C", country: "Brazil", slug: "serie-c" },

  // COLOMBIA
  { id: 239, name: "Primera A", country: "Colombia", slug: "primera-a" },
  { id: 240, name: "Primera B", country: "Colombia", slug: "primera-b" },

  // MEXICO
  { id: 262, name: "Liga MX", country: "Mexico", slug: "liga-mx" },
  { id: 263, name: "Liga de Expansion MX", country: "Mexico", slug: "liga-de-expansion-mx" },
];
