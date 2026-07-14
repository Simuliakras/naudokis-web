# Naudokis bridge website copy audit

Date: 2026-07-14  
Scope: Lithuanian and English website copy, metadata, backend-authored category SEO, marketplace trust, conversion, mobile/app handoff, transactional fallbacks, consent, legal navigation, forms, errors and empty states.

## Executive verdict

The copy system is substantially more mature than a typical pre-launch marketplace. It is clear about the web/app division, avoids fabricated ratings, exposes fees and deposits before payment, names Stripe, distinguishes private and business owners, and has unusually careful legal and privacy copy. Most operational states are covered in both languages.

It is not yet launch-safe as a premium trust proposition. The Lithuanian homepage materially overstates verification and risk reduction; all 141 backend category records use “secure booking / saugi rezervacija” and the prohibited English verb “book”; 36 category records make unsubstantiated faster/cheaper/greener comparisons; Lithuanian subcategory-plus-city pages can be grammatically broken; app handoff pages sometimes imply that an unverified record exists; and the install-attribution prompt understates the AppsFlyer processing described in the Privacy Policy.

The key strategic issue is not lack of polish. It is that the legal copy is precise while the highest-converting marketing surfaces are occasionally more absolute. The product should sound confident because it is specific, not because it implies zero risk.

## Audit coverage

- Homepage, navigation, hero search, category and listing bands, trust band, how-it-works summary, app CTA, FAQ and footer.
- Full categories page, listings feed, search/filter/sort/pagination, top-level category, subcategory, city and category/subcategory-plus-city SEO landings.
- Live listing cards and listing detail: owner identity, price, deposit, cancellation, insurance, delivery, reviews, save/share/contact/reserve CTAs and related listings.
- Full renter and owner journeys on “How it works,” including both FAQ sets.
- App redirect modal, QR/store routes, direct `/go` behavior, invite, booking/reservation, chat, review, billing documents, profile, rewards, reset-password and verify-email handoffs.
- Account-deletion document and cancellation states; consent and privacy-choice dialogs.
- Offline, timeout, server, empty, gone, invalid, not-found, global-error and clipboard/share failure behavior.
- Home/page/listing/category SEO titles, descriptions, canonical landing templates, manifest copy and structured-data source copy.
- Terms of Use and Privacy Policy as the source of truth for verification, payments, deposits, disputes, refunds, insurance, business status and attribution claims.
- Rendered desktop and 390 px mobile states. No meaningful visible-copy clipping was found at the tested mobile width.

## Findings ledger

Unchanged copy is intentionally omitted. Each row is a material improvement, not a synonym swap.

