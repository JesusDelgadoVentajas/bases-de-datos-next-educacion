// Widgets del Bloque V (Temas 18, 19 y 20)
import { pal, frame, svg, chart, esc, highlight, three, textSprite, widgetScope } from '../ui.js';

const segBtns = (opts, act, attr = 'k') => `<div class="seg">${opts.map((o) => `<button data-${attr}="${o}" class="${o === act ? 'active' : ''}">${o}</button>`).join('')}</div>`;
const bindSeg = (root, attr, cb) => root.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { root.querySelectorAll(`[data-${attr}]`).forEach((x) => x.classList.toggle('active', x === b)); cb(b.dataset[attr]); }));
const tbl = (h, rows, cls) => `<table class="edit" style="width:100%"><thead><tr>${h.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr>${r.map((v, j) => `<td class="${cls ? cls(i, j, v) : ''}" style="padding:6px 10px;font-family:var(--font-mono);font-size:15px">${v ?? 'NULL'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

// flujo animado genérico: cajas en columnas con partículas que viajan
function flowDiagram(cv, cols, edges, info, out) {
  const p = pal();
  const { s, W, H } = svg(cv);
  const pos = {};
  cols.forEach((c, i) => c.items.forEach((it, j) => { const x = 20 + i * ((W - 40) / cols.length), w = (W - 40) / cols.length - 30, h = Math.min(64, (H - 40) / c.items.length - 14), y = (H - c.items.length * (h + 14)) / 2 + j * (h + 14); pos[it] = { x, y, w, h, hl: c.hl }; }));
  const gE = s.append('g');
  edges.forEach(([a, b]) => { const A = pos[a], B = pos[b]; gE.append('path').attr('d', `M${A.x + A.w},${A.y + A.h / 2} C${A.x + A.w + 30},${A.y + A.h / 2} ${B.x - 30},${B.y + B.h / 2} ${B.x},${B.y + B.h / 2}`).attr('fill', 'none').attr('stroke', p.line).attr('stroke-width', 2.5).attr('class', 'e'); });
  Object.entries(pos).forEach(([n, o]) => {
    const g = s.append('g').attr('transform', `translate(${o.x},${o.y})`).style('cursor', 'pointer');
    g.append('rect').attr('width', o.w).attr('height', o.h).attr('rx', 12).attr('fill', o.hl ? p.blue : p.surface).attr('stroke', o.hl ? p.blueD : p.gray).attr('stroke-width', 2);
    g.append('text').text(n).attr('x', o.w / 2).attr('y', o.h / 2 + 6).attr('text-anchor', 'middle').attr('font-weight', 700).attr('font-size', 16).attr('fill', o.hl ? '#fff' : p.ink);
    g.on('mouseenter', () => { if (info[n]) out.innerHTML = `<b>${n}</b>: ${info[n]}`; });
  });
  const paths = gE.selectAll('path').nodes();
  let alive = true, timer;
  const shoot = () => { if (!alive) return; const pth = paths[(Math.random() * paths.length) | 0]; const L = pth.getTotalLength(); const dot = s.append('circle').attr('r', 5).attr('fill', p.blue);
    dot.transition().duration(1400).ease(d3.easeLinear).attrTween('transform', () => (t) => { const pt = pth.getPointAtLength(t * L); return `translate(${pt.x},${pt.y})`; }).remove(); timer = setTimeout(shoot, 180); };
  shoot();
  return () => { alive = false; clearTimeout(timer); s.selectAll('*').interrupt(); };
}

export const widgets = {
  dwarch(el) {
    const { cv, out } = frame(el, { title: 'Arquitectura analítica clásica', live: true });
    const stop = flowDiagram(cv, [{ items: ['Tienda online', 'CRM', 'Contabilidad', 'Marketing'] }, { items: ['ETL / ELT'] }, { items: ['Data warehouse'], hl: true }, { items: ['Mart ventas', 'Mart finanzas'] }, { items: ['Power BI', 'Informes', 'Ciencia de datos'] }],
      [['Tienda online', 'ETL / ELT'], ['CRM', 'ETL / ELT'], ['Contabilidad', 'ETL / ELT'], ['Marketing', 'ETL / ELT'], ['ETL / ELT', 'Data warehouse'], ['Data warehouse', 'Mart ventas'], ['Data warehouse', 'Mart finanzas'], ['Mart ventas', 'Power BI'], ['Mart ventas', 'Informes'], ['Mart finanzas', 'Informes'], ['Data warehouse', 'Ciencia de datos']],
      { 'Tienda online': 'OLTP: PostgreSQL con Mercado Next. Estado actual, normalizado.', CRM: 'Otra fuente, con otros códigos de cliente.', 'ETL / ELT': 'Extraer, transformar (limpiar, unificar códigos) y cargar (Tema 19).', 'Data warehouse': 'Orientado a temas, integrado, variable en el tiempo y no volátil.', 'Mart ventas': 'Data mart departamental, dimensional.', 'Power BI': 'Herramientas de BI que consultan el modelo dimensional.' }, out);
    out.innerHTML = 'Los datos fluyen de los sistemas operacionales al almacén analítico. Pasa el ratón por las cajas.';
    return stop;
  },

  inmonkimball(el) {
    const p = pal();
    el.innerHTML = `<div class="w-title">Dos escuelas<span class="live">INTERACTIVO</span></div><div class="w-controls">${segBtns(['Inmon (top-down)', 'Kimball (bottom-up)'], 'Inmon (top-down)', 'm')}</div><div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const show = (m) => {
      cv.innerHTML = ''; const { s, W, H } = svg(cv);
      const box = (x, y, w, h, t, hl) => { s.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 12).attr('fill', hl ? p.blue : p.surface).attr('stroke', hl ? p.blueD : p.gray).attr('stroke-width', 2); t.split('\n').forEach((l, i, a) => s.append('text').text(l).attr('x', x + w / 2).attr('y', y + h / 2 + 6 + (i - (a.length - 1) / 2) * 20).attr('text-anchor', 'middle').attr('font-weight', 700).attr('font-size', 16).attr('fill', hl ? '#fff' : p.ink)); };
      const arr = (x1, y1, x2, y2) => s.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', p.mid).attr('stroke-width', 2.5);
      box(20, H / 2 - 60, 140, 120, 'Fuentes', false); arr(160, H / 2, 210, H / 2);
      if (m.startsWith('Inmon')) {
        box(210, H / 2 - 70, 200, 140, 'DW corporativo\nnormalizado (3FN)', true);
        ['Mart ventas', 'Mart finanzas', 'Mart marketing'].forEach((t, i) => { const y = 30 + i * ((H - 60) / 3); arr(410, H / 2, 470, y + 35); box(470, y, 190, 70, t + '\n(dimensional)', false); });
        out.innerHTML = '<b>Inmon</b>: primero el almacén corporativo integrado y normalizado; de él salen los data marts.';
      } else {
        ['Mart ventas', 'Mart pedidos', 'Mart stock'].forEach((t, i) => { const y = 30 + i * ((H - 60) / 3); arr(160, H / 2, 220, y + 35); box(220, y, 200, 70, t + '\n(estrella)', true); });
        box(470, H / 2 - 50, 190, 100, 'Dimensiones\nconformadas\n(cliente, fecha)', false);
        [0, 1, 2].forEach((i) => arr(420, 65 + i * ((H - 60) / 3), 470, H / 2));
        out.innerHTML = '<b>Kimball</b>: el DW es el conjunto de data marts dimensionales, construidos proceso a proceso, que encajan porque comparten <b>dimensiones conformadas</b>.';
      }
    };
    bindSeg(el, 'm', show); show('Inmon (top-down)');
  },

  // ---------- cubo OLAP 3D ----------
  async cube3d(el) {
    const life = widgetScope(el);
    let animation = 0;
    const p = pal();
    const CAT = ['Teclados', 'Ratones', 'Monitores', 'Hogar'], CIU = ['Madrid', 'Sevilla', 'Bilbao', 'Valencia', 'Zaragoza'], TRI = ['T1', 'T2', 'T3', 'T4'];
    let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const V = CAT.map((c, i) => CIU.map((ci, j) => TRI.map((t, k) => Math.round((20 + 60 * rnd()) * [1.1, 0.8, 1.6, 0.6][i] * [1.6, 1.1, 0.8, 0.9, 0.6][j] * [0.9, 0.8, 1, 1.4][k]))));
    el.innerHTML = `<div class="w-title">Cubo de ventas (miles €): categoría × ciudad × trimestre<span class="live">3D</span></div>
      <div class="w-controls"><span>Slice ciudad:</span><select class="sl"><option value="">(todas)</option>${CIU.map((c, i) => `<option value="${i}">${c}</option>`).join('')}</select><span>Slice trimestre:</span><select class="st"><option value="">(todos)</option>${TRI.map((c, i) => `<option value="${i}">${c}</option>`).join('')}</select>
      <button class="btn ru">Roll-up: total por categoría</button><button class="btn rst">↺</button></div>
      <div style="display:flex;gap:14px;flex:1;min-height:0"><div class="w-canvas" style="flex:1.5"></div><div class="side" style="flex:1;overflow:auto"></div></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), side = el.querySelector('.side'), out = el.querySelector('.w-out');
    const T = await three(cv, { pos: [6.2, 4.6, 6.6], target: [0, -0.3, 0.3], fov: 45 }, life);
    if (!life.alive) { T?.dispose(); return; }
    const { THREE, scene } = T;
    const g = new THREE.Group(); scene.add(g);
    const max = d3.max(V.flat(2)), col = d3.scaleSequential([0, max], d3.interpolateRgb(p.blueL, p.blueD));
    const cells = [];
    V.forEach((a, i) => a.forEach((b, j) => b.forEach((v, k) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.86, 0.86), new THREE.MeshStandardMaterial({ color: col(v), transparent: true, opacity: 0.92 }));
      m.position.set(i * 1.0 - 1.5, k * 1.0 - 1.5, j * 1.0 - 2); g.add(m); cells.push({ m, i, j, k, v });
    })));
    const lab = (t, pos, c = p.dark ? '#E7EBEE' : '#26292B') => { const s = textSprite(THREE, t, { size: 0.36, color: c }); s.position.set(...pos); g.add(s); };
    CAT.forEach((c, i) => lab(c, [i - 1.5, -2.45, 3.1])); CIU.forEach((c, j) => lab(c, [2.9, -2.4, j - 2])); TRI.forEach((t, k) => lab(t, [-2.6, k - 1.5, 3]));
    const render = (sel) => {
      cells.forEach((c) => { const on = sel(c); c.m.material.opacity = on ? 0.95 : 0.06; c.m.scale.setScalar(on ? 1 : 0.6); });
    };
    const apply = () => {
      const sl = el.querySelector('.sl').value, st = el.querySelector('.st').value;
      render((c) => (sl === '' || c.j === +sl) && (st === '' || c.k === +st));
      const rows = CAT.map((c, i) => [c, d3.sum(V[i].flatMap((x, j) => x.filter((_, k) => (sl === '' || j === +sl) && (st === '' || k === +st))))]);
      side.innerHTML = tbl(['categoría', 'SUM(ventas)'], rows) + `<pre class="code" style="font-size:13px;margin-top:10px">${highlight(`SELECT categoria, SUM(ventas)\nFROM cubo${sl !== '' || st !== '' ? `\nWHERE ${[sl !== '' && `ciudad = '${CIU[sl]}'`, st !== '' && `trimestre = '${TRI[st]}'`].filter(Boolean).join(' AND ')}` : ''}\nGROUP BY categoria;`)}</pre>`;
      out.innerHTML = sl !== '' && st !== '' ? '<b>Dice</b>: dos filtros a la vez → una «columna» del cubo.' : sl !== '' || st !== '' ? '<b>Slice</b>: fijar un valor de una dimensión → una «rebanada» del cubo.' : 'El cubo completo: 4 × 5 × 4 = 80 celdas. Arrastra para girarlo.';
    };
    el.querySelectorAll('select').forEach((s) => (s.onchange = apply));
    el.querySelector('.ru').onclick = async () => {
      const current = ++animation;
      for (let step = 0; step <= 20; step++) { cells.forEach((c) => { c.m.position.y = (c.k * 1.0 - 1.5) * (1 - step / 20) - 1.5 * (step / 20); c.m.position.z = (c.j - 2) * (1 - step / 20); }); if (!(await life.sleep(30)) || current !== animation) return; }
      out.innerHTML = '<b>Roll-up</b>: se suman ciudades y trimestres → una barra por categoría (el drill-down es el camino inverso).';
      side.innerHTML = tbl(['categoría', 'total'], CAT.map((c, i) => [c, d3.sum(V[i].flat())]));
    };
    el.querySelector('.rst').onclick = () => { animation++; cells.forEach((c) => c.m.position.set(c.i - 1.5, c.k - 1.5, c.j - 2)); el.querySelector('.sl').value = ''; el.querySelector('.st').value = ''; apply(); };
    apply();
    return () => T.dispose();
  },

  // ---------- esquema en estrella ----------
  star(el) {
    const p = pal();
    const dims = { dim_fecha: ['fecha_key PK', 'fecha', 'mes', 'trimestre', 'anio'], dim_producto: ['producto_key PK', 'producto', 'subcategoria', 'categoria'], dim_cliente: ['cliente_key PK', 'cliente_id', 'nombre', 'ciudad', 'segmento'], dim_tienda: ['tienda_key PK', 'canal', 'pais'] };
    const fact = ['fecha_key FK', 'producto_key FK', 'cliente_key FK', 'tienda_key FK', 'unidades', 'importe'];
    let snow = false, selD = null;
    el.innerHTML = `<div class="w-title">fact_ventas y sus dimensiones<span class="live">INTERACTIVO</span></div><div class="w-controls">${segBtns(['Estrella', 'Copo de nieve'], 'Estrella', 'm')}</div><div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      cv.innerHTML = ''; const { s, W, H } = svg(cv);
      const cx = W / 2, cy = H / 2, bw = 200;
      const pos = { dim_fecha: [cx - 340, cy - 150], dim_producto: [cx + 340, cy - 150], dim_cliente: [cx - 340, cy + 110], dim_tienda: [cx + 340, cy + 110] };
      const tbox = (x, y, name, cols, hl, kind) => {
        const h = 36 + cols.length * 24;
        const g = s.append('g').attr('transform', `translate(${x - bw / 2},${y - h / 2})`).style('cursor', 'pointer');
        g.append('rect').attr('width', bw).attr('height', h).attr('rx', 12).attr('fill', p.surface).attr('stroke', hl ? p.blue : p.line).attr('stroke-width', hl ? 4 : 2);
        g.append('rect').attr('width', bw).attr('height', 32).attr('rx', 12).attr('fill', kind === 'fact' ? p.blue : p.gray);
        g.append('text').text(name).attr('x', 12).attr('y', 22).attr('fill', '#fff').attr('font-weight', 700).attr('font-size', 15);
        cols.forEach((c, i) => g.append('text').text(c).attr('x', 12).attr('y', 52 + i * 24).attr('font-family', 'IBM Plex Mono').attr('font-size', 13).attr('fill', /PK|FK/.test(c) ? p.blueD : p.ink));
        return g;
      };
      Object.entries(pos).forEach(([d, [x, y]]) => s.append('line').attr('x1', cx).attr('y1', cy).attr('x2', x).attr('y2', y).attr('stroke', selD === d ? p.blue : p.mid).attr('stroke-width', selD === d ? 4 : 2.5));
      tbox(cx, cy, 'fact_ventas', fact, false, 'fact');
      Object.entries(pos).forEach(([d, [x, y]]) => {
        let cols = dims[d];
        if (snow && d === 'dim_producto') cols = ['producto_key PK', 'producto', 'subcategoria_key FK'];
        tbox(x, y, d, cols, selD === d).on('click', () => { selD = d; draw(); out.innerHTML = { dim_fecha: 'Fecha: mes, trimestre, año, día de la semana… todo precalculado para agrupar sin funciones.', dim_producto: snow ? 'Copo de nieve: producto → subcategoría → categoría en tablas separadas. Más joins.' : 'Producto con su subcategoría y categoría <b>en columnas</b> (desnormalizado).', dim_cliente: 'Cliente con ciudad y segmento. Clave subrogada cliente_key ≠ cliente_id del origen.', dim_tienda: 'Canal y país de venta.' }[d]; });
      });
      if (snow) {
        const [x, y] = pos.dim_producto;
        [['dim_subcategoria', ['subcategoria_key PK', 'subcategoria', 'categoria_key FK'], y + 10], ['dim_categoria', ['categoria_key PK', 'categoria'], y + 140]].forEach(([n, c, yy], i) => { s.append('line').attr('x1', x).attr('y1', y + 40).attr('x2', x - 30).attr('y2', yy - 20).attr('stroke', p.amber).attr('stroke-width', 2.5); tbox(x - 30 - (i ? 0 : 0), yy + (i ? 20 : 120), n, c, false); });
      }
    };
    bindSeg(el, 'm', (m) => { snow = m === 'Copo de nieve'; draw(); out.innerHTML = snow ? 'Copo de nieve: dimensiones <b>normalizadas</b>. Más joins; solo con motivos concretos.' : 'Estrella: cada dimensión es <b>una tabla</b> desnormalizada. Más simple y rápida: la opción recomendada.'; });
    draw(); out.innerHTML = 'Haz clic en una dimensión.';
  },

  // ---------- SCD ----------
  scd(el) {
    const p = pal();
    const ventas = [['2025-03-10', 120], ['2025-05-20', 80], ['2025-09-02', 150], ['2025-12-01', 90], ['2026-02-15', 200]];
    const moves = [['2025-07-01', 'Toledo'], ['2026-02-01', 'Valencia']];
    let type = '2', applied = 0;
    el.innerHTML = `<div class="w-title">dim_cliente de Ana Ruiz<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${segBtns(['0', '1', '2', '3'], type, 't')}<span>tipo SCD</span><button class="btn primary mv">Aplicar siguiente mudanza</button><button class="btn rst">↺</button></div>
      <div style="display:flex;gap:18px;flex:1;min-height:0"><div class="tb" style="flex:1.4;overflow:auto"></div><div class="w-canvas" style="flex:1"></div></div><div class="w-out"></div>`;
    const tb = el.querySelector('.tb'), out = el.querySelector('.w-out');
    const c = chart(el.querySelector('.w-canvas'), { type: 'bar', data: { labels: [], datasets: [{ data: [], backgroundColor: [p.blue, p.gray, p.blueL], borderRadius: 8 }] }, options: { plugins: { legend: { display: false }, title: { display: true, text: 'Ventas de Ana (640 €) atribuidas por ciudad' } }, scales: { y: { beginAtZero: true } } } });
    const render = () => {
      let rows, cityOf;
      const done = moves.slice(0, applied);
      if (type === '0') { rows = [[1001, 1, 'Ana Ruiz', 'Madrid']]; cityOf = () => 'Madrid'; tb.innerHTML = tbl(['cliente_key', 'cliente_id', 'nombre', 'ciudad'], rows); }
      if (type === '1') { const cur = done.length ? done.at(-1)[1] : 'Madrid'; rows = [[1001, 1, 'Ana Ruiz', cur]]; cityOf = () => cur; tb.innerHTML = tbl(['cliente_key', 'cliente_id', 'nombre', 'ciudad'], rows, (i, j) => (j === 3 && done.length ? 'hl' : '')); }
      if (type === '2') {
        const vs = [['Madrid', '2024-03-12']].concat(done.map(([f, ci]) => [ci, f]));
        rows = vs.map(([ci, f], i) => [[1001, 1734, 2210][i], 1, 'Ana Ruiz', ci, f, vs[i + 1] ? new Date(new Date(vs[i + 1][1]) - 864e5).toISOString().slice(0, 10) : '9999-12-31', vs[i + 1] ? 'false' : 'true']);
        cityOf = (d) => vs.filter(([, f]) => f <= d).at(-1)[0];
        tb.innerHTML = tbl(['key', 'id', 'nombre', 'ciudad', 'valido_desde', 'valido_hasta', 'es_actual'], rows, (i) => (i === rows.length - 1 && done.length ? 'hl' : ''));
      }
      if (type === '3') { const cur = done.length ? done.at(-1)[1] : 'Madrid', prev = done.length > 1 ? done.at(-2)[1] : done.length ? 'Madrid' : null; rows = [[1001, 1, 'Ana Ruiz', cur, prev]]; cityOf = () => cur; tb.innerHTML = tbl(['cliente_key', 'cliente_id', 'nombre', 'ciudad', 'ciudad_anterior'], rows); }
      const agg = d3.rollups(ventas, (v) => d3.sum(v, (x) => x[1]), (x) => cityOf(x[0]));
      c.data.labels = agg.map((x) => x[0]); c.data.datasets[0].data = agg.map((x) => x[1]); c.update();
      out.innerHTML = { 0: 'Tipo 0: el valor original nunca cambia (útil para la fecha de alta).', 1: 'Tipo 1: se <b>sobrescribe</b>. Sin historia: todas las ventas antiguas pasan a la ciudad nueva.', 2: 'Tipo 2: una <b>fila nueva por versión</b> con fechas de validez. Cada venta queda con la versión vigente en su momento. El más usado (MERGE en Databricks o Snowflake).', 3: 'Tipo 3: una <b>columna</b> con el valor anterior. Historia limitada a un cambio.' }[type] + (applied < 2 ? ` Siguiente: se muda a ${moves[applied][1]} el ${moves[applied][0]}.` : '');
    };
    bindSeg(el, 't', (t) => { type = t; render(); });
    el.querySelector('.mv').onclick = () => { applied = Math.min(2, applied + 1); render(); };
    el.querySelector('.rst').onclick = () => { applied = 0; render(); };
    render();
    return () => c.destroy();
  },

  lake(el) {
    const p = pal();
    const files = [['ventas_2026_01.csv', 'csv'], ['clicks.json', 'json'], ['logs_web.gz', 'log'], ['facturas.pdf', 'pdf'], ['producto_5.jpg', 'img'], ['crm_export.parquet', 'parquet'], ['llamadas.mp3', 'audio'], ['ventas_final_v2_BUENO.csv', 'csv'], ['tmp_ana.xlsx', 'xlsx']];
    let gov = true;
    el.innerHTML = `<div class="w-title">Un data lake sobre almacenamiento de objetos<span class="live">INTERACTIVO</span></div><div class="w-controls"><label><input type="checkbox" class="g" checked> Gobierno: catálogo, propietarios, calidad</label></div><div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const icon = { csv: '📄', json: '🧾', log: '📜', pdf: '📕', img: '🖼', parquet: '🧱', audio: '🎧', xlsx: '📊' };
    const draw = () => {
      if (gov) {
        const zones = [['raw · bruta', files.slice(0, 5)], ['clean · limpia', [['ventas.parquet', 'parquet'], ['clientes.parquet', 'parquet'], ['clicks.parquet', 'parquet']]], ['refined · refinada', [['ventas_por_mes', 'parquet'], ['features_clientes', 'parquet']]]];
        cv.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;height:100%">${zones.map(([z, fs], i) => `<div class="card" style="background:${['#E8F1F4', 'var(--tint-blue)', 'var(--tint-blue)'][i]}"><h4>${z}</h4>${fs.map(([f, t]) => `<div style="margin-top:8px;font-family:var(--font-mono);font-size:14px;color:var(--ink)">${icon[t]} ${f} <span class="pill gray" style="font-size:11px">owner ✔ · esquema ✔</span></div>`).join('')}</div>`).join('')}</div>`;
        out.innerHTML = 'Con <b>catálogo y gobierno</b>: se sabe qué es cada fichero, de dónde viene, quién es su dueño y si es fiable.';
      } else {
        cv.innerHTML = `<div style="position:relative;height:100%;background:linear-gradient(180deg,#8a9a7b33,#4e5a4433);border-radius:16px">${files.concat(files.slice(0, 6)).map(([f, t], i) => `<div style="position:absolute;left:${(i * 37) % 85}%;top:${(i * 53) % 80}%;transform:rotate(${(i % 5) * 7 - 14}deg);font-family:var(--font-mono);font-size:14px;opacity:.8">${icon[t]} ${f.replace('.', i > 8 ? '_copia.' : '.')}</div>`).join('')}</div>`;
        out.innerHTML = '<span style="color:var(--red)">🐊 <b>Data swamp</b>: ficheros duplicados, sin dueño ni esquema, «ventas_final_v2_BUENO.csv»… Nadie sabe qué es fiable.</span>';
      }
    };
    el.querySelector('.g').onchange = (e) => { gov = e.target.checked; draw(); };
    draw();
  },

  dwlake(el) {
    const p = pal();
    const { cv } = frame(el, { title: 'Perfil comparado (orientativo, 1–5)', live: true, out: false });
    const c = chart(cv, { type: 'radar', data: { labels: ['Calidad del dato', 'Rendimiento SQL', 'Variedad de datos', 'Coste bajo por TB', 'Flexibilidad', 'Gobierno'], datasets: [
      { label: 'Data warehouse', data: [5, 5, 2, 2, 2, 5], borderColor: p.blue, backgroundColor: p.blue + '33', borderWidth: 3, pointRadius: 5 }, { label: 'Data lake', data: [2, 2.5, 5, 5, 5, 1.5], borderColor: p.gray, backgroundColor: p.gray + '33', borderWidth: 3, pointRadius: 5 }] },
      options: { scales: { r: { min: 0, max: 5, ticks: { display: false }, pointLabels: { font: { size: 15, weight: 600 }, color: p.ink } } }, plugins: { legend: { position: 'bottom' } } } });
    return () => c.destroy();
  },

  etlelt(el) {
    const life = widgetScope(el);
    const p = pal();
    let m = 'ELT';
    el.innerHTML = `<div class="w-title">¿Dónde se transforma?<span class="live">INTERACTIVO</span></div><div class="w-controls">${segBtns(['ETL', 'ELT'], m, 'm')}<button class="btn primary go">▶ Ejecutar carga</button><label><input type="checkbox" class="cdc"> CDC (leer el WAL)</label></div><div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = (step = -1) => {
      const cdc = el.querySelector('.cdc').checked;
      const boxes = m === 'ETL' ? [['Fuentes', cdc ? 'WAL / binlog' : 'consultas'], ['Servidor ETL', 'T: limpiar, unificar'], ['Data warehouse', 'solo datos ya transformados']] : [['Fuentes', cdc ? 'WAL / binlog' : 'consultas'], ['Data warehouse · raw', 'L: datos en bruto'], ['Data warehouse · modelos', 'T: SQL con dbt']];
      const lab = m === 'ETL' ? ['E', 'T', 'L'] : ['E', 'L', 'T'];
      cv.innerHTML = `<div style="display:flex;align-items:center;gap:14px;height:100%">${boxes.map(([t, d], i) => `<div class="card ${i <= step ? 'hl' : ''}" style="flex:1;text-align:center;transition:.3s"><div style="font-family:Karla;font-weight:700;font-size:54px;color:var(--blue)">${lab[i]}</div><h4>${t}</h4><p>${d}</p></div>${i < 2 ? '<div style="font-size:34px;color:var(--blue)">→</div>' : ''}`).join('')}</div>`;
    };
    bindSeg(el, 'm', (x) => { m = x; draw(); out.innerHTML = ''; });
    el.querySelector('.cdc').onchange = () => draw();
    el.querySelector('.go').onclick = async () => { for (let i = 0; i < 3; i++) { draw(i); if (!(await life.sleep(700))) return; }
      out.innerHTML = m === 'ETL' ? 'ETL: el destino solo recibe datos transformados. Si una regla estaba mal, hay que <b>volver a extraer</b>.' : 'ELT: los datos en bruto quedan en el almacén; corregir o crear transformaciones es <b>volver a ejecutar SQL</b>, sin tocar las fuentes.'; };
    draw();
  },

  // ---------- filas frente a columnas ----------
  rowcol(el) {
    const p = pal();
    const cols = ['id', 'fecha', 'cliente', 'ciudad', 'producto', 'cantidad', 'importe', 'estado'];
    const rows = d3.range(8).map((i) => [101 + i, `01-0${(i % 8) + 1}`, 'C' + (i % 4 + 1), ['Madrid', 'Sevilla', 'Bilbao', 'Madrid'][i % 4], 'P' + (i % 5 + 1), 1 + (i % 3), (20 + i * 13).toFixed(0), i % 3 ? 'ok' : 'env']);
    const Q = { 'SUM(importe)': [6], 'importe y ciudad': [3, 6], 'Pedido 104 completo': 'row', 'SELECT *': 'all' };
    let lay = 'Por filas', q = 'SUM(importe)';
    el.innerHTML = `<div class="w-title">Bloques en disco<span class="live">INTERACTIVO</span></div><div class="w-controls">${segBtns(['Por filas', 'Por columnas'], lay, 'l')}<span>Consulta:</span>${segBtns(Object.keys(Q), q, 'q')}</div>
      <div class="w-canvas" style="display:flex;flex-direction:column;gap:8px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      const need = (r, c) => { const s = Q[q]; return s === 'all' || (s === 'row' ? r === 3 : s.includes(c)); };
      const blocks = lay === 'Por filas' ? rows.map((r, i) => r.map((v, j) => [v, i, j])) : cols.map((c, j) => rows.map((r, i) => [r[j], i, j]));
      let read = 0;
      cv.innerHTML = blocks.map((b, bi) => { const used = b.some(([, i, j]) => need(i, j)); if (used) read++;
        return `<div style="display:flex;gap:6px;align-items:center"><span style="width:96px;font-size:13px;color:var(--muted)">bloque ${bi + 1}${lay === 'Por columnas' ? ` (${cols[bi]})` : ''}</span><div style="display:flex;gap:2px;flex:1;padding:3px;border-radius:8px;border:2px solid ${used ? p.blue : 'transparent'};background:${used ? 'var(--tint-blue)' : 'transparent'}">${b.map(([v, i, j]) => `<span style="flex:1;text-align:center;font-family:var(--font-mono);font-size:13px;padding:4px 0;border-radius:4px;background:${need(i, j) ? p.blue : used ? p.blueL + '66' : 'var(--surface-2)'};color:${need(i, j) ? '#fff' : 'var(--ink)'}">${v}</span>`).join('')}</div></div>`; }).join('');
      out.innerHTML = `Bloques leídos: <b>${read} de ${blocks.length}</b>. ${lay === 'Por columnas' && Array.isArray(Q[q]) ? 'El formato columnar lee solo las columnas necesarias: ideal para <b>OLAP</b>.' : lay === 'Por filas' && Q[q] === 'row' ? 'Por filas, un pedido completo es <b>un bloque</b>: ideal para <b>OLTP</b>.' : lay === 'Por filas' ? 'Por filas hay que leer todos los bloques aunque solo interese una columna.' : 'Para reconstruir una fila completa, el formato columnar tiene que tocar todos los bloques.'}`;
    };
    bindSeg(el, 'l', (x) => { lay = x; draw(); }); bindSeg(el, 'q', (x) => { q = x; draw(); });
    draw();
  },

  rle(el) {
    const p = pal();
    el.innerHTML = `<div class="w-title">Columna ciudad<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><button class="btn srt">Ordenar</button><button class="btn shf">Desordenar</button><button class="btn big">×1000 filas</button></div>
      <textarea class="col" spellcheck="false" style="height:90px;font-family:var(--font-mono);font-size:15px;padding:10px;border-radius:12px;border:1px solid var(--line);background:var(--code-bg);color:var(--ink);resize:none">Madrid, Madrid, Sevilla, Madrid, Bilbao, Sevilla, Madrid, Madrid, Valencia, Madrid, Sevilla, Sevilla</textarea>
      <div class="w-canvas" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px;overflow:auto"></div><div class="w-out"></div>`;
    const ta = el.querySelector('.col'), cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    let mult = 1;
    const calc = () => {
      const vals = ta.value.split(',').map((x) => x.trim()).filter(Boolean);
      const dict = [...new Set(vals)]; const codes = vals.map((v) => dict.indexOf(v));
      const runs = []; codes.forEach((c) => { if (runs.length && runs.at(-1)[0] === c) runs.at(-1)[1]++; else runs.push([c, 1]); });
      const orig = d3.sum(vals, (v) => v.length + 1) * mult, bits = Math.max(1, Math.ceil(Math.log2(dict.length)));
      const dictB = d3.sum(dict, (v) => v.length + 1), codesB = Math.ceil(vals.length * bits / 8) * mult, rleB = runs.length * (1 + 4) * (mult > 1 ? 1 : 1);
      const best = dictB + Math.min(codesB, rleB);
      cv.innerHTML = `<div class="card"><h4>Diccionario (${bits} bit/valor)</h4><p class="mono" style="font-size:14px;color:var(--ink)">${dict.map((d, i) => `${i} → ${esc(d)}`).join('<br>')}</p><p class="mono" style="margin-top:8px;font-size:14px;color:var(--ink)">${codes.join(' ')}</p></div>
        <div class="card hl"><h4>RLE sobre los códigos</h4><p class="mono" style="font-size:15px;color:var(--ink)">${runs.map(([c, n]) => `${c}×${n * mult}`).join(' · ')}</p><p style="margin-top:8px">${runs.length} tramos</p></div>`;
      out.innerHTML = `Original ≈ <b>${orig.toLocaleString('es-ES')} B</b> · comprimido ≈ <b>${best.toLocaleString('es-ES')} B</b> → razón de compresión <b>${(orig / best).toFixed(1)}</b>. ${runs.length <= dict.length ? 'Ordenada, RLE brilla: un tramo por valor.' : 'Desordenada hay muchos tramos: ordena la columna.'}`;
    };
    ta.addEventListener('input', calc); ta.addEventListener('keydown', (e) => e.stopPropagation());
    el.querySelector('.srt').onclick = () => { ta.value = ta.value.split(',').map((x) => x.trim()).filter(Boolean).sort().join(', '); calc(); };
    el.querySelector('.shf').onclick = () => { ta.value = d3.shuffle(ta.value.split(',').map((x) => x.trim()).filter(Boolean)).join(', '); calc(); };
    el.querySelector('.big').onclick = (e) => { mult = mult === 1 ? 1000 : 1; e.target.classList.toggle('on', mult > 1); calc(); };
    calc();
  },

  formats(el) {
    const p = pal();
    const D = { CSV: [52.07, 0.0618], 'JSON (líneas)': [153.64, 14.55], 'Avro (deflate)': [18.05, 3.167], 'ORC (zstd)': [12.24, 0.0118], 'Parquet (snappy)': [11.63, 0.0319], 'Parquet (zstd)': [8.51, 0.0125] };
    const { cv, ctl, out } = frame(el, { title: '1.000.000 de ventas, 8 columnas', live: true, controls: segBtns(['Tamaño (MB)', 'Leer y sumar una columna (s)'], 'Tamaño (MB)', 'm') });
    const ks = Object.keys(D);
    const c = chart(cv, { type: 'bar', data: { labels: ks, datasets: [{ data: [], backgroundColor: ks.map((k) => (k.startsWith('Parquet') ? p.blue : k.startsWith('ORC') ? p.blueM : k.startsWith('Avro') ? p.blueL : p.gray)), borderRadius: 8 }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { type: 'linear', beginAtZero: true } } } });
    const show = (m) => { const i = m.startsWith('Tam') ? 0 : 1; c.data.datasets[0].data = ks.map((k) => D[k][i]); c.options.scales.x = i ? { type: 'logarithmic', ticks: { callback: (v) => ([0.01, 0.1, 1, 10].includes(+v) ? v + ' s' : '') } } : { type: 'linear', beginAtZero: true, title: { display: true, text: 'MB' } }; c.update();
      out.innerHTML = i ? 'Leer y sumar una columna: Parquet y ORC leen <b>solo esa columna</b> (~5× más rápido que CSV); JSON tiene que analizar todo el texto (escala log).' : 'Parquet (zstd) <b>8,5 MB</b> frente a CSV 52,1 MB (razón 6,1) y JSON 153,6 MB (razón 18).'; };
    bindSeg(el, 'm', show); show('Tamaño (MB)');
    return () => c.destroy();
  },

  parquet(el) {
    const p = pal();
    const RG = [['2025-11-01', '2025-11-30'], ['2025-12-01', '2025-12-31'], ['2026-01-01', '2026-01-31'], ['2026-02-01', '2026-02-28']];
    const COLS = ['venta_id', 'fecha', 'cliente_id', 'ciudad', 'importe'];
    el.innerHTML = `<div class="w-title">ventas.parquet<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><span class="mono">SELECT SUM(importe) WHERE fecha &gt;=</span><input type="range" min="0" max="3" value="1" class="f"><b class="fv mono"></b></div>
      <div class="w-canvas" style="display:flex;flex-direction:column;gap:8px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      const f = +el.querySelector('.f').value, from = RG[f][0]; el.querySelector('.fv').textContent = `'${from}'`;
      let read = 0;
      cv.innerHTML = RG.map(([mn, mx], i) => { const skip = mx < from; if (!skip) read++;
        return `<div style="display:flex;gap:10px;align-items:center;opacity:${skip ? 0.4 : 1}"><div style="width:130px;font-family:Karla;font-weight:700">Row group ${i + 1}${skip ? ' ⏭' : ''}</div><div style="flex:1;display:flex;gap:4px">${COLS.map((c) => { const use = !skip && (c === 'importe' || c === 'fecha'); return `<div style="flex:1;padding:10px 6px;border-radius:8px;text-align:center;font-family:var(--font-mono);font-size:13px;background:${use ? p.blue : 'var(--surface-2)'};color:${use ? '#fff' : 'var(--muted)'};${skip ? 'text-decoration:line-through' : ''}">${c}</div>`; }).join('')}</div></div>`; }).join('') +
        `<div class="card" style="margin-top:6px;padding:10px 14px"><h4 style="font-size:17px">Footer: esquema + estadísticas por row group</h4><p class="mono" style="font-size:13px;color:var(--ink)">${RG.map(([mn, mx], i) => `RG${i + 1}.fecha: min=${mn} max=${mx}`).join('<br>')}</p></div>`;
      out.innerHTML = `Se leen <b>${read} de 4</b> row groups y solo <b>2 de 5</b> columnas (fecha para filtrar, importe para sumar): las estadísticas del footer permiten <b>saltarse</b> los grupos cuyo máximo es anterior al filtro.`;
    };
    el.querySelector('.f').oninput = draw; draw();
  },

  // ---------- Snowflake ----------
  snowarch(el) {
    const p = pal();
    const MP = d3.range(12).map((i) => { const d = new Date(2025, 10, 1 + i * 10); const e = new Date(2025, 10, 10 + i * 10); return [d.toISOString().slice(0, 10), e.toISOString().slice(0, 10)]; });
    el.innerHTML = `<div class="w-title">Tres capas<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><span class="mono">WHERE fecha BETWEEN</span><input type="date" class="a" value="2026-01-01"><span class="mono">AND</span><input type="date" class="b" value="2026-01-20"></div>
      <div class="w-canvas" style="display:flex;flex-direction:column;gap:10px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      const a = el.querySelector('.a').value, b = el.querySelector('.b').value; let n = 0;
      cv.innerHTML = `<div class="card" style="padding:10px 16px;background:var(--tint-gray)"><h4 style="font-size:18px">☁️ Servicios en la nube</h4><p>autenticación · metadatos (min/max de cada micro-partición) · optimizador · transacciones</p></div>
        <div style="display:flex;gap:10px">${[['wh_etl', 'L', 'carga nocturna'], ['wh_bi', 'M', 'cuadros de mando'], ['wh_ds', 'XL', 'ciencia de datos']].map(([n2, s, d]) => `<div class="card hl" style="flex:1;padding:10px 14px"><h4 style="font-size:17px">⚙️ ${n2} · ${s}</h4><p>${d}</p></div>`).join('')}</div>
        <div class="card" style="padding:10px 14px"><h4 style="font-size:18px">🗄 Almacenamiento: micro-particiones de la tabla ventas</h4><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:6px">${MP.map(([mn, mx]) => { const hit = !(mx < a || mn > b); if (hit) n++;
          return `<div style="padding:6px;border-radius:8px;font-family:var(--font-mono);font-size:11.5px;text-align:center;background:${hit ? p.blue : 'var(--surface-2)'};color:${hit ? '#fff' : 'var(--muted)'}">${mn.slice(5)}<br>${mx.slice(5)}</div>`; }).join('')}</div></div>`;
      out.innerHTML = `Pruning: se leen <b>${n} de ${MP.length}</b> micro-particiones; el resto se descarta por sus rangos sin abrirlas. Los tres warehouses leen los <b>mismos datos</b> sin estorbarse.`;
    };
    el.querySelectorAll('input').forEach((i) => { i.oninput = draw; i.addEventListener('keydown', (e) => e.stopPropagation()); });
    draw();
  },

  credits(el) {
    const p = pal();
    const S = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];
    const { cv, ctl, out } = frame(el, { title: 'Calculadora de créditos', live: true,
      controls: `<label>Talla <select class="s">${S.map((x, i) => `<option value="${i}" ${i === 2 ? 'selected' : ''}>${x} (${2 ** i} cr/h)</option>`).join('')}</select></label><label>Min/día encendido <input type="range" min="1" max="1440" value="15" class="m"><b class="mv"></b></label><label>Días <input type="number" class="d" value="30" style="width:70px"></label><label>$/crédito <input type="number" class="pr" value="3" step="0.5" style="width:70px"></label>` });
    cv.innerHTML = '<div style="display:flex;gap:16px;height:100%"><div class="ch" style="flex:1.3;position:relative"></div><div class="kp" style="flex:1;display:flex;flex-direction:column;gap:12px"></div></div>';
    const c = chart(cv.querySelector('.ch'), { type: 'bar', data: { labels: S, datasets: [{ data: S.map((_, i) => 2 ** i), backgroundColor: S.map(() => p.blueL), borderRadius: 6 }] }, options: { plugins: { legend: { display: false }, title: { display: true, text: 'Créditos por hora según la talla (escala log)' } }, scales: { y: { type: 'logarithmic', ticks: { callback: (v) => ([1, 4, 16, 64, 256, 512].includes(+v) ? v : '') } } } } });
    const upd = () => {
      const i = +ctl.querySelector('.s').value, m = +ctl.querySelector('.m').value, d = +ctl.querySelector('.d').value || 0, pr = +ctl.querySelector('.pr').value || 0;
      ctl.querySelector('.mv').textContent = m < 60 ? `${m} min` : `${(m / 60).toFixed(1)} h`;
      const cr = 2 ** i * (m / 60) * d; c.data.datasets[0].backgroundColor = S.map((_, j) => (j === i ? p.blue : p.blueL)); c.update('none');
      cv.querySelector('.kp').innerHTML = `<div class="card hl"><h4>Créditos al mes</h4><div class="big">${cr.toLocaleString('es-ES', { maximumFractionDigits: 1 })}</div><p>${2 ** i} cr/h × ${(m / 60).toFixed(2)} h × ${d} días</p></div><div class="card"><h4>Coste estimado</h4><div class="big">${(cr * pr).toLocaleString('es-ES', { maximumFractionDigits: 0 })} $</div><p>+ almacenamiento</p></div>`;
      out.innerHTML = 'Ejemplo del temario: MEDIUM (4 cr/h) 15 min/día × 30 días = <b>30 créditos</b> ≈ 60–120 $ (crédito entre 2 y 4 $ bajo demanda, según edición, nube y región).';
    };
    ctl.addEventListener('keydown', (e) => e.stopPropagation()); ctl.oninput = upd; upd();
    return () => c.destroy();
  },

  copyinto(el) {
    const life = widgetScope(el);
    const p = pal();
    let stage = ['ventas_2026_01.csv', 'ventas_2026_02.csv'], loaded = new Set(), rows = 0, pipe = false, nxt = 3;
    el.innerHTML = `<div class="w-title">@stage_ventas → tabla ventas<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><button class="btn put">PUT nuevo fichero</button><button class="btn primary cp">COPY INTO ventas</button><label><input type="checkbox" class="pp"> Snowpipe (AUTO_INGEST)</label></div>
      <div class="w-canvas" style="display:flex;gap:16px;align-items:stretch"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => { cv.innerHTML = `<div class="card" style="flex:1"><h4>📁 @stage_ventas</h4>${stage.map((f) => `<div class="mono" style="margin-top:8px;font-size:15px;color:var(--ink)">${f} ${loaded.has(f) ? '<span class="pill">cargado ✔</span>' : '<span class="pill gray">nuevo</span>'}</div>`).join('')}</div><div style="align-self:center;font-size:40px;color:var(--blue)">→</div><div class="card hl" style="flex:1"><h4>🧊 ventas</h4><div class="big">${rows.toLocaleString('es-ES')}</div><p>filas</p></div>`; };
    const copy = () => { const nuevos = stage.filter((f) => !loaded.has(f)); nuevos.forEach((f) => { loaded.add(f); rows += 25000; }); draw(); return nuevos; };
    el.querySelector('.cp').onclick = () => { const n = copy(); out.innerHTML = n.length ? `✔ Cargados ${n.length} fichero(s): ${n.join(', ')}.` : 'COPY INTO no carga nada: <b>recuerda los ficheros ya cargados</b> y no los duplica.'; };
    el.querySelector('.put').onclick = async () => { const f = `ventas_2026_${String(nxt++).padStart(2, '0')}.csv`; stage.push(f); draw(); out.innerHTML = `PUT ${f} @stage_ventas`;
      if (pipe) { out.innerHTML += ' · 📨 el bucket avisa a Snowpipe…'; if (!(await life.sleep(1200))) return; copy(); out.innerHTML = `✔ Snowpipe cargó ${f} automáticamente (en minutos, cómputo serverless).`; } };
    el.querySelector('.pp').onchange = (e) => (pipe = e.target.checked);
    draw();
  },

  timetravel(el) {
    const p = pal();
    const ev = [[0, 'Tabla creada con 3 ventas', [[1, 'Madrid', 120], [2, 'Sevilla', 80], [3, 'Bilbao', 150]]], [20, 'INSERT venta 4', [[1, 'Madrid', 120], [2, 'Sevilla', 80], [3, 'Bilbao', 150], [4, 'Madrid', 95]]],
      [45, 'UPDATE importe de la venta 2', [[1, 'Madrid', 120], [2, 'Sevilla', 88], [3, 'Bilbao', 150], [4, 'Madrid', 95]]], [70, '💥 DELETE FROM ventas (¡sin WHERE!)', []]];
    let dropped = false, clone = null;
    el.innerHTML = `<div class="w-title">Tabla ventas · últimos 90 minutos<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><span class="mono">SELECT * FROM ventas AT (OFFSET =&gt; -60 *</span><input type="range" min="0" max="90" value="0" class="o" style="width:260px"><b class="ov mono"></b><span class="mono">)</span>
        <button class="btn dr">DROP TABLE</button><button class="btn und">UNDROP TABLE</button><button class="btn primary cl">CREATE TABLE ventas_ayer CLONE ventas AT (…)</button></div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div class="tb" style="flex:1"></div><div class="w-canvas" style="flex:1.2"></div></div><div class="w-out"></div>`;
    const tb = el.querySelector('.tb'), cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      const off = +el.querySelector('.o').value, t = 90 - off; el.querySelector('.ov').textContent = off;
      const e = ev.filter((x) => x[0] <= t).at(-1);
      tb.innerHTML = dropped ? '<div class="card" style="border-color:var(--red);background:var(--tint-red)"><h4>✖ La tabla ventas no existe</h4><p>Prueba UNDROP TABLE.</p></div>' : `<div style="font-family:Karla;font-weight:700;margin-bottom:6px">Estado hace ${off} min: ${e[1]}</div>` + tbl(['id', 'ciudad', 'importe'], e[2].length ? e[2] : [['—', '(vacía)', '—']]) + (clone ? `<div style="font-family:Karla;font-weight:700;margin:12px 0 6px">ventas_ayer (CLONE)</div>${tbl(['id', 'ciudad', 'importe'], clone)}` : '');
      cv.innerHTML = ''; const { s, W, H } = svg(cv);
      const x = d3.scaleLinear().domain([0, 90]).range([30, W - 30]);
      s.append('line').attr('x1', x(0)).attr('x2', x(90)).attr('y1', 80).attr('y2', 80).attr('stroke', p.line).attr('stroke-width', 6);
      ev.forEach(([tt, d]) => { s.append('circle').attr('cx', x(tt)).attr('cy', 80).attr('r', 9).attr('fill', tt === 70 ? p.red : p.blue); s.append('text').text(d.replace('(¡sin WHERE!)', '')).attr('x', x(tt)).attr('y', tt % 40 ? 120 : 52).attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', p.ink); });
      s.append('line').attr('x1', x(t)).attr('x2', x(t)).attr('y1', 50).attr('y2', 110).attr('stroke', p.amber).attr('stroke-width', 4);
      s.append('text').text('ahora').attr('x', x(90)).attr('y', 30).attr('text-anchor', 'end').attr('font-size', 13).attr('fill', p.muted);
      // retención
      const y2 = 170; [['Time Travel: 1 día (Standard) · hasta 90 días (Enterprise)', p.blue, 0, 0.7], ['Fail-safe: 7 días, solo Snowflake', p.gray, 0.7, 0.92], ['purgado', p.line, 0.92, 1]].forEach(([t2, c, a, b]) => { s.append('rect').attr('x', 30 + a * (W - 60)).attr('y', y2).attr('width', (b - a) * (W - 60)).attr('height', 34).attr('fill', c).attr('opacity', 0.85); s.append('text').text(t2).attr('x', 36 + a * (W - 60)).attr('y', y2 + 22).attr('font-size', 12.5).attr('fill', '#fff').attr('font-weight', 700); });
      s.append('text').text('hacia atrás →').attr('x', 30).attr('y', y2 - 8).attr('font-size', 12).attr('fill', p.muted);
      out.innerHTML = off === 0 && !dropped ? 'Ahora la tabla está vacía por el DELETE erróneo. Mueve el deslizador hacia atrás.' : off >= 20 && !dropped ? '✔ Los datos de antes del DELETE siguen ahí. También <code>BEFORE (STATEMENT =&gt; \'id\')</code>.' : '';
    };
    el.querySelector('.o').oninput = draw;
    el.querySelector('.dr').onclick = () => { dropped = true; draw(); out.innerHTML = 'DROP TABLE ventas…'; };
    el.querySelector('.und').onclick = () => { dropped = false; draw(); out.innerHTML = '✔ UNDROP TABLE: recuperada al instante.'; };
    el.querySelector('.cl').onclick = () => { const off = +el.querySelector('.o').value; const e = ev.filter((x) => x[0] <= 90 - off).at(-1); clone = e[2].map((r) => r.slice()); draw(); out.innerHTML = `✔ Clon <b>sin copiar datos</b>: apunta a las mismas micro-particiones (estado de hace ${off} min). Solo al modificar uno de los dos se escriben particiones nuevas.`; };
    draw();
  },

  snowroles(el) {
    const p = pal();
    const data = { n: 'ORGADMIN', d: 'Gestiona la organización y sus cuentas', c: [{ n: 'ACCOUNTADMIN', d: 'Máximo nivel en la cuenta. A muy pocas personas.', c: [{ n: 'SECURITYADMIN', d: 'Gestiona concesiones de privilegios y roles', c: [{ n: 'USERADMIN', d: 'Crea usuarios y roles', c: [] }] }, { n: 'SYSADMIN', d: 'Crea warehouses, bases de datos y objetos. Los roles propios cuelgan de él.', c: [{ n: 'analista', d: 'Rol propio: USAGE en wh_bi, mercado y el esquema ventas; SELECT en sus tablas (y futuras).', c: [{ n: 'PUBLIC', d: 'Rol que tienen todos los usuarios', c: [] }] }, { n: 'data_engineer', d: 'Rol propio: crea y carga tablas en su esquema.', c: [] }] }] }] };
    const { cv, out } = frame(el, { title: 'Jerarquía de roles', live: true });
    const { s, W, H } = svg(cv);
    const root = d3.hierarchy(data, (d) => d.c); d3.tree().size([W - 140, H - 70])(root);
    s.append('g').selectAll('path').data(root.links()).join('path').attr('d', d3.linkVertical().x((d) => d.x + 70).y((d) => d.y + 30)).attr('fill', 'none').attr('stroke', p.mid).attr('stroke-width', 2);
    const g = s.append('g').selectAll('g').data(root.descendants()).join('g').attr('transform', (d) => `translate(${d.x + 70},${d.y + 30})`).style('cursor', 'pointer');
    g.append('rect').attr('x', -72).attr('y', -18).attr('width', 144).attr('height', 36).attr('rx', 18).attr('fill', (d) => (/^[a-z]/.test(d.data.n) ? p.blue : p.surface)).attr('stroke', p.blueD).attr('stroke-width', 2);
    g.append('text').text((d) => d.data.n).attr('text-anchor', 'middle').attr('dy', 5).attr('font-size', 13).attr('font-weight', 700).attr('fill', (d) => (/^[a-z]/.test(d.data.n) ? '#fff' : p.ink));
    g.on('click mouseenter', (e, d) => { g.select('rect').attr('stroke-width', (x) => (x === d ? 5 : 2)); out.innerHTML = `<b>${d.data.n}</b>: ${d.data.d}`; });
    out.innerHTML = 'Los roles superiores <b>heredan</b> los privilegios de los que cuelgan de ellos.';
  },

  // ---------- BigQuery ----------
  bqcost(el) {
    const p = pal();
    const COLS = ['venta_id', 'fecha', 'ciudad', 'producto_id', 'importe', 'cliente_id', 'canal', 'cupon', 'pais', 'region', 'tienda', 'vendedor', 'divisa', 'iva', 'descuento', 'envio', 'estado', 'origen', 'device', 'notas'];
    let sel = new Set(COLS);
    el.innerHTML = `<div class="w-title">Simulador de coste bajo demanda<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><button class="btn" data-a="all">SELECT *</button><button class="btn" data-a="3">3 columnas</button><label>Días filtrados <input type="range" min="1" max="365" value="365" class="d"><b class="dv"></b></label><label><input type="checkbox" class="part"> tabla particionada por fecha</label><label><input type="checkbox" class="lim"> LIMIT 10</label></div>
      <div class="cols" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px"></div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div class="w-canvas" style="flex:1.4"></div><div class="kp" style="flex:1;display:flex;flex-direction:column;gap:10px"></div></div><div class="w-out"></div>`;
    const out = el.querySelector('.w-out');
    const c = chart(el.querySelector('.w-canvas'), { type: 'bar', data: { labels: ['SELECT *, sin filtro', 'Tu consulta'], datasets: [{ data: [0, 0], backgroundColor: [p.gray, p.blue], borderRadius: 8 }] }, options: { plugins: { legend: { display: false }, title: { display: true, text: 'USD por ejecución' } }, scales: { y: { type: 'logarithmic', ticks: { callback: (v) => ([0.01, 0.1, 1, 10, 100].includes(+v) ? v + ' $' : '') } } } } });
    const upd = () => {
      el.querySelector('.cols').innerHTML = COLS.map((x) => `<button class="btn ${sel.has(x) ? 'on' : ''}" data-c="${x}" style="font-size:13px;padding:4px 9px;font-family:var(--font-mono)">${x}</button>`).join('');
      const d = +el.querySelector('.d').value, part = el.querySelector('.part').checked; el.querySelector('.dv').textContent = d;
      const tib = 3.65 * (sel.size / COLS.length) * (part ? d / 365 : 1), usd = tib * 6.25;
      c.data.datasets[0].data = [3.65 * 6.25, Math.max(usd, 0.001)]; c.update('none');
      el.querySelector('.kp').innerHTML = `<div class="card hl"><h4>Bytes procesados</h4><div class="big">${tib >= 1 ? tib.toFixed(2) + ' TiB' : (tib * 1024).toFixed(1) + ' GiB'}</div></div><div class="card"><h4>Coste</h4><div class="big">${usd.toFixed(2)} $</div><p>a 6,25 $/TiB</p></div>`;
      out.innerHTML = el.querySelector('.lim').checked ? '⚠ <b>LIMIT 10 no cambia nada</b>: se leen las columnas completas igualmente.' : !part && d < 365 ? 'Filtrar por fecha <b>sin particionar</b> no reduce los bytes: activa el particionado.' : `${sel.size} de 20 columnas${part ? ` · ${d} días de 365` : ''}.`;
    };
    el.querySelector('.cols').onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; sel.has(b.dataset.c) ? sel.delete(b.dataset.c) : sel.add(b.dataset.c); if (!sel.size) sel.add('importe'); upd(); };
    el.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => { sel = b.dataset.a === 'all' ? new Set(COLS) : new Set(['fecha', 'ciudad', 'importe']); upd(); }));
    el.querySelectorAll('input').forEach((i) => i.addEventListener('input', upd));
    upd();
    return () => c.destroy();
  },

  bqpart(el) {
    const p = pal();
    const days = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05', '2026-01-06'], cities = ['Bilbao', 'Madrid', 'Sevilla', 'Valencia'];
    el.innerHTML = `<div class="w-title">Particiones (días) y bloques clusterizados (ciudad)<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><span class="mono">WHERE fecha =</span><select class="d"><option value="">(sin filtro)</option>${days.map((d) => `<option ${d === '2026-01-02' ? 'selected' : ''}>${d}</option>`).join('')}</select><span class="mono">AND ciudad =</span><select class="c"><option value="">(sin filtro)</option>${cities.map((c) => `<option ${c === 'Madrid' ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      <div class="w-canvas" style="display:flex;gap:10px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      const d = el.querySelector('.d').value, c = el.querySelector('.c').value; let n = 0;
      cv.innerHTML = days.map((dd) => { const pin = !d || d === dd; return `<div style="flex:1;border:2px ${pin ? 'solid' : 'dashed'} ${pin ? p.blue : p.line};border-radius:12px;padding:8px;opacity:${pin ? 1 : 0.4}"><div class="mono" style="font-size:13px;text-align:center;margin-bottom:6px">${dd}</div>${cities.map((cc) => { const hit = pin && (!c || c === cc); if (hit) n++; return `<div style="margin-top:6px;padding:12px 4px;border-radius:8px;text-align:center;font-size:14px;font-weight:600;background:${hit ? p.blue : 'var(--surface-2)'};color:${hit ? '#fff' : 'var(--muted)'}">${cc}</div>`; }).join('')}</div>`; }).join('');
      out.innerHTML = `Bloques leídos: <b>${n} de ${days.length * cities.length}</b>. La partición descarta los demás días; el clustering, los demás bloques del día.`;
    };
    el.querySelectorAll('select').forEach((s) => (s.onchange = draw)); draw();
  }
};
