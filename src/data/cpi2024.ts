export interface CountryCPI {
  id: string;
  name: string;
  score: number;
  trend: 'Rising' | 'Sinking' | 'Stable';
  region: string;
  regimeType: string;
  gdpPpp: number;
  happiness: number;
  meaningfulLife: number;
  inflation?: number;
  unemployment?: number;
  education?: number;
  lifeExpectancy?: number;
  pressFreedom?: number;
  prosperityScore?: number;
  prosperityRank?: number;
  hasHistoricalGaps?: boolean;
}

export const cpiData: CountryCPI[] = [
  { id: 'DK', name: 'Denmark', score: 90, trend: 'Stable', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 73386, happiness: 7.6, meaningfulLife: 88 },
  { id: 'FI', name: 'Finland', score: 87, trend: 'Stable', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 413436, happiness: 6.9, meaningfulLife: 79 },
  { id: 'NZ', name: 'New Zealand', score: 85, trend: 'Sinking', region: 'Asia Pacific', regimeType: 'Full Democracy', gdpPpp: 388304, happiness: 6.8, meaningfulLife: 78 },
  { id: 'NO', name: 'Norway', score: 84, trend: 'Rising', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 82000, happiness: 7.4, meaningfulLife: 84 },
  { id: 'SG', name: 'Singapore', score: 83, trend: 'Stable', region: 'Asia Pacific', regimeType: 'Flawed Democracy', gdpPpp: 133280, happiness: 6.5, meaningfulLife: 70 },
  { id: 'SE', name: 'Sweden', score: 82, trend: 'Sinking', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 352448, happiness: 6.7, meaningfulLife: 77 },
  { id: 'CH', name: 'Switzerland', score: 82, trend: 'Stable', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 89000, happiness: 7.5, meaningfulLife: 85 },
  { id: 'NL', name: 'Netherlands', score: 79, trend: 'Sinking', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 318754, happiness: 6.6, meaningfulLife: 76 },
  { id: 'DE', name: 'Germany', score: 78, trend: 'Stable', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 307994, happiness: 6.5, meaningfulLife: 75 },
  { id: 'LU', name: 'Luxembourg', score: 78, trend: 'Sinking', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 307994, happiness: 6.5, meaningfulLife: 75 },
  { id: 'IE', name: 'Ireland', score: 77, trend: 'Stable', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 297466, happiness: 6.5, meaningfulLife: 75 },
  { id: 'CA', name: 'Canada', score: 76, trend: 'Rising', region: 'Americas', regimeType: 'Full Democracy', gdpPpp: 287167, happiness: 6.4, meaningfulLife: 74 },
  { id: 'EE', name: 'Estonia', score: 76, trend: 'Rising', region: 'Europe', regimeType: 'Flawed Democracy', gdpPpp: 287167, happiness: 6.4, meaningfulLife: 74 },
  { id: 'AU', name: 'Australia', score: 75, trend: 'Stable', region: 'Asia Pacific', regimeType: 'Full Democracy', gdpPpp: 277096, happiness: 6.4, meaningfulLife: 74 },
  { id: 'HK', name: 'Hong Kong', score: 75, trend: 'Sinking', region: 'Asia Pacific', regimeType: 'Hybrid Regime', gdpPpp: 277096, happiness: 6.4, meaningfulLife: 74 },
  { id: 'UY', name: 'Uruguay', score: 73, trend: 'Stable', region: 'Americas', regimeType: 'Full Democracy', gdpPpp: 257630, happiness: 6.3, meaningfulLife: 73 },
  { id: 'BE', name: 'Belgium', score: 73, trend: 'Stable', region: 'Europe', regimeType: 'Flawed Democracy', gdpPpp: 257630, happiness: 6.3, meaningfulLife: 73 },
  { id: 'JP', name: 'Japan', score: 73, trend: 'Stable', region: 'Asia Pacific', regimeType: 'Full Democracy', gdpPpp: 257630, happiness: 6.3, meaningfulLife: 73 },
  { id: 'IS', name: 'Iceland', score: 72, trend: 'Sinking', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 248230, happiness: 6.2, meaningfulLife: 72 },
  { id: 'GB', name: 'United Kingdom', score: 71, trend: 'Sinking', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 239050, happiness: 6.2, meaningfulLife: 72 },
  { id: 'FR', name: 'France', score: 71, trend: 'Sinking', region: 'Europe', regimeType: 'Flawed Democracy', gdpPpp: 239050, happiness: 6.2, meaningfulLife: 72 },
  { id: 'US', name: 'United States', score: 69, trend: 'Stable', region: 'Americas', regimeType: 'Flawed Democracy', gdpPpp: 80035, happiness: 6.9, meaningfulLife: 75 },
  { id: 'AE', name: 'United Arab Emirates', score: 68, trend: 'Rising', region: 'Middle East', regimeType: 'Authoritarian', gdpPpp: 88000, happiness: 6.8, meaningfulLife: 65 },
  { id: 'TW', name: 'Taiwan', score: 67, trend: 'Stable', region: 'Asia Pacific', regimeType: 'Full Democracy', gdpPpp: 204478, happiness: 6, meaningfulLife: 70 },
  { id: 'CL', name: 'Chile', score: 66, trend: 'Sinking', region: 'Americas', regimeType: 'Flawed Democracy', gdpPpp: 196362, happiness: 6, meaningfulLife: 70 },
  { id: 'KR', name: 'South Korea', score: 63, trend: 'Stable', region: 'Asia Pacific', regimeType: 'Full Democracy', gdpPpp: 173243, happiness: 5.8, meaningfulLife: 68 },
  { id: 'IL', name: 'Israel', score: 62, trend: 'Sinking', region: 'Middle East', regimeType: 'Flawed Democracy', gdpPpp: 165939, happiness: 5.8, meaningfulLife: 68 },
  { id: 'ES', name: 'Spain', score: 60, trend: 'Stable', region: 'Europe', regimeType: 'Full Democracy', gdpPpp: 151922, happiness: 5.7, meaningfulLife: 67 },
  { id: 'QA', name: 'Qatar', score: 58, trend: 'Sinking', region: 'Middle East', regimeType: 'Authoritarian', gdpPpp: 114000, happiness: 6.3, meaningfulLife: 60 },
  { id: 'IT', name: 'Italy', score: 56, trend: 'Stable', region: 'Europe', regimeType: 'Flawed Democracy', gdpPpp: 126187, happiness: 5.5, meaningfulLife: 65 },
  { id: 'PL', name: 'Poland', score: 54, trend: 'Sinking', region: 'Europe', regimeType: 'Flawed Democracy', gdpPpp: 114432, happiness: 5.4, meaningfulLife: 64 },
  { id: 'SA', name: 'Saudi Arabia', score: 52, trend: 'Stable', region: 'Middle East', regimeType: 'Authoritarian', gdpPpp: 54000, happiness: 6.4, meaningfulLife: 55 },
  { id: 'GR', name: 'Greece', score: 49, trend: 'Sinking', region: 'Europe', regimeType: 'Flawed Democracy', gdpPpp: 88142, happiness: 5.2, meaningfulLife: 62 },
  { id: 'CN', name: 'China', score: 42, trend: 'Sinking', region: 'Asia Pacific', regimeType: 'Authoritarian', gdpPpp: 23382, happiness: 5.8, meaningfulLife: 62 },
  { id: 'ZA', name: 'South Africa', score: 41, trend: 'Sinking', region: 'Africa', regimeType: 'Flawed Democracy', gdpPpp: 54662, happiness: 4.8, meaningfulLife: 58 },
  { id: 'IN', name: 'India', score: 39, trend: 'Stable', region: 'Asia Pacific', regimeType: 'Flawed Democracy', gdpPpp: 47821, happiness: 4.8, meaningfulLife: 58 },
  { id: 'AR', name: 'Argentina', score: 37, trend: 'Sinking', region: 'Americas', regimeType: 'Flawed Democracy', gdpPpp: 41551, happiness: 4.7, meaningfulLife: 57 },
  { id: 'BR', name: 'Brazil', score: 36, trend: 'Sinking', region: 'Americas', regimeType: 'Flawed Democracy', gdpPpp: 38624, happiness: 4.6, meaningfulLife: 56 },
  { id: 'TR', name: 'Turkey', score: 34, trend: 'Sinking', region: 'Europe', regimeType: 'Hybrid Regime', gdpPpp: 33172, happiness: 4.5, meaningfulLife: 55 },
  { id: 'ID', name: 'Indonesia', score: 34, trend: 'Stable', region: 'Asia Pacific', regimeType: 'Flawed Democracy', gdpPpp: 33172, happiness: 4.5, meaningfulLife: 55 },
  { id: 'PE', name: 'Peru', score: 33, trend: 'Sinking', region: 'Americas', regimeType: 'Hybrid Regime', gdpPpp: 30642, happiness: 4.5, meaningfulLife: 55 },
  { id: 'MX', name: 'Mexico', score: 31, trend: 'Stable', region: 'Americas', regimeType: 'Hybrid Regime', gdpPpp: 25960, happiness: 4.4, meaningfulLife: 54 },
  { id: 'PK', name: 'Pakistan', score: 29, trend: 'Rising', region: 'Asia Pacific', regimeType: 'Hybrid Regime', gdpPpp: 21765, happiness: 4.3, meaningfulLife: 53 },
  { id: 'RU', name: 'Russia', score: 26, trend: 'Sinking', region: 'Europe', regimeType: 'Authoritarian', gdpPpp: 16335, happiness: 4.2, meaningfulLife: 52 },
  { id: 'NG', name: 'Nigeria', score: 25, trend: 'Stable', region: 'Africa', regimeType: 'Hybrid Regime', gdpPpp: 14744, happiness: 4.1, meaningfulLife: 51 },
  { id: 'IR', name: 'Iran', score: 24, trend: 'Sinking', region: 'Middle East', regimeType: 'Authoritarian', gdpPpp: 13257, happiness: 4.1, meaningfulLife: 51 },
  { id: 'IQ', name: 'Iraq', score: 23, trend: 'Stable', region: 'Middle East', regimeType: 'Authoritarian', gdpPpp: 11872, happiness: 4, meaningfulLife: 50 },
  { id: 'CD', name: 'DRC', score: 20, trend: 'Stable', region: 'Africa', regimeType: 'Authoritarian', gdpPpp: 8298, happiness: 3.9, meaningfulLife: 49 },
  { id: 'AF', name: 'Afghanistan', score: 20, trend: 'Sinking', region: 'Asia Pacific', regimeType: 'Authoritarian', gdpPpp: 1674, happiness: 2.4, meaningfulLife: 30 },
  { id: 'VE', name: 'Venezuela', score: 13, trend: 'Stable', region: 'Americas', regimeType: 'Authoritarian', gdpPpp: 2937, happiness: 3.6, meaningfulLife: 46 },
  { id: 'SY', name: 'Syria', score: 13, trend: 'Stable', region: 'Middle East', regimeType: 'Authoritarian', gdpPpp: 2937, happiness: 3.6, meaningfulLife: 46 },
  { id: 'SS', name: 'South Sudan', score: 13, trend: 'Stable', region: 'Africa', regimeType: 'Authoritarian', gdpPpp: 2937, happiness: 3.6, meaningfulLife: 46 },
  { id: 'SO', name: 'Somalia', score: 11, trend: 'Stable', region: 'Africa', regimeType: 'Authoritarian', gdpPpp: 2052, happiness: 3.5, meaningfulLife: 45 },
  
  // Mid-range bulge fill
  { id: 'VN', name: 'Vietnam', score: 41, trend: 'Rising', region: 'Asia Pacific', regimeType: 'Authoritarian', gdpPpp: 54662, happiness: 4.8, meaningfulLife: 58 },
  { id: 'CI', name: "Côte d'Ivoire", score: 40, trend: 'Rising', region: 'Africa', regimeType: 'Hybrid Regime', gdpPpp: 51169, happiness: 4.8, meaningfulLife: 58 },
  { id: 'TZ', name: 'Tanzania', score: 40, trend: 'Rising', region: 'Africa', regimeType: 'Hybrid Regime', gdpPpp: 51169, happiness: 4.8, meaningfulLife: 58 },
  { id: 'GH', name: 'Ghana', score: 43, trend: 'Stable', region: 'Africa', regimeType: 'Flawed Democracy', gdpPpp: 62095, happiness: 4.9, meaningfulLife: 59 },
  { id: 'SN', name: 'Senegal', score: 43, trend: 'Stable', region: 'Africa', regimeType: 'Hybrid Regime', gdpPpp: 62095, happiness: 4.9, meaningfulLife: 59 },
  { id: 'MA', name: 'Morocco', score: 38, trend: 'Stable', region: 'Middle East', regimeType: 'Hybrid Regime', gdpPpp: 44616, happiness: 4.7, meaningfulLife: 57 },
  { id: 'DZ', name: 'Algeria', score: 36, trend: 'Rising', region: 'Middle East', regimeType: 'Authoritarian', gdpPpp: 38624, happiness: 4.6, meaningfulLife: 56 },
  { id: 'TH', name: 'Thailand', score: 35, trend: 'Stable', region: 'Asia Pacific', regimeType: 'Flawed Democracy', gdpPpp: 35832, happiness: 4.6, meaningfulLife: 56 },
  { id: 'CO', name: 'Colombia', score: 40, trend: 'Stable', region: 'Americas', regimeType: 'Flawed Democracy', gdpPpp: 51169, happiness: 4.8, meaningfulLife: 58 },
  { id: 'EG', name: 'Egypt', score: 35, trend: 'Stable', region: 'Middle East', regimeType: 'Authoritarian', gdpPpp: 35832, happiness: 4.6, meaningfulLife: 56 },
  { id: 'PH', name: 'Philippines', score: 34, trend: 'Stable', region: 'Asia Pacific', regimeType: 'Flawed Democracy', gdpPpp: 33172, happiness: 4.5, meaningfulLife: 55 },
  { id: 'LK', name: 'Sri Lanka', score: 34, trend: 'Sinking', region: 'Asia Pacific', regimeType: 'Flawed Democracy', gdpPpp: 33172, happiness: 4.5, meaningfulLife: 55 },
  { id: 'JM', name: 'Jamaica', score: 44, trend: 'Stable', region: 'Americas', regimeType: 'Flawed Democracy', gdpPpp: 66040, happiness: 5, meaningfulLife: 60 },
  { id: 'OM', name: 'Oman', score: 43, trend: 'Stable', region: 'Middle East', regimeType: 'Authoritarian', gdpPpp: 62095, happiness: 4.9, meaningfulLife: 59 },
  { id: 'SV', name: 'El Salvador', score: 31, trend: 'Sinking', region: 'Americas', regimeType: 'Hybrid Regime', gdpPpp: 25960, happiness: 4.4, meaningfulLife: 54 },
  { id: 'PA', name: 'Panama', score: 35, trend: 'Sinking', region: 'Americas', regimeType: 'Flawed Democracy', gdpPpp: 35832, happiness: 4.6, meaningfulLife: 56 },
  { id: 'EC', name: 'Ecuador', score: 34, trend: 'Stable', region: 'Americas', regimeType: 'Flawed Democracy', gdpPpp: 33172, happiness: 4.5, meaningfulLife: 55 },
  { id: 'DO', name: 'Dominican Republic', score: 35, trend: 'Rising', region: 'Americas', regimeType: 'Flawed Democracy', gdpPpp: 35832, happiness: 4.6, meaningfulLife: 56 },
  { id: 'BO', name: 'Bolivia', score: 29, trend: 'Sinking', region: 'Americas', regimeType: 'Hybrid Regime', gdpPpp: 21765, happiness: 4.3, meaningfulLife: 53 },
  { id: 'KH', name: 'Cambodia', score: 22, trend: 'Stable', region: 'Asia Pacific', regimeType: 'Authoritarian', gdpPpp: 10586, happiness: 4, meaningfulLife: 50 },
  { id: 'LB', name: 'Lebanon', score: 24, trend: 'Stable', region: 'Middle East', regimeType: 'Authoritarian', gdpPpp: 13257, happiness: 4.1, meaningfulLife: 51 },
  { id: 'ZW', name: 'Zimbabwe', score: 24, trend: 'Stable', region: 'Africa', regimeType: 'Authoritarian', gdpPpp: 13257, happiness: 4.1, meaningfulLife: 51 },
  { id: 'UZ', name: 'Uzbekistan', score: 33, trend: 'Rising', region: 'Asia Pacific', regimeType: 'Authoritarian', gdpPpp: 30642, happiness: 4.5, meaningfulLife: 55 },
  { id: 'KZ', name: 'Kazakhstan', score: 39, trend: 'Rising', region: 'Asia Pacific', regimeType: 'Authoritarian', gdpPpp: 47821, happiness: 4.8, meaningfulLife: 58 },
  { id: 'AM', name: 'Armenia', score: 47, trend: 'Stable', region: 'Europe', regimeType: 'Hybrid Regime', gdpPpp: 78815, happiness: 5.1, meaningfulLife: 61 },
  { id: 'GE', name: 'Georgia', score: 53, trend: 'Sinking', region: 'Europe', regimeType: 'Hybrid Regime', gdpPpp: 108824, happiness: 5.4, meaningfulLife: 64 },
  { id: 'RW', name: 'Rwanda', score: 53, trend: 'Stable', region: 'Africa', regimeType: 'Authoritarian', gdpPpp: 108824, happiness: 5.4, meaningfulLife: 64 },
  { id: 'UG', name: 'Uganda', score: 26, trend: 'Stable', region: 'Africa', regimeType: 'Hybrid Regime', gdpPpp: 16335, happiness: 4.2, meaningfulLife: 52 },
  { id: 'KE', name: 'Kenya', score: 31, trend: 'Stable', region: 'Africa', regimeType: 'Hybrid Regime', gdpPpp: 25960, happiness: 4.4, meaningfulLife: 54 },
  { id: 'ZM', name: 'Zambia', score: 37, trend: 'Rising', region: 'Africa', regimeType: 'Hybrid Regime', gdpPpp: 41551, happiness: 4.7, meaningfulLife: 57 },
  { id: 'MZ', name: 'Mozambique', score: 25, trend: 'Stable', region: 'Africa', regimeType: 'Authoritarian', gdpPpp: 14744, happiness: 4.1, meaningfulLife: 51 },
  { id: 'CM', name: 'Cameroon', score: 27, trend: 'Stable', region: 'Africa', regimeType: 'Authoritarian', gdpPpp: 18033, happiness: 4.2, meaningfulLife: 52 },
];

