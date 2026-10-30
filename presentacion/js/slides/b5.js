// Bloque V · Bases de datos analíticas (Temas 18–20)
import { col, pts, box, w, table, cards, study, code, sql } from '../deck.js';
import * as W from '../w/b5.js';

export const widgets = W.widgets;

const STAR = `CREATE TABLE dim_fecha AS
SELECT ROW_NUMBER() OVER (ORDER BY f)::int AS fecha_key, f::date AS fecha,
       EXTRACT(YEAR FROM f)::int AS anio, EXTRACT(QUARTER FROM f)::int AS trimestre,
       EXTRACT(MONTH FROM f)::int AS mes, EXTRACT(ISODOW FROM f)::int AS dia_semana
FROM generate_series(DATE '2025-11-01', DATE '2026-02-28', INTERVAL '1 day') f;

CREATE TABLE dim_producto AS
SELECT pr.id AS producto_key, pr.nombre AS producto, c.nombre AS subcategoria,
       COALESCE(cp.nombre, c.nombre) AS categoria
FROM producto pr
JOIN categoria c       ON c.id = pr.categoria_id
LEFT JOIN categoria cp ON cp.id = c.padre_id;

CREATE TABLE dim_cliente AS
SELECT id AS cliente_key, id AS cliente_id, nombre,
       COALESCE(ciudad, 'Desconocida') AS ciudad,
       CASE WHEN vip THEN 'VIP' ELSE 'Particular' END AS segmento
FROM cliente;

-- Grano: una fila por línea de pedido (no cancelado)
CREATE TABLE fact_ventas AS
SELECT df.fecha_key, l.producto_id AS producto_key, p.cliente_id AS cliente_key,
       l.pedido_id, l.cantidad AS unidades, l.cantidad * l.precio_unitario AS importe
FROM linea_pedido l
JOIN pedido p     ON p.id = l.pedido_id
JOIN dim_fecha df ON df.fecha = p.fecha
WHERE p.estado <> 'cancelado';

SELECT COUNT(*) AS filas_en_fact_ventas FROM fact_ventas;`;

