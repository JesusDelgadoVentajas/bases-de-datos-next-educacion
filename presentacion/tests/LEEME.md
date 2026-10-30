# Auditoría pendiente en Chromium

Esta auditoría no se ha podido ejecutar en el entorno de entrega: Chromium termina con SIGTRAP al arrancar. No hay capturas verificadas. Las pruebas de DOM y PGlite recogidas en el informe son comprobaciones independientes.

Con Playwright y su Chromium instalados en el entorno de pruebas:

1. Sirve `presentacion/` con `python3 -m http.server 8765`.
2. Desde `presentacion/`, ejecuta `node tests/revision.mjs` en otra terminal.
3. Revisa `revision-capturas/resultados.json` y todas las imágenes. La detección geométrica no descubre por sí sola todos los solapamientos o problemas de contraste.

El script usa 1600 × 1002, SwiftShader, esperas de 700/1500 ms, todos los controles solicitados, 244 capturas claras, las 24 portadas de tema en oscuro, los cinco widgets 3D en oscuro y los resúmenes de estudio. También recorre los siete pasos del agente y los presets de las consolas SQL recién montadas. Las capturas oscuras adicionales incluyen 24.7 y 24.8b.

Variables opcionales: `BASE_URL`, `CHROMIUM_PATH` y `REVISION_OUT`. Playwright solo se utiliza para pruebas; la presentación continúa sin build ni dependencias remotas.
