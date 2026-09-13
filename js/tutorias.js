"use strict";
/*
 * tutorias.ts — all interactive behavior for the NEXUM ACADEMY demo page
 * (examples/tutorias.html). Compiled to js/tutorias.js.
 *
 * The page is a fictional demo: there is no backend, so reservations,
 * contact messages and diagnostics are simulated in the browser only.
 *
 * ---------------------------------------------------------------------------
 * READING GUIDE (for someone coming from C++)
 *
 * TypeScript is JavaScript plus a static type system that exists ONLY at
 * compile time. `tsc` checks the types, erases every annotation, and emits
 * plain JavaScript — the emitted js/tutorias.js contains zero type info and
 * runs identically in any browser. Nothing in the type system has a runtime
 * cost or a runtime existence.
 *
 *   - `interface X { ... }`   — structural type declaration. Erased at
 *                               compile. Objects match by shape, not by name.
 *   - `x as T`                — type assertion. Zero runtime effect; it only
 *                               silences/overrides the checker.
 *   - `fn<T>(...)`            — a generic. The type argument is compile-time
 *                               only; the emitted code is the plain call.
 *   - `a ?? b`                — nullish coalescing: yields b iff a is null or
 *                               undefined. Unlike ||, keeps 0/""/false.
 *   - `a?.b`                  — optional chaining: evaluates to undefined if a
 *                               is null/undefined instead of throwing.
 *   - `const f = (x) => ...`  — arrow function: a function VALUE assigned to a
 *                               const. Unlike `function`, it has no own `this`
 *                               (this is captured from the enclosing scope).
 *   - `el.addEventListener("click", f)` — registers f; the browser's event
 *                               loop calls it later when a click is
 *                               dispatched. Nothing runs at registration time.
 *   - DOM queries return `| null` because the element may not exist; under
 *                               `strict` TS forces you to handle the null case
 *                               before dereferencing.
 * ---------------------------------------------------------------------------
 */
