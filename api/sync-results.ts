import type { VercelRequest, VercelResponse } from '@vercel/node';
import { matchEvent, normalizeCountryCode } from './eventMapping';

export interface ScrapedResult {
  eventId: string | null;
  sport: string;
  eventName: string;
  gender: string;
  gold: string;
  silver: string;
  bronze: string;
  confidence: number;
}

// ── Confirmed results from official sources ──────────────────────────
// Updated manually as events complete. This is the RELIABLE fallback
// when scraping fails (Olympics.com is JS-rendered, Wikipedia may block).
// Source: olympics.com, ESPN, verified news reports.
//
// FORMAT: [eventId, gold, silver, bronze]
const CONFIRMED_RESULTS: [string, string, string, string][] = [
  // Day 1 — Feb 7
  ["ALP-1",    "SUI", "ITA", "ITA"],     // Men's Downhill
  ["SPEED-11", "ITA", "NOR", "CAN"],     // Women's 3000m
  ["SKI-4",    "NOR", "SLO", "JPN"],     // Women's NH Ski Jumping
  ["SNOW-3",   "JPN", "JPN", "CHN"],     // Men's Snowboard Big Air
  // Day 2 — Feb 8
  ["ALP-6",    "USA", "GER", "ITA"],     // Women's Downhill
  ["FIG-5",    "USA", "JPN", "ITA"],     // Figure Skating Team Event
  ["XC-3",     "NOR", "FRA", "NOR"],     // Men's Skiathlon
  ["SPEED-4",  "NOR", "CZE", "ITA"],     // Men's 5000m
  ["SNOW-4",   "AUT", "KOR", "BUL"],     // Men's PGS
  ["SNOW-9",   "CZE", "AUT", "ITA"],     // Women's PGS
  ["LUG-1",    "GER", "AUT", "ITA"],     // Men's Luge Singles
  ["BIA-11",   "FRA", "ITA", "GER"],     // Biathlon Mixed Relay
  // Day 3 — Feb 9
  ["FREE-10",  "SUI", "CHN", "CAN"],     // Women's Freeski Slopestyle
  ["SPEED-9",  "NED", "NED", "JPN"],     // Women's 1000m
  ["SNOW-8",   "JPN", "NZL", "KOR"],     // Women's Snowboard Big Air
  ["SKI-1",    "GER", "POL", "JPN"],     // Men's NH Ski Jumping
  ["ALP-5",    "SUI", "AUT", "SUI"],     // Men's Combined
  // Day 4 — Feb 10
  ["ALP-10",   "AUT", "GER", "USA"],     // Women's Team Combined
  ["BIA-2",    "NOR", "FRA", "NOR"],     // Men's 20km Individual
  ["XC-1",     "NOR", "USA", "NOR"],     // Men's Sprint Classical
  ["XC-7",     "SWE", "SWE", "SWE"],     // Women's Sprint Classical
  ["CUR-3",    "SWE", "USA", "ITA"],     // Mixed Doubles Curling
  ["FREE-4",   "NOR", "USA", "NZL"],     // Men's Freeski Slopestyle
  ["LUG-2",    "GER", "LAT", "USA"],     // Women's Luge Singles
  ["SHORT-9",  "ITA", "CAN", "BEL"],     // Short Track Mixed Team Relay
  ["SKI-5",    "SLO", "NOR", "JPN"],     // Ski Jumping Mixed Team
  // Day 5 — Feb 11
  ["ALP-2",    "SUI", "USA", "SUI"],     // Men's Super-G
];

/**
 * POST /api/sync-results
 *
 * Returns confirmed Olympic medal results mapped to our event IDs.
 * Primary: tries Wikipedia API for latest data.
 * Fallback: returns hardcoded confirmed results (always works).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try Wikipedia scrape first for latest results
    let wikiResults: ScrapedResult[] = [];
    try {
      wikiResults = await scrapeWikipedia();
      console.log(`[sync-results] Wikipedia returned ${wikiResults.length} results`);
    } catch (err: any) {
      console.warn(`[sync-results] Wikipedia scrape failed: ${err.message}`);
    }

    // Build confirmed results as ScrapedResult objects
    const confirmedScraped: ScrapedResult[] = CONFIRMED_RESULTS.map(([eventId, gold, silver, bronze]) => ({
      eventId,
      sport: 'Confirmed',
      eventName: eventId,
      gender: '',
      gold,
      silver,
      bronze,
      confidence: 1.0,
    }));

    // Merge: wiki results take priority (may have newer events), confirmed fills gaps
    const resultMap = new Map<string, ScrapedResult>();

    // Add confirmed first
    for (const r of confirmedScraped) {
      if (r.eventId) resultMap.set(r.eventId, r);
    }

    // Wiki results overwrite (they might have corrections)
    for (const r of wikiResults) {
      if (r.eventId) resultMap.set(r.eventId, r);
    }

    const allResults = Array.from(resultMap.values());
    const mapped = allResults.filter(r => r.eventId !== null);
    const unmapped = wikiResults.filter(r => r.eventId === null);

    return res.status(200).json({
      results: mapped,
      unmapped,
      total: allResults.length,
      fetchedAt: Date.now(),
      source: wikiResults.length > 0 ? 'wikipedia+confirmed' : 'confirmed',
    });
  } catch (error: any) {
    console.error('[sync-results] Fatal error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Scrape medal winners from Wikipedia's API (returns wikitext, not JS-rendered)
 */
