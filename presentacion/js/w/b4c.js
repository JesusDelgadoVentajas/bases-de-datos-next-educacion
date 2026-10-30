// Widgets de los Temas 16 y 17
import { pal, frame, svg, chart, esc, highlight, widgetScope } from '../ui.js';

const CLI = ['Ana', 'Luis', 'Marta', 'Iker', 'Sofía', 'Pablo', 'Elena'];
const PRO = ['K70', 'TK60', 'M50', 'G300', 'Monitor 27"', 'Monitor 24"', 'Lámpara', 'Alfombrilla', 'Webcam'];
// [cliente, producto, fecha] desde las líneas de pedido de Mercado Next
const COMPRAS = [[0, 0, '2025-11-03'], [0, 2, '2025-11-03'], [1, 4, '2025-11-15'], [0, 7, '2025-12-01'], [0, 6, '2025-12-01'], [2, 1, '2025-12-20'], [2, 2, '2025-12-20'], [2, 5, '2025-12-20'], [3, 3, '2026-01-08'], [3, 7, '2026-01-08'],
  [0, 4, '2026-01-15'], [4, 0, '2026-01-22'], [1, 1, '2026-02-02'], [5, 6, '2026-02-05'], [5, 2, '2026-02-05'], [3, 5, '2026-02-10'], [3, 0, '2026-02-10']];
const RECO = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [3, 6], [5, 3]];

