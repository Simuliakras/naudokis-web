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
    links: [
      { label: "Privatumo politika", href: "/privatumo-politika" },
      { label: "Paslaugų teikimo sąlygos", href: "/naudojimo-taisykles" },
      { label: "Kategorijos", href: "/kategorijos" },
      { label: "Kontaktai", href: "#kontaktai" },
    ],
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
    tocHeading: "Turinys",
    crossToTerms: "Naudojimo taisyklės",
    crossToPrivacy: "Privatumo politika",
    privacy: {
      metaTitle: "Privatumo politika — Naudokis.lt",
      metaDescription: "Kaip Naudokis.lt renka, naudoja ir saugo jūsų asmens duomenis. BDAR atitiktis, jūsų teisės ir kontaktai.",
      title: "Privatumo politika",
      updated: "Atnaujinta 2026 m. kovo 1 d.",
      intro: "Ši privatumo politika paaiškina, kaip „Naudokis.lt“ renka, naudoja ir saugo jūsų asmens duomenis naudojantis mūsų platforma ir programėle.",
      sections: [
        { id: "bendrosios", heading: "1. Bendrosios nuostatos", body: ["Duomenų valdytojas yra UAB „Naudokis“, veikianti pagal Lietuvos Respublikos ir ES Bendrojo duomenų apsaugos reglamento (BDAR) reikalavimus.", "Naudodamiesi platforma jūs sutinkate su šioje politikoje aprašytu duomenų tvarkymu."] },
        { id: "duomenys", heading: "2. Kokius duomenis renkame", body: ["Renkame tik tuos duomenis, kurie būtini paslaugai teikti."], subsections: [
          { heading: "2.1. Paskyros duomenys", body: ["Vardas, el. pašto adresas, telefono numeris ir profilio nuotrauka, kuriuos pateikiate registruodamiesi."] },
          { heading: "2.2. Naudojimo duomenys", body: ["Informacija apie peržiūrėtus skelbimus, paieškas, įrenginio tipą ir apytikslę vietą, naudojama paslaugai gerinti."] },
        ] },
        { id: "naudojimas", heading: "3. Kaip naudojame duomenis", body: ["Duomenis naudojame paskyrai administruoti, nuomos sandoriams įgyvendinti, saugumui užtikrinti ir su jūsų sutikimu — pranešimams siųsti.", "Niekada neparduodame jūsų asmens duomenų tretiesiems asmenims."] },
        { id: "saugojimas", heading: "4. Duomenų saugojimas", body: ["Duomenys saugomi tol, kol turite aktyvią paskyrą, ir pašalinami praėjus teisės aktų numatytam terminui po paskyros uždarymo."] },
        { id: "trecios-salys", heading: "5. Trečiosios šalys", body: ["Pasitelkiame patikimus partnerius mokėjimams apdoroti ir infrastruktūrai teikti. Jie tvarko duomenis tik mūsų nurodymu ir pagal sutartis."] },
        { id: "teises", heading: "6. Jūsų teisės", body: ["Turite teisę susipažinti su savo duomenimis, juos ištaisyti, ištrinti, apriboti tvarkymą bei perkelti. Prašymus pateikite el. paštu info@naudokis.lt."] },
        { id: "slapukai", heading: "7. Slapukai", body: ["Naudojame būtinuosius ir analitinius slapukus. Slapukų nustatymus galite valdyti savo naršyklėje."] },
        { id: "kontaktai", heading: "8. Kontaktai", body: ["Dėl privatumo klausimų rašykite info@naudokis.lt arba skambinkite +370 643 49559."] },
      ],
    },
    terms: {
      metaTitle: "Naudojimo taisyklės — Naudokis.lt",
      metaDescription: "Naudojimosi Naudokis.lt platforma sąlygos — nuomos procesas, mokesčiai, užstatas, atšaukimo politika ir ginčų sprendimas.",
      title: "Naudojimo taisyklės",
      updated: "Atnaujinta 2026 m. kovo 1 d.",
      intro: "Šios taisyklės nustato naudojimosi „Naudokis.lt“ platforma sąlygas tarp nuomotojų, nuomininkų ir platformos operatoriaus.",
      sections: [
        { id: "savokos", heading: "1. Sąvokos", body: ["Nuomotojas — asmuo, siūlantis daiktą nuomai. Nuomininkas — asmuo, nuomojantis daiktą. Platforma — „Naudokis.lt“ svetainė ir programėlė."] },
        { id: "registracija", heading: "2. Paskyros registracija", body: ["Registruodamiesi patvirtinate, kad esate ne jaunesni nei 18 metų ir pateikiate teisingą informaciją.", "Atsakote už savo paskyros prisijungimo duomenų saugumą."] },
        { id: "nuomos-procesas", heading: "3. Nuomos procesas", body: ["Nuoma vykdoma per programėlę, kur patvirtinamos datos, kaina ir užstatas."], subsections: [
          { heading: "3.1. Nuomotojo pareigos", body: ["Pateikti tikslų daikto aprašymą, užtikrinti jo būklę ir perduoti daiktą sutartu laiku."] },
          { heading: "3.2. Nuomininko pareigos", body: ["Naudoti daiktą atsakingai, grąžinti jį laiku ir tokios pat būklės, kokios gavo."] },
        ] },
        { id: "mokesciai", heading: "4. Mokesčiai ir atsiskaitymai", body: ["Naršyti ir ieškoti skelbimų nemokama. Nuomotojai moka nedidelį, skaidrų komisinį mokestį po sėkmingos nuomos.", "Atsiskaitymai vykdomi saugiai per platformą; pinigai pervedami nuomotojui pasibaigus nuomai."] },
        { id: "uzstatas", heading: "5. Užstatas", body: ["Daiktui gali būti taikomas grąžinamas užstatas, kuris užšaldomas nuomos laikotarpiui ir grąžinamas nuomininkui, jei daiktas grąžinamas nepažeistas."] },
        { id: "atsaukimas", heading: "6. Atšaukimo politika", body: ["Nuomą galima atšaukti pagal kiekviename skelbime nurodytas sąlygas — daugeliu atvejų taikomas 100% grąžinimas iki 5 dienų prieš nuomą."] },
        { id: "atsakomybe", heading: "7. Atsakomybės ribojimas", body: ["Platforma veikia kaip tarpininkas tarp vartotojų ir neatsako už daiktų kokybę ar vartotojų veiksmus, išskyrus teisės aktų numatytus atvejus."] },
        { id: "gincai", heading: "8. Ginčų sprendimas", body: ["Ginčai sprendžiami derybomis. Nepavykus susitarti, taikoma Lietuvos Respublikos teisė ir kompetentingų teismų jurisdikcija."] },
        { id: "kontaktai", heading: "9. Kontaktai", body: ["Klausimais dėl taisyklių rašykite info@naudokis.lt arba skambinkite +370 643 49559."] },
      ],
    },
  },
};
