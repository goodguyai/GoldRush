import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';
import { matchEvent, normalizeCountryCode } from './eventMapping';

export interface ScrapedResult {
  eventId: string | null;
  sport: string;
  eventName: string;
  gender: string;
  gold: string;
  silver: string;
  bronze: string;
  confidence: number; // 0-1 match confidence
}

/**
 * POST /api/sync-results
 *
 * Scrapes live Olympic medal results from olympics.com and maps them
 * to our internal event IDs. Returns results for the client to review
 * and import into Firebase.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow both GET (for easy testing) and POST
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[sync-results] Starting scrape...');

    // Try primary source first (Olympics.com), fall back to ESPN
    let results: ScrapedResult[] = [];
    let source = '';

    try {
      results = await scrapeOlympicsCom();
      source = 'olympics.com';
      console.log(`[sync-results] Olympics.com returned ${results.length} results`);
    } catch (err: any) {
      console.warn(`[sync-results] Olympics.com failed: ${err.message}, trying ESPN...`);
      try {
        results = await scrapeESPN();
        source = 'espn.com';
        console.log(`[sync-results] ESPN returned ${results.length} results`);
      } catch (err2: any) {
        console.error(`[sync-results] ESPN also failed: ${err2.message}`);
        return res.status(502).json({
          error: 'Both Olympics.com and ESPN scraping failed',
          details: { olympics: err.message, espn: err2.message }
        });
      }
    }

    // Separate mapped vs unmapped
    const mapped = results.filter(r => r.eventId !== null);
    const unmapped = results.filter(r => r.eventId === null);

    return res.status(200).json({
      results: mapped,
      unmapped,
      total: results.length,
      fetchedAt: Date.now(),
      source
    });
  } catch (error: any) {
    console.error('[sync-results] Fatal error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Scrape medal results from Olympics.com medals-by-sport page
 */
async function scrapeOlympicsCom(): Promise<ScrapedResult[]> {
  const url = 'https://olympics.com/en/milano-cortina-2026/medals/medals-by-sport';
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; GoldRush/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Olympics.com returned ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const results: ScrapedResult[] = [];

  // Olympics.com uses various data structures. We'll try multiple selectors.
  // The medals-by-sport page typically shows results grouped by discipline.

  // Strategy 1: Look for structured medal data in JSON-LD or data attributes
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '');
      // Process if it contains event/medal data
      if (data?.['@type'] === 'SportsEvent' && data?.winner) {
        // Handle structured data
      }
    } catch { /* ignore */ }
  });

  // Strategy 2: Parse the visible medal tables
  // Olympics.com medal-by-sport typically has sections per discipline
  // with medal results showing country codes/flags

  // Look for medal result rows — these vary by page structure
  // Common patterns: tables with gold/silver/bronze columns,
  // or card-based layouts with medal icons

  // Try finding discipline sections
  $('[data-cy="medals-by-sport"], [class*="medal"], [class*="Medal"]').each((_, section) => {
    const $section = $(section);
    const sportText = $section.find('[class*="discipline"], [class*="sport"], h2, h3').first().text().trim();

    $section.find('[class*="event"], [class*="row"], tr').each((_, row) => {
      const $row = $(row);
      const eventText = $row.find('[class*="event-name"], [class*="eventName"], td:first-child').text().trim();

      // Look for country codes (3-letter IOC codes)
      const countryCodes: string[] = [];
      $row.find('[class*="country"], [class*="noc"], .flag, [data-noc]').each((_, el) => {
        const code = $(el).attr('data-noc') || $(el).text().trim();
        if (code && /^[A-Z]{3}$/.test(code)) {
          countryCodes.push(code);
        }
      });

      if (countryCodes.length >= 3 && (eventText || sportText)) {
        const sport = sportText || 'Unknown';
        const eventName = eventText || 'Unknown';
        const gender = extractGender(eventName);
        const eventId = matchEvent(sport, eventName, gender);

        results.push({
          eventId,
          sport,
          eventName,
          gender,
          gold: normalizeCountryCode(countryCodes[0]),
          silver: normalizeCountryCode(countryCodes[1]),
          bronze: normalizeCountryCode(countryCodes[2]),
          confidence: eventId ? 0.9 : 0.0,
        });
      }
    });
  });

  // Strategy 3: Broader search if structured selectors didn't work
  if (results.length === 0) {
    // Try to find any tables with 3-letter country codes
    $('table').each((_, table) => {
      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td, th');
        if (cells.length >= 4) {
          const eventText = $(cells[0]).text().trim();
          const codes: string[] = [];
          cells.each((i, cell) => {
            if (i === 0) return;
            const text = $(cell).text().trim().toUpperCase();
            if (/^[A-Z]{3}$/.test(text)) codes.push(text);
          });
          if (codes.length >= 3 && eventText) {
            const gender = extractGender(eventText);
            results.push({
              eventId: matchEvent('', eventText, gender),
              sport: 'Unknown',
              eventName: eventText,
              gender,
              gold: normalizeCountryCode(codes[0]),
              silver: normalizeCountryCode(codes[1]),
              bronze: normalizeCountryCode(codes[2]),
              confidence: 0.5,
            });
          }
        }
      });
    });
  }

  // Strategy 4: Look for text patterns with country codes near medal emojis/words
  if (results.length === 0) {
    const bodyText = $('body').text();
    const medalPattern = /(?:Gold|🥇)\s*[:–—-]?\s*([A-Z]{3})[\s,]+(?:Silver|🥈)\s*[:–—-]?\s*([A-Z]{3})[\s,]+(?:Bronze|🥉)\s*[:–—-]?\s*([A-Z]{3})/gi;
    let match;
    while ((match = medalPattern.exec(bodyText)) !== null) {
      results.push({
        eventId: null,
        sport: 'Unknown',
        eventName: 'Extracted from text',
        gender: 'mixed',
        gold: normalizeCountryCode(match[1]),
        silver: normalizeCountryCode(match[2]),
        bronze: normalizeCountryCode(match[3]),
        confidence: 0.3,
      });
    }
  }

  return results;
}

