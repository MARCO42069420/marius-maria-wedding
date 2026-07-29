# Agent Briefing — Wedding Site (marius-maria.com)

Read this file at the start of every session. It is the single source of truth for the agent's role, current state, and rules for this project.

---

## Your Role

You maintain and extend the live wedding invitation website for **Marius & Maria**, deployed at **marius-maria.com** via GitHub Pages.

This is a production site with real guests visiting. Every change must be correct before it goes live. Your job is to implement requested features, keep the codebase clean, and never break what already works.

---

## What's Built

The site is a **single-file PWA** (`index.html`) — all HTML, CSS, and JavaScript in one file, no build step, no dependencies beyond Google Fonts.

### Sections (in order)

| Section ID | Name | What it does |
|---|---|---|
| `#home` | Hero | Full-viewport photo (hero.jpg), couple names, date/time/venue pills, CTA to RSVP |
| `#story` | Our Story | Two-column: narrative text left, overlapping story photos right |
| `#bigday` | The Big Day | Olive-green section — venue name (linked to Google Maps), schedule timeline, dress code |
| `#rsvp` | RSVP | Live form — submits to Google Apps Script → Google Sheets |
| `#gallery` | Photos (guest upload) | Teaser + upload form, gated to reveal at ceremony start (14:30, 30 July 2026); uploads go to Google Drive via a dedicated Apps Script |
| `#library` | Library / Book Gift | Suggests books instead of flowers; describes the book stand at the reception |
| `#gift` | Wedding Gift | Bank transfer details (EN only — hidden in RO mode) |
| `#stay` | Stay & Travel | Accommodation recommendations (Airbnb + 2 hotels), transport apps |
| `#beauty` | Beauty & Grooming | 4 ladies' salons, 3 barbers — all Google Maps linked |
| `#moldova` | Discover Moldova | Wine experiences (3 wineries), must-visit sights (3 landmarks) |
| `#nightlife` | Bars & Restaurants | 3 bars, 4 restaurants — all Google Maps linked |
| Footer | — | Names + date + venue, olive background |

### Key Features

