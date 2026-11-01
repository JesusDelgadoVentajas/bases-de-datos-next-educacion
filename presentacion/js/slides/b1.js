// Bloque I · Fundamentos y modelado (Temas 1–4)
import { col, pts, box, w, table, cards, study, code, sql } from '../deck.js';
import * as WA from '../w/b1a.js';
import * as WB from '../w/b1b.js';
import * as WC from '../w/b1c.js';

export const widgets = { ...WA.widgets, ...WB.widgets, ...WC.widgets };

export function build(D) {
  D.bloque({ n: 'I', title: 'Fundamentos y modelado',
    intro: 'Antes de escribir una sola línea de SQL hay que saber qué problema resuelve una base de datos y cómo se diseña: qué es un SGBD, cómo se representa la realidad con el modelo E/R, cómo se traduce a tablas y cómo se comprueba con la normalización que el diseño es sólido.',
    temas: [[1, 'Introducción a los sistemas de bases de datos'], [2, 'Modelado conceptual: el modelo E/R'], [3, 'El modelo relacional'], [4, 'Diseño lógico y normalización']] });

  // ================= TEMA 1 =================
  D.tema({ n: 1, title: 'Introducción a los sistemas de bases de datos', obj: [
    'Parte A · ¿Para qué sirven las bases de datos? Del dato a la información, la hoja de cálculo y el SGBD (1.1–1.5)',
    'Parte B · Cómo funciona y cómo se organiza: una compra, el vocabulario básico y los modelos de datos (1.6–1.8)',
    'Parte C · El panorama: OLTP y OLAP, dónde viven los datos y qué hace falta para confiar en ellos (1.9–1.11)',
    'Parte D · Cierre y puesta en marcha: cómo crece Mercado Next, perfiles y mapa de la asignatura (1.12)'] });

  // ----- Parte A -----
  D.s('1.1', 'Las bases de datos en tu día a día', `${col(w('dia'), 'wide')}${col(`
      ${pts(['Detrás de cada app hay un sistema que necesita <b>recordar</b>: quién eres, qué has hecho, cuánto dinero hay, qué queda libre.', 'Ese recuerdo organizado es una <b>base de datos</b>.'])}
      ${box('', 'Clave', 'Hace falta una base de datos cuando la información debe ser <b>duradera</b> (no se pierde al apagar), <b>compartida</b> (muchos a la vez) y <b>fiable</b> (lo que dice es correcto).')}
      ${study('¿Sabías que…? Android e iOS incluyen SQLite, un gestor tan pequeño que cabe dentro de una aplicación. Según sus desarrolladores es el motor más extendido del mundo, con más de un billón de bases de datos en uso.')}`, 'narrow')}`,
    { lead: 'Música, un Bizum, una reserva, una compra: ningún sistema funcionaría si olvidara lo que pasó hace un minuto. Elige uno y provoca un fallo.' });

  D.s('1.2', 'Del dato a la información', `${col(w('dato'))}`,
    { lead: 'Un dato es un valor suelto. Con contexto se convierte en información y, comparado con una regla del negocio, en una decisión.' });

  D.s('1.2', 'Metadatos y formas de los datos', `${col(w('formas'), 'wide')}${col(`
      ${box('', 'Metadatos', 'Datos sobre los datos: que la columna se llama <code>stock</code>, que guarda enteros, que la actualiza el almacén… El SGBD los guarda en su <b>catálogo</b> (Tema 5).')}
      ${box('warn', 'Atención', '«No estructurado» no significa desordenado ni inútil: lo que falta es una columna que un programa lea directamente. Sacarla exige procesarlo, y eso hoy lo hace muy bien la IA generativa.')}
      ${study('Ejemplo: una foto del móvil guarda la imagen (el dato) y la fecha, la hora, el modelo del teléfono y a veces la ubicación (los metadatos). Así la galería ordena por fecha o muestra un mapa sin «mirar» la imagen. En plataformas como Databricks (Tema 22), gestionar bien los metadatos es una disciplina: el gobierno del dato. Idea clave: una base de datos guarda los datos con su contexto y su descripción para que, al consultarlos, se conviertan en información fiable.')}`, 'narrow')}`,
    { id: 's1.2b', lead: 'Sin metadatos, una base de datos es un montón de valores sin sentido. Y no todos los datos llegan con la misma forma.' });

  D.s('1.3', 'Cuando la hoja de cálculo se queda corta', `${col(w('hoja'))}`,
    { lead: 'La hoja «pedidos_FINAL_v3.xlsx» de la primera semana de Mercado Next. Revísala con sentido común: ¿cuántos problemas encuentras?' });

  D.s('1.3', '¿Es Excel una base de datos?', `${col(w('ficheros'), 'wide')}${col(`
      ${table(['Herramienta', '¿Es un SGBD?'], [['Excel, Google Sheets', 'No'], ['Un fichero CSV', 'No'], ['Una carpeta compartida en Drive', 'No'], ['Airtable, Notion', 'En parte'], ['Microsoft Access', 'Sí, de escritorio'], ['PostgreSQL, MySQL, Oracle, SQL Server', 'Sí']], 'small')}
      ${box('gray', 'Dato · 2020', 'Inglaterra dejó de comunicar casi <b>16.000 positivos</b> de COVID-19: un proceso usaba el antiguo <code>.xls</code>, limitado a <b>65.536 filas</b>, y descartó el resto sin avisar.')}
      ${study('Respuesta corta: no. Excel no impide los errores de la hoja, no deja escribir a muchos a la vez con garantías, no relaciona tablas con reglas y tiene un límite de 1.048.576 filas por hoja. Es excelente para explorar, analizar y presentar, pero no es el <b>registro oficial</b> de un negocio. CSV: perfecto para mover datos (Tema 6). Drive guarda ficheros pero no entiende lo que hay dentro. Airtable y Notion: cómodas para equipos pequeños, limitadas a gran escala. Access: SGBD relacional sencillo para una persona o un grupo pequeño. Un SGBD habría dado un error en lugar de perder datos sin decir nada.')}`, 'narrow')}`,
    { id: 's1.3b', lead: 'Casi todos los problemas tienen el mismo origen: copias de un fichero que cada departamento modifica y reenvía. La alternativa es una sola base de datos compartida, con reglas y permisos.' });

  D.s('1.4', 'Qué es una base de datos y qué es un SGBD', `${col(w('piezas'), 'wide')}${col(`
      ${pts(['<b>Base de datos</b>: datos relacionados, organizados y guardados de forma duradera, que comparten personas y aplicaciones.',
        '<b>SGBD</b>: el programa que la gestiona. PostgreSQL, MySQL, Oracle o SQL Server.', '<b>Sistema de base de datos</b>: la base de datos más el SGBD. La <b>aplicación</b> pide los datos al SGBD.'])}
      ${box('warn', 'Atención', 'En la calle «base de datos» se usa para todo. Aquí, la <b>base de datos</b> son los datos; el <b>SGBD</b>, el programa.')}
      ${study('Un mismo SGBD puede gestionar muchas bases de datos a la vez (la de la tienda, la de recursos humanos, la de pruebas) y una base de datos la usan muchas aplicaciones. «Tenemos la base de datos en PostgreSQL» significa que sus datos los gestiona ese programa.')}`, 'narrow')}`,
    { lead: 'Se mezclan tres cosas distintas: los datos, el programa que los gestiona y la aplicación que usa la gente. Haz clic en cada pieza.' });

  D.s('1.4', 'Qué hace el gestor por nosotros', `${col(w('sgbdfun'), 'wide')}${col(`${pts(['Sin SGBD, <b>cada aplicación</b> tendría que programar todo esto por su cuenta.',
      'Son justo las funciones que la hoja de cálculo del apartado 1.3 <b>no cumplía</b>.', 'Cada función se trabaja en uno o varios temas de la asignatura.'])}
      ${study('Definir (Temas 2–5), guardar y recuperar (6–8), hacer cumplir las reglas (3 y 5), controlar el acceso (9 y 23), atender a muchos a la vez (10), recuperarse de fallos (10) y describirse a sí mismo guardando los metadatos (5).')}`, 'narrow')}`,
    { id: 's1.4b', lead: 'Siete funciones contadas con situaciones de Mercado Next. Pasa el ratón por cada una.' });

  D.s('1.4', '(+) Por dentro: los tres niveles (ANSI/SPARC, 1975)', `${col(w('ansi'), 'wide')}${col(`
      ${pts(['<b>Externo</b>: lo que ve cada grupo de usuarios.', '<b>Conceptual</b>: qué datos hay y cómo se relacionan.', '<b>Interno</b>: cómo se guardan físicamente.'])}
      ${box('', 'Clave', 'Cambiar el nivel interno sin afectar al conceptual es la <b>independencia física</b>; cambiar el conceptual sin afectar a lo que ve cada usuario, la <b>independencia lógica</b>.')}
      ${study(`La propuesta es del comité ANSI/SPARC (1975) y sirve para describir cualquier base de datos. En PostgreSQL, el nivel externo se construye con vistas:${code(`-- Nivel externo: lo que ve marketing
CREATE VIEW clientes_marketing AS
SELECT nombre, ciudad, fecha_alta
FROM cliente;   -- sin email ni datos sensibles`)}`)}`, 'narrow')}`,
    { id: 's1.4c', lead: 'Prueba los botones: cambia un nivel y observa si los de arriba se enteran.' });

  D.s('1.4', '(+) Por dentro: los componentes del SGBD', `${col(w('pipeline'), 'wide')}${col(`
      ${table(['Componente', 'En PostgreSQL'], [['Analizador (parser)', 'Fase parse'], ['Optimizador (planner)', '<code>EXPLAIN</code> (Tema 10)'], ['Ejecutor', 'Seq Scan, Index Scan…'], ['Gestor de búfer', 'shared_buffers'],
        ['Gestor de transacciones', 'MVCC y bloqueos'], ['Registro (log)', 'WAL (Write-Ahead Log)'], ['Catálogo', '<code>pg_catalog</code>, <code>information_schema</code>']], 'small')}
      ${study('Analizador: comprueba que la sentencia SQL está bien escrita. Optimizador: elige la forma más rápida de ejecutarla. Ejecutor: recorre el plan y devuelve las filas. Gestor de búfer: mantiene en memoria los datos más usados. Gestor de transacciones: garantiza que nada quede a medias y que los usuarios no se pisen. Registro: anota cada cambio antes de hacerlo, para poder recuperarse tras un fallo. Catálogo: guarda los metadatos.')}`, 'narrow')}`,
    { id: 's1.4d', lead: 'Pulsa «Ejecutar consulta» y sigue el viaje de una sentencia SQL por dentro del motor.' });

  D.s('1.4', '(+) El catálogo también se consulta con SQL', `${col(sql([
      ['Tablas de public', `SELECT table_name\nFROM information_schema.tables\nWHERE table_schema = 'public';`],
      ['Columnas de cliente', `SELECT column_name, data_type, is_nullable\nFROM information_schema.columns\nWHERE table_name = 'cliente'\nORDER BY ordinal_position;`],
      ['Restricciones', `SELECT table_name, constraint_name, constraint_type\nFROM information_schema.table_constraints\nWHERE table_schema = 'public'\nORDER BY table_name;`],
      ['Plan (EXPLAIN)', `EXPLAIN\nSELECT * FROM pedido WHERE id = 106;`]]))}`,
    { id: 's1.4e', lead: 'El catálogo es un conjunto de tablas más. Esto es PostgreSQL de verdad ejecutándose en tu navegador.' });

  D.s('1.5', 'Cómo hemos llegado hasta aquí', `${col(w('etapas'), 'wide')}${col(`
      ${pts(['Cada etapa nació para <b>resolver un problema</b> de la anterior.', 'Casi ninguna ha desaparecido: hoy <b>conviven</b> sistemas de casi todas las épocas.'])}
      ${box('', 'Clave', 'Cada etapa no sustituye a la anterior: <b>se suma</b>. Por eso hay que moverse entre sistemas relacionales, NoSQL, analíticos y en la nube, y saber cuál conviene en cada caso.')}`, 'narrow')}`,
    { lead: 'De las fichas de papel al lakehouse y la IA. Pulsa una etapa o recorre la historia entera.' });

  // ----- Parte B -----
  D.s('1.6', 'Qué pasa cuando pulsas «Comprar»', `${col(w('compra'), 'wide')}${col(`
      ${pts(['Ana compra un teclado K-200 y dos ratones M-10. La confirmación tarda <b>un segundo</b>.', 'Si algo falla, el SGBD <b>no deja nada a medias</b>: ahí se nota la diferencia con la hoja de cálculo.'])}
      ${box('', 'Clave', 'Por cada compra hay muchas más <b>lecturas</b> que escrituras: portada, búsqueda, fichas, carrito… Una tienda mediana atiende miles de consultas por segundo.')}`, 'narrow')}`,
    { lead: 'Con las piezas del apartado 1.4 seguimos una operación real de principio a fin.' });

  D.s('1.7', 'Vocabulario básico para seguir la asignatura', `${col(w('vocab'), 'wide')}${col(`
      ${pts(['El <b>esquema</b> cambia poco: se diseña con cuidado. Los <b>datos actuales</b> cambian con cada compra, alta o envío.',
        'La <b>clave primaria</b> identifica cada fila; la <b>foránea</b> apunta a otra tabla: el pedido 1044 es de Marta sin escribir su nombre.'])}
      ${box('', 'Clave', 'Si Ana cambia de email, se modifica <b>una sola vez</b>, en <code>cliente</code>, y todos sus pedidos quedan al día. En la hoja del 1.3 acabó con dos emails.')}`, 'narrow')}`,
    { lead: 'Once palabras que aparecerán en todos los temas, presentadas sobre dos tablas de Mercado Next. En el Tema 3 se definen con rigor.' });

  D.s('1.7', 'NULL: cuando no sabemos', `${col(sql([
      ['0, \'\' y NULL', `SELECT 0 IS NULL  AS cero,\n       '' IS NULL AS texto_vacio,\n       NULL IS NULL AS nulo;`],
      ['Comparar con NULL', `-- «no sé» comparado con lo que sea da «no sé»\nSELECT NULL = NULL      AS igual,\n       NULL <> 'Madrid' AS distinto;`],
      ['¿Quién no es de Madrid?', `-- Pablo tiene ciudad NULL y no aparece\nSELECT nombre, ciudad\nFROM cliente\nWHERE ciudad <> 'Madrid';`],
      ['Incluir los NULL', `SELECT nombre, ciudad\nFROM cliente\nWHERE ciudad <> 'Madrid' OR ciudad IS NULL;`]]), 'wide')}
      ${col(`${table(['Valor', 'Qué significa'], [['<code>0</code>', 'Sabemos el valor y es cero: stock = 0'], ['<code>\'\'</code>', 'Sabemos que no hay texto: observaciones en blanco'], ['<code>NULL</code>', 'No sabemos el valor (o no aplica): el email de Marta']], 'small')}
      ${box('warn', 'NULL no es igual a nada', 'Como significa «no sé», cualquier comparación con NULL da «no sé». Quien tiene NULL <b>no aparece</b> ni entre los iguales ni entre los distintos. Lo veremos con calma en el Tema 7.')}
      ${study('En el temario, el ejemplo es el email: si preguntas por los clientes cuyo email <b>no</b> es ana.ruiz@mail.com, Marta no aparece, porque no sabemos si su email es o no es ese. En la base de datos de la consola, Pablo Núñez tiene la ciudad a NULL y le pasa lo mismo.')}`, 'narrow')}`,
    { id: 's1.7b', lead: 'A veces falta un valor: no sabemos el email de Marta o un pedido aún no tiene fecha de envío. NULL no es un cero ni un texto vacío.' });

  D.s('1.8', 'Las formas de organizar los datos: los modelos', `${col(w('modelos'), 'wide')}${col(`
      ${box('', 'Ejemplo', 'El 30/10/2026, Ana Ruiz, de Jaén, hizo el pedido 1042: un teclado K-200 a 39,90 € y dos ratones M-10 a 12,50 €. Total: <b>64,90 €</b>.')}
      ${pts(['El <b>E/R</b> es un plano para diseñar: no guarda datos, se traduce a tablas.', 'Los demás son formas reales de guardar los datos.'])}
      ${box('', 'Clave', 'No hay un modelo mejor que los demás: cada uno encaja con un tipo de problema. Saber elegir se trabaja en el Tema 23.')}
      ${study('Un modelo de datos es una manera de organizar y representar los datos, con sus propias piezas y reglas. E/R: rectángulos (las cosas que interesan), rombos (cómo se relacionan) y óvalos (sus características). Relacional: el dominante desde hace más de cuarenta años, protagonista de los Temas 3 a 10. NoSQL agrupa clave-valor (el más sencillo y rápido: carrito, sesiones), documental (fichas JSON con listas dentro), columnar ancha (particiones ordenadas para escrituras enormes) y grafos (conexiones: recomendaciones, fraude, redes sociales). Además: series temporales (un valor por instante), búsqueda (índice de palabras, tolera «teclao»), dimensional en estrella (hechos y dimensiones para analizar, Tema 18) y vectorial (puntos en un espacio de significados, Tema 24).')}`, 'narrow')}`,
    { lead: 'Una decena de modelos con el mismo ejemplo, para ver qué forma tiene cada uno. Elige un modelo.' });

  // ----- Parte C -----
  D.s('1.9', 'Registrar frente a analizar: OLTP y OLAP', `${col(w('oltpolap'))}${col(table(['', 'Registrar (OLTP)', 'Analizar (OLAP)'], [
      ['Para qué', 'Hacer funcionar el negocio', 'Entender el negocio y decidir'], ['Operación', 'Pocos datos concretos', 'Recorrer y resumir muchísimos'],
      ['Quién', 'Clientes y empleados', 'Analistas, dirección, BI'], ['Cuántas', 'Miles por segundo', 'Pocas, pero pesadas'], ['Qué datos', 'Actuales, muy detallados', 'Históricos, resumidos'],
      ['Qué importa', 'Rapidez; nada a medias', 'Cruzar y agregar con libertad'], ['Organización', 'Normalizado (Tema 4)', 'En estrella (Tema 18)']], 'small'), 'narrow')}`,
    { lead: '«Guarda el pedido de Ana» frente a «¿cuánto hemos vendido por ciudad cada mes de los dos últimos años?»: dos usos opuestos de los datos.' });

  D.s('1.9', 'OLTP y OLAP sobre Mercado Next', `${col(sql([
      ['OLTP: estado de un pedido', `-- OLTP: ¿en qué estado está el pedido 106?\nSELECT estado FROM pedido WHERE id = 106;`],
      ['OLAP: facturación ciudad/mes', `-- OLAP: facturación por ciudad y mes\nSELECT c.ciudad, DATE_TRUNC('month', p.fecha)::date AS mes,\n       SUM(l.cantidad * l.precio_unitario) AS facturacion\nFROM pedido p\nJOIN cliente c      ON c.id = p.cliente_id\nJOIN linea_pedido l ON l.pedido_id = p.id\nWHERE p.fecha >= DATE '2025-01-01'\nGROUP BY c.ciudad, mes\nORDER BY mes, c.ciudad;`]]))}
      ${col(`${pts(['La primera toca <b>unas pocas filas</b> y se resuelve en milisegundos.', 'La segunda puede recorrer <b>la tabla entera</b> y unir tres tablas.'])}
        ${box('', 'Clave', 'Registrar y analizar piden bases de datos organizadas de forma distinta. Un buen diseño los <b>separa</b> para que el análisis no frene la operación.')}
        ${study('OLTP significa Online Transaction Processing (procesamiento de transacciones en línea) y OLAP, Online Analytical Processing (procesamiento analítico en línea). La separación se estudia a fondo en el Bloque V.')}`, 'narrow')}`, { id: 's1.9b' });

  D.s('1.10', 'Dónde viven los datos: equipo local, servidores y nube', `${col(w('donde'), 'wide')}${col(`
      ${pts(['Un <b>servidor</b> es un ordenador dedicado a dar servicio a otros por la red.', 'Las aplicaciones se conectan con una <b>cadena de conexión</b>:'])}
      ${code('postgresql://usuario:contraseña@\n  servidor.ejemplo.com:5432/mercado_next', 'sql', 'font-size:15px')}
      ${box('warn', 'Atención', 'La cadena incluye la contraseña. No la pegues en un correo, un chat ni un repositorio público.')}
      ${study('La cadena indica el tipo de sistema, el usuario, la contraseña, el servidor, el puerto y la base de datos. Verás una parecida en la Práctica 0. Distribuida: cuando los datos o los usuarios no caben en una máquina, se reparten entre varias que trabajan coordinadas, a cambio de problemas nuevos (Tema 11).')}`, 'narrow')}`,
    { lead: 'Una base de datos tiene que estar en alguna máquina. Dónde está y quién la cuida cambia mucho el trabajo diario. Elige una opción.' });

  D.s('1.10', 'Almacenes, lagos y lakehouse', `${col(`${cards([
      ['Data warehouse', 'Almacén de datos: reúne datos <b>ya limpios y ordenados</b> de toda la empresa, organizados para analizar. Es el destino natural de la carga OLAP.', 'hl'],
      ['Data lake', 'Lago de datos: guarda ficheros de <b>cualquier tipo</b>, tal como llegan y a bajo coste, incluidos los no estructurados.'],
      ['Lakehouse', 'Une lo mejor de ambos: el <b>almacenamiento barato</b> del lago con el <b>orden y el SQL</b> del almacén.']], 3)}
      ${box('', 'Clave', 'Cada vez más bases de datos viven en la nube como <b>servicios gestionados</b>. Eso no elimina el trabajo de diseñarlas, consultarlas y protegerlas: elimina el de cuidar las máquinas.')}`)}`,
    { id: 's1.10b', lead: 'Tres términos del análisis a gran escala que conviene situar ya. Se estudian en los Bloques V y VI; con esto basta por ahora.' });

  D.s('1.11', 'Qué necesitamos para confiar en los datos', `${col(w('pilares'), 'wide')}${col(`
      ${pts(['Una base de datos solo es útil si podemos <b>fiarnos</b> de lo que dice.', 'Esa confianza se apoya en <b>siete pilares</b>, y cada uno se estudia en algún punto de la asignatura.'])}
      ${box('', 'Clave', 'Una copia de seguridad que nunca se ha probado a restaurar no es una copia de seguridad: <b>es una esperanza</b>.')}`, 'narrow')}`,
    { lead: 'Calidad, reglas, concurrencia, permisos, privacidad, disponibilidad y recuperación. Elige un pilar y haz que falle.' });

  // ----- Parte D -----
  D.s('1.12', 'Cómo crece Mercado Next: el mapa de la asignatura', `${col(w('crece'))}`,
    { lead: 'Cada vez que el negocio crece aparece un problema nuevo, y cada problema abre un bloque de la asignatura. En el Tema 23 diseñarás su arquitectura de datos completa.' });

  D.s('1.12', 'Quién trabaja con los datos', `${col(w('perfiles'), 'wide')}${col(`
      ${box('', 'Denominador común', '<b>Todos los perfiles escriben SQL.</b> Es la lengua franca de los datos, también cuando las consultas las propone una IA (Tema 24): alguien tiene que entender y validar lo que se ejecuta.')}
      ${study('A medida que Mercado Next crece aparecen perfiles nuevos: analista de datos, desarrollador/a de BI, analytics engineer, ingeniero/a de datos, administrador/a de bases de datos (DBA), científico/a de datos y arquitecto/a de datos. Todos trabajan con bases de datos, pero cada uno con una relación distinta.')}`, 'narrow')}`,
    { id: 's1.12b', lead: 'Siete perfiles y los bloques que más usará cada uno. Haz clic en un perfil.' });

  D.s('1.12', 'Qué te llevas de cada bloque según tu perfil', `${col(w('tuperfil'))}`,
    { id: 's1.12c', lead: 'El grupo combina perfiles muy distintos, así que cada persona aprovechará la asignatura a su manera.' });

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
