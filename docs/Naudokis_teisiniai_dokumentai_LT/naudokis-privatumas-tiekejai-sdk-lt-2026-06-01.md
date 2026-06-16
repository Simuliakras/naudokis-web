---
title: "„Naudokis“ teikėjų, gavėjų, slapukų ir SDK privatumo priedas"
document_type: "privacy_appendix"
language: "lt"
version: "2026-06-01"
effective_date: "2026-06-01"
last_updated: "2026-06-01"
company: "MB Naudokis"
juridical_person_code: "307423504"
canonical_url: "https://naudokis.lt/legal/privatumas-tiekejai-sdk"
document_id: "NAUDOKIS-PRIVACY-VENDORS-SDK-LT-2026-06-01"
---

# „Naudokis“ teikėjų, gavėjų, slapukų ir SDK privatumo priedas

Įsigaliojimo data: 2026 m. birželio 1 d.
Versija: 2026-06-01
Kalba: lietuvių
Paskutinį kartą atnaujinta: 2026 m. birželio 1 d.
Dokumento ID: **NAUDOKIS-PRIVACY-VENDORS-SDK-LT-2026-06-01**

Šis priedas yra „Naudokis“ privatumo politikos dalis ir turi būti aiškinamas kartu su pagrindine Politika.

## 10. Paslaugų teikėjai, gavėjai ir jų vaidmenys

Duomenimis dalijamės tik tiek, kiek būtina šioje Politikoje aprašytiems tikslams. Gavėjo privatumo vaidmuo priklauso nuo konkrečios funkcijos, sutarties ir teisinių pareigų. Kai gavėjas veikia kaip mūsų duomenų tvarkytojas, jis tvarko duomenis pagal mūsų nurodymus ir duomenų tvarkymo sutartį. Kai gavėjas savarankiškai nustato tvarkymo tikslus ar turi savarankiškų teisinių pareigų, jis veikia kaip savarankiškas duomenų valdytojas.

| Gavėjas arba kategorija | Paskirtis | Tipinis privatumo vaidmuo |
| --- | --- | --- |
| AWS ir susijusios infrastruktūros paslaugos | priegloba, saugojimas, autentifikavimas, žurnalai, el. paštas arba SMS, eilės, saugumas ir infrastruktūra | Duomenų tvarkytojas pagal „Naudokis“ nurodymus |
| Stripe arba Stripe Connect | mokėjimai, kortelių ir mokėjimo būdų tvarkymas, autorizavimas, nurašymas, grąžinimai, išmokos, mokėjimo ginčai, KYC, sankcijos, sukčiavimo prevencija, mokesčiai ir finansinė atitiktis | Savarankiškas valdytojas reguliuojamų mokėjimų, KYC, sankcijų, sukčiavimo, mokesčių ir ginčų tikslams; tvarkytojas ar paslaugų teikėjas tik toms techninėms operacijoms, kurias atlieka pagal „Naudokis“ nurodymus |
| Didit | tapatybės patvirtinimas, dokumentų tikrinimas, gyvumo arba dokumento signalai, saugumo ir atitikties signalai | Tvarkytojas, kai veikia pagal „Naudokis“ nurodymus; savarankiškas valdytojas tik tiek, kiek turi savarankiškų teisinių ar saugumo pareigų pagal sutartį ir savo privatumo pranešimą |
| OpenAI ar kiti DI paslaugų teikėjai | DI skelbimų aprašymai, moderavimo pagalba, pagalbos atsakymų projektai ar kitos DI funkcijos, kai jos įjungtos arba kai jomis naudojatės | Tvarkytojas arba paslaugų teikėjas, kai naudojamas pagal „Naudokis“ nurodymus; savarankiškas valdytojas tik tais atvejais, kai teikėjas pats nustato atskirus tvarkymo tikslus pagal savo sąlygas |
| Expo | tiesioginiai pranešimai ir mobiliosios Programėlės techninės paslaugos | Tvarkytojas arba paslaugų teikėjas pagal integracijos pobūdį |
| Postit.lt | serverio pusės adresų paieška, Lietuvos adresų normalizavimas, vietos parinkimas | Įprastai tvarkytojas pagal „Naudokis“ nurodymus |
| Google (Google Places API) | serverio pusės adresų automatinis pildymas ir pasirinkto adreso detalės | Vaidmuo priklauso nuo konkrečių Google sąlygų ir integracijos; duomenys perduodami tik tiek, kiek reikia adreso funkcijai |
| OpenStreetMap Foundation (Nominatim) | serverio pusės atvirkštinis geokodavimas (koordinatės → administracinis vienetas) | Atskiras gavėjas arba paslaugos teikėjas; perduodamos tik koordinatės be tiesioginių paskyros identifikatorių, kiek tai įmanoma |
| Apple, Google ir Facebook | socialinis prisijungimas, kai pasirenkate tokį būdą | Dažnai savarankiški valdytojai savo autentifikavimo ekosistemoms; „Naudokis“ gauna tik prisijungimui būtinus atributus pagal naudotojo pasirinkimą ir teikėjo sąlygas |
| Europos Komisijos VIES sistema | verslo PVM mokėtojo kodo patikra, kai ji reikalinga B2B, sąskaitų išrašymo ar mokesčių atitikties funkcijai | Viešoji paslauga; valdytojas – Europos Komisija ir valstybės narės pagal taikomas taisykles |
| Teisiniai, mokesčių, apskaitos, audito, atitikties, pagalbos ir profesiniai konsultantai | teisės, apskaitos, mokesčių, audito, atitikties ir ginčų klausimai | Dažniausiai savarankiški valdytojai pagal profesines pareigas; kai kuriais atvejais tvarkytojai pagal sutartį |
| Teismai, teisėsauga, mokesčių, vartotojų teisių, duomenų apsaugos ir kitos institucijos | teisiniai prašymai, reguliacinė atitiktis, ginčai, tyrimai | Savarankiški valdytojai pagal teisę |
| Mokėjimo tinklai, bankai ir finansų įstaigos | mokėjimai, mokėjimo grąžinimo ginčai, ginčai, sukčiavimo prevencija | Savarankiški valdytojai arba atskiri gavėjai pagal finansų sektoriaus taisykles |