- **Bilingual (EN / RO)** — language toggle top-right; default is Romanian (`setLang('ro')` on load); all text uses `data-lang="en"` / `data-lang="ro"` attributes
- **PWA** — manifest.json + apple-touch-icon; installable on iOS/Android
- **Responsive** — breakpoints at 1600px, 1280px, 900px, 700px, 680px, 420px, 360px; landscape phone handling; reduced-motion support
- **Nav** — transparent over hero, frosts to ivory on scroll; hamburger + full-screen drawer on mobile
- **RSVP form** — 5 fields: names, attendance (yes/no), dietary info, transport preference, post-wedding zeama lunch; submits via `fetch` to Google Apps Script (no-cors fire-and-forget); shows success message on submit
- **Scroll reveal** — IntersectionObserver adds `.visible` class to `.reveal` elements
- **Hero animation** — slow zoom (12s infinite) on hero.jpg; film-grain SVG overlay
- **Botanical SVG dividers** — hand-drawn olive-branch motif between sections
- **Open Graph / Twitter Card** — og-invite.png (1200x630), full social sharing metadata
- **Gift section** — EN only (hidden for RO speakers via JS); Revolut IBAN `LT63 3250 0304 0910 6958`, BIC `REVOLT21`
- **Transport smart-links** — detects iOS/Android/desktop to open Bolt, Letz, Yandex Go in correct store
- **Guest photo upload** — `#gallery` section, teaser until 14:30 on 30 July 2026, then a file picker that uploads directly to Google Drive via a second Apps Script (no Google account needed on the guest's side); see [[../workflows/add-photo-gallery]]

### RSVP Backend

- **Google Apps Script URL**: `https://script.google.com/macros/s/AKfycbyKws6Tqx5AcghaKd5k79AyrkLgTphuep8xLTDheXgY2vwmyvVmu8w969NoZRmGPc_E/exec`
- Payload fields: `name`, `attendance`, `dietary`, `transport`, `zeama`
- No auth, no error handling on the response (opaque no-cors); success is always shown

### Gallery Upload Backend

- **Target Drive folder**: `1JGyjT6_a6XeIq_ZfKbkiOnLOLbDiqPIK`
- **Google Apps Script URL**: `https://script.google.com/macros/s/AKfycbx0_SLQaOk9pJIK8JsyZg71_LYXK1-Hrdn6pgthCoEu6J-CLmeS7w1AZDlWlwotIEklxQ/exec` — deployed and verified 2026-07-28 (real browser test uploaded a file that landed correctly in the Drive folder)
- Deliberately a **separate deployment** from the RSVP script (Rule #2 — never touch the working RSVP backend)
- Payload fields: `filename`, `mimeType`, `data` (base64)
- **Fire-and-forget, `no-cors`** — same pattern as RSVP, not real success/error feedback. Apps Script's `ContentService` can't set CORS response headers, so a real (non-`no-cors`) fetch can't reliably read the response anyway; matches the limitation already noted in the RSVP code

---

## What's Pending

Natural next features, in rough priority order:

| Feature | Notes |
|---|---|
| RSVP dashboard | Read responses from Google Sheets; show headcount, dietary breakdown, transport split, zeama count |
| Guest list manager | CSV/Sheets list of invited guests; track who has and hasn't responded |
| Countdown widget | Days/hours/minutes to 30 July 2026; replace or augment the static date pill |
| Seating plan | Interactive table assignments; could be a separate page or section |
| Post-wedding thank-you page | Redirect or new section after the wedding date passes |
| SW / offline support | `service-worker.js` for true offline PWA (currently just a manifest) |
| RSVP deadline enforcement | Auto-hide or disable the form after 1 July 2026 |
| Book list | Display a wishlist of books guests can choose to give (from the Library section concept) |

---

## Key Files

| File | Purpose |
|---|---|
| `index.html` | The entire site — HTML, CSS, JS, all in one file |
| `manifest.json` | PWA manifest — name, icons, theme colour, start URL |
| `CNAME` | GitHub Pages custom domain — `marius-maria.com` |
| `images/hero.jpg` | Full-viewport hero photo |
| `images/story-main.jpg` | Our Story section — main photo |
| `images/story-accent.jpg` | Our Story section — accent/overlay photo |
| `images/icon-192.png` | PWA home-screen icon |
| `images/icon-512.png` | PWA splash icon |
| `images/og-invite.png` | Social share image (1200×630) |
| `images/og-envelope.png` | Alternate OG image (unused in current meta) |
| `knowledge-base/wedding_spec.md` | Single source of truth for all wedding facts |
| `skills/README.md` | Map of project-specific skills |
| `workflows/README.md` | Map of project-specific workflows |

---

## Design Spec

### Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `--ivory` | `#f9f6ef` | Page background, nav frosted bg |
| `--parchment` | `#f2ece0` | Beauty, Stay, Gift section backgrounds |
| `--olive` | `#6b7a4e` | Primary brand colour, buttons, accents |
| `--olive-dk` | `#6b8055` | Hover states, links |
| `--olive-lt` | `#a8b890` | Decorative lines, secondary accents |
| `--sage` | `#8a9b7a` | Mid-tone accent |
| `--sage-lt` | `#d4ddc8` | Light accent, Big Day section text |
| `--text` | `#2e2e1e` | Body text |
| `--text-mid` | `#5a5a3a` | Secondary body text |
| `--text-lt` | `#8a8a6a` | Tertiary / placeholder text |
| `--border` | `rgba(107,122,78,0.25)` | Card borders |
| `--bigday-bg` | `#7a8f5a` | Big Day and Footer background |
| `--rsvp-bg` | `#eef2e6` | RSVP section background |

### Typography

| Font | Weights | Usage |
|---|---|---|
| Cormorant Garamond | 300, 400, 500, 600 (+ italics) | Headings, names, decorative serif |
| Jost | 200, 300, 400 | Body text, labels, nav, buttons |

### Motion & Style

- Minimal animation: hero zoom (12s), fadeUp on page load, scroll-reveal
- Reduced-motion: all animation disabled via `@media (prefers-reduced-motion: reduce)`
- Film-grain SVG overlay at 4.5% opacity on hero
- Botanical SVG dividers (olive branch motif, olive palette)
- Border-radius: none — all cards and buttons are sharp-cornered
- Image filters: `saturate(0.87) contrast(1.05)` — desaturated, filmic look

### Tone

Elegant, restrained, romantic. Serif for emotion, sans-serif for information. No emoji in design elements (used only in content labels like section icons). Bilingual throughout.

---

## Rules

1. **Never break the live site** — this is production; test every change locally before deploying
2. **Never modify the RSVP backend** without verifying the Google Apps Script still works — responses are real guest data
3. **Never hardcode secrets** — the Apps Script URL is public by design; any future credentials go in environment files, not in `index.html`
4. **No build tools** — keep the single-file architecture; if complexity grows, propose before adding bundlers/frameworks
5. **Preserve bilingual integrity** — every new text element needs both `data-lang="en"` and `data-lang="ro"` variants
6. **Respect the palette** — use only the CSS custom properties defined in `:root`; never introduce new colours without asking
7. **Mobile-first** — test all additions at 375px and 680px (the two most critical breakpoints)
8. **Commit only clean changes** — never commit with console.log, commented-out blocks, or debug code left in
9. **RSVP deadline is 1 July 2026** — any feature touching the form must account for this
10. **Wedding date is 30 July 2026** — countdowns, auto-hide logic, and post-wedding states must key off this date

---

## Shared Skills

See `C:\New life\skills\README.md` for shared skills available across all projects.

Project-specific skills (if any) live in `skills/README.md` in this directory.

---

## Session Optimizer

**Run at the end of every session where work was approved.**

Invoke `[[session_optimizer]]` from `C:\New life\skills\`:
1. Update this AGENT.md — move completed items from pending to built
2. Update `knowledge-base/wedding_spec.md` with any new facts discovered
3. Tighten skills and workflows with constraints learned this session
4. Commit: `chore: session optimizer — update state, prune memory, tighten skills/workflows`
