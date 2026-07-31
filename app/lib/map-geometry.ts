// Geometry for the listing-detail map. Ported from the mobile app's
// src/components/delivery/mapGeometry.ts so both products frame the same listing the
// same way — keep the constants and names in step when either side changes.

export type Coordinates = { lat: number; lon: number };

export const KM_PER_LATITUDE_DEGREE = 111;

/* ---------------- Address masking ----------------
   The backend hands out a delivery method's real base address, which is somebody's
   home. Round to a ~1km grid before it is allowed anywhere near a rendered map, and
   note that on the web this matters MORE than in the app: whatever the page holds is
   readable in devtools, so the rounding happens here at the mapping boundary and the
   precise value never enters a view model at all.

   app/api/map re-checks the precision of what it is asked to draw, so the masking
   cannot be sidestepped by hand-crafting an image URL. */
export const MASKED_COORDINATE_PRECISION = 2;

export function maskCoordinates(coordinates: Coordinates): Coordinates {
  return {
    lat: Number(coordinates.lat.toFixed(MASKED_COORDINATE_PRECISION)),
    lon: Number(coordinates.lon.toFixed(MASKED_COORDINATE_PRECISION)),
  };
}

// Is this already at (or coarser than) the masked grid? The route rejects anything
// finer rather than quietly rounding it, so a leak is a 400 and not a silent success.
//
// Compared with a tolerance rather than exactly, because scaling a legitimately
// masked value lands just off a whole number in IEEE 754 (54.69 * 100 is
// 5469.000000000001). The tolerance is far below the next representable step of the
// grid, so nothing genuinely finer slips through.
const GRID_EPSILON = 1e-6;

export function isMasked({ lat, lon }: Coordinates): boolean {
  const grid = 10 ** MASKED_COORDINATE_PRECISION;
  const onGrid = (value: number) => Math.abs(value * grid - Math.round(value * grid)) < GRID_EPSILON;
  return onGrid(lat) && onGrid(lon);
}

/* ---------------- Delivery radius ----------------
   What the map is willing to draw a zone circle for, in one place: the listing page
   uses it to decide whether to ask for a circle at all, and app/api/map uses it to
   validate what it was asked for. Two copies of these bounds would drift, and the
   drift would be invisible — the route would simply 400 a page that thought it was
   asking for something reasonable.

   Whole kilometres only, and used verbatim rather than snapped to a bucket: rounding
   a 3 km delivery zone up to 5 km would draw a circle the listing does not promise. */
export const MIN_RADIUS_KM = 1;
export const MAX_RADIUS_KM = 100;

export function isDrawableRadiusKm(radiusKm: number | null | undefined): radiusKm is number {
  return (
    typeof radiusKm === "number" &&
    Number.isInteger(radiusKm) &&
    radiusKm >= MIN_RADIUS_KM &&
    radiusKm <= MAX_RADIUS_KM
  );
}

// A degree of longitude shrinks with latitude. The floor is the app's; Lithuania
// sits around 0.58 and never approaches it, but the two implementations should not
// drift over a constant.
export function getLongitudeScale(latitude: number): number {
  return Math.max(Math.cos((latitude * Math.PI) / 180), 0.25);
}

// The four N/S/E/W points on the radius edge. The app hands these to
// fitToCoordinates(); the Static Maps API takes the same four as `visible` and
// derives the zoom itself, so neither side has to hardcode a zoom level.
export function buildRadiusEdgeCoordinates({
  coordinates,
  radiusKm,
}: {
  coordinates: Coordinates;
  radiusKm: number;
}): Coordinates[] {
  const latitudeOffset = radiusKm / KM_PER_LATITUDE_DEGREE;
  const longitudeOffset = latitudeOffset / getLongitudeScale(coordinates.lat);
  return [
    { lat: coordinates.lat + latitudeOffset, lon: coordinates.lon },
    { lat: coordinates.lat - latitudeOffset, lon: coordinates.lon },
    { lat: coordinates.lat, lon: coordinates.lon + longitudeOffset },
    { lat: coordinates.lat, lon: coordinates.lon - longitudeOffset },
  ];
}

/* ---------------- Radius circle ----------------
   The app draws the delivery zone with <Circle>. The Static Maps API has no circle
   primitive, so the same shape ships as an encoded-polyline `path`. 48 segments is
   indistinguishable from a circle at every zoom the fit above produces, and keeps
   the encoded path near 250 characters. */
const CIRCLE_SEGMENTS = 48;

export function circlePoints({
  coordinates,
  radiusKm,
  segments = CIRCLE_SEGMENTS,
}: {
  coordinates: Coordinates;
  radiusKm: number;
  segments?: number;
}): Coordinates[] {
  const latitudeOffset = radiusKm / KM_PER_LATITUDE_DEGREE;
  const longitudeOffset = latitudeOffset / getLongitudeScale(coordinates.lat);
  const points: Coordinates[] = [];
  for (let step = 0; step <= segments; step += 1) {
    const angle = (2 * Math.PI * step) / segments;
    points.push({
      lat: coordinates.lat + latitudeOffset * Math.sin(angle),
      lon: coordinates.lon + longitudeOffset * Math.cos(angle),
    });
  }
  return points;
}

// Google's polyline algorithm: zig-zag the signed delta so small negatives stay
// short, then emit 5-bit chunks with a continuation bit, offset into printable
// ASCII. Deltas here are a few thousand hundred-thousandths, far inside the 32-bit
// range JS bitwise operators work in.
function encodeValue(value: number): string {
  let remaining = value < 0 ? ~(value << 1) : value << 1;
  let encoded = "";
  while (remaining >= 0x20) {
    encoded += String.fromCharCode((0x20 | (remaining & 0x1f)) + 63);
    remaining >>= 5;
  }
  return encoded + String.fromCharCode(remaining + 63);
}

export function encodePolyline(points: Coordinates[]): string {
  let previousLat = 0;
  let previousLon = 0;
  let encoded = "";
  for (const point of points) {
    const lat = Math.round(point.lat * 1e5);
    const lon = Math.round(point.lon * 1e5);
    encoded += encodeValue(lat - previousLat) + encodeValue(lon - previousLon);
    previousLat = lat;
    previousLon = lon;
  }
  return encoded;
}