Toliau pateikiama tikslesnė pagrindinių paleidimo teikėjų apžvalga, įskaitant jų aktyvumą paleidimo metu, vaidmenį ir perdavimo apsaugos priemones:

| Teikėjas | Įjungta paleidimo metu? | Vaidmuo | Perdavimo apsauga |
| --- | --- | --- | --- |
| Stripe arba Stripe Connect | Taip | Savarankiškas valdytojas reguliuojamiems mokėjimams, KYC, sankcijoms, sukčiavimo prevencijai, mokesčiams ir ginčams; ribotai tvarkytojas pagal „Naudokis“ nurodymus, kai tai numato sutartis | Stripe privatumo pranešimas, DPA, SCC, tinkamumo sprendimas arba DPF, kai taikoma |
| Didit | Taip | Tvarkytojas pagal „Naudokis“ nurodymus; savarankiškas valdytojas tik savo savarankiškoms teisinėms ar saugumo pareigoms | DPA arba SCC pagal sutartį, kai taikoma |
| AWS | Taip | Tvarkytojas | Priegloba EEE (eu-north-1, Stokholmas) + DPA |
| Expo | Kai įjungti tiesioginiai pranešimai | Tvarkytojas arba paslaugų teikėjas | DPA arba SCC, kai taikoma |
| OpenAI | Kai įjungtos DI funkcijos | Tvarkytojas arba paslaugų teikėjas pagal „Naudokis“ nurodymus, jei naudojamas per verslo arba API sąlygas | DPA, SCC arba kitos taikomos perdavimo apsaugos priemonės |
| Postit.lt | Taip | Tvarkytojas | Tvarkoma Lietuvoje arba EEE, pagal sutartį |
| Google (Places API) | Taip | Vaidmuo priklauso nuo Google sąlygų ir integracijos | DPA, SCC, tinkamumo sprendimas arba DPF, kai taikoma |
| OpenStreetMap Nominatim (OSMF) | Taip | Atskiras gavėjas arba paslaugos teikėjas | Perduodamos tik koordinatės be tiesioginių paskyros identifikatorių, kiek tai įmanoma |
| Europos Komisijos VIES | Kai naudojamos VIES funkcijos | Viešoji paslauga; valdytojas – Europos Komisija ir valstybės narės | Tvarkoma ES |
| Amplitude | Ne, nebent aktyvuota su taikomu sutikimu | Tvarkytojas | Sutikimas + DPA arba SCC, kai taikoma |
| Sentry | Kai sukonfigūruota diagnostikai | Tvarkytojas | DPA arba SCC, kai taikoma; kiek įmanoma maskuojami nereikalingi asmens duomenys |
| Socialinis prisijungimas (Apple, Google, Facebook) | Kai pasirenkamas | Dažnai savarankiški valdytojai savo autentifikavimo paslaugoms | Teikėjo sąlygos, SCC arba kitos apsaugos, kai taikoma |

