---
name: add-photo-gallery
description: Full SOP for the guest photo-upload gallery — Apps Script deployment steps and source, reveal-gating logic, and how to redeploy if it ever needs rebuilding
tags: [workflow, wedding, gallery, apps-script]
---

# Workflow: Photo Gallery (Guest Upload)

## Objective

Let any wedding guest upload phone photos/videos into a Google Drive folder, from a plain upload button on the site itself — no Google account or sign-in required on the guest's side. Built 2026-07-28, gated to reveal at ceremony start (14:30, 30 July 2026).

## Why this design (not a shared Drive folder link)

Native Google Drive folder-sharing and Google Forms' file-upload question both **require the uploader to sign in with a Google account** — this is a hard Google-side requirement, not a setting. Given the guest list likely includes people without Google accounts, that fails accessibility. Instead, this reuses the same pattern already proven for RSVP: a Google Apps Script Web App, deployed under Marius's own authorization, receives the file from the site's own upload button and writes it into Drive on the guest's behalf. The guest never sees a Google login screen.

**This is a separate, independent Apps Script deployment from the RSVP one** — per `AGENT.md` Rule #2, the working RSVP backend is never touched by this feature.

## Inputs required

- Target Drive folder ID: `1JGyjT6_a6XeIq_ZfKbkiOnLOLbDiqPIK`
- A Google account to own the Apps Script deployment (same one that owns the target Drive folder)

## Steps

### 1. Create and deploy the Apps Script (manual, one-time)

1. Go to [script.google.com](https://script.google.com) → New Project
2. Replace the default code with:

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
    var blob = Utilities.newBlob(bytes, body.mimeType, body.filename);
    var stamped = Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd_HHmmss') + '_' + body.filename;
    blob.setName(stamped);
    DriveApp.getFolderById(FOLDER_ID).createFile(blob);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Deploy → New deployment → **Web app**
4. Execute as: **Me** · Who has access: **Anyone**
5. Authorize the script when Google prompts (it needs Drive access to write the file)
6. Copy the resulting `.../exec` URL

**Gotcha hit during the first deploy (2026-07-28):** the dropdown has two similar options — "Anyone" (truly public, no sign-in) vs "Anyone with a Google account" (still requires sign-in). The first attempt landed on the wrong one and returned a 403 "you need access" page for anonymous requests. Fix: **Manage deployments** → edit → re-confirm "Anyone" → deploy a new version. The `/exec` URL stayed the same after the fix.

### 2. Wire the URL into `index.html`

Find `var GALLERY_SCRIPT_URL = ...` near the bottom of the `<script>` block and set it to the real URL from step 1. This is public-by-design, same as the RSVP script URL (Rule #3) — it's called from client-side JS anyone can view-source anyway.

**The upload fetch must use `mode: 'no-cors'`, same as RSVP** — do not try to read a real success/error response from it. Apps Script's `ContentService` cannot set CORS response headers, so a real (non-`no-cors`) `fetch()` can't reliably read the response even after avoiding the preflight — this project's RSVP code already hit this exact limitation. Show an optimistic success message once the fetch call is fired, don't wait for a real confirmation.

### 3. Verify before trusting it

Do **not** rely on `curl` to test this — Google's Apps Script exec URLs relay through a `302` redirect to a `script.googleusercontent.com` echo endpoint, and curl's redirect/POST-body handling for that specific relay is inconsistent and gives misleading errors (411, 405) even when the upload actually succeeded server-side. Test with a real browser instead: a minimal standalone HTML page with a file input and the exact same `fetch(...)` call, opened directly (`file://`) in a browser. Confirm success by checking the Drive folder for the new file, not by trusting the fetch's own resolution — that's exactly what `no-cors` on the real site also can't tell you.

Also check drive.google.com storage settings for free space beforehand — free accounts share 15GB across Gmail/Drive/Photos; dozens of guests uploading multiple photos/videos can add up fast.

**Verified 2026-07-28**: real browser test uploaded a file that landed correctly in the target Drive folder, timestamp-prefixed as designed.

## How the reveal gating works

`initGalleryReveal()` in `index.html` compares `now` against `new Date('2026-07-30T14:30:00')` (ceremony start). Before that moment: the `#gallery-teaser` block shows (with a day- or hour-precision countdown). At/after that moment: `#gallery-teaser` hides and `#gallery-active` (the real upload form) shows. Same technique as `initRSVPDeadline()` — plain `Date` math, `style.display` toggling, called once at script-load time.

To change the reveal moment, edit the single `new Date('2026-07-30T14:30:00')` line — nothing else needs to change.

## Expected output

A guest visiting the site before 14:30 on 30 July 2026 sees a teaser with a countdown. From 14:30 onward, they see a file picker; choosing a photo/video fires the upload and shows an **optimistic** success message (fire-and-forget, same as RSVP — there's no way to confirm real server-side success back to the guest).

## Edge cases

- **File too large** (>25MB): rejected client-side with a friendly message before any upload attempt, and backstopped server-side in the Apps Script in case the client check is ever bypassed — this is a real, detectable client-side error
- **FileReader fails to read the local file** (rare — corrupt file, permissions): shows the error message with a retry button. This is the only "real" error case client-side JS can actually detect — a true server-side/network failure is invisible to the guest by design (`no-cors`), same limitation as RSVP
- **Guest revisits after uploading**: nothing prevents uploading multiple files — each becomes its own file in Drive, no dedup needed
- **Drive folder runs out of space**: uploads will silently fail with no error shown to the guest (opaque `no-cors` response) — no proactive warning is built for this; check storage manually per Step 3 above before the day
