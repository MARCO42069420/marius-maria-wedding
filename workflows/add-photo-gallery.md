---
name: add-photo-gallery
description: Full SOP for the guest photo-upload gallery — Apps Script deployment steps and source, reveal-gating logic, sequential upload queue with real verification, and how to redeploy if it ever needs rebuilding
tags: [workflow, wedding, gallery, apps-script]
---

# Workflow: Photo Gallery (Guest Upload)

## Objective

Let any wedding guest upload phone photos/videos into a Google Drive folder, from a plain upload button on the site itself — no Google account or sign-in required on the guest's side. Built 2026-07-28, gated to reveal at ceremony start (14:30, 30 July 2026). Redesigned 2026-07-29 for multi-select + real per-file confirmation, expecting ~50 guests uploading around the same time.

## Why this design (not a shared Drive folder link)

Native Google Drive folder-sharing and Google Forms' file-upload question both **require the uploader to sign in with a Google account** — this is a hard Google-side requirement, not a setting. Given the guest list likely includes people without Google accounts, that fails accessibility. Instead, this reuses the same pattern already proven for RSVP: a Google Apps Script Web App, deployed under Marius's own authorization, receives the file from the site's own upload button and writes it into Drive on the guest's behalf. The guest never sees a Google login screen.

**This is a separate, independent Apps Script deployment from the RSVP one** — per `AGENT.md` Rule #2, the working RSVP backend is never touched by this feature.

## Scale considerations (added 2026-07-29)

Google Apps Script Web Apps cap out at **30 simultaneous executions per deploying account, 1,000 per script** (2026 quotas, same for free and paid accounts) — this is a real, hittable ceiling with ~50 guests uploading in a burst right after the ceremony. Two design choices address this directly:

1. **Client processes one file at a time per device** (`runGalleryQueue` in `index.html`) — a guest picking 10 photos does NOT fire 10 simultaneous requests; they queue and upload sequentially. This keeps any single device's contribution to the shared 30-slot pool to at most 1.
2. **Real per-file verification with automatic retry** — a transient rejection (e.g. hitting the concurrency cap) self-heals via retry rather than silently failing.

## Inputs required

- Target Drive folder ID: `1JGyjT6_a6XeIq_ZfKbkiOnLOLbDiqPIK`
- A Google account to own the Apps Script deployment (same one that owns the target Drive folder)

## Steps

### 1. Create and deploy the Apps Script (manual, one-time — or redeploy if updating)