| ID | Page or component | Current copy | Problem | Recommended replacement | Reason | Priority |
|---|---|---|---|---|---|---|
| F01 | LT homepage hero badge | “Nuoma iš patvirtintų naudotojų” | Says the marketplace is made up of verified users. The Terms say checks may be required for certain functions and that not every user or item is physically checked. It is stronger than the safer English version. | “Patikros aiškiai rodomos profiliuose” | Describes the visible product signal without implying universal verification or safety. | critical |
| F02 | EN homepage hero badge | “Clear profile verification signals” | Accurate but abstract and internal-sounding; “signals” does not tell a renter what they can do. | “See verification on profiles” | Short, human and benefit-led while preserving the qualification. | medium |
| F03 | LT trust-band heading | “Nuoma, kuri nesijaučia rizikinga” | Implies that risk has been removed or neutralised. The Terms explicitly disclaim insurance and inspection of every item. | “Aiškesnės sąlygos prieš rezervuojant” | Premium trust comes from clarity, not a safety promise. Aligns with English. | critical |
| F04 | LT trust feature | “Patikima bendruomenė” / “Tiek nuomininkų, tiek savininkų tapatybė patvirtinama…” | Universal identity-verification claim, contradicted by conditional wording in the Terms and by the English copy. | “Matomos patikros” / “Kai naudotojo tapatybė patvirtinta, tai aiškiai pažymima profilyje. Prieš kai kurias rezervacijas gali būti reikalingos papildomos patikros.” | Truthful, specific and bilingual-consistent. | critical |
| F05 | LT fee feature | “Jokių netikėtų mokesčių” / “…be papildomų susitarimų žinutėse.” | Absolute promise. The Terms allow platform, owner, renter, deposit-processing, delivery and other disclosed fees. Delivery can also be arranged. | “Visa suma prieš mokant” / “Prieš mokėdami programėlėje matysite nuomos kainą, taikomus mokesčius, pristatymo mokestį, jei jis taikomas, užstatą ir bendrą sumą.” | Makes the actual transparency promise and names the components. | high |
| F06 | EN fee feature | “Reservation amount before payment” / singular “platform fee” | Stiff label and singular fee may underdescribe applicable fees. | “Full amount before payment” / “Before paying in the app, you’ll see the rental price, applicable fees, delivery charge if any, deposit and total amount.” | Natural English and consistent with the Terms. | medium |
| F07 | Both trust bands | “Help when things are unclear” and equivalent LT | Reassurance is vague and does not say what support can do or what decisions rely on. | LT: “Pagalba kilus klausimui ar ginčui” / “Naudokis komanda paaiškina procesą ir padeda pateikti reikalingą informaciją. Ginčai vertinami pagal taisykles ir abiejų pusių įrodymus.” EN: “Help with questions and disputes” / “The Naudokis team explains the process and helps you provide the relevant information. Disputes are assessed under the rules and evidence from both sides.” | Specific without promising a favourable outcome. | high |
| F08 | Homepage positioning | No plain-language statement of Naudokis’s legal/product role | The site says it “connects” people, but does not plainly say near the conversion path that the rental is between renter and owner and that Naudokis is the platform. | Add trust note: LT “Naudokis yra daiktų nuomos platforma. Nuomos sandorį sudaro nuomininkas ir savininkas; Naudokis padeda su paieška, rezervacija, mokėjimu ir ginčo procesu.” EN equivalent below. | This is a core marketplace objection and reduces the chance that users infer Naudokis owns, inspects or insures items. | critical |
| F09 | Hero owner CTA, listing-feed owner CTA | “Įkelkite skelbimą” / “List it for rent” | Opens an app-install bridge, not a web listing form. The current CTA hides the next step. | “Paskelbti programėlėje” / “List it in the app” | Sets an accurate expectation before the click. | high |
| F10 | Homepage how-it-works step 1 | “per kelias minutes paskelbkite” / “list your own in just a few minutes” | Unsupported speed claim. | “Naršykite daiktus netoliese arba paskelbkite savąjį programėlėje.” / “Browse items nearby or list your own in the app.” | Removes a claim that is not evidenced and names the required channel. | medium |
| F11 | Homepage FAQ, Lithuania-wide availability | “Taip… rasti reikalingą daiktą Vilniuje, Kaune, Klaipėdoje ir kituose miestuose.” | Live audited inventory was concentrated in Vilnius. The answer implies current availability in named cities. | “Ieškoti galite visoje Lietuvoje. Pasiūlymų skaičius priklauso nuo miesto ir kategorijos, todėl kai kuriose vietose pasirinkimas dar gali būti ribotas.” | Honest launch-stage liquidity framing. | high |
| F12 | EN availability FAQ | “Yes… help you find items in Vilnius, Kaunas, Klaipėda and other cities.” | Same implied-inventory problem. | “You can search across Lithuania. Availability depends on the city and category, so some areas may still have a limited selection.” | Transparent without underselling national coverage. | high |
| F13 | Homepage price FAQ | “Savininkai gali… naudotis rekomendacijomis” / “use recommendations” | Claims a recommendation feature without explaining it and may be false if not live for all owners. | Q: “Kas nustato kainą ir užstatą?” A: “Kainą ir užstatą nustato savininkas. Konkrečios rezervacijos nuomos kainą, mokesčius, užstatą ir bendrą sumą matysite programėlėje prieš mokėdami.” EN equivalent below. | Answers the trust question directly and removes an unverifiable feature claim. | high |
| F14 | Homepage FAQ coverage | No concise cancellation/refund answer; damage answer only appears on the full how-it-works page | Users are asked to install before the site answers two of the highest-risk marketplace objections. | Add “Kas nutinka atšaukus rezervaciją?” and “Kas nutinka, jei daiktas sugadinamas?” using the production copy below. | Conditions should be discoverable before app install, not only in Terms. | high |
| F15 | Reviews trust signal | “ankstesnių nuomų atsiliepimai” / “reviews from previous rentals” | Misses the strongest truthful reassurance: only parties to completed platform reservations can review. | LT: “Atsiliepimus gali palikti tik per Naudokis užbaigtos rezervacijos dalyviai.” EN: “Only people who completed a reservation through Naudokis can leave a review.” | More specific and more defensible than generic social proof. | high |
| F16 | All 141 backend category records | “rezervuokite saugiai” / “secure booking,” plus “Saugi rezervacija…” | Every record makes a broad safety claim. Naudokis does not inspect every item and does not provide insurance by default. | Replace with “rezervuokite programėlėje, prieš mokėdami matydami taikomas sąlygas” / “reserve in the app with the applicable terms shown before payment.” | Removes unsupported safety positioning from every SEO landing and metadata surface. | critical |
| F17 | All 141 EN category records | “book,” “booking” | Violates the site’s own terminology rule (“reserve,” never “book”) and diverges from core UI. | Replace every verb/noun instance with “reserve,” “reservation” as appropriate. | Terminology consistency is essential across SEO entry pages and app conversion. | critical |
| F18 | 36 backend category records | “faster, cheaper and more sustainable than buying new” and LT variants | Comparative environmental, cost and speed claims have no evidence or qualification. | Use need-based language: “If you only need [item] for a short time, renting lets you use it without buying one.” | Specific, useful and supportable. | high |
| F19 | 37 LT category records | “savininkams - ramiau…” | ASCII hyphen, translated sentence shape and awkward “ramiau dalintis daiktais.” | Remove the sentence. Use the common factual close in the production template. | Immediate signal of low-quality localisation on SEO landings. | high |
| F20 | LT subcategory + city landing templates | Examples can resolve as “Elektriniai įrankiai nuoma Vilniuje” and “Naršykite elektriniai įrankiai nuomos…” | The inflected label map covers only top-level categories; subcategories fall back to nominative, creating broken Lithuanian H1s, titles and descriptions. | Derive the city H1 from the already-authored genitive SEO title: `{seoTitle without final “ nuoma”} nuoma {city locative}`. Body: `Peržiūrėkite kategorijos „{nominative name}“ nuomos pasiūlymus {city locative}.` | Fixes every subcategory/city combination without unreliable runtime declension. | critical |
| F21 | Category meta descriptions | 126/141 LT descriptions and 54/141 EN descriptions exceed 160 characters; five LT titles exceed 60 | Search snippets will truncate and bury the differentiator/CTA. Many descriptions are also grammatically broken after a colon (“Transporto nuoma Lietuvoje: automobilius…”). | Use the short metadata templates below; enforce 150–158 characters for descriptions and about 55–60 for titles. | SEO clarity and quality, not merely character-count compliance. | high |
| F22 | Category landing intros | Long three-sentence generic paragraphs repeat examples and mix renter/owner messaging | Poor scanability, obvious templating and keyword padding. On mobile, the result grid is pushed down. | Use a two-sentence intro: category-specific first sentence + common comparison/app sentence below. | Improves entry-page comprehension and keeps inventory near the top. | high |
| F23 | Category/city empty state | “Naršykite kitas kategorijas arba paskelbkite daiktą ir padėkite pradėti šią kategoriją.” / equivalent EN | City empty state incorrectly talks about starting “this category.” | LT: “Peržiūrėkite pasiūlymus kituose miestuose arba paskelbkite pirmąjį daiktą šiame mieste.” EN: “Browse listings in other cities or be the first to list an item here.” | Corrects a state/content mismatch. | high |
| F24 | Category empty state | “padėkite pradėti šią kategoriją” | Calqued and unnatural Lithuanian. | “Peržiūrėkite kitas kategorijas arba būkite pirmi – paskelbkite daiktą šioje kategorijoje.” | Natural, motivating and specific. | medium |
| F25 | Listing-band/feed empty state | “Nauji daiktai atsiranda nuolat.” / “New items are added all the time.” | Unverifiable recency/velocity claim, especially risky at launch. | “Pasiūlymų čia dar nėra. Peržiūrėkite kategorijas arba užsukite vėliau.” / “There are no listings here yet. Browse the categories or check back later.” | Objective and honest. | medium |
| F26 | Listing detail deposit card | “Užstato sąlygos ir grąžinimas” under a card that only shows “500 €” | Implies the web page contains terms and refund information when it only shows the amount. | “Užstatas; jo panaudojimo ir grąžinimo sąlygos rodomos programėlėje prieš mokant.” / EN equivalent. | Important conditions should not appear to be present when they are not. | high |
| F27 | Listing detail cancellation card | “Griežta” + “Peržiūrėkite terminus prieš mokėdami” | “Strict” is not self-explanatory; the user cannot compare refund consequences without installing. | “Griežta atšaukimo politika” + “Tikslius terminus ir grąžinamą sumą matysite programėlėje prieš mokėdami.” | Preserves app conversion while stating what remains unknown. | high |
| F28 | Identity pill | “Tapatybė patikrinta” / “Identity checked” | Terminology differs from homepage “patvirtinta,” and no nearby explanation limits the meaning of the badge. | Standardise to “Tapatybė patvirtinta” / “Identity verified.” Add trust help: “Patvirtinta tapatybė nepatvirtina daikto būklės ar garantuoto sandorio.” | Makes the signal clear without letting it stand in for item safety. | high |
| F29 | Listing owner contact CTA | “Paklausti savininko” / “Ask the owner” | Opens an app bridge; the channel switch is hidden. | “Rašyti savininkui programėlėje” / “Message the owner in the app” | Accurate expectation at the action point. | high |
| F30 | Review empty labels | “Atsiliepimų nėra,” “Atsiliepimų dar nėra,” “Šis daiktas dar neturi atsiliepimų” | Three variants for the same state add noise. | Card/pill: “Atsiliepimų dar nėra.” Section title: “Šis daiktas dar neturi atsiliepimų.” Keep section body. EN: “No reviews yet” / “No reviews for this item yet.” | Consistent hierarchy without gratuitously flattening every context. | polish |
| F31 | Seeded listing descriptions | “stiprus ir patikimas,” “be streso,” “Nuoma taupo pinigus,” “Idealus pasirinkimas,” “Draugiškas pristatymas ir aiškios sąlygos” | Promotional, repetitive, partially unverifiable owner content undermines the premium marketplace tone. “rezervuosime laiką” also bypasses the platform language. | Use factual fields: condition, included equipment, known defects, usage limits, insurance provider/cover, delivery method and prohibited use. End with “Dėl perdavimo detalių parašykite programėlėje.” | Seed inventory sets the quality norm for future owner copy. | high |
| F32 | Default app bridge opened from nav | “Tęskite nuomą programėlėje” / “Continue this rental in the app” | The user may only be asking to download the app and may be an owner. The body is renter-only despite a “role-neutral” code comment. | “Tęskite programėlėje” / “Continue in the app,” with the role-neutral body below. | Avoids inventing an active rental and supports both sides. | high |
| F33 | Deep-link fallback hint | “Niekas neatsidarė? Vadinasi, programėlės dar neturite…” / “Nothing happened? Then you don’t have the app yet…” | False inference: the app may be installed but the scheme may fail, be blocked or be unsupported on desktop. | “Programėlė neatsidarė? Bandykite dar kartą. Jei jos neturite, pasirinkite programėlių parduotuvę žemiau.” / EN equivalent. | Accurate troubleshooting and calmer tone. | high |
| F34 | Deep-link fallback install block | Hint above + “Neturite programėlės? Atsisiųskite nemokamai.” + store badges + another install button | Repeats the same message and presents three competing install paths. | Keep one hint, store badges and desktop QR. Remove the repeated lead or use “Pasirinkite savo įrenginį.” / “Choose your device.” | Reduces decision friction. | medium |
| F35 | Booking-request handoff | “Jūsų rezervacijos užklausa laukia programėlėje” / “Your booking request is in the app” | The page deliberately does not validate the record, yet the headline implies a record exists. English also breaks “reserve, never book.” | “Atidarykite rezervacijos užklausą programėlėje” / “Open the reservation request in the app.” | Describes intent only, as the security design requires. | critical |
| F36 | Billing/profile handoffs | “Mokėjimų dokumentus rasite…” / “Your payment documents are available…” and similar existence language | Same unverified-record problem on fabricated or expired IDs. | Use intent verbs: “Atidarykite mokėjimo dokumentus programėlėje” / “Open billing documents in the app.” Use “Open a profile…” rather than “Profiles are in the app.” | Prevents false certainty and keeps all IDs indistinguishable. | high |
| F37 | Account-deletion cancellation | “kol nesibaigė laikinasis laikotarpis” / “before the grace period ends” | Awkward Lithuanian and omits the known, critical 30-day deadline on an irreversible action. | LT: “Paskyros trynimą galite atšaukti per 30 dienų nuo prašymo pateikimo. Patvirtinkite žemiau, jei norite išsaugoti paskyrą.” EN equivalent below. | Critical condition must be stated at the decision point. | critical |
| F38 | Invalid/already-used deletion link | “susisiekite su mumis” without an inline route; “already processed or canceled” leaves the outcome unclear | GDPR-critical dead end and ambiguous status. | Include `info@naudokis.lt` in the body; for already-used: “Nuoroda jau panaudota arba 30 dienų terminas baigėsi. Jei negalite prisijungti, parašykite…” | Gives a concrete recovery path without claiming an unknown state. | high |
| F39 | Install-attribution consent | “AppsFlyer will receive technical install and campaign information” | The Privacy Policy also describes attribution identifiers, selected conversion events and a completed-rental revenue/value event. The prompt is materially narrower than the policy. | Use the full concise disclosure below, including selected in-app events and rental value where enabled. | Consent copy must be specific enough to be informed. | critical |
| F40 | Privacy choices dialog | “measure which campaign or referral led to an app installation” | Same underdescription and the scope note can make the setting sound unrelated to later app attribution. | “Allow AppsFlyer to connect the install with its campaign or referral and, where enabled, selected app conversion events.” Add a direct Privacy Policy link. | Aligns the control with the disclosed processing. | critical |
| F41 | Account-deletion document terminology | “socialiniu prisijungimu,” “push žetonai,” “Mėgstamiausi”; EN “bookings,” “Favorites” | Lithuanian is translated/technical, and both languages diverge from product terms “Įsiminti/Save” and “rezervacija/reservation.” | “prisijungdami per „Apple“, „Google“ ar „Facebook“”; “programėlės pranešimų identifikatoriai”; “įsiminti daiktai”; EN “reservations,” “saved items.” | Natural localisation and cross-product consistency. | medium |
| F42 | Invite code and share failures | Clipboard/share exceptions leave the UI unchanged | No visible error copy when copying is blocked; users may assume success or repeatedly tap. | Add “Nepavyko nukopijuoti. Pažymėkite kodą ir nukopijuokite rankiniu būdu.” / “Couldn’t copy. Select the code and copy it manually.” For share: “Nepavyko bendrinti nuorodos.” / “Couldn’t share the link.” | Completes error-state coverage. | medium |
| F43 | Web app manifest | “daiktų nuoma iš žmonių šalia” / “iš žmonių šalia” | Excludes business owners and implies nearby supply. | Name: “Naudokis – daiktų nuoma Lietuvoje.” Description below. | Consistent marketplace positioning in install surfaces. | medium |
| F44 | Footer/help information architecture | Policies and “How it works” exist, but no concise “Safety, deposits and disputes” route/link | Trust-critical information is scattered between the how-it-works page, FAQ and long Terms. | Add footer link “Saugumas, užstatai ir ginčai” / “Safety, deposits & disputes” to a dedicated section on the how-it-works page. | Makes reassurance discoverable without creating a new policy document. | high |
| F45 | Current page order | Hero → categories → live listings → trust → process → app → renter FAQ | Inventory proof is useful, but the homepage gives owners one small hero link and then becomes renter-heavy; marketplace role and risk limits arrive late. | Recommended order below. | Better balances liquidity proof, trust and both marketplace sides. | high |
| F46 | EN Terms, Privacy Policy and account-deletion document | 91 visible uses of “Booking/booking,” including the defined terms “Booking” and “Booking Request” | Core product copy explicitly standardises on “reserve/reservation,” but the legal centre introduces a second conversion vocabulary. The account-deletion page also uses “bookings.” | With legal sign-off, rename the defined terms to “Reservation” and “Reservation Request” and update all cross-references. If legal must retain “Booking,” remove the “never book” product rule and use one term everywhere; the recommended direction is “reservation.” | Users should not have to decide whether a booking and a reservation are different states or contracts. | high |
| F47 | EN language style | “cancelled” in handoffs/Terms but “canceled” in deletion states; “anonymized” in account deletion but “anonymised” in Privacy Policy | Mixed US/UK spelling on closely related legal and account surfaces. `ogLocale` is `en_GB` and most legal copy already follows British spelling. | Standardise user-facing English on British spelling: “cancelled,” “anonymised,” “authorisation,” while retaining product terms “saved items” rather than forcing “favourites.” | A single editorial standard makes the English experience feel authored rather than assembled. | medium |

