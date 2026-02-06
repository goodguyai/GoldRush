
export interface CountryData {
  code: string;
  name: string;
  colors: string[];
  totalMedals: number;
  recentMedals: number; 
  projectedGold: number;
  strengths: string[];
  keyAthletes: string[];
  intel: string;
  draftStrategy: 'Elite' | 'Value' | 'Sleeper' | 'Risky' | 'Deep';
}

export const WINTER_OLYMPICS_COUNTRIES: CountryData[] = [
  {
    code: "NOR",
    name: "Norway",
    colors: ["#BA0C2F", "#00205B", "#FFFFFF"],
    totalMedals: 405,
    recentMedals: 39,
    projectedGold: 18,
    strengths: ["Cross-Country", "Biathlon", "Nordic Combined"],
    keyAthletes: ["J. T. Bø", "J. Klæbo", "H. Granerud"],
    intel: "The undisputed kings of winter. Norway dominates endurance events with ruthless efficiency. Expect 35+ total medals. Safe #1 overall pick with massive floor and ceiling.",
    draftStrategy: 'Elite'
  },
  {
    code: "GER",
    name: "Germany",
    colors: ["#000000", "#DD0000", "#FFCE00"],
    totalMedals: 438,
    recentMedals: 29,
    projectedGold: 14,
    strengths: ["Luge", "Bobsled", "Skeleton", "Biathlon"],
    keyAthletes: ["F. Friedrich", "J. Taubitz", "C. Grotheer"],
    intel: "Track specialists. The sliding center is their gold mine (expect 8-10 golds from sleds alone). Biathlon adds depth. Extremely consistent performance due to technical dominance.",
    draftStrategy: 'Elite'
  },
  {
    code: "USA",
    name: "United States",
    colors: ["#B22234", "#FFFFFF", "#3C3B6E"],
    totalMedals: 330,
    recentMedals: 25,
    projectedGold: 11,
    strengths: ["Snowboarding", "Freestyle Skiing", "Figure Skating", "Hockey"],
    keyAthletes: ["M. Shiffrin", "I. Malinin", "C. Kim"],
    intel: "X-Games on snow. USA feasts on freestyle and snowboarding events. Shiffrin brings alpine upside. High variance but explosive scoring potential in judged events.",
    draftStrategy: 'Elite'
  },
  {
    code: "CAN",
    name: "Canada",
    colors: ["#FF0000", "#FFFFFF"],
    totalMedals: 225,
    recentMedals: 27,
    projectedGold: 10,
    strengths: ["Ice Hockey", "Freestyle Skiing", "Short Track", "Curling"],
    keyAthletes: ["M. Kingsbury", "C. McDavid", "M. Poulin"],
    intel: "Hockey royalty. Men's and Women's hockey gold would be huge. Moguls and slopestyle provide reliable medal counts. Consistent top-5 finisher.",
    draftStrategy: 'Elite'
  },
  {
    code: "AIN",
    name: "AIN (Neutral)",
    colors: ["#FFFFFF", "#87CEEB", "#FFFFFF"],
    totalMedals: 0, 
    recentMedals: 6,
    projectedGold: 3,
    strengths: ["Cross-Country", "Figure Skating", "Biathlon", "Freestyle"],
    keyAthletes: ["A. Bolshunov (if eligible)", "Qualified Neutrals"],
    intel: "Individual neutral athletes from Russia and Belarus. No flag, no anthem. Participation is strict and limited. High uncertainty but potential elite talent in endurance events and figure skating. Extremely risky draft pick due to unknown roster.",
    draftStrategy: 'Risky'
  },
  {
    code: "NED",
    name: "Netherlands",
    colors: ["#FF4F00", "#FFFFFF", "#214B9F"],
    totalMedals: 147,
    recentMedals: 20,
    projectedGold: 8,
    strengths: ["Speed Skating", "Short Track"],
    keyAthletes: ["I. Schouten", "J. Leerdam", "K. Nuis"],
    intel: "The Speed Skating factory. They will win 15-20 medals purely on the oval. One-dimensional but elite at that dimension. Great stacking pick.",
    draftStrategy: 'Value'
  },
  {
    code: "AUT",
    name: "Austria",
    colors: ["#ED2939", "#FFFFFF"],
    totalMedals: 250,
    recentMedals: 16,
    projectedGold: 7,
    strengths: ["Alpine Skiing", "Ski Jumping", "Snowboarding"],
    keyAthletes: ["M. Feller", "S. Kraft", "A. Gasser"],
    intel: "Alpine power. Proximity to Italian venues gives a pseudo-home advantage. Deep alpine roster ensures podiums even if stars falter.",
    draftStrategy: 'Value'
  },
  {
    code: "SWE",
    name: "Sweden",
    colors: ["#006AA7", "#FECC00"],
    totalMedals: 176,
    recentMedals: 14,
    projectedGold: 7,
    strengths: ["Cross-Country", "Biathlon", "Curling", "Freestyle"],
    keyAthletes: ["S. Nystad", "E. Öberg", "N. van der Poel"],
    intel: "Endurance experts. Women's cross-country and biathlon teams are lethal. Curling medals are nearly guaranteed. Very efficient mid-round pick.",
    draftStrategy: 'Value'
  },
  {
    code: "CHN",
    name: "China",
    colors: ["#DE2910", "#FFDE00"],
    totalMedals: 77,
    recentMedals: 13,
    projectedGold: 8,
    strengths: ["Freestyle Skiing", "Short Track", "Speed Skating"],
    keyAthletes: ["Eileen Gu", "Su Yiming", "Ren Ziwei"],
    intel: "Post-hosting boom. Eileen Gu is a multi-gold cheat code. Short track team is aggressive and high-scoring. High ceiling, lower floor.",
    draftStrategy: 'Sleeper'
  },
  {
    code: "SUI",
    name: "Switzerland",
    colors: ["#FF0000", "#FFFFFF"],
    totalMedals: 167,
    recentMedals: 13,
    projectedGold: 6,
    strengths: ["Alpine Skiing", "Freestyle Skiing", "Snowboarding"],
    keyAthletes: ["M. Odermatt", "L. Gut-Behrami", "M. Gremaud"],
    intel: "Marco Odermatt is the world's best skier. He anchors the team. Strong across all mountain events. Reliable 10-15 medal haul.",
    draftStrategy: 'Value'
  },
  {
    code: "ITA",
    name: "Italy",
    colors: ["#009246", "#FFFFFF", "#CE2B37"],
    totalMedals: 141,
    recentMedals: 13,
    projectedGold: 5,
    strengths: ["Alpine Skiing", "Short Track", "Luge"],
    keyAthletes: ["S. Goggia", "F. Brignone", "A. Fontana"],
    intel: "HOST NATION. Home field advantage is real in judged sports and course familiarity. Expect an overperformance bump. Goggia is speed queen.",
    draftStrategy: 'Sleeper'
  },
  {
    code: "FRA",
    name: "France",
    colors: ["#0055A4", "#FFFFFF", "#EF4135"],
    totalMedals: 138,
    recentMedals: 14,
    projectedGold: 5,
    strengths: ["Biathlon", "Alpine Skiing", "Figure Skating"],
    keyAthletes: ["Q. Fillon Maillet", "Papadakis/Cizeron", "T. Worley"],
    intel: "Biathlon depth is incredible. Ice dance gold favorites. Solid all-arounders but rely heavily on biathlon for bulk points.",
    draftStrategy: 'Value'
  },
  {
    code: "JPN",
    name: "Japan",
    colors: ["#BC002D", "#FFFFFF"],
    totalMedals: 76,
    recentMedals: 16,
    projectedGold: 4,
    strengths: ["Figure Skating", "Speed Skating", "Ski Jumping", "Snowboard"],
    keyAthletes: ["Y. Kagiyama", "R. Kobayashi", "A. Hirano"],
    intel: "Technical masters. Elite figure skaters and halfpipe snowboarders. Can score big in skill-based events. Look for late value.",
    draftStrategy: 'Sleeper'
  },
  {
    code: "KOR",
    name: "South Korea",
    colors: ["#C60C30", "#003478", "#FFFFFF"],
    totalMedals: 79,
    recentMedals: 11,
    projectedGold: 4,
    strengths: ["Short Track", "Speed Skating"],
    keyAthletes: ["Hwang Dae-heon", "Choi Min-jeong"],
    intel: "Short track specialists. They live and die by the chaos of the rink. High crash risk but huge medal potential if they stay on feet.",
    draftStrategy: 'Risky'
  },
  {
    code: "FIN",
    name: "Finland",
    colors: ["#003580", "#FFFFFF"],
    totalMedals: 175,
    recentMedals: 7,
    projectedGold: 2,
    strengths: ["Cross-Country", "Ice Hockey"],
    keyAthletes: ["I. Niskanen", "K. Pärmäkoski"],
    intel: "Faded glory but still dangerous in men's hockey and classic cross-country skiing. Good late round depth pick.",
    draftStrategy: 'Deep'
  },
  {
    code: "AUS",
    name: "Australia",
    colors: ["#FFCD00", "#00843D"],
    totalMedals: 19,
    recentMedals: 3,
    projectedGold: 1,
    strengths: ["Freestyle Skiing", "Snowboarding"],
    keyAthletes: ["J. Anthony", "S. James"],
    intel: "Punch above their weight in aerials, moguls, and halfpipe. Scotty James is a halfpipe podium lock.",
    draftStrategy: 'Deep'
  },
  {
    code: "GBR",
    name: "Great Britain",
    colors: ["#012169", "#C8102E", "#FFFFFF"],
    totalMedals: 34,
    recentMedals: 3,
    projectedGold: 1,
    strengths: ["Curling", "Skeleton", "Freestyle"],
    keyAthletes: ["Eve Muirhead (Ret)", "B. Mouat"],
    intel: "Curling powerhouse. Skeleton program is consistently elite. Don't expect snow medals, but ice/track is solid.",
    draftStrategy: 'Deep'
  },
  {
    code: "NZL",
    name: "New Zealand",
    colors: ["#000000", "#FFFFFF"],
    totalMedals: 6,
    recentMedals: 2,
    projectedGold: 2,
    strengths: ["Snowboarding", "Freestyle Skiing"],
    keyAthletes: ["Z. Sadowski-Synnott", "N. Porteous"],
    intel: "Elite top-end talent. Zoi and Nico are both gold medal favorites in slopestyle/halfpipe. Zero depth, but high quality.",
    draftStrategy: 'Sleeper'
  },
  {
    code: "CZE",
    name: "Czechia",
    colors: ["#11457E", "#D7141A", "#FFFFFF"],
    totalMedals: 34,
    recentMedals: 5,
    projectedGold: 1,
    strengths: ["Snowboarding", "Biathlon", "Ice Hockey"],
    keyAthletes: ["E. Ledecka", "M. Davidova"],
    intel: "Ester Ledecka is a dual-sport unicorn (Skiing/Snowboard). Hockey team is a dark horse.",
    draftStrategy: 'Deep'
  },
  {
    code: "SLO",
    name: "Slovenia",
    colors: ["#005DA4", "#FFFFFF", "#C5192D"],
    totalMedals: 24,
    recentMedals: 5,
    projectedGold: 2,
    strengths: ["Ski Jumping", "Alpine Skiing", "Sport Climbing"],
    keyAthletes: ["T. Pogacar (Just kidding)", "Z. Kranjec"],
    intel: "Ski jumping powerhouse. Pound for pound one of the best winter nations.",
    draftStrategy: 'Deep'
  },
  {
    code: "POL",
    name: "Poland",
    colors: ["#DC143C", "#FFFFFF"],
    totalMedals: 23,
    recentMedals: 1,
    projectedGold: 0,
    strengths: ["Ski Jumping", "Speed Skating"],
    keyAthletes: ["K. Stoch", "D. Kubacki"],
    intel: "Ski jumping heritage is strong. Occasional speed skating surprise.",
    draftStrategy: 'Deep'
  },
  {
    code: "LAT",
    name: "Latvia",
    colors: ["#9E3039", "#FFFFFF"],
    totalMedals: 10,
    recentMedals: 2,
    projectedGold: 0,
    strengths: ["Luge", "Skeleton", "Bobsled"],
    keyAthletes: ["M. Dukurs (Legend)"],
    intel: "Sledding specialists. If it slides on ice, Latvia has a chance.",
    draftStrategy: 'Deep'
  },
  {
    code: "EST",
    name: "Estonia",
    colors: ["#0072CE", "#000000", "#FFFFFF"],
    totalMedals: 8,
    recentMedals: 1,
    projectedGold: 1,
    strengths: ["Freestyle Skiing", "Biathlon"],
    keyAthletes: ["K. Sildaru"],
    intel: "Kelly Sildaru in slopestyle is their main/only hope for gold.",
    draftStrategy: 'Deep'
  },
  {
    code: "SVK",
    name: "Slovakia",
    colors: ["#0B4EA2", "#EE1C25", "#FFFFFF"],
    totalMedals: 10,
    recentMedals: 2,
    projectedGold: 1,
    strengths: ["Alpine Skiing", "Ice Hockey"],
    keyAthletes: ["P. Vlhova"],
    intel: "Petra Vlhova is a slalom superstar. Hockey bronze in 2022 shows potential.",
    draftStrategy: 'Deep'
  },
  {
    code: "BEL",
    name: "Belgium",
    colors: ["#000000", "#FDDA24", "#EF3340"],
    totalMedals: 8,
    recentMedals: 1,
    projectedGold: 1,
    strengths: ["Speed Skating", "Figure Skating"],
    keyAthletes: ["B. Swings", "L. Hendrickx"],
    intel: "Bart Swings (Mass Start) is their golden ticket. Solid figure skating presence.",
    draftStrategy: 'Deep'
  },
  {
    code: "UKR",
    name: "Ukraine",
    colors: ["#0057B8", "#FFD700"],
    totalMedals: 9,
    recentMedals: 1,
    projectedGold: 0,
    strengths: ["Freestyle Skiing", "Biathlon"],
    keyAthletes: ["O. Abramenko"],
    intel: "Aerials specialists. Always a threat for a medal in freestyle jumps.",
    draftStrategy: 'Deep'
  },
  {
    code: "KAZ",
    name: "Kazakhstan",
    colors: ["#00AFCA", "#FEC50C"],
    totalMedals: 9,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Short Track", "Freestyle Moguls"],
    keyAthletes: ["Y. Reikherd"],
    intel: "Occasional podium spoiler in moguls or short track. Deep sleeper.",
    draftStrategy: 'Deep'
  },
  {
    code: "ESP",
    name: "Spain",
    colors: ["#AA151B", "#F1BF00"],
    totalMedals: 5,
    recentMedals: 1,
    projectedGold: 0,
    strengths: ["Snowboarding", "Figure Skating"],
    keyAthletes: ["Q. Castellet"],
    intel: "Queralt Castellet (Halfpipe) is a veteran medal threat.",
    draftStrategy: 'Deep'
  },
  {
    code: "HUN",
    name: "Hungary",
    colors: ["#477050", "#FFFFFF", "#CE2939"],
    totalMedals: 10,
    recentMedals: 3,
    projectedGold: 1,
    strengths: ["Short Track"],
    keyAthletes: ["Liu Brothers"],
    intel: "Short track powerhouse recently. Liu brothers are elite sprinters.",
    draftStrategy: 'Deep'
  },
  {
    code: "CRO",
    name: "Croatia",
    colors: ["#FF0000", "#FFFFFF", "#0093DD"],
    totalMedals: 11,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Alpine Skiing"],
    keyAthletes: ["L. Popovic"],
    intel: "Janica Kostelic era is over, but slalom tech remains good.",
    draftStrategy: 'Deep'
  }
];

