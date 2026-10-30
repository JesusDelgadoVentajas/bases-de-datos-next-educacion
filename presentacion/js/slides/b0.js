// Portada y guía de la asignatura
import { col, pts, box, w, table, cards, study } from '../deck.js';
import { pal, three, frame, svg, esc, widgetScope } from '../ui.js';
import { query, renderResult } from '../sql.js';

export const BLOQUES = [
  ['I', 'Fundamentos y modelado', '1–4', '¿Qué es una base de datos y cómo se diseña bien?'],
  ['II', 'SQL', '5–9', '¿Cómo se crean, se llenan y se consultan las tablas?'],
  ['III', 'Rendimiento y transacciones', '10', '¿Por qué una consulta es lenta y qué pasa si dos personas escriben a la vez?'],
  ['IV', 'NoSQL', '11–17', '¿Qué hacer cuando el modelo relacional no es la mejor opción?'],
  ['V', 'Bases de datos analíticas', '18–20', '¿Cómo se organiza la información para analizarla?'],
  ['VI', 'Big Data aplicado', '21–22', '¿Qué cambia cuando los datos no caben en un servidor?'],
  ['VII', 'Seguridad y criterio', '23', '¿Cómo se protege una base de datos y cómo se elige la adecuada?'],
  ['VIII', 'Extra: IA generativa', '24', '¿Qué aporta la IA generativa al trabajo con bases de datos?']
];

export function build(D) {
  D.cover(`<div class="cover-canvas widget bare" data-w="cover"></div>
    <div class="cover-content">
      <img class="cover-logo" src="assets/img/logo.png" alt="Next Educación">
      <div class="cover-kicker">MÁSTER EN BIG DATA &amp; BUSINESS INTELLIGENCE</div>
      <h1 class="cover-title">Sistemas de Gestión de Bases de Datos</h1>
      <p class="cover-sub">Relacionales y No Relacionales</p>
      <div class="cover-tags"><span>SQL</span><span>NoSQL</span><span>Data Warehouse</span><span>Lakehouse</span><span>IA generativa</span></div>
      <div class="cover-author"><div class="av">JD</div><div><div class="nm">Jesús Delgado Ventajas</div><div class="rl">AI &amp; Data Engineer</div></div></div>
    </div>
    <div class="cover-hint">Pulsa <kbd>→</kbd> para empezar · <kbd>?</kbd> atajos</div>`);

  D.add({ id: 'guia', label: 'Cómo usar el temario', html: `<div class="sec">GUÍA</div><h2>Cómo usar el temario</h2>
    <p class="lead">El camino completo de los datos: diseñarlos, consultarlos con SQL, que aguanten a muchos usuarios a la vez, alternativas NoSQL, analítica en la nube e IA generativa.</p>
    <div class="slide-body">${col(`${cards([
      ['Núcleo común', 'Lo que todo el mundo debe dominar. Si nunca has tocado una base de datos, empieza aquí.', 'hl'],
      ['Ampliación (+)', 'Para quien ya tiene base técnica o quiere profundizar. Se puede saltar sin perder el hilo.']], 2)}
      ${pts(['<b>PostgreSQL</b> es el sistema de referencia: todo el SQL se ha ejecutado en PostgreSQL. Cuando MySQL difiere, se indica.',
        'Palabras reservadas de SQL en <code>MAYÚSCULAS</code>; tablas y columnas en <code>minúsculas</code>. Solo es un convenio de legibilidad.',
        'Esta presentación resume el temario. <b>El Word tiene todo el detalle</b>, las fórmulas y los ejemplos completos.'])}`)}
      ${col(`<div class="w-title">Las cajas del temario</div>${table(['Caja', 'Qué contiene'], [
        ['Clave', 'Lo imprescindible del apartado'], ['Recordamos que…', 'Un concepto que ya apareció y vuelve a hacer falta'],
        ['Ejemplo', 'Un caso concreto que aterriza la teoría'], ['Atención', 'Errores frecuentes y trampas'],
        ['MySQL', 'Cuando MySQL se comporta distinto que PostgreSQL'], ['Dato', 'Historia y contexto']], 'small')}
        ${study('En modo estudio aparecen notas ampliadas como esta. En modo presentación quedan ocultas para que la diapositiva respire. Cambia de modo con la tecla <kbd>E</kbd>.')}`, 'narrow')}</div>` });

  D.add({ id: 'mapa', label: 'Mapa de la asignatura', html: `<div class="sec">GUÍA</div><h2>Mapa de la asignatura</h2>
    <p class="lead">Ocho bloques que van de los fundamentos a la IA generativa. Pasa el ratón por cada parada; haz clic para ir al bloque.</p>
    <div class="slide-body">${w('roadmap')}</div>` });

  D.add({ id: 'mercado', label: 'El caso: Mercado Next', html: `<div class="sec">GUÍA</div><h2>El caso que nos acompaña: Mercado Next</h2>
    <p class="lead">Una tienda online ficticia: clientes que hacen pedidos, pedidos formados por líneas, productos en categorías y una plantilla de empleados. Está cargada de verdad en tu navegador.</p>
    <div class="slide-body">${w('mercado')}</div>` });

  D.add({ id: 'controles', label: 'Cómo funciona esta presentación', html: `<div class="sec">GUÍA</div><h2>Cómo funciona esta presentación</h2>
    <div class="slide-body">${col(cards([
      ['→ ←  Navegar', 'Flechas, espacio o los botones de abajo. Cada diapositiva tiene su propia URL.'],
      ['I  Índice', 'Todos los bloques, temas y apartados, en el mismo orden que el Word.'],
      ['E  Estudio / presentación', 'El modo estudio muestra notas ampliadas debajo de cada diapositiva.'],
      ['T  Claro / oscuro', 'El tema claro es el de por defecto.'],
      ['F  Enfocar figura', 'Oculta el texto y deja solo el gráfico interactivo a pantalla completa.'],
      ['SQL en vivo', 'PostgreSQL real dentro del navegador. Escribe, ejecuta con Ctrl+Enter y rompe lo que quieras: «Reiniciar BD» lo deja como nuevo.']], 3))}</div>` });
}

