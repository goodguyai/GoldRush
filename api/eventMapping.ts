/**
 * Event ID Mapping for GoldRush
 *
 * Maps scraped event names from Olympics.com / ESPN to our internal event IDs
 * defined in staticData.ts (116 events total).
 *
 * Strategy: normalize sport + gender + event name keywords → lookup in map
 */

// ── Full event mapping table ──────────────────────────────────────────
// Key format: "sport|gender|normalized_name"
// Generated from staticData.ts rawEvents

export const EVENT_ID_MAP: Record<string, string> = {
  // ── Alpine Skiing (ALP-1 to ALP-10) ──
  "alpine skiing|men|downhill": "ALP-1",
  "alpine skiing|men|super-g": "ALP-2",
  "alpine skiing|men|super g": "ALP-2",
  "alpine skiing|men|giant slalom": "ALP-3",
  "alpine skiing|men|slalom": "ALP-4",
  "alpine skiing|men|combined": "ALP-5",
  "alpine skiing|men|team combined": "ALP-5",
  "alpine skiing|women|downhill": "ALP-6",
  "alpine skiing|women|super-g": "ALP-7",
  "alpine skiing|women|super g": "ALP-7",
  "alpine skiing|women|giant slalom": "ALP-8",
  "alpine skiing|women|slalom": "ALP-9",
  "alpine skiing|women|combined": "ALP-10",
  "alpine skiing|women|team combined": "ALP-10",

  // ── Biathlon (BIA-1 to BIA-11) ──
  "biathlon|men|10km sprint": "BIA-1",
  "biathlon|men|sprint": "BIA-1",
  "biathlon|men|20km individual": "BIA-2",
  "biathlon|men|individual": "BIA-2",
  "biathlon|men|12.5km pursuit": "BIA-3",
  "biathlon|men|pursuit": "BIA-3",
  "biathlon|men|15km mass start": "BIA-4",
  "biathlon|men|mass start": "BIA-4",
  "biathlon|men|4x7.5km relay": "BIA-5",
  "biathlon|men|relay": "BIA-5",
  "biathlon|women|7.5km sprint": "BIA-6",
  "biathlon|women|sprint": "BIA-6",
  "biathlon|women|15km individual": "BIA-7",
  "biathlon|women|individual": "BIA-7",
  "biathlon|women|10km pursuit": "BIA-8",
  "biathlon|women|pursuit": "BIA-8",
  "biathlon|women|12.5km mass start": "BIA-9",
  "biathlon|women|mass start": "BIA-9",
  "biathlon|women|4x6km relay": "BIA-10",
  "biathlon|women|relay": "BIA-10",
  "biathlon|mixed|mixed relay": "BIA-11",
  "biathlon|mixed|relay": "BIA-11",
  "biathlon|mixed|4x6km": "BIA-11",

  // ── Bobsleigh (BOB-1 to BOB-4) ──
  "bobsleigh|men|two-man": "BOB-1",
  "bobsleigh|men|two man": "BOB-1",
  "bobsleigh|men|2-man": "BOB-1",
  "bobsled|men|two-man": "BOB-1",
  "bobsled|men|two man": "BOB-1",
  "bobsled|men|2-man": "BOB-1",
  "bobsleigh|men|four-man": "BOB-2",
  "bobsleigh|men|four man": "BOB-2",
  "bobsleigh|men|4-man": "BOB-2",
  "bobsled|men|four-man": "BOB-2",
  "bobsled|men|four man": "BOB-2",
  "bobsled|men|4-man": "BOB-2",
  "bobsleigh|women|two-woman": "BOB-3",
  "bobsleigh|women|two woman": "BOB-3",
  "bobsleigh|women|2-woman": "BOB-3",
  "bobsled|women|two-woman": "BOB-3",
  "bobsled|women|two woman": "BOB-3",
  "bobsled|women|2-woman": "BOB-3",
  "bobsleigh|women|monobob": "BOB-4",
  "bobsled|women|monobob": "BOB-4",

  // ── Curling (CUR-1 to CUR-3) ──
  "curling|men|tournament": "CUR-1",
  "curling|men|curling": "CUR-1",
  "curling|women|tournament": "CUR-2",
  "curling|women|curling": "CUR-2",
  "curling|mixed|mixed doubles": "CUR-3",
  "curling|mixed|doubles": "CUR-3",

  // ── Cross-Country Skiing (XC-1 to XC-12) ──
  "cross-country skiing|men|sprint classic": "XC-1",
  "cross-country skiing|men|sprint": "XC-1",
  "cross-country|men|sprint classic": "XC-1",
  "cross-country|men|sprint": "XC-1",
  "cross-country skiing|men|10km interval": "XC-2",
  "cross-country skiing|men|10km freestyle": "XC-2",
  "cross-country skiing|men|10km": "XC-2",
  "cross-country|men|10km": "XC-2",
  "cross-country skiing|men|skiathlon": "XC-3",
  "cross-country skiing|men|10km + 10km skiathlon": "XC-3",
  "cross-country|men|skiathlon": "XC-3",
  "cross-country skiing|men|50km mass start": "XC-4",
  "cross-country skiing|men|50km": "XC-4",
  "cross-country|men|50km": "XC-4",
  "cross-country skiing|men|team sprint": "XC-5",
  "cross-country|men|team sprint": "XC-5",
  "cross-country skiing|men|4x7.5km relay": "XC-6",
  "cross-country skiing|men|relay": "XC-6",
  "cross-country|men|relay": "XC-6",
  "cross-country skiing|women|sprint classic": "XC-7",
  "cross-country skiing|women|sprint": "XC-7",
  "cross-country|women|sprint classic": "XC-7",
  "cross-country|women|sprint": "XC-7",
  "cross-country skiing|women|10km interval": "XC-8",
  "cross-country skiing|women|10km freestyle": "XC-8",
  "cross-country skiing|women|10km": "XC-8",
  "cross-country|women|10km": "XC-8",
  "cross-country skiing|women|skiathlon": "XC-9",
  "cross-country skiing|women|10km + 10km skiathlon": "XC-9",
  "cross-country|women|skiathlon": "XC-9",
  "cross-country skiing|women|50km mass start": "XC-10",
  "cross-country skiing|women|50km": "XC-10",
  "cross-country|women|50km": "XC-10",
  "cross-country skiing|women|team sprint": "XC-11",
  "cross-country|women|team sprint": "XC-11",
  "cross-country skiing|women|4x7.5km relay": "XC-12",
  "cross-country skiing|women|relay": "XC-12",
  "cross-country|women|relay": "XC-12",

  // ── Figure Skating (FIG-1 to FIG-5) ──
  "figure skating|men|single skating": "FIG-1",
  "figure skating|men|singles": "FIG-1",
  "figure skating|men|individual": "FIG-1",
  "figure skating|women|single skating": "FIG-2",
  "figure skating|women|singles": "FIG-2",
  "figure skating|women|individual": "FIG-2",
  "figure skating|mixed|pair skating": "FIG-3",
  "figure skating|mixed|pairs": "FIG-3",
  "figure skating|mixed|ice dance": "FIG-4",
  "figure skating|mixed|dance": "FIG-4",
  "figure skating|mixed|team event": "FIG-5",
  "figure skating|mixed|team": "FIG-5",

  // ── Freestyle Skiing (FREE-1 to FREE-13) ──
  "freestyle skiing|men|aerials": "FREE-1",
  "freestyle|men|aerials": "FREE-1",
  "freestyle skiing|men|moguls": "FREE-2",
  "freestyle|men|moguls": "FREE-2",
  "freestyle skiing|men|dual moguls": "FREE-2B",
  "freestyle|men|dual moguls": "FREE-2B",
  "freestyle skiing|men|halfpipe": "FREE-3",
  "freestyle skiing|men|freeski halfpipe": "FREE-3",
  "freestyle|men|halfpipe": "FREE-3",
  "freestyle skiing|men|slopestyle": "FREE-4",
  "freestyle skiing|men|freeski slopestyle": "FREE-4",
  "freestyle|men|slopestyle": "FREE-4",
  "freestyle skiing|men|big air": "FREE-5",
  "freestyle skiing|men|freeski big air": "FREE-5",
  "freestyle|men|big air": "FREE-5",
  "freestyle skiing|men|ski cross": "FREE-6",
  "freestyle|men|ski cross": "FREE-6",
  "freestyle skiing|women|aerials": "FREE-7",
  "freestyle|women|aerials": "FREE-7",
  "freestyle skiing|women|moguls": "FREE-8",
  "freestyle|women|moguls": "FREE-8",
  "freestyle skiing|women|dual moguls": "FREE-8B",
  "freestyle|women|dual moguls": "FREE-8B",
  "freestyle skiing|women|halfpipe": "FREE-9",
  "freestyle skiing|women|freeski halfpipe": "FREE-9",
  "freestyle|women|halfpipe": "FREE-9",
  "freestyle skiing|women|slopestyle": "FREE-10",
  "freestyle skiing|women|freeski slopestyle": "FREE-10",
  "freestyle|women|slopestyle": "FREE-10",
  "freestyle skiing|women|big air": "FREE-11",
  "freestyle skiing|women|freeski big air": "FREE-11",
  "freestyle|women|big air": "FREE-11",
  "freestyle skiing|women|ski cross": "FREE-12",
  "freestyle|women|ski cross": "FREE-12",
  "freestyle skiing|mixed|mixed team aerials": "FREE-13",
  "freestyle skiing|mixed|team aerials": "FREE-13",
  "freestyle|mixed|team aerials": "FREE-13",

  // ── Ice Hockey (ICE-1 to ICE-2) ──
  "ice hockey|men|tournament": "ICE-1",
  "ice hockey|men|ice hockey": "ICE-1",
  "ice hockey|women|tournament": "ICE-2",
  "ice hockey|women|ice hockey": "ICE-2",

  // ── Luge (LUG-1 to LUG-4) ──
  "luge|men|singles": "LUG-1",
  "luge|men|men's singles": "LUG-1",
  "luge|women|singles": "LUG-2",
  "luge|women|women's singles": "LUG-2",
  "luge|men|doubles": "LUG-3",
  "luge|men|men's doubles": "LUG-3",
  "luge|women|doubles": "LUG-3B",
  "luge|women|women's doubles": "LUG-3B",
  "luge|mixed|team relay": "LUG-4",
  "luge|mixed|relay": "LUG-4",

  // ── Nordic Combined (NOR-1 to NOR-3) ──
  "nordic combined|men|normal hill": "NOR-1",
  "nordic combined|men|individual gundersen normal hill": "NOR-1",
  "nordic combined|men|gundersen normal hill/10km": "NOR-1",
  "nordic combined|men|large hill": "NOR-2",
  "nordic combined|men|individual gundersen large hill": "NOR-2",
  "nordic combined|men|gundersen large hill/10km": "NOR-2",
  "nordic combined|men|team sprint": "NOR-3",
  "nordic combined|men|sprint": "NOR-3",

  // ── Short Track (SHORT-1 to SHORT-9) ──
  "short track speed skating|men|500m": "SHORT-1",
  "short track|men|500m": "SHORT-1",
  "short track speed skating|men|1000m": "SHORT-2",
  "short track|men|1000m": "SHORT-2",
  "short track speed skating|men|1500m": "SHORT-3",
  "short track|men|1500m": "SHORT-3",
  "short track speed skating|men|5000m relay": "SHORT-4",
  "short track|men|5000m relay": "SHORT-4",
  "short track|men|relay": "SHORT-4",
  "short track speed skating|women|500m": "SHORT-5",
  "short track|women|500m": "SHORT-5",
  "short track speed skating|women|1000m": "SHORT-6",
  "short track|women|1000m": "SHORT-6",
  "short track speed skating|women|1500m": "SHORT-7",
  "short track|women|1500m": "SHORT-7",
  "short track speed skating|women|3000m relay": "SHORT-8",
  "short track|women|3000m relay": "SHORT-8",
  "short track|women|relay": "SHORT-8",
  "short track speed skating|mixed|mixed team relay": "SHORT-9",
  "short track|mixed|mixed team relay": "SHORT-9",
  "short track|mixed|relay": "SHORT-9",

  // ── Skeleton (SKEL-1 to SKEL-3) ──
  "skeleton|men|singles": "SKEL-1",
  "skeleton|men|individual": "SKEL-1",
  "skeleton|women|singles": "SKEL-2",
  "skeleton|women|individual": "SKEL-2",
  "skeleton|mixed|mixed team": "SKEL-3",
  "skeleton|mixed|team": "SKEL-3",

  // ── Ski Jumping (SKI-1 to SKI-5) ──
  "ski jumping|men|individual normal hill": "SKI-1",
  "ski jumping|men|normal hill individual": "SKI-1",
  "ski jumping|men|normal hill": "SKI-1",
  "ski jumping|men|individual large hill": "SKI-2",
  "ski jumping|men|large hill individual": "SKI-2",
  "ski jumping|men|large hill": "SKI-2",
  "ski jumping|men|super team": "SKI-3",
  "ski jumping|men|team large hill": "SKI-3",
  "ski jumping|men|team": "SKI-3",
  "ski jumping|women|individual normal hill": "SKI-4",
  "ski jumping|women|normal hill individual": "SKI-4",
  "ski jumping|women|normal hill": "SKI-4",
  "ski jumping|women|individual large hill": "SKI-4B",
  "ski jumping|women|large hill individual": "SKI-4B",
  "ski jumping|women|large hill": "SKI-4B",
  "ski jumping|mixed|mixed team": "SKI-5",
  "ski jumping|mixed|team": "SKI-5",

  // ── Ski Mountaineering (SKMO-1 to SKMO-3) ──
  "ski mountaineering|men|sprint": "SKMO-1",
  "ski mountaineering|women|sprint": "SKMO-2",
  "ski mountaineering|mixed|mixed relay": "SKMO-3",
  "ski mountaineering|mixed|relay": "SKMO-3",

  // ── Snowboarding (SNOW-1 to SNOW-11) ──
  "snowboard|men|halfpipe": "SNOW-1",
  "snowboarding|men|halfpipe": "SNOW-1",
  "snowboard|men|slopestyle": "SNOW-2",
  "snowboarding|men|slopestyle": "SNOW-2",
  "snowboard|men|big air": "SNOW-3",
  "snowboarding|men|big air": "SNOW-3",
  "snowboard|men|parallel giant slalom": "SNOW-4",
  "snowboarding|men|parallel giant slalom": "SNOW-4",
  "snowboard|men|snowboard cross": "SNOW-5",
  "snowboarding|men|snowboard cross": "SNOW-5",
  "snowboard|men|cross": "SNOW-5",
  "snowboard|women|halfpipe": "SNOW-6",
  "snowboarding|women|halfpipe": "SNOW-6",
  "snowboard|women|slopestyle": "SNOW-7",
  "snowboarding|women|slopestyle": "SNOW-7",
  "snowboard|women|big air": "SNOW-8",
  "snowboarding|women|big air": "SNOW-8",
  "snowboard|women|parallel giant slalom": "SNOW-9",
  "snowboarding|women|parallel giant slalom": "SNOW-9",
  "snowboard|women|snowboard cross": "SNOW-10",
  "snowboarding|women|snowboard cross": "SNOW-10",
  "snowboard|women|cross": "SNOW-10",
  "snowboard|mixed|mixed team snowboard cross": "SNOW-11",
  "snowboarding|mixed|mixed team snowboard cross": "SNOW-11",
  "snowboard|mixed|team cross": "SNOW-11",
  "snowboard|mixed|mixed team cross": "SNOW-11",

  // ── Speed Skating (SPEED-1 to SPEED-14) ──
  "speed skating|men|500m": "SPEED-1",
  "speed skating|men|1000m": "SPEED-2",
  "speed skating|men|1,000m": "SPEED-2",
  "speed skating|men|1500m": "SPEED-3",
  "speed skating|men|1,500m": "SPEED-3",
  "speed skating|men|5000m": "SPEED-4",
  "speed skating|men|5,000m": "SPEED-4",
  "speed skating|men|10000m": "SPEED-5",
  "speed skating|men|10,000m": "SPEED-5",
  "speed skating|men|team pursuit": "SPEED-6",
  "speed skating|men|mass start": "SPEED-7",
  "speed skating|women|500m": "SPEED-8",
  "speed skating|women|1000m": "SPEED-9",
  "speed skating|women|1,000m": "SPEED-9",
  "speed skating|women|1500m": "SPEED-10",
  "speed skating|women|1,500m": "SPEED-10",
  "speed skating|women|3000m": "SPEED-11",
  "speed skating|women|3,000m": "SPEED-11",
  "speed skating|women|5000m": "SPEED-12",
  "speed skating|women|5,000m": "SPEED-12",
  "speed skating|women|team pursuit": "SPEED-13",
  "speed skating|women|mass start": "SPEED-14",
};

