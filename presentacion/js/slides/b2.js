// Bloque II · SQL (Temas 5–9)
import { col, pts, box, w, table, cards, study, code, sql } from '../deck.js';
import * as WA from '../w/b2a.js';
import * as WB from '../w/b2b.js';

export const widgets = { ...WA.widgets, ...WB.widgets };
const my = (t) => box('gray', 'MySQL', t);

export function build(D) {
  D.bloque({ n: 'II', title: 'SQL',
    intro: 'El idioma común de los datos: lo usan administradores, ingenieros, analistas y científicos de datos, y lo entienden PostgreSQL, MySQL, Snowflake, BigQuery o Databricks. Definir la estructura, escribir datos, consultarlos desde lo más simple hasta las funciones ventana, y controlar permisos, transacciones y objetos del servidor.',
    temas: [[5, 'Introducción a SQL y DDL'], [6, 'DML I: escribir datos'], [7, 'DML II: consultar una tabla'], [8, 'DML III: consultas avanzadas'], [9, 'DCL, TCL y objetos del servidor']] });

  // ================= TEMA 5 =================
  D.tema({ n: 5, title: 'Introducción a SQL y DDL: definir la estructura', obj: [
    'Historia, estándar, dialectos y sublenguajes de SQL', 'Elegir el tipo de dato adecuado', 'Organizar objetos en bases de datos y esquemas',
    'Crear, modificar y borrar tablas con restricciones', 'DELETE vs TRUNCATE vs DROP; índices y secuencias'] });

  D.s('5.1', 'Qué es SQL: estándar, dialectos y sublenguajes', `${col(`
      ${pts(['IBM, 1974: Chamberlin y Boyce diseñan <b>SEQUEL</b> para System R. Un problema de marca lo acortó a SQL.', 'Lenguaje <b>declarativo</b>: describes <i>qué</i> quieres; el SGBD decide <i>cómo</i>.',
        'Estándar ANSI (1986) e ISO (1987): <b>ISO/IEC 9075</b>. Ningún SGBD lo implementa entero: hay <b>dialectos</b>.'])}
      ${table(['Versión', 'Novedades destacadas'], [['SQL-86 / 89 / 92', 'Núcleo, JOIN explícito, integridad'], ['SQL:1999', 'CTE recursivas, triggers, tipos'], ['SQL:2003', 'Funciones ventana, MERGE'], ['SQL:2011', 'Tablas temporales'], ['SQL:2016', 'JSON'], ['SQL:2023', 'SQL/PGQ (grafos), tipo JSON']], 'small')}`)}
    ${col(w('sublang'), 'wide')}`, { lead: 'Juego: ¿a qué sublenguaje pertenece cada sentencia? (DQL: muchos autores separan SELECT; aquí va en DML).' });

  D.s('5.1', 'Reglas de sintaxis', `${col(`${pts(['Las sentencias terminan en <b>punto y coma</b>.', 'Las palabras clave <b>no distinguen mayúsculas</b>: <code>select</code> = <code>SELECT</code>.',
      'Textos entre <b>comillas simples</b> <code>\'Madrid\'</code>; dobles solo para identificadores <code>"Mi Tabla"</code>.', 'Comentarios: <code>-- una línea</code> y <code>/* varias */</code>.'])}`)}
    ${col(sql([['Comillas', `SELECT 'Madrid' AS texto,\n       "nombre"  AS columna   -- identificador\nFROM cliente LIMIT 2;`], ['Mayúsculas', `select NOMBRE from CLIENTE where ID = 1;`], ['Error típico', `SELECT * FROM cliente WHERE ciudad = "Madrid";`]]))}`, { id: 's5.1b' });

  D.s('5.2', 'Tipos de datos', `${col(table(['Categoría', 'PostgreSQL', 'Observaciones'], [
      ['Enteros', 'smallint · integer · bigint', '2, 4 y 8 bytes'], ['Decimal exacto', 'numeric(p, s)', '<b>Obligatorio para dinero</b>'], ['Coma flotante', 'real · double precision', 'Aproximados: nunca para importes'],
      ['Texto', 'varchar(n) · text', 'Rinden igual en PostgreSQL'], ['Fecha y hora', 'date · timestamp · timestamptz', 'timestamptz guarda el instante en UTC'], ['Intervalo', 'interval', '\'3 days\''],
      ['Lógico', 'boolean', 'TRUE, FALSE o NULL'], ['Identificador', 'uuid', 'gen_random_uuid()'], ['Semiestructurado', 'json · jsonb', 'jsonb: binario e indexable']], 'small'), 'wide')}
    ${col(w('numrange'))}`, { lead: 'El tipo de cada columna es la primera restricción de integridad (la de dominio).' });

  D.s('5.2', 'Nunca guardes dinero en coma flotante', `${col(sql([['float vs numeric', `SELECT 0.1::float8 + 0.2::float8 = 0.3::float8 AS con_float,\n       0.1::numeric + 0.2::numeric = 0.3       AS con_numeric,\n       0.1::float8 + 0.2::float8               AS suma;`],
      ['Desbordar integer', `SELECT 2147483647::integer + 1;`], ['numeric(10,2)', `SELECT 99999999.99::numeric(10,2) AS cabe,\n       123.456::numeric(10,2) AS redondea;`], ['UUID', `SELECT gen_random_uuid();`]]))}
    ${col(`${box('warn', 'Atención', '<code>real</code> y <code>double precision</code> usan representación binaria: no pueden guardar exactamente 0,1.')}${my('No hay boolean real (TINYINT(1)), usa DATETIME/TIMESTAMP, no tiene uuid nativo, admite UNSIGNED y su JSON ≈ jsonb.')}`, 'narrow')}`, { id: 's5.2b' });

  D.s('5.3', 'Bases de datos y esquemas', `${col(w('searchpath'), 'wide')}${col(`${code(`CREATE SCHEMA analitica;
CREATE TABLE analitica.ventas_mes
  (mes DATE, total NUMERIC(12,2));
SET search_path TO analitica, public;
SELECT * FROM ventas_mes;  -- sin prefijo
DROP SCHEMA analitica CASCADE;`, 'sql', 'font-size:16px')}
      ${my('Base de datos y esquema son <b>sinónimos</b>. Se cambia con <code>USE mercado;</code>')}`, 'narrow')}`,
    { lead: 'Servidor (clúster) → base de datos → esquema → tabla. Los esquemas son carpetas: separan áreas y permiten repetir nombres.' });

  D.s('5.4', 'Crear tablas', `${col(sql([['CREATE TABLE', `CREATE TABLE proveedor (\n  id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  nombre    VARCHAR(100) NOT NULL,\n  cif       CHAR(9)      NOT NULL UNIQUE,\n  pais      CHAR(2)      NOT NULL DEFAULT 'ES',\n  activo    BOOLEAN      NOT NULL DEFAULT TRUE,\n  creado_en TIMESTAMPTZ  NOT NULL DEFAULT now()\n);\nINSERT INTO proveedor (nombre, cif) VALUES ('Logística Sur', 'B12345678');\nSELECT * FROM proveedor;`],
      ['CREATE TABLE AS', `CREATE TABLE clientes_madrid AS\nSELECT id, nombre, email FROM cliente WHERE ciudad = 'Madrid';\nSELECT * FROM clientes_madrid;`],
      ['¿Copió la PK?', `SELECT table_name, constraint_type\nFROM information_schema.table_constraints\nWHERE table_name IN ('cliente', 'clientes_madrid');`],
      ['LIKE INCLUDING ALL', `CREATE TABLE cliente_copia (LIKE cliente INCLUDING ALL);\nSELECT constraint_type FROM information_schema.table_constraints\nWHERE table_name = 'cliente_copia';`]], { autorun: false }), 'wide')}
    ${col(`${box('warn', 'Atención', '<code>CREATE TABLE … AS SELECT</code> copia nombres, tipos y datos, pero <b>no</b> PK, FK, CHECK ni índices.')}
      ${table(['Convención', 'Motivo'], [['snake_case', 'FechaAlta → fechaalta'], ['tabla_id para FK', 'Se lee solo'], ['Evitar user, order, group', 'Palabras reservadas'], ['≤ 63 caracteres', 'El resto se trunca']], 'small')}`, 'narrow')}`,
    { lead: 'La sentencia central del DDL. También: <code>IF NOT EXISTS</code> y tablas <code>TEMPORARY</code> que viven solo durante la sesión.' });

  D.s('5.5', 'Restricciones y acciones referenciales', `${col(w('ondelete'), 'wide')}${col(`
      ${table(['Acción', 'Al borrar el padre'], [['NO ACTION (defecto)', 'Error al final de la sentencia'], ['RESTRICT', 'Error inmediato'], ['CASCADE', 'Borra los hijos'], ['SET NULL', 'FK de los hijos a NULL'], ['SET DEFAULT', 'FK al valor por defecto']], 'small')}
      ${study('Buena práctica: nombrar las restricciones con CONSTRAINT; el nombre aparece en los errores y sirve para borrarlas.')}`, 'narrow')}`,
    { lead: '¿Qué pasa con los pedidos si se borra su cliente? Elige la acción y bórralo.' });

  D.s('5.5', 'Restricciones con nombre e identidad', `${col(sql([['Crear valoracion', `CREATE TABLE valoracion (\n  cliente_id  INTEGER NOT NULL,\n  producto_id INTEGER NOT NULL,\n  estrellas   SMALLINT NOT NULL,\n  comentario  TEXT,\n  CONSTRAINT pk_valoracion PRIMARY KEY (cliente_id, producto_id),\n  CONSTRAINT fk_val_cliente FOREIGN KEY (cliente_id)\n      REFERENCES cliente (id) ON DELETE CASCADE,\n  CONSTRAINT ck_estrellas CHECK (estrellas BETWEEN 1 AND 5)\n);`],
      ['6 estrellas', `INSERT INTO valoracion VALUES (1, 1, 6, '¡Increíble!');`], ['ALWAYS vs id manual', `INSERT INTO cliente (id, nombre, email)\nVALUES (100, 'Test', 'test@mail.com');`], ['BY DEFAULT', `INSERT INTO pedido (id, cliente_id) VALUES (200, 2)\nRETURNING *;`]], { autorun: false }))}
    ${col(`${pts(['<code>GENERATED ALWAYS AS IDENTITY</code>: el sistema siempre asigna el valor.', '<code>BY DEFAULT</code>: lo asigna salvo que se indique uno.', '<code>SERIAL</code>: forma antigua de PostgreSQL.'])}
      ${my('<code>AUTO_INCREMENT</code>. CHECK solo se aplica de verdad desde la 8.0.16.')}`, 'narrow')}`, { id: 's5.5b' });

  D.s('5.6', 'Modificar tablas con ALTER TABLE', `${col(sql([['Añadir columna', `ALTER TABLE cliente ADD COLUMN telefono VARCHAR(20);\nSELECT id, nombre, telefono FROM cliente LIMIT 3;`],
      ['Renombrar', `ALTER TABLE cliente RENAME COLUMN telefono TO movil;\nSELECT column_name FROM information_schema.columns\nWHERE table_name = 'cliente';`], ['DEFAULT', `ALTER TABLE cliente ALTER COLUMN ciudad SET DEFAULT 'Madrid';\nINSERT INTO cliente (nombre, email) VALUES ('Nuevo', 'nuevo@mail.com')\nRETURNING nombre, ciudad;`],
      ['CHECK nuevo', `ALTER TABLE cliente ADD CONSTRAINT ck_email CHECK (email LIKE '%@%');\nINSERT INTO cliente (nombre, email) VALUES ('Sin arroba', 'sinarroba.com');`],
      ['Cambio de tipo', `ALTER TABLE producto ALTER COLUMN stock TYPE BIGINT;\nSELECT column_name, data_type FROM information_schema.columns\nWHERE table_name = 'producto';`]], { autorun: false }), 'wide')}
    ${col(`${box('warn', 'Atención', 'Algunos ALTER son instantáneos y otros <b>reescriben la tabla</b> bloqueándola. Si el cambio de tipo no es automático: <code>USING codigo::integer</code>. En producción se planifican.')}`, 'narrow')}`,
    { lead: 'Las tablas evolucionan sin perder los datos.' });

  D.s('5.7', 'DELETE, TRUNCATE y DROP', `${col(w('deltrunc'), 'wide')}${col(`${table(['', 'DELETE', 'TRUNCATE', 'DROP'], [['Sublenguaje', 'DML', 'DDL', 'DDL'], ['WHERE', 'Sí', 'No', 'No'], ['Velocidad', 'Fila a fila', 'Muy rápida', 'Muy rápida'],
      ['Triggers de fila', 'Sí', 'No', 'No'], ['Reinicia identidad', 'No', 'RESTART IDENTITY', '—'], ['Deshacer (PostgreSQL)', 'Sí', 'Sí', 'Sí']], 'small')}
      ${my('TRUNCATE, DROP y casi todo el DDL hacen <b>commit implícito</b>: no se pueden deshacer.')}`, 'narrow')}`,
    { lead: 'Tres formas de «quitar datos» que no deben confundirse.' });

  D.s('5.7', 'El DDL de PostgreSQL es transaccional', `${col(sql([['DROP… y ROLLBACK', `BEGIN;\nDROP TABLE linea_pedido;\nROLLBACK;\nSELECT COUNT(*) AS lineas_siguen_ahi FROM linea_pedido;`],
      ['TRUNCATE RESTART', `CREATE TABLE carrito (id INT GENERATED ALWAYS AS IDENTITY, producto_id INT);\nINSERT INTO carrito (producto_id) VALUES (1), (2);\nTRUNCATE TABLE carrito RESTART IDENTITY;\nINSERT INTO carrito (producto_id) VALUES (3) RETURNING *;`], ['DROP CASCADE', `CREATE VIEW v_cli AS SELECT nombre FROM cliente;\nDROP TABLE cliente;   -- falla: hay dependencias`]], { autorun: false }))}
    ${col(pts(['Un <code>DROP TABLE</code> dentro de <code>BEGIN … ROLLBACK</code> se deshace.', '<code>DROP … CASCADE</code> borra también lo que depende de la tabla (vistas, FK que apuntan a ella), no las filas de otras tablas.']), 'narrow')}`, { id: 's5.7b' });

  D.s('5.8', 'Otros objetos: índices, secuencias y comentarios', `${col(sql([['Secuencia', `CREATE SEQUENCE seq_factura START WITH 1000;\nSELECT nextval('seq_factura') AS a, nextval('seq_factura') AS b;`],
      ['Huecos', `BEGIN;\nSELECT nextval('seq_factura');\nROLLBACK;\nSELECT nextval('seq_factura') AS siguiente;  -- ¡hay un hueco!`], ['Índice', `CREATE INDEX idx_pedido_cliente ON pedido (cliente_id);\nSELECT indexname FROM pg_indexes WHERE tablename = 'pedido';`],
      ['Comentario', `COMMENT ON COLUMN pedido.estado IS 'pendiente | enviado | entregado | cancelado';\nSELECT col_description('pedido'::regclass, 4);`]], { autorun: false }))}
    ${col(`${box('warn', 'Atención', 'Las secuencias <b>no garantizan números sin huecos</b>: un valor obtenido en una transacción deshecha no se reutiliza.')}${pts(['<b>Índices</b>: como el índice de un libro (Tema 10).', '<b>Secuencias</b>: generadores de números consecutivos.', '<b>COMMENT ON</b>: documenta el esquema dentro de la BD.'])}`, 'narrow')}`);

  // ================= TEMA 6 =================
  D.tema({ n: 6, title: 'DML I: escribir datos', obj: ['Insertar filas una a una, en bloque y desde consultas', 'Modificar y borrar con UPDATE y DELETE de forma segura',
    '(+) Actualizar usando otras tablas; upsert y MERGE', 'Cargar y exportar CSV con COPY y \\copy', 'Los hábitos que evitan los errores más caros'] });

  D.s('6.1', 'INSERT INTO … VALUES', `${col(sql([['Una fila', `INSERT INTO cliente (nombre, email, ciudad)\nVALUES ('Raquel Soto', 'raquel.soto@mail.com', 'Zaragoza');\nSELECT * FROM cliente ORDER BY id DESC LIMIT 3;`],
      ['Varias filas', `INSERT INTO categoria (nombre, padre_id) VALUES\n  ('Portátiles', 1),\n  ('Auriculares', 2),\n  ('Jardín', 6);\nSELECT * FROM categoria;`], ['Sin lista de columnas', `INSERT INTO cliente VALUES ('Sin columnas', 'x@mail.com');`]], { autorun: false }))}
    ${col(`${pts(['Las columnas no mencionadas reciben su <code>DEFAULT</code> o <code>NULL</code>.', 'Varias filas en una sola sentencia: mucho más eficiente.'])}${box('warn', 'Atención', 'Escribe <b>siempre</b> la lista de columnas: sin ella dependes del orden físico de la tabla.')}`, 'narrow')}`);

  D.s('6.2', 'INSERT … SELECT y RETURNING', `${col(sql([['INSERT … SELECT', `CREATE TABLE cliente_vip_historico (cliente_id INT, nombre TEXT, fecha DATE);\nINSERT INTO cliente_vip_historico (cliente_id, nombre, fecha)\nSELECT id, nombre, CURRENT_DATE FROM cliente WHERE vip;\nSELECT * FROM cliente_vip_historico;`],
      ['RETURNING', `INSERT INTO cliente (nombre, email, ciudad)\nVALUES ('Raquel Soto', 'raquel.soto2@mail.com', 'Zaragoza')\nRETURNING id, nombre, vip, fecha_alta;`]], { autorun: false }))}
    ${col(`${pts(['Un INSERT puede recibir el resultado de una consulta: copiar o transformar datos entre tablas.', '<code>RETURNING</code> devuelve las filas tal como han quedado, con los valores generados. Funciona en UPDATE y DELETE.'])}${my('No admite RETURNING; se usa <code>LAST_INSERT_ID()</code>.')}`, 'narrow')}`);

  D.s('6.3', 'UPDATE … SET … WHERE', `${col(sql([['Rebaja del 10 %', `UPDATE producto\nSET precio = round(precio * 0.90, 2)\nWHERE categoria_id = 3\nRETURNING id, nombre, precio;`],
      ['Varias columnas', `UPDATE pedido\nSET estado = 'entregado',\n    fecha  = fecha + 1\nWHERE id = 110\nRETURNING *;`], ['💥 Sin WHERE', `UPDATE producto SET precio = 0;\nSELECT nombre, precio FROM producto;`]], { autorun: false }))}
    ${col(`${box('warn', 'El UPDATE sin WHERE', 'Afecta a <b>todas las filas</b> sin pedir confirmación. Probablemente el error más famoso y más caro de SQL. Pruébalo y luego pulsa «Reiniciar BD».')}`, 'narrow')}`);

  D.s('6.4', 'DELETE … WHERE', `${col(sql([['Borrar cancelados', `DELETE FROM pedido WHERE estado = 'cancelado' RETURNING *;`], ['¿Y sus líneas?', `SELECT * FROM linea_pedido WHERE pedido_id = 107;  -- CASCADE`],
      ['Cliente con pedidos', `DELETE FROM cliente WHERE id = 1;  -- RESTRICT`]], { autorun: false }))}
    ${col(`${pts(['<code>linea_pedido</code> → <code>ON DELETE CASCADE</code>: al borrar el pedido 107 se van sus líneas.', '<code>pedido.cliente_id</code> → <code>RESTRICT</code>: no se puede borrar un cliente con pedidos.'])}
      ${box('recuerda', 'Recordamos que…', 'DELETE (DML, fila a fila, admite WHERE) ≠ TRUNCATE (DDL, vacía de golpe) ≠ DROP (elimina la tabla). Tema 5.')}`, 'narrow')}`);

  D.s('6.5', '(+) UPDATE … FROM y DELETE … USING', `${col(sql([['VIP por gasto > 300 €', `UPDATE cliente c\nSET vip = TRUE\nFROM (\n  SELECT p.cliente_id, SUM(l.cantidad * l.precio_unitario) AS gasto\n  FROM pedido p JOIN linea_pedido l ON l.pedido_id = p.id\n  WHERE p.estado <> 'cancelado'\n  GROUP BY p.cliente_id\n) g\nWHERE g.cliente_id = c.id AND g.gasto > 300\nRETURNING c.nombre, g.gasto;`],
      ['DELETE USING', `DELETE FROM linea_pedido l\nUSING pedido p\nWHERE l.pedido_id = p.id AND p.estado = 'pendiente'\nRETURNING l.*;`]], { autorun: false }))}
    ${col(`${pts(['El criterio está en <b>otra tabla</b>.', 'No es estándar: la forma estándar usa subconsultas (Tema 8).'])}${my('<code>UPDATE cliente c JOIN (…) g ON … SET …</code> y <code>DELETE l FROM … JOIN …</code>')}`, 'narrow')}`);

  D.s('6.6', '(+) Upsert: ON CONFLICT y MERGE', `${col(w('upsert'), 'wide')}${col(table(['', 'ON CONFLICT', 'MERGE'], [['Estándar', 'No', 'Sí (SQL:2003)'], ['Restricción única', 'Necesaria', 'No: cruce libre'], ['Acciones', 'Insertar, actualizar, ignorar', '+ borrar'], ['Concurrencia', 'Atómico', 'Puede fallar'], ['Uso', 'Aplicaciones', 'ETL y DW']], 'small'), 'narrow')}`,
    { lead: '«Si no existe, insértalo; si existe, actualízalo». Elige la estrategia y mira qué le pasa a cada fila.' });

  D.s('6.6', '(+) Upsert en vivo', `${col(sql([['ON CONFLICT DO UPDATE', `INSERT INTO cliente (nombre, email, ciudad)\nVALUES ('Ana Ruiz', 'ana.ruiz@mail.com', 'Toledo')\nON CONFLICT (email)\nDO UPDATE SET ciudad = EXCLUDED.ciudad\nRETURNING id, nombre, ciudad;`],
      ['DO NOTHING', `INSERT INTO cliente (nombre, email, ciudad)\nVALUES ('Ana Ruiz', 'ana.ruiz@mail.com', 'Toledo')\nON CONFLICT (email) DO NOTHING\nRETURNING *;`],
      ['MERGE', `CREATE TABLE stock_almacen (producto_id INTEGER, unidades INTEGER);\nINSERT INTO stock_almacen VALUES (1, 30), (5, 0), (9, 12);\nMERGE INTO producto p\nUSING stock_almacen s ON p.id = s.producto_id\nWHEN MATCHED AND s.unidades = 0 THEN UPDATE SET stock = 0\nWHEN MATCHED THEN UPDATE SET stock = s.unidades;\nSELECT id, nombre, stock FROM producto WHERE id IN (1, 5, 9);`]], { autorun: false }))}
    ${col(`${pts(['La pseudotabla <code>EXCLUDED</code> es la fila que se intentaba insertar.', '<code>MERGE</code>: en PostgreSQL desde la versión 15.'])}${my('<code>ON DUPLICATE KEY UPDATE</code>; no tiene MERGE. Cuidado con <code>REPLACE INTO</code>: borra y crea (cascadas).')}`, 'narrow')}`, { id: 's6.6b' });

  D.s('6.7', 'Importar y exportar: COPY y \\copy', `${col(w('csvload'), 'wide')}${col(`${table(['', 'COPY', '\\copy'], [['Lo ejecuta', 'El servidor', 'El cliente psql'], ['Fichero en', 'El servidor', 'Tu ordenador'], ['Permisos', 'Superusuario o pg_read_server_files', 'Los normales'], ['Dónde', 'Cualquier cliente SQL', 'Solo psql']], 'small')}
      ${code(`COPY producto (nombre, categoria_id, precio, stock)
FROM '/var/lib/postgresql/import/productos.csv'
WITH (FORMAT csv, HEADER true);`, 'sql', 'font-size:14px')}${study('MySQL: LOAD DATA [LOCAL] INFILE … (LOCAL lee del cliente, como \\copy).')}`, 'narrow')}`,
    { lead: 'Para millones de filas, INSERT se queda corto. Edita el CSV y cárgalo en la base de datos de verdad.' });

  D.s('6.8', 'Buenas prácticas: primero SELECT, después escribir', `${col(w('safeflow'), 'wide')}${col(pts(['<b>1.</b> SELECT con el mismo WHERE.', '<b>2.</b> Dentro de una transacción (BEGIN).', '<b>3.</b> RETURNING para ver qué cambia.', '<b>4.</b> Filtra por clave primaria.', '<b>5.</b> Comprueba el número de filas afectadas.', '<b>6.</b> Nunca pruebes en producción; copias de seguridad.']), 'narrow')}`,
    { lead: 'Las sentencias de escritura no piden confirmación. El flujo seguro, paso a paso.' });

  // ================= TEMA 7 =================
  D.tema({ n: 7, title: 'DML II: consultar una tabla', obj: ['Filtrar, ordenar y paginar con SELECT', 'Funciones de texto, números, fechas, CAST y CASE', 'Resumir con agregados, GROUP BY y HAVING',
    '(+) Subtotales con ROLLUP, CUBE y GROUPING SETS', 'El orden real de ejecución y las trampas de NULL'] });

  D.s('7.1', 'SELECT, FROM, alias y DISTINCT', `${col(sql([['Columnas', `SELECT nombre, ciudad FROM cliente;`], ['Expresiones y alias', `SELECT p.nombre,\n       p.precio,\n       p.precio * 1.21    AS precio_con_iva,\n       p.stock * p.precio AS valor_inventario\nFROM producto AS p;`], ['DISTINCT', `SELECT DISTINCT ciudad FROM cliente;`]]))}
    ${col(`${box('warn', 'Atención', '<code>SELECT *</code> es cómodo para explorar, pero en consultas guardadas lista las columnas: más claro, menos datos y no se rompe si cambian.')}`, 'narrow')}`);

  D.s('7.2', 'Filtrar con WHERE', `${col(w('wherebuilder'))}`, { lead: 'Construye el filtro con los controles: se genera el SQL y se ejecuta en vivo sobre los productos.' });

  D.s('7.2', 'Operadores de WHERE', `${col(table(['Operador', 'Ejemplo'], [['=  <>  !=', "estado <> 'cancelado'"], ['>  <  >=  <=', 'precio >= 50'], ['BETWEEN a AND b', 'precio BETWEEN 30 AND 100 (ambos incluidos)'], ['IN (…)', "ciudad IN ('Madrid', 'Sevilla')"],
      ['LIKE', "email LIKE '%@mail.com' · _ = un carácter"], ['ILIKE', "nombre ILIKE 'teclado%'"], ['IS [NOT] NULL', 'ciudad IS NULL'], ['AND OR NOT', 'stock > 0 AND precio < 50']], 'small'))}
    ${col(sql([['Paréntesis importan', `SELECT nombre, ciudad, vip FROM cliente\nWHERE (ciudad = 'Madrid' OR ciudad = 'Sevilla') AND vip;`], ['Sin paréntesis', `SELECT nombre, ciudad, vip FROM cliente\nWHERE ciudad = 'Madrid' OR ciudad = 'Sevilla' AND vip;`], ['ILIKE', `SELECT nombre FROM producto WHERE nombre ILIKE '%ratón%';`]]))}`,
    { id: 's7.2b', lead: '<code>AND</code> tiene más prioridad que <code>OR</code>. Ante la duda, paréntesis.' });

  D.s('7.3', 'Ordenar y paginar', `${col(w('paginate'), 'wide')}${col(`${pts(['Sin <code>ORDER BY</code> el orden <b>no está garantizado</b>.', 'En PostgreSQL los NULL son «mayores»: al final en ASC. <code>NULLS FIRST / LAST</code> lo cambia.', '<code>LIMIT n OFFSET m</code> o la forma estándar <code>FETCH FIRST n ROWS ONLY</code>.'])}
      ${my('Los NULL van al principio en ASC y no admite NULLS FIRST/LAST. <code>LIMIT 4, 4</code> = <code>LIMIT 4 OFFSET 4</code>.')}`, 'narrow')}`,
    { lead: 'Cambia el orden, la página y el tamaño de página: el SQL se reescribe solo.' });

  D.s('7.4', 'Funciones de texto', `${col(sql([['Texto', `SELECT UPPER(nombre)  AS mayus,\n       LENGTH(nombre) AS letras,\n       SUBSTRING(email FROM 1 FOR POSITION('@' IN email) - 1) AS usuario\nFROM cliente WHERE id <= 3;`],
      ['|| frente a CONCAT', `SELECT nombre || ' de ' || ciudad      AS con_pipes,\n       CONCAT(nombre, ' de ', ciudad) AS con_concat\nFROM cliente WHERE id IN (1, 6);`], ['TRIM y REPLACE', `SELECT TRIM('  hola  ') AS recortado,\n       REPLACE('2026-01-03', '-', '/') AS con_barras,\n       LOWER('ANA') AS minus;`]]), 'wide')}
    ${col(`${table(['Función', 'Resultado'], [["UPPER('Ana')", 'ANA'], ["LENGTH('Madrid')", '6'], ["SUBSTRING('PostgreSQL' FROM 1 FOR 8)", 'Postgres'], ["POSITION('@' IN 'ana@mail.com')", '4'], ["CONCAT('Pedido ', 101)", 'Pedido 101']], 'small')}
      ${box('warn', 'NULL y ||', 'Si un operando de <code>||</code> es NULL, todo es NULL (mira a Pablo). <code>CONCAT</code> ignora los nulos.')}${my('<code>||</code> es OR lógico: usa siempre CONCAT().')}`, 'narrow')}`);

  D.s('7.5', 'Funciones numéricas', `${col(sql([['Redondeos', `SELECT ROUND(29.95, 1), CEIL(29.1), FLOOR(29.9), ABS(-5);`], ['División entera', `SELECT 7 / 2   AS div_entera,\n       7 / 2.0 AS div_real,\n       7::numeric / 2 AS con_cast;`], ['Porcentaje roto', `SELECT COUNT(*) FILTER (WHERE vip) / COUNT(*) * 100       AS mal,\n       100.0 * COUNT(*) FILTER (WHERE vip) / COUNT(*) AS bien\nFROM cliente;`]]), 'wide')}
    ${col(`<div class="box gray"><p style="font-family:var(--font-mono);font-size:19px">⌊x⌋ = max{n ∈ ℤ : n ≤ x}<br>⌈x⌉ = min{n ∈ ℤ : n ≥ x}</p></div>${box('warn', 'La división entera', 'Dos enteros dan un <b>entero truncado</b>: <code>7 / 2 = 3</code>. Clásico al calcular porcentajes. En MySQL, 7/2 = 3.5000.')}`, 'narrow')}`);

  D.s('7.7', 'Conversión de tipos: CAST y ::', `${col(sql([['CAST y ::', `SELECT nombre,\n       precio::int                    AS entero,   -- redondea\n       CAST(stock AS text) || ' uds.' AS texto\nFROM producto WHERE id <= 2;`], ['Texto → fecha', `SELECT '2026-01-03'::date + 30 AS en_30_dias,\n       '42'::integer * 2 AS doble;`], ['No convertible', `SELECT 'cuarenta'::integer;`]]), 'wide')}
    ${col(pts(['Forma estándar: <code>CAST(valor AS tipo)</code>.', 'Atajo de PostgreSQL: <code>valor::tipo</code>.', 'Si el valor no es convertible, la consulta <b>falla</b>.']), 'narrow')}`);

  D.s('7.6', 'Funciones de fecha y DATE_TRUNC', `${col(w('datetrunc'), 'wide')}${col(`${table(['Función', 'Devuelve'], [['CURRENT_DATE / NOW()', 'Hoy / instante actual'], ['EXTRACT(MONTH FROM f)', 'Una parte'], ['DATE_TRUNC(\'month\', f)', 'Inicio de la unidad'], ['AGE(f1, f2)', 'Intervalo «humano»'], ['f + INTERVAL \'30 days\'', 'Suma un intervalo'], ['f1 − f2', 'Días entre fechas']], 'small')}
      ${my('Sin DATE_TRUNC ni AGE: DATE_FORMAT, DATEDIFF, TIMESTAMPDIFF.')}`, 'narrow')}`,
    { lead: 'DATE_TRUNC es la función estrella del análisis temporal: elige la unidad y mira cómo se agrupan los pedidos.' });

  D.s('7.8', 'Lógica condicional: CASE, COALESCE, NULLIF', `${col(w('casegama'), 'wide')}${col(`${pts(['<code>CASE</code> evalúa en orden y devuelve la primera condición verdadera; si ninguna, el ELSE (o NULL).', '<code>COALESCE(a, b, …)</code>: el primer no nulo.', '<code>NULLIF(a, b)</code>: NULL si a = b. Evita dividir por cero.'])}
      ${code(`SELECT precio / NULLIF(stock, 0)
FROM producto WHERE id = 9;  -- NULL, no error`, 'sql', 'font-size:15px')}`, 'narrow')}`,
    { lead: 'Mueve los umbrales de las gamas: el CASE se reescribe y se ejecuta en vivo.' });

  D.s('7.9', 'Agregados: COUNT, SUM, AVG, MIN, MAX', `${col(sql([['Resumen', `SELECT ROUND(AVG(precio), 2) AS media,\n       MIN(precio), MAX(precio),\n       SUM(stock) AS unidades\nFROM producto;`], ['Tres COUNT', `SELECT COUNT(*)               AS clientes,\n       COUNT(ciudad)          AS con_ciudad,\n       COUNT(DISTINCT ciudad) AS ciudades\nFROM cliente;`],
      ['STRING_AGG', `SELECT STRING_AGG(nombre, ', ' ORDER BY nombre) AS todos\nFROM cliente;`]]))}
    ${col(`${box('', 'Clave', 'Todas las funciones de agregado, salvo <code>COUNT(*)</code>, <b>ignoran los NULL</b>. <code>AVG</code> divide entre los valores no nulos.')}<div class="box gray" style="text-align:center"><p style="font-family:var(--font-mono)">x̄ = (1/n) · Σ xᵢ</p></div>${my('<code>GROUP_CONCAT(nombre ORDER BY nombre SEPARATOR \', \')</code>')}`, 'narrow')}`);

  D.s('7.10', 'GROUP BY y HAVING', `${col(w('groupby'))}`, { lead: 'Las filas se reparten en grupos y el agregado se calcula por grupo. HAVING filtra grupos; WHERE filtra filas antes de agrupar.' });

  D.s('7.10', 'GROUP BY en vivo', `${col(sql([['Clientes por ciudad', `SELECT COALESCE(ciudad, 'Sin ciudad')           AS ciudad,\n       COUNT(*)                                 AS clientes,\n       STRING_AGG(nombre, ', ' ORDER BY nombre) AS nombres\nFROM cliente\nGROUP BY ciudad\nORDER BY clientes DESC, ciudad;`],
      ['HAVING', `SELECT estado, COUNT(*) AS pedidos\nFROM pedido\nGROUP BY estado\nHAVING COUNT(*) >= 2\nORDER BY pedidos DESC;`], ['Error clásico', `SELECT ciudad, nombre, COUNT(*)\nFROM cliente\nGROUP BY ciudad;`], ['Facturación por ciudad', `SELECT c.ciudad, SUM(l.cantidad * l.precio_unitario) AS facturacion\nFROM pedido p\nJOIN cliente c ON c.id = p.cliente_id\nJOIN linea_pedido l ON l.pedido_id = p.id\nWHERE p.estado <> 'cancelado'\nGROUP BY c.ciudad ORDER BY facturacion DESC;`]]))}
    ${col(box('', 'Regla de oro', 'Toda columna del SELECT que no esté dentro de un agregado <b>debe aparecer en el GROUP BY</b>.'), 'narrow')}`, { id: 's7.10b' });

  D.s('7.11', '(+) ROLLUP, CUBE y GROUPING SETS', `${col(sql([['ROLLUP', `SELECT CASE WHEN GROUPING(c.ciudad) = 1 THEN 'TOTAL'   ELSE c.ciudad END AS ciudad,\n       CASE WHEN GROUPING(p.estado) = 1 THEN '(todos)' ELSE p.estado END AS estado,\n       COUNT(*) AS pedidos\nFROM pedido p JOIN cliente c ON c.id = p.cliente_id\nWHERE c.ciudad IN ('Madrid', 'Sevilla')\nGROUP BY ROLLUP (c.ciudad, p.estado)\nORDER BY GROUPING(c.ciudad), c.ciudad, GROUPING(p.estado), p.estado;`],
      ['CUBE', `SELECT c.ciudad, p.estado, COUNT(*) AS pedidos\nFROM pedido p JOIN cliente c ON c.id = p.cliente_id\nWHERE c.ciudad IN ('Madrid', 'Sevilla')\nGROUP BY CUBE (c.ciudad, p.estado)\nORDER BY 1, 2;`], ['GROUPING SETS', `SELECT c.ciudad, p.estado, COUNT(*) AS pedidos\nFROM pedido p JOIN cliente c ON c.id = p.cliente_id\nGROUP BY GROUPING SETS ((c.ciudad), (p.estado), ())\nORDER BY 1, 2;`]]), 'wide')}
    ${col(`${pts(['<code>ROLLUP (a, b)</code>: (a,b), (a), () → <b>n + 1</b> agrupaciones.', '<code>CUBE (a, b)</code>: todas las combinaciones → <b>2ⁿ</b>.', '<code>GROUPING SETS</code>: exactamente las que indiques.', '<code>GROUPING(col)</code> = 1 en las filas de subtotal.'])}`, 'narrow')}`,
    { lead: 'Subtotales y total general en la misma consulta, como una tabla dinámica de Excel.' });

  D.s('7.12', 'Orden de ejecución de un SELECT', `${col(w('execorder'))}`,
    { lead: 'Se escribe empezando por SELECT, pero se evalúa en otro orden. Avanza paso a paso y mira la tabla intermedia (calculada en vivo).' });

  D.s('7.12', 'Las trampas de NULL: lógica de tres valores', `${col(`${w('logic3')}${box('warn', 'Cinco trampas', '<code>= NULL</code> nunca funciona (usa IS NULL) · <code>&lt;&gt;</code> excluye los nulos · los agregados los ignoran · <code>NOT IN</code> con un NULL no devuelve nada · operar con NULL da NULL (COALESCE).')}`)}
    ${col(sql([['= NULL', `SELECT nombre FROM cliente WHERE ciudad = NULL;`], ['IS NULL', `SELECT nombre FROM cliente WHERE ciudad IS NULL;`], ['<> pierde a Pablo', `SELECT COUNT(*) FROM cliente WHERE ciudad <> 'Madrid';`],
      ['IS DISTINCT FROM', `SELECT COUNT(*) FROM cliente\nWHERE ciudad IS DISTINCT FROM 'Madrid';`], ['NULL = NULL', `SELECT NULL = NULL AS igual,\n       NULL IS NULL AS es_nulo,\n       NULL IS DISTINCT FROM NULL AS distinto;`]]), 'wide')}`,
    { id: 's7.12b', lead: 'WHERE solo deja pasar las filas cuya condición es <b>verdadera</b>; «desconocido» no pasa.' });

  // ================= TEMA 8 =================
  D.tema({ n: 8, title: 'DML III: consultas avanzadas', obj: ['Combinar tablas con todos los tipos de JOIN', 'Subconsultas escalares, de lista y correlacionadas; EXISTS, ANY, ALL', 'UNION, INTERSECT y EXCEPT',
    'CTE y (+) WITH RECURSIVE', 'Funciones ventana: rankings, LAG/LEAD y acumulados', '(+) Pivot y consultas JSON'] });

  D.s('8.1', 'JOINs', `${col(w('joins'))}`, { lead: 'Edita las tablas y elige el tipo de join: el diagrama y el resultado cambian al momento.' });

  D.s('8.1', 'JOINs en vivo', `${col(sql([['LEFT JOIN + COUNT', `SELECT c.nombre, COUNT(p.id) AS pedidos\nFROM cliente c\nLEFT JOIN pedido p ON p.cliente_id = c.id\nGROUP BY c.id, c.nombre\nORDER BY pedidos DESC, c.nombre;`],
      ['Cadena de joins', `SELECT p.id AS pedido, c.nombre AS cliente, pr.nombre AS producto,\n       l.cantidad * l.precio_unitario AS importe\nFROM pedido p\nJOIN cliente c      ON c.id = p.cliente_id\nJOIN linea_pedido l ON l.pedido_id = p.id\nJOIN producto pr    ON pr.id = l.producto_id\nWHERE p.id = 104;`],
      ['Self-join', `SELECT e.nombre AS empleado, j.nombre AS jefe\nFROM empleado e\nLEFT JOIN empleado j ON j.id = e.jefe_id\nORDER BY e.id;`], ['Filtro en WHERE ✖', `SELECT c.nombre, p.id\nFROM cliente c\nLEFT JOIN pedido p ON p.cliente_id = c.id\nWHERE p.estado = 'entregado';`], ['Filtro en ON ✔', `SELECT c.nombre, p.id\nFROM cliente c\nLEFT JOIN pedido p ON p.cliente_id = c.id\n                  AND p.estado = 'entregado';`],
      ['USING', `SELECT pedido_id, producto_id, cantidad, fecha\nFROM linea_pedido\nJOIN pedido ON pedido.id = linea_pedido.pedido_id\nLIMIT 5;`]]), 'wide')}
    ${col(`${box('warn', 'ON o WHERE en un LEFT JOIN', 'Una condición sobre la tabla derecha en el <b>WHERE</b> elimina las filas sin pareja: lo convierte en INNER. Para conservar a todos, ponla en el <b>ON</b>.')}${pts(['<code>COUNT(p.id)</code>, no <code>COUNT(*)</code>: si no, Elena contaría 1.'])}${my('No hay FULL OUTER JOIN: LEFT JOIN UNION RIGHT JOIN.')}`, 'narrow')}`, { id: 's8.1b' });

  D.s('8.2', 'Subconsultas', `${col(sql([['Escalar', `SELECT nombre, precio\nFROM producto\nWHERE precio > (SELECT AVG(precio) FROM producto)\nORDER BY precio DESC;`], ['De lista (IN)', `SELECT nombre FROM cliente\nWHERE id IN (SELECT cliente_id FROM pedido WHERE estado = 'pendiente');`],
      ['Correlacionada', `SELECT c.nombre, p.id, p.fecha\nFROM cliente c\nJOIN pedido p ON p.cliente_id = c.id\nWHERE p.fecha = (SELECT MAX(p2.fecha)\n                 FROM pedido p2\n                 WHERE p2.cliente_id = c.id)\nORDER BY c.nombre;`], ['En el FROM', `SELECT ciudad, AVG(n) AS media_pedidos\nFROM (SELECT c.ciudad, c.id, COUNT(p.id) AS n\n      FROM cliente c LEFT JOIN pedido p ON p.cliente_id = c.id\n      GROUP BY c.ciudad, c.id) t\nGROUP BY ciudad;`]]), 'wide')}
    ${col(pts(['<b>Escalar</b>: un único valor, donde iría una constante.', '<b>De lista</b>: una columna con varios valores, con IN.', '<b>Correlacionada</b>: usa columnas de la consulta exterior; se evalúa (conceptualmente) una vez por fila.', 'En el FROM se llaman <b>tablas derivadas</b> y necesitan alias.']), 'narrow')}`,
    { lead: 'Un SELECT dentro de otra sentencia.' });

  D.s('8.3', 'EXISTS, IN, ANY y ALL', `${col(sql([['NOT EXISTS', `-- Clientes que nunca han hecho un pedido\nSELECT c.nombre\nFROM cliente c\nWHERE NOT EXISTS (SELECT 1 FROM pedido p WHERE p.cliente_id = c.id);`], ['> ALL', `-- Más caros que cualquier teclado\nSELECT nombre, precio FROM producto\nWHERE precio > ALL (SELECT precio FROM producto WHERE categoria_id = 3);`],
      ['💥 NOT IN con NULL', `SELECT nombre FROM cliente\nWHERE ciudad NOT IN ('Madrid', NULL);   -- 0 filas`], ['NOT IN + subconsulta', `-- ciudad tiene un NULL (Pablo)\nSELECT nombre FROM empleado\nWHERE departamento NOT IN (SELECT ciudad FROM cliente);`]]), 'wide')}
    ${col(`${box('warn', 'NOT IN y los NULL', '<code>x NOT IN (a, NULL)</code> ≡ <code>x &lt;&gt; a AND x &lt;&gt; NULL</code> → nunca verdadero. <b>Usa NOT EXISTS.</b>')}${pts(['<code>EXISTS</code>: ¿hay al menos una fila? (se escribe SELECT 1).', '<code>&gt; ANY</code>: mayor que alguno · <code>&gt; ALL</code>: mayor que todos.'])}`, 'narrow')}`);

  D.s('8.4', 'UNION, UNION ALL, INTERSECT, EXCEPT', `${col(w('setops'), 'wide')}${col(sql([['UNION ALL', `SELECT 'cliente' AS tipo, nombre FROM cliente WHERE ciudad = 'Sevilla'\nUNION ALL\nSELECT 'empleado', nombre FROM empleado WHERE departamento = 'Ventas'\nORDER BY tipo, nombre;`], ['EXCEPT', `-- Productos que nunca se han vendido\nSELECT id FROM producto\nEXCEPT\nSELECT producto_id FROM linea_pedido;`]]))}`,
    { lead: 'Consultas compatibles: mismo número de columnas y tipos. UNION, INTERSECT y EXCEPT eliminan duplicados; UNION ALL no (y es más rápido).' });

  D.s('8.5', 'CTE con WITH', `${col(sql([['Gasto sobre la media', `WITH gasto_cliente AS (\n  SELECT p.cliente_id, SUM(l.cantidad * l.precio_unitario) AS gasto\n  FROM pedido p\n  JOIN linea_pedido l ON l.pedido_id = p.id\n  WHERE p.estado <> 'cancelado'\n  GROUP BY p.cliente_id\n),\nmedia AS (\n  SELECT AVG(gasto) AS gasto_medio FROM gasto_cliente\n)\nSELECT c.nombre, g.gasto, ROUND(m.gasto_medio, 2) AS media\nFROM gasto_cliente g\nJOIN cliente c ON c.id = g.cliente_id\nCROSS JOIN media m\nWHERE g.gasto > m.gasto_medio\nORDER BY g.gasto DESC;`]]), 'wide')}
    ${col(`${pts(['Una consulta con nombre, definida al principio y usada como una tabla.', 'No añade potencia, pero las consultas largas se leen <b>de arriba abajo, como una receta</b>.', 'Cada CTE puede usar las anteriores.'])}`, 'narrow')}`);

  D.s('8.6', '(+) WITH RECURSIVE', `${col(w('orgchart'), 'wide')}${col(`${code(`WITH RECURSIVE jerarquia AS (
  SELECT id, nombre, jefe_id, 1 AS nivel
  FROM empleado
  WHERE jefe_id IS NULL          -- caso base
 UNION ALL
  SELECT e.id, e.nombre, e.jefe_id,
         j.nivel + 1
  FROM empleado e                -- paso recursivo
  JOIN jerarquia j ON e.jefe_id = j.id
)
SELECT * FROM jerarquia;`, 'sql', 'font-size:15px')}
      ${box('warn', 'Ciclos', 'Si A es jefe de B y B de A, no termina. PostgreSQL 14: cláusula <code>CYCLE</code>; o limitar el nivel.')}`, 'narrow')}`,
    { lead: 'Recorrer jerarquías y grafos. Pulsa «Siguiente iteración»: cada paso añade el nivel siguiente hasta que no salen filas nuevas.' });

  D.s('8.7', 'Funciones ventana: ROW_NUMBER, RANK, DENSE_RANK', `${col(w('ranking'), 'wide')}${col(`${pts(['Calculan un valor por fila a partir de su <b>ventana</b>, <b>sin agrupar</b>: se conservan todas las filas.', '<code>f() OVER (PARTITION BY … ORDER BY … marco)</code>'])}
      ${table(['Función', 'Empates'], [['ROW_NUMBER', '1, 2, 3, 4… siempre distintos'], ['RANK', '1, 2, 2, 2, 2, 6… salta'], ['DENSE_RANK', '1, 2, 2, 2, 2, 3… sin saltos']], 'small')}`, 'narrow')}`,
    { lead: 'Edita las unidades vendidas y provoca empates: así se distinguen las tres funciones de ranking.' });

  D.s('8.7', 'LAG, LEAD, acumulados y medias móviles', `${col(w('window'))}`,
    { lead: 'Ventas mensuales reales de Mercado Next. Elige la función y pasa el ratón por una fila para ver su marco (las filas que «ve»).' });

  D.s('8.7', 'Funciones ventana en vivo', `${col(sql([['LAG y acumulado', `WITH mensual AS (\n  SELECT DATE_TRUNC('month', p.fecha)::date AS mes,\n         SUM(l.cantidad * l.precio_unitario) AS ventas\n  FROM pedido p JOIN linea_pedido l ON l.pedido_id = p.id\n  WHERE p.estado <> 'cancelado'\n  GROUP BY 1\n)\nSELECT mes, ventas,\n       LAG(ventas) OVER (ORDER BY mes)          AS mes_anterior,\n       ventas - LAG(ventas) OVER (ORDER BY mes) AS variacion,\n       SUM(ventas) OVER (ORDER BY mes)          AS acumulado\nFROM mensual ORDER BY mes;`],
      ['NTILE y FIRST_VALUE', `SELECT nombre, departamento, salario,\n       ROUND(AVG(salario) OVER (PARTITION BY departamento), 0) AS media_depto,\n       NTILE(2) OVER (ORDER BY salario DESC) AS mitad,\n       FIRST_VALUE(nombre) OVER (PARTITION BY departamento\n                                 ORDER BY salario DESC) AS mejor_pagado\nFROM empleado ORDER BY departamento, salario DESC;`],
      ['Trampa LAST_VALUE', `SELECT nombre, salario,\n       LAST_VALUE(nombre) OVER (ORDER BY salario) AS ingenuo,\n       LAST_VALUE(nombre) OVER (ORDER BY salario\n         ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS correcto\nFROM empleado;`]]), 'wide')}
    ${col(`<div class="box gray"><p style="font-family:var(--font-mono);font-size:19px">Sₜ = Σᵢ₌₁ᵗ xᵢ<br>MMₜ⁽ᵏ⁾ = (1/k) Σᵢ₌ₜ₋ₖ₊₁ᵗ xᵢ</p></div>${box('warn', 'LAST_VALUE', 'Con el marco por defecto (hasta la fila actual) devuelve casi siempre la propia fila.')}`, 'narrow')}`, { id: 's8.7c' });

  D.s('8.8', '(+) Pivot con FILTER y CASE', `${col(sql([['Pivot con FILTER', `SELECT cat.nombre AS categoria,\n  SUM(l.cantidad * l.precio_unitario) FILTER (WHERE p.fecha <  '2025-12-01') AS nov_25,\n  SUM(l.cantidad * l.precio_unitario) FILTER (WHERE p.fecha >= '2025-12-01' AND p.fecha < '2026-01-01') AS dic_25,\n  SUM(l.cantidad * l.precio_unitario) FILTER (WHERE p.fecha >= '2026-01-01' AND p.fecha < '2026-02-01') AS ene_26,\n  SUM(l.cantidad * l.precio_unitario) FILTER (WHERE p.fecha >= '2026-02-01') AS feb_26\nFROM pedido p\nJOIN linea_pedido l ON l.pedido_id = p.id\nJOIN producto pr    ON pr.id = l.producto_id\nJOIN categoria cat  ON cat.id = pr.categoria_id\nWHERE p.estado <> 'cancelado'\nGROUP BY cat.nombre ORDER BY cat.nombre;`],
      ['Con CASE', `SELECT c.ciudad,\n  COUNT(CASE WHEN p.estado = 'entregado' THEN 1 END) AS entregados,\n  COUNT(CASE WHEN p.estado = 'enviado'   THEN 1 END) AS enviados,\n  COUNT(CASE WHEN p.estado = 'pendiente' THEN 1 END) AS pendientes\nFROM pedido p JOIN cliente c ON c.id = p.cliente_id\nGROUP BY c.ciudad;`]]), 'wide')}
    ${col(`${pts(['Pivotar: valores de filas → columnas, como una tabla dinámica.', 'PostgreSQL no tiene PIVOT: agregados condicionales con <code>FILTER</code> (estándar) o <code>CASE</code> (universal).'])}${my('Sin FILTER: siempre CASE. PIVOT existe en SQL Server, Oracle, Snowflake y BigQuery.')}`, 'narrow')}`);

  D.s('8.9', '(+) Consultar JSON: ->, ->>, @>', `${col(sql([['-> y ->>', `SELECT nombre,\n       atributos -> 'color'  AS color_json,\n       atributos ->> 'color' AS color_texto\nFROM producto\nWHERE atributos @> '{"inalambrico": true}';`], ['Convertir y filtrar', `SELECT nombre, (atributos ->> 'dpi')::int AS dpi\nFROM producto\nWHERE (atributos ->> 'dpi')::int > 5000;`],
      ['¿Existe la clave? (?)', `SELECT nombre, atributos FROM producto WHERE atributos ? 'pulgadas';`], ['Índice GIN', `CREATE INDEX ON producto USING gin (atributos);\nSELECT indexname FROM pg_indexes WHERE tablename = 'producto';`]]), 'wide')}
    ${col(`${table(['Op.', 'Qué hace'], [['->', 'Campo como jsonb'], ['->>', 'Campo como texto'], ['#>>', 'Ruta anidada'], ['@>', '¿Contiene el fragmento?'], ['?', '¿Existe la clave?']], 'small')}${box('', 'Clave', 'JSON para atributos <b>variables y secundarios</b>. Si se filtra o agrupa a menudo, mejor una columna normal (Bloque IV).')}`, 'narrow')}`);

  // ================= TEMA 9 =================
  D.tema({ n: 9, title: 'DCL, TCL y objetos del servidor', obj: ['Usuarios, roles y permisos justos', 'Transacciones: BEGIN, COMMIT, ROLLBACK y SAVEPOINT', 'Vistas y vistas materializadas',
    '(+) Funciones, procedimientos y triggers', '(+) Row-Level Security y SQL desde Python'] });

  D.s('9.1', 'Usuarios, roles y permisos', `${col(w('grants'), 'wide')}${col(`${pts(['En PostgreSQL <b>todo es un rol</b>. «Usuario» = rol con <code>LOGIN</code>; «grupo» = rol sin login.', 'Permisos a <b>roles de grupo</b>; usuarios dentro de los grupos.', 'Niveles: base de datos, esquema, tabla, <b>columna</b>, secuencia, función.'])}
      ${box('', 'Mínimo privilegio', 'Cada usuario y aplicación, <b>solo lo imprescindible</b>. Un panel de BI necesita SELECT, no DELETE (Tema 23).')}`, 'narrow')}`,
    { lead: 'Haz clic en las celdas para conceder o revocar (GRANT / REVOKE) y prueba qué puede hacer cada rol. (Apartados 9.1 y 9.2)' });

  D.s('9.2', 'GRANT y REVOKE', `${col(code(`-- Roles de grupo y usuarios
CREATE ROLE lectura   NOLOGIN;
CREATE ROLE escritura NOLOGIN;
CREATE USER ana WITH PASSWORD 'cambia-esto';
GRANT lectura TO ana;

GRANT CONNECT ON DATABASE mercado TO lectura;
GRANT USAGE ON SCHEMA public TO lectura;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lectura;
GRANT INSERT, UPDATE, DELETE ON pedido, linea_pedido TO escritura;

-- Por columna: el email queda oculto
REVOKE SELECT ON cliente FROM lectura;
GRANT SELECT (id, nombre, ciudad, fecha_alta) ON cliente TO lectura;

-- Para las tablas que se creen en el futuro
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO lectura;`, 'sql', 'font-size:16px'), 'wide')}
    ${col(`${pts(['<code>WITH GRANT OPTION</code>: quien lo recibe puede concederlo. Con moderación.', '<code>REVOKE … CASCADE</code> retira también lo que esa persona concedió.', 'Para borrar un rol: <code>REASSIGN OWNED</code> + <code>DROP OWNED</code> + <code>DROP ROLE</code>.'])}${my('Usuarios por nombre <b>y host</b>: <code>\'ana\'@\'%\'</code>. Roles desde la 8.0, activados con SET DEFAULT ROLE.')}`, 'narrow')}`, { id: 's9.2' });

  D.s('9.3', 'TCL: transacciones y puntos de guardado', `${col(w('txn'), 'wide')}${col(`${table(['Sentencia', 'Efecto'], [['BEGIN', 'Abre la transacción'], ['COMMIT', 'Confirma: permanente y visible'], ['ROLLBACK', 'Deshace todo desde BEGIN'], ['SAVEPOINT sp', 'Marca un punto intermedio'], ['ROLLBACK TO sp', 'Deshace solo lo posterior'], ['RELEASE sp', 'Elimina el punto']], 'small')}
      ${box('warn', 'Atención', 'Si una sentencia falla dentro de una transacción, queda <b>abortada</b>: todo devuelve error hasta ROLLBACK (o ROLLBACK TO un savepoint anterior).')}`, 'narrow')}`,
    { lead: 'Todo o nada. Ejecuta el ejemplo del temario paso a paso. Por defecto PostgreSQL va en modo <b>autocommit</b>.' });

  D.s('9.4', 'Vistas y vistas materializadas', `${col(sql([['Crear vista', `CREATE OR REPLACE VIEW v_ventas_cliente AS\nSELECT c.id, c.nombre, c.ciudad,\n       COUNT(DISTINCT p.id)                AS pedidos,\n       SUM(l.cantidad * l.precio_unitario) AS gasto\nFROM cliente c\nJOIN pedido p       ON p.cliente_id = c.id\nJOIN linea_pedido l ON l.pedido_id = p.id\nWHERE p.estado <> 'cancelado'\nGROUP BY c.id, c.nombre, c.ciudad;\nSELECT nombre, gasto FROM v_ventas_cliente ORDER BY gasto DESC LIMIT 3;`],
      ['1 · Vista materializada', `CREATE MATERIALIZED VIEW mv_ventas_mes AS\nSELECT DATE_TRUNC('month', p.fecha)::date AS mes,\n       SUM(l.cantidad * l.precio_unitario) AS ventas\nFROM pedido p JOIN linea_pedido l ON l.pedido_id = p.id\nWHERE p.estado <> 'cancelado'\nGROUP BY 1;\nSELECT * FROM mv_ventas_mes ORDER BY mes;`],
      ['2 · Venta nueva', `INSERT INTO linea_pedido VALUES (110, 4, 10, 59.90);\nSELECT * FROM mv_ventas_mes ORDER BY mes;  -- ¡congelada!`], ['3 · REFRESH', `REFRESH MATERIALIZED VIEW mv_ventas_mes;\nSELECT * FROM mv_ventas_mes ORDER BY mes;`]], { autorun: false }), 'wide')}
    ${col(`${table(['', 'Vista', 'Materializada'], [['Guarda', 'La definición', 'El resultado'], ['Datos', 'Siempre actuales', 'Del último REFRESH'], ['Lectura', 'La de la consulta', 'La de una tabla'], ['Uso', 'Simplificar, proteger', 'Informes costosos']], 'small')}
      ${box('recuerda', 'Recordamos que…', 'Desnormalizar requiere un mecanismo de coherencia (Tema 4): la vista materializada es uno.')}${my('No tiene vistas materializadas.')}`, 'narrow')}`,
    { lead: 'Prueba los pasos 1 → 2 → 3: la vista materializada no ve la venta nueva hasta que se refresca.' });

  D.s('9.5', '(+) Funciones y procedimientos', `${col(sql([['Función', `CREATE OR REPLACE FUNCTION total_pedido(p_id INTEGER)\nRETURNS NUMERIC\nLANGUAGE sql STABLE\nAS $$\n  SELECT COALESCE(SUM(cantidad * precio_unitario), 0)\n  FROM linea_pedido WHERE pedido_id = p_id;\n$$;\nSELECT id, estado, total_pedido(id) AS total\nFROM pedido WHERE cliente_id = 1;`],
      ['Procedimiento', `CREATE OR REPLACE PROCEDURE cancelar_pendientes(p_antes DATE)\nLANGUAGE plpgsql\nAS $$\nBEGIN\n  UPDATE pedido SET estado = 'cancelado'\n  WHERE estado = 'pendiente' AND fecha < p_antes;\nEND;\n$$;\nCALL cancelar_pendientes('2026-02-03');\nSELECT id, estado FROM pedido WHERE id IN (108, 109);`]], { autorun: false }), 'wide')}
    ${col(table(['', 'Función', 'Procedimiento'], [['Devuelve', 'Sí', 'No'], ['Se invoca', 'SELECT f(x)', 'CALL p(x)'], ['COMMIT dentro', 'No', 'Sí (PG 11+)'], ['Uso', 'Cálculos', 'Procesos por lotes']], 'small'), 'narrow')}`,
    { lead: 'Lógica que se ejecuta dentro del servidor, en SQL o en PL/pgSQL.' });

  D.s('9.6', '(+) Triggers', `${col(sql([['1 · Crear trigger', `CREATE OR REPLACE FUNCTION descontar_stock()\nRETURNS trigger LANGUAGE plpgsql AS $$\nBEGIN\n  UPDATE producto SET stock = stock - NEW.cantidad\n  WHERE id = NEW.producto_id;\n  RETURN NEW;\nEND;\n$$;\nCREATE TRIGGER trg_descontar_stock\nAFTER INSERT ON linea_pedido\nFOR EACH ROW EXECUTE FUNCTION descontar_stock();`],
      ['2 · Vender 1 monitor', `INSERT INTO linea_pedido VALUES (108, 5, 1, 289.00);\nSELECT id, nombre, stock FROM producto WHERE id = 5;`], ['3 · Vender 100', `INSERT INTO linea_pedido VALUES (109, 5, 100, 289.00);`]], { autorun: false }), 'wide')}
    ${col(`${pts(['<code>BEFORE</code> (validar/corregir) o <code>AFTER</code> (efectos en otras tablas).', '<code>FOR EACH ROW</code> o <code>FOR EACH STATEMENT</code>.', '<code>NEW</code> es la fila nueva; <code>OLD</code>, la anterior.', 'El trigger va en la misma transacción: si falla, se deshace todo.'])}${box('warn', 'Atención', 'Son «invisibles». Úsalos para reglas que deben cumplirse siempre y documéntalos.')}`, 'narrow')}`,
    { lead: 'Ejecuta los pasos 1 → 2 → 3: el stock baja solo, y el paso 3 viola el CHECK.' });

  D.s('9.7', '(+) Row-Level Security', `${col(w('rls'), 'wide')}${col(`${pts(['GRANT: ves la tabla o no. <b>RLS</b>: cada rol ve solo las filas que su <b>política</b> permite.', 'Sin política aplicable → <b>no ve ninguna fila</b>.', '<code>USING</code> filtra lo visible; <code>WITH CHECK</code>, lo que se puede escribir.', 'Base de las aplicaciones <b>multi-tenant</b>.'])}`, 'narrow')}`,
    { lead: 'PostgreSQL real: crea el rol y la política, y cambia de usuario para ver qué filas aparecen.' });

  D.s('9.8', '(+) SQL desde Python, ORMs y migraciones', `${col(`${code(`import psycopg
with psycopg.connect("dbname=mercado user=ana") as conn:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT nombre, precio FROM producto WHERE precio < %s",
            (50,))          # ¡siempre parámetros!
        for nombre, precio in cur.fetchall():
            print(nombre, precio)`, 'py', 'font-size:15px')}
      ${code(`df = pd.read_sql("SELECT * FROM v_ventas_cliente", engine)`, 'py', 'font-size:15px')}
      ${code(`baratos = session.scalars(
    select(Producto).where(Producto.precio < 50)).all()`, 'py', 'font-size:15px')}`)}
    ${col(`${table(['', 'Ventaja', 'Inconveniente'], [['SQL + driver', 'Control total', 'Código repetitivo'], ['pandas', 'Análisis y exploración', 'Trae todo a memoria'], ['ORM', 'Productividad', 'SQL ineficiente (N+1)']], 'small')}
      ${box('', 'Migraciones', 'Ficheros versionados con el código que aplican (y deshacen) cada cambio de esquema: Alembic, Flyway, Liquibase.')}
      ${code(`def upgrade():
    op.add_column("cliente",
        sa.Column("telefono", sa.String(20)))
def downgrade():
    op.drop_column("cliente", "telefono")`, 'py', 'font-size:14px')}`, 'narrow')}`,
    { lead: 'La mayor parte del SQL se ejecuta desde programas: notebooks, APIs y procesos ETL.' });
}
