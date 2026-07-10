// Category glyphs — maps the backend's `icon_name` (shipped with each category
// on GET /listings/categories) to the local NK_ICONS set. The backend's icon
// vocabulary differs per environment (prod uses MaterialCommunityIcons/Ionicons
// names, dev uses Lucide names), so both alias to the same local glyph; unknown
// names fall back to Tag. Accent hues live in globals.css under the [data-cat]
// attribute map (the backend has no color data).
import type { IconName } from "@/app/components/ui";

const CATEGORY_GLYPH: Record<string, IconName> = {
  // tools_construction
  "wrench": "Wrench", "tools": "Wrench",
  // home_garden
  "home": "Home", "home-variant-outline": "Home", "house": "Home",
  // transport
  "car": "Car", "car-multiple": "Car", "car-front": "Car",
  // photo_video
  "camera": "Camera", "camera-outline": "Camera",
  // audio_music_events
  "speaker": "Speaker",
  // electronics_tech
  "laptop": "Laptop",
  // sports_leisure
  "dumbbell": "Dumbbell", "basketball": "Dumbbell",
  // events_parties
  "party-popper": "PartyPopper",
  // clothing_accessories
  "shirt": "Shirt", "hanger": "Shirt",
  // kids
  "baby": "Baby", "baby-face-outline": "Baby",
  // health_medical
  "heart-pulse": "HeartPulse",
  // other
  "more-horizontal": "MoreHorizontal", "ellipsis-horizontal-outline": "MoreHorizontal", "ellipsis": "MoreHorizontal",
};

export function categoryGlyph(iconName?: string): IconName {
  return (iconName && CATEGORY_GLYPH[iconName]) || "Tag";
}

// Resolve the placeholder glyph for a listing from its top-level category id.
// Used by the offer cards' empty-photo state; centralizes the Tag fallback so
// the lookup isn't duplicated per render. Takes a minimal {id, icon} shape to
// avoid a runtime import cycle with categories.ts (which imports from here).
export function categoryIconFor(cats: { id: string; icon: IconName }[], id?: string): IconName {
  return cats.find((c) => c.id === id)?.icon ?? "Tag";
}

// Localized display name for a listing's top-level category — surfaced as the
// browse card's eyebrow. Returns undefined when the id isn't in the loaded set
// (the card then simply omits the eyebrow).
export function categoryNameFor(cats: { id: string; title: string }[], id?: string): string | undefined {
  return cats.find((c) => c.id === id)?.title;
}
