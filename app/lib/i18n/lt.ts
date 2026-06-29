// Lithuanian dictionary — launch-ready user-facing copy for the localized site.
import { cityLocativeLt } from "../cities";
import type { Dict } from "./types";

// Genitive category labels for SEO landing titles/descriptions ("Įrankių ir statybos
// įrangos nuoma Vilniuje"). Keyed by top-level category id; falls back to the plain
// (nominative) title when an id is missing.
const LT_CATEGORY_SEO_LABELS: Record<string, string> = {
  tools_construction: "Įrankių ir statybos įrangos",
  home_garden: "Namų ir sodo prekių",
  transport: "Transporto",
  photo_video: "Foto ir video technikos",
  audio_music_events: "Garso, muzikos ir renginių technikos",
  electronics_tech: "Elektronikos ir technologijų",
  sports_leisure: "Sporto ir laisvalaikio įrangos",
  events_parties: "Renginių ir švenčių įrangos",
  clothing_accessories: "Drabužių ir aksesuarų",
  kids: "Vaikiškų daiktų",
  health_medical: "Sveikatos ir medicininės įrangos",
  other: "Daiktų",
};

export const lt: Dict = {
  meta: {
    title: "Naudokis.lt — daiktų nuoma iš patikimų žmonių šalia",
    description:
      "Išsinuomokite įrankius, transportą, foto techniką, elektroniką ir laisvalaikio įrangą iš žmonių šalia. Naršykite svetainėje, rezervuokite saugiai Naudokis programėlėje.",
    ogLocale: "lt_LT",
    ogImageAlt: "Naudokis.lt",
  },
  nav: {
    search: "Paieška",
    category: "Kategorijos",
    listings: "Nuomojami daiktai",
    howItWorks: "Kaip tai veikia",
    getApp: "Atsisiųsti programėlę",
    language: "Kalba",
    languageNames: { lt: "Lietuvių", en: "English" },
    primary: "Pagrindinė navigacija",
    openMenu: "Atidaryti meniu",
    closeMenu: "Uždaryti meniu",
  },
  hero: {
    badge: "Patikima daiktų nuoma visoje Lietuvoje",
    title: "Išsinuomokite reikalingus daiktus iš žmonių šalia.",
    body: "Raskite įrankius, transportą, foto techniką, elektroniką ir laisvalaikio įrangą be poreikio pirkti. Naršykite svetainėje, o rezervaciją, žinutes ir saugų mokėjimą atlikite Naudokis programėlėje.",
    phoneAlt: "Naudokis programėlė",
  },
  search: {
    placeholder: "Ką norite išsinuomoti?",
    inputLabel: "Ieškoti daiktų nuomai",
    where: "Kur?",
    labelWhat: "Ką?",
    labelWhere: "Miestas",
    submit: "Ieškoti",
  },
  categories: {
    eyebrow: "Naršykite",
    title: "Populiarios nuomos kategorijos",
    all: "Visos kategorijos",
    seoFallbackBody: (name) =>
      `Nuomokitės „${name}“ kategorijos daiktus iš patikimų žmonių šalia visoje Lietuvoje.`,
    metaTitleFallback: (name) => `${name} | Naudokis.lt`,
    errorTitle: "Nepavyko įkelti kategorijų",
    errorSubtitle:
      "Kategorijų šiuo metu nepavyko parodyti. Patikrinkite ryšį ir bandykite dar kartą.",
    errorAction: "Bandyti dar kartą",
    emptyTitle: "Kategorijų nerasta",
    emptySubtitle: (query) =>
      `Pagal „${query}“ kategorijų neradome. Pabandykite platesnę paiešką arba peržiūrėkite visas kategorijas.`,
    emptyAction: "Rodyti visas kategorijas",
    bandEmptyTitle: "Kategorijų kol kas nėra",
    bandEmptyBody:
      "Kategorijas netrukus papildysime. Atnaujinkite puslapį arba užsukite vėliau.",
    bandEmptyAction: "Atnaujinti",
    bandEmptySecondary: "Atidaryti programėlėje",
  },
  offers: {
    eyebrow: "Atrinkta jums",
    title: "Populiarūs daiktai nuomai netoliese",
    all: "Visi daiktai",
    errorTitle: "Nepavyko įkelti nuomos pasiūlymų",
    errorSubtitle:
      "Nuomos pasiūlymų šiuo metu nepavyko parodyti. Patikrinkite ryšį ir bandykite dar kartą.",
    errorAction: "Bandyti dar kartą",
    emptyTitle: "Pagal šią paiešką daiktų neradome",
    emptySubtitle: (query) =>
      `Pagal „${query}“ nuomos pasiūlymų neradome. Pabandykite kitą raktažodį, miestą arba išvalykite paiešką.`,
    emptyAction: "Išvalyti paiešką",
    bandEmptyTitle: "Kol kas nėra nuomos pasiūlymų",
    bandEmptyBody:
      "Nauji daiktai atsiranda nuolat. Užsukite vėliau arba pradėkite nuo kategorijų.",
    bandEmptyAction: "Visos kategorijos",
    bandEmptySecondary: "Atidaryti programėlėje",
  },
  features: [
    {
      icon: "Users",
      title: "Žmonės, kuriais galite pasitikėti",
      body: "Profiliai, patikros ir atsiliepimai padeda pasirinkti prieš rezervuojant.",
    },
    {
      icon: "ShieldCheck",
      title: "Apsaugoti mokėjimai programėlėje",
      body: "Mokėjimas laikomas saugiai ir savininkui pervedamas po sėkmingos nuomos.",
    },
    {
      icon: "MapPin",
      title: "Daiktai šalia, mažiau pirkimo",
      body: "Raskite tai, ko reikia savo mieste, be daiktų pirkimo, laikymo ir laukimo.",
    },
  ],
  howItWorks: {
    meta: {
      title: "Kaip tai veikia — Naudokis.lt",
      description:
        "Sužinokite, kaip Naudokis veikia nuomininkams ir savininkams — nuo paieškos iki grąžinimo ir nuo skelbimo iki išmokos.",
    },
    eyebrow: "Kaip tai veikia",
    title: "Nuomokitės tai, ko reikia. Uždirbkite iš to, ką turite.",
    lead: "Naudokis sujungia nuomininkus, kuriems daikto reikia trumpam, su savininkais, kurių nenaudojami daiktai gali uždirbti. Pasirinkite savo pusę ir pamatykite visą kelią.",
    renter: {
      label: "Nuomininkas",
      lead: "Nuo paieškos iki grąžinimo — taip išsinuomosite daiktą dienai, savaitgaliui ar projektui.",
      ctaTitle: "Pasiruošę rezervuoti? Tęskite programėlėje",
      ctaBody:
        "Pasirinkite datas, susirašykite su savininku, patvirtinkite užstatą ir saugiai sumokėkite vienoje vietoje.",
      steps: [
        {
          icon: "Search",
          title: "Raskite daiktą netoliese",
          tag: "Greita",
          tone: "yellow",
          screen: "search",
          body: "Naršykite pasiūlymus ir filtruokite pagal miestą, datą ar kainą. Naršymas visada nemokamas.",
        },
        {
          icon: "Calendar",
          title: "Rezervuokite saugiai programėlėje",
          tag: "Apsaugota",
          tone: "green",
          screen: "reserve",
          body: "Pasirinkite datas ir rezervuokite programėlėje. Mokėjimas laikomas saugiai iki nuomos pabaigos.",
        },
        {
          icon: "Handshake",
          title: "Pasiimkite ir patikrinkite",
          tag: "Netoliese",
          tone: "yellow",
          screen: "pickup",
          body: "Susitikite sutartoje vietoje, patikrinkite daiktą ir naudokitės juo sutartą laiką.",
        },
        {
          icon: "Star",
          title: "Grąžinkite ir įvertinkite",
          tag: "Užbaigta",
          tone: "purple",
          screen: "review",
          body: "Grąžinkite daiktą, užbaikite nuomą ir palikite atsiliepimą, kuris padės kitam nuomininkui.",
        },
      ],
    },
    owner: {
      label: "Savininkas",
      lead: "Nuo skelbimo iki išmokos — taip nenaudojamus daiktus paversite pajamomis.",
      ctaTitle: "Pasiruošę išnuomoti? Įkelkite skelbimą programėlėje",
      ctaBody:
        "Programėlėje įkelsite daiktą, valdysite užklausas, susirašysite su nuomininkais ir gausite išmokas vienoje vietoje.",
      steps: [
        {
          icon: "Camera",
          title: "Sukurkite aiškų skelbimą",
          tag: "Lengva",
          tone: "purple",
          screen: "list",
          body: "Įkelkite nuotraukas, aprašykite komplektaciją ir nustatykite kainą bei užstatą.",
        },
        {
          icon: "BadgeCheck",
          title: "Patvirtinkite rezervaciją",
          tag: "Apsaugota",
          tone: "green",
          screen: "accept",
          body: "Peržiūrėkite užklausą, patvirtinkite laiką ir visą susirašinėjimą laikykite programėlėje.",
        },
        {
          icon: "Handshake",
          title: "Perduokite užtikrintai",
          tag: "Apsaugota",
          tone: "green",
          screen: "handover",
          body: "Susitikite sutartu laiku, patikrinkite būklę ir perduokite daiktą. Užstatas bei ginčų sprendimas padeda apsaugoti abi puses.",
        },
        {
          icon: "Coins",
          title: "Gaukite išmoką",
          tag: "Uždirbk",
          tone: "purple",
          screen: "payout",
          body: "Užbaigus nuomą, išmoka pervedama jums. Komisinis mokestis rodomas prieš patvirtinant.",
        },
      ],
    },
    trustEyebrow: "Pasitikėjimas iš abiejų pusių",
    trustTitle: "Sukurta saugesnei nuomai tarp žmonių",
    trust: [
      {
        icon: "Snowflake",
        title: "Apsaugoti mokėjimai",
        body: "Nuomos mokėjimai laikomi saugiai ir pervedami po sėkmingos nuomos.",
      },
      {
        icon: "Users",
        title: "Profiliai, patikros ir atsiliepimai",
        body: "Pasitikėjimo signalai padeda nuomininkams ir savininkams apsispręsti prieš susitikimą.",
      },
      {
        icon: "ShieldCheck",
        title: "Užstatai ir pagalba",
        body: "Aiškios taisyklės, grąžinami užstatai ir ginčų sprendimas padeda apsaugoti abi puses.",
      },
    ],
    faqEyebrow: "Dar klausimų?",
    faqTitle: "Dažniausi klausimai",
    faq: [
      {
        q: "Ar naršymas nemokamas?",
        a: "Taip. Naršyti, ieškoti ir peržiūrėti nuomos pasiūlymus visada nemokama. Savininkai komisinį moka tik po sėkmingos nuomos.",
      },
      {
        q: "Kaip apsaugomi mokėjimai?",
        a: "Rezervuojant nuomos mokėjimas laikomas saugiai ir savininkui pervedamas po to, kai nuoma užbaigiama pagal sutartas sąlygas.",
      },
      {
        q: "Kas atsako už galimą žalą daiktui?",
        a: "Prieš nuomą gali būti taikomas grąžinamas užstatas. Jei kyla nesutarimas, Naudokis komanda padeda surinkti informaciją ir spręsti ginčą.",
      },
      {
        q: "Kodėl rezervuoti reikia programėlėje?",
        a: "Programėlėje veikia saugūs mokėjimai, žinutės, rezervacijų valdymas ir pranešimai. Svetainėje galite patogiai naršyti ir atrasti.",
      },
    ],
    ctaPhoneAlt: "Naudokis programėlė",
    screen: {
      searchPlaceholder: "Ką norite išsinuomoti?",
      reserveCta: "Rezervuoti",
      frozenPill: "Rezervuota",
      pickupCta: "Susitikti su savininku",
      reviewCta: "Palikti atsiliepimą",
      listUpload: "Įkelkite nuotraukas",
      listPrice: "50 € / d.",
      listCta: "Skelbti",
      acceptCta: "Patvirtinti rezervaciją",
      handoverCta: "Perduoti daiktą",
      payoutAmount: "+ 50 €",
      payoutLabel: "Išmoka pervesta",
      completedPill: "Užbaigta",
    },
  },
  // NOTE: reframed from placeholder customer "reviews" to honest, non-attributed
  // use-case cards (no invented names / stars). Copy is illustrative — review with
  // marketing before launch.
  useCases: {
    eyebrow: "Kasdienė nauda",
    title: "Naudokitės daugiau. Pirkite mažiau.",
    items: [
      {
        icon: "Camera",
        tone: "purple",
        title: "Technika trumpam projektui",
        body: "Išsinuomokite fotoaparatą, objektyvą ar apšvietimą savaitgaliui, užuot pirkę retai naudojamą įrangą.",
      },
      {
        icon: "Wrench",
        tone: "yellow",
        title: "Įranga, kuri gali uždirbti",
        body: "Įdarbinkite tarp projektų nenaudojamus įrankius. Mokėjimai, užstatai ir žinutės tvarkomi programėlėje.",
      },
      {
        icon: "Coins",
        tone: "green",
        title: "Išbandykite prieš pirkdami",
        body: "Reikia tik kartą arba norite pirma išbandyti? Raskite daiktą netoliese ir išvenkite nereikalingo pirkinio.",
      },
    ],
    goToSlide: (i) => `Rodyti ${i + 1} pavyzdį`,
  },
  cta: {
    title: "Užbaikite nuomą programėlėje",
    body: "Pasirinkite datas, susirašykite su savininku, patvirtinkite užstatą, saugiai sumokėkite ir valdykite nuomą vienoje vietoje.",
    phoneAlt: "Naudokis programėlė",
  },
  faq: {
    heading: "Dažniausiai užduodami klausimai",
    subheading:
      "Trumpi atsakymai apie kainas, rezervacijas, užstatus, mokėjimus ir nuomą programėlėje.",
    items: [
      {
        q: "Ar naršymas nemokamas?",
        a: "Taip. Naršyti, ieškoti ir peržiūrėti nuomos pasiūlymus nemokama. Savininkai komisinį moka tik po sėkmingos nuomos.",
      },
      {
        q: "Kaip apsaugomi mokėjimai?",
        a: "Nuomos mokėjimas laikomas saugiai ir savininkui pervedamas po to, kai nuoma užbaigiama pagal sutartas sąlygas.",
      },
      {
        q: "Ką galima išsinuomoti per Naudokis?",
        a: "Populiarios kategorijos apima įrankius, foto ir vaizdo techniką, transportą, elektroniką, buitinę techniką, renginių ir laisvalaikio įrangą.",
      },
      {
        q: "Ar galiu rasti daiktų nuomai visoje Lietuvoje?",
        a: "Taip. Kategorijos, miestų filtrai ir paieška padeda greitai rasti reikalingą daiktą Vilniuje, Kaune, Klaipėdoje ir kituose miestuose.",
      },
      {
        q: "Kaip savininkai nustato kainas?",
        a: "Savininkai gali palyginti panašius nuomos pasiūlymus ir naudotis rekomendacijomis, bet galutinę kainą bei užstatą nustato patys.",
      },
      {
        q: "Kodėl rezervacijos vyksta programėlėje?",
        a: "Programėlėje vienoje vietoje laikomos datos, žinutės, mokėjimai, užstatai, pranešimai ir atsiliepimai.",
      },
    ],
  },
  footer: {
    tagline: "Daiktų nuoma iš patikimų žmonių visoje Lietuvoje.",
    browseHeading: "Kategorijos",
    allCategories: "Visos kategorijos",
    categories: [
      { label: "Transporto priemonės", q: "transportas" },
      { label: "Foto ir vaizdo technika", q: "foto" },
      { label: "Įrankiai ir statyba", q: "įrankiai" },
      { label: "Laisvalaikis ir sportas", q: "sportas" },
      { label: "Buitinė technika", q: "buitinė technika" },
      { label: "Elektronika", q: "elektronika" },
    ],
    helpHeading: "Informacija",
    help: [
      { label: "Privatumo politika", href: "/privatumo-politika" },
      { label: "Naudojimosi sąlygos", href: "/naudojimosi-salygos" },
      { label: "Paskyros trynimas", href: "/paskyros-trynimas" },
    ],
    copyright: "© 2026 Naudokis.lt. Visos teisės saugomos.",
    secure: "Apsaugoti mokėjimai",
  },
  detail: {
    metaFallbackTitle: "Daikto nuoma — Naudokis.lt",
    metaFallbackTitleForId: (readableId) => `${readableId} nuoma — Naudokis.lt`,
    metaFallbackDescription:
      "Peržiūrėkite daikto nuomos pasiūlymą Naudokis.lt ir rezervuokite programėlėje.",
    seoTitle: ({ title, city }) =>
      `${title} nuoma${city ? ` ${cityLocativeLt(city)}` : ""} — Naudokis.lt`,
    seoDescription: ({ title, city, category }) => {
      const location = city ? ` ${cityLocativeLt(city)}` : " Lietuvoje";
      const categoryText = category ? ` (${category.toLowerCase()})` : "";
      return `Išsinuomokite ${title}${categoryText}${location} per Naudokis.lt. Peržiūrėkite kainą, savininko informaciją, perdavimo būdus ir rezervaciją saugiai užbaikite programėlėje.`;
    },
    share: "Dalintis",
    shareCopied: "Nuoroda nukopijuota",
    verifiedOwnerPill: "Patikrintas savininkas",
    galleryMore: (n) => `+${n} nuotraukų`,
    descHeading: "Aprašymas",
    specsHeading: "Specifikacijos",
    ownerHeading: "Daikto savininkas",
    ownerVerified: "Patikrintas",
    ownerNewMember: "Naujas savininkas",
    ownerListings: (n) => {
      const d = n % 10;
      const dd = n % 100;
      if ((dd >= 11 && dd <= 19) || d === 0) return `${n} daiktų`;
      if (d === 1) return `${n} daiktas`;
      return `${n} daiktai`;
    },
    contact: "Rašyti savininkui",
    handoverHeading: "Daikto perdavimas",
    mapTitle: (city) => `${city} žemėlapyje`,
    pickupLabel: "Atsiėmimas",
    pickupFree: "Nemokama",
    deliveryLabel: "Pristatymas",
    deliveryByArrangement: "Pagal susitarimą",
    deliveryRadius: (km) => `Pristatymas iki ${km} km`,
    termsHeading: "Nuomos sąlygos",
    priceLabel: "Nuomos kaina",
    depositLabel: "Grąžinamas užstatas",
    refundLabel: "Pinigų grąžinimas",
    refundValue: "100% iki 5 d. prieš",
    durationLabel: "Nuomos trukmė",
    durationValue: "Nuo 1 iki 60 dienų",
    reviewsHeading: "Atsiliepimai",
    similarHeading: "Panašūs daiktai",
    reviewsEmptyTitle: "Šis daiktas dar neturi atsiliepimų",
    reviewsEmptyBody: "Išsinuomokite pirmi ir padėkite kitiems apsispręsti.",
    reviewsInApp: (n) => `Visi ${n} atsiliepimai programėlėje`,
    perDay: "/ diena",
    depositReturnable: "Užstatas (grąžinamas)",
    reserve: "Rezervuoti programėlėje",
    reserveMobile: "Atidaryti programėlę",
    appOnlyNote:
      "Pasirinkite datas, susirašykite su savininku, patvirtinkite užstatą ir saugiai sumokėkite programėlėje.",
    escrowNote: "Mokėjimas laikomas saugiai iki nuomos pabaigos",
    loadErrorTitle: "Nepavyko įkelti nuomos pasiūlymo",
    loadErrorBody: "Patikrinkite ryšį ir bandykite dar kartą.",
    backToListings: "Nuomojami daiktai",
    save: "Įsiminti",
    newListingPill: "Naujas daiktas",
    galleryAll: (n) => `Visos ${n} nuotr.`,
    galleryViewLabel: "Nuotraukų galerija",
    galleryClose: "Uždaryti galeriją",
    galleryPrev: "Ankstesnė nuotrauka",
    galleryNext: "Kita nuotrauka",
    perDayShort: "/ d.",
    dateFrom: "Nuo",
    dateTo: "Iki",
    dateInApp: "Pasirinksite programėlėje",
    chooseDates: "Pasirinkti datas",
    pricePerDayLine: "Nuomos kaina už parą",
    serviceFee: "Nuomininko aptarnavimo mokestis",
    serviceFeeHint:
      "Nuomininkams aptarnavimo mokestis Naudokis netaikomas. Mokate savininko nurodytą nuomos kainą ir, jei taikoma, grąžinamą užstatą.",
    serviceFeeFree: "Mokesčio nėra",
    inAppValue: "Rodoma programėlėje",
    totalToday: "Šiandien mokėti",
    cancellationNote: (tier) => {
      if (tier === "flexible") return "Lanksčios atšaukimo sąlygos";
      if (tier === "moderate") return "Vidutinės atšaukimo sąlygos";
      if (tier === "strict") return "Griežtos atšaukimo sąlygos";
      return "Atšaukimo sąlygos pagal taisykles";
    },
    hostStatRating: "Įvertinimas",
    hostStatReviews: "Atsiliepimai",
    hostStatListings: "Daiktai",
    hostStatStatus: "Būsena",
    hostMessage: "Rašyti savininkui",
    hostVerifiedNote: "Tapatybė ir telefono numeris patvirtinti",
    deliverySub: (city) =>
      `Atsiimkite nemokamai arba susitarkite dėl pristatymo ${city ? city + " mieste" : "savo mieste"}.`,
    deliveryZone: "≈20 km zona",
    deliveryZoneKm: (km) => `≈${km} km zona`,
    termRentSub: "Nuomos kaina už parą",
    depositNone: "Be užstato",
    termDepositSub: "Grąžinamas užstatas",
    durationRange: (min, max) =>
      !max || max <= min ? `Nuo ${min} d.` : `${min}–${max} dienų`,
    termDurationSub: "Nuomos trukmė",
    cancellationLabel: (tier) => {
      if (tier === "flexible") return "Lanksti";
      if (tier === "moderate") return "Vidutinė";
      if (tier === "strict") return "Griežta";
      return "Standartinė";
    },
    termCancelSub: "Atšaukimo politika",
    mobileBookingNote: "Rezervacija programėlėje",
  },
  common: {
    favorite: "Įsiminti",
    perDay: "/ diena",
    reviewCount: (n) => {
      const d = n % 10;
      const dd = n % 100;
      const word =
        (dd >= 11 && dd <= 19) || d === 0
          ? "atsiliepimų"
          : d === 1
            ? "atsiliepimas"
            : "atsiliepimai";
      return `${n} ${word}`;
    },
    newListing: "Naujas",
    sampleCity: "Vilnius",
    samplePrice: "50 €",
    breadcrumbHome: "Pagrindinis",
    breadcrumbLabel: "Naršymo kelias",
    skipToContent: "Pereiti prie turinio",
    loading: "Kraunama…",
  },
  categoriesPage: {
    metaTitle: "Nuomos kategorijos — Naudokis.lt",
    metaDescription:
      "Naršykite daiktų nuomos kategorijas Naudokis.lt — įrankius, transportą, foto techniką, elektroniką, namų ir laisvalaikio įrangą.",
    crumb: "Kategorijos",
    eyebrow: "Naršykite",
    title: "Visos nuomos kategorijos",
    body: "Pasirinkite kategoriją, atraskite daiktus šalia, palyginkite kainas ir rezervaciją užbaikite programėlėje.",
    searchPlaceholder: "Ieškoti kategorijos",
    submit: "Ieškoti",
    emptyTitle: "Kategorijų nerasta",
    emptySubtitle: (query) =>
      `Pagal „${query}“ kategorijų neradome. Pabandykite platesnę paiešką.`,
    emptyAction: "Išvalyti",
    foundCount: (n) => {
      const mod10 = n % 10,
        mod100 = n % 100;
      const word =
        mod10 === 1 && mod100 !== 11
          ? "kategorija"
          : mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)
            ? "kategorijos"
            : "kategorijų";
      return `Rasta ${n} ${word}`;
    },
    searchItems: (query) => `Ieškoti „${query}“ tarp daiktų`,
    seoHeading: "Daiktų nuoma pagal kategorijas",
    seoBody:
      "Naudokis.lt apima kasdienes nuomos kategorijas visoje Lietuvoje — nuo įrankių ir transporto iki foto technikos, elektronikos, buitinės technikos, renginių ir laisvalaikio įrangos. Pasirinkite kategoriją ir raskite daiktus netoliese be poreikio pirkti tai, ko reikia tik kartais.",
  },
  feed: {
    metaTitle: "Nuomojami daiktai Lietuvoje | Naudokis.lt",
    metaDescription:
      "Naršykite nuomojamus daiktus visoje Lietuvoje pagal kategoriją, miestą ir kainą. Raskite savininkus netoliese ir rezervuokite saugiai Naudokis programėlėje.",
    categorySeoLabel: (id, fallback) => LT_CATEGORY_SEO_LABELS[id] ?? fallback,
    landingTitle: ({ category, city }) => {
      const locative = city ? cityLocativeLt(city) : "";
      if (category && city)
        return `${category} nuoma ${locative} | Naudokis.lt`;
      if (category) return `${category} nuoma | Naudokis.lt`;
      return `Nuomojami daiktai ${locative} | Naudokis.lt`;
    },
    landingDescription: ({ category, city }) => {
      const locative = city ? cityLocativeLt(city) : "";
      if (category && city) {
        return `Naršykite ${category.toLowerCase()} nuomos pasiūlymus ${locative}. Raskite patikimus daiktų savininkus, palyginkite kainas ir rezervuokite Naudokis programėlėje.`;
      }
      if (category) {
        return `Raskite ${category.toLowerCase()} nuomai visoje Lietuvoje. Filtruokite pasiūlymus pagal miestą ir kainą, tada rezervuokite Naudokis programėlėje.`;
      }
      return `Naršykite daiktų nuomos pasiūlymus ${locative}: įrankius, transportą, foto techniką, elektroniką ir laisvalaikio įrangą iš patikimų savininkų.`;
    },
    crumbCategories: "Kategorijos",
    titleAll: "Nuomojami daiktai",
    titleSearch: "Paieškos rezultatai",
    subtitleAll: "Naršykite nuomos pasiūlymus visoje Lietuvoje.",
    subtitleSearch: (q) => `Rezultatai pagal „${q}“ visoje Lietuvoje.`,
    resultCount: (n) => {
      const d = n % 10;
      const dd = n % 100;
      const word =
        (dd >= 11 && dd <= 19) || d === 0
          ? "pasiūlymų"
          : d === 1
            ? "pasiūlymas"
            : "pasiūlymai";
      return `${n} ${word}`;
    },
    loadMore: "Rodyti daugiau",
    loadingMore: "Įkeliama daugiau…",
    clear: "Išvalyti",
    searchPlaceholder: "Ieškoti nuomos",
    sortLabel: "Rūšiuoti",
    sortRecommended: "Rekomenduojama",
    sortPriceAsc: "Mažiausia kaina",
    sortPriceDesc: "Didžiausia kaina",
    sortRatingBest: "Geriausiai įvertinti",
    categoryLabel: "Kategorija",
    allCategories: "Visos kategorijos",
    cityLabel: "Miestas",
    deliveryToggle: "Pristatymas galimas",
    seoHeading: "Daiktų nuoma Lietuvoje",
    seoBody:
      "Naudokis.lt jungia žmones, norinčius trumpam išsinuomoti daiktus, su patikimais savininkais visoje Lietuvoje. Naršykite, ieškokite ir filtruokite nuomos pasiūlymus pagal kategoriją, miestą ar kainą tiesiog naršyklėje. Rezervaciją, žinutes ir apsaugotą mokėjimą užbaikite Naudokis programėlėje.",
    empty: {
      searchTitle: (q) => `Pagal „${q}“ nuomos pasiūlymų neradome`,
      searchBody:
        "Pabandykite kitą raktažodį, pasirinkite kitą miestą arba išvalykite paiešką.",
      searchAction: "Išvalyti paiešką",
      filterTitle: "Pagal šiuos filtrus nuomos pasiūlymų neradome",
      filterTitleCity: (city) =>
        `Pagal šiuos filtrus mieste „${city}“ nuomos pasiūlymų neradome`,
      filterBody:
        "Pabandykite kitą miestą, platesnę kategoriją arba išjunkite pristatymą.",
      filterAction: "Išvalyti filtrus",
      categoryTitle: "Šioje kategorijoje dar nėra nuomos pasiūlymų",
      categoryBody:
        "Peržiūrėkite kitas kategorijas arba įkelkite daiktą ir būkite vieni pirmųjų savininkų čia.",
      categoryActionPrimary: "Įkelti daiktą",
      categoryActionSecondary: "Visos kategorijos",
    },
    interruptTitle: "Rezervuokite saugiai programėlėje",
    interruptBody:
      "Pasirinkite datas, rašykite savininkams, valdykite užstatus ir saugiai mokėkite vienoje vietoje.",
    interruptCta: "Atsisiųsti programėlę",
  },
  offline: {
    title: "Nėra interneto ryšio",
    body: "Prisijunkite prie interneto, kad galėtumėte įkelti nuomos pasiūlymus ir tęsti naršymą.",
    retry: "Bandyti dar kartą",
  },
  bridge: {
    defaultTitle: "Tęskite Naudokis programėlėje",
    defaultBody:
      "Rezervacijos, žinutės, mokėjimai, užstatai ir atsiliepimai saugiai valdomi programėlėje.",
    qrHint: "Nuskenuokite QR kodą telefonu ir atidarykite Naudokis.",
    installCta: "Atsisiųsti programėlę",
    close: "Uždaryti",
    opensAppHint: "Atsidarys programėlėje",
    googlePlayAlt: "Gaukite „Google Play“ parduotuvėje",
    appStoreAlt: "Atsisiųskite iš „App Store“",
    reserveTitle: "Rezervuokite programėlėje",
    reserveBody:
      "Pasirinkite datas, peržiūrėkite galutinę kainą ir saugiai atlikite rezervaciją programėlėje.",
    datesTitle: "Pasirinkite datas programėlėje",
    datesBody: "Laisvos datos ir galutinė kaina rodomos Naudokis programėlėje.",
    contactTitle: "Rašykite savininkui programėlėje",
    contactBody:
      "Nuomos žinutes ir rezervacijos informaciją laikykite vienoje vietoje.",
    favoriteTitle: "Įsiminkite šį daiktą programėlėje",
    favoriteBody: "Įsiminti daiktai saugomi jūsų Naudokis paskyroje.",
    shareTitle: "Atidarykite šį daiktą programėlėje",
    shareBody: "Atsisiųskite Naudokis ir atidarykite šį pasiūlymą telefone.",
  },
  invite: {
    meta: {
      title: "Jus pakvietė į Naudokis — atsisiųskite programėlę",
      description:
        "Jus pakvietė išbandyti Naudokis — daiktų nuomą iš patikimų žmonių šalia. Atsisiųskite programėlę ir pradėkite.",
    },
    eyebrow: "Pakvietimas",
    titleValid: (amount) => `Jus pakvietė į Naudokis! Gaukite ${amount} pirmai nuomai.`,
    titleUnknown: "Jus pakvietė į Naudokis.",
    titleGeneric: "Atsisiųskite Naudokis programėlę.",
    lead: "Naudokis — daiktų nuoma iš patikimų žmonių šalia. Atsisiųskite programėlę, kad pradėtumėte.",
    rewardExplainer:
      "Premija įskaitoma jūsų paskyroje, kai programėlėje patvirtinsite tapatybę. Jus pakvietęs draugas premiją gauna po jūsų pirmos užbaigtos nuomos.",
    ctaInstall: "Atsisiųsti programėlę",
    qrHint: "Nuskenuokite telefonu",
    codeLabel: "Jūsų pakvietimo kodas",
  },
  cityPicker: {
    heading: "Pasirinkite miestą",
    all: "Visi miestai",
  },
  errors: {
    notFoundTitle: "Šio puslapio neradome",
    notFoundBody:
      "Adresas gali būti neteisingas arba puslapis perkeltas. Grįžkite į pradžią arba toliau naršykite nuomos pasiūlymus.",
    notFoundAction: "Į pradžią",
    errorTitle: "Nepavyko parodyti puslapio",
    errorBody:
      "Pabandykite dar kartą. Jei problema kartosis, grįžkite šiek tiek vėliau.",
    errorAction: "Bandyti dar kartą",
  },
  legal: {
    brandSub: "Teisinės informacijos centras",
    inThisDoc: "Šiame dokumente",
    contents: "Turinys",
    backTop: "Į viršų",
    openMenu: "Skyriai",
    readingProgress: "Skaitymo eiga",
    effective: "Įsigalioja",
    updated: "Atnaujinta",
    onlyLt:
      "Šis dokumentas šiuo metu skelbiamas tik lietuvių kalba. Rodomas lietuviškas tekstas.",
    briefLabel: "Trumpai",
    anchorLabel: "Nuoroda į šį skyrių",
    relatedHeading: "Susiję dokumentai",
    docTermsTitle: "Naudojimosi sąlygos",
    docPrivacyTitle: "Privatumo politika",
    questionsTitle: "Turite klausimų dėl šio dokumento?",
    questionsBody:
      "Jei turite klausimų apie šį dokumentą, susisiekite su mumis el. paštu.",
    contactCta: "Parašykite mums",
    metaDescriptionFallback:
      "Perskaitykite šį „Naudokis“ teisinį dokumentą kartu su Naudojimosi sąlygomis ir Privatumo politika.",
  },
};
