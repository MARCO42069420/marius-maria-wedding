---
name: wedding-spec
description: Single source of truth for all wedding facts — dates, venue, logistics, design decisions, and couple details. All agents must read this before making any content change.
tags: [wedding, spec, source-of-truth]
---

# Wedding Spec — Marius & Maria

This file is the canonical record of all wedding facts. When in doubt, this file wins.

---

## The Couple

| | |
|---|---|
| **Names** | Marius Onofrei & Maria Tulgara |
| **Short** | M & M |
| **Site title** | Marius & Maria — 30 July 2026 |

---

## The Wedding

| | |
|---|---|
| **Date** | Thursday, 30 July 2026 |
| **RSVP Deadline** | 1 July 2026 |
| **Time** | 18:00 (reception/dinner arrival) |
| **Post-wedding** | Zeamă lunch — 31 July 2026, 15:00, same venue |

---

## Venue

| | |
|---|---|
| **Name** | Complexul Turistic „Costești" |
| **Location** | Costești, Moldova — 20km from Chișinău |
| **Google Maps** | [Link](https://www.google.com/maps/place/Complexul+Turistic+%E2%80%9ECoste%C8%99ti%E2%80%9D/@46.884137,28.7507371,17z) |
| **Character** | Lakeside retreat, nature + traditional Moldovan warmth |

---

## Schedule

| Time | Event |
|---|---|
| 14:30 | Religious Ceremony (optional) — separate church location |
| 18:00 | Guest Arrival & Welcome Drinks at Complexul Turistic |
| 19:30 | Dinner, Toasting & Celebration — Masa Mare |

- **Church location**: [Google Maps link](https://share.google/kSH6qFlRORl3W7O5s)
- **Dress code**: Garden Chic

---

## RSVP Form Fields

The live RSVP form collects:

1. **Name(s)** — full name(s) of all attendees in the party
2. **Attendance** — Yes / No
3. **Dietary information** — allergies, intolerances, vegetarian (optional)
4. **Transport** — organized bus OR self-arranged taxi (Bolt / Letz / Yandex Go)
5. **Zeama lunch** — attending the day-after lunch? Yes / No

---

## RSVP Backend

| | |
|---|---|
| **Method** | Google Apps Script → Google Sheets |
| **URL** | `https://script.google.com/macros/s/AKfycbyKws6Tqx5AcghaKd5k79AyrkLgTphuep8xLTDheXgY2vwmyvVmu8w969NoZRmGPc_E/exec` |
| **Mode** | `no-cors` (fire-and-forget; response is opaque) |
| **Payload** | `{ name, attendance, dietary, transport, zeama }` |

---

## Guest Photo Gallery (built 2026-07-28)

| | |
|---|---|
| **Section** | `#gallery`, positioned right after `#rsvp` |
| **Reveal moment** | 14:30, 30 July 2026 (ceremony start) — teaser shown before, upload form after |
| **Method** | Google Apps Script → Google Drive (separate deployment from the RSVP script) |
| **Target Drive folder** | `1JGyjT6_a6XeIq_ZfKbkiOnLOLbDiqPIK` |
| **URL** | `https://script.google.com/macros/s/AKfycbx0_SLQaOk9pJIK8JsyZg71_LYXK1-Hrdn6pgthCoEu6J-CLmeS7w1AZDlWlwotIEklxQ/exec` — deployed and verified 2026-07-28 |
| **Why not a shared Drive link** | Native Drive folder-sharing and Google Forms file-upload both require the uploader to sign into a Google account — not configurable off. This design lets guests upload with no Google account at all. |
| **File limit** | ~25MB per file, client- and server-side enforced |
| **Feedback mode** | Fire-and-forget (`no-cors`), same as RSVP — optimistic "Uploaded!" message, not a guaranteed server confirmation |

---

## Gift Information

| | |
|---|---|
| **Primary gift preference** | Books — a book stand will be at the reception |
| **Alternative** | Bank transfer |
| **IBAN** | `LT63 3250 0304 0910 6958` |
| **BIC** | `REVOLT21` (Revolut) |
| **Gift section visibility** | English only — hidden for Romanian speakers |

---

## Story & Origin

- Met in Chișinău, Moldova
- Walks in Cathedral Park / Parcul Catedralei
- Explored the Moldovan countryside together
- Photos tagged "M & M · 2025"
- Our Story text (EN): "Our story began in the heart of Chișinău. From quiet walks through Cathedral Park to discovering the hidden corners of the Moldovan countryside, every moment led us here."

---

## Site Technical Facts

| | |
|---|---|
| **Domain** | marius-maria.com (CNAME) |
| **Canonical URL** | https://www.marius-maria.com/ |
| **Hosting** | GitHub Pages |
| **Architecture** | Single-file PWA (index.html — HTML + CSS + JS) |
| **No build step** | No bundler, no framework, no node_modules |
| **Default language** | Romanian (RO) — `setLang('ro')` on page load |
| **PWA short name** | M & M |
| **Theme colour** | `#6b7a4e` (olive) |
| **OG image** | `images/og-invite.png` (1200×630) |

---

## Recommended Accommodation (curated by couple)

**Preferred:** Airbnb in Centru district, near Ștefan cel Mare Boulevard

**Hotels:**
- City Park Hotel — 4.7★, Eugen Doga 2A (modern, near park)
- Thomas Albert Hotel — 4.8★, Bănulescu-Bodoni 17 (boutique, city centre)

---

## Beauty & Grooming Recommendations

**Ladies (Hair, Makeup & Nails):**
- MesAmis Beauty Salon & Spa — 4.8★, bridal packages
- Adriana Lucci Beauty Salon — 4.5★
- Honey Beauty Salon — 4.5★, bridal styling
- The Nail House — 4.5★, nail specialist

**Gentlemen (Barbers):**
- Lisnic BarberShop — 4.8★, 232 reviews, Moldova's first barbershop
- The Black Lion Barbershop — 4.8★, 400+ reviews
- Crazy Monkey Barbershop — 4.7★, 212 reviews

---

## Moldova Recommendations

**Wine:**
- „Cricova" Winery — 4.7★, underground city
- Mimi Castle — 4.8★, 19th-century architecture
- Mileștii Mici — 4.6★, world's largest wine collection

**Sights:**
- Orheiul Vechi — 4.8★, cave monastery
- Triumphal Arch / Arcul de Triumf — 4.7★, Chișinău landmark
- Valea Morilor Park — 4.6★, lakeside park

**Bars:**
- Marlene — 4.8★, cocktail bar, martinis
- Piana Vyshnia — 4.4★, Ukrainian cherry wine bar
- Covor Speakeasy Bar — 5.0★, hidden gem

**Restaurants:**
- Fuior — 4.8★, Moldovan fusion, Pushkin Street
- Crème de la Crème — 5.0★, French patisserie + Provençal, 3 floors
- Osho Bar & Kitchen — 4.7★, modern, Bulevardul Decebal
- Julien Gastro Bistrot — 4.9★, #2 in Chișinău, local Moldovan products

---

## Design Decisions (Rationale)

| Decision | Rationale |
|---|---|
| Single HTML file | Simplest possible deploy — no CI, no build failures, just push to GitHub |
| Romanian as default lang | Majority of guests are Romanian-speaking; EN toggle for international guests |
| Gift section EN-only | Couple's choice — Romanian guests receive gift guidance via other channels |
| Book gift + money | Reflects couple's values; book stand at reception is the primary gift invitation |
| No booking/table tools on site | Keep it simple; complex logistics handled offline |
| Organised transport option | Venue is 20km from city; many guests won't have cars |
| Zeama lunch RSVP | Separate headcount needed for day-after recovery lunch at same venue |
| PWA without service worker | Manifest added for installability; offline caching not needed for a wedding invite |
| Hero object-position 22% | Optimised for the specific hero.jpg — faces are upper-centre |

---

## Links

- [[AGENT.md]] — agent rules and current build state
- Project `skills/README.md` — project-specific skills
- Project `workflows/README.md` — project-specific workflows
