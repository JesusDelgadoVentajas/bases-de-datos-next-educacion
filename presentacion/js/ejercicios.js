// Ejercicios autoevaluables: cada ejercicio tiene un botón «Corregir» que dice si está bien,
// enseña la solución y explica por qué. Los de SQL se corrigen ejecutándolos en PostgreSQL (PGlite).
import { $, $$, esc, highlight } from './ui.js';
import { freshDB } from './sql.js';
import { EJERCICIOS } from './ejercicios/index.js';

const KEY_ESTADO = 'sgbd-ej-estado-v1', KEY_SQL = 'sgbd-ej-sql-v1';
const TIPOS = { test: 'Test', sql: 'SQL', clasifica: 'Clasificar', ordena: 'Ordenar' };
const LETRAS = 'ABCDEFGH';

// ---------- almacenamiento local ----------
const leer = (k) => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
let estado = leer(KEY_ESTADO); // id → 'ok' | 'ko'
let borradores = leer(KEY_SQL); // id → texto SQL

// ---------- azar reproducible (el orden de las opciones no cambia al recargar) ----------
function semilla(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
function barajar(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- PostgreSQL: cada ejecución parte de una copia limpia de Mercado Next ----------
let reserva = null;
function tomarDB() { const p = reserva || freshDB(); reserva = freshDB(); reserva.catch(() => {}); return p; }
async function conDB(fn) { const pg = await tomarDB(); try { return await fn(pg); } finally { pg.close().catch(() => {}); } }
// Funciones auxiliares para las comprobaciones de DDL/DML: prueban una sentencia sin romper la transacción.
export const AUX = `CREATE OR REPLACE FUNCTION ej_falla(q text) RETURNS boolean LANGUAGE plpgsql AS $f$ BEGIN EXECUTE q; RETURN false; EXCEPTION WHEN others THEN RETURN true; END $f$;
CREATE OR REPLACE FUNCTION ej_valor(q text) RETURNS text LANGUAGE plpgsql AS $f$ DECLARE r text; BEGIN EXECUTE q INTO r; RETURN r; EXCEPTION WHEN others THEN RETURN 'error'; END $f$;`;
const ARR = { rowMode: 'array' };
const ultima = (res) => { const t = res.filter((r) => r.fields && r.fields.length); return t.length ? t[t.length - 1] : null; };

async function ejecutarSQL(sql, comprobar) {
  return conDB(async (pg) => {
    const res = await pg.exec(sql, ARR);
    if (!comprobar) return { tabla: ultima(res), res };
    try { await pg.exec(AUX); return { tabla: ultima(await pg.exec(comprobar, ARR)), res }; }
    catch (e) { throw Object.assign(new Error('Tu SQL se ha ejecutado, pero no se ha podido comprobar el resultado: ' + e.message + (/aborted/.test(e.message) ? ' (ha quedado una transacción abortada: termínala con COMMIT o ROLLBACK)' : '')), { comprobacion: true }); }
  });
}
const esperados = new Map();
const esperado = (ej) => { if (!esperados.has(ej.id)) esperados.set(ej.id, ejecutarSQL(ej.solucion, ej.comprobar).then((r) => r.tabla)); return esperados.get(ej.id); };

export function norm(v) {
  if (v === null || v === undefined) return 'NULL';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'bigint') v = Number(v);
  if (typeof v === 'number' || (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v))) return String(Math.round(Number(v) * 100) / 100);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
const filas = (t) => t.rows.map((r) => r.map(norm));
export function comparar(tuya, buena, orden) {
  if (!tuya) return { ok: false, msg: 'Tu SQL no devuelve ninguna tabla de resultados. ¿Falta el <code>SELECT</code>?' };
  const a = filas(tuya), b = filas(buena);
  if (tuya.fields.length !== buena.fields.length) return { ok: false, msg: `Tu resultado tiene <b>${tuya.fields.length}</b> columna(s) y el esperado <b>${buena.fields.length}</b>. Revisa qué columnas pide el enunciado.` };
  if (a.length !== b.length) return { ok: false, msg: `Tu resultado tiene <b>${a.length}</b> fila(s) y el esperado <b>${b.length}</b>. Revisa el filtro (<code>WHERE</code>, <code>JOIN</code>, <code>HAVING</code>…).` };
  const k = (r) => JSON.stringify(r);
  const igualOrden = a.every((r, i) => k(r) === k(b[i]));
  if (igualOrden) return { ok: true };
  const sa = a.map(k).sort(), sb = b.map(k).sort();
  const mismas = sa.every((r, i) => r === sb[i]);
  if (mismas && !orden) return { ok: true };
  if (mismas) return { ok: false, msg: 'Las filas son las correctas, pero <b>no están en el orden</b> que pide el enunciado.' };
  return { ok: false, msg: 'Devuelves el número de filas correcto, pero <b>algunos valores no coinciden</b> con el resultado esperado. Compáralos abajo.' };
}

function celda(v) {
  if (v === null || v === undefined) return '<span class="nul">NULL</span>';
  if (v instanceof Date) return esc(v.toISOString().slice(0, 10));
  if (typeof v === 'object') return esc(JSON.stringify(v));
  return esc(String(v));
}
function tablaHTML(t) {
  if (!t) return '<div class="msg">Sin tabla de resultados.</div>';
  return `<table><thead><tr>${t.fields.map((f) => `<th>${esc(f.name)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((v) => `<td>${celda(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
// Comprobaciones de una sola fila (DDL): una fila por comprobación, con lo obtenido y lo esperado
const esChequeo = (a, b) => a && b && a.rows.length === 1 && b.rows.length === 1 && a.fields.length === b.fields.length;
function chequeoHTML(tuya, buena) {
  return `<div class="ej-res"><table><thead><tr><th>Comprobación</th><th>Con tu SQL</th><th>Esperado</th><th></th></tr></thead><tbody>${buena.fields.map((f, i) => {
    const ok = norm(tuya.rows[0][i]) === norm(buena.rows[0][i]);
    return `<tr><td>${esc(f.name.includes(' ') ? f.name : f.name.replace(/_/g, ' '))}</td><td>${celda(tuya.rows[0][i])}</td><td>${celda(buena.rows[0][i])}</td><td class="${ok ? 'cok' : 'cko'}">${ok ? '✔' : '✘'}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}
const errorHTML = (e) => `${esc(e.message)}${e.detail ? '\n' + esc(e.detail) : ''}${e.hint ? '\nPista de PostgreSQL: ' + esc(e.hint) : ''}`;

// ---------- piezas comunes de la tarjeta ----------
const code = (src, lang = 'sql') => `<pre class="code">${highlight(src.trim(), lang)}</pre>`;
function feedback(card, ej, { ok, sinRespuesta, detalle = '', solucion = '' }) {
  const fb = $('.ej-fb', card);
  const cab = sinRespuesta ? '<div class="ej-ver neutro">Sin responder: esta es la solución</div>'
    : ok ? '<div class="ej-ver ok">✔ ¡Correcto!</div>' : '<div class="ej-ver ko">✘ Todavía no es correcto</div>';
  fb.innerHTML = `${cab}${detalle ? `<div class="ej-detalle">${detalle}</div>` : ''}
    <div class="ej-bloque"><div class="ej-et">Solución</div>${solucion}</div>
    <div class="ej-bloque porque"><div class="ej-et">Por qué</div><div>${ej.porque}</div></div>
    ${ej.teoria ? `<button class="ej-teoria" data-teoria="${ej.teoria}">Repasar la teoría en la presentación (${esc(ej.teoria.replace(/^s/, 'apartado '))}) →</button>` : ''}`;
  fb.hidden = false;
  if (!sinRespuesta) { estado[ej.id] = ok ? 'ok' : 'ko'; guardar(KEY_ESTADO, estado); }
  pintarEstado(card, ej);
  document.dispatchEvent(new CustomEvent('ej-progreso'));
}
function pintarEstado(card, ej) {
  const s = estado[ej.id], b = $('.ej-estado', card);
  b.className = 'ej-estado ' + (s || '');
  b.textContent = s === 'ok' ? '✔ Resuelto' : s === 'ko' ? '✘ Por repasar' : '';
}

// ---------- tipos de ejercicio ----------
const TIPO = {
  // Pregunta tipo test: una respuesta (correcta: n) o varias (correcta: [n, m]).
  test: {
    html(ej) {
      const multi = Array.isArray(ej.correcta);
      const orden = barajar(ej.opciones.map((_, i) => i), semilla(ej.id));
      return `${multi ? '<p class="ej-nota">Puede haber más de una respuesta correcta.</p>' : ''}<div class="ej-ops" data-multi="${multi}">${orden.map((i, k) => `<button class="ej-op" data-i="${i}"><span class="l">${LETRAS[k]}</span><span class="t">${ej.opciones[i]}</span></button>`).join('')}</div>`;
    },
    montar(card) {
      const multi = $('.ej-ops', card).dataset.multi === 'true';
      $$('.ej-op', card).forEach((b) => (b.onclick = () => {
        if (!multi) $$('.ej-op', card).forEach((x) => x !== b && x.classList.remove('sel'));
        b.classList.toggle('sel', multi ? !b.classList.contains('sel') : true);
      }));
    },
    corregir(card, ej) {
      const buenas = [].concat(ej.correcta), sel = $$('.ej-op.sel', card).map((b) => +b.dataset.i);
      const ok = sel.length === buenas.length && sel.every((i) => buenas.includes(i));
      $$('.ej-op', card).forEach((b) => {
        const i = +b.dataset.i, bien = buenas.includes(i), marcada = sel.includes(i);
        b.classList.toggle('sol', bien); b.classList.toggle('mal', marcada && !bien);
        $('.n', b)?.remove();
        if (ej.notas && ej.notas[i]) b.insertAdjacentHTML('beforeend', `<span class="n">${ej.notas[i]}</span>`);
      });
      const letra = (i) => LETRAS[$$('.ej-op', card).findIndex((b) => +b.dataset.i === i)];
      const solucion = `<p>${buenas.length > 1 ? 'Las respuestas correctas son' : 'La respuesta correcta es la'} <b>${buenas.map(letra).sort().join(' y ')}</b>: ${buenas.map((i) => ej.opciones[i]).join(' · ')}</p>`;
      feedback(card, ej, { ok, sinRespuesta: !sel.length, solucion });
    }
  },

  // Clasificar: cada elemento va a una categoría. items: [[texto, índice de categoría, nota opcional]]
  clasifica: {
    html(ej) {
      return `<div class="ej-clas">${ej.items.map(([t], i) => `<div class="ej-fila" data-i="${i}"><div class="txt">${t}</div><div class="cats">${ej.categorias.map((c, k) => `<button data-k="${k}">${c}</button>`).join('')}</div></div>`).join('')}</div>`;
    },
    montar(card) {
      $$('.ej-fila', card).forEach((f) => $$('.cats button', f).forEach((b) => (b.onclick = () => { $$('.cats button', f).forEach((x) => x.classList.toggle('sel', x === b)); })));
    },
    corregir(card, ej) {
      let bien = 0, respondidas = 0;
      $$('.ej-fila', card).forEach((f) => {
        const [, k, nota] = ej.items[+f.dataset.i], sel = $('.cats .sel', f);
        if (sel) respondidas++;
        const ok = sel && +sel.dataset.k === k; if (ok) bien++;
        f.classList.toggle('ok', !!ok); f.classList.toggle('ko', !ok);
        $$('.cats button', f).forEach((b) => b.classList.toggle('sol', +b.dataset.k === k));
        $('.n', f)?.remove();
        if (nota) f.insertAdjacentHTML('beforeend', `<div class="n">${nota}</div>`);
      });
      const n = ej.items.length;
      const solucion = `<table class="ej-tsol"><tbody>${ej.items.map(([t, k]) => `<tr><td>${t}</td><td><b>${ej.categorias[k]}</b></td></tr>`).join('')}</tbody></table>`;
      feedback(card, ej, { ok: bien === n, sinRespuesta: !respondidas, detalle: respondidas ? `Has acertado <b>${bien} de ${n}</b>. Las filas en rojo están mal o sin responder.` : '', solucion });
    }
  },

  // Ordenar: items en el orden correcto; se muestran desordenados y se mueven con ↑ ↓.
  ordena: {
    html(ej) {
      const rnd = semilla(ej.id); let orden;
      do orden = barajar(ej.items.map((_, i) => i), rnd); while (orden.every((v, i) => v === i));
      return `<ol class="ej-ord">${orden.map((i) => `<li data-i="${i}"><span class="t">${ej.items[i]}</span><span class="mv"><button data-d="-1" aria-label="Subir">↑</button><button data-d="1" aria-label="Bajar">↓</button></span></li>`).join('')}</ol>`;
    },
    montar(card) {
      const ol = $('.ej-ord', card);
      ol.onclick = (e) => {
        const b = e.target.closest('button[data-d]'); if (!b) return;
        const li = b.closest('li'), d = +b.dataset.d;
        if (d < 0 && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling);
        if (d > 0 && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li);
        $$('li', ol).forEach((x) => x.classList.remove('ok', 'ko'));
        li.classList.add('moved'); setTimeout(() => li.classList.remove('moved'), 300);
      };
    },
    corregir(card, ej) {
      const lis = $$('.ej-ord li', card); let bien = 0;
      lis.forEach((li, pos) => { const ok = +li.dataset.i === pos; if (ok) bien++; li.classList.toggle('ok', ok); li.classList.toggle('ko', !ok); });
      const solucion = `<ol class="ej-olsol">${ej.items.map((t) => `<li>${t}</li>`).join('')}</ol>`;
      feedback(card, ej, { ok: bien === lis.length, detalle: `<b>${bien} de ${lis.length}</b> elementos están en su sitio (marcados en azul; los demás, en rojo).`, solucion });
    }
  },

  // SQL: se compara el resultado (o la comprobación, en DDL/DML) con el de la solución.
  sql: {
    html(ej) {
      return `<div class="sql-editor ej-ed"><pre aria-hidden="true"></pre><textarea spellcheck="false" aria-label="Tu SQL"></textarea></div>
        <div class="ej-sqlbar"><button class="btn run">▶ Ejecutar <span class="k">Ctrl+Enter</span></button><span class="ej-st">Cada ejecución parte de la base de datos Mercado Next original.</span><button class="btn limpiar" title="Vuelve al texto inicial">Borrar</button></div>
        <div class="ej-res" hidden></div>`;
    },
    montar(card, ej) {
      const ta = $('textarea', card), pre = $('.ej-ed pre', card), st = $('.ej-st', card), out = $('.ej-res', card);
      const pintar = () => { pre.innerHTML = highlight(ta.value) + '\n'; };
      ta.value = borradores[ej.id] ?? ej.inicial ?? '';
      pintar();
      let t = null;
      ta.addEventListener('input', () => { pintar(); clearTimeout(t); t = setTimeout(() => { borradores[ej.id] = ta.value; guardar(KEY_SQL, borradores); }, 400); });
      ta.addEventListener('scroll', () => { pre.style.transform = `translateY(${-ta.scrollTop}px)`; });
      ta.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
        if (e.key === 'Tab') { e.preventDefault(); ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end'); pintar(); }
      });
      const run = async () => {
        st.textContent = 'Ejecutando…'; out.hidden = false;
        try {
          const { tabla, res } = await ejecutarSQL(ta.value);
          const afectadas = res.reduce((s, r) => s + (r.affectedRows || 0), 0);
          out.innerHTML = tabla ? tablaHTML(tabla) : `<div class="msg ok">✔ Hecho${afectadas ? ` · ${afectadas} fila(s) afectada(s)` : ''}</div>`;
          st.textContent = tabla ? `✔ ${tabla.rows.length} fila(s)` : '✔ Ejecutado';
        } catch (e) { out.innerHTML = `<div class="msg err">✖ ERROR: ${errorHTML(e)}</div>`; st.textContent = '✖ PostgreSQL ha devuelto un error'; }
      };
      $('.run', card).onclick = run;
      $('.limpiar', card).onclick = () => { ta.value = ej.inicial ?? ''; pintar(); delete borradores[ej.id]; guardar(KEY_SQL, borradores); out.hidden = true; ta.focus(); };
    },
    async corregir(card, ej) {
      const ta = $('textarea', card), st = $('.ej-st', card);
      const sol = `${code(ej.solucion)}${ej.alt ? `<div class="ej-et sub">Otra forma correcta</div>${code(ej.alt)}` : ''}`;
      const vacio = !ta.value.replace(/--.*$/gm, '').trim();
      st.textContent = 'Corrigiendo…';
      let buena;
      try { buena = await esperado(ej); } catch (e) { st.textContent = ''; feedback(card, ej, { ok: false, detalle: 'No se ha podido calcular la solución: ' + esc(e.message), solucion: sol }); return; }
      const esperadoHTML = (tit, t) => `<div class="ej-cmp-col"><div class="ej-et sub">${tit}</div><div class="ej-res">${tablaHTML(t)}</div></div>`;
      if (vacio) { st.textContent = ''; feedback(card, ej, { sinRespuesta: true, solucion: sol + (ej.comprobar ? '' : `<div class="ej-cmp">${esperadoHTML('Resultado esperado', buena)}</div>`) }); return; }
      try {
        const { tabla } = await ejecutarSQL(ta.value, ej.comprobar);
        const c = comparar(tabla, buena, ej.orden);
        st.textContent = c.ok ? '✔ Correcto' : '✘ Revisa la consulta';
        const nota = ej.comprobar ? '<p class="ej-nota">Para corregirlo se ejecuta tu SQL y después una consulta de comprobación sobre cómo ha quedado la base de datos.</p>' : '';
        const chequeo = ej.comprobar && esChequeo(tabla, buena);
        if (chequeo && !c.ok) c.msg = 'Tu SQL no supera todas las comprobaciones. Abajo tienes cuáles fallan (✘).';
        const cmp = chequeo ? `<div class="ej-cmp">${chequeoHTML(tabla, buena)}</div>`
          : `<div class="ej-cmp">${esperadoHTML(ej.comprobar ? 'Comprobación con tu SQL' : 'Tu resultado', tabla)}${esperadoHTML(ej.comprobar ? 'Comprobación esperada' : 'Resultado esperado', buena)}</div>`;
        feedback(card, ej, { ok: c.ok, detalle: (c.msg || (ej.comprobar ? 'La base de datos ha quedado exactamente como se pedía.' : 'Tu consulta devuelve exactamente el resultado esperado.')) + nota + (c.ok ? '' : cmp), solucion: sol + (c.ok ? cmp : '') });
      } catch (e) {
        st.textContent = '✖ Error';
        feedback(card, ej, { ok: false, detalle: `<div class="msg err">✖ ${e.comprobacion ? '' : 'PostgreSQL ha devuelto un error: '}${errorHTML(e)}</div>`, solucion: sol });
      }
    }
  }
};

function tarjeta(ej, num) {
  const T = TIPO[ej.tipo];
  return `<article class="ej-card" id="ej-${ej.id}" data-id="${ej.id}">
    <header><span class="ej-num">${num}</span><span class="ej-tag">${TIPOS[ej.tipo]}</span>${ej.nivel === '+' ? '<span class="ej-tag plus">Ampliación (+)</span>' : ''}<span class="ej-estado"></span></header>
    <h3>${ej.titulo}</h3>
    <div class="ej-enun">${ej.enunciado}</div>
    <div class="ej-body">${T.html(ej)}</div>
    <div class="ej-actions"><button class="btn primary corregir">Corregir</button><button class="btn otra" hidden>Volver a intentarlo</button></div>
    <div class="ej-fb" hidden></div>
  </article>`;
}
function montarTarjeta(card, ej) {
  const T = TIPO[ej.tipo];
  $$('.ej-enun pre.code', card).forEach((p) => (p.innerHTML = highlight(p.textContent)));
  T.montar(card, ej);
  pintarEstado(card, ej);
  const btn = $('.corregir', card), otra = $('.otra', card);
  btn.onclick = async () => {
    btn.disabled = true;
    try { await T.corregir(card, ej); } finally { btn.disabled = false; }
    otra.hidden = ej.tipo === 'sql';
    btn.textContent = 'Corregir de nuevo';
  };
  otra.onclick = () => {
    const nuevo = document.createElement('div'); nuevo.innerHTML = tarjeta(ej, $('.ej-num', card).textContent);
    const c2 = nuevo.firstElementChild; card.replaceWith(c2); montarTarjeta(c2, ej);
  };
}

// ---------- vista ----------
export function initEjercicios({ temas, irADiapositiva, alCambiar }) {
  const root = $('#ej');
  const porTema = new Map();
  EJERCICIOS.forEach((e) => { if (!porTema.has(e.tema)) porTema.set(e.tema, []); porTema.get(e.tema).push(e); });
  const temasConEj = temas.filter((t) => porTema.has(t.n)).sort((a, b) => a.n - b.n);
  const bloques = [];
  temasConEj.forEach((t) => { let b = bloques.find((x) => x.n === t.b.n); if (!b) bloques.push((b = { n: t.b.n, title: t.b.title, temas: [] })); b.temas.push(t); });
  let ruta = null, filtro = 'todos', repaso = [];

  root.innerHTML = '<aside class="ej-nav"></aside><div class="ej-main"></div>';
  const nav = $('.ej-nav', root), main = $('.ej-main', root);
  const cuenta = (lista) => ({ ok: lista.filter((e) => estado[e.id] === 'ok').length, n: lista.length });
  const barra = ({ ok, n }) => `<div class="ej-barra"><div style="width:${n ? (ok / n) * 100 : 0}%"></div></div>`;

  function pintarNav() {
    const g = cuenta(EJERCICIOS);
    nav.innerHTML = `<button class="ej-nb ${ruta === '' ? 'cur' : ''}" data-r="">Inicio<span>${g.ok}/${g.n}</span></button>
      <button class="ej-nb ${ruta === 'repaso' ? 'cur' : ''}" data-r="repaso">🎲 Repaso al azar</button>
      ${bloques.map((b) => `<div class="ej-nbq">Bloque ${b.n} · ${b.title}</div>${b.temas.map((t) => { const c = cuenta(porTema.get(t.n)); return `<button class="ej-nt ${ruta === String(t.n) ? 'cur' : ''} ${c.ok === c.n ? 'hecho' : ''}" data-r="${t.n}"><b>${t.n}</b><span class="tt">${t.title}</span><span class="c">${c.ok}/${c.n}</span></button>`; }).join('')}`).join('')}`;
    // en el móvil el menú es una tira horizontal: deja visible el tema actual
    const cur = $('.cur', nav);
    if (cur && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = cur.offsetLeft - nav.clientWidth / 2 + cur.offsetWidth / 2;
  }
  nav.onclick = (e) => { const b = e.target.closest('[data-r]'); if (b) abrir(b.dataset.r); };

  function inicio() {
    const g = cuenta(EJERCICIOS), nucleo = EJERCICIOS.filter((e) => e.nivel !== '+').length;
    const tipos = Object.keys(TIPOS).map((k) => [TIPOS[k], EJERCICIOS.filter((e) => e.tipo === k).length]);
    main.innerHTML = `<div class="ej-head"><div class="ej-kicker">AUTOEVALUACIÓN</div><h1>Ejercicios autoevaluables</h1>
      <p class="ej-lead">${g.n} ejercicios de los temas más importantes de la asignatura: ${tipos.map(([t, n]) => `${n} de ${t === 'SQL' ? t : t.toLowerCase()}`).join(', ')}. ${nucleo} son del núcleo común y ${g.n - nucleo} de ampliación (+).</p></div>
      <div class="ej-como">
        <div><b>1. Resuelve</b>Elige la respuesta, clasifica, ordena o escribe el SQL. En los de SQL puedes pulsar <b>Ejecutar</b> tantas veces como quieras para probar.</div>
        <div><b>2. Pulsa «Corregir»</b>Te dice si está bien, te enseña la solución y te explica por qué. Si te atascas, puedes corregir sin responder para ver la solución.</div>
        <div><b>3. Repasa</b>Cada corrección enlaza con el apartado de la presentación donde se explica. Tu progreso se guarda en este navegador.</div>
      </div>
      <p class="ej-nota">En los ejercicios de SQL no importa cómo escribas la consulta ni cómo llames a las columnas: se ejecuta en un PostgreSQL de verdad, dentro de tu navegador, y se compara su resultado con el de la solución. Cada ejecución parte de la base de datos Mercado Next original, así que no puedes estropear nada.</p>
      <div class="ej-total"><span>Tu progreso: <b>${g.ok} de ${g.n}</b> resueltos</span>${barra(g)}</div>
      ${bloques.map((b) => `<h2 class="ej-h2">Bloque ${b.n} · ${b.title}</h2><div class="ej-grid">${b.temas.map((t) => { const l = porTema.get(t.n), c = cuenta(l); return `<button class="ej-tc" data-r="${t.n}"><span class="n">Tema ${t.n}</span><span class="t">${t.title}</span><span class="m">${l.length} ejercicios · ${[...new Set(l.map((e) => TIPOS[e.tipo]))].join(', ')}</span>${barra(c)}<span class="m">${c.ok}/${c.n} resueltos</span></button>`; }).join('')}</div>`).join('')}
      <div class="ej-pie"><button class="btn reiniciar">Borrar mi progreso</button></div>`;
    $('.reiniciar', main).onclick = () => {
      if (!confirm('¿Seguro? Se borrarán tus respuestas de SQL guardadas y el registro de ejercicios resueltos de este navegador.')) return;
      estado = {}; borradores = {}; guardar(KEY_ESTADO, estado); guardar(KEY_SQL, borradores); abrir('');
    };
  }

  function lista(ejs, numerar) {
    const visibles = ejs.filter((e) => filtro === 'todos' || (filtro === '+' ? e.nivel === '+' : e.nivel !== '+'));
    const cont = $('.ej-lista', main);
    cont.innerHTML = visibles.length ? visibles.map((e) => tarjeta(e, numerar(e))).join('') : '<p class="ej-nota">No hay ejercicios de este nivel en el tema.</p>';
    visibles.forEach((e) => montarTarjeta($(`#ej-${CSS.escape(e.id)}`, cont), e));
  }
  const filtros = () => `<div class="ej-filtro" role="group" aria-label="Nivel">${[['todos', 'Todos'], ['nucleo', 'Núcleo'], ['+', 'Ampliación (+)']].map(([k, t]) => `<button data-f="${k}" class="${filtro === k ? 'on' : ''}">${t}</button>`).join('')}</div>`;

  function tema(n) {
    const t = temasConEj.find((x) => x.n === n), ejs = porTema.get(n);
    const i = temasConEj.indexOf(t), ant = temasConEj[i - 1], sig = temasConEj[i + 1];
    main.innerHTML = `<div class="ej-head"><div class="ej-kicker">BLOQUE ${t.b.n} · TEMA ${n}</div><h1>${t.title}</h1>
      <div class="ej-headbar">${filtros()}<button class="ej-teoria" data-teoria="t${n}">Ver la teoría del tema →</button></div></div>
      <div class="ej-lista"></div>
      <div class="ej-pie">${ant ? `<button class="btn" data-r="${ant.n}">← Tema ${ant.n}</button>` : '<span></span>'}${sig ? `<button class="btn primary" data-r="${sig.n}">Tema ${sig.n} →</button>` : ''}</div>`;
    const num = (e) => `${n}.${ejs.indexOf(e) + 1}`;
    lista(ejs, num);
    $$('.ej-filtro button', main).forEach((b) => (b.onclick = () => { filtro = b.dataset.f; $$('.ej-filtro button', main).forEach((x) => x.classList.toggle('on', x === b)); lista(ejs, num); }));
  }

  function nuevoRepaso() { repaso = barajar(EJERCICIOS, Math.random).slice(0, 10); }
  function pintarRepaso() {
    if (!repaso.length) nuevoRepaso();
    main.innerHTML = `<div class="ej-head"><div class="ej-kicker">REPASO</div><h1>Repaso al azar</h1>
      <p class="ej-lead">Diez ejercicios de cualquier tema, como en un examen. Corrige cada uno al terminarlo.</p>
      <div class="ej-headbar"><button class="btn primary otros">🎲 Otros diez</button></div></div>
      <div class="ej-lista"></div>`;
    filtro = 'todos';
    const num = (e) => `Tema ${e.tema}`;
    lista(repaso, num);
    $('.otros', main).onclick = () => { nuevoRepaso(); pintarRepaso(); main.scrollTop = 0; root.scrollTop = 0; };
  }

  main.onclick = (e) => {
    const t = e.target.closest('[data-teoria]'); if (t) { irADiapositiva(t.dataset.teoria); return; }
    const r = e.target.closest('[data-r]'); if (r) abrir(r.dataset.r);
  };
  document.addEventListener('ej-progreso', () => { pintarNav(); });

  function abrir(r = '') {
    r = String(r);
    if (r !== '' && r !== 'repaso' && !porTema.has(+r)) r = '';
    const cambio = r !== ruta;
    ruta = r;
    document.body.classList.add('ej-open'); document.body.classList.remove('toc-open', 'focus');
    root.hidden = false;
    if (cambio) {
      if (r === '') inicio(); else if (r === 'repaso') pintarRepaso(); else { filtro = 'todos'; tema(+r); }
      root.scrollTop = 0;
    }
    pintarNav();
    const h = '#ej' + (r ? '/' + r : '');
    if (location.hash !== h) history.replaceState(null, '', h);
    const t = temasConEj.find((x) => String(x.n) === r);
    $('#crumb').innerHTML = `<b>Ejercicios</b>${t ? `  ›  Tema ${t.n} · ${t.title}` : r === 'repaso' ? '  ›  Repaso al azar' : '  ›  Inicio'}`;
    alCambiar && alCambiar(true);
    // precarga PostgreSQL para que la primera ejecución sea rápida
    if (!reserva) { reserva = freshDB(); reserva.catch(() => {}); }
  }
  function cerrar() {
    if (root.hidden) return;
    root.hidden = true; document.body.classList.remove('ej-open'); ruta = null;
    main.innerHTML = '';
    alCambiar && alCambiar(false);
  }
  return { abrir, cerrar, abierto: () => !root.hidden };
}
