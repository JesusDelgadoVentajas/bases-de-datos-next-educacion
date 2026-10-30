// Motor de la presentación
import { Deck } from './deck.js';
import { $, $$, createWidgetScope } from './ui.js';
import { playground, db } from './sql.js';
import * as B0 from './slides/b0.js';
import * as B1 from './slides/b1.js';
import * as B2 from './slides/b2.js';
import * as B3 from './slides/b3.js';
import * as B4 from './slides/b4.js';
import * as B5 from './slides/b5.js';
import * as B6 from './slides/b6.js';
import * as B7 from './slides/b7.js';
import * as B8 from './slides/b8.js';
import { RESUMENES } from './slides/resumenes.js';

const MODULES = [B0, B1, B2, B3, B4, B5, B6, B7, B8];
const WIDGETS = Object.assign({ sql: (el, a) => playground(el, a) }, ...MODULES.map((m) => m.widgets || {}));

const deck = new Deck();
MODULES.forEach((m) => m.build(deck));
const S = deck.slides;
// en cada portada de tema, accesos directos a sus apartados
S.filter((s) => s.isTema).forEach((t) => {
  const seen = new Set();
  const secs = S.filter((s) => s.t === t.t && s.sec && !seen.has(s.sec) && seen.add(s.sec));
  const r = RESUMENES[t.t.n];
  if (r) t.html += `<div class="study study-note" style="margin-top:22px"><b>Resumen del tema (temario)</b><ul style="margin:6px 0 0;padding-left:22px">${r.map((x) => `<li style="font-size:18px">${x}</li>`).join('')}</ul></div>`;
  t.html += `<div class="sec-chips">${secs.map((s) => `<button data-go="${s.id}"><b>${s.sec}</b>${s.label.replace(/^\S+\s/, '')}</button>`).join('')}</div>`;
});
const root = document.documentElement;
const stage = $('#stage');
let cur = -1;
const mounted = new Map(); // elemento → función de limpieza

// ---------- render ----------
stage.innerHTML = S.map((s, i) => `<section class="slide ${s.cls || ''}" data-i="${i}" id="sl-${s.id}">${s.html}</section>`).join('');
const slideEls = $$('.slide', stage);

// ---------- escala del escenario ----------
function fit() {
  const vp = $('#viewport');
  const k = Math.min(vp.clientWidth / 1600, vp.clientHeight / 900);
  stage.style.transform = `scale(${k})`;
  stage.dataset.k = k;
}
window.addEventListener('resize', fit);
fit();

// ---------- widgets ----------
async function mountIn(slide) {
  for (const el of $$('.widget[data-w]', slide)) {
    if (!slide.classList.contains('active')) return;
    if (mounted.has(el)) continue;
    const f = WIDGETS[el.dataset.w];
    if (!f) { el.innerHTML = `<div class="w-out">Widget «${el.dataset.w}» no encontrado</div>`; continue; }
    const instance = { scope: createWidgetScope(el), cleanup: null };
    mounted.set(el, instance);
    try {
      const args = el.dataset.a ? JSON.parse(el.dataset.a) : {};
      const r = await f(el, args);
      if (mounted.get(el) === instance && instance.scope.alive) instance.cleanup = typeof r === 'function' ? r : null;
      else { if (typeof r === 'function') r(); return; }
    } catch (e) {
      if (mounted.get(el) !== instance || !instance.scope.alive) return;
      console.error(e); el.innerHTML = `<div class="w-out">Error en el widget: ${e.message}</div>`;
    }
  }
}
function unmountIn(slide) {
  for (const el of $$('.widget[data-w]', slide)) {
    if (!mounted.has(el)) continue;
    const instance = mounted.get(el); mounted.delete(el);
    instance.scope.dispose();
    try { instance.cleanup && instance.cleanup(); } catch (e) { console.warn(e); }
    d3.select(el).selectAll('*').interrupt();
    el.innerHTML = '';
  }
}
function remount() { if (cur < 0) return; unmountIn(slideEls[cur]); mountIn(slideEls[cur]); }

// ---------- navegación ----------
function go(i, push = true) {
  i = Math.max(0, Math.min(S.length - 1, i));
  if (i === cur) return;
  if (cur >= 0) { slideEls[cur].classList.remove('active'); const prev = slideEls[cur]; unmountIn(prev); }
  cur = i;
  const el = slideEls[i];
  el.classList.add('active');
  el.scrollTop = 0;
  mountIn(el);
  const s = S[i];
  $('#counter').textContent = `${i + 1} / ${S.length}`;
  $('#progress-fill').style.width = `${((i + 1) / S.length) * 100}%`;
  $('#crumb').innerHTML = [s.b && `<b>Bloque ${s.b.n}</b> · ${s.b.title}`, s.t && `Tema ${s.t.n}`, s.sec && s.sec].filter(Boolean).join('  ›  ') || 'Sistemas de Gestión de Bases de Datos';
  if (push) history.replaceState(null, '', '#' + s.id);
  updateToc();
}
const next = () => go(cur + 1), prev = () => go(cur - 1);
const byId = (id) => S.findIndex((s) => s.id === id);