## What should remain unchanged

- Hero headlines in both languages. They are distinctive, immediate and easy to scan.
- “Naršykite internete. Rezervuokite programėlėje.” / “Browse online. Reserve in the app.” This is the clearest expression of the bridge model.
- Search labels and placeholders, navigation labels, category tile examples and official store-badge alt text.
- Payment wording that names Stripe as the processor rather than implying Naudokis holds funds.
- The Terms’ explicit statements that the deposit is not insurance or a liability cap, disputes are evidence-based, and Naudokis is generally not the rental-contract party.
- The listing insurance wording “Savininkas pažymėjo draudimą” plus the prompt to check provider, cover and exclusions.
- Invite validity/reward conditions, invalid-code explanation and the statement that the reward does not depend on attribution consent.
- Offline, timeout, server, missing-listing, search-empty, 404 and generic page-error copy. It is calm, actionable and preserves user input where relevant.
- Refusal to fabricate testimonials or aggregate ratings. The live no-review state is better than invented social proof.
- Low-stock SEO landings being `noindex,follow`; this is sound launch SEO governance.

## Strongest and weakest parts

### Strongest

1. The bridge proposition: browse on web, complete dates/payment in app.
2. Legal precision around Stripe, deposits, evidence, insurance and platform role.
3. Honest no-review and no-inventory states rather than fabricated trust signals.
4. Invite and account-action privacy architecture: sensitive IDs are not loaded or exposed to attribution vendors.
5. English product terminology in the core dictionaries is mostly disciplined and natural.

