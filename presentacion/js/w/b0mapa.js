// Mapa interactivo del temario (diapositiva «mapa»)
import { pal, esc, widgetScope } from '../ui.js';
import { BLOQUES } from '../slides/b0.js';

// Textos del mapa del temario, fieles al Word: [título del apartado, ampliación (+), qué se ve, por qué importa].
// Los mantiene la sincronización con el temario (modo A de la skill).
export const MAPA_TEMAS = {
  1: ["Qué es una base de datos y un SGBD, por qué una hoja de cálculo no basta, qué modelos de datos existen, cómo se usan los datos para registrar o para analizar, dónde viven y qué hace falta para confiar en ellos.",
    "Da el vocabulario y el mapa de toda la asignatura: cada bloque posterior responde a un problema que aparece cuando Mercado Next crece."],
  2: ["Representar una realidad con entidades, atributos y relaciones; expresar cardinalidades y participación; reconocer entidades débiles, jerarquías y agregaciones; leer Chen, crow’s foot y UML, y pasar de unos requisitos escritos a un modelo completo.",
    "Es el diseño conceptual, la primera y la más importante de las tres fases del diseño: un error aquí se arrastra a todo lo demás."],
  3: ["El vocabulario formal de Codd (relación, tupla, atributo y dominio), los tipos de claves, las restricciones de integridad que garantiza el SGBD, las reglas para pasar del E/R a tablas y, en ampliación, jerarquías y álgebra relacional.",
    "Es el modelo que sostiene casi todas las bases de datos actuales y el puente entre el diseño en papel y las tablas que se crean en SQL."],
  4: ["Por qué la redundancia provoca anomalías, qué son las dependencias funcionales y cómo se llega paso a paso a 1FN, 2FN, 3FN y FNBC; en ampliación, Armstrong, 4FN, 5FN y descomposiciones sin pérdida. Y cuándo desnormalizar a propósito.",
    "Es el método para comprobar que un esquema es sólido, imprescindible cuando se hereda un diseño ajeno o una hoja de cálculo convertida en tabla."],
  5: ["Qué es SQL y cómo se organiza, cómo elegir los tipos de datos, cómo crear bases de datos y esquemas, y cómo crear, modificar y borrar tablas, restricciones, índices y secuencias (DDL).",
    "Definir bien la estructura es la primera barrera de calidad: el tipo y las restricciones de cada columna impiden datos imposibles desde el principio."],
  6: ["Añadir, cambiar y borrar filas con INSERT, UPDATE y DELETE, también usando otras tablas; hacer upserts con ON CONFLICT y MERGE; cargar ficheros con COPY y escribir con hábitos seguros.",
    "Las sentencias de escritura no piden confirmación: escribir con precisión evita borrados y cambios masivos por error."],
  7: ["Consultar una tabla con SELECT: filtrar, ordenar y paginar; transformar valores con funciones de texto, números y fechas, CAST y CASE; resumir con agregados, GROUP BY y HAVING, y entender el orden real de ejecución y las trampas de NULL.",
    "SELECT es la sentencia más usada de SQL: la herramienta diaria de cualquier perfil que trabaje con datos."],
  8: ["Combinar tablas con joins, anidar subconsultas, usar EXISTS e IN, operar con conjuntos, escribir CTE (también recursivas), calcular rankings y acumulados con funciones ventana, pivotar y consultar JSON.",
    "Las preguntas reales de negocio cruzan varias tablas: estas técnicas las responden en una sola consulta legible."],
  9: ["Crear usuarios y roles con los permisos justos, controlar transacciones y crear vistas; en ampliación, funciones, procedimientos, disparadores, Row-Level Security y acceso desde Python.",
    "Una base de datos compartida necesita controlar quién hace qué y agrupar los cambios que deben ir juntos; además, casi todo el SQL real se lanza desde programas."],
  10: ["Qué es un índice y cuándo crearlo, cómo leer un plan con EXPLAIN, qué son las transacciones y sus propiedades ACID, qué pasa cuando varios usuarios escriben a la vez y cómo diseñar las copias de seguridad.",
    "Explica por qué una consulta es lenta y qué pasa si dos personas escriben a la vez: lo que separa una base de datos que funciona de una que falla en producción."],
  11: ["Escalado vertical y horizontal, replicación y sharding con hashing consistente, el teorema CAP sin fórmulas y la diferencia entre consistencia fuerte y eventual, con quórums.",
    "Son los conceptos que explican por qué existen las bases de datos NoSQL y qué se gana y se pierde al repartir los datos entre máquinas."],
  12: ["Por qué nació NoSQL, sus cuatro familias, la diferencia entre schema-on-write y schema-on-read y cómo se modela partiendo de las consultas.",
    "Da el criterio general para los temas siguientes y para saber cuándo el modelo relacional no es la mejor opción."],
  13: ["Redis: estructuras de datos y comandos, TTL, persistencia y Pub/Sub, y patrones de caché con su invalidación. DynamoDB: clave de partición, clave de ordenación, índices secundarios y single-table design.",
    "El clave-valor es la base de datos más simple y rápida: la que ayuda a que una web aguante el tráfico de un Black Friday."],
  14: ["Documentos, colecciones y BSON; CRUD con la sintaxis de MongoDB; cuándo embeber y cuándo referenciar; el aggregation pipeline, y los índices, la validación, las transacciones, los replica sets y el sharding.",
    "Es la opción natural para catálogos y datos de estructura variable, como los productos de Mercado Next con atributos distintos."],
  15: ["La arquitectura en anillo sin nodo principal, la partition key y la clustering key en CQL, la consistencia ajustable por operación, el modelado query-first y los errores típicos con las tombstones.",
    "Cassandra está pensada para escribir muchísimo, repartida en muchos nodos y sin punto único de fallo; usarla como un relacional sale caro."],
  16: ["Grafo de propiedades frente a RDF; nodos, relaciones, etiquetas y propiedades; consultas Cypher hasta caminos de longitud variable; índices, restricciones, algoritmos de grafos y los estándares GQL y SQL/PGQ.",
    "Cuando la pregunta implica muchos saltos (recomendaciones, fraude, redes) los joins se disparan; un grafo recorre cada relación al mismo coste."],
  17: ["Las bases de datos de series temporales y los motores de búsqueda como Elasticsearch: índice invertido, análisis del texto y relevancia.",
    "Completan el mapa para dos necesidades muy frecuentes: métricas a lo largo del tiempo y búsquedas de texto tolerantes a errores."],
  18: ["Por qué separar la analítica de la operación, qué es un data warehouse, cómo se diseña un modelo dimensional en estrella, cómo gestionar los cambios en las dimensiones (+) y qué aporta un data lake.",
    "Es la base de cualquier cuadro de mando: organizar la información para analizarla sin frenar el negocio."],
  19: ["ETL frente a ELT, por qué el almacenamiento por columnas acelera la analítica y cómo elegir entre Parquet, ORC y Avro.",
    "Explica cómo llegan los datos al almacén analítico y por qué el formato elegido cambia el espacio, la velocidad y el coste."],
  20: ["La arquitectura de Snowflake con almacenamiento y cómputo separados, sus warehouses y costes, la carga de datos, Time Travel, la clonación y los roles; el modelo serverless de BigQuery, su particionado y clustering, y la comparación entre ambos.",
    "Son dos de los data warehouses en la nube más usados: diseñar y consultar bien en ellos controla el rendimiento y la factura."],
  21: ["Cuándo un SGBD clásico se queda corto, el almacenamiento distribuido de HDFS al object storage, los motores SQL sobre Big Data, los formatos de tabla abiertos Delta Lake e Iceberg, el lakehouse y la arquitectura medallion.",
    "Explica qué cambia cuando los datos no caben en un servidor y cómo se unen data lake y data warehouse en una sola plataforma."],
  22: ["Cómo se organiza Databricks, Unity Catalog y sus objetos, las tablas Delta con SQL y sus operaciones, la ingesta con COPY INTO y Auto Loader y los permisos; en ampliación, pipelines y el puente con Machine Learning.",
    "Lleva a la práctica el lakehouse en una plataforma muy usada por los equipos de datos."],
  23: ["La inyección SQL y cómo evitarla, el mínimo privilegio, el RGPD aplicado a bases de datos, copias de seguridad frente a alta disponibilidad y cómo elegir base de datos con criterio, con el caso final de Mercado Next.",
    "Proteger los datos y elegir bien cada tecnología es responsabilidad de todos los perfiles; el caso final integra toda la asignatura."],
  24: ["Qué cambia la IA generativa, el LLM como copiloto de SQL, cómo funciona y por qué falla el text-to-SQL, embeddings y pgvector, RAG y GraphRAG, la conexión mediante MCP y agentes, y la seguridad y el gobierno de estas soluciones.",
    "Permite preguntar a los datos en lenguaje natural, pero solo es útil si se entiende y se valida lo que el modelo genera."],
};

