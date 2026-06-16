---
title: "„Naudokis“ mokėjimų, mokesčių ir Stripe taisyklės"
document_type: "policy_appendix"
language: "lt"
version: "2026-06-01"
effective_date: "2026-06-01"
last_updated: "2026-06-01"
company: "MB Naudokis"
juridical_person_code: "307423504"
canonical_url: "https://naudokis.lt/legal/mokejimai-mokesciai-stripe"
document_id: "NAUDOKIS-PAYMENTS-LT-2026-06-01"
---

# „Naudokis“ mokėjimų, mokesčių ir Stripe taisyklės

Įsigaliojimo data: 2026 m. birželio 1 d.
Versija: 2026-06-01
Kalba: lietuvių
Paskutinį kartą atnaujinta: 2026 m. birželio 1 d.
Dokumento ID: **NAUDOKIS-PAYMENTS-LT-2026-06-01**

Šios taisyklės yra „Naudokis“ naudojimosi sąlygų dalis ir turi būti skaitomos kartu su pagrindiniu dokumentu. Jeigu konkrečiai Rezervacijai, Skelbimui, Naudotojo vaidmeniui ar Platformos funkcijai Programėlėje pateikiama speciali sąlyga, ji taikoma tiek, kiek neprieštarauja imperatyviosioms teisės normoms.

## 10. Mokėjimai, mokesčiai ir Stripe

## Mokėjimo ir išmokos būsenų matrica

Ši matrica paaiškina, kaip „Naudokis“ praktiškai vertina mokėjimo, Užstato ir išmokos būsenas. Programėlėje rodoma konkrečios Rezervacijos būsena turi būti aiškinama kartu su šia lentele ir Stripe procesais.

| Būsena | Ką reiškia Nuomininkui | Ką reiškia Nuomotojui |
| --- | --- | --- |
| Mokėjimas inicijuotas | Mokėjimo procesas pradėtas, bet dar nėra galutinai patvirtintas | Rezervacija dar nėra galutinai apmokėta |
| Mokėjimas autorizuotas | Mokėjimo priemonė patikrinta; suma (įskaitant Užstatą, kai taikoma) rezervuota Nuomininko mokėjimo priemonėje, bet dar nenurašyta | Priėmimas gali lemti galutinį nurašymą, jei Stripe patvirtina mokėjimą |
| Mokėjimas nurašytas | Pagal mokėjimo ekraną nurašoma Rezervacijos suma ir, kai taikoma, Užstatas | Išmoka dar gali būti laukianti, kol Rezervacija tinkamai užbaigiama ir nėra ginčų |
| Mokėjimas nepavyko | Rezervacija gali būti nepatvirtinta arba atšaukta | Nuomotojas neprivalo vykdyti neapmokėtos Rezervacijos, nebent Programėlė aiškiai rodo kitaip |
| Užstatas sulaikytas peržiūrai | Dalis ar visa Užstato suma laikinai sulaikyta dėl pagrįstos pretenzijos | Nuomotojas turi pateikti įrodymus per nustatytą procesą |
| Grąžinimas inicijuotas | Grąžinimas perduotas mokėjimų procesui; faktinis lėšų grąžinimas į sąskaitą priklauso nuo banko ir kortelių tinklų | Nuomotojo išmoka gali būti koreguojama pagal grąžinimą |
| Laukiama išmokos | Nuomininkui tai paprastai nekeičia įvykdytos mokėjimo pareigos, jei mokėjimas nebuvo ginčytas ar anuliuotas | Išmoka dar nepervesta dėl Rezervacijos užbaigimo, Stripe, atitikties, ginčo ar Platformos peržiūros |
| Išmoka pervesta | Nuomininko mokėjimas užbaigtas, nebent vėliau kyla mokėjimo ginčas | Suma pervesta pagal Stripe arba Platformos procesą, tačiau gali būti koreguojama, jei vėliau atsiranda mokėjimo ginčas, sukčiavimo ar teisinis pagrindas |
| Mokėjimo ginčas arba lėšų atgavimas per banką (angl. chargeback) | Nuomininko bankas ar kortelės tinklas nagrinėja mokėjimo ginčą | Išmokos gali būti sulaikytos, atšauktos ar užskaitytos (atliktas priešpriešinis įskaitymas) pagal Stripe ir taikomas taisykles |

