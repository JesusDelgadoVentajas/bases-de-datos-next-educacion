// Utilidades compartidas por todos los widgets
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function pal() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n) => cs.getPropertyValue(n).trim();
  const dark = document.documentElement.dataset.theme === 'dark';
  return {
    dark, blue: '#00ABE3', blueD: '#00729E', blueM: '#0090C4', blueL: '#7ACFEE', gray: dark ? '#6B747A' : '#505456',
    mid: '#7D8387', red: '#D64545', green: dark ? '#7FD3A4' : '#2E8B57', amber: '#E0A100',
    ink: v('--ink'), muted: v('--muted'), line: v('--line'), surface: v('--surface'), surface2: v('--surface-2'),
    bg: v('--bg'), title: v('--title'), tint: v('--tint-blue'),
    series: ['#00ABE3', dark ? '#9AA3A9' : '#505456', '#00729E', '#7ACFEE', '#7D8387', '#0090C4', '#D64545'],
    bronze: '#B87333', silver: '#9EA7AD', gold: '#D4A017'
  };
}

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const fmt = (n, d = 0) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Cada montaje tiene su propio ámbito, incluso al volver a la misma diapositiva.
const widgetScopes = new WeakMap();
export function createWidgetScope(el) {
  const cleanups = new Set();
  const scope = {
    alive: true,
    onCleanup(fn) { if (scope.alive) cleanups.add(fn); else fn(); },
    timeout(fn, ms) {
      const cancel = () => clearTimeout(id);
      const id = setTimeout(() => { cleanups.delete(cancel); if (scope.alive) fn(); }, ms);
      scope.onCleanup(cancel);
      return id;
    },
    sleep(ms) {
      if (!scope.alive) return Promise.resolve(false);
      return new Promise((resolve) => {
        const cancel = () => { clearTimeout(id); resolve(false); };
        const id = setTimeout(() => { cleanups.delete(cancel); resolve(scope.alive); }, ms);
        scope.onCleanup(cancel);
      });
    },
    dispose() {
      if (!scope.alive) return;
      scope.alive = false;
      for (const fn of cleanups) { try { fn(); } catch (e) { console.warn(e); } }
      cleanups.clear();
    }
  };
  widgetScopes.set(el, scope);
  return scope;
}
export const widgetScope = (el) => widgetScopes.get(el) || createWidgetScope(el);

// Estructura estándar de un widget: título, controles, lienzo y salida
export function frame(el, { title, live = false, controls = '', out = true, canvas = true } = {}) {
  el.innerHTML = `${title ? `<div class="w-title">${title}${live ? '<span class="live">INTERACTIVO</span>' : ''}</div>` : ''}
    ${controls ? `<div class="w-controls">${controls}</div>` : ''}
    ${canvas ? '<div class="w-canvas"></div>' : ''}
    ${out ? '<div class="w-out"></div>' : ''}`;
  return { cv: el.querySelector('.w-canvas'), out: el.querySelector('.w-out'), ctl: el.querySelector('.w-controls') };
}

// Chart.js con colores de marca
export function chart(host, cfg) {
  const p = pal();
  Chart.defaults.font.family = '"Instrument Sans", system-ui, sans-serif';
  Chart.defaults.font.size = 15;
  Chart.defaults.color = p.muted;
  Chart.defaults.borderColor = p.line;
  const c = document.createElement('canvas');
  host.appendChild(c);
  cfg.options = Object.assign({ responsive: true, maintainAspectRatio: false, animation: { duration: 500 } }, cfg.options || {});
  const ch = new Chart(c, cfg);
  return ch;
}

// SVG con d3 ajustado al contenedor (unidades = píxeles sin escalar del escenario)
export function svg(host, w, h) {
  const W = w || host.clientWidth || 800, H = h || host.clientHeight || 400;
  const s = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet');
  return { s, W, H };
}