export const MAPA_APARTADOS = {
  "1.1": ["Las bases de datos en tu día a día", 0,
    "Qué recuerdan las aplicaciones de cada día (tienda, banco, vuelos, transporte, salud, música) y qué pasa si se equivocan.",
    "Resume el tema en tres palabras: hace falta una base de datos cuando la información debe ser duradera, compartida y fiable."],
  "1.2": ["Del dato a la información", 0,
    "Cómo un valor suelto se convierte en información con su contexto y en decisión con una regla; qué son los metadatos y los datos estructurados, semiestructurados y no estructurados.",
    "Una base de datos guarda los datos con su contexto y su descripción para que, al consultarlos, sean información fiable."],
  "1.3": ["Cuando la hoja de cálculo se queda corta", 0,
    "Una actividad con la hoja de pedidos de Mercado Next: duplicados, formatos, contradicciones, fechas ambiguas, accesos simultáneos, copias y permisos. Y si Excel es o no una base de datos.",
    "Muestra con un caso real los problemas que resuelve un SGBD y por qué una hoja de cálculo no sirve como registro oficial de un negocio."],
  "1.4": ["Qué es una base de datos y qué es un SGBD", 0,
    "La diferencia entre los datos, el programa que los gestiona y la aplicación; las funciones del SGBD y, en ampliación, los tres niveles ANSI/SPARC y los componentes internos.",
    "Usar los términos con precisión evita confusiones y deja claro qué trabajo hace el gestor para que cada aplicación no tenga que programarlo."],
  "1.5": ["Cómo hemos llegado hasta aquí", 0,
    "Las etapas de la historia, de las fichas de papel al lakehouse y la IA, con la necesidad que impulsó cada una y el problema que dejó pendiente.",
    "Cada etapa se suma a la anterior: por eso hoy conviven sistemas relacionales, NoSQL, analíticos y en la nube, y hay que saber cuál conviene."],
  "1.6": ["Qué pasa cuando pulsas «Comprar»", 0,
    "El recorrido de una compra en Mercado Next desde el botón hasta la confirmación, y qué hace el SGBD si no hay stock, se corta la conexión o dos clientes compran a la vez.",
    "Hace visible la diferencia con la hoja de cálculo: el SGBD no deja nada a medias ni acepta datos que rompen las reglas."],
  "1.7": ["Vocabulario básico para seguir la asignatura", 0,
    "Tabla, fila, columna, tipo de dato, claves primaria y foránea, relación, consulta, esquema, datos actuales y NULL, sobre dos tablas de Mercado Next.",
    "Son las palabras que aparecen en todos los temas; entender bien las claves y NULL evita muchos errores posteriores."],
  "1.8": ["Las formas de organizar los datos: los modelos que vamos a estudiar", 0,
    "El pedido de Ana organizado según cada modelo: E/R para diseñar; relacional y NoSQL (clave-valor, documental, columnar ancha, grafos) para guardar; y series temporales, búsqueda, dimensional y vectorial.",
    "No hay un modelo mejor que los demás; ver su forma desde el principio ayuda a elegir el adecuado para cada problema."],
  "1.9": ["Registrar frente a analizar: OLTP y OLAP", 0,
    "Las dos formas opuestas de usar los datos: registrar lo que pasa (OLTP) y analizar lo que ha pasado (OLAP), con sus características.",
    "Piden bases de datos organizadas de forma distinta; separarlas evita que el análisis frene la operación."],
  "1.10": ["Dónde viven los datos: equipo local, servidores y nube", 0,
    "Equipo local, servidor propio, servicio gestionado en la nube o base de datos distribuida; la cadena de conexión, y qué son data warehouse, data lake y lakehouse.",
    "Dónde está la base de datos decide quién cuida la máquina, cuánto cuesta y cómo se conecta; cada vez más bases de datos son servicios gestionados."],
  "1.11": ["Qué necesitamos para confiar en los datos", 0,
    "Los siete pilares de unos datos fiables (calidad, reglas, concurrencia, permisos, privacidad, disponibilidad y recuperación) y qué pasa si falla cada uno.",
    "Una base de datos solo es útil si podemos fiarnos de ella; cada pilar se trabaja en algún tema de la asignatura."],
  "1.12": ["Cómo crece Mercado Next: perfiles y mapa de la asignatura", 0,
    "La historia del crecimiento de Mercado Next con el bloque que responde a cada etapa, los perfiles profesionales del dato y qué aporta cada bloque según tu perfil.",
    "Explica el orden de la asignatura y para qué te servirá, vengas de negocio, de análisis o de un perfil técnico."],
  "2.1": ["Entidades, atributos y relaciones", 0,
    "Las tres piezas del modelo E/R de Peter Chen (1976): entidades, atributos y relaciones, y el grado de una relación (unaria, binaria o ternaria).",
    "Son el vocabulario con el que se describe cualquier realidad antes de pensar en tablas."],
  "2.2": ["Tipos de atributos", 0,
    "Atributos simples y compuestos, monovalorados y multivalorados, derivados, clave u opcionales.",
    "Clasificarlos bien ahora evita problemas al pasar a tablas: cada tipo se traduce de una forma distinta."],
  "2.3": ["Cardinalidad y participación", 0,
    "Con cuántas ocurrencias se relaciona como mucho cada una (1:1, 1:N, N:M) y si la participación es total o parcial, en la notación (mín, máx).",
    "Deciden dónde irá cada clave foránea y si hace falta una tabla intermedia: son las reglas de negocio del diagrama."],
  "2.4": ["Entidades débiles", 0,
    "Las entidades que no se identifican solo con sus atributos y necesitan la clave de su propietaria, como la línea de un pedido; dependencia de existencia frente a dependencia de identificación.",
    "Reconocerlas da claves compuestas correctas: «línea 3» no significa nada si no se dice de qué pedido."],
  "2.5": ["E/R extendido: generalización, especialización y agregación", 0,
    "Generalización y especialización con superclases y subclases, sus restricciones, y la agregación.",
    "Permiten expresar herencia y relaciones de más alto nivel que el E/R básico no recoge."],
  "2.6": ["Notaciones: Chen, crow’s foot y UML", 0,
    "El mismo modelo dibujado en las notaciones de Chen, crow’s foot (pata de gallo) y UML.",
    "Herramientas y documentación usan notaciones distintas, así que hay que saber leerlas todas; crow’s foot es la habitual en las herramientas de bases de datos."],
  "2.7": ["De los requisitos al modelo: caso práctico", 0,
    "El modelo E/R de Mercado Next a partir de la descripción del negocio, analizando el texto para extraer entidades, relaciones y atributos.",
    "Es el trabajo real del diseño: pasar de lo que cuenta el negocio a un modelo completo y justificado."],
  "3.1": ["Relación, tupla, atributo y dominio", 0,
    "El modelo de Codd (1970): relaciones, tuplas, atributos y dominios; esquema frente a instancia, y sus propiedades: sin tuplas duplicadas, sin orden y con valores atómicos.",
    "Es la base teórica de casi todas las bases de datos actuales y explica por qué SQL funciona como funciona."],
  "3.2": ["Tipos de claves", 0,
    "Superclaves, claves candidatas, primaria, alternativas y foráneas; el dilema entre clave natural y subrogada, y las claves compuestas.",
    "Las claves identifican cada fila y relacionan las tablas: elegirlas bien evita duplicados y referencias rotas."],
  "3.3": ["Restricciones de integridad", 0,
    "Restricciones de dominio, entidad, unicidad, obligatoriedad, verificación e integridad referencial, y qué hacer al borrar un dato que otros referencian.",
    "El SGBD las comprueba siempre, venga el dato de donde venga: son la primera línea de defensa de la calidad."],
  "3.4": ["Del E/R a tablas", 0,
    "Las reglas casi mecánicas para traducir entidades, atributos y relaciones 1:N, N:M y 1:1, débiles y reflexivas a un esquema relacional.",
    "Convierte el diseño conceptual en tablas listas para crear en SQL sin perder nada del modelo."],
  "3.5": ["Jerarquías: estrategias de paso a tablas", 1,
    "Las tres estrategias para pasar una jerarquía a tablas, con sus ventajas e inconvenientes en estructura, consultas y valores nulos.",
    "El modelo relacional no conoce la herencia; la estrategia elegida afecta a las consultas y a los nulos."],
  "3.6": ["Álgebra relacional y su traducción a SQL", 1,
    "Las operaciones formales del modelo (selección, proyección, unión, diferencia, producto, join…) y su traducción a SQL.",
    "Todo optimizador razona internamente en estos términos; entenderlas ayuda a escribir mejor SQL."],
  "4.1": ["Anomalías: por qué normalizar", 0,
    "Las anomalías de inserción, actualización y borrado que provoca guardar todo en una única tabla de ventas.",
    "La redundancia no es solo espacio perdido: produce datos incoherentes. Es el motivo de normalizar."],
  "4.2": ["Dependencias funcionales", 0,
    "Qué significa que unos atributos determinen funcionalmente a otros, y las dependencias completas, parciales, transitivas y triviales.",
    "Son la herramienta que guía la normalización: las parciales y las transitivas son el origen de los problemas."],
  "4.3": ["Formas normales: 1FN, 2FN, 3FN y FNBC", 0,
    "El proceso completo con los pedidos de Mercado Next, de la forma no normalizada a 1FN, 2FN, 3FN y FNBC.",
    "3FN es el objetivo habitual de un buen diseño: cada dato se guarda una vez, en su tabla."],
  "4.4": ["Axiomas de Armstrong, cierre y recubrimiento mínimo", 1,
    "Las reglas de inferencia de Armstrong, el cierre de un conjunto de atributos y el recubrimiento mínimo.",
    "Permiten deducir dependencias, encontrar claves y comprobar un diseño con rigor."],
  "4.5": ["4FN y 5FN", 1,
    "Las formas normales superiores, que tratan dependencias que no son funcionales: multivaluadas (4FN) y de reunión (5FN).",
    "Resuelven redundancias que siguen ahí aunque la tabla ya esté en FNBC."],
  "4.6": ["Descomposición sin pérdida y preservación de dependencias", 1,
    "Las dos propiedades de una buena descomposición: sin pérdida (teorema de Heath) y preservación de dependencias.",
    "Explican por qué 3FN es el objetivo habitual: siempre se alcanza sin perder datos ni dependencias."],
  "4.7": ["Desnormalización consciente", 0,
    "Cuándo reintroducir redundancia a propósito para acelerar las lecturas: columnas calculadas, tablas de resumen y vistas materializadas.",
    "Es legítimo si se parte de un diseño normalizado, se mide y se mantiene la coherencia con un mecanismo."],
  "5.1": ["Qué es SQL: estándar, dialectos y sublenguajes (DDL, DML, DCL, TCL)", 0,
    "El origen de SQL en IBM, su carácter declarativo, el estándar y los dialectos, y los sublenguajes DDL, DML, DCL y TCL.",
    "Es la lengua franca de los datos, y su organización en sublenguajes ordena todo el Bloque II."],
  "5.2": ["Tipos de datos: numéricos, texto, fechas, booleanos, UUID y JSON", 0,
    "Tipos numéricos, de texto, fecha y hora, booleanos, UUID y JSON en PostgreSQL, con sus diferencias en MySQL.",
    "El tipo de cada columna es su primera restricción: numeric para dinero, timestamptz para instantes, jsonb para datos variables."],
  "5.3": ["Bases de datos y esquemas: CREATE DATABASE, CREATE SCHEMA, DROP DATABASE, SET search_path (en MySQL, USE)", 0,
    "La jerarquía servidor → base de datos → esquema → tabla, con CREATE DATABASE, CREATE SCHEMA, DROP DATABASE y search_path.",
    "Los esquemas separan áreas como carpetas y evitan conflictos de nombres; MySQL no distingue base de datos y esquema."],
  "5.4": ["Crear tablas", 0,
    "CREATE TABLE con el nombre, el tipo, el valor por defecto y las restricciones de cada columna, y las columnas de identidad.",
    "Es la sentencia central del DDL: define la estructura en la que vivirán los datos."],
  "5.5": ["Restricciones", 0,
    "PRIMARY KEY, UNIQUE, NOT NULL, CHECK y FOREIGN KEY, en la columna o a nivel de tabla, con nombre, y las acciones ON DELETE y ON UPDATE.",
    "Llevan las reglas del Tema 3 al SGBD, que las aplica a todos los datos, también a los que llegan de otras aplicaciones."],
  "5.6": ["Modificar tablas con ALTER TABLE", 0,
    "Añadir, renombrar y borrar columnas, cambiar tipos, nulos y valores por defecto, y añadir o quitar restricciones.",
    "Las tablas evolucionan con el negocio y hay que cambiarlas sin perder los datos."],
  "5.7": ["Borrar y vaciar: DROP TABLE [IF EXISTS] [CASCADE], TRUNCATE [RESTART IDENTITY]. Diferencias entre DELETE, TRUNCATE y DROP", 0,
    "DELETE, TRUNCATE y DROP: qué elimina cada uno, su velocidad, los triggers, la identidad y si se pueden deshacer; y DROP … CASCADE.",
    "Confundirlos puede borrar una tabla entera o lo que depende de ella; conviene saber exactamente qué hace cada uno."],
  "5.8": ["Otros objetos: CREATE INDEX, DROP INDEX, CREATE SEQUENCE, COMMENT ON", 0,
    "Índices, secuencias y comentarios con CREATE INDEX, DROP INDEX, CREATE SEQUENCE y COMMENT ON.",
    "Aceleran las búsquedas, generan números consecutivos y documentan el esquema en el propio catálogo."],
  "6.1": ["INSERT INTO … VALUES con una o varias filas", 0,
    "Insertar una o varias filas indicando tabla, columnas y valores; lo que no se menciona recibe DEFAULT o NULL.",
    "Es la forma básica de llenar una tabla; nombrar las columnas evita errores cuando el esquema cambia."],
  "6.2": ["INSERT INTO … SELECT y RETURNING", 0,
    "Insertar el resultado de una consulta y recuperar con RETURNING las filas insertadas, incluidos los valores generados.",
    "Es la forma habitual de copiar o transformar datos entre tablas y de obtener el id recién creado sin otra consulta."],
  "6.3": ["UPDATE … SET … WHERE, también con valores calculados", 0,
    "Cambiar columnas de las filas que cumplen el WHERE, con constantes o con valores calculados a partir de la propia fila.",
    "Sin WHERE afecta a todas las filas de la tabla: es una de las sentencias con más riesgo."],
  "6.4": ["DELETE … WHERE", 0,
    "Borrar las filas que cumplen una condición y cómo influyen las claves foráneas (CASCADE o RESTRICT).",
    "Un borrado puede propagarse a otras tablas o ser rechazado; hay que saber qué ocurrirá antes de ejecutarlo."],
  "6.5": ["UPDATE … FROM y DELETE … USING: actualizar o borrar usando otra tabla", 1,
    "Actualizar o borrar filas usando como criterio los datos de otra tabla, por ejemplo marcar como VIP a quien más ha gastado.",
    "Muchas modificaciones reales dependen de otras tablas; estas cláusulas lo resuelven en una sola sentencia."],
  "6.6": ["Upsert: INSERT … ON CONFLICT y MERGE (en MySQL, ON DUPLICATE KEY UPDATE)", 1,
    "Insertar o actualizar según exista el registro, con INSERT … ON CONFLICT y la pseudotabla EXCLUDED, o con MERGE; en MySQL, ON DUPLICATE KEY UPDATE.",
    "Es el problema más frecuente al sincronizar datos, y resolverlo bien evita duplicados."],
  "6.7": ["Importar y exportar datos: COPY y desde CSV", 0,
    "Importar y exportar ficheros en bloque con COPY en el servidor y con \\copy desde el cliente, y los permisos que necesita cada uno.",
    "Para mover miles o millones de filas, INSERT se queda corto: COPY es mucho más rápido."],
  "6.8": ["Buenas prácticas: probar el WHERE con un SELECT antes de escribir", 0,
    "Probar el WHERE con un SELECT, trabajar dentro de una transacción, comprobar cuántas filas se han tocado y decidir entre COMMIT y ROLLBACK.",
    "Las sentencias de escritura no piden confirmación: unos pocos hábitos evitan la mayoría de los desastres."],
  "7.1": ["SELECT, FROM, alias con AS, DISTINCT", 0,
    "La consulta mínima: columnas, tabla, expresiones con alias y eliminación de duplicados con DISTINCT.",
    "Es el esqueleto de toda consulta y lo primero que se aprende de SQL."],
  "7.2": ["Filtrar con WHERE", 0,
    "Filtrar filas con comparaciones, BETWEEN, IN, LIKE, IS NULL y operadores lógicos, con paréntesis para la precedencia.",
    "Filtrar bien es responder exactamente a la pregunta: un AND o un OR mal colocados cambian el resultado."],
  "7.3": ["Ordenar y paginar: ORDER BY (ASC, DESC, NULLS FIRST / NULLS LAST), LIMIT, OFFSET, FETCH FIRST", 0,
    "ORDER BY con ASC, DESC y NULLS FIRST o NULLS LAST, y paginación con LIMIT, OFFSET y FETCH FIRST.",
    "Sin ORDER BY el orden no está garantizado; paginar es imprescindible en listados y aplicaciones."],
  "7.4": ["Funciones de texto: UPPER, LOWER, TRIM, LENGTH, SUBSTRING, REPLACE, CONCAT / ||", 0,
    "UPPER, LOWER, TRIM, LENGTH, SUBSTRING, REPLACE y la concatenación con || o CONCAT, y su comportamiento con NULL.",
    "Limpiar y unificar texto (mayúsculas, espacios, formatos) es una tarea diaria del análisis de datos."],
  "7.5": ["Funciones numéricas: ROUND, CEIL, FLOOR, ABS", 0,
    "ROUND, CEIL, FLOOR y ABS, y la trampa de la división entera en PostgreSQL.",
    "Un 7 / 2 que da 3 falsea porcentajes e informes si no se convierte antes a decimal."],
  "7.6": ["Funciones de fecha: CURRENT_DATE, NOW(), EXTRACT, DATE_TRUNC, AGE, INTERVAL", 0,
    "CURRENT_DATE, NOW(), EXTRACT, DATE_TRUNC, AGE e INTERVAL, con sus equivalentes en MySQL.",
    "Casi todo análisis se agrupa por día, mes o año: manejar bien las fechas es imprescindible."],
  "7.7": ["Conversión de tipos: CAST y ::", 0,
    "Convertir un valor a otro tipo con la forma estándar CAST o con el atajo :: de PostgreSQL.",
    "Evita comparaciones y cálculos erróneos cuando los datos llegan con un tipo distinto del necesario."],
  "7.8": ["Lógica condicional: CASE WHEN, COALESCE, NULLIF", 0,
    "El «si… entonces…» de SQL con CASE WHEN, sustituir nulos con COALESCE y evitar divisiones entre cero con NULLIF.",
    "Permiten clasificar y limpiar los datos dentro de la propia consulta, sin programar fuera."],
  "7.9": ["Agregados: COUNT, SUM, AVG, MIN, MAX y (+) STRING_AGG", 0,
    "COUNT, SUM, AVG, MIN y MAX para resumir muchas filas en un valor, cómo tratan los nulos y, en ampliación, STRING_AGG.",
    "Son la base de cualquier indicador: totales, medias, máximos y recuentos."],
  "7.10": ["GROUP BY y HAVING", 0,
    "Calcular agregados por grupos con GROUP BY y filtrar los grupos con HAVING.",
    "Es como se responde a «por ciudad», «por mes» o «por categoría»: la forma típica de un informe."],
  "7.11": ["ROLLUP, CUBE y GROUPING SETS", 1,
    "Subtotales y total general en la misma consulta, y la función GROUPING para distinguirlos de los nulos reales.",
    "Hace en SQL lo que una tabla dinámica de Excel, sin escribir varias consultas."],
  "7.12": ["Orden de ejecución de un SELECT y trampas con NULL", 0,
    "El orden lógico FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT y las trampas de NULL en comparaciones, agregados y NOT IN.",
    "Explica errores muy habituales, como usar un alias en el WHERE o perder filas con NULL sin darse cuenta."],
  "8.1": ["JOINs: INNER, LEFT, RIGHT, FULL OUTER, CROSS, self-join; ON frente a USING", 0,
    "INNER, LEFT, RIGHT, FULL OUTER, CROSS y self-join; encadenar joins, y ON frente a USING.",
    "En un diseño normalizado la información está repartida y el join la vuelve a combinar; elegir mal el tipo pierde o duplica filas."],
  "8.2": ["Subconsultas escalares, de lista y correlacionadas", 0,
    "Subconsultas escalares, de lista y correlacionadas, y dónde puede ir cada una.",
    "Resuelven preguntas en dos pasos, como «productos más caros que la media», en una sola sentencia."],
  "8.3": ["EXISTS / NOT EXISTS, IN / NOT IN, ANY / ALL", 0,
    "Comprobar si hay o no hay filas relacionadas con EXISTS y NOT EXISTS, IN y NOT IN, y comparar con ANY y ALL.",
    "NOT EXISTS es más seguro que NOT IN cuando hay nulos; confundirlos da resultados vacíos inesperados."],
  "8.4": ["UNION, UNION ALL, INTERSECT, EXCEPT", 0,
    "Combinar los resultados de dos consultas compatibles, y la diferencia entre UNION y UNION ALL.",
    "Son la traducción directa del álgebra relacional y resuelven listados que juntan o restan conjuntos."],
  "8.5": ["CTEs con WITH", 0,
    "Consultas con nombre definidas al principio con WITH y usadas después como si fueran tablas.",
    "No añaden potencia, pero hacen legibles las consultas largas porque permiten escribirlas por pasos."],
  "8.6": ["WITH RECURSIVE", 1,
    "CTE que se llaman a sí mismas, con un caso base y un paso recursivo, para recorrer jerarquías y grafos.",
    "Es la herramienta de SQL para organigramas, árboles de categorías o rutas; un límite de profundidad evita bucles infinitos."],
  "8.7": ["Funciones ventana", 0,
    "ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, acumulados con SUM o AVG OVER, NTILE y FIRST_VALUE, con PARTITION BY, ORDER BY y marco.",
    "Calculan rankings, comparaciones con la fila anterior y acumulados sin agrupar las filas."],
  "8.8": ["Pivot con FILTER y CASE", 1,
    "Convertir valores de filas en columnas con agregados condicionales: FILTER y CASE.",
    "PostgreSQL no tiene un operador PIVOT; así se construyen las tablas cruzadas de un informe."],
  "8.9": ["Consultar JSON: ->, ->>, @>", 1,
    "Navegar columnas jsonb con ->, ->> y #>>, filtrar con @> y combinarlo con el resto del SQL.",
    "Permite atributos variables dentro de una base relacional; si un campo se usa siempre, merece ser una columna normal."],
  "9.1": ["Usuarios y roles: CREATE ROLE, CREATE USER, ALTER ROLE, DROP ROLE", 0,
    "En PostgreSQL todo es un rol: usuarios con LOGIN y roles de grupo, con CREATE ROLE, CREATE USER, ALTER ROLE y DROP ROLE.",
    "Cada persona y aplicación necesita su propia identidad para recibir solo los permisos que le corresponden."],
  "9.2": ["Permisos", 0,
    "Conceder y retirar privilegios con GRANT y REVOKE sobre bases de datos, esquemas, tablas, columnas, secuencias y funciones.",
    "Aplicar el mínimo privilegio limita el daño de un error o de unas credenciales robadas."],
  "9.3": ["TCL: BEGIN / START TRANSACTION, COMMIT, ROLLBACK, SAVEPOINT, ROLLBACK TO SAVEPOINT", 0,
    "Agrupar sentencias en transacciones con BEGIN, COMMIT y ROLLBACK, y deshacer una parte con SAVEPOINT.",
    "Las operaciones que deben ir juntas, como una transferencia, se aplican enteras o no se aplican."],
  "9.4": ["Vistas", 0,
    "Vistas como consultas guardadas con nombre, y vistas materializadas que guardan el resultado y se refrescan a demanda.",
    "Simplifican consultas repetidas, ocultan columnas sensibles y aceleran informes pesados."],
  "9.5": ["Funciones y procedimientos: CREATE FUNCTION, CREATE PROCEDURE, CALL", 1,
    "Programar lógica en el servidor, en SQL o PL/pgSQL: funciones que devuelven un valor y procedimientos que se invocan con CALL.",
    "Centraliza reglas que deben ser iguales para todas las aplicaciones."],
  "9.6": ["CREATE TRIGGER", 1,
    "Disparadores que ejecutan una función ante un INSERT, UPDATE, DELETE o TRUNCATE, antes o después, por cada fila o una vez por sentencia.",
    "Automatizan efectos como descontar el stock al añadir una línea de pedido."],
  "9.7": ["Row-Level Security: ENABLE ROW LEVEL SECURITY y CREATE POLICY", 1,
    "Políticas que filtran las filas que cada usuario puede ver o modificar, con ENABLE ROW LEVEL SECURITY y CREATE POLICY.",
    "Es la base de las aplicaciones multicliente: cada empresa o cada comercial ve solo sus datos."],
  "9.8": ["SQL desde Python, ORMs y migraciones", 1,
    "Acceder a PostgreSQL desde Python con un driver y parámetros, con pandas o con un ORM, y gestionar los cambios de esquema con migraciones.",
    "Casi todo el SQL real se lanza desde programas; pasar los valores como parámetros evita la inyección SQL."],
  "10.1": ["Qué es un índice y cuándo crearlo", 0,
    "Qué es un índice B-tree, cómo evita leer la tabla entera y cuándo conviene crearlo.",
    "Acelera las consultas selectivas pero ralentiza las escrituras: hay que crearlo con criterio."],
  "10.2": ["Leer un plan de ejecución con EXPLAIN (nivel básico)", 0,
    "Leer el plan elegido por el optimizador con EXPLAIN y EXPLAIN ANALYZE: tipos de nodo, costes, filas y tiempos.",
    "Es la forma de saber por qué una consulta es lenta en lugar de adivinarlo."],
  "10.3": ["Transacciones: qué son y por qué existen", 0,
    "Por qué existen las transacciones, con el ejemplo clásico de una transferencia entre dos cuentas.",
    "Sin ellas, un apagón a mitad o una lectura simultánea dejarían datos imposibles."],
  "10.4": ["Propiedades ACID", 0,
    "Atomicidad, consistencia, aislamiento y durabilidad: las cuatro garantías de cada transacción.",
    "Son lo que permite confiar en un SGBD relacional, y lo que algunas bases de datos NoSQL relajan."],
  "10.5": ["Qué pasa cuando varios usuarios escriben a la vez", 0,
    "La actualización perdida, las lecturas sucias, no repetibles y fantasma, la anomalía de serialización y los niveles de aislamiento; PostgreSQL usa READ COMMITTED y MVCC.",
    "Explica qué pasa cuando dos personas escriben a la vez y cómo evitar, por ejemplo, vender dos veces el último producto."],
  "10.6": ["Copias de seguridad", 0,
    "El RPO y el RTO, las copias lógicas y físicas con pg_dump y pg_restore, la regla 3-2-1 y la necesidad de probar la restauración.",
    "La pregunta no es si habrá que restaurar, sino cuándo; una copia que nunca se ha probado no es fiable."],
  "11.1": ["Escalado vertical y horizontal", 0,
    "Escalar en vertical, con una máquina más potente, frente a escalar en horizontal, con más máquinas.",
    "El vertical es la primera opción razonable; el horizontal se justifica cuando los datos o el tráfico no caben en una máquina."],
  "11.2": ["Replicación y sharding", 0,
    "Copiar los datos en varios nodos (replicación, síncrona o asíncrona) y repartirlos entre ellos (sharding), con hashing consistente.",
    "La replicación aporta tolerancia a fallos y lecturas; el sharding, volumen y escrituras."],
  "11.3": ["Teorema CAP explicado sin fórmulas", 0,
    "El teorema de Brewer: un sistema distribuido no puede garantizar a la vez consistencia, disponibilidad y tolerancia a particiones.",
    "Como la red se va a partir, la pregunta real es qué prefieres cuando ocurra: consistencia o disponibilidad."],
  "11.4": ["Consistencia fuerte frente a eventual", 0,
    "Consistencia fuerte frente a eventual, garantías intermedias como leer tus propias escrituras, y quórums de lectura y escritura.",
    "Permite razonar cuándo es aceptable leer un dato atrasado y cómo conseguir lecturas consistentes."],
  "12.1": ["Origen y motivación", 0,
    "Por qué Google, Amazon o Facebook necesitaron otros sistemas, los artículos de Bigtable y Dynamo, y el enfoque BASE frente a ACID.",
    "Entender qué problema resolvía NoSQL evita usarlo donde no hace falta."],
  "12.2": ["Las cuatro familias", 0,
    "Las cuatro familias: clave-valor, documental, columnar ancha y grafos, con su modelo, sus usos y sus sistemas.",
    "Es el mapa que ordena los Temas 13 a 16 y ayuda a elegir familia según el problema."],
  "12.3": ["Schema-on-write frente a schema-on-read", 0,
    "Validar la estructura al guardar (schema-on-write) o interpretarla al consultar (schema-on-read).",
    "Afecta a la calidad del dato, a los cambios de estructura y a la velocidad de ingesta."],
  "12.4": ["Modelado orientado a consultas", 0,
    "En NoSQL primero se enumeran las consultas y después se diseña una estructura que responda a cada una con una sola lectura.",
    "Invierte el método relacional: esas consultas vuelan, las imprevistas cuestan y hay que mantener coherentes las copias."],
  "13.1": ["Redis: estructuras de datos y comandos", 0,
    "Redis en memoria con strings, hashes, listas, conjuntos, conjuntos ordenados y streams, y sus comandos.",
    "Responde en fracciones de milisegundo y cada comando es atómico: ideal para cachés, contadores, colas y rankings."],
  "13.2": ["TTL, persistencia y Pub/Sub", 0,
    "Caducidad de claves con TTL, persistencia RDB y AOF, políticas de expulsión y mensajería con Pub/Sub y streams.",
    "Es lo que convierte a Redis en una caché natural y en un canal de mensajes."],
  "13.3": ["Patrones e invalidación de caché", 0,
    "El patrón cache-aside y las estrategias de invalidación: caducidad por TTL, borrado explícito y versionado de claves.",
    "La invalidación es el problema difícil: una caché mal invalidada sirve datos que ya no son ciertos."],
  "13.4": ["DynamoDB: partition key, sort key, GSIs y single-table design", 0,
    "El clave-valor gestionado de AWS: partition key, sort key, índices secundarios, capacidad y single-table design.",
    "Escala sin administrar servidores, pero solo si se diseña a partir de los patrones de acceso."],
  "14.1": ["Documentos, colecciones y BSON", 0,
    "Documentos con estructura de JSON agrupados en colecciones y guardados en BSON.",
    "Un pedido entero, con su cliente y sus líneas, cabe en un documento y se lee de una vez, sin joins."],
  "14.2": ["CRUD", 0,
    "Crear, leer, actualizar y borrar en mongosh, con filtros-documento y operadores como $gt, $in, $set, $inc y $push.",
    "Es la sintaxis básica para trabajar con MongoDB desde la consola o desde una aplicación."],
  "14.3": ["Modelado: embeber o referenciar", 0,
    "Cuándo guardar los datos relacionados dentro del documento y cuándo en otra colección, según la regla «lo que se consulta junto se guarda junto».",
    "Es la decisión de diseño central en MongoDB y marca el rendimiento y la coherencia."],
  "14.4": ["Aggregation pipeline", 0,
    "Encadenar etapas como $match, $group, $sort, $project y $lookup para analizar documentos.",
    "Es el equivalente de GROUP BY y los joins en MongoDB; poner $match lo antes posible lo acelera."],
  "14.5": ["Índices, validación de esquema y transacciones", 0,
    "Índices compuestos, multikey, de texto y TTL, validación con JSON Schema y transacciones ACID multidocumento.",
    "Dan a MongoDB rendimiento y garantías que a menudo se atribuyen solo a los relacionales."],
  "14.6": ["Replica sets y sharding", 0,
    "Replica sets con un primario y varios secundarios para la alta disponibilidad, y sharding con una buena clave de partición.",
    "Una mala clave de sharding concentra la carga en un nodo; una buena reparte datos y consultas."],
  "15.1": ["Arquitectura en anillo", 0,
    "Nodos iguales en un anillo de tokens que se comunican por gossip; las particiones se reparten por hashing consistente y se replican.",
    "Sin nodo principal no hay punto único de fallo, y añadir un nodo solo mueve una parte de los datos."],
  "15.2": ["CQL: partition key y clustering key", 0,
    "CQL y su clave primaria: la partition key decide los nodos y la clustering key ordena dentro de la partición; por qué ALLOW FILTERING es mala señal.",
    "Parece SQL, pero solo se consulta bien por la clave: hay que diseñarla pensando en las consultas."],
  "15.3": ["Consistencia ajustable", 0,
    "Elegir en cada lectura y escritura cuántas réplicas deben responder (ONE, QUORUM, ALL) y cómo se reparan las que se quedan atrás.",
    "Permite equilibrar velocidad y consistencia operación a operación."],
  "15.4": ["Modelado query-first", 0,
    "El método de modelado de Cassandra aplicado a Mercado Next: una tabla por consulta, con particiones acotadas.",
    "Es el caso extremo del modelado orientado a consultas: duplicar datos es lo normal."],
  "15.5": ["Tombstones y errores típicos", 0,
    "El camino de escritura (commit log, memtable, SSTable), por qué borrar crea tombstones y los errores típicos de diseño.",
    "Ignorarlos provoca lecturas lentas y fallos; hay que evitar patrones de cola y particiones gigantes."],
  "16.1": ["Property graph frente a RDF", 0,
    "Los dos grandes modelos de grafo: el grafo de propiedades y RDF, con sus tripletas y URI.",
    "Cada uno encaja con usos distintos; Neo4j, el sistema del tema, usa el grafo de propiedades."],
  "16.2": ["Nodos, relaciones, etiquetas y propiedades", 0,
    "Los cuatro elementos del grafo de propiedades: nodos, relaciones dirigidas con tipo, etiquetas y propiedades.",
    "Aquí las relaciones son tan importantes como los datos, y guardarlas así hace barato recorrerlas."],
  "16.3": ["Cypher básico y avanzado", 0,
    "Crear y consultar patrones con la sintaxis visual de Cypher, (a)-[:REL]->(b), caminos de longitud variable y shortestPath.",
    "Resuelve en pocas líneas consultas que en SQL serían complicadas, como amigos de amigos o rutas."],
  "16.4": ["Índices y restricciones", 0,
    "Índices para encontrar los nodos de partida de un patrón y restricciones que garantizan la unicidad.",
    "Localizan rápido dónde empieza el recorrido y protegen la calidad del dato."],
  "16.5": ["Algoritmos de grafos", 0,
    "Algoritmos de análisis de redes de la biblioteca Graph Data Science, como PageRank o la detección de comunidades.",
    "Descubren nodos influyentes y comunidades, útiles para fraude y recomendaciones."],
  "16.6": ["Estándares: GQL y SQL/PGQ", 0,
    "GQL (ISO 2024), el primer lenguaje de consulta de bases de datos estandarizado por ISO desde SQL, y SQL/PGQ, que consulta grafos sobre tablas.",
    "La estandarización reduce la dependencia de un proveedor y acerca los grafos al mundo SQL."],
  "17.1": ["Series temporales", 0,
    "Datos de solo añadir, masivos y consultados por rangos; particionado por tiempo, compresión, retención y downsampling, con TimescaleDB, InfluxDB o Prometheus.",
    "Métricas, sensores y monitorización generan volúmenes enormes que una tabla normal gestiona mal."],
  "17.2": ["Motores de búsqueda: Elasticsearch", 0,
    "Cómo busca Elasticsearch: documentos en índices, índice invertido, analizadores, relevancia BM25 y agregaciones.",
    "Busca texto rápido, tolera errores y ordena por relevancia; complementa a la base de datos, no la sustituye."],
  "18.1": ["OLTP frente a OLAP: por qué separar la analítica", 0,
    "Los problemas de analizar sobre la base de datos operacional: rendimiento, diseño, historia e integración de fuentes.",
    "Justifica copiar los datos a un sistema separado y optimizado para analizar: el data warehouse."],
  "18.2": ["Data warehouse: características y arquitectura", 0,
    "La definición de Inmon (orientado a temas, integrado, variable en el tiempo y no volátil), su arquitectura y los enfoques de Inmon y Kimball.",
    "Es el centro de la analítica de una empresa y el destino natural de la carga OLAP."],
  "18.3": ["Modelado dimensional: hechos, dimensiones y esquema en estrella", 0,
    "Declarar el grano, tablas de hechos con sus tipos de medidas, dimensiones con clave subrogada, y estrella frente a copo de nieve.",
    "Organiza los datos como los piensa el negocio («ventas por producto, cliente y mes») y simplifica los informes."],
  "18.4": ["Slowly Changing Dimensions", 1,
    "Las estrategias para los cambios lentos en las dimensiones; el tipo 2 conserva la historia con una fila por versión.",
    "Sin ellas, que un cliente se mude reescribiría la historia de sus ventas pasadas."],
  "18.5": ["Data lake", 0,
    "Un repositorio de datos de cualquier tipo, en su formato original y sobre almacenamiento barato, con schema-on-read.",
    "Guarda también datos no estructurados para ciencia de datos; sin gobierno se convierte en un pantano."],
  "18.6": ["Data warehouse frente a data lake", 0,
    "La comparación entre data warehouse y data lake por usuarios, rendimiento SQL, coste, casos de uso y gobierno.",
    "Explica la duplicación de mantener los dos, que es lo que el lakehouse intenta resolver (Bloque VI)."],
  "19.1": ["ETL frente a ELT", 0,
    "Extraer, transformar y cargar: dónde y cuándo se transforma en cada enfoque, y sus herramientas típicas.",
    "ELT se ha impuesto en la nube; ETL sigue teniendo sentido para filtrar o anonimizar datos antes de cargarlos."],
  "19.2": ["Almacenamiento por filas frente a por columnas", 0,
    "Qué se guarda junto en disco en cada formato y por qué el columnar lee solo las columnas necesarias y comprime mucho mejor.",
    "Explica por qué los almacenes analíticos son tan rápidos al agregar millones de filas."],
  "19.3": ["Formatos de fichero: Parquet, ORC y Avro, y cuándo usar cada uno", 0,
    "Los formatos del data lake medidos con un millón de ventas: Parquet y ORC, por columnas y con estadísticas, y Avro, por filas.",
    "El formato decide espacio, velocidad y compatibilidad; Parquet es la opción analítica por defecto y Avro destaca en streaming."],
  "20.1": ["Snowflake: arquitectura con almacenamiento y cómputo separados", 0,
    "Las tres capas independientes de Snowflake: almacenamiento, cómputo en virtual warehouses y servicios.",
    "Separar almacenamiento y cómputo permite crecer y pagar cada parte por separado."],
  "20.2": ["Virtual warehouses y modelo de costes", 0,
    "Las tallas de los virtual warehouses, los créditos facturados por segundo, la suspensión automática y cómo escalar.",
    "Dimensionar bien los warehouses es lo que controla la factura en Snowflake."],
  "20.3": ["Bases de datos, esquemas, tablas y stages", 0,
    "La jerarquía cuenta → base de datos → esquema → tabla, los tipos de tabla y los stages desde los que se cargan ficheros.",
    "Organizar bien objetos y ubicaciones es el primer paso para cargar datos."],
  "20.4": ["Carga de datos: COPY INTO y Snowpipe", 0,
    "La carga masiva desde un stage con COPY INTO y la carga continua con Snowpipe.",
    "Llevan los datos al almacén sin duplicarlos aunque la orden se repita."],
  "20.5": ["Time Travel y zero-copy cloning", 0,
    "Consultar o restaurar los datos tal como estaban en un momento pasado y clonar tablas al instante sin copiar los datos.",
    "Permiten deshacer errores y crear entornos de prueba en segundos."],
  "20.6": ["Roles y permisos en Snowflake", 0,
    "El control de acceso basado en roles, los roles de sistema, su jerarquía y GRANT … ON FUTURE TABLES.",
    "Aplica el mínimo privilegio en un almacén compartido por muchos equipos."],
  "20.7": ["Data sharing y Snowpark", 1,
    "Compartir datos con otras cuentas sin copiarlos, el Marketplace y Snowpark para trabajar con DataFrames dentro de Snowflake.",
    "Evita copias desincronizadas entre empresas y acerca la ciencia de datos al almacén."],
  "20.8": ["BigQuery: modelo serverless, datasets y pago por consulta", 0,
    "El modelo serverless de BigQuery con slots, la jerarquía proyecto → dataset → tabla y el pago por bytes procesados o por capacidad.",
    "Bajo demanda se paga por lo que se lee: seleccionar solo las columnas necesarias reduce el coste."],
  "20.9": ["BigQuery: particionado y clustering", 0,
    "Dividir las tablas por fecha o por rangos para leer solo lo necesario, y ordenar dentro de cada partición con clustering.",
    "Filtrar por la columna de partición reduce mucho los bytes leídos y, con ellos, la factura."],
  "20.10": ["Snowflake frente a BigQuery", 0,
    "La comparación entre Snowflake y BigQuery: precio del cómputo, organización física, compartir datos y carga.",
    "Ayuda a elegir según la nube de la empresa, el patrón de uso y las herramientas del equipo."],
  "21.1": ["Cuándo una base de datos tradicional se queda corta", 0,
    "Las «V» del Big Data, el reparto del trabajo entre muchas máquinas y el límite que marca la ley de Amdahl.",
    "Un SGBD en un buen servidor resuelve la mayoría de los casos; aquí se ve cuándo deja de bastar."],
  "21.2": ["Almacenamiento distribuido: de HDFS al object storage (S3, ADLS)", 0,
    "HDFS, que repartía y replicaba bloques entre los nodos, y su relevo por el almacenamiento de objetos (S3, ADLS, Google Cloud Storage).",
    "El almacenamiento de objetos separa almacenamiento y cómputo y es la base de los data lakes actuales."],
  "21.3": ["SQL sobre Big Data: Hive, Spark SQL y Trino", 0,
    "Hive, Spark SQL y Trino: tres motores para consultar con SQL los ficheros del data lake.",
    "Permiten usar el SQL que ya conoces sobre datos que no están en una base de datos."],
  "21.4": ["Formatos de tabla abiertos: Delta Lake e Iceberg", 0,
    "Delta Lake e Iceberg, que añaden a los ficheros Parquet transacciones ACID, MERGE, control de esquema y time travel.",
    "Hacen que un data lake se comporte como una tabla de base de datos fiable."],
  "21.5": ["El lakehouse", 0,
    "La propuesta de una sola plataforma que une data lake y data warehouse sobre formatos abiertos.",
    "Evita mantener dos copias y dos sistemas, y sirve a la vez al BI y a la ciencia de datos."],
  "21.6": ["Arquitectura medallion: bronze, silver y gold", 0,
    "Organizar los datos del lakehouse en tres capas: bronze (en bruto), silver (limpios) y gold (listos para el negocio).",
    "Separa responsabilidades y permite rehacer las capas superiores sin volver a las fuentes."],
  "22.1": ["Qué es Databricks y cómo se organiza: workspace, clusters y SQL warehouses", 0,
    "Qué es Databricks y sus piezas: workspace, clústeres de uso general y de trabajo, cómputo serverless y SQL warehouses.",
    "Elegir el cómputo adecuado para cada tarea afecta al rendimiento y al coste."],
  "22.2": ["Unity Catalog: catálogo, esquema y tabla", 0,
    "La capa de gobierno de Databricks y su espacio de nombres de tres niveles: catálogo, esquema y objeto.",
    "Centraliza permisos, auditoría, linaje y descubrimiento de datos e IA en un solo sitio."],
  "22.3": ["Tablas gestionadas y externas, vistas y volúmenes", 0,
    "Tablas gestionadas y externas, vistas, vistas materializadas y volúmenes para guardar ficheros.",
    "El tipo de objeto decide quién gestiona los datos y qué pasa con ellos al borrar la tabla."],
  "22.4": ["Crear y consultar tablas Delta con SQL", 0,
    "Crear, llenar y consultar tablas Delta con el SQL que ya conoces y algunas extensiones de Databricks.",
    "Muestra que el SQL de los temas anteriores sirve también en el lakehouse."],
  "22.5": ["Operaciones Delta: MERGE, Time Travel, OPTIMIZE y clustering", 0,
    "MERGE para aplicar lotes de cambios, Time Travel, OPTIMIZE, clustering y VACUUM.",
    "Son las operaciones que mantienen las tablas correctas, recuperables y rápidas."],
  "22.6": ["Ingesta de datos: COPY INTO y Auto Loader", 0,
    "Llevar ficheros a tablas Delta con COPY INTO, idempotente y por lotes, o con Auto Loader, incremental y continuo.",
    "Es la entrada de datos a la capa bronze sin duplicados ni procesos manuales."],
  "22.7": ["Permisos y gobierno en Unity Catalog", 0,
    "Permisos que se heredan hacia abajo, los tres privilegios necesarios para leer una tabla, máscaras, filtros de fila, linaje y auditoría.",
    "Gobiernan quién ve qué en una plataforma que comparten muchos equipos."],
  "22.8": ["Pipelines declarativos y jobs", 1,
    "Pipelines declarativos con expectativas de calidad, y jobs para orquestar el paso de bronze a gold.",
    "Automatizan dependencias, reintentos y controles de calidad que a mano serían laboriosos."],
  "22.9": ["Databricks SQL y conexión con herramientas de BI", 0,
    "El editor de consultas, los cuadros de mando y las alertas de Databricks SQL, y la conexión de herramientas de BI a un SQL warehouse.",
    "Lleva los datos del lakehouse a los analistas y a sus herramientas habituales."],
  "22.10": ["De la tabla al modelo: el puente con Machine Learning", 1,
    "Entrenar y registrar modelos con MLflow sobre las mismas tablas gobernadas que usa el BI.",
    "Evita copias para la ciencia de datos y gobierna también los modelos en Unity Catalog."],
  "23.1": ["Inyección SQL y cómo evitarla", 0,
    "Cómo se produce la inyección SQL al concatenar texto del usuario y cómo se evita con consultas parametrizadas, mínimo privilegio y listas blancas.",
    "Lleva más de veinte años entre las vulnerabilidades web más explotadas."],
  "23.2": ["Mínimo privilegio", 0,
    "Cada usuario, aplicación o proceso con exactamente los permisos que necesita: una cuenta por persona, roles, sin superusuarios en las aplicaciones y secretos protegidos.",
    "Limita el daño de un error, de un empleado malintencionado o de unas credenciales robadas."],
  "23.3": ["RGPD aplicado a bases de datos", 0,
    "Lo que exige el RGPD a una base de datos: minimizar, limitar la conservación, proteger desde el diseño y poder localizar y suprimir los datos de una persona.",
    "Afecta a cualquier organización que trate datos de personas en la UE, y su incumplimiento se sanciona."],
  "23.4": ["Backups frente a alta disponibilidad", 0,
    "La alta disponibilidad con réplicas y conmutación automática frente a las copias de seguridad, y la disponibilidad expresada en «nueves».",
    "Una réplica copia también los errores: hacen falta ambas porque protegen frente a problemas distintos."],
  "23.5": ["Cómo elegir base de datos: criterios y casos", 0,
    "Los criterios para elegir base de datos (modelo, patrones de acceso, consistencia, escala, latencia, coste y equipo) aplicados a casos.",
    "No existe la mejor base de datos, sino la adecuada: se empieza por la relacional y se añade solo lo necesario."],
  "23.6": ["Caso final: diseñad la arquitectura de datos de una empresa", 0,
    "Diseñar la arquitectura de datos completa de Mercado Next a partir de sus requisitos, justificando cada pieza.",
    "Integra toda la asignatura: qué pieza usar para cada necesidad y por qué."],
  "24.1": ["Qué cambia la IA generativa en el trabajo con datos", 0,
    "Qué es un LLM y qué abre en el trabajo con datos: escribir y explicar SQL, preguntar en lenguaje natural y buscar por significado.",
    "Genera texto plausible, no necesariamente correcto: hay que saber dónde aporta y dónde no."],
  "24.2": ["El LLM como copiloto de SQL: escribir, explicar y revisar consultas", 0,
    "Cómo pedir SQL a un LLM (esquema, dialecto y una pregunta precisa) y cómo revisar críticamente lo que produce.",
    "Acelera el trabajo, pero alguien tiene que entender y validar la consulta antes de usarla."],
  "24.3": ["Text-to-SQL: cómo funciona (esquema, contexto y ejemplos) y por qué falla", 0,
    "Las etapas de un sistema que convierte preguntas en SQL, el papel del esquema, el contexto y los ejemplos, y por qué falla.",
    "Su calidad depende sobre todo del contexto; la ambigüedad y los joins mal elegidos dan respuestas erróneas."],
  "24.4": ["Bases de datos vectoriales y pgvector: embeddings y búsqueda semántica", 0,
    "Los embeddings como vectores de significado, las medidas de similitud y la búsqueda en PostgreSQL con pgvector e índices HNSW o IVFFlat.",
    "Permiten buscar por significado y combinarlo con filtros SQL normales."],
  "24.5": ["RAG sobre los datos de la empresa", 0,
    "Recuperar primero la información relevante de la empresa y entregársela al modelo junto con la pregunta.",
    "Reduce las alucinaciones y permite responder con datos internos y actualizados."],
  "24.6": ["Knowledge graphs y GraphRAG", 1,
    "Los grafos de conocimiento combinados con vectores para responder preguntas globales o relacionales.",
    "Resuelve preguntas que el RAG con vectores responde mal, como los temas comunes de todas las reclamaciones."],
  "24.7": ["Conectar un LLM a una base de datos: MCP y agentes de datos en Databricks y Snowflake", 0,
    "Agentes que usan herramientas en bucle y el Model Context Protocol para conectarlos a las fuentes de datos, con las opciones de Databricks y Snowflake.",
    "Estandariza la conexión de la IA con los datos respetando los permisos de cada plataforma."],
  "24.8": ["Seguridad y gobierno: usuarios de solo lectura, validación del SQL generado y auditoría", 0,
    "Defensa por capas: usuario de solo lectura, validación del SQL generado, límites, protección de datos personales, inyección de prompts y auditoría.",
    "Hay que tratar el SQL de una IA como el de un desconocido: no se ejecuta sin validarlo ni registrarlo."],
};

