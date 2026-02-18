/**
 * liveResultsService.ts — Client-side live results fetcher
 *
 * Runs entirely in the browser. No serverless functions needed.
 * Primary: hardcoded CONFIRMED_RESULTS (100% reliable baseline).
 * Secondary: Wikipedia API scraper (CORS-enabled, auto-discovers new results).
 *
 * The auto-import in App.tsx runs every 30 minutes. Any NEW results found by
 * the Wikipedia scraper get written to Firebase and persist forever — no code
 * push needed for ongoing updates.
 */

import { MedalResult } from './types';

// ── Confirmed results from official sources (Wikipedia-verified) ─────
// FORMAT: [eventId, gold, silver, bronze]
// These serve as a reliable baseline. Wikipedia scraper adds new events on top.
const CONFIRMED_RESULTS: [string, string, string, string][] = [
  // Day 1 — Feb 7
  ["ALP-1",    "SUI", "ITA", "ITA"],     // Men's Downhill: von Allmen, Franzoni, Paris
  ["SPEED-11", "ITA", "NOR", "CAN"],     // Women's 3000m: Lollobrigida, Wiklund, Maltais
  ["SKI-4",    "NOR", "SLO", "JPN"],     // Women's NH Ski Jumping: Strøm, Prevc, Maruyama
  ["SNOW-3",   "JPN", "JPN", "CHN"],     // Men's Snowboard Big Air: Kimura, Kimata, Su Yiming
  ["XC-9",     "SWE", "SWE", "NOR"],     // Women's Skiathlon: Karlsson, Andersson, Weng

  // Day 2 — Feb 8
  ["ALP-6",    "USA", "GER", "ITA"],     // Women's Downhill: Johnson, Aicher, Goggia
  ["FIG-5",    "USA", "JPN", "ITA"],     // Figure Skating Team Event
  ["XC-3",     "NOR", "FRA", "NOR"],     // Men's Skiathlon: Klæbo, Desloges, Nyenget
  ["SPEED-4",  "NOR", "CZE", "ITA"],     // Men's 5000m: Eitrem, Jílek, Lorello
  ["SNOW-4",   "AUT", "KOR", "BUL"],     // Men's PGS: Karl, Kim, Zamfirov
  ["SNOW-9",   "CZE", "AUT", "ITA"],     // Women's PGS: Maderová
  ["LUG-1",    "GER", "AUT", "ITA"],     // Men's Luge Singles: Langenhan, Mueller, Fischnaller
  ["BIA-11",   "FRA", "ITA", "GER"],     // Biathlon Mixed Relay: France, Italy, Germany

  // Day 3 — Feb 9
  ["FREE-10",  "SUI", "CHN", "CAN"],     // Women's Freeski Slopestyle: Gremaud, Gu, Oldham
  ["SPEED-9",  "NED", "NED", "JPN"],     // Women's 1000m: Leerdam, Kok, Takagi
  ["SNOW-8",   "JPN", "NZL", "KOR"],     // Women's Snowboard Big Air: Murase, Sadowski-Synnott, Yu
  ["SKI-1",    "GER", "POL", "JPN"],     // Men's NH Ski Jumping: Raimund, Tomasiak, Nikaido
  ["ALP-5",    "SUI", "AUT", "SUI"],     // Men's Combined: von Allmen, Kriechmayr, Odermatt

  // Day 4 — Feb 10
  ["ALP-10",   "AUT", "GER", "USA"],     // Women's Team Combined
  ["BIA-2",    "NOR", "FRA", "NOR"],     // Men's 20km Individual: Botn, Perrot, Laegreid
  ["XC-1",     "NOR", "USA", "NOR"],     // Men's Sprint Classical
  ["XC-7",     "SWE", "SWE", "SWE"],     // Women's Sprint Classical (podium sweep!)
  ["CUR-3",    "SWE", "USA", "ITA"],     // Mixed Doubles Curling
  ["FREE-4",   "NOR", "USA", "NZL"],     // Men's Freeski Slopestyle
  ["LUG-2",    "GER", "LAT", "USA"],     // Women's Luge Singles
  ["SHORT-9",  "ITA", "CAN", "BEL"],     // Short Track Mixed Team Relay
  ["SKI-5",    "SLO", "NOR", "JPN"],     // Ski Jumping Mixed Team

  // Day 5 — Feb 11
  ["ALP-2",    "SUI", "USA", "SUI"],     // Men's Super-G: von Allmen, Cochran-Siegle, Odermatt
  ["BIA-7",    "FRA", "FRA", "BUL"],     // Women's 15km Individual: Simon, Jeanmonnot, Hristova
  ["FIG-4",    "FRA", "USA", "CAN"],     // Ice Dance: Cizeron/Fournier Beaudry, Chock/Bates, Gilles/Poirier
  ["FREE-8",   "USA", "USA", "FRA"],     // Women's Moguls: Lemley, Kauf, Laffont
  ["LUG-3",    "ITA", "AUT", "GER"],     // Men's Luge Doubles: Rieder/Kainzwaldner, Steu/Kindl, Wendl/Arlt
  ["LUG-3B",   "ITA", "GER", "AUT"],     // Women's Luge Doubles: Voetter/Oberhofer, Eitberger/Matschina, Egle/Kipp
  ["NOR-1",    "NOR", "AUT", "FIN"],     // Nordic Combined NH: Oftebrø, Lamparter, Hirvonen
  ["SPEED-2",  "USA", "NED", "CHN"],     // Men's 1000m: Stolz, de Boo, Ning Zhongyan

  // Day 6 — Feb 12
  ["ALP-7",    "ITA", "FRA", "AUT"],     // Women's Super-G: Brignone, Miradoli, Hütter
  ["FREE-2",   "AUS", "CAN", "JPN"],     // Men's Moguls: Woods, Kingsbury, Horishima
  ["LUG-4",    "GER", "GER", "AUT"],     // Luge Team Relay: Germany gold
  ["SHORT-5",  "NED", "ITA", "CAN"],     // Short Track Women's 500m: Velzeboer, Fontana, Sarault
  ["SHORT-2",  "NED", "CHN", "NED"],     // Short Track Men's 1000m: van 't Wout, Sun Long
  ["SNOW-6",   "KOR", "USA", "JPN"],     // Women's Snowboard Halfpipe: Choi, Kim, Ono
  ["SPEED-12", "ITA", "NED", "NOR"],     // Women's 5000m: Lollobrigida, Conijn, Wiklund
  ["XC-8",     "SWE", "SWE", "USA"],     // Women's 10km: Karlsson, Andersson, Diggins

  // Day 7 — Feb 13
  ["BIA-1",    "FRA", "NOR", "NOR"],     // Men's 10km Sprint: Fillon Maillet, Christiansen, Laegreid
  ["FIG-1",    "KAZ", "JPN", "JPN"],     // Men's Figure Skating: Shaidorov, Kagiyama, Sato
  ["SKEL-1",   "GBR", "GER", "GER"],     // Men's Skeleton: Weston, Jungk, Grotheer
  ["SNOW-1",   "JPN", "AUS", "JPN"],     // Men's Snowboard Halfpipe: Totsuka, James, Yamada
  ["SNOW-10",  "AUS", "CZE", "ITA"],     // Women's Snowboard Cross: Baff, Adamczyková, Moioli
  ["SPEED-5",  "CZE", "POL", "NED"],     // Men's 10000m: Jílek, Semirunniy, Bergsma
  ["XC-2",     "NOR", "FRA", "NOR"],     // Men's 10km: Klæbo, Desloges, Hedegart

  // Day 8 — Feb 14
  ["ALP-3",    "BRA", "SUI", "SUI"],     // Men's Giant Slalom: Braathen, Odermatt, Meillard
  ["BIA-6",    "NOR", "FRA", "FRA"],     // Women's 7.5km Sprint: Kirkeeide, Michelon, Jeanmonnot
  ["FREE-15",  "AUS", "USA", "USA"],     // Women's Dual Moguls: Anthony, Kauf, Lemley
  ["SHORT-3",  "NED", "KOR", "LAT"],     // Short Track Men's 1500m: van 't Wout, Hwang, Kruzbergs
  ["SKEL-2",   "AUT", "GER", "GER"],     // Women's Skeleton: Flock, Kreher, Pfeifer
  ["SPEED-1",  "USA", "NED", "CAN"],     // Men's 500m: Stolz, de Boo, Dubreuil
  ["SKI-2",    "SLO", "JPN", "POL"],     // Men's LH Ski Jumping: Prevc, Nikaido, Tomasiak
  ["XC-12",    "NOR", "SWE", "FIN"],     // Women's 4x7.5km Relay: Norway, Sweden, Finland

  // Day 9 — Feb 15
  ["ALP-8",    "ITA", "NOR", "SWE"],     // Women's Giant Slalom: Brignone, Stjernesund, Hector (wiki: shared silver SWE+NOR)
  ["BIA-3",    "SWE", "NOR", "FRA"],     // Men's 12.5km Pursuit: Ponsiluoma, Laegreid, Jacquelin
  ["BIA-8",    "ITA", "NOR", "FIN"],     // Women's 10km Pursuit: Vittozzi, Kirkeeide, Minkkinen
  ["FREE-14",  "CAN", "JPN", "AUS"],     // Men's Dual Moguls: Kingsbury, Horishima, Graham
  ["XC-6",     "NOR", "FRA", "ITA"],     // Men's 4x7.5km Relay: Norway, France, Italy

  // Day 10 — Feb 16
  ["ALP-4",    "SUI", "AUT", "NOR"],     // Men's Slalom: Meillard, Gstrein, Kristoffersen
  ["BOB-1",    "GER", "GER", "GER"],     // Men's Two-man Bobsleigh: Lochner, Friedrich, Ammour
  ["FREE-5",   "NOR", "USA", "AUT"],     // Men's Freeski Big Air: Frostad, Forehand, Švancer
  ["FREE-11",  "CAN", "CHN", "ITA"],     // Women's Freeski Big Air: Oldham, Gu, Tabanelli
  ["NOR-2",    "NOR", "AUT", "FIN"],     // Nordic Combined LH: Oftebro, Lamparter, Herola
  ["SNOW-5",   "AUT", "CAN", "AUT"],     // Men's Snowboard Cross: Hämmerle, Grondin, Dusek
  ["BIA-5",    "FRA", "NOR", "SWE"],     // Men's Biathlon 4x7.5km Relay
  ["SKI-4B",   "NOR", "NOR", "SLO"],     // Women's LH Ski Jumping: Strøm, Kvandal, Prevc

  // Day 11 — Feb 17
  ["BOB-4",    "USA", "GER", "USA"],     // Women's Monobob: Meyers Taylor, Nolte, Humphries
  ["FIG-3",    "JPN", "GEO", "GER"],     // Figure Skating Pairs: Miura/Kihara, Metelkina/Berulava, Hase/Volodin
  ["SHORT-6",  "NED", "CAN", "KOR"],     // Short Track Women's 1000m: Velzeboer, Sarault, Kim
  ["SKEL-3",   "GBR", "GER", "GER"],     // Skeleton Mixed Team: GB, Germany, Germany
  ["SKI-3",    "AUT", "POL", "NOR"],     // Ski Jumping Men's LH Super Team
  ["SNOW-11",  "GBR", "ITA", "FRA"],     // Mixed Team Snowboard Cross
  ["SPEED-6",  "ITA", "USA", "CHN"],     // Men's Speed Skating Team Pursuit
  ["SPEED-8",  "NED", "NED", "JPN"],     // Women's Speed Skating 500m: Kok, Leerdam, Takagi
  ["SPEED-13", "CAN", "NED", "JPN"],     // Women's Speed Skating Team Pursuit

  // Corrections from Wikipedia updates
  ["SHORT-2",  "NED", "CHN", "KOR"],     // Short Track Men's 1000m: van 't Wout, Sun Long, Rim (was NED)
  ["LUG-4",    "GER", "AUT", "ITA"],     // Luge Team Relay: Germany, Austria, Italy (was GER/GER/AUT)
];

