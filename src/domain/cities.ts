export type City = {
  id: string;
  name: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  lat: number;
  lon: number;
};

/**
 * The six cities required by the challenge. Coordinates are pre-resolved
 * to avoid a geocoding round-trip and to keep the cities list a domain
 * concept rather than runtime state.
 *
 * Note on Dallol: the brief writes "(NG)" but Dallol is in the Afar region
 * of Ethiopia. We use the geographically correct location.
 */
export const CITIES: readonly City[] = [
  {
    id: 'dallol',
    name: 'Dallol',
    country: 'Ethiopia',
    countryCode: 'ET',
    lat: 14.2417,
    lon: 40.2992,
  },
  {
    id: 'fairbanks',
    name: 'Fairbanks',
    country: 'United States',
    countryCode: 'US',
    lat: 64.8378,
    lon: -147.7164,
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    lat: 51.5074,
    lon: -0.1278,
  },
  {
    id: 'recife',
    name: 'Recife',
    country: 'Brazil',
    countryCode: 'BR',
    lat: -8.0476,
    lon: -34.877,
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    country: 'Canada',
    countryCode: 'CA',
    lat: 49.2827,
    lon: -123.1207,
  },
  {
    id: 'yakutsk',
    name: 'Yakutsk',
    country: 'Russia',
    countryCode: 'RU',
    lat: 62.0339,
    lon: 129.7331,
  },
];

export function findCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}