// Tabla editable: cols = [{k, label, type}], rows = [{...}]
export function editTable(host, cols, rows, onChange, { editable = true } = {}) {
  const t = document.createElement('table');
  t.className = 'edit';
  const render = () => {
    t.innerHTML = `<thead><tr>${cols.map((c) => `<th>${c.label ?? c.k}</th>`).join('')}</tr></thead><tbody>${rows
      .map((r, i) => `<tr>${cols.map((c) => {
        const v = r[c.k];
        const isNull = v === null || v === undefined || v === '';
        return `<td ${editable && c.edit !== false ? 'contenteditable spellcheck="false"' : ''} data-r="${i}" data-k="${c.k}" class="${isNull ? 'null' : ''}">${isNull ? 'NULL' : esc(v)}</td>`;
      }).join('')}</tr>`).join('')}</tbody>`;
  };
  render();
  t.addEventListener('focusin', (e) => { const td = e.target.closest('td'); if (td && td.classList.contains('null')) { td.textContent = ''; td.classList.remove('null'); } });
  t.addEventListener('input', (e) => {
    const td = e.target.closest('td'); if (!td) return;
    const c = cols.find((x) => x.k === td.dataset.k);
    let v = td.textContent.trim();
    if (v === '' || v.toUpperCase() === 'NULL') v = null; else if (c.type === 'num' && !isNaN(+v)) v = +v;
    rows[+td.dataset.r][td.dataset.k] = v;
    onChange && onChange(rows, td);
  });
  t.addEventListener('focusout', (e) => { const td = e.target.closest('td'); if (td && td.textContent.trim() === '') { td.textContent = 'NULL'; td.classList.add('null'); } });
  t.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } e.stopPropagation(); });
  host.appendChild(t);
  return { table: t, render, cell: (r, k) => t.querySelector(`td[data-r="${r}"][data-k="${k}"]`) };
}

// Escena three.js lista para usar: devuelve { THREE, scene, camera, renderer, controls, onFrame, dispose }
export async function three(host, { fov = 45, pos = [6, 5, 8], target = [0, 0, 0], controls = true, autoRotate = false } = {}, scope) {
  const THREE = await import('three');
  const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
  if (scope && !scope.alive) return null;
  const W = host.clientWidth || 800, H = host.clientHeight || 450;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio * 1.5));
  renderer.setSize(W, H);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, W / H, 0.1, 1000);
  camera.position.set(...pos);
  let ctl = null;
  if (controls) {
    ctl = new OrbitControls(camera, renderer.domElement);
    ctl.target.set(...target); ctl.enableDamping = true; ctl.autoRotate = autoRotate; ctl.autoRotateSpeed = 0.8;
    ctl.update();
  } else camera.lookAt(...target);
  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(5, 10, 7); scene.add(dl);
  const cbs = [];
  let raf, alive = true;
  const clock = new THREE.Clock();
  const loop = () => {
    if (!alive) return;
    const t = clock.getElapsedTime();
    cbs.forEach((f) => f(t));
    ctl && ctl.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  loop();
  const ro = new ResizeObserver(() => {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  });
  ro.observe(host);
  const hint = document.createElement('div'); hint.className = 'hint3d'; hint.textContent = '3D · arrastra para girar · rueda para zoom';
  if (controls) host.appendChild(hint);
  const result = {
    THREE, scene, camera, renderer, controls: ctl, onFrame: (f) => cbs.push(f),
    dispose: () => {
      if (!alive) return;
      alive = false; cancelAnimationFrame(raf); ro.disconnect(); ctl && ctl.dispose();
      scene.traverse((o) => { o.geometry && o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => { m.map && m.map.dispose(); m.dispose(); }); });
      renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss();
    }
  };
  scope?.onCleanup(result.dispose);
  return result;
}

