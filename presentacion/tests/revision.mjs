// Auditoría en Chromium. Playwright solo es necesario para esta prueba.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.BASE_URL || 'http://127.0.0.1:8765/';
const output = resolve(process.env.REVISION_OUT || 'revision-capturas');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true,
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1600, height: 1002 } });
await context.addInitScript(() => localStorage.clear());
const page = await context.newPage(), errors = [], layout = [], controls = [], sql = [], study = [];
let current = 'arranque';
page.on('pageerror', (e) => errors.push({ slide: current, type: 'pageerror', message: e.message }));
page.on('console', (m) => { if (m.type() === 'error') errors.push({ slide: current, type: 'console.error', message: m.text() }); });
const wait = (ms) => page.waitForTimeout(ms);
const go = async (i) => { await page.evaluate((n) => window.__deck.go(n), i); await wait(700); };
const key = async (k) => { await page.evaluate(() => document.activeElement?.blur()); await page.keyboard.press(k); };
const shot = async (name) => page.screenshot({ path: resolve(output, name + '.png') });
const inspect = async (slide, theme) => {
  const problems = await page.locator('.slide.active').evaluate((el) => {
    const a = [];
    if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2) a.push({ type: 'diapositiva', width: el.scrollWidth, height: el.scrollHeight, box: [el.clientWidth, el.clientHeight] });
    for (const n of el.querySelectorAll('pre.code, .t, .edit')) if (n.clientWidth && n.scrollWidth > n.clientWidth + 2) a.push({ type: 'ancho de tabla o código', text: n.textContent.slice(0, 100), width: n.scrollWidth, box: n.clientWidth });
    for (const n of el.querySelectorAll('.w-canvas canvas, .w-canvas svg')) { const r = n.getBoundingClientRect(); if (r.width < 100 || r.height < 80) a.push({ type: 'gráfico pequeño', width: r.width, height: r.height }); }
    return a;
  });
  layout.push(...problems.map((p) => ({ slide, theme, ...p })));
};
try {
  await page.goto(base); await page.waitForFunction(() => window.__deck?.S.length === 256); await page.evaluate(() => document.fonts.ready);
  const slides = await page.evaluate(() => window.__deck.S.map((s, i) => ({ i, id: s.id, sec: s.sec, tema: s.isTema })));
  // 1. Todos los controles; los errores de PostgreSQL se quedan dentro de su interfaz.
  for (const s of slides) {
    current = s.id; await go(s.i);
    for (const el of await page.locator('.slide.active .widget button, .slide.active .widget select, .slide.active .widget input[type=range], .slide.active .widget input[type=checkbox]').elementHandles()) {
      if (!(await el.evaluate((n) => n.isConnected))) continue;
      const info = await el.evaluate((n) => ({ tag: n.tagName, type: n.type, text: n.textContent.trim() }));
      if (/Reiniciar BD/.test(info.text)) continue;
      try {
        if (info.tag === 'BUTTON') await el.click({ timeout: 5000 });
        else if (info.tag === 'SELECT') { const next = await el.evaluate((n) => n.options[(n.selectedIndex + 1) % n.options.length].value); await el.selectOption(next); }
        else if (info.type === 'range') await el.evaluate((n) => { n.value = String((Number(n.min || 0) + Number(n.max || 100)) / 2); n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); });
        else await el.check();
        controls.push({ slide: s.id, ...info });
      } catch (e) { errors.push({ slide: s.id, type: 'control', control: info, message: e.message }); }
    }
    await wait(1500);
  }
  // 2. Capturas del estado inicial, sin los cambios de la interacción anterior.
  for (const s of slides) { current = s.id; await go(s.i); await inspect(s.id, 'claro'); await shot('claro-' + String(s.i + 1).padStart(3, '0') + '-' + s.id); }
  await key('T');
  const special = new Set(['portada', 's10.1', 's15.1', 's18.3', 's24.4', 's24.7', 's24.8b']);
  for (const s of slides.filter((s) => s.tema || special.has(s.id))) { current = s.id; await go(s.i); await inspect(s.id, 'oscuro'); await shot('oscuro-' + s.id); }
  await key('T');
  // Recorrido completo del agente para comprobar también el registro acumulado.
  current = 's24.7'; await go(slides.find((s) => s.id === current).i);
  for (let i = 0; i < 7; i++) { await page.locator('.slide.active .nx').click(); await page.waitForFunction(() => !document.querySelector('.slide.active .nx').disabled); }
  await shot('agente-completo');
  // 3. Resúmenes, scroll de estudio y ocultación de las notas al volver a presentar.
  await key('E');
  for (const s of slides.filter((s) => s.tema)) {
    current = s.id; await go(s.i);
    study.push(await page.locator('.slide.active').evaluate((el) => ({ slide: el.id, summary: el.querySelector('.study-note')?.textContent.includes('Resumen del tema (temario)'), overflow: getComputedStyle(el).overflowY, height: el.scrollHeight, box: el.clientHeight })));
    await shot('estudio-' + s.id);
  }
  await key('E');
  if (await page.locator('.study').evaluateAll((els) => els.some((el) => getComputedStyle(el).display !== 'none'))) errors.push({ type: 'estudio', message: 'Hay notas visibles en presentación' });
  // 4. Cada consola se vuelve a montar sobre una base nueva antes de sus presets.
  const expected = new Map(Object.entries({"s3.3": ["CHECK: precio negativo", "UNIQUE: email repetido", "NOT NULL", "FK: cliente inexistente", "FK: borrar cliente con pedidos", "Dominio: estado inválido"], "s5.1b": ["Error típico"], "s5.2b": ["Desbordar integer"], "s5.5b": ["6 estrellas", "ALWAYS vs id manual"], "s5.6": ["CHECK nuevo"], "s5.7b": ["DROP CASCADE"], "s6.1": ["Sin lista de columnas"], "s6.4": ["Cliente con pedidos"], "s7.7": ["No convertible"], "s7.10b": ["Error clásico"], "s9.6": ["3 · Vender 100"]}));
  for (const s of slides) {
    if (!(await page.evaluate((i) => window.__deck.S[i].html.includes('data-w="sql"'), s.i))) continue;
    current = s.id; await go(0); await go(s.i);
    await page.waitForFunction(() => !/Cargando|Ejecutando/.test(document.querySelector('.slide.active .sql-status').textContent), undefined, { timeout: 30000 });
    const presets = page.locator('.slide.active .presets button'), n = await presets.count();
    for (let i = 0; i < (n || 1); i++) {
      const b = n ? presets.nth(i) : page.locator('.slide.active .run'), label = n ? await b.textContent() : 'consulta inicial';
      await b.click(); await page.waitForFunction(() => !document.querySelector('.slide.active .sql-status').textContent.startsWith('Ejecutando'), undefined, { timeout: 30000 });
      const err = page.locator('.slide.active .sql-result .msg.err');
      const message = await err.count() ? await err.textContent() : null;
      sql.push({ slide: s.id, label, error: message, expected: (expected.get(s.id) || []).includes(label.trim()) });
    }
  }
  await key('I'); await shot('indice'); await key('Escape'); await key('F'); await shot('enfoque'); await key('Escape');
} catch (e) { errors.push({ slide: current, type: 'auditoría', message: e.stack }); }
finally {
  await writeFile(resolve(output, 'resultados.json'), JSON.stringify({ errors, layout, controls, study, sql, note: 'Las capturas requieren inspección visual; el detector geométrico no sustituye esa revisión.' }, null, 2));
  await browser.close();
}
console.log('Resultados y capturas en ' + output);
if (errors.length || layout.length || sql.some((r) => !!r.error !== r.expected) || study.some((r) => !r.summary || r.overflow !== 'auto')) process.exitCode = 1;
