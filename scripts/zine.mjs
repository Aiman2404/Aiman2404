// Generates the static zine art in assets/zine/. Run: node scripts/zine.mjs
import { mkdir, writeFile, readFile, readdir, unlink } from 'node:fs/promises';
import { C, rng, esc, ransom, star, burst, defs, grain, tape, pixelCat, catCss, scrap } from './zine-lib.mjs';

const OUT = new URL('../assets/zine/', import.meta.url);
await mkdir(OUT, { recursive: true });
const save = (name, svg) => writeFile(new URL(name, OUT), svg);
const open = (w, h, label, css = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${defs(css)}`;

/* ---------------- COVER ---------------- */
{
  const W = 1200, H = 470, r = rng('cover');
  const name = ransom('AIMAN', { x: 560, y: 210, size: 150, seed: 'aiman-7' });
  const sub = ransom('JACK OF ALL TRADES', { x: 560, y: 330, size: 44, seed: 'jack-3', tilt: 10 });
  const stars = Array.from({ length: 9 }, (_, i) => {
    const sx = 40 + r() * 1120, sy = 30 + r() * 400, R = 9 + r() * 16;
    if (sx > 230 && sx < 900 && sy > 110 && sy < 380) return '';
    return `<g class="spin" style="animation-duration:${10 + r() * 14}s"><path d="${star(sx, sy, R)}" fill="${i % 3 ? 'none' : C.ink}" stroke="${C.ink}" stroke-width="2.4"/></g>`;
  }).join('');
  const bars = Array.from({ length: 38 }, (_, i) => { const w = [2, 3, 1.5, 4][Math.floor(r() * 4)]; return `<rect x="${60 + i * 4.4}" y="392" width="${w}" height="48" fill="${C.ink}"/>`; }).join('');
  const css = `.stamp{animation:stamp 7s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes stamp{0%,8%{transform:scale(1.9) rotate(-8deg);opacity:0}13%{transform:scale(.94) rotate(-8deg);opacity:1}16%,100%{transform:scale(1) rotate(-8deg);opacity:1}}
.slide{animation:slide 22s linear infinite}@keyframes slide{to{transform:translateX(-40px)}}
${catCss}`;
  const svg = `${open(W, H, 'AIMAN — jack of all trades — 何でも屋', css)}
<rect width="${W}" height="${H}" fill="${C.cream}"/>
<path d="M0 0 H520 L430 140 L0 260 Z" fill="url(#dots)" opacity=".55"/>
<path d="M${W} ${H} H760 L860 330 L${W} 250 Z" fill="url(#dotsInk)" opacity=".35"/>
<path d="${burst(560, 225, 760, 240, 'b1', 30, 40)}" fill="${C.orange}"/>
<path d="M120 120 L1010 70 L1060 290 L170 360 Z" fill="${C.ink}"/>
<path d="M150 360 L1030 300 L1040 318 L160 380 Z" fill="${C.red}"/>
${stars}
<g>${name.svg}</g>
<g>${sub.svg}</g>
<g class="stamp"><g transform="translate(1035 120)">
  <rect x="-66" y="-66" width="132" height="132" rx="10" fill="none" stroke="${C.red}" stroke-width="6"/>
  <rect x="-56" y="-56" width="112" height="112" rx="6" fill="none" stroke="${C.red}" stroke-width="2"/>
  <text y="-8" text-anchor="middle" font-family='"Yu Mincho","Hiragino Mincho ProN","Noto Serif JP",serif' font-weight="700" font-size="38" fill="${C.red}">何でも</text>
  <text y="38" text-anchor="middle" font-family='"Yu Mincho","Hiragino Mincho ProN","Noto Serif JP",serif' font-weight="700" font-size="38" fill="${C.red}">屋</text>
</g></g>
<g transform="rotate(-3 150 52)"><rect x="40" y="30" width="230" height="44" fill="${C.ink}"/><text x="155" y="60" text-anchor="middle" class="mono" font-size="20" fill="${C.cream}" letter-spacing="3">VOL.01 · 2026</text></g>
${tape(155, 30, 90, -12)}
<text x="1160" y="430" text-anchor="end" class="mono" font-size="15" fill="${C.ink}" letter-spacing="2">a.k.a. AJ — computer engineer</text>
<text x="1160" y="452" text-anchor="end" class="serif" font-style="italic" font-size="14" fill="${C.slate}">“a jack of all trades is a master of none, but oftentimes better than a master of one.”</text>
<rect x="52" y="384" width="184" height="72" fill="${C.white}"/>${bars}
<text x="60" y="452" class="mono" font-size="9" fill="${C.ink}" letter-spacing="3.6">4 2 0 2 6 1 0 1 9 9 9 ★</text>
<g transform="translate(978 300)"><rect x="-6" y="-6" width="96" height="112" fill="${C.slate}"/>${pixelCat(0, -2, 7)}</g>
${tape(1020, 296, 70, 8)}
<rect y="${H - 14}" width="${W}" height="14" fill="url(#check)"/>
${grain(W, H)}
</svg>`;
  await save('cover.svg', svg);
}

/* ---------------- MENU BUTTONS (top links) ---------------- */
{
  const glyph = {
    tri: `<path d="M0 -13 L12 9 L-12 9 Z" fill="none" stroke="#6ff3c2" stroke-width="3.2"/>`,
    circ: `<circle r="11" fill="none" stroke="${C.red}" stroke-width="3.4"/>`,
    cross: `<path d="M-10 -10 L10 10 M10 -10 L-10 10" stroke="#7fb3ff" stroke-width="3.4"/>`,
    sq: `<rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#ff8fd0" stroke-width="3.2"/>`,
  };
  const buttons = [['portfolio', 'PORTFOLIO', 'tri'], ['linkedin', 'LINKEDIN', 'circ'], ['email', 'EMAIL', 'cross'], ['note', 'LEAVE A NOTE', 'sq']];
  for (const [i, [file, label, g]] of buttons.entries()) {
    const W = 290, H = 96, r = rng(file);
    const t = ransom(label, { x: 60, y: 50, size: 30, seed: file + 'x', align: 'start', tilt: 8,
      papers: [[C.ink, C.white], [C.white, C.ink], [C.ink, C.white], [C.ink, C.white]] });
    const scale = Math.min(1, 205 / t.width);
    const svg = `${open(W, H, label, '.bob{animation:bob 2.4s ease-in-out infinite}@keyframes bob{50%{transform:translateY(-3px)}}')}
<g class="bob" style="animation-delay:${-i * 0.6}s">
<path d="M18 22 L${W - 8} 8 L${W - 22} ${H - 14} L8 ${H - 6} Z" fill="${C.red}"/>
<path d="M14 16 L${W - 18} 14 L${W - 30} ${H - 22} L22 ${H - 14} Z" fill="${C.ink}"/>
<g transform="translate(40 50) rotate(${-6 + r() * 4})"><circle r="19" fill="${C.white}"/><circle r="17" fill="${C.ink}"/>${glyph[g]}</g>
<g transform="translate(${10 * (1 - scale)} ${50 * (1 - scale)}) scale(${scale.toFixed(3)})"><g transform="translate(14 0)">${t.svg}</g></g>
</g></svg>`;
    await save(`btn-${file}.svg`, svg);
  }
}