## Mokėjimo skaidrumo standartas

Prieš Nuomininkui patvirtinant mokėjimą Programėlėje turi būti aiškiai parodyta konkrečiai Rezervacijai taikoma informacija:

- nuomos kaina;
- Nuomininko paslaugos mokestis;
- Nuomotojo mokestis arba išmokos išskaita;
- pristatymo ar atsiėmimo mokestis;
- Užstatas;
- taikomi mokesčiai;
- atšaukimo ir grąžinimo taisyklė;
- bendra mokėtina suma;
- ar suma yra autorizuojama, nurašoma iš karto, ar nurašoma po Nuomotojo priėmimo.

Jei mokėjimo ekrane rodoma informacija skiriasi nuo bendros pagalbos centro ar politikos formuluotės, konkrečiai Rezervacijai svarbiausia yra aiški mokėjimo ekrane prieš patvirtinimą parodyta informacija, jei ji neprieštarauja imperatyviosioms teisės normoms.

**Trumpai:** Mokėjimai vykdomi per Stripe. Prieš mokėjimą Programėlėje turi būti aiškiai parodyta kaina, mokesčiai, Užstatas, grąžinimo ir atšaukimo sąlygos bei kitos esminės sąlygos.

### Mokėjimai, mokesčiai ir išmokos

Mokėjimai Platformoje apdorojami per Stripe ir, kai taikoma, Stripe Connect infrastruktūrą.

Paleidimo laikotarpiu „Naudokis“ naudoja platformos mokėjimo autorizavimo, vėlesnio nurašymo ir vėlesnio išmokėjimo modelį:

- Nuomininko mokėjimas įprastai pirmiausia autorizuojamas Stripe mokėjimo procese;
- mokėjimas nurašomas po Nuomotojo priėmimo, jei Stripe sėkmingai įvykdo nurašymą;
- Nuomotojui priklausanti suma gali būti pervedama per Stripe Connect (pervedimų, angl. transfers, funkcionalumą);
- prieš išmoką gali būti išskaitomi taikomi mokesčiai, grąžinimai, Užstato sulaikymai, mokėjimo ginčai, atitikties patikros sulaikymai ar kiti leidžiami koregavimai.

„Naudokis“ pati neteikia reguliuojamų mokėjimo paslaugų, nėra bankas, kredito įstaiga ar elektroninių pinigų įstaiga. Reguliuojamas mokėjimo paslaugas teikia Stripe ir kiti mokėjimų dalyviai.

„Naudokis“ veikia kaip Platformos operatorė. Naudodama Stripe ir Stripe Connect, „Naudokis“ turi teisę surinkti arba administruoti Nuomininko mokėjimą, taikyti Platformos mokesčius, sulaikyti ar atidėti išmokas, atlikti grąžinimus, administruoti Užstatus ir pervesti Nuomotojui priklausančią sumą pagal šias Sąlygas, Programėlėje pateiktas taisykles, Stripe taisykles ir taikomą teisę.

Tai, kad mokėjimas, Užstatas, grąžinimas, ginčas ar išmoka administruojami per Platformą, savaime nereiškia, kad „Naudokis“ tampa nuomojamo daikto savininke, pardavėja, nuomotoja ar Nuomos sandorio šalimi.

Naudodamiesi mokamomis Platformos funkcijomis sutinkate laikytis taikomų Stripe sąlygų, mokėjimo procesų ir patvirtinimo reikalavimų. Stripe, mokėjimo tinklai, bankai ar kiti mokėjimų dalyviai gali taikyti savo patikras, apribojimus, grąžinimo, mokėjimo ginčų ir išmokų taisykles.

