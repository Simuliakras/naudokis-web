// Lithuanian dictionary — copy ported verbatim from the original inline strings.
import type { Dict } from "./types";

export const lt: Dict = {
  meta: {
    title: "Naudokis.lt — daiktų nuoma iš patikimų kaimynų",
    description:
      "Aukščiausios kokybės daiktų nuoma iš patikimų kaimynų Lietuvoje — įrankiai, transportas, foto technika, laisvalaikio įranga. Nuomok. Naudokis.",
    keywords: [
      "daiktų nuoma", "nuoma", "Naudokis", "įrankių nuoma", "transporto nuoma",
      "foto technikos nuoma", "P2P nuoma", "Lietuva", "kaimynų nuoma",
    ],
    ogLocale: "lt_LT",
    ogImageAlt: "Naudokis.lt",
  },
  nav: {
    search: "Paieška",
    category: "Kategorija",
    contacts: "Kontaktai",
  },
  hero: {
    badge: "Prisijunk prie 10,000+ kaimynų Lietuvoje",
    title: "Skolinkis tai, ko reikia šiandien.",
    body: "Aukščiausios kokybės daiktų nuoma iš patikimų kaimynų. Nuo profesionalios foto technikos iki laisvalaikio įrangos.",
    phoneAlt: "Naudokis programėlė",
  },
  search: {
    placeholder: "Ką nuomositės?",
    where: "Kur?",
    submit: "Ieškoti",
  },
  categories: {
    eyebrow: "Atraskite",
    title: "Kategorijos",
    all: "Visos kategorijos",
    errorTitle: "Nepavyko įkelti kategorijų",
    errorSubtitle: "Įvyko klaida kraunant kategorijas. Patikrinkite interneto ryšį ir bandykite dar kartą.",
    errorAction: "Bandyti dar kartą",
    emptyTitle: "Kategorijų nerasta",
    emptySubtitle: (query) => `Pagal „${query}" neradome nė vienos kategorijos. Pabandykite kitą paiešką arba peržiūrėkite visas kategorijas.`,
    emptyAction: "Rodyti visas kategorijas",
  },
  offers: {
    eyebrow: "Rekomenduojame",
    title: "Geriausi pasiūlymai šalia jūsų",
    errorTitle: "Nepavyko įkelti skelbimų",
    errorSubtitle: "Įvyko klaida kraunant skelbimus. Patikrinkite interneto ryšį ir bandykite dar kartą.",
    errorAction: "Bandyti dar kartą",
    emptyTitle: "Pagal jūsų paiešką nieko nerasta",
    emptySubtitle: (query) => `Nepavyko rasti skelbimų pagal „${query}". Pabandykite kitą raktažodį, miestą ar išvalykite paiešką.`,
    emptyAction: "Išvalyti paiešką",
  },
  features: [
    { icon: "Users", title: "Patikrinta bendruomenė", body: "Visi vartotojai yra kruopščiai verifikuojami, užtikrinant aukščiausius pasitikėjimo standartus kiekvieno sandorio metu." },
    { icon: "ShieldCheck", title: "Saugūs atsiskaitymai", body: "Mūsų platforma užtikrina saugią pinigų rezervaciją ir išmokėjimą tik tada, kai sandoris sėkmingai užbaigiamas." },
    { icon: "MapPin", title: "Kaimynystėje", body: "Atraskite naudingus daiktus tiesiog kitoje gatvės pusėje. Stiprinkime vietos bendruomenę kartu." },
  ],
  testimonials: {
    eyebrow: "Atsiliepimai",
    title: "Ką sako mūsų bendruomenė",
    quote: "“Nuostabi patirtis! Išsinuomojau Sony fotoaparatą savaitgaliui – viskas vyko sklandžiai, savininkas buvo labai paslaugus. Sutaupiau šimtus eurų.”",
  },
  cta: {
    title: "Atsisiųskite ir išbandykite šiandien",
    body: "Aukščiausios kokybės daiktų nuoma iš patikimų kaimynų. Nuo profesionalios foto technikos iki laisvalaikio įrangos.",
    phoneAlt: "Naudokis programėlė",
  },
  faq: {
    heading: "Dažniausiai užduodami klausimai",
    subheading: "Turite klausimų? Mes paruošėme atsakymus į dažniausiai kylančias dvejones.",
    items: [
      { q: "Kokie mokesčiai taikomi Naudokis.lt daiktų nuomos platformoje?", a: "Ieškoti ir nuomotis daiktus nemokama. Nuomotojai moka tik nedidelį, skaidrų komisinį mokestį po sėkmingos nuomos." },
      { q: "Kaip užtikrinate nuomos saugumą ir atsiskaitymus?", a: "Pinigai už nuomą „užšaldomi“ ir pervedami nuomotojui tik sėkmingai užbaigus sandorį." },
      { q: "Kokią įrangą ar daiktus galima išnuomoti platformoje?", a: "Nuo foto ir vaizdo technikos iki įrankių, transporto priemonių, buitinės technikos ir laisvalaikio įrangos." },
      { q: "Ar galiu rasti įrangos nuomai visoje Lietuvoje?", a: "Taip — patogūs filtrai ir kategorijos padės greitai rasti reikiamą daiktą bet kuriame Lietuvos mieste." },
      { q: "Kaip nustatyti optimalią nuomos kainą savo daiktams?", a: "Platforma pasiūlo rekomenduojamą kainą pagal panašius skelbimus, o galutinį sprendimą priimate jūs." },
      { q: "Kada bus išleista mobilioji aplikacija?", a: "Aplikacija jau prieinama iOS ir Android — atsisiųskite ją iš App Store arba Google Play." },
    ],
  },
  footer: {
    links: ["Privatumo politika", "Paslaugų teikimo sąlygos", "Kategorija", "Kontaktai"],
  },
  listingSheet: {
    back: "Atgal",
    close: "Uždaryti",
    nextImage: "Rodyti kitą nuotrauką",
    tags: ["Automobiliai", "Transportas ir priekabos"],
    descriptionHeading: "Aprašymas",
    description: "Galingas ir patikimas pikapas, puikiai tinkantis kroviniams gabenti, kelionėms ar darbams. Pilnas kuro bakas, techninė apžiūra galioja, švarus salonas. Atsiimti galima Vilniuje, sutartu laiku.",
    specsHeading: "Specifikacijos",
    ownerHeading: "Savininkas",
    ownerVerified: "Patikrintas",
    ownerRentals: "Įvykdyta nuomų",
    perDay: "už 1 dieną",
    reserve: "Rezervuoti programėlėje",
  },
  common: {
    favorite: "Įsiminti",
    perDay: "už 1 dieną",
    reviewCount: (n) => {
      const d = n % 10;
      const dd = n % 100;
      const word = (dd >= 11 && dd <= 19) || d === 0 ? "atsiliepimų" : d === 1 ? "atsiliepimas" : "atsiliepimai";
      return `${n} ${word}`;
    },
    sampleCity: "Vilnius",
    samplePrice: "50 €",
  },
};
