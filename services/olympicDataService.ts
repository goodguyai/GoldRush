
/**
 * Olympic Data Service
 * Syncs event data from RapidAPI Olympics endpoint
 * Stores in Firebase for persistence and real-time updates
 *
 * IMPORTANT: We only track MEDAL events (finals). Preliminary rounds
 * (heats, qualifiers, semis, etc.) are filtered out so they don't
 * pollute event status and lock state.
 */

import { db } from './firebase';
import { OlympicEvent } from '../types';
import { API_HOST, RAPID_API_KEY } from '../constants';

interface RapidAPIEvent {
  id: string;
  sport: string;
  discipline: string;
  event_name: string;
  gender: string;
  start_time: string; // ISO date string
  venue: string;
  status: string;
  phase?: string;     // e.g. "qualification", "semifinal", "final"
  round?: string;     // e.g. "Heat 1", "Run 1", "Qualification"
}

/**
 * Detect if an API event is a preliminary/non-medal round.
 * These should NOT update our medal event status.
 */
const isPreliminaryEvent = (e: RapidAPIEvent): boolean => {
  const name = (e.event_name || '').toLowerCase();
  const phase = (e.phase || '').toLowerCase();
  const round = (e.round || '').toLowerCase();
  const status = (e.status || '').toLowerCase();
  const combined = `${name} ${phase} ${round} ${status}`;

  const prelimPatterns = [
    'qualif', 'prelim', 'heat', 'quarter', 'semi',
    'round of', 'repechage', 'seeding', 'ranking',
    'training', 'practice', 'inspection',
    'run 1', 'run 2', 'leg 1', 'leg 2',
    'short program', 'rhythm dance',  // figure skating prelim phases
    'group a', 'group b', 'group c',  // round-robin groups
    'round robin',
  ];

  return prelimPatterns.some(p => combined.includes(p));
};

/**
 * Fetch events from RapidAPI Olympics endpoint.
 * Filters to medal events only — preliminary rounds are excluded.
 */