**Mokėjimo administravimo tvarka.** Kiek tai leidžia taikoma teisė, Nuomininko mokėjimas, atliktas per Platformos Stripe mokėjimo procesą ir sėkmingai patvirtintas Stripe, laikomas Nuomininko mokėjimo pareigos už atitinkamą Rezervaciją įvykdymu Nuomotojo atžvilgiu.

Tai galioja tik tokia apimtimi, kokia mokėjimas nėra vėliau atmestas, grąžintas, ginčijamas, pripažintas neteisėtu, sukčiavimo būdu atliktu ar kitaip anuliuotas pagal Stripe, kortelių tinklų, bankų ar taikomos teisės taisykles.

Nuomotojas sutinka, kad apmokėtų Platformos Rezervacijų atsiskaitymas vykdomas per Platformoje nurodytą mokėjimo procesą. Nuomotojas negali reikalauti, kad Nuomininkas už tą pačią Rezervaciją papildomai mokėtų tiesiogiai, nebent mokėjimas neįvyko, buvo anuliuotas arba tai leidžia šios Sąlygos ir imperatyviosios teisės normos.

„Naudokis“ administruoja mokėjimo nurodymus, išmokų apskaitą, grąžinimus, Užstatus, sulaikymus ir koregavimus kaip Platformos operatorė pagal šias Sąlygas, Programėlėje atskleistas taisykles, mokėjimų teikėjo taisykles ir imperatyviąsias teisės normas.

Toks administravimas nėra bankinė depozitinė, klientų lėšų, patikėjimo ar sąlyginio deponavimo paslauga. Jis nesuteikia Naudotojui teisės reikalauti išmokos anksčiau, nei įvykdomos visos šiose taisyklėse nustatytos išmokos sąlygos: Rezervacija tinkamai užbaigta, išspręsti taikomi pinigų grąžinimo, Užstato ir mokėjimo ginčų klausimai, atliktos atitikties bei mokestinės patikros ir nėra teisės aktuose numatytų kliūčių.

„Naudokis“ sprendimai dėl grąžinimo, Užstato sulaikymo, išmokos atidėjimo, mokėjimo koregavimo ar mokėjimo ginčo administravimo yra Platformos vidaus administravimo sprendimai. Jie nepanaikina Naudotojų teisės ginčyti mokėjimą per mokėjimų teikėjo procedūras, kreiptis į kompetentingas institucijas ar teismą, kai tokia teisė taikoma.

Mokėjimai Platformoje priimami ir vykdomi eurais (EUR) per Stripe mokėjimų infrastruktūrą. Platforma skirta Lietuvoje vykdomoms Rezervacijoms. Jei konkrečiai funkcijai taikoma kitokia Stripe konfigūracija, mokėjimo būdas, autorizacijos logika, tiesioginio ar netiesioginio nurašymo procesas, išmokos struktūra ar papildomas sutikimas, tai aiškiai parodoma Programėlėje prieš mokėjimo patvirtinimą arba prieš naudojantis tokia funkcija.

Nuomininkas privalo sumokėti Programėlėje prieš mokėjimo patvirtinimą nurodytas sumas. Jos gali apimti nuomos kainą, pristatymo mokestį, Nuomininko paslaugos mokestį, Užstatą, taikomus mokesčius ir kitus aiškiai atskleistus mokėjimus.

Jei konkrečiai Rezervacijai taikomas Užstatas, paleidimo laikotarpiu jis įprastai įtraukiamas į tą pačią Stripe autorizaciją kaip Rezervacijos mokėjimas. Užstatas nurašomas tik po Nuomotojo priėmimo, jei Stripe sėkmingai įvykdo nurašymą, nebent Programėlėje aiškiai nurodyta kitaip.

