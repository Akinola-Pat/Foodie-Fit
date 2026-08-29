import { RegionCode } from '../types/nutrition';

/**
 * Country to Regional Cuisine Mapping Table
 */
export const COUNTRY_TO_REGION_MAP: Record<string, RegionCode> = {
  // 1. North America & Western Europe
  US: 'north_america_western',
  CA: 'north_america_western',
  GB: 'north_america_western',
  UK: 'north_america_western',
  AU: 'north_america_western',
  NZ: 'north_america_western',
  DE: 'north_america_western',
  NL: 'north_america_western',
  BE: 'north_america_western',
  AT: 'north_america_western',
  CH: 'north_america_western',
  SE: 'north_america_western',
  NO: 'north_america_western',
  DK: 'north_america_western',
  FI: 'north_america_western',
  IE: 'north_america_western',
  PL: 'north_america_western',
  CZ: 'north_america_western',
  RO: 'north_america_western',
  HU: 'north_america_western',
  UA: 'north_america_western',

  // 2. Mediterranean, Middle East & North Africa (+ Latin America fallback)
  IT: 'mediterranean',
  GR: 'mediterranean',
  ES: 'mediterranean',
  PT: 'mediterranean',
  CY: 'mediterranean',
  TR: 'mediterranean',
  EG: 'mediterranean',
  MA: 'mediterranean',
  DZ: 'mediterranean',
  TN: 'mediterranean',
  LB: 'mediterranean',
  JO: 'mediterranean',
  IL: 'mediterranean',
  AE: 'mediterranean',
  SA: 'mediterranean',
  BR: 'mediterranean', // Latin America fallback (beans, grilled meat/fish, fresh produce)
  MX: 'mediterranean',
  CO: 'mediterranean',
  AR: 'mediterranean',
  CL: 'mediterranean',
  PE: 'mediterranean',

  // 3. West African, Sub-Saharan & Caribbean
  NG: 'west_african',
  GH: 'west_african',
  SN: 'west_african',
  CI: 'west_african',
  CM: 'west_african',
  SL: 'west_african',
  LR: 'west_african',
  GM: 'west_african',
  TG: 'west_african',
  BJ: 'west_african',
  KE: 'west_african',
  ZA: 'west_african',
  JM: 'west_african',
  TT: 'west_african',
  HT: 'west_african',
  BB: 'west_african',
  BS: 'west_african',
  GY: 'west_african',

  // 4. East & Southeast Asian
  CN: 'east_asian',
  JP: 'east_asian',
  KR: 'east_asian',
  TW: 'east_asian',
  HK: 'east_asian',
  VN: 'east_asian',
  TH: 'east_asian',
  SG: 'east_asian',
  MY: 'east_asian',
  PH: 'east_asian',
  ID: 'east_asian',

  // 5. South Asian
  IN: 'south_asian',
  PK: 'south_asian',
  BD: 'south_asian',
  LK: 'south_asian',
  NP: 'south_asian',
};

export const DEFAULT_FALLBACK_REGION: RegionCode = 'north_america_western';

/**
 * Maps a two-letter ISO country code to one of the 5 regional templates.
 */
export function mapCountryToRegion(countryCode?: string | null): RegionCode {
  if (!countryCode) return DEFAULT_FALLBACK_REGION;
  const upper = countryCode.trim().toUpperCase();
  return COUNTRY_TO_REGION_MAP[upper] ?? DEFAULT_FALLBACK_REGION;
}
