// Bloque I · Fundamentos y modelado (Temas 1–4)
import { col, pts, box, w, table, cards, study, code, sql } from '../deck.js';
import * as WA from '../w/b1a.js';
import * as WB from '../w/b1b.js';

export const widgets = { ...WA.widgets, ...WB.widgets };

export function build(D) {
  D.bloque({ n: 'I', title: 'Fundamentos y modelado',
    intro: 'Antes de escribir una sola línea de SQL hay que saber qué problema resuelve una base de datos y cómo se diseña: qué es un SGBD, cómo se representa la realidad con el modelo E/R, cómo se traduce a tablas y cómo se comprueba con la normalización que el diseño es sólido.',
    temas: [[1, 'Introducción a los sistemas de bases de datos'], [2, 'Modelado conceptual: el modelo E/R'], [3, 'El modelo relacional'], [4, 'Diseño lógico y normalización']] });

  // ================= TEMA 1 =================
  D.tema({ n: 1, title: 'Introducción a los sistemas de bases de datos', obj: [
    'Distinguir dato, información, base de datos y SGBD', 'Entender qué resolvió el SGBD frente a los ficheros',
    'Arquitectura en tres niveles e independencia de los datos', 'Diferenciar OLTP de OLAP',
    'Situar relacional, NoSQL y NewSQL en el mapa actual', 'Conocer los perfiles profesionales del dato'] });

  D.s('1.1', 'Dato, información, base de datos y SGBD', `
    ${col(`${w('dikw')}`)}
    ${col(`${box('', 'Base de datos', 'Colección de datos <b>relacionados</b>, organizada según un modelo, <b>persistente</b> y <b>compartida</b> por varios usuarios y aplicaciones.')}
      ${box('', 'SGBD', 'El <b>software</b> que permite definir, crear, consultar, modificar y proteger esa base de datos, ocultando cómo se guarda físicamente.')}
      ${box('gray', 'No confundir', 'PostgreSQL, MySQL u Oracle son <b>SGBD</b>. La base de datos es el conjunto concreto de datos, por ejemplo Mercado Next. BD + SGBD + aplicaciones + personas = <b>sistema de base de datos</b>.')}`, 'narrow')}`,
    { lead: 'Las bases de datos trabajan en los dos primeros escalones: guardan datos para que, al consultarlos, se conviertan en información fiable.' });

  D.s('1.1', 'Lo que hace un SGBD por ti', `${col(w('sgbdfun'))}${col(`${pts(['Sin SGBD, <b>cada aplicación</b> tendría que programar todo esto por su cuenta.',
      'Pasa el ratón por cada función: verás qué significa y cómo se ve en la práctica.', 'Lo iremos viendo en SQL a lo largo de la asignatura.'])}
      ${study('El diccionario de datos (catálogo) guarda los metadatos: qué tablas, columnas, índices y estadísticas existen. Es, a su vez, un conjunto de tablas consultables con SQL.')}`, 'narrow')}`, { id: 's1.1b' });

  D.s('1.2', 'Del sistema de ficheros al SGBD', `${col(w('ficheros'), 'wide')}${col(`
      ${table(['Problema', 'Con un SGBD'], [['Redundancia e inconsistencia', 'Un dato se guarda una vez'], ['Dificultad de acceso', 'Un lenguaje general: SQL'],
        ['Integridad', 'Reglas declaradas una vez'], ['Atomicidad', 'Transacciones: todo o nada'], ['Concurrencia', 'Control de concurrencia'], ['Seguridad', 'Permisos por usuario, tabla y columna']], 'small')}
      ${box('gray', 'Dato · 2020', 'La sanidad pública inglesa dejó de comunicar casi <b>16.000 positivos</b> de COVID-19: un proceso usaba el antiguo <code>.xls</code>, limitado a <b>65.536 filas</b>, y descartaba el resto sin avisar.')}`, 'narrow')}`,
    { lead: 'Cada aplicación con sus propios ficheros… y los mismos problemas una y otra vez. Las hojas de cálculo son el «sistema de ficheros» moderno.' });

  D.s('1.3', 'Arquitectura en tres niveles (ANSI/SPARC, 1975)', `${col(w('ansi'), 'wide')}${col(`
      ${pts(['<b>Externo</b>: lo que ve cada grupo de usuarios (vistas). Puede haber muchos.', '<b>Conceptual</b>: qué datos hay y cómo se relacionan. Uno por BD.', '<b>Interno</b>: cómo se guardan (páginas de 8 kB en PostgreSQL, índices…).'])}
      ${box('', 'Clave', 'La <b>independencia física</b> es fácil y todos los SGBD la ofrecen. La <b>lógica</b> es más difícil: si se renombra una columna que usa una vista, la vista se rompe.')}
      ${study(code(`-- Nivel externo: lo que ve marketing
CREATE VIEW clientes_marketing AS
SELECT nombre, ciudad, fecha_alta
FROM cliente;   -- sin email ni datos sensibles`))}`, 'narrow')}`,
    { lead: 'Prueba los botones: cambia un nivel y observa si los de arriba se enteran.' });

  D.s('1.4', '(+) Componentes internos de un SGBD', `${col(w('pipeline'), 'wide')}${col(`
      ${pts(['<b>Procesador de consultas</b>: convierte el SQL en un plan y lo ejecuta.', '<b>Gestor de almacenamiento y transacciones</b>: lee y escribe en disco de forma segura y concurrente.',
        'El <b>WAL</b> anota cada cambio <i>antes</i> de aplicarlo: así se recupera tras un fallo.'])}
      ${study('El optimizador elige entre muchos planes posibles usando estadísticas. EXPLAIN muestra el plan elegido (Tema 10).')}`, 'narrow')}`,
    { lead: 'Pulsa «Ejecutar consulta» y sigue el viaje de una sentencia SQL por dentro del motor.' });

  D.s('1.4', '(+) El catálogo también se consulta con SQL', `${col(sql([
      ['Tablas de public', `SELECT table_name\nFROM information_schema.tables\nWHERE table_schema = 'public';`],
      ['Columnas de cliente', `SELECT column_name, data_type, is_nullable\nFROM information_schema.columns\nWHERE table_name = 'cliente'\nORDER BY ordinal_position;`],
      ['Restricciones', `SELECT table_name, constraint_name, constraint_type\nFROM information_schema.table_constraints\nWHERE table_schema = 'public'\nORDER BY table_name;`],
      ['Plan (EXPLAIN)', `EXPLAIN\nSELECT * FROM pedido WHERE id = 106;`]]))}`,
    { id: 's1.4b', lead: 'El diccionario de datos es un conjunto de tablas más. Esto es PostgreSQL de verdad ejecutándose en tu navegador.' });

  D.s('1.5', 'OLTP frente a OLAP', `${col(w('oltpolap'))}${col(table(['', 'OLTP', 'OLAP'], [
      ['Objetivo', 'Ejecutar el negocio', 'Analizar el negocio'], ['Operación', 'INSERT/UPDATE/SELECT de pocas filas', 'SELECT que agrega muchas filas'],
      ['Usuarios', 'Miles de usuarios y apps', 'Analistas y BI'], ['Datos', 'Actuales y detallados', 'Históricos, resumidos'],
      ['Diseño', 'Normalizado (T4)', 'En estrella (T18)'], ['Métrica', 'Transacciones/s, latencia', 'Tiempo de consulta'],
      ['Ejemplos', 'PostgreSQL, MySQL, Oracle', 'Snowflake, BigQuery, Databricks SQL']], 'small'), 'narrow')}`,
    { lead: 'Dos cargas opuestas: muchísimas transacciones cortas frente a pocas consultas que recorren millones de filas.' });

  D.s('1.5', 'OLTP y OLAP sobre Mercado Next', `${col(sql([
      ['OLTP: estado de un pedido', `-- OLTP: ¿en qué estado está el pedido 106?\nSELECT estado FROM pedido WHERE id = 106;`],
      ['OLAP: facturación ciudad/mes', `-- OLAP: facturación por ciudad y mes\nSELECT c.ciudad, DATE_TRUNC('month', p.fecha)::date AS mes,\n       SUM(l.cantidad * l.precio_unitario) AS facturacion\nFROM pedido p\nJOIN cliente c      ON c.id = p.cliente_id\nJOIN linea_pedido l ON l.pedido_id = p.id\nWHERE p.fecha >= DATE '2025-01-01'\nGROUP BY c.ciudad, mes\nORDER BY mes, c.ciudad;`]]))}
      ${col(`${pts(['La primera toca <b>una fila</b> gracias a un índice.', 'La segunda puede recorrer <b>la tabla entera</b> y unir tres tablas.',
        'Muchas consultas OLAP sobre la BD operacional ralentizan a quien está comprando: por eso la analítica se lleva a <b>sistemas separados</b> (Bloque V).'])}`, 'narrow')}`, { id: 's1.5b' });

  D.s('1.6', 'Panorama actual: una historia en hitos', `${col(w('timeline'))}`,
    { lead: 'De IMS (1966) al auge de las bases de datos vectoriales. Arrastra para desplazarte y usa la rueda para hacer zoom.' });

  D.s('1.6', 'Relacional, NoSQL y NewSQL', `${col(w('panorama'), 'wide')}${col(`
      ${table(['Familia', 'Idea', 'Ejemplos'], [['Relacional', 'Tablas, SQL, ACID', 'PostgreSQL, MySQL, Oracle'], ['Clave-valor', 'Diccionario gigante', 'Redis, DynamoDB'],
        ['Documental', 'JSON flexible', 'MongoDB'], ['Columnar ancha', 'Particionado por clave', 'Cassandra, HBase'], ['Grafos', 'Nodos y relaciones', 'Neo4j'],
        ['Búsqueda', 'Índices invertidos', 'Elasticsearch'], ['NewSQL', 'SQL + escala horizontal', 'Spanner, CockroachDB']], 'small')}
      ${box('', 'Clave', 'Las fronteras se difuminan: <b>persistencia políglota</b> y sistemas <b>multimodelo</b>.')}`, 'narrow')}`,
    { id: 's1.6b', lead: 'Posicionamiento orientativo. Haz clic en la leyenda para mostrar u ocultar familias.' });

  D.s('1.7', 'Perfiles profesionales', `${col(w('perfiles'), 'wide')}${col(`
      ${box('', 'Denominador común', '<b>Todos los perfiles escriben SQL.</b> Es la lengua franca del dato, también cuando las consultas las escribe una IA (Tema 24): alguien tiene que entender y validar lo que se ejecuta.')}
      ${study('DBA: instala, asegura, respalda y optimiza. Data engineer: construye las tuberías. Analytics engineer: modela los datos ya cargados (dbt). Data analyst: responde preguntas de negocio. BI developer: modelos dimensionales y cuadros de mando. Data scientist: modelos estadísticos y ML. Data architect: decide qué sistemas se usan y cómo encajan.')}`, 'narrow')}`,
    { lead: 'Intensidad orientativa con la que cada perfil trabaja en cada área. Haz clic en un perfil.' });

  // ================= TEMA 2 =================
  D.tema({ n: 2, title: 'Modelado conceptual: el modelo Entidad/Relación', obj: [
    'Representar una realidad con entidades, atributos y relaciones', 'Tipos de atributos, cardinalidad y participación',
    'Entidades débiles, jerarquías y agregación', 'Leer y dibujar Chen, crow\'s foot y UML', 'De unos requisitos escritos a un modelo completo'],
    extra: `<p class="lead" style="margin-top:26px">Diseño <b>conceptual</b> (E/R, sin pensar en ningún SGBD) → <b>lógico</b> (tablas, Temas 3–4) → <b>físico</b> (índices y almacenamiento, Tema 10). Un error en la primera fase se arrastra a todo lo demás.</p>` });

  D.s('2.1', 'Entidades, atributos y relaciones', `${col(w('chen'), 'wide')}${col(`
      ${pts(['<b>Entidad</b>: una «cosa» con existencia propia. Tipo (Cliente) frente a ocurrencia (Ana Ruiz).', '<b>Atributo</b>: propiedad que la describe.', '<b>Relación</b>: asociación entre entidades. También puede tener atributos: la <i>cantidad</i> es de «contiene».'])}
      ${table(['Grado', 'Ejemplo'], [['Unaria', 'Empleado <i>es jefe de</i> empleado'], ['Binaria', 'Cliente <i>realiza</i> pedido'], ['Ternaria', 'Profesor <i>imparte</i> asignatura <i>en</i> aula']], 'small')}
      ${study('Atención: una ternaria no equivale a tres binarias. «P imparte A en el aula X» es un único hecho; si se parte, se pierde qué combinación concreta se produce.')}`, 'narrow')}`,
    { lead: 'Modelo propuesto por Peter Chen en 1976. Pasa el ratón por cada figura del diagrama.' });

  D.s('2.2', 'Tipos de atributos', `${col(w('attrs'))}`, { lead: 'Clasificarlos bien ahora evita problemas al pasar a tablas. Elige un tipo.' });

  D.s('2.3', 'Cardinalidad y participación', `${col(w('cardmap'), 'wide')}${col(`
      ${pts(['<b>Cardinalidad máxima</b>: 1:1, 1:N o N:M.', '<b>Participación</b> (mínimo): <b>total</b> (1) u opcional/<b>parcial</b> (0).', 'Se combinan en la notación <b>(mín, máx)</b>.'])}
      ${box('warn', 'Atención', 'En Chen clásico (1:N) el símbolo va <b>al otro lado</b>. En (mín, máx) va <b>junto a la entidad que describe</b>: Cliente (0,N) = cada cliente tiene entre 0 y N pedidos.')}`, 'narrow')}`,
    { lead: 'Conecta elementos de los dos conjuntos haciendo clic: la cardinalidad se calcula sola.' });

  D.s('2.4', 'Entidades débiles', `${col(w('weak'), 'wide')}${col(`
      ${pts(['No se identifica solo con sus atributos: necesita la clave de su <b>propietaria</b>.', 'Tiene un <b>discriminador</b> (num_línea) que distingue dentro de cada propietaria.',
        'Clave completa = clave de la propietaria + discriminador.', 'Participación siempre <b>total</b>; si se borra la propietaria, se borran sus débiles.'])}
      ${box('', 'Clave', '<b>Dependencia de existencia</b>: no existe sin la otra pero tiene id propio. <b>Dependencia de identificación</b>: además necesita su clave → entidad débil en sentido estricto.')}`, 'narrow')}`,
    { lead: '«Línea 3» no significa nada si no decimos de qué pedido.' });

  D.s('2.5', 'E/R extendido: generalización, especialización y agregación', `${col(w('hier'), 'wide')}${col(`
      ${pts(['Superclase (Empleado) y subclases que <b>heredan</b> sus atributos.', '<b>Especialización</b>: de lo general a los subtipos. <b>Generalización</b>: al revés.',
        '<b>Disyunción</b>: disjunta (d) o solapada (o). <b>Completitud</b>: total (t) o parcial (p).'])}
      ${box('gray', 'Agregación', 'Tratar una relación como entidad: «empleado <i>trabaja en</i> proyecto» <i>usa</i> maquinaria, sin inventar una ternaria artificial.')}`, 'narrow')}`,
    { lead: 'Cambia las restricciones y asigna personas a subclases: el validador te dirá si el modelo se cumple.' });

  D.s('2.6', 'Notaciones: Chen, crow\'s foot y UML', `${col(w('notation'))}`,
    { lead: 'El mismo modelo, tres dibujos. Cambia el mínimo y el máximo de cada lado y mira cómo se escribe en cada notación.' });

  D.s('2.7', 'De los requisitos al modelo: caso práctico', `${col(w('reqs'))}`,
    { lead: 'Análisis del texto: sustantivos → entidades, verbos → relaciones, propiedades → atributos, cantidades → cardinalidad.' });

  D.s('2.7', 'El modelo de Mercado Next y decisiones que suelen fallar', `${col(table(['Relación', 'Cardinalidad', 'Justificación'], [
      ['Cliente <i>hace</i> Pedido', '1:N', 'Un cliente tiene 0 o muchos pedidos; cada pedido es de un cliente'],
      ['Pedido <i>incluye</i> Producto', 'N:M', 'Con atributos propios: cantidad y precio unitario'],
      ['Producto <i>pertenece a</i> Categoría', '1:N', 'Cada producto está en una categoría'],
      ['Categoría <i>dentro de</i> Categoría', '1:N reflexiva', 'Cada categoría tiene como mucho un padre']]), 'wide')}
    ${col(`${box('warn', 'Decisiones que suelen fallar', '')}${pts(['<b>El precio de la línea no es redundante</b>: es el que pagó el cliente ese día.', '<b>La edad no se guarda</b>: se calcula a partir de la fecha de nacimiento.',
      '<b>El estado</b> tiene valores cerrados: atributo con restricción o entidad aparte si se quiere su historial.'])}`, 'narrow')}`, { id: 's2.7b' });

  // ================= TEMA 3 =================
  D.tema({ n: 3, title: 'El modelo relacional', obj: [
    'Vocabulario preciso del modelo relacional', 'Superclaves, candidatas, primarias, alternativas y foráneas',
    'Restricciones de integridad que garantiza el SGBD', 'Traducir un diagrama E/R a tablas', '(+) Jerarquías y álgebra relacional'] });

  D.s('3.1', 'Relación, tupla, atributo y dominio', `${col(w('anatomy'), 'wide')}${col(`
      <p style="margin:0">Codd (IBM, 1970): los datos como <b>relaciones</b> y consultas con operaciones matemáticas bien definidas.</p>
      <div class="box" style="text-align:center"><p style="font-family:var(--font-mono)">R ⊆ D₁ × D₂ × … × Dₙ</p></div>
      ${table(['Teoría', 'SQL', 'Hoja de cálculo'], [['Relación', 'Tabla', 'Hoja'], ['Tupla', 'Fila', 'Fila'], ['Atributo', 'Columna', 'Columna'], ['Dominio', 'Tipo + restricciones', 'Formato de celda']], 'small')}
      ${box('warn', 'Atención', 'SQL trabaja con <b>multiconjuntos</b>: admite duplicados sin PK y no garantiza orden sin <code>ORDER BY</code>.')}`, 'narrow')}`,
    { lead: 'Una relación es un conjunto: sin tuplas duplicadas, sin orden y con valores atómicos. Pasa el ratón por la tabla.' });

  D.s('3.2', 'Tipos de claves', `${col(w('keys'), 'wide')}${col(`
      ${pts(['<b>Superclave</b>: identifica cada tupla.', '<b>Candidata</b>: superclave <b>mínima</b>.', '<b>Primaria</b>: la candidata elegida; sin nulos.', '<b>Alternativa</b>: candidata no elegida → <code>UNIQUE</code>.', '<b>Foránea</b>: sus valores existen como clave en otra tabla.'])}
      ${study(table(['', 'Natural', 'Subrogada'], [['Qué es', 'DNI, ISBN, email', '1, 2, 3… o UUID'], ['Ventaja', 'Ya existe y se entiende', 'Nunca cambia, compacta'], ['Riesgo', 'Puede cambiar o repetirse', 'Añadir UNIQUE a la natural']], 'small'))}`, 'narrow')}`,
    { lead: 'Elige columnas, edita los datos y comprueba si forman una superclave o una clave candidata.' });

  D.s('3.3', 'Restricciones de integridad', `${col(sql([
      ['CHECK: precio negativo', `INSERT INTO producto (nombre, categoria_id, precio)\nVALUES ('Cable USB', 2, -5);`],
      ['UNIQUE: email repetido', `INSERT INTO cliente (nombre, email)\nVALUES ('Ana Bis', 'ana.ruiz@mail.com');`],
      ['NOT NULL', `INSERT INTO cliente (nombre, email)\nVALUES (NULL, 'nadie@mail.com');`],
      ['FK: cliente inexistente', `INSERT INTO pedido (cliente_id, estado)\nVALUES (99, 'pendiente');`],
      ['FK: borrar cliente con pedidos', `DELETE FROM cliente WHERE id = 1;`],
      ['Dominio: estado inválido', `UPDATE pedido SET estado = 'perdido'\nWHERE id = 108;`]], { autorun: false }), 'wide')}
    ${col(`${table(['Restricción', 'SQL'], [['Dominio', 'Tipo de dato'], ['Entidad', 'PRIMARY KEY'], ['Unicidad', 'UNIQUE'], ['Obligatoriedad', 'NOT NULL'], ['Verificación', 'CHECK'], ['Referencial', 'FOREIGN KEY'], ['Reglas complejas', 'Triggers (T9)']], 'small')}
      ${box('', 'NULL', 'No es cero ni cadena vacía: significa <b>desconocido</b>. Cualquier comparación con NULL da <i>desconocido</i> (Tema 7).')}`, 'narrow')}`,
    { lead: 'El SGBD comprueba las reglas siempre, venga el dato de donde venga. Intenta romperlas: cada botón lanza una sentencia ilegal.' });

  D.s('3.4', 'Del E/R a tablas', `${col(w('er2tab'))}`, { lead: 'Reglas casi mecánicas. Elige un elemento del E/R y mira en qué se convierte.' });

  D.s('3.5', '(+) Jerarquías: estrategias de paso a tablas', `${col(w('hiertab'))}`,
    { lead: 'El modelo relacional no conoce la herencia. Tres estrategias, cada una con su precio: compáralas.' });

  D.s('3.6', '(+) Álgebra relacional', `${col(w('algebra'))}`,
    { lead: 'El lenguaje formal del modelo: operaciones que reciben relaciones y devuelven relaciones. Todo optimizador razona así.' });

  D.s('3.6', '(+) Del álgebra a SQL', `${col(`<div class="box"><div class="bt">Ejemplo</div><p>«Nombres de los clientes de Madrid que han hecho algún pedido en 2026»</p>
      <p style="font-family:var(--font-mono);font-size:19px;margin-top:10px">π<sub>nombre</sub>( σ<sub>ciudad='Madrid'</sub>(Cliente) ⋈<sub>Cliente.id = Pedido.cliente_id</sub> σ<sub>fecha ≥ '2026-01-01'</sub>(Pedido) )</p></div>
      ${box('gray', 'Predicate pushdown', 'El álgebra aplica los filtros <b>antes</b> del join. El optimizador hace lo mismo aunque escribamos el WHERE al final. Reaparecerá en los Bloques V y VI.')}`, 'narrow')}
    ${col(sql([['Álgebra → SQL', `SELECT DISTINCT c.nombre\nFROM cliente c\nJOIN pedido p ON c.id = p.cliente_id\nWHERE c.ciudad = 'Madrid'\n  AND p.fecha >= DATE '2026-01-01';`],
      ['Sin DISTINCT', `SELECT c.nombre\nFROM cliente c\nJOIN pedido p ON c.id = p.cliente_id\nWHERE c.ciudad = 'Madrid'\n  AND p.fecha >= DATE '2026-01-01';`]]))}`, { id: 's3.6b' });

  // ================= TEMA 4 =================
  D.tema({ n: 4, title: 'Diseño lógico y normalización', obj: [
    'Reconocer las anomalías de un mal diseño', 'Dependencias funcionales completas, parciales y transitivas',
    'Normalizar paso a paso hasta 3FN y FNBC', '(+) Cierres, recubrimientos y descomposiciones sin pérdida', 'Decidir cuándo desnormalizar'] });

  D.s('4.1', 'Anomalías: por qué normalizar', `${col(w('anomalies'))}`,
    { lead: 'Una tabla «todo en uno» mezcla varios temas. Provoca las tres anomalías: pruébalas.' });

  D.s('4.2', 'Dependencias funcionales', `${col(w('fdcheck'), 'wide')}${col(`
      <div class="box" style="text-align:center"><p style="font-family:var(--font-mono)">X → Y ⇔ t₁[X] = t₂[X] ⇒ t₁[Y] = t₂[Y]</p></div>
      ${pts(['<b>Completa</b>: depende de toda la clave.', '<b>Parcial</b>: de una parte de una clave compuesta.', '<b>Transitiva</b>: a través de un atributo no clave.'])}
      ${box('warn', 'Atención', 'Las dependencias <b>no se deducen de los datos</b>, sino del significado. Los datos solo pueden <b>desmentir</b> una dependencia, nunca demostrarla.')}`, 'narrow')}`,
    { lead: 'Si conozco X, conozco Y. Elige X e Y y comprueba si los datos contradicen la dependencia.' });

  D.s('4.3', 'Formas normales paso a paso', `${col(w('normal'))}`,
    { lead: '«De la clave, de toda la clave y de nada más que la clave» (W. Kent). Avanza por los pasos.' });

  D.s('4.3', 'Más allá de 3FN: Boyce-Codd', `${col(`${pts(['FNBC: para toda dependencia no trivial X → Y, <b>X es superclave</b>.', 'Academia: cada profesor imparte una sola asignatura; cada alumno tiene un profesor por asignatura.'])}
      <div class="box"><p style="font-family:var(--font-mono)">{alumno, asignatura} → profesor<br>profesor → asignatura</p></div>
      ${pts(['Claves candidatas: {alumno, asignatura} y {alumno, profesor} → está en <b>3FN</b>.', 'Pero <code>profesor</code> determina y no es superclave → <b>no está en FNBC</b>.', 'Solución: PROFESOR_ASIGNATURA y ALUMNO_PROFESOR.'])}`)}
    ${col(table(['Forma', 'Condición', 'Elimina'], [['1FN', 'Valores atómicos', 'Listas en una celda'], ['2FN', '1FN + sin dependencias parciales', 'Dependencias parciales'],
      ['3FN', '2FN + sin transitivas', 'Dependencias transitivas'], ['FNBC', 'Todo determinante es superclave', 'Determinantes no clave']]), 'narrow')}`, { id: 's4.3b' });

  D.s('4.4', '(+) Axiomas de Armstrong y cierre', `${col(w('closure'), 'wide')}${col(`
      ${table(['Regla', 'Forma'], [['Reflexividad', 'Y ⊆ X ⇒ X → Y'], ['Aumentatividad', 'X → Y ⇒ XZ → YZ'], ['Transitividad', 'X → Y, Y → Z ⇒ X → Z'],
        ['Unión', 'X → Y, X → Z ⇒ X → YZ'], ['Descomposición', 'X → YZ ⇒ X → Y'], ['Pseudotransitividad', 'X → Y, WY → Z ⇒ WX → Z']], 'small')}
      ${study('Recubrimiento mínimo: (1) un atributo a la derecha; (2) quitar atributos sobrantes a la izquierda; (3) eliminar dependencias redundantes. Es el punto de partida de la síntesis en 3FN.')}`, 'narrow')}`,
    { lead: 'Armstrong (1974): reglas correctas y completas. El cierre X⁺ dice todo lo que X determina; si es R entera, X es superclave.' });

  D.s('4.5', '(+) 4FN y 5FN', `${col(w('mvd'), 'wide')}${col(`
      ${pts(['<b>Dependencia multivaluada</b> X ↠ Y: cada X se asocia a un <i>conjunto</i> de Y independiente del resto.', 'CURSO(curso, profesor, libro): está en FNBC pero <b>no en 4FN</b>.', 'Se descompone en CURSO_PROFESOR y CURSO_LIBRO.',
        '<b>5FN</b>: dependencias de reunión con reglas cíclicas. Muy poco frecuente.'])}`, 'narrow')}`,
    { lead: 'Cada curso tiene varios profesores y varios libros, y cualquier profesor usa cualquier libro: mira cómo crecen las filas.' });

  D.s('4.6', '(+) Descomposición sin pérdida', `${col(w('lossless'), 'wide')}${col(`
      <div class="box"><div class="bt">Teorema de Heath</div><p style="font-family:var(--font-mono);font-size:19px">(R₁ ∩ R₂) → R₁  o  (R₁ ∩ R₂) → R₂</p></div>
      ${pts(['<b>Sin pérdida</b>: al reunir se obtiene exactamente la original.', '<b>Preservación</b>: cada dependencia se comprueba dentro de una tabla, sin joins.'])}
      ${box('', 'Clave', '3FN siempre es alcanzable sin pérdida y preservando dependencias. FNBC, sin pérdida sí, pero a veces se pierde alguna dependencia.')}`, 'narrow')}`,
    { lead: 'Una mala descomposición «pierde» información… ganando filas falsas (tuplas espurias).' });

  D.s('4.7', 'Desnormalización consciente', `${col(w('denorm'))}${col(`
      ${table(['Técnica', 'Coherencia'], [['Columna calculada (total)', 'Columna generada o trigger'], ['Vista materializada', 'REFRESH periódico (T9)'], ['Tablas resumen', 'ETL programado'],
        ['Esquema en estrella', 'Carga en el DW (T18)'], ['Documentos embebidos', 'Se escribe todo junto (T14)']], 'small')}
      ${box('recuerda', 'Recordamos que…', 'OLTP y OLAP son cargas opuestas (Tema 1): en <b>OLTP</b> se normaliza (hasta 3FN); en <b>OLAP</b>, casi solo lectura, se desnormaliza.')}`, 'narrow')}`,
    { lead: 'Reintroducir redundancia <b>a propósito</b> para leer más rápido: se parte de un diseño normalizado, se mide y se decide.' });
}