// ---------- mapa del temario: bloques → temas → apartados ----------
// La estructura sale de BLOQUES (b0.js) y de window.__deck.S; los títulos y textos de los apartados, de las constantes de arriba.
const CSS = `
[data-w="mapa"] .mtree { position: relative; flex: 1; min-width: 0; }
[data-w="mapa"] .mlinks { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
[data-w="mapa"] .mn { position: absolute; display: flex; align-items: center; gap: 8px; text-align: left; border: 1px solid var(--line); background: var(--surface);
  color: var(--ink); border-radius: 10px; padding: 0 12px; font: 15px/1.25 var(--font-text); cursor: pointer; overflow: hidden;
  transition: left .5s ease, top .5s ease, width .5s ease, height .5s ease, opacity .35s ease, background .2s, border-color .2s; }
[data-w="mapa"] .mn:hover { border-color: var(--blue); }
[data-w="mapa"] .mn b { font-family: var(--font-title); color: var(--blue-d); flex: none; }
:root[data-theme="dark"] [data-w="mapa"] .mn b { color: var(--blue); }
:root[data-theme="dark"] [data-w="mapa"] .mn.root b, :root[data-theme="dark"] [data-w="mapa"] .mn.sel b { color: #fff; }
[data-w="mapa"] .mn .t { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
[data-w="mapa"] .mn.wrap .t { white-space: normal; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
[data-w="mapa"] .mn.blk { font-family: var(--font-title); font-weight: 700; font-size: 16px; color: var(--title); background: var(--surface-2); border-left: 5px solid var(--blue); }
[data-w="mapa"] .mn.blk.wrap .t { white-space: normal; }
[data-w="mapa"] .mn.blk .sub { display: block; font-family: var(--font-text); font-weight: 400; font-size: 14px; color: var(--muted); }
[data-w="mapa"] .mn.root { flex-direction: column; justify-content: center; text-align: center; background: var(--blue); color: #fff; border-color: var(--blue); cursor: default; }
[data-w="mapa"] .mn.root b { color: #fff; font-size: 26px; }
[data-w="mapa"] .mn.on { background: var(--tint-blue); border-color: var(--blue); }
[data-w="mapa"] .mn.sel { background: var(--blue); border-color: var(--blue); color: #fff; }
[data-w="mapa"] .mn.sel b, [data-w="mapa"] .mn.sel .sub { color: #fff; }
[data-w="mapa"] .mn.off { opacity: 0; pointer-events: none; }
[data-w="mapa"] .mn .pl { flex: none; font-size: 12px; font-weight: 700; border-radius: 20px; padding: 1px 8px; background: var(--tint-gray); color: var(--mid); }
[data-w="mapa"] .mn.sel .pl { background: rgba(255,255,255,.25); color: #fff; }
[data-w="mapa"] .mpanel { flex: 0 0 370px; display: flex; flex-direction: column; gap: 10px; padding: 18px 22px; overflow: hidden; }
[data-w="mapa"] .mpanel h3 { font-family: var(--font-title); font-size: 26px; line-height: 1.15; color: var(--title); margin: 0; }
[data-w="mapa"] .mpanel .lb { font-family: var(--font-title); font-weight: 700; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: var(--blue-d); margin-top: 4px; }
:root[data-theme="dark"] [data-w="mapa"] .mpanel .lb { color: var(--blue); }
[data-w="mapa"] .mpanel p { font-size: 17px; line-height: 1.45; margin: 0; color: var(--ink); }
[data-w="mapa"] .mpanel .go { margin-top: auto; align-self: flex-start; }
`;

