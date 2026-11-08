// Ejercicios del bloque II · SQL (temas 5-9). Los de tipo «sql» se corrigen en PostgreSQL sobre Mercado Next.
const ESQUEMA = 'Tablas: <code>cliente</code>, <code>categoria</code>, <code>producto</code>, <code>pedido</code>, <code>linea_pedido</code> y <code>empleado</code>.';

export default [
  // ---------- Tema 5 · DDL ----------
  { id: 't5-sublenguajes', tema: 5, tipo: 'clasifica', titulo: 'Sublenguajes de SQL',
    enunciado: '¿A qué sublenguaje pertenece cada sentencia?',
    categorias: ['DDL', 'DML', 'DCL', 'TCL'],
    items: [
      ['CREATE TABLE', 0], ['UPDATE', 1], ['GRANT', 2], ['COMMIT', 3],
      ['ALTER TABLE', 0], ['SELECT', 1], ['REVOKE', 2], ['ROLLBACK', 3]
    ],
    porque: 'DDL (definición) crea y cambia la estructura; DML (manipulación) lee y escribe filas; DCL (control) concede y retira permisos, y TCL (transacciones) confirma o deshace grupos de operaciones.',
    teoria: 's5.1' },
  { id: 't5-tipos', tema: 5, tipo: 'test', titulo: 'El tipo adecuado para el dinero',
    enunciado: '¿Qué tipo de PostgreSQL usarías para la columna <code>precio</code> de un producto?',
    opciones: ['<code>numeric(10,2)</code>', '<code>double precision</code>', '<code>real</code>', '<code>varchar(10)</code>'],
    correcta: 0,
    notas: ['', 'Coma flotante binaria: 0,1 + 0,2 no da exactamente 0,3.', 'Coma flotante con aún menos precisión.', 'Como texto no se puede sumar ni comparar como número, y admite valores como «gratis».'],
    porque: '<code>numeric</code> guarda los decimales de forma exacta, que es lo que se necesita con el dinero. Los tipos de coma flotante (<code>real</code>, <code>double precision</code>) usan representación binaria y no pueden guardar exactamente valores como 0,1, así que los céntimos acaban descuadrando.',
    teoria: 's5.2' },
  { id: 't5-create', tema: 5, tipo: 'sql', titulo: 'Crear la tabla de proveedores',
    enunciado: `Crea la tabla <code>proveedor</code> con estas columnas:
      <ul><li><code>id</code>: entero generado automáticamente y clave primaria.</li>
      <li><code>nombre</code>: texto de hasta 100 caracteres, obligatorio.</li>
      <li><code>email</code>: texto de hasta 150 caracteres que no se puede repetir.</li>
      <li><code>pais</code>: texto de hasta 60 caracteres; si no se indica, vale <code>'España'</code>.</li></ul>`,
    inicial: '-- Escribe aquí tu CREATE TABLE\n',
    solucion: `CREATE TABLE proveedor (
  id     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email  VARCHAR(150) UNIQUE,
  pais   VARCHAR(60) DEFAULT 'España'
);`,
    alt: `CREATE TABLE proveedor (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email  VARCHAR(150) UNIQUE,
  pais   VARCHAR(60) DEFAULT 'España'
);`,
    // Cada prueba indica su propio id (OVERRIDING SYSTEM VALUE) para no depender de las demás.
    comprobar: `SELECT
  ej_valor($$INSERT INTO proveedor (nombre, email) VALUES ('Logitek', 'a@logitek.com') RETURNING (id IS NOT NULL)::text$$) AS "el id se genera solo",
  ej_falla($$INSERT INTO proveedor (id, nombre, email) OVERRIDING SYSTEM VALUE VALUES (9001, NULL, 'b@x.com')$$) AS "rechaza un nombre vacío (NULL)",
  ej_falla($$INSERT INTO proveedor (id, nombre, email) OVERRIDING SYSTEM VALUE VALUES (9002, 'A', 'dup@x.com'), (9003, 'B', 'dup@x.com')$$) AS "rechaza un email repetido",
  ej_valor($$INSERT INTO proveedor (id, nombre, email) OVERRIDING SYSTEM VALUE VALUES (9004, 'C', 'c@x.com') RETURNING pais$$) AS "país si no se indica",
  (SELECT count(*) FROM information_schema.table_constraints WHERE table_name = 'proveedor' AND constraint_type = 'PRIMARY KEY') AS "claves primarias"`,
    porque: '<code>GENERATED … AS IDENTITY</code> (o <code>SERIAL</code>) numera las filas solo; <code>PRIMARY KEY</code> impide repetidos y nulos; <code>NOT NULL</code> hace obligatoria una columna; <code>UNIQUE</code> impide valores repetidos (aunque admite varios NULL), y <code>DEFAULT</code> da un valor cuando el <code>INSERT</code> no lo indica. Para corregirlo se intenta insertar filas válidas e inválidas y se mira qué acepta la tabla.',
    teoria: 's5.4' },
  { id: 't5-alter', tema: 5, tipo: 'sql', titulo: 'Añadir una columna con restricción',
    enunciado: 'Añade a la tabla <code>producto</code> la columna <code>peso_kg</code>, numérica con dos decimales, que <b>no admita valores negativos</b>. Los productos que ya existen pueden quedarse sin peso.',
    inicial: '-- Escribe aquí tu ALTER TABLE\n',
    solucion: 'ALTER TABLE producto\n  ADD COLUMN peso_kg NUMERIC(6,2) CHECK (peso_kg >= 0);',
    alt: 'ALTER TABLE producto ADD COLUMN peso_kg NUMERIC(6,2);\nALTER TABLE producto ADD CONSTRAINT ck_peso CHECK (peso_kg >= 0);',
    comprobar: `SELECT
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'producto' AND column_name = 'peso_kg') AS "existe la columna peso_kg",
  ej_falla($$UPDATE producto SET peso_kg = -1 WHERE id = 1$$) AS "rechaza un peso de -1",
  NOT ej_falla($$UPDATE producto SET peso_kg = 1.25 WHERE id = 1$$) AS "acepta un peso de 1,25",
  NOT ej_falla($$INSERT INTO producto (nombre, categoria_id, precio) VALUES ('Cable USB', 2, 5)$$) AS "admite productos sin peso"`,
    porque: '<code>ALTER TABLE … ADD COLUMN</code> añade la columna a la tabla existente; las filas que ya había quedan con NULL (salvo que se indique un <code>DEFAULT</code>). Un <code>CHECK (peso_kg &gt;= 0)</code> rechaza los negativos, y como NULL no hace falso al CHECK, los productos sin peso siguen siendo válidos.',
    teoria: 's5.6' },
  { id: 't5-borrar', tema: 5, tipo: 'clasifica', titulo: 'DELETE, TRUNCATE o DROP',
    enunciado: '¿Qué sentencia usarías en cada caso?',
    categorias: ['DELETE', 'TRUNCATE', 'DROP TABLE'],
    items: [
      ['Borrar solo los pedidos cancelados', 0, 'Es la única de las tres que admite WHERE.'],
      ['Vaciar por completo una tabla de registros temporales muy grande, lo más rápido posible', 1],
      ['Eliminar la tabla proveedor, que ya no se usa, con su estructura incluida', 2],
      ['Vaciar una tabla y que se disparen los triggers de borrado de cada fila', 0, 'TRUNCATE no dispara los triggers ON DELETE de cada fila.']
    ],
    porque: '<code>DELETE</code> borra filas (todas o las del <code>WHERE</code>) una a una; <code>TRUNCATE</code> vacía la tabla entera de golpe, mucho más rápido, pero sin <code>WHERE</code> ni triggers de fila; <code>DROP TABLE</code> elimina la tabla con su estructura. En PostgreSQL las tres se pueden deshacer dentro de una transacción.',
    teoria: 's5.7' },

  // ---------- Tema 6 · DML: escribir ----------
  { id: 't6-insert', tema: 6, tipo: 'sql', titulo: 'Dar de alta a una clienta',
    enunciado: 'Da de alta a <b>Laura Pérez</b>, con email <code>laura.perez@mail.com</code>, de <b>Zaragoza</b> y con fecha de alta <b>1 de marzo de 2026</b>. No es VIP. El <code>id</code> lo genera la base de datos.',
    inicial: '-- Escribe aquí tu INSERT\n',
    solucion: `INSERT INTO cliente (nombre, email, ciudad, fecha_alta)
VALUES ('Laura Pérez', 'laura.perez@mail.com', 'Zaragoza', '2026-03-01');`,
    comprobar: `SELECT nombre, email, ciudad, fecha_alta, vip, (SELECT count(*) FROM cliente) AS "clientes en total"
FROM cliente WHERE email = 'laura.perez@mail.com'`,
    porque: 'Se nombran las columnas que se rellenan y se dan los valores en el mismo orden. El <code>id</code> no se indica porque es una columna de identidad, y <code>vip</code> toma su valor por defecto (<code>FALSE</code>). Nombrar las columnas hace que el INSERT siga funcionando aunque cambie el orden de la tabla.',
    teoria: 's6.1' },
  { id: 't6-update', tema: 6, tipo: 'sql', titulo: 'Subir precios de una categoría',
    enunciado: 'Sube un <b>10 %</b> el precio de todos los productos de la categoría <b>Ratones</b> (<code>categoria_id = 4</code>). El resto de productos no debe cambiar.',
    inicial: '-- Escribe aquí tu UPDATE\n',
    solucion: 'UPDATE producto\nSET precio = precio * 1.10\nWHERE categoria_id = 4;',
    alt: `UPDATE producto
SET precio = precio * 1.10
WHERE categoria_id = (SELECT id FROM categoria WHERE nombre = 'Ratones');`,
    comprobar: 'SELECT id, nombre, precio FROM producto ORDER BY id',
    porque: '<code>SET precio = precio * 1.10</code> calcula el nuevo valor a partir del actual en cada fila, y el <code>WHERE</code> limita el cambio a la categoría 4. Sin <code>WHERE</code>, el UPDATE cambiaría todos los productos. Buena práctica: antes de escribir, ejecuta un <code>SELECT</code> con el mismo <code>WHERE</code> para ver qué filas vas a tocar.',
    teoria: 's6.3' },
  { id: 't6-delete', tema: 6, tipo: 'sql', titulo: 'Borrar los pedidos cancelados',
    enunciado: 'Borra todos los pedidos cuyo estado sea <code>cancelado</code>. ¿Qué crees que pasará con sus líneas de pedido?',
    inicial: '-- Escribe aquí tu DELETE\n',
    solucion: "DELETE FROM pedido\nWHERE estado = 'cancelado';",
    comprobar: `SELECT (SELECT string_agg(id::text, ', ' ORDER BY id) FROM pedido) AS "pedidos que quedan",
       (SELECT count(*) FROM linea_pedido) AS "líneas que quedan",
       (SELECT count(*) FROM linea_pedido WHERE pedido_id = 107) AS "líneas del pedido 107"`,
    porque: 'El <code>WHERE</code> selecciona solo el pedido 107, el único cancelado. Sus líneas desaparecen también porque la clave foránea de <code>linea_pedido</code> se declaró con <code>ON DELETE CASCADE</code>: al borrar un pedido se borran sus líneas. Si fuera <code>RESTRICT</code>, PostgreSQL rechazaría el borrado.',
    teoria: 's6.4' },
  { id: 't6-upsert', tema: 6, tipo: 'sql', nivel: '+', titulo: 'Upsert en una línea de pedido',
    enunciado: 'Añade al pedido <b>108</b> una unidad del producto <b>2</b> a 49,90 €. Si ese producto ya está en el pedido (lo está), en lugar de dar error se debe <b>sumar</b> la cantidad a la existente. Hazlo con una sola sentencia.',
    inicial: '-- INSERT … ON CONFLICT …\n',
    solucion: `INSERT INTO linea_pedido (pedido_id, producto_id, cantidad, precio_unitario)
VALUES (108, 2, 1, 49.90)
ON CONFLICT (pedido_id, producto_id)
DO UPDATE SET cantidad = linea_pedido.cantidad + EXCLUDED.cantidad;`,
    comprobar: 'SELECT pedido_id, producto_id, cantidad, precio_unitario FROM linea_pedido WHERE pedido_id = 108 ORDER BY producto_id',
    porque: '<code>ON CONFLICT</code> captura el choque con la clave primaria (pedido_id, producto_id) y, en vez de fallar, ejecuta el <code>DO UPDATE</code>. <code>EXCLUDED</code> es la fila que se intentaba insertar, así que la cantidad pasa de 2 a 3. Es el «upsert» de PostgreSQL; la alternativa estándar es <code>MERGE</code>.',
    teoria: 's6.6' },

  // ---------- Tema 7 · Consultar una tabla ----------
  { id: 't7-where', tema: 7, tipo: 'sql', titulo: 'Clientes de Madrid',
    enunciado: `Muestra el <b>nombre</b> y el <b>email</b> de los clientes de Madrid. ${ESQUEMA}`,
    inicial: 'SELECT\nFROM cliente\nWHERE ',
    solucion: "SELECT nombre, email\nFROM cliente\nWHERE ciudad = 'Madrid';",
    porque: 'El <code>WHERE</code> se queda con las filas que cumplen la condición. Los textos van entre comillas simples (<code>\'Madrid\'</code>); las comillas dobles se reservan para nombres de columnas y tablas.',
    teoria: 's7.2' },
  { id: 't7-between', tema: 7, tipo: 'sql', titulo: 'Rango de precios, de más caro a más barato',
    enunciado: 'Muestra el <b>nombre</b> y el <b>precio</b> de los productos que cuestan <b>entre 30 y 100 €</b> (ambos incluidos), ordenados <b>de más caro a más barato</b>.',
    inicial: 'SELECT nombre, precio\nFROM producto\n',
    solucion: 'SELECT nombre, precio\nFROM producto\nWHERE precio BETWEEN 30 AND 100\nORDER BY precio DESC;',
    alt: 'SELECT nombre, precio\nFROM producto\nWHERE precio >= 30 AND precio <= 100\nORDER BY precio DESC;',
    orden: true,
    porque: '<code>BETWEEN 30 AND 100</code> incluye los dos extremos y equivale a <code>precio &gt;= 30 AND precio &lt;= 100</code>. <code>ORDER BY … DESC</code> ordena de mayor a menor; sin <code>ORDER BY</code>, SQL no garantiza ningún orden.',
    teoria: 's7.3' },
  { id: 't7-null', tema: 7, tipo: 'sql', titulo: 'Clientes sin ciudad',
    enunciado: 'Muestra el <b>nombre</b> de los clientes de los que <b>no sabemos la ciudad</b>.',
    inicial: 'SELECT nombre\nFROM cliente\nWHERE ciudad = NULL;  -- ¿por qué no devuelve nada?',
    solucion: 'SELECT nombre\nFROM cliente\nWHERE ciudad IS NULL;',
    porque: 'NULL significa «desconocido», y cualquier comparación con un desconocido da desconocido, no verdadero: <code>ciudad = NULL</code> nunca se cumple, ni siquiera para las filas con NULL. Para preguntar por los nulos hay que usar <code>IS NULL</code> (o <code>IS NOT NULL</code>).',
    teoria: 's7.12' },
  { id: 't7-limit', tema: 7, tipo: 'sql', titulo: 'Los tres con más stock',
    enunciado: 'Muestra el <b>nombre</b> y el <b>stock</b> de los <b>3 productos con más unidades</b> en almacén, de mayor a menor.',
    inicial: '',
    solucion: 'SELECT nombre, stock\nFROM producto\nORDER BY stock DESC\nLIMIT 3;',
    alt: 'SELECT nombre, stock\nFROM producto\nORDER BY stock DESC\nFETCH FIRST 3 ROWS ONLY;',
    orden: true,
    porque: 'Primero se ordena (<code>ORDER BY stock DESC</code>) y después <code>LIMIT 3</code> se queda con las tres primeras filas. <code>LIMIT</code> sin <code>ORDER BY</code> devuelve tres filas cualesquiera. La forma estándar es <code>FETCH FIRST 3 ROWS ONLY</code>.',
    teoria: 's7.3' },
  { id: 't7-fechas', tema: 7, tipo: 'sql', titulo: 'Pedidos de enero de 2026',
    enunciado: 'Muestra el <b>id</b> y la <b>fecha</b> de los pedidos hechos en <b>enero de 2026</b>.',
    inicial: '',
    solucion: "SELECT id, fecha\nFROM pedido\nWHERE fecha >= '2026-01-01' AND fecha < '2026-02-01';",
    alt: "SELECT id, fecha\nFROM pedido\nWHERE date_trunc('month', fecha) = '2026-01-01';",
    porque: 'El rango semiabierto (<code>&gt;= 1 de enero</code> y <code>&lt; 1 de febrero</code>) es la forma más segura de filtrar un mes: funciona igual con fechas que con instantes con hora, y permite usar un índice sobre <code>fecha</code>. <code>date_trunc</code> también es correcto, pero al aplicar una función a la columna impide usar ese índice.',
    teoria: 's7.6' },
  { id: 't7-count-null', tema: 7, tipo: 'sql', titulo: 'COUNT(*) frente a COUNT(columna)',
    enunciado: 'En una sola fila, muestra <b>cuántos clientes hay</b> en total y <b>cuántos tienen ciudad</b> informada.',
    inicial: 'SELECT\nFROM cliente;',
    solucion: 'SELECT COUNT(*)      AS clientes,\n       COUNT(ciudad) AS con_ciudad\nFROM cliente;',
    porque: '<code>COUNT(*)</code> cuenta filas; <code>COUNT(columna)</code> cuenta solo los valores no nulos de esa columna. Por eso dan 7 y 6: Pablo Núñez no tiene ciudad. Lo mismo ocurre con <code>SUM</code>, <code>AVG</code>, <code>MIN</code> y <code>MAX</code>: ignoran los NULL.',
    teoria: 's7.9' },
  { id: 't7-groupby', tema: 7, tipo: 'sql', titulo: 'Pedidos por estado',
    enunciado: 'Muestra <b>cuántos pedidos hay en cada estado</b> (una fila por estado, con el estado y el número de pedidos).',
    inicial: 'SELECT estado,\nFROM pedido\n',
    solucion: 'SELECT estado, COUNT(*) AS pedidos\nFROM pedido\nGROUP BY estado;',
    porque: '<code>GROUP BY estado</code> forma un grupo por cada valor distinto de estado, y <code>COUNT(*)</code> se calcula dentro de cada grupo. Toda columna del <code>SELECT</code> que no esté dentro de un agregado tiene que aparecer en el <code>GROUP BY</code>.',
    teoria: 's7.10' },
  { id: 't7-having', tema: 7, tipo: 'sql', titulo: 'Clientes con más de un pedido',
    enunciado: 'Muestra el <b>cliente_id</b> y el <b>número de pedidos</b> de los clientes que han hecho <b>más de un pedido</b>.',
    inicial: '',
    solucion: 'SELECT cliente_id, COUNT(*) AS pedidos\nFROM pedido\nGROUP BY cliente_id\nHAVING COUNT(*) > 1;',
    porque: '<code>WHERE</code> filtra filas antes de agrupar, así que no puede usar <code>COUNT(*)</code>, que aún no existe. Para filtrar grupos según un agregado se usa <code>HAVING</code>, que se evalúa después del <code>GROUP BY</code>.',
    teoria: 's7.10' },
  { id: 't7-case', tema: 7, tipo: 'sql', titulo: 'Gama de cada producto',
    enunciado: 'Muestra el <b>nombre</b>, el <b>precio</b> y una columna <b>gama</b> con el valor <code>\'alta\'</code> si el precio es de 100 € o más, <code>\'media\'</code> si es de 40 € o más, y <code>\'baja\'</code> en otro caso.',
    inicial: 'SELECT nombre, precio,\n       CASE\n       END AS gama\nFROM producto;',
    solucion: `SELECT nombre, precio,
       CASE
         WHEN precio >= 100 THEN 'alta'
         WHEN precio >= 40  THEN 'media'
         ELSE 'baja'
       END AS gama
FROM producto;`,
    porque: '<code>CASE</code> evalúa las condiciones <b>en orden</b> y se queda con la primera que se cumple. Por eso basta con <code>precio &gt;= 40</code> en la segunda: los de 100 o más ya han entrado por la primera. <code>ELSE</code> recoge todo lo demás (sin <code>ELSE</code>, el resultado sería NULL).',
    teoria: 's7.8' },
  { id: 't7-orden-logico', tema: 7, tipo: 'ordena', titulo: 'Orden lógico de ejecución',
    enunciado: 'Ordena las cláusulas de un <code>SELECT</code> según el orden <b>en que PostgreSQL las evalúa</b> (no en el que se escriben).',
    items: ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY', 'LIMIT'],
    porque: 'Primero se eligen las tablas (FROM), se filtran filas (WHERE), se agrupan (GROUP BY), se filtran grupos (HAVING), se calculan las columnas (SELECT), se ordena (ORDER BY) y se recorta (LIMIT). Esto explica, por ejemplo, que un alias definido en el SELECT se pueda usar en el ORDER BY pero no en el WHERE.',
    teoria: 's7.12' },
  { id: 't7-alias-where', tema: 7, tipo: 'test', titulo: '¿Por qué falla?',
    enunciado: '¿Por qué falla esta consulta?<pre class="code">SELECT nombre, precio * 1.21 AS precio_iva\nFROM producto\nWHERE precio_iva > 100;</pre>',
    opciones: [
      'Porque el WHERE se evalúa antes que el SELECT, así que el alias precio_iva todavía no existe.',
      'Porque no se pueden hacer operaciones aritméticas en el SELECT.',
      'Porque falta un GROUP BY.',
      'Porque los alias solo se pueden usar con AS en el FROM.'
    ],
    correcta: 0,
    porque: 'Por el orden lógico de ejecución, el WHERE se evalúa antes que el SELECT. Hay que repetir la expresión (<code>WHERE precio * 1.21 &gt; 100</code>) o calcularla en una subconsulta o CTE. En cambio, el alias sí se puede usar en el ORDER BY, que va después del SELECT.',
    teoria: 's7.12' },

  // ---------- Tema 8 · Consultas avanzadas ----------
  { id: 't8-join', tema: 8, tipo: 'sql', titulo: 'Pedidos con el nombre del cliente',
    enunciado: 'Muestra el <b>id</b> y la <b>fecha</b> de cada pedido junto con el <b>nombre del cliente</b> que lo hizo.',
    inicial: 'SELECT p.id, p.fecha, c.nombre\nFROM pedido p\n',
    solucion: 'SELECT p.id, p.fecha, c.nombre\nFROM pedido p\nJOIN cliente c ON c.id = p.cliente_id;',
    porque: 'El <code>JOIN … ON</code> empareja cada pedido con el cliente cuyo id coincide con su clave foránea <code>cliente_id</code>. Los alias de tabla (<code>p</code>, <code>c</code>) acortan la consulta y evitan ambigüedades, porque las dos tablas tienen una columna <code>id</code>.',
    teoria: 's8.1' },
  { id: 't8-left', tema: 8, tipo: 'sql', titulo: 'Todos los clientes y sus pedidos',
    enunciado: 'Muestra el <b>nombre</b> de <b>todos</b> los clientes y <b>cuántos pedidos</b> ha hecho cada uno. Los que no han hecho ninguno deben aparecer con <b>0</b>.',
    inicial: 'SELECT c.nombre, COUNT(*) AS pedidos\nFROM cliente c\nJOIN pedido p ON p.cliente_id = c.id\nGROUP BY c.id, c.nombre;',
    solucion: 'SELECT c.nombre, COUNT(p.id) AS pedidos\nFROM cliente c\nLEFT JOIN pedido p ON p.cliente_id = c.id\nGROUP BY c.id, c.nombre;',
    porque: 'Dos trampas. Con <code>JOIN</code> (INNER) Elena Castro desaparece porque no tiene pedidos; <code>LEFT JOIN</code> la conserva con las columnas de pedido a NULL. Y con <code>COUNT(*)</code> Elena saldría con 1, porque esa fila existe; <code>COUNT(p.id)</code> cuenta solo los pedidos reales y le da 0.',
    teoria: 's8.1' },
  { id: 't8-total-pedido', tema: 8, tipo: 'sql', titulo: 'Importe de cada pedido',
    enunciado: 'Calcula el <b>importe total</b> de cada pedido a partir de sus líneas (cantidad × precio unitario). Muestra el id del pedido y el total.',
    inicial: 'SELECT pedido_id,\nFROM linea_pedido\n',
    solucion: 'SELECT pedido_id, SUM(cantidad * precio_unitario) AS total\nFROM linea_pedido\nGROUP BY pedido_id;',
    porque: 'La multiplicación se hace fila a fila y <code>SUM</code> la acumula dentro de cada grupo de <code>pedido_id</code>. Se usa <code>precio_unitario</code> de la línea, no el precio actual del producto, porque el precio puede haber cambiado desde que se hizo el pedido.',
    teoria: 's7.10' },
  { id: 't8-subconsulta', tema: 8, tipo: 'sql', titulo: 'Más caros que la media',
    enunciado: 'Muestra el <b>nombre</b> y el <b>precio</b> de los productos cuyo precio es <b>mayor que el precio medio</b> de todos los productos.',
    inicial: '',
    solucion: 'SELECT nombre, precio\nFROM producto\nWHERE precio > (SELECT AVG(precio) FROM producto);',
    porque: 'No se puede escribir <code>WHERE precio &gt; AVG(precio)</code>, porque los agregados no se pueden usar en el WHERE. La solución es una <b>subconsulta escalar</b>: devuelve un único valor (la media, unos 87,89 €) con el que se compara cada fila.',
    teoria: 's8.2' },
  { id: 't8-not-exists', tema: 8, tipo: 'sql', titulo: 'Productos que nunca se han vendido',
    enunciado: 'Muestra el <b>nombre</b> de los productos que <b>no aparecen en ninguna línea de pedido</b>.',
    inicial: '',
    solucion: 'SELECT nombre\nFROM producto p\nWHERE NOT EXISTS (\n  SELECT 1 FROM linea_pedido l WHERE l.producto_id = p.id\n);',
    alt: 'SELECT p.nombre\nFROM producto p\nLEFT JOIN linea_pedido l ON l.producto_id = p.id\nWHERE l.producto_id IS NULL;',
    porque: '<code>NOT EXISTS</code> con una subconsulta correlacionada pregunta, para cada producto, si existe alguna línea suya. También vale un <code>LEFT JOIN</code> quedándose con las filas sin pareja. Mejor evitar <code>NOT IN (SELECT producto_id …)</code>: si la subconsulta devolviera algún NULL, no saldría ningún producto.',
    teoria: 's8.3' },
  { id: 't8-not-in-null', tema: 8, tipo: 'test', titulo: 'La trampa de NOT IN',
    enunciado: '¿Cuántas filas devuelve esta consulta sobre los 7 clientes de Mercado Next?<pre class="code">SELECT nombre FROM cliente\nWHERE ciudad NOT IN (\'Madrid\', NULL);</pre>',
    opciones: ['0', '4', '5', '7'],
    correcta: 0,
    notas: ['', 'Serían los que no son de Madrid y tienen ciudad, si el NULL no estuviera en la lista.', 'Serían los que no son de Madrid, contando a Pablo, que no tiene ciudad.', ''],
    porque: '<code>ciudad NOT IN (\'Madrid\', NULL)</code> equivale a <code>ciudad &lt;&gt; \'Madrid\' AND ciudad &lt;&gt; NULL</code>. La segunda comparación nunca es verdadera (da desconocido), así que la condición completa nunca se cumple y no sale ninguna fila. Por eso <code>NOT EXISTS</code> es más seguro cuando puede haber nulos.',
    teoria: 's8.3' },
  { id: 't8-tres-tablas', tema: 8, tipo: 'sql', titulo: 'Ventas por categoría',
    enunciado: 'Calcula el <b>importe vendido por categoría</b> (nombre de la categoría y total), teniendo en cuenta solo los pedidos que <b>no están cancelados</b>. Ordena de mayor a menor importe.',
    inicial: '',
    solucion: `SELECT c.nombre AS categoria,
       SUM(l.cantidad * l.precio_unitario) AS total
FROM linea_pedido l
JOIN pedido    pe ON pe.id = l.pedido_id
JOIN producto  pr ON pr.id = l.producto_id
JOIN categoria c  ON c.id  = pr.categoria_id
WHERE pe.estado <> 'cancelado'
GROUP BY c.nombre
ORDER BY total DESC;`,
    orden: true,
    porque: 'Hacen falta cuatro tablas: las líneas aportan el importe, el pedido el estado, y el producto enlaza con su categoría. El filtro de estado va en el <code>WHERE</code> (antes de agrupar) y el orden se hace sobre el total calculado; en el <code>ORDER BY</code> sí se puede usar el alias.',
    teoria: 's8.1' },
  { id: 't8-self', tema: 8, tipo: 'sql', titulo: 'Cada empleado con su jefe',
    enunciado: 'Muestra el <b>nombre de cada empleado</b> y el <b>nombre de su jefe</b>. Deben salir <b>todos</b> los empleados; la directora, que no tiene jefe, con el jefe a NULL.',
    inicial: '',
    solucion: 'SELECT e.nombre AS empleado, j.nombre AS jefe\nFROM empleado e\nLEFT JOIN empleado j ON j.id = e.jefe_id;',
    porque: 'Es un <b>autojoin</b>: la tabla empleado se une consigo misma con dos alias, uno en el papel de empleado (<code>e</code>) y otro en el de jefe (<code>j</code>). Hace falta <code>LEFT JOIN</code> para no perder a Carmen López, cuyo <code>jefe_id</code> es NULL.',
    teoria: 's8.1' },
  { id: 't8-union', tema: 8, tipo: 'test', titulo: 'UNION o UNION ALL',
    enunciado: 'La consulta A devuelve 5 ciudades y la B devuelve 4, de las cuales 2 están también en A. ¿Cuántas filas devuelven <code>A UNION B</code> y <code>A UNION ALL B</code>, si no hay repetidas dentro de cada una?',
    opciones: ['UNION: 7 · UNION ALL: 9', 'UNION: 9 · UNION ALL: 7', 'UNION: 2 · UNION ALL: 9', 'Las dos devuelven 9'],
    correcta: 0,
    porque: '<code>UNION</code> elimina los duplicados (5 + 4 − 2 = 7); <code>UNION ALL</code> los conserva (5 + 4 = 9) y es más rápido porque no tiene que buscarlos. Las filas comunes a las dos (2) las daría <code>INTERSECT</code>.',
    teoria: 's8.4' },
  { id: 't8-window', tema: 8, tipo: 'sql', titulo: 'Ranking de precios por categoría',
    enunciado: 'Muestra el <b>nombre</b>, la <b>categoria_id</b>, el <b>precio</b> y la <b>posición</b> de cada producto dentro de su categoría según el precio (1 = el más caro de su categoría).',
    inicial: 'SELECT nombre, categoria_id, precio,\n       ... OVER (...) AS posicion\nFROM producto;',
    solucion: 'SELECT nombre, categoria_id, precio,\n       RANK() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS posicion\nFROM producto;',
    alt: 'SELECT nombre, categoria_id, precio,\n       ROW_NUMBER() OVER (PARTITION BY categoria_id ORDER BY precio DESC) AS posicion\nFROM producto;',
    porque: 'Una función ventana calcula un valor para cada fila mirando otras filas, sin agruparlas: se siguen viendo los 9 productos. <code>PARTITION BY</code> reinicia el ranking en cada categoría y <code>ORDER BY precio DESC</code> decide quién va primero. Aquí no hay empates de precio, así que <code>RANK</code>, <code>DENSE_RANK</code> y <code>ROW_NUMBER</code> dan lo mismo.',
    teoria: 's8.7' },
  { id: 't8-cte', tema: 8, tipo: 'sql', nivel: '+', titulo: 'Grandes clientes con WITH',
    enunciado: 'Usando una CTE (<code>WITH</code>), calcula lo que ha gastado cada cliente en pedidos <b>entregados</b> y muestra el <b>nombre</b> y el <b>gasto</b> de los que superan los <b>200 €</b>.',
    inicial: 'WITH gasto AS (\n  \n)\nSELECT …',
    solucion: `WITH gasto AS (
  SELECT p.cliente_id, SUM(l.cantidad * l.precio_unitario) AS total
  FROM pedido p
  JOIN linea_pedido l ON l.pedido_id = p.id
  WHERE p.estado = 'entregado'
  GROUP BY p.cliente_id
)
SELECT c.nombre, g.total
FROM gasto g
JOIN cliente c ON c.id = g.cliente_id
WHERE g.total > 200;`,
    porque: 'La CTE da nombre a un paso intermedio (el gasto por cliente) y la consulta final lo usa como si fuera una tabla. El resultado es el mismo que con una subconsulta en el FROM o con un <code>HAVING</code>, pero se lee de arriba abajo, paso a paso.',
    teoria: 's8.5' },
  { id: 't8-recursive', tema: 8, tipo: 'sql', nivel: '+', titulo: 'Toda la jerarquía de Informática',
    enunciado: 'Con <code>WITH RECURSIVE</code>, muestra el <b>id</b> y el <b>nombre</b> de todas las categorías que cuelgan de <b>Informática</b> (id 1), a cualquier nivel, <b>sin incluir</b> la propia Informática.',
    inicial: 'WITH RECURSIVE sub AS (\n  -- caso base\n  UNION ALL\n  -- paso recursivo\n)\nSELECT id, nombre FROM sub;',
    solucion: `WITH RECURSIVE sub AS (
  SELECT id, nombre FROM categoria WHERE padre_id = 1
  UNION ALL
  SELECT c.id, c.nombre
  FROM categoria c
  JOIN sub s ON c.padre_id = s.id
)
SELECT id, nombre FROM sub;`,
    porque: 'El caso base toma las hijas directas de Informática (Periféricos y Monitores). El paso recursivo busca las hijas de lo que ya se ha encontrado (Teclados y Ratones, hijas de Periféricos) y se repite hasta que no aparecen filas nuevas. Un JOIN normal solo bajaría un nivel.',
    teoria: 's8.6' },
  { id: 't8-lag', tema: 8, tipo: 'sql', nivel: '+', titulo: 'Fecha del pedido anterior',
    enunciado: 'Para los pedidos del <b>cliente 1</b>, muestra el <b>id</b>, la <b>fecha</b> y la <b>fecha de su pedido anterior</b> (NULL en el primero), ordenados por fecha.',
    inicial: '',
    solucion: 'SELECT id, fecha,\n       LAG(fecha) OVER (ORDER BY fecha) AS pedido_anterior\nFROM pedido\nWHERE cliente_id = 1\nORDER BY fecha;',
    orden: true,
    porque: '<code>LAG(fecha)</code> devuelve el valor de la fila anterior según el orden de la ventana; en la primera fila no hay anterior y da NULL. <code>LEAD</code> haría lo mismo con la fila siguiente. Restando las fechas se obtendrían los días entre pedidos.',
    teoria: 's8.7' },

  // ---------- Tema 9 · DCL, TCL y objetos ----------
  { id: 't9-savepoint', tema: 9, tipo: 'test', titulo: 'Transacción con SAVEPOINT',
    enunciado: '¿Qué cambios quedan guardados al terminar?<pre class="code">BEGIN;\nUPDATE producto SET stock = 0 WHERE id = 1;   -- A\nSAVEPOINT s1;\nUPDATE producto SET stock = 0 WHERE id = 2;   -- B\nROLLBACK TO SAVEPOINT s1;\nUPDATE producto SET stock = 0 WHERE id = 3;   -- C\nCOMMIT;</pre>',
    opciones: ['A y C', 'Solo C', 'A, B y C', 'Ninguno'],
    correcta: 0,
    porque: '<code>ROLLBACK TO SAVEPOINT s1</code> deshace solo lo hecho después del punto de guardado (B), pero la transacción sigue abierta. Luego se hace C y el <code>COMMIT</code> confirma todo lo que queda: A y C.',
    teoria: 's9.3' },
  { id: 't9-grant', tema: 9, tipo: 'test', titulo: 'Permiso de solo lectura',
    enunciado: 'El rol de grupo <code>analistas</code> debe poder <b>consultar</b> la tabla <code>pedido</code> y nada más. ¿Qué sentencia aplica el mínimo privilegio?',
    opciones: [
      '<code>GRANT SELECT ON pedido TO analistas;</code>',
      '<code>GRANT ALL ON pedido TO analistas;</code>',
      '<code>GRANT SELECT, UPDATE ON pedido TO analistas;</code>',
      '<code>ALTER ROLE analistas SUPERUSER;</code>'
    ],
    correcta: 0,
    porque: 'Mínimo privilegio: conceder solo lo necesario para la tarea. <code>SELECT</code> permite leer, pero no modificar ni borrar. Concederlo a un rol de grupo (y no a cada persona) hace que dar o quitar acceso sea tan simple como añadir o sacar a alguien del grupo. Se retiraría con <code>REVOKE SELECT ON pedido FROM analistas;</code>.',
    teoria: 's9.2' },
  { id: 't9-vista', tema: 9, tipo: 'sql', titulo: 'Vista de pedidos pendientes',
    enunciado: 'Crea una vista llamada <code>v_pendientes</code> que muestre el <b>id</b> del pedido, su <b>fecha</b> y el <b>nombre del cliente</b> de los pedidos en estado <code>pendiente</code>.',
    inicial: 'CREATE VIEW v_pendientes AS\n',
    solucion: `CREATE VIEW v_pendientes AS
SELECT p.id, p.fecha, c.nombre
FROM pedido p
JOIN cliente c ON c.id = p.cliente_id
WHERE p.estado = 'pendiente';`,
    comprobar: `SELECT v.*, (SELECT count(*) FROM information_schema.views WHERE table_name = 'v_pendientes') AS es_una_vista
FROM v_pendientes v ORDER BY 1`,
    porque: 'Una vista guarda la <b>consulta</b>, no los datos: cada vez que se consulta <code>v_pendientes</code> se ejecuta de nuevo y refleja el estado actual. Sirve para simplificar consultas frecuentes y para dar acceso a una parte de los datos sin dar acceso a las tablas.',
    teoria: 's9.4' },
  { id: 't9-materializada', tema: 9, tipo: 'clasifica', titulo: 'Vista o vista materializada',
    enunciado: '¿Qué conviene en cada caso?',
    categorias: ['Vista', 'Vista materializada'],
    items: [
      ['Un informe de ventas por mes muy costoso que se consulta cien veces al día y basta con que esté actualizado cada noche', 1],
      ['Dar a soporte acceso a los pedidos pendientes, siempre al minuto', 0],
      ['Ocultar las columnas de datos personales de la tabla cliente', 0],
      ['Un cuadro de mando que agrega millones de filas y tarda 40 segundos en calcularse', 1]
    ],
    porque: 'La vista normal se recalcula en cada consulta: siempre está al día, pero cuesta lo mismo que la consulta original. La materializada guarda el resultado y se actualiza con <code>REFRESH MATERIALIZED VIEW</code>: es rápida de leer, a cambio de que los datos pueden estar algo atrasados.',
    teoria: 's9.4' }
];