„Naudokis“ turi teisę taikyti Nuomotojo Platformos mokestį, Nuomininko paslaugos mokestį, minimalų sandorio mokestį, Užstato apdorojimo mokestį, pristatymo ar kitus Programėlėje aiškiai nurodytus mokesčius. Mokesčiai gali būti taikomi Nuomininkui kaip mokėtinos sumos arba Nuomotojui kaip išmokos išskaitos, priklausomai nuo konkretaus mokesčio pobūdžio.

Prieš atitinkamam Naudotojui patvirtinant mokėjimą, priimant Rezervaciją ar atliekant kitą su mokesčiais susijusį veiksmą, Programėlėje rodomi konkretūs mokesčių dydžiai, procentai, galimos nuolaidos, kreditai, mokesčiai valstybei, Užstatai, mokėtojas, taikymo pagrindas ir poveikis bendrai mokėtinai sumai arba Nuomotojo išmokai.

Užstato apdorojimo mokestis, jei taikomas, yra „Naudokis“ mokestis, susijęs su Užstato mokėjimo, apskaitos, grąžinimo, sulaikymo ar paskirstymo administravimu.

Jei Programėlėje nenurodyta kitaip, šis mokestis taikomas Nuomotojui ir išskaitomas iš Nuomotojui mokėtinos išmokos. Jis nėra papildomai pridedamas prie Nuomininko mokėtinos sumos ir nėra Užstato dalis.

Šis mokestis įprastai taikomas tik tada, kai nuoma prasideda ar užbaigiama arba kai faktiškai vyksta su Užstatu susijęs procesas. Jis netaikomas, kai Rezervacija atšaukiama prieš daikto perdavimą ir su Užstatu susijęs administravimas faktiškai neįvyko.

Mokesčiai gali skirtis pagal Naudotojo tipą, funkciją, sandorį, kategoriją, kampaniją, individualų susitarimą ar kitą teisėtą pagrindą. Tai apima ir tai, ar sandoris yra vartotojo, Verslo nuomininko, Verslo nuomotojo ar B2B sandoris.

„Naudokis“ turi teisę keisti mokesčių dydžius, tačiau pakeisti mokesčiai taikomi tik būsimoms Rezervacijoms ir nėra taikomi jau patvirtintoms Rezervacijoms, nebent to reikalauja teisė, mokėjimų teikėjo taisyklės arba šalys aiškiai susitaria kitaip.

Kai Naudotojas veikia kaip vartotojas, prieš mokėjimo patvirtinimą Programėlėje pateikiama privaloma informacija apie bendrą kainą, Užstatą, grąžinimo ir atšaukimo taisykles, Nuomotojo statusą, taikomus mokesčius ir mokėjimo pasekmes tiek, kiek to reikalauja privalomi vartotojų apsaugos teisės aktai.

Kai Naudotojas veikia kaip Verslo nuomininkas, Programėlėje gali būti pateikiama papildoma atsiskaitymo, sąskaitų, PVM ar kita verslo apskaitai reikalinga informacija.

Nuomotojai gauna išmokas tik po to, kai Rezervacija tinkamai užbaigiama, mokėjimas yra galutinai įskaitomas (atsiskaitymas per Stripe įvykdytas), praeina taikomas išmokos laukimo laikotarpis, apdorojami grąžinimai ar Užstatai ir nėra aktyvių mokėjimų, ginčų, atitikties, mokesčių, moderavimo ar paskyros apribojimų.

Išmokų terminai priklauso nuo Nuomotojo Stripe Connect prijungtos paskyros (angl. connected account) nustatymų, bankų, mokėjimų tinklų, atitikties patikrų, ginčų, mokėjimo ginčų, techninių procesų ar „Naudokis“ peržiūros. Todėl vienodas atsiskaitymo terminas negali būti garantuotas.

