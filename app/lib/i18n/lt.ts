// Lithuanian dictionary — launch-ready user-facing copy for the localized site.
import { cityLocativeLt } from "../cities";
import type { Dict } from "./types";

// The Lithuanian count-noun dance every "N <noun>" string in this file shares:
// teens (11–19) and counts ending in 0 take the plural genitive ("dienų"), a final
// 1 the singular ("diena"), everything else the plural ("dienos"). One word-picker
// so the rule lives once; each noun passes its three forms in that order.
const ltWord = (n: number, one: string, few: string, many: string): string => {
  const dd = n % 100;
  if ((dd >= 11 && dd <= 19) || n % 10 === 0) {
    return many;
  }
  return n % 10 === 1 ? one : few;
};

// "N dienų" in the NOMINATIVE — 1 diena · 3 dienos · 10 dienų · 21 diena. Every
// sentence built on this must keep the count in the nominative ("Trumpiausia
// nuoma — 3 dienos"), never in a construction that would govern the genitive, or
// it will read as broken Lithuanian. Genitive contexts use ltDaysGen below.
const ltDays = (n: number): string =>
  `${n} ${ltWord(n, "diena", "dienos", "dienų")}`;

// "nuo N dienų" — the GENITIVE, for counts governed by a preposition (the
// discount hint and the tier ladder's "Nuo" cells).
const ltDaysGen = (n: number): string =>
  `${n} ${ltWord(n, "dienos", "dienų", "dienų")}`;

// "N atsiliepimų" — shared by common.reviewCount and detail.ratingLinkLabel.
const ltReviews = (n: number): string =>
  `${n} ${ltWord(n, "atsiliepimas", "atsiliepimai", "atsiliepimų")}`;

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

// Unaccented search aliases per top-level category id (Kategorijos directory) —
// the type-in words users reach a category by ("remontas" → Įrankiai ir statyba).
// Matched folded, alongside the title and sub names. Prototype-authored strings
// from the 2026-07 "Kategorijos v2" handoff.
const LT_CATEGORY_SYNONYMS: Record<string, string> = {
  transport: "automobiliai masinos",
  photo_video: "foto kameros",
  tools_construction: "irankiai remontas",
  sports_leisure: "sportas turizmas zygiai",
  home_garden: "sodas kiemas vejapjove",
  electronics_tech: "kompiuteriai technika",
  audio_music_events: "garso aparatura muzika dj",
  events_parties: "sventes vestuves gimtadieniai",
  clothing_accessories: "apranga mados",
  kids: "vaikai kudikiai",
  health_medical: "slauga reabilitacija",
  other: "ivairus",
};

