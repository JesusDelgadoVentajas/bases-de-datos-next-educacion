// Ejercicios del bloque III · Rendimiento y transacciones (tema 10)
export default [
  { id: 't10-indice', tema: 10, tipo: 'sql', titulo: 'Crear el índice que falta',
    enunciado: 'La consulta más frecuente de la web es «los pedidos de un cliente»: <code>SELECT * FROM pedido WHERE cliente_id = $1</code>. Con millones de pedidos, el plan muestra un <code>Seq Scan</code>. Crea el índice que la acelera.',
    inicial: '-- CREATE INDEX …\n',
    solucion: 'CREATE INDEX idx_pedido_cliente ON pedido (cliente_id);',
    alt: 'CREATE INDEX idx_pedido_cliente_fecha ON pedido (cliente_id, fecha);',
    comprobar: `SELECT count(*) > 0 AS "hay un índice que empieza por cliente_id"
FROM pg_indexes
WHERE tablename = 'pedido' AND indexdef ~ '\\(cliente_id[,)]'`,
    porque: 'PostgreSQL crea índices automáticamente para las claves primarias y las restricciones UNIQUE, pero <b>no</b> para las claves foráneas. Un índice B-tree sobre <code>cliente_id</code> permite llegar a los pedidos de un cliente con unas pocas lecturas en lugar de recorrer la tabla entera. Un índice compuesto que empiece por <code>cliente_id</code> también sirve.',
    teoria: 's10.1' },
  { id: 't10-selectividad', tema: 10, tipo: 'clasifica', titulo: '¿Compensa un índice?',
    enunciado: 'La tabla <code>cliente</code> tiene 5 millones de filas. ¿Compensa crear un índice para acelerar cada consulta?',
    categorias: ['Sí, compensa', 'No compensa'],
    items: [
      ["WHERE email = 'ana.ruiz@mail.com' (devuelve 1 fila)", 0, 'Muy selectiva: el índice va directo a una fila.'],
      ['WHERE vip = false (el 97 % de los clientes)', 1, 'Devuelve casi toda la tabla: leerla entera es más barato.'],
      ["WHERE fecha_alta >= '2026-11-01' (unas pocas miles de filas)", 0],
      ['Una tabla de configuración de 20 filas', 1, 'Cabe en una página: el recorrido secuencial ya es instantáneo.']
    ],
    porque: 'Un índice compensa cuando la consulta es <b>selectiva</b>: devuelve una parte pequeña de la tabla. Si devuelve la mayoría de las filas, el planificador prefiere el <code>Seq Scan</code>. Además, cada índice ralentiza las escrituras y ocupa espacio, así que solo se crean los que se usan.',
    teoria: 's10.1' },
  { id: 't10-explain', tema: 10, tipo: 'test', titulo: 'Leer un plan',
    enunciado: '<code>EXPLAIN ANALYZE</code> muestra este nodo en una tabla de 2 millones de filas:<pre class="code">Seq Scan on pedido  (actual rows=12)\n  Filter: (cliente_id = 4)\n  Rows Removed by Filter: 1999988</pre>¿Qué indica?',
    opciones: [
      'Que se ha leído la tabla entera para quedarse con 12 filas: probablemente falta un índice sobre cliente_id.',
      'Que la consulta es óptima, porque solo devuelve 12 filas.',
      'Que el índice sobre cliente_id está funcionando.',
      'Que hay que añadir un LIMIT 12.'
    ],
    correcta: 0,
    porque: 'Un <code>Seq Scan</code> que descarta casi todas las filas que lee es la señal típica de un índice que falta. Tras crear el índice, el plan debería mostrar un <code>Index Scan</code> (o <code>Bitmap Index Scan</code>) que solo toca las 12 filas. <code>ANALYZE</code> ejecuta la consulta y muestra filas y tiempos reales, no solo estimados.',
    teoria: 's10.2' },
  { id: 't10-acid', tema: 10, tipo: 'clasifica', titulo: 'Propiedades ACID',
    enunciado: '¿Qué propiedad ACID garantiza cada afirmación?',
    categorias: ['Atomicidad', 'Consistencia', 'Aislamiento', 'Durabilidad'],
    items: [
      ['Si falla el cobro, el pedido tampoco se guarda: o todo o nada', 0],
      ['Tras el COMMIT, el pedido sigue ahí aunque el servidor se apague un segundo después', 3],
      ['Nunca queda guardado un stock negativo, porque lo prohíbe un CHECK', 1],
      ['Dos clientes que compran a la vez no ven los cambios a medias del otro', 2]
    ],
    porque: 'Atomicidad: la transacción se aplica entera o no se aplica. Consistencia: se pasa de un estado válido a otro que respeta todas las reglas. Aislamiento: las transacciones concurrentes no se ven a medias entre sí. Durabilidad: lo confirmado sobrevive a un fallo (gracias al registro de escritura anticipada, el WAL).',
    teoria: 's10.4' },
  { id: 't10-anomalias', tema: 10, tipo: 'clasifica', titulo: 'Anomalías de concurrencia',
    enunciado: '¿Qué anomalía describe cada situación?',
    categorias: ['Lectura sucia', 'Lectura no repetible', 'Lectura fantasma', 'Actualización perdida'],
    items: [
      ['T1 lee un precio que T2 ha cambiado pero no ha confirmado; después T2 hace ROLLBACK', 0],
      ['T1 lee el stock (10), T2 lo cambia a 8 y confirma, y T1 vuelve a leerlo y ve 8', 1],
      ['T1 cuenta los pedidos pendientes (5), T2 inserta uno nuevo y confirma, y T1 vuelve a contar y obtiene 6', 2],
      ['T1 y T2 leen stock = 10, cada una resta 1 y escribe 9: se han vendido 2 unidades, pero el stock solo ha bajado 1', 3]
    ],
    porque: 'Lectura sucia: ver datos no confirmados. No repetible: la misma fila cambia entre dos lecturas. Fantasma: aparecen o desaparecen filas que cumplen la condición. Actualización perdida: una escritura pisa a otra porque las dos partían del mismo valor. Se evita con <code>UPDATE … SET stock = stock - 1</code>, <code>SELECT … FOR UPDATE</code> o un aislamiento más estricto.',
    teoria: 's10.5' },
  { id: 't10-aislamiento', tema: 10, tipo: 'test', titulo: 'Aislamiento en PostgreSQL',
    enunciado: '¿Qué nivel de aislamiento usa PostgreSQL por defecto y qué anomalía evita siempre?',
    opciones: [
      'READ COMMITTED; evita la lectura sucia.',
      'SERIALIZABLE; evita todas las anomalías.',
      'READ UNCOMMITTED; no evita ninguna.',
      'REPEATABLE READ; evita la lectura no repetible y nada más.'
    ],
    correcta: 0,
    porque: 'Por defecto PostgreSQL trabaja en <code>READ COMMITTED</code>: cada sentencia ve solo datos confirmados, así que nunca hay lecturas sucias (de hecho, aunque se pida <code>READ UNCOMMITTED</code>, se comporta como READ COMMITTED). Gracias a MVCC, los lectores no bloquean a los escritores. Para evitar más anomalías se sube a <code>REPEATABLE READ</code> o <code>SERIALIZABLE</code>.',
    teoria: 's10.5' },
  { id: 't10-rpo', tema: 10, tipo: 'test', titulo: 'RPO y RTO',
    enunciado: 'Mercado Next hace una copia completa cada noche a las 2:00 y restaurarla tarda 3 horas. Si el disco falla a las 20:00, ¿qué se pierde y cuánto tarda en volver?',
    opciones: [
      'Se pierden hasta 18 horas de datos (RPO) y el servicio vuelve en unas 3 horas (RTO).',
      'Se pierden 3 horas de datos (RPO) y el servicio vuelve en 18 horas (RTO).',
      'No se pierde nada, porque hay copia diaria.',
      'Se pierden 24 horas de datos y el servicio vuelve al instante.'
    ],
    correcta: 0,
    porque: 'El <b>RPO</b> es cuántos datos se pueden perder: todo lo ocurrido desde la última copia (de 2:00 a 20:00, 18 horas). El <b>RTO</b> es cuánto tarda en volver el servicio: aquí, lo que dura la restauración. Para bajar el RPO se archiva el WAL de forma continua (recuperación a un instante concreto, PITR). Y una copia solo vale si se ha probado su restauración.',
    teoria: 's10.6' }
];
