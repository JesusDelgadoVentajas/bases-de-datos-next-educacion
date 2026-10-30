// Widgets de los Temas 3 y 4
import { widgetScope, pal, frame, svg, chart, esc, editTable } from '../ui.js';

const H = (tag, html, st = '') => `<${tag} style="${st}">${html}</${tag}>`;
function miniTable(name, cols, rows, opt = {}) {
  // cols: [{n, pk, fk}] o strings; rows: matrices; opt.bad(r,c) resalta
  const cs = cols.map((c) => (typeof c === 'string' ? { n: c } : c));
  return `<div style="display:inline-block;vertical-align:top;margin:0 14px 14px 0"><div style="font-family:Karla;font-weight:700;font-size:18px;margin-bottom:4px">${name}</div>
    <table class="edit"><thead><tr>${cs.map((c) => `<th>${c.pk ? '<u>' + c.n + '</u>' : c.n}${c.fk ? ' <span style="opacity:.75">→' + c.fk + '</span>' : ''}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r, i) => `<tr>${r.map((v, j) => `<td class="${opt.cls ? opt.cls(i, j, v) : ''}" style="padding:6px 12px;font-family:var(--font-mono);font-size:17px">${v === null ? 'NULL' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export const widgets = {
  // ---------- anatomía de una relación ----------
  anatomy(el) {
    const p = pal();
    const cols = [['id', 'INTEGER'], ['nombre', 'VARCHAR(100)'], ['ciudad', 'VARCHAR(60)'], ['fecha_alta', 'DATE']];
    let rows = [[1, 'Ana Ruiz', 'Madrid', '2024-03-12'], [2, 'Luis Gil', 'Sevilla', '2024-05-02'], [3, 'Marta Sanz', 'Madrid', '2025-01-20'], [4, 'Iker Mora', 'Bilbao', '2025-02-07']];
    const extra = [[5, 'Sofía Vidal', 'Valencia', '2025-06-15'], [6, 'Pablo Núñez', null, '2025-09-30'], [7, 'Elena Castro', 'Sevilla', '2026-01-10']];
    const { cv, out, ctl } = frame(el, { title: 'CLIENTE(id, nombre, ciudad, fecha_alta)', live: true, controls: '<button class="btn" data-a="+">+ Insertar tupla</button><button class="btn" data-a="-">− Borrar tupla</button><span class="pill gray gr"></span><span class="pill gc"></span>' });
    const render = () => {
      cv.innerHTML = `<table class="t" style="font-size:20px"><thead><tr class="hd">${cols.map((c, j) => `<th data-c="${j}" style="cursor:help">${c[0]}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr data-r="${i}" style="cursor:help">${r.map((v) => `<td style="font-family:var(--font-mono)">${v === null ? '<i style="color:var(--muted)">NULL</i>' : v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      ctl.querySelector('.gr').textContent = `Grado = ${cols.length}`; ctl.querySelector('.gc').textContent = `Cardinalidad = ${rows.length}`;
    };
    cv.addEventListener('mouseover', (e) => {
      cv.querySelectorAll('td,th').forEach((x) => (x.style.outline = ''));
      const th = e.target.closest('th'), tr = e.target.closest('tbody tr');
      if (th) { const j = +th.dataset.c; cv.querySelectorAll(`tr > :nth-child(${j + 1})`).forEach((x) => (x.style.outline = `3px solid ${p.blue}`)); out.innerHTML = `<b>Atributo</b> <code>${cols[j][0]}</code> con <b>dominio</b> <code>${cols[j][1]}</code>. La cabecera completa es el <b>esquema</b>: cambia muy poco.`; }
      else if (tr) { tr.querySelectorAll('td').forEach((x) => (x.style.outline = `3px solid ${p.blue}`)); out.innerHTML = '<b>Tupla</b> (fila): un elemento del conjunto. El conjunto de tuplas es la <b>extensión</b>: cambia continuamente.'; }
    });
    ctl.onclick = (e) => { const a = e.target.dataset.a; if (a === '+' && extra.length) rows.push(extra.shift()); if (a === '-' && rows.length > 1) extra.unshift(rows.pop()); render(); out.innerHTML = 'La <b>cardinalidad</b> cambia con cada inserción o borrado; el <b>grado</b> no.'; };
    render(); out.innerHTML = 'Pasa el ratón por la cabecera o por una fila.';
  },

  // ---------- comprobador de claves ----------
  keys(el) {
    const p = pal();
    const cols = [{ k: 'id', type: 'num' }, { k: 'nombre' }, { k: 'email' }, { k: 'ciudad' }];
    const rows = [{ id: 1, nombre: 'Ana Ruiz', email: 'ana@mail.com', ciudad: 'Madrid' }, { id: 2, nombre: 'Luis Gil', email: 'luis@mail.com', ciudad: 'Sevilla' },
      { id: 3, nombre: 'Marta Sanz', email: 'marta@mail.com', ciudad: 'Madrid' }, { id: 4, nombre: 'Ana Ruiz', email: 'ana.r@mail.com', ciudad: 'Bilbao' }, { id: 5, nombre: 'Sofía Vidal', email: 'sofia@mail.com', ciudad: 'Madrid' }];
    let K = new Set(['id']);
    const { cv, out, ctl } = frame(el, { title: 'Comprobador de claves (edita las celdas)', live: true, controls: cols.map((c) => `<label><input type="checkbox" value="${c.k}" ${K.has(c.k) ? 'checked' : ''}> ${c.k}</label>`).join('') });
    const isSuper = (S) => { const seen = new Map(); for (let i = 0; i < rows.length; i++) { const k = [...S].map((c) => JSON.stringify(rows[i][c])).join('|'); if (seen.has(k)) return [seen.get(k), i]; seen.set(k, i); } return null; };
    const et = editTable(cv, cols, rows, () => check());
    const check = () => {
      et.table.querySelectorAll('td').forEach((td) => { td.classList.remove('bad', 'hl'); if (K.has(td.dataset.k)) td.classList.add('hl'); });
      if (!K.size) { out.innerHTML = 'Elige al menos una columna.'; return; }
      const dup = isSuper(K);
      if (dup) { dup.forEach((r) => [...K].forEach((k) => et.cell(r, k).classList.add('bad'))); out.innerHTML = `<b style="color:var(--red)">✖ {${[...K].join(', ')}} no es superclave</b>: las filas ${dup[0] + 1} y ${dup[1] + 1} coinciden.`; return; }
      const removable = [...K].filter((c) => { const S = new Set(K); S.delete(c); return S.size && !isSuper(S); });
      out.innerHTML = removable.length ? `✔ {${[...K].join(', ')}} es <b>superclave</b>, pero <b>no mínima</b>: le sobra ${removable.map((x) => `<code>${x}</code>`).join(' o ')}.`
        : `✔ {${[...K].join(', ')}} es <b>superclave mínima → clave candidata</b> (en estos datos). Recuerda: los datos solo pueden desmentir una clave; la decide el negocio.`;
    };
    ctl.onchange = (e) => { if (e.target.checked) K.add(e.target.value); else K.delete(e.target.value); check(); };
    check();
  },

  // ---------- E/R → tablas ----------
  er2tab(el) {
    const p = pal();
    const C = {
      'Relación 1:N': ['Cliente —1:N— Pedido', 'La PK del lado «1» viaja como FK al lado «N».', [['cliente', [{ n: 'id', pk: 1 }, 'nombre']], ['pedido', [{ n: 'id', pk: 1 }, { n: 'cliente_id', fk: 'cliente' }, 'fecha']]]],
      'Relación N:M': ['Pedido —N:M— Producto (cantidad)', 'Tabla intermedia con PK = las dos FK, más los atributos de la relación.', [['pedido', [{ n: 'id', pk: 1 }, 'fecha']], ['linea_pedido', [{ n: 'pedido_id', pk: 1, fk: 'pedido' }, { n: 'producto_id', pk: 1, fk: 'producto' }, 'cantidad', 'precio_unitario']], ['producto', [{ n: 'id', pk: 1 }, 'nombre']]]],
      'Relación 1:1': ['Persona —1:1— Pasaporte', 'FK en uno de los lados con UNIQUE (o fusionar si la participación es total en ambos).', [['persona', [{ n: 'id', pk: 1 }, 'nombre']], ['pasaporte', [{ n: 'numero', pk: 1 }, { n: 'persona_id UNIQUE', fk: 'persona' }, 'caduca']]]],
      'Reflexiva 1:N': ['Categoría dentro de Categoría', 'FK a la propia tabla.', [['categoria', [{ n: 'id', pk: 1 }, 'nombre', { n: 'padre_id', fk: 'categoria' }]]]],
      'Multivalorado': ['Empleado con varios teléfonos', 'Tabla nueva con la clave de la entidad y el valor.', [['empleado', [{ n: 'id', pk: 1 }, 'nombre']], ['telefono', [{ n: 'empleado_id', pk: 1, fk: 'empleado' }, { n: 'numero', pk: 1 }]]]],
      'Entidad débil': ['Línea de un pedido', 'PK = clave de la propietaria + discriminador.', [['pedido', [{ n: 'id', pk: 1 }]], ['linea', [{ n: 'pedido_id', pk: 1, fk: 'pedido' }, { n: 'num_linea', pk: 1 }, 'cantidad']]]],
      'Ternaria': ['Profesor imparte Asignatura en Aula', 'Una tabla con las tres claves foráneas.', [['imparte', [{ n: 'profesor_id', pk: 1, fk: 'profesor' }, { n: 'asignatura_id', pk: 1, fk: 'asignatura' }, { n: 'aula_id', pk: 1, fk: 'aula' }]]]],
      'Compuesto / derivado': ['dirección (calle, número, cp) · edad', 'Una columna por componente; el derivado no se guarda (vista o columna generada).', [['cliente', [{ n: 'id', pk: 1 }, 'calle', 'numero', 'cp', 'fecha_nac']]]]
    };
    el.innerHTML = `<div class="w-title">Reglas de transformación<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${Object.keys(C).map((k, i) => `<button class="btn ${i ? '' : 'on'}" data-k="${k}">${k}</button>`).join('')}</div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const show = (k) => {
      el.querySelectorAll('[data-k]').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
      const [er, rule, tabs] = C[k];
      cv.innerHTML = '';
      const { s, W, H } = svg(cv);
      s.append('text').text('E/R: ' + er).attr('x', 10).attr('y', 30).attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 22).attr('fill', p.blueD);
      const bw = 270, gap = (W - tabs.length * bw) / (tabs.length + 1), pos = {};
      tabs.forEach(([n, cs], i) => {
        const x = gap + i * (bw + gap), y = 80; pos[n] = { x, y, cs };
        const g = s.append('g').attr('transform', `translate(${x},${y})`).attr('opacity', 0);
        g.transition().delay(i * 200).duration(400).attr('opacity', 1);
        g.append('rect').attr('width', bw).attr('height', 46 + cs.length * 34).attr('rx', 12).attr('fill', p.surface).attr('stroke', p.line).attr('stroke-width', 2);
        g.append('rect').attr('width', bw).attr('height', 40).attr('rx', 12).attr('fill', p.gray); g.append('rect').attr('y', 28).attr('width', bw).attr('height', 12).attr('fill', p.gray);
        g.append('text').text(n).attr('x', 14).attr('y', 27).attr('fill', '#fff').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 19);
        cs.forEach((c, j) => {
          const o = typeof c === 'string' ? { n: c } : c;
          g.append('text').text(o.n).attr('x', 14).attr('y', 66 + j * 34).attr('font-family', 'IBM Plex Mono').attr('font-size', 16).attr('fill', o.fk ? p.blueD : p.ink).attr('text-decoration', o.pk ? 'underline' : null).attr('font-weight', o.pk ? 700 : 400);
          const tag = [o.pk && 'PK', o.fk && 'FK'].filter(Boolean).join(' ');
          if (tag) g.append('text').text(tag).attr('x', bw - 12).attr('y', 66 + j * 34).attr('text-anchor', 'end').attr('font-size', 13).attr('font-weight', 700).attr('fill', o.pk ? p.blue : p.mid);
        });
      });
      tabs.forEach(([n, cs]) => cs.forEach((c, j) => {
        if (typeof c === 'string' || !c.fk || !pos[c.fk]) return;
        const a = pos[n], b = pos[c.fk], y1 = a.y + 60 + j * 34;
        if (c.fk === n) { s.append('path').attr('d', `M${a.x + bw},${y1} C${a.x + bw + 90},${y1} ${a.x + bw + 90},${a.y + 60} ${a.x + bw},${a.y + 60}`).attr('fill', 'none').attr('stroke', p.blue).attr('stroke-width', 2.5).attr('marker-end', 'url(#ar)'); return; }
        const toLeft = b.x < a.x;
        const x1 = toLeft ? a.x : a.x + bw, x2 = toLeft ? b.x + bw : b.x, y2 = b.y + 60;
        s.append('path').attr('d', `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`).attr('fill', 'none').attr('stroke', p.blue).attr('stroke-width', 2.5).attr('marker-end', 'url(#ar)');
      }));
      s.append('defs').html(`<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${p.blue}"/></marker>`);
      out.innerHTML = `<b>Regla</b>: ${rule}`;
    };
    el.querySelector('.w-controls').onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) show(b.dataset.k); };
    show('Relación 1:N');
  },

  // ---------- jerarquías en tablas ----------
  hiertab(el) {
    const S = {
      A: ['Una sola tabla', 'Todo en una tabla con columna <code>tipo</code>. Consultas rápidas sin JOIN, pero muchos NULL. Encaja con subclases con pocos atributos propios.',
        [['empleado', ['id', 'nombre', 'tipo', 'asignaturas', 'departamento'], [[1, 'Ana', 'docente', 'BBDD, BI', null], [2, 'Luis', 'admin', null, 'Secretaría'], [3, 'Marta', 'docente', 'Python', null], [4, 'Iker', 'admin', null, 'Compras']]]], 0],
      B: ['Tabla por subclase', 'Superclase + una tabla por subclase que comparte la clave. Sin NULL, pero hay que hacer JOIN. Encaja con jerarquías solapadas y subclases ricas.',
        [['empleado', ['id', 'nombre'], [[1, 'Ana'], [2, 'Luis'], [3, 'Marta'], [4, 'Iker']]], ['docente', ['id', 'asignaturas'], [[1, 'BBDD, BI'], [3, 'Python']]], ['administrativo', ['id', 'departamento'], [[2, 'Secretaría'], [4, 'Compras']]]], 1],
      C: ['Tabla por clase concreta', 'Una tabla por subclase con todas las columnas. Rápida por subclase; «todos los empleados» exige UNION. Encaja con jerarquías disjuntas y totales.',
        [['docente', ['id', 'nombre', 'asignaturas'], [[1, 'Ana', 'BBDD, BI'], [3, 'Marta', 'Python']]], ['administrativo', ['id', 'nombre', 'departamento'], [[2, 'Luis', 'Secretaría'], [4, 'Iker', 'Compras']]]], 'UNION']
    };
    el.innerHTML = `<div class="w-title">Empleado → Docente / Administrativo<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><div class="seg">${Object.keys(S).map((k, i) => `<button data-k="${k}" class="${i ? '' : 'active'}">${k} · ${S[k][0]}</button>`).join('')}</div></div>
      <div class="w-canvas" style="overflow:auto"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const show = (k) => {
      el.querySelectorAll('[data-k]').forEach((b) => b.classList.toggle('active', b.dataset.k === k));
      const [n, d, tabs, joins] = S[k];
      const nulls = tabs.reduce((a, t) => a + t[2].flat().filter((v) => v === null).length, 0);
      cv.innerHTML = tabs.map(([t, c, r]) => miniTable(t, c.map((x, i) => (i === 0 ? { n: x, pk: 1 } : x)), r, { cls: (i, j, v) => (v === null ? 'bad' : '') })).join('') +
        `<div style="display:flex;gap:14px;margin-top:6px"><div class="card"><div class="big">${tabs.length}</div><p>tablas</p></div><div class="card"><div class="big" style="color:${nulls ? 'var(--red)' : ''}">${nulls}</div><p>valores NULL</p></div><div class="card"><div class="big">${joins}</div><p>JOIN para leer un docente completo</p></div></div>`;
      out.innerHTML = d;
    };
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) show(b.dataset.k); };
    show('A');
  },

  // ---------- álgebra relacional ----------
  algebra(el) {
    const R = { name: 'Cliente', cols: ['id', 'nombre', 'ciudad'], rows: [[1, 'Ana', 'Madrid'], [2, 'Luis', 'Sevilla'], [3, 'Marta', 'Madrid'], [4, 'Iker', 'Bilbao']] };
    const S = { name: 'Pedido', cols: ['pid', 'cliente_id', 'estado'], rows: [[101, 1, 'entregado'], [102, 2, 'entregado'], [106, 1, 'enviado'], [110, 4, 'enviado']] };
    const VIP = { cols: ['nombre'], rows: [['Ana'], ['Iker']] }, MAD = { cols: ['nombre'], rows: [['Ana'], ['Marta']] };
    const ops = {
      'σ selección': ['σ<sub>ciudad=\'Madrid\'</sub>(Cliente)', "SELECT * FROM cliente WHERE ciudad = 'Madrid';", () => ({ cols: R.cols, rows: R.rows.filter((r) => r[2] === 'Madrid') })],
      'π proyección': ['π<sub>ciudad</sub>(Cliente)', 'SELECT DISTINCT ciudad FROM cliente;', () => ({ cols: ['ciudad'], rows: [...new Set(R.rows.map((r) => r[2]))].map((x) => [x]) })],
      '× producto': ['Cliente × Pedido', 'SELECT * FROM cliente CROSS JOIN pedido;', () => ({ cols: [...R.cols, ...S.cols], rows: R.rows.flatMap((r) => S.rows.map((s) => [...r, ...s])) })],
      '⋈ join': ['Cliente ⋈<sub>id=cliente_id</sub> Pedido', 'SELECT * FROM cliente c\nJOIN pedido p ON c.id = p.cliente_id;', () => ({ cols: [...R.cols, ...S.cols], rows: R.rows.flatMap((r) => S.rows.filter((s) => s[1] === r[0]).map((s) => [...r, ...s])) })],
      '∪ unión': ['VIP ∪ Madrid', 'SELECT nombre FROM vip\nUNION\nSELECT nombre FROM madrid;', () => ({ cols: ['nombre'], rows: [...new Set([...VIP.rows, ...MAD.rows].map((r) => r[0]))].map((x) => [x]) })],
      '∩ intersección': ['VIP ∩ Madrid', 'SELECT nombre FROM vip\nINTERSECT\nSELECT nombre FROM madrid;', () => ({ cols: ['nombre'], rows: VIP.rows.filter((r) => MAD.rows.some((m) => m[0] === r[0])) })],
      '− diferencia': ['VIP − Madrid', 'SELECT nombre FROM vip\nEXCEPT\nSELECT nombre FROM madrid;', () => ({ cols: ['nombre'], rows: VIP.rows.filter((r) => !MAD.rows.some((m) => m[0] === r[0])) })],
      'ρ renombrado': ['ρ<sub>c</sub>(Cliente)', 'SELECT * FROM cliente AS c;', () => ({ cols: R.cols.map((c) => 'c.' + c), rows: R.rows })]
    };
    el.innerHTML = `<div class="w-title">Laboratorio de álgebra relacional<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${Object.keys(ops).map((k, i) => `<button class="btn ${i ? '' : 'on'}" data-k="${k}">${k}</button>`).join('')}</div>
      <div style="display:flex;gap:22px;flex:1;min-height:0"><div class="ins" style="flex:1"></div><div style="flex:1.2;display:flex;flex-direction:column;gap:10px" class="res"></div></div>`;
    const ins = el.querySelector('.ins'), res = el.querySelector('.res');
    const show = (k) => {
      el.querySelectorAll('[data-k]').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
      const [nota, q, f] = ops[k]; const r = f();
      const setop = /∪|∩|−/.test(k);
      ins.innerHTML = setop ? miniTable('VIP', VIP.cols, VIP.rows) + miniTable('Madrid', MAD.cols, MAD.rows) + '<p style="font-size:17px;color:var(--muted)">Unión, intersección y diferencia exigen relaciones <b>compatibles</b>: mismo número de atributos y dominios compatibles.</p>'
        : miniTable('Cliente', R.cols, R.rows) + (/×|⋈/.test(k) ? miniTable('Pedido', S.cols, S.rows) : '');
      res.innerHTML = `<div class="box"><p style="font-family:var(--font-mono);font-size:22px">${nota}</p></div><pre class="code" style="font-size:16px">${esc(q)}</pre>
        <div style="overflow:auto;flex:1">${miniTable(`Resultado · ${r.rows.length} tupla(s)`, r.cols, r.rows)}</div>`;
    };
    el.querySelector('.w-controls').onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) show(b.dataset.k); };
    show('σ selección');
  },

  // ---------- anomalías ----------
  anomalies(el) {
    const base = () => [[101, '2026-01-03', 'Ana Ruiz', 'Madrid', 'Teclado', 39.9, 1], [101, '2026-01-03', 'Ana Ruiz', 'Madrid', 'Ratón', 19.9, 2], [102, '2026-01-04', 'Luis Gil', 'Sevilla', 'Teclado', 39.9, 1],
      [103, '2026-01-05', 'Ana Ruiz', 'Madrid', 'Monitor', 149, 1], [104, '2026-01-07', 'Marta Sanz', 'Madrid', 'Ratón', 19.9, 1]];
    let rows = base(), mark = () => '';
    const cols = ['id_pedido', 'fecha', 'cliente', 'ciudad', 'producto', 'precio', 'cant.'];
    el.innerHTML = `<div class="w-title">VENTAS: todo en una tabla<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><button class="btn" data-a="ins">Anomalía de inserción</button><button class="btn" data-a="upd">Anomalía de actualización</button><button class="btn" data-a="del">Anomalía de borrado</button><button class="btn" data-a="rst">↺</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const render = () => { cv.innerHTML = miniTable('ventas', cols, rows, { cls: mark }); };
    el.querySelector('.w-controls').onclick = (e) => {
      const a = e.target.dataset.a; if (!a) return;
      rows = base();
      if (a === 'ins') { rows.push([null, null, null, null, 'Webcam HD', 69, null]); mark = (i, j, v) => (i === rows.length - 1 ? (v === null ? 'bad' : 'hl') : ''); out.innerHTML = '<b>Inserción</b>: no podemos dar de alta la Webcam hasta que alguien la compre… salvo inventando un pedido con NULL en la clave.'; }
      if (a === 'upd') { rows[0][3] = 'Valencia'; rows[1][3] = 'Valencia'; rows[3][3] = 'Madird'; mark = (i, j) => (j === 3 && [0, 1, 3].includes(i) ? (i === 3 ? 'bad' : 'hl') : ''); out.innerHTML = '<b>Actualización</b>: Ana se muda y hay que cambiar su ciudad en <b>todas</b> sus filas. En una quedó «Madird»: ¿dónde vive Ana?'; }
      if (a === 'del') { rows.splice(2, 1); mark = () => ''; out.innerHTML = '<b>Borrado</b>: al borrar el único pedido de Luis Gil desaparece todo lo que sabíamos de él (nombre, ciudad…).'; }
      if (a === 'rst') { mark = (i, j) => ([2, 3].includes(j) && rows[i][2] === 'Ana Ruiz' ? 'hl' : ''); out.innerHTML = 'Fíjate en las celdas resaltadas: los datos de Ana se repiten en cada fila. La tabla mezcla <b>tres temas</b>: pedidos, clientes y productos.'; }
      render();
    };
    el.querySelector('[data-a="rst"]').click();
  },

  // ---------- comprobador de dependencias funcionales ----------
  fdcheck(el) {
    const cols = [{ k: 'id_pedido', type: 'num' }, { k: 'id_producto', type: 'num' }, { k: 'fecha' }, { k: 'id_cliente', type: 'num' }, { k: 'ciudad' }, { k: 'precio', type: 'num' }, { k: 'cantidad', type: 'num' }];
    const rows = [{ id_pedido: 101, id_producto: 7, fecha: '2026-01-03', id_cliente: 1, ciudad: 'Madrid', precio: 39.9, cantidad: 1 },
      { id_pedido: 101, id_producto: 9, fecha: '2026-01-03', id_cliente: 1, ciudad: 'Madrid', precio: 19.9, cantidad: 2 },
      { id_pedido: 102, id_producto: 7, fecha: '2026-01-04', id_cliente: 2, ciudad: 'Sevilla', precio: 39.9, cantidad: 1 },
      { id_pedido: 103, id_producto: 9, fecha: '2026-01-05', id_cliente: 1, ciudad: 'Madrid', precio: 19.9, cantidad: 3 }];
    const key = ['id_pedido', 'id_producto'];
    let X = new Set(['id_pedido']), Y = 'fecha';
    const { cv, out, ctl } = frame(el, { title: 'X → Y sobre los datos (clave: id_pedido, id_producto)', live: true,
      controls: `<span>X =</span>${cols.map((c) => `<label><input type="checkbox" value="${c.k}" ${X.has(c.k) ? 'checked' : ''}>${c.k}</label>`).join('')}<label>Y = <select>${cols.map((c) => `<option ${c.k === Y ? 'selected' : ''}>${c.k}</option>`).join('')}</select></label>` });
    const et = editTable(cv, cols, rows, () => check());
    const check = () => {
      et.table.querySelectorAll('td').forEach((td) => { td.classList.remove('bad', 'hl'); if (X.has(td.dataset.k)) td.classList.add('hl'); });
      if (!X.size) { out.innerHTML = 'Elige X.'; return; }
      let viol = null;
      for (let i = 0; i < rows.length && !viol; i++) for (let j = i + 1; j < rows.length; j++) {
        if ([...X].every((c) => rows[i][c] == rows[j][c]) && rows[i][Y] != rows[j][Y]) { viol = [i, j]; break; }
      }
      const xs = [...X];
      const kind = xs.every((c) => key.includes(c)) ? (xs.length === key.length ? 'completa (depende de toda la clave)' : 'parcial (depende de una parte de la clave)') : 'transitiva o entre atributos no clave';
      if (viol) { viol.forEach((r) => et.cell(r, Y).classList.add('bad')); out.innerHTML = `<b style="color:var(--red)">✖ Los datos desmienten {${xs.join(', ')}} → ${Y}</b>: filas ${viol[0] + 1} y ${viol[1] + 1} coinciden en X y difieren en Y.`; }
      else out.innerHTML = X.has(Y) ? 'Dependencia <b>trivial</b> (Y ⊆ X): siempre se cumple.' : `✔ Los datos no contradicen {${xs.join(', ')}} → ${Y}. Si el negocio la confirma, sería una dependencia <b>${kind}</b>.`;
    };
    ctl.onchange = (e) => { if (e.target.tagName === 'SELECT') Y = e.target.value; else if (e.target.checked) X.add(e.target.value); else X.delete(e.target.value); check(); };
    check();
  },

  // ---------- normalización paso a paso ----------
  normal(el) {
    const life = widgetScope(el);
    let raf;
    const steps = [
      ['Forma no normalizada', 'La columna <code>productos</code> guarda una <b>lista</b> dentro de una celda: grupo repetido.',
        [['pedido', ['id_pedido', 'fecha', 'id_cliente', 'nombre_cliente', 'ciudad', 'productos'], [[101, '2026-01-03', 1, 'Ana Ruiz', 'Madrid', 'Teclado (×1, 39,90); Ratón (×2, 19,90)'], [102, '2026-01-04', 2, 'Luis Gil', 'Sevilla', 'Teclado (×1, 39,90)']]]]],
      ['1FN · valores atómicos', 'Una fila por producto de cada pedido. Clave compuesta (id_pedido, id_producto). Mira cuánto se repite.',
        [['ventas', ['id_pedido', 'id_producto', 'fecha', 'id_cliente', 'nombre_cliente', 'ciudad', 'nombre_prod', 'precio', 'cant.'], [[101, 7, '2026-01-03', 1, 'Ana Ruiz', 'Madrid', 'Teclado', '39,90', 1], [101, 9, '2026-01-03', 1, 'Ana Ruiz', 'Madrid', 'Ratón', '19,90', 2], [102, 7, '2026-01-04', 2, 'Luis Gil', 'Sevilla', 'Teclado', '39,90', 1]]]], 'rep'],
      ['2FN · sin dependencias parciales', '<code>id_pedido → fecha, cliente…</code> y <code>id_producto → nombre, precio</code> dependían de una parte de la clave: cada grupo a su tabla.',
        [['PEDIDO', ['id_pedido', 'fecha', 'id_cliente', 'nombre_cliente', 'ciudad'], [[101, '2026-01-03', 1, 'Ana Ruiz', 'Madrid'], [102, '2026-01-04', 2, 'Luis Gil', 'Sevilla']]], ['PRODUCTO', ['id_producto', 'nombre_prod', 'precio'], [[7, 'Teclado', '39,90'], [9, 'Ratón', '19,90']]],
          ['LINEA', ['id_pedido', 'id_producto', 'cantidad', 'precio_unitario'], [[101, 7, 1, '39,90'], [101, 9, 2, '19,90'], [102, 7, 1, '39,90']]]], 'tr'],
      ['3FN · sin dependencias transitivas', '<code>id_pedido → id_cliente → nombre, ciudad</code> era transitiva: el cliente sale a su tabla. Cada dato, una sola vez.',
        [['CLIENTE', ['id_cliente', 'nombre_cliente', 'ciudad'], [[1, 'Ana Ruiz', 'Madrid'], [2, 'Luis Gil', 'Sevilla']]], ['PEDIDO', ['id_pedido', 'fecha', 'id_cliente'], [[101, '2026-01-03', 1], [102, '2026-01-04', 2]]],
          ['PRODUCTO', ['id_producto', 'nombre_prod', 'precio'], [[7, 'Teclado', '39,90'], [9, 'Ratón', '19,90']]], ['LINEA', ['id_pedido', 'id_producto', 'cantidad', 'precio_unitario'], [[101, 7, 1, '39,90'], [101, 9, 2, '19,90'], [102, 7, 1, '39,90']]]]]
    ];
    let k = 0;
    el.innerHTML = `<div class="w-title">Normalización de los pedidos de Mercado Next<span class="live">PASO A PASO</span></div>
      <div class="w-controls"><button class="btn pv">‹ Anterior</button><div class="seg">${steps.map((s, i) => `<button data-i="${i}">${['NN', '1FN', '2FN', '3FN'][i]}</button>`).join('')}</div><button class="btn primary nx">Siguiente ›</button></div>
      <div class="w-out" style="font-size:20px;margin-bottom:10px"></div><div class="w-canvas" style="overflow:auto"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const show = () => {
      const [t, d, tabs, mode] = steps[k];
      el.querySelectorAll('.seg button').forEach((b) => b.classList.toggle('active', +b.dataset.i === k));
      out.innerHTML = `<b>${t}</b> — ${d}`;
      cv.innerHTML = tabs.map(([n, c, r]) => miniTable(n, c, r, {
        cls: (i, j, v) => {
          if (mode === 'rep' && [2, 3, 4, 5].includes(j) && i < 2) return 'hl';
          if (mode === 'rep' && [6, 7].includes(j) && (i === 0 || i === 2) && r[0][1] === r[2][1]) return 'hl';
          if (mode === 'tr' && n === 'PEDIDO' && [3, 4].includes(j)) return 'bad';
          return '';
        } })).join('');
      cv.style.opacity = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (!life.alive) return; cv.style.transition = 'opacity .4s'; cv.style.opacity = 1; });
    };
    el.querySelector('.pv').onclick = () => { k = Math.max(0, k - 1); show(); };
    el.querySelector('.nx').onclick = () => { k = Math.min(steps.length - 1, k + 1); show(); };
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-i]'); if (b && e.currentTarget.contains(b)) { k = +b.dataset.i; show(); } };
    show();
    life.onCleanup(() => cancelAnimationFrame(raf));
  },

  // ---------- cierre de atributos ----------
  closure(el) {
    el.innerHTML = `<div class="w-title">Calculadora de cierres X⁺<span class="live">INTERACTIVO</span></div>
      <div class="w-controls" style="flex-direction:column;align-items:stretch">
        <label>Atributos de R <input type="text" class="r" value="A B C D E" style="flex:1"></label>
        <label>Dependencias F <input type="text" class="f" value="A->B; B->C; CD->E" style="flex:1"></label>
        <label>X <input type="text" class="x" value="A D" style="width:140px"> <button class="btn primary go">Calcular X⁺</button></label></div>
      <div class="w-canvas" style="overflow:auto"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const parse = (s) => s.replace(/,/g, ' ').trim().split(/\s+/).filter(Boolean);
    const attrs = (s) => (/\s/.test(s.trim()) ? parse(s) : s.trim().split(''));
    const calc = () => {
      const R = parse(el.querySelector('.r').value);
      const F = el.querySelector('.f').value.split(/[;\n]/).map((x) => x.split(/->|→/)).filter((x) => x.length === 2).map(([l, r]) => [attrs(l), attrs(r)]);
      const closure = (X) => { const C = new Set(X), steps = []; let ch = true; while (ch) { ch = false; for (const [l, r] of F) if (l.every((a) => C.has(a)) && r.some((a) => !C.has(a))) { r.forEach((a) => C.add(a)); steps.push([`${l.join('')} → ${r.join('')}`, [...C]]); ch = true; } } return [C, steps]; };
      const X = attrs(el.querySelector('.x').value);
      const [C, steps] = closure(X);
      const ord = (S) => [...S].sort((a, b) => R.indexOf(a) - R.indexOf(b)).join(', ');
      cv.innerHTML = `<table class="t small"><thead><tr><th>Paso</th><th>Dependencia aplicada</th><th>Cierre acumulado</th></tr></thead><tbody><tr><td class="k">0</td><td>— (inicio)</td><td>{${ord(X)}}</td></tr>${steps.map((s, i) => `<tr><td class="k">${i + 1}</td><td>${s[0]}</td><td>{${ord(s[1])}}</td></tr>`).join('')}</tbody></table>`;
      // claves candidatas por fuerza bruta (pocos atributos)
      const cands = [];
      if (R.length <= 10) for (let m = 1; m < 1 << R.length; m++) {
        const S = R.filter((_, i) => m & (1 << i));
        if (cands.some((c) => c.every((a) => S.includes(a)))) continue;
        if (closure(S)[0].size >= R.length && R.every((a) => closure(S)[0].has(a))) cands.push(S);
      }
      const sup = R.every((a) => C.has(a));
      out.innerHTML = `{${X.join(', ')}}⁺ = <b>{${ord(C)}}</b> → ${sup ? '<b>es superclave</b> de R' : 'no es superclave'}. Claves candidatas de R: <b>${cands.map((c) => '{' + c.join(', ') + '}').join(' · ') || '—'}</b>`;
    };
    el.querySelector('.go').onclick = calc;
    el.querySelectorAll('input').forEach((i) => i.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') calc(); }));
    calc();
  },

  // ---------- 4FN: dependencias multivaluadas ----------
  mvd(el) {
    const p = pal();
    const P = ['Delgado', 'Martín', 'Ortega', 'Ferrer', 'Blanco'], L = ['Silberschatz', 'Elmasri', 'Date', 'Garcia-Molina', 'Kleppmann'];
    const { cv, out, ctl } = frame(el, { title: 'CURSO(curso, profesor, libro)', live: true,
      controls: '<label>Profesores <input type="range" min="1" max="5" value="2" class="np"></label><label>Libros <input type="range" min="1" max="5" value="2" class="nl"></label>' });
    cv.innerHTML = '<div style="display:flex;gap:20px;height:100%"><div class="tb" style="flex:1.2;overflow:auto"></div><div class="ch" style="flex:1;position:relative"></div></div>';
    const ch = chart(cv.querySelector('.ch'), { type: 'bar', data: { labels: ['Una tabla (FNBC)', 'Descompuesta (4FN)'], datasets: [{ data: [4, 4], backgroundColor: [p.red + 'CC', p.blue] }] },
      options: { plugins: { legend: { display: false }, title: { display: true, text: 'Filas necesarias', font: { size: 17 } } }, scales: { y: { beginAtZero: true, suggestedMax: 25 } } } });
    const upd = () => {
      const np = +ctl.querySelector('.np').value, nl = +ctl.querySelector('.nl').value;
      const rows = []; P.slice(0, np).forEach((pr) => L.slice(0, nl).forEach((l) => rows.push(['Bases de datos', pr, l])));
      cv.querySelector('.tb').innerHTML = miniTable(`CURSO · ${rows.length} filas`, ['curso', 'profesor', 'libro'], rows) + miniTable('CURSO_PROFESOR', ['curso', 'profesor'], P.slice(0, np).map((x) => ['BBDD', x])) + miniTable('CURSO_LIBRO', ['curso', 'libro'], L.slice(0, nl).map((x) => ['BBDD', x]));
      ch.data.datasets[0].data = [np * nl, np + nl]; ch.update();
      out.innerHTML = `Con ${np} profesores y ${nl} libros: <b>${np * nl}</b> filas (producto) frente a <b>${np + nl}</b> tras descomponer. Añadir un libro obliga a insertar ${np} filas en la tabla única.`;
    };
    ctl.oninput = upd; upd();
    return () => ch.destroy();
  },

  // ---------- descomposición sin pérdida ----------
  lossless(el) {
    const rows = [['Teclado', 'ProvA', 'Madrid'], ['Ratón', 'ProvB', 'Madrid']];
    const D = { 'Por ciudad (con pérdida)': [[0, 2], [1, 2]], 'Por proveedor (sin pérdida)': [[0, 1], [1, 2]] };
    const names = ['producto', 'proveedor', 'ciudad'];
    el.innerHTML = `<div class="w-title">SUMINISTRO(producto, proveedor, ciudad)<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${Object.keys(D).map((k, i) => `<button class="btn ${i ? '' : 'on'}" data-k="${k}">${k}</button>`).join('')}<button class="btn add">+ fila (Monitor, ProvA, Madrid)</button></div>
      <div class="w-canvas" style="overflow:auto"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    let cur = Object.keys(D)[0];
    const show = () => {
      el.querySelectorAll('[data-k]').forEach((b) => b.classList.toggle('on', b.dataset.k === cur));
      const [a, b] = D[cur];
      const proj = (ix) => [...new Map(rows.map((r) => [ix.map((i) => r[i]).join('|'), ix.map((i) => r[i])])).values()];
      const R1 = proj(a), R2 = proj(b);
      const common = a.filter((x) => b.includes(x));
      const join = [];
      R1.forEach((r1) => R2.forEach((r2) => {
        if (common.every((c) => r1[a.indexOf(c)] === r2[b.indexOf(c)])) { const t = []; a.forEach((c, i) => (t[c] = r1[i])); b.forEach((c, i) => (t[c] = r2[i])); join.push(t); }
      }));
      const orig = new Set(rows.map((r) => r.join('|')));
      const spur = join.filter((t) => !orig.has(t.join('|'))).length;
      cv.innerHTML = miniTable('Original', names, rows) + miniTable('R₁', a.map((i) => names[i]), R1) + miniTable('R₂', b.map((i) => names[i]), R2) +
        miniTable(`R₁ ⋈ R₂ · ${join.length} filas`, names, join, { cls: (i) => (orig.has(join[i].join('|')) ? '' : 'bad') });
      out.innerHTML = spur ? `<b style="color:var(--red)">✖ ${spur} tupla(s) espuria(s)</b>: el atributo común <code>${common.map((c) => names[c]).join(', ')}</code> no es clave de ninguna parte. Hemos «perdido» información ganando filas falsas.`
        : `✔ Sin pérdida: el atributo común <code>${common.map((c) => names[c]).join(', ')}</code> determina R₂ (cada proveedor está en una ciudad), así que se cumple Heath.`;
    };
    el.querySelector('.w-controls').onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('add')) { if (rows.length < 4) rows.push(['Monitor', 'ProvA', 'Madrid']); } else cur = b.dataset.k;
      show();
    };
    show();
  },

  // ---------- desnormalización: compromiso ----------
  denorm(el) {
    const p = pal();
    const { cv, out, ctl } = frame(el, { title: 'El compromiso de desnormalizar (esquema conceptual)', live: true, controls: '<label>Nivel de desnormalización <input type="range" min="0" max="100" value="20" class="lv"></label>' });
    const xs = d3.range(0, 101, 5);
    const read = xs.map((x) => 90 * Math.exp(-x / 35) + 10), anom = xs.map((x) => 5 + 0.009 * x * x), red = xs.map((x) => 8 + 0.85 * x);
    const marker = { id: 'mk', afterDatasetsDraw(c) { const v = +ctl.querySelector('.lv').value; const x = c.scales.x.getPixelForValue(v / 5); const ctx = c.ctx; ctx.save(); ctx.strokeStyle = p.ink; ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, c.chartArea.top); ctx.lineTo(x, c.chartArea.bottom); ctx.stroke(); ctx.restore(); } };
    const ch = chart(cv, { type: 'line', plugins: [marker], data: { labels: xs.map((x) => (x === 0 ? 'Normalizado (3FN)' : x === 100 ? 'Muy desnormalizado' : '')), datasets: [
      { label: 'Coste de lectura (joins)', data: read, borderColor: p.blue, borderWidth: 4, pointRadius: 0, tension: 0.35 },
      { label: 'Riesgo de anomalías', data: anom, borderColor: p.red, borderWidth: 4, pointRadius: 0, tension: 0.35 },
      { label: 'Redundancia', data: red, borderColor: p.gray, borderWidth: 4, borderDash: [8, 6], pointRadius: 0, tension: 0.35 }] },
      options: { scales: { y: { display: false, min: 0, max: 105 }, x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0, font: { size: 15 } } } }, plugins: { legend: { position: 'bottom' } } } });
    const upd = () => { const v = +ctl.querySelector('.lv').value; ch.update('none');
      out.innerHTML = v < 25 ? 'Diseño normalizado: escrituras seguras, lecturas con más <b>joins</b>. Ideal para <b>OLTP</b>.' : v < 65 ? 'Zona de compromiso: vistas materializadas, columnas calculadas o tablas resumen <b>con un mecanismo que mantenga la coherencia</b>.' : 'Muy desnormalizado: lecturas rapidísimas, pero alto riesgo de anomalías. Típico de <b>OLAP</b>, casi solo lectura.'; };
    ctl.oninput = upd; upd();
    return () => ch.destroy();
  }
};
