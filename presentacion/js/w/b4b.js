// Widgets de los Temas 14 y 15
import { pal, frame, svg, chart, esc, highlight, three, textSprite, widgetScope } from '../ui.js';

const segBtns = (opts, act, attr = 'k') => `<div class="seg">${opts.map((o) => `<button data-${attr}="${o}" class="${o === act ? 'active' : ''}">${o}</button>`).join('')}</div>`;
const bindSeg = (root, attr, cb) => root.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { root.querySelectorAll(`[data-${attr}]`).forEach((x) => x.classList.toggle('active', x === b)); cb(b.dataset[attr]); }));

// ---------- datos de Mercado Next como documentos ----------
const CLI = { 1: ['Ana Ruiz', 'Madrid'], 2: ['Luis Gil', 'Sevilla'], 3: ['Marta Sanz', 'Madrid'], 4: ['Iker Mora', 'Bilbao'], 5: ['Sofía Vidal', 'Valencia'], 6: ['Pablo Núñez', null] };
const PRO = { 1: 'Teclado mecánico K70', 2: 'Teclado compacto TK60', 3: 'Ratón ergonómico M50', 4: 'Ratón gaming G300', 5: 'Monitor 27" QHD', 6: 'Monitor 24" FHD', 7: 'Lámpara LED escritorio', 8: 'Alfombrilla XL', 9: 'Webcam HD' };
const PED = [[101, 1, '2025-11-03', 'entregado', [[1, 1, 89.9], [3, 2, 29.9]]], [102, 2, '2025-11-15', 'entregado', [[5, 1, 289]]], [103, 1, '2025-12-01', 'entregado', [[8, 1, 19.9], [7, 2, 34.5]]],
  [104, 3, '2025-12-20', 'entregado', [[2, 1, 49.9], [3, 1, 29.9], [6, 1, 149]]], [105, 4, '2026-01-08', 'entregado', [[4, 1, 59.9], [8, 2, 19.9]]], [106, 1, '2026-01-15', 'enviado', [[5, 1, 279]]],
  [107, 5, '2026-01-22', 'cancelado', [[1, 1, 89.9]]], [108, 2, '2026-02-02', 'pendiente', [[2, 2, 49.9]]], [109, 6, '2026-02-05', 'pendiente', [[7, 1, 34.5], [3, 1, 29.9]]], [110, 4, '2026-02-10', 'enviado', [[6, 2, 149], [1, 1, 84.9]]]];
export const pedidosDocs = () => PED.map(([id, c, f, e, l]) => ({ _id: id, fecha: new Date(f), estado: e, cliente: { id: c, nombre: CLI[c][0], ciudad: CLI[c][1] }, lineas: l.map(([pid, q, pr]) => ({ producto: PRO[pid], cantidad: q, precio: pr })) }));