const mulberry32 = (a: number) => {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const realDataMap: Record<string, { gdp: number, le: number, unemp: number, inf: number, edu: number }> = {
  DK: { gdp: 73386, le: 81.5, unemp: 5.0, inf: 3.5, edu: 90 },
  FI: { gdp: 61000, le: 82.0, unemp: 7.0, inf: 3.0, edu: 92 },
  NZ: { gdp: 53000, le: 82.5, unemp: 4.0, inf: 4.5, edu: 88 },
  NO: { gdp: 82000, le: 83.0, unemp: 3.5, inf: 3.5, edu: 91 },
  SG: { gdp: 133280, le: 83.5, unemp: 2.0, inf: 2.5, edu: 85 },
  SE: { gdp: 65000, le: 83.0, unemp: 7.5, inf: 3.0, edu: 89 },
  CH: { gdp: 89000, le: 84.0, unemp: 4.5, inf: 2.0, edu: 88 },
  NL: { gdp: 73000, le: 82.5, unemp: 3.5, inf: 3.5, edu: 88 },
  DE: { gdp: 66000, le: 81.0, unemp: 5.5, inf: 3.5, edu: 86 },
  LU: { gdp: 142000, le: 82.5, unemp: 5.0, inf: 3.0, edu: 83 },
  IE: { gdp: 135000, le: 82.5, unemp: 4.5, inf: 3.0, edu: 87 },
  CA: { gdp: 60000, le: 82.5, unemp: 6.0, inf: 3.5, edu: 88 },
  EE: { gdp: 46000, le: 78.5, unemp: 6.5, inf: 4.0, edu: 85 },
  AU: { gdp: 65000, le: 83.0, unemp: 4.0, inf: 4.0, edu: 88 },
  HK: { gdp: 74000, le: 85.5, unemp: 3.0, inf: 2.0, edu: 82 },
  UY: { gdp: 34000, le: 78.0, unemp: 8.0, inf: 5.5, edu: 76 },
  BE: { gdp: 65000, le: 82.0, unemp: 5.5, inf: 3.5, edu: 84 },
  JP: { gdp: 52000, le: 84.5, unemp: 2.5, inf: 2.5, edu: 85 },
  IS: { gdp: 69000, le: 83.0, unemp: 3.5, inf: 4.0, edu: 87 },
  GB: { gdp: 56000, le: 81.5, unemp: 4.0, inf: 4.0, edu: 85 },
  FR: { gdp: 58000, le: 82.5, unemp: 7.5, inf: 3.5, edu: 84 },
  US: { gdp: 80035, le: 77.5, unemp: 3.8, inf: 3.5, edu: 86 },
  AE: { gdp: 88000, le: 78.5, unemp: 3.0, inf: 2.5, edu: 78 },
  TW: { gdp: 73000, le: 81.0, unemp: 3.5, inf: 2.0, edu: 84 },
  CL: { gdp: 33000, le: 81.0, unemp: 8.5, inf: 4.0, edu: 77 },
  KR: { gdp: 56000, le: 83.5, unemp: 2.8, inf: 3.0, edu: 87 },
  IL: { gdp: 53000, le: 83.0, unemp: 4.0, inf: 4.0, edu: 82 },
  ES: { gdp: 50000, le: 83.5, unemp: 11.5, inf: 3.5, edu: 81 },
  QA: { gdp: 114000, le: 80.5, unemp: 0.5, inf: 2.5, edu: 75 },
  IT: { gdp: 54000, le: 84.0, unemp: 7.5, inf: 3.0, edu: 80 },
  PL: { gdp: 45000, le: 78.5, unemp: 5.0, inf: 6.0, edu: 82 },
  SA: { gdp: 54000, le: 77.5, unemp: 5.0, inf: 2.5, edu: 75 },
  GR: { gdp: 41000, le: 81.5, unemp: 10.0, inf: 4.0, edu: 79 },
  CN: { gdp: 23382, le: 78.0, unemp: 5.0, inf: 1.0, edu: 74 },
  ZA: { gdp: 16000, le: 65.5, unemp: 32.0, inf: 5.5, edu: 65 },
  IN: { gdp: 9000, le: 70.0, unemp: 8.0, inf: 5.5, edu: 66 },
  AR: { gdp: 26000, le: 77.0, unemp: 6.5, inf: 60.0, edu: 76 },
  BR: { gdp: 20000, le: 76.5, unemp: 8.0, inf: 4.5, edu: 73 },
  TR: { gdp: 41000, le: 78.5, unemp: 9.5, inf: 60.0, edu: 75 },
  ID: { gdp: 15000, le: 72.0, unemp: 5.5, inf: 3.0, edu: 71 },
  PE: { gdp: 16000, le: 77.5, unemp: 7.0, inf: 4.0, edu: 72 },
  MX: { gdp: 25000, le: 75.0, unemp: 3.0, inf: 4.5, edu: 71 },
  PK: { gdp: 6500, le: 66.5, unemp: 8.5, inf: 20.0, edu: 55 },
  RU: { gdp: 35000, le: 73.0, unemp: 3.0, inf: 7.5, edu: 80 },
  NG: { gdp: 6000, le: 53.5, unemp: 5.0, inf: 25.0, edu: 50 },
  IR: { gdp: 18000, le: 74.5, unemp: 9.0, inf: 35.0, edu: 74 },
  IQ: { gdp: 13000, le: 71.5, unemp: 15.0, inf: 4.0, edu: 60 },
  CD: { gdp: 1500, le: 60.0, unemp: 5.0, inf: 10.0, edu: 40 },
  AF: { gdp: 1674, le: 63.5, unemp: 15.0, inf: 5.0, edu: 35 },
  VE: { gdp: 7000, le: 71.5, unemp: 6.0, inf: 150.0, edu: 68 },
  SY: { gdp: 3000, le: 74.0, unemp: 10.0, inf: 40.0, edu: 50 },
  SS: { gdp: 1000, le: 55.5, unemp: 13.0, inf: 20.0, edu: 30 },
  SO: { gdp: 1500, le: 56.5, unemp: 12.0, inf: 10.0, edu: 25 },
};

export const missingDataRanges: Record<string, [number, number]> = {
  'SS': [2000, 2011], // South Sudan became independent in 2011
  'KV': [2000, 2007], // Kosovo independent in 2008
  'ME': [2000, 2005], // Montenegro independent in 2006
  'RS': [2000, 2005], // Serbia independent in 2006
  'SO': [2000, 2011], // Somalia missing in CPI before ~2012
  'KP': [2000, 2011], // North Korea missing in CPI before ~2012
  'AF': [2000, 2004], // Afghanistan missing early 2000s
  'SY': [2000, 2003],
  'CU': [2000, 2005],
  'ER': [2000, 2004],
  'IQ': [2000, 2002],
  'LY': [2000, 2002],
  'MM': [2000, 2011], // Myanmar missing before 2012
  'VE': [2000, 2001]
};

export const isDataMissingForYear = (id: string, year: number): boolean => {
  const range = missingDataRanges[id];
  if (range && year >= range[0] && year <= range[1]) {
    return true;
  }
  return false;
};

export const enrichedCpiData: CountryCPI[] = cpiData.map((d: CountryCPI) => {
  const random = mulberry32(d.id.charCodeAt(0) + d.id.charCodeAt(1) * 10);
  const factor = d.score / 100;
  const mapped = realDataMap[d.id];
  
  const gdp = mapped ? mapped.gdp : d.gdpPpp;
  const inf = mapped ? mapped.inf : Number(Math.max(0.2, (1 - factor) * random() * 20).toFixed(1));
  const unemp = mapped ? mapped.unemp : Number(Math.max(1.5, (1 - factor * 0.5) * random() * 15).toFixed(1));
  const edu = mapped ? mapped.edu : Number(Math.min(100, Math.max(20, factor * 80 + random() * 20)).toFixed(1));
  const le = mapped ? mapped.le : Number(Math.min(85, 55 + factor * 25 + random() * 5).toFixed(1));

  return {
    ...d,
    gdpPpp: gdp,
    inflation: inf,
    unemployment: unemp,
    education: edu,
    lifeExpectancy: le,
    pressFreedom: Number(Math.min(100, Math.max(0, d.score + (random() * 20 - 10))).toFixed(1)),
    hasHistoricalGaps: !!missingDataRanges[d.id]
  };
});
