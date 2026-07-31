// The listing map's Google styling and request shape. The style rules are a direct
// port of createMapPreviewStyle() in the mobile app's
// src/components/delivery/mapPreview.shared.ts — same rules in the same order,
// re-encoded as Static Maps API `style=` values instead of a MapStyleElement[].
//
// The API key is NOT read here: it is passed in by the route handler so this module
// stays pure and unit-testable, and so nothing client-reachable can import a path
// that touches the secret.

import { buildRadiusEdgeCoordinates, circlePoints, encodePolyline, type Coordinates } from "@/app/lib/map-geometry";

/* ---------------- Palette ----------------
   Mirrors the map* tokens of the app's dark theme in src/constants/palettes.ts.
   These are plain hex rather than --nk-* custom properties because the style array
   is assembled server-side, inside /api/map, where var() cannot resolve. `surface`
   is deliberately identical to --nk-surface so the map sits on exactly the same
   charcoal as the cards around it. */
const PALETTE = {
  surface: "0x2a2e30",
  water: "0x2c3742",
  park: "0x2a3529",
  roadHighway: "0x4d5359",
  roadArterial: "0x404549",
  roadLocal: "0x363b3e",
  roadStroke: "0x2e3234",
  labelFill: "0xa7aeb8",
  labelMuted: "0x878e98",
  labelStroke: "0x272b2d",
} as const;

// The delivery-zone circle. The app tints these with its own primary (#6665e0);
// here they follow the site's --nk-purple so the map matches the delivery-zone
// backdrop rendered underneath it. The trailing byte is alpha — the Static API wants
// 0xRRGGBBAA where the app's <Circle> took separate rgba() strings.
const RADIUS_STROKE = "0x5e5ce64d";
const RADIUS_FILL = "0x5e5ce61a";

// One image, cropped with object-fit, rather than a size per breakpoint: the whole
// point of the whitelist below is a URL space small enough to stay warm in a CDN.
// scale=2 covers retina at the widths this box actually renders at.
const IMAGE_SIZE = "640x320";
const IMAGE_SCALE = "2";

// Used when a listing offers pickup only, so there is no radius to fit the viewport
// to. Close enough to read the city and its districts.
const CITY_ZOOM = "12";

/* ---------------- Style ----------------
   The app's `detail` switch has no counterpart here. Its 'point' and 'expanded'
   levels reveal road and park labels for maps centred on a real address, and the web
   never has better than city precision — so this is always the app's 'area' level:
   locality and neighbourhood labels on, road and park labels off.

   Two rules differ from the app, and deliberately. It colours the neighbourhood and
   water labels on elementType 'labels.text', which sets the fill AND the stroke to
   the same value — the halo vanishes and the type renders smudged against the
   surface. Scoping the colour to 'labels.text.fill' keeps the dark stroke from the
   global rule above and the labels stay crisp. Worth fixing in the app too. */
function mapStyleParams(): string[] {
  return [
    `element:geometry|color:${PALETTE.surface}`,
    "element:labels.icon|visibility:off",
    `element:labels.text.fill|color:${PALETTE.labelFill}`,
    `element:labels.text.stroke|color:${PALETTE.labelStroke}`,
    "feature:administrative|element:geometry|visibility:off",
    "feature:administrative.land_parcel|visibility:off",
    "feature:administrative.locality|element:labels|visibility:on",
    "feature:administrative.neighborhood|element:geometry|visibility:off",
    "feature:administrative.neighborhood|element:labels.text|visibility:on",
    `feature:administrative.neighborhood|element:labels.text.fill|color:${PALETTE.labelMuted}`,
    "feature:poi|visibility:off",
    `feature:poi.park|element:geometry|visibility:on|color:${PALETTE.park}`,
    `feature:road|element:geometry|color:${PALETTE.roadLocal}`,
    `feature:road|element:geometry.stroke|color:${PALETTE.roadStroke}`,
    "feature:road|element:labels|visibility:off",
    `feature:road.arterial|element:geometry|color:${PALETTE.roadArterial}`,
    `feature:road.highway|element:geometry|color:${PALETTE.roadHighway}`,
    "feature:transit|visibility:off",
    `feature:water|element:geometry|color:${PALETTE.water}`,
    "feature:water|element:labels.text|visibility:on",
    `feature:water|element:labels.text.fill|color:${PALETTE.labelMuted}`,
  ];
}

/* ---------------- Request ----------------
   `center` is always the listing's coordinate, which is what lets the marker be a
   plain DOM element pinned at 50%/50% of the image box — no projection maths on the
   client, at any zoom or container size. Do not move the centre off the coordinate
   without also moving that marker. */
export function buildStaticMapUrl({
  coordinates,
  radiusKm,
  language,
  apiKey,
}: {
  coordinates: Coordinates;
  radiusKm: number | null;
  language: string;
  apiKey: string;
}): string {
  const params = new URLSearchParams();
  params.set("center", `${coordinates.lat},${coordinates.lon}`);
  params.set("size", IMAGE_SIZE);
  params.set("scale", IMAGE_SCALE);
  params.set("language", language);
  params.set("region", "LT");

  if (radiusKm !== null) {
    // The app's fitToCoordinates(buildRadiusEdgeCoordinates(...)): hand Google the
    // radius edges and let it choose a zoom that contains them.
    for (const edge of buildRadiusEdgeCoordinates({ coordinates, radiusKm })) {
      params.append("visible", `${edge.lat},${edge.lon}`);
    }
    params.append(
      "path",
      `color:${RADIUS_STROKE}|fillcolor:${RADIUS_FILL}|weight:1|enc:${encodePolyline(circlePoints({ coordinates, radiusKm }))}`,
    );
  } else {
    params.set("zoom", CITY_ZOOM);
  }

  for (const style of mapStyleParams()) {
    params.append("style", style);
  }
  params.set("key", apiKey);

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}
