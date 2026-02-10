
import { CountryMetadata } from './types';
import { WINTER_OLYMPICS_COUNTRIES, EXTENDED_WINTER_NATIONS, ALL_WINTER_NATIONS, CountryData } from './data/olympicCountries';

// RapidAPI Olympic Sports API is DEAD (404 for 2026). Removed exposed key.
// Live results now fetched via /api/sync-results serverless function.

export const SCORING_RULES = {
  GOLD: 5,
  SILVER: 3,
  BRONZE: 1
};

// Opening Ceremony: Feb 6, 2026, 20:00 CET
export const DEFAULT_LOCK_TIME = new Date('2026-02-06T20:00:00Z').getTime();

// --- NEW DATA INTEGRATION ---

const mapCountry = (c: CountryData) => ({
  code: c.code,
  name: c.name,
  tier: c.draftStrategy === 'Elite' ? 1 : c.draftStrategy === 'Value' ? 2 : 3,
  ...c // Include full data for components that can use it
});

// Map new rich data to the simple list expected by legacy components (Dropdowns, etc)
export const COUNTRIES = WINTER_OLYMPICS_COUNTRIES.map(mapCountry);

export const EXTENDED_COUNTRIES = EXTENDED_WINTER_NATIONS.map(c => ({
  ...mapCountry(c),
  tier: 4 // All extended are deep picks
}));

export const ALL_COUNTRIES = [...COUNTRIES, ...EXTENDED_COUNTRIES];

// Build the metadata map for quick lookups
export const COUNTRY_METADATA: Record<string, CountryMetadata> = {};
ALL_WINTER_NATIONS.forEach(c => {
  COUNTRY_METADATA[c.code] = {
    code: c.code,
    name: c.name,
    stars: c.keyAthletes,
    bestSports: c.strengths,
    history: c.intel,
    projectedGold: c.projectedGold
  };
});

export const getCountryData = (code: string): CountryMetadata => {
  return COUNTRY_METADATA[code] || {
    code,
    name: ALL_COUNTRIES.find(c => c.code === code)?.name || code,
    stars: [],
    bestSports: [],
    history: 'Winter Games Participant.',
    projectedGold: 0
  };
};