export const widgets = {
  // ---------- portada: escena 3D clara ----------
  async cover(el) {
    const life = widgetScope(el);
    const p = pal();
    const T = await three(el, { controls: false, pos: [0, 0.4, 15], fov: 40 }, life);
    if (!life.alive) { T?.dispose(); return; }
    const { THREE, scene, camera } = T;
    const blue = new THREE.Color(p.blue), blueD = new THREE.Color(p.blueD), gray = new THREE.Color(p.dark ? '#9AA3A9' : '#505456');
    const world = new THREE.Group(); world.position.set(5.4, 0.3, 0); world.scale.setScalar(0.74); scene.add(world);

    // onda de puntos (datos) al fondo
    const NX = 110, NZ = 46, wave = new THREE.BufferGeometry();
    const wp = new Float32Array(NX * NZ * 3), wc = new Float32Array(NX * NZ * 3);
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
      const k = (i * NZ + j) * 3; wp[k] = (i - NX / 2) * 0.32; wp[k + 2] = (j - NZ / 2) * 0.32;
      const c = blue.clone().lerp(gray, j / NZ * 0.8); wc[k] = c.r; wc[k + 1] = c.g; wc[k + 2] = c.b;
    }
    wave.setAttribute('position', new THREE.BufferAttribute(wp, 3)); wave.setAttribute('color', new THREE.BufferAttribute(wc, 3));
    const waveP = new THREE.Points(wave, new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: p.dark ? 0.7 : 0.55 }));
    waveP.position.set(-2, -4.2, -6); waveP.rotation.x = 0.18; scene.add(waveP);

    // pila de discos: el símbolo de base de datos
    const stack = new THREE.Group(); world.add(stack);
    const discs = [];
    for (let i = 0; i < 3; i++) {
      const g = new THREE.CylinderGeometry(1.75, 1.75, 0.78, 96, 1);
      const m = new THREE.MeshStandardMaterial({ color: i === 2 ? p.blue : (p.dark ? '#2B3237' : '#FFFFFF'), emissive: i === 2 ? p.blueD : (p.dark ? '#11161A' : '#DDE7EC'), emissiveIntensity: 0.45, roughness: 0.35, metalness: 0.05, transparent: true, opacity: i === 2 ? 0.94 : 0.92 });
      const d = new THREE.Mesh(g, m); d.position.y = (i - 1) * 1.02; stack.add(d); discs.push(d);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(g, 20), new THREE.LineBasicMaterial({ color: i === 2 ? '#ffffff' : p.blue, transparent: true, opacity: 0.9 }));
      e.position.copy(d.position); stack.add(e);
      // bandas de "registros"
      for (let r = 0; r < 18; r++) {
        const a = (r / 18) * Math.PI * 2;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.36, 0.02), new THREE.MeshBasicMaterial({ color: i === 2 ? '#ffffff' : p.blueL, transparent: true, opacity: 0.7 }));
        bar.position.set(Math.cos(a) * 1.76, d.position.y, Math.sin(a) * 1.76); bar.lookAt(0, d.position.y, 0); stack.add(bar);
      }
    }
    stack.rotation.x = 0.32;

    // anillos orbitales de partículas
    const rings = [];
    [[3.1, 0.5, 140, 0.35], [3.9, -0.35, 180, -0.22], [4.8, 0.15, 220, 0.15]].forEach(([R, tilt, n, sp], idx) => {
      const g = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pos[i * 3] = Math.cos(a) * R; pos[i * 3 + 1] = Math.sin(a * 3) * 0.08; pos[i * 3 + 2] = Math.sin(a) * R; }
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const ring = new THREE.Points(g, new THREE.PointsMaterial({ size: idx === 1 ? 0.07 : 0.05, color: idx === 1 ? p.blueD : p.blue, transparent: true, opacity: 0.85 }));
      const holder = new THREE.Group(); holder.rotation.x = tilt + 0.3; holder.rotation.z = tilt * 0.4; holder.add(ring);
      // paquetes brillantes que recorren el anillo
      const pk = [];
      for (let i = 0; i < 4; i++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), new THREE.MeshBasicMaterial({ color: i % 2 ? p.blue : (p.dark ? '#ffffff' : p.blueD) }));
        holder.add(s); pk.push({ s, a: Math.random() * Math.PI * 2, R });
      }
      world.add(holder); rings.push({ ring, sp, pk });
    });

    // red de nodos (grafo) alrededor
    const nodes = [], NN = 46;
    const nodeG = new THREE.Group(); world.add(nodeG);
    for (let i = 0; i < NN; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(5.6 + Math.random() * 1.6);
      v.y *= 0.7;
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.06, 12, 12), new THREE.MeshBasicMaterial({ color: Math.random() < 0.6 ? p.blue : (p.dark ? '#7D8387' : '#A4A8AB') }));
      m.position.copy(v); nodeG.add(m); nodes.push(m);
    }
    const lp = [];
    nodes.forEach((a, i) => {
      const near = nodes.map((b, j) => [a.position.distanceTo(b.position), j]).filter(([d, j]) => j !== i).sort((x, y) => x[0] - y[0]).slice(0, 2);
      near.forEach(([d, j]) => { if (d < 3.4) { lp.push(a.position.x, a.position.y, a.position.z, nodes[j].position.x, nodes[j].position.y, nodes[j].position.z); } });
    });
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    nodeG.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: p.dark ? '#5A646B' : '#B9C3C8', transparent: true, opacity: 0.6 })));

    // consultas que viajan de los nodos a la base de datos
    const flights = [];
    for (let i = 0; i < 10; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), new THREE.MeshBasicMaterial({ color: p.blueD, transparent: true }));
      world.add(s); flights.push({ s, from: null, t: Math.random() });
    }
    const respawn = (f) => { f.from = nodes[(Math.random() * NN) | 0].position.clone().applyEuler(nodeG.rotation); f.t = 0; f.sp = 0.004 + Math.random() * 0.006; };
    flights.forEach(respawn);

    // parallax con el ratón
    let mx = 0, my = 0;
    const onMove = (e) => { const r = el.getBoundingClientRect(); mx = ((e.clientX - r.left) / r.width - 0.5) * 2; my = ((e.clientY - r.top) / r.height - 0.5) * 2; };
    window.addEventListener('pointermove', onMove);

    T.onFrame((t) => {
      const pa = wave.attributes.position.array;
      for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
        const k = (i * NZ + j) * 3, x = pa[k], z = pa[k + 2];
        pa[k + 1] = Math.sin(x * 0.35 + t * 0.9) * 0.45 + Math.cos(z * 0.45 + t * 0.6) * 0.35;
      }
      wave.attributes.position.needsUpdate = true;
      stack.rotation.y = t * 0.25;
      discs.forEach((d, i) => { d.position.y = (i - 1) * 1.02 + Math.sin(t * 1.2 + i) * 0.06; });
      rings.forEach(({ ring, sp, pk }) => { ring.rotation.y = t * sp; pk.forEach((o) => { o.a += sp * 0.02; o.s.position.set(Math.cos(o.a) * o.R, 0, Math.sin(o.a) * o.R); }); });
      nodeG.rotation.y = t * 0.05;
      flights.forEach((f) => {
        f.t += f.sp; if (f.t >= 1) respawn(f);
        const e = 1 - Math.pow(1 - f.t, 2);
        f.s.position.copy(f.from).multiplyScalar(1 - e);
        f.s.material.opacity = Math.sin(f.t * Math.PI);
      });
      world.rotation.y += ((mx * 0.35) - world.rotation.y) * 0.04;
      world.rotation.x += ((my * 0.18) - world.rotation.x) * 0.04;
      camera.position.x += (mx * 0.6 - camera.position.x) * 0.03;
      camera.lookAt(0, 0, 0);
    });
    return () => { window.removeEventListener('pointermove', onMove); T.dispose(); };
  },

  // ---------- mapa de ruta de los 8 bloques ----------
  roadmap(el) {
    const p = pal();
    const { cv, out } = frame(el, { title: 'Ruta de la asignatura', live: true });
    const { s, W, H } = svg(cv);
    const n = BLOQUES.length, x0 = 90, x1 = W - 90;
    const pts = BLOQUES.map((b, i) => [x0 + (i * (x1 - x0)) / (n - 1), H / 2 + (i % 2 ? 70 : -70)]);
    const line = d3.line().curve(d3.curveCatmullRom.alpha(0.6));
    const path = s.append('path').attr('d', line(pts)).attr('fill', 'none').attr('stroke', p.line).attr('stroke-width', 10).attr('stroke-linecap', 'round');
    const prog = s.append('path').attr('d', line(pts)).attr('fill', 'none').attr('stroke', p.blue).attr('stroke-width', 10).attr('stroke-linecap', 'round');
    const L = prog.node().getTotalLength();
    prog.attr('stroke-dasharray', L).attr('stroke-dashoffset', L).transition().duration(1800).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);
    const g = s.selectAll('g.st').data(BLOQUES).join('g').attr('class', 'st').attr('transform', (d, i) => `translate(${pts[i]})`).style('cursor', 'pointer');
    g.append('circle').attr('r', 0).attr('fill', p.surface).attr('stroke', p.blue).attr('stroke-width', 5)
      .transition().delay((d, i) => 200 + i * 180).duration(500).attr('r', 44);
    g.append('text').text((d) => d[0]).attr('text-anchor', 'middle').attr('dy', 10).attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 30).attr('fill', p.blueD);
    g.append('text').text((d) => d[1]).attr('text-anchor', 'middle').attr('y', (d, i) => (i % 2 ? 80 : -64)).attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 21).attr('fill', p.title);
    g.append('text').text((d) => `Temas ${d[2]}`).attr('text-anchor', 'middle').attr('y', (d, i) => (i % 2 ? 104 : -88)).attr('font-size', 16).attr('fill', p.muted);
    const show = (d) => { out.innerHTML = `<b>Bloque ${d[0]} · ${esc(d[1])}</b> — ${esc(d[3])}`; };
    g.on('mouseenter', function (e, d) { d3.select(this).select('circle').transition().duration(200).attr('r', 54).attr('fill', p.blue); d3.select(this).select('text').attr('fill', '#fff'); show(d); })
      .on('mouseleave', function () { d3.select(this).select('circle').transition().duration(200).attr('r', 44).attr('fill', p.surface); d3.select(this).select('text').attr('fill', p.blueD); })
      .on('click', (e, d) => { location.hash = 'b' + d[0]; });
    show(BLOQUES[0]);
  },

  // ---------- esquema de Mercado Next con datos reales ----------
  async mercado(el) {
    const life = widgetScope(el);
    const p = pal();
    el.innerHTML = `<div class="w-title">Esquema de Mercado Next · haz clic en una tabla<span class="live">EN VIVO</span></div>
      <div style="display:flex;gap:20px;flex:1;min-height:0"><div class="w-canvas" style="flex:1.15"></div>
      <div style="flex:1;display:flex;flex-direction:column;min-height:0;gap:8px"><div class="w-out"></div><div class="sql-result" style="flex:1"></div></div></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out'), res = el.querySelector('.sql-result');
    const T = {
      cliente: { x: 20, y: 30, cols: ['id PK', 'nombre', 'email UQ', 'ciudad', 'fecha_alta', 'vip'], q: '¿Cuántos clientes nuevos hubo este mes?' },
      pedido: { x: 270, y: 30, cols: ['id PK', 'cliente_id FK', 'fecha', 'estado'], q: '¿Qué pedidos siguen pendientes?' },
      linea_pedido: { x: 270, y: 250, cols: ['pedido_id PK FK', 'producto_id PK FK', 'cantidad', 'precio_unitario'], q: '¿Cuál es el ticket medio por ciudad?' },
      producto: { x: 520, y: 210, cols: ['id PK', 'nombre', 'categoria_id FK', 'precio', 'stock', 'atributos'], q: '¿Qué productos están por debajo del stock mínimo?' },
      categoria: { x: 520, y: 30, cols: ['id PK', 'nombre', 'padre_id FK'], q: '¿Qué categorías no tienen productos?' },
      empleado: { x: 20, y: 300, cols: ['id PK', 'nombre', 'departamento', 'salario', 'jefe_id FK'], q: '¿Quién depende, directa o indirectamente, de la directora?' }
    };
    const FK = [['pedido', 'cliente'], ['linea_pedido', 'pedido'], ['linea_pedido', 'producto'], ['producto', 'categoria'], ['categoria', 'categoria'], ['empleado', 'empleado']];
    const { s } = svg(cv, 780, 480);
    const bw = 210, rh = 26;
    const box = (t) => ({ x: T[t].x, y: T[t].y, w: bw, h: 46 + T[t].cols.length * rh });
    const lines = s.append('g');
    FK.forEach(([a, b]) => {
      const A = box(a), B = box(b);
      if (a === b) { lines.append('path').attr('d', `M${A.x + A.w},${A.y + 50} c40,0 40,${A.h - 70} 0,${A.h - 70}`).attr('fill', 'none').attr('stroke', p.mid).attr('stroke-width', 2).attr('stroke-dasharray', '5 4'); return; }
      const ax = A.x + A.w / 2, ay = A.y + A.h / 2, bx = B.x + B.w / 2, by = B.y + B.h / 2;
      lines.append('line').attr('x1', ax).attr('y1', ay).attr('x2', bx).attr('y2', by).attr('stroke', p.mid).attr('stroke-width', 2.5).attr('data-l', `${a} ${b}`);
    });
    const g = s.selectAll('g.tb').data(Object.keys(T)).join('g').attr('class', 'tb').attr('transform', (t) => `translate(${T[t].x},${T[t].y})`).style('cursor', 'pointer');
    g.append('rect').attr('width', bw).attr('height', (t) => box(t).h).attr('rx', 12).attr('fill', p.surface).attr('stroke', p.line).attr('stroke-width', 2);
    g.append('rect').attr('width', bw).attr('height', 34).attr('rx', 12).attr('fill', p.gray);
    g.append('rect').attr('y', 22).attr('width', bw).attr('height', 12).attr('fill', p.gray);
    g.append('text').text((t) => t).attr('x', 14).attr('y', 23).attr('fill', '#fff').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 17);
    g.each(function (t) {
      T[t].cols.forEach((c, i) => {
        const [name, ...tags] = c.split(' ');
        const tg = d3.select(this).append('text').attr('x', 14).attr('y', 56 + i * rh).attr('font-family', 'IBM Plex Mono').attr('font-size', 14).attr('fill', p.ink).text(name);
        if (tags.length) d3.select(this).append('text').attr('x', bw - 12).attr('y', 56 + i * rh).attr('text-anchor', 'end').attr('font-size', 12).attr('font-weight', 700).attr('fill', tags.includes('PK') ? p.blue : p.mid).text(tags.join(' '));
      });
    });
    const pick = async (t) => {
      g.select('rect').attr('stroke', (x) => (x === t ? p.blue : p.line)).attr('stroke-width', (x) => (x === t ? 4 : 2));
      out.innerHTML = `<b>${t}</b> · Pregunta de negocio: ${T[t].q}`;
      res.innerHTML = '<div class="msg">Consultando…</div>';
      try { const r = await query(`SELECT * FROM ${t} ORDER BY 1`); if (!life.alive) return; res.innerHTML = renderResult(r); }
      catch (e) { if (!life.alive) return; res.innerHTML = `<div class="msg err">${esc(e.message)}</div>`; }
    };
    g.on('click', (e, t) => pick(t));
    pick('cliente');
  }
};
