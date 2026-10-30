// Widgets de los Temas 5, 6 y 7
import { pal, frame, svg, chart, esc, highlight, widgetScope } from '../ui.js';
import { query, run, renderResult } from '../sql.js';

const codeBox = (sql) => `<pre class="code" style="font-size:16px;margin:0">${highlight(sql)}</pre>`;
const errMsg = (e) => `<div class="msg err">✖ ${esc(e.message)}</div>`;

export const widgets = {
  // ---------- juego: ¿qué sublenguaje? ----------
  sublang(el) {
    const life = widgetScope(el);
    const p = pal();
    const Q = [['SELECT * FROM cliente;', 'DML'], ['CREATE TABLE proveedor (...);', 'DDL'], ['GRANT SELECT ON pedido TO lectura;', 'DCL'], ['COMMIT;', 'TCL'], ['ALTER TABLE cliente ADD COLUMN movil TEXT;', 'DDL'],
      ['UPDATE producto SET precio = 10 WHERE id = 1;', 'DML'], ['ROLLBACK TO SAVEPOINT sp1;', 'TCL'], ['REVOKE DELETE ON cliente FROM app;', 'DCL'], ['TRUNCATE TABLE carrito;', 'DDL'],
      ['MERGE INTO producto USING ...;', 'DML'], ['BEGIN;', 'TCL'], ['DROP INDEX idx_pedido_cliente;', 'DDL'], ['INSERT INTO categoria (nombre) VALUES (\'Jardín\');', 'DML'], ['CREATE ROLE analista NOLOGIN;', 'DCL']];
    const desc = { DDL: 'Data Definition: define la estructura (CREATE, ALTER, DROP, TRUNCATE)', DML: 'Data Manipulation: lee y modifica datos (SELECT, INSERT, UPDATE, DELETE, MERGE)', DCL: 'Data Control: permisos (GRANT, REVOKE, roles)', TCL: 'Transaction Control: BEGIN, COMMIT, ROLLBACK, SAVEPOINT' };
    let i = 0, ok = 0, tot = 0, order = d3.shuffle(Q.slice());
    el.innerHTML = `<div class="w-title">¿DDL, DML, DCL o TCL?<span class="live">JUEGO</span><span class="pill gray score" style="margin-left:auto"></span></div>
      <div class="w-canvas" style="display:flex;flex-direction:column;justify-content:center;gap:26px;align-items:center">
        <div class="q" style="font-family:var(--font-mono);font-size:26px;padding:22px 30px;border-radius:16px;background:var(--code-bg);border:2px solid var(--line);text-align:center;min-width:80%"></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;width:100%">${Object.keys(desc).map((k) => `<button class="btn ans" data-k="${k}" style="font-size:26px;padding:18px;font-family:Karla">${k}</button>`).join('')}</div>
      </div><div class="w-out"></div>`;
    const qEl = el.querySelector('.q'), out = el.querySelector('.w-out'), sc = el.querySelector('.score');
    const show = () => { const [q] = order[i % order.length]; qEl.innerHTML = highlight(q); qEl.style.borderColor = p.line; sc.textContent = `${ok}/${tot} aciertos`; el.querySelectorAll('.ans').forEach((b) => (b.disabled = false, b.className = 'btn ans')); };
    el.querySelectorAll('.ans').forEach((b) => (b.onclick = async () => {
      const [, a] = order[i % order.length]; tot++;
      const good = b.dataset.k === a; if (good) ok++;
      qEl.style.borderColor = good ? p.blue : p.red; b.classList.add(good ? 'primary' : 'on');
      if (!good) el.querySelector(`.ans[data-k="${a}"]`).classList.add('primary');
      out.innerHTML = `${good ? '✔ ¡Correcto!' : '✖ No.'} <b>${a}</b> · ${desc[a]}`;
      sc.textContent = `${ok}/${tot} aciertos`;
      el.querySelectorAll('.ans').forEach((x) => (x.disabled = true));
      if (!(await life.sleep(1700))) return; i++; show();
    }));
    show();
  },

  // ---------- rangos numéricos ----------
  numrange(el) {
    const { cv, out, ctl } = frame(el, { title: 'Rangos de los tipos numéricos', live: true,
      controls: '<label>numeric(p, s): p <input type="range" min="1" max="18" value="10" class="p"></label><label>s <input type="range" min="0" max="6" value="2" class="s"></label>' });
    const ints = [['smallint', 16], ['integer', 32], ['bigint', 64]];
    const fmtBig = (n) => n.toLocaleString('es-ES');
    const upd = () => {
      const pp = +ctl.querySelector('.p').value; let ss = +ctl.querySelector('.s').value; if (ss > pp) ss = pp;
      const intPart = BigInt('9'.repeat(pp - ss) || '0').toLocaleString('es-ES'), max = intPart + (ss ? ',' + '9'.repeat(ss) : '');
      cv.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px">${ints.map(([n, b]) => {
        const lo = -(2n ** BigInt(b - 1)), hi = 2n ** BigInt(b - 1) - 1n;
        return `<div class="card" style="padding:12px 16px"><h4 style="font-size:19px;font-family:var(--font-mono)">${n} · ${b / 8} bytes</h4><p style="font-family:var(--font-mono);font-size:16px">${fmtBig(lo)} … ${fmtBig(hi)}</p></div>`;
      }).join('')}
        <div class="card hl" style="padding:12px 16px"><h4 style="font-size:19px;font-family:var(--font-mono)">numeric(${pp}, ${ss})</h4><p style="font-family:var(--font-mono);font-size:18px">|x|<sub>max</sub> = 10<sup>${pp - ss}</sup> − 10<sup>−${ss}</sup> = <b>${max}</b></p></div></div>`;
      out.innerHTML = `Entero con signo de n bits: −2<sup>n−1</sup> ≤ x ≤ 2<sup>n−1</sup> − 1. Tablas de eventos o logs agotan <code>integer</code>: usa <code>bigint</code>.`;
    };
    ctl.oninput = upd; upd();
  },

  // ---------- search_path ----------
  searchpath(el) {
    const p = pal();
    const schemas = { public: ['cliente', 'pedido', 'producto', 'ventas_mes'], analitica: ['ventas_mes', 'kpi_diario'], staging: ['cliente', 'carga_csv'] };
    let path = ['public'];
    el.innerHTML = `<div class="w-title">Clúster → base de datos mercado → esquemas<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><span>search_path =</span><span class="sp mono" style="font-weight:700;color:var(--blue-d)"></span><button class="btn rst">↺</button>
        <label>Buscar tabla <select class="tb">${[...new Set(Object.values(schemas).flat())].map((t) => `<option ${t === 'ventas_mes' ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
      <div class="w-canvas" style="display:flex;gap:16px;align-items:stretch"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const render = () => {
      el.querySelector('.sp').textContent = path.join(', ') || '(vacío)';
      const t = el.querySelector('.tb').value;
      const found = path.find((s) => schemas[s].includes(t));
      cv.innerHTML = Object.entries(schemas).map(([s, ts]) => {
        const pos = path.indexOf(s);
        return `<div class="sch" data-s="${s}" style="flex:1;cursor:pointer;border-radius:16px;border:3px ${pos >= 0 ? 'solid' : 'dashed'} ${pos >= 0 ? p.blue : p.line};padding:14px;background:${pos >= 0 ? 'var(--tint-blue)' : 'var(--surface)'}">
          <div style="font-family:Karla;font-weight:700;font-size:21px">📁 ${s} ${pos >= 0 ? `<span class="pill">${pos + 1}.º</span>` : ''}</div>
          ${ts.map((x) => `<div style="margin-top:8px;font-family:var(--font-mono);font-size:17px;padding:6px 10px;border-radius:8px;background:${x === t ? (s === found ? p.blue : 'var(--surface-2)') : 'var(--surface-2)'};color:${x === t && s === found ? '#fff' : 'inherit'}">${x}</div>`).join('')}</div>`;
      }).join('');
      out.innerHTML = found ? `<code>SELECT * FROM ${t}</code> → se resuelve como <b>${found}.${t}</b> (primer esquema del search_path que la contiene). Haz clic en los esquemas para añadirlos al path.`
        : `<span style="color:var(--red)">✖ ERROR: relation "${t}" does not exist</span> — no está en ningún esquema del search_path. Usa <code>esquema.${t}</code> o añade el esquema.`;
    };
    cv.onclick = (e) => { const s = e.target.closest('[data-s]'); if (!s) return; const k = s.dataset.s; const i = path.indexOf(k); if (i >= 0) path.splice(i, 1); else path.push(k); render(); };
    el.querySelector('.rst').onclick = () => { path = ['public']; render(); };
    el.querySelector('.tb').onchange = render;
    render();
  },

  // ---------- simulador ON DELETE ----------
  ondelete(el) {
    const life = widgetScope(el);
    const p = pal();
    const acts = ['NO ACTION', 'RESTRICT', 'CASCADE', 'SET NULL', 'SET DEFAULT'];
    let act = 'CASCADE', state;
    const reset = () => { state = { parent: [{ id: 1, n: 'Ana Ruiz' }, { id: 2, n: 'Luis Gil' }, { id: 0, n: 'Cliente genérico' }], kids: [{ id: 101, c: 1 }, { id: 103, c: 1 }, { id: 106, c: 1 }, { id: 102, c: 2 }, { id: 108, c: 2 }] }; };
    reset();
    el.innerHTML = `<div class="w-title">pedido.cliente_id REFERENCES cliente (id) ON DELETE …<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><div class="seg">${acts.map((a) => `<button data-a="${a}" class="${a === act ? 'active' : ''}">${a}</button>`).join('')}</div><button class="btn primary del">DELETE FROM cliente WHERE id = 1</button><button class="btn rst">↺</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = (hl = {}) => {
      cv.innerHTML = '';
      const { s, W, H } = svg(cv);
      const px = W * 0.2, kx = W * 0.68;
      s.append('text').text('cliente (padre)').attr('x', px).attr('y', 26).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 20).attr('fill', p.title);
      s.append('text').text('pedido (hijos)').attr('x', kx).attr('y', 26).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 20).attr('fill', p.title);
      const py = (i) => 70 + i * 90, ky = (i) => 56 + i * ((H - 80) / 5);
      state.kids.forEach((k, i) => {
        const pi = state.parent.findIndex((x) => x.id === k.c);
        if (pi >= 0) s.append('path').attr('d', `M${px + 110},${py(pi)} C${(px + kx) / 2},${py(pi)} ${(px + kx) / 2},${ky(i)} ${kx - 90},${ky(i)}`).attr('fill', 'none').attr('stroke', hl.kids && hl.kids.includes(k.id) ? p.red : p.blue).attr('stroke-width', 2.5);
      });
      state.parent.forEach((c, i) => {
        const g = s.append('g').attr('transform', `translate(${px - 110},${py(i) - 28})`);
        g.append('rect').attr('width', 220).attr('height', 56).attr('rx', 12).attr('fill', hl.parent === c.id ? 'var(--tint-red)' : p.surface).attr('stroke', hl.parent === c.id ? p.red : p.gray).attr('stroke-width', 2.5);
        g.append('text').text(`${c.id} · ${c.n}`).attr('x', 110).attr('y', 34).attr('text-anchor', 'middle').attr('font-family', 'IBM Plex Mono').attr('font-size', 17).attr('fill', p.ink);
      });
      state.kids.forEach((k, i) => {
        const g = s.append('g').attr('transform', `translate(${kx - 90},${ky(i) - 24})`);
        const orphanNull = k.c === null, chg = hl.kids && hl.kids.includes(k.id);
        g.append('rect').attr('width', 260).attr('height', 48).attr('rx', 12).attr('fill', chg ? 'var(--tint-blue)' : p.surface).attr('stroke', chg ? p.blue : p.line).attr('stroke-width', 2.5);
        g.append('text').text(`pedido ${k.id} · cliente_id = ${orphanNull ? 'NULL' : k.c}`).attr('x', 130).attr('y', 30).attr('text-anchor', 'middle').attr('font-family', 'IBM Plex Mono').attr('font-size', 16).attr('fill', orphanNull ? p.muted : p.ink);
      });
    };
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-a]'); if (!b) return; act = b.dataset.a; el.querySelectorAll('.seg button').forEach((x) => x.classList.toggle('active', x === b)); reset(); draw(); out.innerHTML = ''; };
    el.querySelector('.rst').onclick = () => { reset(); draw(); out.innerHTML = ''; };
    el.querySelector('.del').onclick = async () => {
      if (!state.parent.find((x) => x.id === 1)) return;
      const kids = state.kids.filter((k) => k.c === 1).map((k) => k.id);
      draw({ parent: 1, kids }); if (!(await life.sleep(700))) return;
      if (act === 'NO ACTION' || act === 'RESTRICT') { out.innerHTML = `<span style="color:var(--red)">✖ ERROR: update or delete on table "cliente" violates foreign key constraint</span> — Ana tiene ${kids.length} pedidos. ${act === 'RESTRICT' ? 'Se comprueba <b>de inmediato</b>.' : 'Se comprueba <b>al final de la sentencia</b> (por defecto).'}`; draw(); return; }
      state.parent = state.parent.filter((x) => x.id !== 1);
      if (act === 'CASCADE') { state.kids = state.kids.filter((k) => k.c !== 1); out.innerHTML = `✔ Cliente borrado <b>y sus ${kids.length} pedidos también</b> (y, en cadena, sus líneas).`; }
      if (act === 'SET NULL') { state.kids.forEach((k) => { if (k.c === 1) k.c = null; }); out.innerHTML = '✔ Cliente borrado; sus pedidos quedan con <code>cliente_id = NULL</code> (la columna debe admitir NULL; en Mercado Next es NOT NULL).'; }
      if (act === 'SET DEFAULT') { state.kids.forEach((k) => { if (k.c === 1) k.c = 0; }); out.innerHTML = '✔ Cliente borrado; sus pedidos pasan al valor por defecto: el «Cliente genérico» (id 0).'; }
      draw({ kids });
    };
    draw();
  },

  // ---------- DELETE / TRUNCATE / DROP ----------
  deltrunc(el) {
    const p = pal();
    let rows, exists, nextId;
    const reset = () => { rows = [1, 2, 3, 4, 5].map((i) => ({ id: i, p: ['K70', 'TK60', 'M50', 'G300', 'Webcam'][i - 1] })); exists = true; nextId = 6; };
    reset();
    el.innerHTML = `<div class="w-title">Tabla carrito<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><button class="btn" data-a="del">DELETE … WHERE id &gt; 3</button><button class="btn" data-a="trunc">TRUNCATE</button><button class="btn" data-a="truncr">TRUNCATE RESTART IDENTITY</button><button class="btn" data-a="drop">DROP TABLE</button><button class="btn primary" data-a="ins">INSERT nueva fila</button><button class="btn" data-a="rst">↺</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const render = () => {
      cv.innerHTML = exists ? `<div style="display:flex;gap:30px;align-items:flex-start"><table class="edit" style="font-size:20px;min-width:340px"><thead><tr><th>id (identity)</th><th>producto</th></tr></thead><tbody>${rows.map((r) => `<tr><td style="padding:8px 14px;font-family:var(--font-mono)">${r.id}</td><td style="padding:8px 14px;font-family:var(--font-mono)">${r.p}</td></tr>`).join('') || '<tr><td colspan="2" style="padding:12px;color:var(--muted)">(sin filas, la estructura sigue ahí)</td></tr>'}</tbody></table>
        <div class="card"><div class="big">${nextId}</div><p>próximo valor de la identidad</p></div></div>`
        : `<div style="display:grid;place-items:center;height:100%;font-size:26px;color:var(--red);font-family:Karla;font-weight:700">✖ La tabla carrito ya no existe (ni filas, ni estructura, ni índices)</div>`;
    };
    el.querySelector('.w-controls').onclick = (e) => {
      const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
      if (a === 'rst') { reset(); out.innerHTML = ''; }
      else if (!exists) out.innerHTML = '<span style="color:var(--red)">ERROR: relation "carrito" does not exist</span>';
      else if (a === 'del') { const n = rows.filter((r) => r.id > 3).length; rows = rows.filter((r) => r.id <= 3); out.innerHTML = `<b>DELETE ${n}</b>: fila a fila, solo las que cumplen el WHERE. La identidad no se reinicia.`; }
      else if (a === 'trunc') { rows = []; out.innerHTML = '<b>TRUNCATE</b>: vacía la tabla de golpe (muy rápido, sin triggers de fila). La identidad <b>sigue</b> donde estaba.'; }
      else if (a === 'truncr') { rows = []; nextId = 1; out.innerHTML = '<b>TRUNCATE RESTART IDENTITY</b>: vacía y reinicia el contador.'; }
      else if (a === 'drop') { exists = false; out.innerHTML = '<b>DROP TABLE</b>: desaparecen filas, estructura, índices y restricciones.'; }
      else if (a === 'ins') { rows.push({ id: nextId++, p: 'Nuevo' }); out.innerHTML = `INSERT → id ${nextId - 1}`; }
      render();
    };
    render();
  },

  // ---------- upsert visual ----------
  upsert(el) {
    const p = pal();
    const target0 = [[1, 'ana.ruiz@mail.com', 'Madrid'], [2, 'luis.gil@mail.com', 'Sevilla'], [3, 'marta.sanz@mail.com', 'Madrid']];
    const src = [['ana.ruiz@mail.com', 'Toledo', 'existe'], ['raquel@mail.com', 'Zaragoza', 'nuevo'], ['luis.gil@mail.com', null, 'baja']];
    const modes = { 'Solo INSERT': 'ins', 'ON CONFLICT DO NOTHING': 'nothing', 'ON CONFLICT DO UPDATE': 'update', 'MERGE (con DELETE)': 'merge' };
    el.innerHTML = `<div class="w-title">Sincronizar clientes (clave única: email)<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><div class="seg">${Object.keys(modes).map((k, i) => `<button data-m="${k}" class="${i === 2 ? 'active' : ''}">${k}</button>`).join('')}</div></div>
      <div class="w-canvas" style="display:flex;flex-wrap:wrap;align-content:flex-start;gap:20px;overflow:auto"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const sqls = { ins: `INSERT INTO cliente (email, ciudad)\nVALUES ('ana.ruiz@mail.com', 'Toledo'), …;`, nothing: `INSERT INTO cliente (email, ciudad) VALUES …\nON CONFLICT (email) DO NOTHING;`,
      update: `INSERT INTO cliente (email, ciudad) VALUES …\nON CONFLICT (email)\nDO UPDATE SET ciudad = EXCLUDED.ciudad;`, merge: `MERGE INTO cliente c USING origen o ON c.email = o.email\nWHEN MATCHED AND o.accion = 'baja' THEN DELETE\nWHEN MATCHED THEN UPDATE SET ciudad = o.ciudad\nWHEN NOT MATCHED THEN INSERT (email, ciudad) VALUES (o.email, o.ciudad);` };
    const tbl = (title, rows, cls) => `<div><div style="font-family:Karla;font-weight:700;font-size:18px;margin-bottom:6px">${title}</div><table class="edit"><tbody>${rows.map((r, i) => `<tr>${r.map((v) => `<td class="${cls ? cls(i, r) : ''}" style="padding:7px 12px;font-family:var(--font-mono);font-size:16px">${v ?? 'NULL'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const show = (k) => {
      el.querySelectorAll('[data-m]').forEach((b) => b.classList.toggle('active', b.dataset.m === k));
      const m = modes[k];
      let t = target0.map((r) => r.slice()), marks = {}, msg = '';
      if (m === 'ins') { msg = '<span style="color:var(--red)">✖ ERROR: duplicate key value violates unique constraint "cliente_email_key"</span> — la primera fila ya existe y la sentencia entera falla: no entra nada.'; }
      else {
        let id = 8;
        src.forEach(([email, ciudad, acc]) => {
          const i = t.findIndex((r) => r[1] === email);
          if (m === 'merge' && i >= 0 && acc === 'baja') { marks[email] = 'bad'; t[i] = [t[i][0], email, '⟶ BORRADA']; return; }
          if (i >= 0) { if (m !== 'nothing') { t[i][2] = ciudad ?? t[i][2]; if (ciudad) marks[email] = 'hl'; } }
          else if (acc !== 'baja') { t.push([id++, email, ciudad]); marks[email] = 'hl'; }
        });
        msg = { nothing: 'Los conflictos se <b>ignoran</b>: solo entra Raquel.', update: 'Ana se <b>actualiza</b> (Toledo, con <code>EXCLUDED.ciudad</code>) y Raquel se <b>inserta</b>. Atómico y seguro ante concurrencia.', merge: '<b>MERGE</b> además puede <b>borrar</b>: Luis se da de baja. Estándar SQL:2003, típico en cargas ETL.' }[m];
      }
      cv.innerHTML = tbl('Origen', src.map((r) => [r[0], r[1], r[2]])) + `<div style="font-size:40px;color:var(--blue);align-self:center">→</div>` +
        tbl('cliente (destino)', t, (i, r) => marks[r[1]] || '') + `<div style="flex:1 1 100%">${codeBox(sqls[m])}</div>`;
      out.innerHTML = msg;
    };
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-m]'); if (b) show(b.dataset.m); };
    show('ON CONFLICT DO UPDATE');
  },

  // ---------- cargar CSV ----------
  csvload(el) {
    const life = widgetScope(el);
    el.innerHTML = `<div class="w-title">Del CSV a la tabla<span class="live">EN VIVO</span></div>
      <div style="display:flex;gap:18px;flex:1;min-height:0">
        <div style="flex:1;display:flex;flex-direction:column;gap:8px"><div style="font-size:15px;color:var(--muted)">📄 productos.csv (edítalo)</div>
        <textarea class="csv" spellcheck="false" style="flex:1;font-family:var(--font-mono);font-size:16px;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--code-bg);color:var(--ink);resize:none">nombre,categoria_id,precio,stock\nCable USB-C,2,9.90,200\nHub USB 7 puertos,2,24.50,35\nSoporte monitor,5,39.00,18\nTeclado 60%,3,-5,10</textarea>
        <button class="btn primary go">▶ \\copy producto (nombre, categoria_id, precio, stock) FROM 'productos.csv' CSV HEADER</button></div>
        <div style="flex:1;display:flex;flex-direction:column;min-height:0"><div class="sql-result" style="flex:1"><div class="msg">Pulsa el botón para cargar.</div></div></div></div><div class="w-out"></div>`;
    const res = el.querySelector('.sql-result'), out = el.querySelector('.w-out');
    el.querySelector('.csv').addEventListener('keydown', (e) => e.stopPropagation());
    el.querySelector('.go').onclick = async () => {
      const lines = el.querySelector('.csv').value.trim().split('\n'); const head = lines.shift().split(',').map((x) => x.trim());
      const vals = lines.map((l) => l.split(',').map((x) => x.trim()));
      const sql = `INSERT INTO producto (${head.join(', ')}) VALUES ${vals.map((v) => `(${v.map((x) => (isNaN(+x) || x === '' ? `'${x.replace(/'/g, "''")}'` : x)).join(', ')})`).join(', ')}`;
      try {
        await run('BEGIN;'); await run(sql + ';'); await run('COMMIT;');
        const r = await query('SELECT id, nombre, categoria_id, precio, stock FROM producto ORDER BY id DESC LIMIT $1', [vals.length]); if (!life.alive) return;
        res.innerHTML = renderResult(r); out.innerHTML = `✔ ${vals.length} filas cargadas en bloque (todas o ninguna).`;
      } catch (e) { await run('ROLLBACK;').catch(() => {}); if (!life.alive) return; res.innerHTML = errMsg(e); out.innerHTML = 'La carga es <b>atómica</b>: una fila mala (precio negativo → CHECK) y no entra ninguna. Corrige el CSV y vuelve a probar.'; }
    };
  },

  // ---------- flujo seguro ----------
  async safeflow(el) {
    const life = widgetScope(el);
    const steps = [
      ['1 · ¿Qué filas voy a tocar?', `SELECT id, estado, fecha FROM pedido\nWHERE estado = 'pendiente' AND fecha < '2026-02-04';`],
      ['2 · Abrir transacción', 'BEGIN;'],
      ['3 · Cambiar viendo el resultado', `UPDATE pedido SET estado = 'cancelado'\nWHERE estado = 'pendiente' AND fecha < '2026-02-04'\nRETURNING id, estado;`],
      ['4a · No cuadra: ROLLBACK', 'ROLLBACK;'],
      ['4b · Cuadra: COMMIT', 'COMMIT;'],
      ['Comprobar', `SELECT id, estado FROM pedido WHERE id IN (108, 109);`]];
    el.innerHTML = `<div class="w-title">El flujo seguro, en PostgreSQL de verdad<span class="live">EN VIVO</span></div>
      <div class="w-controls">${steps.map((s, i) => `<button class="btn ${i ? '' : 'primary'}" data-i="${i}">${s[0]}</button>`).join('')}</div>
      <div class="code-h"></div><div class="sql-result" style="flex:1;margin-top:10px"><div class="msg">Empieza por el paso 1.</div></div><div class="w-out"></div>`;
    const ch = el.querySelector('.code-h'), res = el.querySelector('.sql-result'), out = el.querySelector('.w-out');
    el.querySelector('.w-controls').onclick = async (e) => {
      const b = e.target.closest('[data-i]'); if (!b || !e.currentTarget.contains(b)) return; const [t, q] = steps[+b.dataset.i];
      el.querySelectorAll('[data-i]').forEach((x) => x.classList.toggle('primary', x === b));
      ch.innerHTML = codeBox(q);
      try { const r = await run(q); if (!life.alive) return; const last = r[r.length - 1]; res.innerHTML = renderResult(last);
        out.innerHTML = /UPDATE/.test(q) ? `<b>UPDATE ${last.rows.length}</b>: ¿coincide con lo que devolvió el paso 1? Si no, ROLLBACK.` : /ROLLBACK/.test(q) ? 'Deshecho: nada ha cambiado.' : /COMMIT/.test(q) ? 'Confirmado: ahora es permanente.' : '';
      } catch (er) { if (!life.alive) return; res.innerHTML = errMsg(er); }
    };
  },

  // ---------- constructor de WHERE ----------
  async wherebuilder(el) {
    const life = widgetScope(el);
    const p = pal();
    el.innerHTML = `<div class="w-title">WHERE interactivo sobre producto<span class="live">EN VIVO</span></div>
      <div class="w-controls"><label>precio BETWEEN <input type="number" class="pmin" value="30" style="width:80px"> AND <input type="number" class="pmax" value="100" style="width:80px"></label>
      <label><input type="checkbox" class="stk" checked> stock &gt; 0</label><label>nombre ILIKE <input type="text" class="lk" value="%" style="width:120px"></label>
      <label>ORDER BY <select class="ob"><option>precio DESC</option><option>precio</option><option>stock DESC</option><option>nombre</option></select></label></div>
      <div class="code-h"></div>
      <div style="display:flex;gap:18px;flex:1;min-height:0;margin-top:10px"><div class="sql-result" style="flex:1"></div><div class="w-canvas" style="flex:1"></div></div>`;
    const ch = el.querySelector('.code-h'), res = el.querySelector('.sql-result'), cv = el.querySelector('.w-canvas');
    const all = (await query('SELECT id, nombre, precio::float AS precio, stock FROM producto ORDER BY id')).rows; if (!life.alive) return;
    const c = chart(cv, { type: 'scatter', data: { datasets: [{ data: all.map((r) => ({ x: r.precio, y: r.stock, n: r.nombre, id: r.id })), pointRadius: 9, pointHoverRadius: 12 }] },
      options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => `${x.raw.n}: ${x.raw.x} € · ${x.raw.y} uds` } } }, scales: { x: { title: { display: true, text: 'precio (€)' } }, y: { title: { display: true, text: 'stock' } } } } });
    const upd = async () => {
      const g = (s) => el.querySelector(s);
      const conds = [`precio BETWEEN ${+g('.pmin').value || 0} AND ${+g('.pmax').value || 0}`]; if (g('.stk').checked) conds.push('stock > 0');
      const lk = g('.lk').value.replace(/'/g, "''"); if (lk && lk !== '%') conds.push(`nombre ILIKE '${lk}'`);
      const q = `SELECT id, nombre, precio, stock\nFROM producto\nWHERE ${conds.join('\n  AND ')}\nORDER BY ${g('.ob').value};`;
      ch.innerHTML = codeBox(q);
      try { const r = await query(q); if (!life.alive) return; res.innerHTML = renderResult(r); const ids = new Set(r.rows.map((x) => x.id));
        c.data.datasets[0].backgroundColor = all.map((x) => (ids.has(x.id) ? p.blue : p.line)); c.data.datasets[0].borderColor = all.map((x) => (ids.has(x.id) ? p.blueD : p.mid)); c.update();
      } catch (e) { if (!life.alive) return; res.innerHTML = errMsg(e); }
    };
    el.querySelectorAll('input,select').forEach((i) => { i.addEventListener('input', upd); i.addEventListener('keydown', (e) => e.stopPropagation()); });
    upd();
    return () => c.destroy();
  },

  // ---------- paginación ----------
  async paginate(el) {
    const life = widgetScope(el);
    el.innerHTML = `<div class="w-title">ORDER BY · LIMIT · OFFSET<span class="live">EN VIVO</span></div>
      <div class="w-controls"><label>ORDER BY <select class="ob"><option value="ciudad NULLS FIRST, nombre">ciudad NULLS FIRST, nombre</option><option value="ciudad, nombre">ciudad, nombre</option><option value="ciudad DESC, nombre">ciudad DESC, nombre</option><option value="fecha_alta DESC">fecha_alta DESC</option></select></label>
      <label>Tamaño de página <input type="range" min="2" max="7" value="3" class="sz"></label><button class="btn pv">‹ Página</button><span class="pill pg"></span><button class="btn nx">Página ›</button></div>
      <div class="code-h"></div><div class="sql-result" style="flex:1;margin-top:10px"></div>`;
    let page = 0;
    const upd = async () => {
      const sz = +el.querySelector('.sz').value, ob = el.querySelector('.ob').value;
      const total = (await query('SELECT COUNT(*)::int AS n FROM cliente')).rows[0].n; if (!life.alive) return; const pages = Math.ceil(total / sz); page = Math.max(0, Math.min(page, pages - 1));
      const q = `SELECT nombre, ciudad, fecha_alta\nFROM cliente\nORDER BY ${ob}\nLIMIT ${sz} OFFSET ${page * sz};`;
      el.querySelector('.code-h').innerHTML = codeBox(q); el.querySelector('.pg').textContent = `${page + 1} / ${pages}`;
      try { const r = await query(q); if (!life.alive) return; el.querySelector('.sql-result').innerHTML = renderResult(r); } catch (e) { if (!life.alive) return; el.querySelector('.sql-result').innerHTML = errMsg(e); }
    };
    el.querySelector('.pv').onclick = () => { page--; upd(); }; el.querySelector('.nx').onclick = () => { page++; upd(); };
    el.querySelector('.sz').oninput = () => { page = 0; upd(); }; el.querySelector('.ob').onchange = upd;
    upd();
  },

  // ---------- DATE_TRUNC ----------
  async datetrunc(el) {
    const life = widgetScope(el);
    const p = pal();
    const { cv, ctl, out } = frame(el, { title: 'Pedidos agrupados con DATE_TRUNC', live: true,
      controls: `<div class="seg">${['week', 'month', 'quarter', 'year'].map((u, i) => `<button data-u="${u}" class="${i === 1 ? 'active' : ''}">${u}</button>`).join('')}</div><label>Medida <select class="m"><option value="COUNT(DISTINCT p.id)">nº de pedidos</option><option value="SUM(l.cantidad * l.precio_unitario)">facturación (€)</option></select></label>` });
    cv.innerHTML = '<div class="code-h"></div><div class="ch" style="position:relative;height:calc(100% - 150px);margin-top:10px"></div>';
    const c = chart(cv.querySelector('.ch'), { type: 'bar', data: { labels: [], datasets: [{ data: [], backgroundColor: p.blue, borderRadius: 8 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
    let unit = 'month';
    const upd = async () => {
      const m = ctl.querySelector('.m').value;
      const q = `SELECT DATE_TRUNC('${unit}', p.fecha)::date AS periodo,\n       ${m} AS valor\nFROM pedido p JOIN linea_pedido l ON l.pedido_id = p.id\nGROUP BY 1 ORDER BY 1;`;
      cv.querySelector('.code-h').innerHTML = codeBox(q);
      try {
      const r = await query(q); if (!life.alive) return;
      c.data.labels = r.rows.map((x) => x.periodo.toISOString().slice(0, 10)); c.data.datasets[0].data = r.rows.map((x) => +x.valor); c.update();
      out.innerHTML = `${r.rows.length} periodos: cada fecha se «redondea hacia abajo» al inicio de su <b>${unit}</b>.`;
      } catch (e) { if (life.alive) out.innerHTML = errMsg(e); }
    };
    ctl.onclick = (e) => { const b = e.target.closest('[data-u]'); if (!b) return; unit = b.dataset.u; ctl.querySelectorAll('[data-u]').forEach((x) => x.classList.toggle('active', x === b)); upd(); };
    ctl.querySelector('.m').onchange = upd;
    upd();
    return () => c.destroy();
  },

  // ---------- CASE con umbrales ----------
  async casegama(el) {
    const life = widgetScope(el);
    const p = pal();
    el.innerHTML = `<div class="w-title">CASE WHEN: gamas de producto<span class="live">EN VIVO</span></div>
      <div class="w-controls"><label>económico &lt; <input type="range" min="10" max="150" value="40" class="a"><b class="av"></b> €</label><label>medio &lt; <input type="range" min="40" max="300" value="150" class="b"><b class="bv"></b> €</label></div>
      <div class="code-h"></div><div style="display:flex;gap:18px;flex:1;min-height:0;margin-top:10px"><div class="sql-result" style="flex:1.3"></div><div class="w-canvas" style="flex:1"></div></div>`;
    const c = chart(el.querySelector('.w-canvas'), { type: 'doughnut', data: { labels: ['económico', 'medio', 'premium'], datasets: [{ data: [0, 0, 0], backgroundColor: [p.blueL, p.blue, p.gray] }] }, options: { plugins: { legend: { position: 'bottom' } } } });
    const upd = async () => {
      let a = +el.querySelector('.a').value, b = +el.querySelector('.b').value; if (b <= a) b = a + 1;
      el.querySelector('.av').textContent = a; el.querySelector('.bv').textContent = b;
      const q = `SELECT nombre, precio,\n  CASE\n    WHEN precio < ${a}  THEN 'económico'\n    WHEN precio < ${b} THEN 'medio'\n    ELSE 'premium'\n  END AS gama\nFROM producto ORDER BY precio;`;
      el.querySelector('.code-h').innerHTML = codeBox(q);
      try {
      const r = await query(q); if (!life.alive) return; el.querySelector('.sql-result').innerHTML = renderResult(r);
      c.data.datasets[0].data = ['económico', 'medio', 'premium'].map((g) => r.rows.filter((x) => x.gama === g).length); c.update();
      } catch (e) { if (life.alive) el.querySelector('.sql-result').innerHTML = errMsg(e); }
    };
    el.querySelectorAll('input').forEach((i) => (i.oninput = upd));
    upd();
    return () => c.destroy();
  },

  // ---------- GROUP BY animado ----------
  async groupby(el) {
    const life = widgetScope(el);
    const p = pal();
    el.innerHTML = `<div class="w-title">GROUP BY animado sobre cliente<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><label>GROUP BY <select class="k"><option value="ciudad">ciudad</option><option value="vip">vip</option><option value="anio">EXTRACT(YEAR FROM fecha_alta)</option></select></label>
      <label>Agregado <select class="ag"><option value="count">COUNT(*)</option><option value="ped">SUM(nº pedidos)</option></select></label>
      <label>HAVING COUNT(*) &gt;= <input type="range" min="1" max="3" value="1" class="hv"><b class="hvv"></b></label></div>
      <div class="code-h"></div><div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const rows = (await query(`SELECT c.id, c.nombre, COALESCE(c.ciudad, 'NULL') AS ciudad, c.vip::text AS vip, EXTRACT(YEAR FROM fecha_alta)::int::text AS anio, COUNT(p.id)::int AS ped
      FROM cliente c LEFT JOIN pedido p ON p.cliente_id = c.id GROUP BY c.id ORDER BY c.id`)).rows; if (!life.alive) return;
    const { s, W, H } = svg(cv);
    const cw = 170, chh = 44;
    const cards = s.selectAll('g.c').data(rows, (d) => d.id).join('g').attr('class', 'c');
    cards.append('rect').attr('width', cw).attr('height', chh).attr('rx', 10).attr('fill', p.surface).attr('stroke', p.blue).attr('stroke-width', 2);
    cards.append('text').attr('x', 12).attr('y', 29).attr('font-size', 17).attr('fill', p.ink).text((d) => d.nombre);
    const gLay = s.append('g');
    const upd = (anim = true) => {
      const k = el.querySelector('.k').value, ag = el.querySelector('.ag').value, hv = +el.querySelector('.hv').value;
      el.querySelector('.hvv').textContent = hv;
      const col = k === 'anio' ? 'EXTRACT(YEAR FROM fecha_alta)' : k;
      el.querySelector('.code-h').innerHTML = codeBox(`SELECT ${col} AS grupo, ${ag === 'count' ? 'COUNT(*)' : 'SUM(pedidos)'} AS valor\nFROM cliente\nGROUP BY ${col}${hv > 1 ? `\nHAVING COUNT(*) >= ${hv}` : ''};`);
      const groups = d3.groups(rows, (r) => r[k]).sort((a, b) => b[1].length - a[1].length || String(a[0]).localeCompare(String(b[0])));
      const gw = Math.min(260, (W - 20) / groups.length);
      const pos = {};
      groups.forEach(([g, rs], gi) => rs.forEach((r, j) => (pos[r.id] = [10 + gi * gw + (gw - cw) / 2, 60 + j * (chh + 10), rs.length >= hv])));
      cards.transition().duration(anim ? 900 : 0).delay((d, i) => (anim ? i * 60 : 0)).attr('transform', (d) => `translate(${pos[d.id][0]},${pos[d.id][1]})`).attr('opacity', (d) => (pos[d.id][2] ? 1 : 0.25));
      gLay.selectAll('*').remove();
      groups.forEach(([g, rs], gi) => {
        const keep = rs.length >= hv, x = 10 + gi * gw + gw / 2;
        gLay.append('rect').attr('x', x - gw / 2 + 6).attr('y', 6).attr('width', gw - 12).attr('height', H - 12).attr('rx', 16).attr('fill', keep ? p.tint : 'none').attr('stroke', keep ? p.blue : p.line).attr('stroke-dasharray', keep ? null : '6 6').attr('opacity', 0.7);
        gLay.append('text').text(g).attr('x', x).attr('y', 38).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 19).attr('fill', keep ? p.blueD : p.muted);
        const val = ag === 'count' ? rs.length : d3.sum(rs, (r) => r.ped);
        gLay.append('text').text(keep ? `= ${val}` : 'HAVING ✖').attr('x', x).attr('y', H - 22).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', keep ? 30 : 17).attr('fill', keep ? p.blue : p.red);
      });
      gLay.lower();
      out.innerHTML = `${groups.length} grupos → ${groups.filter((g) => g[1].length >= hv).length} superan el HAVING. Una fila de resultado por grupo. Fíjate: los NULL forman su propio grupo.`;
    };
    el.querySelectorAll('select,input').forEach((i) => i.addEventListener('input', () => upd()));
    upd(false); life.timeout(() => upd(), 300);
  },

  // ---------- orden lógico de ejecución ----------
  async execorder(el) {
    const life = widgetScope(el);
    const steps = [
      ['FROM', 'Se lee la tabla (y se hacen los joins).', `SELECT id, cliente_id, estado FROM pedido ORDER BY id`],
      ['WHERE', 'Se filtran filas. Aún no hay alias del SELECT ni grupos.', `SELECT id, cliente_id, estado FROM pedido WHERE estado <> 'cancelado' ORDER BY id`],
      ['GROUP BY', 'Se forman grupos por cliente_id.', `SELECT cliente_id, STRING_AGG(id::text, ', ' ORDER BY id) AS filas_del_grupo FROM pedido WHERE estado <> 'cancelado' GROUP BY cliente_id ORDER BY cliente_id`],
      ['HAVING', 'Se filtran grupos: solo los que tienen 2 o más pedidos.', `SELECT cliente_id, STRING_AGG(id::text, ', ' ORDER BY id) AS filas_del_grupo FROM pedido WHERE estado <> 'cancelado' GROUP BY cliente_id HAVING COUNT(*) >= 2 ORDER BY cliente_id`],
      ['SELECT', 'Se calculan las expresiones y nacen los alias (n).', `SELECT cliente_id, COUNT(*) AS n FROM pedido WHERE estado <> 'cancelado' GROUP BY cliente_id HAVING COUNT(*) >= 2`],
      ['ORDER BY', 'Se ordena. Aquí ya se puede usar el alias n.', `SELECT cliente_id, COUNT(*) AS n FROM pedido WHERE estado <> 'cancelado' GROUP BY cliente_id HAVING COUNT(*) >= 2 ORDER BY n DESC, cliente_id`],
      ['LIMIT', 'Por último, se recorta.', `SELECT cliente_id, COUNT(*) AS n FROM pedido WHERE estado <> 'cancelado' GROUP BY cliente_id HAVING COUNT(*) >= 2 ORDER BY n DESC, cliente_id LIMIT 2`]];
    const written = [['SELECT cliente_id, COUNT(*) AS n', 4], ['FROM pedido', 0], ["WHERE estado <> 'cancelado'", 1], ['GROUP BY cliente_id', 2], ['HAVING COUNT(*) >= 2', 3], ['ORDER BY n DESC', 5], ['LIMIT 2;', 6]];
    let k = 0;
    el.innerHTML = `<div class="w-title">Orden lógico: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT<span class="live">PASO A PASO</span></div>
      <div class="w-controls"><button class="btn pv">‹</button><div class="seg">${steps.map((s, i) => `<button data-i="${i}">${i + 1}. ${s[0]}</button>`).join('')}</div><button class="btn primary nx">Siguiente ›</button></div>
      <div style="display:flex;gap:20px;flex:1;min-height:0"><pre class="code wr" style="flex:0 0 430px;font-size:18px;line-height:1.9"></pre><div style="flex:1;display:flex;flex-direction:column;min-height:0;gap:8px"><div class="w-out"></div><div class="sql-result" style="flex:1"></div></div></div>`;
    const show = async () => {
      el.querySelectorAll('.seg button').forEach((b) => b.classList.toggle('active', +b.dataset.i === k));
      el.querySelector('.wr').innerHTML = written.map(([t, i]) => `<div style="border-radius:6px;padding:0 8px;${i === k ? 'background:var(--blue);color:#fff' : i < k ? 'opacity:1' : 'opacity:.35'}">${i === k ? esc(t) : highlight(t)} <span style="float:right;opacity:.7">${i + 1}</span></div>`).join('');
      el.querySelector('.w-out').innerHTML = `<b>${k + 1}. ${steps[k][0]}</b> — ${steps[k][1]}`;
      try { const r = await query(steps[k][2]); if (!life.alive) return; el.querySelector('.sql-result').innerHTML = renderResult(r); } catch (e) { if (!life.alive) return; el.querySelector('.sql-result').innerHTML = errMsg(e); }
    };
    el.querySelector('.pv').onclick = () => { k = Math.max(0, k - 1); show(); };
    el.querySelector('.nx').onclick = () => { k = Math.min(steps.length - 1, k + 1); show(); };
    el.querySelector('.seg').onclick = (e) => { const b = e.target.closest('[data-i]'); if (b && e.currentTarget.contains(b)) { k = +b.dataset.i; show(); } };
    show();
  },

  // ---------- lógica de tres valores ----------
  logic3(el) {
    const p = pal();
    const V = ['TRUE', 'FALSE', 'NULL'];
    const AND = (a, b) => (a === 'FALSE' || b === 'FALSE' ? 'FALSE' : a === 'NULL' || b === 'NULL' ? 'NULL' : 'TRUE');
    const OR = (a, b) => (a === 'TRUE' || b === 'TRUE' ? 'TRUE' : a === 'NULL' || b === 'NULL' ? 'NULL' : 'FALSE');
    const NOT = (a) => ({ TRUE: 'FALSE', FALSE: 'TRUE', NULL: 'NULL' }[a]);
    const col = { TRUE: p.blue, FALSE: p.gray, NULL: p.amber };
    const { cv, ctl, out } = frame(el, { title: 'Lógica de tres valores', live: true, controls: '<div class="seg"><button data-o="AND" class="active">AND</button><button data-o="OR">OR</button><button data-o="NOT">NOT</button></div>' });
    let op = 'AND';
    const render = () => {
      const cell = (v) => `<td style="padding:10px 16px;text-align:center;font-family:var(--font-mono);font-weight:700;font-size:18px;color:#fff;background:${col[v]}">${v === 'NULL' ? 'desc.' : v.toLowerCase()}</td>`;
      cv.innerHTML = op === 'NOT' ? `<table class="edit" style="margin:auto"><thead><tr><th>a</th><th>NOT a</th></tr></thead><tbody>${V.map((a) => `<tr>${cell(a)}${cell(NOT(a))}</tr>`).join('')}</tbody></table>`
        : `<table class="edit" style="margin:auto"><thead><tr><th>${op}</th>${V.map((v) => `<th>${v === 'NULL' ? 'desconocido' : v.toLowerCase()}</th>`).join('')}</tr></thead><tbody>${V.map((a) => `<tr><th>${a === 'NULL' ? 'desconocido' : a.toLowerCase()}</th>${V.map((b) => cell(op === 'AND' ? AND(a, b) : OR(a, b))).join('')}</tr>`).join('')}</tbody></table>`;
      out.innerHTML = { AND: '<code>FALSE AND desconocido = FALSE</code>: basta un falso.', OR: '<code>TRUE OR desconocido = TRUE</code>: basta un verdadero.', NOT: '<code>NOT desconocido</code> sigue siendo desconocido: por eso NOT IN con NULL falla.' }[op];
    };
    ctl.onclick = (e) => { const b = e.target.closest('[data-o]'); if (!b) return; op = b.dataset.o; ctl.querySelectorAll('[data-o]').forEach((x) => x.classList.toggle('active', x === b)); render(); };
    render();
  }
};
