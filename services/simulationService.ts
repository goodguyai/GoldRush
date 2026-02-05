
import { Wave, User, OlympicEvent, MedalResult } from '../types';
import { COUNTRIES } from '../constants';

// Deterministic Pseudo-Random Number Generator based on seed
const seededRandom = (seed: string) => {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h >>> 0) / 4294967296;
  }
};

export const getBotDraftPick = (wave: Wave, allUsers: User[], seed: string): { userId: string, countryCode: string } | null => {
  // 1. Determine whose turn it is
  const waveSize = wave.participants.length;
  if (wave.pickIndex >= waveSize * 4) return null; // Draft complete

  const round = Math.floor(wave.pickIndex / waveSize);
  const pos = wave.pickIndex % waveSize;
  const isReverse = round % 2 !== 0;
  const userIndex = isReverse ? (waveSize - 1 - pos) : pos;
  const userId = wave.draftOrder[userIndex];

  // 2. Determine available countries (Wave Isolated)
  // Only exclude countries drafted by users IN THIS WAVE
  const draftedInWave = allUsers
    .filter(u => u.poolId === wave.id)
    .flatMap(u => u.draftedCountries);

  const available = COUNTRIES.filter(c => !draftedInWave.includes(c.code));
  if (available.length === 0) return null;

  // 3. Pick deterministic country based on seed + pickIndex
  const rng = seededRandom(`${seed}-${wave.id}-${wave.pickIndex}`);
  const randomIndex = Math.floor(rng() * available.length);
  
  return {
    userId,
    countryCode: available[randomIndex].code
  };
};

export const getBotConfidencePicks = (user: User, events: OlympicEvent[], seed: string): string[] => {
  if (user.confidenceEvents.length >= 10) return user.confidenceEvents;

  const rng = seededRandom(`${seed}-${user.id}-cp`);
  const picks: string[] = [...user.confidenceEvents];
  const sportsCount: Record<string, number> = {};

  // Count existing
  picks.forEach(id => {
    const s = events.find(e => e.id === id)?.sport;
    if (s) sportsCount[s] = (sportsCount[s] || 0) + 1;
  });

  const availableEvents = events.filter(e => !picks.includes(e.id));
  
  // Simple heuristic: fill up to 10
  for (const e of availableEvents) {
    if (picks.length >= 10) break;
    // Enforce max 2 per sport
    if ((sportsCount[e.sport] || 0) < 2) {
      // 50% chance to pick if available, to create variety
      if (rng() > 0.3) {
        picks.push(e.id);
        sportsCount[e.sport] = (sportsCount[e.sport] || 0) + 1;
      }
    }
  }

  // Force fill if under 10
  if (picks.length < 10) {
     for (const e of availableEvents) {
        if (picks.length >= 10) break;
        if (!picks.includes(e.id) && (sportsCount[e.sport] || 0) < 2) {
            picks.push(e.id);
            sportsCount[e.sport] = (sportsCount[e.sport] || 0) + 1;
        }
     }
  }

  return picks;
};

export const generateSimulatedResult = (
  events: OlympicEvent[], 
  currentResults: MedalResult[], 
  allUsers: User[],
  seed: string
): MedalResult | null => {
  const completedIds = currentResults.map(r => r.eventId);
  const availableEvents = events.filter(e => !completedIds.includes(e.id));
  if (availableEvents.length === 0) return null;

  const rng = seededRandom(`${seed}-${currentResults.length}`);
  const nextEvent = availableEvents[Math.floor(rng() * availableEvents.length)];

  // Create interesting results: 50% chance to favor drafted countries
  const draftedCountries = Array.from(new Set(allUsers.flatMap(u => u.draftedCountries)));
  const allCountryCodes = COUNTRIES.map(c => c.code);
  
  const pool = (draftedCountries.length >= 3 && rng() > 0.4) 
    ? draftedCountries 
    : allCountryCodes;

  // Shuffle pool
  const shuffled = [...pool].sort(() => 0.5 - rng());
  
  // Ensure we have 3 distinct
  const winners = shuffled.slice(0, 3);
  while (winners.length < 3) {
    const extra = allCountryCodes[Math.floor(rng() * allCountryCodes.length)];
    if (!winners.includes(extra)) winners.push(extra);
  }

  return {
    eventId: nextEvent.id,
    gold: winners[0],
    silver: winners[1],
    bronze: winners[2],
  };
};

export const getNextEvents = (allEvents: OlympicEvent[], currentResults: MedalResult[], count: number = 15): OlympicEvent[] => {
   const completedIds = new Set(currentResults.map(r => r.eventId));
   return allEvents.filter(e => !completedIds.has(e.id)).slice(0, count);
};