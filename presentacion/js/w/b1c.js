// Widgets del Tema 1 (introducción): ejemplos de Mercado Next del temario
import { pal, frame, svg, esc, highlight, widgetScope } from '../ui.js';
import { BLOQUES } from '../slides/b0.js';

const seg = (items, cls = '') => `<div class="seg ${cls}">${items.map(([k, t], i) => `<button data-k="${k}" class="${i ? '' : 'active'}">${t}</button>`).join('')}</div>`;
const pick = (root, sel, k) => root.querySelectorAll(sel + ' [data-k]').forEach((b) => b.classList.toggle('active', b.dataset.k === k));

export const widgets = {
  // ---------- 1.1 qué recuerda cada sistema ----------
  dia(el) {
    const S = [
      ['Tienda online (Mercado Next)', 'Clientes, productos, precios, stock, pedidos, pagos y envíos', 'Se vende un producto que ya no queda, se cobra dos veces o el paquete va a otra dirección'],
      ['Banco y Bizum', 'Cuentas, saldos y movimientos: quién envía a quién, cuánto y cuándo', 'El dinero sale de una cuenta y no llega a la otra'],
      ['Reserva de vuelos', 'Plazas, asientos, pasajeros y tarifas', 'Dos personas con el mismo asiento o más billetes que plazas'],
      ['Tarjeta de transporte', 'Saldo, viajes realizados y tarifa aplicada', 'Te cobran un viaje que no has hecho o te quedas sin saldo'],
      ['Centro de salud', 'Pacientes, profesionales, agendas y citas', 'Dos citas a la misma hora o una cita que desaparece'],
      ['Plataforma de música o series', 'Usuarios, suscripciones, listas e historial', 'Recomendaciones absurdas o listas que se pierden']];
    const { cv, out, ctl } = frame(el, { title: 'Un día cualquiera: qué recuerda cada sistema', live: true,
      controls: '<button class="btn primary fail">Provocar un dato incorrecto</button><button class="btn rst">↺</button>' });
    let cur = 0;
    const bad = new Set();
    const render = () => {
      cv.innerHTML = `<div class="cards c3" style="height:100%;grid-auto-rows:1fr">${S.map((s, i) => {
        const b = bad.has(i);
        return `<button class="card ${i === cur && !b ? 'hl' : ''}" data-i="${i}" style="cursor:pointer;text-align:left;font:inherit;color:inherit;transition:.25s;${b ? 'background:var(--tint-red);border-color:var(--red)' : ''}${i === cur ? ';outline:3px solid ' + (b ? 'var(--red)' : 'var(--blue)') : ''}">
          <h4 style="font-size:21px">${s[0]}</h4><p style="font-size:17px">${b ? `<b style="color:var(--red)">✖ ${s[2]}</b>` : s[1]}</p></button>`;
      }).join('')}</div>`;
      const s = S[cur];
      out.innerHTML = bad.has(cur) ? `<span class="bad"><b style="color:var(--red)">${s[0]}</b>: si el dato es incorrecto, ${s[2].charAt(0).toLowerCase() + s[2].slice(1)}.</span>`
        : `<b>${s[0]}</b> necesita recordar: ${s[1].charAt(0).toLowerCase() + s[1].slice(1)}.`;
    };
    cv.onclick = (e) => { const b = e.target.closest('[data-i]'); if (b) { cur = +b.dataset.i; render(); } };
    ctl.querySelector('.fail').onclick = () => { bad.has(cur) ? bad.delete(cur) : bad.add(cur); render(); };
    ctl.querySelector('.rst').onclick = () => { bad.clear(); cur = 0; render(); };
    render();
  },

  // ---------- 1.2 del dato a la decisión ----------
  dato(el) {
    const D = {
      '27': { ctx: [['Unidades del teclado K-200 en el almacén de Jaén, a 30/10/2026', 'Quedan 27 unidades del teclado K-200 en el almacén de Jaén a 30 de octubre de 2026']],
        regla: 'El stock mínimo de ese teclado es 30', dec: 'Hay que pedir reposición' },
      '1042': { ctx: [['Columna «número de pedido»', 'El pedido 1042, de Ana Ruiz'], ['Columna «importe», en euros', 'Una venta de 1.042 €'], ['Columna «unidades vendidas en octubre»', 'Este mes se vendieron 1.042 unidades']] },
      '10/05': { ctx: [['Fecha escrita en España', '10 de mayo'], ['Fecha escrita en Estados Unidos', '5 de octubre']] } };
    const { cv, out, ctl } = frame(el, { title: 'Del dato a la decisión', live: true,
      controls: `<span style="color:var(--muted)">Elige un dato:</span>${seg(Object.keys(D).map((k) => [k, k]), 'dv')}` });
    let k = '27', ci = 0;
    const step = (h, body, on, accent) => `<div class="card ${on && accent ? 'hl' : ''}" style="flex:1;padding:14px 16px;transition:.3s;opacity:${on ? 1 : 0.35}">
      <div class="w-title" style="margin:0 0 6px">${h}</div><p style="font-size:19px;color:var(--ink)">${body}</p></div>`;
    const arrow = '<div style="align-self:center;font-size:30px;color:var(--blue)">→</div>';
    const render = () => {
      const d = D[k], [c, info] = d.ctx[ci];
      cv.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">${d.ctx.map(([t], i) => `<button class="btn ${i === ci ? 'on' : ''}" data-c="${i}">${t}</button>`).join('')}</div>
        <div style="display:flex;gap:10px;align-items:stretch">
          ${step('Dato', `<span class="kpi">${esc(k)}</span>`, true)}${arrow}${step('+ Contexto', c, true)}${arrow}${step('= Información', `<b>«${info}»</b>`, true, true)}${arrow}
          ${step('+ Regla del negocio', d.regla || '—', !!d.regla)}${arrow}${step('= Decisión', d.dec ? `<b>${d.dec}</b>` : '—', !!d.dec, true)}</div>`;
      out.innerHTML = d.regla ? 'Cada paso añade <b>contexto</b> o <b>criterio</b>: el dato solo, «27», no dice nada.'
        : `El mismo dato, <b>${esc(k)}</b>, se convierte en información distinta según su contexto. Prueba otra columna.`;
    };
    ctl.onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) { k = b.dataset.k; ci = 0; pick(ctl, '.dv', k); render(); } };
    cv.onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) { ci = +b.dataset.c; render(); } };
    render();
  },

  // ---------- 1.2 tres formas de llegar los datos ----------
  formas(el) {
    const F = {
      est: ['Estructurados', 'Filas y columnas fijas; cada valor tiene su sitio y su tipo. En Mercado Next: clientes, pedidos, precios, stock.', 'Bases de datos relacionales (Temas 3–10)',
        `<table class="t small"><thead><tr><th>id</th><th>cliente</th><th>fecha</th><th>total</th></tr></thead><tbody>
          <tr><td class="k">1042</td><td>Ana Ruiz</td><td>2026-10-30</td><td>64,90</td></tr><tr><td class="k">1043</td><td>Luis Gómez</td><td>2026-10-30</td><td>25,00</td></tr>
          <tr><td class="k">1044</td><td>Marta Sanz</td><td>2026-10-31</td><td>149,00</td></tr></tbody></table>`],
      semi: ['Semiestructurados', 'Etiquetas que dan estructura, pero cada registro puede tener campos distintos (JSON, XML). Un teclado tiene «idioma»; un monitor, «pulgadas».', 'Bases de datos documentales (Tema 14) y JSON en PostgreSQL (Tema 8)',
        `<pre class="code" style="font-size:16px">${highlight('{ "nombre": "Teclado K-200", "precio": 39.90,\n  "idioma": "español" }\n{ "nombre": "Monitor 24\\"", "precio": 149.00,\n  "pulgadas": 24 }', 'js')}</pre>`],
      no: ['No estructurados', 'Sin campos que una máquina entienda directamente: texto libre, imágenes, audio, vídeo, PDF. En Mercado Next: fotos de producto, correos de clientes, reseñas.', 'Data lake (Temas 18 y 21) e IA generativa (Tema 24)',
        `<div style="display:flex;gap:14px"><div class="card" style="flex:1.3;padding:14px 16px"><p style="font-size:15px">De: ana.ruiz@mail.com · Asunto: pedido 1042</p>
          <p style="font-size:17px;color:var(--ink);margin-top:6px">Hola, el teclado llegó bien, pero uno de los ratones no funciona. ¿Podéis cambiármelo?</p></div>
          <div class="card" style="flex:1;display:grid;place-items:center;padding:10px"><svg viewBox="0 0 120 80" style="width:120px;height:80px"><rect x="4" y="4" width="112" height="72" rx="8" style="fill:var(--surface-2);stroke:var(--line);stroke-width:2"/><circle cx="36" cy="30" r="9" style="fill:var(--blue-l)"/><path d="M10 70 L46 40 L70 60 L86 46 L112 70 Z" style="fill:var(--blue)"/></svg><p style="font-size:14px">foto_k200.jpg</p></div></div>`] };
    const { cv, out, ctl } = frame(el, { title: 'Tres formas de llegar los datos', live: true, controls: seg([['est', 'Estructurados'], ['semi', 'Semiestructurados'], ['no', 'No estructurados']], 'fm') });
    const show = (k) => { const f = F[k]; pick(ctl, '.fm', k); cv.innerHTML = `<div style="height:100%;display:flex;flex-direction:column;justify-content:center">${f[3]}</div>`; out.innerHTML = `<b>${f[0]}</b>: ${f[1]} · Se estudian en: ${f[2]}.`; };
    ctl.onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) show(b.dataset.k); };
    show('est');
  },

  // ---------- 1.3 la hoja de pedidos con errores ----------
  hoja(el) {
    const H = ['Nº', 'Fecha', 'Cliente', 'Email', 'Ciudad', 'Producto', 'Uds.', 'Precio', 'Total'];
    const R = [['1001', '03/10/2026', 'Ana Ruiz', 'ana.ruiz@mail.com', 'Jaén', 'Teclado K-200', '1', '39,90', '39,90'],
      ['1002', '2026-10-03', 'Luis Gómez', 'luis@mail.com', 'Andújar', 'Ratón M-10', '2', '12,50', '25,00'],
      ['1003', '4 oct', 'ana ruiz', 'ana.ruiz@mail.com', 'JAEN', 'Teclado K200', '1', '42,00', '42,00'],
      ['1002', '03/10/2026', 'Luis Gómez', 'luis@mail.com', 'Andújar', 'Ratón M-10', '2', '12,50', '25,00'],
      ['1004', '05/10/2026', 'Marta Sanz', '', 'Úbeda', 'Monitor 24"', '1', '149,00', '1.490,00'],
      ['1005', '10/05/2026', 'Ana Ruiz', 'ana.r@mail.com', 'Jaén', 'Webcam HD', '-1', '29,90', '-29,90'],
      ['1006', '06/10/2026', 'Pedro Lara', 'pedro@mail', 'Linares', 'Teclado K-200', '3', '39,90', '119,70'],
      ['1007', '06/10/2026', 'Sofía Martín', 'sofia@mail.com', 'Jaén', 'Teclado K-200', '1', '39,90', '39,90']];
    const P = [['Duplicados', 'El pedido 1002 aparece dos veces', 'Las ventas salen infladas en 25 €', 'Una clave primaria impide repetir el número de pedido (Temas 3 y 5)'],
      ['Formatos distintos', 'Fechas en tres formatos; «Jaén» y «JAEN»; «K-200» y «K200»', 'Al filtrar por ciudad o producto faltan filas', 'Cada columna tiene un tipo de dato y los valores se eligen de una lista (Tema 5)'],
      ['Datos contradictorios', 'Ana tiene dos emails; el K-200 cuesta 39,90 y 42,00', 'Nadie sabe cuál es el correcto', 'Cada dato se guarda una sola vez, en su tabla (Tema 4)'],
      ['Datos imposibles', 'Cantidad −1; un total de 1.490 € para un monitor de 149 €', 'Informes y facturas falsos', 'Reglas que rechazan valores imposibles (Tema 5)'],
      ['Datos que faltan', 'Marta no tiene email', 'No se le puede enviar la factura', 'Columnas obligatorias (Tema 5)'],
      ['Fechas ambiguas', '10/05/2026: ¿10 de mayo o 5 de octubre?', 'Pedidos asignados al mes equivocado', 'Tipo fecha: el formato lo elige quien consulta, no quien escribe (Tema 5)'],
      ['Accesos simultáneos', 'Pedro y Sofía compran a la vez: se venden 4 teclados con 3 en stock', 'Un cliente se queda sin producto', 'Transacciones y control de concurrencia (Tema 10)'],
      ['Varias copias', 'pedidos_v2, pedidos_FINAL, pedidos_FINAL_v3…', 'Nadie sabe cuál es la buena', 'Una única base de datos compartida'],
      ['Sin permisos', 'Cualquiera que abre la hoja ve emails y direcciones', 'Riesgo legal (RGPD)', 'Permisos por usuario, tabla y columna (Temas 9 y 23)']];
    const M = {};
    [[3, 'h'], [0, 3], [1, 3], [7, 3], [2, 3]].forEach(([r, c]) => (M[`${r},${c}`] = 8));
    for (let c = 0; c < 9; c++) M[`3,${c}`] = 0;
    M['1,0'] = 0;
    ['1,1', '2,1', '2,2', '2,4', '2,5'].forEach((k) => (M[k] = 1));
    ['2,7', '2,8', '5,3'].forEach((k) => (M[k] = 2));
    ['5,6', '5,8', '4,8', '6,3'].forEach((k) => (M[k] = 3));
    M['4,3'] = 4; M['5,1'] = 5;
    ['6,5', '6,6', '7,5', '7,6'].forEach((k) => (M[k] = 6));
    const { cv, out, ctl } = frame(el, { title: 'Actividad: encuentra los problemas de la hoja', live: true,
      controls: '<span class="pill cnt">0 de 9</span><span style="color:var(--muted)">El día 6 solo quedaban <b>3 teclados K-200</b>; Pedro y Sofía compraron a la vez desde Google Sheets.</span><button class="btn sol">Ver la solución</button><button class="btn rst">↺</button>' });
    const found = new Set();
    let cur = -1;
    const cell = (k, txt) => { const pi = M[k], f = pi !== undefined && found.has(pi);
      return `<td data-k="${k}" style="cursor:pointer;font-family:var(--font-mono);font-size:15px;padding:7px 9px;${f ? 'background:var(--tint-red);color:var(--red);font-weight:700;' : ''}${pi === cur && f ? 'outline:2px solid var(--red);outline-offset:-2px' : ''}">${txt === '' ? '&nbsp;' : esc(txt)}</td>`; };
    const render = () => {
      const tab = found.has(7) ? 'background:var(--tint-red);color:var(--red);border-color:var(--red)' : '';
      cv.innerHTML = `<div style="display:flex;gap:6px;margin-bottom:6px;font-size:14px;font-family:var(--font-mono)">
          <span style="padding:4px 10px;border:1px solid var(--line);border-radius:8px 8px 0 0;color:var(--muted)">pedidos_v2.xlsx</span><span style="padding:4px 10px;border:1px solid var(--line);border-radius:8px 8px 0 0;color:var(--muted)">pedidos_FINAL.xlsx</span>
          <button data-k="file" style="font:inherit;cursor:pointer;padding:4px 10px;border:1px solid var(--blue);border-radius:8px 8px 0 0;background:var(--tint-blue);color:var(--ink);${tab}">pedidos_FINAL_v3.xlsx</button></div>
        <table class="t" style="font-size:15px"><thead><tr>${H.map((h, c) => `<th data-k="h,${c}" style="cursor:pointer;padding:7px 9px;${c === 3 && found.has(8) ? 'background:var(--red)' : ''}">${h}</th>`).join('')}</tr></thead>
        <tbody>${R.map((r, i) => `<tr>${r.map((v, c) => cell(`${i},${c}`, v)).join('')}</tr>`).join('')}</tbody></table>`;
      ctl.querySelector('.cnt').textContent = `${found.size} de 9`;
      ctl.querySelector('.cnt').classList.toggle('bad', found.size === 9);
    };
    const show = (pi) => { const p = P[pi]; out.innerHTML = `<b>${p[0]}</b> · ${p[1]} → ${p[2]}. <b>Con un SGBD</b>: ${p[3]}.`; };
    cv.onclick = (e) => {
      const t = e.target.closest('[data-k]'); if (!t) return;
      const k = t.dataset.k === 'h,3' ? '3,h' : t.dataset.k;
      const pi = k === 'file' ? 7 : M[k];
      if (pi === undefined) { cur = -1; render(); out.innerHTML = 'Esta celda parece correcta. Sigue buscando.'; return; }
      found.add(pi); cur = pi; render(); show(pi);
    };
    ctl.querySelector('.sol').onclick = () => { P.forEach((p, i) => found.add(i)); cur = -1; render(); out.innerHTML = 'Casi todos los problemas tienen el mismo origen: <b>los datos no están en un único sitio</b>, sino en copias que cada uno modifica y reenvía.'; };
    ctl.querySelector('.rst').onclick = () => { found.clear(); cur = -1; render(); out.innerHTML = 'Haz clic en las celdas, cabeceras o pestañas que te parezcan sospechosas.'; };
    render(); out.innerHTML = 'Haz clic en las celdas, cabeceras o pestañas que te parezcan sospechosas.';
  },

  // ---------- 1.4 las piezas de un sistema de base de datos ----------
  piezas(el) {
    const L = [
      ['per', 'Personas', ['Ana, que compra', 'El almacén', 'Una analista'], 'Usan las aplicaciones; no tocan los datos directamente.'],
      ['app', 'Aplicaciones', ['Web de la tienda', 'Programa del almacén', 'Cuadro de mando'], 'Lo que ve el usuario. No toca los datos: <b>se los pide al SGBD</b>.'],
      ['sgbd', 'SGBD', ['PostgreSQL'], 'El programa que se encarga de la base de datos: guarda y recupera, comprueba las reglas, controla quién accede y la protege ante fallos.'],
      ['bd', 'Base de datos', ['Mercado Next: clientes, productos, pedidos'], 'Un conjunto de datos relacionados, organizados y guardados de forma duradera, que comparten varias personas y aplicaciones.']];
    const { cv, out, ctl } = frame(el, { title: 'Las piezas de un sistema de base de datos', live: true,
      controls: seg([['1', 'Una base de datos'], ['n', 'Un SGBD, muchas bases de datos']], 'pz') });
    let mode = '1', cur = 'sgbd';
    const render = () => {
      const col = ([k, n, items], i) => {
        const its = k === 'bd' && mode === 'n' ? ['Tienda (Mercado Next)', 'Recursos humanos', 'Pruebas'] : items;
        const on = k === cur, core = k === 'sgbd' || k === 'bd';
        return `<button data-p="${k}" style="flex:1;font:inherit;color:inherit;cursor:pointer;text-align:center;border-radius:18px;padding:14px 12px;display:flex;flex-direction:column;gap:10px;justify-content:center;transition:.25s;
          border:2px solid ${on ? 'var(--blue)' : 'var(--line)'};background:${on ? 'var(--tint-blue)' : core ? 'var(--surface-2)' : 'var(--surface)'}">
          <div style="font-family:var(--font-title);font-weight:700;font-size:22px;color:var(--title)">${n}</div>
          ${its.map((t) => `<div style="border-radius:10px;padding:8px 10px;font-size:16px;background:${k === 'sgbd' ? 'var(--blue)' : 'var(--surface)'};color:${k === 'sgbd' ? '#fff' : 'var(--ink)'};border:1px solid var(--line)">${t}</div>`).join('')}</button>${i < 3 ? '<div style="align-self:center;font-size:28px;color:var(--blue)">⇄</div>' : ''}`;
      };
      cv.innerHTML = `<div style="position:relative;height:100%;display:flex;flex-direction:column;justify-content:center">
        <div style="display:flex;gap:10px;align-items:stretch;min-height:260px">${L.map(col).join('')}</div>
        <div style="display:flex;justify-content:flex-end;margin-top:8px"><div style="width:49%;border-top:3px dashed var(--blue);text-align:center;padding-top:6px;font-family:var(--font-title);font-weight:700;color:var(--blue)">Sistema de base de datos = SGBD + base de datos</div></div></div>`;
      const l = L.find((x) => x[0] === cur);
      out.innerHTML = `<b>${l[1]}</b>: ${l[3]}${mode === 'n' ? ' · Un mismo SGBD puede gestionar <b>muchas bases de datos</b>, y una base de datos la usan muchas aplicaciones.' : ''}`;
    };
    cv.onclick = (e) => { const b = e.target.closest('[data-p]'); if (b) { cur = b.dataset.p; render(); } };
    ctl.onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) { mode = b.dataset.k; pick(ctl, '.pz', mode); render(); } };
    render();
  },

  // ---------- 1.5 etapas de la historia ----------
  etapas(el) {
    const life = widgetScope(el);
    const E = [['Papel y fichas', 'hasta los años 50', 'Registrar clientes, ventas y empleados', 'Lento, una sola copia, difícil de buscar y de resumir'],
      ['Ficheros informáticos', 'años 50 y 60', 'Automatizar nóminas, facturas y contabilidad', 'Cada programa con sus ficheros: duplicados y contradicciones (apartado 1.3)'],
      ['Primeros SGBD, jerárquicos y en red', 'años 60', 'Compartir los mismos datos entre varios programas', 'Para consultar había que conocer los «caminos» internos: solo los programadores podían preguntar'],
      ['Modelo relacional', 'años 70 y 80', 'Pedir los datos que queremos sin saber cómo están guardados', 'Todo vivía en un único servidor'],
      ['Cliente-servidor e internet', 'años 90 y 2000', 'Muchos usuarios a la vez desde sus ordenadores y, después, desde la web', 'Escalar a millones de usuarios y a datos de formas muy variadas'],
      ['NoSQL y Big Data', '2005–2010', 'Volúmenes y velocidades que no cabían en un servidor; datos sin estructura fija', 'Se sacrificaban SQL y parte de las garantías'],
      ['Nube', '2010–2020', 'No comprar ni mantener servidores; pagar por uso', 'Datos repartidos entre muchos servicios distintos'],
      ['Lakehouse e IA', '2020–hoy', 'Unir análisis y ciencia de datos sobre una sola copia; preguntar en lenguaje natural', 'Gobierno, coste y fiabilidad de las respuestas de la IA']];
    const { cv, out, ctl } = frame(el, { title: 'Cada etapa resuelve un problema de la anterior', live: true, controls: '<button class="btn primary go">▶ Recorrer la historia</button>' });
    let cur = 0, anim = 0;
    const render = () => {
      const e = E[cur];
      cv.innerHTML = `<div style="display:flex;flex-direction:column;gap:18px;height:100%">
        <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:8px;position:relative">
          <div style="position:absolute;left:6%;right:6%;top:22px;height:6px;border-radius:6px;background:var(--line)"></div>
          <div style="position:absolute;left:6%;top:22px;height:6px;border-radius:6px;background:var(--blue);transition:width .4s;width:${(cur / 7) * 88}%"></div>
          ${E.map((x, i) => `<button data-i="${i}" style="position:relative;font:inherit;background:none;border:0;cursor:pointer;color:inherit;display:flex;flex-direction:column;align-items:center;gap:6px">
            <span style="width:50px;height:50px;border-radius:50%;display:grid;place-items:center;font-family:var(--font-title);font-weight:700;font-size:20px;transition:.3s;
              background:${i <= cur ? 'var(--blue)' : 'var(--surface)'};color:${i <= cur ? '#fff' : 'var(--blue-d)'};border:3px solid var(--blue);${i === cur ? 'transform:scale(1.15)' : ''}">${i + 1}</span>
            <span style="font-size:14px;font-weight:700;color:${i === cur ? 'var(--title)' : 'var(--muted)'};text-align:center;line-height:1.25">${x[0]}</span></button>`).join('')}</div>
        <div style="display:flex;gap:14px;flex:1;min-height:0">
          <div class="card hl" style="flex:1"><div class="w-title">${e[1]} · qué necesidad la impulsó</div><p style="font-size:21px;color:var(--ink)">${e[2]}</p></div>
          <div style="align-self:center;font-size:30px;color:var(--blue)">→</div>
          <div class="card" style="flex:1"><div class="w-title">Qué problema dejó pendiente</div><p style="font-size:21px;color:var(--ink)">${e[3]}</p></div></div></div>`;
      out.innerHTML = `Hoy conviven: ${E.slice(0, cur + 1).map((x) => `<span class="pill" style="margin:2px">${x[0]}</span>`).join('')}`;
    };
    cv.onclick = (e) => { const b = e.target.closest('[data-i]'); if (b) { anim++; cur = +b.dataset.i; render(); } };
    ctl.querySelector('.go').onclick = async () => {
      const me = ++anim;
      for (let i = 0; i < E.length; i++) { cur = i; render(); if (!(await life.sleep(1700)) || me !== anim) return; }
    };
    render();
  },

  // ---------- 1.6 qué pasa al pulsar «Comprar» ----------
  compra(el) {
    const life = widgetScope(el);
    const N = [['ana', 'Ana', 'navegador'], ['web', 'Web de Mercado Next', 'aplicación'], ['sgbd', 'SGBD', 'PostgreSQL'], ['bd', 'Datos', 'producto · pedido · linea_pedido']];
    const base = [['ana', 'Pulsa «Confirmar compra»: un teclado K-200 y dos ratones M-10.'], ['web', 'La aplicación pide al SGBD que registre la compra.'], ['sgbd', 'Comprueba las reglas: que el cliente existe y que hay stock.']];
    const C = {
      ok: [...base, ['bd', 'Crea el pedido y sus líneas y descuenta el stock.'], ['sgbd', 'Confirma: todo queda guardado a la vez.'], ['ana', '«Pedido confirmado».', 'ok']],
      stock: [...base, ['sgbd', 'No queda stock del teclado: rechaza la operación y no guarda nada.', 'bad'], ['ana', '«Lo sentimos, este producto se ha agotado».', 'ok']],
      red: [...base, ['bd', 'Empieza a crear el pedido…'], ['web', 'Se corta la conexión a mitad.', 'bad'], ['sgbd', 'Deshace lo que hubiera empezado.'], ['ana', 'Puede volver a intentarlo: no hay ningún pedido a medias.', 'ok']],
      otro: [...base, ['sgbd', 'Otro cliente compra el último teclado en el mismo instante: atiende primero a uno.', 'bad'], ['sgbd', 'El segundo ve el stock ya actualizado.'], ['ana', 'Solo uno de los dos consigue el teclado.', 'ok']],
      huerf: [['ana', 'Pulsa «Confirmar compra».'], ['web', 'Un error de la aplicación intenta crear un pedido para un cliente que no existe.', 'bad'], ['sgbd', 'Lo rechaza por una regla de la base de datos.'], ['ana', 'Un mensaje de error, en lugar de un pedido «huérfano».', 'ok']] };
    const { cv, out, ctl } = frame(el, { title: 'Recorrido de una compra', live: true,
      controls: '<button class="btn primary" data-c="ok">▶ Comprar</button><span style="color:var(--muted)">¿Y si algo falla?</span><button class="btn" data-c="stock">Sin stock</button><button class="btn" data-c="red">Se corta la conexión</button><button class="btn" data-c="otro">Otro cliente a la vez</button><button class="btn" data-c="huerf">Cliente inexistente</button>' });
    cv.innerHTML = `<div style="display:flex;gap:10px;align-items:stretch">${N.map(([k, n, s], i) => `<div class="card nd" data-n="${k}" style="flex:1;padding:12px 14px;text-align:center;transition:.25s"><h4 style="font-size:20px;margin:0">${n}</h4><p style="font-size:14px">${s}</p></div>${i < 3 ? '<div style="align-self:center;font-size:26px;color:var(--blue)">⇄</div>' : ''}`).join('')}</div>
      <ol class="log" style="margin:14px 0 0;padding-left:28px;display:flex;flex-direction:column;gap:6px;font-size:18px"></ol>`;
    const log = cv.querySelector('.log');
    let anim = 0;
    const lit = (k, cls) => cv.querySelectorAll('.nd').forEach((n) => { const on = n.dataset.n === k; n.classList.toggle('hl', on && cls !== 'bad'); n.style.borderColor = on && cls === 'bad' ? 'var(--red)' : ''; n.style.background = on && cls === 'bad' ? 'var(--tint-red)' : ''; });
    const runC = async (c) => {
      const me = ++anim; log.innerHTML = ''; out.innerHTML = '';
      for (const [k, t, cls] of C[c]) {
        lit(k, cls);
        const name = N.find((n) => n[0] === k)[1];
        log.insertAdjacentHTML('beforeend', `<li style="${cls === 'bad' ? 'color:var(--red);font-weight:700' : ''}"><b>${name}</b>: ${t}</li>`);
        if (!(await life.sleep(1100)) || me !== anim) return;
      }
      lit(null);
      out.innerHTML = c === 'ok' ? 'Antes de pulsar, Ana ya hizo muchas <b>lecturas</b>: portada, búsqueda, fichas y carrito. Cada pantalla es una consulta.' : 'El SGBD no deja la compra <b>a medias</b> ni guarda datos que rompen las reglas.';
    };
    ctl.onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) runC(b.dataset.c); };
    out.innerHTML = 'Pulsa «Comprar» o elige un fallo.';
  },

  // ---------- 1.7 vocabulario sobre dos tablas ----------
  vocab(el) {
    const CL = { name: 'cliente', h: [['id', 'número'], ['nombre', 'texto'], ['email', 'texto'], ['ciudad', 'texto']], rows: [[1, 'Ana Ruiz', 'ana.ruiz@mail.com', 'Jaén'], [2, 'Luis Gómez', 'luis@mail.com', 'Andújar'], [3, 'Marta Sanz', null, 'Úbeda']] };
    const PE = { name: 'pedido', h: [['id', 'número'], ['cliente_id', 'número'], ['fecha', 'fecha'], ['estado', 'texto']], rows: [[1042, 1, '2026-10-30', 'pendiente'], [1043, 2, '2026-10-30', 'enviado'], [1044, 3, '2026-10-31', 'pendiente']] };
    const T = [
      ['Tabla', 'Un conjunto de datos del mismo tipo, organizado en filas y columnas', 'cliente, pedido, producto', 'Tema 3', () => ({ tab: ['cliente', 'pedido'] })],
      ['Fila (registro)', 'Un elemento concreto de la tabla', 'Ana Ruiz, con su id, email y ciudad', 'Tema 3', () => ({ cells: [['cliente', 0, '*']] })],
      ['Columna (campo, atributo)', 'Una característica que tienen todas las filas', 'email, ciudad, fecha', 'Tema 3', () => ({ cells: [['cliente', '*', 2]] })],
      ['Tipo de dato', 'Qué clase de valores admite una columna', 'id es un número; fecha, una fecha; nombre, un texto', 'Tema 5', () => ({ types: true })],
      ['Clave primaria', 'La columna (o columnas) que identifica cada fila sin repetirse', 'id de cliente; id de pedido', 'Temas 3 y 5', () => ({ cells: [['cliente', '*', 0], ['pedido', '*', 0]] })],
      ['Clave foránea', 'Una columna que apunta a la clave primaria de otra tabla', 'cliente_id de pedido apunta a id de cliente', 'Temas 3 y 5', () => ({ cells: [['pedido', '*', 1], ['cliente', '*', 0]] })],
      ['Relación entre tablas', 'El vínculo que crean las claves foráneas', 'Cada pedido pertenece a un cliente: el 1044 es de Marta', 'Temas 2 y 3', () => ({ cells: [['pedido', 2, '*'], ['cliente', 2, '*']] })],
      ['Consulta', 'Una pregunta a la base de datos', '«¿Qué pedidos tiene pendientes Ana?»', 'Temas 7 y 8', () => ({ cells: [['pedido', 0, '*']] })],
      ['Esquema', 'La estructura: qué tablas, columnas, tipos y reglas hay. Cambia poco', '«cliente tiene id, nombre, email y ciudad»', 'Temas 3 y 5', () => ({ head: true, types: true })],
      ['Datos actuales (instancia)', 'El contenido de la base de datos en un momento dado. Cambia constantemente', 'Los tres clientes que hay hoy', 'Tema 3', () => ({ cells: [['cliente', '*', '*']] })],
      ['NULL', 'Marca de valor desconocido o que no aplica', 'El email de Marta, que no conocemos', 'Temas 5 y 7', () => ({ cells: [['cliente', 2, 2]] })]];
    const { cv, out, ctl } = frame(el, { title: 'Vocabulario básico sobre dos tablas de Mercado Next', live: true,
      controls: T.map((t, i) => `<button class="btn ${i ? '' : 'on'}" data-t="${i}" style="font-size:15px;padding:6px 11px">${t[0]}</button>`).join('') });
    const render = (i) => {
      const h = T[i][4]();
      const isCell = (tn, r, c) => (h.cells || []).some(([t, rr, cc]) => t === tn && (rr === '*' || rr === r) && (cc === '*' || cc === c));
      const tbl = (t) => `<div style="flex:none;border-radius:14px;padding:6px;transition:.25s;${(h.tab || []).includes(t.name) ? 'outline:3px solid var(--blue)' : ''}">
        <div style="font-family:var(--font-title);font-weight:700;font-size:20px;color:var(--title);margin:0 0 6px 4px">${t.name}</div>
        <table class="t" style="font-size:15px"><thead><tr>${t.h.map(([n, ty]) => `<th style="padding:7px 9px;${h.head ? 'background:var(--blue)' : ''}">${n}${h.types ? `<div style="font-weight:400;font-size:13px;opacity:.9">${ty}</div>` : ''}</th>`).join('')}</tr></thead>
        <tbody>${t.rows.map((r, ri) => `<tr>${r.map((v, c) => `<td style="font-family:var(--font-mono);font-size:14px;padding:7px 9px;white-space:nowrap;${isCell(t.name, ri, c) ? 'background:var(--tint-blue);color:var(--blue-d);font-weight:700' : ''}${v === null ? ';font-style:italic;color:var(--muted)' : ''}">${v === null ? 'NULL' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      cv.innerHTML = `<div style="display:flex;gap:10px;align-items:flex-start;height:100%;padding-top:6px">${tbl(CL)}<div style="align-self:center;text-align:center;color:var(--blue);font-size:13px;font-weight:700;flex:none">◀ cliente_id<br>apunta a id</div>${tbl(PE)}</div>`;
      ctl.querySelectorAll('[data-t]').forEach((b) => b.classList.toggle('on', +b.dataset.t === i));
      out.innerHTML = `<b>${T[i][0]}</b>: ${T[i][1]}. Ejemplo: ${T[i][2]}. Se formaliza en el ${T[i][3]}.`;
    };
    ctl.onclick = (e) => { const b = e.target.closest('[data-t]'); if (b) render(+b.dataset.t); };
    render(0);
  },

  // ---------- 1.8 el pedido de Ana en todos los modelos ----------
  modelos(el) {
    const p = pal();
    const tb = (name, h, rows) => `<div>${name ? `<div style="font-family:var(--font-title);font-weight:700;color:var(--title);margin-bottom:4px">${name}</div>` : ''}<table class="t small"><thead><tr>${h.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    const cd = (src, lang = 'js') => `<pre class="code" style="font-size:16px">${highlight(src, lang)}</pre>`;
    const ent = (x, y, t) => `<rect x="${x - 75}" y="${y - 27}" width="150" height="54" rx="6" style="fill:var(--surface);stroke:var(--blue);stroke-width:3"/><text x="${x}" y="${y + 7}" text-anchor="middle" style="font-family:Karla;font-weight:700;font-size:21px;fill:var(--title)">${t}</text>`;
    const rel = (x, y, t) => `<path d="M${x - 66},${y} L${x},${y - 32} L${x + 66},${y} L${x},${y + 32} Z" style="fill:var(--tint-blue);stroke:var(--blue-d);stroke-width:2"/><text x="${x}" y="${y + 6}" text-anchor="middle" style="font-size:17px;font-weight:700;fill:var(--ink)">${t}</text>`;
    const att = (x, y, t, x2, y2) => `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" style="stroke:var(--line);stroke-width:2"/><ellipse cx="${x}" cy="${y}" rx="58" ry="21" style="fill:var(--surface);stroke:var(--mid);stroke-width:1.5"/><text x="${x}" y="${y + 6}" text-anchor="middle" style="font-size:17px;fill:var(--ink)">${t}</text>`;
    const node = (x, y, t, s, c) => `<circle cx="${x}" cy="${y}" r="44" style="fill:${c};stroke:var(--surface);stroke-width:3"/><text x="${x}" y="${y - 2}" text-anchor="middle" style="font-family:Karla;font-weight:700;font-size:20px;fill:#fff">${t}</text><text x="${x}" y="${y + 19}" text-anchor="middle" style="font-size:14px;fill:#fff">${s}</text>`;
    const edge = (x1, y1, x2, y2, t, dash) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#mArr)" style="stroke:var(--mid);stroke-width:3;${dash ? 'stroke-dasharray:6 5' : ''}"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 8}" text-anchor="middle" style="font-size:17px;font-weight:700;fill:var(--blue-d)">${t}</text>`;
    const M = {
      er: ['Entidad/Relación', 'Para diseñar', 'Rectángulos, rombos y óvalos', 'Diseñar y entender el negocio', 'Herramientas de diagramas', '2',
        () => `<svg viewBox="0 0 770 250" style="width:100%;height:auto">${att(80, 32, 'nombre', 95, 98)}${att(205, 32, 'ciudad', 140, 98)}${att(385, 32, 'fecha', 385, 98)}${att(530, 220, 'cantidad', 530, 157)}${att(690, 32, 'precio', 675, 98)}
          <line x1="170" y1="125" x2="310" y2="125" style="stroke:var(--mid);stroke-width:2"/><line x1="460" y1="125" x2="600" y2="125" style="stroke:var(--mid);stroke-width:2"/>
          ${ent(95, 125, 'CLIENTE')}${rel(240, 125, 'hace')}${ent(385, 125, 'PEDIDO')}${rel(530, 125, 'contiene')}${ent(675, 125, 'PRODUCTO')}</svg>`],
      rel: ['Relacional', 'Para guardar y operar', 'Tablas enlazadas por claves', 'Casi todo lo que necesite reglas y transacciones', 'PostgreSQL, MySQL, Oracle, SQL Server', '3–10',
        () => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${tb('cliente', ['id', 'nombre', 'ciudad'], [['1', 'Ana Ruiz', 'Jaén']])}${tb('pedido', ['id', 'cliente_id', 'fecha'], [['1042', '1', '2026-10-30']])}
          <div style="grid-column:span 2">${tb('linea_pedido', ['pedido_id', 'producto', 'cantidad', 'precio'], [['1042', 'Teclado K-200', '1', '39,90'], ['1042', 'Ratón M-10', '2', '12,50']])}</div></div>`],
      kv: ['Clave-valor', 'NoSQL', 'Etiqueta → valor', 'Caché, sesiones, carritos', 'Redis, DynamoDB', '13',
        () => cd('pedido:1042  →  { "cliente": "Ana Ruiz", "total": 64.90 }\ncarrito:ana  →  ["K-200", "M-10", "M-10"]\nsesion:ana   →  "conectada desde Jaén"')],
      doc: ['Documental', 'NoSQL', 'Fichas JSON', 'Catálogos, perfiles, contenidos variados', 'MongoDB', '14',
        () => cd('{ "_id": 1042, "fecha": "2026-10-30",\n  "cliente": { "nombre": "Ana Ruiz", "ciudad": "Jaén" },\n  "lineas": [\n    { "producto": "Teclado K-200", "cantidad": 1, "precio": 39.90 },\n    { "producto": "Ratón M-10",    "cantidad": 2, "precio": 12.50 } ],\n  "total": 64.90 }')],
      col: ['Columnar ancha', 'NoSQL', 'Particiones con filas ordenadas', 'Escrituras masivas, mensajería, sensores', 'Cassandra', '15',
        () => `<div class="card" style="padding:12px 16px"><div class="w-title">Partición: cliente = Ana Ruiz · ordenada por fecha ↓</div>${tb('', ['fecha', 'pedido', 'total'], [['2026-10-30', '1042', '64,90 €'], ['2026-10-04', '1003', '42,00 €'], ['2026-10-03', '1001', '39,90 €']])}</div>
          <div class="card" style="padding:10px 16px;margin-top:10px;opacity:.6"><div class="w-title" style="margin:0">Partición: cliente = Luis Gómez · …</div></div>`],
      graf: ['Grafos', 'NoSQL', 'Nodos y relaciones', 'Recomendaciones, fraude, redes', 'Neo4j', '16',
        () => `<svg viewBox="0 0 760 250" style="width:100%;height:auto"><defs><marker id="mArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" style="fill:var(--mid)"/></marker></defs>
          ${edge(155, 110, 470, 62, 'COMPRÓ {cantidad: 1}')}${edge(155, 140, 470, 190, 'COMPRÓ {cantidad: 2}')}${edge(640, 190, 560, 190, '')}${edge(690, 150, 560, 80, '¿también le interesa?', true)}
          ${node(110, 125, 'Ana', 'Cliente', p.blue)}${node(515, 62, 'K-200', 'Producto', p.blueD)}${node(515, 190, 'M-10', 'Producto', p.blueD)}${node(690, 190, 'Luis', 'Cliente', p.gray)}
          <text x="690" y="246" text-anchor="middle" style="font-size:13px;fill:var(--muted)">«quien compró esto también compró…»</text></svg>`],
      ts: ['Series temporales', 'Otros modelos', 'Valor + instante', 'Métricas, sensores, monitorización', 'TimescaleDB, InfluxDB', '17',
        () => { const v = [12, 25, 0, 39.9, 64.9, 18, 30, 8, 42]; const mx = 70;
          return `<div class="w-title">Ventas por minuto · 30/10/2026</div><div style="display:flex;align-items:flex-end;gap:10px;height:190px;border-bottom:2px solid var(--line)">${v.map((x, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:4px">
            <span style="font-size:13px;color:var(--muted)">${String(x).replace('.', ',')}</span><div style="width:100%;border-radius:6px 6px 0 0;height:${(x / mx) * 150}px;background:${i === 4 ? 'var(--blue)' : 'var(--blue-l)'}"></div></div>`).join('')}</div>
            <p style="font-size:16px;margin-top:8px">Cada barra es un instante. El pedido de Ana suma <b>64,90 €</b> en su minuto.</p>`; }],
      bus: ['Búsqueda', 'Otros modelos', 'Índice de palabras', 'Buscadores y análisis de registros (logs)', 'Elasticsearch, OpenSearch', '17',
        () => `<div style="display:flex;gap:16px">${tb('Índice: palabra → productos', ['palabra', 'aparece en'], [['teclado', 'Teclado K-200'], ['ratón', 'Ratón M-10'], ['monitor', 'Monitor 24"']])}
          <div class="card" style="flex:1;padding:12px 16px"><div class="w-title">Ana busca</div><p class="mono" style="font-size:20px;color:var(--ink)">teclao</p><p style="font-size:17px;margin-top:8px">→ <b>Teclado K-200</b>, aunque esté mal escrito, y ordenado por relevancia.</p></div></div>`],
      dim: ['Dimensional (en estrella)', 'Otros modelos', 'Hechos y dimensiones en estrella', 'Informes y cuadros de mando', 'Snowflake, BigQuery', '18',
        () => { const d = (t, v) => `<div class="card" style="padding:8px 12px"><div class="w-title" style="margin:0">${t}</div><p style="font-size:15px">${v}</p></div>`;
          return `<div style="display:grid;grid-template-columns:1fr 1.5fr 1fr;gap:10px;align-items:center">${d('fecha', '30/10/2026 · octubre · 2026')}<div></div>${d('producto', 'K-200 · Teclados')}
            <div></div><div class="card hl" style="padding:10px 14px"><div class="w-title" style="margin:0">hechos: ventas</div><p style="font-size:15px;font-family:var(--font-mono)">K-200 · 1 ud · 39,90 €<br>M-10 · 2 uds · 25,00 €</p></div><div></div>
            ${d('cliente', 'Ana Ruiz · Jaén')}<div></div>${d('tienda', 'Web')}</div>`; }],
      vec: ['Vectorial', 'Otros modelos', 'Puntos en un espacio de significados', 'Búsqueda semántica e IA generativa', 'pgvector y bases vectoriales', '24',
        () => { const P = [['Teclado K-200', 150, 60, 1], ['Ratón M-10', 230, 112, 1], ['Teclado inalámbrico', 110, 160, 0], ['Monitor 24"', 470, 70, 0], ['Lámpara de mesa', 560, 175, 0]];
          return `<svg viewBox="0 0 770 250" style="width:100%;height:auto"><circle cx="190" cy="110" r="118" style="fill:var(--tint-blue)"/>${P.map(([t, x, y, a]) => `<circle cx="${x}" cy="${y}" r="10" style="fill:${a ? 'var(--blue)' : 'var(--mid)'}"/><text x="${x + 16}" y="${y + 6}" style="font-size:19px;fill:var(--ink)">${t}</text>`).join('')}
            <text x="330" y="240" style="font-family:var(--font-mono);font-size:17px;fill:var(--muted)">Teclado K-200 → [0,21; −0,43; 0,88; …]</text></svg>`; }] };
    const groups = [['Para diseñar', ['er']], ['Para guardar y operar', ['rel', 'kv', 'doc', 'col', 'graf']], ['Otros: tiempo, búsqueda, análisis e IA', ['ts', 'bus', 'dim', 'vec']]];
    el.innerHTML = `<div class="w-title">El pedido de Ana en todas las formas<span class="live">INTERACTIVO</span></div>
      <div style="display:flex;gap:18px;flex:1;min-height:0"><div class="mlist" style="flex:0 0 215px;display:flex;flex-direction:column;gap:4px">${groups.map(([g, ks]) => `<div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:6px">${g}</div>
        ${ks.map((k) => `<button class="btn" data-m="${k}" style="text-align:left;padding:6px 12px;font-size:15px">${M[k][0]}</button>`).join('')}`).join('')}</div>
      <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:10px"><div class="w-canvas" style="display:flex;flex-direction:column;justify-content:center"></div><div class="w-out"></div></div></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const show = (k) => {
      const m = M[k];
      el.querySelectorAll('[data-m]').forEach((b) => b.classList.toggle('on', b.dataset.m === k));
      cv.innerHTML = m[6]();
      out.innerHTML = `<b>${m[0]}</b> · Forma: ${m[2]} · Bueno para: ${m[3]} · Sistemas: ${m[4]} · Tema ${m[5]}`;
    };
    el.querySelector('.mlist').onclick = (e) => { const b = e.target.closest('[data-m]'); if (b) show(b.dataset.m); };
    show('er');
  },

  // ---------- 1.10 dónde viven los datos ----------
  donde(el) {
    const R = ['La máquina', 'Instalar y actualizar', 'Hacer copias', 'Vigilar que funcione', 'Tablas y datos'];
    const O = {
      local: ['Equipo local', ['Tú', 'Tú', 'Tú', 'Tú', 'Tú'], 'Sin coste y sin conexión', 'Un solo usuario; si se estropea el portátil, se pierde todo', 'SQLite en el móvil, DuckDB en un portátil', 1],
      srv: ['Servidor propio', ['Empresa', 'Empresa', 'Empresa', 'Empresa', 'Empresa'], 'Control total', 'Hay que comprar, mantener y vigilar', 'Un ordenador dedicado al que se conectan las aplicaciones por la red', 1],
      nube: ['Servicio gestionado', ['Proveedor', 'Proveedor', 'Proveedor', 'Proveedor', 'Tú'], 'En marcha en minutos, con copias automáticas', 'Dependes del proveedor y el coste crece con el uso', 'Amazon, Google, Microsoft, Neon, Supabase · se paga por uso', 1],
      dist: ['Distribuida', ['Proveedor o equipo especializado', 'Proveedor o equipo especializado', 'Proveedor o equipo especializado', 'Proveedor o equipo especializado', 'Tú'], 'Crece casi sin límite', 'Más compleja de diseñar y de entender (Tema 11)', 'Muchas máquinas que trabajan coordinadas', 6] };
    const { cv, out, ctl } = frame(el, { title: 'Quién se ocupa de qué', live: true, controls: seg([['local', 'Equipo local'], ['srv', 'Servidor'], ['nube', 'Nube (gestionado)'], ['dist', 'Distribuida']], 'dn') });
    const icon = (k, n) => {
      const box = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" style="fill:var(--surface);stroke:var(--blue);stroke-width:3"/>`;
      if (k === 'local') return `${box(40, 40, 120, 80)}<rect x="20" y="124" width="160" height="10" rx="4" style="fill:var(--blue)"/>`;
      if (k === 'srv') return [0, 1, 2].map((i) => `${box(55, 20 + i * 40, 90, 32)}<circle cx="128" cy="${36 + i * 40}" r="5" style="fill:var(--blue)"/>`).join('');
      if (k === 'nube') return '<path d="M50 120 a32 32 0 0 1 8-62 a42 42 0 0 1 80-6 a30 30 0 0 1 12 68 Z" style="fill:var(--tint-blue);stroke:var(--blue);stroke-width:3"/>';
      return Array.from({ length: n }, (_, i) => `${box(20 + (i % 3) * 56, 30 + Math.floor(i / 3) * 56, 44, 40)}`).join('') + '<path d="M42 70 h112 M98 70 v16" style="stroke:var(--blue-l);stroke-width:2"/>';
    };
    const show = (k) => {
      const o = O[k]; pick(ctl, '.dn', k);
      cv.innerHTML = `<div style="display:flex;gap:22px;height:100%;align-items:center">
        <div style="flex:0 0 220px;text-align:center"><svg viewBox="0 0 200 160" style="width:200px;height:160px">${icon(k, o[5])}</svg><div style="font-family:var(--font-title);font-weight:700;font-size:22px;color:var(--title)">${o[0]}</div><p style="font-size:15px">${o[4]}</p></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">${R.map((r, i) => { const me = o[1][i] === 'Tú' || o[1][i] === 'Empresa';
          return `<div style="display:flex;align-items:center;gap:12px"><span style="flex:0 0 190px;font-size:17px;font-weight:600">${r}</span><span style="flex:1;border-radius:10px;padding:8px 14px;font-size:16px;font-weight:700;transition:.3s;background:${me ? 'var(--blue)' : 'var(--tint-gray)'};color:${me ? '#fff' : 'var(--ink)'}">${o[1][i]}</span></div>`; }).join('')}
          <div style="display:flex;gap:10px;margin-top:6px"><div class="box" style="flex:1;padding:10px 14px"><div class="bt">Ventaja</div><p style="font-size:17px">${o[2]}</p></div><div class="box warn" style="flex:1;padding:10px 14px"><div class="bt">Inconveniente</div><p style="font-size:17px">${o[3]}</p></div></div></div></div>`;
      out.innerHTML = k === 'nube' ? 'Un <b>servicio gestionado</b> no elimina el trabajo de diseñar, consultar y proteger la base de datos: elimina el de cuidar las máquinas.' : `<b>${o[0]}</b>: ${o[4]}.`;
    };
    ctl.onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) show(b.dataset.k); };
    show('local');
  },

  // ---------- 1.11 los siete pilares ----------
  pilares(el) {
    const p = pal();
    const P = [['Calidad', 'Datos correctos, completos y coherentes', '«Jaén» aparece escrita de cinco formas y el informe de ventas por ciudad sale mal', 'Temas 4 y 5'],
      ['Reglas', 'Lo que no tiene sentido no puede entrar (integridad)', 'Un pedido sin cliente: nadie sabe a quién enviarlo ni a quién cobrarlo', 'Temas 3 y 5'],
      ['Concurrencia', 'Muchos usuarios a la vez sin pisarse', 'Dos clientes compran el último teclado y los dos reciben la confirmación', 'Tema 10'],
      ['Permisos', 'Cada persona ve y cambia solo lo que necesita', 'Un becario con permisos de más borra la tabla de pedidos', 'Temas 9 y 23'],
      ['Privacidad', 'Los datos personales se tratan como marca la ley', 'Se guardan datos de clientes sin necesidad o se comparten sin permiso: sanción por incumplir el RGPD', 'Tema 23'],
      ['Disponibilidad', 'El sistema funciona cuando se necesita', 'La web se cae en pleno Black Friday', 'Temas 11 y 23'],
      ['Recuperación', 'Poder volver atrás tras un error o un desastre', 'Alguien borra datos por error y la copia de seguridad, que nunca se había probado, no funciona', 'Temas 10 y 23']];
    const { cv, out, ctl } = frame(el, { title: 'Los siete pilares de unos datos fiables', live: true, controls: '<button class="btn primary fail">Que falle este pilar</button><button class="btn rst">↺</button>' });
    const { s, W, H } = svg(cv);
    let cur = 0;
    const broken = new Set();
    const n = P.length, x0 = 60, x1 = W - 60, pw = Math.min(90, (x1 - x0) / n - 18), top = 90, bot = H - 40;
    const roof = s.append('g');
    roof.append('path').attr('d', `M${x0 - 20},${top} L${W / 2},20 L${x1 + 20},${top} Z`).attr('fill', p.blue);
    roof.append('text').text('Confianza en los datos').attr('x', W / 2).attr('y', top - 18).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 22);
    s.append('rect').attr('x', x0 - 20).attr('y', bot).attr('width', x1 - x0 + 40).attr('height', 22).attr('rx', 4).attr('fill', p.gray);
    const g = s.selectAll('g.pl').data(P).join('g').attr('class', 'pl').style('cursor', 'pointer')
      .attr('transform', (d, i) => `translate(${x0 + (i + 0.5) * ((x1 - x0) / n)},0)`);
    g.append('rect').attr('x', -pw / 2).attr('y', top + 6).attr('width', pw).attr('height', bot - top - 6).attr('rx', 6);
    g.append('text').text((d) => d[0]).attr('transform', `translate(6,${(top + bot) / 2}) rotate(-90)`).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 19);
    const render = () => {
      g.select('rect').attr('fill', (d, i) => (broken.has(i) ? p.red : i === cur ? p.blueD : p.surface2)).attr('stroke', (d, i) => (i === cur ? p.blue : p.line)).attr('stroke-width', 3)
        .attr('height', (d, i) => (broken.has(i) ? (bot - top) * 0.55 : bot - top - 6)).attr('y', (d, i) => (broken.has(i) ? bot - (bot - top) * 0.55 : top + 6));
      g.select('text').attr('fill', (d, i) => (broken.has(i) || i === cur ? '#fff' : p.title));
      roof.transition().duration(400).attr('transform', `rotate(${Math.min(6, broken.size * 2)},${W / 2},${top})`);
      const d = P[cur];
      out.innerHTML = broken.has(cur) ? `<span class="bad"><b style="color:var(--red)">${d[0]} falla</b>: ${d[2]}. Lo verás en ${d[3]}.</span>` : `<b>${d[0]}</b>: ${d[1]}. Lo verás en ${d[3]}.`;
    };
    g.on('click', (e, d) => { cur = P.indexOf(d); render(); });
    ctl.querySelector('.fail').onclick = () => { broken.has(cur) ? broken.delete(cur) : broken.add(cur); render(); };
    ctl.querySelector('.rst').onclick = () => { broken.clear(); render(); };
    render();
  },

  // ---------- 1.12 cómo crece Mercado Next ----------
  crece(el) {
    const p = pal();
    const E = [['Año 0', 'Tres socios llevan los pedidos en una hoja compartida y aparecen los errores del apartado 1.3', 'Diseñar una base de datos: modelo E/R, paso a tablas y normalización', 'I'],
      ['Año 1', 'La web necesita guardar y consultar clientes, productos y pedidos', 'PostgreSQL y SQL para crear, llenar y consultar tablas, con usuarios y permisos', 'II'],
      ['Año 2', 'Miles de pedidos al día: algunas pantallas van lentas y hay compras simultáneas', 'Índices, transacciones y copias de seguridad', 'III'],
      ['Black Friday', 'La web no aguanta el tráfico, el catálogo se llena de productos muy distintos, los clientes buscan con errores y se quieren recomendaciones', 'Escalado, Redis como caché, MongoDB para el catálogo, Cassandra y series temporales para los clics, Neo4j para recomendar y Elasticsearch para buscar', 'IV'],
      ['Cuadros de mando', 'Dirección quiere ver las ventas por canal, categoría y región, con años de historia', 'Data warehouse, modelo en estrella, ETL, Snowflake y BigQuery', 'V'],
      ['Ciencia de datos', 'El equipo de datos quiere usar clics, compras e imágenes para entrenar modelos', 'Data lake, lakehouse y Databricks', 'VI'],
      ['Año 3', 'Hay que proteger todo esto, cumplir el RGPD y elegir bien cada tecnología', 'Seguridad, mínimo privilegio, copias frente a alta disponibilidad y criterios de elección', 'VII'],
      ['Hoy', 'Negocio quiere preguntar a los datos en lenguaje natural', 'Copilotos de SQL, búsqueda semántica y RAG', 'VIII']];
    el.innerHTML = `<div class="w-title">La historia de Mercado Next, bloque a bloque<span class="live">INTERACTIVO</span></div>
      <div class="w-canvas" style="flex:0 0 46%"></div><div class="card info" style="flex:1;min-height:0;padding:16px 20px;display:flex;gap:20px;align-items:center"></div>`;
    const cv = el.querySelector('.w-canvas'), info = el.querySelector('.info');
    const { s, W, H } = svg(cv);
    const n = E.length, x0 = 70, x1 = W - 70;
    const pts = E.map((e, i) => [x0 + (i * (x1 - x0)) / (n - 1), H / 2 + (i % 2 ? 26 : -26)]);
    const line = d3.line().curve(d3.curveCatmullRom.alpha(0.6));
    s.append('path').attr('d', line(pts)).attr('fill', 'none').attr('stroke', p.line).attr('stroke-width', 8).attr('stroke-linecap', 'round');
    const prog = s.append('path').attr('fill', 'none').attr('stroke', p.blue).attr('stroke-width', 8).attr('stroke-linecap', 'round');
    const g = s.selectAll('g.st').data(E).join('g').attr('class', 'st').attr('transform', (d, i) => `translate(${pts[i]})`).style('cursor', 'pointer');
    g.append('circle').attr('r', 30).attr('stroke', p.blue).attr('stroke-width', 4);
    g.append('text').attr('class', 'b').text((d) => d[3]).attr('text-anchor', 'middle').attr('dy', 8).attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 22);
    g.append('text').text((d) => d[0]).attr('text-anchor', 'middle').attr('y', (d, i) => (i % 2 ? 58 : -44)).attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 18).attr('fill', p.title);
    const show = (i) => {
      prog.attr('d', line(pts.slice(0, i + 1)));
      g.select('circle').attr('fill', (d, j) => (j <= i ? p.blue : p.surface));
      g.select('text.b').attr('fill', (d, j) => (j <= i ? '#fff' : p.blueD));
      const e = E[i], b = BLOQUES.find((x) => x[0] === e[3]);
      info.innerHTML = `<div style="flex:1"><div class="w-title" style="margin:0 0 4px">${e[0]} · qué le pasa a Mercado Next</div><p style="font-size:19px;color:var(--ink)">${e[1]}</p>
        <div class="w-title" style="margin:10px 0 4px">Qué incorpora</div><p style="font-size:19px;color:var(--ink)">${e[2]}</p></div>
        <button class="btn primary" data-go="b${e[3]}" style="flex:none">Bloque ${e[3]} · ${esc(b[1])} (Temas ${b[2]}) →</button>`;
    };
    g.on('click mouseenter', (e, d) => show(E.indexOf(d)));
    show(0);
  },

  // ---------- 1.12 perfiles y bloques ----------
  perfiles(el) {
    const p = pal();
    const P = [['Analista de datos', 'Responde preguntas de negocio con datos', 'Desde el año 1', ['II', 'V']],
      ['Desarrollador/a de BI', 'Diseña modelos para analizar y cuadros de mando', 'Cuando dirección pide cuadros de mando', ['I', 'II', 'V']],
      ['Analytics engineer', 'Prepara y modela los datos ya cargados para que sean fáciles de analizar', 'Con el data warehouse', ['II', 'V']],
      ['Ingeniero/a de datos', 'Construye los procesos que mueven y transforman los datos', 'Con el data warehouse y el lakehouse', ['II', 'IV', 'V', 'VI']],
      ['Administrador/a (DBA)', 'Instala, configura, protege, respalda y optimiza los SGBD', 'Cuando hay muchos pedidos', ['II', 'III', 'VII']],
      ['Científico/a de datos', 'Construye modelos estadísticos y de aprendizaje automático', 'Con el lakehouse', ['II', 'VI', 'VIII']],
      ['Arquitecto/a de datos', 'Decide qué sistemas se usan y cómo encajan entre sí', 'Cuando conviven varias tecnologías', ['IV', 'VII'], true]];
    const B = BLOQUES.map((b) => b[0]);
    const { cv, out } = frame(el, { title: 'Perfiles × bloques que más usará', live: true });
    const { s, W, H } = svg(cv);
    const lw = 250, th = 40, cw = (W - lw - 10) / B.length, rh = (H - th - 4) / P.length;
    s.selectAll('text.h').data(B).join('text').attr('class', 'h').text((d) => d).attr('x', (d, i) => lw + i * cw + cw / 2).attr('y', th - 12).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 18).attr('fill', p.muted);
    const rows = s.selectAll('g.r').data(P).join('g').attr('class', 'r').attr('transform', (d, i) => `translate(0,${th + i * rh})`).style('cursor', 'pointer');
    rows.append('rect').attr('x', 0).attr('width', W).attr('height', rh - 4).attr('rx', 10).attr('fill', p.surface2).attr('opacity', 0);
    rows.append('text').text((d) => d[0]).attr('x', lw - 16).attr('y', rh / 2 + 5).attr('text-anchor', 'end').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 18).attr('fill', p.title);
    rows.each(function (d) {
      d3.select(this).selectAll('circle').data(B).join('circle').attr('cx', (b, j) => lw + j * cw + cw / 2).attr('cy', rh / 2 - 1)
        .attr('r', (b) => (d[3].includes(b) ? 13 : d[4] ? 8 : 5)).attr('fill', (b) => (d[3].includes(b) ? p.blue : d[4] ? p.blueL : p.line));
    });
    const sel = (d) => { rows.select('rect').attr('opacity', (x) => (x === d ? 1 : 0)); out.innerHTML = `<b>${d[0]}</b>: ${d[1]}. En Mercado Next aparece: ${d[2].charAt(0).toLowerCase() + d[2].slice(1)}. Bloques: ${d[4] ? 'todos, en especial ' : ''}${d[3].join(', ')}.`; };
    rows.on('mouseenter click', (e, d) => sel(d));
    sel(P[0]);
  },

  // ---------- 1.12 qué te llevas según tu perfil ----------
  tuperfil(el) {
    const T = { neg: ['Entender cómo se organiza la información de una empresa y hablar con los técnicos', 'Hacer tus propias consultas sin depender de nadie', 'Entender por qué un informe tarda o una compra falla', 'Saber qué alternativas existen y para qué sirven', 'Entender de dónde salen tus cuadros de mando', 'Entender qué es un lakehouse y qué aporta', 'Conocer tus obligaciones con el RGPD', 'Preguntar a los datos en lenguaje natural con criterio'],
      ana: ['Saber de dónde salen las tablas que consultas', 'Tu herramienta principal de trabajo', 'Escribir consultas que no frenen el sistema', 'Consultar datos que no están en tablas', 'Trabajar con Snowflake y BigQuery', 'Consultar grandes volúmenes con SQL', 'Trabajar con datos personales de forma segura', 'Usar la IA como copiloto de SQL'],
      tec: ['Diseñar bases de datos sólidas', 'Crear y mantener bases de datos completas', 'Optimizar y garantizar la consistencia', 'Elegir y usar cada familia', 'Construir el data warehouse', 'Gestionar datos en Databricks', 'Proteger y elegir arquitecturas', 'Conectar modelos de lenguaje y bases de datos de forma segura'] };
    const { cv, out, ctl } = frame(el, { title: 'Para qué te sirve cada bloque', live: true, controls: seg([['neg', 'Vengo de negocio'], ['ana', 'Voy a analizar datos'], ['tec', 'Tengo perfil técnico']], 'tp') });
    const show = (k) => {
      pick(ctl, '.tp', k);
      cv.innerHTML = `<div class="cards c4" style="height:100%;grid-auto-rows:1fr">${BLOQUES.map((b, i) => `<button class="card" data-go="b${b[0]}" style="cursor:pointer;text-align:left;font:inherit;color:inherit;padding:14px 16px">
        <div class="w-title" style="margin:0 0 6px;color:var(--blue)">Bloque ${b[0]} · ${esc(b[1])}</div><p style="font-size:18px;color:var(--ink)">${T[k][i]}</p></button>`).join('')}</div>`;
    };
    ctl.onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) show(b.dataset.k); };
    out.innerHTML = 'Orientativo. Haz clic en un bloque para ir a él.';
    show('neg');
  }
};