export function build(D) {
  D.bloque({ n: 'V', title: 'Bases de datos analíticas',
    intro: 'Cambio de perspectiva: cómo se organizan los datos para <b>analizarlos</b>. El data warehouse y el modelado dimensional, el data lake, la integración y los formatos columnares, y dos plataformas en la nube muy usadas: Snowflake y BigQuery.',
    temas: [[18, 'Data warehouse y data lake'], [19, 'Integración y formatos de almacenamiento'], [20, 'Data warehouses en la nube: Snowflake y BigQuery']] });

  // ================= TEMA 18 =================
  D.tema({ n: 18, title: 'Data warehouse y data lake', obj: ['Por qué separar la analítica de lo operacional', 'Características y arquitectura de un data warehouse', 'Modelado dimensional: hechos, dimensiones, estrella', '(+) Slowly Changing Dimensions', 'Data warehouse frente a data lake'] });

  D.s('18.1', 'OLTP frente a OLAP: por qué separar la analítica', `${col(w('dwarch'), 'wide')}${col(`${box('recuerda', 'Recordamos que…', '<b>OLTP</b>: muchas transacciones cortas de pocas filas. <b>OLAP</b>: pocas consultas que agregan millones de filas históricas (Tema 1).')}
      ${pts(['<b>Rendimiento</b>: el análisis compite con quien compra.', '<b>Diseño</b>: el modelo normalizado obliga a muchos joins.', '<b>Historia</b>: lo operacional guarda el estado actual.', '<b>Integración</b>: tienda, CRM, contabilidad, marketing…'])}`, 'narrow')}`,
    { lead: 'La solución clásica: <b>copiar</b> los datos a un sistema diseñado para analizar. Pasa el ratón por cada pieza.' });

  D.s('18.2', 'Data warehouse: características y arquitectura', `${col(`${table(['Característica (Inmon, 1992)', 'Significado'], [['Orientada a temas', 'Ventas, clientes, inventario; no aplicaciones'], ['Integrada', 'Códigos, unidades y formatos homogéneos'], ['Variable en el tiempo', 'Guarda la historia'], ['No volátil', 'Se carga y se consulta; no se modifica en el día a día']])}`)}
    ${col(w('inmonkimball'), 'wide')}`, { lead: 'Dos escuelas de diseño. Hoy predomina el enfoque dimensional de Kimball, a menudo con capas previas (medallion, Tema 21).' });

  D.s('18.3', 'Modelado dimensional: el cubo', `${col(w('cube3d'), 'wide')}${col(`${pts(['<b>Hechos</b>: eventos medibles con <b>medidas</b> (unidades, importe). Tabla larga y estrecha.', '<b>Dimensiones</b>: el contexto (quién, qué, cuándo, dónde). Cortas, anchas y <b>desnormalizadas</b>.', 'Kimball, <i>The Data Warehouse Toolkit</i> (1996).'])}
      ${study('Cada celda del cubo es una medida agregada para una combinación de dimensiones. Las operaciones OLAP clásicas son slice, dice, roll-up/drill-down y pivot.')}`, 'narrow')}`,
    { lead: 'Medidas analizadas <b>por</b> ejes: «ventas por categoría, ciudad y trimestre». Gira el cubo y aplica slice y roll-up (datos simulados).' });

  D.s('18.3', 'Esquema en estrella', `${col(w('star'), 'wide')}${col(`${box('', 'El grano, primero', '¿Qué representa exactamente una fila? «Una por línea de pedido» ≠ «una por pedido». Elige el <b>más fino</b> disponible.')}
      ${box('', 'Claves subrogadas', '<code>cliente_key</code> ≠ <code>cliente_id</code>: integra fuentes, aísla de cambios y permite <b>varias versiones</b> del mismo cliente (18.4).')}`, 'narrow')}`,
    { id: 's18.3b', lead: 'Hechos en el centro, dimensiones alrededor. Haz clic en una dimensión; prueba el copo de nieve.' });

  D.s('18.3', 'La estrella de Mercado Next, en vivo', `${col(sql([['1 · Construir la estrella', STAR], ['2 · Consulta típica', `SELECT d.anio, d.trimestre, p.categoria,\n       SUM(f.importe)  AS ventas,\n       SUM(f.unidades) AS unidades\nFROM fact_ventas f\nJOIN dim_fecha    d ON d.fecha_key    = f.fecha_key\nJOIN dim_producto p ON p.producto_key = f.producto_key\nJOIN dim_cliente  c ON c.cliente_key  = f.cliente_key\nWHERE c.segmento = 'Particular'\nGROUP BY d.anio, d.trimestre, p.categoria\nORDER BY d.anio, d.trimestre, ventas DESC;`],
      ['3 · Precio medio bien', `SELECT p.categoria,\n       ROUND(SUM(f.importe) / SUM(f.unidades), 2) AS precio_medio_correcto,\n       ROUND(AVG(f.importe / f.unidades), 2)       AS media_de_ratios_mal\nFROM fact_ventas f JOIN dim_producto p USING (producto_key)\nGROUP BY p.categoria;`], ['Ventas por ciudad y mes', `SELECT c.ciudad, d.mes, SUM(f.importe) AS ventas\nFROM fact_ventas f\nJOIN dim_fecha d   USING (fecha_key)\nJOIN dim_cliente c USING (cliente_key)\nGROUP BY c.ciudad, d.mes ORDER BY c.ciudad, d.mes;`]], { autorun: false }), 'wide')}
    ${col(`${table(['Medida', 'Se suma…', 'Ejemplo'], [['Aditiva', 'Por todas las dimensiones', 'Importe, unidades'], ['Semiaditiva', 'No por el tiempo', 'Stock, saldo'], ['No aditiva', 'No', 'Precio unitario, %']], 'small')}
      <div class="box" style="text-align:center"><p style="font-family:var(--font-mono);font-size:18px">p̄ = Σ importe / Σ unidades<br>≠ (1/n) Σ (importe / unidades)</p></div>`, 'narrow')}`,
    { id: 's18.3c', lead: 'Construimos un esquema en estrella desde las tablas de Mercado Next con PostgreSQL de verdad. Empieza por el paso 1.' });

  D.s('18.4', '(+) Slowly Changing Dimensions', `${col(w('scd'))}`,
    { lead: 'Ana se muda dos veces. ¿A qué ciudad pertenecen sus ventas antiguas? Elige el tipo de SCD y aplica los cambios.' });

  D.s('18.5', 'Data lake', `${col(w('lake'), 'wide')}${col(`${pts(['James Dixon (2010): el data mart es agua embotellada; el lago, agua en estado natural.', 'Datos de <b>cualquier tipo</b>, en formato original, sobre almacenamiento barato (S3, ADLS, GCS).', '<b>Schema-on-read</b> · almacenamiento y cómputo separados · zonas bruta, limpia y refinada.'])}
      ${box('warn', 'El pantano de datos', 'Sin gobierno, catálogo ni calidad → <b>data swamp</b>. Origen del lakehouse (Tema 21).')}`, 'narrow')}`,
    { lead: 'Activa o quita el gobierno y mira en qué se convierte el lago.' });

  D.s('18.6', 'Data warehouse frente a data lake', `${col(w('dwlake'))}${col(table(['', 'Data warehouse', 'Data lake'], [['Datos', 'Estructurados, limpios', 'Cualquier tipo, en bruto'], ['Esquema', 'On-write', 'On-read'], ['Usuarios', 'Negocio, BI', 'Ingeniería, ciencia de datos'], ['SQL', 'Muy rápido', 'Variable'], ['Coste/TB', 'Mayor', 'Muy bajo'], ['Uso', 'Informes, KPI', 'Exploración, ML'], ['Gobierno', 'Fuerte por diseño', 'Hay que añadirlo']], 'small') + box('', 'Clave', 'Muchas empresas mantenían <b>los dos</b>: dos copias, dos seguridades, datos desincronizados. Eso es lo que resuelve el <b>lakehouse</b> (Bloque VI).'))}`);

  // ================= TEMA 19 =================
  D.tema({ n: 19, title: 'Integración y formatos de almacenamiento', obj: ['ETL frente a ELT y cuándo usar cada uno', 'Por qué el almacenamiento por columnas acelera la analítica', 'Parquet, ORC y Avro: cuándo usar cada uno'] });

  D.s('19.1', 'ETL frente a ELT', `${col(w('etlelt'), 'wide')}${col(`${table(['', 'ETL', 'ELT'], [['Transforma', 'Servidor intermedio', 'Dentro del DW/lakehouse, con SQL'], ['Datos en bruto', 'No se conservan', 'Se conservan'], ['Época', 'DW locales', 'Nube elástica'], ['Herramientas', 'Informatica, SSIS, Talend', 'Fivetran/Airbyte + dbt']], 'small')}
      ${pts(['Carga <b>completa</b> frente a <b>incremental</b>.', '<b>CDC</b>: leer el WAL/binlog del origen (Debezium) → casi tiempo real sin cargar la BD operacional.'])}`, 'narrow')}`,
    { lead: 'ELT se ha impuesto con la nube. ETL sigue teniendo sentido para anonimizar datos sensibles antes de que salgan del origen (Tema 23).' });

  D.s('19.2', 'Almacenamiento por filas frente a por columnas', `${col(w('rowcol'))}`,
    { lead: 'Elige una consulta y mira qué bloques hay que leer del disco en cada organización.' });

  D.s('19.2', 'Compresión columnar: diccionario y RLE', `${col(w('rle'), 'wide')}${col(`<div class="box" style="text-align:center"><p style="font-size:21px">razón = tamaño original / tamaño comprimido</p></div>
      ${pts(['Valores de una columna: <b>mismo tipo y parecidos</b> → comprimen muy bien.', '<b>Diccionario</b>: «Madrid» → un código de pocos bits.', '<b>RLE</b>: «Madrid × 5000» en lugar de 5000 veces.', '<b>Ejecución vectorizada</b>: bloques de valores, mejor uso de la CPU.'])}`, 'narrow')}`,
    { id: 's19.2b', lead: 'Edita la columna, ordénala y mira cómo cambia la compresión.' });

  D.s('19.3', 'Formatos de fichero: medido con un millón de ventas', `${col(w('formats'), 'wide')}${col(table(['Formato', 'Organización', 'Cuándo'], [['CSV', 'Filas, texto', 'Intercambio puntual'], ['JSON', 'Filas, texto', 'APIs y logs'], ['Avro', 'Filas, binario', 'Streaming, Kafka, evolución de esquema'], ['Parquet', 'Columnas', 'Analítica: la opción por defecto'], ['ORC', 'Columnas', 'Ecosistema Hive']], 'small'), 'narrow')}`,
    { lead: 'Parquet + zstd: 8,5 MB frente a 52,1 MB del CSV (×6,1) y 153,6 MB del JSON (×18). Datos reales medidos para el temario.' });

  D.s('19.3', 'Dentro de un fichero Parquet', `${col(w('parquet'), 'wide')}${col(`${pts(['<b>Row groups</b> → <b>column chunks</b> → páginas codificadas y comprimidas (snappy, zstd…).', 'El <b>footer</b> guarda el esquema y estadísticas (mín, máx, nulos) por columna y grupo.', 'Con ellas se <b>saltan grupos enteros</b>: el <i>predicate pushdown</i> del Tema 3.'])}
      ${box('warn', 'Atención', 'Ficheros <b>inmutables</b>: cambiar una fila es reescribir el fichero. Sin transacciones ni versiones → formatos de tabla abiertos (Delta, Iceberg, Tema 21).')}`, 'narrow')}`,
    { id: 's19.3b', lead: 'Parquet (Twitter y Cloudera, 2013), el estándar de facto. Mueve el filtro y mira qué row groups se saltan sin leerlos.' });

  // ================= TEMA 20 =================
  D.tema({ n: 20, title: 'Data warehouses en la nube: Snowflake y BigQuery', obj: ['Snowflake: almacenamiento y cómputo separados', 'Virtual warehouses y modelo de costes', 'Stages, COPY INTO y Snowpipe', 'Time Travel, zero-copy cloning y roles', 'BigQuery: serverless, particionado y clustering', 'Comparar ambas plataformas'] });

  D.s('20.1', 'Snowflake: almacenamiento y cómputo separados', `${col(w('snowarch'), 'wide')}${col(`${pts(['Fundada en 2012, lanzada en 2015 (AWS); hoy también Azure y Google Cloud.', '<b>Almacenamiento</b>: micro-particiones inmutables de 50–500 MB con rangos por columna → <b>pruning</b>.', '<b>Cómputo</b>: varios virtual warehouses independientes sobre los mismos datos.', '<b>Servicios</b>: autenticación, metadatos, optimizador, transacciones.'])}`, 'narrow')}`,
    { lead: 'La carga ETL no frena los cuadros de mando: cada uno tiene su warehouse. Prueba a filtrar y mira el pruning.' });

  D.s('20.2', 'Virtual warehouses y modelo de costes', `${col(w('credits'), 'wide')}${col(`${code(`CREATE WAREHOUSE wh_bi
  WAREHOUSE_SIZE = 'MEDIUM'
  AUTO_SUSPEND   = 60     -- se apaga tras 60 s
  AUTO_RESUME    = TRUE;`, 'sql', 'font-size:16px')}
      <div class="box" style="text-align:center"><p style="font-size:18px">coste = créditos/h × horas encendido × precio del crédito</p></div>
      ${pts(['Por segundo, mínimo 60 s por arranque.', 'Escalar <b>hacia arriba</b> (talla) o <b>hacia fuera</b> (multi-cluster, Enterprise).'])}`, 'narrow')}`,
    { lead: 'Cada talla duplica recursos y créditos. Ajusta la talla y las horas encendido.' });

  D.s('20.3', 'Bases de datos, esquemas, tablas y stages', `${col(`${pts(['Cuenta → base de datos → esquema → tabla: <code>bd.esquema.tabla</code>.', 'Tablas permanentes, <b>transitorias</b> y <b>temporales</b> (sin Fail-safe, más baratas).'])}
      ${table(['Stage', 'Referencia', 'Uso'], [['De usuario', '@~', 'Ficheros personales'], ['De tabla', '@%ventas', 'Para una tabla concreta'], ['Interno con nombre', '@stage_ventas', 'Gestionado por Snowflake'], ['Externo', '@s3_ventas', 'Bucket de S3, Azure o GCS']])}`)}
    ${col(w('copyinto'), 'wide')}`, { lead: 'Un stage es una ubicación de ficheros desde la que se cargan (o a la que se descargan) datos.' });

  D.s('20.4', 'Carga de datos: COPY INTO y Snowpipe', `${col(code(`CREATE FILE FORMAT ff_csv
  TYPE = 'CSV' SKIP_HEADER = 1 FIELD_OPTIONALLY_ENCLOSED_BY = '"';
CREATE STAGE stage_ventas FILE_FORMAT = ff_csv;

PUT file:///datos/ventas_2026_01.csv @stage_ventas;   -- desde SnowSQL

COPY INTO ventas
FROM @stage_ventas
PATTERN = '.*ventas_2026_.*[.]csv'
ON_ERROR = 'CONTINUE';

CREATE PIPE pipe_ventas AUTO_INGEST = TRUE AS
  COPY INTO ventas FROM @s3_ventas FILE_FORMAT = (FORMAT_NAME = 'ff_csv');`, 'sql', 'font-size:16px'), 'wide')}
    ${col(pts(['<code>COPY INTO</code> recuerda qué ficheros ha cargado: repetirlo no duplica.', '<b>Snowpipe</b>: la nube avisa cuando llega un fichero y se carga en minutos, con cómputo serverless facturado aparte.']), 'narrow')}`);

  D.s('20.5', 'Time Travel y zero-copy cloning', `${col(w('timetravel'))}`,
    { lead: 'Las micro-particiones son inmutables: Snowflake conserva las versiones anteriores. Mueve el tiempo hacia atrás, recupera lo borrado y clona.' });

  D.s('20.6', 'Roles y permisos en Snowflake', `${col(w('snowroles'), 'wide')}${col(`${code(`USE ROLE USERADMIN;
CREATE ROLE analista;
GRANT ROLE analista TO USER ana;
GRANT ROLE analista TO ROLE SYSADMIN;
USE ROLE SECURITYADMIN;
GRANT USAGE ON WAREHOUSE wh_bi TO ROLE analista;
GRANT SELECT ON FUTURE TABLES
  IN SCHEMA mercado.ventas TO ROLE analista;`, 'sql', 'font-size:14px')}
      ${box('recuerda', 'Recordamos que…', 'Mismo modelo que PostgreSQL (Tema 9). FUTURE TABLES ≈ ALTER DEFAULT PRIVILEGES. Novedad: el <b>cómputo</b> también tiene permisos (USAGE sobre el warehouse).')}`, 'narrow')}`,
    { lead: 'RBAC: privilegios a roles, roles a usuarios, y roles que heredan de roles. Haz clic en cada rol.' });

  D.s('20.7', '(+) Data sharing y Snowpark', `${col(`${pts(['<b>Data sharing</b>: compartir con otras cuentas <b>sin copiar</b>; el consumidor paga su cómputo y ve los datos siempre actuales.', '<b>Snowflake Marketplace</b>: meteorología, demografía, finanzas…', '<b>Snowpark</b>: DataFrames en Python, Java y Scala que se ejecutan <b>dentro</b> de Snowflake (se traducen a SQL).'])}`)}
    ${col(code(`from snowflake.snowpark import Session
from snowflake.snowpark.functions import col, sum as sum_

session = Session.builder.configs(parametros).create()
(session.table("mercado.ventas.fact_ventas")
        .filter(col("ANIO") == 2026)
        .group_by("CATEGORIA")
        .agg(sum_("IMPORTE").alias("VENTAS"))
        .sort(col("VENTAS").desc())
        .show())`, 'py', 'font-size:15px'))}`);

  D.s('20.8', 'BigQuery: serverless y pago por consulta', `${col(w('bqcost'), 'wide')}${col(`${pts(['Google Cloud, desde 2011, basado en <b>Dremel</b>. Sin warehouses: Google asigna <b>slots</b>.', 'Proyecto → dataset → tabla.', 'Bajo demanda: <b>6,25 USD/TiB</b> procesado (EE. UU.; 1 TiB gratis al mes) · o capacidad (Standard, Enterprise, Enterprise Plus).'])}
      ${box('warn', 'Lo que NO reduce el coste', '<code>LIMIT 10</code> no reduce los bytes procesados. Lo que sí: <b>columnas justas</b> y <b>filtrar por la partición</b>. Usa <i>dry run</i>.')}`, 'narrow')}`,
    { lead: 'Tabla de 3,65 TiB, 20 columnas y un año de datos. Diseña la consulta y mira cuánto cuesta.' });

  D.s('20.9', 'BigQuery: particionado y clustering', `${col(w('bqpart'), 'wide')}${col(code(`CREATE TABLE tienda.ventas (
  venta_id INT64, fecha DATE,
  ciudad STRING, producto_id INT64,
  importe NUMERIC
)
PARTITION BY fecha
CLUSTER BY ciudad, producto_id
OPTIONS (require_partition_filter = TRUE);`, 'sql', 'font-size:15px') + pts(['Partición por ingesta, fecha/hora o rango de enteros.', 'Clustering: hasta <b>4 columnas</b> dentro de cada partición.']), 'narrow')}`,
    { lead: 'La partición descarta los demás días; el clustering, los demás bloques del día.' });

  D.s('20.10', 'Snowflake frente a BigQuery', `${col(table(['', 'Snowflake', 'BigQuery'], [['Nubes', 'AWS, Azure, Google Cloud', 'Google Cloud (+ BigQuery Omni)'], ['Cómputo', 'Virtual warehouses', 'Serverless (slots)'], ['Precio', 'Créditos por segundo', 'Bytes procesados o capacidad'], ['Organización', 'Micro-particiones automáticas', 'Particionado y clustering'], ['Recuperación', 'Time Travel ≤ 90 días + Fail-safe', 'Time Travel ≤ 7 días + fail-safe 7 días'], ['Compartir', 'Data sharing, Marketplace', 'Analytics Hub'], ['Programación', 'Snowpark', 'BigQuery DataFrames, BigQuery ML'], ['Punto fuerte', 'Multinube, aislamiento, clonación', 'Cero administración']]), 'wide')}
    ${col(box('', 'Clave', 'Ambas resuelven bien el problema. Decide la nube de la empresa, el patrón de uso y el equipo. En los dos casos, <b>el diseño importa más que la plataforma</b>: modelo dimensional, columnas justas, filtros por partición y cómputo que se apaga.'), 'narrow')}`);
}
