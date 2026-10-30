// Constructor de diapositivas y pequeños ayudantes de maquetación
import { esc, highlight } from './ui.js';
import { NOTAS_ESTUDIO } from './slides/notas-estudio.js';

export class Deck {
  constructor() { this.slides = []; this.b = null; this.t = null; }
  add(o) {
    const s = Object.assign({ b: this.b, t: this.t }, o);
    if (this.slides.some((x) => x.id === s.id)) { let k = 98; while (this.slides.some((x) => x.id === s.id + String.fromCharCode(k))) k++; s.id += String.fromCharCode(k); }
    this.slides.push(s); return this;
  }
  cover(html) { return this.add({ id: 'portada', cls: 'cover', html, label: 'Portada' }); }
  bloque({ n, title, intro, temas }) {
    this.b = { n, title }; this.t = null;
    const html = `<div class="bloque-num">${n}</div>
      <div class="kicker">BLOQUE ${n}</div><h2>${title}</h2><p class="intro">${intro}</p>
      <div class="tema-list">${temas.map(([k, tt]) => `<button class="tema-chip" data-go="t${k}"><b>Tema ${k}</b>${tt}</button>`).join('')}</div>`;
    return this.add({ id: `b${n}`, cls: 'bloque', html, label: `Bloque ${n}` });
  }
  tema({ n, title, obj = [], extra = '' }) {
    this.t = { n, title };
    const html = `<div class="tnum">TEMA ${n}</div><h2>${title}</h2>
      ${obj.length ? `<div class="obj">${obj.map((o, i) => `<div><span>${i + 1}</span>${o}</div>`).join('')}</div>` : ''}${extra}`;
    return this.add({ id: `t${n}`, cls: 'tema', html, label: `Tema ${n}`, isTema: true });
  }
  // Diapositiva de contenido. sec = "1.3"; plus = apartado de ampliación (+)
  s(sec, title, body, { lead = '', plus = /\(\+\)/.test(title), ref = true, id, cls = '' } = {}) {
    const t = title.replace(/^\(\+\)\s*/, '');
    const hasStudy = [...body.matchAll(/\bclass=(["'])(.*?)\1/g)].some((m) => m[2].split(/\s+/).includes('study'));
    const note = !hasStudy && NOTAS_ESTUDIO[sec] ? study(esc(NOTAS_ESTUDIO[sec])) : '';
    const html = `<div class="sec">${sec}${plus ? ' · <span class="plus">AMPLIACIÓN (+)</span>' : ''}</div><h2>${t}</h2>
      ${lead ? `<p class="lead">${lead}</p>` : ''}<div class="slide-body">${body}</div>${note}
      ${ref ? `<div class="ref">${ref === true ? `Más detalle en el temario (Word), apartado ${sec}` : ref}</div>` : ''}`;
    return this.add({ id: id || `s${sec}`, sec, cls, html, label: `${sec} ${t}` });
  }
}

// ----- ayudantes de maquetación -----
export const col = (html, cls = '') => `<div class="col ${cls}">${html}</div>`;
export const pts = (items) => `<ul class="pts">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
export const box = (type, title, text) => `<div class="box ${type}"><div class="bt">${title}</div><p>${text}</p></div>`;
export const study = (html) => `<div class="study study-note">${html}</div>`;
export const w = (name, args = {}, cls = '') => `<div class="widget ${cls}" data-w="${name}" data-a='${JSON.stringify(args).replace(/'/g, '&#39;')}'></div>`;
export const code = (src, lang = 'sql', style = '') => `<pre class="code" style="${style}">${highlight(src.replace(/^\n/, '').replace(/\s+$/, ''), lang)}</pre>`;
export const table = (head, rows, cls = '') => `<table class="t ${cls}"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
  .map((r) => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="k"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
export const cards = (items, n = 3, cls = '') => `<div class="cards c${n} ${cls}">${items.map(([h, p, extra = '']) => `<div class="card ${extra}"><h4>${h}</h4><p>${p}</p></div>`).join('')}</div>`;
export const sql = (presets, opts = {}) => w('sql', Object.assign({ presets }, opts), 'sqlw');
export { esc };