export const EXTENDED_WINTER_NATIONS: CountryData[] = [
  {
    code: "JAM",
    name: "Jamaica",
    colors: ["#009B3A", "#FED100", "#000000"],
    totalMedals: 0,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Bobsled"],
    keyAthletes: ["Bobsled Team"],
    intel: "The Cool Runnings legacy continues. Jamaica's bobsled program has Olympic history but medal contention is unlikely. Pure fun pick.",
    draftStrategy: 'Deep'
  },
  {
    code: "TTO",
    name: "Trinidad & Tobago",
    colors: ["#CE1126", "#FFFFFF", "#000000"],
    totalMedals: 0,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Bobsled"],
    keyAthletes: [],
    intel: "Caribbean nation with occasional Winter Olympics presence. Bobsled is the only realistic discipline.",
    draftStrategy: 'Deep'
  },
  {
    code: "BRA",
    name: "Brazil",
    colors: ["#009C3B", "#FFDF00", "#002776"],
    totalMedals: 0,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Bobsled", "Snowboarding"],
    keyAthletes: [],
    intel: "Growing winter sports program. Bobsled and snowboard athletes occasionally qualify. Dark horse potential.",
    draftStrategy: 'Deep'
  },
  {
    code: "MEX",
    name: "Mexico",
    colors: ["#006847", "#FFFFFF", "#CE1126"],
    totalMedals: 0,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Alpine Skiing", "Figure Skating"],
    keyAthletes: [],
    intel: "Occasional qualifier in alpine events. No realistic medal hopes but adds roster diversity.",
    draftStrategy: 'Deep'
  },
  {
    code: "ISR",
    name: "Israel",
    colors: ["#0038B8", "#FFFFFF"],
    totalMedals: 0,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Figure Skating", "Alpine Skiing"],
    keyAthletes: [],
    intel: "Small but growing winter program with figure skating focus.",
    draftStrategy: 'Deep'
  },
  {
    code: "TUR",
    name: "Turkey",
    colors: ["#E30A17", "#FFFFFF"],
    totalMedals: 0,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Alpine Skiing", "Figure Skating"],
    keyAthletes: [],
    intel: "Developing winter sports nation. Alpine skiing is primary focus.",
    draftStrategy: 'Deep'
  },
  {
    code: "IND",
    name: "India",
    colors: ["#FF9933", "#FFFFFF", "#138808"],
    totalMedals: 0,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Alpine Skiing", "Luge"],
    keyAthletes: [],
    intel: "Athletes from Kashmir and northern regions occasionally qualify. Historic participation but no medal prospects.",
    draftStrategy: 'Deep'
  },
  {
    code: "PHI",
    name: "Philippines",
    colors: ["#0038A8", "#CE1126", "#FCD116"],
    totalMedals: 0,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Figure Skating"],
    keyAthletes: [],
    intel: "Occasional figure skating representatives. No realistic medal hopes.",
    draftStrategy: 'Deep'
  },
  {
    code: "ARG",
    name: "Argentina",
    colors: ["#74ACDF", "#FFFFFF", "#F6B40E"],
    totalMedals: 0,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Alpine Skiing", "Freestyle Skiing"],
    keyAthletes: [],
    intel: "Andes mountain nation with developing alpine program. Occasional qualifiers.",
    draftStrategy: 'Deep'
  },
  {
    code: "CHI",
    name: "Chile",
    colors: ["#D52B1E", "#FFFFFF", "#0039A6"],
    totalMedals: 0,
    recentMedals: 0,
    projectedGold: 0,
    strengths: ["Alpine Skiing", "Freestyle Skiing"],
    keyAthletes: [],
    intel: "Strong ski culture from the Andes. Occasional qualifiers in alpine and freestyle.",
    draftStrategy: 'Deep'
  }
];

export const ALL_WINTER_NATIONS = [...WINTER_OLYMPICS_COUNTRIES, ...EXTENDED_WINTER_NATIONS];