// ---------- mini motor de consultas estilo MongoDB ----------
const norm = (v) => (v instanceof Date ? v.getTime() : v);
const getPath = (doc, path) => path.split('.').reduce((vals, k) => vals.flatMap((v) => (v == null ? [] : Array.isArray(v) ? v.map((x) => x?.[k]) : [v[k]])).flatMap((v) => (Array.isArray(v) ? [v, ...v] : [v])), [doc]);
const cmp = (a, b) => (norm(a) < norm(b) ? -1 : norm(a) > norm(b) ? 1 : 0);
function matchCond(vals, cond) {
  if (cond && typeof cond === 'object' && !(cond instanceof Date) && !Array.isArray(cond) && Object.keys(cond).some((k) => k[0] === '$')) {
    return Object.entries(cond).every(([op, v]) => {
      switch (op) {
        case '$eq': return vals.some((x) => cmp(x, v) === 0);
        case '$ne': return !vals.some((x) => cmp(x, v) === 0);
        case '$gt': return vals.some((x) => x != null && cmp(x, v) > 0);
        case '$gte': return vals.some((x) => x != null && cmp(x, v) >= 0);
        case '$lt': return vals.some((x) => x != null && cmp(x, v) < 0);
        case '$lte': return vals.some((x) => x != null && cmp(x, v) <= 0);
        case '$in': return vals.some((x) => v.some((y) => cmp(x, y) === 0));
        case '$nin': return !vals.some((x) => v.some((y) => cmp(x, y) === 0));
        case '$exists': return v ? vals.some((x) => x !== undefined) : vals.every((x) => x === undefined);
        case '$regex': return vals.some((x) => typeof x === 'string' && new RegExp(v, cond.$options || '').test(x));
        case '$options': return true;
        default: throw new Error('Operador no soportado en el emulador: ' + op);
      }
    });
  }
  return vals.some((x) => cmp(x, cond) === 0);
}
export function matches(doc, f = {}) {
  return Object.entries(f).every(([k, c]) => {
    if (k === '$or') return c.some((s) => matches(doc, s));
    if (k === '$and') return c.every((s) => matches(doc, s));
    return matchCond(getPath(doc, k), c);
  });
}
const evalExpr = (doc, e) => {
  if (typeof e === 'string' && e[0] === '$') return getPath(doc, e.slice(1))[0];
  if (e && typeof e === 'object' && !Array.isArray(e)) {
    const [op, a] = Object.entries(e)[0];
    if (op === '$multiply') return a.map((x) => evalExpr(doc, x)).reduce((x, y) => x * y, 1);
    if (op === '$add') return a.map((x) => evalExpr(doc, x)).reduce((x, y) => x + y, 0);
    if (op === '$size') return (evalExpr(doc, a) || []).length;
  }
  return e;
};
const setPath = (o, path, v) => { const ks = path.split('.'); let t = o; ks.slice(0, -1).forEach((k) => (t = t[k] ??= {})); t[ks.at(-1)] = v; };
function project(doc, p) {
  if (!p || !Object.keys(p).length) return doc;
  const incl = Object.entries(p).filter(([k, v]) => v && k !== '_id'); const out = {};
  if (p._id !== 0) out._id = doc._id;
  if (!incl.length) { const c = structuredClone(doc); Object.entries(p).forEach(([k, v]) => !v && delete c[k]); return c; }
  incl.forEach(([k, v]) => { const val = v === 1 || v === true ? getPath(doc, k)[0] : evalExpr(doc, v); if (val !== undefined) setPath(out, k, val); });
  return out;
}
export function aggregate(docs, pipeline, trace) {
  let cur = docs.map((d) => structuredClone(d));
  for (const st of pipeline) {
    const [op, a] = Object.entries(st)[0];
    if (op === '$match') cur = cur.filter((d) => matches(d, a));
    else if (op === '$unwind') { const f = a.replace(/^\$/, ''); cur = cur.flatMap((d) => (getPath(d, f)[0] || []).map((x) => { const c = structuredClone(d); setPath(c, f, x); return c; })); }
    else if (op === '$group') {
      const g = new Map();
      cur.forEach((d) => { const key = JSON.stringify(evalExpr(d, a._id)); if (!g.has(key)) g.set(key, { _id: evalExpr(d, a._id), _d: [] }); g.get(key)._d.push(d); });
      cur = [...g.values()].map(({ _id, _d }) => { const o = { _id }; Object.entries(a).filter(([k]) => k !== '_id').forEach(([k, acc]) => { const [aop, ex] = Object.entries(acc)[0]; const vs = _d.map((d) => evalExpr(d, ex));
        o[k] = aop === '$sum' ? Math.round(vs.reduce((x, y) => x + (+y || 0), 0) * 100) / 100 : aop === '$avg' ? vs.reduce((x, y) => x + y, 0) / vs.length : aop === '$max' ? Math.max(...vs) : aop === '$min' ? Math.min(...vs) : aop === '$push' ? vs : null; }); return o; });
    } else if (op === '$sort') cur.sort((x, y) => { for (const [k, dir] of Object.entries(a)) { const c = cmp(getPath(x, k)[0], getPath(y, k)[0]); if (c) return c * dir; } return 0; });
    else if (op === '$limit') cur = cur.slice(0, a);
    else if (op === '$project' || op === '$set') cur = cur.map((d) => (op === '$set' ? Object.assign(d, ...Object.entries(a).map(([k, e]) => ({ [k]: evalExpr(d, e) }))) : project(d, a)));
    else if (op === '$count') cur = [{ [a]: cur.length }];
    else throw new Error('Etapa no soportada en el emulador: ' + op);
    trace && trace.push([op, cur.length, cur.slice(0, 3)]);
  }
  return cur;
}
function makeDB(docs) {
  const col = {
    find: (f = {}, p) => { let r = docs.filter((d) => matches(d, f)); const cur = { sort: (s) => { r.sort((x, y) => { for (const [k, dir] of Object.entries(s)) { const c = cmp(getPath(x, k)[0], getPath(y, k)[0]); if (c) return c * dir; } return 0; }); return cur; }, limit: (n) => { r = r.slice(0, n); return cur; }, toArray: () => r.map((d) => project(d, p)), count: () => r.length }; return cur; },
    findOne: (f, p) => col.find(f, p).limit(1).toArray()[0] ?? null,
    countDocuments: (f) => docs.filter((d) => matches(d, f)).length,
    aggregate: (pl) => aggregate(docs, pl),
    insertOne: (d) => { if (docs.some((x) => x._id === d._id)) throw new Error('E11000 duplicate key error collection: tienda.pedidos index: _id_'); docs.push(d); return { acknowledged: true, insertedId: d._id }; },
    updateOne: (f, u) => { if (!Object.keys(u).every((k) => k[0] === '$')) throw new Error('MongoInvalidArgumentError: Update document requires atomic operators'); const d = docs.find((x) => matches(x, f)); if (!d) return { matchedCount: 0, modifiedCount: 0 };
      Object.entries(u).forEach(([op, fs]) => Object.entries(fs).forEach(([k, v]) => { if (op === '$set') setPath(d, k, v); if (op === '$inc') setPath(d, k, (getPath(d, k)[0] || 0) + v); if (op === '$push') getPath(d, k)[0].push(v); if (op === '$unset') delete d[k]; })); return { matchedCount: 1, modifiedCount: 1 }; },
    deleteMany: (f) => { const n = docs.length; docs.splice(0, docs.length, ...docs.filter((d) => !matches(d, f))); return { deletedCount: n - docs.length }; }
  };
  return { pedidos: col };
}
const show = (v) => esc(JSON.stringify(v, (k, x) => (typeof x === 'string' && /^\d{4}-\d\d-\d\dT/.test(x) ? `ISODate("${x.slice(0, 10)}")` : x), 2).replace(/"ISODate\(\\"(.+?)\\"\)"/g, 'ISODate("$1")'));