### Weakest

1. Backend category SEO copy: all 141 records need a claim and terminology pass; most metadata is too long.
2. Lithuanian trust marketing: it overclaims verification and reduced risk compared with both English and the Terms.
3. Liquidity language: the FAQ and some empty states imply supply velocity/geographic availability that the audited catalogue does not demonstrate.
4. App fallback copy: false diagnosis, duplicate install prompts and unverified record-existence language.
5. Missing concise, pre-install answers for cancellation, refund, damage and what identity verification actually means.
6. English terminology is split between “reservation” in the product and 91 “Booking/booking” references in legal/account documents.

## Launch-blocking issues

1. Remove universal verification and “not risky” claims from the LT hero/trust band.
2. Replace “secure booking / saugi rezervacija” and “book/booking” across all 141 backend category records.
3. Fix the Lithuanian subcategory-plus-city grammar path before those pages are indexable.
4. Align the AppsFlyer consent and privacy-choice dialogs with the processing described in the Privacy Policy.
5. Remove existence claims from transactional handoff pages that intentionally do not validate records.
6. Put the 30-day cancellation deadline directly on the account-deletion cancellation screen.
7. Replace category metadata that is grammatically broken or above practical snippet lengths.

## Recommended website narrative and section order

1. **Hero:** what can be rented, where, and the web/app division. Keep search and store badges.
2. **Marketplace role note:** one concise sentence stating that renters rent from private/business owners and Naudokis provides platform tools.
3. **Live categories and listings:** immediate proof that there is something to browse.
4. **Why Naudokis:** verification shown on profiles, full amount before payment, evidence-based help; include the limits of each signal.
5. **Choose your side:** two equal cards: “Noriu išsinuomoti / I want to rent” and “Noriu išnuomoti / I want to list,” each with a role-specific CTA.
6. **How it works:** role-specific three/four-step summary; link to full journey.
7. **Safety, deposits and disputes:** payment, deposit, cancellation/refund, damage evidence, insurance limitation and completed-reservation reviews.
8. **App conversion:** “Browse online. Reserve in the app,” with QR on desktop and one primary smart-install action on mobile.
9. **FAQ:** start with platform role, then fees/total, cancellation/refund, damage/deposit, verification, availability and business sellers.
10. **Footer:** categories, cities, how it works, safety/deposits/disputes, Terms, Privacy, account deletion and direct support contacts.

