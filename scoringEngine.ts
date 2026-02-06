
import { MedalResult, OlympicEvent, ScoreDetail, User, DraftedCountry, ScoreBreakdown } from './types';
import { SCORING_RULES } from './constants';

const CONFIDENCE_PENALTY = -100;
const ROUND_MULTIPLIERS = [1, 5, 10, 20];

const getDetailedDraftInfo = (user: User): DraftedCountry[] => {
  if (user.draftedCountriesDetailed && user.draftedCountriesDetailed.length > 0) {
    return user.draftedCountriesDetailed;
  }

  return user.draftedCountries.map((code, index) => {
    const roundIndex = Math.min(index, 3);
    return {
      code,
      round: roundIndex + 1,
      pickNumber: index + 1,
      multiplier: ROUND_MULTIPLIERS[roundIndex]
    };
  });
};

const calculateEventScore = (
  event: OlympicEvent,
  result: MedalResult,
  draftedDetails: DraftedCountry[],
  isConfidence: boolean
): ScoreDetail[] => {
  const details: ScoreDetail[] = [];
  const confidenceMultiplier = isConfidence ? 2.0 : 1.0;
  const userCodes = draftedDetails.map(c => c.code);

  (['gold', 'silver', 'bronze'] as const).forEach(medalType => {
    const winnerCode = result[medalType];
    if (!winnerCode) return;

    const ownedCountry = draftedDetails.find(c => c.code === winnerCode);
    if (!ownedCountry) return;

    const basePoints = medalType === 'gold' ? SCORING_RULES.GOLD : 
                       medalType === 'silver' ? SCORING_RULES.SILVER : 
                       SCORING_RULES.BRONZE;

    const finalPoints = basePoints * ownedCountry.multiplier * confidenceMultiplier;

    details.push({
      eventId: event.id,
      eventName: event.name,
      sport: event.sport,
      points: finalPoints,
      medal: medalType.charAt(0).toUpperCase() + medalType.slice(1) as 'Gold' | 'Silver' | 'Bronze',
      baseMultiplier: 1,
      roundMultiplier: ownedCountry.multiplier,
      confidenceMultiplier: confidenceMultiplier,
      isConfidence: isConfidence,
      isPenalty: false,
      contributingCountry: winnerCode
    });
  });

  if (isConfidence && details.length === 0) {
    const wonAnyMedal = userCodes.includes(result.gold) || 
                        userCodes.includes(result.silver) || 
                        userCodes.includes(result.bronze);
    
    if (!wonAnyMedal) {
      details.push({
        eventId: event.id,
        eventName: event.name,
        sport: event.sport,
        points: CONFIDENCE_PENALTY,
        medal: null,
        baseMultiplier: 1,
        roundMultiplier: 1,
        confidenceMultiplier: 1,
        isConfidence: true,
        isPenalty: true,
        contributingCountry: 'N/A'
      });
    }
  }

  return details;
};

export const calculateUserScore = (
  user: User,
  results: MedalResult[],
  events: OlympicEvent[]
): { total: number; details: ScoreDetail[]; breakdown: ScoreBreakdown } => {
  const draftedDetails = getDetailedDraftInfo(user);
  const allDetails: ScoreDetail[] = [];
  
  results.forEach(result => {
    const event = events.find(e => e.id === result.eventId);
    if (!event) return;

    const isConfidence = user.confidenceEvents.includes(event.id);
    const eventDetails = calculateEventScore(event, result, draftedDetails, isConfidence);
    allDetails.push(...eventDetails);
  });

  const total = allDetails.reduce((sum, d) => sum + d.points, 0);
  
  const breakdown: ScoreBreakdown = {
    medalPoints: allDetails.filter(d => !d.isPenalty && d.medal).reduce((s, d) => s + d.points, 0),
    confidenceBonuses: allDetails.filter(d => d.isConfidence && !d.isPenalty && d.confidenceMultiplier > 1)
                                  .reduce((s, d) => s + (d.points / 2), 0), 
    penalties: allDetails.filter(d => d.isPenalty).reduce((s, d) => s + d.points, 0),
    byCountry: {},
    bySport: {},
    goldCount: allDetails.filter(d => d.medal === 'Gold').length,
    silverCount: allDetails.filter(d => d.medal === 'Silver').length,
    bronzeCount: allDetails.filter(d => d.medal === 'Bronze').length,
    penaltyCount: allDetails.filter(d => d.isPenalty).length
  };

  allDetails.forEach(d => {
    if (d.contributingCountry && d.contributingCountry !== 'N/A') {
      breakdown.byCountry[d.contributingCountry] = (breakdown.byCountry[d.contributingCountry] || 0) + d.points;
    }
  });

  allDetails.forEach(d => {
    breakdown.bySport[d.sport] = (breakdown.bySport[d.sport] || 0) + d.points;
  });

  return { total, details: allDetails, breakdown };
};

export const verifyScoring = (
  user: User,
  results: MedalResult[],
  events: OlympicEvent[]
): {
  isValid: boolean;
  calculatedTotal: number;
  expectedFormula: string;
  details: ScoreDetail[];
  warnings: string[];
} => {
  const { total, details } = calculateUserScore(user, results, events);
  const warnings: string[] = [];

  if (user.draftedCountries.length === 0) {
    warnings.push('User has no drafted countries');
  }
  
  if (user.confidenceEvents.length > 10 + user.purchasedBoosts) {
    warnings.push(`Too many confidence picks: ${user.confidenceEvents.length} > ${10 + user.purchasedBoosts}`);
  }

  const cpBySport: Record<string, number> = {};
  user.confidenceEvents.forEach(eventId => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      cpBySport[event.sport] = (cpBySport[event.sport] || 0) + 1;
    }
  });
  Object.entries(cpBySport).forEach(([sport, count]) => {
    if (count > 2) {
      warnings.push(`Too many CPs in ${sport}: ${count} > 2`);
    }
  });

  const formulaParts = details.map(d => {
    if (d.isPenalty) return `-100 (CP penalty: ${d.eventName})`;
    return `${d.medal}(${d.contributingCountry}) × ${d.roundMultiplier}x × ${d.confidenceMultiplier}x = ${d.points}`;
  });

  return {
    isValid: warnings.length === 0,
    calculatedTotal: total,
    expectedFormula: formulaParts.join(' + '),
    details,
    warnings
  };
};
