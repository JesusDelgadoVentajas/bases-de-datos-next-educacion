// Ejercicios de los bloques V-VIII · Analítica, Big Data, seguridad e IA generativa (temas 18-24)
export default [
  // ---------- Tema 18 ----------
  { id: 't18-estrella', tema: 18, tipo: 'clasifica', titulo: 'Hechos y dimensiones',
    enunciado: 'Diseñas un esquema en estrella de ventas con grano «una fila por línea de pedido». ¿Cada elemento es una medida de la tabla de hechos o una dimensión?',
    categorias: ['Medida (hechos)', 'Dimensión'],
    items: [
      ['Importe de la línea', 0], ['Fecha del pedido', 1], ['Producto', 1],
      ['Unidades vendidas', 0], ['Cliente', 1], ['Descuento aplicado (€)', 0]
    ],
    porque: 'Los <b>hechos</b> son medidas numéricas que se suman o promedian (importe, unidades, descuento). Las <b>dimensiones</b> dan el contexto por el que se filtra y agrupa: cuándo, qué, quién, dónde. La tabla de hechos guarda las medidas y las claves de las dimensiones; cada dimensión es una tabla alrededor, de ahí la forma de estrella.',
    teoria: 's18.3' },
  { id: 't18-grano', tema: 18, tipo: 'test', titulo: 'El grano',
    enunciado: 'Al diseñar una tabla de hechos, ¿qué es lo primero que hay que declarar?',
    opciones: [
      'El grano: qué representa exactamente cada fila (por ejemplo, una línea de pedido).',
      'Los índices de la tabla.',
      'Los colores del cuadro de mando.',
      'Las claves foráneas a las tablas operacionales.'
    ],
    correcta: 0,
    porque: 'El grano decide qué medidas y dimensiones tienen sentido. Con grano «línea de pedido» se puede analizar por producto; con grano «pedido» no. Si no se declara, se mezclan niveles de detalle en la misma tabla y las sumas salen duplicadas.',
    teoria: 's18.3' },
  { id: 't18-scd', tema: 18, tipo: 'clasifica', nivel: '+', titulo: 'Slowly Changing Dimensions',
    enunciado: '¿Qué tipo de SCD aplicarías a cada cambio en la dimensión cliente?',
    categorias: ['Tipo 1 (sobrescribir)', 'Tipo 2 (nueva versión)'],
    items: [
      ['Se corrige una errata en el nombre del cliente', 0, 'El valor anterior era un error: no hay historia que conservar.'],
      ['El cliente se muda de Madrid a Sevilla y se quiere analizar las ventas por la ciudad en la que vivía al comprar', 1],
      ['El cliente pasa a ser VIP y se quiere comparar su gasto antes y después', 1],
      ['Se normaliza el formato del teléfono de todos los clientes', 0]
    ],
    porque: 'El tipo 1 sobrescribe el valor y pierde la historia: es lo adecuado para correcciones. El tipo 2 cierra la fila antigua (con fechas de vigencia o un indicador de versión actual) y crea una nueva, de modo que cada venta queda asociada a la versión del cliente vigente en ese momento.',
    teoria: 's18.4' },
  { id: 't18-dw-lake', tema: 18, tipo: 'clasifica', titulo: 'Data warehouse o data lake',
    enunciado: '¿Cada característica es más propia de un data warehouse o de un data lake?',
    categorias: ['Data warehouse', 'Data lake'],
    items: [
      ['Datos limpios, integrados y modelados para responder preguntas de negocio', 0],
      ['Ficheros en bruto de cualquier tipo: JSON, logs, imágenes, CSV', 1],
      ['Schema-on-write', 0],
      ['Schema-on-read', 1],
      ['Almacenamiento de objetos barato para volúmenes enormes', 1],
      ['Sin gobierno, corre el riesgo de convertirse en un «pantano de datos»', 1]
    ],
    porque: 'El data warehouse guarda datos ya integrados y estructurados, listos para el análisis. El data lake guarda todo, en bruto y barato, y se interpreta al leerlo. El lakehouse intenta unir lo mejor de los dos.',
    teoria: 's18.6' },

  // ---------- Tema 19 ----------
  { id: 't19-etl-elt', tema: 19, tipo: 'test', titulo: 'ETL frente a ELT',
    enunciado: '¿Cuál es la diferencia entre ETL y ELT?',
    opciones: [
      'En ETL se transforma antes de cargar en el almacén; en ELT se carga en bruto y se transforma dentro del almacén, normalmente con SQL.',
      'ETL es para bases de datos relacionales y ELT para NoSQL.',
      'Son lo mismo; solo cambia el fabricante.',
      'En ELT no se transforman los datos.'
    ],
    correcta: 0,
    porque: 'Con la potencia y la elasticidad de los almacenes en la nube, el enfoque dominante es ELT: se cargan los datos tal cual llegan y se transforman con SQL dentro del propio almacén (por ejemplo, con dbt). Así se conservan los datos originales y se puede volver a transformarlos si cambian las reglas.',
    teoria: 's19.1' },
  { id: 't19-columnar', tema: 19, tipo: 'test', titulo: 'Almacenamiento columnar',
    enunciado: 'La consulta <code>SELECT SUM(importe) FROM ventas</code> recorre 1.000 millones de filas de una tabla con 40 columnas. ¿Por qué es mucho más rápida en un almacenamiento por columnas?',
    opciones: [
      'Porque solo lee la columna importe, que además está muy comprimida.',
      'Porque las bases columnares tienen todas las filas en memoria.',
      'Porque guardan la suma ya calculada.',
      'Porque usan índices B-tree en todas las columnas.'
    ],
    correcta: 0,
    porque: 'Por filas habría que leer las 40 columnas de cada fila para usar una. Por columnas se lee solo <code>importe</code>, y como los valores de una columna se parecen entre sí se comprimen muy bien (diccionario, RLE) y se procesan por bloques (ejecución vectorizada). Por eso el almacenamiento columnar es el estándar en OLAP, y el de filas en OLTP.',
    teoria: 's19.2' },
  { id: 't19-formatos', tema: 19, tipo: 'clasifica', titulo: 'Elegir formato de fichero',
    enunciado: '¿Qué formato usarías en cada caso?',
    categorias: ['Parquet', 'Avro', 'CSV'],
    items: [
      ['Tablas del data lake que se consultan con SQL analítico', 0],
      ['Mensajes de un flujo en streaming cuyo esquema va evolucionando', 1],
      ['Un fichero pequeño para que alguien de negocio lo abra en una hoja de cálculo', 2],
      ['Guardar un año de ventas leyendo solo algunas columnas y saltando bloques por sus estadísticas', 0]
    ],
    porque: 'Parquet es columnar, comprime muy bien y guarda estadísticas por grupo de filas que permiten saltarse datos: es el formato analítico por defecto. Avro es por filas y lleva el esquema consigo, así que destaca en streaming y evolución de esquemas. CSV es universal y legible, pero sin tipos ni compresión.',
    teoria: 's19.3' },

  // ---------- Tema 20 ----------
  { id: 't20-snowflake', tema: 20, tipo: 'test', titulo: 'Virtual warehouses',
    enunciado: 'En Snowflake, el equipo de BI y el de ciencia de datos se ralentizan entre sí. ¿Cuál es la solución habitual?',
    opciones: [
      'Darle a cada equipo su propio virtual warehouse: comparten los datos pero no el cómputo.',
      'Copiar los datos a dos cuentas distintas.',
      'Programar las consultas de cada equipo en horarios distintos.',
      'Comprar un servidor más grande.'
    ],
    correcta: 0,
    porque: 'Snowflake separa almacenamiento y cómputo: los datos están una sola vez, y cada virtual warehouse es un clúster de cómputo independiente que se factura por segundo mientras está encendido y se puede suspender automáticamente. Así cada carga de trabajo tiene sus recursos sin duplicar datos.',
    teoria: 's20.2' },
  { id: 't20-bigquery', tema: 20, tipo: 'test', titulo: 'Coste en BigQuery',
    enunciado: 'En BigQuery con facturación bajo demanda, ¿cuál de estas consultas sobre una tabla de ventas particionada por fecha procesa <b>menos bytes</b> y, por tanto, cuesta menos?',
    opciones: [
      "<code>SELECT importe FROM ventas WHERE fecha = '2026-11-01'</code>",
      "<code>SELECT * FROM ventas WHERE fecha = '2026-11-01'</code>",
      '<code>SELECT importe FROM ventas</code>',
      '<code>SELECT * FROM ventas LIMIT 10</code>'
    ],
    correcta: 0,
    notas: ['', 'Lee todas las columnas de la partición.', 'Lee la columna de todas las particiones.', 'LIMIT no reduce los bytes leídos: escanea todas las columnas de toda la tabla.'],
    porque: 'Bajo demanda, BigQuery cobra por bytes procesados. Al ser columnar, solo lee las columnas que se piden, y el filtro sobre la columna de partición hace que solo lea la partición de ese día. <code>LIMIT</code> recorta el resultado, pero no lo que se lee.',
    teoria: 's20.9' },
  { id: 't20-time-travel', tema: 20, tipo: 'test', titulo: 'Time Travel y clonación',
    enunciado: 'Alguien ejecuta por error un <code>DELETE</code> sin <code>WHERE</code> sobre una tabla de Snowflake hace 10 minutos. ¿Qué permite recuperarla?',
    opciones: [
      'Time Travel: consultar o clonar la tabla tal como estaba antes del borrado (AT / BEFORE).',
      'Nada: en la nube los borrados son definitivos.',
      'Snowpipe, que vuelve a cargar los datos automáticamente.',
      'Un virtual warehouse más grande.'
    ],
    correcta: 0,
    porque: 'Snowflake conserva los estados anteriores durante el periodo de retención, así que se puede consultar la tabla en un instante pasado y crear un clon de ese estado. La clonación sin copia (<i>zero-copy cloning</i>) crea la tabla al instante porque comparte las micro-particiones en lugar de duplicarlas.',
    teoria: 's20.5' },

  // ---------- Tema 21 ----------
  { id: 't21-medallion', tema: 21, tipo: 'clasifica', titulo: 'Arquitectura medallion',
    enunciado: '¿En qué capa de la arquitectura medallion va cada tabla?',
    categorias: ['Bronze', 'Silver', 'Gold'],
    items: [
      ['Los JSON de pedidos tal como llegan de la web, sin tocar', 0],
      ['Los pedidos con tipos correctos, sin duplicados y con los clientes validados', 1],
      ['Las ventas por categoría y mes que consume el cuadro de mando', 2],
      ['Copia de la tabla de clientes del ERP, con la fecha de ingesta', 0],
      ['Indicadores de cada cliente listos para un modelo de churn', 2]
    ],
    porque: 'Bronze guarda los datos en bruto, tal como llegan (permite reprocesar). Silver los limpia, tipa, deduplica e integra. Gold los agrega y modela para un uso concreto: informes, cuadros de mando o modelos de ML.',
    teoria: 's21.6' },
  { id: 't21-delta', tema: 21, tipo: 'test', titulo: 'Formatos de tabla abiertos',
    enunciado: '¿Qué añaden Delta Lake o Apache Iceberg a un conjunto de ficheros Parquet en el data lake?',
    opciones: [
      'Un registro de transacciones que aporta ACID, MERGE, control de esquema y time travel.',
      'Un formato de fichero nuevo que sustituye a Parquet.',
      'Un motor de base de datos relacional en un servidor.',
      'Compresión, que Parquet no tiene.'
    ],
    correcta: 0,
    porque: 'Los datos siguen siendo ficheros Parquet en almacenamiento de objetos, pero un registro (log) de transacciones indica qué ficheros forman cada versión de la tabla. Eso permite escrituras atómicas, lecturas consistentes, <code>MERGE</code>, evolución controlada del esquema y consultar versiones anteriores. Es la base del lakehouse.',
    teoria: 's21.4' },
  { id: 't21-amdahl', tema: 21, tipo: 'test', nivel: '+', titulo: 'Ley de Amdahl',
    enunciado: 'El 90 % de un proceso se puede paralelizar y el 10 % no. Con nodos ilimitados, ¿cuánto más rápido puede llegar a ir como máximo?',
    opciones: ['10 veces', '90 veces', 'Infinitas veces', '2 veces'],
    correcta: 0,
    porque: 'Según la ley de Amdahl, la parte secuencial pone el límite: aunque la parte paralela tardara cero, el 10 % secuencial sigue ahí, así que la aceleración máxima es 1 / 0,10 = 10. Añadir máquinas tiene rendimientos decrecientes.',
    teoria: 's21.1' },

  // ---------- Tema 22 ----------
  { id: 't22-unity', tema: 22, tipo: 'test', titulo: 'Unity Catalog',
    enunciado: '¿Cómo se nombra una tabla en Unity Catalog?',
    opciones: ['<code>catálogo.esquema.tabla</code>', '<code>workspace.tabla</code>', '<code>esquema.tabla.columna</code>', '<code>clúster.base_de_datos.tabla</code>'],
    correcta: 0,
    porque: 'Unity Catalog organiza los objetos en tres niveles: catálogo → esquema → objeto (tablas, vistas, volúmenes, funciones y modelos). Los permisos se conceden en cualquier nivel y se heredan hacia abajo, y como el catálogo es común a todos los workspaces, el gobierno es uno solo.',
    teoria: 's22.2' },
  { id: 't22-gestionada', tema: 22, tipo: 'test', titulo: 'Tablas gestionadas y externas',
    enunciado: 'Se hace <code>DROP TABLE</code> sobre una tabla <b>externa</b> de Unity Catalog. ¿Qué pasa con sus ficheros?',
    opciones: [
      'Se elimina solo la definición en el catálogo; los ficheros siguen en su ubicación.',
      'Se borran la definición y los ficheros.',
      'No se puede borrar una tabla externa.',
      'Los ficheros se mueven a la papelera del workspace.'
    ],
    correcta: 0,
    porque: 'En una tabla <b>gestionada</b>, Databricks controla el ciclo de vida de los datos: al borrarla, se borran también sus ficheros. En una <b>externa</b>, los datos viven en una ubicación que gestionas tú; el catálogo solo guarda la definición, y borrarla no toca los ficheros.',
    teoria: 's22.3' },
  { id: 't22-ingesta', tema: 22, tipo: 'clasifica', titulo: 'Operaciones sobre tablas Delta',
    enunciado: '¿Qué comando de Databricks usarías en cada caso?',
    categorias: ['MERGE INTO', 'OPTIMIZE', 'VACUUM', 'Auto Loader'],
    items: [
      ['Aplicar a la tabla de clientes los cambios del día: actualizar los que existen e insertar los nuevos', 0],
      ['Compactar miles de ficheros pequeños en menos ficheros más grandes', 1],
      ['Eliminar ficheros antiguos que ya no forman parte de ninguna versión dentro del periodo de retención', 2],
      ['Ingerir de forma incremental los ficheros nuevos que van llegando a un directorio', 3]
    ],
    porque: '<code>MERGE</code> hace upserts sobre tablas Delta; <code>OPTIMIZE</code> compacta ficheros pequeños para acelerar las lecturas; <code>VACUUM</code> borra ficheros que ya no hacen falta (y limita hasta dónde llega el time travel), y Auto Loader detecta y carga solo los ficheros nuevos.',
    teoria: 's22.5' },

  // ---------- Tema 23 ----------
  { id: 't23-inyeccion', tema: 23, tipo: 'test', titulo: 'Inyección SQL',
    enunciado: '¿Qué código Python es seguro frente a la inyección SQL?',
    opciones: [
      '<code>cur.execute("SELECT * FROM cliente WHERE email = %s", (email,))</code>',
      '<code>cur.execute(f"SELECT * FROM cliente WHERE email = \'{email}\'")</code>',
      '<code>cur.execute("SELECT * FROM cliente WHERE email = \'" + email + "\'")</code>',
      '<code>cur.execute("SELECT * FROM cliente WHERE email = \'%s\'" % email)</code>'
    ],
    correcta: 0,
    notas: ['', "Si email vale  ' OR '1'='1, la consulta devuelve todos los clientes.", 'Concatenar texto es igual de vulnerable.', 'El operador % de Python también inserta el texto tal cual.'],
    porque: 'En una consulta <b>parametrizada</b>, el SQL y los datos viajan por separado: el valor de <code>email</code> nunca se interpreta como código, por raro que sea. Construir el SQL pegando textos (f-strings, +, %) permite que un valor malicioso cambie la consulta. Se refuerza con mínimo privilegio y listas blancas para lo que no se puede parametrizar (nombres de columnas).',
    teoria: 's23.1' },
  { id: 't23-backups', tema: 23, tipo: 'test', titulo: 'Réplicas y copias',
    enunciado: 'Mercado Next tiene dos réplicas síncronas de su base de datos. Alguien ejecuta <code>DELETE FROM pedido;</code> por error. ¿Qué ocurre?',
    opciones: [
      'El borrado se replica al instante en las réplicas: solo una copia de seguridad (o un PITR) permite recuperar los pedidos.',
      'Las réplicas conservan los pedidos y se puede recuperar desde ellas.',
      'PostgreSQL impide el borrado porque hay réplicas.',
      'Las réplicas detectan el error y lo deshacen.'
    ],
    correcta: 0,
    porque: 'Las réplicas dan <b>alta disponibilidad</b> frente a fallos de hardware, pero copian fielmente cualquier cambio, también los errores y los ataques. Las <b>copias de seguridad</b> protegen frente a eso porque guardan estados anteriores. Hacen falta ambas.',
    teoria: 's23.4' },
  { id: 't23-privilegio', tema: 23, tipo: 'test', titulo: 'Mínimo privilegio',
    enunciado: 'Marca <b>todas</b> las buenas prácticas de mínimo privilegio para la aplicación web de Mercado Next.',
    opciones: [
      'Una cuenta propia para la aplicación, con permisos solo sobre las tablas que usa.',
      'Guardar la contraseña de la base de datos en un gestor de secretos, no en el código.',
      'Conectar la aplicación como superusuario para evitar errores de permisos.',
      'Compartir una única cuenta entre todo el equipo de desarrollo.',
      'Auditar los accesos a las tablas con datos personales.'
    ],
    correcta: [0, 1, 4],
    notas: ['', '', 'Un superusuario puede leer, borrar y modificar todo: cualquier fallo de la aplicación se convierte en un desastre.', 'Sin cuentas individuales no se sabe quién hizo qué, y no se puede retirar el acceso a una sola persona.', ''],
    porque: 'Cada persona o aplicación tiene su propia cuenta con lo mínimo necesario, los permisos se gestionan con roles, nadie usa superusuarios para el trabajo diario, los secretos se protegen y los accesos se auditan. Así, si algo falla o se filtra, el daño queda acotado.',
    teoria: 's23.2' },
  { id: 't23-elegir', tema: 23, tipo: 'clasifica', titulo: 'Elegir base de datos',
    enunciado: 'Mercado Next crece. ¿Qué tecnología encaja mejor con cada necesidad?',
    categorias: ['PostgreSQL', 'Redis', 'MongoDB', 'Neo4j', 'Data warehouse'],
    items: [
      ['Pedidos, pagos y stock, con transacciones y restricciones', 0],
      ['Caché de las páginas de producto más visitadas, con caducidad automática', 1],
      ['Fichas de producto de marketplace, cada una con atributos diferentes', 2],
      ['Recomendaciones basadas en qué compran los clientes parecidos', 3],
      ['Informes históricos de ventas de varios años para dirección', 4]
    ],
    porque: 'Se elige por modelo de datos, patrones de acceso, consistencia, escala, latencia, coste y conocimiento del equipo. La regla práctica: empezar por la relacional (PostgreSQL ya cubre JSON, búsqueda de texto o vectores) y añadir otra tecnología solo cuando un problema concreto lo justifique.',
    teoria: 's23.5' },
  { id: 't23-rgpd', tema: 23, tipo: 'test', titulo: 'Derecho de supresión',
    enunciado: 'Una clienta ejerce su derecho de supresión (RGPD). ¿Qué hay que hacer?',
    opciones: [
      'Localizar y suprimir (o anonimizar) sus datos en todos los sistemas: base de datos, réplicas, data lake, cachés, logs y copias, según la política de retención.',
      'Borrar su fila de la tabla cliente y nada más.',
      'Marcarla como inactiva y seguir usando sus datos para analítica.',
      'Nada, si sus datos están en una copia de seguridad.'
    ],
    correcta: 0,
    porque: 'Los datos personales se copian a muchos sitios: réplicas, data lake, almacenes analíticos, cachés, logs, copias de seguridad. Para poder cumplir hay que saber dónde está cada dato (inventario y linaje) y diseñar la supresión desde el principio. Lo que deba conservarse por obligación legal se bloquea y se limita su uso.',
    teoria: 's23.3' },

  // ---------- Tema 24 ----------
  { id: 't24-text2sql', tema: 24, tipo: 'test', titulo: 'Text-to-SQL fiable',
    enunciado: 'Un LLM genera SQL a partir de preguntas en lenguaje natural y a menudo se equivoca con «ventas netas». ¿Qué ayuda más?',
    opciones: [
      'Darle contexto: el esquema relevante, descripciones de columnas, un glosario de negocio con la definición de «ventas netas» y ejemplos de consultas correctas.',
      'Pedirle que piense más rápido.',
      'Darle permisos de escritura para que pueda corregir los datos.',
      'Quitarle el esquema para que no se confunda.'
    ],
    correcta: 0,
    porque: 'El text-to-SQL depende sobre todo del contexto. Los fallos típicos vienen de la ambigüedad (¿«ventas» incluye devoluciones?), de joins incorrectos y de definiciones de negocio implícitas. Un glosario, descripciones del esquema y ejemplos verificados reducen esos errores, y el SQL generado se debe revisar antes de fiarse de él.',
    teoria: 's24.3' },
  { id: 't24-embeddings', tema: 24, tipo: 'test', titulo: 'Búsqueda semántica',
    enunciado: 'Un cliente busca «algo para jugar con el ordenador» y quieres devolver el ratón gaming aunque no comparta ninguna palabra. ¿Qué técnica lo permite?',
    opciones: [
      'Embeddings: vectores que representan el significado, buscados por similitud (por ejemplo, con pgvector).',
      "Un <code>LIKE '%jugar%'</code> sobre el nombre del producto.",
      'Un índice B-tree sobre la columna nombre.',
      'Ordenar los productos por precio.'
    ],
    correcta: 0,
    porque: 'Un modelo de embeddings convierte textos en vectores de modo que los textos con significado parecido quedan cerca. Con pgvector se guardan en PostgreSQL, se indexan (HNSW o IVFFlat) y se buscan por distancia, combinándolos con filtros SQL normales (stock, precio…).',
    teoria: 's24.4' },
  { id: 't24-capas', tema: 24, tipo: 'test', titulo: 'Agentes con acceso a la base de datos',
    enunciado: 'Conectas un agente de IA a la base de datos de producción mediante MCP. Marca <b>todas</b> las medidas de seguridad adecuadas.',
    opciones: [
      'Un rol de solo lectura con acceso solo a las vistas necesarias.',
      'Validar el SQL generado antes de ejecutarlo y limitar filas y tiempo de ejecución.',
      'Proteger o enmascarar los datos personales.',
      'Auditar todas las consultas que lanza el agente.',
      'Darle la cuenta de administrador para que nunca falle por permisos.'
    ],
    correcta: [0, 1, 2, 3],
    notas: ['', '', '', '', 'Un error o una instrucción maliciosa (prompt injection) podría borrar o filtrar cualquier dato.'],
    porque: 'Un LLM genera texto plausible, no necesariamente correcto, y puede ser manipulado. Por eso la seguridad va por capas: permisos mínimos (solo lectura), validación del SQL, límites, protección de datos personales y auditoría. Si falla una capa, las demás contienen el daño.',
    teoria: 's24.8' },
  { id: 't24-rag', tema: 24, tipo: 'ordena', titulo: 'Cómo funciona un RAG',
    enunciado: 'Ordena los pasos con los que un sistema RAG responde a una pregunta sobre los documentos de la empresa.',
    items: [
      'Se calcula el embedding de la pregunta',
      'Se recuperan los fragmentos de documentos más parecidos',
      'Se construye el prompt con la pregunta y esos fragmentos',
      'El LLM genera la respuesta citando los fragmentos'
    ],
    porque: 'RAG (<i>Retrieval-Augmented Generation</i>) no reentrena el modelo: le da en cada pregunta la información relevante que ha recuperado. Así responde con datos actuales y propios de la empresa, y puede citar de dónde sale cada afirmación. Antes, los documentos se han troceado y se han guardado sus embeddings.',
    teoria: 's24.5' }
];
