// Lithuanian dictionary — launch-ready user-facing copy for the localized site.
import { cityLocativeLt } from "../cities";
import type { Dict } from "./types";

// "N dienų" in the nominative — 1 diena · 2–9 dienos · 10–20 dienų · 21 diena · 30 dienų.
// The same plural dance resultCount/reviewCount/filtersApply each do inline; hoisted
// here because the date picker needs it from four different keys.
//
// Every sentence built on this must keep the count in the NOMINATIVE ("Trumpiausia
// nuoma — 3 dienos"), never in a construction that would govern the genitive, or it
// would need a second set of forms.
const ltDays = (n: number): string => {
  const d = n % 10;
  const dd = n % 100;
  const word =
    (dd >= 11 && dd <= 19) || d === 0 ? "dienų" : d === 1 ? "diena" : "dienos";
  return `${n} ${word}`;
};

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

// One-line tile examples (Categories v2) — approved copy from the 2026-07
// design handoff, keyed by top-level category id.
const LT_CATEGORY_EXAMPLES: Record<string, string> = {
  transport: "Automobiliai, priekabos, paspirtukai",
  photo_video: "Fotoaparatai, objektyvai, dronai",
  tools_construction: "Gręžtuvai, pjūklai, perforatoriai",
  sports_leisure: "Dviračiai, irklentės, slidės",
  home_garden: "Vejapjovės, plovyklos, sodo technika",
  electronics_tech: "Projektoriai, konsolės, kompiuteriai",
  audio_music_events: "Kolonėlės, mikrofonai, apšvietimas",
  events_parties: "Palapinės, stalai, dekoracijos",
  clothing_accessories: "Suknelės, kostiumai, aksesuarai",
  kids: "Vežimėliai, kėdutės, žaislai",
  health_medical: "Ramentai, vežimėliai, masažuokliai",
  other: "Viskas, kas netelpa kitur",
};

