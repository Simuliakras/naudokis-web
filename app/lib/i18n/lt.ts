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
    title: "Daiktų nuoma Lietuvoje iš žmonių ir verslų | Naudokis.lt",
    description:
      "Nuomokitės įrankius, transportą, foto techniką ir kitus daiktus iš privačių ar verslo savininkų. Palyginkite internete, rezervuokite programėlėje.",
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
    badge: "Daiktų nuoma iš žmonių ir verslų visoje Lietuvoje",
    title: "Raskite reikalingą daiktą nuomai netoliese.",
    body: "Nuomokitės įrankius, transportą, foto techniką, elektroniką ir laisvalaikio įrangą tik tada, kai jų reikia. Pasiūlymus naršykite internete, o datas, žinutes, galutinę kainą ir mokėjimą valdykite Naudokis programėlėje.",
    ownerPrompt: "Turite nenaudojamų daiktų ar nuomos verslą?",
    ownerCta: "Skelbti daiktą ir uždirbti",
    phoneAlt: "Naudokis programėlėje rodomi daiktų nuomos pasiūlymai",
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
      `Naršykite ${name.toLowerCase()} nuomos pasiūlymus visoje Lietuvoje. Palyginkite kainas, vietą, savininko profilį ir rezervuokite programėlėje.`,
    metaTitleFallback: (name) => `${name} nuoma Lietuvoje | Naudokis.lt`,
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
      title: "Daugiau informacijos prieš rezervuojant",
      body: "Profilio patvirtinimo žymos, ankstesnių nuomų atsiliepimai ir aiškios sąlygos padeda pasirinkti.",
    },
    {
      icon: "ShieldCheck",
      title: "Mokėjimai per Stripe",
      body: "Galutinė nuomos kaina, Platformos mokesčiai ir grąžinamas užstatas parodomi prieš patvirtinant mokėjimą.",
    },
    {
      icon: "MapPin",
      title: "Aiškios taisyklės ir pagalba",
      body: "Rezervacijos, perdavimo, atšaukimo, žalos ir ginčų taisyklės vienoje vietoje abiem nuomos pusėms.",
    },
  ],
  howItWorks: {
    meta: {
      title: "Kaip veikia daiktų nuoma ir skelbimas | Naudokis.lt",
      description:
        "Sužinokite, kaip per Naudokis išsinuomoti arba išnuomoti daiktą: paieška, rezervacija, mokėjimas, perdavimas, grąžinimas ir išmoka.",
    },
    eyebrow: "Kaip tai veikia",
    title: "Nuomokitės tai, ko reikia. Uždirbkite iš to, ką turite.",
    lead: "Naudokis sujungia žmones ir verslus, kuriems daikto reikia trumpam, su privačiais ar verslo savininkais, pasirengusiais jį išnuomoti. Pasirinkite vaidmenį ir peržiūrėkite visą kelią.",
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
          body: "Naršykite pasiūlymus ir filtruokite pagal miestą, kategoriją ar kainą. Pasiūlymų paieška ir peržiūra nemokama.",
        },
        {
          icon: "Calendar",
          title: "Rezervuokite saugiai programėlėje",
          tag: "Apsaugota",
          tone: "green",
          screen: "reserve",
          body: "Pasirinkite datas, peržiūrėkite galutinę kainą bei užstatą ir mokėkite programėlėje per Stripe.",
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
          body: "Užbaigus nuomą ir įvykdžius išmokos sąlygas, išmoka pervedama jums. Taikomi Platformos mokesčiai parodomi iš anksto.",
        },
      ],
    },
    trustEyebrow: "Pasitikėjimas iš abiejų pusių",
    trustTitle: "Aiškesnė nuoma privatiems ir verslo naudotojams",
    trust: [
      {
        icon: "Snowflake",
        title: "Mokėjimai per Stripe",
        body: "Mokėjimo suma, Platformos mokesčiai ir grąžinamas užstatas parodomi prieš patvirtinant.",
      },
      {
        icon: "Users",
        title: "Profiliai, patvirtinimai ir atsiliepimai",
        body: "Rodomi profilio signalai ir ankstesnių nuomų atsiliepimai padeda abiem pusėms apsispręsti prieš susitikimą.",
      },
      {
        icon: "ShieldCheck",
        title: "Užstatai ir pagalba",
        body: "Aiškios užstato, žalos ir įrodymų taisyklės bei pagalba ginčo atveju padeda abiem pusėms.",
      },
    ],
    faqEyebrow: "Dar klausimų?",
    faqTitle: "Dažniausi klausimai",
    faq: [
      {
        q: "Ar naršymas nemokamas?",
        a: "Taip. Ieškoti ir peržiūrėti nuomos pasiūlymus svetainėje nemokama. Visi konkrečiai rezervacijai taikomi mokesčiai ir užstatas parodomi programėlėje prieš patvirtinant.",
      },
      {
        q: "Kaip apsaugomi mokėjimai?",
        a: "Mokėjimai programėlėje apdorojami per Stripe. Prieš patvirtinant rodoma nuomos kaina, taikomi mokesčiai ir grąžinamas užstatas; išmokoms taikomos Naudojimosi sąlygose nurodytos sąlygos.",
      },
      {
        q: "Kas atsako už galimą žalą daiktui?",
        a: "Prieš nuomą gali būti taikomas grąžinamas užstatas, tačiau jis nėra draudimas ar atsakomybės riba. Kilus nesutarimui, abi pusės pateikia įrodymus, o Naudokis administruoja Platformos ginčo procesą.",
      },
      {
        q: "Kodėl rezervuoti reikia programėlėje?",
        a: "Programėlėje pasirenkamos datos, rodomos galutinės sumos, tvarkomi mokėjimai, žinutės, rezervacijos ir pranešimai. Svetainėje galite patogiai naršyti ir palyginti pasiūlymus.",
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
    title: "Raskite internete. Rezervuokite programėlėje.",
    body: "Pasirinkite datas, peržiūrėkite galutinę kainą ir užstatą, susirašykite su savininku, mokėkite per Stripe ir valdykite nuomą vienoje vietoje.",
    phoneAlt: "Naudokis programėlės rezervacijos ekranas",
  },
  faq: {
    heading: "Dažniausiai užduodami klausimai",
    subheading:
      "Trumpi atsakymai apie kainas, rezervacijas, užstatus, mokėjimus ir nuomą programėlėje.",
    items: [
      {
        q: "Ar naršymas nemokamas?",
        a: "Taip. Ieškoti ir peržiūrėti nuomos pasiūlymus svetainėje nemokama. Konkrečiai rezervacijai taikomi mokesčiai ir užstatas parodomi programėlėje prieš patvirtinant.",
      },
      {
        q: "Kaip apsaugomi mokėjimai?",
        a: "Mokėjimai apdorojami per Stripe. Prieš patvirtinant rodoma nuomos kaina, taikomi Platformos mokesčiai ir grąžinamas užstatas; išmokoms taikomos Naudojimosi sąlygose nurodytos sąlygos.",
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
        q: "Ar daiktus gali siūlyti privatūs žmonės ir verslai?",
        a: "Taip. Daiktus gali siūlyti privatūs ir verslo savininkai. Kai savininkas veikia kaip verslas, jo statusas turi būti nurodytas profilyje ar rezervacijos eigoje, o vartotojams taikomos privalomos teisės.",
      },
      {
        q: "Kodėl rezervacijos vyksta programėlėje?",
        a: "Programėlėje vienoje vietoje laikomos datos, žinutės, mokėjimai, užstatai, pranešimai ir atsiliepimai.",
      },
    ],
  },
  footer: {
    tagline: "Daiktų nuoma iš privačių ir verslo savininkų visoje Lietuvoje.",
    browseHeading: "Kategorijos",
    allCategories: "Visos kategorijos",
    categories: [
      { label: "Transporto priemonės", categoryId: "transport" },
      { label: "Foto ir vaizdo technika", categoryId: "photo_video" },
      { label: "Įrankiai ir statyba", categoryId: "tools_construction" },
      { label: "Laisvalaikis ir sportas", categoryId: "sports_leisure" },
      { label: "Namai ir sodas", categoryId: "home_garden" },
      { label: "Elektronika", categoryId: "electronics_tech" },
      { label: "Garsas ir renginiai", categoryId: "audio_music_events" },
      { label: "Renginiai ir šventės", categoryId: "events_parties" },
      { label: "Drabužiai ir aksesuarai", categoryId: "clothing_accessories" },
      { label: "Vaikams", categoryId: "kids" },
    ],
    helpHeading: "Pagalba ir taisyklės",
    help: [
      { label: "Kaip tai veikia", href: "/kaip-tai-veikia" },
      { label: "Privatumo politika", href: "/privatumo-politika" },
      { label: "Naudojimosi sąlygos", href: "/naudojimosi-salygos" },
      { label: "Paskyros ištrynimas", href: "/paskyros-trynimas" },
    ],
    copyright: "© 2026 Naudokis.lt. Visos teisės saugomos.",
    secure: "Mokėjimai per Stripe",
    socialLabel: "Socialiniai tinklai",
  },
  detail: {
    metaFallbackTitle: "Daikto nuoma — Naudokis.lt",
    metaFallbackTitleForId: (readableId) => `${readableId} nuoma — Naudokis.lt`,
    metaFallbackDescription:
      "Peržiūrėkite daikto nuomos kainą, vietą ir sąlygas Naudokis.lt, o datas bei galutinę rezervacijos sumą patvirtinkite programėlėje.",
    seoTitle: ({ title, city }) =>
      `${title} nuoma${city ? ` ${cityLocativeLt(city)}` : ""} — Naudokis.lt`,
    seoDescription: ({ title, city, category }) => {
      const location = city ? ` ${cityLocativeLt(city)}` : " Lietuvoje";
      const categoryText = category ? ` (${category.toLowerCase()})` : "";
      return `Išsinuomokite ${title}${categoryText}${location} per Naudokis.lt. Peržiūrėkite paros kainą, savininko profilį ir perdavimo būdus, o datas bei galutinę sumą patvirtinkite programėlėje.`;
    },
    share: "Dalintis",
    shareCopied: "Nuoroda nukopijuota",
    verifiedOwnerPill: "Patvirtintas profilis",
    galleryMore: (n) => `+${n} nuotraukų`,
    descHeading: "Aprašymas",
    specsHeading: "Specifikacijos",
    ownerHeading: "Daikto savininkas",
    ownerVerified: "Patvirtintas profilis",
    ownerNewMember: "Profilis nepatvirtintas",
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
    reviewsHeading: "Atsiliepimai",
    similarHeading: "Panašūs daiktai",
    reviewsEmptyTitle: "Šis daiktas dar neturi atsiliepimų",
    reviewsEmptyBody: "Išsinuomokite pirmi ir padėkite kitiems apsispręsti.",
    reviewsInApp: (n) => `Visi ${n} atsiliepimai programėlėje`,
    perDay: "/ para",
    depositReturnable: "Užstatas (grąžinamas)",
    reserve: "Rezervuoti programėlėje",
    reserveMobile: "Atidaryti programėlę",
    appOnlyNote:
      "Pasirinkite datas, susirašykite su savininku, patvirtinkite užstatą ir saugiai sumokėkite programėlėje.",
    escrowNote: "Mokėjimus ir grąžinimus administruoja Naudokis per Stripe pagal taisykles",
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
    perDayShort: "/ para",
    dateFrom: "Nuo",
    dateTo: "Iki",
    dateInApp: "Pasirinksite programėlėje",
    chooseDates: "Pasirinkti datas",
    pricePerDayLine: "Nuomos kaina už parą",
    serviceFee: "Platformos mokesčiai",
    serviceFeeHint:
      "Konkrečiai rezervacijai taikomi mokesčiai, pristatymo kaina ir grąžinamas užstatas parodomi programėlėje prieš patvirtinant.",
    serviceFeeFree: "Rodoma programėlėje",
    inAppValue: "Apskaičiuojama programėlėje",
    totalToday: "Galutinė suma",
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
    hostVerifiedNote: "Naudokis patvirtino dalį šio profilio duomenų",
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
    mobileBookingNote: "Datos ir galutinė suma programėlėje",
  },
  common: {
    favorite: "Įsiminti",
    perDay: "/ para",
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
    metaTitle: "Daiktų nuomos kategorijos Lietuvoje | Naudokis.lt",
    metaDescription:
      "Naršykite daiktų nuomos kategorijas Naudokis.lt — įrankius, transportą, foto techniką, elektroniką, namų ir laisvalaikio įrangą.",
    crumb: "Kategorijos",
    eyebrow: "Naršykite",
    title: "Visos nuomos kategorijos",
    body: "Pasirinkite kategoriją, atraskite daiktus šalia, palyginkite kainas ir rezervaciją užbaikite programėlėje.",
    searchPlaceholder: "Ieškoti kategorijos",
    searchLabel: "Ieškoti daiktų nuomos kategorijų",
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
    searchPlaceholder: "Ko norite išsinuomoti?",
    searchLabel: "Ieškoti nuomojamų daiktų",
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
      "Naudokis.lt jungia žmones ir verslus, kuriems daikto reikia trumpam, su privačiais ir verslo savininkais visoje Lietuvoje. Naršykite pagal kategoriją, miestą ar kainą, o datas, žinutes, galutinę sumą ir mokėjimą valdykite programėlėje.",
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
      "Pasirinkite datas, rašykite savininkams, peržiūrėkite galutinę sumą ir mokėkite per Stripe vienoje vietoje.",
    interruptCta: "Atsisiųsti programėlę",
  },
  offline: {
    title: "Nėra interneto ryšio",
    body: "Prisijunkite prie interneto, kad galėtumėte įkelti nuomos pasiūlymus ir tęsti naršymą.",
    retry: "Bandyti dar kartą",
  },
  bridge: {
    defaultTitle: "Atsisiųskite Naudokis ir tęskite programėlėje",
    defaultBody:
      "Programėlėje pasirinksite datas, matysite galutinę kainą ir užstatą, susirašysite, mokėsite per Stripe ir valdysite rezervaciją.",
    qrHint: "Nuskenuokite QR kodą telefonu ir atidarykite Naudokis.",
    installCta: "Atsisiųsti programėlę",
    close: "Uždaryti",
    opensAppHint: "Atsidarys programėlėje",
    googlePlayAlt: "Gaukite „Google Play“ parduotuvėje",
    appStoreAlt: "Atsisiųskite iš „App Store“",
    reserveTitle: "Rezervuokite programėlėje",
    reserveBody:
      "Pasirinkite datas, peržiūrėkite galutinę kainą, taikomus mokesčius bei užstatą ir patvirtinkite rezervaciją programėlėje.",
    datesTitle: "Pasirinkite datas programėlėje",
    datesBody: "Laisvos datos ir galutinė kaina rodomos Naudokis programėlėje.",
    contactTitle: "Rašykite savininkui programėlėje",
    contactBody:
      "Nuomos žinutes ir rezervacijos informaciją laikykite vienoje vietoje.",
    favoriteTitle: "Įsiminkite šį daiktą programėlėje",
    favoriteBody: "Įsiminti daiktai saugomi jūsų Naudokis paskyroje.",
    shareTitle: "Atidarykite šį daiktą programėlėje",
    shareBody: "Atsisiųskite Naudokis ir atidarykite šį pasiūlymą telefone.",
    listTitle: "Paskelbkite daiktą programėlėje",
    listBody: "Įkelkite nuotraukas, aprašykite daiktą, nustatykite kainą bei užstatą ir valdykite užklausas vienoje vietoje.",
  },
  invite: {
    meta: {
      title: "Jus pakvietė į Naudokis — atsisiųskite programėlę",
      description:
        "Jus pakvietė išbandyti Naudokis — daiktų nuomą iš patikimų žmonių šalia. Atsisiųskite programėlę ir pradėkite.",
    },
    eyebrow: "Pakvietimas",
    titleValid: (amount) =>
      `Jus pakvietė į Naudokis! Gaukite ${amount} pirmai nuomai.`,
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
    closeContents: "Uždaryti turinį",
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