Su paslaugų teikėjais, kurie veikia kaip mūsų duomenų tvarkytojai, sudarome duomenų tvarkymo sutartis arba taikome lygiavertes sutartines apsaugos priemones, įskaitant Europos Komisijos standartines sutarčių sąlygas, kai duomenys perduodami už Europos ekonominės erdvės ribų. Prieš pradėdami naudoti naują tvarkytoją asmens duomenims tvarkyti, tokias sutartis sudarome iki atitinkamo tvarkymo pradžios.

Jeigu gavėjas veikia kaip savarankiškas duomenų valdytojas, jo tvarkymui taikomi jo privatumo pranešimai, teisės aktuose nustatytos pareigos ir sutartinės sąlygos. Tokiu atveju „Naudokis“ perduoda tik tuos duomenis, kurie būtini konkrečiai funkcijai, teisinei pareigai, mokėjimui, patvirtinimui, ginčui ar saugumo tikslui.

### 22.2 Priedas B: teikėjų, gavėjų ir vaidmenų santrauka

„Naudokis“ pasitelkia išorės paslaugų teikėjus tik tiek, kiek reikia konkrečiai funkcijai. Teikėjo vaidmuo priklauso nuo funkcijos, sutarties ir teisės reikalavimų.

Kai teikėjas veikia kaip duomenų tvarkytojas, jis tvarko duomenis pagal „Naudokis“ nurodymus ir sutartį. Kai teikėjas veikia kaip savarankiškas duomenų valdytojas, jis savarankiškai nustato tam tikrus tvarkymo tikslus ir priemones, pavyzdžiui, dėl mokėjimų reguliavimo, KYC, sukčiavimo prevencijos, sankcijų ar savo teisinių pareigų.

| Teikėjas arba gavėjas | Tipinė funkcija | Tipinis vaidmuo | Pastaba |
| --- | --- | --- | --- |
| Stripe ir Stripe Connect | Mokėjimai, išmokos, KYC, mokėjimų ginčai, sukčiavimo ir sankcijų patikros | Dažnai savarankiškas valdytojas reguliuojamų mokėjimų, KYC, AML, sankcijų, ginčų ir mokesčių tikslais; kai kuriose techninėse funkcijose gali veikti pagal sutartinius vaidmenis | Naudotojui gali būti taikomi Stripe pranešimai ir sąlygos |
| Didit | Tapatybės, amžiaus ar dokumento patvirtinimas | Tvarkytojas, kai veikia pagal „Naudokis“ nurodymus; savarankiškas valdytojas tik tiek, kiek turi savarankiškų teisinių ar saugumo pareigų. „Naudokis“ saugo tik būtinus rezultatus ir audito informaciją, o ne nuolatinį neapdorotų dokumentų archyvą, nebent tai būtina ir teisėta | Kai kurie dokumentų arba biometrinio tikrinimo duomenys gali būti tvarkomi Didit pagal jo technologiją ir teisines pareigas |
| AWS | Infrastruktūra, duomenų saugojimas, žurnalai | Įprastai duomenų tvarkytojas arba infrastruktūros teikėjas | Pagrindinis regionas nurodytas Politikoje, su galimais ribotais perdavimais pagal apsaugos priemones |
| OpenAI ar kiti DI teikėjai | DI pagalba skelbimų tekstams, pagalbai, klasifikavimui ar moderavimo pagalbiniams signalams, kai funkcija įjungta | Priklauso nuo konkrečios paslaugos konfigūracijos ir sutarties | Nenaudojama jautriems ar nebūtiniems tikslams be tinkamo pagrindo; žmogaus peržiūra taikoma reikšmingiems sprendimams, kai to reikia |
| Google, Apple ar socialinio prisijungimo teikėjai | Prisijungimas, autentifikavimas, įrenginio ar paskyros funkcijos | Įprastai savarankiški valdytojai savo paskyrų ir saugumo tikslais | Taikomi jų privatumo pranešimai |
| Google Places, OpenStreetMap arba Nominatim ar kiti vietos teikėjai | Adresų paieška, normalizavimas, apytikslė vieta, geokodavimas | Priklauso nuo teikėjo ir funkcijos | Perduodami tik konkrečiai funkcijai būtini duomenys, kiek įmanoma be tiesioginių identifikatorių |
| Expo, Sentry, CloudWatch ir panašūs techniniai teikėjai | Push pranešimai, diagnostika, klaidos, saugumas, techninis stabilumas | Įprastai tvarkytojai ar techniniai paslaugų teikėjai pagal funkciją | Griežtai būtini arba diagnostiniai duomenys ribojami pagal poreikį |
| Valstybinės institucijos, teismai, teisėsauga, VMI, vartotojų ar duomenų apsaugos institucijos | Teisinės pareigos, prašymai, ginčai, DAC7, mokesčiai, tyrimai | Savarankiški gavėjai arba institucijos | Duomenys teikiami, kai to reikalauja teisės aktai arba yra teisėtas pagrindas |

