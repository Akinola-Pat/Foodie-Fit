import { mapCountryToRegion, DEFAULT_FALLBACK_REGION } from '../src/services/localeService';

describe('Foodie Fit Locale Service — Regional Diet Mapping', () => {
  it('maps standard Western countries to north_america_western', () => {
    expect(mapCountryToRegion('US')).toBe('north_america_western');
    expect(mapCountryToRegion('CA')).toBe('north_america_western');
    expect(mapCountryToRegion('GB')).toBe('north_america_western');
    expect(mapCountryToRegion('DE')).toBe('north_america_western');
  });

  it('maps Mediterranean and Middle Eastern countries to mediterranean', () => {
    expect(mapCountryToRegion('IT')).toBe('mediterranean');
    expect(mapCountryToRegion('GR')).toBe('mediterranean');
    expect(mapCountryToRegion('EG')).toBe('mediterranean');
    expect(mapCountryToRegion('AE')).toBe('mediterranean');
  });

  it('maps Latin American countries to mediterranean as closest dietary fallback', () => {
    expect(mapCountryToRegion('BR')).toBe('mediterranean');
    expect(mapCountryToRegion('MX')).toBe('mediterranean');
    expect(mapCountryToRegion('CO')).toBe('mediterranean');
  });

  it('maps West African and Caribbean countries to west_african', () => {
    expect(mapCountryToRegion('NG')).toBe('west_african');
    expect(mapCountryToRegion('GH')).toBe('west_african');
    expect(mapCountryToRegion('JM')).toBe('west_african');
    expect(mapCountryToRegion('TT')).toBe('west_african');
  });

  it('maps East and Southeast Asian countries to east_asian', () => {
    expect(mapCountryToRegion('JP')).toBe('east_asian');
    expect(mapCountryToRegion('CN')).toBe('east_asian');
    expect(mapCountryToRegion('KR')).toBe('east_asian');
    expect(mapCountryToRegion('TH')).toBe('east_asian');
    expect(mapCountryToRegion('VN')).toBe('east_asian');
  });

  it('maps South Asian countries to south_asian', () => {
    expect(mapCountryToRegion('IN')).toBe('south_asian');
    expect(mapCountryToRegion('PK')).toBe('south_asian');
    expect(mapCountryToRegion('BD')).toBe('south_asian');
  });

  it('falls back cleanly to default for unknown or empty codes', () => {
    expect(mapCountryToRegion(null)).toBe(DEFAULT_FALLBACK_REGION);
    expect(mapCountryToRegion('')).toBe(DEFAULT_FALLBACK_REGION);
    expect(mapCountryToRegion('ZZ')).toBe(DEFAULT_FALLBACK_REGION);
  });
});
