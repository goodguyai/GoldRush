/**
 * liveResultsService.ts — Client-side live results fetcher
 *
 * Runs entirely in the browser. No serverless functions needed.
 * Primary: hardcoded CONFIRMED_RESULTS (100% reliable).
 * Secondary: Wikipedia API scraper (CORS-enabled, returns wikitext).
 */

import { MedalResult } from './types';

// ── Confirmed results from official sources (Wikipedia-verified) ─────
// FORMAT: [eventId, gold, silver, bronze]
const CONFIRMED_RESULTS: [string, string, string, string][] = [
  // Day 1 — Feb 7
  ["ALP-1",    "SUI", "ITA", "ITA"],     // Men's Downhill: von Allmen, Franzoni, Paris
  ["SPEED-11", "ITA", "NOR", "CAN"],     // Women's 3000m: Lollobrigida, Wiklund, Maltais
  ["SKI-4",    "NOR", "SLO", "JPN"],     // Women's NH Ski Jumping: Strøm, Prevc, Maruyama
  ["SNOW-3",   "JPN", "JPN", "CHN"],     // Men's Snowboard Big Air: Kimura, Kimata, Su Yiming

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
}> {
  // Build confirmed results
  const confirmed: FetchedResult[] = CONFIRMED_RESULTS.map(([eventId, gold, silver, bronze]) => ({
    eventId,
    gold,
    silver,
    bronze,
    confidence: 1.0,
    source: 'confirmed' as const,
  }));

  // Try Wikipedia for additional/newer results
  let wikiResults: FetchedResult[] = [];
  try {
    wikiResults = await scrapeWikipedia();
    console.log(`[LiveResults] Wikipedia returned ${wikiResults.length} results`);
  } catch (err: any) {
    console.warn(`[LiveResults] Wikipedia scrape failed: ${err.message}`);
  }

  // Merge: confirmed first, wiki overwrites (may have corrections/newer data)
  const resultMap = new Map<string, FetchedResult>();
  for (const r of confirmed) {
    resultMap.set(r.eventId, r);
  }
  for (const r of wikiResults) {
    if (r.eventId) resultMap.set(r.eventId, r);
  }

  return {
    results: Array.from(resultMap.values()),
    source: wikiResults.length > 0 ? 'confirmed+wikipedia' : 'confirmed',
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

  if (!wikitext || wikitext.length < 100) {
    throw new Error('Empty wikitext');
  }

  return parseWikitext(wikitext);
}

// ── Event matching (inline, no import from /api/) ───────────────────

const EVENT_ID_MAP: Record<string, string> = {
  "alpine skiing|men|downhill": "ALP-1",
  "alpine skiing|men|super-g": "ALP-2", "alpine skiing|men|super g": "ALP-2",
  "alpine skiing|men|giant slalom": "ALP-3",
  "alpine skiing|men|slalom": "ALP-4",
  "alpine skiing|men|combined": "ALP-5",
  "alpine skiing|women|downhill": "ALP-6",
  "alpine skiing|women|super-g": "ALP-7", "alpine skiing|women|super g": "ALP-7",
  "alpine skiing|women|giant slalom": "ALP-8",
  "alpine skiing|women|slalom": "ALP-9",
  "alpine skiing|women|combined": "ALP-10",
  "biathlon|men|sprint": "BIA-1", "biathlon|men|10km sprint": "BIA-1",
  "biathlon|men|individual": "BIA-2", "biathlon|men|20km individual": "BIA-2",
  "biathlon|men|pursuit": "BIA-3", "biathlon|men|12.5km pursuit": "BIA-3",
  "biathlon|men|mass start": "BIA-4", "biathlon|men|15km mass start": "BIA-4",
  "biathlon|men|relay": "BIA-5", "biathlon|men|4x7.5km relay": "BIA-5",
  "biathlon|women|sprint": "BIA-6", "biathlon|women|7.5km sprint": "BIA-6",
  "biathlon|women|individual": "BIA-7", "biathlon|women|15km individual": "BIA-7",
  "biathlon|women|pursuit": "BIA-8", "biathlon|women|10km pursuit": "BIA-8",
  "biathlon|women|mass start": "BIA-9", "biathlon|women|12.5km mass start": "BIA-9",
  "biathlon|women|relay": "BIA-10", "biathlon|women|4x6km relay": "BIA-10",
  "biathlon|mixed|mixed relay": "BIA-11", "biathlon|mixed|relay": "BIA-11",
  "bobsleigh|men|two-man": "BOB-1", "bobsleigh|men|two man": "BOB-1", "bobsled|men|two-man": "BOB-1", "bobsled|men|two man": "BOB-1",
  "bobsleigh|men|four-man": "BOB-2", "bobsleigh|men|four man": "BOB-2", "bobsled|men|four-man": "BOB-2", "bobsled|men|four man": "BOB-2",
  "bobsleigh|women|two-woman": "BOB-3", "bobsleigh|women|two woman": "BOB-3", "bobsled|women|two-woman": "BOB-3", "bobsled|women|two woman": "BOB-3",
  "bobsleigh|women|monobob": "BOB-4", "bobsled|women|monobob": "BOB-4",
  "curling|men|tournament": "CUR-1", "curling|women|tournament": "CUR-2",
  "curling|mixed|mixed doubles": "CUR-3", "curling|mixed|doubles": "CUR-3",
  "cross-country skiing|men|sprint": "XC-1", "cross-country skiing|men|sprint classic": "XC-1",
  "cross-country skiing|men|10km": "XC-2",
  "cross-country skiing|men|skiathlon": "XC-3",
  "cross-country skiing|men|50km": "XC-4", "cross-country skiing|men|50km mass start": "XC-4",
  "cross-country skiing|men|team sprint": "XC-5",
  "cross-country skiing|men|relay": "XC-6", "cross-country skiing|men|4x7.5km relay": "XC-6",
  "cross-country skiing|women|sprint": "XC-7", "cross-country skiing|women|sprint classic": "XC-7",
  "cross-country skiing|women|10km": "XC-8",
  "cross-country skiing|women|skiathlon": "XC-9",
  "cross-country skiing|women|50km": "XC-10", "cross-country skiing|women|50km mass start": "XC-10",
  "cross-country skiing|women|team sprint": "XC-11",
  "cross-country skiing|women|relay": "XC-12", "cross-country skiing|women|4x7.5km relay": "XC-12",
  "figure skating|men|singles": "FIG-1", "figure skating|men|individual": "FIG-1",
  "figure skating|women|singles": "FIG-2", "figure skating|women|individual": "FIG-2",
  "figure skating|mixed|pairs": "FIG-3", "figure skating|mixed|pair skating": "FIG-3",
  "figure skating|mixed|ice dance": "FIG-4", "figure skating|mixed|dance": "FIG-4",
  "figure skating|mixed|team event": "FIG-5", "figure skating|mixed|team": "FIG-5",
  "freestyle skiing|men|aerials": "FREE-1", "freestyle|men|aerials": "FREE-1",
  "freestyle skiing|men|moguls": "FREE-2", "freestyle|men|moguls": "FREE-2",
  "freestyle skiing|men|halfpipe": "FREE-3", "freestyle|men|halfpipe": "FREE-3",
  "freestyle skiing|men|slopestyle": "FREE-4", "freestyle|men|slopestyle": "FREE-4",
  "freestyle skiing|men|big air": "FREE-5", "freestyle|men|big air": "FREE-5",
  "freestyle skiing|men|ski cross": "FREE-6", "freestyle|men|ski cross": "FREE-6",
  "freestyle skiing|women|aerials": "FREE-7", "freestyle|women|aerials": "FREE-7",
  "freestyle skiing|women|moguls": "FREE-8", "freestyle|women|moguls": "FREE-8",
  "freestyle skiing|women|halfpipe": "FREE-9", "freestyle|women|halfpipe": "FREE-9",
  "freestyle skiing|women|slopestyle": "FREE-10", "freestyle|women|slopestyle": "FREE-10",
  "freestyle skiing|women|big air": "FREE-11", "freestyle|women|big air": "FREE-11",
  "freestyle skiing|women|ski cross": "FREE-12", "freestyle|women|ski cross": "FREE-12",
  "freestyle skiing|mixed|team aerials": "FREE-13", "freestyle|mixed|team aerials": "FREE-13",
  "ice hockey|men|tournament": "ICE-1", "ice hockey|women|tournament": "ICE-2",
  "luge|men|singles": "LUG-1", "luge|women|singles": "LUG-2",
  "luge|men|doubles": "LUG-3", "luge|women|doubles": "LUG-3B",
  "luge|mixed|team relay": "LUG-4", "luge|mixed|relay": "LUG-4",
  "nordic combined|men|normal hill": "NOR-1", "nordic combined|men|large hill": "NOR-2", "nordic combined|men|team sprint": "NOR-3",
  "short track|men|500m": "SHORT-1", "short track speed skating|men|500m": "SHORT-1",
  "short track|men|1000m": "SHORT-2", "short track speed skating|men|1000m": "SHORT-2",
  "short track|men|1500m": "SHORT-3", "short track speed skating|men|1500m": "SHORT-3",
  "short track|men|5000m relay": "SHORT-4", "short track|men|relay": "SHORT-4",
  "short track|women|500m": "SHORT-5", "short track speed skating|women|500m": "SHORT-5",
  "short track|women|1000m": "SHORT-6", "short track speed skating|women|1000m": "SHORT-6",
  "short track|women|1500m": "SHORT-7", "short track speed skating|women|1500m": "SHORT-7",
  "short track|women|3000m relay": "SHORT-8", "short track|women|relay": "SHORT-8",
  "short track|mixed|mixed team relay": "SHORT-9", "short track|mixed|relay": "SHORT-9",
  "skeleton|men|singles": "SKEL-1", "skeleton|women|singles": "SKEL-2", "skeleton|mixed|mixed team": "SKEL-3",
  "ski jumping|men|normal hill": "SKI-1", "ski jumping|men|individual normal hill": "SKI-1",
  "ski jumping|men|large hill": "SKI-2", "ski jumping|men|individual large hill": "SKI-2",
  "ski jumping|men|team": "SKI-3", "ski jumping|men|super team": "SKI-3",
  "ski jumping|women|normal hill": "SKI-4", "ski jumping|women|individual normal hill": "SKI-4",
  "ski jumping|women|large hill": "SKI-4B", "ski jumping|women|individual large hill": "SKI-4B",
  "ski jumping|mixed|mixed team": "SKI-5", "ski jumping|mixed|team": "SKI-5",
  "ski mountaineering|men|sprint": "SKMO-1", "ski mountaineering|women|sprint": "SKMO-2",
  "ski mountaineering|mixed|mixed relay": "SKMO-3", "ski mountaineering|mixed|relay": "SKMO-3",
  "snowboard|men|halfpipe": "SNOW-1", "snowboarding|men|halfpipe": "SNOW-1",
  "snowboard|men|slopestyle": "SNOW-2", "snowboarding|men|slopestyle": "SNOW-2",
  "snowboard|men|big air": "SNOW-3", "snowboarding|men|big air": "SNOW-3",
  "snowboard|men|parallel giant slalom": "SNOW-4", "snowboarding|men|parallel giant slalom": "SNOW-4",
  "snowboard|men|snowboard cross": "SNOW-5", "snowboard|men|cross": "SNOW-5",
  "snowboard|women|halfpipe": "SNOW-6", "snowboarding|women|halfpipe": "SNOW-6",
  "snowboard|women|slopestyle": "SNOW-7", "snowboarding|women|slopestyle": "SNOW-7",
  "snowboard|women|big air": "SNOW-8", "snowboarding|women|big air": "SNOW-8",
  "snowboard|women|parallel giant slalom": "SNOW-9", "snowboarding|women|parallel giant slalom": "SNOW-9",
  "snowboard|women|snowboard cross": "SNOW-10", "snowboard|women|cross": "SNOW-10",
  "snowboard|mixed|mixed team snowboard cross": "SNOW-11", "snowboard|mixed|team cross": "SNOW-11",
  "speed skating|men|500m": "SPEED-1",
  "speed skating|men|1000m": "SPEED-2",
  "speed skating|men|1500m": "SPEED-3",
  "speed skating|men|5000m": "SPEED-4",
  "speed skating|men|10000m": "SPEED-5",
  "speed skating|men|team pursuit": "SPEED-6",
  "speed skating|men|mass start": "SPEED-7",
  "speed skating|women|500m": "SPEED-8",
  "speed skating|women|1000m": "SPEED-9",
  "speed skating|women|1500m": "SPEED-10",
  "speed skating|women|3000m": "SPEED-11",
  "speed skating|women|5000m": "SPEED-12",
  "speed skating|women|team pursuit": "SPEED-13",
  "speed skating|women|mass start": "SPEED-14",
};

const SPORT_ALIASES: Record<string, string> = {
  "alpine": "alpine skiing", "cross-country": "cross-country skiing",
  "cross country": "cross-country skiing", "cross country skiing": "cross-country skiing",
  "freestyle": "freestyle skiing", "bobsled": "bobsleigh",
  "short track speed skating": "short track", "short-track speed skating": "short track",
  "short-track": "short track", "snowboarding": "snowboard",
};

function normalizeSport(sport: string): string {
  const lower = sport.toLowerCase().trim();
  return SPORT_ALIASES[lower] || lower;
}

function normalizeCountryCode(code: string): string {
  return code.toUpperCase().trim();
}

function matchEvent(sport: string, eventName: string, gender?: string): string | null {
  const normSport = normalizeSport(sport);
  const normGender = extractGender(gender || eventName);
  const normName = eventName.toLowerCase()
    .replace(/^(men'?s?|women'?s?|mixed)\s+/i, "")
    .replace(/\s*-\s*/g, " ").replace(/\s+/g, " ").trim();

  // Exact lookup
  const key1 = `${normSport}|${normGender}|${normName}`;
  if (EVENT_ID_MAP[key1]) return EVENT_ID_MAP[key1];

  // Full name lookup
  const fullNorm = eventName.toLowerCase().replace(/\s*-\s*/g, " ").replace(/\s+/g, " ").trim();
  const key2 = `${normSport}|${normGender}|${fullNorm}`;
  if (EVENT_ID_MAP[key2]) return EVENT_ID_MAP[key2];

  // Partial match
  const candidates = Object.entries(EVENT_ID_MAP).filter(([k]) => {
    const parts = k.split("|");
    return parts[0] === normSport && parts[1] === normGender;
  });

  for (const [key, id] of candidates) {
    const keyName = key.split("|")[2];
    if (normName.includes(keyName) || keyName.includes(normName)) return id;
  }

  // Keyword match
  const words = normName.split(" ").filter(w => w.length > 2);
  for (const [key, id] of candidates) {
    const keyName = key.split("|")[2];
    const matchCount = words.filter(w => keyName.includes(w)).length;
    if (matchCount >= 2 || (words.length === 1 && matchCount === 1)) return id;
  }

  return null;
}

function extractGender(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('mixed') || lower.includes('team event') || lower.includes('pair')) return 'mixed';
  if (lower.includes("women") || lower.includes("ladies") || lower.includes("female")) return 'women';
  if (lower.includes("men") || lower.includes("male")) return 'men';
  return 'mixed';
}