export const widgets = {
  // ---------- property graph frente a RDF ----------
  rdf(el) {
    const p = pal();
    el.innerHTML = `<div class="w-title">«Ana compró el K70 el 3 de noviembre»<span class="live">INTERACTIVO</span></div><div class="w-controls"><div class="seg"><button data-m="pg" class="active">Property graph</button><button data-m="rdf">RDF (tripletas)</button></div></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const show = (m) => {
      el.querySelectorAll('[data-m]').forEach((b) => b.classList.toggle('active', b.dataset.m === m));
      cv.innerHTML = ''; const { s, W, H } = svg(cv, 860, 380);
      if (m === 'pg') {
        s.append('line').attr('x1', 200).attr('y1', 190).attr('x2', 640).attr('y2', 190).attr('stroke', p.blue).attr('stroke-width', 4).attr('marker-end', 'url(#ah)');
        s.append('defs').html(`<marker id="ah" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${p.blue}"/></marker>`);
        [[150, 'Ana', ':Cliente', 'nombre: "Ana"\nciudad: "Madrid"'], [700, 'K70', ':Producto', 'nombre: "Teclado K70"\nprecio: 89.90']].forEach(([x, n, l, props]) => {
          s.append('circle').attr('cx', x).attr('cy', 190).attr('r', 62).attr('fill', l === ':Cliente' ? p.blue : p.gray);
          s.append('text').text(n).attr('x', x).attr('y', 186).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-weight', 700).attr('font-size', 22);
          s.append('text').text(l).attr('x', x).attr('y', 210).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 15);
          props.split('\n').forEach((t, i) => s.append('text').text(t).attr('x', x).attr('y', 290 + i * 22).attr('text-anchor', 'middle').attr('font-family', 'IBM Plex Mono').attr('font-size', 15).attr('fill', p.ink));
        });
        s.append('rect').attr('x', 330).attr('y', 150).attr('width', 180).attr('height', 32).attr('rx', 8).attr('fill', p.surface).attr('stroke', p.blue);
        s.append('text').text(':COMPRO').attr('x', 420).attr('y', 172).attr('text-anchor', 'middle').attr('font-weight', 700).attr('fill', p.blueD);
        s.append('text').text('{ fecha: 2025-11-03 }').attr('x', 420).attr('y', 222).attr('text-anchor', 'middle').attr('font-family', 'IBM Plex Mono').attr('font-size', 15).attr('fill', p.ink);
        out.innerHTML = 'La fecha es una <b>propiedad de la relación</b>. Identificadores internos.';
      } else {
        const T = [['ex:ana', 'rdf:type', 'ex:Cliente'], ['ex:ana', 'ex:nombre', '"Ana"'], ['ex:ana', 'ex:ciudad', '"Madrid"'], ['ex:k70', 'rdf:type', 'ex:Producto'], ['ex:k70', 'ex:precio', '"89.90"^^xsd:decimal'], ['ex:compra1', 'ex:cliente', 'ex:ana'], ['ex:compra1', 'ex:producto', 'ex:k70'], ['ex:compra1', 'ex:fecha', '"2025-11-03"^^xsd:date']];
        T.forEach(([a, b, c], i) => { const y = 34 + i * 43; [[a, 40, p.blue], [b, 300, p.gray], [c, 560, p.blueD]].forEach(([t, x, col]) => { s.append('rect').attr('x', x).attr('y', y - 22).attr('width', 240).attr('height', 34).attr('rx', 8).attr('fill', col).attr('opacity', 0.15); s.append('text').text(t).attr('x', x + 10).attr('y', y).attr('font-family', 'IBM Plex Mono').attr('font-size', 15).attr('fill', p.ink); }); });
        out.innerHTML = 'Todo son <b>tripletas</b> sujeto – predicado – objeto con URI globales (ex: = http://ejemplo.org/). Para poner la fecha a la compra hay que convertir la compra en un recurso. Se consulta con <b>SPARQL</b>.';
      }
    };
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-m]'); if (b) show(b.dataset.m); };
    show('pg');
  },

  // ---------- grafo de fuerzas con consultas Cypher ----------
  graph(el, args = {}) {
    let alive = true, timer;
    const p = pal();
    const nodes = [...CLI.map((n, i) => ({ id: 'c' + i, n, l: 'Cliente' })), ...PRO.map((n, i) => ({ id: 'p' + i, n, l: 'Producto' }))];
    const links = [...COMPRAS.map(([c, pr, f]) => ({ source: 'c' + c, target: 'p' + pr, t: 'COMPRO', f })), ...RECO.map(([a, b]) => ({ source: 'c' + a, target: 'c' + b, t: 'RECOMIENDA_A' }))];
    const Q = {
      '¿Qué compró Ana?': [`MATCH (c:Cliente {nombre: 'Ana'})-[r:COMPRO]->(p:Producto)\nRETURN p.nombre, r.fecha ORDER BY r.fecha DESC;`, () => { const ls = links.filter((l) => l.t === 'COMPRO' && l.source.id === 'c0'); return { ns: ['c0', ...ls.map((l) => l.target.id)], ls, rows: [['p.nombre', 'r.fecha'], ...ls.sort((a, b) => b.f.localeCompare(a.f)).map((l) => [l.target.n, l.f])] }; }],
      'Recomendación': [`MATCH (ana:Cliente {nombre:'Ana'})-[:COMPRO]->(:Producto)<-[:COMPRO]-(otro:Cliente),\n      (otro)-[:COMPRO]->(rec:Producto)\nWHERE otro <> ana AND NOT EXISTS { (ana)-[:COMPRO]->(rec) }\nRETURN rec.nombre AS recomendacion, count(DISTINCT otro) AS apoyos\nORDER BY apoyos DESC LIMIT 5;`, () => {
        const mine = new Set(links.filter((l) => l.t === 'COMPRO' && l.source.id === 'c0').map((l) => l.target.id));
        const otros = new Set(links.filter((l) => l.t === 'COMPRO' && mine.has(l.target.id) && l.source.id !== 'c0').map((l) => l.source.id));
        const recL = links.filter((l) => l.t === 'COMPRO' && otros.has(l.source.id) && !mine.has(l.target.id));
        const cnt = d3.rollups(recL, (v) => new Set(v.map((x) => x.source.id)).size, (l) => l.target.n).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5);
        return { ns: ['c0', ...mine, ...otros, ...recL.map((l) => l.target.id)], ls: [...links.filter((l) => l.t === 'COMPRO' && ((l.source.id === 'c0') || (otros.has(l.source.id) && mine.has(l.target.id)))), ...recL], rows: [['recomendacion', 'apoyos'], ...cnt] };
      }],
      'Alcance *1..3': [`MATCH (ana:Cliente {nombre: 'Ana'})-[:RECOMIENDA_A*1..3]->(alcanzado:Cliente)\nRETURN DISTINCT alcanzado.nombre;`, () => {
        const reach = new Map(); let front = ['c0']; const ls = [];
        for (let d = 1; d <= 3; d++) { const nx = []; front.forEach((f) => links.filter((l) => l.t === 'RECOMIENDA_A' && l.source.id === f).forEach((l) => { ls.push(l); if (!reach.has(l.target.id)) { reach.set(l.target.id, d); nx.push(l.target.id); } })); front = nx; }
        return { ns: ['c0', ...reach.keys()], ls, rows: [['alcanzado.nombre', 'saltos'], ...[...reach].map(([id, d]) => [nodes.find((n) => n.id === id).n, d])] };
      }],
      'shortestPath Ana–Iker': [`MATCH p = shortestPath(\n  (a:Cliente {nombre:'Ana'})-[:RECOMIENDA_A*]-(b:Cliente {nombre:'Iker'}))\nRETURN [n IN nodes(p) | n.nombre] AS ruta, length(p) AS saltos;`, () => {
        const prev = { c0: null }; const q = ['c0'];
        while (q.length) { const u = q.shift(); if (u === 'c3') break; links.filter((l) => l.t === 'RECOMIENDA_A' && (l.source.id === u || l.target.id === u)).forEach((l) => { const v = l.source.id === u ? l.target.id : l.source.id; if (!(v in prev)) { prev[v] = [u, l]; q.push(v); } }); }
        const path = [], ls = []; let x = 'c3'; while (x) { path.unshift(x); if (prev[x]) { ls.push(prev[x][1]); x = prev[x][0]; } else x = null; }
        return { ns: path, ls, rows: [['ruta', 'saltos'], [path.map((id) => nodes.find((n) => n.id === id).n).join(' → '), path.length - 1]] };
      }],
      'Más comprados': [`MATCH (:Cliente)-[:COMPRO]->(p:Producto)\nRETURN p.nombre, count(*) AS compras\nORDER BY compras DESC LIMIT 4;`, () => { const c = d3.rollups(links.filter((l) => l.t === 'COMPRO'), (v) => v.length, (l) => l.target.id).sort((a, b) => b[1] - a[1]).slice(0, 4); return { ns: c.map((x) => x[0]), ls: links.filter((l) => l.t === 'COMPRO' && c.some((x) => x[0] === l.target.id)), rows: [['p.nombre', 'compras'], ...c.map(([id, n]) => [nodes.find((x) => x.id === id).n, n])] }; }]
    };
    el.innerHTML = `<div class="w-title">Grafo de Mercado Next<span class="live">INTERACTIVO</span></div>
      ${args.cypher ? `<div class="w-controls">${Object.keys(Q).map((k, i) => `<button class="btn ${i ? '' : 'on'}" data-q="${k}">${k}</button>`).join('')}<button class="btn" data-q="">Limpiar</button></div>` : ''}
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div class="w-canvas" style="flex:1.5"></div>${args.cypher ? '<div style="flex:1;display:flex;flex-direction:column;gap:10px;min-height:0"><pre class="code cy" style="font-size:14px"></pre><div class="rs" style="overflow:auto"></div></div>' : ''}</div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const { s, W, H } = svg(cv);
    s.append('defs').html(`<marker id="ga" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="${p.mid}"/></marker><marker id="gb" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="${p.amber}"/></marker>`);
    const sim = d3.forceSimulation(nodes).force('link', d3.forceLink(links).id((d) => d.id).distance((l) => (l.t === 'COMPRO' ? 140 : 110))).force('charge', d3.forceManyBody().strength(-650)).force('center', d3.forceCenter(W / 2, H / 2)).force('collide', d3.forceCollide(34));
    const L = s.append('g').selectAll('line').data(links).join('line').attr('stroke', (l) => (l.t === 'COMPRO' ? p.mid : p.amber)).attr('stroke-width', (l) => (l.t === 'COMPRO' ? 1.6 : 3)).attr('marker-end', (l) => (l.t === 'COMPRO' ? 'url(#ga)' : 'url(#gb)'));
    const G = s.append('g').selectAll('g').data(nodes).join('g').style('cursor', 'grab').call(d3.drag().on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }).on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; }).on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
    G.append('circle').attr('r', (d) => (d.l === 'Cliente' ? 24 : 20)).attr('fill', (d) => (d.l === 'Cliente' ? p.blue : p.gray)).attr('stroke', p.surface).attr('stroke-width', 3);
    G.append('text').text((d) => d.n).attr('text-anchor', 'middle').attr('dy', (d) => (d.l === 'Cliente' ? 5 : 38)).attr('font-size', 13).attr('font-weight', 700).attr('fill', (d) => (d.l === 'Cliente' ? '#fff' : p.ink));
    G.on('mouseenter', (e, d) => { const deg = links.filter((l) => l.source.id === d.id || l.target.id === d.id).length; out.innerHTML = `<b>(:${d.l} {nombre: "${esc(d.n)}"})</b> · ${deg} relación(es)`; });
    L.on('mouseenter', (e, l) => { out.innerHTML = `<b>(${esc(l.source.n)})-[:${l.t}${l.f ? ` {fecha: ${l.f}}` : ''}]->(${esc(l.target.n)})</b>`; });
    sim.on('tick', () => { nodes.forEach((d) => { d.x = Math.max(30, Math.min(W - 30, d.x)); d.y = Math.max(30, Math.min(H - 30, d.y)); }); L.attr('x1', (d) => d.source.x).attr('y1', (d) => d.source.y).attr('x2', (d) => d.target.x).attr('y2', (d) => d.target.y); G.attr('transform', (d) => `translate(${d.x},${d.y})`); });
    const runQ = (k) => {
      if (!alive) return;
      el.querySelectorAll('[data-q]').forEach((b) => b.classList.toggle('on', b.dataset.q === k));
      if (!k) { G.attr('opacity', 1); L.attr('opacity', 1).attr('stroke-width', (l) => (l.t === 'COMPRO' ? 1.6 : 3)); el.querySelector('.cy').innerHTML = ''; el.querySelector('.rs').innerHTML = ''; return; }
      const [cy, f] = Q[k]; const r = f(); const ns = new Set(r.ns), ls = new Set(r.ls);
      G.transition().duration(400).attr('opacity', (d) => (ns.has(d.id) ? 1 : 0.15)); L.transition().duration(400).attr('opacity', (l) => (ls.has(l) ? 1 : 0.06)).attr('stroke-width', (l) => (ls.has(l) ? 4 : 1.5));
      el.querySelector('.cy').innerHTML = highlight(cy, 'cypher');
      el.querySelector('.rs').innerHTML = `<table class="edit" style="width:100%"><thead><tr>${r.rows[0].map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${r.rows.slice(1).map((x) => `<tr>${x.map((v) => `<td style="padding:6px 10px">${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    };
    if (args.cypher) { el.querySelector('.w-controls').onclick = (e) => { const b = e.target.closest('[data-q]'); if (b) runQ(b.dataset.q); }; timer = setTimeout(() => runQ('¿Qué compró Ana?'), 900); }
    out.innerHTML = 'Azul = :Cliente · gris = :Producto · gris fino = COMPRO · ámbar = RECOMIENDA_A.';
    return () => { alive = false; clearTimeout(timer); s.selectAll('*').interrupt(); sim.stop(); };
  },

  // ---------- PageRank en vivo ----------
  pagerank(el) {
    const life = widgetScope(el);
    let alive = true, converging = false;
    const p = pal();
    const names = ['Ana', 'Luis', 'Marta', 'Iker', 'Sofía', 'Pablo', 'Elena', 'Raquel', 'Hugo', 'Nerea'];
    const E = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [3, 6], [5, 3], [7, 3], [8, 3], [9, 2], [6, 0], [2, 0], [8, 9], [1, 3]];
    const nodes = names.map((n, i) => ({ id: i, n, pr: 1 / names.length }));
    let links = E.map(([a, b]) => ({ source: a, target: b })), d = 0.85, it = 0, sel = null;
    el.innerHTML = `<div class="w-title">PageRank sobre RECOMIENDA_A<span class="live">EN VIVO</span></div>
      <div class="w-controls"><button class="btn primary one">Iterar 1 vez</button><button class="btn all">Converger</button><label>d <input type="range" min="0.5" max="0.99" step="0.01" value="0.85" class="d"><b class="dv"></b></label><button class="btn rst">↺</button><span class="pill it"></span></div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div class="w-canvas" style="flex:1.6"></div><div class="rk" style="flex:1;overflow:auto"></div></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const { s, W, H } = svg(cv);
    s.append('defs').html(`<marker id="pa" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="${p.mid}"/></marker>`);
    const gl = s.append('g'), gn = s.append('g');
    const sim = d3.forceSimulation(nodes).force('link', d3.forceLink(links).id((x) => x.id).distance(110)).force('charge', d3.forceManyBody().strength(-500)).force('center', d3.forceCenter(W / 2, H / 2)).force('collide', d3.forceCollide(40));
    const rS = () => d3.scaleSqrt().domain([0, d3.max(nodes, (x) => x.pr)]).range([12, 46]);
    let L, G;
    const render = () => {
      if (!alive) return;
      L = gl.selectAll('line').data(links).join('line').attr('stroke', p.mid).attr('stroke-width', 2).attr('marker-end', 'url(#pa)');
      G = gn.selectAll('g').data(nodes).join((en) => { const g = en.append('g').style('cursor', 'pointer'); g.append('circle'); g.append('text').attr('class', 'n'); g.append('text').attr('class', 's'); return g; });
      const r = rS();
      G.select('circle').transition().duration(500).attr('r', (x) => r(x.pr)).attr('fill', (x) => (x.id === sel ? p.amber : p.blue)).attr('stroke', p.surface).attr('stroke-width', 3);
      G.select('.n').text((x) => x.n).attr('text-anchor', 'middle').attr('dy', 5).attr('font-size', 13).attr('font-weight', 700).attr('fill', '#fff');
      G.on('click', (e, x) => {
        if (sel === null) { sel = x.id; out.innerHTML = `Origen: <b>${x.n}</b>. Haz clic en el destino del nuevo enlace.`; }
        else if (sel !== x.id) { links.push({ source: nodes[sel], target: x }); out.innerHTML = `Nuevo enlace ${nodes[sel].n} → ${x.n}. Itera para ver cómo cambia la importancia.`; sel = null; sim.force('link').links(links); sim.alpha(0.5).restart(); }
        render();
      });
      const rk = nodes.slice().sort((a, b) => b.pr - a.pr);
      el.querySelector('.rk').innerHTML = `<table class="edit" style="width:100%"><thead><tr><th>#</th><th>cliente</th><th>PageRank</th></tr></thead><tbody>${rk.map((x, i) => `<tr><td style="padding:5px 10px">${i + 1}</td><td style="padding:5px 10px;font-weight:700">${x.n}</td><td style="padding:5px 10px;font-family:var(--font-mono)">${x.pr.toFixed(4)}<div style="height:6px;background:var(--blue);border-radius:3px;width:${(x.pr / rk[0].pr) * 100}%"></div></td></tr>`).join('')}</tbody></table>`;
      el.querySelector('.it').textContent = `iteración ${it}`;
    };
    const step = () => {
      const N = nodes.length, outdeg = nodes.map((x) => links.filter((l) => (l.source.id ?? l.source) === x.id).length);
      const nx = nodes.map((v) => (1 - d) / N + d * links.filter((l) => (l.target.id ?? l.target) === v.id).reduce((a, l) => { const u = l.source.id ?? l.source; return a + nodes[u].pr / outdeg[u]; }, 0));
      const dang = nodes.filter((x, i) => !outdeg[i]).reduce((a, x) => a + x.pr, 0) * d / N; // nodos sin salida reparten
      const delta = d3.sum(nodes, (x, i) => Math.abs(nx[i] + dang - x.pr));
      nodes.forEach((x, i) => (x.pr = nx[i] + dang)); it++; return delta;
    };
    sim.on('tick', () => {
      nodes.forEach((x) => { x.x = Math.max(40, Math.min(W - 40, x.x)); x.y = Math.max(40, Math.min(H - 40, x.y)); });
      const r = rS();
      L.attr('x1', (l) => l.source.x).attr('y1', (l) => l.source.y).attr('x2', (l) => { const dx = l.target.x - l.source.x, dy = l.target.y - l.source.y, dd = Math.hypot(dx, dy) || 1; return l.target.x - (dx / dd) * (r(l.target.pr) + 4); }).attr('y2', (l) => { const dx = l.target.x - l.source.x, dy = l.target.y - l.source.y, dd = Math.hypot(dx, dy) || 1; return l.target.y - (dy / dd) * (r(l.target.pr) + 4); });
      G.attr('transform', (x) => `translate(${x.x},${x.y})`);
    });
    el.querySelector('.one').onclick = () => { const dl = step(); render(); out.innerHTML = `Iteración ${it}: cambio total = ${dl.toFixed(5)}. Cada nodo reparte su PageRank entre sus enlaces salientes.`; };
    el.querySelector('.all').onclick = async () => {
      if (!alive || converging) return;
      converging = true;
      try {
        for (let i = 0; i < 40 && alive; i++) {
          const dl = step(); render(); if (!(await life.sleep(60))) return;
          if (!alive) return;
          if (dl < 1e-5) break;
        }
        if (alive) out.innerHTML = `Convergido en ${it} iteraciones. <b>${nodes.slice().sort((a, b) => b.pr - a.pr)[0].n}</b> es el nodo más influyente: lo apuntan muchos, y algunos importantes.`;
      } finally { converging = false; }
    };
    el.querySelector('.d').oninput = (e) => { d = +e.target.value; el.querySelector('.dv').textContent = d; };
    el.querySelector('.rst').onclick = () => { nodes.forEach((x) => (x.pr = 1 / nodes.length)); links = E.map(([a, b]) => ({ source: nodes[a], target: nodes[b] })); sim.force('link').links(links); it = 0; sel = null; render(); sim.alpha(0.6).restart(); };
    el.querySelector('.dv').textContent = d;
    render();
    return () => { alive = false; s.selectAll('*').interrupt(); sim.stop(); };
  },

  // ---------- series temporales: downsampling ----------
  downsample(el) {
    const p = pal();
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const t0 = new Date('2026-02-02T00:00:00').getTime();
    const raw = d3.range(10080).map((i) => { const h = (i / 60) % 24; return { t: t0 + i * 60000, v: 21 + 3 * Math.sin(((h - 9) / 24) * 2 * Math.PI) + (rnd() - 0.5) * 1.6 + (i % 2900 < 4 ? 6 : 0) }; });
    const R = { '1 min': 1, '15 min': 15, '1 hora': 60, '1 día': 1440 };
    el.innerHTML = `<div class="w-title">Sensor de temperatura · 1 semana<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><div class="seg">${Object.keys(R).map((k, i) => `<button data-r="${k}" class="${i === 2 ? 'active' : ''}">${k}</button>`).join('')}</div><span class="pill info"></span></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const c = chart(el.querySelector('.w-canvas'), { type: 'line', data: { datasets: [] }, options: { animation: false, parsing: false, normalized: true, scales: { x: { type: 'linear', ticks: { callback: (v) => new Date(v).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }) } }, y: { title: { display: true, text: '°C' } } }, plugins: { legend: { position: 'bottom' }, tooltip: { enabled: false } }, elements: { point: { radius: 0 } } } });
    const show = (k) => {
      const f = R[k], g = [];
      for (let i = 0; i < raw.length; i += f) { const sl = raw.slice(i, i + f); g.push({ x: sl[0].t, avg: d3.mean(sl, (d) => d.v), mn: d3.min(sl, (d) => d.v), mx: d3.max(sl, (d) => d.v) }); }
      c.data.datasets = [{ label: 'máximo', data: g.map((d) => ({ x: d.x, y: d.mx })), borderColor: p.blueL, backgroundColor: p.blueL + '55', fill: '+1', borderWidth: 1 }, { label: 'mínimo', data: g.map((d) => ({ x: d.x, y: d.mn })), borderColor: p.blueL, borderWidth: 1 }, { label: 'media', data: g.map((d) => ({ x: d.x, y: d.avg })), borderColor: p.blueD, borderWidth: f === 1 ? 1 : 3, stepped: f >= 60 ? 'middle' : false }];
      c.update();
      el.querySelector('.info').textContent = `${g.length.toLocaleString('es-ES')} puntos`;
      el.querySelector('.w-out').innerHTML = `Factor de reducción = Δt nueva / Δt original = <b>${f}</b> → de 10.080 a <b>${g.length.toLocaleString('es-ES')}</b> puntos. ${f > 1 ? 'Guardar media, mínimo y máximo conserva los picos que la media sola escondería.' : 'Resolución original: valiosa hoy, rara vez dentro de un año.'}`;
    };
    el.querySelectorAll('[data-r]').forEach((b) => (b.onclick = () => { el.querySelectorAll('[data-r]').forEach((x) => x.classList.toggle('active', x === b)); show(b.dataset.r); }));
    show('1 hora');
    return () => c.destroy();
  },

  // ---------- índice invertido con BM25 ----------
  invindex(el) {
    const docs = ['Teclado mecánico inalámbrico con switches rojos', 'Teclado compacto inalámbrico para tablet', 'Ratón ergonómico inalámbrico de 4000 DPI', 'Monitor de 27 pulgadas para diseño', 'Alfombrilla XL para ratón y teclado'];
    const STOP = new Set(['de', 'para', 'con', 'y', 'el', 'la', 'los', 'las', 'un', 'una', 'en', 'a']);
    el.innerHTML = `<div class="w-title">Analizador + índice invertido + búsqueda<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><label><input type="checkbox" class="lo" checked> minúsculas</label><label><input type="checkbox" class="ac" checked> quitar tildes</label><label><input type="checkbox" class="sw" checked> palabras vacías</label><label><input type="checkbox" class="st" checked> raíz (stemming)</label>
        <label>Buscar <input type="text" class="q" value="teclados inalámbricos" style="width:240px"></label></div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div style="flex:1;display:flex;flex-direction:column;gap:6px" class="docs"></div><div class="idx" style="flex:1;overflow:auto"></div><div class="res" style="flex:1;overflow:auto"></div></div>`;
    const g = (s) => el.querySelector(s);
    const analyze = (t) => {
      let toks = t.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
      if (g('.lo').checked) toks = toks.map((x) => x.toLowerCase());
      if (g('.ac').checked) toks = toks.map((x) => x.normalize('NFD').replace(/[̀-ͯ]/g, ''));
      if (g('.sw').checked) toks = toks.filter((x) => !STOP.has(x.toLowerCase()));
      if (g('.st').checked) toks = toks.map((x) => (x.length > 4 ? x.replace(/(es|s)$/i, '').replace(/[aeo]$/i, '') : x));
      return toks;
    };
    const run = () => {
      const D = [...el.querySelectorAll('.docs input')].map((i) => i.value);
      const toks = D.map(analyze), N = D.length, avg = d3.mean(toks, (t) => t.length);
      const inv = new Map(); toks.forEach((ts, i) => ts.forEach((t) => { if (!inv.has(t)) inv.set(t, new Map()); inv.get(t).set(i, (inv.get(t).get(i) || 0) + 1); }));
      const qt = analyze(g('.q').value);
      g('.idx').innerHTML = `<table class="edit" style="width:100%"><thead><tr><th>término</th><th>documentos (tf)</th></tr></thead><tbody>${[...inv].sort((a, b) => a[0].localeCompare(b[0])).map(([t, m]) => `<tr><td style="padding:4px 10px;font-family:var(--font-mono);font-size:14px;${qt.includes(t) ? 'background:var(--tint-blue);font-weight:700' : ''}">${esc(t)}</td><td style="padding:4px 10px;font-family:var(--font-mono);font-size:14px">${[...m].map(([d, f]) => `d${d + 1}${f > 1 ? '×' + f : ''}`).join(', ')}</td></tr>`).join('')}</tbody></table>`;
      const k1 = 1.2, b = 0.75;
      const sc = D.map((_, i) => qt.reduce((a, t) => { const m = inv.get(t); if (!m || !m.has(i)) return a; const n = m.size, f = m.get(i), idf = Math.log(1 + (N - n + 0.5) / (n + 0.5)); return a + idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * toks[i].length / avg)); }, 0));
      const ord = sc.map((s, i) => [s, i]).filter((x) => x[0] > 0).sort((a, b2) => b2[0] - a[0]);
      g('.res').innerHTML = `<div style="font-size:15px;color:var(--muted);margin-bottom:6px">Consulta analizada: ${qt.map((t) => `<span class="tag">${esc(t)}</span>`).join(' ') || '—'}</div>` + (ord.map(([s, i], r) => `<div class="card" style="padding:8px 12px;margin-bottom:8px"><b>${r + 1}. d${i + 1}</b> <span class="pill">BM25 ${s.toFixed(3)}</span><p style="font-size:15px">${esc(D[i])}</p></div>`).join('') || '<p>Sin resultados: prueba a activar los pasos del analizador.</p>');
    };
    g('.docs').innerHTML = docs.map((d, i) => `<label style="display:flex;gap:6px;align-items:center;font-size:15px"><b>d${i + 1}</b><input type="text" value="${esc(d)}" style="flex:1;font-size:15px"></label>`).join('');
    el.querySelectorAll('input').forEach((i) => { i.addEventListener('input', run); i.addEventListener('keydown', (e) => e.stopPropagation()); });
    run();
  },

  // ---------- curvas BM25 ----------
  bm25(el) {
    const p = pal();
    const { cv, ctl, out } = frame(el, { title: 'Aportación de un término al score', live: true, controls: '<label>k₁ <input type="range" min="0" max="3" step="0.1" value="1.2" class="k"><b class="kv"></b></label><label>b <input type="range" min="0" max="1" step="0.05" value="0.75" class="b"><b class="bv"></b></label><label>n(t) docs con el término <input type="range" min="1" max="999" value="20" class="n"><b class="nv"></b> de 1.000</label>' });
    const tf = d3.range(0, 21);
    const c = chart(cv, { type: 'line', data: { labels: tf, datasets: [] }, options: { scales: { x: { title: { display: true, text: 'f(t, D): veces que aparece el término' } }, y: { beginAtZero: true, title: { display: true, text: 'score' } } }, plugins: { legend: { position: 'bottom' } } } });
    const upd = () => {
      const k1 = +ctl.querySelector('.k').value, b = +ctl.querySelector('.b').value, n = +ctl.querySelector('.n').value, N = 1000;
      ['k', 'b', 'n'].forEach((x) => (ctl.querySelector(`.${x}v`).textContent = ctl.querySelector('.' + x).value));
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      c.data.datasets = [[0.5, 'documento corto (½ de la media)', p.blue], [1, 'longitud media', p.gray], [2, 'documento largo (×2)', p.red]].map(([r, l, col]) => ({ label: l, data: tf.map((f) => (idf * (f * (k1 + 1))) / (f + k1 * (1 - b + b * r))), borderColor: col, borderWidth: 3, pointRadius: 0, tension: 0.3 }));
      c.data.datasets.push({ label: 'TF lineal (sin saturar)', data: tf.map((f) => idf * f * 0.35), borderColor: p.line, borderDash: [6, 5], borderWidth: 2, pointRadius: 0 });
      c.options.scales.y.max = Math.ceil(idf * (k1 + 1) * 1.25 + 0.5); c.update('none');
      out.innerHTML = `IDF = ${idf.toFixed(2)} (${n < 100 ? 'término <b>raro</b>: pesa mucho' : 'término <b>frecuente</b>: pesa poco'}). k₁ controla cuánto tarda en <b>saturarse</b> la frecuencia; b, cuánto se <b>penaliza</b> la longitud del documento.`;
    };
    ctl.oninput = upd; upd();
    return () => c.destroy();
  }
};
