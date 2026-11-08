// Builds assets/sky.svg from the contribution calendar and refreshes the
// rotating "tonight" block in README.md. Runs daily in GitHub Actions.
// Usage: GITHUB_TOKEN=... node scripts/build.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';

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
const QUOTES = [
  ["I'm gonna be King of the Pirates!", 'Monkey D. Luffy'],
  ['Whatever happens, happens.', 'Spike Spiegel'],
  ['Stand up and walk. Keep moving forward.', 'Edward Elric'],
  ['A lesson without pain is meaningless.', 'Edward Elric'],
  ["If you win, you live. If you lose, you die. If you don't fight, you can't win!", 'Eren Yeager'],
  ["People's dreams... never end!", 'Marshall D. Teach'],
  ['Lights out and away we go!', 'every F1 Sunday'],
  ['You have to fight to reach your dream.', 'Lionel Messi'],
  ['I can do this all day.', 'Steve Rogers'],
  ['I am inevitable.', 'Thanos'],
  ['Nothing is true, everything is permitted.', "Assassin's Creed"],
  ['War. War never changes.', 'Fallout'],
  ["It's dangerous to go alone! Take this.", 'The Legend of Zelda'],
  ['Plus Ultra!', 'All Might'],
  ['Football is played with the head. Your feet are just the tools.', 'Andrea Pirlo'],
];
const day = Math.floor(Date.now() / 864e5);
const [song, artist] = TRACKS[day % TRACKS.length];
const [quote, who] = QUOTES[(day * 7) % QUOTES.length];
const spotify = `https://open.spotify.com/search/${encodeURIComponent(`${song} ${artist}`)}`;

// ---------- zine: punch card + now spinning ----------
const Z = await import('./zine-lib.mjs');
const { C } = Z;
await mkdir(new URL('../assets/zine/', import.meta.url), { recursive: true });
{
  const PW = 1200, PH = 330, hx = 54, hy = 118, sx = (PW - 2 * hx - 40) / 52, sy = 25;
  const holes = days.map((d) => {
    const x = (hx + d.wi * sx).toFixed(1), y = hy + d.weekday * sy, c = d.contributionCount;
    if (!c) return `<circle cx="${x}" cy="${y}" r="5.2" fill="none" stroke="${C.slate}" stroke-opacity=".35" stroke-width="1.2"/>`;
    const ring = [C.slate, C.orange, C.red][Math.ceil((c / max) * 3) - 1];
    return `<g><title>${d.date}: ${c}</title><circle cx="${x}" cy="${y}" r="8" fill="${ring}"/><circle cx="${x}" cy="${y}" r="5" fill="${C.ink}"/></g>`;
  }).join('');
  const bd = days.find((d) => d.date === brightest.date);
  const bx = hx + bd.wi * sx, by = hy + bd.weekday * sy;
  const num = Z.ransom(String(cal.totalContributions), { x: 54, y: 56, size: 58, seed: 'num' + cal.totalContributions, align: 'start' });
  const mo = []; let lm = -1;
  cal.weeks.forEach((w, i) => {
    const dt = new Date(w.contributionDays[0].date + 'T00:00:00Z'), m = dt.getUTCMonth();
    if (m !== lm && (i < cal.weeks.length - 2)) { mo.push(`<text x="${(hx + i * sx - 6).toFixed(1)}" y="${PH - 24}" class="mono" font-size="11" fill="${C.slate}">${dt.toLocaleString('en', { month: 'short', timeZone: 'UTC' }).toUpperCase()}</text>`); lm = m; }
  });
  const card = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}" viewBox="0 0 ${PW} ${PH}" role="img" aria-label="${cal.totalContributions} contributions in the last year, as a punch card">${Z.defs('.st{animation:st 4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes st{50%{transform:rotate(18deg) scale(1.15)}}')}
<rect width="${PW}" height="${PH}" fill="${C.ink}"/>
<path d="M14 14 H${PW - 60} L${PW - 14} 60 V${PH - 14} H14 Z" fill="${C.paper}"/>
${num.svg}
<text x="${(74 + num.width).toFixed(0)}" y="50" class="heavy" font-size="30" fill="${C.ink}" letter-spacing="1">CONTRIBUTIONS</text>
<text x="${(76 + num.width).toFixed(0)}" y="74" class="mono" font-size="12" fill="${C.slate}" letter-spacing="3">PUNCHED IN OVER THE LAST 12 MONTHS</text>
<text x="${PW - 80}" y="48" text-anchor="end" class="mono" font-size="13" fill="${C.ink}" letter-spacing="2">LONGEST RUN · ${longest} DAY${longest === 1 ? '' : 'S'}</text>
<text x="${PW - 80}" y="70" text-anchor="end" class="mono" font-size="13" fill="${C.red}" letter-spacing="2">BEST DAY ★ ${brightest.date}</text>
${holes}
<g class="st"><path d="${Z.star(bx, by - 20, 11)}" fill="${C.orange}" stroke="${C.ink}" stroke-width="2"/></g>
${mo.join('')}
<text x="${PW - 54}" y="${PH - 24}" text-anchor="end" class="mono" font-size="10" fill="${C.slate}" letter-spacing="2">DO NOT FOLD</text>
${Z.grain(PW, PH)}</svg>`;
  await writeFile(new URL('../assets/zine/punchcard.svg', import.meta.url), card);
}
{
  const TW = 1200, TH = 250;
  const qLines = Z.wrap(`“${quote}”`, 30);
  const qSize = qLines.length > 2 ? 24 : 30, lh = qSize + 8;
  const qTop = TH / 2 - ((qLines.length - 1) * lh) / 2 - 6;
  const tonight = `<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${TH}" viewBox="0 0 ${TW} ${TH}" role="img" aria-label="Now spinning: ${Z.esc(song)} by ${Z.esc(artist)}. ${Z.esc(quote)} — ${Z.esc(who)}">${Z.defs('.arm{animation:arm 6s ease-in-out infinite;transform-origin:0 0}@keyframes arm{50%{transform:rotate(3deg)}}')}