export const lt: Dict = {
  meta: {
    title: "Daiktų nuoma Lietuvoje | Naudokis.lt",
    description:
      "Raskite daiktus nuomai iš privačių ar verslo savininkų Lietuvoje. Palyginkite pasiūlymus internete ir tęskite rezervacijos užklausą programėlėje.",
    ogLocale: "lt_LT",
    ogImageAlt: "Naudokis.lt",
  },
  nav: {
    search: "Paieška",
    category: "Kategorijos",
    listings: "Nuomojami daiktai",
    howItWorks: "Kaip tai veikia",
    getApp: "Atsisiųsti programėlę",
    getAppShort: "Programėlė",
    language: "Kalba",
    languageNames: { lt: "Lietuvių", en: "English" },
    primary: "Pagrindinė navigacija",
    openMenu: "Atidaryti meniu",
    closeMenu: "Uždaryti meniu",
  },
  hero: {
    badge: "Nuoma iš patvirtintų naudotojų",
    title: "Aiškesnė daiktų nuoma nuo paieškos iki grąžinimo.",
    body: "Raskite daiktą iš privačių ar verslo savininkų. Svetainėje palyginkite pasiūlymus, o programėlėje matykite visą rezervacijos sumą, pateikite užklausą ir fiksuokite perdavimą bei grąžinimą.",
    ownerPrompt: "Turite nenaudojamą daiktą?",
    ownerCta: "Paskelbti programėlėje",
    phoneAlt: "Naudokis programėlėje rodomi daiktų nuomos pasiūlymai",
  },
  search: {
    // Short enough to never clip at the 320px floor; inputLabel keeps the full name.
    placeholder: "Ką norite išsinuomoti?",
    inputLabel: "Ieškoti daiktų nuomai",
    where: "Kur?",
    labelWhat: "Daiktas",
    labelWhere: "Miestas",
    submit: "Ieškoti",
  },
  categories: {
    eyebrow: "Naršykite",
    title: "Nuomos kategorijos",
    all: "Visos kategorijos",
    examples: (id) => LT_CATEGORY_EXAMPLES[id],
    // Use the genitive category label (already inflected) so the copy reads as
    // correct Lithuanian — interpolating the nominative name produces broken
    // grammar ("Naršykite įrankiai ir statyba nuomos…"). Falls back to the plain
    // name only for an unknown id.
    seoFallbackBody: (name, id) => {
      const label = (id && LT_CATEGORY_SEO_LABELS[id]) || name;
      return `Naršykite ${label.toLowerCase()} nuomos pasiūlymus visoje Lietuvoje. Palyginkite kainas, vietą bei savininko profilį ir tęskite rezervacijos užklausą programėlėje.`;
    },
    metaTitleFallback: (name, id) => {
      const label = (id && LT_CATEGORY_SEO_LABELS[id]) || name;
      return `${label} nuoma Lietuvoje | Naudokis.lt`;
    },
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
    bandEmptyAppCta: "Atidaryti programėlėje",
    bandEmptyRetry: "Atnaujinti",
  },
  offers: {
    // FINAL: recency framing — "picked for you"/"popular"/
    // "nearby" had no personalization, review or geo signal behind them.
    eyebrow: "Naršykite",
    title: "Daiktai nuomai",
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
      "Pasiūlymų čia dar nėra. Peržiūrėkite kategorijas arba užsukite vėliau.",
    bandEmptyAction: "Visos kategorijos",
    bandEmptySecondary: "Atidaryti programėlėje",
  },
  features: [
    {
      icon: "Users",
      title: "Patikima bendruomenė",
      body: "Tiek nuomininkų, tiek savininkų tapatybė patvirtinama, kad nuoma prasidėtų su daugiau pasitikėjimo.",
    },
    {
      icon: "ShieldCheck",
      title: "Jokių netikėtų mokesčių",
      body: "Visa suma parodoma prieš apmokėjimą: nuoma, platformos mokestis ir užstatas — be papildomų susitarimų žinutėse.",
    },
    {
      icon: "ScrollText",
      title: "Pagalba, kai kyla neaiškumų",
      body: "Jei nuomos metu kyla klausimų ar nesusipratimų, Naudokis komanda padeda suprasti situaciją ir rasti aiškų kitą žingsnį.",
    },
  ],
  // FINAL: section header for the trust band.
  featuresHead: {
    eyebrow: "Kodėl Naudokis",
    title: "Nuoma, kuri nesijaučia rizikinga",
  },
  howItWorks: {
    meta: {
      title: "Kaip veikia daiktų nuoma ir paskelbimas | Naudokis.lt",
      description:
        "Sužinokite, kaip per Naudokis pateikti arba priimti rezervacijos užklausą, užfiksuoti perdavimą bei grąžinimą ir užbaigti nuomą.",
    },
    eyebrow: "Kaip tai veikia",
    title: "Nuomokitės tai, ko reikia. Uždirbkite iš to, ką turite.",
    lead: "„Naudokis“ suteikia prekyvietę ir nuomos proceso įrankius, o sandorį tiesiogiai sudaro nuomininkas ir privatus arba verslo savininkas. Pasirinkite vaidmenį ir peržiūrėkite visą kelią.",
    renter: {
      label: "Nuomininkas",
      lead: "Nuo paieškos iki grąžinimo — taip išsinuomosite daiktą dienai, savaitgaliui ar projektui.",
      ctaTitle: "Tęskite rezervacijos užklausą programėlėje",
      ctaBody:
        "Pasirinkite datas ir perdavimo būdą, peržiūrėkite visą sumą bei patvirtinkite mokėjimo autorizaciją. Tada užklausa bus išsiųsta savininkui.",
      steps: [
        {
          icon: "Search",
          title: "Raskite ir palyginkite",
          tag: "Paieška",
          tone: "yellow",
          screen: "search",
          body: "Peržiūrėkite aprašymą, būklę, vietą, perdavimo būdus, savininko statusą, atliktas patikras ir užbaigtų rezervacijų atsiliepimus.",
        },
        {
          icon: "Calendar",
          title: "Peržiūrėkite sumą ir pateikite užklausą",
          tag: "Užklausa",
          tone: "green",
          screen: "reserve",
          body: "Pasirinkite datas bei perdavimo būdą ir patikrinkite kainą, mokesčius, užstatą, atšaukimo sąlygas bei bendrą sumą. Stripe autorizuoja mokėjimą, o savininkas priima arba atmeta užklausą.",
        },
        {
          icon: "Handshake",
          title: "Perimkite daiktą su būklės įrašu",
          tag: "Perdavimas",
          tone: "yellow",
          screen: "pickup",
          body: "Susitikę ar gavę pristatymą patikrinkite daikto būklę ir priedus. Nuotraukas bei pastabas išsaugokite programėlėje.",
        },
        {
          icon: "Star",
          title: "Grąžinkite, užbaikite ir įvertinkite",
          tag: "Užbaigimas",
          tone: "purple",
          screen: "review",
          body: "Grąžindami dar kartą užfiksuokite būklę. Užbaigtos rezervacijos dalyviai gali palikti atsiliepimą.",
        },
      ],
    },
    owner: {
      label: "Savininkas",
      lead: "Nuo skelbimo iki išmokos — taip nenaudojamus daiktus paversite pajamomis.",
      ctaTitle: "Paskelbkite daiktą programėlėje",
      ctaBody:
        "Programėlėje įkelsite daiktą, valdysite užklausas, susirašysite su nuomininkais ir gausite išmokas vienoje vietoje.",
      steps: [
        {
          icon: "Camera",
          title: "Paskelbkite tikslias sąlygas",
          tag: "Skelbimas",
          tone: "yellow",
          screen: "list",
          body: "Įkelkite tikras nuotraukas, aprašykite būklę ir priedus, nustatykite kainą, užstatą, pristatymo bei atšaukimo sąlygas.",
        },
        {
          icon: "BadgeCheck",
          title: "Priimkite arba atmeskite užklausą",
          tag: "Sprendimas",
          tone: "green",
          screen: "accept",
          body: "Peržiūrėkite nuomininko profilį, datas ir sumas, tada iki rodomo termino nuspręskite, ar priimti užklausą.",
        },
        {
          icon: "Handshake",
          title: "Užfiksuokite perdavimą ir grąžinimą",
          tag: "Būklė",
          tone: "yellow",
          screen: "handover",
          body: "Abiem etapais išsaugokite daikto būklės, nuotraukų, pastabų ir perduodamų priedų įrašą.",
        },
        {
          icon: "Coins",
          title: "Užbaikite nuomą ir gaukite išmoką",
          tag: "Išmoka",
          tone: "purple",
          screen: "payout",
          body: "Įvykdžius užbaigimo ir išmokos sąlygas, inicijuojama išmoka. Jei kilo problema, per programėlėje rodomą terminą pateikite reikalavimą ir įrodymus.",
        },
      ],
    },
    trustEyebrow: "Pasitikėjimas iš abiejų pusių",
    trustTitle: "Aiškesnė nuoma privatiems ir verslo naudotojams",
    trust: [
      {
        icon: "CreditCard",
        title: "Mokėjimai per Stripe",
        body: "Mokėjimo suma, platformos mokesčiai ir grąžinamas užstatas parodomi prieš patvirtinant.",
      },
      {
        icon: "Users",
        title: "Profiliai, patvirtinimai ir atsiliepimai",
        body: "Atsiliepimus gali palikti tik per Naudokis užbaigtos rezervacijos dalyviai. Profilyje taip pat matomos atliktos patikros.",
      },
      {
        icon: "ShieldCheck",
        title: "Užstatai ir pagalba",
        body: "Aiškios užstato, žalos ir įrodymų taisyklės bei pagalba ginčo atveju padeda abiem pusėms.",
      },
    ],
    browseCta: "Naršyti daiktus",
    listCta: "Įkelti skelbimą",
    faqEyebrow: "Turite klausimų?",
    faqTitle: "Dažniausi klausimai",
    faqSubheading:
      "Trumpi atsakymai apie rezervacijas, mokėjimus, užstatus ir nuomą programėlėje.",
    faq: [
      {
        q: "Ar naršymas nemokamas?",
        a: "Taip. Ieškoti ir peržiūrėti nuomos pasiūlymus svetainėje nemokama. Konkrečios rezervacijos mokesčiai, užstatas, atšaukimo sąlygos ir bendra suma parodomi prieš pateikiant užklausą.",
      },
      {
        q: "Kaip tvarkomi mokėjimai?",
        a: "Mokėjimus apdoroja Stripe. Pateikiant užklausą mokėjimas autorizuojamas; rezervacija tampa galutinė savininkui ją priėmus ir mokėjimui sėkmingai įvykus.",
      },
      {
        q: "Kas atsako už galimą žalą daiktui?",
        a: "Prieš nuomą gali būti taikomas grąžinamas užstatas, tačiau jis nėra draudimas ar atsakomybės riba. Kilus nesutarimui, abi pusės pateikia įrodymus, o Naudokis administruoja platformos ginčo procesą.",
      },
      {
        q: "Kodėl rezervacijos užklausa teikiama programėlėje?",
        a: "Programėlėje pasirenkamos datos, rodoma visa suma, autorizuojamas mokėjimas, pateikiama užklausa, saugomos žinutės, būklės įrašai ir pranešimai. Svetainėje galite naršyti ir palyginti pasiūlymus.",
      },
    ],
    // FINAL product copy: owner-side FAQ — payouts, fees, damage,
    // requests. Only already-claimed facts (Stripe payouts, upfront fees, deposit
    // + dispute process per the Terms); no numbers invented.
    faqOwner: [
      {
        q: "Kada gaunu išmoką?",
        a: "Užbaigus nuomą ir įvykdžius išmokos sąlygas, išmoka pervedama per Stripe. Išmokoms taikoma Naudojimosi sąlygose nurodyta tvarka.",
      },
      {
        q: "Kiek kainuoja paskelbti daiktą?",
        a: "Daiktui paskelbti išankstinis mokestis netaikomas. Konkrečiai rezervacijai taikomi platformos mokesčiai parodomi prieš priimant užklausą.",
      },
      {
        q: "Kas, jei daiktas grąžinamas sugadintas?",
        a: "Padeda grąžinamas užstatas ir ginčų procesas: pateikiate įrodymus programėlėje, o Naudokis administruoja ginčą pagal taisykles.",
      },
      {
        q: "Ar privalau priimti kiekvieną užklausą?",
        a: "Ne. Peržiūrėkite nuomininko profilį, datas ir sumas, tada iki rodomo termino priimkite arba atmeskite užklausą.",
      },
    ],
    ctaEyebrow: "Programėlė",
    ctaPhoneAlt: "Naudokis programėlė",
    screen: {
      searchPlaceholder: "Ką norite išsinuomoti?",
      reserveCta: "Pateikti užklausą",
      // hold-state (mirrors EN "Held") — "Rezervuota" contradicted the Reserve
      // button right under it (completed state above the action that causes it)
      frozenPill: "Mokėjimas autorizuotas",
      pickupCta: "Susitikti su savininku",
      reviewCta: "Palikti atsiliepimą",
      listUpload: "Įkelkite nuotraukas",
      listPrice: "50 € / diena",
      listCta: "Skelbti",
      acceptCta: "Priimti užklausą",
      handoverCta: "Fiksuoti perdavimą",
      // multi-day amount (≠ 1× the mock's daily price) + explicit after-fees
      // qualifier, so the illustration can't read as a fee-free gross payout
      payoutAmount: "+ 120 €",
      payoutLabel: "Išmoka pervesta po mokesčių",
      completedPill: "Užbaigta",
    },
  },
  homeSteps: {
    eyebrow: "Kaip tai veikia",
    title: "Kaip vyksta nuoma",
    lead: "Keturi aiškūs etapai nuo paieškos ar skelbimo iki grąžinimo ir užbaigimo.",
    steps: [
      {
        kicker: "Pradžia",
        title: "Raskite arba paskelbkite",
        body: "Palyginkite pasiūlymus svetainėje arba paskelbkite savo daiktą programėlėje.",
      },
      {
        kicker: "Sprendimas",
        title: "Pateikite arba patvirtinkite užklausą",
        body: "Nuomininkas mato visą sumą ir pateikia užklausą, o savininkas ją priima arba atmeta.",
      },
      {
        kicker: "Įrašas",
        title: "Perduokite ir grąžinkite su įrašu",
        body: "Abiem etapais užfiksuokite daikto būklę, nuotraukas, pastabas ir priedus.",
      },
      {
        kicker: "Pabaiga",
        title: "Užbaikite nuomą",
        body: "Patvirtinkite grąžinimą, prireikus pateikite įrodymus, o po užbaigimo palikite atsiliepimą.",
      },
    ],
    ctaLabel: "Visas procesas",
  },
  cta: {
    eyebrow: "Programėlė",
    title: "Naršykite internete. Užklausą pateikite programėlėje.",
    body: "Programėlėje pasirinksite datas ir perdavimo būdą, peržiūrėsite visą sumą bei patvirtinsite mokėjimo autorizaciją. Užklausa bus išsiųsta savininkui; rezervacija taps galutinė tik ją priėmus ir mokėjimui sėkmingai įvykus. Žinutes, perdavimą ir grąžinimą valdysite vienoje vietoje.",
    phoneAlt: "Naudokis programėlės rezervacijos ekranas",
  },
  faq: {
    eyebrow: "Turite klausimų?",
    heading: "Ką verta žinoti prieš nuomojantis",
    subheading:
      "Trumpi atsakymai apie sandorį, rezervacijos būseną, patikras, užstatą ir atsakomybę.",
    items: [
      {
        q: "Kas sudaro nuomos sandorį?",
        a: "Nuomos sandorį tiesiogiai sudaro nuomininkas ir daiktą siūlantis privatus arba verslo savininkas. „Naudokis“ suteikia prekyvietę, mokėjimo ir nuomos proceso įrankius.",
      },
      {
        q: "Kada rezervacija tampa galutinė?",
        a: "Pirmiausia Stripe autorizuoja mokėjimą ir užklausa išsiunčiama savininkui. Rezervacija tampa galutinė tik savininkui ją priėmus ir mokėjimui sėkmingai įvykus.",
      },
      {
        q: "Ką galima išsinuomoti per Naudokis?",
        a: "Populiarios kategorijos apima įrankius, foto ir video techniką, transportą, elektroniką, buitinę techniką, renginių ir laisvalaikio įrangą.",
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
        q: "Kas nutinka sugadinus ar negrąžinus daikto?",
        a: "Padeda grąžinamas užstatas ir ginčų procesas: abi pusės gali pateikti įrodymus programėlėje, o Naudokis administruoja ginčą pagal taisykles.",
      },
      {
        q: "Ar daiktus gali siūlyti privatūs žmonės ir verslai?",
        a: "Taip. Daiktus gali siūlyti privatūs ir verslo savininkai. Kai savininkas veikia kaip verslas, jo statusas turi būti nurodytas profilyje ar rezervacijos eigoje, o vartotojams taikoma privaloma vartotojų teisių apsauga.",
      },
      {
        q: "Kodėl rezervacijos užklausa teikiama programėlėje?",
        a: "Programėlėje vienoje vietoje pasirenkamos datos, rodoma visa suma, autorizuojamas mokėjimas, saugomos žinutės, būklės įrašai ir pranešimai.",
      },
      {
        q: "Kada savininkas gauna išmoką?",
        a: "Išmoka inicijuojama užbaigus nuomą ir įvykdžius išmokos sąlygas. Faktinis pervedimo laikas priklauso nuo mokėjimo paslaugų teikėjo ir taikomų patikrų.",
      },
      {
        q: "Ar naršymas ir skelbimas mokami?",
        a: "Pasiūlymų paieškai ir peržiūrai svetainėje bei daikto paskelbimui išankstinis mokestis netaikomas. Konkrečios rezervacijos mokesčiai parodomi prieš pateikiant užklausą.",
      },
    ],
  },
  footer: {
    tagline: "Daiktų nuoma iš privačių ir verslo savininkų visoje Lietuvoje.",
    browseHeading: "Kategorijos",
    citiesHeading: "Miestai",
    cityLink: (city) => `Nuoma ${cityLocativeLt(city)}`,
    // Labels match the canonical backend/tile category names so the same
    // categoryId reads identically in the footer and the discovery grids.
    categories: [
      { label: "Transportas", categoryId: "transport" },
      { label: "Fotografija ir video", categoryId: "photo_video" },
      { label: "Įrankiai ir statyba", categoryId: "tools_construction" },
      { label: "Sportas ir laisvalaikis", categoryId: "sports_leisure" },
      { label: "Namai ir sodas", categoryId: "home_garden" },
      { label: "Elektronika ir technologijos", categoryId: "electronics_tech" },
      {
        label: "Garsas, muzika ir renginių technika",
        categoryId: "audio_music_events",
      },
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
    socialLabel: "Socialiniai tinklai",
  },
  detail: {
    metaFallbackTitle: "Daikto nuoma | Naudokis.lt",
    metaFallbackTitleForId: (readableId) =>
      `„${readableId}“ nuoma | Naudokis.lt`,
    metaFallbackDescription:
      "Peržiūrėkite daikto nuomos kainą, vietą ir sąlygas Naudokis.lt, o rezervacijos užklausą tęskite programėlėje.",
    // Quoted citation form: the raw nominative title stays indeclinable, so
    // "Elektrinis paspirtukas" can never render as broken "…paspirtukas nuoma".
    seoTitle: ({ title, city }) =>
      `„${title}“ nuoma${city ? ` ${cityLocativeLt(city)}` : ""} | Naudokis.lt`,
    seoDescription: ({ title, city, category }) => {
      const location = city ? ` ${cityLocativeLt(city)}` : " Lietuvoje";
      const categoryText = category ? ` (${category.toLowerCase()})` : "";
      return `„${title}“${categoryText} — išsinuomokite${location} per Naudokis.lt. Peržiūrėkite paros kainą, savininko profilį ir perdavimo būdus, o rezervacijos užklausą tęskite programėlėje.`;
    },
    share: "Dalintis",
    shareCopied: "Nuoroda nukopijuota",
    shareFailed: "Nepavyko bendrinti nuorodos. Bandykite dar kartą.",
    verifiedOwnerPill: "Tapatybė patvirtinta",
    galleryMore: (n) => {
      const d = n % 10;
      const dd = n % 100;
      if ((dd >= 11 && dd <= 19) || d === 0) return `+${n} nuotraukų`;
      if (d === 1) return `+${n} nuotrauka`;
      return `+${n} nuotraukos`;
    },
    descHeading: "Aprašymas",
    descOriginalNote: "Aprašymą savininkas pateikė originalo kalba.",
    descMore: "Rodyti daugiau",
    descLess: "Rodyti mažiau",
    specsHeading: "Specifikacijos",
    handoverHeading: "Daikto perdavimas",
    mapTitle: (city) => `${city} žemėlapyje`,
    mapLoad: "Rodyti „Google Maps“ žemėlapį",
    mapNotice:
      "Žemėlapis įkeliamas tik jums pasirinkus. Google gali gauti jūsų IP adresą ir įrenginio duomenis.",
    mapPrivacy: "Privatumo informacija",
    pickupLabel: "Atsiėmimas",
    pickupFree: "Nemokama",
    deliveryLabel: "Pristatymas",
    deliveryByArrangement: "Pagal susitarimą",
    deliveryRadius: (km) => `Iki ${km} km`,
    deliveryPerKm: (price) => `${price} / km`,
    termsHeading: "Nuomos sąlygos",
    reviewsHeading: "Atsiliepimai",
    similarHeading: "Panašūs daiktai",
    moreItemsHeading: "Daugiau daiktų nuomai",
    reviewsEmptyTitle: "Šis daiktas dar neturi atsiliepimų",
    reviewsEmptyBody:
      "Atsiliepimų dar nėra. Prieš pateikdami užklausą peržiūrėkite savininko profilį ir sąlygas.",
    reviewsInApp: (n) => `Visi atsiliepimai programėlėje (${n})`,
    perDay: "/ diena",
    reserve: "Pateikti rezervacijos užklausą",
    reserveMobile: "Pateikti užklausą",
    loadErrorTitle: "Nepavyko įkelti nuomos pasiūlymo",
    loadErrorBody: "Patikrinkite ryšį ir bandykite dar kartą.",
    goneTitle: "Šio skelbimo nebėra",
    goneBody:
      "Jis galėjo būti išnuomotas arba pašalintas. Peržiūrėkite kitus nuomos pasiūlymus.",
    backToListings: "Nuomojami daiktai",
    save: "Įsiminti",
    newListingPill: "Atsiliepimų dar nėra",
    noPhotos: "Nuotraukų nėra",
    galleryAll: (n) => `Visos ${n} nuotr.`,
    galleryExpand: "Padidinti nuotrauką",
    galleryViewLabel: "Nuotraukų galerija",
    galleryClose: "Uždaryti galeriją",
    galleryPrev: "Ankstesnė nuotrauka",
    galleryNext: "Kita nuotrauka",
    galleryImageError: "Nepavyko įkelti nuotraukos",
    perDayShort: "/ diena",
    confirmInApp:
      "Programėlėje pasirinksite datas ir perdavimo būdą, matysite mokesčius, užstatą, atšaukimo sąlygas ir bendrą sumą prieš pateikdami užklausą.",
    datesLabel: "Nuomos datos",
    datesFrom: "Nuo",
    datesTo: "Iki",
    datesPlaceholder: "Pasirinkite",
    datesTriggerLabel: "Pasirinkti nuomos datas",
    datesPanelTitle: "Nuomos datos",
    datesClose: "Uždaryti kalendorių",
    datesClear: "Išvalyti",
    datesApply: "Patvirtinti",
    calPrevMonth: "Ankstesnis mėnuo",
    calNextMonth: "Kitas mėnuo",
    calDays: ltDays,
    calLimits: (min, max) =>
      max > 0
        ? `Nuoma nuo ${ltDays(min)} iki ${ltDays(max)}`
        : `Trumpiausia nuoma — ${ltDays(min)}`,
    calBooked: "Užimta",
    calToday: "šiandien",
    calSelectStart: "Pasirinkite pradžios datą",
    calSelectEnd: "Pasirinkite pabaigos datą",
    calStartSelected: (date) => `Pradžia: ${date}. Pasirinkite pabaigos datą.`,
    calRangeSelected: ({ start, end, days }) =>
      `Pasirinkta ${start}–${end}, ${days}.`,
    calBlocked: (reason, n) => {
      if (reason === "past") {
        return "Data jau praėjo";
      }
      if (reason === "booked") {
        return "Užimta";
      }
      if (reason === "tooShort") {
        return `Trumpiausia nuoma — ${ltDays(n)}`;
      }
      if (reason === "tooLong") {
        return `Ilgiausia nuoma — ${ltDays(n)}`;
      }
      return "Tarp šių datų yra užimtų dienų";
    },
    calUnknownTitle: "Nepavyko patikrinti užimtumo",
    calUnknownBody:
      "Nematome, kurios dienos užimtos. Datas ir galutinę sumą patvirtinsite programėlėje.",
    calUnknownRetry: "Bandyti dar kartą",
    calUnknownNote: "Užimtumas nepatikrintas",
    calLoading: "Tikriname užimtumą…",
    estimateRental: (days) => `Nuoma (${days})`,
    estimateDiscount: (percent) => `Ilgesnės nuomos nuolaida −${percent}%`,
    estimateDeposit: "Užstatas (grąžinamas)",
    bookingDepositSuffix: "užstatas (grąžinamas po nuomos)",
    estimateFees:
      "Tai preliminari nuomos suma. Pristatymas, taikomi mokesčiai, užstatas, atšaukimo sąlygos ir galutinė suma bus parodyti programėlėje prieš pateikiant užklausą.",
    hostStatRating: "Įvertinimas",
    hostStatReviews: "Atsiliepimai",
    hostStatListings: "Daiktai",
    hostMessage: "Paklausti savininko",
    hostMemberSince: (label) => `Narys nuo ${label}`,
    hostResponseTime: (hours) =>
      hours <= 1
        ? "Atsako per valandą"
        : `Atsako per ~${Math.ceil(hours)} val.`,
    deliverySub: (city, opts) => {
      const where = city ? cityLocativeLt(city) : "savo mieste";
      if (opts.delivery && !opts.pickup)
        return `Susitarkite dėl pristatymo ${where}.`;
      if (!opts.delivery) return `Atsiimkite nemokamai ${where}.`;
      return `Atsiimkite nemokamai arba susitarkite dėl pristatymo ${where}.`;
    },
    deliveryZone: "≈20 km zona",
    deliveryZoneKm: (km) => `≈${km} km zona`,
    termRentSub: "Nuomos kaina",
    depositNone: "Be užstato",
    depositTitle: (amount) => `${amount}`,
    termDepositSub: "Užstatas (grąžinamas po tvarkingos nuomos)",
    durationRange: (min, max) =>
      !max || max <= min ? `Nuo ${min} d.` : `${min}–${max} dienų`,
    termDurationSub: "Nuomos trukmė",
    cancellationLabel: (tier) => {
      if (tier === "flexible") return "Lanksti atšaukimo politika";
      if (tier === "moderate") return "Vidutinė atšaukimo politika";
      if (tier === "strict") return "Griežta atšaukimo politika";
      return "Standartinė atšaukimo politika";
    },
    termCancelSub: "Rezervacijos atšaukimo sąlygos",
    discountsLabel: "Nuolaidos ilgesnei nuomai",
    discountFrom: (n) => `Nuo ${n} d.`,
    mobileBookingNote: "Galutinė suma — programėlėje",
  },
  common: {
    favorite: "Įsiminti",
    delivery: "Pristatymas",
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
    photoCount: (n) => {
      const d = n % 10;
      const dd = n % 100;
      const word =
        (dd >= 11 && dd <= 19) || d === 0
          ? "nuotraukų"
          : d === 1
            ? "nuotrauka"
            : "nuotraukos";
      return `${n} ${word}`;
    },
    depositAmount: (amount) => `${amount} užstatas`,
    ownerLabel: "Savininkas",
    imageUnavailable: "Nuotrauka nepasiekiama",
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
    body: "Pasirinkite kategoriją, palyginkite kainas, vietą ir savininkų profilius, o rezervacijos užklausą tęskite programėlėje.",
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
      // Bare count (no verb): the line renders on initial page load, where a
      // "found N" reads as a search result before any query was typed.
      return `${n} ${word}`;
    },
    searchItems: (query) => `Ieškoti „${query}“ tarp daiktų`,
    subcategoriesHeading: "Subkategorijos",
    seoHeading: "Daiktų nuoma pagal kategorijas",
    seoBody:
      "Naudokis.lt apima kasdienes nuomos kategorijas visoje Lietuvoje — nuo įrankių ir transporto iki foto technikos, elektronikos, buitinės technikos, renginių ir laisvalaikio įrangos. Pasirinkite kategoriją ir raskite daiktus netoliese be poreikio pirkti tai, ko reikia tik kartais.",
  },
  feed: {
    metaTitle: "Nuomojami daiktai Lietuvoje | Naudokis.lt",
    metaDescription:
      "Naršykite nuomojamus daiktus visoje Lietuvoje pagal kategoriją, miestą ir kainą. Palyginkite savininkų profilius ir tęskite rezervacijos užklausą programėlėje.",
    categorySeoLabel: (id, fallback) => LT_CATEGORY_SEO_LABELS[id] ?? fallback,
    landingTitle: ({ category, city }) => {
      const locative = city ? cityLocativeLt(city) : "";
      if (category && city)
        return `${category} nuoma ${locative} | Naudokis.lt`;
      if (category) return `${category} nuoma | Naudokis.lt`;
      if (city) return `Nuomojami daiktai ${locative} | Naudokis.lt`;
      return "Nuomojami daiktai | Naudokis.lt";
    },
    landingHeading: ({ category, city }) => {
      const locative = city ? cityLocativeLt(city) : "";
      if (category && city) return `${category} nuoma ${locative}`;
      if (category) return `${category} nuoma`;
      if (city) return `Nuomojami daiktai ${locative}`;
      return "Nuomojami daiktai";
    },
    landingDescription: ({ category, city }) => {
      const locative = city ? cityLocativeLt(city) : "";
      if (category && city) {
        return `Peržiūrėkite ${category.toLowerCase()} nuomos pasiūlymus ${locative}. Palyginkite kainas ir sąlygas, o rezervacijos užklausą tęskite programėlėje.`;
      }
      if (category) {
        return `Raskite ${category.toLowerCase()} nuomai visoje Lietuvoje. Filtruokite pasiūlymus pagal miestą ir kainą, tada tęskite rezervacijos užklausą programėlėje.`;
      }
      return `Naršykite daiktų nuomos pasiūlymus ${locative || "visoje Lietuvoje"}: įrankius, transportą, foto techniką, elektroniką ir laisvalaikio įrangą iš privačių ir verslo savininkų.`;
    },
    landingSeoHeading: ({ category, city }) => {
      const locative = city ? cityLocativeLt(city) : "";
      if (category && city) return `${category} nuoma ${locative}`;
      if (city) return `Daiktų nuoma ${locative}`;
      if (category) return `${category} nuoma Lietuvoje`;
      return "Daiktų nuoma Lietuvoje";
    },
    landingSeoBody: ({ category, city }) => {
      const where = city ? cityLocativeLt(city) : "visoje Lietuvoje";
      const what = category ? category.toLowerCase() : "daiktų";
      return `Naudokis.lt jungia žmones ir verslus, kuriems ${what} reikia trumpam, su privačiais ir verslo savininkais ${where}. Naršykite pagal kategoriją, miestą ar kainą, o datas, žinutes, galutinę sumą ir mokėjimą valdykite programėlėje.`;
    },
    crumbCategories: "Kategorijos",
    // FINAL: static eyebrow — never duplicates the dynamic H1s.
    eyebrow: "Nuoma visoje Lietuvoje",
    titleAll: "Nuomojami daiktai",
    titleSearch: "Paieškos rezultatai",
    subtitleAll:
      "Palyginkite kainas, vietą, perdavimo būdus ir savininkų profilius visoje Lietuvoje.",
    subtitleSearch: (q) => `Rezultatai pagal „${q}“ visoje Lietuvoje.`,
    subtitleSearchGeneric: "Paieškos rezultatai visoje Lietuvoje.",
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
    resultCountAtLeast: (n) => `${n}+ pasiūlymų`,
    loadMore: "Rodyti daugiau",
    loadingMore: "Įkeliama daugiau…",
    clear: "Išvalyti",
    searchPlaceholder: "Ką norite išsinuomoti?",
    searchLabel: "Ieškoti nuomojamų daiktų",
    sortLabel: "Rūšiuoti",
    sortNewest: "Naujausi pirmiausia",
    sortPriceAsc: "Mažiausia kaina",
    sortPriceDesc: "Didžiausia kaina",
    sortRatingBest: "Geriausiai įvertinti",
    categoryLabel: "Kategorija",
    allCategories: "Visos kategorijos",
    cityLabel: "Miestas",
    priceLabel: "Kaina",
    priceAny: "Bet kokia kaina",
    priceBand: (min, max) => {
      if (min === null) return `Iki ${max} €`;
      if (max === null) return `Nuo ${min} €`;
      return `${min}–${max} €`;
    },
    deliveryToggle: "Pristatymas galimas",
    filtersButton: "Filtrai",
    filtersTitle: "Filtrai",
    filtersApply: (n, atLeast) => {
      if (n === null) return "Rodyti rezultatus";
      const d = n % 10;
      const dd = n % 100;
      const word =
        (dd >= 11 && dd <= 19) || d === 0
          ? "pasiūlymų"
          : d === 1
            ? "pasiūlymą"
            : "pasiūlymus";
      return `Rodyti ${n}${atLeast ? "+" : ""} ${word}`;
    },
    introMore: "Rodyti daugiau",
    introLess: "Rodyti mažiau",
    relatedLinksLabel: "Populiarios paieškos",
    paginationLabel: "Nuomos pasiūlymų puslapiai",
    previousPage: "Ankstesnis puslapis",
    nextPage: "Kitas puslapis",
    pageStatus: (page, totalPages) => `${page} puslapis iš ${totalPages}`,
    pageStatusShort: (page) => `${page} puslapis`,
    pageEmptyTitle: "Tokio puslapio nebėra",
    pageEmptyBody:
      "Skelbimų sąrašas pasikeitė, todėl šis puslapis nebeegzistuoja. Grįžkite į sąrašo pradžią.",
    pageEmptyAction: "Į pirmą puslapį",
    backToTop: "Į viršų",
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
        `Pagal šiuos filtrus ${cityLocativeLt(city)} nuomos pasiūlymų neradome`,
      filterBody: (delivery) =>
        delivery
          ? "Pabandykite kitą miestą, platesnę kategoriją arba išjunkite pristatymą."
          : "Pabandykite kitą miestą arba platesnę kategoriją.",
      filterAction: "Išvalyti filtrus",
      cityTitle: (city) =>
        `${cityLocativeLt(city)} kol kas nuomos pasiūlymų nėra`,
      cityBody:
        "Peržiūrėkite pasiūlymus kituose miestuose arba paskelbkite pirmąjį daiktą šiame mieste.",
      categoryTitle: "Šioje kategorijoje dar nėra nuomos pasiūlymų",
      categoryBody:
        "Peržiūrėkite kitas kategorijas arba būkite pirmi – paskelbkite daiktą šioje kategorijoje.",
      categoryActionPrimary: "Paskelbti daiktą",
      categoryActionSecondary: "Visos kategorijos",
    },
    interruptTitle: "Tęskite rezervacijos užklausą programėlėje",
    interruptBody:
      "Pasirinkite datas ir perdavimo būdą, peržiūrėkite visą sumą, autorizuokite mokėjimą ir pateikite užklausą savininkui.",
    interruptCta: "Atsisiųsti programėlę",
  },
  offline: {
    title: "Nėra interneto ryšio",
    body: "Prisijunkite prie interneto, kad galėtumėte įkelti nuomos pasiūlymus ir tęsti naršymą.",
    retry: "Bandyti dar kartą",
    timeoutTitle: "Serveris atsako per lėtai",
    timeoutBody:
      "Jūsų paieška ir filtrai išsaugoti. Patikrinkite ryšį ir bandykite dar kartą.",
    serverTitle: "Paslauga laikinai nepasiekiama",
    serverBody:
      "Jūsų paieška ir filtrai išsaugoti. Po akimirkos bandykite dar kartą.",
  },
  bridge: {
    defaultTitle: "Tęskite nuomos užklausą programėlėje",
    // FINAL: role-neutral — covers both marketplace sides.
    defaultBody:
      "Programėlėje pasirinksite datas ir perdavimo būdą, matysite visą sumą, autorizuosite mokėjimą ir pateiksite užklausą savininkui.",
    qrHint: "Nuskenuokite QR kodą telefonu ir atidarykite Naudokis.",
    qrTitle: "Nuskenuokite ir tęskite telefone",
    installCta: "Atsisiųsti programėlę",
    storesAlso: "Taip pat:",
    appOpenFallback:
      "Programėlė neatsidarė? Bandykite dar kartą arba pasirinkite programėlių parduotuvę.",
    retryOpen: "Bandyti atidaryti dar kartą",
    close: "Uždaryti",
    opensAppHint: "Atsidarys programėlėje",
    googlePlayAlt: "Gaukite „Google Play“ parduotuvėje",
    appStoreAlt: "Atsisiųskite iš „App Store“",
    reserveTitle: "Tęskite rezervacijos užklausą programėlėje",
    reserveBody:
      "Pasirinkite datas ir perdavimo būdą, peržiūrėkite visą sumą bei patvirtinkite mokėjimo autorizaciją. Užklausa bus išsiųsta savininkui. Rezervacija taps galutinė tik savininkui priėmus ir mokėjimui sėkmingai įvykus.",
    contactTitle: "Paklauskite savininko programėlėje",
    contactBody:
      "Žinutės, datos ir rezervacijos informacija lieka vienoje vietoje.",
    reviewsTitle: "Skaitykite visus atsiliepimus programėlėje",
    reviewsBody:
      "Visi patikrintų nuomų atsiliepimai matomi Naudokis programėlėje.",
    favoriteTitle: "Įsiminkite šį daiktą programėlėje",
    favoriteBody: "Įsiminti daiktai laikomi jūsų Naudokis paskyroje.",
    shareTitle: "Atidarykite šį daiktą programėlėje",
    shareBody: "Atsisiųskite Naudokis ir atidarykite šį pasiūlymą telefone.",
    listTitle: "Paskelbkite daiktą nuomai",
    listBody:
      "Įkelkite nuotraukas, aprašykite būklę ir komplektaciją, nustatykite kainą bei užstatą. Užklausas tvirtinate jūs.",
  },
  // FINAL: attribution-consent copy. Names AppsFlyer outright, says plainly that it
  // is optional, and gives both actions the same weight — the refusal must not read
  // as the lesser choice.
  consent: {
    title: "Leisti diegimo ir kampanijų matavimą?",
    body: "Jei sutiksite, „AppsFlyer“ gaus diegimo identifikatorių, kampanijos ar pakvietimo šaltinį ir, kai toks matavimas įjungtas, pasirinktus programėlės konversijų įvykius, pavyzdžiui, užbaigtą nuomą ir jos vertę. „AppsFlyer“ negaus jūsų vardo, el. pašto adreso, visų kortelės duomenų, rezervacijos numerio ar tikslaus daikto adreso. Sutikimas neprivalomas ir naudojimosi Naudokis neriboja.",
    privacyLink: "Privatumo politika",
    allow: "Leisti „AppsFlyer“ matavimą",
    decline: "Tęsti be „AppsFlyer“ matavimo",
    close: "Uždaryti",
  },
  privacyChoices: {
    trigger: "Privatumo nustatymai",
    title: "„AppsFlyer“ atribucija",
    body: "Leiskite „AppsFlyer“ susieti programėlės diegimą su kampanija ar pakvietimu ir, kai toks matavimas įjungtas, su pasirinktais programėlės konversijų įvykiais.",
    statusLabel: "Dabartinė būsena",
    statusAllowed: "Leidžiama",
    statusNotAllowed: "Neleidžiama",
    allow: "Leisti diegimo atribuciją",
    withdraw: "Atšaukti leidimą",
    scopeNote:
      "Tai svetainėje duotas „AppsFlyer“ atribucijos pasirinkimas. Kitą programėlės analitiką valdote atskirai jos nustatymuose.",
    privacyLink: "Privatumo politika",
    close: "Uždaryti",
  },
  invite: {
    meta: {
      title: "Jus pakvietė į Naudokis — atsisiųskite programėlę",
      description:
        "Jus pakvietė išbandyti Naudokis — daiktų nuomą iš privačių ir verslo savininkų. Atsisiųskite programėlę ir pradėkite.",
    },
    eyebrow: "Pakvietimas",
    titleValid: (amount) =>
      `Jus pakvietė į Naudokis! Gaukite ${amount} pirmai nuomai.`,
    titleUnknown: "Jus pakvietė į Naudokis.",
    titleGeneric: "Nuomokitės daiktus iš žmonių ir verslų šalia.",
    // FINAL: "šalia" no longer echoes the headline's line.
    lead: "Naudokis padeda išsinuomoti daiktus iš privačių ir verslo savininkų. Atsisiųskite programėlę, kad pradėtumėte.",
    rewardExplainer:
      "Premija įskaitoma jūsų paskyroje, kai programėlėje patvirtinsite tapatybę. Jus pakvietęs draugas premiją gauna po jūsų pirmos užbaigtos nuomos.",
    invalidNote:
      "Šis pakvietimo kodas nebegalioja, tačiau programėle galite naudotis įprastai.",
    // FINAL: truthful value bullets — published-policy facts only.
    benefits: [
      "Mokėjimai apdorojami per Stripe, o užstatas parodomas prieš patvirtinimą",
      "Savininkų profiliai, patikros žymos ir atsiliepimai",
      "Aiškios rezervacijos, atšaukimo ir ginčų taisyklės",
    ],
    ctaInstall: "Atsisiųsti programėlę",
    qrHint: "Nuskenuokite telefonu",
    codeLabel: "Jūsų pakvietimo kodas",
    codeHint:
      "Įveskite šį kodą programėlėje po registracijos — premija priklauso nuo kodo, o ne nuo matavimo leidimo.",
    codeCopy: "Kopijuoti kodą",
    codeCopied: "Nukopijuota",
    codeCopyFailed:
      "Nepavyko nukopijuoti. Pažymėkite kodą ir nukopijuokite rankiniu būdu.",
  },
  // FINAL: account-deletion cancel bridge copy.
  cancelDeletion: {
    meta: {
      title: "Atšaukti paskyros ištrynimą — Naudokis",
      description:
        "Persigalvojote? Atšaukite paskyros ištrynimą ir toliau naudokitės Naudokis.",
    },
    title: "Norite išsaugoti paskyrą?",
    body: "Paskyros trynimą galite atšaukti per 30 dienų nuo prašymo pateikimo. Patvirtinkite žemiau, jei norite išsaugoti paskyrą.",
    confirm: "Atšaukti paskyros trynimą",
    successTitle: "Paskyros ištrynimas atšauktas",
    successBody:
      "Paskyros trynimas atšauktas. Vėl galite prisijungti programėlėje.",
    successCta: "Atidaryti programėlę",
    invalidTitle: "Nuoroda negalioja",
    invalidBody:
      "Ši nuoroda negalioja arba jos galiojimas baigėsi. Jei reikia pagalbos, parašykite info@naudokis.lt.",
    alreadyTitle: "Nuoroda nebegalioja",
    alreadyBody:
      "Nuoroda jau panaudota arba 30 dienų terminas baigėsi. Jei negalite prisijungti arba nežinote paskyros būsenos, parašykite info@naudokis.lt.",
    errorTitle: "Nepavyko atšaukti",
    errorBody:
      "Įvyko laikina klaida. Bandykite dar kartą arba susisiekite su mumis.",
    retry: "Bandyti dar kartą",
    correlationLabel: "Užklausos ID",
  },
  // FINAL: app-handoff landings. The web never loads the record behind the link, so
  // every line describes the intent only — nothing here may imply the id exists.
  handoff: {
    meta: {
      title: "Atidarykite Naudokis programėlėje",
      description: "Šis puslapis tęsiamas Naudokis programėlėje.",
    },
    kinds: {
      bookingRequest: {
        title: "Jūsų rezervacijos užklausa laukia programėlėje",
        body: "Rezervacijos užklausą priimsite arba atmesite, pakeisite ar atšauksite Naudokis programėlėje.",
      },
      chat: {
        title: "Tęskite pokalbį programėlėje",
        body: "Susirašinėjimas su savininku vyksta Naudokis programėlėje.",
      },
      review: {
        title: "Atsiliepimai — programėlėje",
        body: "Atsiliepimą palikti ar peržiūrėti galite Naudokis programėlėje.",
      },
      billingDocuments: {
        title: "Sąskaitos — programėlėje",
        body: "Mokėjimų dokumentus rasite Naudokis programėlėje.",
      },
      profile: {
        title: "Profilis — programėlėje",
        body: "Savininkų profilius peržiūrėsite Naudokis programėlėje.",
      },
      myProfile: {
        title: "Jūsų paskyra — programėlėje",
        body: "Paskyrą, nuomas ir nustatymus valdote Naudokis programėlėje.",
      },
      rewards: {
        title: "Premijos — programėlėje",
        body: "Pakvietimų premijas ir jų būseną matote Naudokis programėlėje.",
      },
      resetPassword: {
        title: "Slaptažodžio keitimas — programėlėje",
        body: "Slaptažodį pakeisite Naudokis programėlėje. Nuoroda galioja ribotą laiką.",
      },
      verifyEmail: {
        title: "El. pašto patvirtinimas — programėlėje",
        body: "El. paštą patvirtinsite Naudokis programėlėje. Nuoroda galioja ribotą laiką.",
      },
    },
    openApp: "Atidaryti programėlėje",
    openHint:
      "Niekas neatsidarė? Vadinasi, programėlės dar neturite — atsisiųskite ją žemiau.",
    installLead: "Neturite programėlės? Atsisiųskite nemokamai.",
    installCta: "Atsisiųsti programėlę",
    qrHint: "Nuskenuokite telefonu",
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
    notFoundBrowse: "Naršyti skelbimus",
    errorTitle: "Nepavyko parodyti puslapio",
    errorBody:
      "Pabandykite dar kartą. Jei problema kartosis, grįžkite šiek tiek vėliau.",
    errorAction: "Bandyti dar kartą",
  },
  legal: {
    brandSub: "Taisyklės ir privatumas",
    contents: "Turinys",
    closeContents: "Uždaryti turinį",
    backTop: "Į viršų",
    readingProgress: "Skaitymo eiga",
    effective: "Įsigalioja",
    updated: "Atnaujinta",
    onlyLt:
      "Šis dokumentas šiuo metu skelbiamas tik lietuvių kalba. Rodomas lietuviškas tekstas.",
    briefLabel: "Trumpai",
    warnLabel: "Svarbu",
    anchorLabel: "Nuoroda į šį skyrių",
    relatedHeading: "Susiję dokumentai",
    questionsTitle: "Turite klausimų, kaip tai taikoma jūsų nuomai?",
    questionsBody:
      "Jei turite klausimų apie šį dokumentą, susisiekite su mumis el. paštu.",
    contactCta: "Parašykite mums",
    metaDescriptionFallback:
      "Perskaitykite šį „Naudokis“ teisinį dokumentą kartu su Naudojimosi sąlygomis ir Privatumo politika.",
  },
};