export interface FetchedResult {
  eventId: string;
  gold: string;
  silver: string;
  bronze: string;
  confidence: number;
  source: 'confirmed' | 'wikipedia';
}

/**
 * Fetch all known medal results (confirmed + Wikipedia scrape).
 * Returns results mapped to our event IDs.
 */
export async function fetchLiveResults(): Promise<{
  results: FetchedResult[];
  source: string;
  wikiCount: number;
  confirmedCount: number;
}> {
  const confirmed: FetchedResult[] = CONFIRMED_RESULTS.map(([eventId, gold, silver, bronze]) => ({
    eventId, gold, silver, bronze,
    confidence: 1.0,
    source: 'confirmed' as const,
  }));

  let wikiResults: FetchedResult[] = [];
  try {
    wikiResults = await scrapeWikipedia();
    console.log(`[LiveResults] Wikipedia returned ${wikiResults.length} results`);
  } catch (err: any) {
    console.warn(`[LiveResults] Wikipedia scrape failed: ${err.message}`);
  }

  // Merge: confirmed wins ties; wiki adds NEW events not in confirmed
  const resultMap = new Map<string, FetchedResult>();
  for (const r of confirmed) {
    resultMap.set(r.eventId, r);
  }
  for (const r of wikiResults) {
    if (r.eventId && !resultMap.has(r.eventId)) {
      resultMap.set(r.eventId, r);
    }
  }

  return {
    results: Array.from(resultMap.values()),
    source: wikiResults.length > 0 ? 'confirmed+wikipedia' : 'confirmed',
    wikiCount: wikiResults.length,
    confirmedCount: confirmed.length,
  };
}