## Production-ready replacement copy

Only affected copy is listed. All other current strings should remain.

### 1. Global terminology

| Concept | Lithuanian | English |
|---|---|---|
| Person renting | nuomininkas | renter |
| Person/business offering item | savininkas in UI; explain that this may be a private or business owner | owner; private owner / business owner when status matters |
| Ad/page | skelbimas in owner creation; nuomos pasiūlymas in renter discovery | listing |
| Conversion verb | rezervuoti | reserve |
| Request | rezervacijos užklausa | reservation request |
| Deposit | užstatas; “grąžintinas” only with conditions or “užstatas, jei taikomas” | deposit; “refundable” only with conditions |
| Saved state | įsiminti / įsiminti daiktai | save / saved items |
| Verification badge | Tapatybė patvirtinta | Identity verified |
| App | programėlė | app |

Never use “saugi rezervacija,” “secure booking,” “book/booking,” “risk-free,” “fully protected,” or universal “verified users.”

In the English legal documents, replace the defined terms “Booking” and “Booking Request” with “Reservation” and “Reservation Request” throughout after legal review. Use British spelling consistently (`cancelled`, `anonymised`, `authorisation`).

### 2. Homepage: Lithuanian

**Hero badge**  
Patikros aiškiai rodomos profiliuose

**Hero body**  
Raskite įrankius, transportą, foto techniką ar laisvalaikio įrangą iš privačių ir verslo savininkų Lietuvoje. Palyginkite pasiūlymus svetainėje, o datas, galutinę sumą ir mokėjimą patvirtinkite programėlėje.

**Owner prompt and CTA**  
Daiktas stovi nenaudojamas?  
Paskelbti programėlėje

**Marketplace role note**  
Naudokis yra daiktų nuomos platforma. Nuomos sandorį sudaro nuomininkas ir savininkas; Naudokis padeda su paieška, rezervacija, mokėjimu ir ginčo procesu.

**Trust header**  
Kodėl Naudokis  
Aiškesnės sąlygos prieš rezervuojant

**Trust cards**

1. **Matomos patikros**  
   Kai naudotojo tapatybė patvirtinta, tai aiškiai pažymima profilyje. Prieš kai kurias rezervacijas gali būti reikalingos papildomos patikros.
2. **Visa suma prieš mokant**  
   Programėlėje matysite nuomos kainą, taikomus mokesčius, pristatymo mokestį, jei jis taikomas, užstatą ir bendrą sumą.
3. **Pagalba kilus klausimui ar ginčui**  
   Naudokis komanda paaiškina procesą ir padeda pateikti reikalingą informaciją. Ginčai vertinami pagal taisykles ir abiejų pusių įrodymus.

**How-it-works summary**

- “Naršykite daiktus netoliese arba paskelbkite savąjį programėlėje.”
- “Datos, kaina, taikomi mokesčiai, užstatas ir atšaukimo sąlygos parodomi prieš patvirtinant programėlėje.”
- “Pasiimkite ir naudokitės daiktu arba perduokite jį nuomininkui. Savininko išmoka inicijuojama užbaigus nuomą ir įvykdžius išmokos sąlygas.”

**Availability FAQ**  
K: Ar galiu ieškoti daiktų visoje Lietuvoje?  
A: Ieškoti galite visoje Lietuvoje. Pasiūlymų skaičius priklauso nuo miesto ir kategorijos, todėl kai kuriose vietose pasirinkimas dar gali būti ribotas.

**Price FAQ**  
K: Kas nustato kainą ir užstatą?  
A: Kainą ir užstatą nustato savininkas. Konkrečios rezervacijos nuomos kainą, mokesčius, užstatą ir bendrą sumą matysite programėlėje prieš mokėdami.

**New cancellation FAQ**  
K: Kas nutinka atšaukus rezervaciją?  
A: Grąžinama suma priklauso nuo skelbimui taikomos atšaukimo politikos ir atšaukimo laiko. Tikslius terminus, negrąžinamus mokesčius ir grąžinamą sumą matysite programėlėje prieš mokėdami. Jei užstatas jau nurašytas ir rezervacija atšaukiama iki perdavimo, jis grąžinamas visas, išskyrus teisėto sulaikymo atvejus.

**New damage FAQ**  
K: Kas nutinka, jei daiktas sugadinamas ar negrąžinamas laiku?  
A: Savininkas gali pateikti pretenziją ir įrodymus. Užstatas gali būti panaudotas pagrįstam reikalavimui, tačiau jis nėra draudimas ar nuomininko atsakomybės riba. Naudokis administruoja platformos ginčo procesą pagal taisykles ir abiejų pusių įrodymus.

**New verification FAQ**  
K: Ką reiškia tapatybės patvirtinimas?  
A: Žyma rodo, kad naudotojo tapatybė buvo patvirtinta. Ji nepatvirtina daikto būklės, draudimo ar garantuoto sandorio, todėl prieš rezervuodami peržiūrėkite profilį, skelbimą ir sąlygas.

### 3. Homepage: English

**Hero badge**  
See verification on profiles

**Hero body**  
Find tools, vehicles, cameras or leisure gear from private and business owners in Lithuania. Compare listings online, then confirm dates, the final amount and payment in the Naudokis app.

**Owner CTA**  
List it in the app

**Marketplace role note**  
Naudokis is an item-rental marketplace. The rental is between the renter and the owner; Naudokis provides tools for discovery, reservations, payments and disputes.

**Trust header**  
Why Naudokis  
Clearer terms before you reserve

**Trust cards**

1. **Visible verification**  
   When a user’s identity has been verified, it is shown clearly on their profile. Additional checks may be required before some reservations.
2. **Full amount before payment**  
   In the app you’ll see the rental price, applicable fees, delivery charge if any, deposit and total amount.
3. **Help with questions and disputes**  
   The Naudokis team explains the process and helps you provide the relevant information. Disputes are assessed under the rules and evidence from both sides.

**Availability FAQ**  
Q: Can I search for items across Lithuania?  
A: You can search across Lithuania. Availability depends on the city and category, so some areas may still have a limited selection.

**Price FAQ**  
Q: Who sets the price and deposit?  
A: The owner sets the price and deposit. Before you pay, the app shows the rental price, applicable fees, deposit and total amount for that reservation.

