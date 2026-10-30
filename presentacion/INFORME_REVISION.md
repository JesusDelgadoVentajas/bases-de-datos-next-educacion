# Revisión de la presentación SGBD

**Estado: ajustes y pruebas ejecutables completados; auditoría visual y prueba integral en Chromium pendientes por un bloqueo del entorno.**

Se conservan las **244 diapositivas**, sus identificadores, textos de presentación, numeración y orden. Se ha comparado el HTML visible de cada una con el ZIP original, excluyendo únicamente las notas ocultas de estudio. Los **158 apartados numerados del Word** tienen al menos una diapositiva.

## 1. Errores y correcciones

| Diapositiva | Corrección |
| --- | --- |
| 14.2 · MongoDB | El manejador delegado solo admite botones de preset de su propia barra y valida el índice. Reiniciar, Ejecutar y pulsar el fondo de la barra ya no acceden a un preset inexistente. Se reproduce el fallo del ZIP original y pasa la regresión. |
| 16.5 → 16.6 · PageRank | La limpieza desactiva `alive`, detiene la simulación y corta la convergencia tras cada espera. Se impide iniciar dos convergencias. Se reproduce el fallo original al salir y pasa la regresión. |
| 16.2 y 16.3 · grafo/Cypher | Se cancela el preset diferido de 900 ms al desmontar y se comprueba que el widget sigue vivo. |
| 10.1 · árbol B+ | Un recorrido nuevo invalida el anterior. Se rechazan claves no enteras o fuera de 1–32. |
| 18.3 · cubo OLAP | Reiniciar cancela un roll-up pendiente y restablece todas las posiciones. |
| 24.3 · Text-to-SQL | Los resultados pendientes no repintan un paso distinto; se admite un resultado sin filas. |
| 24.4 · embeddings | El vector cero muestra una explicación en lugar de NaN. La consulta «teclado para jugar» devuelve **0,977 / 0,965 / 0,609**, con coma decimal. |
| 24.7 · agente MCP | Se bloquea el avance mientras se ejecuta la herramienta y se invalidan resultados tras reiniciar. Se limpia también la última respuesta. Los siete pasos se han ejecutado con PGlite real. |
| 24.7 y 24.8 · ejecución como IA | Se utiliza la transacción exclusiva de PGlite para evitar que las peticiones mezclen roles o transacciones; se restaura el contexto al finalizar o fallar. |
| 24.8 · validador | Una respuesta antigua no sustituye la explicación de una consulta posterior bloqueada. |
| Todas las consolas SQL | Cada montaje carga una base independiente desde el SQL original. Reiniciar y salir cierran su instancia; los resultados previos al reinicio no repintan el estado nuevo. |

Además, se han protegido las esperas, temporizadores y resultados pendientes de **1.4, 4.3, 5.1, 5.5, 6.8, 7.2, 7.10, 8.6, 8.7b, 9.3, 10.2, 10.3, 14.6, 15.4, 19.1, 20.3, 22.8, 23.1 y 24.2**, y la inicialización de los cinco widgets 3D: portada, 10.1, 15.1, 18.3 y 24.4. Son protecciones de ciclo de vida; no se atribuye a cada una un error observado en Chromium. El motor distingue cada montaje, incluso si se sale y vuelve antes de finalizar una inicialización asíncrona.

## 2. Ajustes visuales mínimos

- **10.1:** cámara algo más alejada, etiquetas limitadas al ancho de cada nodo y color del texto adaptado al fondo normal o seleccionado en oscuro.
- **24.4:** etiquetas 3D algo mayores y separación vertical ligeramente ampliada.
- **24.7:** la barra de botones y las tarjetas del registro no se encogen; el código largo puede saltar de línea y el registro conserva su scroll interno.
- **24.8b, «Las cinco capas»:** el Python puede saltar de línea dentro de su columna.
- **Modo estudio:** el cuerpo y las notas mantienen su altura y la diapositiva permite scroll; las notas nuevas están fuera de las columnas de presentación y permanecen ocultas al presentar.

