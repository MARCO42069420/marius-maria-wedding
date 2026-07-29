#!/usr/bin/env node
// Renders the seat transcription back onto the floor plan, with names, so it
// can be proof-read against the original venue plan.
//
//   node tools/preview-seats.mjs
//   -> seating/plan-preview.local.html   (git-ignored — it contains names)
//
// Geometry is read straight out of index.html so the preview always matches
// what the published plan draws.

import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const plan = JSON.parse(readFileSync('seating/seats.local.json', 'utf8'));
const OUT = 'seating/plan-preview.local.html';

const slice = (from, to) => html.slice(html.indexOf(from), html.indexOf(to));
const geometry = await import('data:text/javascript;base64,' + Buffer.from(
  slice('const FP_W', 'function fpChairs') +
  '\nexport { FP_W, FP_H, FP_R, FP_CHAIR_GAP, FP_CHAIR_R, FP_HEAD, FP_CLUSTERS, FP_OFFSETS, FP_SEATS };'
).toString('base64'));

const { FP_W, FP_H, FP_R, FP_CHAIR_GAP, FP_CHAIR_R, FP_HEAD, FP_CLUSTERS, FP_OFFSETS } = geometry;

const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

let body = '';

// Head table
const h = FP_HEAD;
const head = (plan['Prezidium'] || [[]])[0];
body += `<rect class="t" x="${h.x - h.w / 2}" y="${h.y}" width="${h.w}" height="${h.h}" rx="20"/>`;
head.forEach((name, i) => {
  const x = h.x - h.w / 2 + (h.w / (head.length + 1)) * (i + 1);
  const y = h.y + h.h + FP_CHAIR_GAP;
  body += `<circle class="c" cx="${x}" cy="${y}" r="${FP_CHAIR_R}"/>`
       +  `<text class="n" x="${x}" y="${y + 14}" text-anchor="middle">${i + 1}. ${esc(name)}</text>`;
});

for (const c of FP_CLUSTERS) {
  const rounds = plan[c.t] || [];
  FP_OFFSETS.forEach((o, r) => {
    const cx = c.x + (c.flip ? -o.x : o.x);
    const cy = c.y + o.y;
    body += `<circle class="t" cx="${cx}" cy="${cy}" r="${FP_R}"/>`
         +  `<text class="num" x="${cx}" y="${cy + 8}" text-anchor="middle">${c.t}</text>`;
    (rounds[r] || []).forEach((name, s) => {
      const count = rounds[r].length;
      const a = (s / count) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(a) * (FP_R + FP_CHAIR_GAP);
      const py = cy + Math.sin(a) * (FP_R + FP_CHAIR_GAP);
      const lx = cx + Math.cos(a) * (FP_R + FP_CHAIR_GAP + 8);
      const ly = cy + Math.sin(a) * (FP_R + FP_CHAIR_GAP + 8);
      const anchor = Math.cos(a) < -0.25 ? 'end' : Math.cos(a) > 0.25 ? 'start' : 'middle';
      body += `<circle class="c" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${FP_CHAIR_R}"/>`
           +  `<text class="n" x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}">${s + 1}. ${esc(name)}</text>`;
    });
  });
}

const counts = Object.entries(plan)
  .filter(([k]) => !k.startsWith('_'))
  .map(([t, rounds]) => `${t}: ${rounds.map(r => r.length).join('+')} = ${rounds.flat().length}`)
  .join(' · ');

writeFileSync(OUT, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Seat transcription — proof-read</title>
<style>
  body{margin:0;padding:24px;background:#faf8f3;font-family:system-ui,sans-serif;color:#3b4630;}
  h1{font-size:17px;font-weight:600;margin:0 0 4px;}
  p{font-size:13px;color:#6b7a4e;margin:0 0 18px;line-height:1.6;}
  svg{width:100%;height:auto;background:#fff;border:1px solid #d7dec8;}
  .t{fill:#fff;stroke:#6b7a4e;stroke-width:1.4;}
  .c{fill:#6b7a4e;}
  .n{font-size:7.2px;fill:#3b4630;}
  .num{font-size:22px;fill:#6b7a4e;opacity:0.35;}
</style></head><body>
<h1>Seat transcription — proof-read against the venue plan</h1>
<p>Seats are numbered clockwise from the top of each round table, in the order they will light up on the site.<br>${counts}</p>
<svg viewBox="-70 0 ${FP_W + 140} ${FP_H}" xmlns="http://www.w3.org/2000/svg">${body}</svg>
</body></html>
`);

console.log(`wrote ${OUT} — open it in a browser and compare with the original plan`);
