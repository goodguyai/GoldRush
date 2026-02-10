
/**
 * Olympic Data Service (ROOT - LEGACY)
 *
 * This file is DEPRECATED. The RapidAPI Olympic Sports API is dead (404 for 2026).
 * App.tsx imports from ./services/olympicDataService instead.
 * Live results are now fetched via /api/sync-results serverless function.
 *
 * Kept for backwards compatibility — all functions return empty/no-op.
 */

import { db } from './firebase';
import { OlympicEvent } from './types';

export const fetchOlympicEvents = async (): Promise<OlympicEvent[]> => {
  console.warn('[OlympicData] RapidAPI is dead. Use /api/sync-results instead.');
  return [];
};

export const syncEventsToFirebase = async (leagueId: string): Promise<number> => {
  console.warn('[OlympicData] Use services/olympicDataService.ts syncEventsToFirebase instead.');
  return 0;
};

export const mergeWithStaticData = (
  apiEvents: OlympicEvent[],
  staticEvents: OlympicEvent[]
): OlympicEvent[] => {
  return staticEvents;
};

export const listenToEvents = (
  leagueId: string,
  onUpdate: (events: OlympicEvent[]) => void
) => {
  return db.collection('leagues').doc(leagueId).collection('events')
    .onSnapshot(snapshot => {
      const events = snapshot.docs.map(doc => doc.data() as OlympicEvent);
      onUpdate(events.sort((a, b) => (a.startTime || 0) - (b.startTime || 0)));
    });
};
