// Widgets de los Temas 1 y 2
import { pal, frame, svg, chart, esc, widgetScope } from '../ui.js';

export const widgets = {
  // ---------- funciones del SGBD ----------
  sgbdfun(el) {
    const p = pal();
    const F = [
      ['Definir', 'Describir qué datos hay y cómo son', '«Un pedido tiene número, fecha, cliente y estado»', '2–5'],
      ['Guardar y recuperar', 'Escribir datos y encontrarlos rápido', '«Dame los pedidos de Ana de este año»', '6–8'],
      ['Hacer cumplir las reglas', 'Rechazar lo que no tiene sentido', '«No se pueden vender −1 unidades»', '3 y 5'],
      ['Controlar el acceso', 'Decidir quién ve y quién cambia qué', '«El almacén ve los productos, pero no las direcciones de los clientes»', '9 y 23'],
      ['Atender a muchos a la vez', 'Que miles de personas trabajen sin pisarse', '«Dos clientes compran el último teclado: solo uno lo consigue»', '10'],
      ['Recuperarse de fallos', 'Volver a un estado correcto tras un error', '«Se va la luz a mitad de una compra: no queda a medias»', '10'],
      ['Describirse a sí mismo', 'Guardar los metadatos', '«¿Qué tablas y columnas existen?»', '5']
    ];
    const { cv, out } = frame(el, { title: 'Las siete funciones de un SGBD', live: true });
    const { s, W, H } = svg(cv);
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36;
    const pos = F.map((f, i) => { const a = -Math.PI / 2 + (i / F.length) * Math.PI * 2; return [cx + Math.cos(a) * Math.min(R * 1.45, W / 2 - 125), cy + Math.sin(a) * R]; });
    const ln = s.selectAll('line').data(pos).join('line').attr('x1', cx).attr('y1', cy).attr('x2', (d) => d[0]).attr('y2', (d) => d[1]).attr('stroke', p.line).attr('stroke-width', 3);
    s.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 62).attr('fill', p.blue);
    s.append('text').text('SGBD').attr('x', cx).attr('y', cy + 9).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 28);
    const g = s.selectAll('g.f').data(F).join('g').attr('class', 'f').attr('transform', (d, i) => `translate(${pos[i]})`).style('cursor', 'pointer');
    g.append('rect').attr('x', -118).attr('y', -26).attr('width', 236).attr('height', 52).attr('rx', 26).attr('fill', p.surface).attr('stroke', p.blue).attr('stroke-width', 2.5);
    g.append('text').text((d) => d[0]).attr('text-anchor', 'middle').attr('dy', 7).attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 18).attr('fill', p.title);
    const sel = (i) => {
      g.select('rect').attr('fill', (d, j) => (j === i ? p.blue : p.surface)); g.select('text').attr('fill', (d, j) => (j === i ? '#fff' : p.title));
      ln.attr('stroke', (d, j) => (j === i ? p.blue : p.line));
      out.innerHTML = `<b>${F[i][0]}</b>: ${F[i][1]}. En Mercado Next: ${F[i][2]} · Temas ${F[i][3]}`;
    };
    g.on('mouseenter click', (e, d) => sel(F.indexOf(d)));
    sel(0);
  },

  // ---------- ficheros frente a SGBD ----------
  ficheros(el) {
    const p = pal();
    el.innerHTML = `<div class="w-title">Del fichero que se copia a una base de datos compartida<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><div class="seg"><button data-m="f" class="active">Sistema de ficheros</button><button data-m="d">Con un SGBD</button></div>
      <button class="btn primary act">Ana se muda a Úbeda (lo cambia Ventas)</button><button class="btn rst">↺</button></div>
      <div class="w-canvas" style="display:flex;align-items:center;justify-content:center"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    let mode = 'f', city = { Ventas: 'Jaén', Facturación: 'Jaén', Almacén: 'Jaén' }, shared = 'Jaén';
    const apps = ['Ventas', 'Facturación', 'Almacén'];
    const card = (c, bad) => `<div style="font-family:var(--font-mono);font-size:16px;padding:10px 12px;border-radius:10px;border:2px solid ${bad ? p.red : p.line};background:${bad ? 'var(--tint-red)' : 'var(--surface-2)'};transition:.3s">Ana Ruiz<br>ciudad = <b style="color:${bad ? p.red : p.blueD}">${c}</b></div>`;
    const render = () => {
      if (mode === 'f') {
        const vals = new Set(Object.values(city)); const inc = vals.size > 1;
        cv.innerHTML = `<div style="display:flex;gap:30px;width:100%;justify-content:center">${apps.map((a) => `<div style="flex:1;max-width:280px;text-align:center">
          <div class="card" style="padding:14px"><h4 style="font-size:21px">App ${a}</h4></div><div style="font-size:28px;color:var(--muted)">↓</div>
          <div style="font-size:14px;color:var(--muted);margin-bottom:6px">📄 pedidos_${a.toLowerCase().slice(0, 5)}.xlsx</div>${card(city[a], inc && city[a] !== city.Ventas)}</div>`).join('')}</div>`;
        out.innerHTML = inc ? '<span class="bad"><b style="color:var(--red)">Inconsistencia</b>: Facturación y Almacén siguen enviando a Jaén. El mismo dato está guardado tres veces.</span>' : 'Tres copias del mismo cliente, una por aplicación (<b>redundancia</b>).';
      } else {
        cv.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%"><div style="display:flex;gap:30px">${apps.map((a) => `<div class="card" style="padding:14px 26px"><h4 style="font-size:21px">App ${a}</h4><p>ve: <b>${shared}</b></p></div>`).join('')}</div>
          <div style="font-size:28px;color:var(--muted)">↓ ↓ ↓</div>
          <div style="display:flex;gap:16px;align-items:center"><svg width="90" height="100" viewBox="0 0 90 100"><ellipse cx="45" cy="16" rx="40" ry="12" fill="${p.blue}"/><path d="M5 16v66c0 7 18 12 40 12s40-5 40-12V16" fill="${p.blueD}"/><ellipse cx="45" cy="16" rx="40" ry="12" fill="${p.blue}"/></svg>
          <div style="width:260px">${card(shared, false)}</div></div></div>`;
        out.innerHTML = 'Un único repositorio integrado: el dato se guarda <b>una vez</b> y todas las aplicaciones lo comparten.';
      }
    };
    el.querySelectorAll('[data-m]').forEach((b) => (b.onclick = () => { mode = b.dataset.m; el.querySelectorAll('[data-m]').forEach((x) => x.classList.toggle('active', x === b)); render(); }));
    el.querySelector('.act').onclick = () => { city.Ventas = 'Úbeda'; shared = 'Úbeda'; render(); };
    el.querySelector('.rst').onclick = () => { city = { Ventas: 'Jaén', Facturación: 'Jaén', Almacén: 'Jaén' }; shared = 'Jaén'; render(); };
    render();
  },

  // ---------- ANSI/SPARC ----------
  ansi(el) {
    const p = pal();
    const { cv, out, ctl } = frame(el, { title: 'Arquitectura ANSI/SPARC', live: true,
      controls: '<button class="btn" data-a="idx">Crear un índice</button><button class="btn" data-a="col">Añadir columna telefono</button><button class="btn" data-a="ren">Renombrar ciudad → localidad</button><button class="btn" data-a="rst">↺</button>' });
    let st = { idx: false, col: false, ren: false };
    const views = [['Marketing', ['nombre', 'ciudad', 'fecha_alta']], ['Contabilidad', ['id', 'nombre', 'email']], ['Web', ['nombre', 'ciudad']]];
    const render = (flash) => {
      const cols = ['id', 'nombre', 'email', st.ren ? 'localidad' : 'ciudad', 'fecha_alta'].concat(st.col ? ['telefono'] : []);
      const lvl = (name, sub, inner, key) => `<div style="display:flex;gap:18px;align-items:stretch"><div style="width:170px;flex:none;border-radius:14px;background:${p.gray};color:#fff;padding:12px 14px;font-family:Karla;font-weight:700;font-size:19px">${name}<div style="font-weight:400;font-size:14px;opacity:.85">${sub}</div></div>
        <div class="${flash === key ? 'flash' : ''}" style="flex:1;border:2px dashed var(--line);border-radius:14px;padding:12px;display:flex;gap:12px;flex-wrap:wrap;align-items:center">${inner}</div></div>`;
      const chip = (t, c) => `<span style="font-family:var(--font-mono);font-size:15px;padding:4px 10px;border-radius:8px;background:${c || 'var(--surface-2)'};${c ? 'color:#fff' : ''}">${t}</span>`;
      const ext = views.map(([n, cs]) => {
        const broken = cs.some((c) => c === 'ciudad') && st.ren;
        return `<div style="border-radius:12px;padding:8px 12px;border:2px solid ${broken ? p.red : p.blue};background:${broken ? 'var(--tint-red)' : 'var(--tint-blue)'}"><b style="font-family:Karla">Vista ${n}</b> ${broken ? '<b style="color:var(--red)">✖ ROTA</b>' : '✔'}<br>${cs.map((c) => chip(c, broken && c === 'ciudad' ? p.red : null)).join(' ')}</div>`;
      }).join('');
      const con = `<b style="font-family:Karla;font-size:18px">cliente</b> ${cols.map((c) => chip(c, (c === 'telefono' || c === 'localidad') ? p.blue : null)).join(' ')}`;
      const int = `${chip('📄 páginas de 8 kB')} ${chip('heap: base/16384/16390')} ${st.idx ? chip('🌲 índice B-tree sobre email', p.blue) : ''}`;
      cv.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px">${lvl('Externo', 'vistas de usuario', ext, 'ext')}<div style="text-align:center;color:var(--muted);font-size:14px">⇅ correspondencia externo/conceptual · independencia lógica</div>
        ${lvl('Conceptual', 'tablas y restricciones', con, 'con')}<div style="text-align:center;color:var(--muted);font-size:14px">⇅ correspondencia conceptual/interno · independencia física</div>${lvl('Interno', 'almacenamiento físico', int, 'int')}</div>`;
    };
    ctl.onclick = (e) => {
      const a = e.target.dataset.a; if (!a) return;
      if (a === 'rst') { st = { idx: false, col: false, ren: false }; render(); out.innerHTML = ''; return; }
      st[a] = true; render(a === 'idx' ? 'int' : 'con');
      out.innerHTML = { idx: '<b>Independencia física</b>: el nivel interno cambia y ni las tablas ni las vistas se enteran. Las consultas siguen igual (y más rápidas).',
        col: '<b>Independencia lógica</b>: el esquema conceptual cambia y las vistas existentes siguen funcionando.',
        ren: '<span class="bad">La independencia lógica <b>tiene límites</b>: renombrar una columna que usan las vistas las rompe. Por eso los cambios de esquema se planifican.</span>' }[a];
    };
    render();
  },

  // ---------- viaje de una consulta por el motor ----------
  pipeline(el) {
    const life = widgetScope(el);
    const p = pal();
    const { cv, out, ctl } = frame(el, { title: 'Por dentro de PostgreSQL', live: true, controls: '<button class="btn primary go">▶ Ejecutar consulta</button><span class="mono" style="font-size:15px">SELECT nombre FROM cliente WHERE id = 4;</span>' });
    const steps = [
      ['Analizador', 'parser', 'Comprueba la sintaxis y construye el árbol de la consulta.', 0],
      ['Reescritor', 'rules', 'Aplica reglas: por ejemplo, sustituye una vista por su definición.', 0],
      ['Optimizador', 'planner', 'Elige el plan más barato usando estadísticas del catálogo. EXPLAIN lo muestra.', 0],
      ['Ejecutor', 'executor', 'Recorre el plan (Index Scan, Hash Join…) y devuelve filas.', 0],
      ['Gestor de búfer', 'shared_buffers', 'Si la página está en memoria, no va a disco.', 1],
      ['Disco', 'páginas de 8 kB', 'Lee la página que contiene la fila.', 1]
    ];
    const side = [['Catálogo', 'pg_catalog'], ['Transacciones', 'MVCC y bloqueos'], ['Registro', 'WAL']];
    cv.innerHTML = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:8px">${steps.map((s, i) => `<div class="card st" data-i="${i}" style="padding:14px;transition:.25s;${i >= 4 ? 'grid-column:span 2' : ''}"><h4 style="font-size:20px">${i + 1}. ${s[0]}</h4><p class="mono" style="font-size:14px">${s[1]}</p></div>`).join('')}</div>
      <div style="display:flex;gap:14px;margin-top:14px">${side.map((s) => `<div class="card" style="flex:1;padding:10px 14px;border-style:dashed"><h4 style="font-size:17px">${s[0]}</h4><p class="mono" style="font-size:14px">${s[1]}</p></div>`).join('')}</div>
      <div style="display:flex;gap:10px;margin-top:10px;font-size:15px;color:var(--muted)"><span class="pill">Procesador de consultas: 1–4</span><span class="pill gray">Gestor de almacenamiento y transacciones: 5–6 + registro</span></div>`;
    let run = false, alive = true;
    const go = async () => {
      if (run) return; run = true;
      for (let i = 0; i < steps.length && alive; i++) {
        cv.querySelectorAll('.st').forEach((c) => { const on = +c.dataset.i === i; c.style.borderColor = on ? p.blue : ''; c.style.background = on ? 'var(--tint-blue)' : ''; c.style.transform = on ? 'translateY(-4px)' : ''; });
        out.innerHTML = `<b>${steps[i][0]}</b>: ${steps[i][2]}`;
        if (!(await life.sleep(1500))) return;
      }
      if (alive) out.innerHTML = '✔ Resultado: <code>Iker Mora</code>. Cada cambio se habría anotado antes en el <b>WAL</b>.';
      run = false;
    };
    ctl.querySelector('.go').onclick = go;
    return () => { alive = false; };
  },

  // ---------- radar OLTP / OLAP ----------
  oltpolap(el) {
    const p = pal();
    const { cv, out, ctl } = frame(el, { title: 'Perfil de carga', live: true, controls: '<button class="btn on" data-s="0">OLTP</button><button class="btn on" data-s="1">OLAP</button>' });
    const ch = chart(cv, { type: 'radar', data: {
      labels: ['Transacciones/s', 'Filas por consulta', 'Complejidad', 'Volumen histórico', '% escrituras', 'Usuarios concurrentes'],
      datasets: [
        { label: 'OLTP', data: [5, 1, 1.5, 2, 4.5, 5], borderColor: p.blue, backgroundColor: p.blue + '40', pointRadius: 6, borderWidth: 3 },
        { label: 'OLAP', data: [1.5, 5, 5, 5, 1, 2], borderColor: p.gray, backgroundColor: p.gray + '30', pointRadius: 6, borderWidth: 3 }] },
      options: { scales: { r: { min: 0, max: 5, ticks: { display: false }, grid: { color: p.line }, angleLines: { color: p.line }, pointLabels: { font: { size: 16, weight: 600 }, color: p.ink } } },
        plugins: { legend: { position: 'bottom' } } } });
    ctl.onclick = (e) => { const b = e.target.closest('[data-s]'); if (!b) return; b.classList.toggle('on'); ch.setDatasetVisibility(+b.dataset.s, b.classList.contains('on')); ch.update(); };
    out.innerHTML = '<b>OLTP</b>: altas, pagos, reservas. <b>OLAP</b>: informes y cuadros de mando.';
    return () => ch.destroy();
  },

  // ---------- diagrama de Chen interactivo ----------
  chen(el) {
    const p = pal();
    const { cv, out } = frame(el, { title: 'Notación de Chen', live: true });
    const { s, W, H } = svg(cv, 860, 420);
    const E = [['Cliente', 120, 210], ['Pedido', 430, 210], ['Producto', 740, 210]], R = [['realiza', 275, 210, '1', 'N'], ['contiene', 585, 210, 'M', 'N']];
    const A = [['id_cliente', 50, 90, 'Cliente', 1], ['nombre', 190, 80, 'Cliente'], ['email', 70, 330, 'Cliente'], ['id_pedido', 380, 90, 'Pedido', 1], ['fecha', 500, 90, 'Pedido'],
      ['id_producto', 690, 90, 'Producto', 1], ['precio', 810, 100, 'Producto'], ['nombre', 790, 330, 'Producto'], ['cantidad', 585, 335, 'contiene']];
    const at = (n) => [...E, ...R].find((e) => e[0] === n);
    const lines = s.append('g');
    A.forEach((a) => { const o = at(a[3]); lines.append('line').attr('x1', a[1]).attr('y1', a[2]).attr('x2', o[1]).attr('y2', o[2]).attr('stroke', p.mid).attr('stroke-width', 2); });
    lines.append('line').attr('x1', 120).attr('y1', 210).attr('x2', 740).attr('y2', 210).attr('stroke', p.mid).attr('stroke-width', 2.5);
    R.forEach((r) => { s.append('text').text(r[3]).attr('x', r[1] - 70).attr('y', 198).attr('font-weight', 700).attr('fill', p.blueD).attr('font-size', 20); s.append('text').text(r[4]).attr('x', r[1] + 60).attr('y', 198).attr('font-weight', 700).attr('fill', p.blueD).attr('font-size', 20); });
    const info = (t, html) => (e) => { out.innerHTML = `<b>${t}</b>: ${html}`; d3.select(e.currentTarget).select('*').attr('stroke-width', 5); };
    const off = (e) => d3.select(e.currentTarget).select('*').attr('stroke-width', 2.5);
    s.selectAll('g.a').data(A).join('g').attr('class', 'a').style('cursor', 'pointer').each(function (a) {
      const g = d3.select(this); g.append('ellipse').attr('cx', a[1]).attr('cy', a[2]).attr('rx', 62).attr('ry', 24).attr('fill', p.surface).attr('stroke', p.gray).attr('stroke-width', 2.5);
      g.append('text').text(a[0]).attr('x', a[1]).attr('y', a[2] + 6).attr('text-anchor', 'middle').attr('font-size', 16).attr('fill', p.ink).attr('text-decoration', a[4] ? 'underline' : null);
      g.on('mouseenter', info(a[4] ? 'Atributo identificador (subrayado)' : 'Atributo', a[3] === 'contiene' ? '<i>cantidad</i> no es del pedido ni del producto: es de la <b>relación</b>.' : `describe a ${a[3]}.`)).on('mouseleave', off);
    });
    s.selectAll('g.r').data(R).join('g').attr('class', 'r').style('cursor', 'pointer').each(function (r) {
      const g = d3.select(this); g.append('path').attr('d', `M${r[1] - 70},${r[2]} L${r[1]},${r[2] - 38} L${r[1] + 70},${r[2]} L${r[1]},${r[2] + 38} Z`).attr('fill', p.tint).attr('stroke', p.blue).attr('stroke-width', 2.5);
      g.append('text').text(r[0]).attr('x', r[1]).attr('y', r[2] + 6).attr('text-anchor', 'middle').attr('font-size', 17).attr('font-weight', 700).attr('fill', p.blueD);
      g.on('mouseenter', info('Relación (rombo)', r[0] === 'realiza' ? 'un cliente <i>realiza</i> pedidos: <b>1:N</b>.' : 'un pedido <i>contiene</i> productos: <b>N:M</b>, con atributo propio <i>cantidad</i>.')).on('mouseleave', off);
    });
    s.selectAll('g.e').data(E).join('g').attr('class', 'e').style('cursor', 'pointer').each(function (en) {
      const g = d3.select(this); g.append('rect').attr('x', en[1] - 70).attr('y', en[2] - 30).attr('width', 140).attr('height', 60).attr('rx', 6).attr('fill', p.gray).attr('stroke', p.gray).attr('stroke-width', 2.5);
      g.append('text').text(en[0]).attr('x', en[1]).attr('y', en[2] + 7).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 21).attr('fill', '#fff');
      g.on('mouseenter', info('Entidad (rectángulo)', `«cosa» con existencia propia. Ocurrencia de ejemplo: ${{ Cliente: 'la clienta Ana Ruiz', Pedido: 'el pedido 101', Producto: 'el Teclado mecánico K70' }[en[0]]}.`)).on('mouseleave', off);
    });
    out.innerHTML = 'Rectángulos = entidades · rombos = relaciones · elipses = atributos (el identificador, subrayado).';
  },

  // ---------- tipos de atributos ----------
  attrs(el) {
    const p = pal();
    const T = [
      ['Simple', 'No se puede dividir', 'nombre', 'Una columna', 'nombre VARCHAR(100)'],
      ['Compuesto', 'Formado por otros atributos', 'dirección = calle + número + cp', 'Una columna por componente', 'calle VARCHAR(100),\nnumero VARCHAR(10),\ncp CHAR(5)'],
      ['Monovalorado', 'Un único valor por ocurrencia', 'fecha_nac', 'Una columna', 'fecha_nac DATE'],
      ['Multivalorado', 'Varios valores (doble elipse)', 'teléfono', 'Una tabla aparte', 'CREATE TABLE telefono (\n  empleado_id INT REFERENCES empleado,\n  numero VARCHAR(15),\n  PRIMARY KEY (empleado_id, numero));'],
      ['Derivado', 'Se calcula (elipse discontinua)', 'edad a partir de fecha_nac', 'Normalmente no se guarda', "SELECT AGE(fecha_nac) AS edad\nFROM empleado;"],
      ['Clave', 'Distingue cada ocurrencia (subrayado)', 'dni', 'Clave primaria', 'dni CHAR(9) PRIMARY KEY'],
      ['Opcional', 'Puede no tener valor', 'segundo_apellido', 'Columna que admite NULL', 'segundo_apellido VARCHAR(60) -- admite NULL']];
    el.innerHTML = `<div class="w-title">Elige un tipo de atributo<span class="live">INTERACTIVO</span></div>
      <div style="display:flex;gap:22px;flex:1;min-height:0"><div class="list" style="display:flex;flex-direction:column;gap:8px;width:250px">${T.map((t, i) => `<button class="btn" data-i="${i}" style="text-align:left;font-size:18px">${t[0]}</button>`).join('')}</div>
      <div class="w-canvas" style="flex:1"></div><div style="flex:1;display:flex;flex-direction:column;gap:12px" class="info"></div></div>`;
    const cv = el.querySelector('.w-canvas'), info = el.querySelector('.info');
    const sel = (i) => {
      el.querySelectorAll('.list .btn').forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
      const t = T[i]; cv.innerHTML = '';
      const { s, W, H } = svg(cv, 420, 360);
      const cx = 210, cy = 120;
      s.append('rect').attr('x', cx - 75).attr('y', 260).attr('width', 150).attr('height', 56).attr('rx', 6).attr('fill', p.gray);
      s.append('text').text('Entidad').attr('x', cx).attr('y', 295).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 20);
      s.append('line').attr('x1', cx).attr('y1', cy + 28).attr('x2', cx).attr('y2', 260).attr('stroke', p.mid).attr('stroke-width', 2.5);
      const ell = (x, y, rx, txt, o = {}) => {
        if (o.double) s.append('ellipse').attr('cx', x).attr('cy', y).attr('rx', rx + 8).attr('ry', 36).attr('fill', 'none').attr('stroke', p.blue).attr('stroke-width', 2.5);
        s.append('ellipse').attr('cx', x).attr('cy', y).attr('rx', rx).attr('ry', 28).attr('fill', p.surface).attr('stroke', p.blue).attr('stroke-width', 2.5).attr('stroke-dasharray', o.dash ? '7 5' : null);
        s.append('text').text(txt).attr('x', x).attr('y', y + 6).attr('text-anchor', 'middle').attr('font-size', 17).attr('fill', p.ink).attr('text-decoration', o.u ? 'underline' : null);
      };
      const name = t[2].split(' ')[0];
      if (i === 1) { ell(cx, cy, 80, 'dirección'); [['calle', 70, 30], ['número', 210, 20], ['cp', 350, 30]].forEach(([n, x, y]) => { s.append('line').attr('x1', cx).attr('y1', cy - 28).attr('x2', x).attr('y2', y + 22).attr('stroke', p.mid).attr('stroke-width', 2); ell(x, y, 52, n); }); }
      else ell(cx, cy, 95, name, { double: i === 3, dash: i === 4, u: i === 5 });
      if (i === 6) s.append('text').text('(0,1)').attr('x', cx + 14).attr('y', 210).attr('font-size', 17).attr('fill', p.blueD).attr('font-weight', 700);
      info.innerHTML = `<div class="card"><h4>${t[0]}</h4><p>${t[1]}. Ejemplo: <b>${t[2]}</b></p></div><div class="box"><div class="bt">Al pasar a tablas</div><p>${t[3]}</p></div><pre class="code" style="font-size:16px">${esc(t[4])}</pre>`;
    };
    el.querySelector('.list').onclick = (e) => { const b = e.target.closest('[data-i]'); if (b && e.currentTarget.contains(b)) sel(+b.dataset.i); };
    sel(0);
  },

  // ---------- cardinalidad: correspondencias entre conjuntos ----------
  cardmap(el) {
    const p = pal();
    const P = {
      'Cliente – Pedido': [['Cliente', ['Ana', 'Luis', 'Marta', 'Elena']], ['Pedido', ['101', '102', '103', '104', '108']], [[0, 0], [1, 1], [0, 2], [2, 3], [1, 4]]],
      'Persona – Pasaporte': [['Persona', ['Ana', 'Luis', 'Marta', 'Iker']], ['Pasaporte', ['PAA123', 'PAB456', 'PAC789']], [[0, 0], [1, 1], [3, 2]]],
      'Alumno – Asignatura': [['Alumno', ['Sara', 'Pablo', 'Irene']], ['Asignatura', ['BBDD', 'Python', 'Estadística', 'BI']], [[0, 0], [0, 1], [1, 0], [1, 2], [2, 0], [2, 3]]]
    };
    const { cv, out, ctl } = frame(el, { title: 'Correspondencia entre conjuntos', live: true,
      controls: `${Object.keys(P).map((k, i) => `<button class="btn ${i ? '' : 'on'}" data-p="${k}">${k}</button>`).join('')}<button class="btn" data-c="1">Borrar enlaces</button>` });
    let A, B, links, pick = null;
    const load = (k) => { [A, B] = [P[k][0], P[k][1]]; links = P[k][2].map((x) => x.slice()); pick = null; draw(); };
    const draw = () => {
      cv.innerHTML = '';
      const { s, W, H } = svg(cv);
      const xa = W * 0.22, xb = W * 0.62, n = Math.max(A[1].length, B[1].length), gap = (H - 80) / n;
      const ya = (i) => 60 + i * gap + (n - A[1].length) * gap / 2, yb = (i) => 60 + i * gap + (n - B[1].length) * gap / 2;
      [[xa, A, ya], [xb, B, yb]].forEach(([x, S, y]) => {
        s.append('ellipse').attr('cx', x).attr('cy', H / 2 + 10).attr('rx', 90).attr('ry', H / 2 - 20).attr('fill', p.tint).attr('stroke', p.blue).attr('stroke-width', 2);
        s.append('text').text(S[0]).attr('x', x).attr('y', 24).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 22).attr('fill', p.title);
      });
      links.forEach(([i, j]) => s.append('line').attr('x1', xa + 40).attr('y1', ya(i)).attr('x2', xb - 40).attr('y2', yb(j)).attr('stroke', p.blue).attr('stroke-width', 3));
      const node = (x, y, t, side, i) => {
        const g = s.append('g').style('cursor', 'pointer');
        g.append('rect').attr('x', x - 44).attr('y', y - 18).attr('width', 88).attr('height', 36).attr('rx', 18).attr('fill', pick && pick[0] === side && pick[1] === i ? p.blue : p.surface).attr('stroke', p.blueD).attr('stroke-width', 2);
        g.append('text').text(t).attr('x', x).attr('y', y + 6).attr('text-anchor', 'middle').attr('font-size', 16).attr('fill', pick && pick[0] === side && pick[1] === i ? '#fff' : p.ink);
        g.on('click', () => {
          if (!pick || pick[0] === side) { pick = [side, i]; draw(); return; }
          const [a, b] = side === 'B' ? [pick[1], i] : [i, pick[1]];
          const k = links.findIndex((l) => l[0] === a && l[1] === b);
          if (k >= 0) links.splice(k, 1); else links.push([a, b]);
          pick = null; draw();
        });
      };
      A[1].forEach((t, i) => node(xa, ya(i), t, 'A', i)); B[1].forEach((t, j) => node(xb, yb(j), t, 'B', j));
      const cA = A[1].map((_, i) => links.filter((l) => l[0] === i).length), cB = B[1].map((_, j) => links.filter((l) => l[1] === j).length);
      const mm = (c) => [Math.min(...c), Math.max(...c)];
      const [aMin, aMax] = mm(cA), [bMin, bMax] = mm(cB);
      const N = (m) => (m > 1 ? 'N' : m);
      const type = aMax <= 1 && bMax <= 1 ? '1:1' : aMax > 1 && bMax > 1 ? 'N:M' : '1:N';
      const tx = W * 0.84;
      s.append('text').text(type).attr('x', tx).attr('y', H / 2 - 30).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 64).attr('fill', p.blue);
      s.append('text').text(`${A[0]} (${aMin},${N(aMax)})`).attr('x', tx).attr('y', H / 2 + 20).attr('text-anchor', 'middle').attr('font-size', 19).attr('fill', p.ink).attr('font-weight', 700);
      s.append('text').text(`${B[0]} (${bMin},${N(bMax)})`).attr('x', tx).attr('y', H / 2 + 48).attr('text-anchor', 'middle').attr('font-size', 19).attr('fill', p.ink).attr('font-weight', 700);
      out.innerHTML = `Participación de ${A[0]}: <b>${aMin ? 'total' : 'parcial'}</b> · de ${B[0]}: <b>${bMin ? 'total' : 'parcial'}</b>. Haz clic en un elemento de un lado y luego en uno del otro para enlazar/desenlazar.`;
    };
    ctl.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.c) { links = []; draw(); return; } ctl.querySelectorAll('[data-p]').forEach((x) => x.classList.toggle('on', x === b)); load(b.dataset.p); };
    load('Cliente – Pedido');
  },

  // ---------- entidad débil ----------
  weak(el) {
    const p = pal();
    const { cv, out } = frame(el, { title: 'Pedido (fuerte) y Línea (débil)', live: true });
    const { s, W, H } = svg(cv, 820, 400);
    const strong = (x, y, t, dbl) => {
      if (dbl) s.append('rect').attr('x', x - 82).attr('y', y - 38).attr('width', 164).attr('height', 76).attr('rx', 6).attr('fill', 'none').attr('stroke', p.gray).attr('stroke-width', 2.5);
      s.append('rect').attr('x', x - 74).attr('y', y - 30).attr('width', 148).attr('height', 60).attr('rx', 4).attr('fill', p.gray);
      s.append('text').text(t).attr('x', x).attr('y', y + 7).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 21).attr('fill', '#fff');
    };
    s.append('line').attr('x1', 150).attr('y1', 140).attr('x2', 670).attr('y2', 140).attr('stroke', p.mid).attr('stroke-width', 2.5);
    s.append('line').attr('x1', 410).attr('y1', 136).attr('x2', 670).attr('y2', 136).attr('stroke', p.mid).attr('stroke-width', 2.5);
    s.append('line').attr('x1', 410).attr('y1', 144).attr('x2', 670).attr('y2', 144).attr('stroke', p.mid).attr('stroke-width', 2.5);
    [[90, 40, 'id_pedido', 150, 'u'], [210, 40, 'fecha', 150], [610, 270, 'num_línea', 670, 'd'], [740, 270, 'cantidad', 670]].forEach(([x, y, t, ex, u]) => {
      s.append('line').attr('x1', x).attr('y1', y).attr('x2', ex).attr('y2', 140).attr('stroke', p.mid).attr('stroke-width', 2);
      s.append('ellipse').attr('cx', x).attr('cy', y).attr('rx', 62).attr('ry', 24).attr('fill', p.surface).attr('stroke', p.gray).attr('stroke-width', 2.5);
      s.append('text').text(t).attr('x', x).attr('y', y + 6).attr('text-anchor', 'middle').attr('font-size', 16).attr('fill', p.ink).attr('text-decoration', u === 'u' ? 'underline' : null);
      if (u === 'd') s.append('line').attr('x1', x - 40).attr('y1', y + 12).attr('x2', x + 40).attr('y2', y + 12).attr('stroke', p.ink).attr('stroke-dasharray', '5 4');
    });
    s.append('path').attr('d', 'M330,140 L410,92 L490,140 L410,188 Z').attr('fill', p.tint).attr('stroke', p.blue).attr('stroke-width', 2.5);
    s.append('path').attr('d', 'M342,140 L410,100 L478,140 L410,180 Z').attr('fill', 'none').attr('stroke', p.blue).attr('stroke-width', 2.5);
    s.append('text').text('tiene').attr('x', 410).attr('y', 146).attr('text-anchor', 'middle').attr('font-weight', 700).attr('fill', p.blueD).attr('font-size', 17);
    strong(150, 140, 'Pedido'); strong(670, 140, 'Línea', true);
    s.append('text').text('1').attr('x', 245).attr('y', 128).attr('font-weight', 700).attr('fill', p.blueD).attr('font-size', 20);
    s.append('text').text('N').attr('x', 560).attr('y', 128).attr('font-weight', 700).attr('fill', p.blueD).attr('font-size', 20);
    // tabla resultante
    const rows = [[101, 1, 'K70'], [101, 2, 'M50'], [102, 1, 'Monitor 27"'], [103, 1, 'Alfombrilla'], [103, 2, 'Lámpara']];
    const tg = s.append('g').attr('transform', 'translate(60,250)');
    tg.append('text').text('LINEA (pedido_id, num_linea, …)').attr('font-family', 'IBM Plex Mono').attr('font-size', 15).attr('fill', p.muted);
    rows.forEach((r, i) => {
      const g = tg.append('g').attr('transform', `translate(${(i % 3) * 150},${18 + Math.floor(i / 3) * 52})`).style('cursor', 'pointer');
      g.append('rect').attr('width', 140).attr('height', 44).attr('rx', 8).attr('fill', p.surface2).attr('stroke', p.line);
      g.append('text').text(`(${r[0]}, ${r[1]})`).attr('x', 70).attr('y', 20).attr('text-anchor', 'middle').attr('font-family', 'IBM Plex Mono').attr('font-size', 16).attr('font-weight', 700).attr('fill', p.blueD);
      g.append('text').text(r[2]).attr('x', 70).attr('y', 37).attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', p.muted);
      g.on('mouseenter', () => { out.innerHTML = `«Línea ${r[1]}» se repite en varios pedidos; solo <b>(${r[0]}, ${r[1]})</b> identifica la fila: clave = clave de la propietaria + discriminador.`; });
    });
    out.innerHTML = 'Doble rectángulo = entidad débil · doble rombo = relación identificadora · discriminador subrayado con línea discontinua.';
  },

  // ---------- jerarquía con validación ----------
  hier(el) {
    const p = pal();
    const subs = ['Docente', 'Administrativo', 'Investigador'], ppl = ['Ana', 'Luis', 'Marta', 'Iker', 'Sofía'];
    let M = [[1, 0, 0], [0, 1, 0], [1, 0, 1], [0, 0, 0], [0, 1, 0]], dis = 'd', comp = 't';
    el.innerHTML = `<div class="w-title">Empleado → Docente / Administrativo / Investigador<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><label>Disyunción <select class="d"><option value="d">Disjunta (d)</option><option value="o">Solapada (o)</option></select></label>
      <label>Completitud <select class="c"><option value="t">Total (t)</option><option value="p">Parcial (p)</option></select></label></div>
      <div class="w-canvas" style="display:flex;gap:30px;align-items:center"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const render = () => {
      cv.innerHTML = `<svg viewBox="0 0 380 300" style="width:330px;height:260px;flex:none"><rect x="110" y="10" width="160" height="56" rx="6" fill="${p.gray}"/><text x="190" y="45" text-anchor="middle" fill="${'#fff'}" font-family="Karla" font-weight="700" font-size="20">Empleado</text>
        <line x1="190" y1="66" x2="190" y2="120" stroke="${p.mid}" stroke-width="2.5"/><path d="M150,120 L190,100 L230,120 L190,150 Z" fill="${p.tint}" stroke="${p.blue}" stroke-width="2.5"/><text x="190" y="130" text-anchor="middle" font-size="13" font-weight="700" fill="${p.blueD}">ES UN</text>
        <text x="245" y="110" font-size="18" font-weight="700" fill="${p.blue}">(${dis}, ${comp})</text>${subs.map((s, i) => `<line x1="190" y1="150" x2="${60 + i * 130}" y2="220" stroke="${p.mid}" stroke-width="2.5"/><rect x="${60 + i * 130 - 58}" y="220" width="116" height="48" rx="6" fill="${p.gray}"/><text x="${60 + i * 130}" y="250" text-anchor="middle" font-size="15" font-family="Karla" font-weight="700" fill="${'#fff'}">${s}</text>`).join('')}</svg>
        <table class="edit" style="font-size:16px"><thead><tr><th>Empleado</th>${subs.map((s) => `<th>${s.slice(0, 6)}.</th>`).join('')}<th></th></tr></thead><tbody>${ppl.map((n, i) => {
          const c = M[i].reduce((a, b) => a + b, 0); const bad = (dis === 'd' && c > 1) || (comp === 't' && c === 0);
          return `<tr><td style="padding:8px 12px;font-weight:700">${n}</td>${M[i].map((v, j) => `<td style="text-align:center;cursor:pointer;padding:6px 14px;font-size:20px;${v ? `background:var(--tint-blue);color:${p.blueD}` : ''}" data-i="${i}" data-j="${j}">${v ? '●' : '·'}</td>`).join('')}<td style="padding:6px 10px">${bad ? '<span class="pill bad">✖</span>' : '<span class="pill">✔</span>'}</td></tr>`;
        }).join('')}</tbody></table>`;
      const errs = [];
      ppl.forEach((n, i) => { const c = M[i].reduce((a, b) => a + b, 0); if (dis === 'd' && c > 1) errs.push(`${n} está en ${c} subclases y la jerarquía es <b>disjunta</b>`); if (comp === 't' && c === 0) errs.push(`${n} no está en ninguna subclase y la jerarquía es <b>total</b>`); });
      out.innerHTML = errs.length ? `<span style="color:var(--red)">✖ ${errs.join(' · ')}</span>` : '✔ Las ocurrencias cumplen las restricciones de la jerarquía.';
    };
    cv.onclick = (e) => { const td = e.target.closest('td[data-i]'); if (!td) return; M[+td.dataset.i][+td.dataset.j] ^= 1; render(); };
    el.querySelector('.d').onchange = (e) => { dis = e.target.value; render(); };
    el.querySelector('.c').onchange = (e) => { comp = e.target.value; render(); };
    render();
  },

  // ---------- notaciones ----------
  notation(el) {
    const p = pal();
    el.innerHTML = `<div class="w-title">Cliente — realiza — Pedido<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><label>Cada <b>cliente</b> tiene <select class="a"><option value="0,N" selected>(0,N) cero o muchos</option><option value="1,N">(1,N) uno o muchos</option><option value="0,1">(0,1) cero o uno</option><option value="1,1">(1,1) exactamente uno</option></select> pedidos</label>
      <label>Cada <b>pedido</b> es de <select class="b"><option value="1,1" selected>(1,1) exactamente uno</option><option value="0,1">(0,1) cero o uno</option><option value="1,N">(1,N) uno o muchos</option><option value="0,N">(0,N) cero o muchos</option></select> clientes</label></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const uml = { '1,1': '1', '0,1': '0..1', '1,N': '1..*', '0,N': '0..*' }, read = { '1,1': 'exactamente uno', '0,1': 'cero o uno', '1,N': 'uno o muchos', '0,N': 'cero o muchos' };
    const draw = () => {
      const a = el.querySelector('.a').value, b = el.querySelector('.b').value;
      cv.innerHTML = '';
      const { s, W, H } = svg(cv, 1100, 420);
      const ent = (x, y, t) => { s.append('rect').attr('x', x - 80).attr('y', y - 26).attr('width', 160).attr('height', 52).attr('rx', 6).attr('fill', p.gray); s.append('text').text(t).attr('x', x).attr('y', y + 7).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 20); };
      const label = (y, t) => s.append('text').text(t).attr('x', 20).attr('y', y + 7).attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 20).attr('fill', p.blueD);
      const X1 = 330, X2 = 900;
      // Chen (mín, máx): junto a la entidad que describe
      let y = 70; label(y, 'Chen'); s.append('line').attr('x1', X1).attr('y1', y).attr('x2', X2).attr('y2', y).attr('stroke', p.mid).attr('stroke-width', 2.5);
      s.append('path').attr('d', `M${(X1 + X2) / 2 - 70},${y} l70,-34 l70,34 l-70,34 Z`).attr('fill', p.tint).attr('stroke', p.blue).attr('stroke-width', 2.5);
      s.append('text').text('realiza').attr('x', (X1 + X2) / 2).attr('y', y + 6).attr('text-anchor', 'middle').attr('font-weight', 700).attr('fill', p.blueD);
      ent(X1, y, 'Cliente'); ent(X2, y, 'Pedido');
      s.append('text').text(`(${a})`).attr('x', X1 + 95).attr('y', y - 12).attr('font-size', 20).attr('font-weight', 700).attr('fill', p.blue);
      s.append('text').text(`(${b})`).attr('x', X2 - 150).attr('y', y - 12).attr('font-size', 20).attr('font-weight', 700).attr('fill', p.blue);
      // Crow's foot: el símbolo va en el extremo opuesto a la entidad descrita
      y = 210; label(y, "Crow's foot"); s.append('line').attr('x1', X1 + 80).attr('y1', y).attr('x2', X2 - 80).attr('y2', y).attr('stroke', p.ink).attr('stroke-width', 2.5);
      ent(X1, y, 'Cliente'); ent(X2, y, 'Pedido');
      const end = (x, dir, mm) => { // dir: +1 si la línea entra por la izquierda de la entidad
        const [mn, mx] = mm.split(',');
        const g = s.append('g').attr('stroke', p.ink).attr('stroke-width', 2.5).attr('fill', p.surface);
        if (mx === 'N') { g.append('line').attr('x1', x).attr('y1', y - 16).attr('x2', x - dir * 26).attr('y2', y); g.append('line').attr('x1', x).attr('y1', y + 16).attr('x2', x - dir * 26).attr('y2', y); }
        else g.append('line').attr('x1', x - dir * 12).attr('y1', y - 15).attr('x2', x - dir * 12).attr('y2', y + 15);
        if (mn === '0') g.append('circle').attr('cx', x - dir * 40).attr('cy', y).attr('r', 9);
        else g.append('line').attr('x1', x - dir * 36).attr('y1', y - 15).attr('x2', x - dir * 36).attr('y2', y + 15);
      };
      end(X2 - 80, 1, a); end(X1 + 80, -1, b);
      // UML: multiplicidad junto a la entidad del otro extremo
      y = 340; label(y, 'UML'); s.append('line').attr('x1', X1 + 80).attr('y1', y).attr('x2', X2 - 80).attr('y2', y).attr('stroke', p.ink).attr('stroke-width', 2.5);
      ent(X1, y, 'Cliente'); ent(X2, y, 'Pedido');
      s.append('text').text(uml[a]).attr('x', X2 - 92).attr('y', y - 12).attr('text-anchor', 'end').attr('font-size', 20).attr('font-weight', 700).attr('font-family', 'IBM Plex Mono').attr('fill', p.blue);
      s.append('text').text(uml[b]).attr('x', X1 + 92).attr('y', y - 12).attr('font-size', 20).attr('font-weight', 700).attr('font-family', 'IBM Plex Mono').attr('fill', p.blue);
      s.append('text').text('realiza ▸').attr('x', (X1 + X2) / 2).attr('y', y - 12).attr('text-anchor', 'middle').attr('font-size', 16).attr('fill', p.muted);
      out.innerHTML = `Lectura: un cliente realiza <b>${read[a]}</b> pedidos; cada pedido es de <b>${read[b]}</b> cliente(s). En (mín, máx) el par va junto a la entidad que describe; en crow's foot y UML, en el <b>extremo opuesto</b>.`;
    };
    el.querySelector('.a').onchange = draw; el.querySelector('.b').onchange = draw;
    draw();
  },

  // ---------- requisitos → modelo ----------
  reqs(el) {
    const txt = `«Queremos guardar nuestros [n:clientes] con su [a:nombre], [a:email] ([c:no puede repetirse]), [a:ciudad] y [a:fecha de alta]. Los clientes [v:hacen] [n:pedidos]; de cada pedido nos interesa la [a:fecha] y su [a:estado] (pendiente, enviado, entregado o cancelado). Un pedido [v:incluye] [c:uno o varios] [n:productos], [c:cada uno] en una [a:cantidad] y al [a:precio que tenía ese día]. De los productos guardamos [a:nombre], [a:precio actual] y [a:stock]. [c:Cada producto] [v:pertenece a] [c:una] [n:categoría], y las categorías se organizan en árbol: Teclados [v:está dentro de] Periféricos.»`;
    const html = txt.replace(/\[(\w):([^\]]+)\]/g, '<span class="rq rq-$1">$2</span>');
    el.innerHTML = `<div class="w-title">Requisitos de Mercado Next<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><button class="btn" data-k="n">1 · Sustantivos → entidades</button><button class="btn" data-k="v">2 · Verbos → relaciones</button><button class="btn" data-k="a">3 · Propiedades → atributos</button><button class="btn" data-k="c">4 · Cantidades → cardinalidad</button><button class="btn" data-k="all">Todo</button></div>
      <div style="display:flex;gap:26px;flex:1;min-height:0"><p class="rqtxt" style="flex:1.3;font-size:23px;line-height:1.75;margin:0">${html}</p><div class="w-out" style="flex:1;font-size:19px"></div></div>
      <style>.rq{border-radius:6px;padding:1px 4px;transition:.3s}.on-n .rq-n{background:#00ABE3;color:#fff}.on-v .rq-v{background:#00729E;color:#fff}.on-a .rq-a{background:#7ACFEE;color:#0B3A4C}.on-c .rq-c{background:#E0A100;color:#fff}</style>`;
    const t = el.querySelector('.rqtxt'), out = el.querySelector('.w-out');
    const res = { n: '<b>Entidades</b>: Cliente, Pedido, Producto, Categoría.', v: '<b>Relaciones</b>: Cliente <i>hace</i> Pedido · Pedido <i>incluye</i> Producto · Producto <i>pertenece a</i> Categoría · Categoría <i>dentro de</i> Categoría.',
      a: '<b>Atributos</b>: nombre, email, ciudad, fecha_alta · fecha, estado · nombre, precio, stock · y en la relación: cantidad y precio_unitario.',
      c: '<b>Cardinalidades</b>: email único · pedido con 1..N productos (N:M) · cada producto en 1 categoría (1:N) · árbol de categorías (1:N reflexiva).' };
    el.querySelector('.w-controls').onclick = (e) => {
      const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k;
      if (k === 'all') { t.className = 'rqtxt on-n on-v on-a on-c'; out.innerHTML = Object.values(res).join('<br><br>'); return; }
      t.classList.toggle('on-' + k); b.classList.toggle('on');
      out.innerHTML = ['n', 'v', 'a', 'c'].filter((x) => t.classList.contains('on-' + x)).map((x) => res[x]).join('<br><br>');
    };
  }
};