// ── Wikipedia wikitext parser ───────────────────────────────────────

function parseWikitext(wikitext: string): FetchedResult[] {
  const results: FetchedResult[] = [];
  const sections = wikitext.split(/===\s*/);
  let currentSport = '';

  for (const section of sections) {
    const sportMatch = section.match(/^([^=]+?)\s*===/);
    if (sportMatch) currentSport = sportMatch[1].trim();

    // Pattern 1: {{MedalEvent}} blocks
    const eventBlocks = section.split(/\{\{Medal(?:Event|Competition)/i);
    for (const block of eventBlocks) {
      const eventNameMatch = block.match(/\|([^|}]+)/);
      if (!eventNameMatch) continue;
      const eventName = eventNameMatch[1].trim().replace(/\[\[|\]\]/g, '');

      const goldMatch = block.match(/MedalGold\|.*?flagIOC\|([A-Z]{3})/i);
      const silverMatch = block.match(/MedalSilver\|.*?flagIOC\|([A-Z]{3})/i);
      const bronzeMatch = block.match(/MedalBronze\|.*?flagIOC\|([A-Z]{3})/i);

      const codes: { medal: string; code: string }[] = [];
      if (goldMatch) codes.push({ medal: 'gold', code: goldMatch[1] });
      if (silverMatch) codes.push({ medal: 'silver', code: silverMatch[1] });
      if (bronzeMatch) codes.push({ medal: 'bronze', code: bronzeMatch[1] });

      if (codes.length < 3) {
        const flagMatches = [...block.matchAll(/flagIOC\|([A-Z]{3})/g)];
        if (flagMatches.length >= 3) {
          codes.length = 0;
          codes.push({ medal: 'gold', code: flagMatches[0][1] });
          codes.push({ medal: 'silver', code: flagMatches[1][1] });
          codes.push({ medal: 'bronze', code: flagMatches[2][1] });
        }
      }

      if (codes.length >= 3) {
        const gender = extractGender(eventName);
        const eventId = matchEvent(currentSport, eventName, gender);

        if (eventId && !results.some(r => r.eventId === eventId)) {
          results.push({
            eventId,
            gold: normalizeCountryCode(codes.find(c => c.medal === 'gold')!.code),
            silver: normalizeCountryCode(codes.find(c => c.medal === 'silver')!.code),
            bronze: normalizeCountryCode(codes.find(c => c.medal === 'bronze')!.code),
            confidence: 0.85,
            source: 'wikipedia',
          });
        }
      }
    }

    // Pattern 2: Table rows with flagIOC
    const tableRows = section.split(/\|-/);
    for (const row of tableRows) {
      const flagMatches = [...row.matchAll(/flagIOC\|([A-Z]{3})/g)];
      if (flagMatches.length < 3) continue;

      const nameMatch = row.match(/\[\[(?:[^|]*\|)?([^\]]+)\]\]/);
      const eventName = nameMatch ? nameMatch[1].trim() : '';
      if (!eventName) continue;

      const gender = extractGender(eventName);
      const eventId = matchEvent(currentSport, eventName, gender);

      if (eventId && !results.some(r => r.eventId === eventId)) {
        results.push({
          eventId,
          gold: normalizeCountryCode(flagMatches[0][1]),
          silver: normalizeCountryCode(flagMatches[1][1]),
          bronze: normalizeCountryCode(flagMatches[2][1]),
          confidence: 0.8,
          source: 'wikipedia',
        });
      }
    }
  }

  return results;
}
