// Approximate city centres, used to frame the listing-detail map when a listing
// carries no address of its own.
//
// SERVER-SIDE ONLY, and that is the point of the separate module: app/api/map is the
// single consumer, and cities.ts — the natural home for this — is imported by the
// hero city picker and the feed filter, so anything living there ships in the home
// page's client bundle. The browser never needs to know which towns can be placed:
// it asks /api/map for a city and the route answers with an image or a 404, and the
// listing page draws its delivery-zone backdrop either way.
import type { City } from "@/app/lib/cities";
import type { Coordinates } from "@/app/lib/map-geometry";

/* The eight picker cities. Typed as Record<City, …>, so adding a city to LT_CITIES
   without a centroid is a compile error rather than a silently map-less page. */
const LT_CITY_COORDS: Record<City, Coordinates> = {
  Vilnius: { lat: 54.6872, lon: 25.2797 },
  Kaunas: { lat: 54.8985, lon: 23.9036 },
  Klaipėda: { lat: 55.7033, lon: 21.1443 },
  Šiauliai: { lat: 55.9333, lon: 23.3167 },
  Panevėžys: { lat: 55.7347, lon: 24.3575 },
  Alytus: { lat: 54.3963, lon: 24.0458 },
  Marijampolė: { lat: 54.559, lon: 23.354 },
  Palanga: { lat: 55.9175, lon: 21.0686 },
};

// Listings are not limited to the eight picker cities, so this widens map coverage
// to the rest of the larger towns. A city in neither table is not guessed at — the
// route 400s and the handover section keeps its delivery-zone backdrop.
const LT_TOWN_COORDS: Record<string, Coordinates> = {
  Anykščiai: { lat: 55.5261, lon: 25.1028 },
  Biržai: { lat: 56.2019, lon: 24.7561 },
  Druskininkai: { lat: 54.0167, lon: 23.9667 },
  Elektrėnai: { lat: 54.7856, lon: 24.6631 },
  Gargždai: { lat: 55.71, lon: 21.3939 },
  Jonava: { lat: 55.0733, lon: 24.28 },
  Joniškis: { lat: 56.2394, lon: 23.6136 },
  Jurbarkas: { lat: 55.0783, lon: 22.7661 },
  Kaišiadorys: { lat: 54.8611, lon: 24.4472 },
  Kelmė: { lat: 55.6333, lon: 22.9333 },
  Kretinga: { lat: 55.8878, lon: 21.2394 },
  Kupiškis: { lat: 55.8425, lon: 24.9781 },
  Kuršėnai: { lat: 56.0, lon: 22.9333 },
  Kėdainiai: { lat: 55.2875, lon: 23.975 },
  Lentvaris: { lat: 54.6428, lon: 25.0533 },
  Mažeikiai: { lat: 56.3097, lon: 22.3364 },
  Molėtai: { lat: 55.2306, lon: 25.4189 },
  "Naujoji Akmenė": { lat: 56.3181, lon: 22.8944 },
  Neringa: { lat: 55.3033, lon: 20.9997 },
  Pasvalys: { lat: 56.0611, lon: 24.3969 },
  Plungė: { lat: 55.9111, lon: 21.845 },
  Prienai: { lat: 54.6383, lon: 23.9464 },
  Radviliškis: { lat: 55.8117, lon: 23.5433 },
  Raseiniai: { lat: 55.3719, lon: 23.1181 },
  Rokiškis: { lat: 55.9575, lon: 25.5856 },
  Skuodas: { lat: 56.2681, lon: 21.5253 },
  Tauragė: { lat: 55.2522, lon: 22.2897 },
  Telšiai: { lat: 55.9825, lon: 22.2472 },
  Trakai: { lat: 54.6378, lon: 24.9344 },
  Ukmergė: { lat: 55.2461, lon: 24.7517 },
  Utena: { lat: 55.4981, lon: 25.5997 },
  Varėna: { lat: 54.2117, lon: 24.5697 },
  Vilkaviškis: { lat: 54.6522, lon: 23.0353 },
  Visaginas: { lat: 55.5997, lon: 26.4308 },
  Zarasai: { lat: 55.7317, lon: 26.245 },
  Šakiai: { lat: 54.9528, lon: 23.0472 },
  Šilalė: { lat: 55.4903, lon: 22.1836 },
  Šilutė: { lat: 55.3506, lon: 21.4831 },
  Širvintos: { lat: 55.045, lon: 24.9575 },
  Švenčionys: { lat: 55.1358, lon: 26.1567 },
};

// One lookup over both tables. The two stay separate above so the picker cities keep
// their exhaustiveness check, and merging here is what lets the lookup take a plain
// string without casting it to City.
const CENTROIDS: Record<string, Coordinates> = { ...LT_TOWN_COORDS, ...LT_CITY_COORDS };

export function cityCoordinates(city: string): Coordinates | undefined {
  return CENTROIDS[city];
}