/* ---------------- TEAR-OFF FLYER (projects, from projects.json) ---------------- */
{
  const W = 1200, H = 200;
  const t = ransom('TAKE ONE', { x: W / 2, y: 92, size: 74, seed: 'take-4' });
  const head = `${open(W, H, 'Take one — my projects, one tab each')}
<rect width="${W}" height="${H}" fill="${C.ink}"/>
<path d="M150 12 L1050 6 L1056 ${H} L144 ${H} Z" fill="${C.paper}"/>
${tape(600, 10, 150, -2)}
${t.svg}
<text x="${W / 2}" y="160" text-anchor="middle" class="mono" font-size="16" fill="${C.ink}" letter-spacing="4">PROJECTS · PULL A TAB, IT'S FREE</text>
<path d="M150 ${H - 3} H1050" stroke="${C.slate}" stroke-width="2" stroke-dasharray="7 6"/>
<g class="spin"><path d="${star(232, 70, 22)}" fill="${C.orange}" stroke="${C.ink}" stroke-width="2.5"/></g>
<g class="spin" style="animation-direction:reverse"><path d="${star(968, 128, 16)}" fill="none" stroke="${C.ink}" stroke-width="2.5"/></g>
${grain(W, H)}</svg>`;
  await save('flyer.svg', head);

  const projects = JSON.parse(await readFile(new URL('../projects.json', import.meta.url), 'utf8'));
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const tabs = [...projects.map((p) => ({ file: 'p-' + slug(p.name), label: p.name.toUpperCase(), sub: p.note || '', url: p.url })), ...(projects.length < 3 ? [{ file: 'soon', label: 'COMING SOON', sub: 'next build loading…' }] : []), { file: 'torn' }];
  for (const f of await readdir(OUT)) if (f.startsWith('tab-')) await unlink(new URL(f, OUT));
  for (const [i, { file, label = '', sub = '' }] of tabs.entries()) {
    const TW = 150, TH = 300, r = rng('tab' + file);
    const size = Math.min(34, 262 / Math.max(1, label.length * 0.6));
    const rag = Array.from({ length: 11 }, (_, k) => `${(k * TW / 10).toFixed(0)} ${(TH - 6 - r() * 16).toFixed(0)}`).join(' L');
    const body = file === 'torn'
      ? `<path d="M2 0 H${TW - 2} V96 L${rag.split(' L').reverse().map((p) => p.split(' ')[0] + ' ' + (+p.split(' ')[1] - 180)).join(' L')} Z" fill="${C.paper}" opacity=".85"/>`
      : `<path d="M2 0 H${TW - 2} V${TH - 4} L2 ${TH - 2} Z" fill="${C.paper}"/>
<g transform="translate(${TW / 2 + 12} ${TH / 2}) rotate(-90)"><text text-anchor="middle" class="heavy" font-size="${size.toFixed(1)}" fill="${C.ink}" letter-spacing="2">${esc(label)}</text></g>
<g transform="translate(${TW / 2 + 40} ${TH / 2}) rotate(-90)"><text text-anchor="middle" class="mono" font-size="13" fill="${[C.orange, C.slate, C.red][i % 3]}" letter-spacing="1">${esc(sub.slice(0, 30))}</text></g>`;
    const svg = `${open(TW, TH, label || 'a tab someone already took', '.sway{animation:sway 4s ease-in-out infinite;transform-origin:75px 0}@keyframes sway{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}')}
<g class="sway" style="animation-delay:${(-i * 0.7).toFixed(1)}s" opacity="${file === 'soon' ? 0.55 : 1}">${body}<path d="M2 2 H${TW - 2}" stroke="${C.slate}" stroke-width="2" stroke-dasharray="7 6"/></g>${file === 'torn' ? '' : grain(TW, TH)}</svg>`;
    await save(`tab-${file}.svg`, svg);
  }
  // rewrite the projects block in README.md
  const imgs = tabs.map((t) => t.file === 'torn' || t.file === 'soon'
    ? `<img src="assets/zine/tab-${t.file}.svg" width="15%" alt="${t.file === 'soon' ? 'next project coming soon' : ''}"/>`
    : `<a href="${t.url}"><img src="assets/zine/tab-${t.file}.svg" width="15%" alt="${esc(t.label)} — ${esc(t.sub)}"/></a>`).join('');
  const block = `<!--PROJECTS:START-->\n<p align="center"><img src="assets/zine/flyer.svg" width="100%" alt="Take one — my projects"/><br/>${imgs}</p>\n<!--PROJECTS:END-->`;
  const ru = new URL('../README.md', import.meta.url);
  await writeFile(ru, (await readFile(ru, 'utf8')).replace(/<!--PROJECTS:START-->[\s\S]*?<!--PROJECTS:END-->/, block));
}