// ---------- índice ----------
function buildToc() {
  let html = '', lastB = null;
  S.forEach((s, i) => {
    if (s.id === 'portada') { html += `<button class="toc-t" data-i="${i}">Portada</button>`; return; }
    if (!s.b) { html += `<button class="toc-t" data-i="${i}">${s.label}</button>`; return; }
    if (s.b !== lastB) { lastB = s.b; html += `<div class="toc-b">Bloque ${s.b.n} · ${s.b.title}</div>`; }
    if (s.cls === 'bloque') return;
    if (s.isTema) html += `<button class="toc-t" data-i="${i}" data-t="${s.t.n}">${s.t.n}. ${s.t.title}</button>`;
    else if (s.sec) html += `<button class="toc-s" data-i="${i}" data-t="${s.t ? s.t.n : ''}">${s.label}</button>`;
  });
  $('#toc-inner').innerHTML = html;
  $('#toc-inner').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { go(+b.dataset.i); if (window.innerWidth < 1300) document.body.classList.remove('toc-open'); } });
}
function updateToc() {
  const s = S[cur];
  $$('#toc-inner [data-i]').forEach((b) => {
    const i = +b.dataset.i;
    b.classList.toggle('current', i === cur || (b.classList.contains('toc-t') && s.t && b.dataset.t == s.t.n && !s.sec && i <= cur));
    if (b.classList.contains('toc-s')) b.style.display = s.t && b.dataset.t == s.t.n ? '' : 'none';
  });
  const c = $('#toc-inner .current'); c && c.scrollIntoView({ block: 'nearest' });
}
buildToc();

// ---------- modos ----------
function setTheme(t) {
  root.dataset.theme = t;
  try { localStorage.setItem('sgbd-theme', t); } catch (e) { /* sin almacenamiento */ }
  remount();
  document.dispatchEvent(new CustomEvent('theme'));
}
function setMode(m) {
  root.dataset.mode = m;
  $$('.seg button').forEach((b) => b.classList.toggle('active', b.dataset.mode === m));
  try { localStorage.setItem('sgbd-mode', m); } catch (e) { /* sin almacenamiento */ }
  remount();
}
const toggleFull = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}));
const toggleFocus = () => document.body.classList.toggle('focus');
const toggleToc = () => document.body.classList.toggle('toc-open');

$('#btn-theme').onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
$$('.seg button').forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
$('#btn-full').onclick = toggleFull;
$('#btn-focus').onclick = toggleFocus;
$('#btn-toc').onclick = toggleToc;
$('#prev').onclick = prev; $('#next').onclick = next;
$('#help').onclick = () => ($('#help').hidden = true);
document.addEventListener('fullscreenchange', () => setTimeout(fit, 50));

stage.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]');
  if (g) { const i = byId(g.dataset.go); if (i >= 0) go(i); }
});

document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); next(); }
  else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); prev(); }
  else if (k === 'Home') go(0);
  else if (k === 'End') go(S.length - 1);
  else if (k === 'i' || k === 'I') toggleToc();
  else if (k === 'e' || k === 'E') setMode(root.dataset.mode === 'study' ? 'present' : 'study');
  else if (k === 't' || k === 'T') setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  else if (k === 'f' || k === 'F') toggleFocus();
  else if (k === 'p' || k === 'P') toggleFull();
  else if (k === '?') $('#help').hidden = !$('#help').hidden;
  else if (k === 'Escape') { $('#help').hidden = true; document.body.classList.remove('toc-open', 'focus'); }
});

// gesto táctil
let tx = null;
stage.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
stage.addEventListener('touchend', (e) => {
  if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
  if (e.target.closest('.widget')) return;
  if (dx < -60) next(); else if (dx > 60) prev();
});

// ---------- arranque ----------
try {
  const t = localStorage.getItem('sgbd-theme'); if (t) root.dataset.theme = t;
  const m = localStorage.getItem('sgbd-mode'); if (m) { root.dataset.mode = m; $$('.seg button').forEach((b) => b.classList.toggle('active', b.dataset.mode === m)); }
} catch (e) { /* sin almacenamiento */ }
window.addEventListener('hashchange', () => { const i = byId(location.hash.slice(1)); if (i >= 0) go(i, false); });
const start = byId(location.hash.slice(1));
go(start >= 0 ? start : 0, false);
window.__deck = { S, go };
// precarga PostgreSQL en segundo plano para que el SQL en vivo responda al instante
setTimeout(() => db().catch(() => {}), 1500);
