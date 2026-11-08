// Shared drawing kit for the zine design: palette, cut-out "ransom" lettering,
// paper grain, stars. Everything is plain SVG + CSS so it animates on GitHub.
export const C = { cream: '#ece0cf', paper: '#f4ecdf', ink: '#141414', orange: '#f3701e', slate: '#4b607f', red: '#d42a1f', white: '#fbf8f2' };

export const rng = (seed) => {
  let s = typeof seed === 'number' ? seed : [...String(seed)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
export const esc = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const f = (n) => +n.toFixed(1);

const FONTS = ['Impact,"Arial Black",sans-serif', 'Georgia,"Times New Roman",serif', '"Courier New",Courier,monospace', '"Arial Black",Arial,sans-serif', '"Times New Roman",Times,serif', 'Verdana,Geneva,sans-serif', '"Trebuchet MS",sans-serif'];
const PAPERS = [[C.ink, C.white], [C.white, C.ink], [C.orange, C.ink], [C.slate, C.white], [C.cream, C.ink], [C.ink, C.orange], [C.red, C.white]];

// irregular, hand-cut rectangle centred on 0,0
export const scrap = (w, h, r, notch = true) => {
  const j = () => (r() - 0.5) * Math.min(w, h) * 0.12;
  const pts = [[-w / 2 + j(), -h / 2 + j()], notch && r() > 0.5 ? [j(), -h / 2 + Math.abs(j())] : null, [w / 2 + j(), -h / 2 + j()],
    [w / 2 + j(), h / 2 + j()], notch && r() > 0.5 ? [j(), h / 2 - Math.abs(j())] : null, [-w / 2 + j(), h / 2 + j()]].filter(Boolean);
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + 'Z';
};

// Cut-out letters. Returns { svg, width }. align: 'middle' | 'start'
export function ransom(text, { x, y, size, seed = text, align = 'middle', anim = true, papers = PAPERS, fonts = FONTS, tilt = 14 }) {
  const r = rng(seed);
  const items = [...text].map((ch) => {
    if (ch === ' ') return { space: true, w: size * 0.38 };
    const sc = 0.82 + r() * 0.24;
    const w = size * (ch === 'I' || ch === '!' || ch === '.' ? 0.42 : 0.66 + r() * 0.16) * sc, h = size * (1.0 + r() * 0.18) * sc;
    return { ch, w, h, sc, font: fonts[Math.floor(r() * fonts.length)], paper: papers[Math.floor(r() * papers.length)], rot: (r() - 0.5) * tilt, dy: (r() - 0.5) * size * 0.14, delay: -r() * 2 };
  });
  const gap = size * 0.06, total = items.reduce((s, i) => s + i.w + gap, -gap);
  let cx = align === 'middle' ? x - total / 2 : x;
  const out = items.map((i) => {
    const px = cx + i.w / 2; cx += i.w + gap;
    if (i.space) return '';
    const [bg, fg] = i.paper;
    return `<g class="${anim ? 'jit' : ''}" style="animation-delay:${i.delay.toFixed(2)}s"><g transform="translate(${f(px)} ${f(y + i.dy)}) rotate(${i.rot.toFixed(1)})">`
      + `<path d="${scrap(i.w, i.h, r)}" fill="${bg}"/>`
      + `<text y="${f(i.h * 0.3)}" text-anchor="middle" font-family='${i.font}' font-weight="700" font-size="${f(size * 0.86 * i.sc)}" fill="${fg}">${esc(i.ch)}</text></g></g>`;
  }).join('');
  return { svg: out, width: total };
}

export const star = (cx, cy, R, r = R * 0.45, rot = -90) => {
  let d = '';
  for (let i = 0; i < 10; i++) { const a = ((rot + i * 36) * Math.PI) / 180, rr = i % 2 ? r : R; d += `${i ? 'L' : 'M'}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`; }
  return d + 'Z';
};

// jagged burst polygon around a rectangle
export const burst = (x, y, w, h, seed, spikes = 22, amp = 26) => {
  const r = rng(seed); const pts = [];
  for (let i = 0; i < spikes; i++) {
    const t = i / spikes, a = t * Math.PI * 2, out = i % 2 ? amp * (0.4 + r() * 0.6) : 0;
    const ex = Math.cos(a), ey = Math.sin(a), k = 1 / Math.max(Math.abs(ex) / (w / 2), Math.abs(ey) / (h / 2));
    pts.push(`${f(x + ex * (k + out))} ${f(y + ey * (k + out))}`);
  }
  return 'M' + pts.join(' L') + 'Z';
};

export const defs = (extraCss = '') => `<defs>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .13"/></feComponentTransfer></filter>
<pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.7" fill="${C.slate}"/></pattern>
<pattern id="dotsInk" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.3" fill="${C.ink}"/></pattern>
<pattern id="check" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="${C.white}"/><rect width="10" height="10" fill="${C.ink}"/><rect x="10" y="10" width="10" height="10" fill="${C.ink}"/></pattern>
<style>
.jit{animation:jit .9s steps(1) infinite;transform-box:fill-box;transform-origin:center}
@keyframes jit{0%{transform:none}33%{transform:translate(1px,-1.5px) rotate(1.2deg)}66%{transform:translate(-1px,1px) rotate(-.8deg)}}
.spin{animation:spin 14s linear infinite;transform-box:fill-box;transform-origin:center}@keyframes spin{to{transform:rotate(360deg)}}
.mono{font-family:"Courier New",Courier,monospace;font-weight:700}
.serif{font-family:Georgia,"Times New Roman",serif}
.heavy{font-family:Impact,"Arial Black",sans-serif}
${extraCss}
</style></defs>`;

export const grain = (w, h) => `<rect width="${w}" height="${h}" filter="url(#grain)" pointer-events="none"/>`;

// strip of masking tape
export const tape = (x, y, w, rot, color = 'rgba(236,224,207,.82)') => `<rect x="${f(x - w / 2)}" y="${f(y - 11)}" width="${f(w)}" height="22" fill="${color}" transform="rotate(${rot} ${f(x)} ${f(y)})" opacity=".9"/>`;

// wrap text to lines of ~max chars
export const wrap = (s, max) => {
  const words = s.split(' '); const lines = ['']; for (const w of words) { if ((lines.at(-1) + ' ' + w).trim().length > max) lines.push(w); else lines[lines.length - 1] = (lines.at(-1) + ' ' + w).trim(); }
  return lines;
};

// small original pixel cat (sleepy, blinks). 1 unit = px size
export function pixelCat(x, y, px = 7) {
  const body = [
    '..o......o..', '.oOo....oOo.', '.oOOooooOOo.', '.kkkkkkkkkk.', 'kkkkkkkkkkkk', 'kkEEkkkkEEkk', 'kkkkkkkkkkkk', 'kkkkknnkkkkk',
    '.kkkkkkkkkk.', '..kkkkkkkk..', '.kkkkkkkkkk.', 'kkkkkkkkkkkk', 'kkkkkkkkkkkkt', 'kkkkkkkkkkkkt', 'kkkkkkkkkkkt.',
  ];
  const col = { o: C.orange, O: '#ffb36b', k: '#1d1d24', n: '#ff8a65', t: '#1d1d24' };
  let r = '';
  body.forEach((row, j) => [...row].forEach((c, i) => {
    if (c === 'E') r += `<rect class="eye" x="${x + i * px}" y="${y + j * px}" width="${px}" height="${px}" fill="#ffd36b"/>`;
    else if (col[c]) r += `<rect x="${x + i * px}" y="${y + j * px}" width="${px + 0.3}" height="${px + 0.3}" fill="${col[c]}"/>`;
  }));
  return `<g>${r}</g>`;
}
export const catCss = '.eye{animation:blink 5s steps(1) infinite;transform-box:fill-box;transform-origin:center}@keyframes blink{0%,92%,100%{transform:scaleY(.45)}94%,96%{transform:scaleY(.1)}70%{transform:scaleY(1)}80%{transform:scaleY(.45)}}';
