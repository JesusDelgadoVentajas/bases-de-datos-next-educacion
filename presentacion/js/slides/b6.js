// Bloque VI · Big Data aplicado (Temas 21–22)
import { col, pts, box, w, table, cards, study, code, sql } from '../deck.js';
import * as W from '../w/b6.js';

export const widgets = W.widgets;

const BRONZE = `DROP TABLE IF EXISTS bronze_pedidos CASCADE;
CREATE TABLE bronze_pedidos (raw JSONB, fuente TEXT, ingerido_en TIMESTAMPTZ DEFAULT now());
INSERT INTO bronze_pedidos (raw, fuente) VALUES
 ('{"id":"201","cliente":"1","fecha":"2026-03-01","importe":"89.90","estado":"ENTREGADO"}', 'web'),
 ('{"id":"202","cliente":"2","fecha":"01/03/2026","importe":"49,90","estado":"pendiente"}', 'erp'),
 ('{"id":"202","cliente":"2","fecha":"01/03/2026","importe":"49,90","estado":"pendiente"}', 'erp'),
 ('{"id":"203","cliente":"4","fecha":"2026-03-02","importe":"-5","estado":"enviado"}', 'web'),
 ('{"id":"204","cliente":"3","fecha":"2026-03-02","importe":"149.00","estado":"Enviado"}', 'web'),
 ('{"id":"205","cliente":null,"fecha":"2026-03-03","importe":"34.50","estado":"entregado"}', 'web');
SELECT fuente, raw FROM bronze_pedidos;`;
const SILVER = `DROP TABLE IF EXISTS silver_pedidos CASCADE;
CREATE TABLE silver_pedidos AS
SELECT DISTINCT
  (raw->>'id')::int      AS pedido_id,
  (raw->>'cliente')::int AS cliente_id,
  CASE WHEN raw->>'fecha' ~ '^\\d{2}/'
       THEN TO_DATE(raw->>'fecha', 'DD/MM/YYYY')
       ELSE (raw->>'fecha')::date END             AS fecha,
  REPLACE(raw->>'importe', ',', '.')::numeric(10,2) AS importe,
  LOWER(raw->>'estado')                          AS estado
FROM bronze_pedidos
WHERE raw->>'cliente' IS NOT NULL                       -- sin cliente: fuera
  AND REPLACE(raw->>'importe', ',', '.')::numeric > 0;  -- importes inválidos: fuera
SELECT * FROM silver_pedidos ORDER BY pedido_id;`;
const GOLD = `DROP TABLE IF EXISTS gold_ventas_ciudad_dia;
CREATE TABLE gold_ventas_ciudad_dia AS
SELECT c.ciudad, s.fecha, COUNT(*) AS pedidos, SUM(s.importe) AS ventas
FROM silver_pedidos s
JOIN cliente c ON c.id = s.cliente_id
GROUP BY c.ciudad, s.fecha;
SELECT * FROM gold_ventas_ciudad_dia ORDER BY fecha, ciudad;`;

