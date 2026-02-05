
export interface CountryColors {
  code: string;
  name: string;
  colors: string[]; // 1-4 hex colors from their flag
  primaryColor: string; // Main brand color
  gradientStart: string; // For gradient effects
  gradientEnd: string;
}

export const COUNTRY_COLORS: Record<string, CountryColors> = {
  // ELITE TIER
  NOR: {
    code: 'NOR',
    name: 'Norway',
    colors: ['#BA0C2F', '#FFFFFF', '#00205B'],
    primaryColor: '#BA0C2F',
    gradientStart: '#BA0C2F',
    gradientEnd: '#00205B'
  },
  USA: {
    code: 'USA',
    name: 'United States',
    colors: ['#B22234', '#FFFFFF', '#3C3B6E'],
    primaryColor: '#B22234',
    gradientStart: '#B22234',
    gradientEnd: '#3C3B6E'
  },
  GER: {
    code: 'GER',
    name: 'Germany',
    colors: ['#000000', '#DD0000', '#FFCE00'],
    primaryColor: '#DD0000',
    gradientStart: '#000000',
    gradientEnd: '#FFCE00'
  },
  CAN: {
    code: 'CAN',
    name: 'Canada',
    colors: ['#FF0000', '#FFFFFF'],
    primaryColor: '#FF0000',
    gradientStart: '#FF0000',
    gradientEnd: '#FFFFFF'
  },
  AUT: {
    code: 'AUT',
    name: 'Austria',
    colors: ['#ED2939', '#FFFFFF'],
    primaryColor: '#ED2939',
    gradientStart: '#ED2939',
    gradientEnd: '#FFFFFF'
  },
  SWE: {
    code: 'SWE',
    name: 'Sweden',
    colors: ['#006AA7', '#FECC00'],
    primaryColor: '#006AA7',
    gradientStart: '#006AA7',
    gradientEnd: '#FECC00'
  },
  CHN: {
    code: 'CHN',
    name: 'China',
    colors: ['#DE2910', '#FFDE00'],
    primaryColor: '#DE2910',
    gradientStart: '#DE2910',
    gradientEnd: '#FFDE00'
  },
  SUI: {
    code: 'SUI',
    name: 'Switzerland',
    colors: ['#FF0000', '#FFFFFF'],
    primaryColor: '#FF0000',
    gradientStart: '#FF0000',
    gradientEnd: '#FFFFFF'
  },
  NED: {
    code: 'NED',
    name: 'Netherlands',
    colors: ['#21468B', '#FFFFFF', '#AE1C28'],
    primaryColor: '#FF4F00',
    gradientStart: '#FF4F00',
    gradientEnd: '#21468B'
  },
  FIN: {
    code: 'FIN',
    name: 'Finland',
    colors: ['#003580', '#FFFFFF'],
    primaryColor: '#003580',
    gradientStart: '#003580',
    gradientEnd: '#FFFFFF'
  },
  JPN: {
    code: 'JPN',
    name: 'Japan',
    colors: ['#BC002D', '#FFFFFF'],
    primaryColor: '#BC002D',
    gradientStart: '#BC002D',
    gradientEnd: '#FFFFFF'
  },
  KOR: {
    code: 'KOR',
    name: 'South Korea',
    colors: ['#C60C30', '#003478', '#FFFFFF'],
    primaryColor: '#C60C30',
    gradientStart: '#C60C30',
    gradientEnd: '#003478'
  },
  ITA: {
    code: 'ITA',
    name: 'Italy',
    colors: ['#009246', '#FFFFFF', '#CE2B37'],
    primaryColor: '#009246',
    gradientStart: '#009246',
    gradientEnd: '#CE2B37'
  },
  FRA: {
    code: 'FRA',
    name: 'France',
    colors: ['#0055A4', '#FFFFFF', '#EF4135'],
    primaryColor: '#0055A4',
    gradientStart: '#0055A4',
    gradientEnd: '#EF4135'
  },
  AIN: {
    code: 'AIN',
    name: 'AIN (Neutral)',
    colors: ['#FFFFFF', '#87CEEB', '#FFFFFF'],
    primaryColor: '#87CEEB',
    gradientStart: '#FFFFFF',
    gradientEnd: '#87CEEB'
  },
  CZE: {
    code: 'CZE',
    name: 'Czech Republic',
    colors: ['#FFFFFF', '#D7141A', '#11457E'],
    primaryColor: '#D7141A',
    gradientStart: '#D7141A',
    gradientEnd: '#11457E'
  },
  POL: {
    code: 'POL',
    name: 'Poland',
    colors: ['#FFFFFF', '#DC143C'],
    primaryColor: '#DC143C',
    gradientStart: '#DC143C',
    gradientEnd: '#FFFFFF'
  },
  GBR: {
    code: 'GBR',
    name: 'Great Britain',
    colors: ['#012169', '#FFFFFF', '#C8102E'],
    primaryColor: '#012169',
    gradientStart: '#012169',
    gradientEnd: '#C8102E'
  },
  KAZ: {
    code: 'KAZ',
    name: 'Kazakhstan',
    colors: ['#00AFCA', '#FEC50C'],
    primaryColor: '#00AFCA',
    gradientStart: '#00AFCA',
    gradientEnd: '#FEC50C'
  },
  UKR: {
    code: 'UKR',
    name: 'Ukraine',
    colors: ['#005BBB', '#FFD500'],
    primaryColor: '#005BBB',
    gradientStart: '#005BBB',
    gradientEnd: '#FFD500'
  },
  ESP: {
    code: 'ESP',
    name: 'Spain',
    colors: ['#AA151B', '#F1BF00'],
    primaryColor: '#AA151B',
    gradientStart: '#AA151B',
    gradientEnd: '#F1BF00'
  },
  BEL: {
    code: 'BEL',
    name: 'Belgium',
    colors: ['#000000', '#FDDA24', '#EF3340'],
    primaryColor: '#FDDA24',
    gradientStart: '#000000',
    gradientEnd: '#EF3340'
  },
  LAT: {
    code: 'LAT',
    name: 'Latvia',
    colors: ['#9E3039', '#FFFFFF'],
    primaryColor: '#9E3039',
    gradientStart: '#9E3039',
    gradientEnd: '#FFFFFF'
  },
  EST: {
    code: 'EST',
    name: 'Estonia',
    colors: ['#0072CE', '#000000', '#FFFFFF'],
    primaryColor: '#0072CE',
    gradientStart: '#0072CE',
    gradientEnd: '#000000'
  },
  SVK: {
    code: 'SVK',
    name: 'Slovakia',
    colors: ['#FFFFFF', '#0B4EA2', '#EE1C25'],
    primaryColor: '#0B4EA2',
    gradientStart: '#0B4EA2',
    gradientEnd: '#EE1C25'
  },
  SLO: {
    code: 'SLO',
    name: 'Slovenia',
    colors: ['#FFFFFF', '#003DA5', '#ED1C24'],
    primaryColor: '#003DA5',
    gradientStart: '#003DA5',
    gradientEnd: '#ED1C24'
  },
  ROU: {
    code: 'ROU',
    name: 'Romania',
    colors: ['#002B7F', '#FCD116', '#CE1126'],
    primaryColor: '#002B7F',
    gradientStart: '#002B7F',
    gradientEnd: '#CE1126'
  },
  CRO: {
    code: 'CRO',
    name: 'Croatia',
    colors: ['#FF0000', '#FFFFFF', '#171796'],
    primaryColor: '#FF0000',
    gradientStart: '#FF0000',
    gradientEnd: '#171796'
  },
  BUL: {
    code: 'BUL',
    name: 'Bulgaria',
    colors: ['#FFFFFF', '#00966E', '#D62612'],
    primaryColor: '#00966E',
    gradientStart: '#00966E',
    gradientEnd: '#D62612'
  },
  AUS: {
    code: 'AUS',
    name: 'Australia',
    colors: ['#00008B', '#FFFFFF', '#FF0000'],
    primaryColor: '#00843D',
    gradientStart: '#00843D',
    gradientEnd: '#FFCD00'
  },
  NZL: {
    code: 'NZL',
    name: 'New Zealand',
    colors: ['#00247D', '#FFFFFF', '#CC142B'],
    primaryColor: '#00247D',
    gradientStart: '#00247D',
    gradientEnd: '#CC142B'
  },
  ISL: {
    code: 'ISL',
    name: 'Iceland',
    colors: ['#003897', '#FFFFFF', '#DC1E35'],
    primaryColor: '#003897',
    gradientStart: '#003897',
    gradientEnd: '#DC1E35'
  },
  DEN: {
    code: 'DEN',
    name: 'Denmark',
    colors: ['#C60C30', '#FFFFFF'],
    primaryColor: '#C60C30',
    gradientStart: '#C60C30',
    gradientEnd: '#FFFFFF'
  },
  LIE: {
    code: 'LIE',
    name: 'Liechtenstein',
    colors: ['#002B7F', '#CE1126', '#FFD700'],
    primaryColor: '#002B7F',
    gradientStart: '#002B7F',
    gradientEnd: '#CE1126'
  },
  BIH: {
    code: 'BIH',
    name: 'Bosnia and Herzegovina',
    colors: ['#002395', '#FECB00'],
    primaryColor: '#002395',
    gradientStart: '#002395',
    gradientEnd: '#FECB00'
  },
  GEO: {
    code: 'GEO',
    name: 'Georgia',
    colors: ['#FFFFFF', '#FF0000'],
    primaryColor: '#FF0000',
    gradientStart: '#FF0000',
    gradientEnd: '#FFFFFF'
  },
  ARM: {
    code: 'ARM',
    name: 'Armenia',
    colors: ['#D90012', '#0033A0', '#F2A800'],
    primaryColor: '#D90012',
    gradientStart: '#D90012',
    gradientEnd: '#0033A0'
  },
  MDA: {
    code: 'MDA',
    name: 'Moldova',
    colors: ['#0046AE', '#FFD200', '#CC092F'],
    primaryColor: '#0046AE',
    gradientStart: '#0046AE',
    gradientEnd: '#CC092F'
  },
  MNE: {
    code: 'MNE',
    name: 'Montenegro',
    colors: ['#C40308', '#D4AF37'],
    primaryColor: '#C40308',
    gradientStart: '#C40308',
    gradientEnd: '#D4AF37'
  },
  SRB: {
    code: 'SRB',
    name: 'Serbia',
    colors: ['#C6363C', '#0C4076', '#FFFFFF'],
    primaryColor: '#C6363C',
    gradientStart: '#C6363C',
    gradientEnd: '#0C4076'
  },
  LTU: {
    code: 'LTU',
    name: 'Lithuania',
    colors: ['#FDB913', '#006A44', '#C1272D'],
    primaryColor: '#FDB913',
    gradientStart: '#FDB913',
    gradientEnd: '#006A44'
  },
  GRE: {
    code: 'GRE',
    name: 'Greece',
    colors: ['#0D5EAF', '#FFFFFF'],
    primaryColor: '#0D5EAF',
    gradientStart: '#0D5EAF',
    gradientEnd: '#FFFFFF'
  },
  TUR: {
    code: 'TUR',
    name: 'Turkey',
    colors: ['#E30A17', '#FFFFFF'],
    primaryColor: '#E30A17',
    gradientStart: '#E30A17',
    gradientEnd: '#FFFFFF'
  },
  HUN: {
    code: 'HUN',
    name: 'Hungary',
    colors: ['#CE2939', '#FFFFFF', '#477050'],
    primaryColor: '#CE2939',
    gradientStart: '#CE2939',
    gradientEnd: '#477050'
  },
  IRL: {
    code: 'IRL',
    name: 'Ireland',
    colors: ['#169B62', '#FFFFFF', '#FF883E'],
    primaryColor: '#169B62',
    gradientStart: '#169B62',
    gradientEnd: '#FF883E'
  },
  POR: {
    code: 'POR',
    name: 'Portugal',
    colors: ['#006600', '#FF0000', '#FFD700'],
    primaryColor: '#006600',
    gradientStart: '#006600',
    gradientEnd: '#FF0000'
  },
  AND: {
    code: 'AND',
    name: 'Andorra',
    colors: ['#0018A8', '#FEDD00', '#D0103A'],
    primaryColor: '#0018A8',
    gradientStart: '#0018A8',
    gradientEnd: '#D0103A'
  },
  MON: {
    code: 'MON',
    name: 'Monaco',
    colors: ['#CE1126', '#FFFFFF'],
    primaryColor: '#CE1126',
    gradientStart: '#CE1126',
    gradientEnd: '#FFFFFF'
  },
  SMR: {
    code: 'SMR',
    name: 'San Marino',
    colors: ['#FFFFFF', '#73B5E3'],
    primaryColor: '#73B5E3',
    gradientStart: '#73B5E3',
    gradientEnd: '#FFFFFF'
  },
  ALB: {
    code: 'ALB',
    name: 'Albania',
    colors: ['#E41E20', '#000000'],
    primaryColor: '#E41E20',
    gradientStart: '#E41E20',
    gradientEnd: '#000000'
  },
  MKD: {
    code: 'MKD',
    name: 'North Macedonia',
    colors: ['#D20000', '#FFE600'],
    primaryColor: '#D20000',
    gradientStart: '#D20000',
    gradientEnd: '#FFE600'
  },
  CYP: {
    code: 'CYP',
    name: 'Cyprus',
    colors: ['#FFFFFF', '#D57800', '#4E5B31'],
    primaryColor: '#D57800',
    gradientStart: '#D57800',
    gradientEnd: '#4E5B31'
  },
  ISR: {
    code: 'ISR',
    name: 'Israel',
    colors: ['#0038B8', '#FFFFFF'],
    primaryColor: '#0038B8',
    gradientStart: '#0038B8',
    gradientEnd: '#FFFFFF'
  },
  LEB: {
    code: 'LEB',
    name: 'Lebanon',
    colors: ['#EE161F', '#FFFFFF', '#00A651'],
    primaryColor: '#EE161F',
    gradientStart: '#EE161F',
    gradientEnd: '#00A651'
  },
  IND: {
    code: 'IND',
    name: 'India',
    colors: ['#FF9933', '#FFFFFF', '#138808'],
    primaryColor: '#FF9933',
    gradientStart: '#FF9933',
    gradientEnd: '#138808'
  },
  MGL: {
    code: 'MGL',
    name: 'Mongolia',
    colors: ['#C4272F', '#015197', '#FFD900'],
    primaryColor: '#015197',
    gradientStart: '#C4272F',
    gradientEnd: '#015197'
  },
  PRK: {
    code: 'PRK',
    name: 'North Korea',
    colors: ['#024FA2', '#ED1C27', '#FFFFFF'],
    primaryColor: '#024FA2',
    gradientStart: '#024FA2',
    gradientEnd: '#ED1C27'
  },
  TPE: {
    code: 'TPE',
    name: 'Chinese Taipei',
    colors: ['#FE0000', '#000095', '#FFFFFF'],
    primaryColor: '#FE0000',
    gradientStart: '#FE0000',
    gradientEnd: '#000095'
  },
  HKG: {
    code: 'HKG',
    name: 'Hong Kong',
    colors: ['#DE2910', '#FFFFFF'],
    primaryColor: '#DE2910',
    gradientStart: '#DE2910',
    gradientEnd: '#FFFFFF'
  },
  MEX: {
    code: 'MEX',
    name: 'Mexico',
    colors: ['#006847', '#FFFFFF', '#CE1126'],
    primaryColor: '#006847',
    gradientStart: '#006847',
    gradientEnd: '#CE1126'
  },
  ARG: {
    code: 'ARG',
    name: 'Argentina',
    colors: ['#74ACDF', '#FFFFFF'],
    primaryColor: '#74ACDF',
    gradientStart: '#74ACDF',
    gradientEnd: '#FFFFFF'
  },
  CHI: {
    code: 'CHI',
    name: 'Chile',
    colors: ['#0039A6', '#FFFFFF', '#D52B1E'],
    primaryColor: '#0039A6',
    gradientStart: '#0039A6',
    gradientEnd: '#D52B1E'
  },
  BRA: {
    code: 'BRA',
    name: 'Brazil',
    colors: ['#009B3A', '#FEDF00', '#002776'],
    primaryColor: '#009B3A',
    gradientStart: '#009B3A',
    gradientEnd: '#FEDF00'
  },
  JAM: {
    code: 'JAM',
    name: 'Jamaica',
    colors: ['#009B3A', '#FED100', '#000000'],
    primaryColor: '#009B3A',
    gradientStart: '#FED100',
    gradientEnd: '#000000'
  },
  TRI: {
    code: 'TRI',
    name: 'Trinidad and Tobago',
    colors: ['#CE1126', '#FFFFFF', '#000000'],
    primaryColor: '#CE1126',
    gradientStart: '#CE1126',
    gradientEnd: '#000000'
  },
  PUR: {
    code: 'PUR',
    name: 'Puerto Rico',
    colors: ['#ED0000', '#FFFFFF', '#0050F0'],
    primaryColor: '#ED0000',
    gradientStart: '#ED0000',
    gradientEnd: '#0050F0'
  },
  VIR: {
    code: 'VIR',
    name: 'US Virgin Islands',
    colors: ['#FFFFFF', '#FFD100', '#ED1B2F', '#0066B2'],
    primaryColor: '#0066B2',
    gradientStart: '#0066B2',
    gradientEnd: '#ED1B2F'
  },
  MAR: {
    code: 'MAR',
    name: 'Morocco',
    colors: ['#C1272D', '#006233'],
    primaryColor: '#C1272D',
    gradientStart: '#C1272D',
    gradientEnd: '#006233'
  },
  RSA: {
    code: 'RSA',
    name: 'South Africa',
    colors: ['#007A4D', '#FFFFFF', '#000000', '#FFB612', '#DE3831', '#002395'], 
    primaryColor: '#007A4D',
    gradientStart: '#007A4D',
    gradientEnd: '#DE3831'
  },
  ZIM: {
    code: 'ZIM',
    name: 'Zimbabwe',
    colors: ['#319E48', '#FFD200', '#DA121A', '#000000'],
    primaryColor: '#319E48',
    gradientStart: '#319E48',
    gradientEnd: '#DA121A'
  },
  KEN: {
    code: 'KEN',
    name: 'Kenya',
    colors: ['#000000', '#BC0000', '#006600'],
    primaryColor: '#BC0000',
    gradientStart: '#BC0000',
    gradientEnd: '#006600'
  },
  GHA: {
    code: 'GHA',
    name: 'Ghana',
    colors: ['#CE1126', '#FCD116', '#006B3F'],
    primaryColor: '#CE1126',
    gradientStart: '#FCD116',
    gradientEnd: '#006B3F'
  },
  NIG: {
    code: 'NIG',
    name: 'Nigeria',
    colors: ['#008751', '#FFFFFF'],
    primaryColor: '#008751',
    gradientStart: '#008751',
    gradientEnd: '#FFFFFF'
  },
  THA: {
    code: 'THA',
    name: 'Thailand',
    colors: ['#ED1C24', '#FFFFFF', '#241D4F'],
    primaryColor: '#ED1C24',
    gradientStart: '#ED1C24',
    gradientEnd: '#241D4F'
  },
  PHI: {
    code: 'PHI',
    name: 'Philippines',
    colors: ['#0038A8', '#CE1126', '#FCD116', '#FFFFFF'],
    primaryColor: '#0038A8',
    gradientStart: '#0038A8',
    gradientEnd: '#CE1126'
  },
  MAS: {
    code: 'MAS',
    name: 'Malaysia',
    colors: ['#010066', '#CC0001', '#FFFFFF', '#FFCC00'],
    primaryColor: '#010066',
    gradientStart: '#010066',
    gradientEnd: '#CC0001'
  },
  SGP: {
    code: 'SGP',
    name: 'Singapore',
    colors: ['#EF3340', '#FFFFFF'],
    primaryColor: '#EF3340',
    gradientStart: '#EF3340',
    gradientEnd: '#FFFFFF'
  },
  IRN: {
    code: 'IRN',
    name: 'Iran',
    colors: ['#239F40', '#FFFFFF', '#DA0000'],
    primaryColor: '#239F40',
    gradientStart: '#239F40',
    gradientEnd: '#DA0000'
  },
  PAK: {
    code: 'PAK',
    name: 'Pakistan',
    colors: ['#01411C', '#FFFFFF'],
    primaryColor: '#01411C',
    gradientStart: '#01411C',
    gradientEnd: '#FFFFFF'
  },
  UZB: {
    code: 'UZB',
    name: 'Uzbekistan',
    colors: ['#0099B5', '#FFFFFF', '#1EB53A', '#CE1126'],
    primaryColor: '#0099B5',
    gradientStart: '#0099B5',
    gradientEnd: '#1EB53A'
  },
  KGZ: {
    code: 'KGZ',
    name: 'Kyrgyzstan',
    colors: ['#E8112D', '#FFEF00'],
    primaryColor: '#E8112D',
    gradientStart: '#E8112D',
    gradientEnd: '#FFEF00'
  },
};
