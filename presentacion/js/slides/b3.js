// Bloque III · Rendimiento y transacciones (Tema 10)
import { col, pts, box, w, table, cards, study, code, sql } from '../deck.js';
import { pal, frame, svg, chart, esc, three, textSprite, highlight, widgetScope } from '../ui.js';
import { query, run, renderResult } from '../sql.js';

const my = (t) => box('gray', 'MySQL', t);
const codeBox = (s, fs = 15) => `<pre class="code" style="font-size:${fs}px;margin:0">${highlight(s)}</pre>`;

export function build(D) {
  D.bloque({ n: 'III', title: 'Rendimiento y transacciones',
    intro: 'Una consulta correcta no basta: tiene que responder a tiempo y comportarse bien cuando cientos de usuarios trabajan a la vez. Por qué una consulta es lenta, cómo ayudan los índices, cómo leer un plan, qué garantizan las transacciones y cómo protegerse con copias de seguridad.',
    temas: [[10, 'Lo imprescindible de rendimiento y transacciones']] });

  D.tema({ n: 10, title: 'Lo imprescindible de rendimiento y transacciones', obj: ['Qué es un índice, cómo funciona un árbol B y cuándo crearlo', 'Leer un plan de ejecución con EXPLAIN',
    'Las propiedades ACID', 'Problemas de concurrencia y niveles de aislamiento', 'Una estrategia básica de copias de seguridad'] });

  D.s('10.1', 'Qué es un índice: el árbol B+', `${col(w('btree3d'), 'wide')}${col(`
      ${pts(['Sin índice: <b>recorrido secuencial</b>, fila a fila.', 'El <b>árbol B+</b>: equilibrado y muy ancho. Cada nodo es una página con cientos de claves.', 'Las hojas están ordenadas y enlazadas: sirven para recorrer <b>rangos</b>.'])}
      <div class="box" style="text-align:center"><p style="font-family:var(--font-mono);font-size:24px">h ≈ ⌈log<sub>f</sub> N⌉</p></div>
      ${study('f es el factor de ramificación (punteros por nodo), del orden de cientos en la práctica. El logaritmo crece despacísimo.')}`, 'narrow')}`,
    { lead: 'Escribe una clave y mira cuántos nodos hay que leer para encontrarla. Gira el árbol en 3D.' });

  D.s('10.1', 'Medido en PostgreSQL: altura y tiempos', `${col(w('btreeheight'))}${col(w('benchtimes'))}`,
    { id: 's10.1b', lead: 'Mediciones reales: con 10 millones de filas, tres niveles. Sobre una tabla venta de 2 millones de filas (100 MB):' });

  D.s('10.1', 'Selectividad: cuándo compensa un índice', `${col(w('selectivity'), 'wide')}${col(`
      <div class="box" style="text-align:center"><p style="font-family:var(--font-mono);font-size:21px">s = filas que cumplen / filas totales</p></div>
      ${box('', 'Los índices no son gratis', 'Ocupan espacio (15 MB por índice en una tabla de 100 MB) y <b>ralentizan las escrituras</b>: cada INSERT/UPDATE/DELETE actualiza todos los índices. Se crean los que hacen falta, no «por si acaso».')}`, 'narrow')}`,
    { id: 's10.1c', lead: 'Con pocas unidades por ciento o menos, el índice gana; si la consulta devuelve gran parte de la tabla, el recorrido secuencial es más barato (y el optimizador lo elige solo).' });

  D.s('10.1', 'Qué indexar y qué no', `${col(table(['Conviene indexar…', 'No suele compensar…'], [['FK usadas en joins (pedido.cliente_id)', 'Tablas pequeñas'], ['Columnas de WHERE selectivas', 'Columnas con pocos valores (sí/no)'], ['ORDER BY frecuentes + LIMIT', 'Columnas que casi nunca se filtran'], ['Columnas únicas (UNIQUE)', 'Tablas con muchísimas escrituras']]))}
    ${col(`${pts(['PK y UNIQUE crean su índice solas; <b>las FK no</b> (en PostgreSQL, a mano).', 'Índice compuesto <code>(cliente_id, fecha)</code>: sirve para cliente_id, no solo para fecha (guía telefónica).', '<code>WHERE lower(email) = …</code> no usa el índice de email: crea uno <b>de expresión</b>.',
      'Otros tipos: <b>Hash</b> (igualdad), <b>GIN</b> (JSON, arrays, texto), <b>GiST</b> (geometría, rangos), <b>BRIN</b> (tablas enormes ordenadas físicamente).'])}`)}`, { id: 's10.1d' });

  D.s('10.2', 'Leer un plan de ejecución con EXPLAIN', `${col(w('explainlab'))}`,
    { lead: 'Laboratorio en vivo: genera una tabla de ventas, mide sin índice, crea el índice y vuelve a medir. Todo en PostgreSQL dentro de tu navegador.' });

  D.s('10.2', 'Cómo leer un plan', `${col(`${code(`Gather  (cost=1000.00..24218.77 rows=21 width=18)
        (actual time=2.142..50.012 rows=25 loops=1)
  Workers Planned: 2
  ->  Parallel Seq Scan on venta
        (cost=0.00..23216.67 rows=9 width=18)
        (actual time=1.916..42.261 rows=8 loops=3)
        Filter: (cliente_id = 4242)
        Rows Removed by Filter: 666658
Execution Time: 50.037 ms`, 'sql', 'font-size:15px')}${code(`Bitmap Heap Scan on venta (cost=4.58..82.46 rows=20)
  Recheck Cond: (cliente_id = 4242)
  ->  Bitmap Index Scan on idx_venta_cliente
        Index Cond: (cliente_id = 4242)
Execution Time: 0.335 ms`, 'sql', 'font-size:15px')}`, 'wide')}
    ${col(`${pts(['<b>Árbol de dentro afuera</b>: lo más sangrado se ejecuta primero.', '<b>Nodo</b>: Seq Scan, Index Scan, Hash Join, Nested Loop, Sort…', '<b>cost</b>: unidades del optimizador, no milisegundos.', '<b>rows</b> estimadas vs reales: si difieren mucho, <code>ANALYZE tabla</code>.', '<b>Rows Removed by Filter</b> enorme → falta un índice.'])}${my('EXPLAIN (y EXPLAIN ANALYZE desde 8.0.18): type = ALL es recorrido completo.')}`, 'narrow')}`,
    { id: 's10.2b', lead: 'Planes reales sobre 2 millones de filas: 50 ms sin índice frente a 0,3 ms con índice.' });

  D.s('10.3', 'Transacciones: qué son y por qué existen', `${col(w('transfer'), 'wide')}${col(`${code(`BEGIN;
UPDATE cuenta SET saldo = saldo - 100
WHERE id = 'A';
UPDATE cuenta SET saldo = saldo + 100
WHERE id = 'B';
COMMIT;`, 'sql', 'font-size:16px')}${pts(['Resuelven dos problemas: los <b>fallos</b> (se cae a mitad) y la <b>concurrencia</b> (muchos a la vez).'])}`, 'narrow')}`,
    { lead: 'Una transferencia de 100 € son dos operaciones. Provoca un apagón entre las dos, con y sin transacción.' });

  D.s('10.4', 'Propiedades ACID', `${col(w('acid'))}`, { lead: 'Cuatro garantías para cada transacción. Pasa por cada letra.' });

  D.s('10.5', 'Varios usuarios a la vez: la actualización perdida', `${col(w('lostupdate'))}`,
    { lead: 'Dos dependientes venden el último monitor a la vez. Ejecuta las dos sesiones paso a paso con cada estrategia.' });

  D.s('10.5', 'Anomalías y niveles de aislamiento', `${col(w('isolation'), 'wide')}${col(`${code(`BEGIN ISOLATION LEVEL SERIALIZABLE;
-- …operaciones…
COMMIT;`, 'sql', 'font-size:16px')}
      ${pts(['PostgreSQL: <b>READ COMMITTED</b> por defecto. Nunca lecturas sucias.', '<b>MVCC</b>: cada transacción ve una «foto»; los lectores no bloquean a los escritores.', 'SERIALIZABLE aborta una transacción peligrosa: hay que <b>reintentar</b>.', '<b>Deadlock</b>: el SGBD aborta una. Prevención: mismo orden de acceso y transacciones cortas.'])}
      ${my('InnoDB: REPEATABLE READ por defecto, MVCC + gap locks.')}`, 'narrow')}`,
    { id: 's10.5b', lead: 'Cuanto más alto el nivel, menos anomalías… y menos concurrencia. Elige un nivel.' });

  D.s('10.6', 'Copias de seguridad: RPO y RTO', `${col(w('rporto'), 'wide')}${col(`${table(['Tipo', 'Herramienta', 'Clave'], [['Lógica', 'pg_dump / pg_restore', 'Portable; una sola tabla; lenta en grande'], ['Física', 'pg_basebackup', 'Rápida; ligada a la versión'], ['Continua (PITR)', 'Física + archivado WAL', 'Volver a <b>cualquier instante</b>']], 'small')}
      ${box('', 'Reglas de oro', '<b>3-2-1</b>: 3 copias, 2 soportes, 1 fuera. <b>Una copia que no se ha restaurado nunca no es una copia.</b> Automatiza, vigila y cifra.')}`, 'narrow')}`,
    { lead: 'RPO: cuántos datos puedo perder. RTO: cuánto tiempo puedo estar sin servicio. Ajusta la estrategia y provoca un desastre.' });

  D.s('10.6', 'Copias en la práctica', `${col(`${code(`pg_dump -Fc -d mercado -f mercado_2027-01-25.dump     # lógica comprimida
pg_restore -d mercado_prueba mercado_2027-01-25.dump  # en otra BD
pg_restore -d mercado_prueba -t cliente mercado_2027-01-25.dump  # una tabla`, 'sql', 'font-size:17px')}
      ${pts(['Servicios gestionados (RDS, Cloud SQL, Azure Database) automatizan copias diarias y PITR dentro de un periodo de retención.', 'Pero definir el RPO, el RTO y <b>probar las restauraciones</b> sigue siendo responsabilidad nuestra.', 'Copias ≠ alta disponibilidad (Tema 23).'])}`)}
    ${col(my('mysqldump o MySQL Shell (lógicas); Percona XtraBackup (físicas en caliente); PITR con el <i>binary log</i>.'), 'narrow')}`, { id: 's10.6b' });
}

