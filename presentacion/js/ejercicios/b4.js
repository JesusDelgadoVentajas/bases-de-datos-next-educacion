// Ejercicios del bloque IV · NoSQL (temas 11-17)
export default [
  // ---------- Tema 11 ----------
  { id: 't11-repl-shard', tema: 11, tipo: 'clasifica', titulo: 'Replicación o sharding',
    enunciado: '¿Qué técnica resuelve cada problema?',
    categorias: ['Replicación', 'Sharding'],
    items: [
      ['Si se cae el servidor principal, el servicio debe seguir funcionando', 0],
      ['Los datos ya no caben en el disco de una sola máquina', 1],
      ['Hay muchísimas más lecturas que escrituras y un solo servidor no da abasto con ellas', 0],
      ['Las escrituras superan lo que puede absorber una sola máquina', 1]
    ],
    porque: 'La <b>replicación</b> copia los mismos datos en varios nodos: da tolerancia a fallos y reparte las lecturas, pero todas las copias reciben todas las escrituras. El <b>sharding</b> reparte datos distintos entre nodos: permite crecer en volumen y en escrituras. Los sistemas grandes combinan los dos.',
    teoria: 's11.2' },
  { id: 't11-cap', tema: 11, tipo: 'test', titulo: 'Teorema CAP',
    enunciado: 'Durante una partición de red, dos réplicas no se pueden comunicar. Un cliente escribe en una de ellas y otro lee de la otra. Según el teorema CAP, ¿qué opciones tiene el sistema?',
    opciones: [
      'Rechazar la lectura o la escritura hasta que vuelva la red (prioriza consistencia) o responder con un dato quizá atrasado (prioriza disponibilidad).',
      'Garantizar a la vez consistencia y disponibilidad si los servidores son suficientemente rápidos.',
      'Ignorar la partición: CAP solo se aplica a las bases de datos relacionales.',
      'Elegir entre consistencia y tolerancia a particiones, sin que la disponibilidad se vea afectada.'
    ],
    correcta: 0,
    porque: 'CAP dice que, <b>cuando la red se parte</b> (y en un sistema distribuido eso pasará), hay que elegir: o se mantiene la consistencia negándose a responder (CP), o se mantiene la disponibilidad aunque las respuestas puedan estar atrasadas (AP). Sin partición, se pueden tener las dos.',
    teoria: 's11.3' },
  { id: 't11-quorum', tema: 11, tipo: 'test', titulo: 'Quórums',
    enunciado: 'Con <b>N = 3</b> réplicas, ¿qué combinación de réplicas que confirman la escritura (W) y réplicas consultadas en la lectura (R) garantiza leer siempre el último valor escrito?',
    opciones: ['W = 2, R = 2', 'W = 1, R = 1', 'W = 1, R = 2', 'W = 2, R = 1'],
    correcta: 0,
    porque: 'Se garantiza una lectura consistente cuando <b>R + W &gt; N</b>: el conjunto de réplicas que se leen y el de las que tienen la última escritura se solapan en al menos una. Con N = 3: 2 + 2 = 4 &gt; 3 sí; 1 + 2 = 3 no es mayor que 3. Es el típico QUORUM en lectura y escritura.',
    teoria: 's11.4' },
  { id: 't11-escalado', tema: 11, tipo: 'test', titulo: 'Escalar en vertical u horizontal',
    enunciado: '¿Cuál es la principal ventaja de escalar <b>en vertical</b> (una máquina más grande) frente a hacerlo en horizontal?',
    opciones: [
      'Es más simple: la aplicación no cambia y no hay que coordinar varios nodos.',
      'No tiene límite de crecimiento.',
      'Tolera la caída de una máquina sin perder servicio.',
      'Siempre es más barato a cualquier escala.'
    ],
    correcta: 0,
    porque: 'Escalar en vertical no cambia la arquitectura: misma base de datos, más CPU, memoria y disco. Pero tiene un techo (la máquina más grande que exista), su precio crece rápido y sigue siendo un único punto de fallo. El horizontal reparte carga y datos entre máquinas a cambio de complejidad.',
    teoria: 's11.1' },

  // ---------- Tema 12 ----------
  { id: 't12-familias', tema: 12, tipo: 'clasifica', titulo: '¿Qué familia NoSQL?',
    enunciado: 'Elige la familia NoSQL que mejor encaja con cada necesidad.',
    categorias: ['Clave-valor', 'Documental', 'Columnar ancha', 'Grafos'],
    items: [
      ['Guardar la sesión y el carrito de cada usuario, leídos por su id en milisegundos', 0],
      ['Un catálogo en el que cada tipo de producto tiene atributos distintos', 1],
      ['Millones de lecturas de sensores por segundo, consultadas por sensor y rango de tiempo', 2],
      ['Recomendar «personas que quizá conozcas» a partir de amigos de amigos', 3],
      ['Detectar redes de cuentas fraudulentas conectadas entre sí', 3],
      ['Perfiles de usuario con datos anidados que se leen y se escriben enteros', 1]
    ],
    porque: 'Clave-valor: acceso por clave, muy rápido y simple. Documental: objetos anidados con estructura flexible. Columnar ancha: escrituras masivas repartidas por una clave de partición y leídas por rangos. Grafos: cuando lo importante son las relaciones y los recorridos de varios saltos.',
    teoria: 's12.2' },
  { id: 't12-schema', tema: 12, tipo: 'test', titulo: 'Schema-on-read',
    enunciado: '¿Qué significa <i>schema-on-read</i>?',
    opciones: [
      'Los datos se guardan sin validar su estructura y se interpretan al consultarlos.',
      'El esquema se valida al escribir y se rechazan los datos que no lo cumplen.',
      'La base de datos no permite leer datos sin esquema.',
      'Cada lectura modifica el esquema de la tabla.'
    ],
    correcta: 0,
    porque: 'Con <i>schema-on-write</i> (el modelo relacional) la estructura se valida al guardar: lo que entra ya es correcto. Con <i>schema-on-read</i> se guarda lo que llega y es quien lee el que interpreta la estructura: más flexible para cambiar, pero el control de calidad pasa a la aplicación.',
    teoria: 's12.3' },
  { id: 't12-base', tema: 12, tipo: 'test', titulo: 'BASE frente a ACID',
    enunciado: 'Muchas bases de datos NoSQL se describen como <b>BASE</b>. ¿Qué implica?',
    opciones: [
      'Priorizan la disponibilidad y aceptan consistencia eventual: las réplicas pueden tardar en ponerse de acuerdo.',
      'Garantizan transacciones ACID entre cualquier número de nodos.',
      'Solo admiten datos con un esquema fijo.',
      'No replican los datos.'
    ],
    correcta: 0,
    porque: 'BASE (<i>Basically Available, Soft state, Eventually consistent</i>) renuncia a parte de las garantías de ACID para poder escalar en horizontal y seguir respondiendo ante fallos: una lectura puede devolver un dato atrasado durante un tiempo, pero las réplicas acaban convergiendo.',
    teoria: 's12.1' },

  // ---------- Tema 13 ----------
  { id: 't13-redis', tema: 13, tipo: 'clasifica', titulo: 'Estructuras de Redis',
    enunciado: '¿Qué estructura de Redis usarías para cada caso?',
    categorias: ['String', 'Hash', 'List', 'Set', 'Sorted set'],
    items: [
      ['Un contador de visitas que se incrementa con INCR', 0],
      ['El ranking de los productos más vendidos, ordenado por unidades', 4],
      ['Los campos de una sesión de usuario (nombre, idioma, carrito_id)', 1],
      ['Las etiquetas distintas de un producto, sin repetidos', 3],
      ['Una cola de tareas pendientes en orden de llegada', 2]
    ],
    porque: 'Redis no es solo clave → texto: cada valor tiene una estructura con sus propios comandos atómicos. Los sorted sets mantienen los elementos ordenados por una puntuación (<code>ZINCRBY</code>, <code>ZREVRANGE</code>), los hashes guardan campos, los sets evitan repetidos y las listas permiten encolar y desencolar por los extremos.',
    teoria: 's13.1' },
  { id: 't13-cache-aside', tema: 13, tipo: 'ordena', titulo: 'Patrón cache-aside',
    enunciado: 'Ordena los pasos de una lectura con el patrón <b>cache-aside</b>.',
    items: [
      'La aplicación busca la clave en Redis',
      'Si no está (fallo de caché), consulta la base de datos',
      'Guarda el resultado en Redis con un TTL',
      'Devuelve el resultado al usuario'
    ],
    porque: 'En cache-aside la aplicación gestiona la caché: primero mira en ella y solo si no está va a la base de datos, que sigue siendo la fuente de verdad. El TTL hace que los datos cacheados caduquen y se vuelvan a leer, lo que limita cuánto tiempo puede estar desactualizada la caché.',
    teoria: 's13.3' },
  { id: 't13-dynamo', tema: 13, tipo: 'test', nivel: '+', titulo: 'Claves en DynamoDB',
    enunciado: 'En una tabla de DynamoDB con los pedidos, la consulta principal es «los pedidos de un cliente, del más reciente al más antiguo». ¿Qué claves elegirías?',
    opciones: [
      'Partition key: cliente_id · Sort key: fecha',
      'Partition key: fecha · Sort key: cliente_id',
      'Partition key: estado · Sort key: cliente_id',
      'Partition key: pedido_id, y filtrar después por cliente'
    ],
    correcta: 0,
    porque: 'La partition key reparte los datos y decide dónde está cada elemento: con <code>cliente_id</code>, todos los pedidos de un cliente quedan juntos y se leen con una sola consulta. La sort key los ordena dentro de la partición, así que se pueden pedir por fecha. Con <code>estado</code> como partición habría muy pocas particiones enormes (particiones calientes).',
    teoria: 's13.4' },

  // ---------- Tema 14 ----------
  { id: 't14-embeber', tema: 14, tipo: 'clasifica', titulo: 'Embeber o referenciar',
    enunciado: 'Modelando Mercado Next en MongoDB, ¿embeberías o referenciarías cada dato?',
    categorias: ['Embeber', 'Referenciar'],
    items: [
      ['Las líneas de un pedido, dentro del documento del pedido', 0, 'Están acotadas y siempre se leen con el pedido.'],
      ['Las dos o tres direcciones de envío de un cliente', 0],
      ['Las reseñas de un producto popular, que crecen sin límite', 1, 'El documento podría superar los 16 MB.'],
      ['La categoría de un producto, compartida por miles de productos', 1, 'Si se embebe, cambiar su nombre obliga a tocar miles de documentos.'],
      ['El historial de visitas de cada cliente a la web', 1]
    ],
    porque: '«Lo que se consulta junto se guarda junto»: se embebe lo que está acotado y se lee siempre con el documento principal. Se referencia lo que crece sin límite (por el máximo de 16 MB por documento y porque cada actualización reescribe el documento) y lo que comparten muchos documentos.',
    teoria: 's14.3' },
  { id: 't14-find', tema: 14, tipo: 'test', titulo: 'Consultar en MongoDB',
    enunciado: '¿Qué consulta de MongoDB devuelve los productos de más de 50 € que tienen stock?',
    opciones: [
      '<code>db.productos.find({ precio: { $gt: 50 }, stock: { $gt: 0 } })</code>',
      '<code>db.productos.find("precio > 50 AND stock > 0")</code>',
      '<code>db.productos.find({ precio: "> 50", stock: "> 0" })</code>',
      '<code>db.productos.select({ precio: { $gt: 50 } }).where({ stock: { $gt: 0 } })</code>'
    ],
    correcta: 0,
    porque: 'En MongoDB los filtros son documentos: cada campo lleva un valor (igualdad) o un documento con operadores como <code>$gt</code>, <code>$lt</code> o <code>$in</code>. Varios campos en el mismo filtro se combinan con un AND implícito.',
    teoria: 's14.2' },
  { id: 't14-pipeline', tema: 14, tipo: 'ordena', titulo: 'Aggregation pipeline',
    enunciado: 'Quieres los <b>3 clientes que más han gastado</b> en pedidos entregados. Ordena las etapas del pipeline.',
    items: [
      '<code>{ $match: { estado: "entregado" } }</code>',
      '<code>{ $group: { _id: "$cliente_id", gasto: { $sum: "$total" } } }</code>',
      '<code>{ $sort: { gasto: -1 } }</code>',
      '<code>{ $limit: 3 }</code>'
    ],
    porque: 'Cada etapa recibe los documentos de la anterior. Conviene filtrar pronto con <code>$match</code> (como el WHERE, y así puede usar índices), agrupar con <code>$group</code> (GROUP BY), ordenar por el agregado con <code>$sort</code> (ORDER BY) y quedarse con los primeros con <code>$limit</code> (LIMIT).',
    teoria: 's14.4' },
  { id: 't14-operadores', tema: 14, tipo: 'clasifica', titulo: 'Operadores de actualización',
    enunciado: '¿Qué operador de <code>updateOne</code> usarías?',
    categorias: ['$set', '$inc', '$push', '$unset'],
    items: [
      ['Cambiar el email de un cliente', 0],
      ['Restar 1 al stock de un producto', 1, '{ $inc: { stock: -1 } }'],
      ['Añadir una dirección nueva al array de direcciones', 2],
      ['Eliminar el campo «telefono_antiguo» del documento', 3]
    ],
    porque: '<code>$set</code> asigna un valor, <code>$inc</code> suma (o resta, con un negativo) de forma atómica, <code>$push</code> añade un elemento a un array y <code>$unset</code> elimina un campo. Sin operador, <code>replaceOne</code> sustituiría el documento entero.',
    teoria: 's14.2' },

  // ---------- Tema 15 ----------
  { id: 't15-claves', tema: 15, tipo: 'test', titulo: 'Diseñar la clave en Cassandra',
    enunciado: 'La consulta es: «todas las lecturas de un sensor en un día concreto, ordenadas por hora». Cada sensor envía una lectura por segundo durante años. ¿Qué clave primaria eliges?',
    opciones: [
      '<code>PRIMARY KEY ((sensor_id, dia), ts)</code>',
      '<code>PRIMARY KEY (sensor_id, ts)</code>',
      '<code>PRIMARY KEY ((dia), sensor_id, ts)</code>',
      '<code>PRIMARY KEY (ts)</code>'
    ],
    correcta: 0,
    notas: ['', 'Funciona, pero la partición de cada sensor crece sin límite durante años.', 'Todos los sensores del mismo día caen en una sola partición gigante (partición caliente).', 'No permite pedir las lecturas de un sensor sin recorrer todo el clúster.'],
    porque: 'La <b>partition key</b> (entre los paréntesis interiores) decide en qué nodos se guarda cada fila; la <b>clustering key</b> ordena las filas dentro de la partición. Con (sensor_id, dia) cada partición contiene un sensor en un día (86.400 filas como máximo, acotada) y la consulta se resuelve leyendo una sola partición, ya ordenada por <code>ts</code>.',
    teoria: 's15.2' },
  { id: 't15-query-first', tema: 15, tipo: 'test', titulo: 'Modelado query-first',
    enunciado: 'En Cassandra necesitas consultar los pedidos por cliente y también por producto. ¿Qué es lo habitual?',
    opciones: [
      'Crear dos tablas, pedidos_por_cliente y pedidos_por_producto, y escribir cada pedido en las dos.',
      'Crear una tabla normalizada y hacer un JOIN entre las dos.',
      'Usar una tabla con ALLOW FILTERING en todas las consultas.',
      'Guardar los pedidos en una sola partición para poder filtrarlos por cualquier columna.'
    ],
    correcta: 0,
    porque: 'Cassandra no tiene JOIN y solo consulta de forma eficiente por la clave. Por eso se diseña <b>una tabla por consulta</b>, aunque se dupliquen los datos: escribir es barato y cada lectura toca una sola partición. <code>ALLOW FILTERING</code> recorre el clúster entero y solo es aceptable en tablas pequeñas.',
    teoria: 's15.4' },
  { id: 't15-consistencia', tema: 15, tipo: 'test', titulo: 'Consistencia ajustable',
    enunciado: 'Con un factor de replicación RF = 3, ¿qué nivel de consistencia en lectura y escritura garantiza leer lo último escrito, tolerando la caída de un nodo?',
    opciones: ['QUORUM en lectura y en escritura', 'ONE en lectura y en escritura', 'ALL en lectura y en escritura', 'ONE en escritura y QUORUM en lectura'],
    correcta: 0,
    notas: ['', '1 + 1 no es mayor que 3: puede leerse una réplica atrasada.', 'Es consistente, pero si cae un nodo fallan todas las operaciones.', '1 + 2 = 3, no es mayor que 3.'],
    porque: 'QUORUM con RF = 3 son 2 réplicas: 2 + 2 &gt; 3, así que lectura y escritura se solapan siempre, y si cae un nodo quedan 2, suficientes para el quórum. En Cassandra el nivel se elige en cada operación.',
    teoria: 's15.3' },
  { id: 't15-tombstones', tema: 15, tipo: 'test', nivel: '+', titulo: 'Tombstones',
    enunciado: 'Un equipo usa una tabla de Cassandra como cola: inserta tareas y las borra al procesarlas. Al cabo de unos días, las lecturas son cada vez más lentas. ¿Por qué?',
    opciones: [
      'Cada borrado deja una lápida (tombstone) que hay que leer y descartar hasta que la compactación la purga.',
      'Cassandra no permite borrar filas.',
      'Las tareas se replican en exceso.',
      'Falta un índice secundario sobre la tabla.'
    ],
    correcta: 0,
    porque: 'En Cassandra un borrado no elimina el dato: escribe una marca (tombstone) que se propaga a las réplicas. Hasta que pasa el periodo de gracia y se compacta, las lecturas tienen que recorrer esas marcas. Por eso las colas y los patrones de borrado masivo son antipatrones.',
    teoria: 's15.5' },

  // ---------- Tema 16 ----------
  { id: 't16-cypher', tema: 16, tipo: 'test', titulo: 'Amigos de amigos en Cypher',
    enunciado: '¿Qué consulta de Cypher devuelve los amigos de los amigos de Ana?',
    opciones: [
      "<code>MATCH (a:Persona {nombre: 'Ana'})-[:AMIGO]->()-[:AMIGO]->(fof) RETURN DISTINCT fof.nombre</code>",
      "<code>SELECT * FROM Persona WHERE amigo.amigo = 'Ana'</code>",
      "<code>MATCH (a:Persona {nombre: 'Ana'}) RETURN a.amigos.amigos</code>",
      "<code>MATCH (fof)-[:AMIGO]->(a:Persona {nombre: 'Ana'}) RETURN fof</code>"
    ],
    correcta: 0,
    notas: ['', 'Esto es SQL, no Cypher.', 'Las relaciones no se recorren como propiedades.', 'Devuelve quién tiene a Ana como amiga, a un solo salto.'],
    porque: 'Cypher describe patrones con una sintaxis visual: nodos entre paréntesis y relaciones entre corchetes con flechas. El nodo anónimo <code>()</code> del medio es el amigo directo. En SQL, cada salto sería otro JOIN, y con muchos saltos el coste crece mucho; en un grafo se sigue el puntero de cada relación.',
    teoria: 's16.3' },
  { id: 't16-cuando', tema: 16, tipo: 'test', titulo: '¿Cuándo una base de grafos?',
    enunciado: '¿En cuál de estos casos aporta más una base de datos de grafos frente a PostgreSQL?',
    opciones: [
      'Buscar caminos de hasta 6 saltos entre cuentas bancarias para detectar blanqueo.',
      'Registrar los pedidos de una tienda online.',
      'Calcular las ventas mensuales por categoría.',
      'Guardar la sesión del usuario.'
    ],
    correcta: 0,
    porque: 'Los grafos brillan cuando la pregunta trata de <b>relaciones y recorridos de profundidad variable</b>: caminos, comunidades, influencia (PageRank). Para registrar transacciones o agregar ventas, el modelo relacional sigue siendo la mejor opción.',
    teoria: 's16.1' },

  // ---------- Tema 17 ----------
  { id: 't17-especializadas', tema: 17, tipo: 'clasifica', titulo: 'Bases de datos especializadas',
    enunciado: '¿Qué tipo de sistema encaja mejor con cada necesidad?',
    categorias: ['Series temporales', 'Motor de búsqueda', 'Relacional'],
    items: [
      ['Métricas de CPU de 2.000 servidores cada 10 segundos, con resúmenes por hora y borrado tras 90 días', 0],
      ['Buscar «teclado inalambrico» en el catálogo aunque el usuario no ponga la tilde, ordenando por relevancia', 1],
      ['Registrar pagos con garantías de que no se pierde ni se duplica ninguno', 2],
      ['Analizar millones de líneas de logs buscando mensajes de error', 1],
      ['Lecturas de los contadores de luz de una ciudad, consultadas por rangos de tiempo', 0]
    ],
    porque: 'Las bases de series temporales particionan por tiempo, comprimen, resumen (<i>downsampling</i>) y borran por antigüedad (retención). Los motores de búsqueda como Elasticsearch usan un índice invertido y analizadores para buscar texto y puntuar la relevancia (BM25). Ninguno sustituye a la base transaccional, que sigue siendo la fuente de verdad.',
    teoria: 's17.1' },
  { id: 't17-invertido', tema: 17, tipo: 'test', titulo: 'Índice invertido',
    enunciado: '¿Qué guarda un índice invertido?',
    opciones: [
      'Para cada término, la lista de documentos en los que aparece.',
      'Para cada documento, sus campos ordenados al revés.',
      'Los documentos ordenados de más reciente a más antiguo.',
      'Una copia de la tabla con las filas en orden inverso.'
    ],
    correcta: 0,
    porque: 'Como el índice al final de un libro: de cada palabra (ya normalizada por el analizador: minúsculas, sin tildes, raíz) apunta a los documentos que la contienen. Así, buscar varias palabras es cruzar listas, en lugar de leer todos los textos con un <code>LIKE \'%…%\'</code>.',
    teoria: 's17.2' }
];