<rect width="${TW}" height="${TH}" fill="${C.ink}"/>
<g transform="translate(140 125)"><circle r="104" fill="#0a0a0a"/><g class="spin" style="animation-duration:2.4s">${[96, 84, 72, 60, 50].map((r) => `<circle r="${r}" fill="none" stroke="#262626" stroke-width="1.3"/>`).join('')}<circle r="38" fill="${C.orange}"/><text y="-6" text-anchor="middle" class="mono" font-size="9" fill="${C.ink}">SIDE A</text><text y="14" text-anchor="middle" class="mono" font-size="9" fill="${C.ink}">33 RPM</text><path d="M-90 -30 Q-60 -80 0 -96" fill="none" stroke="#666" stroke-width="2" opacity=".5"/></g><circle r="4" fill="${C.cream}"/></g>
<g transform="translate(262 26)"><g class="arm"><circle r="12" fill="#666"/><path d="M0 0 L-38 118 L-54 132" stroke="${C.cream}" stroke-width="5" fill="none" stroke-linecap="round"/></g></g>
<text x="300" y="74" class="mono" font-size="13" fill="${C.orange}" letter-spacing="4">● NOW SPINNING</text>
<text x="300" y="122" class="serif" font-weight="700" font-size="${song.length > 20 ? 28 : 40}" fill="${C.white}">${Z.esc(song)}</text>
<text x="300" y="156" class="mono" font-size="17" fill="${C.cream}" letter-spacing="2">${Z.esc(artist.toUpperCase())}</text>
<text x="300" y="200" class="mono" font-size="11" fill="#888" letter-spacing="2">CLICK TO PLAY · CHANGES DAILY</text>
<g transform="rotate(-2 940 125)"><path d="M700 ${TH / 2 - 94} L1172 ${TH / 2 - 102} L1180 ${TH / 2 + 90} L708 ${TH / 2 + 98} Z" fill="${C.paper}"/>
${Z.tape(940, TH / 2 - 100, 110, 3)}
${qLines.map((l, i) => `<text x="736" y="${(qTop + i * lh).toFixed(0)}" class="serif" font-style="italic" font-weight="700" font-size="${qSize}" fill="${C.ink}">${Z.esc(l)}</text>`).join('')}
<text x="1150" y="${TH / 2 + 78}" text-anchor="end" class="mono" font-size="14" fill="${C.red}" letter-spacing="2">— ${Z.esc(who.toUpperCase())}</text></g>
${Z.grain(TW, TH)}</svg>`;
  await writeFile(new URL('../assets/zine/tonight.svg', import.meta.url), tonight);
}

// ---------- README blocks ----------
const textBlock = `<!--TONIGHT:START-->
<p align="center">
  <sub>📻 <b>ON THE DECK TONIGHT</b></sub><br/>
  <a href="${spotify}"><b>${song}</b> — ${artist}</a><br/>
  <sub><i>“${quote}” — ${who}</i></sub>
</p>
<!--TONIGHT:END-->`;
const zineBlock = `<!--ZINE-TONIGHT:START-->
<p align="center"><a href="${spotify}"><img src="assets/zine/tonight.svg" width="100%" alt="Now spinning: ${song} — ${artist}"/></a></p>
<!--ZINE-TONIGHT:END-->`;
for (const f of ['../README.md', '../alt/night-drive.md']) {
  const u = new URL(f, import.meta.url);
  let t; try { t = await readFile(u, 'utf8'); } catch { continue; }
  t = t.replace(/<!--TONIGHT:START-->[\s\S]*?<!--TONIGHT:END-->/, textBlock)
    .replace(/<!--ZINE-TONIGHT:START-->[\s\S]*?<!--ZINE-TONIGHT:END-->/, zineBlock.replace('src="assets/', f.includes('alt/') ? 'src="../assets/' : 'src="assets/'));
  await writeFile(u, t);
}
console.log(`sky + punchcard: ${cal.totalContributions} contributions; tonight: ${song} / ${who}`);
