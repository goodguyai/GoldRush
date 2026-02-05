
export interface OlympicEvent {
  id: string;
  sport: string;
  name: string;
  gender: 'Men' | 'Women' | 'Mixed';
  type: 'Individual' | 'Team';
  status: 'Scheduled' | 'Live' | 'Finished';
  startTime?: number; // Unix timestamp for per-event locking
  defendingChamp?: string;
  favorites?: { code: string; odds: string; name?: string }[];
  description?: string;
}

export interface MedalResult {
  eventId: string;
  gold: string;
  silver: string;
  bronze: string;
  source?: 'test' | 'live' | 'manual';
  timestamp?: number;
  lastEditedBy?: string;
  lastEditedAt?: number;
}

export interface DraftedCountry {
  code: string;
  round: number;
  pickNumber: number;
  multiplier: number;
}

export interface ScoreBreakdown {
  medalPoints: number;
  confidenceBonuses: number;
  penalties: number;
  byCountry: Record<string, number>;
  bySport: Record<string, number>;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  penaltyCount: number;
}

export interface User {
  id: string;
  name: string;
  poolId: string;
  draftedCountries: string[];
  draftedCountriesDetailed: DraftedCountry[];
  confidenceEvents: string[];
  totalScore: number;
  scoreBreakdown?: ScoreBreakdown;
  isBot?: boolean;
  purchasedBoosts: number;
  role: 'commissioner' | 'player';
  timeZone?: string;
}

export interface DraftSettings {
  pickTimerDuration: number;
  autoDraftBehavior: 'random' | 'best' | 'commish';
  skipThreshold: number;
  draftStartTime?: number;
}

export interface Wave {
  id: string;
  leagueId?: string;
  name: string;
  inviteCode: string;
  draftStartTime: number;
  status: 'scheduled' | 'live' | 'completed';
  participants: string[];
  pickIndex: number;
  draftOrder: string[];
  draftSettings?: DraftSettings;
  recentPicks?: Array<{
    userId: string;
    countryCode: string;
    pickIndex: number;
    timestamp: number;
  }>;
}

export interface SimulationState {
  isRunning: boolean;
  speed: '1x' | '5x' | '20x' | '60x';
  startedAt: number;
  seed: string;
  autoDraft: boolean;
  autoCP: boolean;
  autoResults: boolean;
  ignoreCPLock: boolean;
}

export interface LeagueSettings {
  leagueName: string;
  leagueId: string;
  leagueCode: string;
  totalUsers: number;
  usersPerWave: number;
  numWaves: number;
  currentPhase: 'setup' | 'phase1_nation_draft' | 'phase2_confidence_picks' | 'live';
  entryFee: number;
  extraSlotPrice: number;
  waves: Wave[];
  openingCeremonyLockTime: number;
  cpDeadlineMode?: 'global' | 'per-event'; // New deadline mode
  isTestMode?: boolean;
  simulation?: SimulationState;
  myTeamName?: string;
  timeZone?: string;
}

export interface ScoreDetail {
  eventId: string;
  eventName: string;
  sport: string;
  points: number;
  medal: 'Gold' | 'Silver' | 'Bronze' | null;
  baseMultiplier: number;
  roundMultiplier: number;
  confidenceMultiplier: number;
  isConfidence: boolean;
  isPenalty: boolean;
  contributingCountry: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface CountryMetadata {
  code: string;
  name: string;
  stars: string[];
  bestSports: string[];
  history: string;
  projectedGold?: number;
}