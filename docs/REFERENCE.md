# Vinci Web Studio: Technical Reference

This document specifies how the site is built, deployed and executed, and
the exact semantics of every TypeScript, JavaScript and browser feature the
code depends on. It assumes general programming knowledge (types, functions,
scopes, compilation) and **no** prior knowledge of TypeScript, JavaScript,
HTML, CSS or the browser platform. Each such term is defined where it first
appears; §9 indexes them.

Contents

1. [System overview](#1-system-overview)
2. [Repository layout](#2-repository-layout)
3. [Build pipeline](#3-build-pipeline)
4. [Deployment](#4-deployment)
5. [Runtime model: how a page executes](#5-runtime-model-how-a-page-executes)
6. [Language semantics used by the code](#6-language-semantics-used-by-the-code)
7. [Browser APIs used by the code](#7-browser-apis-used-by-the-code)
8. [Module reference](#8-module-reference)
9. [Glossary](#9-glossary)

## 1. System overview

The site is a **static site**: every response is a file served unchanged
from disk. There is no application server, no database and no server-side
code. All dynamic behavior executes in the visitor's browser.

| Layer | Language | Role | Executed by |
|---|---|---|---|
| Document | **HTML** (HyperText Markup Language) | Declares the content as a tree of *elements* (`<h1>`, `<form>`, `<img>`…). Each element has a tag name, *attributes* (`key="value"` pairs) and children. | Browser HTML parser |
| Presentation | **CSS** (Cascading Style Sheets) | Rules of the form `selector { property: value; }` that assign visual properties to the elements matched by the selector. | Browser style/layout engine |
| Behavior | **JavaScript** (standardized as **ECMAScript**, "ES") | Imperative code that reads and mutates the element tree and reacts to user input. | Browser JavaScript engine |
| Behavior (source) | **TypeScript** | A superset of JavaScript that adds a static type system. Compiled to JavaScript by `tsc`; never executed directly. | `tsc` at build time only |

Data that leaves the browser does so only through two URI schemes opened by
the visitor's own applications (§7.9): `mailto:` (email client) and
`https://wa.me/` (WhatsApp). The site itself transmits nothing.

## 2. Repository layout

```
index.html, templates.html, contact.html, 404.html   top-level pages
servicios/*.html          physical-product pages and the order form
examples/*.html           client demo sites (fictional businesses)
css/main.css              studio styles; design tokens in :root
css/<demo>.css            per-demo styles
src/*.ts                  TypeScript sources (edit these)
js/*.js, js/*.js.map      tsc output + source maps (generated, committed)
img/                      raster images; img/og-vinci.jpg = social preview
robots.txt, sitemap.xml   crawler directives and URL list
scripts/build-static.mjs  assembles dist/
tsconfig.json             compiler configuration
package.json              npm scripts and the TypeScript dev dependency
vercel.json               Vercel build command and output directory
docs/REFERENCE.md         this document
```

`js/` is committed so that the repository root is itself a working site
(opening `index.html` or serving the root works without a build). `dist/` is
build output and is not committed.

The repository exists twice: `Adriano4f/vincihost` (connected to Vercel) and
`Adriano4f/Vinci`. Changes are applied to both.

## 3. Build pipeline

### 3.1 Tooling

- **Node.js**: a JavaScript runtime outside the browser. Used only to run
  build tools. The environment blueprint installs Node 20.
- **npm**: Node's package manager. `package.json` declares one development
  dependency, `typescript` (`^5.9.3`), installed into `node_modules/` by
  `npm install` (or `npm ci`, which installs the exact versions from
  `package-lock.json`).

### 3.2 npm scripts (`package.json`)

| Command | Expands to | Effect |
|---|---|---|
| `npm run build` | `tsc && node scripts/build-static.mjs` | Type-check and compile `src/` → `js/`, then assemble `dist/` |
| `npm run watch` | `tsc --watch` | Recompile on every save of a `.ts` file |
| `npm run serve` | `npx --yes serve .` | Serve the repository root over HTTP |
| `npm run preview` | `npm run build && npx --yes serve dist` | Serve exactly what Vercel will deploy |

`&&` runs the second command only if the first exits with status 0, so a
type error aborts the build before `dist/` is produced.

### 3.3 Compilation (`tsc`, `tsconfig.json`)

`tsc` performs two independent operations on every file matched by
`"include": ["src/**/*.ts"]`:

1. **Type checking.** Reports type errors. Errors make `tsc` exit non-zero.
2. **Emit.** Writes JavaScript to `outDir`, mirroring paths under `rootDir`
   (`src/contact.ts` → `js/contact.js`). Emit consists of **type erasure**
   (deleting all type syntax) plus **downleveling** (rewriting syntax newer
   than `target` into equivalent older syntax). No type information exists
   in the output; types have no runtime representation or cost.

| Option | Value | Meaning |
|---|---|---|
| `target` | `ES2017` | Output syntax level. Newer syntax is rewritten, e.g. `a?.b` (ES2020) becomes `a === null \|\| a === void 0 ? void 0 : a.b`. Library functions are **not** polyfilled. |
| `lib` | `ES2020`, `DOM`, `DOM.Iterable` | Which built-in declarations the checker knows: the ES2020 standard library, the browser's document API (§5.2), and iteration over DOM collections. Declarations only; they emit nothing. |
| `module` | `none` | Files are compiled as **scripts**, not **modules** (§5.3): there are no `import`/`export` statements and all files share one global scope at runtime. |
| `rootDir` / `outDir` | `src` / `js` | Input and output roots. |
| `strict` | `true` | Enables the strict family, notably `strictNullChecks` (`null`/`undefined` are not members of other types and must be handled explicitly), `noImplicitAny` (every binding must have an inferable or declared type), `strictFunctionTypes`, `useUnknownInCatchVariables`, and `alwaysStrict` (emits `"use strict"`, §6.1). |
| `noUnusedLocals` | `true` | Unused local declarations are errors. |
| `noImplicitReturns` | `true` | Every code path of a function with a return type must return. |
| `forceConsistentCasingInFileNames` | `true` | Rejects references whose letter case differs from the file on disk. |
| `sourceMap` | `true` | Emits `*.js.map` files mapping output positions back to `.ts` positions, so browser debuggers display the TypeScript source. |

`noUncheckedIndexedAccess` is **not** enabled: `arr[i]` has type `T`, not
`T | undefined`, even though an out-of-range read yields `undefined` at
runtime. Code that indexes arrays guards the result explicitly.

Diagnostic format: `src/contact.ts(42,5): error TS18047: 'form' is possibly 'null'.`
= file, line, column, error code, message.

### 3.4 Assembly (`scripts/build-static.mjs`)

An ES module (`.mjs`) executed by Node. It deletes `dist/`, recreates it,
and copies:

- files: `index.html`, `templates.html`, `contact.html`, `404.html`,
  `favicon.svg`, `robots.txt`, `sitemap.xml`
- directories (recursively): `css`, `examples`, `img`, `js`, `servicios`

Anything not listed is not deployed. **A new top-level file or directory
must be added to these arrays.**

## 4. Deployment

- **Host:** Vercel, project linked to `Adriano4f/vincihost`.
  `vercel.json` sets `buildCommand: "npm run build"` and
  `outputDirectory: "dist"`.
- **Production:** every commit on `main` triggers a build; on success
  `dist/` is served at <https://vincihost.vercel.app>.
- **Previews:** every pull request receives its own preview URL, built the
  same way.
- **Unknown paths:** Vercel responds with status 404 and the body of
  `dist/404.html`. That page uses root-relative URLs (`/css/main.css`)
  because it is served at arbitrary paths.
- **Caching:** static files are served with
  `Cache-Control: public, max-age=0, must-revalidate`, i.e. browsers
  revalidate on every load, so a deploy is visible immediately.
- **SEO files:** `robots.txt` allows all crawlers and points to
  `sitemap.xml`, which lists the canonical public URLs. Public pages carry
  Open Graph `<meta property="og:*">` tags, read by WhatsApp, Instagram,
  Facebook etc. to render link previews (`og:image` = `img/og-vinci.jpg`,
  1200 × 630).

## 5. Runtime model: how a page executes

### 5.1 Loading

1. The browser fetches the HTML file and parses it incrementally into the
   element tree.
2. `<link rel="stylesheet" href="…">` fetches CSS, which is applied to the
   tree.
3. `<script src="…" defer></script>` declares a **classic script** with the
   `defer` attribute: it is fetched in parallel with parsing and executed
   **after the whole document has been parsed**, in document order, before
   the `DOMContentLoaded` event. Consequence: every element in the HTML
   already exists when the script runs, so scripts query elements at top
   level without waiting for an event.

Scripts loaded per page:

| Page(s) | Scripts, in execution order |
|---|---|
| all top-level and `servicios/` pages | `common.js` |
| `templates.html` | `common.js`, `gallery.js` |
| `contact.html` | `common.js`, `contact.js` |
| `servicios/pedido.html` | `common.js`, `pedido.js` |
| `examples/bakery*.html` | `bakery.js` |
| `examples/techstore*.html` | `techstore.js` |
| `examples/restaurant.html` | `restaurant.js` |
| `examples/event.html` | `event.js` |
| `examples/tutorias.html` | `tutors-data.js`, `tutorias.js` |
| `examples/tutorias-tutores.html`, `tutorias-tutor.html` | `tutors-data.js`, `tutorias-pages.js` |
| `examples/portfolio.html` | none |

### 5.2 The DOM

The **DOM** (Document Object Model) is the in-memory object representation
of the parsed HTML, exposed to JavaScript through the global object
`document`. Every element is an object implementing a hierarchy of
interfaces: `EventTarget` → `Node` → `Element` → `HTMLElement` → a specific
interface such as `HTMLFormElement`, `HTMLInputElement`,
`HTMLSelectElement`, `HTMLAnchorElement` (`<a>`), `HTMLButtonElement`.
Mutating these objects (setting `textContent`, adding a class, toggling
`hidden`) changes what is rendered; the browser re-renders asynchronously.

`window` is the **global object**: its properties (`document`, `location`,
`localStorage`, `matchMedia`, …) are accessible as bare identifiers.

### 5.3 Scripts, scopes and the IIFE pattern

A **script** (as opposed to a **module**) executes in the page's single
global scope. Top-level `const`/`let`/`class` declarations of one script are
visible to all later scripts on the same page (they live in the global
*declarative* environment, not on `window`); top-level `var` and
`function` declarations additionally become properties of `window`.

To keep names file-private, every page script wraps its logic in an
**IIFE** (Immediately Invoked
Function Expression):

```ts
(() => {
  const form = …;   // local to this function invocation
})();
```

The arrow function (§6.5) is parenthesized to make it an expression and
called immediately; its locals are inaccessible from other scripts. The
static data tables at the top of `event.ts` and `restaurant.ts` are
declared outside the IIFE and are therefore page-global.
`tutors-data.ts` deliberately declares `interface NxTutor` and
`const NEXUM_TUTORS` at top level so that `tutorias.ts` and
`tutorias-pages.ts` (loaded after it) can reference them without `import`.
At type-check time `module: "none"` makes these declarations visible across
files in the same way.

### 5.4 Event loop

JavaScript in a page runs on **one thread**. The browser maintains a queue
of **tasks** (parse-and-run a script, dispatch a click, fire a timer…). It
takes one task, runs it **to completion** (no preemption by other
JavaScript), then renders if needed and takes the next. Consequences:

- Registering a handler (`addEventListener`, §7.2) runs nothing; the
  handler is invoked later, as part of a future task, when the event is
  dispatched.
- A long-running handler blocks input and rendering for its duration.
- There is no data race between handlers; shared state is only observed
  between tasks.

## 6. Language semantics used by the code

### 6.1 Strict mode

`"use strict"` (emitted by `alwaysStrict`, and written explicitly in some
files) selects ECMAScript strict mode: assigning to an undeclared
identifier throws `ReferenceError` instead of creating a global; `this` is
`undefined` in plain function calls; some legacy syntax is rejected.

### 6.2 Values and types at runtime

JavaScript is dynamically typed. Primitive types: `undefined`, `null`,
`boolean`, `number` (IEEE-754 binary64; there is no separate integer
type), `bigint`, `string` (immutable sequence of UTF-16 code units;
`.length` counts code units, so one emoji may count as 2), `symbol`.
Everything else is an **object** (a mutable map from property keys to
values, with a prototype link, §6.9). Arrays and functions are objects.
Objects are always handled by reference.

- `undefined`: value of a declared-but-unassigned binding, a missing
  property, a missing argument, or a function that returns nothing.
- `null`: explicit "no object"; DOM lookups return it when nothing matches.

**Truthiness.** Conditions (`if`, `&&`, `||`, `!`, `?:`) convert their
operand to boolean. The **falsy** values are `false`, `0`, `-0`, `0n`,
`""`, `null`, `undefined`, `NaN`; every other value, including every
object and `"0"`, is **truthy**.

**Equality.** `===` compares without type conversion: primitives by value,
objects by identity. `==` performs conversions and is not used.

### 6.3 Bindings

| Form | Scope | Reassignable | Notes |
|---|---|---|---|
| `const x = v` | block (`{ … }`) | no | Only the binding is constant; a referenced object stays mutable (`const cart = {}; cart.a = 1` is legal). |
| `let x = v` | block | yes | Reading before the declaration executes throws (`ReferenceError`, the "temporal dead zone"). |
| `var x` | function | yes | Not used in `src/`. |

### 6.4 Operators with non-obvious semantics

| Expression | Result |
|---|---|
| `a && b` | `a` if `a` is falsy, else `b`. `b` is evaluated only if needed. |
| `a \|\| b` | `a` if `a` is truthy, else `b`. Treats `""` and `0` as missing: `valueOf("phone") \|\| "(sin especificar)"`. |
| `a ?? b` | `a` unless `a` is `null` or `undefined`, else `b`. Keeps `""` and `0`. |
| `a?.b`, `a?.m()`, `f?.()` | **Optional chaining**: if `a` (or `f`) is `null`/`undefined`, the whole chain evaluates to `undefined` without evaluating the rest; otherwise normal access/call. |
| `c ? x : y` | Conditional: `x` if `c` is truthy, else `y`. |
| `` `text ${e}` `` | **Template literal**: string with each `${e}` replaced by `String(e)`. |
| `"k" in obj` | `true` if `obj` or its prototype chain has property `k`. Used for feature detection: `"IntersectionObserver" in window`. |
| `void e` | Evaluates `e`, yields `undefined`. `void badge.offsetWidth` forces a synchronous layout so a CSS animation restarts. |
| `delete obj[k]` | Removes property `k` from `obj`. |
| `[a, b] = pair` / `({ x } = obj)` | **Destructuring**: binds elements/properties to names. Used in callbacks: `([slug, qty]) => …`. |

### 6.5 Functions and closures

Functions are first-class values. The code uses **arrow functions**:

```ts
const setError = (name: string, message: string): void => { … };
const money = (n: number): string => `$${n.toFixed(2)}`;   // expression body = implicit return
```

Differences from `function` declarations: arrow functions have no own
`this` (they use the enclosing one), no `arguments` object, and cannot be
called with `new`.

A **closure** is a function together with the variable bindings of the
scopes in which it was created. Captured variables are shared by
reference, not copied: a handler created inside the IIFE reads the current
value of `form` whenever it runs, long after the IIFE returned. Captured
bindings live as long as any closure referencing them is reachable; memory
is reclaimed by the garbage collector.

Default parameters: `(slug: string, qty = 1)`: `qty` is `1` when the
argument is omitted or `undefined`.

### 6.6 Arrays and objects

- `[a, b]` creates an `Array`. Methods used, all taking a callback invoked
  per element: `forEach` (side effects, returns `undefined`), `map`
  (new array of results), `filter` (new array of elements whose callback
  returned truthy), `find` (first matching element or `undefined`), `some`
  (`true` if any matches), `reduce((acc, x) => …, init)` (left fold),
  `flatMap`, `includes`, `join(sep)` (concatenate to one string), `sort`.
- `{ key: value }` creates a plain object. `Object.entries(o)` returns
  `[key, value]` pairs of its own enumerable properties.
- `new Map()` / `new Set(iterable)`: hash map / set with `get`, `set`,
  `has`. `[...set]` and `Array.from(iterable)` convert an iterable to an
  array.
- `JSON.stringify(v)` / `JSON.parse(s)`: serialize to / parse from JSON
  text. `JSON.parse` throws `SyntaxError` on malformed input.

### 6.7 Exceptions

`throw` raises any value; `try { … } catch (e) { … }` handles it;
`catch { … }` (without a binding) ignores it. With
`useUnknownInCatchVariables`, `e` has type `unknown` (§6.8).

### 6.8 The TypeScript type system

Types exist only during checking (§3.3). The checker never inserts runtime
checks.

| Syntax | Meaning |
|---|---|
| `x: string`, `(): void` | Annotation of a binding, parameter or return type. `void` = returns nothing usable. |
| `string \| null` | **Union**: a value of any member type. |
| `"taller" \| "general"` | **Literal type**: only those exact values are assignable. |
| `interface Dish { name: string; tags?: string[] }` | Object type. `?:` = optional property; reading it yields `string[] \| undefined`. |
| `Dish[]` | Array whose elements are `Dish`. |
| `Record<string, number>` | Object type with string keys and `number` values (a generic *utility type*). |
| `(() => void) \| undefined` | Function type taking no arguments and returning nothing, or `undefined`. |
| `<T>` on a function or call | **Generic** type parameter. `querySelector<HTMLFormElement>("#f")` selects a declared overload whose return type is `HTMLFormElement \| null`. The argument is not verified against the selector. |
| `x as T` | **Type assertion**: the checker treats `x` as `T`. No runtime effect and no runtime check; a wrong assertion becomes a runtime error later. |
| `unknown` | A type that must be narrowed before use. `any` (not used intentionally) disables checking. |

**Structural typing.** Compatibility is decided by shape: any object with
the required properties of the required types is a `Dish`, whatever
created it. Interfaces have no runtime existence and cannot be tested with
`instanceof`.

**Narrowing.** Within a branch, the checker refines a union based on the
condition (control-flow analysis):

```ts
const form = document.querySelector<HTMLFormElement>("#contact-form"); // HTMLFormElement | null
if (!form) return;          // null is falsy → after this line form: HTMLFormElement
const field = form.elements.namedItem("email");   // RadioNodeList | Element | null
if (field instanceof HTMLInputElement) field.value; // field: HTMLInputElement here
```

Narrowing conditions used: truthiness, `=== null`/`!== ""`,
`typeof x === "object"`, and `instanceof` (§6.9).

### 6.9 Prototypes and `instanceof`

Every object has an internal link to another object, its **prototype**;
property lookup that misses on an object continues along this chain.
Constructors such as `HTMLInputElement` have a `prototype` property;
`x instanceof C` is `true` iff `C.prototype` appears in the prototype chain
of `x`. Unlike `as`, this is a real runtime test, which is why the form
helpers use it to discriminate element kinds.

### 6.10 Regular expressions

`/…/` literals create `RegExp` objects; `re.test(s)` returns whether `s`
contains a match. `^` and `$` anchor to the start and end, `[^\s@]` is any
character except whitespace and `@`, `+` = one or more, `{2,}` = two or
more, `{6,}` = six or more.

- `EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`: local part, `@`,
  domain, `.`, top-level label of ≥ 2 characters. A syntactic plausibility
  check only.
- `PHONE_PATTERN = /^[+()0-9][0-9()\-\s]{6,}$/`: first character `+`,
  `(`, `)` or a digit, followed by ≥ 6 digits, parentheses, hyphens or
  whitespace.

## 7. Browser APIs used by the code

### 7.1 Element lookup

- `document.querySelector(sel)` / `el.querySelector(sel)`: first
  descendant matching the CSS selector `sel`, or `null`.
- `querySelectorAll(sel)`: a static `NodeList` of all matches (a snapshot,
  not updated afterwards; iterable, has `forEach`, not an `Array`).
- `el.closest(sel)`: nearest inclusive ancestor matching `sel`, or `null`.
- `form.elements.namedItem(name)`: the form control(s) with that `name`:
  an `Element`, a `RadioNodeList` (several controls share the name), or
  `null`.

Selector syntax used: `#id`, `.class`, `[attr]`, `[attr="value"]`, tag
names, combinations (`#dish-modal img` = `img` descendant of
`#dish-modal`), and `:not(.visible)`.

### 7.2 Events

`target.addEventListener(type, handler)` registers `handler`; when an event
of `type` is **dispatched** to `target` or to a descendant, the handler is
called with an `Event` object. Most events **bubble**: dispatched at the
innermost element, then delivered to each ancestor in turn. A single
listener on a `<form>` therefore observes `input` events from all its
controls (**event delegation**); `event.target` is the element where the
event originated.

| Type | Dispatched when |
|---|---|
| `click` | Primary activation (mouse click, tap, Enter/Space on a focused button). |
| `input` | The value of an `<input>`/`<textarea>` changes, on every edit. |
| `change` | A control commits a new value (e.g. a `<select>` choice). |
| `submit` | A form is submitted. |
| `pointerenter` / `pointerleave` | A pointer (mouse, pen, touch) enters / leaves the element. Do not bubble. |
| `scroll` | The document scrolls. |

`event.preventDefault()` cancels the event's **default action** (the
browser's built-in behavior: following a link, submitting a form, which
navigates and reloads the page). Propagation to other listeners continues.

### 7.3 Element state

- `el.textContent = s`: replaces all children with one text node. `s` is
  never parsed as HTML.
- `el.innerHTML = s`: parses `s` as HTML and replaces the children with
  the result. Interpolating an untrusted string into `s` permits HTML/script
  injection (XSS); untrusted text must be assigned with `textContent` or
  escaped (`tutorias-pages.ts` defines `esc()` for this).
- `el.classList` (a `DOMTokenList`): `add`, `remove`, `contains`,
  `toggle(name)` (flip; returns the new presence) and `toggle(name, force)`
  (add if `force` is `true`, remove if `false`). Classes are the interface
  between scripts and CSS: scripts set classes such as `open`, `active`,
  `hidden`, `visible`, `invalid`; `css/*.css` defines their appearance.
- `el.hidden = bool`: reflects the `hidden` attribute; hidden elements are
  not rendered.
- `el.setAttribute(k, v)` / `getAttribute(k)` (`string | null`).
- `el.dataset`: a `DOMStringMap` exposing `data-*` attributes:
  `data-error-for` ↔ `dataset.errorFor`. Values are always strings; a
  missing attribute reads as `undefined`.
- `a.href = url`: sets a link's destination.
- `el.scrollIntoView({ behavior: "smooth", block: "center" })`: scrolls
  the nearest scroll container so `el` is vertically centered.
- `document.createElement(tag)` creates a detached element; `append`
  inserts it.

**ARIA** (Accessible Rich Internet Applications) attributes such as
`aria-expanded` and `aria-pressed` describe widget state to assistive
technologies (screen readers). Scripts keep them in sync with the visual
state.

### 7.4 URL and navigation

- `window.location.pathname`: path of the current URL
  (`/servicios/pedido.html`). `location.search`: the query string
  including `?`.
- `new URLSearchParams(location.search).get(k)`: the first value of
  parameter `k`, percent-decoded (`+` decodes to a space), or `null`.

Query parameters accepted by the site:

| Page | Parameter | Effect |
|---|---|---|
| `contact.html` | `plan=basic\|complete\|custom` | Preselects the plan `<select>`. |
| `servicios/pedido.html` | `servicio=<slug>` | Preselects the product `<select>`. |
| `servicios/pedido.html` | `diseno=<name>` | Pre-fills the message with a poster request. |
| `examples/tutorias-tutor.html` | `t=<slug>` | Selects the tutor profile from `NEXUM_TUTORS`. |

Assigning a value that matches no `<option>` to `select.value` leaves no
option selected; validation then reports the field as empty.

### 7.5 `encodeURIComponent`

Converts a string to UTF-8 and percent-encodes every byte except
`A–Z a–z 0–9 - _ . ! ~ * ' ( )`. Applied to every value placed inside a
URL so that spaces, `&`, `=`, `?`, `#` and newlines do not alter the URL's
structure.

### 7.6 Media queries

`window.matchMedia("(max-width: 820px)")` returns a `MediaQueryList`;
`.matches` is `true` while the viewport is at most 820 CSS pixels wide.
Must agree with the corresponding `@media` rule in `css/main.css`.

### 7.7 `IntersectionObserver`

`new IntersectionObserver(callback, { threshold: 0.12 })` asynchronously
calls `callback(entries)` whenever an observed element's visible fraction
crosses 12 %. `entry.isIntersecting` reports visibility;
`observe(el)` / `unobserve(el)` start and stop observation. Used for
reveal-on-scroll, which avoids running code on every `scroll` event.

### 7.8 Web Storage

`localStorage` and `sessionStorage` are synchronous string-to-string maps
scoped to the **origin** (scheme + host + port). `localStorage` persists
across sessions; `sessionStorage` lasts for one tab. `getItem` returns
`string | null`; `setItem` may throw (`SecurityError` when storage is
disabled, `QuotaExceededError` when full). The demos wrap every access in
`try`/`catch` and fall back to an in-memory map, so blocked storage
degrades to non-persistent state instead of aborting the script. Objects
are stored as JSON text.

| Key | Owner | Content |
|---|---|---|
| `lmd-cart`, `lmd-favs` | `bakery.ts` | Cart (`{ slug: qty }`), favorites (`slug[]`) |
| `byteshop-cart`, `byteshop-favs` | `techstore.ts` | Same structure |
| `nexum-theme` | `tutorias*.ts` | `"light"` or `"dark"` |

### 7.9 Outbound URIs

- `mailto:a@x,b@y?subject=…&body=…` (RFC 6068): opens the default email
  client with the recipients, subject and body pre-filled. Multiple
  recipients are comma-separated.
- `https://wa.me/<digits>?text=…`: opens WhatsApp with a chat to the
  number (international format, digits only: `18298591920`) and the text
  pre-filled.

Nothing is sent until the visitor confirms in that application.

### 7.10 Other

- `new Date().getFullYear()`: current year in local time.
- `performance.now()`: high-resolution milliseconds since page start;
  with `requestAnimationFrame(cb)` (calls `cb` before the next repaint)
  drives frame-based animations.
- `String(x)`: conversion to string; `parseFloat`, `parseInt(s, 10)`:
  string to number.

## 8. Module reference

### 8.1 `common.ts` (all studio pages)

Executed once per page load. All steps are no-ops when their elements are
absent.

1. **Mobile navigation.** `click` on `.nav-toggle` toggles class `open` on
   `.nav-links` and mirrors the state into `aria-expanded`.
2. **Services dropdown.** On wide viewports CSS opens `.has-dropdown` on
   `:hover`/`:focus-within`; `pointerenter`/`pointerleave` keep
   `aria-expanded` in sync. On narrow viewports (`matchMedia`, 820 px) the
   first `click` on `.nav-drop` calls `preventDefault()` and adds `open`;
   a second click navigates.
3. **Active route.** Splits `location.pathname` on `/`, removes empty
   segments, and derives a route: `servicios` if any segment is
   `servicios`, else `plantillas` for `templates.html`, `contacto` for
   `contact.html`, otherwise `inicio`. Adds class `active` to every
   `[data-route]` link whose `data-route` equals it. Works under a path
   prefix and on `file://`. `404.html` omits `data-route` on its links, so
   nothing is highlighted there.
4. **Footer year.** Writes the current year into every `[data-year]`.
5. **Reveal on scroll.** Adds `visible` to each `.reveal` element the first
   time 12 % of it is visible, then stops observing it. Without
   `IntersectionObserver` support all elements receive `visible`
   immediately.

### 8.2 `gallery.ts` (`templates.html`)

Buttons `.filter-btn[data-filter]`, cards `.template-card[data-category]`.
On `click`: the clicked button gets `active` and `aria-pressed="true"`,
the others lose them; each card gets `hidden` unless the filter is `all`
or equals its `data-category`. New categories require only matching
attribute values in HTML.

### 8.3 `contact.ts` (`contact.html`) and `pedido.ts` (`servicios/pedido.html`)

Same structure; both operate on `#contact-form`.

Helpers (closures over `form`):

| Function | Contract |
|---|---|
| `valueOf(name): string` | Trimmed `value` of the `<input>`, `<textarea>` or `<select>` named `name`; `""` if absent or of another kind. |
| `labelOf(name): string` | For a `<select>`: trimmed visible text of the selected option, `""` if the selected option has value `""` (placeholder). Otherwise `valueOf(name)`. |
| `setError(name, message): void` | Writes `message` into `[data-error-for="<name>"]` and toggles class `invalid` on `[name="<name>"]`; `""` clears both. |
| `validate(): boolean` | Applies the rules below, sets or clears every field's error, returns `true` iff all pass. All rules are evaluated (no short-circuit), so all errors are shown at once. |

Validation rules (lengths in UTF-16 code units after trimming):

| Field | `contact.ts` | `pedido.ts` |
|---|---|---|
| `name` | length ≥ 2 | same |
| `email` | matches `EMAIL_PATTERN` | same |
| `phone` | empty, or matches `PHONE_PATTERN` | same |
| `project-type` / `product` | not `""` | not `""` |
| `message` | length ≥ 10 | same |

Lifecycle:

1. **Initialization.** `contact.ts` applies `?plan=` and shows
   `#budget-field` only while `project-type` is `custom` (re-evaluated on
   `change`). `pedido.ts` applies `?servicio=`; if `?diseno=` is present it
   pre-fills `message` with
   `Quiero el poster "<diseno>" del catálogo (18 × 24 pulgadas, RD$250).`
   and clears it on a later product `change` **only if** the text is still
   exactly that pre-filled string.
2. **`input` (delegated).** Clears the error of the field being edited.
3. **`submit`.** `preventDefault()`; if `validate()` fails, stop. Otherwise
   build `subject` and `bodyLines` (one line per field; empty optional
   fields become `(sin especificar)`), set `#mailto-link` to the `mailto:`
   URI addressed to `10093374@ipl.edu.do,10041045@ipl.edu.do` and
   `#whatsapp-link` to the `wa.me` URI, hide the form, show and scroll to
   `#form-success`.
4. **`#form-reset` `click`.** `form.reset()` restores initial values, shows
   the form, hides `#form-success`.

Constants to change together: recipients (`recipient` in both files),
WhatsApp number (`whatsappNumber` in both files plus the visible numbers in
`contact.html` and `servicios/pedido.html`), poster price (the pre-fill
string in `pedido.ts` and the prices in `servicios/posters.html`).

### 8.4 `bakery.ts` and `techstore.ts` (demo stores)

One script per demo, shared by all of its pages. `<body data-page="…">`
selects the page-specific code path:

- bakery: `home`, `menu`, `nosotros`, `visitanos`, `pedido`
- techstore: `home`, `products`, `product`, `why`, `order`

Common structure: a static `PRODUCTS: Product[]` catalog; lookup
`product(slug): Product | undefined`; storage wrappers `getItem`/`setItem`
with in-memory fallback (§7.8); cart as `Record<slug, quantity>` and
favorites as `slug[]`; a cart drawer built with `createElement` and
`innerHTML` from catalog data; a counter badge; transient "toast"
notifications. The order page carries the cart contents into its order
form. Entries whose slug is
no longer in `PRODUCTS` are filtered out before rendering, which is what
justifies the `as Product` assertions that follow.

### 8.5 `restaurant.ts` (`examples/restaurant.html`)

Static `FEATURED: Dish[]` and `MENU: Category[]`; the menu HTML is
generated from these arrays (adding a dish = editing the data). Features:
category filter buttons combined with a case-insensitive text search
(`applyFilters`), an empty-state note, and an accessible dish modal that
records the previously focused element (`lastFocused`) and restores focus
on close.

### 8.6 `event.ts` (`examples/event.html`)

Top-level data: `COUNTDOWN` (fixed display values; the demo does not
compute a real countdown), `SCHEDULE: ScheduleItem[]` with `type` restricted
to the literal union `"conferencia" | "taller" | "networking" | "general"`,
and `FAQS`. Behavior: agenda filtering, horizontally scrolling speaker row
with arrow buttons, FAQ accordion, header state on `scroll`, mobile menu,
**scroll-spy** (highlights the navigation link of the section currently at
40 % of the viewport height), reveal on scroll.

### 8.7 `tutors-data.ts`, `tutorias.ts`, `tutorias-pages.ts` (Nexum Academy demo)

- `tutors-data.ts` declares the global `interface NxTutor` and
  `const NEXUM_TUTORS: NxTutor[]` (§5.3). `slug` is the stable key used in
  URLs; `subjects` must match the subject names in `tutorias.ts`.
- `tutorias.ts` (main page): theme toggle persisted in `nexum-theme`,
  mobile menu, scroll-spy, animated counters (`data-count`,
  `data-decimals`, driven by `requestAnimationFrame` over 1200 ms), a
  generic modal, subject grid, level recommendations, tutor cards, a price
  calculator (`PRICE_PER_MIN = 500 / 60`, i.e. RD$500 per 60 minutes) and
  simulated reservation/diagnostic forms. Nothing is transmitted.
- `tutorias-pages.ts`: theme, menu, year and reveal for the subpages; the
  tutor directory with a subject filter built from the union of all tutors'
  subjects; the profile page, which reads `?t=<slug>` and looks it up with
  `NEXUM_TUTORS.find`. Interpolated text is passed through `esc()`.

## 9. Glossary

| Term | Definition |
|---|---|
| Arrow function | `(params) => body`; function value without own `this`/`arguments` (§6.5). |
| Attribute | `key="value"` on an HTML element; read/written with `getAttribute`/`setAttribute` (§7.3). |
| Bubbling | Delivery of an event to the target's ancestors after the target (§7.2). |
| Classic script | A `<script>` that is not a module; shares the global scope (§5.3). |
| Closure | Function plus the bindings it captured by reference (§6.5). |
| CSS selector | Pattern matching elements: `#id`, `.class`, `[attr]` (§7.1). |
| `defer` | Execute the script after parsing completes, in order (§5.1). |
| DOM | Object representation of the document (§5.2). |
| Default action | Built-in browser behavior for an event; cancelled by `preventDefault()` (§7.2). |
| Downleveling | Rewriting newer syntax to the configured `target` (§3.3). |
| Falsy / truthy | Values that convert to `false` / `true` in conditions (§6.2). |
| IIFE | Function expression invoked immediately, used as a private scope (§5.3). |
| Literal type | A type containing exactly one value, e.g. `"taller"` (§6.8). |
| Narrowing | Type refinement inside a branch from a runtime check (§6.8). |
| Nullish | `null` or `undefined`; the trigger for `??` and `?.` (§6.4). |
| Origin | Scheme + host + port; scope of Web Storage (§7.8). |
| Prototype chain | Delegation chain used for property lookup and `instanceof` (§6.9). |
| Source map | File mapping emitted JavaScript positions to TypeScript positions (§3.3). |
| Structural typing | Type compatibility by shape, not by declared name (§6.8). |
| Task / event loop | Unit of work run to completion on the single page thread (§5.4). |
| Type assertion | `x as T`; unchecked override of the inferred type (§6.8). |
| Type erasure | Removal of all type syntax during emit (§3.3). |
| Union type | `A \| B`; a value of either type (§6.8). |