export const fetchOlympicEvents = async (): Promise<OlympicEvent[]> => {
  try {
    const response = await fetch(
      `https://${API_HOST}/events/winter/2026`,
      {
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': API_HOST
        }
      }
    );

    if (!response.ok) {
      console.warn(`[OlympicData] API Error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const rawEvents: RapidAPIEvent[] = data.events || [];

    // Filter: only keep medal events, reject preliminary rounds
    const medalEvents = rawEvents.filter(e => {
      if (isPreliminaryEvent(e)) {
        return false; // Drop heats, qualifiers, semis, etc.
      }
      return true; // Keep finals, medal events, and untagged events
    });

    console.log(`[OlympicData] ${rawEvents.length} raw → ${medalEvents.length} medal events (filtered ${rawEvents.length - medalEvents.length} preliminary)`);

    return medalEvents.map((e: RapidAPIEvent) => ({
      id: e.id || `${e.sport}-${e.event_name}`.replace(/\s+/g, '-').toUpperCase(),
      sport: e.sport || e.discipline,
      name: e.event_name,
      gender: mapGender(e.gender),
      type: e.event_name.toLowerCase().includes('team') ? 'Team' : 'Individual',
      status: mapStatus(e.status),
      startTime: new Date(e.start_time).getTime(),
      description: `Venue: ${e.venue || 'TBD'}`
    }));
  } catch (error) {
    console.error('[OlympicData] Fetch failed:', error);
    return [];
  }
};

const mapGender = (gender: string): 'Men' | 'Women' | 'Mixed' => {
  if (!gender) return 'Mixed';
  const g = gender.toLowerCase();
  if (g.includes('men') && !g.includes('women')) return 'Men';
  if (g.includes('women')) return 'Women';
  return 'Mixed';
};

const mapStatus = (status: string): 'Scheduled' | 'Live' | 'Finished' => {
  if (!status) return 'Scheduled';
  const s = status.toLowerCase();
  if (s.includes('live') || s.includes('progress')) return 'Live';
  if (s.includes('finish') || s.includes('complete')) return 'Finished';
  return 'Scheduled';
};

/**
 * Store events in Firebase for the league
 * This allows commissioners to sync once and all users see updated data
 */
export const syncEventsToFirebase = async (leagueId: string): Promise<number> => {
  try {
    const events = await fetchOlympicEvents();
    
    if (events.length === 0) {
        console.warn("No events fetched from API, skipping sync.");
        return 0;
    }
    
    const batch = db.batch();
    const eventsRef = db.collection('leagues').doc(leagueId).collection('events');
    
    // Clear existing (batch limit consideration: up to 500 ops)
    // For 109 events, clear + write = ~218 ops, safe for one batch.
    const existing = await eventsRef.get();
    existing.docs.forEach(doc => batch.delete(doc.ref));
    
    events.forEach(event => {
      batch.set(eventsRef.doc(event.id), event);
    });
    
    await batch.commit();
    
    console.log(`[OlympicData] Synced ${events.length} events to league ${leagueId}`);
    return events.length;
  } catch (error) {
    console.error('[OlympicData] Sync failed:', error);
    throw error;
  }
};

/**
 * Merge API data with our static data (preserves our intel/descriptions).
 *
 * CRITICAL: Only accepts status updates for medal events.
 * If an API event name contains preliminary indicators (heat, qualifier, etc.),
 * we take the startTime but NOT the status — this prevents prelim completions
 * from locking medal events.
 */
export const mergeWithStaticData = (
  apiEvents: OlympicEvent[],
  staticEvents: OlympicEvent[]
): OlympicEvent[] => {
  if (!apiEvents || apiEvents.length === 0) return staticEvents;

  // Preliminary round indicators — if the API event name contains these,
  // its status should NOT propagate to our medal events
  const prelimIndicators = [
    'qualif', 'prelim', 'heat', 'quarter', 'semi',
    'round of', 'repechage', 'seeding', 'ranking',
    'training', 'practice', 'inspection',
    'run 1', 'run 2', 'leg 1', 'leg 2',
    'short program', 'rhythm dance',
    'group a', 'group b', 'group c', 'round robin',
  ];

  const isApiEventPrelim = (apiName: string): boolean => {
    const lower = apiName.toLowerCase();
    return prelimIndicators.some(p => lower.includes(p));
  };

  return staticEvents.map(staticEvent => {
    // Normalize names for better matching
    const cleanStaticName = staticEvent.name.toLowerCase().replace(/men's|women's|mixed/g, '').trim();

    // Find matching API event by sport + approximate name
    const apiMatch = apiEvents.find(api => {
      const cleanApiName = api.name.toLowerCase().replace(/men's|women's|mixed/g, '').trim();
      const sportMatch = api.sport.toLowerCase() === staticEvent.sport.toLowerCase();
      const genderMatch = api.gender === staticEvent.gender;

      // Fuzzy name check
      const nameMatch = cleanApiName.includes(cleanStaticName) || cleanStaticName.includes(cleanApiName);

      return sportMatch && genderMatch && nameMatch;
    });

    if (apiMatch) {
      // Safety check: if the matched API event looks like a prelim round,
      // take startTime but keep status as Scheduled
      const isPrelim = isApiEventPrelim(apiMatch.name);

      return {
        ...staticEvent,
        startTime: apiMatch.startTime,
        status: isPrelim ? staticEvent.status : (apiMatch.status as any),
      };
    }

    return staticEvent;
  });
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

// Expose to window for commissioner to run manually via console
if (typeof window !== 'undefined') {
  (window as any).syncOlympicEvents = async (leagueId: string) => {
    console.log('Syncing events...');
    try {
        const count = await syncEventsToFirebase(leagueId);
        console.log(`Done! Synced ${count} events.`);
        return count;
    } catch (e) {
        console.error(e);
        return 0;
    }
  };
}