/**
 * Get only NEW results that aren't already in the league.
 */
export function filterNewResults(
  fetched: FetchedResult[],
  existingResults: MedalResult[]
): FetchedResult[] {
  const existingIds = new Set(existingResults.map(r => r.eventId));
  return fetched.filter(r => r.eventId && !existingIds.has(r.eventId) && r.confidence >= 0.5);
}

// ── Wikipedia scraper (CORS-enabled, no serverless needed) ──────────

async function scrapeWikipedia(): Promise<FetchedResult[]> {
  const url = 'https://en.wikipedia.org/w/api.php?' + new URLSearchParams({
    action: 'parse',
    page: 'List_of_2026_Winter_Olympics_medal_winners',
    prop: 'wikitext',
    format: 'json',
    origin: '*',
  });

  const response = await fetch(url, {
    headers: { 'Api-User-Agent': 'GoldRush-OlympicFantasy/1.0' },
  });

  if (!response.ok) throw new Error(`Wikipedia API ${response.status}`);
  const data = await response.json();
  const wikitext: string = data?.parse?.wikitext?.['*'] || '';

  if (!wikitext || wikitext.length < 500) {
    throw new Error('Empty or too-short wikitext');
  }

  return parseWikitext(wikitext);
}

// ── Event ID mapping ───────────────────────────────────────────────