Estos ajustes están aplicados al código. **No se ha certificado su resultado mediante capturas ni se puede garantizar aún que las 244 diapositivas carezcan de recortes, solapamientos o scroll en presentación.**

## 3. Notas de estudio

Se han añadido **193 notas breves en 150 apartados**, con dos frases por nota, basadas únicamente en el apartado correspondiente del Word. Se conservan las notas anteriores: las **206 diapositivas de contenido** tienen ahora al menos una nota. Las nuevas ampliaciones están centralizadas en `js/slides/notas-estudio.js`; el constructor las añade con el ayudante `study(...)`. Las 24 portadas mantienen «Resumen del tema (temario)».

| Tema | Notas añadidas | Apartados |
| --- | ---: | --- |
| 1 | 7 | 1.1–1.2, 1.4–1.6 |
| 2 | 7 | 2.2–2.7 |
| 3 | 6 | 3.1, 3.3–3.6 |
| 4 | 7 | 4.1–4.3, 4.5–4.7 |
| 5 | 11 | 5.1–5.8 |
| 6 | 8 | 6.1–6.6, 6.8 |
| 7 | 15 | 7.1–7.12 |
| 8 | 12 | 8.1–8.9 |
| 9 | 8 | 9.1–9.8 |
| 10 | 11 | 10.1–10.6 |
| 11 | 5 | 11.1–11.4 |
| 12 | 3 | 12.1–12.2, 12.4 |
| 13 | 5 | 13.1–13.4 |
| 14 | 6 | 14.1–14.6 |
| 15 | 5 | 15.1–15.2, 15.4–15.5 |
| 16 | 7 | 16.1–16.6 |
| 17 | 5 | 17.1–17.2 |
| 18 | 7 | 18.1–18.6 |
| 19 | 5 | 19.1–19.3 |
| 20 | 10 | 20.1–20.10 |
| 21 | 8 | 21.1–21.6 |
| 22 | 11 | 22.1–22.10 |
| 23 | 10 | 23.1–23.6 |
| 24 | 14 | 24.1–24.8 |

## 4. Verificación y límites

- **34 pruebas de regresión** y **10 comprobaciones adicionales**, todas superadas. Incluyen desmontaje durante consultas/animaciones, reinicios, respuestas antiguas, navegación, índice, atajos, modos y remontaje de gráficos/3D al pulsar T, con DOM simulado.
- Barrido complementario de **244 diapositivas y 646 controles**, sin errores registrados, con DOM simulado, PGlite real y construcción de escenas con three real. El layout, Chart.js y el renderer WebGL no se ejecutan en esta prueba; no equivale al barrido solicitado en Chromium.
- **40 consolas y 131 presets**, ejecutados con PGlite real sobre una base nueva por consola: **114 ejecuciones correctas y 17 errores didácticos intencionados**. Se conservan todos los ejemplos y sus errores de restricciones, tipos o agrupación. También se han comprobado el aislamiento entre consolas y la recuperación del contexto tras los cinco ejemplos prohibidos del validador con este desactivado.
- Se conservan las bibliotecas locales, las fuentes, el Word adjunto, las rutas relativas y `.nojekyll`. No se añaden dependencias remotas a la presentación.
- **Pendiente:** el barrido en un navegador real y las capturas de las 244 diapositivas claras y de cada tema en oscuro. Chromium termina con SIGTRAP en este entorno; el navegador remoto disponible no puede acceder al servidor local. Por tanto, tampoco queda verificado visualmente el scroll de estudio ni la ausencia de scroll en presentación.
- Se incluye **`tests/revision.mjs`**, comprobado sintácticamente, y **`tests/LEEME.md`** para ejecutar la auditoría pendiente en Playwright/Chromium con SwiftShader. Genera capturas y un JSON de resultados; las imágenes requieren revisión humana. No se presenta este script como una prueba ya ejecutada.
