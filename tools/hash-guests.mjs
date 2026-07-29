#!/usr/bin/env node
// Rebuilds the hashed seating tables inside index.html.
//
//   node tools/hash-guests.mjs
//
// Sources of truth live in seating/ and are git-ignored — they hold the guest
// names in clear text and must never be published:
//
//   seating/seats.local.json   transcription of the venue plan: for each masa,
//                              three round tables, each an array of names
//                              listed clockwise from the top of the circle.
//   seating/guests.local.json  the flat name -> table list, used to cross-check
//                              the transcription.
//
// Each name is normalized (accents stripped, lowercased, tokens sorted so the
// first-name/last-name order does not matter) and run through PBKDF2-SHA256.
// Only the digest, the table, the round-table index and the seat index ship in
// index.html, so the published page never contains a readable guest list. The
// hashing parameters are hard-coded in index.html too — keep SALT / ITERATIONS
// / DIGEST_CHARS in sync on both sides.

import { readFileSync, writeFileSync } from 'node:fs';
import { pbkdf2Sync } from 'node:crypto';

const SALT = 'marius-maria-2026-seating';
const ITERATIONS = 120000;
const DIGEST_CHARS = 16; // 64 bits — collision-free for a few hundred guests

const SEATS_SOURCE = 'seating/seats.local.json';
const LIST_SOURCE = 'seating/guests.local.json';
const TARGET = 'index.html';

function normalizeName(s) {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// "Gutium Ion" and "Ion Gutium" must hash to the same value.
function seatKey(value) {
  const n = normalizeName(value);
  return n ? n.split(' ').sort().join(' ') : '';
}

function seatHash(value) {
  return pbkdf2Sync(seatKey(value), SALT, ITERATIONS, 32, 'sha256')
    .toString('hex')
    .slice(0, DIGEST_CHARS);
}

const plan = JSON.parse(readFileSync(SEATS_SOURCE, 'utf8'));
const tables = Object.entries(plan).filter(([k]) => !k.startsWith('_'));

// Cross-check the plan transcription against the flat guest list: a name placed
// at the wrong table, or missing from either side, is a transcription slip.
const listed = new Map();
for (const g of JSON.parse(readFileSync(LIST_SOURCE, 'utf8'))) {
  const k = seatKey(g.nume);
  if (!listed.has(k)) listed.set(k, []);
  listed.get(k).push(String(g.masa));
}
const seen = new Set();
for (const [masa, rounds] of tables) {
  for (const names of rounds) {
    for (const name of names) {
      const k = seatKey(name);
      seen.add(k);
      const at = listed.get(k);
      if (!at) console.warn(`! on the plan but not in the guest list: ${name}`);
      else if (!at.includes(masa)) console.warn(`! ${name}: plan says masa ${masa}, list says ${at.join('/')}`);
    }
  }
}
for (const [k, at] of listed) {
  if (!seen.has(k)) console.warn(`! in the guest list but not on the plan: ${k} (masa ${at.join('/')})`);
}

// { h: digest, t: table, r: which round table of the group, s: seat index }
const entries = [];
const layout = {};
for (const [masa, rounds] of tables) {
  layout[masa] = rounds.map(names => names.length);
  rounds.forEach((names, r) => names.forEach((name, s) => {
    entries.push({ h: seatHash(name), t: masa, r, s });
  }));
}

// Sort by digest so the published order leaks nothing about the seating itself.
entries.sort((a, b) => (a.h < b.h ? -1 : a.h > b.h ? 1 : 0));

const html = readFileSync(TARGET, 'utf8');
const eol = html.includes('\r\n') ? '\r\n' : '\n'; // keep the file's line endings

function replaceBlock(source, opener, closer, block) {
  const start = source.indexOf(opener);
  if (start === -1) throw new Error(`${opener} not found in ${TARGET}`);
  const end = source.indexOf(closer, start) + closer.length;
  return source.slice(0, start) + block + source.slice(end);
}

const guestBlock =
  'const SEAT_GUESTS = [' + eol +
  entries.map(e => `  { h: "${e.h}", t: "${e.t}", r: ${e.r}, s: ${e.s} },`).join(eol) +
  eol + '];';

const layoutBlock =
  'const FP_SEATS = {' + eol +
  Object.entries(layout).map(([t, counts]) => `  "${t}": [${counts.join(', ')}],`).join(eol) +
  eol + '};';

let out = replaceBlock(html, 'const SEAT_GUESTS = [', '];', guestBlock);
out = replaceBlock(out, 'const FP_SEATS = {', '};', layoutBlock);
writeFileSync(TARGET, out);

console.log(`${entries.length} seats hashed into ${TARGET}`);