1. Go to [script.google.com](https://script.google.com) → New Project (or open the existing gallery project if redeploying)
2. Replace the code with:

```js
var FOLDER_ID = '1JGyjT6_a6XeIq_ZfKbkiOnLOLbDiqPIK';
var MAX_BYTES = 26214400; // ~25MB safety cap, matches the client-side guard in index.html

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var bytes = Utilities.base64Decode(body.data);
    if (bytes.length > MAX_BYTES) {
      return ContentService.createTextOutput(JSON.stringify({ok:false, error:'too_large'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    // storedName is generated client-side (timestamp + random token + sanitized
    // original name) and used verbatim — this is also the exact key the doGet
    // verification check below looks up, so it must not be re-stamped here.
    var blob = Utilities.newBlob(bytes, body.mimeType, body.storedName);
    DriveApp.getFolderById(FOLDER_ID).createFile(blob);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Verification endpoint — plain GET, so it's always a "simple request" (no CORS
// preflight) and its JSON response is reliably readable by a real fetch(), unlike
// the doPost response above. The client polls this once per file after uploading
// to get real success/failure instead of trusting the opaque no-cors POST.
function doGet(e) {
  var name = e.parameter.check;
  if (!name) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:'missing_check_param'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var files = DriveApp.getFolderById(FOLDER_ID).getFilesByName(name);
  return ContentService.createTextOutput(JSON.stringify({exists: files.hasNext()}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy → **Manage deployments** → edit the existing deployment → **New version** (keeps the same `/exec` URL) — or **New deployment** → Web app if this is the very first deploy
4. Execute as: **Me** · Who has access: **Anyone**
5. Authorize the script when Google prompts (it needs Drive access to write/read the folder)
6. Confirm the `.../exec` URL — should be unchanged if you edited the existing deployment rather than creating a new one

**Gotcha hit during the first deploy (2026-07-28):** the access dropdown has two similar options — "Anyone" (truly public, no sign-in) vs "Anyone with a Google account" (still requires sign-in). The first attempt landed on the wrong one and returned a 403 "you need access" page for anonymous requests. Fix: **Manage deployments** → edit → re-confirm "Anyone" → deploy a new version.

### 2. `index.html` already points at the existing URL

`var GALLERY_SCRIPT_URL = ...` near the bottom of the `<script>` block doesn't need to change when redeploying via "New version" (same URL). Only update it if a brand-new deployment produces a different URL.

**The upload fetch must use `mode: 'no-cors'` for the POST**, same as RSVP — Apps Script's `ContentService` cannot set CORS response headers, so a real fetch still can't reliably read that response even avoiding the preflight. Real confirmation comes from the separate `doGet` verification check instead (a plain GET, no preflight, reliably readable).

### 3. Verify before trusting it

Do **not** rely on `curl` to test the POST path — Google's Apps Script exec URLs relay through a `302` redirect to a `script.googleusercontent.com` echo endpoint, and curl's redirect/POST-body handling for that specific relay is inconsistent and gives misleading errors (411, 405) even when the upload actually succeeded server-side. The `doGet` verification endpoint is a plain GET and tests fine with curl directly: `curl "<GALLERY_SCRIPT_URL>?check=<exact-stored-name>"` → `{"exists":true}` or `{"exists":false}`.

For the full upload flow, test with a real browser: pick files on the actual live site, watch the per-item badges go ⏳ → ⬆ → ✓ (or ✕ after 2 retries), and cross-check the Drive folder.

Also check drive.google.com storage settings for free space beforehand — free accounts share 15GB across Gmail/Drive/Photos; dozens of guests uploading multiple photos/videos can add up fast.

**Verified 2026-07-28** (v1, single-file): real browser test uploaded a file that landed correctly in the target Drive folder.

## How the reveal gating works

`initGalleryReveal()` in `index.html` compares `now` against `new Date('2026-07-30T14:30:00')` (ceremony start). Before that moment: the `#gallery-teaser` block shows (with a day- or hour-precision countdown). At/after that moment: `#gallery-teaser` hides and `#gallery-active` (the real upload form) shows. Same technique as `initRSVPDeadline()` — plain `Date` math, `style.display` toggling, called once at script-load time.

To change the reveal moment, edit the single `new Date('2026-07-30T14:30:00')` line — nothing else needs to change.

⚠️ **As of 2026-07-29, this date has been temporarily set to a past date (`2026-07-27`) for live testing** — must be reverted to `2026-07-30T14:30:00` before the wedding, once testing is confirmed done.

## Upload pipeline (v2, 2026-07-29)

1. Guest taps "Choose Photos" / "Choose Videos" (`multiple` attribute — can pick several at once, and tap again to add more before confirming)
2. Each pick adds a thumbnail to the preview grid (image thumb via `createObjectURL`, or a 🎬 icon + filename for video) with a ✕ remove button
3. Guest taps "Upload N items" — this locks in the current pending set (further removes are disabled once queued)
4. `runGalleryQueue` processes **one file at a time**: read as base64 → POST (no-cors, fire-and-forget) → wait 2.5s → GET verification check → badge updates to ✓ or retries
5. On verification failure, automatically retries the same file up to 2 more times before giving up
6. A file that still fails after retries gets a ✕ badge that's itself tappable to manually retry, independent of the rest of the batch
7. Succeeded thumbnails auto-clear ~1.8s after the whole batch finishes; failed ones stay until retried

## Expected output

Real, verified per-file success/failure — not optimistic. A guest who uploads 10 photos sees each one individually confirmed (or flagged if it genuinely failed after 3 total attempts).

## Edge cases

- **File too large** (>25MB): rejected client-side with a friendly message before any upload attempt, and backstopped server-side in the Apps Script in case the client check is ever bypassed
- **Transient Apps Script concurrency rejection** (30-simultaneous-execution cap hit by other guests uploading at the same time): self-heals via the automatic 2-retry logic in most cases
- **Persistent failure after 3 attempts**: flagged with a ✕ badge on that specific thumbnail, tappable to retry manually — does not block or fail the rest of the batch
- **FileReader fails to read the local file** (rare — corrupt file, permissions): counted the same as a failed upload for that item, same retry/flag behavior
- **Guest revisits after uploading**: nothing prevents uploading more later — each file gets its own collision-proof name (timestamp + random token), no dedup needed
- **Drive folder runs out of space**: uploads will fail verification (file won't exist) and get flagged to the guest via the normal failed-badge path — no silent failure anymore, unlike v1