// Sprite de texto para escenas 3D
export function textSprite(THREE, text, { size = 0.5, color = '#26292B', bg = null, bold = true } = {}) {
  const c = document.createElement('canvas');
  const fs = 64;
  const ctx = c.getContext('2d');
  ctx.font = `${bold ? '700' : '400'} ${fs}px Karla, sans-serif`;
  const w = ctx.measureText(text).width + 30;
  c.width = w; c.height = fs * 1.4;
  ctx.font = `${bold ? '700' : '400'} ${fs}px Karla, sans-serif`;
  if (bg) { ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(0, 0, c.width, c.height, 20); ctx.fill(); }
  ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.fillText(text, 15, c.height / 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  sp.scale.set(size * c.width / c.height, size, 1);
  sp.renderOrder = 10;
  return sp;
}

// Resaltado de código (SQL, Cypher, JS, Python, CQL)
const KW = {
  sql: 'select|from|where|and|or|not|in|is|null|as|on|join|inner|left|right|full|outer|cross|using|group|by|order|having|limit|offset|fetch|first|next|rows|only|insert|into|values|update|set|delete|create|table|primary|key|foreign|references|unique|check|default|constraint|alter|add|drop|column|rename|to|truncate|restart|identity|cascade|restrict|index|view|materialized|sequence|schema|database|if|exists|distinct|case|when|then|else|end|union|all|intersect|except|with|recursive|returning|conflict|do|nothing|merge|matched|begin|commit|rollback|savepoint|transaction|grant|revoke|role|user|login|password|function|procedure|returns|language|trigger|before|after|for|each|row|execute|policy|enable|level|security|over|partition|asc|desc|nulls|last|between|like|ilike|any|some|filter|within|explain|analyze|copy|csv|header|true|false|interval|lateral|generated|always|integer|int|bigint|smallint|numeric|decimal|varchar|char|text|date|timestamp|timestamptz|boolean|jsonb|json|uuid|serial|real|double|precision|cast|comment|show|use|vacuum|optimize|zorder|describe|history|version|clone|stage|warehouse|share|pipe|cluster|tblproperties|location|replace|temporary|temp|isolation|read|committed|repeatable|serializable|lock|share|mode|returns|plpgsql|declare|raise|exception|notice|new|old|call|search_path|owner|usage|privileges|public|of|tablespace|unlogged|current_date|current_user|now|extract|year|month|day|hour|minute|second|keyspace|consistency|quorum|one|ttl|allow|filtering|clustering|replication|match|return|merge|detach|optional|unwind|collect|limit|skip',
};
const KWRE = new RegExp(`\\b(${KW.sql})\\b`, 'gi');
export function highlight(src, lang = 'sql') {
  const cm = lang === 'py' ? /#.*$/gm : lang === 'js' || lang === 'cypher' ? /\/\/.*$/gm : /--.*$/gm;
  const tokens = [];
  const put = (html) => String.fromCharCode(0xE000 + tokens.push(html) - 1);
  let s = src.replace(cm, (m) => put(`<span class="cm">${esc(m)}</span>`));
  s = s.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, (m) => put(`<span class="str">${esc(m)}</span>`));
  s = esc(s);
  if (lang === 'sql' || lang === 'cql' || lang === 'cypher') s = s.replace(KWRE, (m) => `<span class="kw">${m}</span>`);
  if (lang === 'py') s = s.replace(/\b(import|from|def|return|for|in|if|else|with|as|print|None|True|False|class|lambda)\b/g, '<span class="kw">$1</span>');
  if (lang === 'js') s = s.replace(/(\$\w+)/g, '<span class="kw">$1</span>');
  if (lang === 'redis') s = s.replace(/^(\s*)([A-Z]+)\b/gm, '$1<span class="kw">$2</span>');
  s = s.replace(/(?<![\w#])(\d+(?:\.\d+)?)(?![\w])/g, '<span class="num">$1</span>');
  return s.replace(/[\uE000-\uF8FF]/g, (c) => tokens[c.charCodeAt(0) - 0xE000]);
}