const EVENT_ID_MAP: Record<string, string> = {
  // Alpine Skiing
  "alpine skiing|men|downhill": "ALP-1",
  "alpine skiing|men|super-g": "ALP-2", "alpine skiing|men|super g": "ALP-2",
  "alpine skiing|men|giant slalom": "ALP-3",
  "alpine skiing|men|slalom": "ALP-4",
  "alpine skiing|men|combined": "ALP-5", "alpine skiing|men|team combined": "ALP-5",
  "alpine skiing|women|downhill": "ALP-6",
  "alpine skiing|women|super-g": "ALP-7", "alpine skiing|women|super g": "ALP-7",
  "alpine skiing|women|giant slalom": "ALP-8",
  "alpine skiing|women|slalom": "ALP-9",
  "alpine skiing|women|combined": "ALP-10", "alpine skiing|women|team combined": "ALP-10",
  // Biathlon
  "biathlon|men|sprint": "BIA-1", "biathlon|men|10km sprint": "BIA-1", "biathlon|men|10 kilometre sprint": "BIA-1",
  "biathlon|men|individual": "BIA-2", "biathlon|men|20km individual": "BIA-2", "biathlon|men|20 kilometre individual": "BIA-2",
  "biathlon|men|pursuit": "BIA-3", "biathlon|men|12.5km pursuit": "BIA-3", "biathlon|men|12.5 kilometre pursuit": "BIA-3",
  "biathlon|men|mass start": "BIA-4", "biathlon|men|15km mass start": "BIA-4", "biathlon|men|15 kilometre mass start": "BIA-4",
  "biathlon|men|relay": "BIA-5", "biathlon|men|4x7.5km relay": "BIA-5", "biathlon|men|4 x 7.5 kilometre relay": "BIA-5",
  "biathlon|women|sprint": "BIA-6", "biathlon|women|7.5km sprint": "BIA-6", "biathlon|women|7.5 kilometre sprint": "BIA-6",
  "biathlon|women|individual": "BIA-7", "biathlon|women|15km individual": "BIA-7", "biathlon|women|15 kilometre individual": "BIA-7",
  "biathlon|women|pursuit": "BIA-8", "biathlon|women|10km pursuit": "BIA-8", "biathlon|women|10 kilometre pursuit": "BIA-8",
  "biathlon|women|mass start": "BIA-9", "biathlon|women|12.5km mass start": "BIA-9", "biathlon|women|12.5 kilometre mass start": "BIA-9",
  "biathlon|women|relay": "BIA-10", "biathlon|women|4x6km relay": "BIA-10", "biathlon|women|4 x 6 kilometre relay": "BIA-10",
  "biathlon|mixed|mixed relay": "BIA-11", "biathlon|mixed|relay": "BIA-11",
  // Bobsleigh (wiki has no gender sections — gender inferred from event names)
  "bobsleigh|men|two-man": "BOB-1", "bobsleigh|men|two man": "BOB-1", "bobsled|men|two-man": "BOB-1", "bobsled|men|two man": "BOB-1",
  "bobsleigh|mixed|two-man": "BOB-1", "bobsleigh|mixed|two man": "BOB-1",
  "bobsleigh|men|four-man": "BOB-2", "bobsleigh|men|four man": "BOB-2", "bobsled|men|four-man": "BOB-2", "bobsled|men|four man": "BOB-2",
  "bobsleigh|mixed|four-man": "BOB-2", "bobsleigh|mixed|four man": "BOB-2",
  "bobsleigh|women|two-woman": "BOB-3", "bobsleigh|women|two woman": "BOB-3", "bobsled|women|two-woman": "BOB-3", "bobsled|women|two woman": "BOB-3",
  "bobsleigh|mixed|two-woman": "BOB-3", "bobsleigh|mixed|two woman": "BOB-3",
  "bobsleigh|women|monobob": "BOB-4", "bobsled|women|monobob": "BOB-4",
  "bobsleigh|mixed|women's monobob": "BOB-4", "bobsleigh|women|women's monobob": "BOB-4",
  // Curling
  "curling|men|tournament": "CUR-1", "curling|women|tournament": "CUR-2",
  "curling|mixed|mixed doubles": "CUR-3", "curling|mixed|doubles": "CUR-3",
  // Cross-Country Skiing
  "cross-country skiing|men|sprint": "XC-1", "cross-country skiing|men|sprint classic": "XC-1", "cross-country skiing|men|sprint classical": "XC-1",
  "cross-country skiing|men|10km": "XC-2", "cross-country skiing|men|10 kilometre freestyle": "XC-2", "cross-country skiing|men|10 kilometre": "XC-2",
  "cross-country skiing|men|skiathlon": "XC-3", "cross-country skiing|men|20 kilometre skiathlon": "XC-3",
  "cross-country skiing|men|50km": "XC-4", "cross-country skiing|men|50km mass start": "XC-4", "cross-country skiing|men|50 kilometre mass start freestyle": "XC-4", "cross-country skiing|men|50 kilometre": "XC-4",
  "cross-country skiing|men|50 kilometre classical": "XC-4",
  "cross-country skiing|men|team sprint": "XC-5", "cross-country skiing|men|team sprint freestyle": "XC-5",
  "cross-country skiing|men|relay": "XC-6", "cross-country skiing|men|4x7.5km relay": "XC-6", "cross-country skiing|men|4 x 10 kilometre relay": "XC-6",
  "cross-country skiing|men|4 x 7.5 kilometre relay": "XC-6",
  "cross-country skiing|women|sprint": "XC-7", "cross-country skiing|women|sprint classic": "XC-7", "cross-country skiing|women|sprint classical": "XC-7",
  "cross-country skiing|women|10km": "XC-8", "cross-country skiing|women|10 kilometre freestyle": "XC-8", "cross-country skiing|women|10 kilometre": "XC-8",
  "cross-country skiing|women|skiathlon": "XC-9", "cross-country skiing|women|20 kilometre skiathlon": "XC-9",
  "cross-country skiing|women|50km": "XC-10", "cross-country skiing|women|50km mass start": "XC-10", "cross-country skiing|women|50 kilometre mass start freestyle": "XC-10", "cross-country skiing|women|50 kilometre": "XC-10",
  "cross-country skiing|women|50 kilometre classical": "XC-10",
  "cross-country skiing|women|team sprint": "XC-11", "cross-country skiing|women|team sprint freestyle": "XC-11",
  "cross-country skiing|women|relay": "XC-12", "cross-country skiing|women|4x7.5km relay": "XC-12", "cross-country skiing|women|4 x 5 kilometre relay": "XC-12",
  "cross-country skiing|women|4 x 7.5 kilometre relay": "XC-12",
  // Figure Skating (wiki has no gender sections — gender inferred from event names)
  "figure skating|men|singles": "FIG-1", "figure skating|men|individual": "FIG-1",
  "figure skating|men|men's singles": "FIG-1",
  "figure skating|women|singles": "FIG-2", "figure skating|women|individual": "FIG-2",
  "figure skating|women|women's singles": "FIG-2",
  "figure skating|mixed|pairs": "FIG-3", "figure skating|mixed|pair skating": "FIG-3",
  "figure skating|mixed|ice dance": "FIG-4", "figure skating|mixed|dance": "FIG-4",
  "figure skating|mixed|team event": "FIG-5", "figure skating|mixed|team": "FIG-5",
  // Freestyle Skiing
  "freestyle skiing|men|aerials": "FREE-1", "freestyle|men|aerials": "FREE-1",
  "freestyle skiing|men|moguls": "FREE-2", "freestyle|men|moguls": "FREE-2",
  "freestyle skiing|men|halfpipe": "FREE-3", "freestyle|men|halfpipe": "FREE-3",
  "freestyle skiing|men|slopestyle": "FREE-4", "freestyle|men|slopestyle": "FREE-4",
  "freestyle skiing|men|big air": "FREE-5", "freestyle|men|big air": "FREE-5",
  "freestyle skiing|men|ski cross": "FREE-6", "freestyle|men|ski cross": "FREE-6",
  "freestyle skiing|men|dual moguls": "FREE-14", "freestyle|men|dual moguls": "FREE-14",
  "freestyle skiing|women|aerials": "FREE-7", "freestyle|women|aerials": "FREE-7",
  "freestyle skiing|women|moguls": "FREE-8", "freestyle|women|moguls": "FREE-8",
  "freestyle skiing|women|halfpipe": "FREE-9", "freestyle|women|halfpipe": "FREE-9",
  "freestyle skiing|women|slopestyle": "FREE-10", "freestyle|women|slopestyle": "FREE-10",
  "freestyle skiing|women|big air": "FREE-11", "freestyle|women|big air": "FREE-11",
  "freestyle skiing|women|ski cross": "FREE-12", "freestyle|women|ski cross": "FREE-12",
  "freestyle skiing|women|dual moguls": "FREE-15", "freestyle|women|dual moguls": "FREE-15",
  "freestyle skiing|mixed|team aerials": "FREE-13", "freestyle|mixed|team aerials": "FREE-13",
  // Ice Hockey
  "ice hockey|men|tournament": "ICE-1", "ice hockey|women|tournament": "ICE-2",
  // Luge (wiki has no gender sections — gender inferred from event names)
  "luge|men|singles": "LUG-1", "luge|men|men's singles": "LUG-1",
  "luge|women|singles": "LUG-2", "luge|women|women's singles": "LUG-2",
  "luge|men|doubles": "LUG-3", "luge|men|men's doubles": "LUG-3",
  "luge|women|doubles": "LUG-3B", "luge|women|women's doubles": "LUG-3B",
  "luge|mixed|team relay": "LUG-4", "luge|mixed|relay": "LUG-4",
  // Nordic Combined (wiki uses "Individual normal hill/10 km" etc.)
  "nordic combined|men|normal hill": "NOR-1", "nordic combined|men|individual normal hill": "NOR-1",
  "nordic combined|men|individual normal hill/10 km": "NOR-1",
  "nordic combined|men|large hill": "NOR-2", "nordic combined|men|individual large hill": "NOR-2",
  "nordic combined|men|individual large hill/10 km": "NOR-2",
  "nordic combined|men|team sprint": "NOR-3", "nordic combined|men|team large hill/2 x 7.5 km": "NOR-3",
  // Short Track
  "short track|men|500m": "SHORT-1", "short track speed skating|men|500m": "SHORT-1", "short track speed skating|men|500 metres": "SHORT-1",
  "short track|men|1000m": "SHORT-2", "short track speed skating|men|1000m": "SHORT-2", "short track speed skating|men|1000 metres": "SHORT-2",
  "short track|men|1500m": "SHORT-3", "short track speed skating|men|1500m": "SHORT-3", "short track speed skating|men|1500 metres": "SHORT-3",
  "short track|men|5000m relay": "SHORT-4", "short track|men|relay": "SHORT-4", "short track speed skating|men|5000 metre relay": "SHORT-4",
  "short track|women|500m": "SHORT-5", "short track speed skating|women|500m": "SHORT-5", "short track speed skating|women|500 metres": "SHORT-5",
  "short track|women|1000m": "SHORT-6", "short track speed skating|women|1000m": "SHORT-6", "short track speed skating|women|1000 metres": "SHORT-6",
  "short track|women|1500m": "SHORT-7", "short track speed skating|women|1500m": "SHORT-7", "short track speed skating|women|1500 metres": "SHORT-7",
  "short track|women|3000m relay": "SHORT-8", "short track|women|relay": "SHORT-8", "short track speed skating|women|3000 metre relay": "SHORT-8",
  "short track|mixed|mixed team relay": "SHORT-9", "short track|mixed|relay": "SHORT-9", "short track speed skating|mixed|mixed team relay": "SHORT-9",
  "short track speed skating|mixed|2000 metre relay": "SHORT-9", "short-track speed skating|mixed|2000 metre relay": "SHORT-9",
  // Skeleton (wiki has no gender sections — event names are "Men's", "Women's", "Mixed team")
  "skeleton|men|singles": "SKEL-1", "skeleton|men|individual": "SKEL-1",
  "skeleton|men|men's": "SKEL-1",
  "skeleton|women|singles": "SKEL-2", "skeleton|women|individual": "SKEL-2",
  "skeleton|women|women's": "SKEL-2",
  "skeleton|mixed|mixed team": "SKEL-3",
  // Ski Jumping
  "ski jumping|men|normal hill": "SKI-1", "ski jumping|men|individual normal hill": "SKI-1",
  "ski jumping|men|large hill": "SKI-2", "ski jumping|men|individual large hill": "SKI-2",
  "ski jumping|men|team": "SKI-3", "ski jumping|men|super team": "SKI-3", "ski jumping|men|team large hill": "SKI-3",
  "ski jumping|men|large hill super team": "SKI-3", "ski jumping|men|men's large hill super team": "SKI-3",
  "ski jumping|women|normal hill": "SKI-4", "ski jumping|women|individual normal hill": "SKI-4",
  "ski jumping|women|large hill": "SKI-4B", "ski jumping|women|individual large hill": "SKI-4B",
  "ski jumping|mixed|mixed team": "SKI-5", "ski jumping|mixed|team": "SKI-5", "ski jumping|mixed|mixed team normal hill": "SKI-5",
  // Ski Mountaineering
  "ski mountaineering|men|sprint": "SKMO-1", "ski mountaineering|women|sprint": "SKMO-2",
  "ski mountaineering|mixed|mixed relay": "SKMO-3", "ski mountaineering|mixed|relay": "SKMO-3",
  // Snowboard
  "snowboard|men|halfpipe": "SNOW-1", "snowboarding|men|halfpipe": "SNOW-1",
  "snowboard|men|slopestyle": "SNOW-2", "snowboarding|men|slopestyle": "SNOW-2",
  "snowboard|men|big air": "SNOW-3", "snowboarding|men|big air": "SNOW-3",
  "snowboard|men|parallel giant slalom": "SNOW-4", "snowboarding|men|parallel giant slalom": "SNOW-4",
  "snowboard|men|snowboard cross": "SNOW-5", "snowboard|men|cross": "SNOW-5", "snowboarding|men|snowboard cross": "SNOW-5",
  "snowboard|women|halfpipe": "SNOW-6", "snowboarding|women|halfpipe": "SNOW-6",
  "snowboard|women|slopestyle": "SNOW-7", "snowboarding|women|slopestyle": "SNOW-7",
  "snowboard|women|big air": "SNOW-8", "snowboarding|women|big air": "SNOW-8",
  "snowboard|women|parallel giant slalom": "SNOW-9", "snowboarding|women|parallel giant slalom": "SNOW-9",
  "snowboard|women|snowboard cross": "SNOW-10", "snowboard|women|cross": "SNOW-10", "snowboarding|women|snowboard cross": "SNOW-10",
  "snowboard|mixed|mixed team snowboard cross": "SNOW-11", "snowboard|mixed|team cross": "SNOW-11", "snowboarding|mixed|mixed team snowboard cross": "SNOW-11",
  // Speed Skating
  "speed skating|men|500m": "SPEED-1", "speed skating|men|500 metres": "SPEED-1",
  "speed skating|men|1000m": "SPEED-2", "speed skating|men|1000 metres": "SPEED-2", "speed skating|men|1,000 metres": "SPEED-2",
  "speed skating|men|1500m": "SPEED-3", "speed skating|men|1500 metres": "SPEED-3", "speed skating|men|1,500 metres": "SPEED-3",
  "speed skating|men|5000m": "SPEED-4", "speed skating|men|5000 metres": "SPEED-4", "speed skating|men|5,000 metres": "SPEED-4",
  "speed skating|men|10000m": "SPEED-5", "speed skating|men|10000 metres": "SPEED-5", "speed skating|men|10,000 metres": "SPEED-5",
  "speed skating|men|team pursuit": "SPEED-6",
  "speed skating|men|mass start": "SPEED-7",
  "speed skating|women|500m": "SPEED-8", "speed skating|women|500 metres": "SPEED-8",
  "speed skating|women|1000m": "SPEED-9", "speed skating|women|1000 metres": "SPEED-9", "speed skating|women|1,000 metres": "SPEED-9",
  "speed skating|women|1500m": "SPEED-10", "speed skating|women|1500 metres": "SPEED-10", "speed skating|women|1,500 metres": "SPEED-10",
  "speed skating|women|3000m": "SPEED-11", "speed skating|women|3000 metres": "SPEED-11", "speed skating|women|3,000 metres": "SPEED-11",
  "speed skating|women|5000m": "SPEED-12", "speed skating|women|5000 metres": "SPEED-12", "speed skating|women|5,000 metres": "SPEED-12",
  "speed skating|women|team pursuit": "SPEED-13",
  "speed skating|women|mass start": "SPEED-14",
};

