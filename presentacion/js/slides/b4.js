// Bloque IV · NoSQL (Temas 11–17)
import { col, pts, box, w, table, cards, study, code } from '../deck.js';
import * as WA from '../w/b4a.js';
import * as WB from '../w/b4b.js';
import * as WC from '../w/b4c.js';

export const widgets = { ...WA.widgets, ...WB.widgets, ...WC.widgets };

export function build(D) {
  D.bloque({ n: 'IV', title: 'NoSQL',
    intro: 'El modelo relacional es la opción por defecto, pero no la única. Repartir datos entre decenas de servidores, servir millones de lecturas por segundo, guardar estructuras muy variables o recorrer relaciones de muchos saltos: fundamentos de sistemas distribuidos, las cuatro grandes familias NoSQL y dos especializadas.',
    temas: [[11, 'Escalar y distribuir'], [12, 'Introducción a NoSQL'], [13, 'Clave-valor: Redis y DynamoDB'], [14, 'Documental: MongoDB'], [15, 'Columnar ancha: Cassandra'], [16, 'Grafos: Neo4j'], [17, 'Otras familias especializadas']] });

  // ================= TEMA 11 =================
  D.tema({ n: 11, title: 'Escalar y distribuir: lo esencial', obj: ['Escalado vertical y horizontal', 'Replicación, sharding y hashing consistente', 'El teorema CAP sin fórmulas', 'Consistencia fuerte y eventual; quórums'] });

  D.s('11.1', 'Escalado vertical y horizontal', `${col(w('scaling'), 'wide')}${col(`${table(['', 'Vertical (scale up)', 'Horizontal (scale out)'], [['Qué', 'Una máquina más potente', 'Más máquinas que se reparten datos y carga'], ['Ventaja', 'Sencillo; ACID clásico', 'Crecimiento casi ilimitado; tolera caídas'], ['Pega', 'Techo físico; precio; punto único de fallo', 'Red, coordinación, consistencia'], ['Típico de', 'Relacionales tradicionales', 'NoSQL, NewSQL, analítica distribuida']], 'small')}
      ${box('', 'Clave', 'Escalar en vertical es <b>la primera opción razonable</b>: un PostgreSQL moderno atiende cargas muy grandes. Horizontal cuando los datos o el tráfico no caben en una máquina, o hay varias regiones.')}`, 'narrow')}`,
    { lead: 'Sube la carga y mira qué pasa con cada estrategia.' });

  D.s('11.2', 'Replicación y sharding', `${col(w('replshard'), 'wide')}${col(`${pts(['<b>Replicación</b>: copias de los mismos datos → tolerancia a fallos y escala las <b>lecturas</b>.', 'Líder único (PostgreSQL, MySQL, MongoDB) · multilíder · sin líder (Dynamo, Cassandra).', 'Síncrona (segura, lenta) o asíncrona (rápida, puede perder lo último).',
      '<b>Sharding</b>: repartir los datos → escala <b>escrituras</b> y volumen. La pieza clave es la <b>clave de partición</b>.'])}`, 'narrow')}`,
    { lead: 'Lanza escrituras y lecturas, y tumba un nodo.' });

  D.s('11.2', 'Hashing consistente', `${col(w('hashring'), 'wide')}${col(`${table(['Estrategia', 'Riesgo'], [['Por rangos', 'Puntos calientes (la fecha de hoy)'], ['hash(k) mod N', 'Al añadir un nodo, casi todo se recoloca'], ['Hashing consistente', 'Necesita nodos virtuales']], 'small')}
      <div class="box" style="text-align:center"><p style="font-size:22px">fracción movida ≈ <b>1 / (N + 1)</b></p></div>`, 'narrow')}`,
    { id: 's11.2b', lead: 'Nodos y claves en un anillo; cada clave pertenece al siguiente nodo. Añade un nodo y cuenta cuántas claves se mueven (simulado con 20.000 claves).' });

  D.s('11.3', 'Teorema CAP explicado sin fórmulas', `${col(w('cap'), 'wide')}${col(`${pts(['<b>C</b>onsistencia · <b>A</b>vailability (disponibilidad) · <b>P</b>artition tolerance.', 'Brewer (2000), demostrado por Gilbert y Lynch (2002).', 'Las particiones <b>van a ocurrir</b>: la pregunta real es qué prefieres cuando la red se parte.'])}
      ${box('gray', 'PACELC (Abadi)', 'Si hay <b>P</b>artición: <b>A</b> o <b>C</b>. <b>E</b>n otro caso: <b>L</b>atencia o <b>C</b>onsistencia.')}`, 'narrow')}`,
    { lead: 'Mercado Next tiene servidores en Madrid y Dublín. Corta el enlace e intenta vender el último monitor en ambos lados.' });

  D.s('11.4', 'Consistencia fuerte, eventual y quórums', `${col(w('quorum'), 'wide')}${col(`${pts(['<b>Fuerte</b>: tras confirmar, cualquier lectura ve el valor nuevo.', '<b>Eventual</b>: si no hay más escrituras, las réplicas acaban convergiendo.', 'Intermedias: <i>leer tus propias escrituras</i>, consistencia causal.'])}
      <div class="box" style="text-align:center"><p style="font-size:24px"><b>R + W &gt; N</b> → lectura consistente</p><p style="font-size:18px;margin-top:4px">Quórum mayoritario: Q = ⌊N/2⌋ + 1</p></div>`, 'narrow')}`,
    { lead: 'Ajusta N, W y R. Escribe un valor nuevo, lee… y tumba réplicas.' });

  // ================= TEMA 12 =================
  D.tema({ n: 12, title: 'Introducción a NoSQL', obj: ['Por qué surgieron las bases de datos NoSQL', 'Las cuatro familias y sus casos de uso', 'Schema-on-write frente a schema-on-read', 'Modelado orientado a consultas'] });

  D.s('12.1', 'Origen y motivación', `${col(`${pts(['Mediados de los 2000: Google, Amazon, Facebook. Un relacional en un servidor no absorbía el volumen.', '<b>Bigtable</b> (Google, 2006) y <b>Dynamo</b> (Amazon, 2007): de ellos descienden HBase, Cassandra, DynamoDB…', 'Desarrollo ágil + JSON como idioma de la web.', 'Renuncian a joins generales, transacciones multi-fila y esquema rígido a cambio de <b>escala, disponibilidad, latencia y flexibilidad</b>.'])}`)}
    ${col(`<div class="cards c2"><div class="card"><h4>ACID</h4><p>Atomicidad, Consistencia, Aislamiento, Durabilidad (Tema 10)</p></div><div class="card hl"><h4>BASE</h4><p><b>B</b>asically <b>A</b>vailable · <b>S</b>oft state · <b>E</b>ventual consistency</p></div></div>
      ${box('recuerda', 'Recordamos que…', 'Las fronteras están difuminadas (Tema 1): MongoDB tiene ACID, PostgreSQL guarda JSON y NewSQL combina SQL con escala horizontal. «NoSQL» es una familia de diseños.')}`, 'narrow')}`);

  D.s('12.2', 'Las cuatro familias', `${col(w('families'))}`, { lead: 'Los mismos datos de Mercado Next (Ana y sus pedidos) guardados en cada familia. Cambia de pestaña.' });

  D.s('12.3', 'Schema-on-write frente a schema-on-read', `${col(w('schemaread'), 'wide')}${col(table(['', 'On-write', 'On-read'], [['Calidad', 'Garantizada al entrar', 'Depende de cada consulta'], ['Cambios', 'Migraciones', 'Inmediatos'], ['Ingesta', 'Más lenta', 'Más rápida'], ['Ejemplos', 'PostgreSQL, DW', 'Data lakes, MongoDB sin validación']], 'small') + study('Punto intermedio: MongoDB con validación (Tema 14) y data lakes con formatos con esquema como Parquet o Delta (Bloque VI).'), 'narrow')}`,
    { lead: 'Llegan registros, algunos mal formados. ¿Se rechazan al escribir o explotan al leer?' });

  D.s('12.4', 'Modelado orientado a consultas', `${col(w('queryfirst'), 'wide')}${col(`${box('', 'Clave', 'Relacional: «¿qué datos tengo?» → normalizo → cualquier consulta funciona.<br>NoSQL: «¿qué preguntas me harán?» → una estructura por pregunta → esas vuelan, las imprevistas cuestan.')}
      ${pts(['La <b>desnormalización es la norma</b>.', 'Hay que conocer los patrones de acceso <b>antes</b>.', 'La aplicación mantiene coherentes las copias.'])}`, 'narrow')}`,
    { lead: 'Marca las consultas que necesita la aplicación y mira qué estructuras salen en cada enfoque.' });

  // ================= TEMA 13 =================
  D.tema({ n: 13, title: 'Bases de datos clave-valor: Redis y DynamoDB', obj: ['Estructuras de datos y comandos de Redis', 'TTL, persistencia y Pub/Sub', 'Patrones e invalidación de caché', 'DynamoDB: partition key, sort key, GSI y single-table design'] });

  D.s('13.1', 'Redis: estructuras de datos y comandos', `${col(w('redis'), 'wide')}${col(`${table(['Estructura', 'Uso típico'], [['String', 'Caché, contadores (INCR)'], ['Hash', 'Objetos: perfil de cliente'], ['List', 'Colas, últimos vistos'], ['Set', 'Etiquetas, únicos'], ['Sorted set', 'Rankings'], ['Stream', 'Mensajes persistentes']], 'small')}
      ${box('', 'Clave', 'Redis ejecuta los comandos <b>de uno en uno</b>: cada comando es atómico. Dos INCR a la vez nunca pierden una actualización (Tema 10).')}`, 'narrow')}`,
    { lead: 'Un emulador de Redis: escribe comandos como en redis-cli (o usa los ejemplos). En memoria, respuestas en fracciones de milisegundo.' });

  D.s('13.2', 'TTL, persistencia y Pub/Sub', `${col(w('pubsub'), 'wide')}${col(`${table(['Persistencia', 'Pérdida posible'], [['RDB (instantáneas)', 'Desde la última'], ['AOF (cada escritura, fsync 1 s)', '≈ 1 segundo'], ['RDB + AOF', 'Como AOF'], ['Ninguna', 'Todo (caché pura)']], 'small')}
      ${pts(['<code>EXPIRE</code>, <code>TTL</code> (−1 sin caducidad, −2 no existe), <code>PERSIST</code>.', 'Memoria llena: <code>maxmemory-policy</code> (noeviction, allkeys-lru, allkeys-lfu).'])}
      ${box('gray', 'Dato', 'Redis cambió de licencia en 2024 y nació <b>Valkey</b> (Linux Foundation). Redis 8 (2025) volvió a ofrecer AGPLv3.')}`, 'narrow')}`,
    { lead: 'Pub/Sub es «dispara y olvida»: desconecta un suscriptor y publica. Luego compáralo con Streams.' });

  D.s('13.3', 'Patrones e invalidación de caché', `${col(w('cache'), 'wide')}${col(`${table(['Patrón', 'Idea'], [['Cache-aside', 'La app mira la caché; si falla, BD y guarda'], ['Read-through', 'La caché carga sola'], ['Write-through', 'Escribe en caché y BD a la vez'], ['Write-behind', 'Caché ahora, BD después']], 'small')}
      ${box('warn', 'Estampida', 'Si caduca una clave muy popular, cientos de peticiones van a la vez a la BD. TTL aleatorio, bloqueo o refresco anticipado.')}`, 'narrow')}`,
    { lead: 'Simulador cache-aside sobre 1.000 peticiones. «Solo hay dos cosas difíciles en informática: invalidar cachés y poner nombres» (P. Karlton).' });

  D.s('13.4', 'DynamoDB: claves, GSI y single-table design', `${col(w('dynamo'))}`,
    { lead: 'Una sola tabla con varios tipos de entidad. Construye la Query: la partition key reparte, la sort key ordena.' });

  D.s('13.4', 'DynamoDB: índices y capacidad', `${col(`${table(['', 'GSI', 'LSI'], [['Clave', 'PK y SK distintas', 'Misma PK, otra SK'], ['Se crea', 'En cualquier momento', 'Solo al crear la tabla'], ['Lectura', 'Solo eventual', 'Eventual o fuerte'], ['Límite', '20 por tabla', '5 por tabla']])}
      ${pts(['Serverless: escala solo. Elementos de hasta <b>400 KB</b>.', 'Bajo demanda (por petición) o aprovisionado (RCU/WCU).'])}
      ${box('warn', 'Particiones calientes', 'Si todo va a la misma PK (la fecha de hoy), una partición recibe toda la carga. La PK debe tener muchos valores y repartir el tráfico.')}`)}
    ${col(w('rcu'))}`, { id: 's13.4b' });

  // ================= TEMA 14 =================
  D.tema({ n: 14, title: 'Bases de datos documentales: MongoDB', obj: ['Documentos, colecciones y BSON', 'CRUD con la sintaxis de MongoDB', 'Embeber o referenciar', 'Aggregation pipeline', 'Índices, validación, transacciones, replica sets y sharding'] });

  D.s('14.1', 'Documentos, colecciones y BSON', `${col(w('docvsrel'), 'wide')}${col(`${table(['Relacional', 'MongoDB'], [['Tabla', 'Colección'], ['Fila', 'Documento (≤ 16 MB)'], ['Columna', 'Campo (objetos y arrays)'], ['Clave primaria', '_id (ObjectId)'], ['JOIN', 'Embeber o $lookup']], 'small')}
      ${pts(['<b>BSON</b>: JSON binario con fechas, int32/64, Decimal128, ObjectId.', 'Un <code>ObjectId</code> (12 bytes) empieza por su marca de tiempo.'])}`, 'narrow')}`,
    { lead: 'MongoDB (2009): un pedido entero, con su cliente y sus líneas, cabe en un único documento. Pasa el ratón por el documento.' });

  D.s('14.2', 'CRUD', `${col(w('mongo'), 'wide')}${col(`${table(['SQL', 'MongoDB'], [['WHERE a = 1', '{ a: 1 }'], ['> >= < <= <>', '$gt $gte $lt $lte $ne'], ['IN (…)', '$in'], ['AND / OR', 'campos juntos / $or'], ['ORDER BY … DESC', '.sort({ c: -1 })'], ['LIMIT', '.limit(n)']], 'small')}
      ${box('warn', 'Atención', '<code>updateOne({_id: 108}, {estado: "enviado"})</code> sin <code>$set</code> no es válido: para sustituir existe <code>replaceOne</code>.')}`, 'narrow')}`,
    { lead: 'Una mini consola de MongoDB con la colección pedidos de Mercado Next. Los filtros son documentos.' });

  D.s('14.3', 'Modelado: embeber o referenciar', `${col(w('embedref'), 'wide')}${col(`${table(['Criterio', 'Embeber', 'Referenciar'], [['Relación', '1:1, 1:pocos', '1:muchos, N:M'], ['Acceso', 'Se leen juntos', 'Por separado'], ['Cambios', 'Casi nunca', 'Cambia y se comparte'], ['Tamaño', 'Acotado', 'Sin límite']], 'small')}
      ${box('', 'Regla', '<b>«Lo que se consulta junto se guarda junto».</b>')}${box('recuerda', 'Recordamos que…', 'Desnormalizar es legítimo si es consciente (Tema 4): el pedido conserva la ciudad de envío original.')}`, 'narrow')}`,
    { lead: '¿Y si metemos todos los pedidos dentro del cliente? Mueve el tiempo y mira crecer el documento.' });

  D.s('14.4', 'Aggregation pipeline', `${col(w('mpipeline'))}`,
    { lead: '«Los tres productos que más facturan, sin pedidos cancelados». Activa las etapas una a una y mira los documentos que fluyen.' });

  D.s('14.5', 'Índices, validación de esquema y transacciones', `${col(`${code(`db.pedidos.createIndex({ "cliente.id": 1, fecha: -1 })
db.productos.createIndex({ nombre: "text" })
db.sesiones.createIndex({ creada: 1 },
                        { expireAfterSeconds: 3600 })   // TTL`, 'js', 'font-size:15px')}
      ${pts(['Índices B-tree: simple, compuesto, <b>multikey</b> (arrays), texto, 2dsphere, hashed, TTL.', 'Regla <b>ESR</b> para compuestos: Igualdad → Orden (Sort) → Rango.', 'Un documento: <b>siempre atómico</b>. Multidocumento ACID desde 4.0 (4.2 con sharding).'])}`)}
    ${col(w('validator'))}`, { lead: 'La flexibilidad tiene un riesgo: documentos mal formados. JSON Schema acerca la colección al schema-on-write.' });

  D.s('14.6', 'Replica sets y sharding', `${col(w('replicaset'), 'wide')}${col(`${pts(['<b>Replica set</b>: un primario y secundarios que leen el <i>oplog</i>. Si cae el primario, <b>eligen</b> otro en segundos. Impar, mínimo 3.', '<b>Write concern</b> <code>w: "majority"</code> (defecto desde 5.0).', '<b>Read preference</b>: primary, secondaryPreferred… (eventual).', '<b>Sharding</b>: clave de shard, enrutadores <i>mongos</i> y <i>config servers</i>; por rangos o hashed.'])}
      ${box('warn', 'Clave de shard', 'Muchos valores, escrituras uniformes y presente en las consultas. Una fecha o un id creciente concentra todo en un shard.')}`, 'narrow')}`,
    { lead: 'Tumba el primario y mira la elección. Prueba un write concern de 1 frente a majority.' });

  // ================= TEMA 15 =================
  D.tema({ n: 15, title: 'Bases de datos columnares anchas: Cassandra', obj: ['Arquitectura en anillo sin nodo principal', 'Partition key y clustering key en CQL', 'Consistencia ajustable por operación', 'Modelado query-first', 'Tombstones y errores típicos'] });

  D.s('15.1', 'Arquitectura en anillo', `${col(w('cassring'), 'wide')}${col(`${pts(['Facebook (2008), Apache (2010): distribución de Dynamo + modelo de Bigtable.', '<b>Todos los nodos son iguales</b>; se hablan por <i>gossip</i>.', 'hash(partition key) con Murmur3 → <b>token</b> entre −2⁶³ y 2⁶³−1.', '<b>vnodes</b>: muchos rangos pequeños por máquina (16 por defecto desde 4.0).', '<b>RF</b>: copias en los nodos siguientes del anillo.'])}`, 'narrow')}`,
    { lead: 'Anillo de tokens en 3D. Inserta una partition key y mira dónde caen sus réplicas.' });

  D.s('15.2', 'CQL: partition key y clustering key', `${col(w('cql'), 'wide')}${col(`${code(`CREATE TABLE tienda.pedidos_por_cliente (
  cliente_id int, fecha date,
  pedido_id int, estado text, total decimal,
  PRIMARY KEY ((cliente_id), fecha, pedido_id)
) WITH CLUSTERING ORDER BY
  (fecha DESC, pedido_id ASC);`, 'cql', 'font-size:15px')}
      ${pts(['<b>Partition key</b>: en qué nodos vive.', '<b>Clustering key</b>: el orden dentro de la partición.', 'Sin joins ni subconsultas.'])}`, 'narrow')}`,
    { lead: 'CQL se parece a SQL… pero solo se filtra eficientemente por la clave. Prueba las consultas.' });

  D.s('15.3', 'Consistencia ajustable', `${col(w('quorum', { cass: true }), 'wide')}${col(`${table(['Nivel', 'Réplicas que responden'], [['ONE, TWO, THREE', '1, 2 o 3'], ['QUORUM', '⌊RF/2⌋ + 1'], ['LOCAL_QUORUM', 'Mayoría en el DC local'], ['EACH_QUORUM', 'Mayoría en cada DC'], ['ALL', 'Todas'], ['ANY', 'Cualquiera (escrituras)']], 'small')}
      ${study('Reparación: hinted handoff, reparación en lectura y nodetool repair.')}`, 'narrow')}`,
    { lead: 'Con RF = 3, escribir y leer en QUORUM (2 + 2 > 3) da lecturas consistentes y tolera la caída de un nodo.' });

  D.s('15.4', 'Modelado query-first', `${col(w('cassmodel'), 'wide')}${col(`${box('', 'Tamaño de partición', 'Una partición vive entera en los mismos nodos: por debajo de ~100 MB. Si crecería sin límite, <b>cubos</b>: <code>PRIMARY KEY ((sensor_id, mes), momento)</code>.')}
      ${box('warn', 'ALLOW FILTERING', 'Recorre todas las particiones de todos los nodos. Si la consulta es necesaria: <b>otra tabla</b>.')}`, 'narrow')}`,
    { lead: 'Una tabla por consulta. Al insertar un pedido se escribe en todas las tablas que lo necesitan.' });

  D.s('15.5', 'Camino de escritura y tombstones', `${col(w('lsm'), 'wide')}${col(`${table(['Error típico', 'Problema'], [['Usar Cassandra como cola', 'Acumula tombstones'], ['Particiones sin límite', 'Nodos sobrecargados'], ['ALLOW FILTERING', 'Recorre el clúster'], ['Leer antes de escribir', 'Mejor escribir a ciegas'], ['Diseño relacional', 'Sin joins no responde'], ['Insertar NULL explícitos', 'Cada NULL es una tombstone']], 'small')}`, 'narrow')}`,
    { lead: 'Commit log + memtable → SSTables inmutables. Borrar escribe una lápida (tombstone) que solo desaparece al compactar.' });

  D.s('15.5', 'Filtros de Bloom', `${col(w('bloom'), 'wide')}${col(`<div class="box" style="text-align:center"><p style="font-size:24px;font-family:var(--font-mono)">p ≈ (1 − e<sup>−kn/m</sup>)<sup>k</sup></p></div>
      ${pts(['Responden «seguro que no está» o «quizá esté».', 'Evitan abrir SSTables que no contienen la clave.'])}${box('gray', 'Dato', 'Cassandra 5.0 (2024): índices <b>SAI</b> y búsqueda de <b>vectores</b>. ScyllaDB: misma arquitectura en C++.')}`, 'narrow')}`,
    { id: 's15.5b', lead: 'Inserta claves y consulta otras. Ajusta m, n y k y observa la probabilidad de falso positivo.' });

  // ================= TEMA 16 =================
  D.tema({ n: 16, title: 'Bases de datos de grafos: Neo4j', obj: ['Property graph frente a RDF', 'Nodos, relaciones, etiquetas y propiedades', 'Cypher: patrones y caminos variables', 'Índices, restricciones, algoritmos, GQL y SQL/PGQ'] });

  D.s('16.1', 'Property graph frente a RDF', `${col(w('rdf'), 'wide')}${col(table(['', 'Property graph', 'RDF'], [['Unidad', 'Nodos y relaciones con propiedades', 'Tripletas sujeto–predicado–objeto'], ['Origen', 'Industria (Neo4j, 2007)', 'W3C, web semántica'], ['Lenguaje', 'Cypher, GQL', 'SPARQL'], ['Ids', 'Internos', 'URI globales'], ['Uso', 'Fraude, recomendaciones', 'Ontologías, datos abiertos']], 'small'), 'narrow')}`,
    { lead: 'El mismo hecho, «Ana compró el K70 el 3 de noviembre», en los dos modelos.' });

  D.s('16.2', 'Nodos, relaciones, etiquetas y propiedades', `${col(w('graph'), 'wide')}${col(`${pts(['<b>Nodos</b> con <b>etiquetas</b> (:Cliente, :Producto).', '<b>Relaciones</b> dirigidas y con tipo (COMPRO, RECOMIENDA_A).', '<b>Propiedades</b> en nodos y relaciones: la fecha es de la compra.', 'Recorrer una relación cuesta lo mismo con mil nodos o mil millones.'])}
      ${box('', 'Cuándo usar un grafo', 'Cuando <b>las relaciones importan tanto como los datos</b>: fraude, recomendaciones, redes sociales, rutas, dependencias. Para sumar ventas, mejor un relacional o un DW.')}`, 'narrow')}`,
    { lead: 'Mercado Next como grafo, con sus compras reales. Arrastra los nodos; pasa el ratón para ver propiedades.' });

  D.s('16.3', 'Cypher', `${col(w('graph', { cypher: true }))}`,
    { lead: 'Pattern matching con «arte ASCII»: (nodo)-[:RELACION]->(nodo). Elige una consulta y mira el patrón encontrado.' });

  D.s('16.3', 'Cláusulas de Cypher', `${col(code(`CREATE (ana:Cliente {nombre: 'Ana', ciudad: 'Madrid'}),
       (k70:Producto {nombre: 'Teclado K70', precio: 89.90}),
       (ana)-[:COMPRO {fecha: date('2025-11-03')}]->(k70);
MERGE (c:Categoria {nombre: 'Periféricos'});      // idempotente
MATCH (p:Producto {nombre: 'Teclado K70'}) SET p.precio = 80.91;
MATCH (c:Cliente {nombre: 'Pablo'}) DETACH DELETE c;`, 'cypher', 'font-size:16px'), 'wide')}
    ${col(table(['Cypher', 'SQL aprox.'], [['MATCH', 'FROM + JOIN'], ['WHERE', 'WHERE'], ['RETURN', 'SELECT'], ['WITH', 'CTE'], ['CREATE, MERGE', 'INSERT, upsert'], ['SET, DETACH DELETE', 'UPDATE, DELETE'], ['count(), collect()', 'COUNT, ARRAY_AGG']], 'small') + box('recuerda', 'Recordamos que…', 'El organigrama con WITH RECURSIVE (Tema 8): cada nivel es un join más. En un grafo es un patrón de longitud variable de una línea.'), 'narrow')}`, { id: 's16.3c' });

  D.s('16.4', 'Índices y restricciones', `${col(`${code(`CREATE INDEX cliente_nombre IF NOT EXISTS
FOR (c:Cliente) ON (c.nombre);

CREATE CONSTRAINT cliente_email_unico IF NOT EXISTS
FOR (c:Cliente) REQUIRE c.email IS UNIQUE;`, 'cypher', 'font-size:18px')}`)}${col(pts(['Los índices sirven para encontrar los <b>nodos de partida</b>; luego se recorren las relaciones directamente.', 'Una restricción de unicidad crea su índice.', 'Ediciones empresariales: existencia de propiedades y clave de nodo.']))}`);

  D.s('16.5', 'Algoritmos de grafos: PageRank', `${col(w('pagerank'), 'wide')}${col(`<div class="box" style="text-align:center"><p style="font-size:19px;font-family:var(--font-mono)">PR(v) = (1−d)/N + d Σ<sub>u∈B(v)</sub> PR(u)/L(u)</p></div>
      ${table(['Familia', 'Algoritmos'], [['Centralidad', 'PageRank, betweenness, grado'], ['Comunidades', 'Louvain, Leiden'], ['Caminos', 'Dijkstra, A*'], ['Similitud', 'Jaccard, node similarity'], ['Embeddings', 'FastRP, node2vec']], 'small')}`, 'narrow')}`,
    { lead: 'Un nodo es importante si lo apuntan nodos importantes. Itera, cambia d y haz clic en dos nodos para crear un enlace.' });

  D.s('16.6', 'Estándares: GQL y SQL/PGQ', `${col(`${pts(['Cada BD de grafos tenía su lenguaje: Cypher, Gremlin, PGQL…', '<b>GQL</b> (ISO/IEC 39075:2024): el primer lenguaje de BD estandarizado por ISO desde SQL, muy inspirado en Cypher.', '<b>SQL/PGQ</b> (parte 16 de SQL:2023): un grafo de propiedades <b>sobre tablas relacionales</b>.'])}
      ${box('gray', 'Dato', 'SQL/PGQ ya está en Oracle Database 23ai y figura entre las novedades anunciadas para PostgreSQL 19 (betas de 2026).')}`)}
    ${col(code(`SELECT *
FROM GRAPH_TABLE (red_tienda
  MATCH (a IS cliente WHERE a.nombre = 'Ana')
        -[IS recomienda_a]-> (b IS cliente)
  COLUMNS (b.nombre AS recomendado)
);`, 'sql', 'font-size:18px'))}`);

  // ================= TEMA 17 =================
  D.tema({ n: 17, title: 'Otras familias especializadas', obj: ['Series temporales y sus bases de datos', 'Motores de búsqueda: índice invertido, análisis y relevancia'] });

  D.s('17.1', 'Series temporales', `${col(w('downsample'), 'wide')}${col(`${table(['Técnica', 'Idea'], [['Particionado por tiempo', 'Borrar lo antiguo = tirar un bloque'], ['Compresión', 'Diferencias entre valores consecutivos'], ['Retención', 'Borrado automático'], ['Downsampling', 'Agregados de menor resolución'], ['Funciones temporales', 'Ventanas, huecos, interpolación']], 'small')}
      ${pts(['Solo añadir · volúmenes enormes · consultas por rango y agregadas · su valor decae.', 'TimescaleDB (PostgreSQL), InfluxDB, Prometheus, QuestDB, kdb+.'])}`, 'narrow')}`,
    { lead: 'Una semana de un sensor midiendo cada minuto: 10.080 puntos. Cambia la resolución.' });

  D.s('17.1', 'TimescaleDB: SQL para series temporales', `${col(code(`CREATE TABLE lectura (
  momento     TIMESTAMPTZ NOT NULL,
  sensor_id   INTEGER     NOT NULL,
  temperatura DOUBLE PRECISION
);
SELECT create_hypertable('lectura', 'momento');

SELECT time_bucket('1 hour', momento) AS hora, sensor_id,
       AVG(temperatura) AS media, MAX(temperatura) AS maxima
FROM lectura
WHERE momento > now() - INTERVAL '3 days'
GROUP BY hora, sensor_id ORDER BY hora;`, 'sql', 'font-size:17px'), 'wide')}
    ${col(box('recuerda', 'Recordamos que…', '<code>DATE_TRUNC</code> (Tema 7) agrupaba por mes. <code>time_bucket</code> generaliza a 15 minutos, 6 horas…; en PostgreSQL 14+ existe el estándar <code>date_bin</code>.'), 'narrow')}`, { id: 's17.1b' });

  D.s('17.2', 'Motores de búsqueda: el índice invertido', `${col(w('invindex'))}`,
    { lead: 'Edita los documentos, activa los pasos del analizador y busca: cada término apunta a los documentos donde aparece, y BM25 ordena por relevancia.' });

  D.s('17.2', 'Relevancia con BM25', `${col(w('bm25'), 'wide')}${col(`<div class="box"><p style="font-size:16px;font-family:var(--font-mono)">score = Σ IDF(t) · f(t,D)(k₁+1) / [f(t,D) + k₁(1 − b + b·|D|/avgdl)]</p><p style="font-size:16px;font-family:var(--font-mono);margin-top:6px">IDF(t) = ln(1 + (N − n(t) + 0,5)/(n(t) + 0,5))</p></div>
      ${table(['Caso', 'Por qué'], [['Tiendas y webs', 'Relevancia, fuzzy, sinónimos'], ['Logs (ELK)', 'Ingesta masiva, casi tiempo real'], ['SIEM', 'Correlación de eventos'], ['Semántica', 'Vectores e híbrida (T24)']], 'small')}
      ${box('warn', 'Atención', 'Casi en tiempo real (refresh cada segundo) y sin ACID: no es la fuente de verdad, se replica desde la BD operacional.')}`, 'narrow')}`,
    { id: 's17.2b', lead: 'BM25 (por defecto desde Elasticsearch 5.0). Mueve k₁ y b y observa cómo se satura la frecuencia y se penalizan los documentos largos.' });

  D.s('17.2', 'Consultas con el Query DSL', `${col(code(`GET /productos/_search
{
  "query": {
    "bool": {
      "must":   { "match": { "nombre": "teclado inalámbrico" } },
      "filter": { "range": { "precio": { "lte": 100 } } }
    }
  },
  "aggs": {
    "por_categoria": { "terms": { "field": "categoria" } }
  }
}`, 'js', 'font-size:18px'), 'wide')}
    ${col(`${pts(['<code>match</code>: texto completo con relevancia · <code>term</code>: valor exacto.', '<code>bool</code>: must, should, must_not, filter.', '<code>aggs</code>: como GROUP BY → filtros laterales de una tienda.'])}${box('gray', 'Dato', '2021: Elastic cambia la licencia y Amazon crea <b>OpenSearch</b> (hoy en la Linux Foundation). 2024: Elastic vuelve a ofrecer AGPL.')}`, 'narrow')}`, { id: 's17.2c' });
}
