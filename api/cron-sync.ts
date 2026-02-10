import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import { matchEvent, normalizeCountryCode } from './eventMapping';

// ── Firebase Admin init (singleton) ───────────────────────────────────
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
    } catch (e) {
      console.error('[cron-sync] Failed to init Firebase Admin:', e);
    }
  }
}

const db = admin.apps.length ? admin.firestore() : null;

interface MedalResult {
  eventId: string;
  gold: string;
  silver: string;
  bronze: string;
  source: 'live';
  timestamp: number;
}

/**
 * GET /api/cron-sync
 *
 * Vercel Cron Job — runs every 30 min.
 * Scrapes Olympics.com for new medal results and writes them
 * directly to Firebase for all leagues.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret (Vercel sends this header for cron invocations)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[cron-sync] Unauthorized request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!db) {
    console.error('[cron-sync] Firebase Admin not initialized (missing FIREBASE_SERVICE_ACCOUNT_KEY)');
    return res.status(500).json({ error: 'Firebase Admin not configured' });
  }

  try {
    console.log('[cron-sync] Starting auto-sync...');

    // 1. Scrape results
    const scrapedResults = await scrapeResults();
    if (scrapedResults.length === 0) {
      console.log('[cron-sync] No results scraped, skipping');
      return res.status(200).json({ message: 'No results found', synced: 0 });
    }

    console.log(`[cron-sync] Scraped ${scrapedResults.length} results`);

    // 2. Get all leagues
    const leaguesSnap = await db.collection('leagues').get();
    let totalSynced = 0;

    for (const leagueDoc of leaguesSnap.docs) {
      const leagueData = leagueDoc.data();
      const existingResults: MedalResult[] = leagueData.results || [];
      const existingEventIds = new Set(existingResults.map(r => r.eventId));

      // Find new results not already in this league
      const newResults = scrapedResults.filter(r => !existingEventIds.has(r.eventId));

      if (newResults.length === 0) continue;

      // 3. Write new results to league
      const batch = db.batch();
      const leagueRef = db.collection('leagues').doc(leagueDoc.id);

      // Append new results
      batch.update(leagueRef, {
        results: admin.firestore.FieldValue.arrayUnion(...newResults)
      });

      // Mark events as Finished
      for (const result of newResults) {
        const eventRef = leagueRef.collection('events').doc(result.eventId);
        batch.update(eventRef, { status: 'Finished' });
      }

      await batch.commit();
      totalSynced += newResults.length;

      console.log(`[cron-sync] Synced ${newResults.length} new results to league ${leagueDoc.id}`);
    }

    console.log(`[cron-sync] Done. Total synced: ${totalSynced}`);
    return res.status(200).json({
      message: 'Sync complete',
      scraped: scrapedResults.length,
      synced: totalSynced,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('[cron-sync] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Scrape results from Olympics.com (simplified version of sync-results scraper)
 */
async function scrapeResults(): Promise<MedalResult[]> {
  try {
    // Use the medals-by-sport page
    const url = 'https://olympics.com/en/milano-cortina-2026/medals/medals-by-sport';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoldRush-Cron/1.0)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);
    const results: MedalResult[] = [];

    // Parse medal tables — adapt selectors as Olympics.com evolves
    $('[data-cy="medals-by-sport"] [class*="event"], table tr, [class*="medal-row"]').each((_, el) => {
      const $el = $(el);
      const text = $el.text();

      // Extract 3-letter country codes
      const codes = [...text.matchAll(/\b([A-Z]{3})\b/g)].map(m => m[1]);
      if (codes.length < 3) return;

      // Try to find event name
      const eventText = $el.find('td:first-child, [class*="name"]').first().text().trim();
      if (!eventText) return;

      const gender = extractGenderFromText(eventText);
      const eventId = matchEvent('', eventText, gender);
      if (!eventId) return;

      results.push({
        eventId,
        gold: normalizeCountryCode(codes[0]),
        silver: normalizeCountryCode(codes[1]),
        bronze: normalizeCountryCode(codes[2]),
        source: 'live',
        timestamp: Date.now(),
      });
    });

    return results;
  } catch (err) {
    console.error('[cron-sync] Scrape failed:', err);
    return [];
  }
}

function extractGenderFromText(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('mixed') || lower.includes('team event') || lower.includes('pair')) return 'mixed';
  if (lower.includes("women") || lower.includes("ladies")) return 'women';
  if (lower.includes("men")) return 'men';
  return 'mixed';
}
