// Widgets de los Temas 8 y 9
import { pal, frame, svg, chart, esc, editTable, highlight, widgetScope } from '../ui.js';
import { query, run, renderResult } from '../sql.js';

const codeBox = (sql, fs = 16) => `<pre class="code" style="font-size:${fs}px;margin:0">${highlight(sql)}</pre>`;
const errMsg = (e) => `<div class="msg err">✖ ${esc(e.message)}</div>`;

export const widgets = {
  // ---------- JOINs con tablas editables y diagrama ----------
  joins(el) {
    const p = pal();
    const L = [{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Luis' }, { id: 5, nombre: 'Sofía' }, { id: 7, nombre: 'Elena' }];
    const R = [{ pid: 101, cliente_id: 1 }, { pid: 102, cliente_id: 2 }, { pid: 106, cliente_id: 1 }, { pid: 120, cliente_id: 9 }];
    const T = ['INNER', 'LEFT', 'RIGHT', 'FULL OUTER', 'CROSS'];
    let t = 'LEFT';
    el.innerHTML = `<div class="w-title">cliente c ⟷ pedido p ON p.cliente_id = c.id<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><div class="seg">${T.map((x) => `<button data-t="${x}" class="${x === t ? 'active' : ''}">${x} JOIN</button>`).join('')}</div></div>
      <div style="display:flex;gap:20px;flex:1;min-height:0">
        <div style="display:flex;flex-direction:column;gap:10px"><div><b>cliente</b> (edita)</div><div class="lt"></div><div><b>pedido</b> (edita)</div><div class="rt"></div></div>
        <div class="w-canvas" style="flex:0 0 300px"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px;min-height:0"><div class="code-h"></div><div class="res" style="overflow:auto;flex:1"></div></div></div><div class="w-out"></div>`;
    const lt = editTable(el.querySelector('.lt'), [{ k: 'id', type: 'num' }, { k: 'nombre' }], L, () => calc());
    const rt = editTable(el.querySelector('.rt'), [{ k: 'pid', type: 'num' }, { k: 'cliente_id', type: 'num' }], R, () => calc());
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const venn = () => {
      cv.innerHTML = ''; const { s } = svg(cv, 300, 260);
      const sel = { INNER: [0, 1, 0], LEFT: [1, 1, 0], RIGHT: [0, 1, 1], 'FULL OUTER': [1, 1, 1], CROSS: [1, 1, 1] }[t];
      const defs = s.append('defs');
      defs.append('clipPath').attr('id', 'jcA').append('circle').attr('cx', 110).attr('cy', 120).attr('r', 85);
      defs.append('clipPath').attr('id', 'jcB').append('circle').attr('cx', 190).attr('cy', 120).attr('r', 85);
      const fill = (on) => (on ? p.blue : p.surface2);
      s.append('circle').attr('cx', 110).attr('cy', 120).attr('r', 85).attr('fill', fill(sel[0]));
      s.append('circle').attr('cx', 190).attr('cy', 120).attr('r', 85).attr('fill', fill(sel[2]));
      s.append('circle').attr('cx', 190).attr('cy', 120).attr('r', 85).attr('clip-path', 'url(#jcA)').attr('fill', sel[1] ? p.blueD : p.surface2);
      [[110, 'c'], [190, 'p']].forEach(([x]) => s.append('circle').attr('cx', x).attr('cy', 120).attr('r', 85).attr('fill', 'none').attr('stroke', p.gray).attr('stroke-width', 2.5));
      s.append('text').text('cliente').attr('x', 70).attr('y', 245).attr('text-anchor', 'middle').attr('font-weight', 700).attr('fill', p.ink);
      s.append('text').text('pedido').attr('x', 230).attr('y', 245).attr('text-anchor', 'middle').attr('font-weight', 700).attr('fill', p.ink);
      if (t === 'CROSS') s.append('text').text('todas × todas').attr('x', 150).attr('y', 126).attr('text-anchor', 'middle').attr('font-weight', 700).attr('fill', '#fff').attr('font-size', 18);
    };
    const calc = () => {
      venn();
      const rows = [], usedR = new Set();
      if (t === 'CROSS') L.forEach((l) => R.forEach((r) => rows.push([l.id, l.nombre, r.pid, r.cliente_id])));
      else {
        L.forEach((l) => { const m = R.filter((r) => r.cliente_id != null && r.cliente_id === l.id); m.forEach((r) => { usedR.add(r); rows.push([l.id, l.nombre, r.pid, r.cliente_id]); }); if (!m.length && (t === 'LEFT' || t === 'FULL OUTER')) rows.push([l.id, l.nombre, null, null]); });
        if (t === 'RIGHT' || t === 'FULL OUTER') R.forEach((r) => { if (!usedR.has(r)) rows.push([null, null, r.pid, r.cliente_id]); });
        if (t === 'RIGHT') { rows.splice(0, rows.length, ...rows.filter((r) => r[2] !== null)); }
      }
      el.querySelector('.code-h').innerHTML = codeBox(t === 'CROSS' ? 'SELECT * FROM cliente c\nCROSS JOIN pedido p;' : `SELECT c.id, c.nombre, p.pid, p.cliente_id\nFROM cliente c\n${t} JOIN pedido p ON p.cliente_id = c.id;`);
      el.querySelector('.res').innerHTML = `<table class="edit"><thead><tr><th>c.id</th><th>c.nombre</th><th>p.pid</th><th>p.cliente_id</th></tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v) => `<td class="${v === null ? 'null' : ''}" style="padding:6px 12px;font-family:var(--font-mono);font-size:16px;${v === null ? 'background:var(--tint-red)' : ''}">${v ?? 'NULL'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      out.innerHTML = { INNER: 'Solo las filas con pareja en ambas tablas.', LEFT: 'Todos los clientes; sin pareja → columnas de pedido a NULL (Sofía, Elena).', RIGHT: 'Todos los pedidos; el 120 apunta a un cliente que no está.', 'FULL OUTER': 'Todo de ambos lados: ideal para conciliar listados.', CROSS: `Producto cartesiano: ${L.length} × ${R.length} = ${L.length * R.length} filas.` }[t] + ` · <b>${rows.length} filas</b>`;
    };
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-t]'); if (!b) return; t = b.dataset.t; el.querySelectorAll('.seg button').forEach((x) => x.classList.toggle('active', x === b)); calc(); };
    calc();
  },

  // ---------- operadores de conjuntos ----------
  setops(el) {
    const p = pal();
    let A = 'Ana, Luis, Marta, Luis', B = 'Luis, Iker, Marta';
    const ops = ['UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT'];
    let op = 'UNION';
    el.innerHTML = `<div class="w-title">Consulta 1 ∘ Consulta 2<span class="live">INTERACTIVO</span></div>
      <div class="w-controls" style="flex-direction:column;align-items:stretch"><label>Consulta 1 <input type="text" class="a" value="${A}" style="flex:1"></label><label>Consulta 2 <input type="text" class="b" value="${B}" style="flex:1"></label>
      <div class="seg">${ops.map((o) => `<button data-o="${o}" class="${o === op ? 'active' : ''}">${o}</button>`).join('')}</div></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const calc = () => {
      const a = el.querySelector('.a').value.split(',').map((x) => x.trim()).filter(Boolean), b = el.querySelector('.b').value.split(',').map((x) => x.trim()).filter(Boolean);
      const u = (x) => [...new Set(x)];
      const r = { UNION: u([...a, ...b]), 'UNION ALL': [...a, ...b], INTERSECT: u(a.filter((x) => b.includes(x))), EXCEPT: u(a.filter((x) => !b.includes(x))) }[op];
      const chip = (x, on) => `<span style="display:inline-block;margin:4px;padding:6px 14px;border-radius:20px;font-size:18px;font-weight:600;background:${on ? p.blue : 'var(--surface-2)'};color:${on ? '#fff' : 'var(--ink)'}">${esc(x)}</span>`;
      cv.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div class="card"><h4>Consulta 1</h4>${a.map((x) => chip(x, r.includes(x))).join('')}</div><div class="card"><h4>Consulta 2</h4>${b.map((x) => chip(x, r.includes(x))).join('')}</div></div>
        <div class="card hl" style="margin-top:14px"><h4>Resultado · ${r.length} fila(s)</h4>${r.map((x) => chip(x, true)).join('')}</div>`;
      out.innerHTML = op === 'UNION ALL' ? 'UNION ALL conserva duplicados: no tiene que ordenar ni comparar, por eso es más rápido.' : `${op} elimina duplicados.`;
    };
    el.querySelectorAll('input').forEach((i) => { i.oninput = calc; i.addEventListener('keydown', (e) => e.stopPropagation()); });
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-o]'); if (!b) return; op = b.dataset.o; el.querySelectorAll('.seg button').forEach((x) => x.classList.toggle('active', x === b)); calc(); };
    calc();
  },

  // ---------- organigrama recursivo ----------
  async orgchart(el) {
    const life = widgetScope(el);
    const p = pal();
    const rows = (await query('SELECT id, nombre, departamento, jefe_id FROM empleado ORDER BY id')).rows; if (!life.alive) return;
    const level = {}; const lv = (r) => (r.jefe_id == null ? 1 : (level[r.jefe_id] ?? lv(rows.find((x) => x.id === r.jefe_id))) + 1);
    rows.forEach((r) => (level[r.id] = lv(r)));
    const maxL = Math.max(...Object.values(level));
    let it = 0;
    el.innerHTML = `<div class="w-title">Organigrama de Mercado Next<span class="live">RECURSIVO</span></div>
      <div class="w-controls"><button class="btn primary nx">Siguiente iteración ›</button><button class="btn rst">↺</button><span class="pill st"></span></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const { s, W, H } = svg(cv);
    const root = d3.stratify().id((d) => d.id).parentId((d) => d.jefe_id)(rows);
    d3.tree().size([W - 160, H - 90])(root);
    const links = s.append('g').selectAll('path').data(root.links()).join('path').attr('d', d3.linkVertical().x((d) => d.x + 80).y((d) => d.y + 40)).attr('fill', 'none').attr('stroke', p.blue).attr('stroke-width', 2.5);
    const nodes = s.append('g').selectAll('g').data(root.descendants()).join('g').attr('transform', (d) => `translate(${d.x + 80},${d.y + 40})`);
    nodes.append('rect').attr('x', -78).attr('y', -24).attr('width', 156).attr('height', 48).attr('rx', 12).attr('fill', p.surface).attr('stroke', p.gray).attr('stroke-width', 2);
    nodes.append('text').text((d) => d.data.nombre).attr('text-anchor', 'middle').attr('y', -2).attr('font-size', 15).attr('font-weight', 700).attr('fill', p.ink);
    nodes.append('text').text((d) => `${d.data.departamento} · nivel ${level[d.data.id]}`).attr('text-anchor', 'middle').attr('y', 16).attr('font-size', 12).attr('fill', p.muted);
    const show = () => {
      nodes.transition().duration(500).attr('opacity', (d) => (level[d.data.id] <= it ? 1 : 0.3)).select('rect').attr('fill', (d) => (level[d.data.id] === it ? p.blue : p.surface)).attr('stroke', (d) => (level[d.data.id] <= it ? p.blue : p.line));
      nodes.selectAll('text').attr('fill', function (d) { return level[d.data.id] === it ? '#fff' : d3.select(this).attr('font-size') == 12 ? p.muted : p.ink; });
      links.transition().duration(500).attr('opacity', (d) => (level[d.target.data.id] <= it ? 1 : 0.08));
      const nuevos = rows.filter((r) => level[r.id] === it).map((r) => r.nombre);
      el.querySelector('.st').textContent = it === 0 ? 'Sin ejecutar' : it > maxL ? 'Terminado' : `Iteración ${it}`;
      out.innerHTML = it === 0 ? 'Pulsa para empezar por el <b>caso base</b>.' : it === 1 ? `<b>Caso base</b>: <code>WHERE jefe_id IS NULL</code> → ${nuevos.join(', ')}.` : it > maxL ? '✔ El paso recursivo no devuelve filas nuevas: <b>la recursión termina</b>.' : `<b>Paso recursivo ${it - 1}</b>: empleados cuyo jefe salió en la iteración anterior → ${nuevos.join(', ')}.`;
    };
    el.querySelector('.nx').onclick = () => { it = Math.min(maxL + 1, it + 1); show(); };
    el.querySelector('.rst').onclick = () => { it = 0; show(); };
    show();
  },

  // ---------- ranking con empates ----------
  ranking(el) {
    const rows = [{ nombre: 'Ratón ergonómico M50', uds: 4 }, { nombre: 'Alfombrilla XL', uds: 3 }, { nombre: 'Lámpara LED', uds: 3 }, { nombre: 'Monitor 24" FHD', uds: 3 },
      { nombre: 'Teclado compacto TK60', uds: 3 }, { nombre: 'Monitor 27" QHD', uds: 2 }, { nombre: 'Teclado mecánico K70', uds: 2 }, { nombre: 'Ratón gaming G300', uds: 1 }, { nombre: 'Webcam HD', uds: 0 }];
    const { cv, out } = frame(el, { title: 'Unidades vendidas (edita la columna uds)', live: true });
    cv.style.overflow = 'auto';
    const render = () => {
      const s = rows.map((r, i) => ({ ...r, i })).sort((a, b) => b.uds - a.uds || a.nombre.localeCompare(b.nombre));
      let rank = 0, dense = 0, prev = null;
      s.forEach((r, k) => { if (r.uds !== prev) { rank = k + 1; dense++; prev = r.uds; } r.rn = k + 1; r.rk = rank; r.dr = dense; });
      cv.innerHTML = `<table class="edit" style="width:100%"><thead><tr><th>nombre</th><th>uds</th><th>ROW_NUMBER</th><th>RANK</th><th>DENSE_RANK</th></tr></thead><tbody>${s.map((r) => {
        const tie = s.filter((x) => x.uds === r.uds).length > 1;
        return `<tr><td style="padding:6px 12px">${r.nombre}</td><td contenteditable spellcheck="false" data-i="${r.i}" style="font-family:var(--font-mono)">${r.uds}</td>${[r.rn, r.rk, r.dr].map((v, j) => `<td style="padding:6px 12px;text-align:center;font-family:var(--font-mono);font-weight:700;font-size:18px;${tie && j ? 'background:var(--tint-blue);color:var(--blue-d)' : ''}">${v}</td>`).join('')}</tr>`;
      }).join('')}</tbody></table>`;
      out.innerHTML = 'En azul, los empates: <b>RANK</b> repite y salta; <b>DENSE_RANK</b> repite sin saltar; <b>ROW_NUMBER</b> nunca repite (desempate arbitrario salvo que ordenes por más columnas).';
    };
    cv.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } });
    cv.addEventListener('focusout', (e) => { const i = e.target.dataset.i; if (i === undefined) return; const v = parseInt(e.target.textContent, 10); if (!isNaN(v)) rows[+i].uds = v; render(); });
    render();
  },

  // ---------- funciones ventana sobre series ----------
  async window(el) {
    const life = widgetScope(el);
    const p = pal();
    const F = { 'SUM acumulado': 'cum', 'AVG móvil (k)': 'mm', 'LAG (mes anterior)': 'lag', 'LEAD (mes siguiente)': 'lead', 'Variación vs anterior': 'var' };
    el.innerHTML = `<div class="w-title">Ventas por semana · función ventana<span class="live">EN VIVO</span></div>
      <div class="w-controls"><div class="seg">${Object.keys(F).map((k, i) => `<button data-f="${k}" class="${i ? '' : 'active'}">${k}</button>`).join('')}</div><label>k = <input type="range" min="2" max="5" value="3" class="k"><b class="kv"></b></label></div>
      <div style="display:flex;gap:18px;flex:1;min-height:0"><div style="flex:0 0 520px;display:flex;flex-direction:column;gap:8px"><div class="code-h"></div><div class="tb" style="overflow:auto;flex:1"></div></div><div class="w-canvas" style="flex:1"></div></div><div class="w-out"></div>`;
    const data = (await query(`SELECT DATE_TRUNC('week', p.fecha)::date AS sem, SUM(l.cantidad * l.precio_unitario)::float AS ventas
      FROM pedido p JOIN linea_pedido l ON l.pedido_id = p.id WHERE p.estado <> 'cancelado' GROUP BY 1 ORDER BY 1`)).rows.map((r) => ({ sem: r.sem.toISOString().slice(5, 10), v: r.ventas })); if (!life.alive) return;
    let f = 'cum', hover = null;
    const c = chart(el.querySelector('.w-canvas'), { type: 'bar', data: { labels: data.map((d) => d.sem), datasets: [{ type: 'bar', label: 'ventas', data: data.map((d) => d.v), backgroundColor: p.blueL, borderRadius: 6 }, { type: 'line', label: 'ventana', data: [], borderColor: p.blueD, borderWidth: 3, pointRadius: 5, tension: 0.2, spanGaps: true }] },
      options: { plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } } });
    const calc = () => {
      const k = +el.querySelector('.k').value; el.querySelector('.kv').textContent = k;
      const v = data.map((d) => d.v);
      const res = v.map((x, i) => ({ cum: d3.sum(v.slice(0, i + 1)), mm: d3.mean(v.slice(Math.max(0, i - k + 1), i + 1)), lag: i ? v[i - 1] : null, lead: i < v.length - 1 ? v[i + 1] : null, var: i ? x - v[i - 1] : null }[f]));
      const frameOf = (i) => ({ cum: [0, i], mm: [Math.max(0, i - k + 1), i], lag: [i - 1, i - 1], lead: [i + 1, i + 1], var: [i - 1, i] }[f]);
      const expr = { cum: 'SUM(ventas) OVER (ORDER BY semana)', mm: `AVG(ventas) OVER (ORDER BY semana\n  ROWS BETWEEN ${k - 1} PRECEDING AND CURRENT ROW)`, lag: 'LAG(ventas) OVER (ORDER BY semana)', lead: 'LEAD(ventas) OVER (ORDER BY semana)', var: 'ventas - LAG(ventas) OVER (ORDER BY semana)' }[f];
      el.querySelector('.code-h').innerHTML = codeBox(`SELECT semana, ventas,\n  ${expr} AS calc\nFROM ventas_semanales;`, 15);
      const fr = hover !== null ? frameOf(hover) : null;
      el.querySelector('.tb').innerHTML = `<table class="edit" style="width:100%"><thead><tr><th>semana</th><th>ventas</th><th>calc</th></tr></thead><tbody>${data.map((d, i) => {
        const inF = fr && i >= fr[0] && i <= fr[1];
        return `<tr data-i="${i}" style="cursor:pointer"><td style="padding:5px 12px;font-family:var(--font-mono);${i === hover ? 'background:var(--blue);color:#fff' : inF ? 'background:var(--tint-blue)' : ''}">${d.sem}</td><td style="padding:5px 12px;font-family:var(--font-mono);${inF ? 'background:var(--tint-blue);font-weight:700' : ''}">${d.v.toFixed(2)}</td><td style="padding:5px 12px;font-family:var(--font-mono);font-weight:700">${res[i] == null ? 'NULL' : res[i].toFixed(2)}</td></tr>`;
      }).join('')}</tbody></table>`;
      c.data.datasets[1].data = res; c.data.datasets[1].label = Object.keys(F).find((x) => F[x] === f);
      c.data.datasets[0].backgroundColor = data.map((d, i) => (fr && i >= fr[0] && i <= fr[1] ? p.blue : p.blueL)); c.update('none');
      el.querySelector('.w-out').innerHTML = 'Pasa el ratón por una fila: en azul, las filas de su <b>marco</b>. Se conservan todas las filas (no se agrupa).';
    };
    el.querySelector('.tb').addEventListener('mouseover', (e) => { const tr = e.target.closest('tr[data-i]'); if (tr && +tr.dataset.i !== hover) { hover = +tr.dataset.i; calc(); } });
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-f]'); if (!b) return; f = F[b.dataset.f]; el.querySelectorAll('.seg button').forEach((x) => x.classList.toggle('active', x === b)); calc(); };
    el.querySelector('.k').oninput = calc;
    calc();
    return () => c.destroy();
  },

  // ---------- matriz de permisos ----------
  grants(el) {
    const p = pal();
    const roles = ['lectura', 'escritura', 'marketing', 'app_tienda'];
    const objs = ['cliente', 'cliente.email', 'pedido', 'producto'];
    const privs = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
    const G = {}; const k = (r, o, pr) => `${r}|${o}|${pr}`;
    const set = (r, o, pr, v = true) => (G[k(r, o, pr)] = v);
    ['cliente', 'pedido', 'producto'].forEach((o) => set('lectura', o, 'SELECT'));
    ['pedido'].forEach((o) => ['INSERT', 'UPDATE', 'DELETE'].forEach((pr) => set('escritura', o, pr)));
    set('marketing', 'cliente', 'SELECT'); set('marketing', 'cliente.email', 'SELECT', false);
    const member = { app_tienda: ['lectura', 'escritura'] };
    const has = (r, o, pr) => !!G[k(r, o, pr)] || (member[r] || []).some((m) => has(m, o, pr));
    el.innerHTML = `<div class="w-title">Permisos (clic en una celda: GRANT / REVOKE)<span class="live">INTERACTIVO</span></div>
      <div class="w-canvas" style="overflow:auto"></div>
      <div class="w-controls"><label>Rol <select class="r">${roles.map((r) => `<option>${r}</option>`).join('')}</select></label><label>intenta <select class="pr">${privs.map((x) => `<option>${x}</option>`).join('')}</select></label><label>sobre <select class="o">${objs.map((x) => `<option>${x}</option>`).join('')}</select></label><button class="btn primary go">Probar</button></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const render = () => {
      cv.innerHTML = `<table class="edit" style="width:100%"><thead><tr><th>rol \\ objeto</th>${objs.map((o) => `<th colspan="4" style="text-align:center">${o}</th>`).join('')}</tr><tr><th></th>${objs.map(() => privs.map((x) => `<th style="font-size:12px;text-align:center">${x.slice(0, 3)}</th>`).join('')).join('')}</tr></thead>
        <tbody>${roles.map((r) => `<tr><td style="padding:6px 10px;font-weight:700">${r}${member[r] ? `<div style="font-size:12px;color:var(--muted);font-weight:400">∈ ${member[r].join(', ')}</div>` : ''}</td>${objs.map((o) => privs.map((pr) => {
          const own = !!G[k(r, o, pr)], inh = !own && has(r, o, pr);
          const dis = o === 'cliente.email' && pr !== 'SELECT' && pr !== 'UPDATE';
          return `<td data-k="${k(r, o, pr)}" style="text-align:center;cursor:${dis ? 'default' : 'pointer'};font-size:18px;padding:6px;${own ? `background:${p.blue};color:#fff` : inh ? 'background:var(--tint-blue);color:var(--blue-d)' : ''}">${dis ? '·' : own ? '✔' : inh ? '↳' : ''}</td>`;
        }).join('')).join('')}</tr>`).join('')}</tbody></table>`;
    };
    cv.onclick = (e) => { const td = e.target.closest('td[data-k]'); if (!td || td.textContent === '·') return; const [r, o, pr] = td.dataset.k.split('|'); G[td.dataset.k] = !G[td.dataset.k];
      out.innerHTML = `<code>${G[td.dataset.k] ? 'GRANT' : 'REVOKE'} ${pr}${o.includes('.') ? ` (${o.split('.')[1]})` : ''} ON ${o.split('.')[0]} ${G[td.dataset.k] ? 'TO' : 'FROM'} ${r};</code>`; render(); };
    el.querySelector('.go').onclick = () => {
      const r = el.querySelector('.r').value, pr = el.querySelector('.pr').value, o = el.querySelector('.o').value;
      const ok = has(r, o, pr) && !(o === 'cliente.email' && G[k(r, 'cliente.email', 'SELECT')] === false && pr === 'SELECT') && (o !== 'cliente.email' || has(r, 'cliente', pr) || has(r, o, pr));
      out.innerHTML = ok ? `✔ <b>${r}</b> puede hacer ${pr} sobre ${o}${(member[r] || []).length ? ' (heredado de sus grupos ↳)' : ''}.` : `<span style="color:var(--red)">✖ ERROR: permission denied for ${o.includes('.') ? 'column email of relation cliente' : 'table ' + o}</span>`;
    };
    render();
    out.innerHTML = '✔ = concedido directamente · ↳ = heredado por pertenecer a un rol de grupo. <b>marketing</b> ve cliente sin la columna email.';
  },

  // ---------- transacción paso a paso ----------
  txn(el) {
    const life = widgetScope(el);
    const steps = [
      ['BEGIN;', 'Abre la transacción.'],
      ["INSERT INTO pedido (id, cliente_id, fecha, estado)\nVALUES (111, 3, '2026-02-12', 'pendiente');", 'Pedido 111 creado (aún no visible para los demás).'],
      ['SAVEPOINT sp1;', 'Punto de guardado.'],
      ['UPDATE producto SET stock = stock - 100 WHERE id = 5;', '✖ Viola CHECK (stock >= 0): la transacción queda ABORTADA.'],
      ['SELECT 1;', '✖ current transaction is aborted…: todo falla hasta deshacer.'],
      ['ROLLBACK TO SAVEPOINT sp1;', 'Volvemos al punto: el pedido 111 sigue ahí.'],
      ['INSERT INTO linea_pedido VALUES (111, 6, 1, 149.00);', 'Línea añadida.'],
      ['COMMIT;', '✔ Confirmado: pedido y línea son permanentes.'],
      ['SELECT p.id, p.estado, l.producto_id, l.cantidad\nFROM pedido p JOIN linea_pedido l ON l.pedido_id = p.id\nWHERE p.id = 111;', 'Comprobación.']];
    let k = 0;
    el.innerHTML = `<div class="w-title">La transacción del temario, sentencia a sentencia<span class="live">EN VIVO</span></div>
      <div class="w-controls"><button class="btn primary nx">Ejecutar siguiente ›</button><button class="btn rst">↺ Empezar de nuevo</button><span class="pill st">fuera de transacción</span></div>
      <div style="display:flex;gap:18px;flex:1;min-height:0"><div class="lst" style="flex:1.1;display:flex;flex-direction:column;gap:6px;overflow:auto"></div><div style="flex:1;display:flex;flex-direction:column;gap:8px;min-height:0"><div class="w-out"></div><div class="sql-result" style="flex:1"></div></div></div>`;
    const lst = el.querySelector('.lst'), res = el.querySelector('.sql-result'), out = el.querySelector('.w-out'), st = el.querySelector('.st');
    const render = () => { lst.innerHTML = steps.map(([q], i) => `<pre class="code" style="font-size:14.5px;padding:8px 12px;${i === k ? 'border-left-color:var(--blue);background:var(--tint-blue)' : i < k ? 'opacity:.6' : 'opacity:.35;border-left-color:var(--line)'}">${highlight(q)}</pre>`).join(''); };
    el.querySelector('.nx').onclick = async () => {
      if (k >= steps.length) return;
      const [q, d] = steps[k];
      try { const r = await run(q); if (!life.alive) return; res.innerHTML = renderResult(r[r.length - 1]); }
      catch (e) { if (!life.alive) return; res.innerHTML = errMsg(e); }
      out.innerHTML = `<b>${k + 1}.</b> ${d}`;
      st.textContent = k >= 7 ? 'confirmada' : k === 3 || k === 4 ? 'ABORTADA' : k >= 0 ? 'transacción abierta' : '';
      st.className = 'pill ' + (k === 3 || k === 4 ? 'bad' : '');
      k++; render();
    };
    el.querySelector('.rst').onclick = async () => { await run('ROLLBACK;').catch(() => {}); await run('DELETE FROM pedido WHERE id = 111;').catch(() => {}); if (!life.alive) return; k = 0; render(); res.innerHTML = ''; out.innerHTML = 'Listo para empezar.'; st.textContent = 'fuera de transacción'; st.className = 'pill'; };
    render();
    run('DELETE FROM pedido WHERE id = 111;').catch(() => {});
  },

  // ---------- Row-Level Security en vivo ----------
  async rls(el) {
    const life = widgetScope(el);
    const setup = `DROP POLICY IF EXISTS pedidos_madrid ON pedido;
DO $$ BEGIN  -- crea los roles si no existen
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'comercial_madrid')
  THEN CREATE ROLE comercial_madrid LOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'comercial_sevilla')
  THEN CREATE ROLE comercial_sevilla LOGIN; END IF;
END $$;
GRANT SELECT ON pedido, cliente TO comercial_madrid, comercial_sevilla;
ALTER TABLE pedido ENABLE ROW LEVEL SECURITY;
CREATE POLICY pedidos_madrid ON pedido FOR SELECT TO comercial_madrid
  USING (cliente_id IN (SELECT id FROM cliente WHERE ciudad = 'Madrid'));`;
    el.innerHTML = `<div class="w-title">Row-Level Security en PostgreSQL<span class="live">EN VIVO</span></div>
      <div class="w-controls"><button class="btn primary su">1 · Crear roles y política</button><span>2 · Conectar como:</span><div class="seg"><button data-r="postgres">postgres (propietario)</button><button data-r="comercial_madrid">comercial_madrid</button><button data-r="comercial_sevilla">comercial_sevilla</button></div><button class="btn off">Desactivar RLS</button></div>
      <div class="code-h"></div><div class="sql-result" style="flex:1;margin-top:10px"><div class="msg">Empieza por el paso 1.</div></div><div class="w-out"></div>`;
    const res = el.querySelector('.sql-result'), out = el.querySelector('.w-out'), ch = el.querySelector('.code-h');
    ch.innerHTML = codeBox(setup, 14);
    el.querySelector('.su').onclick = async () => { try { await run('RESET ROLE;'); await run(setup); if (!life.alive) return; res.innerHTML = '<div class="msg ok">✔ Roles y política creados. RLS activada en pedido.</div>'; } catch (e) { if (!life.alive) return; res.innerHTML = errMsg(e); } };
    el.querySelector('.off').onclick = async () => { await run('RESET ROLE; ALTER TABLE pedido DISABLE ROW LEVEL SECURITY;'); if (!life.alive) return; res.innerHTML = '<div class="msg ok">RLS desactivada.</div>'; };
    el.querySelector('.seg').onclick = async (e) => {
      const b = e.target.closest('[data-r]'); if (!b) return; const r = b.dataset.r;
      el.querySelectorAll('.seg button').forEach((x) => x.classList.toggle('active', x === b));
      const q = `${r === 'postgres' ? 'RESET ROLE;' : `SET ROLE ${r};`}\nSELECT p.id, p.cliente_id, c.ciudad, p.estado\nFROM pedido p JOIN cliente c ON c.id = p.cliente_id ORDER BY p.id;`;
      ch.innerHTML = codeBox(q, 15);
      try { const rr = await run(q); if (!life.alive) return; res.innerHTML = renderResult(rr[rr.length - 1]); const n = rr[rr.length - 1].rows.length;
        out.innerHTML = r === 'postgres' ? `El propietario ignora las políticas: ${n} filas.` : r === 'comercial_madrid' ? `Solo los pedidos de clientes de Madrid: <b>${n} filas</b>.` : `<b>${n} filas</b>: no tiene ninguna política → denegación por defecto.`;
      } catch (er) { if (!life.alive) return; res.innerHTML = errMsg(er); } finally { await run('RESET ROLE;').catch(() => {}); }
    };
  }
};