**New cancellation FAQ**  
Q: What happens if I cancel a reservation?  
A: The refund depends on the listing’s cancellation policy and when you cancel. The app shows the exact deadlines, any non-refundable fees and the refund amount before you pay. If a deposit has been charged and the reservation is cancelled before handover, it is returned in full unless there is a lawful reason to hold it.

**New damage FAQ**  
Q: What happens if an item is damaged or returned late?  
A: The owner can submit a claim and evidence. A deposit may be used for a supported claim, but it is not insurance or a cap on the renter’s liability. Naudokis administers the platform dispute process under the rules and evidence from both sides.

**New verification FAQ**  
Q: What does identity verification mean?  
A: The badge shows that the user’s identity has been verified. It does not verify the item’s condition, confirm insurance or guarantee a transaction, so review the profile, listing and terms before reserving.

### 4. How it works and safety section

Keep the current renter and owner step structure. Make these changes:

- Renter step 2 LT: “Pasirinkite datas, peržiūrėkite nuomos kainą, taikomus mokesčius, užstatą, atšaukimo sąlygas ir bendrą sumą, tada mokėkite programėlėje per Stripe.”
- Renter step 2 EN: “Choose dates, review the rental price, applicable fees, deposit, cancellation terms and total amount, then pay in the app through Stripe.”
- Owner handover LT: “Susitikite sutartu laiku, kartu užfiksuokite daikto būklę ir priedus, tada perduokite daiktą. Nuotraukos, žinutės ir perdavimo įrašai padeda, jei vėliau kyla ginčas.”
- Owner handover EN: “Meet at the agreed time, record the item’s condition and included accessories together, then hand it over. Photos, messages and handover records help if a dispute arises.”
- Trust review card LT: “Atsiliepimus gali palikti tik per Naudokis užbaigtos rezervacijos dalyviai.”
- Trust review card EN: “Only people who completed a reservation through Naudokis can leave a review.”
- Add section anchor/link: “Saugumas, užstatai ir ginčai” / “Safety, deposits & disputes.”

**New section lede — LT**  
Naudokis padeda abiem pusėms susitarti aiškiau, tačiau pati paprastai nėra nuomos sandorio šalis ir neteikia daikto ar civilinės atsakomybės draudimo. Prieš rezervuodami peržiūrėkite profilį, daikto būklę, užstatą, atšaukimo politiką ir draudimo informaciją, jei ją nurodė savininkas.

**New section lede — EN**  
Naudokis helps both sides agree on clearer terms, but it is generally not a party to the rental and does not provide item or liability insurance. Before reserving, review the profile, item condition, deposit, cancellation policy and any insurance information provided by the owner.

### 5. Discovery, empty states and SEO landing templates

**Empty category — LT**  
Šioje kategorijoje nuomos pasiūlymų dar nėra.  
Peržiūrėkite kitas kategorijas arba būkite pirmi – paskelbkite daiktą šioje kategorijoje.

**Empty category — EN**  
No listings in this category yet.  
Browse other categories or be the first to list an item here.

**Empty city — LT**  
{Miestas vietininku} nuomos pasiūlymų dar nėra.  
Peržiūrėkite pasiūlymus kituose miestuose arba paskelbkite pirmąjį daiktą šiame mieste.

**Empty city — EN**  
No listings in {city} yet.  
Browse listings in other cities or be the first to list an item here.

**Band empty — LT / EN**  
Pasiūlymų čia dar nėra. Peržiūrėkite kategorijas arba užsukite vėliau.  
There are no listings here yet. Browse the categories or check back later.

**Universal LT category landing model**

- H1 without city: keep the authored genitive heading, e.g. “Elektrinių įrankių nuoma.”
- H1 with city: `{authored H1 without final “ nuoma”} nuoma {city locative}`.
- Body sentence 1: a factual, category-specific use case with no comparative claim.
- Body sentence 2: `Palyginkite kainą, vietą, būklę, perdavimo būdus ir savininko profilį. Datas, taikomus mokesčius, užstatą ir bendrą sumą patvirtinsite programėlėje.`
- Safe fallback body: `Peržiūrėkite kategorijos „{nominative category name}“ nuomos pasiūlymus {city locative / visoje Lietuvoje}. Palyginkite kainą, vietą, būklę, perdavimo būdus ir savininko profilį, o rezervaciją užbaikite programėlėje.`
- Meta title: `{authored H1}{optional city locative} | Naudokis.lt`.
- Meta description: `Raskite „{category name}“ kategorijos daiktus nuomai {where}. Palyginkite kainas ir sąlygas, o rezervaciją užbaikite Naudokis programėlėje.`

**Universal EN category landing model**

- H1: sentence case; use “rental,” never “booking,” e.g. “Power tool rental” / “Power tool rental in Vilnius.”
- Body sentence 1: a factual category-specific use case with no “faster, cheaper, greener” comparison.
- Body sentence 2: `Compare price, location, condition, handover options and the owner’s profile. Choose dates, review the applicable terms and reserve in the app.`
- Safe fallback body: `Browse listings in the “{category name}” category {in city / across Lithuania}. Compare price, location, condition, handover options and the owner’s profile, then reserve in the app.`
- Meta title: `{Category name} rental{optional in city} | Naudokis.lt`.
- Meta description: `Browse items in the “{category name}” category {where}. Compare prices and terms, then complete your reservation in the Naudokis app.`

**Category-specific first sentences for all top-level pages**

