// Ejercicios del bloque I · Fundamentos y modelado (temas 1-4)
export default [
  // ---------- Tema 1 ----------
  { id: 't1-oltp-olap', tema: 1, tipo: 'clasifica', titulo: 'Registrar o analizar',
    enunciado: 'Mercado Next hace todas estas tareas con sus datos. ¿Cuáles son de tipo <b>OLTP</b> (registrar operaciones del día a día) y cuáles de tipo <b>OLAP</b> (analizar)?',
    categorias: ['OLTP', 'OLAP'],
    items: [
      ['Guardar un pedido cuando el cliente pulsa «Comprar»', 0],
      ['Calcular las ventas por categoría y mes de los últimos tres años', 1],
      ['Restar del stock las unidades vendidas', 0],
      ['Comparar el ticket medio de los clientes VIP con el resto', 1],
      ['Cambiar la dirección de envío de un cliente', 0],
      ['Detectar qué productos se compran juntos con más frecuencia', 1]
    ],
    porque: 'OLTP son muchas operaciones pequeñas que leen o escriben pocas filas y necesitan respuesta inmediata y datos siempre coherentes. OLAP son pocas consultas que recorren muchas filas (a menudo históricas) para resumirlas. Por eso se suelen hacer en bases de datos distintas, organizadas de forma distinta.',
    teoria: 's1.9' },
  { id: 't1-sgbd', tema: 1, tipo: 'test', titulo: 'Base de datos y SGBD',
    enunciado: '¿Qué frase describe mejor la diferencia entre una <b>base de datos</b> y un <b>SGBD</b>?',
    opciones: [
      'La base de datos son los datos; el SGBD es el programa que los gestiona y garantiza reglas, permisos, concurrencia y recuperación.',
      'Son lo mismo: SGBD es solo el nombre técnico de una base de datos.',
      'El SGBD son los datos guardados en disco y la base de datos es el programa que los consulta.',
      'La base de datos es relacional y el SGBD es la versión NoSQL.'
    ],
    correcta: 0,
    porque: 'La base de datos es el conjunto de datos; el SGBD (PostgreSQL, MySQL, MongoDB…) es el software que los almacena y se encarga de lo que una hoja de cálculo no garantiza: reglas de integridad, permisos, acceso concurrente de muchos usuarios y recuperación tras un fallo.',
    teoria: 's1.4' },
  { id: 't1-excel', tema: 1, tipo: 'test', titulo: '¿Basta con una hoja de cálculo?',
    enunciado: 'El equipo de ventas guarda los pedidos en una hoja de cálculo compartida. ¿Qué problemas de los siguientes resuelve un SGBD? Marca <b>todos</b> los que correspondan.',
    opciones: [
      'Dos personas modifican la misma fila a la vez y se pierde uno de los cambios.',
      'Alguien escribe «doce» en la columna de cantidad.',
      'Se borra por error un cliente que tiene pedidos.',
      'El nombre del cliente está mal escrito porque el comercial se equivocó al teclearlo.'
    ],
    correcta: [0, 1, 2],
    notas: [
      'Control de concurrencia: el SGBD coordina los accesos simultáneos.',
      'Tipos y restricciones: una columna INTEGER no admite texto.',
      'Integridad referencial: una clave foránea impide dejar pedidos huérfanos.',
      'Ningún SGBD sabe que «Ana Ruis» debería ser «Ana Ruiz»: la calidad de los datos también depende de los procesos.'
    ],
    porque: 'El SGBD garantiza las reglas que se le declaran (tipos, restricciones, claves foráneas) y coordina a muchos usuarios a la vez. Lo que no puede saber es si un dato válido es además verdadero: eso exige validaciones en la aplicación y buenos procesos.',
    teoria: 's1.3' },

  // ---------- Tema 2 ----------
  { id: 't2-cardinalidad', tema: 2, tipo: 'clasifica', titulo: 'Cardinalidades de Mercado Next',
    enunciado: 'Indica la cardinalidad máxima de cada relación.',
    categorias: ['1:1', '1:N', 'N:M'],
    items: [
      ['Un cliente hace pedidos; cada pedido es de un único cliente', 1, 'Un cliente puede tener muchos pedidos, pero cada pedido pertenece a uno solo.'],
      ['Un pedido incluye productos; un producto aparece en muchos pedidos', 2, 'Muchos a muchos: se resolverá con la tabla intermedia linea_pedido.'],
      ['Un empleado tiene un jefe; un jefe dirige a varios empleados', 1, 'Es una relación reflexiva (de empleado consigo mismo) 1:N.'],
      ['Cada cliente tiene una única tarjeta de fidelización y cada tarjeta es de un solo cliente', 0],
      ['Una categoría tiene subcategorías; cada subcategoría tiene una categoría padre', 1, 'Otra relación reflexiva 1:N: la jerarquía de categorías.']
    ],
    porque: 'Para hallar la cardinalidad máxima se pregunta en los dos sentidos: «¿con cuántos B como máximo se relaciona un A?» y «¿con cuántos A como máximo se relaciona un B?». Si en los dos sentidos la respuesta es «muchos», la relación es N:M.',
    teoria: 's2.3' },
  { id: 't2-atributos', tema: 2, tipo: 'clasifica', titulo: 'Tipos de atributos',
    enunciado: 'Clasifica cada atributo de la entidad <b>Cliente</b>.',
    categorias: ['Simple', 'Compuesto', 'Multivaluado', 'Derivado'],
    items: [
      ['email', 0],
      ['dirección (calle, número, código postal, ciudad)', 1, 'Se descompone en partes con significado propio.'],
      ['teléfonos (puede tener varios)', 2, 'Un mismo cliente tiene varios valores.'],
      ['antigüedad en años, calculada a partir de la fecha de alta', 3, 'No se guarda: se calcula a partir de otro atributo.'],
      ['fecha_alta', 0]
    ],
    porque: 'Un atributo simple tiene un único valor indivisible; uno compuesto se divide en partes; uno multivaluado admite varios valores para la misma entidad (en el paso a tablas suele acabar en una tabla aparte), y uno derivado se calcula a partir de otros, por lo que normalmente no se almacena.',
    teoria: 's2.2' },
  { id: 't2-debil', tema: 2, tipo: 'test', titulo: 'Entidad débil',
    enunciado: '¿Cuál de estas entidades de Mercado Next es una <b>entidad débil</b>?',
    opciones: [
      'Línea de pedido: «línea 3» solo tiene sentido dentro de un pedido concreto.',
      'Cliente, porque puede no haber hecho ningún pedido.',
      'Producto, porque su stock puede ser 0.',
      'Categoría, porque algunas no tienen categoría padre.'
    ],
    correcta: 0,
    porque: 'Una entidad débil no se puede identificar por sí misma: necesita la clave de su entidad propietaria. La línea número 3 existe en muchos pedidos; solo el par (pedido, número de línea) la identifica. Además, si se borra el pedido, sus líneas dejan de tener sentido.',
    teoria: 's2.4' },
  { id: 't2-participacion', tema: 2, tipo: 'test', titulo: 'Participación (mín, máx)',
    enunciado: 'En la relación <i>Cliente — realiza — Pedido</i>, ¿qué notación (mín, máx) corresponde al lado del <b>pedido</b> (cuántos clientes tiene cada pedido)?',
    opciones: ['(1, 1)', '(0, N)', '(0, 1)', '(1, N)'],
    correcta: 0,
    notas: ['', 'Esto describe el lado del cliente: puede no tener pedidos (0) o tener muchos (N).', 'Un pedido no puede existir sin cliente.', 'Un pedido no pertenece a varios clientes.'],
    porque: 'Cada pedido tiene exactamente un cliente: como mínimo uno (participación total, no hay pedidos sin cliente) y como máximo uno. En cambio, un cliente puede no haber hecho ningún pedido o haber hecho muchos: (0, N).',
    teoria: 's2.3' },

  // ---------- Tema 3 ----------
  { id: 't3-claves', tema: 3, tipo: 'clasifica', titulo: 'Tipos de claves',
    enunciado: 'En la tabla <code>cliente(id, nombre, email, ciudad)</code>, donde <code>id</code> es la clave primaria y <code>email</code> no se puede repetir, y en <code>pedido(id, cliente_id, fecha)</code>, ¿qué es cada cosa?',
    categorias: ['Clave primaria', 'Clave alternativa', 'Superclave no mínima', 'Clave foránea'],
    items: [
      ['cliente.id', 0],
      ['cliente.email', 1, 'Es candidata (única y mínima), pero no se eligió como primaria: se declara con UNIQUE.'],
      ['(cliente.id, cliente.nombre)', 2, 'Identifica las filas, pero sobra el nombre: no es mínima.'],
      ['pedido.cliente_id', 3, 'Apunta a la clave primaria de cliente.']
    ],
    porque: 'Una superclave identifica cada fila; si además es mínima (no le sobra ningún atributo) es una clave candidata. De entre las candidatas se elige una como primaria y el resto son alternativas. Una clave foránea es una columna que hace referencia a la clave de otra tabla.',
    teoria: 's3.2' },
  { id: 't3-integridad', tema: 3, tipo: 'clasifica', titulo: '¿Qué restricción lo impide?',
    enunciado: 'Cada operación es rechazada por PostgreSQL. ¿Qué restricción de integridad la impide?',
    categorias: ['Dominio (tipo)', 'Entidad (PK)', 'Unicidad', 'CHECK', 'Referencial (FK)'],
    items: [
      ['Insertar un producto con precio «barato»', 0],
      ['Insertar un cliente con id NULL', 1, 'La clave primaria no puede ser nula ni repetirse.'],
      ['Dar de alta a un segundo cliente con el email ana.ruiz@mail.com', 2],
      ['Poner el stock de un producto a −5', 3, 'stock tiene CHECK (stock >= 0).'],
      ['Crear un pedido para el cliente 99, que no existe', 4]
    ],
    porque: 'Las restricciones las comprueba el SGBD en cada escritura, venga de donde venga: el tipo de la columna limita los valores posibles, la clave primaria exige valores únicos y no nulos, UNIQUE impide repetidos, CHECK impone una condición y la clave foránea exige que el valor exista en la tabla referenciada.',
    teoria: 's3.3' },
  { id: 't3-er-tablas', tema: 3, tipo: 'clasifica', titulo: 'Del E/R a tablas',
    enunciado: '¿Cómo se pasa cada relación a tablas?',
    categorias: ['FK en el lado N', 'Tabla intermedia', 'FK con UNIQUE'],
    items: [
      ['Cliente 1:N Pedido', 0, 'pedido.cliente_id → cliente.id'],
      ['Pedido N:M Producto', 1, 'linea_pedido(pedido_id, producto_id, …)'],
      ['Cliente 1:1 Tarjeta de fidelización', 2, 'tarjeta.cliente_id UNIQUE → cliente.id'],
      ['Alumno N:M Asignatura (con la nota como atributo)', 1, 'La nota va en la tabla intermedia, porque depende de los dos.'],
      ['Categoría 1:N Producto', 0]
    ],
    porque: 'Son reglas fijas: en 1:N la clave foránea va en la tabla del lado N; en N:M se crea una tabla intermedia cuya clave combina las dos claves foráneas (y que guarda los atributos de la relación), y en 1:1 se pone una clave foránea con UNIQUE en uno de los dos lados.',
    teoria: 's3.4' },

  // ---------- Tema 4 ----------
  { id: 't4-anomalias', tema: 4, tipo: 'clasifica', titulo: 'Anomalías de la redundancia',
    enunciado: 'Mercado Next guarda todo en una sola tabla: <code>ventas(pedido_id, fecha, cliente_nombre, cliente_email, cliente_ciudad, producto, precio)</code>. ¿Qué anomalía aparece en cada caso?',
    categorias: ['Inserción', 'Actualización', 'Borrado'],
    items: [
      ['No se puede dar de alta a un cliente nuevo hasta que haga su primer pedido', 0],
      ['Ana se muda y hay que cambiar su ciudad en 40 filas; si se olvida una, hay dos ciudades para Ana', 1],
      ['Al borrar el único pedido de Pablo desaparece todo lo que sabíamos de él', 2],
      ['Para añadir un producto al catálogo hay que inventarse un pedido', 0]
    ],
    porque: 'Cuando un mismo hecho se repite en muchas filas, cambiarlo exige tocarlas todas (actualización); cuando dos hechos distintos comparten fila, no se puede guardar uno sin el otro (inserción) ni borrar uno sin perder el otro (borrado). Normalizar separa cada hecho en su tabla.',
    teoria: 's4.1' },
  { id: 't4-fn', tema: 4, tipo: 'clasifica', titulo: '¿En qué forma normal está?',
    enunciado: 'Indica la forma normal <b>más alta</b> que cumple cada tabla. La clave primaria va subrayada con <u>…</u>.',
    categorias: ['No está en 1FN', '1FN', '2FN', '3FN', 'FNBC'],
    items: [
      ['pedido(<u>id</u>, cliente_id, productos) con productos = «teclado, ratón, alfombrilla»', 0, 'productos no es atómico: guarda una lista.'],
      ['linea(<u>pedido_id, producto_id</u>, cantidad, nombre_producto)', 1, 'nombre_producto depende solo de producto_id: dependencia parcial.'],
      ['empleado(<u>id</u>, nombre, depto_id, depto_nombre)', 2, 'id → depto_id → depto_nombre: dependencia transitiva.'],
      ['cliente(<u>id</u>, nombre, email), con email único', 4, 'Todo determinante (id, email) es superclave.'],
      ['tutoria(<u>alumno, asignatura</u>, profesor), donde cada profesor imparte una sola asignatura', 3, 'profesor → asignatura, y profesor no es superclave; pero asignatura forma parte de la clave, así que cumple 3FN.']
    ],
    porque: '1FN exige valores atómicos. 2FN, además, que ningún atributo dependa solo de una parte de la clave (dependencia parcial). 3FN, que ningún atributo no clave dependa de otro atributo no clave (dependencia transitiva). FNBC es más estricta: todo determinante debe ser superclave, sin la excepción de 3FN para los atributos que forman parte de una clave.',
    teoria: 's4.3' },
  { id: 't4-df', tema: 4, tipo: 'test', titulo: 'Dependencias funcionales',
    enunciado: 'En la tabla <code>matricula(alumno_id, asignatura_id, nombre_alumno, nota)</code>, con clave (alumno_id, asignatura_id), ¿qué dependencia funcional impide que esté en 2FN?',
    opciones: [
      'alumno_id → nombre_alumno',
      '(alumno_id, asignatura_id) → nota',
      'nota → nombre_alumno',
      'asignatura_id → alumno_id'
    ],
    correcta: 0,
    notas: ['', 'Esta es la dependencia «buena»: la nota depende de la clave completa.', 'No es cierta: muchas personas pueden sacar la misma nota.', 'No es cierta: una asignatura tiene muchos alumnos.'],
    porque: 'nombre_alumno depende solo de una parte de la clave (alumno_id): es una dependencia parcial. La solución es sacar el nombre a una tabla alumno(alumno_id, nombre) y dejar en matricula solo lo que depende del par completo: la nota.',
    teoria: 's4.2' },
  { id: 't4-desnormalizar', tema: 4, tipo: 'test', titulo: 'Desnormalización consciente',
    enunciado: 'Mercado Next quiere guardar el total de cada pedido en una columna <code>pedido.total</code>, aunque se puede calcular sumando sus líneas. ¿Cuándo es una decisión razonable?',
    opciones: [
      'Cuando se ha medido que calcularlo es un problema de rendimiento y hay un mecanismo (por ejemplo, un trigger) que lo mantiene coherente con las líneas.',
      'Siempre: guardar datos calculados es una buena práctica general.',
      'Nunca: una base de datos debe estar siempre en FNBC.',
      'Solo si se deja de guardar el precio en las líneas del pedido.'
    ],
    correcta: 0,
    porque: 'Desnormalizar es legítimo si se hace de forma consciente: por un motivo medido (normalmente el rendimiento de lectura), sabiendo qué redundancia se introduce y con un mecanismo que la mantenga coherente. Sin ese mecanismo, el total y las líneas acabarán contradiciéndose.',
    teoria: 's4.7' },
  { id: 't4-fnbc', tema: 4, tipo: 'test', nivel: '+', titulo: 'Descomposición sin pérdida',
    enunciado: 'Se descompone <code>empleado(id, nombre, depto_id, depto_nombre)</code> en <code>empleado(id, nombre, depto_id)</code> y <code>departamento(depto_id, depto_nombre)</code>. ¿Por qué es una descomposición sin pérdida?',
    opciones: [
      'Porque el atributo común, depto_id, es clave de una de las dos tablas (departamento).',
      'Porque las dos tablas tienen el mismo número de filas.',
      'Porque ninguna tabla repite columnas de la otra.',
      'Porque el nombre del departamento es único.'
    ],
    correcta: 0,
    porque: 'Una descomposición en dos tablas es sin pérdida si los atributos comunes determinan funcionalmente todos los de una de ellas, es decir, si son clave de una de las dos. Así, al volver a unirlas con un JOIN por depto_id se obtiene exactamente la tabla original, sin filas inventadas.',
    teoria: 's4.6' }
];
