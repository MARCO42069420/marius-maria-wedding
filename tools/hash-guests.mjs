#!/usr/bin/env node
// Rebuilds the hashed SEAT_GUESTS table inside index.html.
//
//   node tools/hash-guests.mjs
//
// Source of truth is seating/guests.local.json (git-ignored — it holds the
// guest names in clear text and must never be published):
//
//   [ { "nume": "Raia Tulgara", "masa": "7" }, ... ]
//
// Each name is normalized (accents stripped, lowercased, tokens sorted so the
// first-name/last-name order does not matter) and run through PBKDF2-SHA256.
// Only the digest ships in index.html, so the published page never contains a
// readable guest list. The same parameters are hard-coded in index.html — keep
// SALT / ITERATIONS / DIGEST_CHARS in sync on both sides.

import { readFileSync, writeFileSync } from 'node:fs';
import { pbkdf2Sync } from 'node:crypto';

const SALT = 'marius-maria-2026-seating';
const ITERATIONS = 120000;
const DIGEST_CHARS = 16; // 64 bits — collision-free for a few hundred guests

const SOURCE = 'seating/guests.local.json';
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

const guests = JSON.parse(readFileSync(SOURCE, 'utf8'));
const collisions = new Map();
const entries = guests.map(g => {
  const h = seatHash(g.nume);
  if (collisions.has(h) && collisions.get(h) !== g.nume) {
    console.warn(`! digest collision: "${g.nume}" vs "${collisions.get(h)}"`);
  }
  collisions.set(h, g.nume);
  return { h, t: String(g.masa) };
});

// Shuffle deterministically by digest so the on-page order leaks nothing about
// the original list (which was grouped by household).
entries.sort((a, b) => (a.h < b.h ? -1 : a.h > b.h ? 1 : 0));

const html = readFileSync(TARGET, 'utf8');
const eol = html.includes('\r\n') ? '\r\n' : '\n'; // keep the file's line endings

const block =
  'const SEAT_GUESTS = [' + eol +
  entries.map(e => `  { h: "${e.h}", t: "${e.t}" },`).join(eol) +
  eol + '];';

const start = html.indexOf('const SEAT_GUESTS = [');
const end = html.indexOf('];', start) + 2;
if (start === -1) throw new Error('SEAT_GUESTS block not found in ' + TARGET);
writeFileSync(TARGET, html.slice(0, start) + block + html.slice(end));

console.log(`${entries.length} guests hashed into ${TARGET}`);