„Naudokis“ turi teisę sulaikyti, atidėti, užskaityti (atlikti priešpriešinį įskaitymą), atšaukti, koreguoti, grąžinti, išskaidyti, pervesti ar kitaip tvarkyti mokėjimus ir išmokas, kiek tai reikalinga šiems tikslams:

- grąžinimams, ginčams, mokėjimo ginčams ar mokėjimo klaidoms administruoti;
- Užstato paskirstymui;
- sukčiavimo prevencijai;
- teisės reikalavimams, Stripe apribojimams ar atitikties peržiūrai vykdyti;
- šioms Sąlygoms įgyvendinti.

Nuomotojo išmoka nėra galutinė, kol nėra atliktas atitinkamas pervedimas ir nebelieka taikomų grąžinimo, mokėjimo ginčo, teisės aktų, mokesčių, atitikties ar Platformos sulaikymo pagrindų.

Jei po mokėjimo ar Nuomotojo išmokos mokėjimas yra ginčijamas, grąžinamas, atšaukiamas, pripažįstamas neteisėtu, sukčiavimo būdu atliktu ar kitaip neįskaitomas, „Naudokis“, kiek leidžia taikoma teisė ir Stripe taisyklės, turi teisę imtis koregavimo veiksmų. Tai gali būti būsimų išmokų sustabdymas, pervedimo atšaukimo inicijavimas, sumų įskaitymas iš būsimų Nuomotojui mokėtinų sumų arba reikalavimas grąžinti nepagrįstai gautą išmoką.

Naudotojai privalo bendradarbiauti teikiant mokėjimo ginčo, pinigų grąžinimo, Užstato, daikto perdavimo, daikto grąžinimo ar žalos įrodymus. „Naudokis“ turi teisę taikyti laikinus rezervus, mokėjimų ar išmokų sulaikymus ir paskyros apribojimus, jei to pagrįstai reikia dėl mokėjimo ginčo, sukčiavimo, neigiamo balanso, Stripe apribojimo, teisinės pareigos ar kitos mokėjimų rizikos.

### Informacija prieš mokėjimo patvirtinimą

Prieš Nuomininkui patvirtinant mokėjimą, mokėjimo ekrane arba Rezervacijos suvestinėje turi būti aiškiai pateikta bent ši informacija, kiek ji taikoma konkrečiam sandoriui:

- nuomojamas daiktas;
- nuomos laikotarpis (pradžios ir pabaigos datos);
- Nuomotojo statusas: privatus asmuo, individualią veiklą vykdantis asmuo, įmonė ar kitas Verslo naudotojas arba Prekiautojas;
- bendra mokėtina suma;
- nuomos kaina;
- Platformos mokesčiai;
- pristatymo ar perdavimo mokesčiai;
- Užstato suma ir tai, ar Užstatas pirmiausia autorizuojamas ir vėliau nurašomas, ar taikomas kitas Programėlėje aiškiai nurodytas mokėjimo modelis;
- atšaukimo ir grąžinimo politika;
- pagrindiniai daikto naudojimo apribojimai;
- galimos 14 dienų atsisakymo teisės taikymas ar netaikymas;
- pagrindinės žalos ir pavėluoto grąžinimo pasekmės;
- ar konkrečiam sandoriui taikoma kokia nors draudimo, garantijos ar „Naudokis“ kompensavimo apsauga (įprastai netaikoma — žr. 11 ir 19 skyrius);
- šalis, atsakinga už Nuomos sandorio vykdymą (įprastai Nuomotojas, o ne „Naudokis“, jei pagal šias Sąlygas nenurodyta kitaip);
- nuoroda į šias Sąlygas bei Privatumo politiką.

Rezervacijos užklausa pateikiama tik tada, kai Nuomininkas pasirenka aiškiai pareigą sumokėti nurodantį mygtuką (pavyzdžiui, „Patvirtinti ir mokėti“). Galutinai patvirtinta ir apmokėta Rezervacija atsiranda tik tada, kai Nuomotojas priima užklausą ir mokėjimas yra sėkmingai nurašomas ar kitaip patvirtinamas; iki tol Programėlė gali rodyti tarpinę Nuomotojo priėmimo arba mokėjimo apdorojimo būseną.

