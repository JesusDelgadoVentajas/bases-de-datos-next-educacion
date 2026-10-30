// Widgets del Bloque VII (Tema 23)
import { pal, frame, svg, chart, esc, highlight, widgetScope } from '../ui.js';
import { query, run, renderResult, resetDB } from '../sql.js';

const segBtns = (opts, act, attr = 'k') => `<div class="seg">${opts.map((o) => `<button data-${attr}="${o}" class="${o === act ? 'active' : ''}">${o}</button>`).join('')}</div>`;
const bindSeg = (root, attr, cb) => root.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { root.querySelectorAll(`[data-${attr}]`).forEach((x) => x.classList.toggle('active', x === b)); cb(b.dataset[attr]); }));

export const widgets = {
  // ---------- inyección SQL real ----------
  injection(el) {
    const life = widgetScope(el);
    const inputs = [['Normal', 'ana.ruiz@mail.com'], ["' OR '1'='1", "' OR '1'='1"], ['UNION con empleados', "' UNION SELECT id, nombre, departamento FROM empleado --"], ['💣 Borrar líneas', "x'; DELETE FROM linea_pedido; --"]];
    let mode = 'Concatenada (vulnerable)';
    el.innerHTML = `<div class="w-title">Buscar cliente por email<span class="live">EN VIVO</span></div>
      <div class="w-controls">${segBtns(['Concatenada (vulnerable)', 'Parametrizada (segura)'], mode, 'm')}</div>
      <div class="w-controls"><label style="flex:1">Email <input type="text" class="in" value="ana.ruiz@mail.com" style="flex:1;font-family:var(--font-mono)"></label><button class="btn primary go">Buscar</button>${inputs.map((x, i) => `<button class="btn" data-i="${i}">${esc(x[0])}</button>`).join('')}</div>
      <div class="code-h"></div><div style="display:flex;gap:16px;flex:1;min-height:0;margin-top:10px"><div class="sql-result" style="flex:1.4"></div><div class="side" style="flex:1"></div></div><div class="w-out"></div>`;
    const inp = el.querySelector('.in'), ch = el.querySelector('.code-h'), res = el.querySelector('.sql-result'), side = el.querySelector('.side'), out = el.querySelector('.w-out');
    const preview = () => {
      const v = inp.value;
      ch.innerHTML = mode.startsWith('Conc') ? `<pre class="code" style="font-size:16px;margin:0"><span class="cm">// código de la aplicación</span>\nsql = "SELECT id, nombre, email FROM cliente WHERE email = '" + entrada + "'"\n\n<span class="cm">-- lo que recibe PostgreSQL:</span>\n${highlight(`SELECT id, nombre, email FROM cliente WHERE email = '${v}'`)}</pre>`
        : `<pre class="code" style="font-size:16px;margin:0"><span class="cm">// código de la aplicación</span>\ncur.execute("SELECT id, nombre, email FROM cliente WHERE email = $1", (entrada,))\n\n<span class="cm">-- estructura: </span>${highlight('SELECT id, nombre, email FROM cliente WHERE email = $1')}\n<span class="cm">-- parámetro $1 (solo texto): </span><span class="str">${esc(JSON.stringify(v))}</span></pre>`;
    };
    const go = async () => {
      preview(); const v = inp.value;
      try {
        let r;
        if (mode.startsWith('Conc')) { const rr = await run(`SELECT id, nombre, email FROM cliente WHERE email = '${v}'`); if (!life.alive) return; r = rr.filter((x) => x.fields && x.fields.length).pop() || rr.at(-1); }
        else r = await query('SELECT id, nombre, email FROM cliente WHERE email = $1', [v]);
        if (!life.alive) return;
        res.innerHTML = renderResult(r);
        const n = (await query('SELECT COUNT(*)::int AS n FROM linea_pedido')).rows[0].n; if (!life.alive) return;
        side.innerHTML = `<div class="card ${n ? 'hl' : ''}" style="${n ? '' : 'border-color:var(--red);background:var(--tint-red)'}"><h4>linea_pedido</h4><div class="big" style="${n ? '' : 'color:var(--red)'}">${n}</div><p>filas en la tabla</p></div>${n ? '' : '<button class="btn primary rs" style="margin-top:10px">↺ Reiniciar BD</button>'}`;
        const rsb = side.querySelector('.rs'); if (rsb) rsb.onclick = async () => { await resetDB(); if (life.alive) go(); };
        const nrows = r.rows ? r.rows.length : 0;
        out.innerHTML = mode.startsWith('Conc') ? (n === 0 ? '<span style="color:var(--red)">💣 La entrada cerró la comilla y añadió <b>otra sentencia</b>: se han borrado todas las líneas de pedido. Con mínimo privilegio (sin DELETE) no habría podido.</span>' : nrows > 1 ? `<span style="color:var(--red)">✖ La entrada se convirtió en <b>código SQL</b>: devuelve ${nrows} filas que no debería.</span>` : 'Con una entrada normal funciona… hasta que alguien escribe una comilla.')
          : '✔ El parámetro es <b>solo un texto</b>: se busca un email que se llame literalmente así. 0 filas, ningún daño.';
      } catch (e) { if (!life.alive) return; res.innerHTML = `<div class="msg err">✖ ${esc(e.message)}</div>`; out.innerHTML = 'Un error del SGBD también da pistas al atacante: no se muestran al usuario final.'; }
    };
    bindSeg(el, 'm', (m) => { mode = m; go(); });
    el.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => { inp.value = inputs[+b.dataset.i][1]; go(); }));
    el.querySelector('.go').onclick = go;
    inp.addEventListener('input', preview); inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') go(); });
    go();
  },

  // ---------- mínimo privilegio en vivo ----------
  leastpriv(el) {
    const life = widgetScope(el);
    const setup = `DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_tienda') THEN
    CREATE ROLE app_tienda LOGIN PASSWORD 'en-un-gestor-de-secretos';
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO app_tienda;
GRANT SELECT ON producto, categoria TO app_tienda;
GRANT SELECT, INSERT, UPDATE ON pedido, linea_pedido TO app_tienda;
GRANT SELECT (id, nombre, email) ON cliente TO app_tienda;
-- sin DELETE, sin TRUNCATE, sin DDL`;
    const T = [['Ver el catálogo', 'SELECT nombre, precio FROM producto LIMIT 3;'], ['Crear un pedido', "INSERT INTO pedido (cliente_id, estado) VALUES (2, 'pendiente') RETURNING id;"], ['Ver nombre y email', 'SELECT id, nombre, email FROM cliente LIMIT 3;'], ['Ver la ciudad del cliente', 'SELECT ciudad FROM cliente LIMIT 3;'],
      ['Borrar clientes', 'DELETE FROM cliente;'], ['Vaciar pedidos', 'TRUNCATE pedido CASCADE;'], ['Borrar la tabla producto', 'DROP TABLE producto CASCADE;'], ['Ver salarios', 'SELECT nombre, salario FROM empleado;']];
    el.innerHTML = `<div class="w-title">Rol app_tienda en PostgreSQL<span class="live">EN VIVO</span></div>
      <div class="w-controls"><button class="btn primary su">1 · Crear el rol con sus GRANT</button><span>2 · Prueba como app_tienda:</span></div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><pre class="code" style="flex:1;font-size:13px;overflow:auto;white-space:pre-wrap">${highlight(setup)}</pre><div class="tests" style="flex:1.1;display:flex;flex-direction:column;gap:6px;overflow:auto"></div></div><div class="w-out"></div>`;
    const tests = el.querySelector('.tests'), out = el.querySelector('.w-out');
    tests.innerHTML = T.map(([t, q], i) => `<div class="card" data-i="${i}" style="padding:8px 12px;cursor:pointer;display:flex;gap:10px;align-items:center"><span class="st pill gray" style="min-width:34px;text-align:center">?</span><div><b style="font-size:16px">${t}</b><div class="mono" style="font-size:13px;color:var(--muted)">${esc(q)}</div></div></div>`).join('');
    el.querySelector('.su').onclick = async () => { try { await run('RESET ROLE;'); await run(setup); if (!life.alive) return; out.innerHTML = '✔ Rol creado. Ahora haz clic en cada acción.'; } catch (e) { if (!life.alive) return; out.innerHTML = esc(e.message); } };
    tests.onclick = async (e) => {
      const c = e.target.closest('[data-i]'); if (!c || !e.currentTarget.contains(c)) return; const [t, q] = T[+c.dataset.i]; const st = c.querySelector('.st');
      try { await run('BEGIN; SET LOCAL ROLE app_tienda;'); await run(q); await run('ROLLBACK;'); if (!life.alive) return; st.textContent = '✔'; st.className = 'st pill'; out.innerHTML = `✔ <b>${t}</b>: permitido (y deshecho con ROLLBACK para no ensuciar).`; }
      catch (er) { await run('ROLLBACK;').catch(() => {}); if (!life.alive) return; st.textContent = '✖'; st.className = 'st pill bad'; out.innerHTML = `<span style="color:var(--red)">✖ ${esc(er.message)}</span>${/does not exist/.test(er.message) ? ' → pulsa primero el paso 1.' : ' — si unas credenciales se filtran, el daño queda limitado.'}`; }
    };
  },

  fine(el) {
    const { cv, ctl, out } = frame(el, { title: 'Sanción máxima (art. 83.5)', live: true, controls: '<label>Facturación global anual <input type="range" min="0" max="4" step="0.01" value="2" class="f"><b class="fv"></b></label>' });
    const upd = () => { const f = Math.pow(10, +ctl.querySelector('.f').value) * 10; ctl.querySelector('.fv').textContent = f >= 1000 ? (f / 1000).toFixed(1) + ' mil M€' : f.toFixed(0) + ' M€';
      const s = Math.max(20, 0.04 * f); cv.innerHTML = `<div class="card hl" style="text-align:center"><div class="big">${s >= 1000 ? (s / 1000).toFixed(2) + ' mil M€' : s.toFixed(1) + ' M€'}</div><p>máx(20 M€, 4 % × facturación)</p></div>`;
      out.innerHTML = s > 20 ? 'Manda el <b>4 %</b> de la facturación.' : 'Manda el mínimo de <b>20 M€</b>.'; };
    ctl.oninput = upd; upd();
  },

  erasure(el) {
    const p = pal();
    const S = [['PostgreSQL (operacional)', 'DELETE / anonimizar el cliente (ojo con las FK: pedidos con obligación legal de conservación)'], ['Réplicas de PostgreSQL', 'Se propaga sola desde el principal'], ['Redis (sesión, carrito)', 'DEL de sus claves o esperar al TTL'], ['Elasticsearch', 'Borrar sus documentos del índice'], ['Lakehouse · bronze', 'DELETE en Delta…'], ['Lakehouse · silver / gold', 'DELETE + recalcular agregados'], ['Time travel / versiones', 'VACUUM cuando venza la retención'], ['Copias de seguridad', 'Caducan según la política de retención; no se restauran sin re-aplicar la supresión'], ['Exportaciones y Excel', '¿Quién descargó qué? Registro de actividades']];
    let done = new Set();
    el.innerHTML = `<div class="w-title">¿Dónde están los datos de Ana?<span class="live">INTERACTIVO</span></div><div class="w-canvas" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => { cv.innerHTML = S.map(([n, h], i) => `<div class="card" data-i="${i}" style="cursor:pointer;${done.has(i) ? 'border-color:var(--blue);background:var(--tint-blue)' : ''}"><h4 style="font-size:19px">${done.has(i) ? '✔' : '👤'} ${n}</h4><p style="font-size:15px">${done.has(i) ? h : 'Ana Ruiz · ana.ruiz@mail.com · Madrid'}</p></div>`).join('');
      out.innerHTML = done.size === S.length ? '✔ Supresión completa. Hay que tenerlo previsto <b>en el diseño</b>, no improvisarlo.' : `Localizados y tratados: <b>${done.size} de ${S.length}</b> sistemas. Haz clic en cada uno.`; };
    cv.onclick = (e) => { const c = e.target.closest('[data-i]'); if (c && e.currentTarget.contains(c)) { done.add(+c.dataset.i); draw(); } };
    draw();
  },

  backupha(el) {
    const p = pal();
    const inc = { 'Falla el disco del principal': [1, 1], 'Cae un centro de datos': [1, 1], 'DELETE sin WHERE': [0, 1], 'Ransomware cifra la BD': [0, 1] };
    const why = { 'Falla el disco del principal': ['La réplica toma el relevo en segundos (failover).', 'Se restaura, pero con horas sin servicio (RTO).'], 'Cae un centro de datos': ['Réplica en otra zona: el servicio sigue.', 'Restaurar en otra región: tarda.'], 'DELETE sin WHERE': ['La réplica <b>replica fielmente el error</b> en milisegundos.', 'PITR hasta el instante anterior al DELETE.'], 'Ransomware cifra la BD': ['El cifrado llega a todas las réplicas.', 'Copias <b>inmutables</b> o aisladas: se recupera.'] };
    let k = Object.keys(inc)[0];
    el.innerHTML = `<div class="w-title">¿Qué te salva?<span class="live">INTERACTIVO</span></div><div class="w-controls">${segBtns(Object.keys(inc), k, 'i')}</div><div class="w-canvas" style="display:grid;grid-template-columns:1fr 1fr;gap:16px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const show = (x) => { k = x; const [ha, bk] = inc[x];
      cv.innerHTML = [['Alta disponibilidad', 'Réplicas sincronizadas + failover automático', ha, why[x][0]], ['Copias de seguridad', 'Lógicas, físicas y PITR (Tema 10)', bk, why[x][1]]].map(([t, d, ok, w2]) => `<div class="card" style="${ok ? 'border-color:var(--blue);background:var(--tint-blue)' : 'border-color:var(--red);background:var(--tint-red)'}"><h4>${ok ? '🛡️' : '⚠️'} ${t}</h4><p>${d}</p><p style="margin-top:10px;font-size:18px;color:var(--ink)">${w2}</p></div>`).join('');
      out.innerHTML = '<b>Una réplica no es una copia de seguridad</b>, y una copia no evita la interrupción. Hacen falta ambas.'; };
    bindSeg(el, 'i', show); show(k);
  },

  nines(el) {
    const N = [['99 %', 0.99], ['99,9 %', 0.999], ['99,99 %', 0.9999], ['99,999 %', 0.99999]];
    const { cv, ctl, out } = frame(el, { title: 'Los «nueves»', live: true, controls: segBtns(N.map((x) => x[0]), '99,9 %', 'n') });
    const f = (m) => (m >= 1440 ? `${(m / 1440).toFixed(1)} días` : m >= 60 ? `${(m / 60).toFixed(1)} h` : m >= 1 ? `${m.toFixed(1)} min` : `${(m * 60).toFixed(0)} s`);
    const show = (k) => { const A = N.find((x) => x[0] === k)[1]; const y = (1 - A) * 525600;
      cv.innerHTML = `<div class="cards c1"><div class="card hl"><h4>Inactividad máxima al año</h4><div class="big">${f(y)}</div></div><div class="card"><h4>Al mes</h4><div class="big" style="font-size:32px">${f(y / 12)}</div></div><div class="card"><h4>A la semana</h4><div class="big" style="font-size:32px">${f(y / 52.14)}</div></div></div>`;
      out.innerHTML = '(1 − A) × 525.600 minutos'; };
    bindSeg(el, 'n', show); show('99,9 %');
  },

  chooser(el) {
    const p = pal();
    const Q = {
      start: ['¿Qué necesitas sobre todo?', [['Ejecutar el negocio (transacciones)', 'oltp'], ['Analizar mucho histórico', 'olap'], ['Buscar texto con relevancia', 'R:search'], ['Responder en microsegundos (caché, sesiones)', 'R:redis']]],
      oltp: ['¿Cómo son tus datos?', [['Tablas con relaciones e integridad', 'R:pg'], ['Documentos con atributos muy variables', 'doc'], ['Relaciones de muchos saltos', 'R:neo'], ['Escrituras masivas por clave (sensores, eventos)', 'R:cass']]],
      doc: ['¿Necesitas además joins y transacciones con el resto del modelo?', [['Sí, y el equipo domina SQL', 'R:pgjson'], ['No, y quiero escalar documentos en horizontal', 'R:mongo']]],
      olap: ['¿Qué datos vas a analizar?', [['Estructurados, para BI y cuadros de mando', 'R:dw'], ['De todo tipo, también para ML', 'R:lh']]]
    };
    const R = { pg: ['PostgreSQL o MySQL', 'Transacciones ACID, integridad y SQL. La opción por defecto (regla 1).'], pgjson: ['PostgreSQL con JSONB', 'Esquema flexible sin perder joins ni ACID.'], mongo: ['MongoDB', 'Documentos, esquema flexible, replica sets y sharding.'], neo: ['Neo4j', 'Grafos: fraude, recomendaciones, rutas.'], cass: ['Cassandra o series temporales', 'Escrituras masivas, particiones por clave o tiempo.'], redis: ['Redis', 'Clave-valor en memoria, TTL. Como caché junto a la fuente de verdad.'], search: ['Elasticsearch / OpenSearch', 'Índice invertido, BM25, fuzzy. Replicado desde la BD operacional.'], dw: ['Snowflake, BigQuery o lakehouse', 'Columnar y cómputo separado. Separa operación y análisis (regla 3).'], lh: ['Lakehouse (Databricks, Iceberg)', 'Una copia gobernada para BI y ML.'] };
    el.innerHTML = `<div class="w-title">Asistente de elección<span class="live">INTERACTIVO</span></div><div class="w-canvas" style="display:flex;flex-direction:column;gap:14px;justify-content:center"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    let path = [];
    const show = (k) => {
      if (k.startsWith('R:')) { const [n, d] = R[k.slice(2)]; cv.innerHTML = `<div style="color:var(--muted);font-size:16px">${path.join(' → ')}</div><div class="card hl" style="text-align:center;padding:30px"><div style="font-size:18px;color:var(--muted)">Elección razonable</div><div class="big" style="margin:10px 0">${n}</div><p style="font-size:20px">${d}</p></div><button class="btn primary again" style="align-self:center">↺ Otra vez</button>`; cv.querySelector('.again').onclick = () => { path = []; show('start'); }; out.innerHTML = 'Y recuerda: <b>añade otra tecnología solo ante una necesidad concreta y medida</b>.'; return; }
      const [q, opts] = Q[k];
      cv.innerHTML = `<div style="color:var(--muted);font-size:16px">${path.join(' → ') || '&nbsp;'}</div><h3 style="font-family:Karla;font-size:30px;margin:0">${q}</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${opts.map(([t, n]) => `<button class="btn" data-n="${n}" data-t="${esc(t)}" style="font-size:19px;padding:18px;text-align:left">${t}</button>`).join('')}</div>`;
      cv.querySelectorAll('[data-n]').forEach((b) => (b.onclick = () => { path.push(b.dataset.t); show(b.dataset.n); }));
      out.innerHTML = '';
    };
    show('start');
  },

  arch(el) {
    const p = pal();
    const REQ = [['Pedidos sin pérdidas', 'pg', 'PostgreSQL con réplicas síncronas y PITR', 'ACID, restricciones, transacciones (5–10); HA y copias (10, 23)'], ['< 100 ms, también en Black Friday', 'redis', 'Redis: caché, sesiones y carrito', 'Clave-valor en memoria, cache-aside, TTL (13)'], ['Búsqueda tolerante a errores', 'es', 'Elasticsearch sincronizado desde PostgreSQL', 'Índice invertido, analizadores, BM25, fuzzy (17)'], ['Cuadros de mando con años de historia', 'lh', 'CDC → lakehouse medallion; gold en estrella; Power BI sobre SQL warehouse', 'CDC (19), medallion y Delta (21–22), dimensional y SCD (18)'], ['Recomendaciones', 'ml', 'Modelos sobre gold; resultados precalculados en Redis', 'Lakehouse–ML (22), caché (13)'], ['Asistente en lenguaje natural', 'ai', 'Text-to-SQL sobre vistas gold con usuario de solo lectura', 'IA generativa y gobierno (24)'], ['RGPD y resiliencia', 'sec', 'Mínimo privilegio, máscaras, seudonimización en silver, retención; réplicas multizona', 'Seguridad (9, 22, 23)']];
    const N = { app: ['App web', 80, 60], pg: ['PostgreSQL\n+ réplicas', 300, 60], redis: ['Redis', 80, 200], es: ['Elasticsearch', 300, 200], lh: ['Lakehouse\nbronze → silver → gold', 560, 130], bi: ['Power BI', 800, 60], ml: ['ML /\nrecomendaciones', 800, 200], ai: ['Asistente IA', 800, 330], sec: ['Gobierno: permisos,\nmáscaras, auditoría', 430, 330] };
    const E = [['app', 'pg'], ['app', 'redis'], ['app', 'es'], ['pg', 'es'], ['pg', 'lh'], ['lh', 'bi'], ['lh', 'ml'], ['ml', 'redis'], ['lh', 'ai']];
    el.innerHTML = `<div class="w-title">Mercado Next, tres años después<span class="live">INTERACTIVO</span></div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div class="req" style="flex:0 0 330px;display:flex;flex-direction:column;gap:6px">${REQ.map((r, i) => `<button class="btn" data-i="${i}" style="text-align:left;font-size:15px">${i + 1}. ${r[0]}</button>`).join('')}</div><div class="w-canvas" style="flex:1"></div></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const { s } = svg(cv, 920, 400);
    const gE = s.append('g');
    E.forEach(([a, b]) => gE.append('line').attr('x1', N[a][1]).attr('y1', N[a][2]).attr('x2', N[b][1]).attr('y2', N[b][2]).attr('stroke', p.line).attr('stroke-width', 3).attr('data-e', `${a} ${b}`));
    const gN = s.selectAll('g.n').data(Object.entries(N)).join('g').attr('class', 'n').attr('transform', ([, v]) => `translate(${v[1]},${v[2]})`);
    gN.append('rect').attr('x', -95).attr('y', -32).attr('width', 190).attr('height', 64).attr('rx', 14).attr('fill', p.surface).attr('stroke', p.gray).attr('stroke-width', 2);
    gN.each(function ([, v]) { v[0].split('\n').forEach((l, i, a) => d3.select(this).append('text').text(l).attr('text-anchor', 'middle').attr('y', 6 + (i - (a.length - 1) / 2) * 19).attr('font-size', 15).attr('font-weight', 700).attr('fill', p.ink)); });
    const pick = (i) => {
      const [r, k, piece, why] = REQ[i];
      el.querySelectorAll('[data-i]').forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
      gN.select('rect').transition().attr('fill', ([n]) => (n === k ? p.blue : p.surface)).attr('stroke', ([n]) => (n === k ? p.blueD : p.gray));
      gN.selectAll('text').attr('fill', function () { return d3.select(this.parentNode).datum()[0] === k ? '#fff' : p.ink; });
      gE.selectAll('line').attr('stroke', function () { return this.dataset.e.split(' ').includes(k) ? p.blue : p.line; });
      out.innerHTML = `<b>${i + 1}. ${r}</b> → ${piece}. <span style="color:var(--muted)">Justificación: ${why}.</span>`;
    };
    el.querySelector('.req').onclick = (e) => { const b = e.target.closest('[data-i]'); if (b && e.currentTarget.contains(b)) pick(+b.dataset.i); };
    pick(0);
  }
};
