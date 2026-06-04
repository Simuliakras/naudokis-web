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
    primary: "Pagrindinė navigacija",
    openMenu: "Atidaryti meniu",
    closeMenu: "Uždaryti meniu",
  },
  hero: {
    badge: "Prisijunk prie 10,000+ kaimynų Lietuvoje",
    title: "Skolinkis tai, ko reikia šiandien.",
    body: "Aukščiausios kokybės daiktų nuoma iš patikimų kaimynų. Nuo profesionalios foto technikos iki laisvalaikio įrangos.",
    phoneAlt: "Naudokis programėlė",
  },
  search: {
    placeholder: "Ką nuomositės?",
    inputLabel: "Ieškoti daiktų nuomai",
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
  howItWorks: {
    eyebrow: "Kaip tai veikia",
    title: "Trys žingsniai iki nuomos",
    steps: [
      { icon: "Search", title: "Rask", body: "Naršyk tūkstančius daiktų iš kaimynų visoje Lietuvoje ir išsirink tai, ko reikia šiandien." },
      { icon: "Calendar", title: "Rezervuok", body: "Pasirink datas ir rezervuok programėlėje. Pinigai užšaldomi saugiai iki nuomos pabaigos." },
      { icon: "ShieldCheck", title: "Naudokis", body: "Pasiimk daiktą iš kaimyno, naudokis ramiai ir grąžink laiku. Užstatas grįžta automatiškai." },
    ],
  },
  home: {
    seoHeading: "Daiktų nuoma iš kaimynų visoje Lietuvoje",
    seoBody: "Naudokis – tai bendruomenės nuomos platforma, jungianti daiktų savininkus ir nuomininkus visoje Lietuvoje. Nuomok įrankius, transporto priemones, elektroniką, sporto bei laisvalaikio įrangą iš patikimų kaimynų Vilniuje, Kaune, Klaipėdoje ir kituose miestuose. Naršyti gali nemokamai, o atsiskaitymai apsaugoti – pinigai užšaldomi ir savininkui pervedami tik sėkmingai užbaigus nuomą. Kam pirkti, jei gali išsinuomoti?",
  },
  testimonials: {
    eyebrow: "Atsiliepimai",
    title: "Ką sako mūsų bendruomenė",
    items: [
      { name: "Eglė J.", role: "Nuomininkė, Vilnius", avatarTint: "#C1C1C1",
        quote: "“Nuostabi patirtis! Išsinuomojau Sony fotoaparatą savaitgaliui – viskas vyko sklandžiai, savininkas buvo labai paslaugus. Sutaupiau šimtus eurų.”" },
      { name: "Marius V.", role: "Savininkas, Kaunas", avatarTint: "#A7B0AE",
        quote: "“Savo įrankius išnuomoju, kai jų nenaudoju – papildomos pajamos atsiranda savaime, o atsiskaitymai visada saugūs ir laiku.”" },
      { name: "Rūta P.", role: "Nuomininkė, Klaipėda", avatarTint: "#B8C0A7",
        quote: "“Reikėjo aukšto slėgio plovyklės vienai dienai. Radau ją per kelias minutes vos už kelis eurus – kaimynas gyveno tame pačiame kvartale.”" },
    ],
    goToReview: (i) => `Rodyti ${i + 1}-ą atsiliepimą`,
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
    tagline: "Daiktų nuomos rinka, jungianti kaimynus visoje Lietuvoje.",
    browseHeading: "Kategorijos",
    allCategories: "Visos kategorijos",
    categories: [
      { label: "Transporto priemonės", q: "transportas" },
      { label: "Foto ir vaizdo technika", q: "foto" },
      { label: "Įrankiai ir statyba", q: "įrankiai" },
      { label: "Laisvalaikis ir sportas", q: "sportas" },
    ],
    citiesHeading: "Populiarūs miestai",
    helpHeading: "Pagalba",
    help: [
      { label: "DUK", href: "#duk" },
      { label: "Kontaktai", href: "#kontaktai" },
      { label: "Privatumo politika", href: "/privatumo-politika" },
      { label: "Naudojimo taisyklės", href: "/naudojimo-taisykles" },
      { label: "Politikų centras", href: "/teisine" },
    ],
    copyright: "© 2026 Naudokis.lt · Visos teisės saugomos",
    secure: "Saugūs atsiskaitymai",
  },
  detail: {
    metaFallbackTitle: "Skelbimas — Naudokis.lt",
    metaFallbackDescription: "Peržiūrėk daikto nuomos skelbimą Naudokis.lt ir rezervuok programėlėje.",
    metaTitleSuffix: " — Naudokis.lt",
    share: "Dalintis",
    verifiedOwnerPill: "Patikrintas savininkas",
    galleryMore: (n) => `+${n} nuotraukų`,
    descHeading: "Aprašymas",
    descMore: "Skaityti daugiau",
    descLess: "Rodyti mažiau",
    specsHeading: "Specifikacijos",
    ownerHeading: "Savininkas",
    ownerVerified: "Patikrintas",
    ownerNewMember: "Naujas narys",
    ownerRentals: (n) => {
      const d = n % 10;
      const dd = n % 100;
      if ((dd >= 11 && dd <= 19) || d === 0) return `${n} įvykdytų nuomų`;
      if (d === 1) return `${n} įvykdyta nuoma`;
      return `${n} įvykdytos nuomos`;
    },
    contact: "Rašyti",
    handoverHeading: "Daikto perdavimas",
    pickupLabel: "Atsiėmimas",
    pickupFree: "Nemokama",
    deliveryLabel: "Pristatymas",
    deliveryByArrangement: "Pagal susitarimą",
    termsHeading: "Nuomos sąlygos",
    priceLabel: "Nuomos kaina",
    depositLabel: "Grąžinamas užstatas",
    refundLabel: "Pinigų grąžinimas",
    refundValue: "100% iki 5 d. prieš",
    durationLabel: "Nuomos trukmė",
    durationValue: "Nuo 1 iki 60 dienų",
    reviewsHeading: "Atsiliepimai",
    reviewsEmptyTitle: "Dar nėra atsiliepimų",
    reviewsEmptyBody: "Išsinuomok pirmas ir pasidalink patirtimi.",
    perDay: "/ diena",
    depositReturnable: "Užstatas (grąžinamas)",
    reserve: "Rezervuoti programėlėje",
    reserveMobile: "Rezervuoti",
    escrowNote: "Pinigai užšaldomi saugiai iki nuomos pabaigos",
    loadErrorTitle: "Nepavyko įkelti skelbimo",
    loadErrorBody: "Įvyko klaida kraunant skelbimą. Patikrinkite ryšį ir bandykite dar kartą.",
    backToListings: "Visi skelbimai",
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
    breadcrumbHome: "Pagrindinis",
    breadcrumbLabel: "Naršymo kelias",
  },
  categoriesPage: {
    metaTitle: "Visos kategorijos — Naudokis.lt",
    metaDescription: "Naršyk visas daiktų nuomos kategorijas Naudokis.lt — transportas, įrankiai, foto technika, buitinė technika, laisvalaikio įranga ir daugiau.",
    crumb: "Kategorijos",
    eyebrow: "Atraskite",
    title: "Visos kategorijos",
    body: "Naršyk visas daiktų kategorijas ir rask tai, ko reikia, šalia savęs.",
    searchPlaceholder: "Ieškoti kategorijos…",
    submit: "Ieškoti",
    tileCount: (n) => {
      const d = n % 10;
      const dd = n % 100;
      const word = (dd >= 11 && dd <= 19) || d === 0 ? "skelbimų" : d === 1 ? "skelbimas" : "skelbimai";
      return `${n} ${word}`;
    },
    emptyTitle: "Kategorijų nerasta",
    emptySubtitle: (query) => `Pagal „${query}" neradome kategorijų. Pabandykite kitą paiešką.`,
    emptyAction: "Išvalyti",
    seoHeading: "Daiktų nuoma pagal kategorijas",
    seoBody: "Naudokis.lt apima visas populiariausias nuomos kategorijas — nuo transporto priemonių ir įrankių iki foto technikos, buitinės technikos ir laisvalaikio įrangos. Rinkis kategoriją ir atrask patikrintus skelbimus savo mieste už dalį pirkimo kainos.",
  },
  feed: {
    metaTitle: "Skelbimai — daiktų nuoma | Naudokis.lt",
    metaDescription: "Naršyk ir filtruok daiktų nuomos skelbimus visoje Lietuvoje — pagal kategoriją, miestą ir kainą. Rezervaciją užbaik Naudokis programėlėje.",
    crumbCategories: "Kategorijos",
    titleAll: "Visi skelbimai",
    titleSearch: "Paieškos rezultatai",
    subtitleAll: "Daiktų nuoma visoje Lietuvoje",
    subtitleSearch: (q) => `Pagal „${q}" · visa Lietuva`,
    resultCount: (n) => {
      const d = n % 10;
      const dd = n % 100;
      const word = (dd >= 11 && dd <= 19) || d === 0 ? "skelbimų" : d === 1 ? "skelbimas" : "skelbimai";
      return `${n} ${word}`;
    },
    clear: "Išvalyti",
    searchPlaceholder: "Ieškoti skelbimų…",
    sortLabel: "Rūšiuoti",
    sortRecommended: "Rekomenduojama",
    sortPriceAsc: "Pigiausi",
    sortPriceDesc: "Brangiausi",
    sortRatingBest: "Geriausiai vertinti",
    categoryLabel: "Kategorija",
    allCategories: "Visos kategorijos",
    cityLabel: "Miestas",
    deliveryToggle: "Su pristatymu",
    relatedHeading: "Susijusios paieškos",
    relatedTags: ["Nešiojami kompiuteriai", "Foto technika", "Dronai", "Įrankiai", "Garso technika", "Dviračiai"],
    seoHeading: "Daiktų nuoma Lietuvoje",
    seoBody: "Naudokis.lt jungia žmones, norinčius išsinuomoti daiktus, su patikimais savininkais visoje Lietuvoje. Naršyk, ieškok ir filtruok skelbimus pagal kategoriją, miestą ar kainą tiesiog naršyklėje. Rezervaciją ir saugius atsiskaitymus užbaik Naudokis programėlėje.",
    emptyTitle: "Pagal jūsų filtrus nieko nerasta",
    emptySubtitle: "Pabandykite kitą raktažodį, kategoriją ar miestą arba išvalykite filtrus.",
    emptyAction: "Išvalyti filtrus",
    interruptTitle: "Rezervuok sekundėmis programėlėje",
    interruptBody: "Visi skelbimai, pokalbiai su savininkais ir saugūs atsiskaitymai — vienoje vietoje.",
    interruptCta: "Atsisiųsti programėlę",
  },
  cityPage: {
    metaTitle: (city) => `Daiktų nuoma ${city} mieste | Naudokis.lt`,
    metaDescription: (city) =>
      `Nuomokis įrankius, techniką, sporto ir laisvalaikio inventorių iš patikimų kaimynų ${city} mieste. Naršyk skelbimus naršyklėje, rezervaciją užbaik Naudokis programėlėje.`,
    crumb: "Miestai",
    eyebrow: (city) => `Nuoma · ${city}`,
    title: (city) => `Daiktų nuoma ${city} mieste`,
    body: (city) =>
      `Įrankiai, technika, sporto ir laisvalaikio daiktai iš patikimų kaimynų ${city} mieste — vienoje vietoje.`,
    resultCount: (n) => {
      const d = n % 10;
      const dd = n % 100;
      const word = (dd >= 11 && dd <= 19) || d === 0 ? "skelbimų" : d === 1 ? "skelbimas" : "skelbimai";
      return `${n} ${word}`;
    },
    emptyTitle: (city) => `${city} mieste skelbimų dar nėra`,
    emptyBody: (city) => `Šiuo metu ${city} mieste aktyvių skelbimų neradome. Peržiūrėk nuomą visoje Lietuvoje.`,
    otherCitiesHeading: "Kiti miestai",
    browseAll: "Visi skelbimai",
    seoHeading: (city) => `Daiktų nuoma ${city} mieste`,
    seoBody: (city) =>
      `Naudokis.lt jungia žmones, norinčius išsinuomoti daiktus, su patikimais savininkais ${city} mieste ir visoje Lietuvoje. Naršyk skelbimus naršyklėje, o rezervaciją ir saugius atsiskaitymus užbaik Naudokis programėlėje.`,
  },
  bridge: {
    defaultTitle: "Tęskite programėlėje",
    defaultBody: "Šis veiksmas kol kas atliekamas Naudokis programėlėje. Atsisiųskite ją ir užbaikite per kelias sekundes.",
    qrHint: "Nuskenuokite kodą telefonu ir tęskite programėlėje.",
    close: "Uždaryti",
    reserveTitle: "Rezervuokite programėlėje",
    reserveBody: "Datų pasirinkimas, kainos skaičiavimas ir rezervacija atliekami Naudokis programėlėje. Pinigai užšaldomi saugiai iki nuomos pabaigos.",
    contactTitle: "Susisiekite programėlėje",
    contactBody: "Žinutės savininkui siunčiamos saugiai per Naudokis programėlę.",
    favoriteTitle: "Įsiminkite programėlėje",
    favoriteBody: "Mėgstamų skelbimų sąrašas saugomas jūsų paskyroje — atsisiųskite Naudokis programėlę.",
    shareTitle: "Atidarykite programėlėje",
    shareBody: "Atsisiųskite Naudokis programėlę ir atsidarykite šį skelbimą telefone.",
  },
  appBanner: {
    title: "Naudokis programėlė",
    body: "Rezervuok ir bendrauk patogiau",
    install: "Diegti",
    dismiss: "Uždaryti",
  },
  cityPicker: {
    heading: "Pasirinkite miestą",
    all: "Visi miestai",
  },
  legal: {
    brandSub: "Teisė ir politikos",
    langSwitchLabel: "Kalba",
    breadcrumb: "Naršymo kelias",
    policyCenter: "Politikų centras",
    inThisDoc: "Šiame dokumente",
    contents: "Turinys",
    related: "Susiję dokumentai",
    backTop: "Į viršų",
    openMenu: "Skyriai",
    readingProgress: "Skaitymo eiga",
    effective: "Įsigalioja",
    version: "Versija",
    updated: "Atnaujinta",
    onlyLt: "Šis dokumentas šiuo metu skelbiamas tik lietuvių kalba. Rodomas lietuviškas tekstas.",
    briefLabel: "Trumpai",
    company: "MB Naudokis · juridinio asmens kodas 307423504 · Numėjos g. 6, LT-08402 Vilnius",
    footHelp: "Klausimų dėl šių sąlygų?",
    footWrite: "Rašykite",
    termsLabel: "Naudojimosi sąlygos",
    privacyLabel: "Privatumo politika",
    hubEyebrow: "Naudokis · Teisė ir politikos",
    hubTitle: "Politikų centras",
    hubIntro:
      "Visi „Naudokis“ teisiniai dokumentai vienoje vietoje. Raskite taisyklę, kuri taikoma prieš keliant skelbimą, rezervuojant, mokant, sprendžiant ginčą ar teikiant privatumo prašymą — kiekviena politika aiškiai struktūruota ir susieta su kitomis.",
    hubMetaDescription:
      "Visi „Naudokis“ teisiniai dokumentai vienoje vietoje — naudojimosi sąlygos, privatumo politika, mokėjimai, užstatai, sauga ir privatumo priedai.",
    featured: "Pradėkite čia",
    read: "Skaityti",
    docsWord: "dokumentai",
    contacts: "Greiti kontaktai",
    fullHierarchy: "Skaityti visą Politikų centro dokumentą",
    cGeneral: "Bendri klausimai ir pagalba",
    cPrivacy: "Privatumo ir BDAR prašymai",
    cDsa: "DSA / neteisėto turinio pranešimai",
    cSafety: "Produktų saugos pranešimai",
    appOrEmail: "per Programėlę arba",
    ltOnlyBadge: "Tik lietuvių k.",
    searchPlaceholder: "Ieškoti dokumentų…",
    searchNoResults: "Pagal jūsų užklausą dokumentų nerasta.",
    metaDescriptionFallback:
      "„Naudokis“ teisinis dokumentas. Perskaitykite kartu su Naudojimosi sąlygomis ir Privatumo politika.",
  },
};