Jeigu mokėjimo ekrane nurodyta, kad Užstatas bus autorizuotas ir vėliau nurašomas, Naudotojui turi būti pateikta aiški informacija apie Užstato procesą.

Tokia informacija turi paaiškinti, kad Užstatas bus įtrauktas į Stripe autorizaciją kartu su Rezervacijos mokėjimu ir nurašomas tik po Nuomotojo priėmimo, jei Stripe sėkmingai įvykdo nurašymą.

Taip pat turi būti paaiškinta, kad po nuomos Užstatas gali būti grąžintas visas, grąžintas iš dalies, laikinai sulaikytas arba panaudotas pagrįstam reikalavimui padengti pagal šias Sąlygas, pateiktus įrodymus, mokėjimų teikėjo taisykles ir taikomą teisę.

Jeigu prieš mokėjimą trūksta informacijos, kuri pagal imperatyviąsias vartotojų teisės normas ar šias Sąlygas būtina konkrečiam sandoriui, „Naudokis“ turi teisę neleisti užbaigti mokėjimo, pažymėti Rezervaciją kaip nebaigtą arba reikalauti, kad Nuomotojas, Nuomininkas ar Verslo naudotojas papildytų informaciją. Mokėjimo mygtukas, kai taikoma vartotojų teisė, turi aiškiai nurodyti, kad veiksmas sukuria pareigą sumokėti.

„Naudokis“ turi teisę saugoti Rezervacijos suvestinės, kainos išskaidymo, Užstato, atšaukimo taisyklių, Prekiautojo statuso, atsisakymo teisės informacijos ir kitų esminių sąlygų fiksuotą įrašą. Jis padeda pagrįsti, kokia informacija buvo pateikta mokėjimo ar Rezervacijos patvirtinimo metu.

Šis fiksuotas įrašas naudojamas sutarties vykdymo, vartotojų informavimo, ginčų, mokėjimų, audito, mokesčių ir teisinių reikalavimų tikslais.

Mokėjimo autorizacijos, sėkmingo nurašymo, pakartotinio autorizavimo, grąžinimo ir Užstato administravimo galimybės priklauso nuo Stripe, kortelių tinklų, bankų, mokėjimo priemonės, stipraus kliento autentifikavimo, sukčiavimo prevencijos ir taikomų mokėjimų taisyklių.

Jei pasibaigia mokėjimo autorizacijos galiojimas, autorizacija nepavyksta, yra atšaukiama, reikalauja papildomo patvirtinimo arba nebegali būti panaudota, „Naudokis“ turi teisę prašyti pakartotinio mokėjimo ar autorizacijos, neleisti patvirtinti Rezervacijos, atšaukti Rezervaciją arba taikyti kitą Programėlėje aiškiai nurodytą mokėjimo procesą, kiek tai leidžia taikoma teisė ir vartotojų teisės.

Jokie papildomi privalomi mokesčiai neturi būti pridedami po mokėjimo patvirtinimo, nebent jie buvo aiškiai atskleisti prieš mokėjimą, atsirado dėl Nuomininko vėlesnių veiksmų, pavėluoto grąžinimo, žalos, papildomai užsakytos paslaugos, teisės aktų reikalavimo, mokėjimo ginčo ar kito šiose Sąlygose aiškiai numatyto pagrindo.

### Mokesčiai, PVM, DAC7, atsiskaitymai ir sąskaitos

Jūs atsakote už tai, kad nustatytumėte ir vykdytumėte savo nuomos veiklai taikomas mokesčių, PVM, verslo, apskaitos, prekiautojo, pirkimo, vartotojų apsaugos, produktų saugos ir kitas pareigas. Tai taikoma tiek Verslo nuomotojams, tiek Verslo nuomininkams, kai jie dalyvauja B2B ar kituose verslo tikslais sudaromuose sandoriuose.

