
/**
 * Olympic Data Service
 *
 * IMPORTANT: The RapidAPI Olympic Sports API does NOT support 2026 Winter Olympics.
 * The endpoint /events/winter/2026 returns 404 and the API only has 2024 Paris data.
 *
 * Current approach:
 * - Static event data (staticData.ts) is the source of truth for event definitions
 * - Firebase stores event status + medal results per league
 * - Commissioner manually enters results via the Scoring tab
 * - syncEventsToFirebase() seeds Firebase from static data (only if empty)
 * - Event status is updated when commissioners add medal results
 *
 * If a working API is found in the future, fetchOlympicEvents() can be updated.
 */

import { db } from './firebase';
import { OlympicEvent } from '../types';
import { INITIAL_EVENTS } from '../staticData';

/**
 * Sync static events to Firebase for a league.
 * Only writes if the league has no events yet (avoids overwriting manual status updates).
 * Pass force=true to overwrite existing events (preserves status where possible).
 */
export const syncEventsToFirebase = async (leagueId: string, force = false): Promise<number> => {
  try {
    const eventsRef = db.collection('leagues').doc(leagueId).collection('events');
    const existing = await eventsRef.get();

    // If events already exist and not forcing, skip sync to preserve manual updates
    if (existing.docs.length > 0 && !force) {
      console.log(`[OlympicData] League ${leagueId} already has ${existing.docs.length} events, skipping sync.`);
      return existing.docs.length;
    }

    // Build map of existing event statuses to preserve them during force sync
    const existingStatuses = new Map<string, { status: string; startTime?: number }>();
    if (force) {
      existing.docs.forEach(doc => {
        const data = doc.data();
        if (data.status && data.status !== 'Scheduled') {
          existingStatuses.set(doc.id, { status: data.status, startTime: data.startTime });
        }
      });
    }

    const batch = db.batch();

    // Clear existing if forcing
    if (force) {
      existing.docs.forEach(doc => batch.delete(doc.ref));
    }

    // Write static events
    const events = INITIAL_EVENTS;
    events.forEach(event => {
      const preserved = existingStatuses.get(event.id);
      const eventData = {
        ...event,
        // Preserve status if it was already updated (e.g., Finished from manual result entry)
        status: preserved?.status || event.status || 'Scheduled',
      };
      batch.set(eventsRef.doc(event.id), eventData);
    });

    await batch.commit();

    console.log(`[OlympicData] Synced ${events.length} events to league ${leagueId}${force ? ' (forced)' : ''}`);
    return events.length;
  } catch (error) {
    console.error('[OlympicData] Sync failed:', error);
    throw error;
  }
};

/**
 * Merge Firebase event data with our static data.
 * Firebase events may have updated statuses from manual result entry.
 * Static data has all the metadata (sport, gender, descriptions, etc).
 */
export const mergeWithStaticData = (
  firebaseEvents: OlympicEvent[],
  staticEvents: OlympicEvent[]
): OlympicEvent[] => {
  if (!firebaseEvents || firebaseEvents.length === 0) return staticEvents;

  // Build a lookup from Firebase events by ID
  const fbMap = new Map<string, OlympicEvent>();
  firebaseEvents.forEach(e => fbMap.set(e.id, e));

  return staticEvents.map(staticEvent => {
    const fbEvent = fbMap.get(staticEvent.id);

    if (fbEvent) {
      return {
        ...staticEvent,
        // Take status from Firebase (may have been updated by commissioner)
        status: fbEvent.status || staticEvent.status,
        // Take startTime from Firebase if set
        startTime: fbEvent.startTime || staticEvent.startTime,
      };
    }

    return staticEvent;
  });
};

/**
 * Mark an event as Finished in Firebase when a medal result is added.
 * Called automatically when commissioner adds a result.
 */
export const markEventFinished = async (leagueId: string, eventId: string): Promise<void> => {
  try {
    const eventRef = db.collection('leagues').doc(leagueId).collection('events').doc(eventId);
    await eventRef.update({ status: 'Finished' });
    console.log(`[OlympicData] Marked event ${eventId} as Finished`);
  } catch (error) {
    console.error(`[OlympicData] Failed to mark event ${eventId} as Finished:`, error);
  }
};

/**
 * Listen to events from Firebase (real-time)
 */
export const listenToEvents = (
  leagueId: string,
  onUpdate: (events: OlympicEvent[]) => void
) => {
  return db.collection('leagues').doc(leagueId).collection('events')
    .onSnapshot(snapshot => {
      const events = snapshot.docs.map(doc => doc.data() as OlympicEvent);
      // Sort by start time if available
      onUpdate(events.sort((a, b) => (a.startTime || 0) - (b.startTime || 0)));
    });
};

/**
 * Legacy: fetchOlympicEvents — Returns empty since the API is dead.
 * Kept for backwards compatibility. If a new API is found, update this.
 */
export const fetchOlympicEvents = async (): Promise<OlympicEvent[]> => {
  console.warn('[OlympicData] RapidAPI Olympic Sports API does not support 2026 Winter Olympics. Using static data.');
  return [];
};

// Expose to window for commissioner to run manually via console
if (typeof window !== 'undefined') {
  (window as any).syncOlympicEvents = async (leagueId: string) => {
    console.log('Syncing static events to Firebase...');
    try {
        const count = await syncEventsToFirebase(leagueId, true);
        console.log(`Done! Synced ${count} events.`);
        return count;
    } catch (e) {
        console.error(e);
        return 0;
    }
  };
}
