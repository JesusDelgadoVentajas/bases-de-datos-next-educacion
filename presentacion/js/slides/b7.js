// Bloque VII · Seguridad y criterio (Tema 23)
import { col, pts, box, w, table, cards, study, code, sql } from '../deck.js';
import * as W from '../w/b7.js';

export const widgets = W.widgets;

export function build(D) {
  D.bloque({ n: 'VII', title: 'Seguridad y criterio',
    intro: 'Saber construir una base de datos no basta: hay que protegerla, cumplir la ley y, sobre todo, saber elegir la tecnología adecuada para cada problema. Lo imprescindible de seguridad, el RGPD, un método para decidir y un caso final que integra toda la asignatura.',
    temas: [[23, 'Lo imprescindible de seguridad y cómo elegir base de datos']] });

  D.tema({ n: 23, title: 'Lo imprescindible de seguridad y cómo elegir base de datos', obj: ['Inyección SQL y cómo evitarla', 'Mínimo privilegio para usuarios y aplicaciones', 'RGPD aplicado a bases de datos', 'Backups frente a alta disponibilidad', 'Elegir base de datos con criterio', 'Caso final: la arquitectura de datos de una empresa'] });

  D.s('23.1', 'Inyección SQL y cómo evitarla', `${col(w('injection'))}`,
    { lead: 'Un buscador de clientes por email, contra PostgreSQL de verdad. Prueba las entradas maliciosas con la consulta concatenada y con la parametrizada.' });

  D.s('23.1', 'Consultas parametrizadas y otras capas', `${col(`${box('', 'La defensa principal', 'Los valores <b>nunca</b> se pegan al texto: se envían <b>por separado</b> como parámetros. Un parámetro nunca puede convertirse en código.')}
      ${box('recuerda', 'Recordamos que…', 'Tema 9: <code>cur.execute("… WHERE precio &lt; %s", (50,))</code>. El %s no es formato de texto de Python: psycopg lo envía aparte.')}
      ${table(['Capa', 'Cómo ayuda'], [['Mínimo privilegio', 'Si solo puede leer, no puede borrar'], ['Listas blancas', 'Para nombres de tabla/columna (no parametrizables)'], ['ORM', 'Parametrizan… salvo SQL en bruto'], ['Validación', 'Tipo, longitud, formato'], ['Errores genéricos', 'No dar pistas al atacante']], 'small')}`)}
    ${col(sql([['PREPARE + EXECUTE', `PREPARE buscar_cliente(text) AS\n  SELECT id, nombre FROM cliente WHERE email = $1;\nEXECUTE buscar_cliente('ana.ruiz@mail.com');`], ['Ataque como parámetro', `EXECUTE buscar_cliente(''' OR ''1''=''1');  -- 0 filas`]], { autorun: false }))}`,
    { id: 's23.1b', lead: 'Inyección: en el OWASP Top 10 desde hace más de veinte años.' });

  D.s('23.2', 'Mínimo privilegio', `${col(w('leastpriv'), 'wide')}${col(`${pts(['Una cuenta <b>por aplicación y por persona</b>.', 'Permisos a <b>roles de grupo</b>.', 'Las aplicaciones <b>nunca</b> como superusuario ni propietario.', 'Separar entornos; no copiar producción sin anonimizar.', 'Revisar y retirar permisos.', '<b>Gestor de secretos</b>, rotación, autenticación fuerte.', 'TLS, cifrado en reposo, nada expuesto a internet.', 'Auditoría (<code>pgaudit</code>).'])}`, 'narrow')}`,
    { lead: 'Cada usuario o aplicación, exactamente lo que necesita y nada más. Crea el rol de la aplicación web y prueba qué puede hacer.' });

  D.s('23.3', 'RGPD aplicado a bases de datos', `${col(`${table(['Obligación', 'Traducción técnica'], [['Minimización', 'Solo las columnas necesarias'], ['Plazo de conservación', 'Retención y borrado: ojo a backups, lakes y time travel'], ['Privacidad desde el diseño (art. 25)', 'Seudonimizar, cifrar, restringir'], ['Seguridad (art. 32)', 'Cifrado, acceso, copias, pruebas'], ['Derechos', 'Localizar, exportar, corregir y <b>suprimir</b>'], ['Brechas (art. 33)', 'Notificar a la AEPD en ≤ 72 h'], ['Registro de actividades', 'Qué, para qué, dónde, cuánto tiempo']], 'small')}`, 'wide')}
    ${col(`${pts(['RGPD (UE 2016/679), aplicable desde el <b>25-5-2018</b>. En España, <b>LOPDGDD</b> (LO 3/2018) y la <b>AEPD</b>.', '<b>Dato personal</b>: cualquier información de una persona identificable (email, IP, id de cliente…).', '<b>Seudonimizar</b> ≠ <b>anonimizar</b>: lo seudonimizado sigue siendo personal.'])}${w('fine')}`, 'narrow')}`);

  D.s('23.3', 'El derecho de supresión en una arquitectura real', `${col(w('erasure'))}`,
    { id: 's23.3b', lead: 'Ana pide que borremos sus datos. Borrarla de PostgreSQL no basta: localízala en cada sistema.' });

  D.s('23.4', 'Backups frente a alta disponibilidad', `${col(w('backupha'), 'wide')}${col(`${w('nines')}`)}`,
    { lead: 'Protegen frente a problemas distintos. Elige un incidente y mira qué te salva.' });

  D.s('23.5', 'Cómo elegir base de datos', `${col(w('chooser'), 'wide')}${col(`${table(['Criterio', 'Pregunta'], [['Modelo', 'Tablas, documentos, grafos, series, texto'], ['Acceso', 'Transacciones o análisis; clave, rango, búsqueda'], ['Consistencia', '¿Vale leer algo desactualizado?'], ['Escala', '¿Cabe en un servidor?'], ['Latencia', 'Milisegundos o segundos'], ['Coste', 'Licencias, infra, operación, personas'], ['Equipo', '¿Qué conoce? ¿Qué se integra?'], ['Operación', 'Gestionado o propio']], 'small')}`, 'narrow')}`,
    { lead: 'No existe la mejor base de datos, sino la más adecuada. Responde a las preguntas.' });

  D.s('23.5', 'Casos y tres reglas prácticas', `${col(table(['Caso', 'Elección razonable'], [['Pedidos, facturación, reservas', 'PostgreSQL o MySQL'], ['Carrito y sesiones con picos', 'Redis'], ['Catálogo con atributos variables', 'MongoDB o PostgreSQL + JSONB'], ['Millones de lecturas de sensores', 'Cassandra o series temporales'], ['Fraude por redes de cuentas', 'Neo4j'], ['Buscador con relevancia', 'Elasticsearch / OpenSearch'], ['Cuadros de mando de empresa', 'Snowflake, BigQuery o lakehouse'], ['Todo tipo de datos para BI y ML', 'Lakehouse (Databricks, Iceberg)']]), 'wide')}
    ${col(`${box('', 'Tres reglas prácticas', '<b>1.</b> Empieza por una <b>relacional</b>: PostgreSQL cubre JSON, texto, series y vectores con extensiones.<br><b>2.</b> Añade otra tecnología solo ante una <b>necesidad concreta y medida</b>.<br><b>3.</b> <b>Separa operación y análisis.</b>')}`, 'narrow')}`, { id: 's23.5b' });

  D.s('23.6', 'Caso final: la arquitectura de datos de Mercado Next', `${col(w('arch'))}`,
    { lead: 'Tres años después. Haz clic en cada requisito y mira qué pieza lo resuelve y con qué tema de la asignatura.' });

  D.s('23.6', 'Preguntas para debatir', `${col(cards([['¿Fuente de verdad?', '¿Qué pasa con el stock si Redis y PostgreSQL discrepan?'], ['¿Cuánto retraso?', '¿Basta con cargas cada hora en los cuadros de mando o hace falta streaming?'], ['¿Dónde está Ana?', 'Si ejerce su derecho de supresión, ¿en cuántos sistemas están sus datos?'], ['¿Y si fuéramos 10× más pequeños?', '¿Qué componentes podrían eliminarse?']], 2))}`,
    { id: 's23.6b', lead: 'No hay una única respuesta correcta: hay decisiones justificadas.' });
}