export function build(D) {
  D.bloque({ n: 'VI', title: 'Big Data aplicado a bases de datos',
    intro: 'Terabytes o petabytes que llegan sin parar y en formatos de todo tipo. La evolución del SGBD clásico al <b>lakehouse</b>: almacenamiento distribuido, motores SQL en paralelo sobre ficheros, formatos de tabla abiertos y arquitectura medallion. Y Databricks, una de las plataformas que lo materializan.',
    temas: [[21, 'Del SGBD clásico al lakehouse'], [22, 'Gestión de bases de datos en Databricks']] });

  // ================= TEMA 21 =================
  D.tema({ n: 21, title: 'Del SGBD clásico al lakehouse', obj: ['Cuándo una base de datos tradicional se queda corta', 'Almacenamiento distribuido: de HDFS al object storage', 'SQL sobre Big Data: Hive, Spark SQL y Trino', 'Formatos de tabla abiertos: Delta Lake e Iceberg', 'El lakehouse y la arquitectura medallion'] });

  D.s('21.1', 'Cuándo una base de datos tradicional se queda corta', `${col(w('amdahl'), 'wide')}${col(`${cards([['Volumen', 'TB o PB que no caben o no se procesan a tiempo en una máquina'], ['Velocidad', 'Clics, sensores, transacciones: casi en tiempo real'], ['Variedad', 'Tablas, JSON, logs, imágenes, texto']], 1)}
      <div class="box" style="text-align:center"><p style="font-family:var(--font-mono);font-size:19px">S(n) = 1 / ((1 − p) + p/n)<br>lím S(n) = 1 / (1 − p)</p></div>`, 'narrow')}`,
    { lead: 'Repartir el trabajo entre muchas máquinas… con un límite (ley de Amdahl, 1967). Mueve la fracción paralelizable.' });

  D.s('21.2', 'Almacenamiento distribuido: de HDFS al object storage', `${col(w('hdfs'), 'wide')}${col(`${table(['', 'HDFS', 'Object storage'], [['Datos', 'En los nodos de cómputo', 'Servicio independiente'], ['Escalar', 'Todo junto', 'Por separado'], ['Coste', 'Clúster siempre encendido', 'Almacenado + cómputo al usar'], ['Durabilidad', 'Réplicas del clúster', '«Once nueves»'], ['Gestión', 'Compleja', 'Mínima']], 'small')}
      ${box('recuerda', 'Recordamos que…', 'Es la idea de Snowflake y BigQuery (Tema 20): almacenamiento barato y compartido + cómputo elástico.')}`, 'narrow')}`,
    { lead: 'Hadoop (2006), inspirado en GFS y MapReduce de Google. Sube un fichero, mira sus bloques replicados y tumba un DataNode.' });

  D.s('21.3', 'SQL sobre Big Data: Hive, Spark SQL y Trino', `${col(table(['', 'Apache Hive', 'Spark SQL', 'Trino'], [['Origen', 'Facebook, 2008', 'Berkeley AMPLab; 2014', 'Presto (Facebook, 2012) → Trino (2020)'], ['Ejecuta', 'SQL → lotes (MapReduce, Tez, Spark)', 'Motor en memoria, optimizador Catalyst', 'MPP que lee las fuentes por etapas'], ['Fuerte en', 'Lotes enormes; <b>Hive Metastore</b>', 'SQL + Python + streaming + ML', 'Interactivo y <b>federado</b>'], ['Hoy', 'Hadoop existentes', 'Databricks, EMR, Fabric', 'Starburst, Athena']]), 'wide')}
    ${col(`${code(`-- Trino: una consulta, tres sistemas
SELECT c.ciudad, SUM(v.importe)
FROM hive.lake.ventas v           -- Parquet en S3
JOIN postgresql.public.cliente c  -- BD operacional
  ON c.id = v.cliente_id
GROUP BY c.ciudad;`, 'sql', 'font-size:15px')}
      ${pts(['Los tres: datos en ficheros (cada vez más Parquet) y un <b>catálogo</b> que sabe qué tablas existen y qué ficheros las forman.'])}`, 'narrow')}`,
    { lead: 'Programar MapReduce era laborioso: pronto llegaron los motores SQL sobre los ficheros del data lake.' });

  D.s('21.4', 'Formatos de tabla abiertos: Delta Lake e Iceberg', `${col(w('deltalog'), 'wide')}${col(`${table(['Capacidad', 'Qué aporta'], [['ACID', 'Nunca escrituras a medias'], ['UPDATE, DELETE, MERGE', 'Corregir, CDC, RGPD'], ['Schema enforcement', 'Rechaza escrituras incompatibles'], ['Time travel', 'Versiones anteriores'], ['Estadísticas', 'Saltar ficheros sin listar']], 'small')}
      ${pts(['<b>Delta Lake</b> (Databricks, abierto en 2019): <code>_delta_log</code>.', '<b>Iceberg</b> (Netflix 2017, Apache 2020): árbol de metadatos y <b>particionado oculto</b>.', '<b>Hudi</b> (Uber): cargas incrementales.'])}`, 'narrow')}`,
    { lead: 'Una capa de metadatos transaccional sobre ficheros Parquet. Ejecuta operaciones y mira cómo crece el registro de transacciones.' });

  D.s('21.4', 'Delta e Iceberg: hacia la interoperabilidad', `${col(`${pts(['Problemas del lake de Parquet: <b>sin transacciones</b>, sin UPDATE/DELETE/MERGE, sin control de esquema, <b>listar ficheros es lento</b>.', 'Los datos siguen siendo <b>ficheros abiertos</b>, pero se comportan como una tabla de base de datos.'])}
      ${box('gray', 'Dato', 'Snowflake, BigQuery y Databricks leen y escriben Iceberg; Delta ofrece <b>UniForm</b> para leerse como Iceberg; en 2024 Databricks adquirió <b>Tabular</b> (creadores de Iceberg).')}`)}
    ${col(code(`_delta_log/
  00000000000000000000.json   ← commit 0: add part-000.parquet
  00000000000000000001.json   ← commit 1: add part-001.parquet
  00000000000000000002.json   ← commit 2: remove part-000
                                          add    part-002
  00000000000000000010.checkpoint.parquet`, 'sql', 'font-size:15px'))}`, { id: 's21.4b' });

  D.s('21.5', 'El lakehouse', `${col(w('lakehouse'), 'wide')}${col(`${pts(['Armbrust, Ghodsi, Xin y Zaharia, CIDR 2021.', 'Almacenamiento <b>barato y abierto</b> del lake + <b>fiabilidad y rendimiento</b> del DW.', '<b>Catálogo con gobierno</b> unificado: permisos, linaje, auditoría.', 'BI, ciencia de datos, ML y streaming sobre <b>la misma copia</b>.'])}
      ${box('', 'Clave', 'No es un producto: es una <b>arquitectura</b>. Databricks (Delta + Unity Catalog), Iceberg + Trino/Spark, y los DW en la nube convergen hacia ella.')}`, 'narrow')}`,
    { lead: 'Dejar de mantener un data lake y un data warehouse separados. Recorre la evolución.' });

  D.s('21.6', 'Arquitectura medallion: bronze, silver y gold', `${col(w('medallion'))}`,
    { lead: 'Refinar los datos en tres capas. Mira cómo fluyen los pedidos de Mercado Next y qué les pasa en cada capa.' });

  D.s('21.6', 'Medallion en vivo con SQL', `${col(sql([['1 · Bronze: ingesta en bruto', BRONZE], ['2 · Silver: limpiar e integrar', SILVER], ['3 · Gold: listo para negocio', GOLD]], { autorun: false }), 'wide')}
    ${col(`${table(['Capa', 'Contenido'], [['Bronze', 'Tal como llega + metadatos de ingesta'], ['Silver', 'Tipos, sin duplicados, nulos tratados, códigos unificados'], ['Gold', 'Agregados, KPI, estrella, features']], 'small')}
      ${pts(['<b>Trazabilidad</b>: siempre se puede reconstruir desde bronze.', '<b>Responsabilidades</b>: ingeniería (bronze/silver), analítica (gold).', '<b>Reutilización</b>: muchas gold sobre las mismas silver.'])}
      ${box('recuerda', 'Recordamos que…', 'Gold = hechos y dimensiones (Tema 18). Bronze → silver = el ELT del Tema 19.')}`, 'narrow')}`,
    { id: 's21.6b', lead: 'Pedidos que llegan de la web y del ERP con formatos distintos, duplicados y errores. Ejecuta los pasos 1 → 2 → 3.' });

  // ================= TEMA 22 =================
  D.tema({ n: 22, title: 'Gestión de bases de datos en Databricks', obj: ['Workspace, clústeres y SQL warehouses', 'Unity Catalog: catálogo.esquema.tabla, gestionadas y externas, volúmenes', 'Crear, consultar y mantener tablas Delta', 'Ingesta con COPY INTO y Auto Loader', 'Permisos y gobierno', '(+) Pipelines, BI y Machine Learning'] });

  D.s('22.1', 'Qué es Databricks: workspace, clústeres y SQL warehouses', `${col(`${pts(['Fundada en 2013 por los creadores de <b>Apache Spark</b> (Berkeley). AWS, Azure y Google Cloud.', 'Lakehouse sobre <b>Delta Lake</b> y <b>Unity Catalog</b>.', '<b>Workspace</b>: notebooks (Python, SQL, Scala, R), Git, consultas, cuadros de mando, jobs.'])}
      ${box('recuerda', 'Recordamos que…', 'Un SQL warehouse ≈ un virtual warehouse de Snowflake (Tema 20). Pero los datos están en <b>tablas Delta abiertas</b>, no en un formato propietario.')}`)}
    ${col(table(['Cómputo', 'Para qué', 'Clave'], [['All-purpose', 'Notebooks interactivos', 'Compartido; se apaga solo'], ['Job', 'Procesos programados', 'Se crea y destruye: más barato'], ['SQL warehouse', 'SQL y BI', 'Serverless arranca en segundos'], ['Serverless', 'Notebooks y jobs', 'Sin gestionar clústeres']]), 'wide')}`);

  D.s('22.2', 'Unity Catalog: catálogo, esquema y tabla', `${col(w('unity'), 'wide')}${col(`${code(`SELECT * FROM prod.ventas.pedidos;
USE CATALOG prod;
USE SCHEMA ventas;
SELECT * FROM pedidos;   -- lo mismo
CREATE CATALOG IF NOT EXISTS dev;`, 'sql', 'font-size:15px')}
      ${pts(['Gobierno centralizado de <b>datos e IA</b>: permisos, auditoría, linaje, descubrimiento.', 'Catálogos por <b>entorno</b> (dev, pre, prod); esquemas por <b>capa</b> o dominio.'])}`, 'narrow')}`,
    { lead: 'Espacio de nombres de tres niveles: <code>catalogo.esquema.objeto</code>. Haz clic en cualquier objeto.' });

  D.s('22.3', 'Tablas gestionadas y externas, vistas y volúmenes', `${col(w('managedext'), 'wide')}${col(`${code(`CREATE TABLE prod.ventas.pedidos (…);      -- gestionada
CREATE TABLE prod.ventas.pedidos_historico
LOCATION 'abfss://lake@cuenta.dfs.core.windows.net/historico';  -- externa
CREATE VOLUME prod.ventas.ficheros_entrada;
SELECT * FROM read_files(
  '/Volumes/prod/ventas/ficheros_entrada/x.csv',
  format => 'csv', header => true);`, 'sql', 'font-size:13.5px')}
      ${pts(['Externas: requieren <b>credencial de almacenamiento</b> y <b>ubicación externa</b>.', 'Gestionadas (recomendadas): <b>predictive optimization</b>.', 'Volúmenes: ficheros gobernados (imágenes, PDF, CSV, modelos).'])}`, 'narrow')}`,
    { lead: '¿Quién controla el almacenamiento? Haz DROP TABLE de cada una y mira qué queda.' });

  D.s('22.4', 'Crear y consultar tablas Delta con SQL', `${col(code(`CREATE TABLE prod.silver.clientes (
  cliente_id BIGINT NOT NULL,
  nombre STRING, email STRING, ciudad STRING, alta DATE,
  CONSTRAINT pk_clientes PRIMARY KEY (cliente_id)   -- informativa
) COMMENT 'Clientes limpios y deduplicados';

CREATE OR REPLACE TABLE prod.gold.ventas_por_ciudad AS
SELECT c.ciudad, SUM(p.importe) AS ventas
FROM prod.silver.pedidos p
JOIN prod.silver.clientes c USING (cliente_id)
GROUP BY c.ciudad;

DESCRIBE DETAIL  prod.silver.clientes;   -- formato, ubicación, ficheros
DESCRIBE HISTORY prod.silver.clientes;   -- versiones`, 'sql', 'font-size:16px'), 'wide')}
    ${col(`${pts(['En Databricks <b>toda tabla es Delta</b> por defecto.', 'El SQL que ya conoces, con extensiones (STRING, DESCRIBE HISTORY…).'])}
      ${box('warn', 'Restricciones informativas', 'PK y FK <b>no se aplican</b>: insertar un cliente_id duplicado no da error. Sí se aplican NOT NULL y CHECK. La unicidad la garantiza la carga (MERGE).')}`, 'narrow')}`);

  D.s('22.5', 'MERGE, Time Travel, OPTIMIZE y clustering', `${col(w('optimize'), 'wide')}${col(`${code(`MERGE INTO prod.silver.clientes AS t
USING prod.bronze.clientes_cambios AS s
ON t.cliente_id = s.cliente_id
WHEN MATCHED AND s.operacion = 'DELETE' THEN DELETE
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED AND s.operacion <> 'DELETE'
  THEN INSERT *;

SELECT * FROM t VERSION AS OF 12;
RESTORE TABLE t TO VERSION AS OF 12;
CREATE TABLE … CLUSTER BY (fecha, ciudad);
OPTIMIZE t;  VACUUM t;   -- 7 días`, 'sql', 'font-size:13.5px')}
      ${box('recuerda', 'Recordamos que…', 'MERGE: Tema 6 y SCD tipo 2 en el Tema 18.')}`, 'narrow')}`,
    { lead: 'Las cargas frecuentes generan miles de ficheros pequeños. Ejecuta cargas, OPTIMIZE con liquid clustering y VACUUM.' });

  D.s('22.6', 'Ingesta de datos: COPY INTO y Auto Loader', `${col(`${code(`COPY INTO prod.bronze.ventas
FROM '/Volumes/prod/ventas/ficheros_entrada/'
FILEFORMAT = JSON
FORMAT_OPTIONS ('inferSchema' = 'true')
COPY_OPTIONS ('mergeSchema' = 'true');`, 'sql', 'font-size:15px')}
      ${code(`(spark.readStream.format("cloudFiles")
   .option("cloudFiles.format", "json")
   .option("cloudFiles.schemaLocation", ".../esquema_ventas")
   .load("/Volumes/prod/ventas/ficheros_entrada/")
   .writeStream
   .option("checkpointLocation", ".../ventas")
   .trigger(availableNow=True)
   .toTable("prod.bronze.ventas"))`, 'py', 'font-size:14px')}`, 'wide')}
    ${col(table(['', 'COPY INTO', 'Auto Loader'], [['Qué es', 'Sentencia SQL', 'Fuente cloudFiles (streaming)'], ['Idempotente', 'Sí: recuerda ficheros', 'Sí: checkpoint'], ['Escala', 'Hasta miles de ficheros', 'Millones'], ['Esquema', 'inferSchema / mergeSchema', 'Infiere y evoluciona']], 'small') + pts(['Bases de datos y SaaS: conectores gestionados <b>Lakeflow Connect</b>.']), 'narrow')}`,
    { lead: 'Llevar ficheros del almacenamiento a tablas Delta (la capa bronze).' });

  D.s('22.7', 'Permisos y gobierno en Unity Catalog', `${col(w('unity', { grants: true }), 'wide')}${col(`${code(`GRANT USE CATALOG ON CATALOG prod      TO \`analistas\`;
GRANT USE SCHEMA  ON SCHEMA  prod.gold TO \`analistas\`;
GRANT SELECT      ON SCHEMA  prod.gold TO \`analistas\`;
SHOW GRANTS ON SCHEMA prod.gold;`, 'sql', 'font-size:13.5px')}
      ${pts(['Se <b>heredan hacia abajo</b>.', 'Filtros de fila y <b>máscaras de columna</b> (≈ RLS, Tema 9).', 'Linaje automático, auditoría, etiquetas.'])}`, 'narrow')}`,
    { lead: 'Concede permisos en cualquier nivel y mira cómo se heredan. Para leer una tabla hacen falta tres privilegios encadenados.' });

  D.s('22.7', 'Máscaras de columna', `${col(w('mask'))}${col(code(`CREATE FUNCTION prod.seguridad.mascara_email(email STRING)
RETURN CASE
  WHEN is_account_group_member('soporte') THEN email
  ELSE regexp_replace(email, '^[^@]+', '***')
END;

ALTER TABLE prod.silver.clientes
  ALTER COLUMN email SET MASK prod.seguridad.mascara_email;`, 'sql', 'font-size:15px'))}`,
    { id: 's22.7b', lead: 'La misma consulta, distinto resultado según quién la ejecuta.' });

  D.s('22.8', '(+) Pipelines declarativos y jobs', `${col(w('dlt'), 'wide')}${col(`${pts(['<b>Lakeflow Spark Declarative Pipelines</b> (antes DLT): se declara qué tablas deben existir; el sistema resuelve orden, incrementalidad y errores.', '<b>Expectativas</b>: reglas de calidad.', '<b>Lakeflow Jobs</b> (antes Workflows): orquesta tareas con dependencias y horarios.'])}
      ${code(`CREATE OR REFRESH STREAMING TABLE silver_ventas (
  CONSTRAINT importe_valido
  EXPECT (importe > 0) ON VIOLATION DROP ROW
) AS SELECT … FROM STREAM(bronze_ventas);`, 'sql', 'font-size:13.5px')}`, 'narrow')}`,
    { lead: 'Un pipeline bronze → silver → gold con una expectativa de calidad. Lanza un lote de datos.' });

  D.s('22.9', 'Databricks SQL y herramientas de BI', `${col(table(['Herramienta', 'Conexión'], [['Power BI', 'Conector nativo; Import (copia) o DirectQuery (en vivo)'], ['Tableau, Looker, Qlik', 'Conectores nativos u ODBC/JDBC'], ['Excel, apps propias', 'ODBC/JDBC o API de sentencias SQL'], ['dbt', 'Adaptador dbt-databricks']]))}
    ${col(`${pts(['<b>Databricks SQL</b>: editor, AI/BI dashboards y alertas sobre SQL warehouses.'])}${box('', 'Buenas prácticas para BI', 'BI contra las tablas <b>gold</b> · un SQL warehouse serverless <b>dedicado</b> al BI · el usuario de servicio solo con <b>SELECT</b> sobre gold (mínimo privilegio).')}`, 'narrow')}`);

  D.s('22.10', '(+) De la tabla al modelo: Machine Learning', `${col(w('mlflow'), 'wide')}${col(`${code(`import mlflow
mlflow.set_registry_uri("databricks-uc")
mlflow.register_model(
  "runs:/<run_id>/modelo",
  "prod.ml.prediccion_abandono")`, 'py', 'font-size:15px')}
      ${box('', 'Clave', 'El ML trabaja sobre <b>las mismas tablas gobernadas</b> que el BI, sin copias.')}`, 'narrow')}`,
    { lead: 'Features → MLflow → modelo registrado en Unity Catalog → inferencia. Recorre los pasos.' });
}