„Naudokis“ turi teisę rinkti Nuomotojo, Nuomininko ar Verslo naudotojo mokestinę ir atsiskaitymo informaciją, klasifikuoti mokestinį statusą, prašyti DAC7 deklaracijų ir reikalauti savarankiško sąskaitų išrašymo sutikimo.

Kai taikoma, „Naudokis“ taip pat gali išduoti ar padėti išduoti kvitus, sąskaitas faktūras, kreditines sąskaitas, Platformos mokesčio sąskaitas, Nuomotojo, Nuomininko ar Verslo naudotojo ataskaitas ir mokestines ataskaitas bei teikti privalomą informaciją mokesčių institucijoms.

**Elektroniniai dokumentai.** Kvitai, sąskaitos faktūros, kreditiniai dokumentai ir kiti su Rezervacijomis susiję apskaitos dokumentai išduodami elektronine forma — Programėlėje ir (ar) el. paštu. Naudodamasis Platforma ir sudarydamas Nuomos sandorius, Naudotojas sutinka gauti šiuos dokumentus elektronine forma (įskaitant elektronines PVM sąskaitas faktūras pagal PVM įstatymo 79 straipsnį). Dokumentų autentiškumas, vientisumas ir įskaitomumas užtikrinami per visą jų saugojimo laikotarpį. Naudotojas gali bet kada atsisiųsti savo dokumentus Programėlėje.

**DAC7 ir platformų ataskaitų teikimas.** „Naudokis“ laikoma duomenis teikiančiu platformos operatoriumi tais atvejais, kai per Platformą vykdoma veikla patenka į Tarybos direktyvos (ES) 2021/514 (DAC7) ir ją įgyvendinančių Lietuvos teisės aktų taikymo sritį.

DAC7 taikymas priklauso nuo konkrečios veiklos kategorijos ir teisės aktų. ES DAC7 sistema apima, be kita ko, nekilnojamojo turto nuomą, asmenines paslaugas, prekių pardavimą ir bet kokios transporto priemonės nuomą. Todėl ne kiekviena per Platformą vykdoma daikto nuoma automatiškai laikoma DAC7 praneštine veikla.

„Naudokis“ turi teisę rinkti arba prašyti informacijos siekdama nustatyti statusą, tačiau privalomą ataskaitą teikia tik tiek, kiek numato taikoma teisė.

Tokiais atvejais „Naudokis“ turi teisę rinkti, tikrinti, saugoti ir Valstybinei mokesčių inspekcijai prie Lietuvos Respublikos finansų ministerijos (VMI) teikti teisės aktuose nustatytą informaciją apie praneštinus Naudotojus ir jų per Platformą gautą atlygį.

Priklausomai nuo taikomų teisės aktų ir konkrečios veiklos pobūdžio, deklaruojami duomenys gali apimti vardą ir pavardę arba juridinio asmens pavadinimą, adresą, mokesčių mokėtojo identifikacinį numerį (TIN), PVM mokėtojo kodą, gimimo datą, finansinės sąskaitos identifikatorių, gauto atlygio sumas, sandorių skaičių, Platformos surinktus mokesčius ir kitą privalomą informaciją.

Jeigu konkrečiam Nuomotojui taikomas privalomas ataskaitų teikimas, „Naudokis“, kiek tai numato teisė ir Platformos funkcijos, suteikia galimybę peržiūrėti arba gauti su juo susijusią ataskaitos informaciją.

DAC7 ir kiti mokesčių atitikties įrašai saugomi teisės aktuose nustatytais terminais. Šiame skyriuje pateikta informacija nėra mokestinė konsultacija, o konkretus DAC7 taikymas turi būti vertinamas pagal galiojančius teisės aktus ir jūsų veiklos pobūdį.