// ── Country code aliases ──────────────────────────────────────────────
// Handle differences between what Olympics.com shows and our internal codes
export const COUNTRY_CODE_ALIASES: Record<string, string> = {
  "ROC": "ROC",
  "AIN": "AIN",   // Individual Neutral Athletes
  "GBR": "GBR",
  "GER": "GER",
  "SUI": "SUI",
  "NED": "NED",
  "BUL": "BUL",
  "CRO": "CRO",
  "DEN": "DEN",
  "RSA": "RSA",
  "PUR": "PUR",
  "TPE": "TPE",
};

// ── Sport name normalization ──────────────────────────────────────────
const SPORT_ALIASES: Record<string, string> = {
  "alpine": "alpine skiing",
  "cross-country": "cross-country skiing",
  "cross country": "cross-country skiing",
  "cross country skiing": "cross-country skiing",
  "freestyle": "freestyle skiing",
  "bobsled": "bobsleigh",
  "short track speed skating": "short track",
  "short-track speed skating": "short track",
  "short-track": "short track",
  "snowboard": "snowboard",
  "snowboarding": "snowboard",
  "figure skating": "figure skating",
  "ski jumping": "ski jumping",
  "nordic combined": "nordic combined",
  "speed skating": "speed skating",
  "luge": "luge",
  "skeleton": "skeleton",
  "biathlon": "biathlon",
  "curling": "curling",
  "ice hockey": "ice hockey",
  "ski mountaineering": "ski mountaineering",
};