| Category | Lithuanian | English |
|---|---|---|
| Tools & Construction | Jei įrankio ar statybos įrangos reikia vienam darbui, raskite gręžtuvus, pjūklus, generatorius, pastolius ir kitą techniką nuomai. | Find drills, saws, generators, scaffolding and other tools or construction equipment for a short-term job. |
| Home & Garden | Raskite valymo įrangą, vejapjoves, aukšto slėgio plovyklas ir kitą namų ar sodo techniką nuomai. | Find cleaning equipment, lawnmowers, pressure washers and other home or garden gear to rent. |
| Transport | Raskite automobilius, mikroautobusus, priekabas, kemperius ir kitas transporto priemones nuomai. | Find cars, vans, trailers, campers and other vehicles to rent. |
| Photo & Video | Raskite fotoaparatus, objektyvus, dronus, apšvietimą ir kitą foto ar video techniką projektui ar renginiui. | Find cameras, lenses, drones, lighting and other photo or video gear for a project or event. |
| Audio, Music & Event Tech | Raskite kolonėles, mikrofonus, mikšerius, DJ ir kitą garso ar renginių techniką nuomai. | Find speakers, microphones, mixers, DJ gear and other audio or event equipment to rent. |
| Electronics & Tech | Raskite kompiuterius, planšetes, projektorius, konsoles, VR ir kitą elektroniką trumpam poreikiui. | Find computers, tablets, projectors, consoles, VR gear and other electronics for a short-term need. |
| Sports & Leisure | Raskite dviračius, irklentes, kempingo, žiemos sporto ir kitą laisvalaikio įrangą nuomai. | Find bikes, paddleboards, camping gear, winter-sports equipment and other leisure gear to rent. |
| Events & Parties | Raskite palapines, stalus, kėdes, indus, dekoracijas ir apšvietimą šventei ar renginiui. | Find tents, tables, chairs, tableware, decorations and lighting for a party or event. |
| Clothing & Accessories | Raskite sukneles, kostiumus, karnavalinius drabužius ir proginius aksesuarus nuomai. | Find dresses, suits, costumes and occasion accessories to rent. |
| Kids | Raskite vežimėlius, automobilines kėdutes, loveles, nešiokles ir kitus vaikų daiktus trumpam poreikiui. | Find strollers, car seats, cots, carriers and other children’s gear for a short-term need. |
| Health & Medical | Raskite ramentus, vaikštynes, vežimėlius, funkcines lovas ir kitą slaugos ar reabilitacijos įrangą nuomai. | Find crutches, walkers, wheelchairs, care beds and other care or rehabilitation equipment to rent. |
| Other | Raskite sezoninius, nestandartinius ir rečiau naudojamus daiktus, kurie netelpa į kitas kategorijas. | Find seasonal, specialist and less common items that do not fit the other categories. |

The same factual model should be applied to all 129 subcategories. Do not duplicate the current generic three-paragraph families; each subcategory needs one concrete use-case sentence plus the common comparison/app sentence.

### 6. Listing detail and app-action copy

**Deposit card — LT**  
Title: “500 € užstatas”  
Subtext: “Panaudojimo ir grąžinimo sąlygas matysite programėlėje prieš mokėdami.”

**Deposit card — EN**  
Title: “€500 deposit”  
Subtext: “The app shows the hold, claim and return terms before you pay.”

**Cancellation card — LT**  
Title: “Griežta atšaukimo politika”  
Subtext: “Tikslius terminus ir grąžinamą sumą matysite programėlėje prieš mokėdami.”

**Cancellation card — EN**  
Title: “Strict cancellation policy”  
Subtext: “The app shows the exact deadlines and refund amount before you pay.”

**Verification explanation — LT / EN**  
“Patvirtinta tapatybė nepatvirtina daikto būklės ar garantuoto sandorio.”  
“Identity verification does not verify the item’s condition or guarantee a transaction.”

**Owner contact CTA — LT / EN**  
“Rašyti savininkui programėlėje”  
“Message the owner in the app”

**Reserve bridge body — LT**  
Pasirinkite datas ir peržiūrėkite nuomos kainą, taikomus mokesčius, užstatą, atšaukimo sąlygas bei bendrą sumą. Mokėkite tik patvirtinę visą informaciją programėlėje.

**Reserve bridge body — EN**  
Choose dates and review the rental price, applicable fees, deposit, cancellation terms and total amount. Pay only after confirming the full details in the app.

**List-item bridge body — LT**  
Skelbimą paskelbsite nemokamai. Įkelkite nuotraukas, aprašykite būklę ir komplektaciją, nustatykite kainą bei užstatą. Jūs sprendžiate, kurias užklausas patvirtinti; konkrečios rezervacijos mokesčiai parodomi iš anksto.

**List-item bridge body — EN**  
Listing is free. Add photos, describe the condition and what is included, then set the price and deposit. You decide which requests to accept; fees for a specific reservation are shown in advance.

### 7. Generic app bridge and transactional handoffs

**Default bridge — LT**  
Title: Tęskite programėlėje  
Body: Programėlėje galite pasirinkti datas ir rezervuoti, rašyti savininkui, skelbti savo daiktus, peržiūrėti taikomas sumas ir valdyti nuomą vienoje vietoje.

**Default bridge — EN**  
Title: Continue in the app  
Body: Use the app to choose dates and reserve, message an owner, list your own items, review applicable amounts and manage each rental in one place.

**Open failure hint — LT / EN**  
Programėlė neatsidarė? Bandykite dar kartą. Jei jos neturite, pasirinkite programėlių parduotuvę žemiau.  
App didn’t open? Try again. If you don’t have it, choose your app store below.

**Transactional handoff titles and bodies**

| Kind | Lithuanian | English |
|---|---|---|
| Reservation request | **Atidarykite rezervacijos užklausą programėlėje.** Rezervacijos užklausas tvirtinsite, keisite ar atšauksite programėlėje. | **Open the reservation request in the app.** Confirm, change or cancel reservation requests in the app. |
| Chat | **Tęskite pokalbį programėlėje.** Žinutės ir rezervacijos informacija lieka vienoje vietoje. | **Continue the conversation in the app.** Messages and reservation details stay together. |
| Review | **Atidarykite atsiliepimus programėlėje.** Programėlėje galite palikti arba peržiūrėti atsiliepimą. | **Open reviews in the app.** Use the app to leave or read a review. |
| Billing documents | **Atidarykite mokėjimo dokumentus programėlėje.** Programėlėje rasite su paskyra susietus mokėjimo dokumentus. | **Open billing documents in the app.** Find billing documents linked to your account in the app. |
| Profile | **Atidarykite profilį programėlėje.** Programėlėje peržiūrėsite profilio informaciją ir atsiliepimus. | **Open a profile in the app.** View profile information and reviews in the app. |
| My profile | Keep current. | Keep current. |
| Rewards | Keep current. | Keep current. |
| Reset password | Keep current. | Keep current. |
| Verify email | Keep current. | Keep current. |

### 8. Account deletion

**Cancellation screen — LT**  
Title: Norite išsaugoti paskyrą?  
Body: Paskyros trynimą galite atšaukti per 30 dienų nuo prašymo pateikimo. Patvirtinkite žemiau, jei norite išsaugoti paskyrą.  
CTA: Atšaukti paskyros trynimą

