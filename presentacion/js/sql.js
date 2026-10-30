// SQL en vivo: PostgreSQL real (PGlite, WebAssembly) con la base de datos Mercado Next
import { esc, highlight, widgetScope } from './ui.js';

let dbPromise = null;
let seedText = null;

async function seed() {
  if (!seedText) seedText = await (await fetch('assets/sql/mercado_next.sql')).text();
  return seedText;
}
async function create() {
  const { PGlite } = await import('../lib/pglite/index.js');
  const pg = await PGlite.create();
  await pg.exec(await seed());
  return pg;
}
export function db() { return (dbPromise ??= create()); }
export async function resetDB() {
  const old = dbPromise; dbPromise = null;
  if (old) { try { await (await old).close(); } catch (e) { /* ignorar */ } }
  await db();
  document.dispatchEvent(new CustomEvent('db-reset'));
}

function cell(v) {
  if (v === null || v === undefined) return '<span style="color:var(--muted);font-style:italic">NULL</span>';
  if (v instanceof Date) return esc(v.toISOString().slice(0, 10));
  if (typeof v === 'object') return esc(JSON.stringify(v));
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return esc(v);
}
export function renderResult(r) {
  if (!r.fields || !r.fields.length) return `<div class="msg ok">✔ ${r.affectedRows ?? 0} fila(s) afectada(s)</div>`;
  const head = r.fields.map((f) => `<th>${esc(f.name)}</th>`).join('');
  const body = r.rows.map((row) => `<tr>${r.fields.map((f) => `<td>${cell(row[f.name])}</td>`).join('')}</tr>`).join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export async function run(sql) {
  const pg = await db();
  return pg.exec(sql);
}
export async function query(sql, params) {
  const pg = await db();
  return pg.query(sql, params);
}

/* Editor SQL con resaltado, presets y resultados.
   opts = { sql, presets: [[etiqueta, sql], ...], rows (alto del editor), title, onResult } */
export function playground(el, opts = {}) {
  const life = widgetScope(el);
  // Los ejemplos de una consola no heredan cambios hechos en otras diapositivas.
  let localDB = create(), revision = 0;
  const close = (pending) => pending.then((pg) => pg.close()).catch(() => {});
  life.onCleanup(() => close(localDB));
  const presets = opts.presets || [];
  const initial = opts.sql ?? (presets[0] ? presets[0][1] : 'SELECT * FROM cliente;');
  el.classList.add('sql-host');
  el.innerHTML = `
    <div class="w-title">${opts.title || 'SQL en vivo · PostgreSQL en tu navegador'}<span class="live">EN VIVO</span></div>
    <div class="sql">
      <div class="sql-editor" style="${opts.edH ? `height:${opts.edH}px` : ''}"><pre aria-hidden="true"></pre><textarea spellcheck="false" aria-label="Editor SQL"></textarea></div>
      ${presets.length > 1 ? `<div class="presets"><span>Ejemplos:</span>${presets.map((p, i) => `<button class="btn" data-i="${i}">${esc(p[0])}</button>`).join('')}</div>` : ''}
      <div class="sql-bar">
        <button class="btn primary run">▶ Ejecutar <span style="opacity:.75;font-weight:400">Ctrl+Enter</span></button>
        <div class="sql-status">Cargando PostgreSQL…</div>
        <button class="btn reset" title="Vuelve a cargar Mercado Next desde cero">↺ Reiniciar BD</button>
      </div>
      <div class="sql-result"><div class="msg">Escribe una consulta y pulsa Ejecutar.</div></div>
    </div>`;
  const ta = el.querySelector('textarea'), pre = el.querySelector('pre'), st = el.querySelector('.sql-status'), out = el.querySelector('.sql-result');
  const paint = () => { pre.innerHTML = highlight(ta.value) + '\n'; pre.scrollTop = ta.scrollTop; };
  ta.value = initial; paint();
  ta.addEventListener('input', paint);
  ta.addEventListener('scroll', () => { pre.style.transform = `translateY(${-ta.scrollTop}px)`; });
  ta.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); exec(); }
    if (e.key === 'Tab') { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); paint(); }
  });
  const exec = async () => {
    const current = localDB, turn = revision;
    st.textContent = 'Ejecutando…';
    const t0 = performance.now();
    try {
      const pg = await current;
      if (!life.alive || turn !== revision) return;
      const res = await pg.exec(ta.value);
      if (!life.alive || turn !== revision) return;
      const ms = performance.now() - t0;
      const shown = res.filter((r) => r.fields && r.fields.length);
      const last = shown.length ? shown[shown.length - 1] : res[res.length - 1];
      out.innerHTML = last ? renderResult(last) : '<div class="msg ok">✔ Sin resultados</div>';
      const n = last && last.fields && last.fields.length ? `${last.rows.length} fila(s)` : 'hecho';
      st.textContent = `✔ ${res.length} sentencia(s) · ${n} · ${ms.toFixed(1)} ms`;
      opts.onResult && opts.onResult(res);
    } catch (err) {
      if (!life.alive || turn !== revision) return;
      out.innerHTML = `<div class="msg err">✖ ERROR: ${esc(err.message)}${err.detail ? '\n' + esc(err.detail) : ''}${err.hint ? '\nPista: ' + esc(err.hint) : ''}${/aborted/.test(err.message) ? '\n→ Hay una transacción abortada: ejecuta ROLLBACK; o pulsa «Reiniciar BD».' : ''}</div>`;
      st.textContent = '✖ La sentencia ha fallado (PostgreSQL ha devuelto un error)';
      opts.onResult && opts.onResult(null, err);
    }
  };
  el.querySelector('.run').onclick = exec;
  el.querySelectorAll('.presets .btn').forEach((b) => (b.onclick = () => { el.querySelectorAll('.presets .btn').forEach((x) => x.classList.toggle('on', x === b)); ta.value = presets[+b.dataset.i][1]; paint(); exec(); }));
  el.querySelector('.reset').onclick = async () => {
    const turn = ++revision, old = localDB;
    st.textContent = 'Reiniciando la base de datos…'; localDB = create();
    await close(old);
    try { await localDB; if (life.alive && turn === revision) st.textContent = '✔ Base de datos Mercado Next recargada'; }
    catch (e) { if (life.alive && turn === revision) st.textContent = '✖ No se pudo cargar PGlite: ' + e.message; }
  };
  localDB.then(async (pg) => {
    if (!life.alive || revision !== 0) return;
    const v = await pg.query('SELECT version()');
    if (!life.alive || revision !== 0) return;
    st.textContent = `✔ ${v.rows[0].version.split(' on ')[0].replace(/,.*/, '')} listo · Mercado Next cargada`;
    if (opts.autorun !== false) exec();
  }).catch((e) => { if (!life.alive || revision !== 0) return; st.textContent = '✖ No se pudo cargar PGlite: ' + e.message; });
}
