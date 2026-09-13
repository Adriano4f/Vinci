"use strict";
/*
 * common.ts — shared behavior used on every page.
 * Compiled to js/common.js and loaded by all HTML pages.
 *
 * Responsibilities:
 *   1. Mobile navigation toggle (hamburger menu).
 *   2. "Otros servicios" dropdown (tap-to-expand on mobile).
 *   3. Marks the current page's link in the navbar (data-route attributes).
 *   4. Fills the footer year automatically.
 *   5. Reveal-on-scroll animation for elements with .reveal.
 *
 * TYPE NOTES (accurate to the specs):
 *   - `document.querySelector<HTMLButtonElement>(sel)` — the DOM lib defines
 *     it as generic; the type argument only changes the compile-time return
 *     type (Element → HTMLButtonElement | null). At runtime the call is a
 *     plain `querySelector`; types are fully erased by tsc.
 *   - `?` in `el?.method()` — optional chaining: if el is null/undefined the
 *     expression short-circuits to undefined instead of throwing.
 *   - `??` — nullish coalescing: uses the right side only for null/undefined
 *     (keeps 0, "", false), unlike || which treats those as missing too.
 *   - `x as T` — type assertion: compile-time only, performs NO runtime check.
 *   - Arrow functions `(e) => {...}` capture `this` lexically and are plain
 *     function values; EventTarget.addEventListener stores them and the
 *     browser's event loop invokes them when the event dispatches.
 */
// IIFE (Immediately Invoked Function Expression): the arrow function is
// wrapped in parens to make it an expression, then called. Classic <script>
// files all share the global scope; this wrapper keeps locals private.
(() => {
    var _a;
    // --- 1. Mobile menu -------------------------------------------------------
    // querySelector returns the first match, or null. The generic
    // <HTMLButtonElement> narrows the static type; the | null stays.
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-links");
    // `toggle && menu` — JS truthiness: both could be null (element absent on
    // this page); `strict` TS requires this guard before use.
    if (toggle && menu) {
        // The arrow function is a CLOSURE: it keeps live references to `menu`
        // and `toggle` and runs later, on click, via the event loop.
        toggle.addEventListener("click", () => {
            // DOMTokenList.toggle returns the post-toggle presence as boolean.
            const isOpen = menu.classList.toggle("open");
            // ARIA state for screen readers; String() does ToString → "true"/"false".
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }
    // --- 2. "Otros servicios" dropdown -----------------------------------------
    // Desktop opens it on hover/focus (pure CSS). On mobile there is no hover,
    // so the first tap expands the submenu; once it is open the link behaves
    // normally and navigates to the services hub.
    const dropToggle = document.querySelector(".nav-drop");
    // closest() walks up the DOM to the nearest ancestor matching the selector
    // (or null). `?.` yields undefined when dropToggle is null.
    const dropParent = dropToggle === null || dropToggle === void 0 ? void 0 : dropToggle.closest(".has-dropdown");
    // Must match the navbar collapse breakpoint in main.css.
    // window.matchMedia evaluates a CSS media query once and returns a
    // MediaQueryList; `.matches` is its current boolean result.
    const mobileQuery = window.matchMedia("(max-width: 820px)");
    if (dropToggle && dropParent) {
        // On desktop the menu opens via CSS :hover/:focus-within, so keep the
        // announced state in sync with what is actually shown.
        // "pointerenter"/"pointerleave" fire when the pointing device enters/leaves
        // the element (Pointer Events spec — covers mouse, touch, pen).
        dropParent.addEventListener("pointerenter", () => {
            if (!mobileQuery.matches)
                dropToggle.setAttribute("aria-expanded", "true");
        });
        dropParent.addEventListener("pointerleave", () => {
            if (!mobileQuery.matches)
                dropToggle.setAttribute("aria-expanded", "false");
        });
        dropToggle.addEventListener("click", (event) => {
            if (mobileQuery.matches && !dropParent.classList.contains("open")) {
                // preventDefault() cancels the click's default action — following the
                // <a href>. The event keeps propagating; only the default is stopped.
                event.preventDefault();
                dropParent.classList.add("open");
                dropToggle.setAttribute("aria-expanded", "true");
            }
        });
    }
    // --- 3. Highlight the link of the page we are on ---------------------------
    // Each top-level nav link carries data-route. Service pages are detected by
    // the "servicios" directory anywhere in the path and other pages by their
    // file name, so the logic works under a hosting prefix and on file:// too.
    //
    // location.pathname is a string like "/servicios/pedido.html".
    // String.split("/") → array; .filter(Boolean) removes empty strings
    // ("", produced by leading/trailing slashes) because Boolean("") === false.
    const segments = window.location.pathname.split("/").filter(Boolean);
    // `segments[i]` is `string | undefined` under strict indexing;
    // `?? ""` supplies the fallback.
    const lastSegment = (_a = segments[segments.length - 1]) !== null && _a !== void 0 ? _a : "";
    let route = "inicio";
    if (segments.includes("servicios"))
        route = "servicios";
    else if (lastSegment === "templates.html")
        route = "plantillas";
    else if (lastSegment === "contact.html")
        route = "contacto";
    // querySelectorAll returns a NodeList (static snapshot, iterable via forEach).
    // `link.dataset` is a DOMStringMap over data-* attributes: data-route ↔
    // dataset.route; all values are strings.
    document.querySelectorAll("[data-route]").forEach((link) => {
        if (link.dataset.route === route)
            link.classList.add("active");
    });
    // --- 4. Footer year --------------------------------------------------------
    document.querySelectorAll("[data-year]").forEach((el) => {
        // new Date() = current instant; getFullYear() → number; String() → text.
        // textContent assigns raw text (no HTML parsing, safe for any input).
        el.textContent = String(new Date().getFullYear());
    });
    // --- 5. Reveal on scroll ----------------------------------------------------
    const revealEls = document.querySelectorAll(".reveal");
    // `"IntersectionObserver" in window` — the `in` operator tests whether the
    // global object owns that property = feature detection. Old browsers
    // without it take the else branch.
    if (revealEls.length > 0 && "IntersectionObserver" in window) {
        // IntersectionObserver: the browser asynchronously invokes the callback
        // with a batch of entries whenever observed elements cross `threshold`
        // (0.12 = 12% of the element visible). Cheaper than scroll polling.
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    // unobserve stops watching — each element animates exactly once.
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach((el) => observer.observe(el));
    }
    else {
        // Fallback: everything starts visible.
        revealEls.forEach((el) => el.classList.add("visible"));
    }
})();
//# sourceMappingURL=common.js.map