**PVM, sąskaitos ir mokestinės ataskaitos.** Kai taikoma, „Naudokis“ turi teisę padėti parengti sąskaitas faktūras, kreditines sąskaitas, Platformos mokesčio sąskaitas, savarankiškai išrašomas sąskaitas ir mokestines ataskaitas pagal Programėlėje nurodytas funkcijas.

B2B sandoriuose Programėlė gali prašyti Verslo nuomotojo ir Verslo nuomininko pateikti juridinį pavadinimą, registracijos numerį, PVM mokėtojo kodą, atsiskaitymo adresą, atsiskaitymo kontaktus ir kitą sąskaitai ar mokesčių atitikties reikalavimams reikalingą informaciją.

PVM, atvirkštinio apmokestinimo, VIES, i.SAF ir kitų mokestinių pareigų taikymas priklauso nuo konkretaus sandorio, šalių statuso, paslaugos ar daikto pobūdžio, teisės aktų ir VMI reikalavimų. „Naudokis“ turi teisę tvarkyti šią informaciją ir teikti duomenis institucijoms, kiek to reikalauja taikoma teisė.

**Savarankiškas sąskaitų išrašymas.** Paleidimo laikotarpiu Platformos mokamų Rezervacijų dokumentai įprastai generuojami per „Naudokis“ savarankiško sąskaitų išrašymo ir atsiskaitymo procesą, kai tokia funkcija taikoma konkrečiam Naudotojui ar sandoriui. Tai gali apimti kvitus, sąskaitas faktūras, kreditines sąskaitas, išmokų dokumentus, Platformos mokesčio dokumentus ir susijusias mokestines ataskaitas.

Nuomotojas, kurio vardu sąskaitas faktūras išrašo „Naudokis“ (sąskaitų išrašymas pirkėjo vardu, angl. self-billing), prieš gaudamas išmokas turi patvirtinti susitarimą dėl sąskaitų išrašymo jo vardu ir pateikti tikslią mokestinę informaciją. Nuomotojas neturi išrašyti dubliuojančių sąskaitų už tą patį Platformos sandorį, nebent to reikalauja teisė arba tai aiškiai suderinta su „Naudokis“ per palaikomą procesą.

Jei Nuomotojas privalo išrašyti papildomą dokumentą pagal teisę, jis atsako už tai, kad dokumentas neprieštarautų Platformos sugeneruotiems įrašams ir neklaidintų Nuomininko.

**„Naudokis“ PVM statusas.** „Naudokis“ PVM mokėtojo statusas Programėlėje skelbiamas pagal taikomos teisės reikalavimus. Apie numatomą statuso pasikeitimą informuojame iš anksto, kai tai reikšminga sąskaitų faktūrų išrašymui.

„Naudokis“ negarantuoja, kad kiekvienas Nuomotojas gali išrašyti PVM sąskaitą faktūrą ar kad Verslo nuomininko patirtos išlaidos bus pripažįstamos leidžiamais atskaitymais, PVM atskaita ar kita mokestine nauda. Tai priklauso nuo Nuomotojo statuso, sandorio pobūdžio, Verslo nuomininko aplinkybių ir taikomų teisės aktų.

„Naudokis“ turi teisę sulaikyti mokėjimus ar išmokas arba riboti Nuomotojo, Nuomininko ar Verslo naudotojo veiklą, jeigu trūksta reikiamos mokestinės, sąskaitų išrašymo, verslo, Stripe ar kitos atitikties informacijos, ji yra netiksli, pasenusi, nepatvirtinta arba apribota. Atitikties priminimai ir taikomos priemonės nurodomos Programėlėje iš anksto.

Šiame skyriuje pateikta informacija nėra mokestinė konsultacija. Dėl konkrečių mokesčių, PVM, apskaitos ar deklaravimo pareigų turėtumėte kreiptis į savo konsultantus.
