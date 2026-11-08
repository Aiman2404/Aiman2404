// Generates the static zine art in assets/zine/. Run: node scripts/zine.mjs
import { mkdir, writeFile } from 'node:fs/promises';
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

/* ---------------- MENU BUTTONS ---------------- */
const glyph = {
  tri: `<path d="M0 -13 L12 9 L-12 9 Z" fill="none" stroke="#6ff3c2" stroke-width="3.2"/>`,
  circ: `<circle r="11" fill="none" stroke="${C.red}" stroke-width="3.4"/>`,
  cross: `<path d="M-10 -10 L10 10 M10 -10 L-10 10" stroke="#7fb3ff" stroke-width="3.4"/>`,
  sq: `<rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#ff8fd0" stroke-width="3.2"/>`,
};
const buttons = [['portfolio', 'PORTFOLIO', 'tri'], ['linkedin', 'LINKEDIN', 'circ'], ['project', 'STEAM-IPAD', 'cross'], ['note', 'LEAVE A NOTE', 'sq']];
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

/* ---------------- THINGS I'M INTO (collage) ---------------- */
{
  const W = 1200, cw = 362, ch = 214, gx = 32, gy = 34, X0 = 38, Y0 = 108;
  const css = `${catCss}
.l{fill:#3a1410;animation:light 6s steps(1) infinite}
@keyframes light{0%{fill:#3a1410}100%{fill:#3a1410}}
.l1{animation-name:l1}.l2{animation-name:l2}.l3{animation-name:l3}.l4{animation-name:l4}.l5{animation-name:l5}
@keyframes l1{0%,12%{fill:#3a1410}13%,74%{fill:#ff2a1a}75%,100%{fill:#3a1410}}
@keyframes l2{0%,24%{fill:#3a1410}25%,74%{fill:#ff2a1a}75%,100%{fill:#3a1410}}
@keyframes l3{0%,36%{fill:#3a1410}37%,74%{fill:#ff2a1a}75%,100%{fill:#3a1410}}
@keyframes l4{0%,48%{fill:#3a1410}49%,74%{fill:#ff2a1a}75%,100%{fill:#3a1410}}
@keyframes l5{0%,60%{fill:#3a1410}61%,74%{fill:#ff2a1a}75%,100%{fill:#3a1410}}
.go{opacity:0;animation:go 6s steps(1) infinite}@keyframes go{0%,74%{opacity:0}75%,96%{opacity:1}97%{opacity:0}}
.reel{animation:reel 1.2s linear infinite}@keyframes reel{to{transform:translateX(-36px)}}
.ball{animation:ball 1.6s cubic-bezier(.3,0,.7,1) infinite alternate}@keyframes ball{from{transform:translateY(0)}to{transform:translateY(-34px)}}
.needle{animation:rev 3.2s ease-in-out infinite;transform-origin:0 0}@keyframes rev{0%{transform:rotate(-120deg)}45%{transform:rotate(70deg)}55%{transform:rotate(62deg)}100%{transform:rotate(-120deg)}}
.pong{animation:pong 1.1s ease-in-out infinite alternate}@keyframes pong{from{transform:translateX(0)}to{transform:translateX(150px)}}
.hero{animation:hero 3s steps(1) infinite}@keyframes hero{50%{opacity:.25}}`;
  const card = (i, bg, inner, rot) => {
    const x = X0 + (i % 3) * (cw + gx), y = Y0 + Math.floor(i / 3) * (ch + gy), r = rng('card' + i);
    return `<g transform="translate(${x} ${y}) rotate(${rot} ${cw / 2} ${ch / 2})">
<rect x="6" y="7" width="${cw}" height="${ch}" fill="${C.ink}" opacity=".85"/>
<rect width="${cw}" height="${ch}" fill="${bg}"/>${inner}
${tape(cw / 2 + (r() - 0.5) * 120, 0, 84, (r() - 0.5) * 18)}</g>`;
  };
  const lab = (x, y, s, fill = C.ink, size = 13) => `<text x="${x}" y="${y}" class="mono" font-size="${size}" fill="${fill}" letter-spacing="2">${esc(s)}</text>`;
  const big = (x, y, s, fill, size = 34, cls = 'heavy') => `<text x="${x}" y="${y}" class="${cls}" font-size="${size}" fill="${fill}" letter-spacing="1">${esc(s)}</text>`;

  const cards = [
    // F1 lights
    card(0, C.ink, `${[0, 1, 2, 3, 4].map((k) => `<g transform="translate(${46 + k * 66} 46)"><rect x="-24" y="0" width="48" height="96" rx="8" fill="#222"/><circle cy="26" r="15" class="l l${k + 1}"/><circle cy="68" r="15" class="l l${k + 1}"/></g>`).join('')}
${big(26, 186, 'LIGHTS OUT', C.white, 30)}<text x="196" y="186" class="heavy go" font-size="30" fill="${C.orange}">AND AWAY WE GO</text>${lab(26, 206, 'FORMULA 1 · SUNDAYS ARE BOOKED', '#9a9a9a', 10)}`, -1.5),
    // football
    card(1, '#2f6b45', `<g stroke="${C.white}" stroke-opacity=".7" stroke-width="2" fill="none"><rect x="14" y="14" width="${cw - 28}" height="${ch - 28}"/><line x1="${cw / 2}" y1="14" x2="${cw / 2}" y2="${ch - 14}"/><circle cx="${cw / 2}" cy="${ch / 2}" r="34"/><rect x="14" y="62" width="44" height="90"/><rect x="${cw - 58}" y="62" width="44" height="90"/></g>
<text x="${cw / 2}" y="${ch / 2 + 46}" text-anchor="middle" class="heavy" font-size="130" fill="${C.white}" opacity=".16">10</text>
<g class="ball"><circle cx="${cw / 2}" cy="${ch / 2 + 4}" r="11" fill="${C.white}"/><path d="${star(cw / 2, ch / 2 + 4, 5, 3)}" fill="${C.ink}"/></g>
<g transform="rotate(-4 90 42)"><rect x="22" y="22" width="178" height="38" fill="#75aadb"/><rect x="22" y="34" width="178" height="14" fill="${C.white}"/>${big(30, 54, 'MESSI · ARG', C.ink, 26)}</g>
${lab(22, 196, 'BARÇA + every club, honestly', C.white, 11)}`, 1.2),
    // anime ticket
    card(2, C.orange, `<path d="M0 0 H${cw} V${ch} H0 Z" fill="${C.orange}"/><line x1="268" y1="10" x2="268" y2="${ch - 10}" stroke="${C.ink}" stroke-width="2" stroke-dasharray="6 6"/>
${lab(22, 40, 'ADMIT ONE · SEASON PASS')}${big(20, 128, '200+', C.ink, 92)}${big(22, 168, 'ANIME WATCHED', C.ink, 26)}${lab(22, 196, 'still on the “just one more ep” arc', C.ink, 10)}
<g transform="translate(316 ${ch / 2}) rotate(90)"><text text-anchor="middle" class="mono" font-size="15" fill="${C.ink}" letter-spacing="4">NO. 0200</text></g>
<circle cx="268" cy="0" r="14" fill="${C.cream}"/><circle cx="268" cy="${ch}" r="14" fill="${C.cream}"/>`, -1),
    // film strip
    card(3, C.ink, `<g class="reel">${Array.from({ length: 14 }, (_, k) => `<rect x="${k * 36}" y="12" width="20" height="13" rx="2" fill="${C.cream}"/><rect x="${k * 36}" y="${ch - 25}" width="20" height="13" rx="2" fill="${C.cream}"/>`).join('')}</g>
${[0, 1, 2].map((k) => `<rect x="${18 + k * 112}" y="40" width="102" height="94" fill="${[C.slate, '#6b2f2a', '#3d4a2f'][k]}"/>`).join('')}
<path d="M30 120 L60 70 L85 105 L100 90 L114 120Z" fill="${C.cream}" opacity=".6"/><circle cx="185" cy="80" r="20" fill="${C.orange}" opacity=".8"/><path d="M250 120 L262 64 L282 64 L300 120Z" fill="${C.cream}" opacity=".5"/>
${big(20, 168, 'MOVIES & SHOWS', C.white, 28)}${lab(260, 168, '∞', C.orange, 26)}`, 1.4),
    // controller
    card(4, C.slate, `<path d="M90 70 Q${cw / 2} 50 ${cw - 90} 70 Q${cw - 40} 80 ${cw - 50} 150 Q${cw - 62} 178 ${cw - 100} 150 L110 150 Q72 178 60 150 Q50 80 90 70Z" fill="${C.ink}"/>
<g transform="translate(${cw - 112} 100)"><g transform="translate(0 -18)"><path d="M0 -7 L7 5 L-7 5Z" fill="none" stroke="#6ff3c2" stroke-width="2.2"/></g><g transform="translate(18 0)"><circle r="6" fill="none" stroke="${C.red}" stroke-width="2.2"/></g><g transform="translate(0 18)"><path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke="#7fb3ff" stroke-width="2.2"/></g><g transform="translate(-18 0)"><rect x="-5" y="-5" width="10" height="10" fill="none" stroke="#ff8fd0" stroke-width="2.2"/></g></g>
<g transform="translate(112 100)" fill="#555"><rect x="-6" y="-18" width="12" height="36"/><rect x="-18" y="-6" width="36" height="12"/></g>
<circle cx="150" cy="128" r="12" fill="#333"/><circle cx="${cw - 150}" cy="128" r="12" fill="#333"/>
${big(22, 44, 'PRESS START', C.white, 26)}<text x="${cw - 22}" y="44" text-anchor="end" class="mono hero" font-size="12" fill="${C.cream}">▶ CONTINUE?</text>${lab(22, 198, 'PS4 · iPAD · STORY GAMES ONLY GO HARD', C.cream, 10)}`, -1.2),
    // racket sports
    card(5, C.cream, `<g transform="translate(70 92) rotate(-25)"><ellipse rx="36" ry="40" fill="${C.red}"/><rect x="-7" y="36" width="14" height="44" rx="4" fill="#8a5a33"/></g>
<g transform="translate(${cw - 76} 88)"><circle r="38" fill="${C.white}" stroke="${C.ink}" stroke-width="2.5"/><path d="M0 0 Q-4 -22 -22 -31 M0 0 Q22 4 36 -12 M0 0 Q-14 18 -10 37 M-30 -21 Q-30 -2 -37 8 M33 -17 Q18 14 30 24 M-18 34 Q8 26 22 31" fill="none" stroke="${C.slate}" stroke-width="2.6"/><path d="M0 0 Q-4 -22 -22 -31 Q-38 -10 -36 10 Q-20 4 0 0Z" fill="#f2c94c" opacity=".55"/><path d="M0 0 Q22 4 36 -12 Q40 16 22 32 Q-4 26 0 0Z" fill="#75aadb" opacity=".45"/></g>
<g class="pong"><circle cx="110" cy="70" r="6" fill="${C.orange}"/></g>
${big(22, 168, 'TABLE TENNIS · VOLLEYBALL · PADEL', C.ink, 19)}${lab(22, 194, 'not watching. playing.', C.slate, 11)}`, 1),
    // cars & pc parts
    card(6, C.ink, `<g transform="translate(98 104)"><circle r="66" fill="#1f1f1f" stroke="${C.cream}" stroke-width="2"/>${Array.from({ length: 9 }, (_, k) => { const a = (-210 + k * 30) * Math.PI / 180; return `<line x1="${(54 * Math.cos(a)).toFixed(1)}" y1="${(54 * Math.sin(a)).toFixed(1)}" x2="${(62 * Math.cos(a)).toFixed(1)}" y2="${(62 * Math.sin(a)).toFixed(1)}" stroke="${k > 6 ? C.red : C.cream}" stroke-width="3"/>`; }).join('')}<g class="needle"><line x1="0" y1="0" x2="48" y2="0" stroke="${C.orange}" stroke-width="4" stroke-linecap="round"/></g><circle r="6" fill="${C.orange}"/><text y="34" text-anchor="middle" class="mono" font-size="10" fill="${C.cream}">x1000 rpm</text></g>
<g transform="translate(250 92)"><rect x="-44" y="-44" width="88" height="88" rx="4" fill="${C.slate}"/>${Array.from({ length: 6 }, (_, k) => `<rect x="${-36 + k * 14}" y="-56" width="5" height="12" fill="${C.cream}"/><rect x="${-36 + k * 14}" y="44" width="5" height="12" fill="${C.cream}"/>`).join('')}<rect x="-26" y="-26" width="52" height="52" fill="#2b3a52"/><text y="6" text-anchor="middle" class="mono" font-size="14" fill="${C.cream}">CPU</text></g>
${big(22, 196, 'CARS & PC SPECS', C.white, 24)}<text x="${cw - 22}" y="196" text-anchor="end" class="mono" font-size="10" fill="${C.orange}">ASK ME</text>`, -0.8),
    // marvel / post credits
    card(7, C.red, `<rect x="16" y="16" width="${cw - 32}" height="${ch - 32}" fill="none" stroke="${C.white}" stroke-width="2"/>
${big(cw / 2 - 150, 92, 'I STAY FOR THE', C.white, 30)}${big(cw / 2 - 150, 140, 'POST-CREDITS', C.ink, 44)}
${lab(36, 180, 'MARVEL · always · scroll to the end ↓', C.white, 11)}`, 1.3),
    // music
    card(8, C.slate, `<g transform="translate(96 ${ch / 2 - 4})"><g class="spin" style="animation-duration:3s"><circle r="72" fill="${C.ink}"/>${[60, 50, 40].map((rr) => `<circle r="${rr}" fill="none" stroke="#2c2c2c" stroke-width="1.5"/>`).join('')}<circle r="24" fill="${C.orange}"/><path d="M-24 0 H24" stroke="${C.ink}" stroke-width="2" opacity=".3"/><circle r="3" fill="${C.ink}"/></g></g>
${big(190, 78, 'SONGS IN', C.white, 26)}${big(190, 110, 'EVERY', C.cream, 26)}${big(190, 142, 'LANGUAGE', C.orange, 26)}${lab(190, 172, '505 on repeat', C.cream, 11)}`, -1.4),
  ];
  const H = Y0 + 3 * (ch + gy) + 10;
  const title = ransom('THINGS I\'M INTO', { x: W / 2, y: 52, size: 46, seed: 'into-2' });
  const svg = `${open(W, H, 'Things I am into: F1, football, 200+ anime, movies and shows, PS4 story games, table tennis, volleyball, padel, cars and PC specs, Marvel, music', css)}
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
