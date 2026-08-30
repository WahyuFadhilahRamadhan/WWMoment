export interface VenueConfig {
  lat: number;
  lng: number;
  radiusMeters: number;
}

const DEFAULT_RADIUS_METERS = 500;

/**
 * Reads the venue coordinates from env vars. Returns null when they are not
 * configured, which fully disables the location gate (opt-in feature).
 */
export function getVenueConfig(): VenueConfig | null {
  const lat = process.env.NEXT_PUBLIC_VENUE_LAT;
  const lng = process.env.NEXT_PUBLIC_VENUE_LNG;
  const radius = process.env.NEXT_PUBLIC_VENUE_RADIUS_METERS;

  if (!lat || !lng) return null;

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return null;

  return {
    lat: parsedLat,
    lng: parsedLng,
    radiusMeters: radius ? parseFloat(radius) : DEFAULT_RADIUS_METERS,
  };
}

/** Haversine great-circle distance between two lat/lng points, in meters. */
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
