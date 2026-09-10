# Vinci — sitios web para negocios estudiantiles

Este es el sitio web de **Vinci**, nuestro proyecto de emprendimiento
escolar: un estudio web dirigido por estudiantes que construye páginas para
otros negocios de estudiantes.

El sitio tiene tres páginas principales más una carpeta con plantillas demo:

| Página | Archivo | Qué es |
|--------|---------|--------|
| Inicio | `index.html` | Quiénes somos, por qué deberían comprarnos, qué ofrecemos |
| Plantillas | `templates.html` | Galería de diseños que los clientes pueden elegir |
| Contacto | `contact.html` | Formulario para que los clientes nos cuenten su proyecto |
| Demos | `examples/` | Tres sitios de muestra (panadería, tienda de tecnología, portafolio) que muestran cómo puede verse un sitio terminado |

---

## Cómo está organizado el proyecto

```
Vinci/
├── index.html          # Página de inicio
├── templates.html      # Galería de plantillas (con filtro por categoría)
├── contact.html        # Página de contacto con formulario validado
├── examples/           # Sitios demo independientes para que los clientes vean
│   ├── bakery.html
│   ├── techstore.html
│   └── portfolio.html
├── css/
│   ├── main.css        # Todos los estilos de las tres páginas principales
│   └── examples.css    # Estilos compartidos por las páginas demo
├── src/                # Código TypeScript FUENTE — esto es lo que editamos
│   ├── common.ts       # Navbar (menú móvil, enlace activo), año del footer
│   ├── gallery.ts      # Filtro de categorías en templates.html
│   └── contact.ts      # Validación del formulario de contacto
├── js/                 # JavaScript compilado — GENERADO, no editar a mano
├── tsconfig.json       # Configuración del compilador TypeScript
├── package.json        # Metadatos del proyecto + comandos abreviados
└── .gitignore          # Le dice a git que ignore node_modules/
```

## El modelo mental (para quien viene de C++)

Si conoces C++, las tecnologías web se corresponden más o menos así:

| Web | Equivalente en C++ |
|-----|--------------------|
| **HTML** (`.html`) | La *estructura* de la página — como declarar los widgets/layout de un programa. Texto, encabezados, botones, formularios. Sin lógica. |
| **CSS** (`.css`) | La *apariencia* — colores, fuentes, tamaños, espaciado, disposición. Puramente cosmético. |
| **TypeScript** (`.ts`) | La *lógica* — como tus archivos `.cpp`. Los navegadores no pueden ejecutar TypeScript directamente. |
| **JavaScript** (`.js` en `js/`) | El *resultado compilado* — como el binario que produce `g++`. `tsc` convierte cada `.ts` en un `.js` que el navegador sí entiende. |
| `tsc` (compilador de TypeScript) | `g++` / `clang++` |
| `tsconfig.json` | Las banderas del compilador, como los `CXXFLAGS` de un Makefile |
| `package.json` | Algo como un Makefile + manifiesto: lista dependencias y define atajos `npm run …` |
| `npm` | Gestor de paquetes — como vcpkg/conan, instala bibliotecas (`typescript` es nuestra única dependencia) |

Cada página HTML carga los scripts que necesita al final, por ejemplo
`<script src="js/common.js" defer></script>`.

## Configuración inicial (una sola vez)

Necesitas **Node.js** (incluye `npm`). Instálalo desde
<https://nodejs.org> (elige la versión LTS) y luego, en esta carpeta, ejecuta:

```bash
npm install
```

Eso descarga el compilador de TypeScript en `node_modules/`. Solo hace falta
una vez (y de nuevo únicamente si cambia `package.json`).

## Flujo de trabajo diario

```bash
# 1. Edita los archivos de src/ (TypeScript) o los .html / .css.

# 2. Compila TypeScript -> JavaScript
npm run build        # es lo mismo que: npx tsc

#    …o deja el compilador corriendo para que recompile al guardar:
npm run watch

# 3. Mira el sitio
npm run serve        # luego abre http://localhost:3000
#    o sin npm:
python3 -m http.server 8000    # luego abre http://localhost:8000
```

> **¿Por qué un servidor?** Abrir `index.html` con doble clic funciona para
> la mayoría del sitio, pero usar un servidor local es la forma confiable —
> algunos navegadores restringen páginas abiertas desde `file://`. Los
> comandos `serve`/`http.server` de arriba son la forma recomendada.

La carpeta `js/` está versionada en git a propósito: el sitio funciona aunque
nadie haya ejecutado `tsc` (por ejemplo, en GitHub Pages). Solo recuerda —
**edita los `.ts` de `src/`, nunca los `.js` de `js/`**.

## Desplegar en Vercel

`npm run build` hace dos cosas: compila TypeScript (`tsc`) y copia los
archivos públicos a la carpeta `dist/` (`scripts/build-static.mjs`). El
archivo `vercel.json` ya le dice a Vercel que use `npm run build` y publique
`dist/`, así que basta con importar este repo en Vercel — sin configuración
extra.

Para ver localmente exactamente lo que Vercel publicará:

```bash
npm run preview    # compila y sirve dist/
```

`dist/` está en `.gitignore`: se genera en cada build/deploy, no se versiona.

## Dónde hacer los cambios más comunes

| Si quieres… | Edita… |
|---|---|
| Cambiar textos, precios o secciones | El `.html` de esa página |
| Cambiar colores / fuentes / espaciado | `css/main.css` — todos los colores son variables CSS en el bloque `:root` de arriba |
| Agregar una tarjeta a la galería | Copia un bloque `<article class="card template-card">` en `templates.html` y ajusta su `data-category` |
| Cambiar el correo del formulario | `recipient` cerca del final de `src/contact.ts` |
| Cambiar cómo funciona la validación | `src/contact.ts` — cada regla es un pequeño `if` |
| Agregar un nuevo sitio demo | Crea un archivo en `examples/` (copia uno existente) y agrega una tarjeta en `templates.html` |

## Notas

- **No hay backend**: el formulario valida los datos y luego construye un
  enlace `mailto:` que abre la aplicación de correo del visitante con el
  mensaje ya escrito. Para una versión real podríamos agregar un servicio de
  formularios después.
- La configuración de TypeScript usa el modo `strict` — si `npm run build`
  marca un error, el mensaje te dice el archivo y la línea, igual que los
  errores de `g++`.
- El texto visible del sitio está en español; el código (nombres, comentarios)
  está en inglés.