const SPORT_ALIASES: Record<string, string> = {
  "alpine": "alpine skiing",
  "cross-country": "cross-country skiing", "cross country": "cross-country skiing",
  "cross country skiing": "cross-country skiing",
  "freestyle": "freestyle skiing",
  "bobsled": "bobsleigh",
  "short track speed skating": "short track", "short-track speed skating": "short track",
  "short-track": "short track",
  "snowboarding": "snowboard",
};

// Wikipedia uses these exact sport headers (==Sport==)
const WIKI_SPORT_MAP: Record<string, string> = {
  "alpine skiing": "alpine skiing",
  "biathlon": "biathlon",
  "bobsleigh": "bobsleigh",
  "cross-country skiing": "cross-country skiing",
  "curling": "curling",
  "figure skating": "figure skating",
  "freestyle skiing": "freestyle skiing",
  "ice hockey": "ice hockey",
  "luge": "luge",
  "nordic combined": "nordic combined",
  "short-track speed skating": "short track speed skating",
  "short track speed skating": "short track speed skating",
  "skeleton": "skeleton",
  "ski jumping": "ski jumping",
  "ski mountaineering": "ski mountaineering",
  "snowboarding": "snowboard",
  "speed skating": "speed skating",
};

function normalizeSport(sport: string): string {
  const lower = sport.toLowerCase().trim();
  return SPORT_ALIASES[lower] || WIKI_SPORT_MAP[lower] || lower;
}