async function scrapeWikipedia(): Promise<ScrapedResult[]> {
  const url = 'https://en.wikipedia.org/w/api.php?' + new URLSearchParams({
    action: 'parse',
    page: 'List_of_2026_Winter_Olympics_medal_winners',
    prop: 'wikitext',
    format: 'json',
    origin: '*',
  });

  const response = await fetch(url, {
    headers: { 'User-Agent': 'GoldRush-OlympicFantasy/1.0' },
  });

  if (!response.ok) throw new Error(`Wikipedia API ${response.status}`);
  const data = await response.json();
  const wikitext: string = data?.parse?.wikitext?.['*'] || '';

  if (!wikitext || wikitext.length < 100) {
    throw new Error('Empty wikitext');
  }

  return parseWikitext(wikitext);
}

/**
 * Parse Wikipedia wikitext medal tables.
 *
 * Wikipedia medal tables use this pattern:
 * {{MedalEvent|Event name|...}}
 * {{MedalGold|{{flagIOC|USA|2026 Winter}}|Athlete name}}
 * {{MedalSilver|{{flagIOC|JPN|2026 Winter}}|Athlete name}}
 * {{MedalBronze|{{flagIOC|ITA|2026 Winter}}|Athlete name}}
 *
 * Or sometimes in table rows like:
 * | {{flagIOC|NOR|2026 Winter}} || Athlete || time
 */
function parseWikitext(wikitext: string): ScrapedResult[] {
  const results: ScrapedResult[] = [];

  // Split into sections by sport headers (=== Sport name ===)
  const sections = wikitext.split(/===\s*/);

  let currentSport = '';

  for (const section of sections) {
    // Check if this starts with a sport name
    const sportMatch = section.match(/^([^=]+?)\s*===/);
    if (sportMatch) {
      currentSport = sportMatch[1].trim();
    }

    // Find medal events within this section
    // Pattern 1: {{MedalEvent}} blocks
    const eventBlocks = section.split(/\{\{Medal(?:Event|Competition)/i);

    for (const block of eventBlocks) {
      // Look for the event name
      const eventNameMatch = block.match(/\|([^|}]+)/);
      if (!eventNameMatch) continue;
      const eventName = eventNameMatch[1].trim().replace(/\[\[|\]\]/g, '');

      // Extract country codes from flagIOC templates
      const codes: { medal: string; code: string }[] = [];

      // Pattern: {{MedalGold|{{flagIOC|XXX|...}}|...}}
      const goldMatch = block.match(/MedalGold\|.*?flagIOC\|([A-Z]{3})/i);
      const silverMatch = block.match(/MedalSilver\|.*?flagIOC\|([A-Z]{3})/i);
      const bronzeMatch = block.match(/MedalBronze\|.*?flagIOC\|([A-Z]{3})/i);

      if (goldMatch) codes.push({ medal: 'gold', code: goldMatch[1] });
      if (silverMatch) codes.push({ medal: 'silver', code: silverMatch[1] });
      if (bronzeMatch) codes.push({ medal: 'bronze', code: bronzeMatch[1] });

      // If we didn't find Medal templates, try raw flagIOC patterns in order
      if (codes.length < 3) {
        const flagMatches = [...block.matchAll(/flagIOC\|([A-Z]{3})/g)];
        if (flagMatches.length >= 3) {
          codes.length = 0; // reset
          codes.push({ medal: 'gold', code: flagMatches[0][1] });
          codes.push({ medal: 'silver', code: flagMatches[1][1] });
          codes.push({ medal: 'bronze', code: flagMatches[2][1] });
        }
      }

      if (codes.length >= 3) {
        const gender = extractGender(eventName);
        const eventId = matchEvent(currentSport, eventName, gender);

        results.push({
          eventId,
          sport: currentSport,
          eventName,
          gender,
          gold: normalizeCountryCode(codes.find(c => c.medal === 'gold')!.code),
          silver: normalizeCountryCode(codes.find(c => c.medal === 'silver')!.code),
          bronze: normalizeCountryCode(codes.find(c => c.medal === 'bronze')!.code),
          confidence: eventId ? 0.85 : 0.3,
        });
      }
    }

    // Pattern 2: Table rows with flagIOC (common in newer wiki tables)
    // Look for rows with 3+ flagIOC entries
    const tableRows = section.split(/\|-/);
    for (const row of tableRows) {
      const flagMatches = [...row.matchAll(/flagIOC\|([A-Z]{3})/g)];
      if (flagMatches.length < 3) continue;

      // Try to find event name in the row (usually in [[link]] or plain text before flags)
      const nameMatch = row.match(/\[\[(?:[^|]*\|)?([^\]]+)\]\]/);
      const eventName = nameMatch ? nameMatch[1].trim() : '';
      if (!eventName) continue;

      const gender = extractGender(eventName);
      const eventId = matchEvent(currentSport, eventName, gender);

      // Avoid duplicates
      if (results.some(r => r.eventId === eventId && eventId)) continue;

      results.push({
        eventId,
        sport: currentSport,
        eventName,
        gender,
        gold: normalizeCountryCode(flagMatches[0][1]),
        silver: normalizeCountryCode(flagMatches[1][1]),
        bronze: normalizeCountryCode(flagMatches[2][1]),
        confidence: eventId ? 0.8 : 0.2,
      });
    }
  }

  return results;
}

function extractGender(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('mixed') || lower.includes('team event') || lower.includes('pair')) return 'mixed';
  if (lower.includes("women") || lower.includes("ladies") || lower.includes("female")) return 'women';
  if (lower.includes("men") || lower.includes("male")) return 'men';
  return 'mixed';
}
