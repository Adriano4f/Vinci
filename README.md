# Vinci — websites for student businesses

This is the website for **Vinci**, our school entrepreneurship project: a
student-run web studio that builds websites for other student businesses.

The site has three main pages plus a folder of demo templates:

| Page | File | What it is |
|------|------|-----------|
| Home | `index.html` | Who we are, why teams should buy from us, what we offer |
| Templates | `templates.html` | Gallery of template designs clients can pick from |
| Contact | `contact.html` | Form clients use to tell us about their project |
| Demos | `examples/` | Three sample sites (bakery, tech store, portfolio) that show what a finished client site can look like |

---

## How the project is organized

```
Vinci/
├── index.html          # Home page
├── templates.html      # Template gallery (with category filter)
├── contact.html        # Contact page with a validated form
├── examples/           # Self-contained demo sites clients can preview
│   ├── bakery.html
│   ├── techstore.html
│   └── portfolio.html
├── css/
│   ├── main.css        # All styling for the three main pages
│   └── examples.css    # Styling shared by the demo pages
├── src/                # TypeScript SOURCE code — this is what we edit
│   ├── common.ts       # Navbar (mobile menu, active link), footer year
│   ├── gallery.ts      # Category filter on templates.html
│   └── contact.ts      # Validation for the contact form
├── js/                 # Compiled JavaScript — GENERATED, do not edit by hand
├── tsconfig.json       # Compiler settings for TypeScript
├── package.json        # Project metadata + shortcut commands
└── .gitignore          # Tells git to ignore node_modules/
```

## The mental model (for C++ programmers)

If you know C++, the web stack maps roughly like this:

| Web | C++ equivalent |
|-----|----------------|
| **HTML** (`.html`) | The *structure* of the page — like declaring the widgets/layout of a program. Text, headings, buttons, forms. No logic. |
| **CSS** (`.css`) | The *appearance* — colors, fonts, sizes, spacing, layout. Purely cosmetic. |
| **TypeScript** (`.ts`) | The *logic* — like your `.cpp` files. Browsers cannot run TypeScript directly. |
| **JavaScript** (`.js` in `js/`) | The *compiled output* — like the binary `g++` produces. `tsc` turns each `.ts` file into a `.js` file the browser can run. |
| `tsc` (TypeScript compiler) | `g++` / `clang++` |
| `tsconfig.json` | Compiler flags, like a Makefile's `CXXFLAGS` |
| `package.json` | A bit like a Makefile + project manifest: lists dependencies and defines `npm run …` shortcuts |
| `npm` | Package manager — like vcpkg/conan, installs libraries (`typescript` is our only dependency) |

Each HTML page loads the scripts it needs at the bottom, e.g.
`<script src="js/common.js" defer></script>`.

## First-time setup

You need **Node.js** (it includes `npm`). Install it from
<https://nodejs.org> (choose the LTS version), then in this folder run:

```bash
npm install
```

That downloads the TypeScript compiler into `node_modules/`. You only need to
do this once (and again only if `package.json` changes).

## Everyday workflow

```bash
# 1. Edit files in src/ (TypeScript) or the .html / .css files.

# 2. Compile TypeScript -> JavaScript
npm run build        # same as running: npx tsc

#    …or keep the compiler running so it rebuilds on every save:
npm run watch

# 3. Look at the site
npm run serve        # then open http://localhost:3000
#    or without npm:
python3 -m http.server 8000    # then open http://localhost:8000
```

> **Why a server?** Opening `index.html` directly by double-clicking works for
> most of the site, but using a local server is the reliable way — some
> browsers restrict pages opened from `file://`. The `serve`/`http.server`
> commands above are the recommended approach.

`js/` is committed to git on purpose: the site works even on machines where
nobody has run `tsc` (for example, GitHub Pages). Just remember — **edit the
`.ts` files in `src/`, never the `.js` files in `js/`**.

## Where to make common changes

| You want to… | Edit… |
|---|---|
| Change text, prices, sections | The `.html` file of that page |
| Change colors / fonts / spacing | `css/main.css` — all colors are CSS variables in the `:root` block at the top |
| Add a template card to the gallery | Copy a `<article class="card template-card">` block in `templates.html` and set its `data-category` |
| Change the email the contact form uses | `recipient` near the bottom of `src/contact.ts` |
| Change how validation works | `src/contact.ts` — each rule is a small `if` block |
| Add a new demo site | Create a file in `examples/` (copy an existing one) and add a card in `templates.html` |

## Notes

- There is **no backend**: the contact form validates input and then builds a
  `mailto:` link that opens the visitor's email app with the message filled
  in. For a real deployment we could add a form service later.
- The TypeScript config uses `strict` mode — if `npm run build` complains,
  the error message tells you the file and line, just like `g++` errors.