export const widgets = {
  // ---------- documento frente a tablas ----------
  docvsrel(el) {
    const d = pedidosDocs()[0];
    el.innerHTML = `<div class="w-title">Pedido 101: un documento frente a tres tablas<span class="live">INTERACTIVO</span></div>
      <div style="display:flex;gap:18px;flex:1;min-height:0"><pre class="code dv" style="flex:1;font-size:16px;line-height:1.55"></pre><div class="rt" style="flex:1;overflow:auto"></div></div><div class="w-out"></div>`;
    const lines = [['{', ''], ['  "_id": 101,', 'p'], ['  "fecha": ISODate("2025-11-03"),', 'p'], ['  "estado": "entregado",', 'p'], ['  "cliente": {', 'c'], ['    "id": 1, "nombre": "Ana Ruiz",', 'c'], ['    "ciudad": "Madrid"', 'c'], ['  },', 'c'], ['  "lineas": [', 'l'],
      ['    { "producto": "Teclado mecánico K70",', 'l'], ['      "cantidad": 1, "precio": 89.90 },', 'l'], ['    { "producto": "Ratón ergonómico M50",', 'l'], ['      "cantidad": 2, "precio": 29.90 }', 'l'], ['  ]', 'l'], ['}', '']];
    const dv = el.querySelector('.dv'), rt = el.querySelector('.rt'), out = el.querySelector('.w-out');
    dv.innerHTML = lines.map(([t, g]) => `<div data-g="${g}" style="border-radius:6px;padding:0 6px;cursor:${g ? 'pointer' : 'default'}">${esc(t)}</div>`).join('');
    const tb = (n, g, h, r) => `<div data-g="${g}" class="tb" style="margin-bottom:12px;border-radius:12px;padding:6px;transition:.2s"><div style="font-family:Karla;font-weight:700">${n}</div><table class="edit"><thead><tr>${h.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${r.map((x) => `<tr>${x.map((v) => `<td style="padding:5px 10px;font-family:var(--font-mono);font-size:15px">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    rt.innerHTML = tb('pedido', 'p', ['id', 'cliente_id', 'fecha', 'estado'], [[101, 1, '2025-11-03', 'entregado']]) + tb('cliente', 'c', ['id', 'nombre', 'ciudad'], [[1, 'Ana Ruiz', 'Madrid']]) + tb('linea_pedido', 'l', ['pedido_id', 'producto_id', 'cantidad', 'precio_unitario'], [[101, 1, 1, '89.90'], [101, 3, 2, '29.90']]);
    const hl = (g) => { el.querySelectorAll('[data-g]').forEach((x) => (x.style.background = g && x.dataset.g === g ? 'var(--tint-blue)' : '')); out.innerHTML = { p: 'Los campos del pedido ↔ fila de <b>pedido</b>.', c: 'Objeto anidado <b>cliente</b> ↔ tabla cliente (aquí, una <b>copia</b> de lo que necesita el pedido).', l: 'Array <b>lineas</b> ↔ filas de linea_pedido. En MongoDB, <b>sin JOIN</b>: se lee todo en una operación.' }[g] || ''; };
    el.addEventListener('mouseover', (e) => { const x = e.target.closest('[data-g]'); if (x && x.dataset.g) hl(x.dataset.g); });
    hl('l');
  },

  // ---------- consola MongoDB ----------
  mongo(el) {
    let docs = pedidosDocs(); let db = makeDB(docs);
    const presets = [['find por estado y ciudad', `db.pedidos.find(\n  { estado: "entregado", "cliente.ciudad": "Madrid" },\n  { _id: 1, fecha: 1, "cliente.nombre": 1 }\n).sort({ fecha: -1 })`], ['$in', 'db.pedidos.find({ estado: { $in: ["pendiente", "enviado"] } }, { estado: 1 })'],
      ['dentro de un array', 'db.pedidos.find({ "lineas.producto": "Monitor 27\\" QHD" }, { fecha: 1, lineas: 1 })'], ['$or + $gte', 'db.pedidos.find({ $or: [ { "cliente.ciudad": "Bilbao" }, { fecha: { $gte: ISODate("2026-02-01") } } ] }, { "cliente.nombre": 1, fecha: 1 })'],
      ['insertOne', `db.pedidos.insertOne({\n  _id: 111, fecha: ISODate("2026-02-12"), estado: "pendiente",\n  cliente: { id: 3, nombre: "Marta Sanz", ciudad: "Madrid" },\n  lineas: [ { producto: "Monitor 24\\" FHD", cantidad: 1, precio: 149.00 } ]\n})`],
      ['$set', 'db.pedidos.updateOne({ _id: 108 }, { $set: { estado: "enviado" } })'], ['$push', 'db.pedidos.updateOne({ _id: 111 },\n  { $push: { lineas: { producto: "Alfombrilla XL", cantidad: 1, precio: 19.90 } } })'], ['✖ sin $set', 'db.pedidos.updateOne({ _id: 108 }, { estado: "enviado" })'],
      ['deleteMany', 'db.pedidos.deleteMany({ estado: "cancelado" })'], ['countDocuments', 'db.pedidos.countDocuments({})']];
    el.innerHTML = `<div class="w-title">mongosh (emulador) · colección pedidos<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${presets.map((x, i) => `<button class="btn" data-i="${i}" style="font-size:14px;padding:6px 10px">${x[0]}</button>`).join('')}<button class="btn rst" style="font-size:14px;padding:6px 10px">↺ datos</button></div>
      <div class="sql-editor" style="max-height:200px"><pre aria-hidden="true"></pre><textarea spellcheck="false"></textarea></div>
      <div class="sql-bar" style="margin:8px 0"><button class="btn primary run">▶ Ejecutar <span style="opacity:.75;font-weight:400">Ctrl+Enter</span></button><span class="sql-status st"></span></div>
      <pre class="code res" style="flex:1;font-size:14.5px;overflow:auto"></pre>`;
    const ta = el.querySelector('textarea'), pre = el.querySelector('.sql-editor pre'), res = el.querySelector('.res'), st = el.querySelector('.st');
    const paint = () => (pre.innerHTML = highlight(ta.value, 'js').replace(/(\$\w+)/g, '<span class="kw">$1</span>') + '\n');
    const run = () => {
      try {
        const ISODate = (s) => new Date(s);
        let r = new Function('db', 'ISODate', `"use strict"; return (${ta.value.replace(/;\s*$/, '')});`)(db, ISODate);
        if (r && r.toArray) r = r.toArray();
        res.innerHTML = show(r); st.textContent = Array.isArray(r) ? `✔ ${r.length} documento(s)` : '✔ hecho';
      } catch (e) { res.innerHTML = `<span style="color:var(--red)">✖ ${esc(e.message)}</span>`; st.textContent = '✖ error'; }
    };
    ta.addEventListener('input', paint);
    ta.addEventListener('keydown', (e) => { e.stopPropagation(); if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } });
    el.querySelector('.run').onclick = run;
    el.querySelector('.rst').onclick = () => { docs = pedidosDocs(); db = makeDB(docs); st.textContent = 'Colección restaurada'; };
    el.querySelector('.w-controls').onclick = (e) => {
      const b = e.target.closest('button[data-i]');
      if (!b || !e.currentTarget.contains(b)) return;
      const i = Number(b.dataset.i);
      if (!Number.isInteger(i) || !presets[i]) return;
      ta.value = presets[i][1]; paint(); run();
    };
    ta.value = presets[0][1]; paint(); run();
  },

  // ---------- embeber o referenciar ----------
  embedref(el) {
    const p = pal();
    const { cv, ctl, out } = frame(el, { title: 'Cliente con todos sus pedidos embebidos', live: true, controls: '<label>Años de cliente <input type="range" min="1" max="30" value="3" class="y"><b class="yv"></b></label><label>Pedidos al mes <input type="range" min="1" max="200" value="4" class="m"><b class="mv"></b></label>' });
    const c = chart(cv, { type: 'bar', data: { labels: ['Embebido (un documento)', 'Referenciado (documento cliente)'], datasets: [{ data: [0, 0], backgroundColor: [p.blue, p.gray], borderRadius: 8 }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { type: 'logarithmic', min: 0.001, max: 100, ticks: { callback: (v) => ([0.001, 0.01, 0.1, 1, 10, 100].includes(+v) ? (v < 1 ? (v * 1024).toFixed(0) + ' KB' : v + ' MB') : '') }, title: { display: true, text: 'tamaño del documento (MB, log) · límite 16 MB' } } } },
      plugins: [{ id: 'lim', afterDatasetsDraw(ch) { const x = ch.scales.x.getPixelForValue(16); const ctx = ch.ctx; ctx.save(); ctx.strokeStyle = p.red; ctx.lineWidth = 3; ctx.setLineDash([8, 5]); ctx.beginPath(); ctx.moveTo(x, ch.chartArea.top); ctx.lineTo(x, ch.chartArea.bottom); ctx.stroke(); ctx.fillStyle = p.red; ctx.font = '700 15px Instrument Sans'; ctx.fillText('16 MB', x + 6, ch.chartArea.top + 16); ctx.restore(); } }] });
    const upd = () => {
      const y = +ctl.querySelector('.y').value, m = +ctl.querySelector('.m').value; ctl.querySelector('.yv').textContent = y; ctl.querySelector('.mv').textContent = m;
      const n = y * 12 * m, mb = (0.5 + n * 0.6) / 1024; c.data.datasets[0].data = [mb, 0.5 / 1024]; c.update('none');
      out.innerHTML = `${n.toLocaleString('es-ES')} pedidos × ~0,6 KB = <b>${mb < 1 ? (mb * 1024).toFixed(0) + ' KB' : mb.toFixed(1) + ' MB'}</b>. ${mb > 16 ? '<span style="color:var(--red)">✖ Supera el límite de 16 MB: los pedidos de un cliente <b>crecen sin límite</b> → referenciar.</span>' : 'Cabe, pero cada lectura del cliente arrastra todo su historial. Para 1:pocos acotados (líneas de un pedido), embeber es ideal.'}`;
    };
    ctl.oninput = upd; upd();
    return () => c.destroy();
  },

  // ---------- aggregation pipeline ----------
  mpipeline(el) {
    const p = pal();
    const stages = [['$match', { estado: { $ne: 'cancelado' } }], ['$unwind', '$lineas'], ['$group', { _id: '$lineas.producto', total: { $sum: { $multiply: ['$lineas.cantidad', '$lineas.precio'] } } }], ['$sort', { total: -1 }], ['$limit', 3]];
    const sqlEq = ['WHERE estado <> \'cancelado\'', '(aplanar las líneas)', 'GROUP BY producto · SUM(cantidad × precio)', 'ORDER BY total DESC', 'LIMIT 3'];
    let k = 0;
    el.innerHTML = `<div class="w-title">db.pedidos.aggregate([…])<span class="live">PASO A PASO</span></div>
      <div class="w-controls"><button class="btn pv">‹</button>${stages.map((s, i) => `<button class="btn st" data-i="${i}">${i + 1}. ${s[0]}</button>`).join('')}<button class="btn primary nx">Añadir etapa ›</button></div>
      <div style="display:flex;gap:18px;flex:1;min-height:0"><div style="flex:0 0 470px;display:flex;flex-direction:column;gap:10px"><div class="flow"></div><pre class="code pl" style="font-size:14px"></pre></div><pre class="code docs" style="flex:1;font-size:13.5px;overflow:auto"></pre></div><div class="w-out"></div>`;
    const flow = el.querySelector('.flow'), pl = el.querySelector('.pl'), docsEl = el.querySelector('.docs'), out = el.querySelector('.w-out');
    const showStage = () => {
      const trace = []; const r = aggregate(pedidosDocs(), stages.slice(0, k).map(([op, a]) => ({ [op]: a })), trace);
      const counts = [10, ...trace.map((t) => t[1])];
      flow.innerHTML = `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">${['entrada', ...stages.slice(0, k).map((s) => s[0])].map((s, i) => `<div style="text-align:center"><div class="pill ${i === k ? '' : 'gray'}" style="font-size:14px">${s}</div><div style="font-family:Karla;font-weight:700;font-size:26px;color:var(--blue)">${counts[i]}</div></div>${i < k ? '<span style="font-size:22px;color:var(--muted)">→</span>' : ''}`).join('')}</div>`;
      pl.innerHTML = highlight(`db.pedidos.aggregate([\n${stages.map(([op, a], i) => `${i < k ? '' : '//'}  { ${op}: ${JSON.stringify(a).replace(/"(\w+)":/g, '$1: ')} }`).join(',\n')}\n])`, 'js').replace(/(\$\w+)/g, '<span class="kw">$1</span>');
      docsEl.innerHTML = `// ${r.length} documento(s) a la salida${r.length > 4 ? ' (se muestran 4)' : ''}\n` + show(r.slice(0, 4));
      el.querySelectorAll('.st').forEach((b) => b.classList.toggle('on', +b.dataset.i < k));
      out.innerHTML = k ? `<b>${stages[k - 1][0]}</b> ≈ SQL: ${sqlEq[k - 1]}. ${k === 1 ? 'Pon <b>$match lo antes posible</b>: reduce los documentos y puede usar índices (como el pushdown del Tema 3).' : ''}${k === 5 ? ' ✔ Monitor 27" QHD 568 · Monitor 24" FHD 447 · Teclado mecánico K70 174,8.' : ''}` : 'Los 10 pedidos entran en la tubería.';
    };
    el.querySelector('.nx').onclick = () => { k = Math.min(5, k + 1); showStage(); };
    el.querySelector('.pv').onclick = () => { k = Math.max(0, k - 1); showStage(); };
    el.querySelectorAll('.st').forEach((b) => (b.onclick = () => { k = +b.dataset.i + 1; showStage(); }));
    showStage();
  },

  // ---------- validación con JSON Schema ----------
  validator(el) {
    el.innerHTML = `<div class="w-title">db.createCollection("clientes", { validator: { $jsonSchema: … } })<span class="live">INTERACTIVO</span></div>
      <pre class="code" style="font-size:14px">${highlight(`{ bsonType: "object",\n  required: ["nombre", "email"],\n  properties: {\n    email: { bsonType: "string", pattern: "@" },\n    vip:   { bsonType: "bool" } } }`, 'js')}</pre>
      <div style="font-size:15px;color:var(--muted);margin:10px 0 4px">Documento a insertar (edítalo):</div>
      <textarea class="doc" spellcheck="false" style="flex:1;font-family:var(--font-mono);font-size:16px;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--code-bg);color:var(--ink);resize:none">{ "nombre": "Raquel Soto", "email": "raquel.mail.com", "vip": "sí" }</textarea>
      <div class="w-controls" style="margin-top:8px"><button class="btn primary go">insertOne()</button></div><div class="w-out"></div>`;
    const out = el.querySelector('.w-out'), ta = el.querySelector('.doc');
    ta.addEventListener('keydown', (e) => e.stopPropagation());
    el.querySelector('.go').onclick = () => {
      let d; try { d = JSON.parse(ta.value); } catch (e) { out.innerHTML = `<span style="color:var(--red)">JSON no válido: ${esc(e.message)}</span>`; return; }
      const errs = [];
      ['nombre', 'email'].forEach((k) => d[k] === undefined && errs.push(`falta el campo obligatorio «${k}»`));
      if (d.email !== undefined && (typeof d.email !== 'string' || !d.email.includes('@'))) errs.push('email no cumple pattern "@"');
      if (d.vip !== undefined && typeof d.vip !== 'boolean') errs.push('vip debe ser bool');
      out.innerHTML = errs.length ? `<span style="color:var(--red)">✖ MongoServerError: Document failed validation — ${errs.join(' · ')}</span>` : '✔ { acknowledged: true } — documento aceptado.';
    };
  },

  // ---------- replica set ----------
  replicaset(el) {
    const life = widgetScope(el);
    const p = pal();
    let nodes, wc = 'majority', log = [];
    const reset = () => { nodes = [{ n: 'A', role: 'primario', up: true, data: ['p101', 'p102'] }, { n: 'B', role: 'secundario', up: true, data: ['p101', 'p102'] }, { n: 'C', role: 'secundario', up: true, data: ['p101', 'p102'] }]; };
    reset();
    el.innerHTML = `<div class="w-title">Replica set de 3 miembros<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><label>Write concern <select class="wc"><option value="majority">w: "majority"</option><option value="1">w: 1</option></select></label><button class="btn primary wr">✎ insertOne</button><button class="btn kill" style="border-color:var(--red);color:var(--red)">⚡ Tumbar primario</button><button class="btn rst">↺</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    let k = 103, pending = [];
    const draw = () => {
      cv.innerHTML = ''; const { s, W, H } = svg(cv);
      const pos = [[W / 2, 80], [W * 0.25, H - 90], [W * 0.75, H - 90]];
      [[0, 1], [0, 2], [1, 2]].forEach(([a, b]) => s.append('line').attr('x1', pos[a][0]).attr('y1', pos[a][1]).attr('x2', pos[b][0]).attr('y2', pos[b][1]).attr('stroke', p.line).attr('stroke-width', 2).attr('stroke-dasharray', '6 6'));
      nodes.forEach((nd, i) => {
        const [x, y] = pos[i]; const pri = nd.role === 'primario';
        s.append('circle').attr('cx', x).attr('cy', y).attr('r', 56).attr('fill', !nd.up ? 'var(--tint-red)' : pri ? p.blue : p.surface).attr('stroke', !nd.up ? p.red : pri ? p.blueD : p.gray).attr('stroke-width', 4);
        s.append('text').text(nd.up ? nd.n : '✖').attr('x', x).attr('y', y - 6).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 26).attr('fill', !nd.up ? p.red : pri ? '#fff' : p.title);
        s.append('text').text(nd.up ? nd.role : 'caído').attr('x', x).attr('y', y + 18).attr('text-anchor', 'middle').attr('font-size', 14).attr('fill', !nd.up ? p.red : pri ? '#fff' : p.muted);
        s.append('text').text(nd.data.join(' ')).attr('x', x).attr('y', y + 80).attr('text-anchor', 'middle').attr('font-family', 'IBM Plex Mono').attr('font-size', 14).attr('fill', p.ink);
      });
    };
    el.querySelector('.wc').onchange = (e) => (wc = e.target.value);
    el.querySelector('.wr').onclick = async () => {
      const pri = nodes.find((n) => n.role === 'primario' && n.up); if (!pri) { out.innerHTML = 'No hay primario: espera a la elección.'; return; }
      const id = 'p' + k++; pri.data.push(id); draw();
      if (wc === '1') { out.innerHTML = `✔ Confirmado con <b>w: 1</b> en cuanto lo tiene el primario (rápido). Las réplicas se enterarán por el oplog…`; pending.push(id); life.timeout(() => { if (pri.up) { nodes.forEach((n) => n.up && !n.data.includes(id) && n.data.push(id)); pending = pending.filter((x) => x !== id); draw(); } }, 2500); }
      else { if (!(await life.sleep(500))) return; nodes.forEach((n) => n.up && !n.data.includes(id) && n.data.push(id)); draw(); out.innerHTML = '✔ Confirmado con <b>w: "majority"</b>: ya está en la mayoría. Sobrevive a la caída del primario.'; }
    };
    el.querySelector('.kill').onclick = async () => {
      const pri = nodes.find((n) => n.role === 'primario' && n.up); if (!pri) return;
      pri.up = false; pri.role = 'secundario'; draw(); out.innerHTML = '⚡ Primario caído. Los secundarios no reciben su latido… <b>elección</b>.'; if (!(await life.sleep(1400))) return;
      const cand = nodes.filter((n) => n.up).sort((a, b) => b.data.length - a.data.length)[0]; cand.role = 'primario';
      const lost = pending.filter((id) => !cand.data.includes(id));
      draw(); out.innerHTML = `🗳 ${cand.n} es el nuevo primario (en segundos, por mayoría). ${lost.length ? `<span style="color:var(--red)">✖ Se han perdido ${lost.join(', ')}: se confirmaron con w: 1 y no llegaron a la mayoría.</span>` : '✔ No se ha perdido nada.'}`;
      pending = [];
    };
    el.querySelector('.rst').onclick = () => { reset(); k = 103; pending = []; draw(); out.innerHTML = ''; };
    draw();
  },

  // ---------- anillo de Cassandra en 3D ----------
  async cassring(el) {
    const life = widgetScope(el);
    const p = pal();
    el.innerHTML = `<div class="w-title">Anillo de tokens · NetworkTopologyStrategy (1 DC)<span class="live">3D</span></div>
      <div class="w-controls"><label>Partition key <input type="text" class="pk" value="cliente_id = 1" style="width:170px"></label><button class="btn primary go">INSERT</button><label>RF <input type="range" min="1" max="4" value="3" class="rf"><b class="rfv"></b></label><button class="btn add">+ nodo</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const T = await three(cv, { pos: [0, 7.5, 9.5], fov: 45, autoRotate: true }, life);
    if (!life.alive) { T?.dispose(); return; }
    const { THREE, scene } = T;
    const H = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
    const R = 4;
    const torus = new THREE.Mesh(new THREE.TorusGeometry(R, 0.06, 12, 160), new THREE.MeshBasicMaterial({ color: p.line }));
    torus.rotation.x = Math.PI / 2; scene.add(torus);
    let nodes = [], nodeObjs = [], marks = [];
    const names = ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8'];
    const build = (n) => {
      nodeObjs.forEach((o) => scene.remove(o)); nodeObjs = [];
      nodes = names.slice(0, n).map((nm, i) => ({ nm, t: (i / n + 0.03 * Math.sin(i * 7)) % 1 }));
      nodes.sort((a, b) => a.t - b.t);
      nodes.forEach((nd) => {
        const a = nd.t * Math.PI * 2;
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 32), new THREE.MeshStandardMaterial({ color: p.dark ? '#3B4146' : '#FFFFFF', emissive: '#000' }));
        m.position.set(Math.cos(a) * R, 0, Math.sin(a) * R); scene.add(m); nd.m = m; nodeObjs.push(m);
        const l = textSprite(THREE, nd.nm, { size: 0.5, color: p.dark ? '#E7EBEE' : '#26292B' }); l.position.set(Math.cos(a) * (R + 1), 0.6, Math.sin(a) * (R + 1)); scene.add(l); nodeObjs.push(l);
      });
    };
    const insert = () => {
      marks.forEach((o) => scene.remove(o)); marks = [];
      const key = el.querySelector('.pk').value, rf = +el.querySelector('.rf').value; el.querySelector('.rfv').textContent = rf;
      const t = H(key), a = t * Math.PI * 2;
      const tok = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), new THREE.MeshBasicMaterial({ color: p.amber })); tok.position.set(Math.cos(a) * R, 0, Math.sin(a) * R); scene.add(tok); marks.push(tok);
      const beam = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 3, 0), tok.position.clone()]), new THREE.LineBasicMaterial({ color: p.amber })); scene.add(beam); marks.push(beam);
      let first = nodes.findIndex((n) => n.t >= t); if (first < 0) first = 0;
      const reps = d3.range(Math.min(rf, nodes.length)).map((i) => nodes[(first + i) % nodes.length]);
      nodes.forEach((n) => { const on = reps.includes(n); n.m.material.color.set(on ? (n === reps[0] ? p.blue : p.blueL) : (p.dark ? '#3B4146' : '#FFFFFF')); n.m.scale.y = on ? 1.8 : 1; });
      const token = Math.round((t - 0.5) * 2 * 9.22e18);
      out.innerHTML = `hash(<b>${esc(key)}</b>) → token ≈ <span class="mono">${token.toExponential(2)}</span> · réplicas (RF = ${rf}): <b>${reps.map((n) => n.nm).join(', ')}</b> — el siguiente nodo en el sentido del anillo y los que le siguen.`;
    };
    build(5); insert();
    el.querySelector('.go').onclick = insert;
    el.querySelector('.pk').addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') insert(); });
    el.querySelector('.rf').oninput = insert;
    el.querySelector('.add').onclick = () => { build(Math.min(8, nodes.length + 1)); insert(); };
    return () => T.dispose();
  },

  // ---------- CQL: particiones ----------
  cql(el) {
    const p = pal();
    const data = { 1: [['2026-01-15', 106, 'enviado'], ['2025-12-01', 103, 'entregado'], ['2025-11-03', 101, 'entregado']], 2: [['2026-02-02', 108, 'pendiente'], ['2025-11-15', 102, 'entregado']], 4: [['2026-02-10', 110, 'enviado'], ['2026-01-08', 105, 'entregado']], 3: [['2025-12-20', 104, 'entregado']] };
    const nodeOf = { 1: 'N2', 2: 'N4', 3: 'N1', 4: 'N3' };
    const Q = [['WHERE cliente_id = 1 LIMIT 10', (c) => c === '1', null], ["WHERE cliente_id = 1 AND fecha >= '2026-01-01'", (c, r) => c === '1' && r[0] >= '2026-01-01', null], ["WHERE estado = 'enviado'", null, 'InvalidRequest: Cannot execute this query as it might involve data filtering … use ALLOW FILTERING'], ["WHERE estado = 'enviado' ALLOW FILTERING", (c, r) => r[2] === 'enviado', 'all']];
    el.innerHTML = `<div class="w-title">SELECT * FROM tienda.pedidos_por_cliente …<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${Q.map((q, i) => `<button class="btn ${i ? '' : 'on'}" data-i="${i}" style="font-family:var(--font-mono);font-size:14px">${esc(q[0])}</button>`).join('')}</div>
      <div class="w-canvas" style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;align-content:start"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const run = (i) => {
      el.querySelectorAll('[data-i]').forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
      const [, f, err] = Q[i];
      cv.innerHTML = Object.entries(data).map(([c, rows]) => {
        const touched = err === 'all' || (f && rows.some((r) => f(c, r))) || (f && f(c, rows[0]));
        return `<div class="card" style="padding:10px;${err && err !== 'all' ? 'opacity:.5' : touched ? 'border-color:var(--blue);border-width:3px' : 'opacity:.45'}"><h4 style="font-size:17px">Partición cliente_id = ${c}</h4><p style="font-size:13px">en el nodo ${nodeOf[c]} (+ réplicas)</p>
          <table class="edit" style="width:100%;margin-top:6px">${rows.map((r) => `<tr>${r.map((v) => `<td style="padding:4px 8px;font-family:var(--font-mono);font-size:14px;${f && !err ? (f(c, r) ? 'background:var(--tint-blue);font-weight:700' : '') : err === 'all' && f(c, r) ? 'background:var(--tint-blue);font-weight:700' : ''}">${v}</td>`).join('')}</tr>`).join('')}</table></div>`;
      }).join('');
      out.innerHTML = err && err !== 'all' ? `<span style="color:var(--red)">✖ ${esc(err)}</span>` : err === 'all' ? '<span style="color:var(--red)">⚠ Funciona… recorriendo <b>todas las particiones de todos los nodos</b>. Con millones de filas, lentísimo. Mejor otra tabla.</span>' : '✔ Toca <b>una sola partición</b>, ya ordenada por fecha DESC: rapidísimo.';
    };
    el.querySelector('.w-controls').onclick = (e) => { const b = e.target.closest('[data-i]'); if (b && e.currentTarget.contains(b)) run(+b.dataset.i); };
    run(0);
  },

  // ---------- modelado query-first en Cassandra ----------
  cassmodel(el) {
    const life = widgetScope(el);
    const T = [['pedidos_por_cliente', 'PK (cliente_id) · CK fecha DESC', 'Pedidos de un cliente, del más reciente al más antiguo'], ['pedidos_por_dia_estado', 'PK ((fecha, estado)) · CK pedido_id', 'Pedidos de un día en un estado'], ['productos_por_categoria', 'PK (categoria) · CK precio ASC, producto_id', 'Productos de una categoría por precio']];
    el.innerHTML = `<div class="w-title">Una tabla por consulta<span class="live">INTERACTIVO</span></div><div class="w-controls"><button class="btn primary go">INSERT pedido 111 (Marta, 2026-02-12, pendiente)</button></div>
      <div class="w-canvas" style="display:flex;flex-direction:column;gap:12px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    cv.innerHTML = T.map(([n, k, q], i) => `<div class="card t${i}" style="transition:.4s"><h4 style="font-family:var(--font-mono);font-size:19px">${n}</h4><p><b>${k}</b> — responde a: ${q}</p><p class="w" style="font-family:var(--font-mono);font-size:14px;color:var(--blue-d)"></p></div>`).join('');
    el.querySelector('.go').onclick = async () => {
      const w = ['(3, 2026-02-12, 111, pendiente, 149.00)', '((2026-02-12, pendiente), 111, 3, 149.00)', '— (no cambia: no es un producto)'];
      for (let i = 0; i < 3; i++) { const c = cv.querySelector('.t' + i); c.classList.add('hl'); c.querySelector('.w').textContent = i < 2 ? 'INSERT ' + w[i] : w[i]; if (!(await life.sleep(600))) return; }
      out.innerHTML = 'El mismo pedido se escribe en <b>dos tablas</b> (desnormalización): en Cassandra escribir es barato; leer de varias particiones, no. Para mantenerlas coherentes: <i>batches</i> lógicos.';
    };
  },

  // ---------- camino de escritura LSM y tombstones ----------
  lsm(el) {
    const p = pal();
    let mem = [], sst = [], n = 0, tomb = 0;
    el.innerHTML = `<div class="w-title">Commit log → memtable → SSTables<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><button class="btn primary w">✎ INSERT</button><button class="btn d">🗑 DELETE</button><button class="btn f">⬇ flush memtable</button><button class="btn c">🗜 Compactar (tras gc_grace_seconds)</button><button class="btn r">👁 Leer partición</button><button class="btn rst">↺</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const cell = (x) => `<span style="display:inline-block;margin:3px;padding:4px 9px;border-radius:8px;font-family:var(--font-mono);font-size:14px;background:${x.t ? 'var(--tint-red)' : 'var(--tint-blue)'};color:${x.t ? p.red : p.blueD};font-weight:700">${x.t ? '🪦 ' : ''}${x.k}</span>`;
    const draw = () => {
      cv.innerHTML = `<div style="display:flex;gap:16px;height:100%"><div class="card" style="flex:1"><h4>Memtable (RAM)</h4>${mem.map(cell).join('') || '<p>vacía</p>'}</div>
        <div style="flex:2;display:flex;flex-direction:column;gap:10px"><h4 style="margin:0;font-family:Karla">SSTables (disco, inmutables)</h4>${sst.map((t, i) => `<div class="card" style="padding:8px 12px"><b style="font-size:14px">SSTable ${i + 1}</b> ${t.map(cell).join('')}</div>`).join('') || '<p style="color:var(--muted)">ninguna todavía</p>'}</div></div>`;
    };
    el.querySelector('.w').onclick = () => { mem.push({ k: 'fila' + ++n }); draw(); out.innerHTML = 'Escritura: <b>commit log</b> (durabilidad) + <b>memtable</b>. Sin leer nada: rapidísimo.'; };
    el.querySelector('.d').onclick = () => { const all = [...mem, ...sst.flat()].filter((x) => !x.t).map((x) => x.k); const alive = all.filter((k) => ![...mem, ...sst.flat()].some((x) => x.t && x.k === k)); if (!alive.length) { out.innerHTML = 'No hay filas que borrar.'; return; } const k = alive[0]; mem.push({ k, t: true }); tomb++; draw(); out.innerHTML = `Borrar <b>no elimina</b> ${k}: escribe una <b>tombstone</b>.`; };
    el.querySelector('.f').onclick = () => { if (!mem.length) return; sst.push(mem); mem = []; draw(); out.innerHTML = 'La memtable llena se vuelca como una <b>SSTable inmutable</b>.'; };
    el.querySelector('.r').onclick = () => { const all = [...sst.flat(), ...mem]; const tombs = all.filter((x) => x.t).length; out.innerHTML = `Leer consulta ${sst.length} SSTable(s) + memtable (los filtros de Bloom evitan abrir las que no tienen la clave) y procesa <b>${tombs} tombstone(s)</b>. Cassandra avisa a partir de 1.000 y aborta a partir de 100.000.`; };
    el.querySelector('.c').onclick = () => { const all = [...sst.flat(), ...mem]; const dead = new Set(all.filter((x) => x.t).map((x) => x.k)); const merged = all.filter((x) => !dead.has(x.k)); sst = merged.length ? [merged] : []; mem = []; draw(); out.innerHTML = `Compactación: se fusionan las SSTables y desaparecen los datos borrados <b>y sus tombstones</b> (pasado gc_grace_seconds, 10 días por defecto).`; };
    el.querySelector('.rst').onclick = () => { mem = []; sst = []; n = 0; draw(); out.innerHTML = ''; };
    draw();
  },

  // ---------- filtro de Bloom ----------
  bloom(el) {
    const p = pal();
    el.innerHTML = `<div class="w-title">Filtro de Bloom<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><label>m bits <input type="range" min="16" max="96" step="8" value="48" class="m"><b class="mv"></b></label><label>k hash <input type="range" min="1" max="6" value="3" class="k"><b class="kv"></b></label>
      <input type="text" class="key" value="cliente:7" style="width:150px"><button class="btn primary add">Añadir</button><button class="btn q">¿Está?</button><button class="btn rst">↺</button></div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div style="flex:1.2;display:flex;flex-direction:column"><div class="bits" style="display:flex;flex-wrap:wrap;gap:4px;align-content:flex-start"></div><div class="keys" style="margin-top:10px;font-size:15px;color:var(--muted)"></div></div><div class="w-canvas" style="flex:1"></div></div><div class="w-out"></div>`;
    const out = el.querySelector('.w-out'), bitsEl = el.querySelector('.bits');
    let m = 48, k = 3, bits, keys = [], hl = [];
    const hs = (s) => d3.range(k).map((i) => { let h = 2166136261 ^ (i * 16777619); for (let j = 0; j < s.length; j++) { h ^= s.charCodeAt(j); h = Math.imul(h, 16777619 + i * 2); } return (h >>> 0) % m; });
    const c = chart(el.querySelector('.w-canvas'), { type: 'line', data: { labels: [], datasets: [{ label: 'p de falso positivo', data: [], borderColor: p.blue, borderWidth: 3, pointRadius: 0 }, { label: 'n actual', data: [], borderColor: p.red, pointRadius: 7, showLine: false }] },
      options: { scales: { y: { min: 0, max: 1, title: { display: true, text: 'p' } }, x: { title: { display: true, text: 'n claves' } } }, plugins: { legend: { position: 'bottom' } } } });
    const reset = () => { bits = Array(m).fill(0); keys = []; hl = []; };
    const draw = () => {
      bitsEl.innerHTML = bits.map((b, i) => `<div style="width:30px;height:30px;border-radius:6px;display:grid;place-items:center;font-family:var(--font-mono);font-size:13px;background:${hl.includes(i) ? p.amber : b ? p.blue : 'var(--surface-2)'};color:${b || hl.includes(i) ? '#fff' : 'var(--muted)'}">${b}</div>`).join('');
      el.querySelector('.keys').innerHTML = `Claves insertadas (n = ${keys.length}): ${keys.join(', ') || '—'}`;
      const ns = d3.range(0, 41); c.data.labels = ns; c.data.datasets[0].data = ns.map((n) => Math.pow(1 - Math.exp(-k * n / m), k));
      c.data.datasets[1].data = ns.map((n) => (n === keys.length ? Math.pow(1 - Math.exp(-k * n / m), k) : null)); c.update('none');
    };
    const sync = () => { m = +el.querySelector('.m').value; k = +el.querySelector('.k').value; el.querySelector('.mv').textContent = m; el.querySelector('.kv').textContent = k; const old = keys; reset(); old.forEach((x) => { hs(x).forEach((i) => (bits[i] = 1)); keys.push(x); }); draw(); };
    el.querySelector('.add').onclick = () => { const key = el.querySelector('.key').value; hl = hs(key); hl.forEach((i) => (bits[i] = 1)); keys.push(key); draw(); out.innerHTML = `«${esc(key)}» → bits ${hl.join(', ')} a 1.`; el.querySelector('.key').value = 'cliente:' + Math.floor(Math.random() * 999); };
    el.querySelector('.q').onclick = () => { const key = el.querySelector('.key').value; hl = hs(key); const all = hl.every((i) => bits[i]); draw();
      out.innerHTML = !all ? `«${esc(key)}»: algún bit es 0 → <b>seguro que NO está</b>. No hace falta abrir la SSTable.` : keys.includes(key) ? `«${esc(key)}»: todos los bits a 1 → <b>quizá esté</b> (y sí está).` : `<span style="color:var(--red)">«${esc(key)}»: todos los bits a 1 pero <b>no se insertó</b>: ¡<b>falso positivo</b>! Se abre la SSTable para nada.</span>`; };
    el.querySelector('.rst').onclick = () => { reset(); draw(); out.innerHTML = ''; };
    el.querySelectorAll('input[type=range]').forEach((i) => (i.oninput = sync));
    el.querySelector('.key').addEventListener('keydown', (e) => e.stopPropagation());
    reset(); ['cliente:1', 'cliente:2', 'cliente:3', 'cliente:4', 'cliente:5'].forEach((x) => { hs(x).forEach((i) => (bits[i] = 1)); keys.push(x); }); sync();
    out.innerHTML = 'Prueba claves que no has insertado: con m pequeño y muchas claves aparecen falsos positivos.';
    return () => c.destroy();
  }
};