// An Immediately Invoked Function Expression: the outer parens turn the arrow
// function into an expression and the trailing () calls it. Classic scripts
// share one global scope, so this wrapper keeps every variable below private
// to this file — no name leaks into (or collides with) window.
(() => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    // --- Safe storage ----------------------------------------------------------
    // localStorage can throw a SecurityError (storage disabled, private mode,
    // sandboxed iframe). The try/catch pairs below fall back to an in-memory
    // Map so the page keeps working for the session.
    //
    // `new Map<string, string>()` — generic built-in: an ordered key→value
    // collection; the <string, string> is a compile-time constraint only.
    const memStore = new Map();
    // Object literal with two method shorthand properties (equivalent to
    // writing `get: function(k) {...}` but with no own `this`).
    const store = {
        get: (k) => {
            var _a;
            // `: string` on the parameter is an erased annotation.
            try {
                // window.localStorage.getItem returns `string | null`
                // (null when the key is absent).
                return window.localStorage.getItem(k);
            }
            catch (_b) {
                // `memStore.get(k)` is `string | undefined`; `?? null` converts
                // the undefined case to null so the return type is `string | null`.
                return (_a = memStore.get(k)) !== null && _a !== void 0 ? _a : null;
            }
        },
        set: (k, v) => {
            try {
                window.localStorage.setItem(k, v);
            }
            catch (_a) {
                memStore.set(k, v);
            }
        },
    };
    // `$` is a tiny alias for document.querySelector.
    // `<T extends HTMLElement>` is a generic parameter constrained to subtypes
    // of HTMLElement; `(sel: string): T | null` is the signature. The arrow body
    // is the single expression returned. At runtime this is just
    // `sel => document.querySelector(sel)` — generics and annotations erased.
    const $ = (sel) => document.querySelector(sel);
    // --- 1. Theme toggle ---------------------------------------------------------
    const themeBtn = $("#nx-theme");
    // `(dark: boolean) => { ... }` — arrow function parameter with a
    // compile-time type. The body uses `document.documentElement` (the <html>
    // element) and `dataset`, a DOMStringMap that reflects `data-*` attributes:
    // `dataset.theme = "dark"` writes the attribute `data-theme="dark"`; ""
    // removes visual effect because the CSS only keys on [data-theme="dark"].
    const applyTheme = (dark) => {
        document.documentElement.dataset.theme = dark ? "dark" : "";
        // `dark ? "☀️" : "🌙"` — ternary expression, same semantics as C++'s ?:.
        // `themeBtn.textContent` — DOM property; assigning a string replaces all
        // child text nodes of the button.
        if (themeBtn)
            themeBtn.textContent = dark ? "☀️" : "🌙";
    };
    // store.get returns string | null; the `=== "dark"` comparison converts it
    // to boolean, then applyTheme applies the persisted choice on page load.
    applyTheme(store.get("nexum-theme") === "dark");
    // `themeBtn?.addEventListener` — optional call: registers the listener only
    // if themeBtn is not null; if null the whole expression evaluates to
    // undefined. The arrow closure captures `store` and `themeBtn` BY REFERENCE
    // to their bindings (a closure keeps the lexical environment alive).
    themeBtn === null || themeBtn === void 0 ? void 0 : themeBtn.addEventListener("click", () => {
        const dark = document.documentElement.dataset.theme !== "dark";
        applyTheme(dark);
        store.set("nexum-theme", dark ? "dark" : "light");
    });
    // --- 2. Mobile menu + scroll-spy ---------------------------------------------
    const toggle = $("#nx-toggle");
    const links = $("#nx-links");
    toggle === null || toggle === void 0 ? void 0 : toggle.addEventListener("click", () => {
        var _a;
        // classList is a DOMTokenList live view of the class attribute.
        // .toggle("open") adds it if absent / removes it if present and RETURNS
        // the resulting state as a boolean (per the DOM spec).
        // `?.` on links: if links is null the expression is undefined; `?? false`
        // supplies the default so `open` is always boolean.
        const open = (_a = links === null || links === void 0 ? void 0 : links.classList.toggle("open")) !== null && _a !== void 0 ? _a : false;
        // String(open) — global String() performs ToString coercion → "true"|"false".
        toggle.setAttribute("aria-expanded", String(open));
    });
    // `links?.addEventListener("click", (e) => ...)` — `e` is inferred as the
    // Event object the browser passes to listeners. `e.target` is the innermost
    // element the click hit (EventTarget | null; may be null or a non-Element,
    // hence the `as HTMLElement` assertion below).
    links === null || links === void 0 ? void 0 : links.addEventListener("click", (e) => {
        if (e.target.tagName === "A")
            links.classList.remove("open");
    });
    // Scroll-spy: on every scroll event, find the last section whose top edge
    // has scrolled past a 120px line under the navbar and mark its link active.
    const spyIds = ["inicio", "materias", "tutores", "precios", "recursos", "faq"];
    const spyLinks = document.querySelectorAll("[data-nx]");
    const spy = () => {
        let current = "inicio";
        // for...of iterates the array's values (like C++11 range-for).
        for (const id of spyIds) {
            // getElementById returns HTMLElement | null.
            const el = document.getElementById(id);
            // getBoundingClientRect().top is the element's distance in px below the
            // top of the viewport; <= 120 means "its start passed the navbar".
            if (el && el.getBoundingClientRect().top <= 120)
                current = id;
        }
        // spyLinks is a NodeList; .forEach iterates it. `a.dataset.nx` reads the
        // data-nx attribute (string | undefined).
        spyLinks.forEach((a) => a.classList.toggle("nx-active", a.dataset.nx === current)
        // classList.toggle(name, force): adds when force is true, removes when
        // false — a two-state setter in one call.
        );
    };
    // `{ passive: true }` tells the browser the listener will never call
    // preventDefault(), letting it scroll without waiting for our callback.
    window.addEventListener("scroll", spy, { passive: true });
    spy();
    // --- 3. Animated counters -----------------------------------------------------
    // Elements with data-count animate from 0 to that value when revealed.
    const counters = document.querySelectorAll("[data-count]");
    const animateCount = (el) => {
        var _a, _b;
        // dataset.count is `string | undefined`; `?? "0"` gives a default.
        // parseFloat parses a leading numeric prefix, returning a JS number
        // (IEEE-754 double — JS has no int/float distinction).
        const target = parseFloat((_a = el.dataset.count) !== null && _a !== void 0 ? _a : "0");
        // parseInt's second argument is the radix; 10 = decimal.
        const decimals = parseInt((_b = el.dataset.decimals) !== null && _b !== void 0 ? _b : "0", 10);
        // performance.now(): high-resolution monotonic timestamp in ms (never
        // goes backwards, unlike Date which follows the wall clock).
        const t0 = performance.now();
        const dur = 1200;
        const step = (t) => {
            // p is progress 0..1; Math.min clamps the upper bound.
            const p = Math.min(1, (t - t0) / dur);
            // toFixed(n) returns a STRING with n decimals.
            // `+` here is string concatenation because the left operand is a string.
            el.textContent = (target * p).toFixed(decimals) + (p === 1 && target > 50 ? "+" : "");
            // requestAnimationFrame schedules `step` before the next repaint with a
            // new timestamp — a frame-synced animation loop driven by the browser,
            // not a busy loop.
            if (p < 1)
                requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };
    // --- 5. Modal helper ------------------------------------------------------------
    const modal = $("#nx-modal");
    const modalContent = $("#nx-modal-content");
    const openModal = (html) => {
        // innerHTML setter runs the HTML parser on the string and replaces all
        // children of the element with the parsed nodes.
        if (modalContent)
            modalContent.innerHTML = html;
        modal === null || modal === void 0 ? void 0 : modal.classList.add("open");
    };
    const closeModal = () => modal === null || modal === void 0 ? void 0 : modal.classList.remove("open");
    (_a = $("#nx-modal-close")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", closeModal);
    // Clicking the dimmed backdrop (the modal root itself) closes it; clicks on
    // children bubble up but have a different target, so they're ignored.
    modal === null || modal === void 0 ? void 0 : modal.addEventListener("click", (e) => {
        if (e.target === modal)
            closeModal();
    });
    // Escape key listener on the whole document.
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape")
            closeModal();
    });
    // Record<K, V> is a built-in mapped type: an object whose keys are K and
    // values V — the type-level version of a string-keyed dictionary.
    const ICONS = {
        sum: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 4H6l7 8-7 8h12"/></svg>',
        deriv: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18c4-10 8-14 9-14s5 4 9 14"/></svg>',
        physics: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/></svg>',
        geo: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></svg>',
        trig: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20L21 4v16z"/></svg>',
        alg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4h10M7 20h10M17 4L7 20"/></svg>',
    };
    // `Subject[]` — array whose elements must match the Subject shape.
    const SUBJECTS = [
        { name: "Matemáticas", desc: "Álgebra, ecuaciones, funciones, polinomios y problemas matemáticos.", level: "Todos los niveles", icon: "sum",
            topics: ["Operaciones con polinomios", "Ecuaciones de primer y segundo grado", "Funciones y sus gráficas", "Problemas verbales", "Factorización", "Fracciones y porcentajes"] },
        { name: "Cálculo", desc: "Límites, derivadas, integrales, funciones y aplicaciones.", level: "Bachillerato / Universidad", icon: "deriv",
            topics: ["Límites y continuidad", "Reglas de derivación", "Aplicaciones de la derivada", "Integrales definidas e indefinidas", "Áreas bajo la curva", "Optimización"] },
        { name: "Física", desc: "Cinemática, dinámica, energía, electricidad y fundamentos físicos.", level: "Bachillerato / Universidad", icon: "physics",
            topics: ["Movimiento rectilíneo y proyectiles", "Leyes de Newton", "Trabajo y energía", "Circuitos eléctricos básicos", "Ondas y sonido"] },
        { name: "Geometría", desc: "Ángulos, triángulos, circunferencias, áreas y volúmenes.", level: "Secundaria / Bachillerato", icon: "geo",
            topics: ["Ángulos y rectas", "Triángulos y congruencia", "Circunferencia y círculo", "Áreas y perímetros", "Volúmenes de sólidos", "Geometría analítica"] },
        { name: "Trigonometría", desc: "Seno, coseno, tangente, identidades y resolución de triángulos.", level: "Bachillerato / Universidad", icon: "trig",
            topics: ["Razones trigonométricas", "Círculo unitario", "Identidades fundamentales", "Ley de senos y cosenos", "Ecuaciones trigonométricas", "Gráficas de seno y coseno"] },
        { name: "Álgebra", desc: "Ecuaciones, sistemas, factorización, matrices y expresiones algebraicas.", level: "Todos los niveles", icon: "alg",
            topics: ["Expresiones algebraicas", "Sistemas de ecuaciones", "Factorización", "Desigualdades", "Matrices y determinantes", "Funciones cuadráticas"] },
    ];
    const TUTORS = [
        { name: "James Carter", spec: "Matemáticas y Álgebra", years: 5, level: "Secundaria y Bachillerato", rating: 4.9, students: 45, img: "../img/tutorias/nexum-tutor-james.jpg",
            bio: "Ingeniero con pasión por hacer las matemáticas simples. Lleva 5 años ayudando a estudiantes que 'odiaban los números' a aprobar con buenas notas.",
            subjects: ["Matemáticas", "Álgebra"], hours: "Lun–Vie · 2:00–8:00 PM" },
        { name: "Elena Sokolova", spec: "Cálculo y Trigonometría", years: 4, level: "Bachillerato y Universidad", rating: 4.8, students: 38, img: "../img/tutorias/nexum-tutor-elena.jpg",
            bio: "Licenciada en Matemáticas. Especialista en derivadas, integrales y en explicar el 'por qué' detrás de cada fórmula.",
            subjects: ["Cálculo", "Trigonometría"], hours: "Lun–Sáb · 8:00 AM–4:00 PM" },
        { name: "Kenji Tanaka", spec: "Física", years: 6, level: "Bachillerato y Universidad", rating: 4.9, students: 52, img: "../img/tutorias/nexum-tutor-kenji.jpg",
            bio: "Físico con 6 años de experiencia docente. Convierte problemas de cinemática y electricidad en algo que por fin tiene sentido.",
            subjects: ["Física", "Matemáticas"], hours: "Lun–Vie · 4:00–8:00 PM" },
        { name: "Lena Fischer", spec: "Matemáticas universitarias", years: 3, level: "Universidad", rating: 4.7, students: 29, img: "../img/tutorias/nexum-tutor-lena.jpg",
            bio: "Estudiante avanzada de matemáticas puras y tutora certificada. Enfocada en cálculo, álgebra lineal y preparación de exámenes.",
            subjects: ["Cálculo", "Álgebra", "Geometría"], hours: "Mié–Dom · 10:00 AM–6:00 PM" },
    ];
    // --- 7. Subjects grid + topics modal -------------------------------------------
    const subjectGrid = $("#nx-subjects");
    if (subjectGrid) {
        // Array.prototype.map runs the callback on every element and returns a new
        // array of results; .join("") concatenates them into one string. The
        // callback `(s, i) => ...` receives the element and its index.
        //
        // The backtick `...` string is a TEMPLATE LITERAL: it may span lines and
        // `${expr}` embeds the expression's ToString result into the string.
        subjectGrid.innerHTML = SUBJECTS.map((s, i) => `
      <div class="nx-card nx-subject nx-reveal">
        <div class="nx-icon">${ICONS[s.icon]}</div>
        <h3>${s.name}</h3>
        <p>${s.desc}</p>
        <span class="level">${s.level}</span>
        <button class="nx-btn nx-btn-ghost nx-btn-sm" data-subject="${i}">Ver temas</button>
      </div>`).join("");
        // Event delegation: ONE listener on the grid handles every card button.
        // Clicks BUBBLE from the target up through ancestors; e.target is the
        // deepest element hit, and .closest("[data-subject]") walks upward to the
        // nearest matching ancestor (returns null if none — e.g. a click on a gap).
        subjectGrid.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-subject]");
            if (!btn)
                return;
            // dataset.subject is the string in data-subject; Number() coerces
            // "3" → 3. Arrays are indexed with it.
            const s = SUBJECTS[Number(btn.dataset.subject)];
            openModal(`
        <h3>${s.name}</h3>
        <p class="sub">${s.desc} · ${s.level}</p>
        <ul class="topics">${s.topics.map((t) => `<li>${t}</li>`).join("")}</ul>
        <a class="nx-btn nx-btn-primary nx-btn-sm" href="#reserva" style="margin-top:20px" onclick="document.getElementById('nx-modal').classList.remove('open')">Reservar tutoría</a>
      `);
        });
    }
    // --- 8. Levels -------------------------------------------------------------------
    // Nested object literal type: each level key maps to { text, chips[] }.
    const LEVEL_REC = {
        secundaria: { text: "Para secundaria recomendamos reforzar:", chips: ["Matemáticas", "Álgebra", "Geometría"] },
        bachillerato: { text: "Para bachillerato recomendamos:", chips: ["Álgebra", "Trigonometría", "Física", "Geometría"] },
        universidad: { text: "Para universidad recomendamos:", chips: ["Cálculo", "Álgebra", "Física", "Trigonometría"] },
        examen: { text: "Para preparar exámenes recomendamos:", chips: ["Cálculo", "Álgebra", "Matemáticas", "Física"] },
    };
    const levelOut = $("#nx-level-out");
    (_b = $("#nx-levels")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", (e) => {
        var _a;
        const btn = e.target.closest("[data-level]");
        if (!btn)
            return;
        // querySelectorAll without a type arg returns NodeListOf<Element>;
        // classList is available on every Element so no generic is needed.
        document.querySelectorAll(".nx-level-btn").forEach((b) => b.classList.remove("sel"));
        btn.classList.add("sel");
        const rec = LEVEL_REC[(_a = btn.dataset.level) !== null && _a !== void 0 ? _a : ""];
        if (rec && levelOut) {
            levelOut.innerHTML = `<p>${rec.text}</p><div class="chips">${rec.chips.map((c) => `<span class="chip">${c}</span>`).join("")}</div>`;
        }
    });
    // --- 9. Tutors -------------------------------------------------------------------
    const tutorGrid = $("#nx-tutors");
    // String.prototype.repeat(n) returns the string repeated n times.
    // "★".repeat(4) + "☆".repeat(1) → "★★★★☆".
    const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
    if (tutorGrid) {
        tutorGrid.innerHTML = TUTORS.map((t, i) => `
      <div class="nx-card nx-tutor nx-reveal">
        <img src="${t.img}" alt="Foto de ${t.name}" />
        <h3>${t.name}</h3>
        <div class="spec">${t.spec}</div>
        <div class="meta">${t.years} años de experiencia · ${t.level}<br/><span class="nx-stars">${stars(t.rating)}</span> ${t.rating}</div>
        <button class="nx-btn nx-btn-ghost nx-btn-sm" data-tutor="${i}">Ver perfil</button>
      </div>`).join("");
        tutorGrid.addEventListener("click", (e) => {
            var _a;
            const btn = e.target.closest("[data-tutor]");
            if (!btn)
                return;
            const t = TUTORS[Number(btn.dataset.tutor)];
            openModal(`
        <img class="tmodal" src="${t.img}" alt="Foto de ${t.name}" />
        <h3>${t.name}</h3>
        <p class="sub">${t.spec} · ${t.years} años de experiencia · <span class="nx-stars">${stars(t.rating)}</span> ${t.rating}</p>
        <p style="font-size:0.92rem;margin-bottom:16px">${t.bio}</p>
        <ul class="topics">
          <li>Materias: ${t.subjects.join(", ")}</li>
          <li>Imparte: ${t.level}</li>
          <li>Horarios: ${t.hours}</li>
          <li>Estudiantes atendidos: ${t.students}</li>
        </ul>
        <button class="nx-btn nx-btn-primary nx-btn-sm" style="margin-top:20px" id="tmodal-book">Reservar con este tutor</button>
      `);
            // The button above was just inserted by innerHTML, so it exists now and
            // can be wired up directly.
            (_a = $("#tmodal-book")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                var _a;
                closeModal();
                const sub = $("#bk-subject");
                const tut = $("#bk-tutor");
                if (sub && tut) {
                    sub.value = t.subjects[0];
                    // dispatchEvent fires listeners synchronously, right now — this
                    // makes the booking form behave as if the user picked the subject
                    // (refills the tutor list) without needing a real click.
                    sub.dispatchEvent(new Event("change"));
                    tut.value = t.name;
                    // The synthetic change above already ran syncSummary() before the
                    // tutor was assigned, so refresh it once more here.
                    syncSummary();
                }
                // scrollIntoView with behavior:"smooth" asks the browser to animate
                // the scroll to the booking section.
                (_a = document.getElementById("reserva")) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
            });
        });
    }
    // --- 10. Booking ------------------------------------------------------------------
    const PRICE_PER_MIN = 500 / 60; // RD$500 per 60-min session
    const bkForm = $("#nx-book-form");
    const bkSubject = $("#bk-subject");
    const bkTutor = $("#bk-tutor");
    if (bkSubject) {
        // `<option>` strings built with map+join, then assigned to innerHTML to
        // become real option elements.
        bkSubject.innerHTML =
            '<option value="">Elige una…</option>' +
                SUBJECTS.map((s) => `<option>${s.name}</option>`).join("");
    }
    const fillTutors = () => {
        if (!bkTutor || !bkSubject)
            return;
        const sub = bkSubject.value;
        // Array.prototype.filter returns a new array with only the elements for
        // which the callback returned true.
        // `sub ? A : B` — a non-empty string is truthy in JS, so this selects the
        // filtered list when a subject was chosen, otherwise all tutors.
        const list = sub
            ? TUTORS.filter((t) => t.subjects.includes(sub))
            : TUTORS;
        bkTutor.innerHTML =
            '<option value="">Elige un tutor…</option>' +
                list.map((t) => `<option>${t.name}</option>`).join("");
    };
    bkSubject === null || bkSubject === void 0 ? void 0 : bkSubject.addEventListener("change", () => {
        fillTutors();
        syncSummary();
    });
    fillTutors();
    // Helper reading a field's current `.value` (always a string) or "".
    // The union `HTMLInputElement | HTMLSelectElement | null` means the value
    // may be any of those types; `?.` yields undefined on null, `?? ""` maps it.
    const bkVal = (id) => { var _a, _b; return (_b = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : ""; };
    const bookingPrice = () => {
        const dur = Number(bkVal("bk-duration"));
        // `!dur` is true when dur is 0 or NaN — Number("") === 0, and both are
        // falsy. NaN is also falsy, which covers unparseable input.
        if (!dur)
            return null;
        let price = dur * PRICE_PER_MIN;
        if (bkVal("bk-mode") === "Presencial")
            price *= 1.1;
        // Round to the nearest multiple of 10 (pesos).
        return Math.round(price / 10) * 10;
    };
    const syncSummary = () => {
        // Nested arrow function `set` is a closure over nothing mutable — just a
        // local shorthand. It writes text, or "—" when v is an empty string
        // (`v || "—"` uses truthiness: "" is falsy).
        const set = (id, v) => {
            const el = document.getElementById(id);
            if (el)
                el.textContent = v || "—";
        };
        set("sm-subject", bkVal("bk-subject"));
        set("sm-tutor", bkVal("bk-tutor"));
        set("sm-mode", bkVal("bk-mode"));
        const d = bkVal("bk-duration");
        set("sm-duration", d ? `${d} minutos` : "");
        set("sm-date", bkVal("bk-date"));
        set("sm-time", bkVal("bk-time"));
        const price = bookingPrice();
        const priceEl = $("#sm-price");
        // toLocaleString("es-DO") formats the number with locale separators
        // (2500 → "2,500").
        if (priceEl)
            priceEl.textContent = price ? `RD$${price.toLocaleString("es-DO")}` : "RD$ —";
    };
    // "change" fires when a control commits a new value (select choice, date
    // pick, input blur); "input" fires on every keystroke. Listening to both
    // keeps the summary live.
    bkForm === null || bkForm === void 0 ? void 0 : bkForm.addEventListener("change", syncSummary);
    bkForm === null || bkForm === void 0 ? void 0 : bkForm.addEventListener("input", syncSummary);
    // Min date = tomorrow. Build YYYY-MM-DD from LOCAL date components —
    // toISOString() would convert to UTC and, in UTC−4 evenings, roll the
    // calendar day forward, wrongly blocking tomorrow.
    const dateInput = document.getElementById("bk-date");
    let minDateStr = "";
    if (dateInput) {
        const t = new Date(); // now, in the user's local time
        t.setDate(t.getDate() + 1); // advance one local calendar day
        const pad = (n) => String(n).padStart(2, "0");
        minDateStr = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
        // The `min` attribute of a date input compares against the entered
        // date — but only natively; we also enforce it in submit validation.
        dateInput.min = minDateStr;
    }
    // Regular expression literals: the /.../ syntax creates a RegExp object.
    // .test(s) returns whether the pattern matches anywhere in s.
    //   EMAIL: one-or-more non-space/@ chars, "@", more chars, ".", 2+ chars.
    //   PHONE: starts with + ( ) or digit, then 7+ phone chars.
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const PHONE_RE = /^[+()0-9][0-9()\-\s]{6,}$/;
    const bkErr = (id, msg) => {
        // The attribute selector [data-err="id"] finds the error slot.
        const slot = document.querySelector(`[data-err="${id}"]`);
        const field = document.getElementById(id);
        if (slot)
            slot.textContent = msg;
        if (field)
            field.classList.toggle("invalid", msg !== "");
    };
    // Clear a field's error as soon as the user edits it.
    bkForm === null || bkForm === void 0 ? void 0 : bkForm.addEventListener("input", (e) => {
        const id = e.target.id;
        if (id)
            bkErr(id, "");
    });
    bkForm === null || bkForm === void 0 ? void 0 : bkForm.addEventListener("submit", (e) => {
        var _a;
        // preventDefault() cancels the browser's default action — for submit,
        // reloading the page and navigating to the form's action URL. The event
        // still propagates, but no navigation occurs.
        e.preventDefault();
        let ok = true;
        // Local helper: marks the field invalid and records failure.
        const req = (id, msg) => {
            if (!bkVal(id)) {
                bkErr(id, msg);
                ok = false;
            }
        };
        req("bk-subject", "Por favor, selecciona una materia.");
        req("bk-tutor", "Por favor, selecciona un tutor.");
        req("bk-mode", "Elige la modalidad.");
        req("bk-duration", "Elige la duración.");
        req("bk-date", "Elige una fecha.");
        // ISO date strings compare correctly with < ; reject anything before the
        // computed local minimum (the `min` attribute alone doesn't block submit).
        if (bkVal("bk-date") && minDateStr && bkVal("bk-date") < minDateStr) {
            bkErr("bk-date", "Elige una fecha futura.");
            ok = false;
        }
        req("bk-time", "Elige una hora.");
        if (bkVal("bk-name").length < 2) {
            bkErr("bk-name", "Escribe tu nombre.");
            ok = false;
        }
        if (bkVal("bk-last").length < 2) {
            bkErr("bk-last", "Escribe tu apellido.");
            ok = false;
        }
        if (!EMAIL_RE.test(bkVal("bk-email"))) {
            bkErr("bk-email", "Ese correo no parece correcto.");
            ok = false;
        }
        if (bkVal("bk-phone") && !PHONE_RE.test(bkVal("bk-phone"))) {
            bkErr("bk-phone", "Ese número no parece correcto.");
            ok = false;
        }
        req("bk-level", "Elige tu nivel académico.");
        req("bk-topic", "Cuéntanos qué tema necesitas.");
        if (!ok)
            return;
        // `hidden` is a DOM boolean property reflecting the HTML hidden attribute;
        // true hides the element entirely (like display:none).
        if (bkForm)
            bkForm.hidden = true;
        (_a = document.querySelector(".nx-summary")) === null || _a === void 0 ? void 0 : _a.setAttribute("hidden", "");
        const s = $("#bk-success");
        if (s) {
            s.hidden = false;
            s.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
    // "Hacer otra reserva": reset the form and bring the form + summary back.
    (_c = $("#bk-again")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
        var _a;
        bkForm === null || bkForm === void 0 ? void 0 : bkForm.reset();
        fillTutors();
        syncSummary();
        if (bkForm)
            bkForm.hidden = false;
        (_a = document.querySelector(".nx-summary")) === null || _a === void 0 ? void 0 : _a.removeAttribute("hidden");
        const s = $("#bk-success");
        if (s)
            s.hidden = true;
    });
    // --- 11. Calculator ----------------------------------------------------------------
    const calc = () => {
        // `Number(x) || 0` — if coercion yields 0 or NaN (both falsy), use 0.
        const n = Number(bkVal("calc-n")) || 0;
        const min = Number(bkVal("calc-min")) || 0;
        const mode = bkVal("calc-mode");
        let total = n * min * PRICE_PER_MIN;
        if (mode === "presencial")
            total *= 1.1;
        total = Math.round(total / 10) * 10;
        const out = $("#calc-total");
        const desc = $("#calc-desc");
        if (out)
            out.textContent = `RD$${total.toLocaleString("es-DO")}`;
        if (desc)
            desc.textContent = `${n} sesiones × ${min} minutos · ${bkVal("calc-subject")}`;
    };
    // forEach over a plain array of id strings; `?.` skips ids not in the page.
    ["calc-n", "calc-min", "calc-mode", "calc-subject"].forEach((id) => { var _a; return (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.addEventListener("change", calc); });
    calc();
    const QUIZ = [
        { topic: "Matemáticas básicas", q: "¿Cuánto es 3/4 + 1/2?", opts: ["1", "5/4", "4/6", "7/8"], ok: 1 },
        { topic: "Álgebra", q: "Resuelve: 2x + 6 = 14", opts: ["x = 3", "x = 4", "x = 5", "x = 10"], ok: 1 },
        { topic: "Funciones", q: "Si f(x) = 2x² − 3, ¿cuánto vale f(3)?", opts: ["9", "12", "15", "18"], ok: 2 },
        { topic: "Trigonometría", q: "En un triángulo rectángulo, sen(θ) es…", opts: ["adyacente / hipotenusa", "opuesto / hipotenusa", "opuesto / adyacente", "hipotenusa / opuesto"], ok: 1 },
        { topic: "Cálculo", q: "La derivada de f(x) = x³ es…", opts: ["x²", "2x²", "3x²", "3x³"], ok: 2 },
    ];
    let quizIdx = 0;
    let quizWrong = [];
    const quizStart = $("#quiz-start"), quizBody = $("#quiz-body"), quizResult = $("#quiz-result");
    const showQ = () => {
        const q = QUIZ[quizIdx];
        const stepEl = $("#quiz-step"), qEl = $("#quiz-q"), optsEl = $("#quiz-opts");
        if (!qEl || !optsEl || !stepEl)
            return;
        // Re-render always clears the "answered" marker so a repeated attempt
        // (via Repetir + Comenzar) accepts answers again.
        delete optsEl.dataset.done;
        stepEl.textContent = `Pregunta ${quizIdx + 1} de ${QUIZ.length} · ${q.topic}`;
        qEl.textContent = q.q;
        optsEl.innerHTML = q.opts
            .map((o, i) => `<button class="nx-quiz-opt" data-i="${i}">${o}</button>`)
            .join("");
    };
    (_d = $("#quiz-opts")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", (e) => {
        var _a;
        const btn = e.target.closest(".nx-quiz-opt");
        // Guard: ignore clicks after an answer was recorded for this question
        // (dataset.done set) or clicks that miss a button entirely.
        if (!btn || ((_a = btn.parentElement) === null || _a === void 0 ? void 0 : _a.dataset.done))
            return;
        const q = QUIZ[quizIdx];
        const i = Number(btn.dataset.i);
        // `!` after parentElement is TS's NON-NULL ASSERTION: compile-time only —
        // it tells the checker "this is not null" (we just checked btn exists).
        btn.parentElement.dataset.done = "1";
        // Highlight the correct option green for feedback.
        document.querySelectorAll(".nx-quiz-opt").forEach((b, bi) => {
            if (bi === q.ok)
                b.classList.add("correct");
        });
        if (i !== q.ok) {
            btn.classList.add("wrong");
            quizWrong.push(q.topic);
        }
        // setTimeout(cb, 700) schedules cb on the event loop after ~700ms — the
        // code keeps running; the delay only defers the callback (like a timer
        // queue, not a sleep).
        setTimeout(() => {
            var _a;
            quizIdx++;
            if (quizIdx < QUIZ.length) {
                showQ();
            }
            else {
                const score = QUIZ.length - quizWrong.length;
                const level = score >= 4 ? "Nivel avanzado" : score >= 3 ? "Nivel intermedio" : "Nivel inicial";
                // `[...new Set(quizWrong)]`: Set removes duplicates; the spread `...`
                // expands its elements into a fresh array (Set is iterable).
                const weak = [...new Set(quizWrong)];
                if (quizBody)
                    quizBody.hidden = true;
                if (quizResult) {
                    quizResult.hidden = false;
                    // Nested template literals inside ${ } are legal — the parser matches
                    // backtick pairs by structure.
                    quizResult.innerHTML = `
            <h3>Resultado: ${level}</h3>
            <p style="color:var(--nx-muted);margin:10px 0 16px">${weak.length
                        ? `Tus principales áreas de oportunidad parecen estar en <b>${weak.join(" y ").toLowerCase()}</b>.`
                        : "Respondiste todo correctamente. ¡Excelente base!"}</p>
            <p style="font-weight:700;margin-bottom:18px">${weak.length
                        ? `Te recomendamos comenzar con tutorías de ${weak.join(" y ")}.`
                        : "Te recomendamos nuestro Plan Intensivo para seguir avanzando."}</p>
            <a class="nx-btn nx-btn-primary" href="#reserva">Reservar tutoría</a>
            <button class="nx-btn nx-btn-ghost" id="quiz-restart" style="margin-left:8px">Repetir</button>`;
                    (_a = $("#quiz-restart")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                        quizIdx = 0;
                        quizWrong = [];
                        if (quizResult)
                            quizResult.hidden = true;
                        if (quizStart)
                            quizStart.hidden = false;
                    });
                }
            }
        }, 700);
    });
    (_e = $("#quiz-begin")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
        if (quizStart)
            quizStart.hidden = true;
        if (quizBody)
            quizBody.hidden = false;
        quizIdx = 0;
        quizWrong = [];
        showQ();
    });
    // --- 13. Resources --------------------------------------------------------------------
    // Inline object type in the array annotation: { name, content: {...}[] }[].
    const RESOURCES = [
        { name: "Fórmulas de derivadas", content: [
                { label: "Potencia", val: "d/dx xⁿ = n·xⁿ⁻¹" },
                { label: "Producto", val: "(u·v)' = u'v + uv'" },
                { label: "Cociente", val: "(u/v)' = (u'v − uv') / v²" },
                { label: "Cadena", val: "d/dx f(g(x)) = f'(g(x))·g'(x)" },
                { label: "Trigonométricas", val: "(sen x)' = cos x · (cos x)' = −sen x" },
                { label: "Exponencial", val: "(eˣ)' = eˣ · (ln x)' = 1/x" },
            ] },
        { name: "Fórmulas de integración", content: [
                { label: "Potencia", val: "∫ xⁿ dx = xⁿ⁺¹/(n+1) + C  (n ≠ −1)" },
                { label: "1/x", val: "∫ 1/x dx = ln|x| + C" },
                { label: "Exponencial", val: "∫ eˣ dx = eˣ + C" },
                { label: "sen x", val: "∫ sen x dx = −cos x + C" },
                { label: "cos x", val: "∫ cos x dx = sen x + C" },
                { label: "Sustitución", val: "∫ f(g(x))·g'(x) dx = ∫ f(u) du" },
            ] },
        { name: "Identidades trigonométricas", content: [
                { label: "Pitagórica", val: "sen²θ + cos²θ = 1" },
                { label: "Tangente", val: "tan θ = sen θ / cos θ" },
                { label: "Ángulo doble", val: "sen(2θ) = 2 sen θ cos θ" },
                { label: "Coseno doble", val: "cos(2θ) = cos²θ − sen²θ" },
                { label: "Ley de senos", val: "a/sen A = b/sen B = c/sen C" },
                { label: "Ley de cosenos", val: "c² = a² + b² − 2ab·cos C" },
            ] },
        { name: "Propiedades de los logaritmos", content: [
                { label: "Producto", val: "log(ab) = log a + log b" },
                { label: "Cociente", val: "log(a/b) = log a − log b" },
                { label: "Potencia", val: "log(aⁿ) = n·log a" },
                { label: "Cambio de base", val: "log_b a = ln a / ln b" },
                { label: "Identidad", val: "log_b b = 1 · log 1 = 0" },
            ] },
        { name: "Leyes de exponentes", content: [
                { label: "Producto", val: "aᵐ · aⁿ = aᵐ⁺ⁿ" },
                { label: "Cociente", val: "aᵐ / aⁿ = aᵐ⁻ⁿ" },
                { label: "Potencia", val: "(aᵐ)ⁿ = aᵐⁿ" },
                { label: "Negativo", val: "a⁻ⁿ = 1/aⁿ" },
                { label: "Fraccionario", val: "a^(m/n) = ⁿ√(aᵐ)" },
                { label: "Cero", val: "a⁰ = 1  (a ≠ 0)" },
            ] },
        { name: "Fórmulas de geometría", content: [
                { label: "Triángulo", val: "Área = (b·h)/2" },
                { label: "Círculo", val: "Área = πr² · Perímetro = 2πr" },
                { label: "Rectángulo", val: "Área = b·h" },
                { label: "Trapecio", val: "Área = (B+b)/2 · h" },
                { label: "Esfera", val: "V = (4/3)πr³" },
                { label: "Cilindro", val: "V = πr²h" },
                { label: "Pitágoras", val: "a² + b² = c²" },
            ] },
        { name: "Conversiones de unidades", content: [
                { label: "Longitud", val: "1 km = 1000 m · 1 m = 100 cm" },
                { label: "Masa", val: "1 kg = 1000 g · 1 t = 1000 kg" },
                { label: "Tiempo", val: "1 h = 60 min = 3600 s" },
                { label: "Velocidad", val: "km/h → m/s: ÷ 3.6" },
                { label: "Temperatura", val: "°F = °C × 9/5 + 32" },
            ] },
        { name: "Guía de preparación para exámenes", content: [
                { label: "1 semana antes", val: "Repasa los temas con ejercicios, no solo lectura." },
                { label: "3 días antes", val: "Haz un simulacro con tiempo real." },
                { label: "1 día antes", val: "Repasa fórmulas clave y duerme bien." },
                { label: "En el examen", val: "Resuelve primero lo fácil, marca lo difícil y vuelve." },
                { label: "Consejo", val: "Explicar un tema a alguien es la mejor forma de dominarlo." },
            ] },
    ];
    const resGrid = $("#nx-resources");
    if (resGrid) {
        resGrid.innerHTML = RESOURCES.map((r, i) => `
      <div class="nx-card nx-resource nx-reveal">
        <div class="nx-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z"/></svg></div>
        <h3>${r.name}</h3>
        <button class="nx-btn nx-btn-ghost nx-btn-sm" data-res="${i}">Ver recurso</button>
      </div>`).join("");
        resGrid.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-res]");
            if (!btn)
                return;
            const r = RESOURCES[Number(btn.dataset.res)];
            openModal(`
        <h3>${r.name}</h3>
        <div class="formula-list">${r.content
                .map((c) => `<div><b>${c.label}:</b> ${c.val}</div>`)
                .join("")}</div>
      `);
        });
    }
    // A two-level dictionary: BANK[subject][difficulty] → array of exercises.
    const BANK = {
        algebra: {
            facil: [
                { e: "Resuelve:\n3x − 7 = 11", hint: "Suma 7 a ambos lados.", sol: "3x = 18 → x = 6" },
                { e: "Simplifica:\n2(x + 4) − 3x", hint: "Distribuye el 2 primero.", sol: "2x + 8 − 3x = −x + 8" },
            ],
            intermedio: [
                { e: "Resuelve el sistema:\nx + y = 10\nx − y = 2", hint: "Suma las dos ecuaciones.", sol: "2x = 12 → x = 6, y = 4" },
                { e: "Factoriza:\nx² − 9x + 20", hint: "Busca dos números que sumen −9 y multipliquen 20.", sol: "(x − 4)(x − 5)" },
            ],
            dificil: [
                { e: "Resuelve:\nx² − 5x + 6 = 0 usando la fórmula general", hint: "a=1, b=−5, c=6", sol: "x = (5 ± √1)/2 → x = 3 o x = 2" },
                { e: "Simplifica:\n(x² − 4)/(x + 2)", hint: "El numerador es una diferencia de cuadrados.", sol: "x − 2  (x ≠ −2)" },
            ],
        },
        calculo: {
            facil: [
                { e: "Calcula la derivada de:\nf(x) = 5x³", hint: "Usa la regla de la potencia.", sol: "f'(x) = 15x²" },
                { e: "Calcula:\n∫ 2x dx", hint: "La integral de x es x²/2.", sol: "x² + C" },
            ],
            intermedio: [
                { e: "Calcula la derivada de:\nf(x) = 3x⁴ − 5x² + 7", hint: "Deriva término por término.", sol: "f'(x) = 12x³ − 10x" },
                { e: "Calcula el límite:\nlim (x→2) (x² − 4)/(x − 2)", hint: "Factoriza el numerador.", sol: "lim (x+2) = 4" },
            ],
            dificil: [
                { e: "Calcula la derivada de:\nf(x) = x² · sen(x)", hint: "Regla del producto.", sol: "f'(x) = 2x·sen(x) + x²·cos(x)" },
                { e: "Calcula:\n∫ x·e^(x²) dx", hint: "Sustitución u = x².", sol: "(1/2)e^(x²) + C" },
            ],
        },
        trigonometria: {
            facil: [
                { e: "Si sen θ = 0.5, ¿cuánto mide θ? (primer cuadrante)", hint: "Piensa en el triángulo notable 30-60-90.", sol: "θ = 30°" },
                { e: "En un triángulo rectángulo, cateto opuesto = 3 e hipotenusa = 5.\n¿Cuánto vale sen θ?", hint: "sen = opuesto / hipotenusa.", sol: "sen θ = 3/5" },
            ],
            intermedio: [
                { e: "Demuestra numéricamente:\nsen²(45°) + cos²(45°) = 1", hint: "sen 45° = cos 45° = √2/2.", sol: "(√2/2)² + (√2/2)² = 1/2 + 1/2 = 1" },
                { e: "Dos lados miden 5 y 7 con ángulo 60° entre ellos.\nHalla el tercer lado.", hint: "Ley de cosenos.", sol: "c² = 25 + 49 − 35 = 39 → c = √39 ≈ 6.24" },
            ],
            dificil: [
                { e: "Resuelve para x ∈ [0°, 360°):\n2 sen x − 1 = 0", hint: "sen x = 1/2 tiene dos soluciones.", sol: "x = 30° y x = 150°" },
                { e: "Simplifica:\n(1 − cos²θ) / sen θ", hint: "Usa la identidad pitagórica.", sol: "sen²θ / sen θ = sen θ" },
            ],
        },
    };
    const genCard = $("#gen-card");
    const genNew = () => {
        var _a, _b;
        // `|| "algebra"` — if the select is empty, falsy "" falls back.
        const s = bkVal("gen-subject") || "algebra";
        const d = bkVal("gen-diff") || "intermedio";
        // `BANK[s]?.[d]` — optional chaining on computed access: if BANK has no
        // key s, the expression is undefined instead of throwing on [d].
        const pool = (_b = (_a = BANK[s]) === null || _a === void 0 ? void 0 : _a[d]) !== null && _b !== void 0 ? _b : [];
        if (!pool.length)
            return;
        // Math.random() returns a pseudo-random double in [0,1); floor gives a
        // valid index.
        const ex = pool[Math.floor(Math.random() * pool.length)];
        const tag = $("#gen-tag"), expr = $("#gen-expr"), h = $("#gen-hint-out"), so = $("#gen-sol-out");
        const names = { algebra: "Álgebra", calculo: "Cálculo", trigonometria: "Trigonometría" };
        const diffs = { facil: "Fácil", intermedio: "Intermedio", dificil: "Difícil" };
        if (tag)
            tag.textContent = `${names[s]} · ${diffs[d]}`;
        if (expr)
            expr.textContent = ex.e;
        if (h) {
            h.textContent = `Pista: ${ex.hint}`;
            h.hidden = true;
        }
        if (so) {
            so.textContent = `Solución: ${ex.sol}`;
            so.hidden = true;
        }
        if (genCard)
            genCard.hidden = false;
    };
    (_f = $("#gen-new")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", genNew);
    (_g = $("#gen-again")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", genNew);
    (_h = $("#gen-hint")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", () => { const h = $("#gen-hint-out"); if (h)
        h.hidden = false; });
    (_j = $("#gen-sol")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", () => { const s = $("#gen-sol-out"); if (s)
        s.hidden = false; });
    // --- 15. Domina el concepto (x² slider) --------------------------------------------------
    const slider = document.getElementById("nx-slider");
    // "input" fires on every slider move.
    slider === null || slider === void 0 ? void 0 : slider.addEventListener("input", () => {
        // slider.value is a string; parseFloat converts it to a number.
        const x = parseFloat(slider.value);
        const y = x * x;
        const xEl = $("#nx-x"), yEl = $("#nx-y"), pt = $("#nx-pt");
        if (xEl)
            xEl.textContent = String(x);
        if (yEl)
            yEl.textContent = String(y);
        // Map x in [-4,4] to svg coords: curve goes through (100,140) vertex
        // svg: x_pix = 100 + x*20, y_pix = 140 - y*10 (clamped)
        if (pt) {
            // setAttribute writes a DOM attribute directly (cx/cy position the
            // <circle> on the SVG curve).
            pt.setAttribute("cx", String(100 + x * 20));
            pt.setAttribute("cy", String(Math.max(10, 140 - y * 10)));
        }
    });
    // --- 16. FAQ ------------------------------------------------------------------------------
    const FAQS = [
        { q: "¿Las tutorías son virtuales o presenciales?", a: "Ambas. Tú eliges la modalidad al reservar, y puedes cambiarla entre sesiones." },
        { q: "¿Cuánto dura una sesión?", a: "Puedes elegir 30, 60, 90 o 120 minutos. Lo más común es 60 minutos." },
        { q: "¿Puedo elegir al tutor?", a: "Sí. Al reservar te mostramos los tutores disponibles según la materia y eliges con quién estudiar." },
        { q: "¿Puedo cancelar una tutoría?", a: "Sí, puedes cancelar o reprogramar hasta 12 horas antes sin costo." },
        { q: "¿Necesito conocimientos previos?", a: "No. La prueba diagnóstica nos dice desde dónde empezar, aunque sea desde cero." },
        { q: "¿Las tutorías son individuales?", a: "Sí, todas las sesiones son uno a uno para que avances a tu ritmo." },
        { q: "¿Entregan material de estudio?", a: "Sí: ejercicios, resúmenes y material de práctica después de cada sesión." },
        { q: "¿Atienden estudiantes universitarios?", a: "Sí, tenemos tutores especializados en cálculo, álgebra lineal y física universitaria." },
        { q: "¿Puedo reservar varias sesiones?", a: "Claro. Los planes de 4, 8 y 10 sesiones ya traen el paquete armado." },
        { q: "¿Cómo puedo contactar con un tutor?", a: "Escríbenos por WhatsApp o el formulario de contacto y te conectamos con el tutor ideal." },
    ];
    const faqWrap = $("#nx-faq");
    if (faqWrap) {
        faqWrap.innerHTML = FAQS.map((f) => `
      <div class="nx-faq-item">
        <button type="button">${f.q}</button>
        <div class="ans"><p>${f.a}</p></div>
      </div>`).join("");
        faqWrap.addEventListener("click", (e) => {
            const item = e.target.closest(".nx-faq-item");
            if (!item || !e.target.closest("button"))
                return;
            item.classList.toggle("open");
        });
    }
    // --- 17. Contact form ---------------------------------------------------------------------
    const ctForm = $("#nx-contact-form");
    const ctVal = (id) => { var _a, _b; return (_b = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.value.trim()) !== null && _b !== void 0 ? _b : ""; };
    const ctErr = (id, msg) => {
        const slot = document.querySelector(`[data-err="${id}"]`);
        const field = document.getElementById(id);
        if (slot)
            slot.textContent = msg;
        if (field)
            field.classList.toggle("invalid", msg !== "");
    };
    ctForm === null || ctForm === void 0 ? void 0 : ctForm.addEventListener("input", (e) => {
        const id = e.target.id;
        if (id)
            ctErr(id, "");
    });
    ctForm === null || ctForm === void 0 ? void 0 : ctForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let ok = true;
        if (ctVal("ct-name").length < 2) {
            ctErr("ct-name", "Escribe tu nombre.");
            ok = false;
        }
        if (!EMAIL_RE.test(ctVal("ct-email"))) {
            ctErr("ct-email", "Ese correo no parece correcto.");
            ok = false;
        }
        if (ctVal("ct-phone") && !PHONE_RE.test(ctVal("ct-phone"))) {
            ctErr("ct-phone", "Ese número no parece correcto.");
            ok = false;
        }
        if (ctVal("ct-msg").length < 10) {
            ctErr("ct-msg", "Cuéntanos un poco más (mínimo 10 caracteres).");
            ok = false;
        }
        if (!ok)
            return;
        // Replace the entire form with the simulated-confirmation markup.
        ctForm.innerHTML = `
      <div class="nx-success">
        <div class="ok">✓</div>
        <h3>¡Mensaje enviado!</h3>
        <p style="color:var(--nx-muted);margin-top:8px">Te responderemos pronto. (Página de muestra: el envío es una simulación.)</p>
      </div>`;
    });
    // --- 18. Footer year -----------------------------------------------------------------------
    const yearEl = $("#nx-year");
    if (yearEl)
        yearEl.textContent = String(new Date().getFullYear());
    // --- 19. Reveal on scroll + progress bar ----------------------------------------------
    // IMPORTANT: this block runs LAST so the generated grids (subjects, tutors,
    // resources) already exist in the DOM — querySelectorAll takes a one-time
    // static snapshot, it does not update as nodes are added later.
    //
    // IntersectionObserver is an async browser API: after observe(el), the
    // browser calls our callback on a later task whenever each element's
    // intersection ratio with the viewport crosses `threshold` (0.12 = 12%).
    // This avoids scroll-event polling and is far cheaper.
    const revealEls = document.querySelectorAll(".nx-reveal");
    if ("IntersectionObserver" in window) {
        // `"X" in window` — property existence check on the global object; true
        // when the browser implements the API (feature detection).
        const io = new IntersectionObserver((entries) => {
            // `entries` is a batched array of IntersectionObserverEntry.
            entries.forEach((en) => {
                if (!en.isIntersecting)
                    return;
                en.target.classList.add("visible");
                // unobserve: stop watching — each element reveals only once.
                io.unobserve(en.target);
                // `instanceof HTMLElement` is a runtime prototype-chain check; the
                // counter elements also carry data-count to trigger the number anim.
                if (en.target instanceof HTMLElement && en.target.dataset.count) {
                    animateCount(en.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach((el) => io.observe(el));
        counters.forEach((el) => io.observe(el));
        const bar = $("#prog-bar");
        if (bar) {
            io.observe((_k = bar.parentElement) !== null && _k !== void 0 ? _k : bar);
        }
    }
    else {
        // No observer support: mark everything visible and animate immediately.
        revealEls.forEach((el) => el.classList.add("visible"));
        counters.forEach(animateCount);
    }
    // Progress bar animates when its card becomes visible.
    const progCard = (_l = $("#prog-bar")) === null || _l === void 0 ? void 0 : _l.closest(".nx-card");
    if (progCard && "IntersectionObserver" in window) {
        const io2 = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                var _a, _b;
                if (en.isIntersecting) {
                    const bar = $("#prog-bar");
                    const pct = $("#prog-pct");
                    // element.style writes inline CSS; data-w holds the target width %.
                    if (bar)
                        bar.style.width = `${(_a = bar.dataset.w) !== null && _a !== void 0 ? _a : 0}%`;
                    if (pct)
                        pct.textContent = `${(_b = bar === null || bar === void 0 ? void 0 : bar.dataset.w) !== null && _b !== void 0 ? _b : 0}%`;
                    io2.unobserve(en.target);
                }
            });
        });
        io2.observe(progCard);
    }
    else {
        const bar = $("#prog-bar");
        const pct = $("#prog-pct");
        if (bar)
            bar.style.width = `${(_m = bar.dataset.w) !== null && _m !== void 0 ? _m : 0}%`;
        if (pct)
            pct.textContent = `${(_o = bar === null || bar === void 0 ? void 0 : bar.dataset.w) !== null && _o !== void 0 ? _o : 0}%`;
    }
})();
//# sourceMappingURL=tutorias.js.map