// Comprueba los ejercicios de SQL contra PostgreSQL (PGlite) en Node:
// la solución y la alternativa deben salir correctas y el texto inicial, si es SQL ejecutable, incorrecto.
// Uso, desde presentacion/:  node tests/ejercicios.mjs
import { readFile } from 'node:fs/promises';
import { PGlite } from '../lib/pglite/index.js';
import { EJERCICIOS } from '../js/ejercicios/index.js';
import { AUX, comparar } from '../js/ejercicios.js';

const seed = await readFile(new URL('../assets/sql/mercado_next.sql', import.meta.url), 'utf8');
const base = await PGlite.create(); await base.exec(seed);
const ARR = { rowMode: 'array' };
const ultima = (res) => { const t = res.filter((r) => r.fields && r.fields.length); return t.length ? t[t.length - 1] : null; };
async function ejecutar(sql, comprobar) {
  const pg = await base.clone();
  try {
    const res = await pg.exec(sql, ARR);
    if (!comprobar) return ultima(res);
    await pg.exec(AUX); return ultima(await pg.exec(comprobar, ARR));
  } finally { await pg.close(); }
}
const mostrar = (t) => t ? [t.fields.map((f) => f.name).join(' | '), ...t.rows.map((r) => r.map((v) => v instanceof Date ? v.toISOString().slice(0, 10) : v).join(' | '))].join('\n    ') : '(sin tabla)';
// id → [[SQL erróneo, comprobación que debe fallar (o null)]]
const MALAS = {
  't5-create': [
    ["CREATE TABLE proveedor (id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, nombre VARCHAR(100), email VARCHAR(150) UNIQUE, pais VARCHAR(60) DEFAULT 'España');", 'rechaza un nombre vacío (NULL)'],
    ["CREATE TABLE proveedor (id SERIAL PRIMARY KEY, nombre VARCHAR(100) NOT NULL, email VARCHAR(150), pais VARCHAR(60) DEFAULT 'España');", 'rechaza un email repetido'],
    ['CREATE TABLE proveedor (id SERIAL PRIMARY KEY, nombre VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE, pais VARCHAR(60));', 'país si no se indica'],
    ["CREATE TABLE proveedor (id INTEGER PRIMARY KEY, nombre VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE, pais VARCHAR(60) DEFAULT 'España');", 'el id se genera solo']
  ],
  't5-alter': [['ALTER TABLE producto ADD COLUMN peso_kg NUMERIC(6,2);', 'rechaza un peso de -1']],
  't6-update': [['UPDATE producto SET precio = precio * 1.10;', null]],
  't6-delete': [["DELETE FROM pedido WHERE estado IN ('cancelado', 'pendiente');", null]],
  't7-between': [['SELECT nombre, precio FROM producto WHERE precio BETWEEN 30 AND 100;', null]],
  't8-left': [['SELECT c.nombre, COUNT(*) FROM cliente c LEFT JOIN pedido p ON p.cliente_id = c.id GROUP BY c.id, c.nombre;', null]],
  't8-not-exists': [['SELECT nombre FROM producto WHERE id NOT IN (SELECT pedido_id FROM linea_pedido);', null]],
  't10-indice': [['CREATE INDEX ON pedido (fecha, cliente_id);', null]]
};
let fallos = 0;
for (const ej of EJERCICIOS.filter((e) => e.tipo === 'sql')) {
  const esperado = await ejecutar(ej.solucion, ej.comprobar);
  const lineas = [`· ${ej.id}\n    ${mostrar(esperado)}`];
  if (ej.alt) { const c = comparar(await ejecutar(ej.alt, ej.comprobar), esperado, ej.orden); if (!c.ok) { fallos++; lineas.push('  ✘ la alternativa no coincide: ' + c.msg); } }
  if (ej.inicial && ej.inicial.replace(/--.*$/gm, '').trim()) {
    try { const c = comparar(await ejecutar(ej.inicial, ej.comprobar), esperado, ej.orden); if (c.ok) { fallos++; lineas.push('  ✘ el texto inicial ya sale correcto'); } else lineas.push('  ✔ inicial incorrecto: ' + c.msg.replace(/<[^>]+>/g, '')); }
    catch (e) { lineas.push('  ✔ inicial da error: ' + e.message); }
  }
  // errores típicos: tienen que salir incorrectos y, en las comprobaciones, fallar justo la que toca
  for (const [sql, debeFallar] of MALAS[ej.id] || []) {
    let tabla;
    try { tabla = await ejecutar(sql, ej.comprobar); } catch (e) { lineas.push('  ✔ respuesta mala da error: ' + e.message); continue; }
    const c = comparar(tabla, esperado, ej.orden);
    const fallan = tabla && tabla.rows.length === 1 && ej.comprobar ? tabla.fields.map((f, i) => [f.name, String(tabla.rows[0][i]) !== String(esperado.rows[0][i])]).filter((x) => x[1]).map((x) => x[0]) : [];
    if (c.ok) { fallos++; lineas.push('  ✘ una respuesta mala sale correcta: ' + sql.replace(/\s+/g, ' ')); }
    else if (debeFallar && fallan.join('|') !== debeFallar) { fallos++; lineas.push(`  ✘ fallan [${fallan.join(', ')}] y se esperaba [${debeFallar}]`); }
    else lineas.push(`  ✔ respuesta mala detectada${fallan.length ? ': ' + fallan.join(', ') : ''}`);
  }
  console.log(lineas.join('\n'));
}
await base.close();
console.log(fallos ? `\n${fallos} fallo(s)` : '\nTodo correcto');
process.exit(fallos ? 1 : 0);
