// Builds assets/sky.svg from the contribution calendar and refreshes the
// rotating "tonight" block in README.md. Runs daily in GitHub Actions.
// Usage: GITHUB_TOKEN=... node scripts/build.mjs
import { readFile, writeFile } from 'node:fs/promises';

const USER = process.env.PROFILE_USER || 'Aiman2404';
const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) throw new Error('GITHUB_TOKEN is required');

// ---------- data ----------
const query = `query($login:String!){ user(login:$login){ contributionsCollection{
  contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount weekday } } } } } }`;
const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-sky' },
  body: JSON.stringify({ query, variables: { login: USER } }),
});
const json = await res.json();
if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
const cal = json.data.user.contributionsCollection.contributionCalendar;
const days = cal.weeks.flatMap((w, wi) => w.contributionDays.map((d) => ({ ...d, wi })));

// ---------- helpers ----------
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 2 ** 32; };
const W = 1200, H = 330, X0 = 40, Y0 = 86, DX = (W - 2 * X0) / 53, DY = 30;

const max = Math.max(1, ...days.map((d) => d.contributionCount));
const stars = days.map((d) => {
  const j1 = hash(d.date) - 0.5, j2 = hash(d.date + 'y') - 0.5;
  return { ...d, x: X0 + d.wi * DX + j1 * DX * 0.9, y: Y0 + d.weekday * DY + j2 * DY * 0.8,
    mag: d.contributionCount ? Math.ceil((d.contributionCount / max) * 4) : 0 };
});
const lit = stars.filter((s) => s.mag > 0);

// constellations: join each lit star to nearby lit stars (union-find for clusters)
const parent = new Map(lit.map((s) => [s.date, s.date]));
const find = (a) => (parent.get(a) === a ? a : (parent.set(a, find(parent.get(a))), parent.get(a)));
const links = [];
for (let i = 0; i < lit.length; i++) {
  let best = null, bestD = Infinity;
  for (let j = 0; j < i; j++) {
    const d = Math.hypot(lit[i].x - lit[j].x, lit[i].y - lit[j].y);
    if (d < bestD) { bestD = d; best = lit[j]; }
  }
  if (best && bestD < 62) { links.push([best, lit[i]]); parent.set(find(lit[i].date), find(best.date)); }
}
const clusters = new Map();
for (const s of lit) { const r = find(s.date); clusters.set(r, [...(clusters.get(r) || []), s]); }
const named = [...clusters.values()].filter((c) => c.length >= 3).sort((a, b) => b.length - a.length).slice(0, 3);
const NAMES = ['The Wanderer', 'The Ferryman', 'The Smith', 'The Lantern', 'The Serpent', 'The Navigator'];
const seasonSeed = Math.floor(hash(cal.weeks[0].contributionDays[0].date) * NAMES.length);

// streaks
let longest = 0, run = 0;
for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
const brightest = days.reduce((a, b) => (b.contributionCount > a.contributionCount ? b : a));

