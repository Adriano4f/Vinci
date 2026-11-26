# Vinci Web Studio

Sitio web de **Vinci Web Studio**: vendemos páginas web para negocios y
productos personalizados (posters, imanes, marcos con estampado y bisutería).

- Sitio en vivo: <https://vincihost.vercel.app>
- Guía del código para principiantes: [`docs/GUIA-CODIGO.md`](docs/GUIA-CODIGO.md)

> **Si nunca has programado en TypeScript o JavaScript**, empieza por la
> sección "Cómo funciona una página" de abajo y luego lee la guía del código.
> Para cambiar textos, precios o fotos **no necesitas saber programar**: solo
> se editan los archivos `.html`.

---

## Cómo funciona una página (en palabras simples)

Cada página del sitio está hecha de tres piezas, como una casa:

| Pieza | Archivos | Es como… | Qué hace |
|---|---|---|---|
| **HTML** | `index.html`, `contact.html`… | Las paredes y los muebles | El contenido: textos, títulos, fotos, botones, formularios |
| **CSS** | `css/main.css` | La pintura y la decoración | Colores, letras, tamaños, espacios, cómo se ve en el celular |
| **JavaScript** | `js/*.js` | La electricidad | Lo que *reacciona*: abrir el menú, filtrar plantillas, revisar el formulario |

El navegador (Chrome, Safari…) abre el `.html`, y ese archivo le dice "carga
también este `.css` y este `.js"`. Al final de cada página verás algo como:

```html
<script src="js/common.js" defer></script>
```

### ¿Y TypeScript?

El navegador solo entiende **JavaScript**. Nosotros escribimos el código en
**TypeScript** (carpeta `src/`), que es JavaScript con una ayuda extra: antes
de publicar, revisa que no hayamos cometido errores tontos (por ejemplo, usar
un botón que no existe). El programa `tsc` traduce cada archivo de `src/` a
uno de `js/`:

```
src/contact.ts  ──tsc──▶  js/contact.js   (este es el que usa el navegador)
```

Regla de oro: **edita `src/*.ts`, nunca `js/*.js`**. Los `.js` se vuelven a
generar solos al compilar, y cualquier cambio hecho a mano en ellos se pierde.

---

## Qué hay en cada carpeta

```
vincihost/
├── index.html            Inicio: quiénes somos, cómo trabajamos y los 3 planes con sus límites
├── templates.html        Galería de plantillas/demos, con filtro por categoría
├── contact.html          Formulario para pedir una página web
├── 404.html              Página que aparece cuando alguien abre un enlace que no existe
├── servicios/            Productos físicos
│   ├── index.html        Resumen de los 4 productos
│   ├── posters.html      Catálogo de posters (18 × 24 pulgadas, RD$250)
│   ├── imanes.html, marcos.html, bisuteria.html
│   └── pedido.html       Formulario para pedir un producto
├── examples/             Demos de sitios terminados para mostrar a clientes
│   ├── bakery*.html      Panadería "La Miga Dorada" (5 páginas)
│   ├── techstore*.html   Tienda de tecnología "ByteShop" (5 páginas)
│   ├── restaurant.html   Menú de restaurante "Brasa & Sabor"
│   ├── event.html        Evento "Nexus Summit"
│   ├── tutorias*.html    Plataforma de tutorías "Nexum Academy" (3 páginas)
│   └── portfolio.html    Portafolio (demo sencilla)
├── css/
│   ├── main.css          Estilos del sitio de Vinci (los colores están arriba, en :root)
│   └── examples.css, bakery.css, techstore.css…   Estilos propios de cada demo
├── src/                  Código TypeScript: AQUÍ se edita la lógica
│   ├── common.ts         Menú del celular, menú "Otros servicios", enlace activo, año, animaciones
│   ├── gallery.ts        Filtro de categorías de templates.html
│   ├── contact.ts        Revisa el formulario de contacto y arma el mensaje
│   ├── pedido.ts         Igual, para el formulario de productos
│   └── bakery.ts, techstore.ts, restaurant.ts, event.ts, tutorias*.ts, tutors-data.ts   (demos)
├── js/                   JavaScript generado por tsc. NO editar a mano
├── img/                  Fotos (img/og-vinci.jpg es la imagen que sale al compartir el enlace)
├── robots.txt, sitemap.xml   Le dicen a Google qué páginas existen
├── scripts/build-static.mjs  Copia los archivos públicos a dist/ para Vercel
├── package.json          Lista de comandos (npm run build, etc.)
├── tsconfig.json         Opciones de TypeScript
└── vercel.json           Le dice a Vercel cómo publicar el sitio
```

