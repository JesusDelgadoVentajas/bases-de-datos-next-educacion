// Widgets de los Temas 11, 12 y 13
import { pal, frame, svg, chart, esc, highlight } from '../ui.js';

const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const segBtns = (opts, act, attr = 'k') => `<div class="seg">${opts.map((o) => `<button data-${attr}="${o}" class="${o === act ? 'active' : ''}">${o}</button>`).join('')}</div>`;
const bindSeg = (root, attr, cb) => root.querySelectorAll(`[data-${attr}]`).forEach((b) => (b.onclick = () => { root.querySelectorAll(`[data-${attr}]`).forEach((x) => x.classList.toggle('active', x === b)); cb(b.dataset[attr]); }));

export const widgets = {
  // ---------- escalado ----------
  scaling(el) {
    const p = pal();
    const { cv, out, ctl } = frame(el, { title: 'Capacidad frente a carga', live: true, controls: '<label>Carga (miles de peticiones/s) <input type="range" min="1" max="100" value="20" class="l"><b class="lv"></b></label>' });
    const xs = d3.range(0, 101, 2);
    const vert = xs.map((x) => Math.min(x, 45)), cost = xs.map((x) => (x <= 45 ? Math.pow(x / 45, 2.2) * 100 : null));
    const horiz = xs.map((x) => Math.ceil(x / 10) * 10);
    const mk = { id: 'm', afterDatasetsDraw(c) { const v = +ctl.querySelector('.l').value; const x = c.scales.x.getPixelForValue(v); const ctx = c.ctx; ctx.save(); ctx.strokeStyle = p.ink; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, c.chartArea.top); ctx.lineTo(x, c.chartArea.bottom); ctx.stroke(); ctx.restore(); } };
    const c = chart(cv, { type: 'line', plugins: [mk], data: { labels: xs, datasets: [
      { label: 'Vertical: capacidad (techo físico)', data: vert, borderColor: p.gray, borderWidth: 4, pointRadius: 0 },
      { label: 'Vertical: coste relativo', data: cost, borderColor: p.red, borderWidth: 3, borderDash: [6, 5], pointRadius: 0 },
      { label: 'Horizontal: capacidad (nodos de 10k)', data: horiz, borderColor: p.blue, borderWidth: 4, pointRadius: 0, stepped: true }] },
      options: { scales: { x: { type: 'linear', min: 0, max: 100, title: { display: true, text: 'carga' } }, y: { min: 0, max: 110 } }, plugins: { legend: { position: 'bottom' } } } });
    const upd = () => { const v = +ctl.querySelector('.l').value; ctl.querySelector('.lv').textContent = v; c.update('none');
      out.innerHTML = v <= 45 ? `Con ${v}k peticiones/s basta <b>una máquina más grande</b> (vertical): lo más sencillo.` : `Con ${v}k la mayor máquina disponible no llega: hacen falta <b>${Math.ceil(v / 10)} nodos</b> (horizontal).`; };
    ctl.oninput = upd; upd();
    return () => c.destroy();
  },

  // ---------- replicación y sharding ----------
  replshard(el) {
    const p = pal();
    let mode = 'Replicación', dead = new Set(), alive = true;
    el.innerHTML = `<div class="w-title">Tres nodos<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${segBtns(['Replicación', 'Sharding'], mode, 'm')}<button class="btn primary wr">✎ Escribir cliente</button><button class="btn rd">👁 Leer</button><span>Tumbar:</span>${[0, 1, 2].map((i) => `<button class="btn" data-n="${i}">Nodo ${i + 1}</button>`).join('')}</div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const keys = ['Ana', 'Luis', 'Marta', 'Iker', 'Sofía', 'Pablo', 'Elena', 'Raquel', 'Hugo'];
    let stored = [[], [], []], n = 0;
    const shardOf = (k) => (k < 'H' ? 0 : k < 'P' ? 1 : 2);
    const draw = () => {
      cv.innerHTML = ''; const { s, W, H } = svg(cv);
      const xs = [W * 0.2, W * 0.5, W * 0.8];
      s.append('rect').attr('x', W / 2 - 80).attr('y', 6).attr('width', 160).attr('height', 40).attr('rx', 20).attr('fill', p.tint).attr('stroke', p.blue);
      s.append('text').text('Aplicación').attr('x', W / 2).attr('y', 32).attr('text-anchor', 'middle').attr('font-weight', 700).attr('fill', p.blueD);
      xs.forEach((x, i) => {
        const d = dead.has(i);
        s.append('line').attr('x1', W / 2).attr('y1', 46).attr('x2', x).attr('y2', 110).attr('stroke', d ? p.red : p.line).attr('stroke-width', 2).attr('stroke-dasharray', d ? '6 6' : null);
        const g = s.append('g').attr('transform', `translate(${x - 120},110)`);
        g.append('rect').attr('width', 240).attr('height', H - 130).attr('rx', 16).attr('fill', d ? 'var(--tint-red)' : p.surface).attr('stroke', d ? p.red : (mode === 'Replicación' && i === 0 ? p.blue : p.gray)).attr('stroke-width', 3);
        g.append('text').text(`Nodo ${i + 1}${mode === 'Replicación' ? (i === 0 ? ' · líder' : ' · réplica') : ` · ${['A–G', 'H–O', 'P–Z'][i]}`}${d ? ' ✖' : ''}`).attr('x', 14).attr('y', 30).attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 18).attr('fill', d ? p.red : p.title);
        stored[i].forEach((k, j) => { g.append('rect').attr('x', 14 + (j % 3) * 72).attr('y', 48 + Math.floor(j / 3) * 40).attr('width', 64).attr('height', 32).attr('rx', 8).attr('fill', d ? p.line : p.blue).attr('opacity', d ? 0.5 : 1); g.append('text').text(k).attr('x', 46 + (j % 3) * 72).attr('y', 69 + Math.floor(j / 3) * 40).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 14).attr('font-weight', 600); });
      });
    };
    const reset = () => { stored = [[], [], []]; n = 0; dead = new Set(); draw(); out.innerHTML = ''; };
    bindSeg(el, 'm', (m) => { mode = m; reset(); });
    el.querySelector('.wr').onclick = () => {
      if (n >= keys.length) return; const k = keys[n++];
      if (mode === 'Replicación') { if (dead.has(0)) { out.innerHTML = '<span style="color:var(--red)">✖ El líder está caído: no se aceptan escrituras hasta elegir uno nuevo.</span>'; n--; return; } [0, 1, 2].forEach((i) => !dead.has(i) && stored[i].push(k)); out.innerHTML = `«${k}» va al <b>líder</b> y se propaga a las réplicas: <b>la misma copia</b> en todos.`; }
      else { const sh = shardOf(k); if (dead.has(sh)) { out.innerHTML = `<span style="color:var(--red)">✖ «${k}» va al nodo ${sh + 1}, que está caído: sin réplicas, esos datos no están disponibles.</span>`; n--; return; } stored[sh].push(k); out.innerHTML = `«${k}» va solo al <b>nodo ${sh + 1}</b> según su clave de partición: los datos <b>se reparten</b>.`; }
      draw();
    };
    el.querySelector('.rd').onclick = () => {
      const all = [...new Set(stored.flat())]; if (!all.length) { out.innerHTML = 'Escribe algo primero.'; return; }
      const k = all[(Math.random() * all.length) | 0];
      const holders = [0, 1, 2].filter((i) => stored[i].includes(k) && !dead.has(i));
      out.innerHTML = holders.length ? `Lectura de «${k}» servida por el nodo ${holders[(Math.random() * holders.length) | 0] + 1}${mode === 'Replicación' ? ' (cualquier réplica sirve: <b>escalan las lecturas</b>)' : ''}.` : `<span style="color:var(--red)">✖ «${k}» no está disponible: su único nodo está caído.</span>`;
    };
    el.querySelectorAll('[data-n]').forEach((b) => (b.onclick = () => { const i = +b.dataset.n; dead.has(i) ? dead.delete(i) : dead.add(i); b.classList.toggle('on', dead.has(i)); draw(); out.innerHTML = dead.has(i) ? `Nodo ${i + 1} caído. ${mode === 'Replicación' ? 'Las réplicas siguen teniendo los datos: <b>tolerancia a fallos</b>.' : 'Su parte de los datos deja de estar disponible (en la práctica, cada shard se replica).'}` : `Nodo ${i + 1} recuperado.`; }));
    reset();
    return () => { alive = false; };
  },

  // ---------- anillo de hashing consistente ----------
  hashring(el) {
    const p = pal();
    let N = 4, vn = false;
    el.innerHTML = `<div class="w-title">Anillo de hashing consistente<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><button class="btn" data-a="-">− nodo</button><span class="pill nn"></span><button class="btn primary" data-a="+">+ nodo</button><label><input type="checkbox" class="vn"> nodos virtuales (16 por nodo)</label></div>
      <div style="display:flex;gap:20px;flex:1;min-height:0"><div class="w-canvas" style="flex:1"></div><div class="ch" style="flex:1;position:relative"></div></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const K = d3.range(20000).map((i) => hash('cliente:' + i));
    const ring = (n) => { const pts = []; for (let i = 0; i < n; i++) for (let v = 0; v < (vn ? 16 : 1); v++) pts.push([hash(`nodo${i}#${v}`), i]); return pts.sort((a, b) => a[0] - b[0]); };
    const owner = (r, h) => { for (const [t, i] of r) if (h <= t) return i; return r[0][1]; };
    const colors = d3.schemeTableau10;
    const c = chart(el.querySelector('.ch'), { type: 'bar', data: { labels: ['hash mod N', 'consistente'], datasets: [{ data: [0, 0], backgroundColor: [p.gray, p.blue], borderRadius: 8 }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false }, title: { display: true, text: '% de claves que cambian de nodo al añadir uno', font: { size: 15 } } }, scales: { x: { min: 0, max: 100 } } } });
    const draw = () => {
      el.querySelector('.nn').textContent = `${N} nodos`;
      const r = ring(N), r2 = ring(N + 1);
      const ownersC = K.map((h) => owner(r, h)), ownersC2 = K.map((h) => owner(r2, h));
      const movedC = ownersC.filter((o, i) => o !== ownersC2[i]).length / K.length * 100;
      const movedM = K.filter((h) => h % N !== h % (N + 1)).length / K.length * 100;
      c.data.datasets[0].data = [movedM, movedC]; c.update();
      cv.innerHTML = ''; const { s, W, H } = svg(cv);
      const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 30, ang = (h) => (h / 4294967296) * Math.PI * 2 - Math.PI / 2;
      // arcos por dueño
      for (let i = 0; i < r.length; i++) {
        const a0 = ang(r[(i - 1 + r.length) % r.length][0]), a1 = ang(r[i][0]);
        const arc = d3.arc().innerRadius(R - 14).outerRadius(R).startAngle(a0 + Math.PI / 2).endAngle((a1 < a0 ? a1 + Math.PI * 2 : a1) + Math.PI / 2);
        s.append('path').attr('d', arc()).attr('transform', `translate(${cx},${cy})`).attr('fill', colors[r[i][1] % 10]).attr('opacity', 0.85);
      }
      K.slice(0, 400).forEach((h) => { const a = ang(h); s.append('circle').attr('cx', cx + Math.cos(a) * (R - 32)).attr('cy', cy + Math.sin(a) * (R - 32)).attr('r', 2.6).attr('fill', colors[owner(r, h) % 10]); });
      if (!vn) r.forEach(([t, i]) => { const a = ang(t); s.append('circle').attr('cx', cx + Math.cos(a) * R).attr('cy', cy + Math.sin(a) * R).attr('r', 13).attr('fill', colors[i % 10]).attr('stroke', '#fff').attr('stroke-width', 3); s.append('text').text(i + 1).attr('x', cx + Math.cos(a) * R).attr('y', cy + Math.sin(a) * R + 5).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-weight', 700).attr('font-size', 13); });
      const counts = d3.rollup(ownersC, (v) => v.length, (d) => d);
      const mx = d3.max([...counts.values()]), mn = d3.min([...counts.values()]);
      s.append('text').text(`${N} nodos`).attr('x', cx).attr('y', cy - 6).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 26).attr('fill', p.title);
      s.append('text').text(`reparto: ${(mn / K.length * 100).toFixed(0)}–${(mx / K.length * 100).toFixed(0)} %`).attr('x', cx).attr('y', cy + 20).attr('text-anchor', 'middle').attr('font-size', 15).attr('fill', p.muted);
      out.innerHTML = `Al pasar de ${N} a ${N + 1} nodos: con <b>hash mod N</b> se mueve el <b>${movedM.toFixed(0)} %</b> de las claves; con <b>hashing consistente</b>, el <b>${movedC.toFixed(0)} %</b> (teórico 1/(N+1) = ${(100 / (N + 1)).toFixed(0)} %). ${vn ? 'Con vnodes el reparto es mucho más uniforme.' : 'Sin vnodes el reparto es desigual: activa los nodos virtuales.'}`;
    };
    el.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => { N = Math.max(2, Math.min(9, N + (b.dataset.a === '+' ? 1 : -1))); draw(); }));
    el.querySelector('.vn').onchange = (e) => { vn = e.target.checked; draw(); };
    draw();
    return () => c.destroy();
  },

  // ---------- CAP ----------
  cap(el) {
    const p = pal();
    let mode = 'CP', cut = false, st;
    const reset = () => { st = { mad: { stock: 1, sold: 0 }, dub: { stock: 1, sold: 0 } }; cut = false; };
    reset();
    el.innerHTML = `<div class="w-title">Madrid ⟷ Dublín · stock del monitor: 1<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${segBtns(['CP', 'AP'], mode, 'm')}<button class="btn cut" style="border-color:var(--red);color:var(--red)">✂ Cortar la red</button><button class="btn" data-b="mad">🛒 Comprar en Madrid</button><button class="btn" data-b="dub">🛒 Comprar en Dublín</button><button class="btn heal">🔗 Reparar red</button><button class="btn rst">↺</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      cv.innerHTML = ''; const { s, W, H } = svg(cv);
      const pos = { mad: W * 0.22, dub: W * 0.78 }, y = H / 2;
      s.append('line').attr('x1', pos.mad + 110).attr('x2', pos.dub - 110).attr('y1', y).attr('y2', y).attr('stroke', cut ? p.red : p.blue).attr('stroke-width', 6).attr('stroke-dasharray', cut ? '14 10' : null);
      if (cut) s.append('text').text('✂').attr('x', W / 2).attr('y', y + 14).attr('text-anchor', 'middle').attr('font-size', 40).attr('fill', p.red);
      Object.entries(pos).forEach(([k, x]) => {
        const g = s.append('g').attr('transform', `translate(${x - 110},${y - 90})`);
        g.append('rect').attr('width', 220).attr('height', 180).attr('rx', 20).attr('fill', p.surface).attr('stroke', p.gray).attr('stroke-width', 3);
        g.append('text').text(k === 'mad' ? '🇪🇸 Madrid' : '🇮🇪 Dublín').attr('x', 110).attr('y', 36).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 22).attr('fill', p.title);
        g.append('text').text(`stock = ${st[k].stock}`).attr('x', 110).attr('y', 90).attr('text-anchor', 'middle').attr('font-family', 'IBM Plex Mono').attr('font-size', 22).attr('fill', p.blueD);
        g.append('text').text(`vendidos aquí: ${st[k].sold}`).attr('x', 110).attr('y', 130).attr('text-anchor', 'middle').attr('font-size', 17).attr('fill', p.muted);
      });
      const tot = st.mad.sold + st.dub.sold;
      s.append('text').text(`Total vendidos: ${tot}`).attr('x', W / 2).attr('y', H - 16).attr('text-anchor', 'middle').attr('font-weight', 700).attr('font-size', 20).attr('fill', tot > 1 ? p.red : p.title);
    };
    const buy = (k) => {
      const o = k === 'mad' ? 'dub' : 'mad';
      if (!cut) { if (st[k].stock > 0) { st[k].stock = 0; st[o].stock = 0; st[k].sold++; out.innerHTML = `✔ Venta en ${k === 'mad' ? 'Madrid' : 'Dublín'} confirmada con el otro nodo: ambos ven stock = 0.`; } else out.innerHTML = 'Sin stock: ya se vendió.'; }
      else if (mode === 'CP') out.innerHTML = `<span style="color:var(--red)">✖ CP: no puedo confirmar con ${o === 'mad' ? 'Madrid' : 'Dublín'} que nadie más lo ha comprado → <b>rechazo la venta</b> (o devuelvo error). Consistencia antes que disponibilidad.</span>`;
      else { if (st[k].stock > 0) { st[k].stock = 0; st[k].sold++; out.innerHTML = 'AP: <b>acepto la venta</b> con lo que sé localmente. Disponibilidad antes que consistencia.'; } else out.innerHTML = 'Sin stock en este nodo.'; }
      draw();
    };
    bindSeg(el, 'm', (m) => { mode = m; reset(); draw(); out.innerHTML = m === 'CP' ? 'CP: banca, inventario.' : 'AP: carrito, red social.'; });
    el.querySelector('.cut').onclick = () => { cut = true; draw(); out.innerHTML = 'Partición de red: Madrid y Dublín no pueden hablar. Ahora intenta comprar en ambos lados.'; };
    el.querySelector('.heal').onclick = () => { cut = false; const tot = st.mad.sold + st.dub.sold; draw(); out.innerHTML = tot > 1 ? '<span style="color:var(--red)">Red reparada: <b>conflicto</b>, se vendieron 2 monitores y había 1. Hay que reconciliar (por ejemplo, con un cupón de disculpa).</span>' : 'Red reparada: los nodos se sincronizan sin conflicto.'; };
    el.querySelectorAll('[data-b]').forEach((b) => (b.onclick = () => buy(b.dataset.b)));
    el.querySelector('.rst').onclick = () => { reset(); draw(); out.innerHTML = ''; };
    draw();
  },

  // ---------- quórums ----------
  quorum(el, args = {}) {
    const p = pal();
    const cass = !!args.cass;
    let N = 3, W = 2, R = 2, val, dead = new Set(), lastRead = [];
    const levels = { ONE: 1, TWO: 2, QUORUM: 2, ALL: 3 };
    el.innerHTML = `<div class="w-title">${cass ? 'Cassandra con RF = 3' : 'Réplicas, escrituras y lecturas'}<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${cass ? `<label>Escritura <select class="wl">${Object.keys(levels).map((l) => `<option ${l === 'QUORUM' ? 'selected' : ''}>${l}</option>`).join('')}</select></label><label>Lectura <select class="rl">${Object.keys(levels).map((l) => `<option ${l === 'QUORUM' ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`
        : '<label>N <input type="range" min="3" max="7" value="3" class="n"><b class="nv"></b></label><label>W <input type="range" min="1" max="7" value="2" class="w"><b class="wv"></b></label><label>R <input type="range" min="1" max="7" value="2" class="r"><b class="rv"></b></label>'}
        <button class="btn primary wr">✎ Escribir v2</button><button class="btn rd">👁 Leer</button><button class="btn rst">↺</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const reset = () => { val = Array(N).fill('v1'); lastRead = []; };
    const sync = () => {
      if (cass) { W = levels[el.querySelector('.wl').value]; R = levels[el.querySelector('.rl').value]; N = 3; }
      else { N = +el.querySelector('.n').value; el.querySelector('.w').max = N; el.querySelector('.r').max = N; W = Math.min(+el.querySelector('.w').value, N); R = Math.min(+el.querySelector('.r').value, N); el.querySelector('.nv').textContent = N; el.querySelector('.wv').textContent = W; el.querySelector('.rv').textContent = R; }
      if (!val || val.length !== N) { reset(); dead = new Set([...dead].filter((i) => i < N)); }
    };
    const draw = () => {
      cv.innerHTML = ''; const { s, W: Wd, H } = svg(cv);
      const cx = Wd / 2, cy = H / 2 - 4, rad = Math.min(Wd, H) * 0.34;
      s.append('text').text(`R + W = ${R + W} ${R + W > N ? '>' : '≤'} N = ${N}`).attr('x', cx).attr('y', cy - 6).attr('text-anchor', 'middle').attr('font-family', 'Karla').attr('font-weight', 700).attr('font-size', 26).attr('fill', R + W > N ? p.blue : p.red);
      s.append('text').text(R + W > N ? 'lecturas consistentes' : 'consistencia eventual').attr('x', cx).attr('y', cy + 22).attr('text-anchor', 'middle').attr('font-size', 16).attr('fill', p.muted);
      d3.range(N).forEach((i) => {
        const a = -Math.PI / 2 + (i / N) * Math.PI * 2, x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
        const g = s.append('g').attr('transform', `translate(${x},${y})`).style('cursor', 'pointer');
        const d = dead.has(i);
        g.append('circle').attr('r', 44).attr('fill', d ? 'var(--tint-red)' : val[i] === 'v2' ? p.blue : p.surface).attr('stroke', lastRead.includes(i) ? p.amber : d ? p.red : p.gray).attr('stroke-width', lastRead.includes(i) ? 6 : 3);
        g.append('text').text(d ? '✖' : val[i]).attr('text-anchor', 'middle').attr('y', 8).attr('font-family', 'IBM Plex Mono').attr('font-weight', 700).attr('font-size', 22).attr('fill', d ? p.red : val[i] === 'v2' ? '#fff' : p.ink);
        g.append('text').text(`réplica ${i + 1}`).attr('text-anchor', 'middle').attr('y', 64).attr('font-size', 14).attr('fill', p.muted);
        g.on('click', () => { d ? dead.delete(i) : dead.add(i); draw(); out.innerHTML = `Réplica ${i + 1} ${dead.has(i) ? 'caída' : 'recuperada'}. Vivas: ${N - dead.size}.`; });
      });
    };
    const aliveIdx = () => d3.range(N).filter((i) => !dead.has(i));
    el.querySelector('.wr').onclick = () => {
      sync(); const al = aliveIdx();
      if (al.length < W) { out.innerHTML = `<span style="color:var(--red)">✖ Escritura rechazada: hacen falta ${W} confirmaciones y solo hay ${al.length} réplicas vivas.</span>`; return; }
      const got = d3.shuffle(al.slice()).slice(0, W); got.forEach((i) => (val[i] = 'v2')); lastRead = [];
      draw(); out.innerHTML = `✔ v2 confirmada por ${W} réplica(s): ${got.map((i) => i + 1).join(', ')}. El resto se pondrá al día <b>más tarde</b> (consistencia eventual).`;
    };
    el.querySelector('.rd').onclick = () => {
      sync(); const al = aliveIdx();
      if (al.length < R) { out.innerHTML = `<span style="color:var(--red)">✖ Lectura imposible: hacen falta ${R} réplicas y solo responden ${al.length}.</span>`; return; }
      lastRead = d3.shuffle(al.slice()).slice(0, R);
      const seen = lastRead.map((i) => val[i]); const res = seen.includes('v2') ? 'v2' : 'v1';
      const latest = val.includes('v2') ? 'v2' : 'v1';
      draw(); out.innerHTML = `Leídas las réplicas ${lastRead.map((i) => i + 1).join(', ')} → devuelve <b>${res}</b> (la más reciente que ven). ${res !== latest ? '<span style="color:var(--red)">¡Dato <b>antiguo</b>! R + W ≤ N no garantiza solapamiento.</span>' : '✔ Valor al día.'}`;
    };
    el.querySelector('.rst').onclick = () => { sync(); reset(); dead = new Set(); draw(); out.innerHTML = ''; };
    el.querySelectorAll('input,select').forEach((i) => i.addEventListener('input', () => { sync(); reset(); draw(); }));
    sync(); reset(); draw();
    out.innerHTML = 'Haz clic en una réplica para tumbarla o recuperarla.';
  },

  // ---------- cuatro familias ----------
  families(el) {
    const p = pal();
    const F = ['Clave-valor', 'Documental', 'Columnar ancha', 'Grafos'];
    const kv = [['cliente:1', '{"nombre":"Ana Ruiz","ciudad":"Madrid","vip":true}'], ['pedidos:cliente:1', '[101, 103, 106]'], ['pedido:101', '{"fecha":"2025-11-03","estado":"entregado",…}'], ['carrito:sesion:8f3a', '["producto:5"]'], ['visitas:producto:5', '1543']];
    const doc = `{\n  "_id": 101,\n  "fecha": ISODate("2025-11-03"),\n  "estado": "entregado",\n  "cliente": { "id": 1, "nombre": "Ana Ruiz", "ciudad": "Madrid" },\n  "lineas": [\n    { "producto": "Teclado mecánico K70", "cantidad": 1, "precio": 89.90 },\n    { "producto": "Ratón ergonómico M50", "cantidad": 2, "precio": 29.90 }\n  ]\n}`;
    const info = { 'Clave-valor': ['Redis, DynamoDB, Valkey', 'Cachés, sesiones, contadores, colas ligeras', 'Un diccionario: el valor es opaco, solo se accede por clave.'],
      Documental: ['MongoDB, Couchbase, Firestore', 'Catálogos, perfiles, contenidos', 'Documentos JSON/BSON anidados, consultables por cualquier campo.'],
      'Columnar ancha': ['Cassandra, ScyllaDB, HBase, Bigtable', 'Escrituras masivas, eventos, IoT', 'Filas agrupadas por clave de partición, columnas variables y ordenadas. ≠ almacenes columnares analíticos (Bloque V).'],
      Grafos: ['Neo4j, Neptune, Memgraph', 'Redes sociales, fraude, recomendaciones', 'Nodos y relaciones con propiedades: las relaciones son ciudadanas de primera clase.'] };
    el.innerHTML = `<div class="w-title">Ana y sus pedidos en cada familia<span class="live">INTERACTIVO</span></div><div class="w-controls">${segBtns(F, F[0], 'f')}</div>
      <div style="display:flex;gap:20px;flex:1;min-height:0"><div class="w-canvas" style="flex:1.5;overflow:auto"></div><div class="side" style="flex:1"></div></div>`;
    const cv = el.querySelector('.w-canvas'), side = el.querySelector('.side');
    const show = (f) => {
      side.innerHTML = `<div class="card hl"><h4>${f}</h4><p>${info[f][2]}</p></div><div class="card" style="margin-top:14px"><h4>Sistemas</h4><p>${info[f][0]}</p></div><div class="card" style="margin-top:14px"><h4>Encaja con</h4><p>${info[f][1]}</p></div>`;
      if (f === 'Clave-valor') cv.innerHTML = `<table class="edit" style="width:100%"><thead><tr><th>clave</th><th>valor (opaco)</th></tr></thead><tbody>${kv.map(([k, v]) => `<tr><td style="padding:10px;font-family:var(--font-mono);font-weight:700;color:var(--blue-d)">${k}</td><td style="padding:10px;font-family:var(--font-mono);font-size:15px">${esc(v)}</td></tr>`).join('')}</tbody></table>`;
      else if (f === 'Documental') cv.innerHTML = `<pre class="code" style="font-size:17px">${esc(doc)}</pre>`;
      else if (f === 'Columnar ancha') {
        const rows = [['2026-01-15', 106, 'enviado', '279.00'], ['2025-12-01', 103, 'entregado', '88.90'], ['2025-11-03', 101, 'entregado', '149.70']];
        cv.innerHTML = `<div style="border:3px solid ${p.blue};border-radius:16px;padding:14px"><div style="font-family:Karla;font-weight:700;font-size:19px;margin-bottom:8px">Partición <span class="tag">cliente_id = 1</span> → vive en los nodos 2, 3 y 4</div>
          <table class="edit" style="width:100%"><thead><tr><th>fecha ↓ (clustering)</th><th>pedido_id</th><th>estado</th><th>total</th></tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v) => `<td style="padding:9px 12px;font-family:var(--font-mono)">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
          <div style="border:2px dashed var(--line);border-radius:16px;padding:12px;margin-top:12px;color:var(--muted)">Partición cliente_id = 4 → otros nodos…</div>`;
      } else {
        cv.innerHTML = ''; const { s, W, H } = svg(cv, 700, 380);
        const N = [['Ana', 120, 190, 'Cliente'], ['K70', 440, 70, 'Producto'], ['M50', 470, 190, 'Producto'], ['Monitor 27"', 440, 310, 'Producto'], ['Iker', 640, 190, 'Cliente']];
        const E = [[0, 1, 'COMPRO'], [0, 2, 'COMPRO'], [0, 3, 'COMPRO'], [4, 2, 'COMPRO'], [0, 4, 'RECOMIENDA_A']];
        E.forEach(([a, b, t]) => { const A = N[a], B = N[b]; s.append('line').attr('x1', A[1]).attr('y1', A[2]).attr('x2', B[1]).attr('y2', B[2]).attr('stroke', t === 'COMPRO' ? p.blue : p.amber).attr('stroke-width', 3); s.append('text').text(t).attr('x', (A[1] + B[1]) / 2).attr('y', (A[2] + B[2]) / 2 - 6).attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', p.muted); });
        N.forEach(([n, x, y, l]) => { s.append('circle').attr('cx', x).attr('cy', y).attr('r', 42).attr('fill', l === 'Cliente' ? p.blue : p.gray); s.append('text').text(n).attr('x', x).attr('y', y + 6).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-weight', 700).attr('font-size', 15); });
      }
    };
    bindSeg(el, 'f', show); show(F[0]);
  },

  // ---------- schema on write / read ----------
  schemaread(el) {
    const recs = [{ nombre: 'Ana', email: 'ana@mail.com', edad: 34 }, { nombre: 'Luis', email: 'luis@mail', edad: '41' }, { nombre: 'Marta', edad: 28 }, { name: 'Iker', email: 'iker@mail.com', edad: 39 }, { nombre: 'Sofía', email: 'sofia@mail.com', edad: 31, tiktok: '@sofi' }];
    const valid = (r) => r.nombre && r.email && /@.+\./.test(r.email) && typeof r.edad === 'number';
    let mode = 'Schema-on-write';
    el.innerHTML = `<div class="w-title">Ingesta de 5 registros de clientes<span class="live">INTERACTIVO</span></div><div class="w-controls">${segBtns(['Schema-on-write', 'Schema-on-read'], mode, 'm')}<button class="btn primary q">Consultar: media de edad y emails</button></div>
      <div class="w-canvas" style="display:flex;gap:18px"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const show = () => {
      cv.innerHTML = `<div style="flex:1;display:flex;flex-direction:column;gap:8px">${recs.map((r) => { const ok = valid(r); const rej = mode === 'Schema-on-write' && !ok;
        return `<pre class="code" style="font-size:14px;padding:8px 12px;white-space:pre-wrap;word-break:break-all;${rej ? 'border-left-color:var(--red);background:var(--tint-red);text-decoration:line-through;opacity:.7' : ''}">${esc(JSON.stringify(r))}</pre>`; }).join('')}</div>
        <div style="flex:0 0 240px" class="card ${mode === 'Schema-on-write' ? 'hl' : ''}"><h4>${mode === 'Schema-on-write' ? 'Tabla con esquema' : 'Data lake / colección libre'}</h4><p>${mode === 'Schema-on-write' ? `Aceptados: <b>${recs.filter(valid).length}</b> · rechazados al escribir: <b style="color:var(--red)">${recs.filter((r) => !valid(r)).length}</b>` : `Guardados <b>los ${recs.length}</b> tal cual llegaron. Ingesta rápida y flexible.`}</p></div>`;
      out.innerHTML = '';
    };
    el.querySelector('.q').onclick = () => {
      const data = mode === 'Schema-on-write' ? recs.filter(valid) : recs;
      const edades = data.map((r) => r.edad).filter((x) => x !== undefined);
      const media = edades.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) / edades.length;
      out.innerHTML = mode === 'Schema-on-write' ? `✔ Media de edad = <b>${media.toFixed(1)}</b> · ${data.length} emails válidos. Los datos dentro son siempre limpios.` : `<span style="color:var(--red)">⚠ La consulta tiene que lidiar con «41» como texto, un email sin dominio, un cliente sin email, un campo <code>name</code> en vez de <code>nombre</code>… El problema se traslada a <b>quien lee</b>.</span>`;
    };
    bindSeg(el, 'm', (m) => { mode = m; show(); }); show();
  },

  // ---------- modelado orientado a consultas ----------
  queryfirst(el) {
    const Q = [['q1', 'Pedidos de un cliente, del más reciente al más antiguo', 'pedidos_por_cliente', '(cliente_id) · fecha DESC'], ['q2', 'Pedidos de un día en un estado', 'pedidos_por_dia_estado', '((fecha, estado)) · pedido_id'],
      ['q3', 'Productos de una categoría por precio', 'productos_por_categoria', '(categoria) · precio ASC'], ['q4', 'Ranking de productos más vendidos', 'ranking_ventas (sorted set)', 'una clave · puntuación'], ['q5', 'Perfil de un cliente por email', 'cliente_por_email', '(email)']];
    let on = new Set(['q1', 'q3']);
    el.innerHTML = `<div class="w-title">¿Qué preguntas hará la aplicación?<span class="live">INTERACTIVO</span></div>
      <div class="w-controls" style="flex-direction:column;align-items:flex-start">${Q.map(([k, t]) => `<label style="font-size:18px;color:var(--ink)"><input type="checkbox" value="${k}" ${on.has(k) ? 'checked' : ''}> ${t}</label>`).join('')}</div>
      <div class="w-canvas" style="display:grid;grid-template-columns:1fr 1fr;gap:18px"></div>`;
    const cv = el.querySelector('.w-canvas');
    const show = () => {
      cv.innerHTML = `<div class="card"><h4>Relacional (modelo la realidad)</h4><p style="font-family:var(--font-mono);font-size:16px;color:var(--ink)">cliente · pedido · linea_pedido · producto · categoria</p><p style="margin-top:8px">Las mismas 5 tablas sirvan las preguntas que sirvan: los <b>joins</b> responden a casi todo.</p></div>
        <div class="card hl"><h4>NoSQL (modelo las consultas)</h4>${Q.filter(([k]) => on.has(k)).map(([, , t, key]) => `<p style="font-family:var(--font-mono);font-size:16px;color:var(--ink);margin-top:6px">▸ <b>${t}</b> <span style="color:var(--muted)">${key}</span></p>`).join('') || '<p>Marca alguna consulta.</p>'}<p style="margin-top:10px">${on.size} estructura(s): una por pregunta, con datos <b>duplicados</b> entre ellas.</p></div>`;
    };
    el.querySelector('.w-controls').onchange = (e) => { e.target.checked ? on.add(e.target.value) : on.delete(e.target.value); show(); };
    show();
  },

  // ---------- emulador de Redis ----------
  redis(el) {
    const p = pal();
    const db = new Map(); const exp = new Map();
    const alive = (k) => { if (exp.has(k) && Date.now() > exp.get(k)) { db.delete(k); exp.delete(k); } return db.has(k); };
    const T = (k) => (alive(k) ? db.get(k).t : 'none');
    const q = (s) => `"${s}"`;
    const cmd = (line) => {
      const a = line.match(/"[^"]*"|\S+/g)?.map((x) => x.replace(/^"|"$/g, '')) || []; const c = (a[0] || '').toUpperCase(), k = a[1];
      const need = (t) => { if (alive(k) && db.get(k).t !== t) throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value'); };
      switch (c) {
        case 'SET': { db.set(k, { t: 'string', v: a[2] }); exp.delete(k); const ex = a.findIndex((x) => x.toUpperCase() === 'EX'); if (ex > 0) exp.set(k, Date.now() + +a[ex + 1] * 1000); return 'OK'; }
        case 'GET': need('string'); return alive(k) ? q(db.get(k).v) : '(nil)';
        case 'INCR': case 'INCRBY': { need('string'); const v = (alive(k) ? +db.get(k).v : 0) + (c === 'INCR' ? 1 : +a[2]); db.set(k, { t: 'string', v: String(v) }); return `(integer) ${v}`; }
        case 'DEL': { const n = a.slice(1).filter((x) => alive(x) && db.delete(x)).length; return `(integer) ${n}`; }
        case 'EXISTS': return `(integer) ${alive(k) ? 1 : 0}`;
        case 'TYPE': return T(k);
        case 'KEYS': { const re = new RegExp('^' + (k || '*').replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'); const ks = [...db.keys()].filter((x) => alive(x) && re.test(x)); return ks.length ? ks.map((x, i) => `${i + 1}) ${q(x)}`).join('\n') : '(empty array)'; }
        case 'EXPIRE': if (!alive(k)) return '(integer) 0'; exp.set(k, Date.now() + +a[2] * 1000); return '(integer) 1';
        case 'TTL': if (!alive(k)) return '(integer) -2'; return exp.has(k) ? `(integer) ${Math.ceil((exp.get(k) - Date.now()) / 1000)}` : '(integer) -1';
        case 'PERSIST': return `(integer) ${exp.delete(k) ? 1 : 0}`;
        case 'HSET': { need('hash'); if (!alive(k)) db.set(k, { t: 'hash', v: new Map() }); let n = 0; for (let i = 2; i < a.length; i += 2) { if (!db.get(k).v.has(a[i])) n++; db.get(k).v.set(a[i], a[i + 1]); } return `(integer) ${n}`; }
        case 'HGET': need('hash'); return alive(k) && db.get(k).v.has(a[2]) ? q(db.get(k).v.get(a[2])) : '(nil)';
        case 'HGETALL': need('hash'); return alive(k) ? [...db.get(k).v].flat().map((x, i) => `${i + 1}) ${q(x)}`).join('\n') : '(empty array)';
        case 'LPUSH': case 'RPUSH': { need('list'); if (!alive(k)) db.set(k, { t: 'list', v: [] }); const l = db.get(k).v; a.slice(2).forEach((x) => (c === 'LPUSH' ? l.unshift(x) : l.push(x))); return `(integer) ${l.length}`; }
        case 'LRANGE': { need('list'); if (!alive(k)) return '(empty array)'; const l = db.get(k).v; let s = +a[2], e = +a[3]; if (e < 0) e = l.length + e; return l.slice(s, e + 1).map((x, i) => `${i + 1}) ${q(x)}`).join('\n') || '(empty array)'; }
        case 'LPOP': { need('list'); if (!alive(k)) return '(nil)'; return q(db.get(k).v.shift()); }
        case 'SADD': { need('set'); if (!alive(k)) db.set(k, { t: 'set', v: new Set() }); const s = db.get(k).v; const n = a.slice(2).filter((x) => !s.has(x) && s.add(x)).length; return `(integer) ${n}`; }
        case 'SMEMBERS': need('set'); return alive(k) ? [...db.get(k).v].map((x, i) => `${i + 1}) ${q(x)}`).join('\n') : '(empty array)';
        case 'SISMEMBER': need('set'); return `(integer) ${alive(k) && db.get(k).v.has(a[2]) ? 1 : 0}`;
        case 'ZADD': { need('zset'); if (!alive(k)) db.set(k, { t: 'zset', v: new Map() }); let n = 0; for (let i = 2; i < a.length; i += 2) { if (!db.get(k).v.has(a[i + 1])) n++; db.get(k).v.set(a[i + 1], +a[i]); } return `(integer) ${n}`; }
        case 'ZINCRBY': { need('zset'); if (!alive(k)) db.set(k, { t: 'zset', v: new Map() }); const z = db.get(k).v; z.set(a[3], (z.get(a[3]) || 0) + +a[2]); return q(z.get(a[3])); }
        case 'ZRANGE': { need('zset'); if (!alive(k)) return '(empty array)'; const rev = a.some((x) => x.toUpperCase() === 'REV'), ws = a.some((x) => x.toUpperCase() === 'WITHSCORES');
          let arr = [...db.get(k).v].sort((x, y) => x[1] - y[1] || x[0].localeCompare(y[0])); if (rev) arr.reverse(); let e = +a[3]; if (e < 0) e = arr.length + e; arr = arr.slice(+a[2], e + 1);
          return arr.flatMap(([m, s]) => (ws ? [m, String(s)] : [m])).map((x, i) => `${i + 1}) ${q(x)}`).join('\n'); }
        case 'FLUSHALL': db.clear(); exp.clear(); return 'OK';
        case 'PING': return 'PONG';
        default: throw new Error(`ERR unknown command '${a[0] || ''}' (emulador: SET GET INCR INCRBY DEL EXISTS TYPE KEYS EXPIRE TTL PERSIST HSET HGET HGETALL LPUSH RPUSH LRANGE LPOP SADD SMEMBERS SISMEMBER ZADD ZINCRBY ZRANGE FLUSHALL)`);
      }
    };
    const presets = [['String + TTL', 'SET sesion:8f3a "usuario=ana" EX 1800\nGET sesion:8f3a\nTTL sesion:8f3a'], ['Contador', 'INCR visitas:producto:5\nINCRBY visitas:producto:5 10'], ['Hash', 'HSET cliente:1 nombre "Ana Ruiz" ciudad "Madrid" vip 1\nHGET cliente:1 ciudad\nHGETALL cliente:1'],
      ['List', 'LPUSH ultimos:ana "producto:5" "producto:1" "producto:3"\nLRANGE ultimos:ana 0 1'], ['Set', 'SADD etiquetas:producto:1 gaming mecanico rgb\nSISMEMBER etiquetas:producto:1 rgb'], ['Ranking', 'ZADD ranking:ventas 4 "raton-m50" 3 "teclado-tk60" 2 "monitor-27"\nZINCRBY ranking:ventas 2 "monitor-27"\nZRANGE ranking:ventas 0 2 REV WITHSCORES'], ['Caduca en 10 s', 'SET oferta:flash "20%" EX 10\nTTL oferta:flash']];
    el.innerHTML = `<div class="w-title">redis-cli (emulador)<span class="live">INTERACTIVO</span></div>
      <div class="w-controls">${presets.map((x, i) => `<button class="btn" data-i="${i}">${x[0]}</button>`).join('')}</div>
      <div style="display:flex;gap:16px;flex:1;min-height:0"><div style="flex:1.3;display:flex;flex-direction:column;min-height:0;background:#1D2226;border-radius:14px;padding:12px">
        <pre class="term" style="flex:1;overflow:auto;margin:0;color:#E7EBEE;font-family:var(--font-mono);font-size:16px;white-space:pre-wrap"></pre>
        <div style="display:flex;gap:8px;align-items:center"><span style="color:#7ACFEE;font-family:var(--font-mono)">127.0.0.1:6379&gt;</span><input class="in" type="text" spellcheck="false" style="flex:1;background:transparent;border:0;color:#fff;font-family:var(--font-mono);font-size:16px;outline:none" placeholder="escribe un comando y pulsa Enter"></div></div>
        <div class="ks" style="flex:1;overflow:auto"></div></div>`;
    const term = el.querySelector('.term'), inp = el.querySelector('.in'), ks = el.querySelector('.ks');
    const exec = (line) => { if (!line.trim()) return; let r; try { r = cmd(line.trim()); } catch (e) { r = '(error) ' + e.message; } term.textContent += `127.0.0.1:6379> ${line}\n${r}\n`; term.scrollTop = term.scrollHeight; showKs(); };
    const showKs = () => {
      const keys = [...db.keys()].filter(alive);
      ks.innerHTML = `<div style="font-family:Karla;font-weight:700;margin-bottom:6px">Keyspace en memoria (${keys.length})</div>` + keys.map((k) => { const e = db.get(k); const ttl = exp.has(k) ? Math.ceil((exp.get(k) - Date.now()) / 1000) : null;
        const v = e.t === 'string' ? e.v : e.t === 'hash' ? JSON.stringify(Object.fromEntries(e.v)) : e.t === 'zset' ? [...e.v].sort((a, b) => b[1] - a[1]).map(([m, s]) => `${m}:${s}`).join(', ') : JSON.stringify([...e.v]);
        return `<div class="card" style="padding:8px 12px;margin-bottom:8px"><div style="display:flex;gap:8px;align-items:center"><b class="mono" style="font-size:15px">${esc(k)}</b><span class="pill">${e.t}</span>${ttl !== null ? `<span class="pill bad">TTL ${ttl}s</span>` : ''}</div><div class="mono" style="font-size:14px;color:var(--muted);word-break:break-all">${esc(v)}</div></div>`; }).join('');
    };
    inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { exec(inp.value); inp.value = ''; } });
    el.querySelector('.w-controls').onclick = (e) => { const b = e.target.closest('[data-i]'); if (b && e.currentTarget.contains(b)) presets[+b.dataset.i][1].split('\n').forEach(exec); };
    const t = setInterval(showKs, 1000);
    presets[2][1].split('\n').forEach(exec);
    return () => clearInterval(t);
  },

  // ---------- Pub/Sub frente a Streams ----------
  pubsub(el) {
    const p = pal();
    let mode = 'Pub/Sub', subs = [{ n: 'Almacén', on: true, got: [] }, { n: 'Facturación', on: true, got: [] }, { n: 'Emails', on: false, got: [] }], stream = [], n = 110;
    el.innerHTML = `<div class="w-title">Canal «pedidos»<span class="live">INTERACTIVO</span></div><div class="w-controls">${segBtns(['Pub/Sub', 'Streams'], mode, 'm')}<button class="btn primary pub">PUBLISH pedidos "nuevo:${n + 1}"</button><button class="btn rst">↺</button></div>
      <div class="w-canvas"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const draw = () => {
      cv.innerHTML = `<div style="display:flex;gap:20px;align-items:center;height:100%"><div class="card" style="text-align:center;flex:0 0 200px"><h4>📢 Tienda</h4><p>publica pedidos</p></div><div style="font-size:40px;color:var(--blue)">→</div>
        <div class="card" style="flex:0 0 220px;text-align:center"><h4>Redis</h4><p>${mode === 'Streams' ? `stream con ${stream.length} mensaje(s) guardados` : 'no guarda nada'}</p>${mode === 'Streams' ? `<div class="mono" style="font-size:13px;margin-top:6px">${stream.map((x) => `<div>${x}</div>`).join('')}</div>` : ''}</div><div style="font-size:40px;color:var(--blue)">→</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:10px">${subs.map((s, i) => `<div class="card" style="padding:10px 14px;${s.on ? '' : 'opacity:.55;border-style:dashed'}"><div style="display:flex;align-items:center;gap:10px"><h4 style="margin:0;font-size:19px">${s.n}</h4><button class="btn" data-s="${i}" style="margin-left:auto;font-size:13px">${s.on ? 'Desconectar' : 'Conectar'}</button></div><p class="mono" style="font-size:14px">${s.got.join(' · ') || '—'}</p></div>`).join('')}</div></div>`;
      cv.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => { const s = subs[+b.dataset.s]; s.on = !s.on;
        if (s.on && mode === 'Streams') { const missing = stream.filter((m) => !s.got.includes(m)); s.got.push(...missing); out.innerHTML = missing.length ? `Con <b>XREADGROUP</b> ${s.n} recupera ${missing.length} mensaje(s) pendientes.` : ''; } draw(); }));
    };
    bindSeg(el, 'm', (m) => { mode = m; draw(); });
    el.querySelector('.pub').onclick = (e) => {
      const msg = `nuevo:${++n}`; e.target.textContent = `PUBLISH pedidos "nuevo:${n + 1}"`;
      if (mode === 'Streams') stream.push(msg);
      subs.forEach((s) => s.on && s.got.push(msg));
      const lost = subs.filter((s) => !s.on).map((s) => s.n);
      out.innerHTML = mode === 'Pub/Sub' && lost.length ? `<span style="color:var(--red)">${lost.join(', ')} no estaba conectado: <b>ha perdido el mensaje</b> para siempre.</span>` : `Mensaje ${msg} entregado.${mode === 'Streams' && lost.length ? ' Queda guardado en el stream para quien no estaba.' : ''}`;
      draw();
    };
    el.querySelector('.rst').onclick = () => { subs.forEach((s) => (s.got = [])); stream = []; draw(); out.innerHTML = ''; };
    draw();
  },

  // ---------- simulador de caché ----------
  cache(el) {
    const p = pal();
    el.innerHTML = `<div class="w-title">Cache-aside: 1.000 peticiones de 100 productos (popularidad de Zipf)<span class="live">SIMULADOR</span></div>
      <div class="w-controls"><label>TTL (s) <input type="range" min="1" max="120" value="30" class="ttl"><b class="tv"></b></label><label>Capacidad <input type="range" min="5" max="100" value="20" class="cap"><b class="cv"></b> claves</label>
      <label>Invalidación al cambiar precio <select class="inv"><option value="ttl">solo TTL</option><option value="del">DEL explícito</option></select></label><button class="btn primary run">▶ Simular</button></div>
      <div style="display:flex;gap:18px;flex:1;min-height:0"><div class="w-canvas" style="flex:1.4"></div><div class="kp" style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:12px;align-content:start"></div></div><div class="w-out"></div>`;
    const c = chart(el.querySelector('.w-canvas'), { type: 'line', data: { labels: [], datasets: [{ label: 'hit ratio acumulado (%)', data: [], borderColor: p.blue, borderWidth: 3, pointRadius: 0, yAxisID: 'y' }, { label: 'consultas a la BD por bloque', data: [], type: 'bar', backgroundColor: p.gray + '88', yAxisID: 'y2' }] },
      options: { scales: { y: { min: 0, max: 100, title: { display: true, text: '%' } }, y2: { position: 'right', grid: { display: false }, beginAtZero: true } }, plugins: { legend: { position: 'bottom' } } } });
    const run = () => {
      const ttl = +el.querySelector('.ttl').value, cap = +el.querySelector('.cap').value, inv = el.querySelector('.inv').value;
      el.querySelector('.tv').textContent = ttl; el.querySelector('.cv').textContent = cap;
      const zipf = d3.range(100).map((i) => 1 / (i + 1)), Z = d3.sum(zipf); let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const pick = () => { let r = rnd() * Z; for (let i = 0; i < 100; i++) { r -= zipf[i]; if (r <= 0) return i; } return 99; };
      const cache = new Map(); let hits = 0, db = 0, stale = 0; const ver = Array(100).fill(0); const hitS = [], dbS = []; let blockDb = 0;
      for (let t = 0; t < 1000; t++) {
        const now = t * 0.5; // 2 peticiones por segundo
        if (t === 412) { ver[0]++; if (inv === 'del') cache.delete(0); }
        const k = pick(); const e = cache.get(k);
        if (e && now - e.at < ttl) { hits++; if (e.v !== ver[k]) stale++; cache.delete(k); cache.set(k, e); }
        else { db++; blockDb++; if (cache.size >= cap) cache.delete(cache.keys().next().value); cache.set(k, { at: now, v: ver[k] }); }
        if ((t + 1) % 50 === 0) { hitS.push(hits / (t + 1) * 100); dbS.push(blockDb); blockDb = 0; }
      }
      c.data.labels = hitS.map((_, i) => (i + 1) * 50); c.data.datasets[0].data = hitS; c.data.datasets[1].data = dbS; c.update();
      el.querySelector('.kp').innerHTML = `<div class="card"><div class="big">${(hits / 10).toFixed(0)} %</div><p>aciertos de caché</p></div><div class="card"><div class="big">${db}</div><p>consultas a la BD (de 1.000)</p></div>
        <div class="card" style="${stale ? 'border-color:var(--red);background:var(--tint-red)' : ''}"><div class="big" style="${stale ? 'color:var(--red)' : ''}">${stale}</div><p>lecturas con precio <b>antiguo</b> tras cambiar el producto más popular (t = 412)</p></div>`;
      el.querySelector('.w-out').innerHTML = `Más TTL y más capacidad → más aciertos, pero más riesgo de servir datos viejos. ${inv === 'del' ? 'Con <b>DEL</b> explícito la siguiente lectura recarga el dato nuevo.' : 'Con solo TTL se sirve el precio viejo hasta que caduca.'}`;
    };
    el.querySelectorAll('input,select').forEach((i) => i.addEventListener('input', run));
    el.querySelector('.run').onclick = run; run();
    return () => c.destroy();
  },

  // ---------- DynamoDB single-table ----------
  dynamo(el) {
    const items = [['CLIENTE#1', 'PERFIL', 'Cliente', 'nombre: Ana Ruiz · ciudad: Madrid · vip: true', ''], ['CLIENTE#1', 'PEDIDO#2025-11-03#101', 'Pedido', 'estado: entregado · total: 149.70', 'entregado'], ['CLIENTE#1', 'PEDIDO#2025-12-01#103', 'Pedido', 'estado: entregado · total: 88.90', 'entregado'],
      ['CLIENTE#1', 'PEDIDO#2026-01-15#106', 'Pedido', 'estado: enviado · total: 279.00', 'enviado'], ['CLIENTE#2', 'PERFIL', 'Cliente', 'nombre: Luis Gil · ciudad: Sevilla', ''], ['CLIENTE#2', 'PEDIDO#2025-11-15#102', 'Pedido', 'estado: entregado · total: 289.00', 'entregado'],
      ['CLIENTE#2', 'PEDIDO#2026-02-02#108', 'Pedido', 'estado: pendiente · total: 99.80', 'pendiente'], ['CLIENTE#4', 'PERFIL', 'Cliente', 'nombre: Iker Mora · ciudad: Bilbao · vip: true', ''], ['CLIENTE#4', 'PEDIDO#2026-02-10#110', 'Pedido', 'estado: enviado · total: 382.90', 'enviado'],
      ['PRODUCTO#5', 'DATOS', 'Producto', 'nombre: Monitor 27" QHD · precio: 289.00', '']];
    el.innerHTML = `<div class="w-title">Tabla MercadoNext (single-table design)<span class="live">INTERACTIVO</span></div>
      <div class="w-controls"><span class="mono">Query(</span><label>PK = <select class="pk"><option>CLIENTE#1</option><option>CLIENTE#2</option><option>CLIENTE#4</option><option>PRODUCTO#5</option></select></label>
      <label>SK <select class="op"><option value="">(cualquiera)</option><option value="bw">begins_with</option><option value="eq">=</option></select></label><input type="text" class="sk" value="PEDIDO#2026" style="width:200px"><span class="mono">)</span>
      <label><input type="checkbox" class="gsi"> usar GSI1 (PK = estado)</label><select class="st"><option>enviado</option><option>entregado</option><option>pendiente</option></select></div>
      <div class="w-canvas" style="overflow:auto"></div><div class="w-out"></div>`;
    const cv = el.querySelector('.w-canvas'), out = el.querySelector('.w-out');
    const upd = () => {
      const g = (s) => el.querySelector(s); const gsi = g('.gsi').checked;
      let match;
      if (gsi) match = items.map((it) => it[4] === g('.st').value);
      else match = items.map(([pk, sk]) => pk === g('.pk').value && (!g('.op').value || (g('.op').value === 'bw' ? sk.startsWith(g('.sk').value) : sk === g('.sk').value)));
      const rows = gsi ? items.map((it, i) => [it, i]).filter(([it]) => it[4]).sort((a, b) => a[0][4].localeCompare(b[0][4])) : items.map((it, i) => [it, i]);
      cv.innerHTML = `<table class="edit" style="width:100%"><thead><tr><th>${gsi ? 'GSI1PK (estado)' : 'PK (partition key)'}</th><th>${gsi ? 'GSI1SK' : 'SK (sort key)'}</th><th>tipo</th><th>atributos</th></tr></thead><tbody>${rows.map(([it, i]) => `<tr>${(gsi ? [it[4], it[1], it[2], it[3]] : it.slice(0, 4)).map((v, j) => `<td style="padding:7px 12px;font-family:${j < 2 ? 'var(--font-mono)' : 'inherit'};font-size:15px;${match[i] ? 'background:var(--tint-blue);font-weight:700' : 'opacity:.55'}">${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      const n = match.filter(Boolean).length;
      out.innerHTML = gsi ? `GSI: <b>${n}</b> pedido(s) en estado «${g('.st').value}», de todos los clientes, con <b>una sola Query</b> (lectura eventual).` : `<b>${n}</b> elemento(s) en <b>una sola petición</b>. ${!g('.op').value && g('.pk').value.startsWith('CLIENTE') ? 'Perfil y todos los pedidos del cliente juntos.' : ''} Las filas de la misma PK se guardan juntas y <b>ordenadas por SK</b>.`;
    };
    el.querySelectorAll('input,select').forEach((i) => { i.addEventListener('input', upd); i.addEventListener('keydown', (e) => e.stopPropagation()); });
    upd();
  },

  rcu(el) {
    const { cv, ctl, out } = frame(el, { title: 'Calculadora de capacidad', live: true, controls: '<label>Tamaño del elemento (KB) <input type="range" min="0.5" max="40" step="0.5" value="6" class="s"><b class="sv"></b></label><label>Lecturas/s <input type="number" class="r" value="100" style="width:90px"></label><label>Escrituras/s <input type="number" class="w" value="20" style="width:90px"></label>' });
    const upd = () => {
      const s = +ctl.querySelector('.s').value, r = +ctl.querySelector('.r').value || 0, w = +ctl.querySelector('.w').value || 0; ctl.querySelector('.sv').textContent = s;
      const rc = Math.ceil(s / 4), wc = Math.ceil(s / 1);
      cv.innerHTML = `<div class="cards c2"><div class="card hl"><h4>Lectura consistente</h4><div class="big">${rc} RCU</div><p>⌈${s} / 4 KB⌉ por lectura · eventual: ${(rc / 2).toFixed(1)} RCU</p></div><div class="card hl"><h4>Escritura</h4><div class="big">${wc} WCU</div><p>⌈${s} / 1 KB⌉ por escritura</p></div>
        <div class="card"><h4>Aprovisionar</h4><div class="big">${rc * r}</div><p>RCU para ${r} lecturas consistentes/s</p></div><div class="card"><h4>Aprovisionar</h4><div class="big">${wc * w}</div><p>WCU para ${w} escrituras/s</p></div></div>`;
      out.innerHTML = 'Ejemplo del temario: un elemento de 6 KB consume <b>2 RCU</b> por lectura consistente (1 si es eventual) y <b>6 WCU</b> por escritura.';
    };
    ctl.addEventListener('keydown', (e) => e.stopPropagation()); ctl.oninput = upd; upd();
  }
};