„Naudokis“ palaiko vidinį teikėjų registrą, kuriame dokumentuojamas teikėjo pavadinimas, funkcija, duomenų kategorijos, vaidmuo, sutartinis pagrindas, tarptautinio perdavimo mechanizmas, saugojimo principai ir gamybinio aktyvavimo būsena. Vieša Politika turi atitikti realiai naudojamus teikėjus.

Prieš pradedant realiai naudoti naują paslaugų teikėją, kuris tvarko asmens duomenis, „Naudokis“ turi įvertinti jo vaidmenį, duomenų kategorijas, saugumo priemones, sutartinį pagrindą, tarptautinio perdavimo mechanizmą ir tai, ar reikia atnaujinti šią Politiką ar viešą teikėjų sąrašą.

Jeigu Politikoje paminėtas teikėjas ar funkcija faktiškai dar nenaudojama, duomenys tokiam teikėjui neteikiami tol, kol funkcija nėra įjungta ir nėra atliktas būtinas atitikties vertinimas.

„Naudokis“ turi teisę skelbti atskirą viešą teikėjų arba subtvarkytojų sąrašą arba įtraukti jį į šią Politiką. Toks sąrašas turi būti suderintas su realiais gamybiniais teikėjais ir reguliariai peržiūrimas, ypač kai įjungiami mokėjimų, tapatybės patvirtinimo, analitikos, diagnostikos, DI, žemėlapių, pranešimų ar komunikacijos įrankiai.

### 22.3 Priedas C: slapukai, SDK, vietinė saugykla ir mobiliosios technologijos

„Naudokis“ pirmiausia veikia kaip mobilioji Programėlė, todėl vietoje tradicinių interneto svetainės slapukų gali būti naudojama vietinė įrenginio saugykla, SDK identifikatoriai, sesijos žetonai, tiesioginių pranešimų žetonai, diagnostikos įvykiai, saugumo žurnalai ir panašios technologijos.

Griežtai būtinos technologijos naudojamos autentifikavimui, sesijai, paskyros saugumui, sukčiavimo prevencijai, mokėjimo eigai, kalbos ir nustatymų išsaugojimui, tiesioginių pranešimų techniniam pristatymui, klaidų aptikimui ir Platformos stabilumui. Šios technologijos naudojamos sutarties vykdymo, teisėto intereso ar teisinės pareigos pagrindu, kai atskiro sutikimo nereikalaujama.

Nebūtina produkto analitika, rinkodaros, atribucijos, remarketingo ar panašios technologijos naudojamos tik tada, kai yra tinkamas teisinis pagrindas, įskaitant sutikimą, kai jo reikalauja teisė. Jei Naudotojas atsisako nebūtinos analitikos ar rinkodaros, vien toks atsisakymas netrukdo naudotis pagrindinėmis Platformos funkcijomis, nebent konkreti papildoma funkcija objektyviai priklauso nuo pasirinktos technologijos.
