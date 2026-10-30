// Widgets del Bloque VI (Temas 21 y 22)
import { pal, frame, svg, chart, esc, highlight, widgetScope } from '../ui.js';

const segBtns = (opts, act, attr = 'k') => `<div class="seg">${opts.map((o) => `<button data-${attr}="${o}" class="${o === act ? 'active' : ''}">${o}</button>`).join('')}</div>`;
const bindSeg = (root, attr, cb) => root.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { root.querySelectorAll(`[data-${attr}]`).forEach((x) => x.classList.toggle('active', x === b)); cb(b.dataset[attr]); }));

export const widgets = {
  amdahl(el) {
    const p = pal();
    const { cv, ctl, out } = frame(el, { title: 'Ley de Amdahl', live: true, controls: '<label>p (fracción paralelizable) <input type="range" min="0.5" max="0.999" step="0.001" value="0.95" class="p"><b class="pv"></b></label><label>n <input type="range" min="1" max="10" value="6" class="n"><b class="nv"></b></label>' });
    const ns = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
    const c = chart(cv, { type: 'line', data: { labels: ns, datasets: [] }, options: { scales: { y: { beginAtZero: true, title: { display: true, text: 'aceleración S(n)' } }, x: { title: { display: true, text: 'procesadores n' } } }, plugins: { legend: { position: 'bottom' } } } });
    const upd = () => {
      const pp = +ctl.querySelector('.p').value, ni = +ctl.querySelector('.n').value, n = ns[ni];
      ctl.querySelector('.pv').textContent = (pp * 100).toFixed(1) + ' %'; ctl.querySelector('.nv').textContent = n;
      const S = (pv, k) => 1 / ((1 - pv) + pv / k);
      c.data.datasets = [{ label: `p = ${(pp * 100).toFixed(1)} %`, data: ns.map((k) => S(pp, k)), borderColor: p.blue, borderWidth: 4, pointRadius: ns.map((k) => (k === n ? 8 : 3)), pointBackgroundColor: p.blue },
        { label: 'límite 1/(1−p)', data: ns.map(() => 1 / (1 - pp)), borderColor: p.red, borderDash: [8, 5], borderWidth: 2, pointRadius: 0 },
        { label: 'ideal (lineal)', data: ns.map((k) => Math.min(k, 1 / (1 - pp) * 1.15)), borderColor: p.line, borderWidth: 2, pointRadius: 0 }];
      c.update('none');
      out.innerHTML = `Con ${n} procesadores: <b>S = ${S(pp, n).toFixed(1)}×</b>. Por muchos que añadas, nunca más de <b>${(1 / (1 - pp)).toFixed(0)}×</b>: ${pp < 0.99 ? 'por eso los sistemas Big Data se diseñan para que casi <b>todo</b> sea paralelizable.' : 'casi todo es paralelizable: el diseño ideal del Big Data.'}`;
    };
    ctl.oninput = upd; upd();
    return () => c.destroy();
  },

  hdfs(el) {
    const p = pal();
    let size = 600, dead = new Set();
    el.innerHTML = `<div class="w-title">HDFS · bloques de 128 MB, replicación 3<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><label>Fichero ventas.csv <input type="range" min="100" max="1200" step="50" value="600" class="s"><b class="sv"></b> MB</label><span>Tumbar:</span>${[1, 2, 3, 4, 5].map((i) => `<button class="btn" data-n="${i}">DN${i}</button>`).join('')}</div>
      <div class="w-canvas" style="display:flex;gap:10px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out'), colors = d3.schemeTableau10;
    const draw = () => {
      const nb = Math.ceil(size / 128); el.querySelector('.sv').textContent = size;
      const place = d3.range(nb).map((b) => [0, 1, 2].map((r) => ((b + r * 2) % 5) + 1));
      const lost = d3.range(nb).filter((b) => place[b].every((n) => dead.has(n)));
      cv.innerHTML = `<div class="card" style="flex:0 0 150px;padding:12px"><h4 style="font-size:18px">NameNode</h4><p class="mono" style="font-size:13px;color:var(--ink)">${place.map((pl, b) => `B${b + 1} → DN${pl.join(',')}`).join('<br>')}</p></div>` +
        [1, 2, 3, 4, 5].map((n) => `<div class="card" style="flex:1;min-width:0;padding:12px;${dead.has(n) ? 'border-color:var(--red);background:var(--tint-red);opacity:.6' : ''}"><h4 style="font-size:18px">DN ${n}${dead.has(n) ? ' ✖' : ''}</h4><div style="display:flex;flex-wrap:wrap;gap:5px">${place.map((pl, b) => (pl.includes(n) ? `<span style="padding:8px 10px;border-radius:8px;color:#fff;font-weight:700;background:${colors[b % 10]};${lost.includes(b) ? 'outline:3px solid var(--red)' : ''}">B${b + 1}</span>` : '')).join('')}</div></div>`).join('');
      out.innerHTML = `⌈${size}/128⌉ = <b>${nb} bloques</b> · espacio en disco = 3 × ${size} = <b>${3 * size} MB</b>. ${dead.size ? (lost.length ? `<span style="color:var(--red)">✖ Se han perdido ${lost.map((b) => 'B' + (b + 1)).join(', ')}: sus 3 réplicas estaban en nodos caídos.</span>` : `✔ Con ${dead.size} nodo(s) caído(s) no se pierde nada: cada bloque tiene otra réplica viva.`) : 'Cada nodo procesa los bloques de su disco: <b>llevar el cómputo a los datos</b>.'}`;
    };
    el.querySelector('.s').oninput = draw;
    el.querySelectorAll('[data-n]').forEach((b) => (b.onclick = () => { const n = +b.dataset.n; dead.has(n) ? dead.delete(n) : dead.add(n); b.classList.toggle('on', dead.has(n)); draw(); }));
    draw();
  },

  deltalog(el) {
    const p = pal();
    let v, files, log, k;
    const reset = () => { v = 0; k = 2; files = [{ f: 'part-000.parquet', rows: 'pedidos 101–105', live: true }, { f: 'part-001.parquet', rows: 'pedidos 106–110', live: true }]; log = [{ v: 0, op: 'WRITE', add: ['part-000.parquet', 'part-001.parquet'], rm: [] }]; };
    reset();
    const ops = { 'INSERT 3 filas': () => { const f = `part-00${k++}.parquet`; files.push({ f, rows: 'pedidos 111–113', live: true }); return { op: 'WRITE', add: [f], rm: [] }; },
      'UPDATE pedido 108': () => { const old = files.find((x) => x.live && x.rows.includes('106')); old.live = false; const f = `part-00${k++}.parquet`; files.push({ f, rows: 'pedidos 106–110 (108 enviado)', live: true }); return { op: 'UPDATE', add: [f], rm: [old.f] }; },
      'DELETE pedido 102': () => { const old = files.find((x) => x.live && x.rows.includes('101')); if (!old) return null; old.live = false; const f = `part-00${k++}.parquet`; files.push({ f, rows: 'pedidos 101,103–105', live: true }); return { op: 'DELETE', add: [f], rm: [old.f] }; },
      'OPTIMIZE': () => { const live = files.filter((x) => x.live); if (live.length < 2) return null; live.forEach((x) => (x.live = false)); const f = `part-00${k++}.parquet`; files.push({ f, rows: 'todo compactado', live: true }); return { op: 'OPTIMIZE', add: [f], rm: live.map((x) => x.f) }; } };
    el.innerHTML = `<div class="w-title">Tabla Delta pedidos<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${Object.keys(ops).map((o) => `<button class="btn" data-o="${o}">${o}</button>`).join('')}<button class="btn rst">↺</button><label>VERSION AS OF <input type="range" min="0" max="0" value="0" class="tv"><b class="tvv"></b></label></div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div class="files" style="flex:1;overflow:auto"></div><pre class="code lg" style="flex:1;font-size:13px;overflow:auto"></pre></div><div class="w-out"></div>`;
    const out = el.querySelector('.w-out'), tv = el.querySelector('.tv');
    const liveAt = (ver) => { const s = new Set(); log.filter((e) => e.v <= ver).forEach((e) => { e.add.forEach((f) => s.add(f)); e.rm.forEach((f) => s.delete(f)); }); return s; };
    const draw = (sel = v) => {
      tv.max = v; tv.value = sel; el.querySelector('.tvv').textContent = sel;
      const L = liveAt(sel);
      el.querySelector('.files').innerHTML = `<div style="font-family:Karla;font-weight:700;margin-bottom:6px">Ficheros Parquet en el almacenamiento (versión ${sel} usa los azules)</div>` + files.map((x) => `<div style="margin-bottom:6px;padding:8px 12px;border-radius:10px;font-family:var(--font-mono);font-size:14px;background:${L.has(x.f) ? p.blue : 'var(--surface-2)'};color:${L.has(x.f) ? '#fff' : 'var(--muted)'};${L.has(x.f) ? '' : 'text-decoration:line-through'}">${x.f} <span style="opacity:.8">· ${x.rows}</span></div>`).join('');
      el.querySelector('.lg').innerHTML = '<span class="cm">_delta_log/</span>\n' + log.map((e) => `<span style="${e.v === sel ? 'background:var(--tint-blue)' : ''}">${String(e.v).padStart(20, '0')}.json  <span class="kw">${e.op}</span>\n${e.add.map((f) => `  {"add": "${f}"}`).join('\n')}${e.rm.length ? '\n' : ''}${e.rm.map((f) => `  {"remove": "${f}"}`).join('\n')}</span>`).join('\n');
    };
    el.querySelectorAll('[data-o]').forEach((b) => (b.onclick = () => { const r = ops[b.dataset.o](); if (!r) { out.innerHTML = 'No aplicable ahora.'; return; } v++; log.push({ v, ...r }); draw(); out.innerHTML = `Commit ${v}: <b>${r.op}</b>. Los ficheros nunca se modifican: se añaden nuevos y se <b>retiran</b> (lógicamente) los viejos. Los lectores ven siempre una versión completa.`; }));
    tv.oninput = () => { draw(+tv.value); out.innerHTML = `<code>SELECT * FROM pedidos VERSION AS OF ${tv.value}</code>: el registro dice qué ficheros forman esa versión (time travel).`; };
    el.querySelector('.rst').onclick = () => { reset(); draw(); out.innerHTML = ''; };
    draw();
  },

  lakehouse(el) {
    const p = pal();
    const S = { '1 · Data warehouse': [['Fuentes', 'ETL', 'Data warehouse', 'BI']], '2 · Data lake + DW': [['Fuentes', 'Data lake (ficheros)', 'ETL', 'Data warehouse', 'BI'], ['', '', 'Ciencia de datos / ML']], '3 · Lakehouse': [['Fuentes', 'Object storage + Delta/Iceberg', 'Catálogo con gobierno', 'BI · SQL · ML · streaming']] };
    const txt = { '1 · Data warehouse': 'Fiable y rápido para BI, pero caro, solo datos estructurados y poco amigo del ML.', '2 · Data lake + DW': '<span style="color:var(--red)">Dos copias, dos sistemas de seguridad, datos desincronizados y más ETL.</span>', '3 · Lakehouse': '✔ <b>Una sola copia</b> en formato abierto, con ACID, gobierno y todos los usos encima.' };
    el.innerHTML = `<div class="w-title">Evolución de la arquitectura<span class="live">INTERACTIVO</span></div><div class="w-controls">${segBtns(Object.keys(S), '3 · Lakehouse', 'm')}</div><div class="w-canvas" style="display:flex;flex-direction:column;justify-content:center;gap:14px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const show = (m) => { cv.innerHTML = S[m].map((row) => `<div style="display:flex;align-items:center;gap:10px">${row.map((b, i) => (b ? `<div class="card ${/Lakehouse|Delta|Catálogo|Data warehouse$/.test(b) ? 'hl' : ''}" style="flex:1;text-align:center;padding:16px"><h4 style="font-size:19px;margin:0">${b}</h4></div>${i < row.length - 1 && row[i + 1] ? '<span style="font-size:28px;color:var(--blue)">→</span>' : ''}` : '<div style="flex:1"></div>')).join('')}</div>`).join(''); out.innerHTML = txt[m]; };
    bindSeg(el, 'm', show); show('3 · Lakehouse');
  },

  medallion(el) {
    const p = pal();
    const B = [['{"id":"201","importe":"89.90","estado":"ENTREGADO"}', 'ok'], ['{"id":"202","fecha":"01/03/2026","importe":"49,90"}', 'fix'], ['{"id":"202","fecha":"01/03/2026","importe":"49,90"}', 'dup'], ['{"id":"203","importe":"-5"}', 'bad'], ['{"id":"204","estado":"Enviado"}', 'fix'], ['{"id":"205","cliente":null}', 'bad']];
    const stages = [['bronze', p.bronze, 'Tal como llega, solo se añade. Con metadatos de ingesta (fuente, hora).'], ['silver', p.silver, 'Tipos correctos, sin duplicados, nulos tratados, códigos unificados, uniones entre fuentes.'], ['gold', p.gold, 'Agregados y modelos para negocio: fact_ventas, ventas diarias por ciudad, features de ML.']];
    let k = 0;
    el.innerHTML = `<div class="w-title">Mercado Next en un lakehouse<span class="live">PASO A PASO</span></div><div class="w-controls"><button class="btn primary nx">Siguiente capa ›</button><button class="btn rst">↺</button></div>
      <div class="w-canvas" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      const silver = [['201', '1', '2026-03-01', '89.90', 'entregado'], ['202', '2', '2026-03-01', '49.90', 'pendiente'], ['204', '3', '2026-03-02', '149.00', 'enviado']];
      const gold = [['Madrid', '2026-03-01', '89.90'], ['Sevilla', '2026-03-01', '49.90'], ['Madrid', '2026-03-02', '149.00']];
      cv.innerHTML = stages.map(([n, c, d], i) => `<div class="card" style="border-top:8px solid ${c};${i > k ? 'opacity:.3' : ''}"><h4 style="text-transform:uppercase;letter-spacing:.1em">${n === 'bronze' ? '🥉' : n === 'silver' ? '🥈' : '🥇'} ${n}</h4><p style="font-size:15px">${d}</p><div style="margin-top:10px">${
        i === 0 ? B.map(([j, s]) => `<div class="mono" style="font-size:12px;padding:4px 6px;margin-bottom:4px;border-radius:6px;background:${k >= 1 && s === 'bad' ? 'var(--tint-red)' : k >= 1 && s === 'dup' ? 'var(--tint-gray)' : 'var(--surface-2)'};${k >= 1 && (s === 'bad' || s === 'dup') ? 'text-decoration:line-through' : ''}">${esc(j)}</div>`).join('')
          : i === 1 ? `<table class="edit" style="width:100%;font-size:12px">${silver.map((r) => `<tr>${r.map((x) => `<td style="padding:3px 5px;font-family:var(--font-mono)">${x}</td>`).join('')}</tr>`).join('')}</table>`
          : `<table class="edit" style="width:100%;font-size:13px"><tr><th>ciudad</th><th>fecha</th><th>ventas</th></tr>${gold.map((r) => `<tr>${r.map((x) => `<td style="padding:4px 6px;font-family:var(--font-mono)">${x}</td>`).join('')}</tr>`).join('')}</table>`}</div></div>`).join('');
      out.innerHTML = ['Bronze: 6 registros de la web y del ERP, con formatos distintos, un duplicado y errores.', 'Silver: se descartan el duplicado, el importe negativo y el pedido sin cliente; se unifican fechas, decimales y estados.', 'Gold: ventas por ciudad y día, listas para Power BI. Si se descubre un error, se reconstruye desde bronze.'][k];
    };
    el.querySelector('.nx').onclick = () => { k = Math.min(2, k + 1); draw(); };
    el.querySelector('.rst').onclick = () => { k = 0; draw(); };
    draw();
  },

  unity(el, args = {}) {
    const p = pal();
    const data = { n: 'metastore (región)', t: 'metastore', c: [{ n: 'dev', t: 'catálogo', c: [{ n: 'ventas', t: 'esquema', c: [{ n: 'pedidos', t: 'tabla' }] }] }, { n: 'prod', t: 'catálogo', c: [{ n: 'bronze', t: 'esquema', c: [{ n: 'ventas', t: 'tabla' }, { n: 'ficheros_entrada', t: 'volumen' }] }, { n: 'silver', t: 'esquema', c: [{ n: 'clientes', t: 'tabla' }, { n: 'pedidos', t: 'tabla' }] }, { n: 'gold', t: 'esquema', c: [{ n: 'ventas_por_ciudad', t: 'tabla' }, { n: 'v_kpi', t: 'vista' }, { n: 'mascara_email', t: 'función' }] }, { n: 'ml', t: 'esquema', c: [{ n: 'prediccion_abandono', t: 'modelo' }] }] }] };
    const icon = { metastore: '🏛', 'catálogo': '📚', esquema: '📁', tabla: '🧊', vista: '👁', volumen: '🗂', función: 'ƒ', modelo: '🤖' };
    const G = new Map();
    const { cv, ctl, out } = frame(el, { title: args.grants ? 'Permisos para el grupo `analistas`' : 'Espacio de nombres de Unity Catalog', live: true, controls: args.grants ? `<span>Conceder:</span>${segBtns(['USE CATALOG', 'USE SCHEMA', 'SELECT'], 'SELECT', 'g')}<span style="color:var(--muted)">y haz clic en un objeto</span><button class="btn rst">↺</button>` : '' });
    let priv = 'SELECT';
    const { s, W, H } = svg(cv);
    const root = d3.hierarchy(data, (d) => d.c); d3.tree().size([H - 40, W - 260])(root); root.each((d) => { const t = d.x; d.x = d.y + 60; d.y = t; });
    const fq = (d) => d.ancestors().reverse().slice(1).map((x) => x.data.n).join('.');
    s.append('g').selectAll('path').data(root.links()).join('path').attr('d', d3.linkHorizontal().x((d) => d.x + 30).y((d) => d.y + 20)).attr('fill', 'none').attr('stroke', p.line).attr('stroke-width', 2);
    const g = s.append('g').selectAll('g').data(root.descendants()).join('g').attr('transform', (d) => `translate(${d.x + 30},${d.y + 20})`).style('cursor', 'pointer');
    g.append('rect').attr('x', (d) => -Math.max(56, d.data.n.length * 4.6 + 22)).attr('y', -17).attr('width', (d) => Math.max(112, d.data.n.length * 9.2 + 44)).attr('height', 34).attr('rx', 10).attr('fill', p.surface).attr('stroke', p.gray).attr('stroke-width', 2);
    g.append('text').text((d) => `${icon[d.data.t]} ${d.data.n}`).attr('text-anchor', 'middle').attr('dy', 5).attr('font-size', 13).attr('font-weight', 700).attr('fill', p.ink);
    const has = (d, pr) => d.ancestors().some((a) => (G.get(a) || new Set()).has(pr));
    const canRead = (d) => d.data.t === 'tabla' || d.data.t === 'vista' ? has(d, 'SELECT') && has(d.parent, 'USE SCHEMA') && has(d.parent.parent, 'USE CATALOG') : false;
    const paint = () => { if (!args.grants) return; g.select('rect').attr('fill', (d) => (canRead(d) ? p.blue : [...(G.get(d) || [])].length ? p.tint : p.surface)).attr('stroke', (d) => (has(d, 'SELECT') || has(d, 'USE SCHEMA') || has(d, 'USE CATALOG') ? p.blue : p.gray)); g.select('text').attr('fill', (d) => (canRead(d) ? '#fff' : p.ink)); };
    g.on('click', (e, d) => {
      if (!args.grants) { out.innerHTML = `<b>${d.data.t}</b> · nombre completo: <code>${fq(d) || 'metastore'}</code>`; g.select('rect').attr('stroke', (x) => (x === d ? p.blue : p.gray)).attr('stroke-width', (x) => (x === d ? 4 : 2)); return; }
      if (d.depth === 0) return;
      if (!G.has(d)) G.set(d, new Set()); G.get(d).add(priv); paint();
      const t = { 'catálogo': 'CATALOG', esquema: 'SCHEMA', tabla: 'TABLE', vista: 'TABLE', volumen: 'VOLUME', función: 'FUNCTION', modelo: 'MODEL' }[d.data.t];
      const readable = root.descendants().filter(canRead).map(fq);
      out.innerHTML = `<code>GRANT ${priv} ON ${t} ${fq(d)} TO \`analistas\`;</code><br>${readable.length ? `✔ analistas puede leer: <b>${readable.join(', ')}</b>` : 'Todavía no puede leer ninguna tabla: hacen falta USE CATALOG + USE SCHEMA + SELECT.'}`;
    });
    if (args.grants) { bindSeg(el, 'g', (x) => (priv = x)); ctl.querySelector('.rst').onclick = () => { G.clear(); paint(); out.innerHTML = ''; }; out.innerHTML = 'Elige un privilegio y haz clic en un catálogo, esquema o tabla. Los permisos se heredan hacia abajo.'; }
    else out.innerHTML = 'Catálogos por entorno, esquemas por capa o dominio, y dentro: tablas, vistas, volúmenes, funciones y modelos.';
  },

  managedext(el) {
    const p = pal();
    let st = { m: { t: true, f: true }, e: { t: true, f: true } };
    el.innerHTML = `<div class="w-title">DROP TABLE en cada caso<span class="live">INTERACTIVO</span></div><div class="w-controls"><button class="btn" data-d="m">DROP TABLE pedidos (gestionada)</button><button class="btn" data-d="e">DROP TABLE pedidos_historico (externa)</button><button class="btn rst">↺</button></div>
      <div class="w-canvas" style="display:grid;grid-template-columns:1fr 1fr;gap:16px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      cv.innerHTML = [['m', 'Gestionada', 'Unity Catalog decide la ubicación'], ['e', 'Externa', 'Ruta abfss://… de la organización']].map(([k, n, d]) => `<div class="card"><h4>${n}</h4><p>${d}</p>
        <div class="card ${st[k].t ? 'hl' : ''}" style="margin-top:12px;${st[k].t ? '' : 'opacity:.35;text-decoration:line-through'}"><h4 style="font-size:17px">📇 Metadatos en Unity Catalog</h4></div>
        <div class="card" style="margin-top:10px;${st[k].f ? '' : 'border-color:var(--red);background:var(--tint-red);opacity:.6'}"><h4 style="font-size:17px">🗄 Ficheros Parquet + _delta_log</h4><p>${st[k].f ? 'en el almacenamiento' : 'borrados (tras el periodo de retención)'}</p></div></div>`).join('');
    };
    el.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => { const k = b.dataset.d; st[k].t = false; if (k === 'm') st[k].f = false; draw(); out.innerHTML = k === 'm' ? 'Gestionada: desaparecen la tabla <b>y sus datos</b> (se pueden recuperar unos días con UNDROP).' : 'Externa: desaparece la definición, pero <b>los ficheros siguen</b> en la ruta de la organización.'; }));
    el.querySelector('.rst').onclick = () => { st = { m: { t: true, f: true }, e: { t: true, f: true } }; draw(); out.innerHTML = ''; };
    draw();
  },

  optimize(el) {
    const p = pal();
    let files = [], ver = 0, old = [], clustered = false;
    const ciudades = ['Madrid', 'Sevilla', 'Bilbao', 'Valencia'];
    el.innerHTML = `<div class="w-title">prod.gold.ventas · ficheros<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><button class="btn primary ld">Carga cada 5 min ×12</button><button class="btn op">OPTIMIZE</button><label><input type="checkbox" class="cl"> CLUSTER BY (ciudad)</label><button class="btn vc">VACUUM</button><button class="btn rst">↺</button><span class="mono" style="font-size:14px">WHERE ciudad = 'Sevilla'</span></div>
      <div class="w-canvas" style="display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      const read = files.filter((f) => !f.cities || f.cities.includes('Sevilla'));
      cv.innerHTML = files.map((f) => { const r = read.includes(f); const w = Math.max(40, Math.min(260, f.mb * 2)); return `<div style="width:${w}px;height:${f.mb > 20 ? 90 : 46}px;border-radius:8px;background:${r ? p.blue : 'var(--surface-2)'};color:${r ? '#fff' : 'var(--muted)'};font-size:12px;padding:5px;font-family:var(--font-mono)">${f.mb} MB${f.cities ? '<br>' + f.cities.join(',') : ''}</div>`; }).join('') + old.map((f) => `<div style="width:40px;height:46px;border-radius:8px;border:2px dashed var(--line);font-size:11px;padding:4px;color:var(--muted)">v${f}</div>`).join('');
      const t = read.length * 0.05 + d3.sum(read, (f) => f.mb) * 0.004;
      out.innerHTML = `${files.length} ficheros activos · la consulta abre <b>${read.length}</b> · tiempo estimado ≈ <b>${t.toFixed(2)} s</b> (cada fichero tiene un coste fijo de apertura). ${old.length ? `${old.length} ficheros antiguos se conservan para Time Travel.` : ''}`;
    };
    el.querySelector('.ld').onclick = () => { for (let i = 0; i < 12; i++) files.push({ mb: 2 + Math.round(Math.random() * 4), cities: null }); ver++; draw(); };
    el.querySelector('.op').onclick = () => { if (files.length < 2) return; const total = d3.sum(files, (f) => f.mb); files.forEach(() => old.push(ver)); ver++;
      files = clustered ? ciudades.map((c) => ({ mb: Math.round(total / 4), cities: [c] })) : d3.range(Math.max(1, Math.ceil(total / 100))).map(() => ({ mb: Math.round(total / Math.ceil(total / 100)), cities: null }));
      draw(); out.innerHTML += clustered ? ' ✔ Con <b>liquid clustering</b> por ciudad, el filtro salta los ficheros de otras ciudades.' : ' ✔ Compactado: pocos ficheros grandes.'; };
    el.querySelector('.cl').onchange = (e) => (clustered = e.target.checked);
    el.querySelector('.vc').onclick = () => { const n = old.length; old = []; draw(); out.innerHTML = `VACUUM: borrados ${n} ficheros no referenciados (con más de 7 días en la realidad). <b>Ya no se puede viajar</b> a las versiones que los usaban.`; };
    el.querySelector('.rst').onclick = () => { files = []; old = []; ver = 0; draw(); out.innerHTML = ''; };
    for (let i = 0; i < 24; i++) files.push({ mb: 2 + Math.round(Math.random() * 4), cities: null }); draw();
  },

  mask(el) {
    const rows = [[1, 'Ana Ruiz', 'ana.ruiz@mail.com', 'Madrid'], [2, 'Luis Gil', 'luis.gil@mail.com', 'Sevilla'], [3, 'Marta Sanz', 'marta.sanz@mail.com', 'Madrid'], [4, 'Iker Mora', 'iker.mora@mail.com', 'Bilbao']];
    el.innerHTML = `<div class="w-title">SELECT * FROM prod.silver.clientes<span class="live">INTERACTIVO</span></div><div class="w-controls"><span>Ejecuta:</span><div class="seg"><button data-u="analista" class="active">ana · grupo analistas</button><button data-u="soporte">sergio · grupo soporte</button></div></div><div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const show = (u) => { el.querySelectorAll('[data-u]').forEach((b) => b.classList.toggle('active', b.dataset.u === u));
      cv.innerHTML = `<table class="edit" style="width:100%"><thead><tr><th>cliente_id</th><th>nombre</th><th>email</th><th>ciudad</th></tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v, j) => `<td style="padding:9px 12px;font-family:var(--font-mono);font-size:17px;${j === 2 ? 'background:var(--tint-blue);font-weight:700' : ''}">${j === 2 && u !== 'soporte' ? String(v).replace(/^[^@]+/, '***') : v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      out.innerHTML = u === 'soporte' ? 'El grupo <b>soporte</b> ve el email completo.' : 'Para el resto, la máscara sustituye la parte local del email: <code>***@mail.com</code>. La consulta es idéntica.'; };
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-u]'); if (b) show(b.dataset.u); };
    show('analista');
  },

  dlt(el) {
    const life = widgetScope(el);
    const p = pal();
    let tot = { b: 0, s: 0, g: 0, drop: 0 };
    el.innerHTML = `<div class="w-title">Pipeline declarativo<span class="live">SIMULADOR</span></div><div class="w-controls"><button class="btn primary go">▶ Llega un lote de 50 ventas</button><label>% con importe ≤ 0 <input type="range" min="0" max="50" value="10" class="e"><b class="ev"></b></label><button class="btn rst">↺</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      el.querySelector('.ev').textContent = el.querySelector('.e').value + ' %';
      cv.innerHTML = `<div style="display:flex;align-items:center;gap:12px;height:100%">${[['📂 ficheros JSON', 'read_files', null], ['bronze_ventas', 'STREAMING TABLE', tot.b], ['silver_ventas', 'EXPECT (importe > 0) ON VIOLATION DROP ROW', tot.s], ['gold_ventas_dia', 'MATERIALIZED VIEW', tot.g]].map(([n, d, v], i) => `<div class="card ${i ? 'hl' : ''}" style="flex:1;text-align:center"><h4 style="font-family:var(--font-mono);font-size:17px">${n}</h4><p style="font-size:14px">${d}</p>${v !== null ? `<div class="big">${v}</div><p>filas</p>` : ''}${i === 2 && tot.drop ? `<p style="color:var(--red);font-weight:700">${tot.drop} descartadas por la expectativa</p>` : ''}</div>${i < 3 ? '<span style="font-size:30px;color:var(--blue)">→</span>' : ''}`).join('')}</div>`;
    };
    el.querySelector('.go').onclick = async () => { const bad = Math.round(50 * (+el.querySelector('.e').value) / 100); tot.b += 50; draw(); if (!(await life.sleep(500))) return; tot.s += 50 - bad; tot.drop += bad; draw(); if (!(await life.sleep(500))) return; tot.g = Math.min(tot.s, Math.ceil(tot.s / 12)); draw();
      out.innerHTML = `El sistema decide el orden y procesa <b>solo lo nuevo</b> (incremental). La expectativa descartó ${bad} filas y registra las métricas de calidad.`; };
    el.querySelector('.e').oninput = draw;
    el.querySelector('.rst').onclick = () => { tot = { b: 0, s: 0, g: 0, drop: 0 }; draw(); out.innerHTML = ''; };
    draw();
  },

  mlflow(el) {
    const steps = [['1 · Features', 'gasto_90d, pedidos_90d, dias_desde_ultimo… calculadas con SQL o Spark y guardadas como tabla en Unity Catalog.', 'prod.ml.features_clientes'], ['2 · Entrenar + MLflow', 'Cada entrenamiento registra parámetros, métricas y el modelo.', 'run 7f3a · AUC 0.87'], ['3 · Registrar en Unity Catalog', 'El modelo es un objeto más, con versiones y permisos.', 'prod.ml.prediccion_abandono v3'], ['4 · Inferencia', 'Por lotes (una predicción por fila) o como endpoint en tiempo real.', 'gold.clientes_riesgo']];
    let k = 0;
    el.innerHTML = `<div class="w-title">Del lakehouse al modelo<span class="live">PASO A PASO</span></div><div class="w-controls"><button class="btn primary nx">Siguiente ›</button><button class="btn rst">↺</button></div><div class="w-canvas" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-content:start"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => { cv.innerHTML = steps.map(([t, d, o], i) => `<div class="card ${i === k ? 'hl' : ''}" style="${i > k ? 'opacity:.35' : ''};transition:.3s"><h4>${t}</h4><p>${d}</p><p class="mono" style="margin-top:10px;font-size:14px;color:var(--blue-d)">${o}</p></div>`).join(''); out.innerHTML = k === 3 ? '✔ BI y ML sobre las mismas tablas gobernadas, sin copias.' : ''; };
    el.querySelector('.nx').onclick = () => { k = Math.min(3, k + 1); draw(); };
    el.querySelector('.rst').onclick = () => { k = 0; draw(); };
    draw();
  }
};
