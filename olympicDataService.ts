
/**
 * Olympic Data Service
 */

import { db } from './firebase';
import { OlympicEvent } from './types';
import { API_HOST, RAPID_API_KEY } from './constants';

interface RapidAPIEvent {
  id: string;
  sport: string;
  discipline: string;
  event_name: string;
  gender: string;
  start_time: string; 
  venue: string;
  status: string;
}

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
    
    return (data.events || []).map((e: RapidAPIEvent) => ({
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

export const syncEventsToFirebase = async (leagueId: string): Promise<number> => {
  try {
    const events = await fetchOlympicEvents();
    
    if (events.length === 0) {
        console.warn("No events fetched from API, skipping sync.");
        return 0;
    }
    
    const batch = db.batch();
    const eventsRef = db.collection('leagues').doc(leagueId).collection('events');
    
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

export const mergeWithStaticData = (
  apiEvents: OlympicEvent[], 
  staticEvents: OlympicEvent[]
): OlympicEvent[] => {
  if (!apiEvents || apiEvents.length === 0) return staticEvents;

  return staticEvents.map(staticEvent => {
    const cleanStaticName = staticEvent.name.toLowerCase().replace(/men's|women's|mixed/g, '').trim();
    
    const apiMatch = apiEvents.find(api => {
      const cleanApiName = api.name.toLowerCase().replace(/men's|women's|mixed/g, '').trim();
      const sportMatch = api.sport.toLowerCase() === staticEvent.sport.toLowerCase();
      const genderMatch = api.gender === staticEvent.gender;
      
      const nameMatch = cleanApiName.includes(cleanStaticName) || cleanStaticName.includes(cleanApiName);
      
      return sportMatch && genderMatch && nameMatch;
    });
    
    if (apiMatch) {
      return {
        ...staticEvent,
        startTime: apiMatch.startTime, 
        status: apiMatch.status as any, 
      };
    }
    
    return staticEvent;
  });
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