**Cancellation screen — EN**  
Title: Keep your account?  
Body: You can cancel account deletion within 30 days of submitting the request. Confirm below if you want to keep your account.  
CTA: Cancel account deletion

**Invalid link — LT / EN**  
“Ši nuoroda negalioja arba jos galiojimas baigėsi. Jei reikia pagalbos, parašykite info@naudokis.lt.”  
“This link is invalid or has expired. If you need help, email info@naudokis.lt.”

**Already-used link — LT / EN**  
“Nuoroda jau panaudota arba 30 dienų terminas baigėsi. Jei negalite prisijungti arba nežinote paskyros būsenos, parašykite info@naudokis.lt.”  
“The link has already been used or the 30-day period has ended. If you cannot sign in or are unsure of the account status, email info@naudokis.lt.”

**Document terminology replacements**

- “Patvirtinkite dar kartą prisijungdami slaptažodžiu arba per „Apple“, „Google“ ar „Facebook“.”
- “Programėlės pranešimų nustatymai ir pranešimų identifikatoriai.”
- “Įsiminti daiktai, blokavimai ir nutildymai.”
- EN: “reservations,” not “bookings”; “saved items,” not “Favorites.”

### 9. Consent and privacy choices

**Install consent — LT**  
Title: Leisti diegimo ir kampanijų matavimą?  
Body: Jei sutiksite, „AppsFlyer“ gaus diegimo identifikatorių, kampanijos ar pakvietimo šaltinį ir, kai toks matavimas įjungtas, pasirinktus programėlės konversijų įvykius, pavyzdžiui, užbaigtą nuomą ir jos vertę. „AppsFlyer“ negaus jūsų vardo, el. pašto adreso, visų kortelės duomenų, rezervacijos numerio ar tikslaus daikto adreso. Sutikimas neprivalomas ir naudojimosi Naudokis neriboja.  
Allow: Leisti „AppsFlyer“ matavimą  
Decline: Tęsti be „AppsFlyer“ matavimo

**Install consent — EN**  
Title: Allow install and campaign measurement?  
Body: If you agree, AppsFlyer will receive an install identifier, the campaign or referral source and, where enabled, selected app conversion events such as a completed rental and its value. AppsFlyer will not receive your name, email address, full card details, reservation ID or the item’s precise address. This is optional and does not limit your use of Naudokis.  
Allow: Allow AppsFlyer measurement  
Decline: Continue without AppsFlyer measurement

**Privacy choices — LT**  
Title: „AppsFlyer“ atribucija  
Body: Leiskite „AppsFlyer“ susieti programėlės diegimą su kampanija ar pakvietimu ir, kai toks matavimas įjungtas, su pasirinktais programėlės konversijų įvykiais.  
Scope note: Tai svetainėje duotas „AppsFlyer“ atribucijos pasirinkimas. Kitą programėlės analitiką valdote atskirai jos nustatymuose.  
Add link: Privatumo politika

**Privacy choices — EN**  
Title: AppsFlyer attribution  
Body: Allow AppsFlyer to connect the app installation with a campaign or referral and, where enabled, selected app conversion events.  
Scope note: This is the AppsFlyer attribution choice made on the website. Other in-app analytics are controlled separately in the app settings.  
Add link: Privacy Policy

### 10. Clipboard/share errors and manifest

**Copy failure — LT / EN**  
Nepavyko nukopijuoti. Pažymėkite kodą ir nukopijuokite rankiniu būdu.  
Couldn’t copy. Select the code and copy it manually.

**Share failure — LT / EN**  
Nepavyko bendrinti nuorodos. Bandykite dar kartą.  
Couldn’t share the link. Try again.

**Manifest — LT**  
Name: Naudokis – daiktų nuoma Lietuvoje  
Description: Raskite daiktus nuomai iš privačių ir verslo savininkų Lietuvoje. Palyginkite pasiūlymus svetainėje, o rezervuokite programėlėje.

## Prioritised implementation plan

### P0 — before launch/indexing

1. Replace F01–F05 Lithuanian verification/risk/fee claims and add the marketplace-role note.
2. Bulk-replace all 141 category records using the new model; reject “secure/safe booking,” `book*`, unsupported comparisons and ASCII-hyphen localisation in content QA.
3. Add a genitive category label contract for every category or derive city H1s from authored genitive SEO titles; test every LT subcategory/city route.
4. Update consent/privacy-choice copy and obtain privacy/legal sign-off against the actual AppsFlyer configuration.
5. Replace transactional handoff existence claims and all remaining booking terminology.
6. Put “30 days” on the deletion-cancellation screen and inline the recovery email in terminal states.

### P1 — before acquisition spend

1. Add platform-role, cancellation/refund, damage/deposit and verification FAQs to the homepage and JSON-LD source.
2. Shorten every category meta description; add CI/content validation for title/description length and banned claims.
3. Update listing deposit, cancellation, verification and contact copy.
4. Replace liquidity/velocity claims in the availability FAQ and empty states.
5. Add the “Safety, deposits & disputes” section and footer link.
6. Rewrite seeded listing descriptions into factual, structured inventory copy.
7. Migrate the English legal/account documents from “Booking” to “Reservation” and standardise British spelling, with counsel approval and regenerated JSON.

### P2 — conversion and polish

1. Add equal renter/owner paths on the homepage and move them before the generic how-it-works summary.
2. Simplify deep-link install fallbacks to one hint, store badges and desktop QR.
3. Add clipboard/share failure states.
4. Align account-deletion terminology and manifest copy.
5. Run a final bilingual content regression on 320, 390, 768, 1120 and desktop widths, plus iOS/Android app-installed and app-not-installed paths.

## Acceptance criteria

- No marketing surface states or implies that all users/items are verified, inspected, insured or safe.
- No `book`, `booking`, “saugi rezervacija,” “secure booking,” unsupported superlative/comparative or universal-liquidity claim remains in website or backend category content.
- Every LT category/city H1 and description reads grammatically with a level-1 category.
- All category metadata passes the agreed editorial length thresholds and leads with the search intent, not the brand CTA.
- Deposit, cancellation, damage, verification and platform-role explanations are reachable before install.
- Every app handoff describes intent without asserting that an unvalidated record exists.
- Consent UI accurately summarises the deployed AppsFlyer data flows and links to the Privacy Policy.
- LT and EN use the terminology table consistently in marketing, legal help, errors and deep-link states.