function extractGender(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('mixed') || lower.includes('team event') || lower.includes('pair')) return 'mixed';
  if (lower.includes("women") || lower.includes("ladies") || lower.includes("female")) return 'women';
  if (lower.includes("men") || lower.includes("male")) return 'men';
  return 'mixed';
}

function matchEvent(sport: string, eventName: string, gender?: string): string | null {
  const normSport = normalizeSport(sport);
  const normGender = gender || extractGender(eventName);
  const normName = eventName.toLowerCase()
    .replace(/^(men'?s?|women'?s?|mixed)\s+/i, "")
    .replace(/×/g, "x")                                      // Unicode × → x
    .replace(/\s*[–—-]\s*/g, " ").replace(/\s+/g, " ").trim();

  // Direct exact lookup
  const key1 = `${normSport}|${normGender}|${normName}`;
  if (EVENT_ID_MAP[key1]) return EVENT_ID_MAP[key1];

  // With full event name
  const fullNorm = eventName.toLowerCase().replace(/\s*[–—-]\s*/g, " ").replace(/\s+/g, " ").trim();
  const key2 = `${normSport}|${normGender}|${fullNorm}`;
  if (EVENT_ID_MAP[key2]) return EVENT_ID_MAP[key2];

  // Partial match: find candidates for this sport+gender
  const candidates = Object.entries(EVENT_ID_MAP).filter(([k]) => {
    const parts = k.split("|");
    return parts[0] === normSport && parts[1] === normGender;
  });

  // Substring match
  for (const [key, id] of candidates) {
    const keyName = key.split("|")[2];
    if (normName.includes(keyName) || keyName.includes(normName)) return id;
  }

  // Keyword match (2+ keywords or single keyword for short names)
  const words = normName.split(" ").filter(w => w.length > 2 && !['the', 'and', 'for'].includes(w));
  for (const [key, id] of candidates) {
    const keyName = key.split("|")[2];
    const matchCount = words.filter(w => keyName.includes(w)).length;
    if (matchCount >= 2 || (words.length === 1 && matchCount === 1)) return id;
  }

  // Distance-based fallback: "kilometre" → "km" normalization
  const kmNorm = normName
    .replace(/(\d+)\s*kilometre/g, '$1km')
    .replace(/(\d+),(\d+)/g, '$1$2')
    .replace(/\s*metres?/g, 'm')
    .replace(/\s+/g, ' ').trim();
  const key3 = `${normSport}|${normGender}|${kmNorm}`;
  if (EVENT_ID_MAP[key3]) return EVENT_ID_MAP[key3];

  return null;
}