// ---------- svg ----------
const R = [0, 3, 4, 5.2, 6.5];
const COL = ['', '#c9b8ff', '#ffd9b0', '#ffb36b', '#ff6f9a'];
const esc = (s) => s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
let seed = 404; const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const dust = Array.from({ length: 240 }, () => `<circle cx="${(20 + rnd() * (W - 40)).toFixed(1)}" cy="${(80 + rnd() * (H - 112)).toFixed(1)}" r="${(0.4 + rnd() * 0.9).toFixed(2)}"/>`).join('');
const lines = links.map(([a, b]) => `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"/>`).join('');
const litSvg = lit.map((s, i) => {
  const delay = (-hash(s.date + 'd') * 5).toFixed(2);
  const halo = s.mag >= 1 ? `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${R[s.mag] * 3.2}" fill="${COL[s.mag]}" opacity=".16"/>` : '';
  return `${halo}<circle class="s" style="animation-delay:${delay}s" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${R[s.mag]}" fill="${COL[s.mag]}"><title>${s.date}: ${s.contributionCount}</title></circle>`;
}).join('');
const placed = [];
const labels = named.map((c, i) => {
  const top = c.reduce((a, b) => (b.y < a.y ? b : a));
  const x = Math.min(W - 90, Math.max(90, top.x));
  const bot = c.reduce((a, b) => (b.y > a.y ? b : a)); const ly = top.y - 16 < 90 ? bot.y + 24 : top.y - 16;
  if (placed.some(([px, py]) => Math.abs(px - x) < 120 && Math.abs(py - ly) < 30)) return ''; placed.push([x, ly]);
  return `<text class="lbl" x="${x.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle">${esc(NAMES[(seasonSeed + i) % NAMES.length])}</text>`;
}).join('');
const months = [];
let lastM = -1;
for (const w of cal.weeks) {
  const d = new Date(w.contributionDays[0].date + 'T00:00:00Z'), m = d.getUTCMonth();
  if (m !== lastM) { months.push(`<text class="m" x="${(X0 + cal.weeks.indexOf(w) * DX).toFixed(1)}" y="${H - 14}">${d.toLocaleString('en', { month: 'short', timeZone: 'UTC' }).toUpperCase()}</text>`); lastM = m; }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${cal.totalContributions} contributions in the last year, drawn as a star chart">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07061a"/><stop offset="1" stop-color="#140b2e"/></linearGradient>
<style>
.s{animation:tw 5s ease-in-out infinite}@keyframes tw{50%{opacity:.35}}
.h{font:700 22px Georgia,serif;fill:#ffe2b8;letter-spacing:2px}
.k{font:500 12px ui-monospace,Consolas,monospace;fill:#b9a6d6;letter-spacing:3px}
.lbl{font:italic 12px Georgia,serif;fill:#ffd9b0;opacity:.8;letter-spacing:1px}
.shoot{animation:shoot 9s ease-in infinite;opacity:0}@keyframes shoot{0%{transform:translate(1050px,90px);opacity:0}4%{opacity:.9}10%{transform:translate(760px,190px);opacity:0}100%{opacity:0}}
.m{font:500 10px ui-monospace,Consolas,monospace;fill:#6f5f95;letter-spacing:2px}
</style></defs>
<rect width="${W}" height="${H}" rx="14" fill="url(#bg)"/>
<text class="h" x="${X0}" y="40">${cal.totalContributions} stars charted</text>
<text class="k" x="${X0}" y="62">EVERY STAR IS A DAY I SHIPPED · BRIGHTER = BUSIER · LAST 12 MONTHS</text>
<text class="k" x="${W - X0}" y="40" text-anchor="end">LONGEST RUN · ${longest} NIGHT${longest === 1 ? '' : 'S'}</text>
<text class="k" x="${W - X0}" y="62" text-anchor="end">BRIGHTEST · ${brightest.date}</text>
<g fill="#8f7fc0" opacity=".35">${dust}</g>
<g stroke="#ffd9b0" stroke-opacity=".45" stroke-width="1.2">${lines}</g>
${litSvg}
${labels}
<g class="shoot"><line x1="0" y1="0" x2="70" y2="-22" stroke="#ffe9cf" stroke-width="1.4" stroke-linecap="round"/></g>
${months.join('')}
</svg>`;
await writeFile(new URL('../assets/sky.svg', import.meta.url), svg);

// ---------- tonight's rotation ----------
const TRACKS = [
  ['505', 'Arctic Monkeys'], ['Let It Happen', 'Tame Impala'], ['Do I Wanna Know?', 'Arctic Monkeys'],
  ['The Less I Know the Better', 'Tame Impala'], ['Plastic Love', 'Mariya Takeuchi'], ['Borderline', 'Tame Impala'],
  ['R U Mine?', 'Arctic Monkeys'], ['Mayonaka no Door', 'Miki Matsubara'], ['Eventually', 'Tame Impala'],
  ['Fluorescent Adolescent', 'Arctic Monkeys'], ['New Person, Same Old Mistakes', 'Tame Impala'], ['Why\'d You Only Call Me When You\'re High?', 'Arctic Monkeys'],
];
const OMENS = [
  'Gilgamesh went looking for forever and came home with a story. Ship the story.',
  'Sisyphus, but the boulder is a merge conflict.',
  'Hephaestus was the only god who fixed his own stuff. Respect.',
  'Odin gave an eye for wisdom. I gave a weekend to a loose jumper wire.',
  'Every map ends at the edge. That is where the good part is drawn.',
  'Prometheus stole fire. I stole 5 volts off a USB port.',
  'The ferryman asks one coin. The compiler asks one semicolon.',
  'Icarus had a thermal-management problem.',
  'Daedalus built the labyrinth and still needed a way out. Write docs.',
  'Anansi won every story by being curious first.',
  'The Norns weave fate in threads. I weave it in jumper cables.',
  'Even Atlas takes a lap around the block at 2am.',
];
const day = Math.floor(Date.now() / 864e5);
const [song, artist] = TRACKS[day % TRACKS.length];
const omen = OMENS[(day * 7) % OMENS.length];
const q = encodeURIComponent(`${song} ${artist}`);
const block = `<!--TONIGHT:START-->
<p align="center">
  <sub>📻 <b>ON THE DECK TONIGHT</b></sub><br/>
  <a href="https://open.spotify.com/search/${q}"><b>${song}</b> — ${artist}</a><br/>
  <sub><i>“${omen}”</i></sub>
</p>
<!--TONIGHT:END-->`;
const readmeUrl = new URL('../README.md', import.meta.url);
const readme = await readFile(readmeUrl, 'utf8');
await writeFile(readmeUrl, readme.replace(/<!--TONIGHT:START-->[\s\S]*?<!--TONIGHT:END-->/, block));
console.log(`sky: ${cal.totalContributions} contributions, ${lit.length} lit days, ${named.length} constellations; tonight: ${song}`);
