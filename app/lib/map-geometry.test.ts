import { describe, expect, it } from "vitest";
import {
  buildRadiusEdgeCoordinates,
  circlePoints,
  encodePolyline,
  getLongitudeScale,
  isDrawableRadiusKm,
  isMasked,
  maskCoordinates,
  MAX_RADIUS_KM,
} from "./map-geometry";

// These are the two guards that keep an owner's home address off a public page, so
// they are tested as guards: what must be REJECTED matters more than what passes.
describe("coordinate masking", () => {
  it("rounds to the ~1km grid", () => {
    expect(maskCoordinates({ lat: 54.68723, lon: 25.27974 })).toEqual({ lat: 54.69, lon: 25.28 });
    expect(maskCoordinates({ lat: -0.004, lon: 0.006 })).toEqual({ lat: -0, lon: 0.01 });
  });

  it("accepts values already at or coarser than the grid", () => {
    expect(isMasked({ lat: 54.69, lon: 25.25 })).toBe(true);
    expect(isMasked({ lat: 54.7, lon: 25.2 })).toBe(true);
    expect(isMasked({ lat: 55, lon: 25 })).toBe(true);
    // Float representation must not make a legitimately masked pair look precise:
    // 54.69 * 100 is 5469.000000000001 in IEEE 754.
    expect(isMasked({ lat: 54.69, lon: 25.31 })).toBe(true);
  });

  it("rejects anything finer than the grid", () => {
    expect(isMasked({ lat: 54.6872, lon: 25.2797 })).toBe(false);
    expect(isMasked({ lat: 54.695, lon: 25.25 })).toBe(false);
    expect(isMasked({ lat: 54.69, lon: 25.251 })).toBe(false);
  });

  it("passes its own output", () => {
    for (const lat of [54.68723, 55.70331, 56.30971]) {
      expect(isMasked(maskCoordinates({ lat, lon: lat / 2 }))).toBe(true);
    }
  });
});

// The listing page and app/api/map both gate on this, so a value it accepts here has
// to be one the route will draw — the point of having a single predicate.
describe("isDrawableRadiusKm", () => {
  it("accepts whole kilometres inside the range", () => {
    expect(isDrawableRadiusKm(1)).toBe(true);
    expect(isDrawableRadiusKm(20)).toBe(true);
    expect(isDrawableRadiusKm(MAX_RADIUS_KM)).toBe(true);
  });

  it("rejects a radius it cannot draw honestly instead of rounding it", () => {
    expect(isDrawableRadiusKm(3.5)).toBe(false);
    expect(isDrawableRadiusKm(0)).toBe(false);
    expect(isDrawableRadiusKm(-5)).toBe(false);
    expect(isDrawableRadiusKm(MAX_RADIUS_KM + 1)).toBe(false);
  });

  it("rejects the absent and the non-finite", () => {
    expect(isDrawableRadiusKm(null)).toBe(false);
    expect(isDrawableRadiusKm(undefined)).toBe(false);
    expect(isDrawableRadiusKm(Number.NaN)).toBe(false);
    expect(isDrawableRadiusKm(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe("radius geometry", () => {
  it("scales longitude by latitude, with the app's floor", () => {
    expect(getLongitudeScale(0)).toBeCloseTo(1, 6);
    expect(getLongitudeScale(54.69)).toBeCloseTo(0.5779, 3);
    expect(getLongitudeScale(89)).toBe(0.25); // clamped
  });

  it("puts the edge points one radius out, N/S/E/W", () => {
    const edges = buildRadiusEdgeCoordinates({ coordinates: { lat: 54.69, lon: 25.25 }, radiusKm: 111 });
    expect(edges).toHaveLength(4);
    expect(edges[0].lat).toBeCloseTo(55.69, 6); // 111km north ≈ 1 degree
    expect(edges[1].lat).toBeCloseTo(53.69, 6);
    expect(edges[0].lon).toBe(25.25);
    // A degree of longitude is shorter this far north, so E/W offsets are wider.
    expect(edges[2].lon - 25.25).toBeGreaterThan(1);
  });

  it("closes the circle and keeps every point one radius from the centre", () => {
    const centre = { lat: 54.69, lon: 25.25 };
    const points = circlePoints({ coordinates: centre, radiusKm: 20 });
    expect(points).toHaveLength(49); // 48 segments + the repeated closing point
    expect(points[0]).toEqual(points[48]);

    const scale = getLongitudeScale(centre.lat);
    for (const point of points) {
      const dLat = point.lat - centre.lat;
      const dLon = (point.lon - centre.lon) * scale;
      expect(Math.hypot(dLat, dLon) * 111).toBeCloseTo(20, 6);
    }
  });
});

describe("encodePolyline", () => {
  // The worked example from Google's own polyline algorithm documentation.
  it("matches Google's reference encoding", () => {
    expect(
      encodePolyline([
        { lat: 38.5, lon: -120.2 },
        { lat: 40.7, lon: -120.95 },
        { lat: 43.252, lon: -126.453 },
      ]),
    ).toBe("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
  });

  it("encodes an empty path as an empty string", () => {
    expect(encodePolyline([])).toBe("");
  });
});