// ── Wikipedia wikitext parser ────────────────────────────────────────
//
// The actual Wikipedia format for "List of 2026 Winter Olympics medal winners":
//   ==Sport Name==                            (level 2 header)
//   ===Men's events===  or  ====Mixed====     (level 3/4 for gender — sometimes absent)
//   {|{{MedalistTable|...}}                   (table start)
//   |- or |-valign="top" or |- valign="top"   (row separator — varies!)
//   | Event Name<br />{{DetailsLink|...}}     (event cell — may use {{Nowrap|...}})
//   | {{flagIOCmedalist|[[Name]]|IOC|...}}    (individual medal winner)
//   | {{flagIOC|IOC|...}}<br>names...         (team medal — IOC is 1st param)
//   || sometimes double-pipe separators       (short track uses this)

function parseWikitext(wikitext: string): FetchedResult[] {
  const results: FetchedResult[] = [];
  const seenEventIds = new Set<string>();

  // Split into sport sections by ==Header== (level 2 only)
  const sportSections = wikitext.split(/\n(?===(?!=))/);

  for (const sportSection of sportSections) {
    const sportHeaderMatch = sportSection.match(/^==\s*([^=]+?)\s*==/m);
    if (!sportHeaderMatch) continue;
    const sportName = sportHeaderMatch[1].trim();
    const normSport = normalizeSport(sportName);

    // Split into gender sub-sections by === or ==== headers
    // Use a regex that matches 3+ equals: ===, ====
    const hasGenderHeaders = /\n===+[^=]/.test(sportSection);
    const genderBlocks: { gender: string; content: string }[] = [];

    if (hasGenderHeaders) {
      const genderSplits = sportSection.split(/\n(?====+[^=])/);
      for (const gBlock of genderSplits) {
        const genderMatch = gBlock.match(/^===+\s*([^=]+?)\s*===+/m);
        let gender = 'mixed';
        if (genderMatch) {
          const gText = genderMatch[1].toLowerCase();
          if (gText.includes('women')) gender = 'women';
          else if (gText.includes('men')) gender = 'men';
          else if (gText.includes('mixed')) gender = 'mixed';
        }
        genderBlocks.push({ gender, content: gBlock });
      }
    } else {
      // No gender sub-sections (e.g. Luge, Skeleton, Figure Skating)
      // Gender will be inferred from event names
      genderBlocks.push({ gender: 'auto', content: sportSection });
    }

    for (const { gender: sectionGender, content } of genderBlocks) {
      // Split into table rows by \n|- (catches |-  |-valign  |- valign)
      const rows = content.split(/\n\|-[^\n]*/);

      for (const row of rows) {
        // Split row into cells. Handle both:
        //   \n| cell  (standard)
        //   ||cell    (compact, used in some short-track rows)
        // First normalize || into \n| for uniform splitting
        const normalizedRow = row.replace(/\|\|/g, '\n|');
        const cells = normalizedRow.split(/\n\|/).map(c => c.trim()).filter(c => c.length > 0);
        if (cells.length < 4) continue;

        const eventCell = cells[0];
        const goldCell = cells[1] || '';
        const silverCell = cells[2] || '';
        const bronzeCell = cells[3] || '';

        // ── Extract event name ──
        let eventName = '';

        // Try {{Nowrap|text}} first (cross-country, nordic combined use this)
        const nowrapMatch = eventCell.match(/\{\{[Nn]owrap\|([^}]+)\}\}/);
        if (nowrapMatch) {
          eventName = nowrapMatch[1].trim();
        }

        // Try plain text before <br or {{ if Nowrap didn't work
        if (!eventName) {
          const brMatch = eventCell.match(/^([^<{|]+?)(?:\s*<br|$)/);
          if (brMatch && brMatch[1].trim().length > 2) {
            eventName = brMatch[1].trim();
          }
        }

        // Fallback: strip all templates and HTML, use what's left
        if (!eventName) {
          const plain = eventCell.replace(/\{\{[^}]*\}\}/g, '').replace(/<[^>]*>/g, '').trim();
          if (plain.length > 2) eventName = plain;
        }

        if (!eventName || eventName.length < 2) continue;

        // Clean wiki markup from event name
        eventName = eventName
          .replace(/\[\[([^|\]]*\|)?([^\]]+)\]\]/g, '$2')  // [[link|text]] → text
          .replace(/'''?/g, '')                                // bold/italic
          .replace(/\{\{[^}]*\}\}/g, '')                       // templates
          .replace(/<[^>]*>/g, '')                              // HTML tags
          .replace(/&nbsp;/g, ' ')                              // non-breaking spaces
          .trim();

        if (!eventName || eventName.length < 2) continue;

        // ── Extract IOC codes ──
        const goldCode = extractIOCCode(goldCell);
        const silverCode = extractIOCCode(silverCell);
        const bronzeCode = extractIOCCode(bronzeCell);

        // Need all 3 medals for a complete result
        if (!goldCode || !silverCode || !bronzeCode) continue;

        // ── Determine gender ──
        let eventGender = sectionGender;
        if (sectionGender === 'auto' || sectionGender === 'mixed') {
          // Infer from event name (for sports without gender sub-sections)
          eventGender = inferGenderFromEventName(eventName, sectionGender === 'auto' ? 'mixed' : sectionGender);
        }

        // ── Match to our event ID ──
        const eventId = matchEvent(normSport, eventName, eventGender);

        if (eventId && !seenEventIds.has(eventId)) {
          seenEventIds.add(eventId);
          results.push({
            eventId,
            gold: goldCode.toUpperCase(),
            silver: silverCode.toUpperCase(),
            bronze: bronzeCode.toUpperCase(),
            confidence: 0.9,
            source: 'wikipedia',
          });
        }
      }
    }
  }

  console.log(`[WikiParser] Parsed ${results.length} complete results from wikitext`);
  return results;
}

/**
 * Extract an IOC country code from a medal cell.
 * Case-INSENSITIVE to handle {{FlagIOC|...}} vs {{flagIOC|...}}.
 *
 * Actual patterns in the wikitext:
 *   {{flagIOCmedalist|[[Name (disambiguation)|Name]]|IOC|2026 Winter}}
 *   {{flagIOCmedalist|[[Name]]|IOC|2026 Winter}}
 *   {{flagIOC|IOC|2026 Winter}}
 *   {{FlagIOC|IOC|2026 Winter}}
 *
 * The tricky part: names can contain | inside [[...]] brackets.
 * Strategy: strip all [[...]] first, then extract the 3-letter code.
 */
function extractIOCCode(cell: string): string | null {
  // Strip [[wiki links]] to avoid | confusion inside them
  const cleaned = cell.replace(/\[\[[^\]]*\]\]/g, 'NAME');

  // Pattern 1: {{flagIOCmedalist|NAME|IOC|...}}
  const medalistMatch = cleaned.match(/flagIOCmedalist\s*\|[^|]*\|([A-Z]{3})\|/i);
  if (medalistMatch) return medalistMatch[1].toUpperCase();

  // Pattern 2: {{flagIOC|IOC|...}} or {{FlagIOC|IOC|...}}
  const flagMatch = cleaned.match(/flagIOC\s*\|([A-Z]{3})\|/i);
  if (flagMatch) return flagMatch[1].toUpperCase();

  // Fallback: look for a 3-letter ALL-CAPS code after flagIOC
  // Must be exactly 3 uppercase letters bounded by | or }
  const fallback = cleaned.match(/flagIOC(?:medalist)?\s*\|(?:[^|]*\|)?([A-Z]{3})(?:\||$)/i);
  if (fallback) return fallback[1].toUpperCase();

  return null;
}

/**
 * Infer gender from event name (for sports without ===gender=== sections).
 * E.g. "Men's singles", "Women's monobob", "Mixed team", "Team relay"
 */
function inferGenderFromEventName(eventName: string, fallback: string): string {
  const lower = eventName.toLowerCase();
  if (lower.includes('mixed') || lower.includes('team relay') || lower.includes('team event') || lower.includes('mixed team')) return 'mixed';
  if (lower.includes('pair') || lower.includes('ice dance')) return 'mixed';
  if (lower.includes("women")) return 'women';
  if (lower.includes("men")) return 'men';
  // "Team combined" etc. without gendered prefix → use section fallback
  return fallback;
}
