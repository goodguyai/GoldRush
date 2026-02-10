import { MedalResult } from '../types';

/**
 * DEPRECATED — RapidAPI Olympic Sports API is dead (404 for 2026 Winter Olympics).
 * Live results are now fetched via /api/sync-results serverless function.
 * This file is kept for backwards compatibility.
 */
export const fetchOlympicResults = async (_year: string = '2026'): Promise<MedalResult[]> => {
  console.warn('[OlympicService] RapidAPI is dead. Use /api/sync-results instead.');
  return [];
};