export const lt: Dict = {
  meta: {
    title: "Daiktų nuoma Lietuvoje – įrankiai, technika | Naudokis.lt",
    description:
      "Daiktų nuoma visoje Lietuvoje – nuo įrankių iki laisvalaikio įrangos. Raskite daiktą iš privačių ar verslo savininkų ir rezervuokite „Naudokis“ programėlėje.",
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
    badge: "Nuoma tarp patvirtintų naudotojų",
    title: "Aiškesnė daiktų nuoma nuo paieškos iki grąžinimo.",
    body: "Raskite daiktą iš privataus ar verslo nuomotojo. Svetainėje palyginkite pasiūlymus, o programėlėje peržiūrėkite galutinę sumą, pateikite rezervacijos užklausą ir užfiksuokite daikto perdavimą bei grąžinimą.",
    ownerPrompt: "Turite nenaudojamą daiktą?",
    ownerCta: "Įkelkite skelbimą programėlėje",
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
    eyebrow: "Atraskite",
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
    eyebrow: "Išsirinkite",
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
    title: "Nuomokitės tai, ko reikia. Uždirbkite iš to, ką jau turite.",
    lead: "„Naudokis“ sujungia nuomininkus su privačiais ir verslo nuomotojais bei suteikia įrankius sklandžiam nuomos procesui. Nuomos sutartį šalys sudaro tiesiogiai tarpusavyje. Pasirinkite savo vaidmenį ir sužinokite, kaip vyksta visas procesas.",
    renter: {
      label: "Nuomininkas",
      lead: "Nuo paieškos iki grąžinimo – keturi aiškūs žingsniai, kad išsinuomotumėte daiktą dienai, savaitgaliui ar projektui.",
      ctaTitle: "Rezervuokite daiktą nuomai programėlėje",
      ctaBody:
        "Pasirinkite nuomos datas ir perdavimo būdą, peržiūrėkite galutinę sumą bei patvirtinkite mokėjimo autorizaciją. Tuomet užklausa bus išsiųsta savininkui.",
      steps: [
        {
          icon: "Search",
          title: "Atraskite ir palyginkite",
          tag: "Paieška",
          tone: "yellow",
          screen: "search",
          body: "Peržiūrėkite daikto aprašymą, būklę, vietą ir perdavimo būdus. Įvertinkite savininko profilį, patvirtinimus bei ankstesnių nuomų atsiliepimus.",
        },
        {
          icon: "Calendar",
          title: "Pasirinkite sąlygas ir pateikite užklausą",
          tag: "Užklausa",
          tone: "green",
          screen: "reserve",
          body: "Pasirinkite nuomos datas ir perdavimo būdą, peržiūrėkite galutinę sumą, užstatą bei atšaukimo sąlygas. Patvirtinus mokėjimo autorizaciją, užklausa bus išsiųsta savininkui.",
        },
        {
          icon: "Handshake",
          title: "Perimkite ir užfiksuokite būklę",
          tag: "Perdavimas",
          tone: "yellow",
          screen: "pickup",
          body: "Atsiimdami daiktą arba gavę pristatymą patikrinkite jo būklę, komplektaciją ir priedus. Nuotraukas bei pastabas išsaugokite programėlėje.",
        },
        {
          icon: "Star",
          title: "Grąžinkite ir užbaikite nuomą",
          tag: "Užbaigimas",
          tone: "purple",
          screen: "review",
          body: "Grąžindami daiktą dar kartą užfiksuokite jo būklę, patvirtinkite grąžinimą ir, užbaigę nuomą, palikite atsiliepimą.",
        },
      ],
      // ⚠️ DRAFT (2026-07-22): nuomininko pusės garantijos. Skaičiai ir terminai
      // cituojami iš Naudojimosi sąlygų (§6, §7, §8, §9) — nieko neišgalvota.
      trust: [
        {
          icon: "CreditCard",
          title: "Mokėjimas nurašomas tik patvirtinus rezervaciją",
          body: "Nuomos kaina, platformos mokesčiai ir užstatas parodomi prieš pateikiant užklausą. Mokėjimas iš pradžių tik autorizuojamas ir nurašomas savininkui priėmus užklausą.",
        },
        {
          icon: "Users",
          title: "Žinote, iš ko nuomojatės",
          body: "Savininko profilyje matote tapatybės ir kitus profilio patvirtinimus bei ankstesnių nuomų atsiliepimus. Atsiliepimus gali palikti tik per „Naudokis“ užbaigtų rezervacijų dalyviai.",
        },
        {
          icon: "ShieldCheck",
          title: "Užstato ir atšaukimo sąlygos – iš anksto",
          body: "Užstato grąžinimo ir rezervacijos atšaukimo sąlygas matote prieš pateikdami užklausą. Jei per nustatytą terminą nepateikiama pagrįsta pretenzija, užstatas grąžinamas. Atšaukus iki perdavimo, jis grąžinamas visas.",
        },
      ],
    },
    owner: {
      label: "Savininkas",
      lead: "Nuo skelbimo iki išmokos – keturi aiškūs žingsniai, padedantys nenaudojamus daiktus paversti pajamomis.",
      ctaTitle: "Paskelbkite daiktą programėlėje",
      ctaBody:
        "Programėlėje įkelsite daiktą, valdysite užklausas, susirašysite su nuomininkais ir gausite išmokas vienoje vietoje.",
      steps: [
        {
          icon: "Camera",
          title: "Paskelbkite daiktą aiškiomis sąlygomis",
          tag: "Skelbimas",
          tone: "yellow",
          screen: "list",
          body: "Įkelkite aiškias nuotraukas, aprašykite daikto būklę ir komplektaciją, nustatykite kainą, užstatą, perdavimo būdus bei atšaukimo sąlygas.",
        },
        {
          icon: "BadgeCheck",
          title: "Peržiūrėkite ir atsakykite į užklausą",
          tag: "Užklausa",
          tone: "green",
          screen: "accept",
          body: "Peržiūrėkite nuomininko profilį, nuomos datas ir galutinę sumą. Iki nurodyto termino užklausą priimkite arba atmeskite.",
        },
        {
          icon: "Handshake",
          title: "Užfiksuokite perdavimą ir grąžinimą",
          tag: "Perdavimas",
          tone: "yellow",
          screen: "handover",
          body: "Perduodami ir priimdami grąžinamą daiktą programėlėje užfiksuokite jo būklę, komplektaciją, nuotraukas ir pastabas.",
        },
        {
          icon: "Coins",
          title: "Užbaikite nuomą ir gaukite išmoką",
          tag: "Išmoka",
          tone: "purple",
          screen: "payout",
          body: "Patvirtinus grąžinimą ir įvykdžius išmokos sąlygas, išmoka bus inicijuota. Kilus problemai, per programėlėje nurodytą terminą pateikite reikalavimą ir įrodymus.",
        },
      ],
      // ⚠️ DRAFT (2026-07-22): savininko pusės garantijos — mokesčiai, sprendimas
      // dėl užklausos, pretenzijų terminai. Cituojama iš Naudojimosi sąlygų.
      trust: [
        {
          icon: "Coins",
          title: "Mokesčius matote prieš priimdami užklausą",
          body: "Skelbimą galite paskelbti be išankstinio mokesčio. Konkrečiai rezervacijai taikomi platformos mokesčiai aiškiai parodomi prieš priimant užklausą.",
        },
        {
          icon: "BadgeCheck",
          title: "Jūs sprendžiate, kam nuomoti",
          body: "Prieš priimdami sprendimą matote nuomininko profilį, tapatybės patvirtinimą, nuomos datas ir galutinę sumą. Kiekvieną užklausą galite priimti arba atmesti.",
        },
        {
          icon: "ShieldCheck",
          title: "Būklės įrašai ir aiškus pretenzijų procesas",
          body: "Perdavimo ir grąžinimo įrašai išsaugomi programėlėje. Pastebėję žalą, per 24 valandas nuo patvirtinto grąžinimo pateikite pretenziją ir pirminius įrodymus.",
        },
      ],
    },
    trustEyebrow: "Pasitikėjimas kiekviename etape",
    trustTitle: "Aiškesnė nuoma abiem pusėms",
    browseCta: "Rasti daiktą",
    listCta: "Paskelbti daiktą",
    faqEyebrow: "Turite klausimų?",
    faqTitle: "Dažniausi klausimai",
    faqSubheading:
      "Aiškūs atsakymai apie rezervaciją, mokėjimą, atšaukimą, užstatą ir daikto grąžinimą.",
    faqOwnerSubheading:
      "Aiškūs atsakymai apie skelbimus, užklausas, išmokas, pretenzijas ir verslo nuomą.",
    // ⚠️ DRAFT (2026-07-22): nuomininko pusės klausimai — autorizacija vs. patvirtinimas,
    // atšaukimas, užstatas, perdavimo įrašai, vėlavimas, patikros. Skaičiai neišgalvoti:
    // terminai ir formulės cituojami iš Naudojimosi sąlygų (§6, §7, §8, §9).
    faq: [
      {
        q: "Kada patvirtinama rezervacija ir nurašomas mokėjimas?",
        a: "Pateikus užklausą, mokėjimo suma tik autorizuojama – rezervacija dar nėra patvirtinta. Ji patvirtinama savininkui priėmus užklausą ir mokėjimui sėkmingai įvykus. Tuomet nurašoma nuomos suma ir užstatas.",
      },
      {
        q: "Kokios atšaukimo sąlygos taikomos rezervacijai?",
        a: "Kiekvienam skelbimui taikoma viena iš trijų atšaukimo politikų. Lanksti – visa nuomos kaina grąžinama atšaukus bent prieš 24 valandas. Vidutinė – visa kaina grąžinama atšaukus bent prieš 5 dienas, o likus 1–4 dienoms grąžinama 50 %. Griežta – 50 % grąžinama atšaukus bent prieš 14 dienų. Jei skelbime nenurodyta kitaip, taikoma vidutinė politika. Aiškiai pažymėti negrąžinami mokesčiai negrąžinami, o iki perdavimo atšauktos rezervacijos užstatas grąžinamas visas.",
        link: { label: "Atšaukimo sąlygos", href: "/naudojimosi-salygos" },
      },
      {
        q: "Kaip veikia užstatas ir kokia mano atsakomybė?",
        a: "Užstatas paprastai nurašomas kartu su rezervacijos mokėjimu, savininkui priėmus užklausą. Rezervacijai pasibaigus jis grąžinamas, jei per nustatytą terminą nepateikiama pagrįsta pretenzija. Užstatas nėra draudimas ir neapriboja jūsų atsakomybės – pagrįsto reikalavimo suma gali būti didesnė už užstatą.",
      },
      {
        q: "Kaip užfiksuoti daikto perdavimą ir grąžinimą?",
        a: "Atsiimdami ir grąžindami daiktą patikrinkite jo būklę, komplektaciją, priedus, matomus trūkumus ir, jei taikoma, serijos numerį. Programėlėje išsaugokite aiškias nuotraukas ar vaizdo įrašą ir pažymėkite pastebėtus neatitikimus. Šie įrašai gali tapti svarbiais įrodymais nagrinėjant pretenziją.",
      },
      {
        q: "Kas nutinka pavėlavus grąžinti daiktą?",
        a: "Už kiekvieną pradėtą 24 valandų vėlavimo laikotarpį gali būti taikomas dviejų dienų nuomos kainos dydžio mokestis. Papildomas nemokamas laikotarpis netaikomas. Bendra suma negali viršyti mažesnės iš dviejų ribų: septynių dienų nuomos kainos arba skelbime nurodytos daikto atkuriamosios vertės. Tiksli formulė ir didžiausia galima suma parodomos prieš patvirtinant mokėjimą.",
      },
      {
        q: "Ką patvirtina ir ko negarantuoja patikros?",
        a: "Kai kurioms funkcijoms naudotojai turi patvirtinti el. paštą, telefono numerį ar tapatybę. Mokėjimų paslaugų teikėjas taip pat gali atlikti mokėjimų ir atitikties patikras. Šios patikros neįvertina daikto būklės ir negarantuoja nuomos baigties. „Naudokis“ fiziškai netikrina kiekvieno daikto ar perdavimo, todėl prieš nuomą įvertinkite skelbimą, savininko profilį ir patį daiktą.",
      },
    ],
    // ⚠️ DRAFT (2026-07-22): savininko pusės klausimai — mokesčiai, užklausų priėmimas,
    // išmokos ir sulaikymai, įrodymų terminai, nuomininko atšaukimai, verslo pareigos.
    // Kaip ir nuomininko rinkinyje: jokių išgalvotų skaičių, tik Sąlygų formuluotės.
    faqOwner: [
      {
        q: "Kiek kainuoja paskelbti daiktą?",
        a: "Skelbimą paskelbti galite be išankstinio mokesčio. Konkrečiai rezervacijai taikomi platformos mokesčiai parodomi prieš priimant užklausą. Pasikeitę mokesčiai taikomi tik būsimoms rezervacijoms.",
      },
      {
        q: "Ar turiu priimti kiekvieną užklausą?",
        a: "Ne. Prieš nuspręsdami peržiūrėkite nuomininko profilį, nuomos datas ir galutinę sumą. Iki nurodyto termino užklausą priimkite arba atmeskite. Jei laiku neatsakysite, užklausa nustos galioti, o nuomininko mokėjimas nebus nurašytas.",
      },
      {
        q: "Kada inicijuojama išmoka ir kodėl ji gali būti sulaikyta?",
        a: "Išmoka inicijuojama, kai rezervacija tinkamai užbaigta, mokėjimas galutinai įskaitytas ir nėra aktyvaus ginčo, grąžinimo ar su paskyra, atitiktimi ar mokesčiais susijusių apribojimų. Jei viena šalis patvirtina grąžinimą, o kita per 3 kalendorines dienas nepateikia pagrįstos pretenzijos, rezervacija užbaigiama automatiškai. Pervedimo trukmė priklauso nuo mokėjimų paslaugų teikėjo, banko ir galimų patikrų.",
      },
      {
        q: "Per kiek laiko turiu pateikti pretenziją dėl žalos?",
        a: "Pretenziją dėl žalos ir pirminius įrodymus pateikite per 24 valandas nuo patvirtinto daikto grąžinimo. Jei grąžinimas nepatvirtintas, terminas skaičiuojamas nuo numatyto grąžinimo laiko. Nuomininkas paprastai turi 7 kalendorines dienas atsakyti ir pateikti savo įrodymus.",
        link: { label: "Užstatas ir žala", href: "/naudojimosi-salygos" },
      },
      {
        q: "Kas nutinka, jei nuomininkas atšaukia?",
        a: "Taikoma skelbime pasirinkta atšaukimo politika – lanksti, vidutinė arba griežta. Jei politikos nepasirinkote, taikoma vidutinė. Nuomininkui grąžinama nuomos kainos dalis apskaičiuojama pagal pasirinktą politiką, o iki perdavimo atšauktos rezervacijos užstatas grąžinamas visas.",
      },
      {
        q: "Ką turiu žinoti, jei nuomoju kaip verslas?",
        a: "Nuomodami kaip verslas, patys atsakote už jums taikomas vartotojų apsaugos, produktų saugos, mokesčių, PVM, sąskaitų išrašymo ir apskaitos pareigas. Verslo statusas rodomas profilyje ir rezervacijos metu. Gali reikėti patvirtinti verslo duomenis, atstovavimo teisę, mokestinę informaciją ir sutikimą dėl sąskaitų išrašymo jūsų vardu. Nepateikus reikalingų duomenų, skelbimų publikavimas, užklausų priėmimas ar išmokos gali būti apriboti.",
      },
    ],
    ctaEyebrow: "Programėlė",
    ctaPhoneAlt: "Naudokis programėlė",
    // Verbatim from the mobile app's own translations/lt.json wherever the app
    // has the label — these mock-ups reproduce real app screens, so the copy
    // must match what someone sees after installing.
    screen: {
      item: "Bosch perforatorius",
      itemCat: "Įrankiai",
      itemPrice: "18 €/d.",
      dates: "Kovo 12 – 15",
      days: "3 d.",
      renter: "Marius K.",
      renterInitial: "M",
      rentLabel: "Nuomos suma",
      rentValue: "54 €",
      feeLabel: "Platformos mokestis",
      feeValue: "− 5,40 €",
      payoutLabel: "Jūsų išmoka",
      payoutValue: "48,60 €",
      photosLabel: "Nuotraukos",
      addPhoto: "Pridėti",
      conditionLabel: "Daikto būklė",
      conditionGood: "Gera",
      conditionWorn: "Nežymus nusidėvėjimas",
      conditionDamaged: "Pažeista",
      confirm: "Patvirtinti",
      search: {
        title: "Paieška",
        placeholder: "Ko ieškote?",
        catsLabel: "Daiktų kategorijos",
        cats: ["Įrankiai", "Automobiliai", "Elektronika", "Sporto įranga", "Renginiai"],
      },
      reserve: {
        title: "Nuomos užklausa",
        rentalLabel: "Nuomos informacija",
        cancelLabel: "Atšaukimas",
        cancelValue: "Lankstus",
        handoffLabel: "Daikto perdavimas",
        pickup: "Atsiėmimas",
        delivery: "Pristatymas",
        feesLabel: "Mokėjimo suvestinė",
        rentRow: "Nuoma × 3 d.",
        deliveryValue: "5 €",
        depositLabel: "Užstatas",
        depositValue: "50 €",
        totalLabel: "Iš viso",
        totalValue: "109 €",
        cta: "Rezervuoti mokėjimą · 109 €",
      },
      pickup: {
        title: "Daikto perdavimas",
        intro: "Užfiksuokite būklę – tai apsaugo abi puses.",
        photoCount: "0 / 8",
        camera: "Fotografuoti",
        gallery: "Iš galerijos",
        goodHint: "Be pastebimų defektų",
      },
      review: {
        title: "Atsiliepimas",
        prompt: "Pasidalinkite patirtimi",
        placeholder: "Parašykite atsiliepimą…",
        cta: "Pateikti atsiliepimą",
      },
      list: {
        title: "Naujas skelbimas",
        heading: "Įkelkite daikto nuotraukas",
        body: "Pridėkite iki 10 aiškių nuotraukų. Pirmoji – pagrindinė skelbimo nuotrauka.",
        photoCount: "3 / 10",
        cover: "Viršelis",
        cta: "Toliau",
      },
      accept: {
        title: "Užklausos peržiūra",
        renterLabel: "Nuomininkas",
        rating: "4,9",
        rentals: "· 12 nuomų",
        earningsLabel: "Išmoka",
        reject: "Atmesti",
        accept: "Priimti",
      },
      handover: {
        title: "Daikto grąžinimas",
        intro: "Palyginkite būklę su perdavimo įrašu.",
        photoCount: "2 / 8",
        goodHint: "Grąžinta tvarkinga",
      },
      payout: {
        title: "Nuomos užbaigimas",
        meta: "Kovo 12–15 · 3 d. · Marius K.",
        amount: "+ 48,60 €",
        rateLabel: "Įvertinkite nuomininką",
      },
    },
  },
  homeSteps: {
    eyebrow: "Kaip tai veikia",
    title: "Nuoma nuo pradžios iki pabaigos",
    lead: "Keturi aiškūs etapai – nuo daikto paieškos ar skelbimo įkėlimo iki grąžinimo ir nuomos užbaigimo.",
    steps: [
      {
        kicker: "Paieška",
        title: "Raskite arba pasiūlykite daiktą",
        body: "Palyginkite nuomos pasiūlymus svetainėje arba įkelkite savo daikto skelbimą programėlėje.",
      },
      {
        kicker: "Užklausa",
        title: "Pateikite arba patvirtinkite užklausą",
        body: "Nuomininkas peržiūri galutinę sumą ir pateikia rezervacijos užklausą, o savininkas ją patvirtina arba atmeta.",
      },
      {
        kicker: "Perdavimas",
        title: "Užfiksuokite perdavimą ir grąžinimą",
        body: "Perduodami ir grąžindami daiktą užfiksuokite jo būklę, nuotraukas, pastabas ir komplektaciją.",
      },
      {
        kicker: "Užbaigimas",
        title: "Patvirtinkite nuomos pabaigą",
        body: "Patvirtinkite grąžinimą, prireikus pridėkite įrodymus ir, užbaigę nuomą, palikite atsiliepimą.",
      },
    ],
    ctaLabel: "Peržiūrėti visą procesą",
  },
  cta: {
    eyebrow: "Programėlė",
    title: "Naršykite internete. Užklausą pateikite programėlėje.",
    body: "Programėlėje pasirinkite nuomos datas ir perdavimo būdą, peržiūrėkite galutinę sumą bei patvirtinkite mokėjimo autorizaciją. Užklausa bus išsiųsta savininkui, o rezervacija patvirtinta jam ją priėmus ir sėkmingai atlikus mokėjimą. Žinutes, daikto perdavimą ir grąžinimą valdykite vienoje vietoje.",
    phoneAlt: "Naudokis programėlės rezervacijos ekranas",
  },
  faq: {
    eyebrow: "Turite klausimų?",
    heading: "Ką verta žinoti prieš nuomojantis",
    subheading:
      "Trumpi atsakymai apie sandorį, patvirtinimą, kainą, atšaukimą, užstatą ir patikras.",
    // Eilės tvarka pagal nuomininko nerimą, ne pagal įmonės pasakojimą: iš ko nuomojuosi
    // → kada esu įsipareigojęs → kiek kainuoja → kas nutinka, jei kas nors nepavyksta.
    // Kiekvienas atsakymas baigiasi konkrečiu rezultatu, terminu arba nuoroda į sąlygas.
    // Formuluotės atitinka Naudojimosi sąlygas (§4, §6, §7, §9) — žr. „paprastai“
    // išlygas: Sąlygos negarantuoja vieno rezultato, todėl negarantuoja ir šis tekstas.
    items: [
      {
        q: "Iš ko nuomojuosi daiktą?",
        a: "Daiktą nuomojatės tiesiogiai iš privataus arba verslo savininko. „Naudokis“ suteikia paieškos, rezervacijos, mokėjimo, perdavimo ir ginčų valdymo įrankius, tačiau paprastai nėra daikto savininkė ar nuomos sandorio šalis.",
      },
      {
        q: "Kada rezervacija patvirtinama?",
        a: "Rezervacija patvirtinama tik tada, kai savininkas priima užklausą ir mokėjimas sėkmingai įvykdomas. Vien mokėjimo autorizacija dar nereiškia, kad rezervacija patvirtinta.",
      },
      {
        q: "Kiek mokėsiu?",
        a: "Nuomos kainą ir užstatą nustato savininkas, o „Naudokis“ gali taikyti platformos ar kitus aiškiai nurodytus mokesčius. Prieš mokėdami programėlėje matysite nuomos kainą, pristatymo mokestį, jei jis taikomas, kitus mokesčius, užstatą, atšaukimo sąlygas ir bendrą sumą.",
      },
      {
        q: "Kas nutinka atšaukus rezervaciją?",
        a: "Tai priklauso nuo to, kas ir kada atšaukia. Jei užklausą atšaukiate iki savininkui ją priimant, mokėjimas paprastai nėra nurašomas — autorizacija panaikinama arba suma grąžinama per Stripe. Jei rezervacija jau patvirtinta, taikomos prieš mokėjimą parodytos atšaukimo sąlygos ir privalomos vartotojų teisės. Savininkui atšaukus iki perdavimo, paprastai inicijuojamas visos sumokėtos sumos grąžinimas.",
        link: { label: "Atšaukimo sąlygos", href: "/naudojimosi-salygos" },
      },
      {
        q: "Kas nutinka, jei daiktas sugadinamas, vėluoja arba negrąžinamas?",
        a: "Abi pusės gali pateikti nuotraukas, žinutes ir kitus įrodymus. Užstatas gali būti panaudotas pagrįstai pretenzijai, tačiau jis nėra draudimas ir neriboja nuomininko atsakomybės. Savininkas pretenziją turi pateikti per 24 valandas nuo patvirtinto grąžinimo, o nuomininkas turi 7 dienas atsakyti.",
        link: { label: "Užstatas ir žala", href: "/naudojimosi-salygos" },
      },
      {
        q: "Ką reiškia profilyje rodomos patikros?",
        a: "Profilio žymos parodo atliktas patikras. Jos nepatvirtina daikto būklės, draudimo ir negarantuoja sandorio, todėl prieš rezervuodami peržiūrėkite profilį, skelbimą ir taikomas sąlygas.",
      },
      {
        q: "Ar galiu ieškoti daiktų visoje Lietuvoje?",
        a: "Taip, ieškoti galite visoje Lietuvoje. Pasiūlymų skaičius priklauso nuo miesto ir kategorijos, todėl kai kuriose vietose pasirinkimas dar gali būti ribotas.",
        link: { label: "Naršyti kategorijas", href: "/nuoma" },
      },
      {
        q: "Ką galiu atlikti svetainėje, o ką programėlėje?",
        a: "Svetainėje galite ieškoti ir palyginti pasiūlymus. Programėlėje pasirinksite datas ir perdavimo būdą, matysite visą sumą, pateiksite užklausą, mokėsite, susirašinėsite ir išsaugosite perdavimo bei grąžinimo įrašus.",
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
    copyright: ({ year, legalName }) =>
      `© ${year} ${legalName}. Visos teisės saugomos.`,
    socialLabel: "Socialiniai tinklai",
    paymentLabel: "Priimami mokėjimo būdai",
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
    galleryMore: (n) =>
      `+${n} ${ltWord(n, "nuotrauka", "nuotraukos", "nuotraukų")}`,
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
    newListingPill: "Dar nėra atsiliepimų",
    noReviewsYet: "Dar nėra atsiliepimų",
    noPhotos: "Nuotraukų nėra",
    galleryAll: (n) => `Visos ${n} nuotr.`,
    galleryExpand: "Padidinti nuotrauką",
    galleryViewLabel: "Nuotraukų galerija",
    galleryClose: "Uždaryti galeriją",
    galleryPrev: "Ankstesnė nuotrauka",
    galleryNext: "Kita nuotrauka",
    galleryImageError: "Nepavyko įkelti nuotraukos",
    galleryCounter: (index, total) => `${index} nuotrauka iš ${total}`,
    ratingLinkLabel: ({ rating, count }) =>
      `Įvertinimas ${rating} iš 5, ${ltReviews(count)} — rodyti atsiliepimus`,
    trustDepositRest: "užstatas (grąžinamas po nuomos)",
    reserveNote:
      "Kol kas nieko nemokėsite — pinigai bus rezervuoti jūsų sąskaitoje iki savininko patvirtinimo",
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
    termCancelLabel: "Rezervacijos atšaukimo sąlygos",
    termCancelTitle: (tier) => {
      if (tier === "flexible") return "Nemokamas atšaukimas iki 24 val.";
      if (tier === "strict") return "50 % grąžinama atšaukus prieš 14 d.";
      return "Nemokamas atšaukimas iki 5 d.";
    },
    termCancelDetail: (tier) => {
      if (tier === "flexible") return null;
      if (tier === "strict") return "Vėliau nuomos kaina negrąžinama";
      return "50 % grąžinama likus 1–4 d. iki nuomos";
    },
    trustCancellation: (tier) => {
      if (tier === "flexible")
        return "Nemokamas atšaukimas iki 24 val. prieš nuomą";
      if (tier === "strict") return "50 % grąžinama atšaukus prieš 14 d.";
      return "Nemokamas atšaukimas iki 5 d. prieš nuomą";
    },
    discountsLabel: "Nuolaidos ilgesnei nuomai",
    discountFrom: (n) => `Nuo ${ltDaysGen(n)}`,
    perDayAbbr: "/ d.",
    discountsHintIdle: "Pritaikoma automatiškai pagal nuomos trukmę",
    discountsHintBelow: ({ days, minDays }) =>
      `Pasirinkta ${ltDays(days)} — nuolaida nuo ${ltDaysGen(minDays)}`,
    discountsHintActive: ({ days, percent }) =>
      `Jūsų nuomai (${ltDays(days)}) taikoma −${percent}% nuolaida`,
    mobileBookingNote: "Galutinė suma — programėlėje",
  },
  common: {
    favorite: "Įsiminti",
    delivery: "Pristatymas",
    perDay: "/ d.",
    reviewCount: ltReviews,
    photoCount: (n) =>
      `${n} ${ltWord(n, "nuotrauka", "nuotraukos", "nuotraukų")}`,
    depositAmount: (amount) => `${amount} užstatas`,
    ownerLabel: "Savininkas",
    imageUnavailable: "Nuotrauka nepasiekiama",
    breadcrumbHome: "Pagrindinis",
    breadcrumbLabel: "Naršymo kelias",
    loading: "Kraunama…",
    backToTop: "Į viršų",
  },
  categoriesPage: {
    metaTitle: "Daiktų nuomos kategorijos Lietuvoje | Naudokis.lt",
    metaDescription:
      "Naršykite daiktų nuomos kategorijas Naudokis.lt — įrankius, transportą, foto techniką, elektroniką, namų ir laisvalaikio įrangą.",
    crumb: "Kategorijos",
    eyebrow: "Naršykite",
    title: "Visos nuomos kategorijos",
    body: "Pasirinkite kategoriją arba eikite tiesiai į pogrupį — kiekviena kategorija atsidaro kaip pilnas skelbimų sąrašas su filtrais.",
    searchPlaceholder: "Ieškoti kategorijos ar pogrupio",
    searchLabel: "Ieškoti nuomos kategorijų ir pogrupių",
    emptyTitle: "Kategorijų nerasta",
    emptySubtitle: (query) =>
      `Pagal „${query}“ kategorijų ar pogrupių neradome. Pabandykite platesnę paiešką.`,
    emptyAction: "Rodyti visas kategorijas",
    // Bare counts (no verb): the line renders on initial page load, where a
    // "found N" reads as a search result before any query was typed.
    countLabel: (cats, subs) =>
      `${cats} ${ltWord(cats, "kategorija", "kategorijos", "kategorijų")} · ${subs} ${ltWord(subs, "pogrupis", "pogrupiai", "pogrupių")}`,
    subCount: (n) => `${n} ${ltWord(n, "pogrupis", "pogrupiai", "pogrupių")}`,
    moreCount: (n) =>
      `Dar ${n} ${ltWord(n, "pogrupis", "pogrupiai", "pogrupių")}`,
    showLess: "Rodyti mažiau",
    popularHeading: "Populiaru dabar",
    allListingsLabel: (title) => `Visi „${title}“ skelbimai`,
    gridHeading: "Kategorijos ir pogrupiai",
    synonyms: (id) => LT_CATEGORY_SYNONYMS[id],
    searchItems: (query) => `Ieškoti „${query}“ tarp daiktų`,
    seoHeading: "Daiktų nuoma pagal kategorijas",
    seoBody:
      "Naudokis.lt apima kasdienes daiktų nuomos kategorijas visoje Lietuvoje — nuo įrankių ir transporto iki foto technikos, elektronikos, buitinės technikos, renginių ir laisvalaikio įrangos. Pasirinkite kategoriją arba konkretų pogrupį ir raskite daiktus netoliese be poreikio pirkti tai, ko reikia tik kartais.",
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
    resultCount: (n) =>
      `${n} ${ltWord(n, "pasiūlymas", "pasiūlymai", "pasiūlymų")}`,
    resultCountAtLeast: (n) => `${n}+ pasiūlymų`,
    loadMore: "Rodyti daugiau",
    loadingMore: "Įkeliama daugiau…",
    clear: "Išvalyti",
    searchPlaceholder: "Ką norite išsinuomoti?",
    searchLabel: "Ieškoti nuomojamų daiktų",
    sortLabel: "Rikiuoti",
    sortNewest: "Naujausi",
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
    priceRangeAria: "Kainos intervalas",
    priceMinAria: "Mažiausia kaina",
    priceMaxAria: "Didžiausia kaina",
    priceDone: "Atlikta",
    dateLabel: "Datos",
    dateAny: "Nuomos datos",
    dateBand: (from, to) => (from === to ? from : `${from}–${to}`),
    datePanelTitle: "Nuomos datos",
    datePrevMonth: "Ankstesnis mėnuo",
    dateNextMonth: "Kitas mėnuo",
    dateToday: "šiandien",
    dateSelectStart: "Pasirinkite pradžios datą",
    dateSelectEnd: "Pasirinkite pabaigos datą",
    dateWindowHint: (max) => `Iki ${ltDays(max)}`,
    dateDays: ltDays,
    dateStartSelected: (date) => `Pradžia: ${date}. Pasirinkite pabaigos datą.`,
    dateRangeSelected: ({ start, end, days }) =>
      `Pasirinkta ${start}–${end}, ${days}.`,
    dateBlocked: (reason, n) => {
      if (reason === "past") {
        return "Data jau praėjo";
      }
      if (reason === "tooLong") {
        return `Ilgiausias laikotarpis — ${ltDays(n)}`;
      }
      return "Data nepasiekiama";
    },
    deliveryToggle: "Pristatymas",
    depositToggle: "Be užstato",
    depositUpTo: (max) => `Užstatas iki ${max} €`,
    filtersButton: "Filtrai",
    filtersTitle: "Filtrai",
    filtersApply: (n, atLeast) => {
      if (n === null) return "Rodyti rezultatus";
      // Accusative forms — "Rodyti" governs the object case.
      return `Rodyti ${n}${atLeast ? "+" : ""} ${ltWord(n, "pasiūlymą", "pasiūlymus", "pasiūlymų")}`;
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
    storesAlso: "arba atsisiųskite iš",
    storesDivider: "arba atsisiųskite iš",
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
    all: "Miestas",
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