/**
 * Fallback: Scrape results from ESPN Olympics results page
 */
async function scrapeESPN(): Promise<ScrapedResult[]> {
  const url = 'https://www.espn.com/olympics/winter/2026/results';
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; GoldRush/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`ESPN returned ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const results: ScrapedResult[] = [];

  // ESPN typically has a cleaner structure for results
  // Look for result cards/rows

  let currentSport = '';

  $('h2, h3, .headline, [class*="sport"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && !text.includes('Medal') && text.length < 50) {
      currentSport = text;
    }
  });

  // Try finding medal result entries
  $('[class*="result"], [class*="medal"], [class*="event"]').each((_, el) => {
    const $el = $(el);
    const text = $el.text();

    // Look for patterns like "Gold: SUI" or country codes near medal positions
    const goldMatch = text.match(/Gold[:\s]+([A-Z]{3})/i);
    const silverMatch = text.match(/Silver[:\s]+([A-Z]{3})/i);
    const bronzeMatch = text.match(/Bronze[:\s]+([A-Z]{3})/i);

    if (goldMatch && silverMatch && bronzeMatch) {
      const eventName = $el.find('[class*="name"], [class*="title"]').first().text().trim() || 'Unknown';
      const gender = extractGender(eventName);

      results.push({
        eventId: matchEvent(currentSport, eventName, gender),
        sport: currentSport || 'Unknown',
        eventName,
        gender,
        gold: normalizeCountryCode(goldMatch[1]),
        silver: normalizeCountryCode(silverMatch[1]),
        bronze: normalizeCountryCode(bronzeMatch[1]),
        confidence: 0.7,
      });
    }
  });

  // Broader text-based extraction from ESPN
  if (results.length === 0) {
    const text = $('body').text();
    // Look for structured result patterns
    const sections = text.split(/(?=(?:Alpine Skiing|Biathlon|Bobsle|Cross-Country|Curling|Figure Skating|Freestyle|Ice Hockey|Luge|Nordic Combined|Short Track|Skeleton|Ski Jumping|Ski Mountaineering|Snowboard|Speed Skating))/i);

    for (const section of sections) {
      const sportMatch = section.match(/^(Alpine Skiing|Biathlon|Bobsle\w*|Cross-Country\s*\w*|Curling|Figure Skating|Freestyle\s*\w*|Ice Hockey|Luge|Nordic Combined|Short Track\s*\w*|Skeleton|Ski Jumping|Ski Mountaineering|Snowboard\w*|Speed Skating)/i);
      if (!sportMatch) continue;

      const sport = sportMatch[1].trim();
      // Find 3-letter country codes
      const codeMatches = [...section.matchAll(/\b([A-Z]{3})\b/g)].map(m => m[1]);
      // Country codes typically appear in groups of 3 (gold, silver, bronze)
      // This is a last-resort heuristic
    }
  }

  return results;
}

/**
 * Extract gender from event name text
 */
function extractGender(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('mixed') || lower.includes('team event') || lower.includes('pair')) return 'mixed';
  if (lower.includes("women") || lower.includes("ladies") || lower.includes("female")) return 'women';
  if (lower.includes("men") || lower.includes("male")) return 'men';
  return 'mixed';
}