export const widgets = {
  // ---------- árbol B+ en 3D ----------
  async btree3d(el) {
    const life = widgetScope(el);
    let animation = 0;
    const p = pal();
    el.innerHTML = `<div class="w-title">Árbol B+ (4 claves por nodo para que se vea; en la realidad, cientos)<span class="live">3D</span></div>
      <div class="w-controls"><label>Buscar clave <input type="number" class="k" value="21" style="width:90px"></label><button class="btn primary go">Buscar</button><button class="btn rg">Rango 10–27</button><span class="w-out" style="flex:1"></span></div><div class="w-canvas"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const T = await three(cv, { pos: [0, 1.2, 18], target: [0, 0.2, 0], fov: 42 }, life);
    if (!life.alive) { T?.dispose(); return; }
    const { THREE, scene } = T;
    // Claves 1..32 en hojas de 4; nodos internos.
    const leaves = d3.range(8).map((i) => d3.range(4).map((j) => i * 4 + j + 1));
    const lvl2 = d3.range(2).map((i) => leaves.slice(i * 4, i * 4 + 4));
    const nodeMesh = [], mk = (keys, x, y, wdt, kind) => {
      const g = new THREE.Group(); g.position.set(x, y, 0);
      const box = new THREE.Mesh(new THREE.BoxGeometry(wdt, 0.62, 0.5), new THREE.MeshStandardMaterial({ color: kind === 'leaf' ? (p.dark ? '#2B3237' : '#FFFFFF') : p.blueL, roughness: 0.5 }));
      g.add(box); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineBasicMaterial({ color: p.blueD })));
      const lab = textSprite(THREE, keys.join('  '), { size: 0.55, color: '#FFFFFF' });
      lab.scale.multiplyScalar(Math.min(1, (wdt - 0.2) / lab.scale.x)); lab.position.set(0, 0, 0.3); g.add(lab);
      scene.add(g); const o = { g, box, lab, keys, kind }; nodeMesh.push(o); return o;
    };
    const root = mk(lvl2.slice(1).map((l) => l[0][0]), 0, 3.6, 1.6, 'root');
    const mids = lvl2.map((ls, i) => mk(ls.slice(1).map((l) => l[0]), (i - 0.5) * 10.4, 0.8, 2.6, 'mid'));
    const lfs = leaves.map((ks, i) => mk(ks, (i - 3.5) * 2.6, -2.4, 2.3, 'leaf'));
    lfs.forEach((o) => { o.g.scale.set(1, 1, 1); });
    const lineMat = new THREE.LineBasicMaterial({ color: p.mid, transparent: true, opacity: 0.6 });
    const link = (a, b) => scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a.g.position.x, a.g.position.y - 0.31, 0), new THREE.Vector3(b.g.position.x, b.g.position.y + 0.31, 0)]), lineMat));
    mids.forEach((m) => link(root, m)); lfs.forEach((l, i) => link(mids[Math.floor(i / 4)], l));
    // enlaces entre hojas
    for (let i = 0; i < lfs.length - 1; i++) scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(lfs[i].g.position.x + 1.15, -2.4, 0), new THREE.Vector3(lfs[i + 1].g.position.x - 1.15, -2.4, 0)]), new THREE.LineBasicMaterial({ color: p.blue })));
    const lab = (t, y) => { const s = textSprite(THREE, t, { size: 0.42, color: p.dark ? '#9AA3A9' : '#6B7073' }); s.position.set(-10.5, y + 0.9, 0); scene.add(s); };
    lab('raíz', 3.2); lab('internos', 0.6); lab('hojas →', -2.4);
    const paint = (set) => nodeMesh.forEach((o) => { o.box.material.color.set(set.has(o) ? p.blue : o.kind === 'leaf' ? (p.dark ? '#2B3237' : '#FFFFFF') : p.blueL); o.box.material.emissive?.set(set.has(o) ? '#003d52' : '#000000'); o.lab.material.color.set(!p.dark || set.has(o) || o.kind !== 'leaf' ? '#26292B' : '#E7EBEE'); });
    paint(new Set());
    const search = async (k) => {
      const current = ++animation;
      const li = Math.floor((k - 1) / 4), mi = Math.floor(li / 4);
      if (!Number.isInteger(k) || k < 1 || k > 32) { out.innerHTML = 'Las claves son enteros de 1 a 32.'; return; }
      const path = [root, mids[mi], lfs[li]], set = new Set();
      for (let i = 0; i < path.length; i++) { set.add(path[i]); paint(set); out.innerHTML = `Lectura ${i + 1}: ${['raíz', 'nodo interno', 'hoja'][i]} [${path[i].keys.join(', ')}]`; if (!(await life.sleep(650)) || current !== animation) return; }
      out.innerHTML = `✔ Clave <b>${k}</b> encontrada con <b>3 lecturas</b> de páginas (+1 para la fila). Un recorrido secuencial habría leído hasta 32.`;
    };
    el.querySelector('.go').onclick = () => search(+el.querySelector('.k').value);
    el.querySelector('.k').addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') search(+e.target.value); });
    el.querySelector('.rg').onclick = async () => {
      const current = ++animation, set = new Set([root, mids[0]]); paint(set); if (!(await life.sleep(500)) || current !== animation) return;
      for (let i = 2; i <= 6; i++) { set.add(lfs[i]); paint(set); if (!(await life.sleep(300)) || current !== animation) return; }
      out.innerHTML = 'Rango: se baja hasta la primera hoja (10) y luego se <b>recorren las hojas enlazadas</b> hasta 27, sin volver a la raíz.';
    };
    T.onFrame((t) => { T.scene.rotation.y = Math.sin(t * 0.25) * 0.12; });
    life.timeout(() => search(21), 600);
    return () => T.dispose();
  },

  btreeheight(el) {
    const p = pal();
    const N = { 100: [1, 16384], 1000: [2, 40960], 10000: [2, 245760], 100000: [2, 2260992], 1000000: [3, 22487040], 10000000: [3, 224641024] };
    const { cv, out } = frame(el, { title: 'Niveles del índice B-tree según filas (PostgreSQL)', live: true });
    const ks = Object.keys(N);
    const c = chart(cv, { data: { labels: ks.map((k) => (+k).toLocaleString('es-ES')), datasets: [
      { type: 'bar', label: 'Niveles (lecturas de índice)', data: ks.map((k) => N[k][0]), backgroundColor: p.blue, borderRadius: 8, yAxisID: 'y' },
      { type: 'line', label: 'Tamaño del índice (MB, log)', data: ks.map((k) => N[k][1] / 1048576), borderColor: p.gray, borderWidth: 3, pointRadius: 5, yAxisID: 'y2' }] },
      options: { scales: { y: { beginAtZero: true, max: 4, ticks: { stepSize: 1 }, title: { display: true, text: 'niveles' } }, y2: { type: 'logarithmic', position: 'right', grid: { display: false }, ticks: { callback: (v) => ([0.01, 0.1, 1, 10, 100, 1000].includes(+v) ? v : '') },  title: { display: true, text: 'MB' } }, x: { title: { display: true, text: 'filas indexadas' } } }, plugins: { legend: { position: 'bottom' } } } });
    out.innerHTML = '×100.000 filas → solo <b>×3</b> niveles. El logaritmo crece despacísimo.';
    return () => c.destroy();
  },

  benchtimes(el) {
    const p = pal();
    const d = [['Búsqueda puntual', 44.972, 0.025], ['Rango de 7 días', 45.068, 4.355], ['Agregado de toda la tabla', 117.008, 101.64]];
    const { cv, out, ctl } = frame(el, { title: 'Tiempo de respuesta (ms) · 2 M filas', live: true, controls: '<label><input type="checkbox" class="lg" checked> escala logarítmica</label>' });
    const c = chart(cv, { type: 'bar', data: { labels: d.map((x) => x[0]), datasets: [{ label: 'Sin índice', data: d.map((x) => x[1]), backgroundColor: p.gray, borderRadius: 6 }, { label: 'Con índice', data: d.map((x) => x[2]), backgroundColor: p.blue, borderRadius: 6 }] },
      options: { scales: { y: { type: 'logarithmic', ticks: { callback: (v) => ([0.01, 0.1, 1, 10, 100, 1000].includes(+v) ? v : '') }, title: { display: true, text: 'ms' } } }, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (x) => `${x.dataset.label}: ${x.raw} ms` } } } } });
    ctl.querySelector('.lg').onchange = (e) => { c.options.scales.y.type = e.target.checked ? 'logarithmic' : 'linear'; c.update(); };
    out.innerHTML = 'Puntual: <b>×1.800</b> más rápido. Rango (6.151 filas): ×10. Agregado de toda la tabla: <b>el índice no sirve</b>.';
    return () => c.destroy();
  },

  selectivity(el) {
    const p = pal();
    const { cv, out, ctl } = frame(el, { title: 'Coste estimado según selectividad (modelo simplificado)', live: true, controls: '<label>Selectividad <input type="range" min="0" max="100" value="2" step="0.5" class="s"><b class="sv"></b></label>' });
    const xs = d3.range(0, 101, 1);
    const seq = xs.map(() => 100), idx = xs.map((x) => 1 + x * 4.2);
    const mk = { id: 'm', afterDatasetsDraw(c) { const v = +ctl.querySelector('.s').value; const x = c.scales.x.getPixelForValue(v); const ctx = c.ctx; ctx.save(); ctx.strokeStyle = p.ink; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, c.chartArea.top); ctx.lineTo(x, c.chartArea.bottom); ctx.stroke(); ctx.restore(); } };
    const c = chart(cv, { type: 'line', plugins: [mk], data: { labels: xs, datasets: [{ label: 'Seq Scan (lee toda la tabla)', data: seq, borderColor: p.gray, borderWidth: 4, pointRadius: 0 }, { label: 'Index Scan (salta por el índice)', data: idx, borderColor: p.blue, borderWidth: 4, pointRadius: 0 }] },
      options: { scales: { x: { type: 'linear', min: 0, max: 100, title: { display: true, text: '% de filas devueltas' } }, y: { min: 0, max: 200, title: { display: true, text: 'coste' } } }, plugins: { legend: { position: 'bottom' } } } });
    const upd = () => { const v = +ctl.querySelector('.s').value; ctl.querySelector('.sv').textContent = v + ' %'; c.update('none');
      out.innerHTML = v < 23 ? `Con un ${v} % de filas, el optimizador elegiría el <b>índice</b>.` : `Con un ${v} %, sale más barato el <b>recorrido secuencial</b>: el índice obligaría a saltar a demasiadas páginas.`; };
    ctl.oninput = upd; upd();
    return () => c.destroy();
  },

  // ---------- laboratorio EXPLAIN ----------
  async explainlab(el) {
    const life = widgetScope(el);
    const p = pal();
    const S = [
      ['1 · Crear venta (200.000 filas)', `DROP TABLE IF EXISTS venta;\nCREATE TABLE venta AS\nSELECT g AS id,\n       (random() * 9999 + 1)::int AS cliente_id,\n       DATE '2024-01-01' + (random() * 730)::int AS fecha,\n       round((random() * 200)::numeric, 2) AS importe\nFROM generate_series(1, 200000) g;\nANALYZE venta;\nSELECT COUNT(*) FROM venta;`, null],
      ['2 · Puntual sin índice', `EXPLAIN ANALYZE\nSELECT * FROM venta WHERE cliente_id = 4242;`, 'sin'],
      ['3 · CREATE INDEX', `CREATE INDEX idx_venta_cliente ON venta (cliente_id);\nCREATE INDEX idx_venta_fecha ON venta (fecha);\nANALYZE venta;`, null],
      ['4 · Puntual con índice', `EXPLAIN ANALYZE\nSELECT * FROM venta WHERE cliente_id = 4242;`, 'con'],
      ['5 · Rango de 7 días', `EXPLAIN ANALYZE\nSELECT * FROM venta\nWHERE fecha BETWEEN DATE '2025-03-01' AND DATE '2025-03-07';`, 'rango'],
      ['6 · Agregado total', `EXPLAIN ANALYZE\nSELECT SUM(importe) FROM venta;`, 'agg'],
      ['7 · Una expresión anula el índice', `EXPLAIN\nSELECT * FROM venta WHERE cliente_id + 0 = 4242;`, null]];
    el.innerHTML = `<div class="w-title">Laboratorio EXPLAIN ANALYZE<span class="live">EN VIVO</span></div>
      <div class="w-controls">${S.map((s, i) => `<button class="btn ${i ? '' : 'primary'}" data-i="${i}">${s[0]}</button>`).join('')}</div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div style="flex:1.25;display:flex;flex-direction:column;gap:8px;min-height:0"><div class="code-h"></div><pre class="code plan" style="flex:1;font-size:14px;overflow:auto"></pre></div>
      <div style="flex:1;display:flex;flex-direction:column"><div class="w-canvas" style="flex:1"></div><div class="w-out"></div></div></div>`;
    const ch = el.querySelector('.code-h'), plan = el.querySelector('.plan'), out = el.querySelector('.w-out');
    const times = {};
    const c = chart(el.querySelector('.w-canvas'), { type: 'bar', data: { labels: ['sin índice', 'con índice', 'rango 7 días', 'agregado'], datasets: [{ data: [0, 0, 0, 0], backgroundColor: [p.gray, p.blue, p.blueL, p.mid], borderRadius: 8 }] },
      options: { plugins: { legend: { display: false }, title: { display: true, text: 'Execution Time medido (ms)' } }, scales: { y: { beginAtZero: true } } } });
    el.querySelector('.w-controls').onclick = async (e) => {
      const b = e.target.closest('[data-i]'); if (!b || !e.currentTarget.contains(b)) return; const [, q, tag] = S[+b.dataset.i];
      el.querySelectorAll('[data-i]').forEach((x) => x.classList.toggle('primary', x === b));
      ch.innerHTML = codeBox(q, 14); plan.textContent = 'Ejecutando…';
      try {
        const r = await run(q); if (!life.alive) return; const last = r[r.length - 1];
        if (last.fields && last.fields[0] && last.fields[0].name === 'QUERY PLAN') {
          const txt = last.rows.map((x) => x['QUERY PLAN']).join('\n'); plan.innerHTML = esc(txt).replace(/(Seq Scan|Index Scan|Bitmap Index Scan|Bitmap Heap Scan|Index Only Scan|Aggregate|Gather)/g, '<span class="kw">$1</span>').replace(/(Execution Time: [\d.]+ ms|Rows Removed by Filter: \d+)/g, '<b style="color:var(--red)">$1</b>');
          const m = txt.match(/Execution Time: ([\d.]+)/); if (m && tag) { times[tag] = +m[1]; c.data.datasets[0].data = ['sin', 'con', 'rango', 'agg'].map((k) => times[k] || 0); c.update(); }
          out.innerHTML = /Seq Scan/.test(txt) ? 'Recorrido secuencial: lee toda la tabla.' : /Index/.test(txt) ? '✔ Usa el índice.' : '';
        } else { plan.innerHTML = ''; plan.insertAdjacentHTML('beforeend', `✔ ${esc(JSON.stringify(last.rows[0] || 'hecho'))}`); out.innerHTML = 'Listo.'; }
      } catch (er) { if (!life.alive) return; plan.textContent = '✖ ' + er.message + (/does not exist/.test(er.message) ? '\n→ Empieza por el paso 1.' : ''); }
    };
    ch.innerHTML = codeBox(S[0][1], 14); plan.textContent = 'Pulsa los botones en orden (1 → 7).';
    return () => c.destroy();
  },

  // ---------- transferencia con apagón ----------
  transfer(el) {
    const life = widgetScope(el);
    const p = pal();
    let A = 500, B = 200, tx = true, log = [];
    el.innerHTML = `<div class="w-title">Transferencia de 100 € de A a B<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><div class="seg"><button data-t="1" class="active">Con transacción</button><button data-t="0">Sin transacción</button></div><button class="btn primary ok">Transferir</button><button class="btn" style="border-color:var(--red);color:var(--red)" data-crash>⚡ Transferir con apagón a mitad</button><button class="btn rst">↺</button></div>
      <div class="w-canvas" style="display:flex;gap:30px;align-items:center;justify-content:center"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const render = (fly) => {
      const acc = (n, v) => `<div class="card" style="text-align:center;min-width:220px"><h4>Cuenta ${n}</h4><div class="big">${v} €</div></div>`;
      cv.innerHTML = `${acc('A', A)}<div style="font-size:46px;color:${fly ? p.amber : p.line}">${fly ? '💸 →' : '→'}</div>${acc('B', B)}<div class="card ${A + B === 700 ? 'hl' : ''}" style="text-align:center;${A + B !== 700 ? 'border-color:var(--red);background:var(--tint-red)' : ''}"><h4>Total</h4><div class="big" style="${A + B !== 700 ? 'color:var(--red)' : ''}">${A + B} €</div></div>`;
    };
    const go = async (crash) => {
      const a0 = A, b0 = B;
      A -= 100; render(true); out.innerHTML = '<code>UPDATE … saldo - 100 WHERE id = \'A\'</code> ✔'; if (!(await life.sleep(900))) return;
      if (crash) {
        out.innerHTML = '⚡ <b>¡Apagón!</b> El servidor se cae antes del segundo UPDATE…'; if (!(await life.sleep(1200))) return;
        if (tx) { A = a0; B = b0; render(); out.innerHTML = '🔄 Al arrancar, PostgreSQL ve en el WAL que la transacción <b>no llegó a COMMIT</b> y la deshace: <b>atomicidad</b>. No se ha perdido nada.'; }
        else { render(); out.innerHTML = '<span style="color:var(--red)">✖ Sin transacción, el primer UPDATE ya era definitivo: <b>100 € han desaparecido</b>.</span>'; }
        return;
      }
      B += 100; render(); out.innerHTML = '<code>UPDATE … saldo + 100 WHERE id = \'B\'</code> ✔ · COMMIT ✔';
    };
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-t]'); if (!b) return; tx = b.dataset.t === '1'; el.querySelectorAll('.seg button').forEach((x) => x.classList.toggle('active', x === b)); };
    el.querySelector('.ok').onclick = () => go(false); el.querySelector('[data-crash]').onclick = () => go(true);
    el.querySelector('.rst').onclick = () => { A = 500; B = 200; render(); out.innerHTML = ''; };
    render();
  },

  acid(el) {
    const p = pal();
    const P = [['A', 'Atomicidad', 'Se aplican todas las operaciones o ninguna.', 'Registro de deshacer; ROLLBACK automático ante errores.'], ['C', 'Consistencia', 'Al terminar, se cumplen todas las restricciones.', 'Comprobación de CHECK, claves, triggers…'],
      ['I', 'Aislamiento', 'Cada transacción se ejecuta como si estuviera sola.', 'Bloqueos y MVCC (control de concurrencia multiversión).'], ['D', 'Durabilidad', 'Lo confirmado no se pierde aunque haya un fallo.', 'El WAL se escribe en disco antes de confirmar el COMMIT.']];
    el.innerHTML = `<div class="w-title">ACID<span class="live">INTERACTIVO</span></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;flex:1">${P.map((x, i) => `<div class="card ac" data-i="${i}" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;transition:.3s">
      <div style="font-family:Karla;font-weight:700;font-size:130px;line-height:1;color:var(--blue)">${x[0]}</div><h4 style="font-size:28px">${x[1]}</h4><p style="font-size:20px;color:var(--ink)">${x[2]}</p><p class="how" style="font-size:18px;margin-top:14px;opacity:0;transition:.3s"><b>Cómo:</b> ${x[3]}</p></div>`).join('')}</div>
      <div class="box gray" style="margin-top:14px"><div class="bt">Dato · WAL</div><p>Write-Ahead Log: antes de modificar los ficheros de datos, PostgreSQL anota el cambio en un registro secuencial. Si se cae, lo «reproduce» al arrancar. Sirve también para replicación y PITR.</p></div>`;
    el.querySelectorAll('.ac').forEach((c) => { c.onmouseenter = () => { el.querySelectorAll('.ac').forEach((x) => { x.classList.toggle('hl', x === c); x.querySelector('.how').style.opacity = x === c ? 1 : 0; }); }; });
  },

  // ---------- actualización perdida ----------
  lostupdate(el) {
    const p = pal();
    const modes = {
      'Leer y escribir (ingenuo)': [['T1', 'SELECT stock FROM producto WHERE id = 5;', 'lee 1'], ['T2', 'SELECT stock FROM producto WHERE id = 5;', 'lee 1'], ['T1', 'UPDATE producto SET stock = 0 WHERE id = 5;  -- 1 − 1', 'escribe 0'], ['T2', 'UPDATE producto SET stock = 0 WHERE id = 5;  -- 1 − 1', 'escribe 0'], ['', '', 'end']],
      'UPDATE atómico': [['T1', 'UPDATE producto SET stock = stock - 1 WHERE id = 5;', 'atom'], ['T2', 'UPDATE producto SET stock = stock - 1 WHERE id = 5;', 'atom'], ['', '', 'end']],
      'SELECT … FOR UPDATE': [['T1', 'SELECT stock FROM producto WHERE id = 5 FOR UPDATE;', 'lock'], ['T2', 'SELECT stock FROM producto WHERE id = 5 FOR UPDATE;', 'wait'], ['T1', 'UPDATE producto SET stock = 0 WHERE id = 5; COMMIT;', 'commit'], ['T2', '(desbloqueada) lee 0 → no hay stock: no vende', 'nosell'], ['', '', 'end']]
    };
    let m = Object.keys(modes)[0], k = 0, stock, sold;
    el.innerHTML = `<div class="w-title">Último monitor en stock (stock = 1)<span class="live">PASO A PASO</span></div>
      <div class="w-controls"><div class="seg">${Object.keys(modes).map((x, i) => `<button data-m="${x}" class="${i ? '' : 'active'}">${x}</button>`).join('')}</div><button class="btn primary nx">Siguiente paso ›</button><button class="btn rst">↺</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const reset = () => { k = 0; stock = 1; sold = 0; render(); out.innerHTML = 'Dos dependientes, dos sesiones (T1 y T2), un monitor.'; };
    const render = () => {
      const st = modes[m];
      const lane = (t) => `<div style="flex:1;display:flex;flex-direction:column;gap:10px"><div style="font-family:Karla;font-weight:700;font-size:22px;color:${t === 'T1' ? p.blue : p.gray}">${t} · dependiente ${t === 'T1' ? 'A' : 'B'}</div>${st.map((s, i) => s[0] === t ? `<pre class="code" style="font-size:15px;padding:10px 14px;${i < k ? '' : 'opacity:.3'};${i === k - 1 ? 'border-left-color:var(--blue);background:var(--tint-blue)' : ''};margin-top:${i * 6}px">${highlight(s[1])}</pre>` : '').join('')}</div>`;
      cv.innerHTML = `<div style="display:flex;gap:24px">${lane('T1')}<div style="flex:0 0 220px;display:flex;flex-direction:column;gap:14px"><div class="card" style="text-align:center"><h4>stock en BD</h4><div class="big">${stock}</div></div><div class="card" style="text-align:center;${sold > 1 ? 'border-color:var(--red);background:var(--tint-red)' : ''}"><h4>monitores vendidos</h4><div class="big" style="${sold > 1 ? 'color:var(--red)' : ''}">${sold}</div></div></div>${lane('T2')}</div>`;
    };
    el.querySelector('.nx').onclick = () => {
      const st = modes[m]; if (k >= st.length) return; const [t, , a] = st[k]; k++;
      if (a === 'escribe 0') { stock = 0; sold++; }
      if (a === 'atom') { if (stock > 0) { stock--; sold++; out.innerHTML = `${t}: UPDATE 1 → vende.`; } else out.innerHTML = `${t}: el UPDATE esperó a T1 y releyó stock = 0 → <code>CHECK (stock >= 0)</code> lo impide: no vende.`; }
      if (a === 'lock') out.innerHTML = 'T1 bloquea la fila.';
      if (a === 'wait') out.innerHTML = '⏳ T2 <b>espera</b>: la fila está bloqueada por T1.';
      if (a === 'commit') { stock = 0; sold++; out.innerHTML = 'T1 vende y confirma: libera el bloqueo.'; }
      if (a === 'nosell') out.innerHTML = 'T2 ve el valor actualizado y no vende.';
      if (a === 'lee 1') out.innerHTML = `${t} lee stock = 1.`;
      if (a === 'escribe 0') out.innerHTML = `${t} escribe stock = 0 (calculado en la aplicación).`;
      if (a === 'end') out.innerHTML = sold > 1 ? '<span style="color:var(--red)">✖ <b>Actualización perdida</b>: se han vendido 2 monitores y solo había 1. La escritura de T1 se ha perdido.</span>' : '✔ Correcto: un único monitor vendido.';
      render();
    };
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-m]'); if (!b) return; m = b.dataset.m; el.querySelectorAll('.seg button').forEach((x) => x.classList.toggle('active', x === b)); reset(); };
    el.querySelector('.rst').onclick = reset;
    reset();
  },

  isolation(el) {
    const p = pal();
    const L = ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'];
    const A = [['Lectura sucia', 'T1 lee cambios de T2 sin confirmar; si T2 deshace, T1 vio algo que nunca existió.'], ['Lectura no repetible', 'T1 lee una fila dos veces y obtiene valores distintos.'], ['Lectura fantasma', 'T1 repite una consulta y aparecen o desaparecen filas.'], ['Anomalía de serialización', 'El resultado no coincide con ningún orden en serie.']];
    // estándar: [UC, RC, RR, S]; PostgreSQL entre paréntesis
    const M = [[1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 1, 0]];
    const PG = { 0: 'En PostgreSQL se comporta como READ COMMITTED: nunca hay lecturas sucias.', 2: 'En PostgreSQL REPEATABLE READ tampoco permite fantasmas (usa una foto de toda la transacción).' };
    let lv = 1;
    const { cv, ctl, out } = frame(el, { title: 'Anomalías posibles por nivel (estándar SQL)', live: true, controls: `<div class="seg">${L.map((l, i) => `<button data-l="${i}" class="${i === 1 ? 'active' : ''}">${l}</button>`).join('')}</div>` });
    const render = () => {
      cv.innerHTML = `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">${A.map((a, i) => { const pos = M[i][lv]; return `<div class="card" style="${pos ? 'border-color:var(--red);background:var(--tint-red)' : 'border-color:var(--blue);background:var(--tint-blue)'}"><h4>${pos ? '⚠️' : '🛡️'} ${a[0]}</h4><p>${a[1]}</p><p style="margin-top:8px;font-weight:700;color:${pos ? p.red : p.blueD}">${pos ? 'Posible' : 'Impedida'}</p></div>`; }).join('')}</div>`;
      out.innerHTML = `${lv === 1 ? '<b>Por defecto en PostgreSQL.</b> ' : ''}${PG[lv] || ''}`;
    };
    ctl.onclick = (e) => { const b = e.target.closest('[data-l]'); if (!b) return; lv = +b.dataset.l; ctl.querySelectorAll('[data-l]').forEach((x) => x.classList.toggle('active', x === b)); render(); };
    render();
  },

  // ---------- RPO / RTO ----------
  rporto(el) {
    const p = pal();
    el.innerHTML = `<div class="w-title">Simulador de desastre<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><label>Estrategia <select class="st"><option value="dump">pg_dump diario (02:00)</option><option value="phys">Física semanal + dump diario</option><option value="pitr">Física + archivado WAL (PITR)</option></select></label>
      <label>Hora del DELETE sin WHERE <input type="range" min="2.5" max="23.5" step="0.25" value="10.7" class="h"><b class="hv"></b></label><label>Tamaño BD <select class="sz"><option value="5">5 GB</option><option value="50" selected>50 GB</option><option value="500">500 GB</option></select></label></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const upd = () => {
      const st = el.querySelector('.st').value, h = +el.querySelector('.h').value, sz = +el.querySelector('.sz').value;
      const hh = (x) => `${String(Math.floor(x)).padStart(2, '0')}:${String(Math.round((x % 1) * 60)).padStart(2, '0')}`;
      el.querySelector('.hv').textContent = hh(h);
      const lastBackup = 2, rpo = st === 'pitr' ? 0.02 : h - lastBackup;
      const rto = st === 'dump' ? sz * 0.06 : st === 'phys' ? sz * 0.025 + 0.2 : sz * 0.02 + 0.3;
      cv.innerHTML = ''; const { s, W, H } = svg(cv);
      const x = d3.scaleLinear().domain([0, 30]).range([40, W - 30]);
      s.append('line').attr('x1', x(0)).attr('x2', x(30)).attr('y1', H / 2).attr('y2', H / 2).attr('stroke', p.line).attr('stroke-width', 6);
      d3.range(0, 31, 3).forEach((t) => s.append('text').text(hh(t % 24)).attr('x', x(t)).attr('y', H / 2 + 34).attr('text-anchor', 'middle').attr('font-size', 14).attr('fill', p.muted));
      s.append('rect').attr('x', x(h - rpo)).attr('width', x(h) - x(h - rpo)).attr('y', H / 2 - 40).attr('height', 34).attr('fill', p.red).attr('opacity', 0.75).attr('rx', 6);
      s.append('text').text(`RPO: ${rpo < 0.1 ? '≈ segundos' : rpo.toFixed(1) + ' h de datos perdidos'}`).attr('x', (x(h - rpo) + x(h)) / 2).attr('y', H / 2 - 50).attr('text-anchor', 'middle').attr('font-weight', 700).attr('fill', p.red).attr('font-size', 17);
      s.append('rect').attr('x', x(h)).attr('width', x(h + rto) - x(h)).attr('y', H / 2 + 50).attr('height', 34).attr('fill', p.amber).attr('opacity', 0.8).attr('rx', 6);
      s.append('text').text(`RTO: ${rto.toFixed(1)} h sin servicio`).attr('x', x(h) + 8).attr('y', H / 2 + 108).attr('font-weight', 700).attr('fill', p.amber).attr('font-size', 17);
      s.append('text').text('💾').attr('x', x(lastBackup)).attr('y', H / 2 + 8).attr('text-anchor', 'middle').attr('font-size', 26);
      if (st === 'pitr') d3.range(2.25, h, 0.25).forEach((t) => s.append('circle').attr('cx', x(t)).attr('cy', H / 2).attr('r', 3).attr('fill', p.blue));
      s.append('text').text('💥').attr('x', x(h)).attr('y', H / 2 + 9).attr('text-anchor', 'middle').attr('font-size', 30);
      out.innerHTML = st === 'pitr' ? '✔ Con el WAL archivado se restaura <b>hasta un instante antes del DELETE</b>: RPO de segundos.' : `Se vuelve a la copia de las 02:00: se pierde todo lo que ocurrió después (${rpo.toFixed(1)} h). ${st === 'dump' ? 'Y restaurar un dump lógico grande es <b>lento</b> (RTO alto).' : ''}`;
    };
    el.querySelectorAll('input,select').forEach((i) => i.addEventListener('input', upd));
    upd();
  }
};