/* ---------------- THINGS I'M INTO (collage) ---------------- */
{
  const W = 1200, cw = 263, ch = 206, gx = 22, gy = 30, X0 = (W - (4 * cw + 3 * gx)) / 2, Y0 = 110;
  const css = `${catCss}
.l{fill:#3a1410;animation:l1 6s steps(1) infinite}
.l2{animation-name:l2}.l3{animation-name:l3}.l4{animation-name:l4}.l5{animation-name:l5}
@keyframes l1{0%,12%{fill:#3a1410}13%,74%{fill:#ff2a1a}75%,100%{fill:#3a1410}}
@keyframes l2{0%,24%{fill:#3a1410}25%,74%{fill:#ff2a1a}75%,100%{fill:#3a1410}}
@keyframes l3{0%,36%{fill:#3a1410}37%,74%{fill:#ff2a1a}75%,100%{fill:#3a1410}}
@keyframes l4{0%,48%{fill:#3a1410}49%,74%{fill:#ff2a1a}75%,100%{fill:#3a1410}}
@keyframes l5{0%,60%{fill:#3a1410}61%,74%{fill:#ff2a1a}75%,100%{fill:#3a1410}}
.go{opacity:0;animation:go 6s steps(1) infinite}@keyframes go{0%,74%{opacity:0}75%,96%{opacity:1}97%{opacity:0}}
.reel{animation:reel 1.2s linear infinite}@keyframes reel{to{transform:translateX(-36px)}}
.ball{animation:ball 1.6s cubic-bezier(.3,0,.7,1) infinite alternate}@keyframes ball{from{transform:translateY(0)}to{transform:translateY(-30px)}}
.needle{animation:rev 3.2s ease-in-out infinite;transform-origin:0 0}@keyframes rev{0%{transform:rotate(-120deg)}45%{transform:rotate(70deg)}55%{transform:rotate(62deg)}100%{transform:rotate(-120deg)}}
.blink{animation:blink2 1s steps(1) infinite}@keyframes blink2{50%{opacity:.15}}
.pulse{animation:pulse 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}@keyframes pulse{50%{transform:scale(1.12) rotate(-4deg)}}
.zap{animation:zap 3s steps(1) infinite}@keyframes zap{0%,86%{opacity:.25}88%,92%{opacity:1}90%{opacity:.4}}
.score{animation:score 5s steps(1) infinite}@keyframes score{0%,49%{opacity:1}50%,100%{opacity:0}}
.score2{animation:score 5s steps(1) infinite reverse}`;
  const card = (i, bg, inner, rot) => {
    const x = X0 + (i % 4) * (cw + gx), y = Y0 + Math.floor(i / 4) * (ch + gy), r = rng('card' + i);
    return `<g transform="translate(${x.toFixed(1)} ${y}) rotate(${rot} ${cw / 2} ${ch / 2})">
<rect x="6" y="7" width="${cw}" height="${ch}" fill="${C.ink}" opacity=".85"/>
<rect width="${cw}" height="${ch}" fill="${bg}"/>${inner}
${tape(cw / 2 + (r() - 0.5) * 90, 0, 76, (r() - 0.5) * 18)}</g>`;
  };
  const lab = (x, y, s, fill = C.ink, size = 10) => `<text x="${x}" y="${y}" class="mono" font-size="${size}" fill="${fill}" letter-spacing="1.5">${esc(s)}</text>`;
  const big = (x, y, s, fill, size = 30, extra = 'class="heavy"') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" letter-spacing="1" ${extra}>${esc(s)}</text>`;
  const sp = (n, fn) => Array.from({ length: n }, (_, k) => fn(k)).join('');

  const cards = [
    // 0 F1
    card(0, C.ink, `${sp(5, (k) => `<g transform="translate(${36 + k * 48} 30)"><rect x="-18" y="0" width="36" height="76" rx="7" fill="#222"/><circle cy="20" r="11.5" class="l${k ? ' l' + (k + 1) : ''}"/><circle cy="54" r="11.5" class="l${k ? ' l' + (k + 1) : ''}"/></g>`)}
${big(20, 148, 'LIGHTS OUT', C.white, 30)}${big(20, 176, 'AND AWAY WE GO', C.orange, 19, 'class="heavy go"')}${lab(20, 196, 'FORMULA 1', '#8a8a8a')}`, -1.5),
    // 1 football
    card(1, '#2f6b45', `<g stroke="${C.white}" stroke-opacity=".7" stroke-width="2" fill="none"><rect x="12" y="12" width="${cw - 24}" height="${ch - 24}"/><line x1="${cw / 2}" y1="12" x2="${cw / 2}" y2="${ch - 12}"/><circle cx="${cw / 2}" cy="${ch / 2}" r="30"/><rect x="12" y="60" width="36" height="86"/><rect x="${cw - 48}" y="60" width="36" height="86"/></g>
<text x="${cw / 2}" y="${ch / 2 + 40}" text-anchor="middle" class="heavy" font-size="116" fill="${C.white}" opacity=".16">10</text>
<g class="ball"><circle cx="${cw / 2}" cy="${ch / 2 + 6}" r="10" fill="${C.white}"/><path d="${star(cw / 2, ch / 2 + 6, 4.5, 2.6)}" fill="${C.ink}"/></g>
<g transform="rotate(-4 90 40)"><rect x="18" y="22" width="168" height="36" fill="#75aadb"/><rect x="18" y="34" width="168" height="12" fill="${C.white}"/>${big(26, 52, 'MESSI · ARG', C.ink, 24)}</g>
<rect x="18" y="${ch - 40}" width="${cw - 36}" height="22" fill="#a50044"/><rect x="${18 + (cw - 36) / 2}" y="${ch - 40}" width="${(cw - 36) / 2}" height="22" fill="#004d98"/>
<text x="${cw / 2}" y="${ch - 24}" text-anchor="middle" class="mono" font-size="11" fill="#edbb00" letter-spacing="3">FORÇA BARÇA</text>`, 1.2),
    // 2 anime — manga panel
    card(2, C.white, `<clipPath id="clipA"><rect width="${cw}" height="${ch}"/></clipPath><g clip-path="url(#clipA)"><g stroke="${C.ink}" stroke-width="1.4">${sp(40, (k) => { const a = k * 9 * Math.PI / 180, r1 = 52 + (k % 3) * 8; return `<line x1="${(cw / 2 + Math.cos(a) * r1).toFixed(1)}" y1="${(92 + Math.sin(a) * r1 * 0.8).toFixed(1)}" x2="${(cw / 2 + Math.cos(a) * 190).toFixed(1)}" y2="${(92 + Math.sin(a) * 150).toFixed(1)}"/>`; })}</g>
<ellipse cx="${cw / 2}" cy="92" rx="96" ry="52" fill="${C.white}"/></g>
<g class="pulse"><text x="${cw / 2}" y="112" text-anchor="middle" font-family='"Yu Gothic","Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif' font-weight="900" font-size="54" fill="${C.ink}">アニメ</text></g>
<g transform="translate(${cw - 46} 40) rotate(14)"><text text-anchor="middle" font-family='"Yu Gothic","Noto Sans JP",sans-serif' font-weight="900" font-size="30" fill="${C.red}" stroke="${C.white}" stroke-width="5" paint-order="stroke">ドン!</text></g>
<rect x="0" y="${ch - 44}" width="${cw}" height="44" fill="${C.ink}"/>${big(16, ch - 14, '~200 SERIES DEEP', C.white, 22)}`, -1),
    // 3 movies & shows
    card(3, C.ink, `<g class="reel">${sp(11, (k) => `<rect x="${k * 36}" y="12" width="20" height="12" rx="2" fill="${C.cream}"/><rect x="${k * 36}" y="${ch - 24}" width="20" height="12" rx="2" fill="${C.cream}"/>`)}</g>
${sp(3, (k) => `<rect x="${14 + k * 80}" y="38" width="74" height="84" fill="${[C.slate, '#6b2f2a', '#3d4a2f'][k]}"/>`)}
<path d="M22 112 L44 70 L62 100 L72 88 L84 112Z" fill="${C.cream}" opacity=".6"/><circle cx="131" cy="76" r="17" fill="${C.orange}" opacity=".85"/><path d="M196 112 L206 62 L222 62 L236 112Z" fill="${C.cream}" opacity=".5"/>
${big(16, 158, 'MOVIES & SHOWS', C.white, 25)}${lab(16, 176, 'SEEN IT. RATED IT. QUOTED IT.', C.orange)}`, 1.4),
    // 4 gaming
    card(4, C.slate, `<path d="M64 66 Q${cw / 2} 50 ${cw - 64} 66 Q${cw - 26} 76 ${cw - 34} 136 Q${cw - 44} 160 ${cw - 76} 136 L76 136 Q44 160 34 136 Q26 76 64 66Z" fill="${C.ink}"/>
<g transform="translate(${cw - 82} 96)"><path d="M0 -21 L6 -11 L-6 -11Z" fill="none" stroke="#6ff3c2" stroke-width="2"/><circle cx="14" cy="0" r="5" fill="none" stroke="${C.red}" stroke-width="2"/><path d="M-4 10 L4 18 M4 10 L-4 18" stroke="#7fb3ff" stroke-width="2"/><rect x="-18" y="-4" width="8" height="8" fill="none" stroke="#ff8fd0" stroke-width="2"/></g>
<g transform="translate(82 96)" fill="#555"><rect x="-5" y="-15" width="10" height="30"/><rect x="-15" y="-5" width="30" height="10"/></g>
${big(16, 40, 'PRESS START', C.white, 24)}<text x="${cw - 16}" y="40" text-anchor="end" class="mono blink" font-size="11" fill="${C.cream}">▶ 1P</text>${lab(16, 186, 'STORY GAMES ONLY GO HARD', C.cream)}`, -1.2),
    // 5 on the court — scoreboard
    card(5, C.cream, `<rect x="16" y="20" width="${cw - 32}" height="96" rx="6" fill="${C.ink}"/>
<text x="56" y="44" text-anchor="middle" class="mono" font-size="11" fill="${C.cream}">AJ</text><text x="${cw - 56}" y="44" text-anchor="middle" class="mono" font-size="11" fill="${C.cream}">YOU</text>
<g class="score"><text x="56" y="98" text-anchor="middle" class="mono" font-size="48" fill="${C.orange}">21</text><text x="${cw - 56}" y="98" text-anchor="middle" class="mono" font-size="48" fill="${C.orange}">19</text></g>
<g class="score2"><text x="56" y="98" text-anchor="middle" class="mono" font-size="48" fill="${C.orange}">11</text><text x="${cw - 56}" y="98" text-anchor="middle" class="mono" font-size="48" fill="${C.orange}">7</text></g>
<text x="${cw / 2}" y="88" text-anchor="middle" class="mono blink" font-size="36" fill="${C.red}">:</text>
${big(16, 156, 'ON THE COURT', C.ink, 26)}<text x="16" y="178" class="mono" font-size="9" fill="${C.slate}">TABLE TENNIS · VOLLEYBALL · PADEL</text>${lab(16, 194, 'not watching. playing.', C.red)}`, 1),
    // 6 cars
    card(6, C.ink, `<g transform="translate(${cw / 2} 92)"><circle r="64" fill="#1c1c1c" stroke="${C.cream}" stroke-width="2"/>${sp(9, (k) => { const a = (-210 + k * 30) * Math.PI / 180; return `<line x1="${(52 * Math.cos(a)).toFixed(1)}" y1="${(52 * Math.sin(a)).toFixed(1)}" x2="${(60 * Math.cos(a)).toFixed(1)}" y2="${(60 * Math.sin(a)).toFixed(1)}" stroke="${k > 6 ? C.red : C.cream}" stroke-width="3"/><text x="${(40 * Math.cos(a)).toFixed(1)}" y="${(40 * Math.sin(a) + 4).toFixed(1)}" text-anchor="middle" class="mono" font-size="10" fill="${k > 6 ? C.red : C.cream}">${k}</text>`; })}<g class="needle"><line x1="0" y1="0" x2="50" y2="0" stroke="${C.orange}" stroke-width="4" stroke-linecap="round"/></g><circle r="6" fill="${C.orange}"/></g>
${big(16, 190, 'CARS', C.white, 30)}<text x="${cw - 16}" y="190" text-anchor="end" class="mono" font-size="10" fill="${C.orange}">ASK ME ANY SPEC</text>`, -0.8),
    // 7 pc parts
    card(7, C.slate, `<g transform="translate(${cw / 2} 80) scale(.9)"><rect x="-50" y="-50" width="100" height="100" rx="4" fill="#2b3a52"/>${sp(7, (k) => `<rect x="${-39 + k * 12}" y="-62" width="5" height="12" fill="${C.cream}"/><rect x="${-39 + k * 12}" y="50" width="5" height="12" fill="${C.cream}"/><rect x="-62" y="${-39 + k * 12}" width="12" height="5" fill="${C.cream}"/><rect x="50" y="${-39 + k * 12}" width="12" height="5" fill="${C.cream}"/>`)}<rect x="-30" y="-30" width="60" height="60" fill="${C.ink}"/><circle class="blink" cx="20" cy="-20" r="3" fill="#6ff3c2"/><text y="6" text-anchor="middle" class="mono" font-size="15" fill="${C.cream}">CPU</text></g>
${big(16, 180, 'PC PARTS', C.white, 28)}${lab(16, 197, "I'LL SPEC YOUR BUILD", C.orange)}`, 1.1),
    // 8 marvel
    card(8, C.red, `<rect x="14" y="14" width="${cw - 28}" height="${ch - 28}" fill="none" stroke="${C.white}" stroke-width="2"/>
${big(30, 80, 'I STAY FOR THE', C.white, 24)}${big(30, 124, 'POST-CREDITS', C.ink, 36)}
${lab(30, 158, 'MARVEL · ALWAYS', C.white)}${lab(30, 174, 'scroll to the end ↓', C.white)}`, -1.3),
    // 9 music
    card(9, C.ink, `<g transform="translate(76 ${ch / 2 - 6})"><g class="spin" style="animation-duration:3s"><circle r="60" fill="#0a0a0a"/>${[52, 43, 34].map((rr) => `<circle r="${rr}" fill="none" stroke="#2c2c2c" stroke-width="1.5"/>`).join('')}<circle r="20" fill="${C.orange}"/><circle r="3" fill="${C.ink}"/></g></g>
${big(150, 78, 'ON', C.cream, 30)}${big(150, 112, 'REPEAT', C.orange, 30)}${lab(150, 140, '505', C.cream)}${lab(150, 156, 'TAME IMPALA', C.cream)}${lab(150, 172, 'CITY POP @ 2AM', C.cream)}`, 1.3),
    // 10 mythology
    card(10, C.slate, `<g transform="translate(66 30) scale(.85)" fill="${C.cream}"><rect x="-34" y="0" width="68" height="12"/><rect x="-28" y="12" width="56" height="8"/>${sp(4, (k) => `<rect x="${-24 + k * 13}" y="22" width="9" height="96"/>`)}<rect x="-30" y="118" width="60" height="8"/><rect x="-36" y="126" width="72" height="12"/></g>
<path class="zap" d="M${cw - 70} 22 L${cw - 96} 86 L${cw - 76} 86 L${cw - 92} 144 L${cw - 46} 70 L${cw - 68} 70 L${cw - 52} 22Z" fill="#ffd36b"/>
${big(16, 184, 'MYTHS & LEGENDS', C.white, 23)}${lab(16, 198, 'GODS · MONSTERS · ALL OF IT', C.cream)}`, -1),
    // 11 aesthetics
    card(11, C.paper, `${[['#e8d8c9', 'E8D8C9'], ['#4b607f', '4B607F'], ['#f3701e', 'F3701E']].map(([c, h], k) => `<rect x="16" y="${22 + k * 40}" width="${cw - 32}" height="34" rx="6" fill="${c}" stroke="${C.ink}" stroke-opacity=".15"/><text x="${cw - 26}" y="${44 + k * 40}" text-anchor="end" class="mono" font-size="12" fill="${k ? C.ink : C.slate}">#${h}</text>`).join('')}
${big(16, 172, 'AESTHETICS', C.ink, 28)}${lab(16, 192, 'MY PINTEREST IS A MUSEUM', C.slate)}`, 1),
  ];
  const H = Y0 + 3 * (ch + gy) + 10;
  const title = ransom('THINGS I\'M INTO', { x: W / 2, y: 54, size: 46, seed: 'into-2' });
  const svg = `${open(W, H, 'Things I am into: Formula 1, Messi and Argentina, Barça, anime, movies and shows, story games, table tennis, volleyball, padel, cars, PC parts, Marvel, music, mythology, aesthetics', css)}
<rect width="${W}" height="${H}" fill="${C.paper}"/>
<path d="M0 ${H} L0 ${H - 160} L240 ${H} Z" fill="url(#dots)" opacity=".4"/>
${title.svg}
${cards.join('\n')}
${grain(W, H)}</svg>`;
  await save('into.svg', svg);
}

/* ---------------- LOADOUT (label-maker tape) ---------------- */
{
  const W = 1200, H = 300;
  const tapes = [['HARDWARE', C.ink], ['MICROCONTROLLERS', C.red], ['C++ / C#', C.slate], ['AI / ML', C.ink], ['REACT · WEB', C.orange], ['.NET · FIREBASE', C.ink],
    ['NETWORKING', C.slate], ['VIDEO & PHOTO', C.red], ['FIX ANYTHING', C.ink]];
  const r = rng('tape');
  let x = 60, y = 112; const rows = [];
  for (const [t, col] of tapes) {
    const w = t.length * 22 + 50;
    if (x + w > W - 50) { x = 60 + r() * 50; y += 66; }
    const rot = (r() - 0.5) * 4;
    rows.push(`<g transform="rotate(${rot.toFixed(1)} ${x + w / 2} ${y})"><rect x="${x + 3}" y="${y - 22 + 4}" width="${w}" height="44" fill="#000" opacity=".25"/>
<path d="M${x} ${y - 22} H${x + w} l-6 7 6 7 -6 8 6 7 -6 7 6 8 H${x} Z" fill="${col}"/>
<text x="${x + 22}" y="${y + 9}" font-family='"Arial Black",Impact,sans-serif' font-size="23" letter-spacing="5" fill="#000" opacity=".35">${esc(t)}</text>
<text x="${x + 21}" y="${y + 7.5}" font-family='"Arial Black",Impact,sans-serif' font-size="23" letter-spacing="5" fill="${C.white}">${esc(t)}</text></g>`);
    x += w + 26;
  }
  const title = ransom('LOADOUT', { x: 60, y: 46, size: 44, seed: 'load-1', align: 'start' });
  const svg = `${open(W, H, 'Loadout: ' + tapes.map((t) => t[0]).join(', '))}
<rect width="${W}" height="${H}" fill="${C.cream}"/>${title.svg}
<text x="${W - 60}" y="54" text-anchor="end" class="mono" font-size="13" fill="${C.slate}" letter-spacing="3">PRINTED ON A LABEL MAKER, OBVIOUSLY</text>
${rows.join('')}${grain(W, H)}</svg>`;
  await save('loadout.svg', svg);
}
console.log('zine art written');

/* ---------------- post-credits cat ---------------- */
{
  const W = 220, H = 200;
  const svg = `${open(W, H, 'a sleepy pixel cat', catCss + '.z{animation:z 3s ease-out infinite;opacity:0}@keyframes z{0%{transform:translate(0,0);opacity:0}20%{opacity:1}100%{transform:translate(14px,-30px);opacity:0}}')}
<rect width="${W}" height="${H}" fill="${C.ink}"/>
<g transform="translate(68 60)">${pixelCat(0, 0, 7)}</g>
<text x="160" y="60" class="mono z" font-size="16" fill="${C.cream}">z</text><text x="170" y="48" class="mono z" style="animation-delay:-1.5s" font-size="12" fill="${C.cream}">z</text>
<rect y="${H - 10}" width="${W}" height="10" fill="url(#check)"/>${grain(W, H)}</svg>`;
  await save('cat.svg', svg);
}
