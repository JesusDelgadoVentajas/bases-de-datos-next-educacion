// Resúmenes de cada tema, tomados del temario en Word
export const RESUMENES = {
 "1": [
  "Un sistema necesita una base de datos cuando tiene que recordar información de forma duradera, compartida y fiable; un dato solo se convierte en información con su contexto y sus metadatos.",
  "La base de datos son los datos; el SGBD, el programa que los gestiona y que asume las reglas, los permisos, la concurrencia y la recuperación que una hoja de cálculo no garantiza.",
  "Cada etapa de la historia se suma a la anterior, y no hay un modelo de datos mejor que los demás: cada uno encaja con un tipo de problema.",
  "Registrar (OLTP) y analizar (OLAP) son trabajos distintos que piden bases de datos organizadas de forma distinta; cada vez más viven en la nube como servicios gestionados.",
  "Confiar en los datos exige calidad, reglas, concurrencia, permisos, privacidad, disponibilidad y recuperación, y cada bloque de la asignatura responde a una etapa del crecimiento de Mercado Next."
 ],
 "2": [
  "El modelo E/R describe la realidad con entidades, atributos y relaciones, sin pensar todavía en tablas.",
  "La cardinalidad máxima (1:1, 1:N, N:M) y la participación (total o parcial) se combinan en la notación (mín, máx).",
  "Las entidades débiles se identifican a través de su propietaria; las jerarquías expresan herencia con restricciones de disyunción y completitud.",
  "Chen, <i>crow's foot</i> y UML expresan lo mismo con distinta notación; <i>crow's foot</i> es la habitual en herramientas de bases de datos."
 ],
 "3": [
  "Una relación es un conjunto de tuplas sobre unos dominios; en SQL es una tabla, aunque SQL admite duplicados.",
  "Las claves candidatas son superclaves mínimas; una se elige como primaria y el resto son alternativas (<code>UNIQUE</code>). Las claves foráneas relacionan tablas.",
  "Las restricciones de integridad (dominio, entidad, unicidad, <code>NOT NULL</code>, <code>CHECK</code>, referencial) las garantiza el SGBD para todos los datos.",
  "El paso de E/R a tablas sigue reglas fijas: 1:N con FK en el lado N, N:M con tabla intermedia, 1:1 con FK única."
 ],
 "4": [
  "La redundancia provoca anomalías de inserción, actualización y borrado.",
  "Una dependencia funcional X → Y indica que X determina a Y; las parciales y transitivas son el origen de los problemas.",
  "1FN exige atomicidad, 2FN elimina dependencias parciales, 3FN las transitivas y FNBC exige que todo determinante sea superclave.",
  "Una buena descomposición es sin pérdida y, si es posible, preserva las dependencias.",
  "Desnormalizar es legítimo cuando se hace de forma consciente, medida y con un mecanismo que mantenga la coherencia."
 ],
 "5": [
  "SQL es un lenguaje declarativo y estandarizado (ISO/IEC 9075) con muchos dialectos; sus sentencias se agrupan en DDL, DML, DCL y TCL.",
  "El tipo de cada columna es su primera restricción: <code>numeric</code> para dinero, <code>timestamptz</code> para instantes, <code>jsonb</code> para datos semiestructurados.",
  "PostgreSQL organiza los objetos en servidor → base de datos → esquema → tabla; MySQL no distingue base de datos y esquema.",
  "<code>CREATE TABLE</code> define columnas y restricciones; <code>ALTER TABLE</code> las modifica; <code>DROP</code>, <code>TRUNCATE</code> y <code>DELETE</code> eliminan cosas distintas."
 ],
 "6": [
  "<code>INSERT</code> añade filas (una, varias o el resultado de un <code>SELECT</code>); <code>RETURNING</code> devuelve lo insertado, incluidos los valores generados.",
  "<code>UPDATE</code> y <code>DELETE</code> actúan sobre las filas que cumplen el <code>WHERE</code>; sin <code>WHERE</code>, sobre toda la tabla.",
  "<code>ON CONFLICT</code> resuelve el <i>upsert</i> en PostgreSQL; <code>MERGE</code> es la alternativa estándar, más potente para sincronizar tablas.",
  "<code>COPY</code> carga y exporta ficheros en el servidor; <code>\\copy</code> hace lo mismo con ficheros del cliente.",
  "Antes de escribir: <code>SELECT</code> con el mismo <code>WHERE</code>, transacción y comprobación del número de filas."
 ],
 "7": [
  "<code>SELECT … FROM … WHERE … ORDER BY … LIMIT</code> es el esqueleto de toda consulta; los alias (<code>AS</code>) dan nombre a columnas y tablas.",
  "Las funciones de texto, número, fecha, <code>CAST</code> y <code>CASE</code> transforman los valores fila a fila.",
  "Los agregados resumen; <code>GROUP BY</code> los calcula por grupo y <code>HAVING</code> filtra grupos. <code>ROLLUP</code> y <code>CUBE</code> añaden subtotales.",
  "El orden lógico es FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT.",
  "<code>NULL</code> significa desconocido: se compara con <code>IS NULL</code> y altera el resultado de comparaciones, agregados y operaciones."
 ],
 "8": [
  "<code>INNER JOIN</code> conserva solo las filas emparejadas; <code>LEFT</code>, <code>RIGHT</code> y <code>FULL</code> conservan también las que no tienen pareja, con <code>NULL</code>.",
  "Las subconsultas pueden ser escalares, de lista o correlacionadas; <code>NOT EXISTS</code> es más seguro que <code>NOT IN</code> cuando hay nulos.",
  "<code>UNION</code>, <code>INTERSECT</code> y <code>EXCEPT</code> eliminan duplicados; <code>UNION ALL</code> no.",
  "Las CTE (<code>WITH</code>) hacen legibles las consultas largas; <code>WITH RECURSIVE</code> recorre jerarquías.",
  "Las funciones ventana calculan rankings, comparaciones (<code>LAG</code>, <code>LEAD</code>) y acumulados sin agrupar las filas."
 ],
 "9": [
  "En PostgreSQL usuarios y grupos son roles; los permisos se conceden a roles de grupo con <code>GRANT</code> y se retiran con <code>REVOKE</code>, aplicando el mínimo privilegio.",
  "Las transacciones (<code>BEGIN … COMMIT/ROLLBACK</code>) agrupan operaciones; los <code>SAVEPOINT</code> permiten deshacer parcialmente.",
  "Las vistas guardan consultas; las vistas materializadas guardan resultados y se refrescan a demanda.",
  "Funciones, procedimientos y triggers ejecutan lógica en el servidor; RLS filtra filas por usuario.",
  "Desde Python se accede con drivers, pandas u ORMs, y los cambios de esquema se gestionan con migraciones versionadas."
 ],
 "10": [
  "Un índice B-tree permite localizar filas con unas pocas lecturas: su altura crece con el logaritmo del número de filas. Acelera las consultas selectivas y ralentiza las escrituras.",
  "<code>EXPLAIN ANALYZE</code> muestra el plan elegido, con costes estimados y tiempos y filas reales; un <code>Seq Scan</code> que descarta casi todas las filas sugiere un índice que falta.",
  "ACID: atomicidad, consistencia, aislamiento y durabilidad.",
  "La concurrencia provoca anomalías (lectura sucia, no repetible, fantasma, de serialización); los niveles de aislamiento las controlan. PostgreSQL usa <code>READ COMMITTED</code> y MVCC por defecto.",
  "Las copias de seguridad se diseñan a partir del RPO y el RTO, y solo valen si se ha probado su restauración."
 ],
 "11": [
  "El escalado vertical es simple pero limitado; el horizontal reparte datos y carga entre máquinas a cambio de complejidad.",
  "La replicación copia los datos (tolerancia a fallos, lecturas); el sharding los reparte (volumen, escrituras). El hashing consistente minimiza los movimientos al añadir nodos.",
  "CAP: cuando la red se parte, hay que elegir entre consistencia y disponibilidad.",
  "La consistencia eventual acepta lecturas atrasadas temporalmente; con quórums R + W > N se obtienen lecturas consistentes."
 ],
 "12": [
  "NoSQL nació para escalar en horizontal con alta disponibilidad, renunciando a parte de las garantías relacionales (BASE frente a ACID).",
  "Hay cuatro familias: clave-valor, documental, columnar ancha y grafos.",
  "<i>Schema-on-write</i> valida al guardar; <i>schema-on-read</i> interpreta al consultar.",
  "En NoSQL se modela a partir de las consultas y se desnormaliza a propósito."
 ],
 "13": [
  "Redis es un almacén clave-valor en memoria con estructuras propias (strings, hashes, listas, conjuntos, conjuntos ordenados, streams); cada comando es atómico.",
  "El TTL, la persistencia RDB/AOF y las políticas de expulsión lo hacen ideal como caché; Pub/Sub difunde mensajes sin guardarlos.",
  "Cache-aside es el patrón de caché más común; la invalidación combina TTL, borrado explícito y versionado.",
  "DynamoDB es clave-valor gestionado: la partition key reparte, la sort key ordena, los GSI/LSI permiten otros accesos y el single-table design resuelve cada consulta con una petición."
 ],
 "14": [
  "MongoDB guarda documentos BSON en colecciones; un documento puede anidar objetos y arrays y ocupa hasta 16 MB.",
  "El CRUD usa filtros-documento y operadores (<code>$gt</code>, <code>$in</code>, <code>$set</code>, <code>$inc</code>, <code>$push</code>).",
  "«Lo que se consulta junto se guarda junto»: se embebe lo acotado y leído en conjunto, y se referencia lo que crece sin límite o se comparte.",
  "El aggregation pipeline encadena etapas (<code>$match</code>, <code>$group</code>, <code>$sort</code>, <code>$lookup</code>…).",
  "Hay índices, validación con JSON Schema y transacciones multidocumento; los replica sets dan alta disponibilidad y el sharding, escala."
 ],
 "15": [
  "Cassandra distribuye los datos en un anillo de tokens sin nodo principal; la partition key decide los nodos y el RF el número de copias.",
  "La clustering key ordena las filas dentro de cada partición; solo se consulta eficientemente por la clave.",
  "La consistencia se ajusta por operación (<code>ONE</code>, <code>QUORUM</code>, <code>ALL</code>…).",
  "Se modela una tabla por consulta, con particiones acotadas.",
  "Los borrados generan tombstones que solo se purgan al compactar: hay que evitar patrones de cola y particiones gigantes."
 ],
 "16": [
  "El grafo de propiedades modela nodos con etiquetas, relaciones dirigidas con tipo y propiedades en ambos; RDF modela tripletas con URI.",
  "Cypher describe patrones con sintaxis visual: <code>(a)-[:REL]-&gt;(b)</code>; los caminos variables (<code>*1..3</code>) y <code>shortestPath</code> resuelven recorridos profundos.",
  "Los índices localizan los nodos de partida y las restricciones garantizan unicidad.",
  "Algoritmos como PageRank o Louvain analizan la estructura de la red.",
  "GQL (ISO 2024) y SQL/PGQ (SQL:2023) estandarizan las consultas sobre grafos."
 ],
 "17": [
  "Las series temporales son datos de solo añadir, masivos, consultados por rangos y agregados; sus bases de datos particionan por tiempo, comprimen, retienen y resumen (<i>downsampling</i>).",
  "TimescaleDB lleva estas técnicas a PostgreSQL; InfluxDB y Prometheus son alternativas nativas.",
  "Elasticsearch busca texto con un índice invertido, analizadores y la puntuación BM25, y agrega resultados para filtros y análisis de logs.",
  "No es una base de datos transaccional: complementa a la fuente de verdad."
 ],
 "18": [
  "La analítica se separa de los sistemas operacionales por rendimiento, diseño, historia e integración.",
  "Un data warehouse es orientado a temas, integrado, variable en el tiempo y no volátil.",
  "El modelo dimensional organiza hechos (medidas) y dimensiones (contexto) en un esquema en estrella; el grano se declara primero.",
  "Las SCD gestionan los cambios en las dimensiones; el tipo 2 conserva la historia con una fila por versión.",
  "El data lake guarda todo tipo de datos en bruto y barato, con <i>schema-on-read</i>; sin gobierno se convierte en un pantano."
 ],
 "19": [
  "ETL transforma antes de cargar; ELT carga en bruto y transforma dentro del almacén con SQL, y es el enfoque dominante en la nube.",
  "El almacenamiento por filas favorece OLTP; el columnar, OLAP: lee solo las columnas necesarias, comprime mejor y permite ejecución vectorizada.",
  "Parquet es el formato analítico por defecto, con grupos de filas, columnas comprimidas y estadísticas que permiten saltarse datos; ORC es similar; Avro es por filas y destaca en <i>streaming</i> y evolución de esquemas."
 ],
 "20": [
  "Snowflake separa almacenamiento (micro-particiones en la nube), cómputo (virtual warehouses que se facturan por segundo) y servicios.",
  "Los datos se cargan desde stages con <code>COPY INTO</code> o de forma continua con Snowpipe.",
  "Time Travel recupera estados pasados; la clonación sin copia crea entornos al instante; el acceso se gobierna con roles.",
  "BigQuery es <i>serverless</i> y, bajo demanda, cobra por bytes procesados: seleccionar columnas, particionar y agrupar reduce el coste."
 ],
 "21": [
  "Volumen, velocidad y variedad llevan al procesamiento distribuido, cuyo límite describe la ley de Amdahl.",
  "HDFS repartía y replicaba bloques en los nodos; hoy domina el almacenamiento de objetos, que separa almacenamiento y cómputo.",
  "Hive, Spark SQL y Trino consultan con SQL los ficheros del data lake.",
  "Delta Lake e Iceberg añaden a los ficheros Parquet transacciones ACID, <code>MERGE</code>, control de esquema y <i>time travel</i>.",
  "El lakehouse une data lake y data warehouse en una plataforma; la arquitectura medallion organiza sus datos en bronze, silver y gold."
 ],
 "22": [
  "Databricks organiza el trabajo en workspaces y separa cómputo (clústeres, SQL warehouses) del almacenamiento (tablas Delta en objetos).",
  "Unity Catalog gobierna datos e IA con el espacio de nombres <code>catálogo.esquema.objeto</code>: tablas gestionadas y externas, vistas, volúmenes, funciones y modelos.",
  "Las tablas Delta admiten <code>MERGE</code>, Time Travel, <code>OPTIMIZE</code>, <i>liquid clustering</i> y <code>VACUUM</code>.",
  "<code>COPY INTO</code> y Auto Loader ingieren ficheros; los pipelines declarativos y los jobs orquestan bronze → silver → gold.",
  "Los permisos se heredan hacia abajo y se complementan con máscaras, filtros de fila, linaje y auditoría; BI y ML trabajan sobre las mismas tablas."
 ],
 "23": [
  "La inyección SQL se evita con consultas parametrizadas, reforzadas con mínimo privilegio y listas blancas.",
  "Mínimo privilegio: una cuenta por persona o aplicación, permisos por roles, sin superusuarios en las aplicaciones, secretos protegidos y auditoría.",
  "El RGPD exige minimizar, limitar la conservación, proteger desde el diseño y poder localizar y suprimir los datos de una persona en todos los sistemas.",
  "Las réplicas dan alta disponibilidad; las copias de seguridad protegen frente a errores y ataques. Hacen falta ambas.",
  "Se elige la base de datos por modelo, patrones de acceso, consistencia, escala, latencia, coste y equipo; empezando por la relacional y añadiendo solo lo necesario."
 ],
 "24": [
  "La IA generativa escribe, explica y traduce SQL, responde preguntas en lenguaje natural y busca por significado, pero genera texto plausible, no necesariamente correcto.",
  "El text-to-SQL depende sobre todo del contexto: esquema relevante, descripciones, glosario de negocio y ejemplos; falla por ambigüedad, joins incorrectos y definiciones implícitas.",
  "Los embeddings representan significado como vectores; pgvector permite buscarlos en PostgreSQL con índices HNSW o IVFFlat y combinarlos con SQL.",
  "RAG recupera fragmentos relevantes y se los da al modelo; GraphRAG añade grafos de conocimiento para preguntas globales.",
  "MCP estandariza la conexión de agentes con fuentes de datos; Databricks y Snowflake ofrecen servidores gestionados con sus permisos.",
  "Seguridad por capas: solo lectura, validación del SQL, límites, protección de datos personales y auditoría."
 ]
};
