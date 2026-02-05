import { API_HOST, RAPID_API_KEY } from '../constants';
import { MedalResult } from '../types';

/**
 * Fetches the latest results from RapidAPI.
 * Host: olympic-sports-api.p.rapidapi.com
 */
export const fetchOlympicResults = async (year: string = '2026'): Promise<MedalResult[]> => {
  const url = `https://${API_HOST}/olympics/medals?year=${year}`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': API_HOST
    }
  };

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.error(`API Error (${response.status}): ${response.statusText}`);
      // Fallback is simply empty array now - user requested "kill mock data"
      return [];
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      console.log("Live API Data received:", data.length, "records");
      return mapApiDataToResults(data);
    } 
    
    return [];

  } catch (error) {
    console.error("Failed to fetch live results:", error);
    return [];
  }
};

const mapApiDataToResults = (apiData: any[]): MedalResult[] => {
  return apiData.map((item: any) => ({
    eventId: item.game_id || item.slug || 'unknown', 
    gold: item.medals?.gold?.country_code || item.gold_medalist?.country_code || 'TBD',
    silver: item.medals?.silver?.country_code || item.silver_medalist?.country_code || 'TBD',
    bronze: item.medals?.bronze?.country_code || item.bronze_medalist?.country_code || 'TBD'
  }));
};