export const widgets = {
  mapa(el) {
    const life = widgetScope(el);
    const p = pal();
    el.innerHTML = `<style>${CSS}</style><div class="w-title">Bloques, temas y apartados<span class="live">INTERACTIVO</span></div>
      <div style="display:flex;gap:20px;flex:1;min-height:0"><div class="mtree"><svg class="mlinks"></svg></div><div class="card mpanel"></div></div>`;
    const tree = el.querySelector('.mtree'), panel = el.querySelector('.mpanel');
    const links = d3.select(el.querySelector('.mlinks'));
    let st = { view: 'general', b: null, t: null, a: null };
    let B = [], T = [], A = [], ids = {}, nodes = {};

    const init = () => {
      const S = window.__deck.S;
      S.forEach((s) => { if (s.sec && !ids[s.sec]) ids[s.sec] = s.id; });
      T = S.filter((s) => s.isTema).map((s) => ({ key: 'T' + s.t.n, n: s.t.n, title: s.t.title, b: s.b.n, id: s.id }));
      A = Object.entries(MAPA_APARTADOS).map(([sec, [title, plus, que, por]]) => ({ key: 'A' + sec, sec, t: +sec.split('.')[0], title, plus, que, por, id: ids[sec] }));
      B = BLOQUES.map(([n, title, range, q]) => ({ key: 'B' + n, n, title, range, q, temas: T.filter((t) => t.b === n) }));
      const mk = (key, cls, html, onClick) => {
        const n = document.createElement('button');
        n.className = 'mn ' + cls; n.innerHTML = html; n.dataset.k = key;
        if (onClick) n.onclick = onClick; else n.tabIndex = -1;
        tree.appendChild(n); nodes[key] = n;
      };
      mk('R', 'root', `<b>SGBD</b><span style="font-size:14px">${B.length} bloques<br>${T.length} temas<br>${A.length} apartados</span>`);
      B.forEach((b) => mk(b.key, 'blk', `<span class="t"><span style="color:var(--blue)">${b.n}</span> · ${esc(b.title)}<span class="sub">Temas ${b.range}</span></span>`, () => pickB(b)));
      T.forEach((t) => mk(t.key, '', `<b>Tema ${t.n}</b><span class="t">${esc(t.title)}</span>`, () => pickT(t)));
      A.forEach((a) => mk(a.key, 'wrap', `<b>${a.sec}</b><span class="t">${esc(a.title)}</span>${a.plus ? '<span class="pl">(+)</span>' : ''}`, () => pickA(a)));
      render();
    };

    // posiciones de cada nodo según la vista
    const layout = () => {
      const W = tree.clientWidth, H = tree.clientHeight, L = {};
      const tb = (t) => B.find((b) => b.n === t.b);
      if (st.view === 'general') {
        const rw = 118, bx = rw + 28, bw = 312, tx = bx + bw + 36, tw = W - tx, gap = 9, rh = (H - gap * (B.length - 1)) / T.length;
        let y = 0;
        B.forEach((b) => {
          const y0 = y;
          b.temas.forEach((t) => { L[t.key] = { x: tx, y, w: tw, h: rh - 3 }; y += rh; });
          L[b.key] = { x: bx, y: y0, w: bw, h: y - y0 - 3 };
          y += gap;
        });
        L.R = { x: 0, y: H / 2 - 90, w: rw, h: 180 };
        A.forEach((a) => { const t = L['T' + a.t]; L[a.key] = { ...t, off: true }; });
      } else {
        const bw = 250, bh = H / B.length, tx = bw + 40, tw = st.view === 'tema' ? 270 : 430, ax = tx + tw + 40, aw = W - ax;
        B.forEach((b, i) => { L[b.key] = { x: 0, y: i * bh + 4, w: bw, h: bh - 8 }; });
        L.R = { x: -150, y: H / 2 - 90, w: 118, h: 180, off: true };
        const bt = B.find((b) => b.n === st.b).temas, th = Math.min(96, H / bt.length), ty = (H - th * bt.length) / 2;
        T.forEach((t) => { const i = bt.indexOf(t); L[t.key] = i >= 0 ? { x: tx, y: ty + i * th + 4, w: tw, h: th - 8 } : { ...L[tb(t).key], off: true }; });
        const ta = st.view === 'tema' ? A.filter((a) => a.t === st.t) : [], ah = ta.length ? Math.min(76, H / ta.length) : 0, ay = (H - ah * ta.length) / 2;
        A.forEach((a) => { const i = ta.indexOf(a); L[a.key] = i >= 0 ? { x: ax, y: ay + i * ah + 3, w: aw, h: ah - 6 } : { ...L['T' + a.t], off: true }; });
      }
      return L;
    };

    const curve = (a, b) => { const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x, y2 = b.y + b.h / 2, m = (x1 + x2) / 2; return `M${x1},${y1} C${m},${y1} ${m},${y2} ${x2},${y2}`; };
    const render = () => {
      const L = layout();
      Object.entries(nodes).forEach(([k, n]) => {
        const r = L[k];
        Object.assign(n.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
        n.classList.toggle('off', !!r.off);
        n.tabIndex = r.off || k === 'R' ? -1 : 0;
        const big = r.h >= 40;
        if (k[0] === 'B') n.querySelector('.sub').style.display = big ? '' : 'none';
        if (k[0] === 'T' || k[0] === 'B') n.classList.toggle('wrap', big);
        const sel = (k === 'B' + st.b && !st.t) || (k === 'T' + st.t && !st.a) || k === 'A' + st.a;
        n.classList.toggle('sel', sel);
        n.classList.toggle('on', !sel && (k === 'B' + st.b || k === 'T' + st.t || (st.view === 'general' && st.b && k[0] === 'T' && T.find((t) => t.key === k).b === st.b)));
      });
      const E = [];
      if (st.view === 'general') {
        B.forEach((b) => { E.push([L.R, L[b.key], 'R' + b.key, b.n === st.b]); b.temas.forEach((t) => E.push([L[b.key], L[t.key], b.key + t.key, b.n === st.b])); });
      } else {
        const b = B.find((x) => x.n === st.b);
        b.temas.forEach((t) => E.push([L[b.key], L[t.key], b.key + t.key, t.n === st.t]));
        if (st.view === 'tema') A.filter((a) => a.t === st.t).forEach((a) => E.push([L['T' + st.t], L[a.key], 'T' + st.t + a.key, a.sec === st.a]));
      }
      links.selectAll('path').data(E, (d) => d[2]).join(
        (en) => en.append('path').attr('fill', 'none').attr('stroke-width', 2).attr('opacity', 0).attr('d', (d) => curve(d[0], d[0]))
          .call((s) => s.transition().duration(500).attr('opacity', 1).attr('d', (d) => curve(d[0], d[1]))),
        (up) => up.call((s) => s.transition().duration(500).attr('opacity', 1).attr('d', (d) => curve(d[0], d[1]))),
        (ex) => ex.call((s) => s.transition().duration(250).attr('opacity', 0).remove()))
        .attr('stroke', (d) => (d[3] ? p.blue : p.line)).attr('stroke-width', (d) => (d[3] ? 3 : 2));
      panel.innerHTML = info();
    };

    // panel lateral
    const crumb = () => {
      const parts = [st.b && `Bloque ${st.b}`, st.t && `Tema ${st.t}`, st.a && st.a].filter(Boolean).join(' › ');
      return `<div style="display:flex;gap:10px;align-items:center"><button class="btn bk" style="white-space:nowrap;${st.view === 'general' && !st.b ? 'opacity:.45' : ''}" ${st.view === 'general' && !st.b ? 'disabled' : ''}>← Vista general</button>
        <span style="flex:1;min-width:0;font-size:14px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${parts}</span></div>`;
    };
    const go = (id, txt) => (id ? `<button class="btn primary go" data-go="${id}">${txt} →</button>` : '');
    const info = () => {
      if (st.a) {
        const a = A.find((x) => x.sec === st.a);
        return `${crumb()}<div class="w-title" style="margin:6px 0 0">Apartado ${a.sec} · Tema ${a.t}${a.plus ? ' <span class="pill gray">AMPLIACIÓN (+)</span>' : ''}</div>
          <h3>${esc(a.title)}</h3><div class="lb">Qué se ve</div><p>${esc(a.que)}</p><div class="lb">Por qué importa</div><p>${esc(a.por)}</p>${go(a.id, 'Ir a la diapositiva')}`;
      }
      if (st.t) {
        const t = T.find((x) => x.n === st.t), [que, por] = MAPA_TEMAS[t.n] || ['', ''], as = A.filter((a) => a.t === t.n), np = as.filter((a) => a.plus).length;
        return `${crumb()}<div class="w-title" style="margin:6px 0 0">Tema ${t.n} · Bloque ${t.b} · ${as.length} apartados${np ? `, ${np} de ampliación` : ''}</div>
          <h3>${esc(t.title)}</h3><div class="lb">Qué se aprende</div><p>${esc(que)}</p><div class="lb">Por qué importa</div><p>${esc(por)}</p>${go(t.id, 'Ir al tema')}`;
      }
      if (st.b) {
        const b = B.find((x) => x.n === st.b), na = A.filter((a) => b.temas.some((t) => t.n === a.t)).length;
        return `${crumb()}<div class="w-title" style="margin:6px 0 0">Bloque ${b.n} · Temas ${b.range} · ${na} apartados</div><h3>${esc(b.title)}</h3>
          <div class="lb">Pregunta a la que responde</div><p>${esc(b.q)}</p><div class="lb">Temas</div>
          <p style="font-size:16px">${b.temas.map((t) => `<b>${t.n}</b> ${esc(t.title)}`).join('<br>')}</p>${go('b' + b.n, 'Ir al bloque')}`;
      }
      const np = A.filter((a) => a.plus).length;
      return `${crumb()}<h3 style="margin-top:6px">Cómo se organiza el temario</h3>
        <p><b>${B.length} bloques</b> que van de los fundamentos a la IA generativa, <b>${T.length} temas</b> y <b>${A.length} apartados</b>, con la misma numeración que el Word.</p>
        <p>Los <span class="pill gray">(+)</span> son de ampliación (${np}): se pueden saltar sin perder el hilo.</p>
        <div class="lb">Cómo se usa</div><p>Haz clic en un <b>bloque</b> para ver su pregunta, en un <b>tema</b> para desplegar sus apartados y en un <b>apartado</b> para saber qué se ve y por qué importa. Desde aquí puedes ir a su diapositiva.</p>`;
    };

    const pickB = (b) => { st = st.view === 'general' ? { view: 'general', b: st.b === b.n ? null : b.n, t: null, a: null } : { view: 'bloque', b: b.n, t: null, a: null }; render(); };
    const pickT = (t) => { st = { view: 'tema', b: t.b, t: t.n, a: null }; render(); };
    const pickA = (a) => { st = { ...st, a: st.a === a.sec ? null : a.sec }; render(); };
    panel.addEventListener('click', (e) => { if (e.target.closest('.bk')) { st = { view: 'general', b: null, t: null, a: null }; render(); } });
    life.timeout(init, 0);
    return () => { links.selectAll('path').interrupt(); };
  }
};
