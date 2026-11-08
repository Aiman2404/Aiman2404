// Generates assets/inventory.svg (static). Edit ITEMS and re-run: node scripts/inventory.mjs
import { writeFile } from 'node:fs/promises';
const RAR = { legendary: '#ffb36b', epic: '#ff6f9a', rare: '#6ff3e4', quest: '#c9b8ff' };
const ITEMS = [
  ['Hardware', 'circuits · repair', 'legendary', 5],
  ['Microcontrollers', 'embedded · IoT', 'legendary', 4],
  ['C++ / C#', 'native code', 'epic', 4],
  ['AI / ML', 'models into products', 'epic', 3],
  ['React + Tailwind', 'the screen part', 'rare', 4],
  ['Firebase / .NET', 'the backend part', 'rare', 4],
  ['Camera + CapCut', 'video · photo', 'epic', 5],
  ['Networking', 'routing · Linux', 'rare', 3],
];
const W = 1200, cols = 4, pad = 40, gap = 16, cw = (W - pad * 2 - gap * (cols - 1)) / cols, ch = 86;
const rows = Math.ceil(ITEMS.length / cols), H = 70 + rows * (ch + gap) + 24;
const cells = ITEMS.map(([name, sub, r, lvl], i) => {
  const x = pad + (i % cols) * (cw + gap), y = 70 + Math.floor(i / cols) * (ch + gap), c = RAR[r];
  const pips = Array.from({ length: 5 }, (_, k) => `<rect x="${x + 18 + k * 16}" y="${y + 64}" width="12" height="5" rx="1" fill="${k < lvl ? c : '#2a2147'}"/>`).join('');
  return `<g class="slot" style="animation-delay:${(-i * 0.7).toFixed(1)}s">
<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="10" fill="#120b28" stroke="${c}" stroke-opacity=".55"/>
<rect x="${x}" y="${y}" width="4" height="${ch}" rx="2" fill="${c}"/>
<text class="n" x="${x + 18}" y="${y + 30}">${name}</text>
<text class="d" x="${x + 18}" y="${y + 49}">${sub}</text>
<text class="r" x="${x + cw - 14}" y="${y + 69}" text-anchor="end" fill="${c}">${r.toUpperCase()}</text>${pips}</g>`;
}).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Inventory: ${ITEMS.map((i) => i[0]).join(', ')}">
<style>.t{font:700 20px Georgia,serif;fill:#ffe2b8;letter-spacing:2px}.k{font:500 12px ui-monospace,Consolas,monospace;fill:#b9a6d6;letter-spacing:3px}
.n{font:700 17px Georgia,serif;fill:#fff1e2}.d{font:500 12px ui-monospace,Consolas,monospace;fill:#a897c9}.r{font:700 10px ui-monospace,Consolas,monospace;letter-spacing:2px}
.slot{animation:glow 6s ease-in-out infinite}@keyframes glow{50%{opacity:.82}}</style>
<rect width="${W}" height="${H}" rx="14" fill="#0b0820"/>
<text class="t" x="${pad}" y="42">INVENTORY</text><text class="k" x="${W - pad}" y="42" text-anchor="end">CLASS · JACK OF ALL TRADES · 何でも屋</text>
${cells}</svg>`;
await writeFile(new URL('../assets/inventory.svg', import.meta.url), svg);