---

## Cambios comunes (sin programar)

| Si quieres… | Abre… | Busca… |
|---|---|---|
| Cambiar textos o precios de los planes | `index.html` | `class="offer"` (una tarjeta por plan) |
| Cambiar qué es una página / qué incluye cada plan | `index.html` | `class="plan-terms"` |
| Cambiar los planes que aparecen en el formulario | `contact.html` | `<option value="basic">` |
| Agregar un poster | `servicios/posters.html` | Copia un bloque `<article class="card poster-card reveal">`, cambia nombre, descripción y foto (`img/servicios/posters/`) |
| Cambiar el precio de los posters | `servicios/posters.html` **y** `src/pedido.ts` | `RD$250` (el `.ts` lo usa para el mensaje del pedido) |
| Cambiar colores | `css/main.css` | El bloque `:root` al principio: `--accent` es el azul de la marca |
| Agregar una tarjeta a la galería | `templates.html` | Copia un `<article class="card template-card">` y ajusta `data-category` |
| Cambiar los correos que reciben los formularios | `src/contact.ts` y `src/pedido.ts` | `const recipient` |
| Cambiar el número de WhatsApp | `src/contact.ts`, `src/pedido.ts`, `contact.html`, `servicios/pedido.html` | `18298591920` / `829) 859-1920` |
| Cambiar la imagen al compartir el enlace | `img/og-vinci.jpg` | Imagen de 1200 × 630 píxeles |

Después de cambiar un archivo de `src/`, compila (ver abajo) para que se
actualice su `.js`.

---

## Cómo probar el sitio en tu computadora

1. Instala **Node.js** (versión LTS) desde <https://nodejs.org>. Una sola vez.
2. En esta carpeta, abre una terminal y ejecuta una sola vez:
   ```bash
   npm install
   ```
   Eso descarga TypeScript en `node_modules/`.
3. Cada vez que cambies algo:
   ```bash
   npm run build     # traduce src/*.ts a js/*.js y prepara dist/
   npm run serve     # abre el sitio en http://localhost:3000
   ```
   También sirve `npm run watch`: deja `tsc` abierto y recompila cada vez
   que guardas un `.ts`.

Si `npm run build` muestra un error, te dice el archivo y la línea, por
ejemplo `src/contact.ts(42,5): error TS2339…`. Ve a esa línea: casi siempre es
un nombre mal escrito o un elemento que puede no existir.

---

## Cómo se publica (Vercel)

- Este repositorio (**vincihost**) está conectado a Vercel. Cada vez que algo
  llega a la rama `main`, Vercel ejecuta `npm run build` y publica la carpeta
  `dist/` en <https://vincihost.vercel.app> en uno o dos minutos.
- Cada pull request recibe además una *vista previa* con su propio enlace,
  para revisarla antes de unirla a `main`.
- El repositorio **Vinci** guarda el mismo código: cuando cambies algo aquí,
  haz el mismo cambio allá para que no se separen.
- La carpeta `js/` se guarda en git a propósito, para que el sitio funcione
  aunque nadie haya compilado. `dist/` no se guarda: se crea en cada build.

---

## Cosas que conviene saber

- **No hay servidor ni base de datos.** Los formularios no "envían" nada por
  sí solos: revisan los datos y luego le muestran al cliente dos botones, uno
  que abre WhatsApp y otro que abre su correo, con el mensaje ya escrito. El
  cliente toca uno y lo envía él mismo. Los detalles están en
  [`docs/GUIA-CODIGO.md`](docs/GUIA-CODIGO.md#el-formulario-de-contacto-paso-a-paso).
- Los textos que ve el cliente están en español; los nombres en el código y
  los comentarios están en inglés.
- Las demos de `examples/` son de mentira: los carritos, reservas y pedidos
  solo funcionan dentro del navegador de quien las prueba.