/**
 * Normalize a sport name to our canonical form
 */
function normalizeSport(sport: string): string {
  const lower = sport.toLowerCase().trim();
  return SPORT_ALIASES[lower] || lower;
}

/**
 * Normalize a country code — resolve aliases
 */
export function normalizeCountryCode(code: string): string {
  const upper = code.toUpperCase().trim();
  return COUNTRY_CODE_ALIASES[upper] || upper;
}

/**
 * Extract gender from event name or explicit gender field
 */
function normalizeGender(gender?: string, eventName?: string): string {
  if (gender) {
    const g = gender.toLowerCase().trim();
    if (g.includes("men") && !g.includes("women")) return "men";
    if (g.includes("women") || g.includes("female")) return "women";
    if (g.includes("mix")) return "mixed";
  }
  if (eventName) {
    const lower = eventName.toLowerCase();
    if (lower.includes("mixed") || lower.includes("team event") || lower.includes("pair")) return "mixed";
    if (lower.includes("women")) return "women";
    if (lower.includes("men")) return "men";
  }
  return "mixed";
}

/**
 * Normalize an event name by stripping gender prefixes and common fluff
 */
function normalizeEventName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(men'?s?|women'?s?|mixed)\s+/i, "")
    .replace(/\s*-\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Match a scraped event to our internal event ID.
 *
 * @param sport - Sport name from the scraped source
 * @param eventName - Event name from the scraped source
 * @param gender - Gender/category if available
 * @returns The matched event ID or null
 */
export function matchEvent(
  sport: string,
  eventName: string,
  gender?: string
): string | null {
  const normSport = normalizeSport(sport);
  const normGender = normalizeGender(gender, eventName);
  const normName = normalizeEventName(eventName);

  // Try exact lookup
  const key1 = `${normSport}|${normGender}|${normName}`;
  if (EVENT_ID_MAP[key1]) return EVENT_ID_MAP[key1];

  // Try with full event name (before stripping gender)
  const fullNorm = eventName.toLowerCase().replace(/\s*-\s*/g, " ").replace(/\s+/g, " ").trim();
  const key2 = `${normSport}|${normGender}|${fullNorm}`;
  if (EVENT_ID_MAP[key2]) return EVENT_ID_MAP[key2];

  // Try partial matching — check if any key contains our name
  const candidates = Object.entries(EVENT_ID_MAP).filter(([k]) => {
    const parts = k.split("|");
    return parts[0] === normSport && parts[1] === normGender;
  });

  for (const [key, id] of candidates) {
    const keyName = key.split("|")[2];
    // Check if our normalized name contains the key name or vice versa
    if (normName.includes(keyName) || keyName.includes(normName)) {
      return id;
    }
  }

  // Try matching with key words
  const words = normName.split(" ").filter(w => w.length > 2);
  for (const [key, id] of candidates) {
    const keyName = key.split("|")[2];
    const matchCount = words.filter(w => keyName.includes(w)).length;
    if (matchCount >= 2 || (words.length === 1 && matchCount === 1)) {
      return id;
    }
  }

  return null;
}
