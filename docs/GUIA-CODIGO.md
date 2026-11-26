# Guía del código para principiantes

Esta guía explica, sin dar nada por sabido, cómo funciona el código de
JavaScript/TypeScript del sitio de Vinci. Todos los ejemplos salen de los
archivos reales de `src/`.

Contenido:

1. [Qué hace el código en este sitio](#qué-hace-el-código-en-este-sitio)
2. [Las piezas básicas del lenguaje](#las-piezas-básicas-del-lenguaje)
3. [Cómo el código "toca" la página: el DOM](#cómo-el-código-toca-la-página-el-dom)
4. [Lo que agrega TypeScript](#lo-que-agrega-typescript)
5. [El formulario de contacto, paso a paso](#el-formulario-de-contacto-paso-a-paso)
6. [El botón "Pedir este poster", paso a paso](#el-botón-pedir-este-poster-paso-a-paso)
7. [El filtro de plantillas, paso a paso](#el-filtro-de-plantillas-paso-a-paso)
8. [Lo que hace `common.ts` en todas las páginas](#lo-que-hace-commonts-en-todas-las-páginas)
9. [Cómo leer un error al compilar](#cómo-leer-un-error-al-compilar)
10. [Glosario rápido](#glosario-rápido)

---

## Qué hace el código en este sitio

El HTML ya trae todo el contenido. El código solo se encarga de lo que
**reacciona** a lo que hace el visitante:

| Archivo | Se usa en | Qué hace |
|---|---|---|
| `src/common.ts` | Todas las páginas | Abre/cierra el menú en el celular, marca en el menú la página actual, pone el año en el pie de página y hace aparecer las secciones al bajar |
| `src/gallery.ts` | `templates.html` | Filtra las plantillas por categoría (Comida, Tiendas…) |
| `src/contact.ts` | `contact.html` | Revisa el formulario y arma el mensaje para WhatsApp y correo |
| `src/pedido.ts` | `servicios/pedido.html` | Lo mismo para pedidos de productos, y rellena el mensaje cuando vienes de un poster |
| Los demás | `examples/` | La lógica de las demos (carritos, menús, reservas…) |

---

## Las piezas básicas del lenguaje

### Guardar un dato: `const` y `let`

```ts
const recipient = "10093374@ipl.edu.do";   // const: no va a cambiar
let ok = true;                             // let: puede cambiar después
ok = false;
```

Piensa en una caja con etiqueta: `recipient` es la etiqueta y el correo es lo
que hay dentro.

### Textos (strings) y textos con huecos

```ts
const subject = `Nuevo pedido de producto · ${valueOf("name")}`;
```

Las comillas invertidas `` ` `` permiten meter valores dentro del texto con
`${ … }`. Si el cliente se llama Ana, el resultado es
`"Nuevo pedido de producto · Ana"`.

### Listas (arrays)

```ts
const recipient = ["10093374@ipl.edu.do", "10041045@ipl.edu.do"].join(",");
```

`[ … ]` es una lista. `.join(",")` la une en un solo texto separado por comas:
`"10093374@ipl.edu.do,10041045@ipl.edu.do"`.

### Funciones: recetas con nombre

```ts
const setError = (name: string, message: string): void => {
  // …pasos…
};

setError("email", "Ese correo electrónico no parece correcto.");
```

Una función es una receta que se escribe una vez y se usa muchas veces. Lo que
va entre paréntesis son los "ingredientes" (`name`, `message`). La flecha `=>`
significa "y esto es lo que hace".

### Decisiones: `if`

```ts
if (valueOf("name").length < 2) {
  setError("name", "Por favor dinos tu nombre.");
  ok = false;
} else {
  setError("name", "");
}
```

"Si el nombre tiene menos de 2 letras, muestra el error; si no, bórralo."

- `!` significa "no": `!ok` es "no está bien".
- `&&` significa "y": las dos cosas tienen que ser ciertas.
- `||` significa "o": basta con que una sea cierta.
- `===` compara si dos cosas son iguales (un solo `=` guarda un valor, no compara).

### Repetir para cada elemento: `forEach`

```ts
cards.forEach((card) => {
  card.classList.toggle("hidden", !show);
});
```

"Para cada tarjeta, haz esto." `card` es el nombre que le damos a la tarjeta
de turno.

### "Puede que no exista": `null`, `?.` y `??`

Si el código busca un botón que no está en esa página, recibe `null` (nada).

```ts
resetBtn?.addEventListener("click", …);   // ?. → solo si resetBtn existe
const lastSegment = segments[segments.length - 1] ?? "";   // ?? → si no hay nada, usa ""
```

### La "caja" que envuelve cada archivo

```ts
(() => {
  // todo el código del archivo
})();
```

Parece raro, pero solo significa "crea una función y ejecútala ya". Sirve
para que los nombres de un archivo (`form`, `valueOf`…) no choquen con los de
otro archivo cargado en la misma página.

---

## Cómo el código "toca" la página: el DOM

El navegador convierte el HTML en un árbol de objetos llamado **DOM**. El
código lo usa para encontrar elementos y cambiarlos.

### Encontrar un elemento

```ts
const form = document.querySelector<HTMLFormElement>("#contact-form");
if (!form) return;   // no estamos en la página de contacto: no hagas nada
```

`querySelector` busca con la misma notación de CSS:

| Busca | Encuentra |
|---|---|
| `"#contact-form"` | El elemento con `id="contact-form"` |
| `".nav-toggle"` | El primer elemento con `class="nav-toggle"` |
| `"[data-year]"` | Elementos con el atributo `data-year` |

`querySelectorAll` devuelve **todos** los que coinciden.

### Cambiar algo

```ts
el.textContent = "2026";              // cambia el texto
panel.hidden = false;                 // muestra un elemento oculto
menu.classList.toggle("open");        // pone o quita una clase de CSS
link.href = mailto;                   // cambia a dónde lleva un enlace
```

Casi todo lo visual se hace **poniendo o quitando una clase**; el CSS decide
cómo se ve esa clase. Por ejemplo, `.template-card.hidden` en `main.css`
dice "no muestres esta tarjeta".

### Reaccionar a lo que hace el visitante: eventos

```ts
toggle.addEventListener("click", () => {
  menu.classList.toggle("open");
});
```

"Cuando toquen el botón, abre o cierra el menú." Los eventos que usa el sitio:

| Evento | Cuándo ocurre |
|---|---|
| `click` | Al tocar o hacer clic |
| `input` | Cada vez que se escribe en un campo |
| `change` | Al elegir otra opción en una lista |
| `submit` | Al enviar un formulario |

`event.preventDefault()` cancela lo que el navegador iba a hacer por su
cuenta; en el formulario evita que la página se recargue.

### Datos escondidos en el HTML: `data-…`

```html
<article class="card template-card" data-category="food">
```

```ts
card.dataset.category   // → "food"
```

Cualquier atributo que empiece por `data-` se lee en el código con
`.dataset`. Así el HTML le pasa información al código sin mostrarla.

### Datos en la dirección: `?plan=basic`

El botón "Pedir este" del plan Básico lleva a `contact.html?plan=basic`.

```ts
const plan = new URLSearchParams(window.location.search).get("plan"); // → "basic"
if (plan) typeSelect.value = plan;   // deja elegido el plan Básico en la lista
```

---

## Lo que agrega TypeScript

TypeScript es JavaScript con **etiquetas de tipo** para que `tsc` avise de
errores antes de publicar. Al compilar, esas etiquetas se borran: el
navegador nunca las ve.

| Escribes | Significa |
|---|---|
| `(name: string)` | `name` tiene que ser texto |
| `(): boolean` | La función devuelve verdadero o falso |
| `(): void` | La función no devuelve nada |
| `querySelector<HTMLFormElement>(…)` | "Lo que encuentres será un formulario" |
| `field instanceof HTMLSelectElement` | Pregunta de verdad, al ejecutarse: "¿esto es una lista desplegable?" |
| `interface Product { name: string; price: number }` | La forma que debe tener un producto |
| `tag?: string` | Ese dato es opcional |
| `x as T` | "Confía en mí, esto es T" (no revisa nada; úsalo poco) |

Ejemplo de un error que TypeScript evita:

```ts
const form = document.querySelector<HTMLFormElement>("#contact-form");
form.reset();          // ❌ tsc: 'form' is possibly 'null'
if (form) form.reset(); // ✅
```

---

## El formulario de contacto, paso a paso

Archivo: `src/contact.ts`. Lo mismo vale para `src/pedido.ts`.

1. **Busca el formulario.** Si no está en la página, el archivo no hace nada.
2. **Prepara ayudantes:**
   - `valueOf("email")` devuelve lo que el cliente escribió en ese campo, sin
     espacios al principio ni al final.
   - `labelOf("project-type")` devuelve el texto visible de la opción elegida
     (`"Básico · RD$500"`) en vez del valor interno (`"basic"`).
   - `setError(campo, mensaje)` escribe el mensaje rojo debajo del campo y lo
     marca en rojo; con mensaje vacío, lo limpia.
3. **Elige el plan de la dirección** (`?plan=basic`) y muestra la pregunta de
   presupuesto solo si el plan es Personalizado.
4. **Mientras el cliente escribe** (evento `input`), borra el error de ese campo.
5. **Al enviar** (evento `submit`):
   1. Cancela la recarga de la página (`preventDefault`).
   2. Revisa las reglas con `validate()`:
      nombre de 2 letras o más, correo con forma válida, teléfono válido si lo
      escribió, un plan elegido y un mensaje de 10 letras o más. Si algo
      falla, muestra los errores y se detiene.
   3. Arma el mensaje en líneas: nombre, negocio, correo, teléfono, plan,
      presupuesto y lo que escribió.
   4. Crea dos enlaces con ese mensaje:
      - `mailto:10093374@ipl.edu.do,10041045@ipl.edu.do?subject=…&body=…`
        abre la app de correo del cliente con todo escrito.
      - `https://wa.me/18298591920?text=…` abre WhatsApp con el mensaje.
      `encodeURIComponent` convierte espacios, saltos de línea y tildes a un
      formato que cabe en un enlace (un espacio se vuelve `%20`).
   5. Esconde el formulario y muestra el panel de "listo" con los dos botones.
6. **"Escribir otro mensaje"** vacía el formulario y lo vuelve a mostrar.

Importante: **el sitio no envía nada por sí solo.** El mensaje llega cuando
el cliente toca el botón de WhatsApp o de correo y lo envía desde su app.

---

## El botón "Pedir este poster", paso a paso

1. En `servicios/posters.html`, cada botón lleva a una dirección como
   `pedido.html?servicio=posters&diseno=Interstellar`.
2. `src/pedido.ts` lee `servicio=posters` y deja elegido "Poster
   personalizado" en la lista.
3. Lee `diseno=Interstellar` y escribe en el mensaje:
   `Quiero el poster "Interstellar" del catálogo (18 × 24 pulgadas, RD$250).`
4. Si el cliente cambia a otro producto sin haber tocado el mensaje, el
   mensaje del poster se borra para que no quede un pedido equivocado.

Si cambias el precio de los posters, cámbialo en `posters.html` **y** en esa
frase de `src/pedido.ts`.

---

## El filtro de plantillas, paso a paso

Archivo: `src/gallery.ts`.

1. Busca los botones (`.filter-btn`) y las tarjetas (`.template-card`).
2. Cada botón dice su categoría en `data-filter`, por ejemplo
   `data-filter="food"`; cada tarjeta dice la suya en `data-category`.
3. Al tocar un botón:
   - lo marca como activo y desmarca los demás;
   - a cada tarjeta le pone la clase `hidden` si no es de esa categoría
     (o se la quita si lo es). `"all"` muestra todas.

Para agregar una categoría nueva: pon un botón con `data-filter="nueva"` y
tarjetas con `data-category="nueva"`. No hay que tocar el código.

---

## Lo que hace `common.ts` en todas las páginas

1. **Menú del celular:** el botón ☰ pone o quita la clase `open` en el menú.
2. **"Otros servicios":** en computadora se abre al pasar el ratón (lo hace el
   CSS). En celular no hay ratón, así que el primer toque lo abre y el
   segundo entra a la página de servicios.
3. **Página actual en el menú:** mira la dirección (por ejemplo
   `/servicios/posters.html`) y pone la clase `active` al enlace que
   corresponde (`data-route="servicios"`).
4. **Año del pie de página:** escribe el año actual en cada `data-year`, así
   no hay que cambiarlo a mano cada enero.
5. **Aparecer al bajar:** los elementos con la clase `reveal` empiezan
   invisibles. Un `IntersectionObserver` (un vigilante del navegador) avisa
   cuando entran en la pantalla y entonces se les pone `visible`, que activa
   la animación del CSS. Si el navegador es muy viejo, se muestran todos de
   una vez.

---

## Cómo leer un error al compilar

```
src/contact.ts(42,5): error TS18047: 'form' is possibly 'null'.
```

- `src/contact.ts` → el archivo.
- `(42,5)` → línea 42, columna 5.
- `'form' is possibly 'null'` → estás usando algo que puede no existir.
  Solución típica: envolverlo en `if (algo) { … }` o usar `algo?.`.

Otros mensajes comunes:

| Mensaje | Qué suele significar |
|---|---|
| `Cannot find name 'X'` | Nombre mal escrito o variable que no existe |
| `Property 'X' does not exist on type 'Y'` | Ese elemento no tiene esa propiedad (o el nombre está mal escrito) |
| `Type 'number' is not assignable to type 'string'` | Pusiste un número donde iba texto; usa `String(numero)` |
| `'X' is declared but its value is never read` | Creaste algo que no usas; bórralo |

---

## Glosario rápido

| Palabra | En palabras simples |
|---|---|
| **Navegador** | Chrome, Safari, Edge: el programa que abre páginas web |
| **HTML / CSS / JavaScript** | Contenido / apariencia / comportamiento |
| **TypeScript** | JavaScript con revisión de errores antes de publicar |
| **Compilar (`tsc`)** | Traducir `src/*.ts` a `js/*.js` |
| **DOM** | La página convertida en objetos que el código puede tocar |
| **Elemento** | Una pieza de la página: un botón, un título, un formulario |
| **Clase (CSS)** | Una etiqueta en un elemento que el CSS usa para darle estilo |
| **Evento** | Algo que pasa: un clic, escribir, enviar |
| **Función** | Una receta de pasos con nombre |
| **Variable** | Una caja con etiqueta que guarda un dato |
| **`null`** | "No hay nada" |
| **`mailto:`** | Un enlace que abre la app de correo con un mensaje listo |
| **`wa.me`** | Un enlace que abre WhatsApp con un mensaje listo |
| **Repositorio (repo)** | La carpeta del proyecto guardada en GitHub con su historial |
| **Pull request (PR)** | Una propuesta de cambios que se revisa antes de unirla a `main` |
| **Vercel** | El servicio que publica el sitio cada vez que `main` cambia |
