# Sistemas de Gestión de Bases de Datos · Presentación interactiva

Presentación de clase de la asignatura **Sistemas de Gestión de Bases de Datos: Relacionales y No Relacionales** (Máster en Big Data & Business Intelligence, Next Educación). Autor: Jesús Delgado Ventajas, AI & Data Engineer.

Sigue la misma estructura que el temario en Word (8 bloques, 24 temas y todos sus apartados). El contenido está resumido para clase y tiene 256 diapositivas, 150 gráficos interactivos (algunos en 3D, con tablas editables y simuladores) y 41 consolas de SQL en vivo con PostgreSQL ejecutándose en el navegador (PGlite).

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo, `sgbd-presentacion`).
2. Sube **todo el contenido de esta carpeta** a la raíz del repositorio. `index.html` tiene que quedar en la raíz, y el fichero `.nojekyll` también tiene que subirse.
3. En el repositorio, abre **Settings → Pages**. En *Source* elige **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`. Pulsa **Save**.
4. Al cabo de uno o dos minutos la presentación estará en `https://TU_USUARIO.github.io/sgbd-presentacion/`.

También se puede subir desde la terminal:

```bash
cd presentacion
git init
git add .
git commit -m "Presentación SGBD"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sgbd-presentacion.git
git push -u origin main
```

> **Importante:** no abras `index.html` con doble clic. El navegador bloquea los módulos y el WebAssembly de PostgreSQL cuando se carga desde `file://`. Para probarla en local, sirve la carpeta con un servidor web:
>
> ```bash
> cd presentacion
> python3 -m http.server 8000
> # y abre http://localhost:8000
> ```

## Uso en clase

| Tecla | Acción |
|---|---|
| → / Espacio · ← | Siguiente · anterior |
| Inicio / Fin | Primera / última diapositiva |
| **I** | Índice completo (bloques, temas y apartados) |
| **E** | Cambiar entre modo presentación y modo estudio (notas ampliadas) |
| **T** | Tema claro / oscuro (claro por defecto) |
| **F** | Enfocar: solo el gráfico interactivo, en grande |
| **P** | Pantalla completa |
| **?** | Ayuda |
| Ctrl + Enter | Ejecutar SQL en los editores en vivo |

- Cada diapositiva tiene su propia URL (`…/#s8.1`), así que se puede enlazar directamente a un apartado.
- El SQL en vivo usa una base de datos **Mercado Next** real. Se puede modificar libremente; el botón **↺ Reiniciar BD** la deja como al principio. Cada alumno trabaja con su propia copia dentro de su navegador.
- El botón ⇩ de la barra superior descarga el temario completo en Word.
- La pestaña **Ejercicios** (`…/#ej`, o `…/#ej/8` para un tema) reúne 106 ejercicios autoevaluables de test, clasificar, ordenar y SQL. El botón **Corregir** dice si la respuesta está bien, enseña la solución y explica por qué. Los de SQL se ejecutan sobre una copia limpia de Mercado Next y se compara su resultado con el de la solución; los de DDL y DML se corrigen con una consulta de comprobación sobre cómo queda la base de datos. El progreso se guarda en `localStorage`.

## Estructura

```
index.html            página única
css/style.css         estilos (Karla, Instrument Sans, IBM Plex Mono; colores de Next)
js/app.js             motor de diapositivas, índice, modos y navegación
js/deck.js            constructor de diapositivas
js/sql.js             SQL en vivo con PGlite
js/ui.js              utilidades (gráficos, 3D, tablas editables, resaltado)
js/slides/b0…b8.js    contenido de cada bloque
js/w/*.js             gráficos interactivos de cada bloque
js/ejercicios.js      pestaña de ejercicios autoevaluables y su corrección
js/ejercicios/*.js    banco de ejercicios por bloque (enunciado, solución, por qué)
tests/ejercicios.mjs  prueba en Node las soluciones SQL y errores típicos (node tests/ejercicios.mjs)
lib/                  PGlite 0.5.9, three.js 0.170, Chart.js 4.4.7, d3 7.9 (locales, sin CDN)
assets/               logo, fuentes, base de datos Mercado Next y temario en Word
```

No depende de ningún servicio externo: todo funciona sin conexión una vez cargada la página.
