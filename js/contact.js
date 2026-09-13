"use strict";
/*
 * contact.ts — validation for the "Contact us" form.
 * Compiled to js/contact.js and loaded only by contact.html.
 *
 * The site has no server, so instead of sending data anywhere the script:
 *   1. Checks every field and shows an inline error message when something
 *      is missing or invalid.
 *   2. On success, hides the form and shows a confirmation panel with a
 *      ready-made WhatsApp deep link and a mailto: link, so pressing either
 *      opens the user's app with the whole message already filled in.
 *
 * TYPE NOTES:
 *   - `form.elements.namedItem(name)` returns `RadioNodeList | Element | null`
 *     — the DOM doesn't know statically which element type each name is, so
 *     `instanceof` is used below for a real RUNTIME prototype-chain check
 *     (unlike `as T`, which is erased and checks nothing).
 *   - Arrow functions here are closures over `form`.
 *   - `??` = nullish coalescing (null/undefined only); `||` would also
 *     swallow "" and 0.
 *   - Regex literals /.../ create RegExp objects; .test(s) → boolean.
 *   - Template literals `...${expr}...` interpolate via ToString.
 */
// IIFE: keeps every name below file-local; runs immediately on load.
(() => {
    // The <HTMLFormElement> generic is compile-time only; the call still
    // returns null when absent.
    const form = document.querySelector("#contact-form");
    if (!form)
        return; // We are not on the contact page; do nothing.
    // --- Small helpers --------------------------------------------------------
    /** Returns the trimmed value of a named field. */
    // Return annotation `: string` — erased at compile, documents intent.
    const valueOf = (name) => {
        const field = form.elements.namedItem(name);
        // instanceof checks whether the object's prototype chain includes the
        // constructor's prototype — a real runtime test of the element kind.
        // `||` chains short-circuit: later operands evaluated only if needed.
        if (field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement ||
            field instanceof HTMLSelectElement) {
            // After instanceof narrows the type, TS knows `.value` exists.
            // .trim() returns a new string without leading/trailing whitespace.
            return field.value.trim();
        }
        return "";
    };
    /** For a <select>, returns the visible label of the chosen option
        ("" when the placeholder is selected); other fields fall back to valueOf. */
    const labelOf = (name) => {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLSelectElement) {
            // selectedOptions is a live HTMLCollection of chosen <option>s;
            // [0] may be undefined under strict indexing.
            const option = field.selectedOptions[0];
            // `option && option.value !== "" ? ... : ""` — the ternary; && first
            // guards against undefined option, then checks the value isn't the
            // placeholder's empty string.
            return option && option.value !== "" ? option.textContent.trim() : "";
        }
        return valueOf(name);
    };
    /** Shows (or clears) the error message under a field. */
    // `: void` — declares no return value (informational, erased at emit).
    const setError = (name, message) => {
        // Template literal building a CSS attribute selector:
        // `[data-error-for="name"]` — the ${name} interpolates into the selector.
        const slot = form.querySelector(`[data-error-for="${name}"]`);
        const field = form.querySelector(`[name="${name}"]`);
        if (slot)
            slot.textContent = message;
        // toggle(name, force): adds "invalid" when message is non-empty, removes
        // when it is "" — a two-state set driven by a boolean.
        if (field)
            field.classList.toggle("invalid", message !== "");
    };
    // RegExp literals (/.../) create RegExp objects at parse time:
    //   EMAIL: [^\s@]+ = one-or-more chars that aren't space/@, then "@",
    //          more chars, ".", and 2+ trailing chars. ^$ anchor the whole string.
    //   PHONE: must start with +, ( ) or digit, then 7+ chars from the class.
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    // Digits, spaces and the usual phone punctuation; only checked when filled.
    const PHONE_PATTERN = /^[+()0-9][0-9()\-\s]{6,}$/;
    // --- Validation rules -----------------------------------------------------
    const validate = () => {
        let ok = true;
        if (valueOf("name").length < 2) {
            setError("name", "Por favor dinos tu nombre.");
            ok = false;
        }
        else {
            setError("name", "");
        }
        // RegExp.test(str) → boolean (pattern found anywhere / anchored match).
        if (!EMAIL_PATTERN.test(valueOf("email"))) {
            setError("email", "Ese correo electrónico no parece correcto.");
            ok = false;
        }
        else {
            setError("email", "");
        }
        if (valueOf("phone") !== "" && !PHONE_PATTERN.test(valueOf("phone"))) {
            setError("phone", "Ese número no parece correcto.");
            ok = false;
        }
        else {
            setError("phone", "");
        }
        if (valueOf("project-type") === "") {
            setError("project-type", "Elige qué plan te interesa.");
            ok = false;
        }
        else {
            setError("project-type", "");
        }
        if (valueOf("message").length < 10) {
            setError("message", "Cuéntanos un poco más sobre tu idea (mínimo 10 caracteres).");
            ok = false;
        }
        else {
            setError("message", "");
        }
        return ok;
    };
    // Clear a field's error as soon as the user starts fixing it.
    // "input" bubbles from each control up to the form — one listener covers all.
    // `event.target` is typed EventTarget | null; instanceof narrows it.
    form.addEventListener("input", (event) => {
        var _a;
        const target = event.target;
        if (target instanceof HTMLElement && target.getAttribute("name")) {
            // getAttribute returns string | null; `?? ""` normalizes the null case.
            setError((_a = target.getAttribute("name")) !== null && _a !== void 0 ? _a : "", "");
        }
    });
    // The budget select only makes sense for the personalized plan, so it
    // stays hidden until that option is chosen.
    const budgetField = form.querySelector("#budget-field");
    const typeSelect = form.elements.namedItem("project-type");
    const syncBudgetVisibility = () => {
        if (!budgetField || !(typeSelect instanceof HTMLSelectElement))
            return;
        // `hidden` is a boolean DOM property reflecting the hidden attribute.
        budgetField.hidden = typeSelect.value !== "custom";
    };
    if (typeSelect instanceof HTMLSelectElement) {
        // "change" fires when the select commits a new value.
        typeSelect.addEventListener("change", syncBudgetVisibility);
        // "Pedir este" buttons on the pricing cards arrive as ?plan=<slug>.
        // URLSearchParams parses location.search ("?plan=complete&x=1") into a
        // map; .get returns the first value for the key, or null when absent.
        const plan = new URLSearchParams(window.location.search).get("plan");
        // Setting .value selects the matching option; unknown values select
        // nothing (browser behavior), so no whitelist needed here.
        if (plan)
            typeSelect.value = plan;
    }
    syncBudgetVisibility();
    // --- Submit ---------------------------------------------------------------
    form.addEventListener("submit", (event) => {
        // preventDefault() stops the browser's default submit behavior —
        // navigating to the form action and reloading. Nothing is sent anywhere.
        event.preventDefault(); // Never reload the page.
        if (!validate())
            return;
        // Build a mailto: link containing everything the user wrote.
        const recipient = "vinci.websites@example.com"; // <- replace with your real email
        const subject = `Nueva solicitud de sitio web · ${valueOf("name")}`;
        // Array of strings; `${ }` interpolations are evaluated left to right.
        // `|| "(sin especificar)"` falls back on empty string ("" is falsy).
        const bodyLines = [
            `Nombre: ${valueOf("name")}`,
            `Negocio / equipo: ${valueOf("business") || "(sin especificar)"}`,
            `Correo: ${valueOf("email")}`,
            `WhatsApp / teléfono: ${valueOf("phone") || "(sin especificar)"}`,
            `Plan que le interesa: ${labelOf("project-type")}`,
            `Presupuesto: ${labelOf("budget") || "(sin especificar)"}`,
            "",
            valueOf("message"),
        ];
        // encodeURIComponent percent-escapes characters that would break a URI
        // (spaces, &, =, newlines) so the values survive inside the URL.
        // .join("\n") concatenates the array into one newline-separated string.
        const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(bodyLines.join("\n"))}`;
        // WhatsApp deep link — opens a chat with our number, message prefilled.
        const whatsappNumber = "18298591920"; // <- replace with your real number
        const whatsapp = `https://wa.me/${whatsappNumber}?text=` +
            encodeURIComponent(`${subject}\n\n${bodyLines.join("\n")}`);
        const successLink = document.querySelector("#mailto-link");
        if (successLink)
            successLink.href = mailto;
        const whatsappLink = document.querySelector("#whatsapp-link");
        if (whatsappLink)
            whatsappLink.href = whatsapp;
        form.hidden = true;
        const panel = document.querySelector("#form-success");
        if (panel) {
            panel.hidden = false;
            // scrollIntoView scrolls so the element enters the viewport;
            // behavior:"smooth" asks the browser to animate it, block:"center"
            // centers it vertically.
            panel.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
    // "Write another message" button on the confirmation panel.
    const resetBtn = document.querySelector("#form-reset");
    // `?.` registers the listener only when the button exists.
    resetBtn === null || resetBtn === void 0 ? void 0 : resetBtn.addEventListener("click", () => {
        form.reset();
        form.hidden = false;
        const panel = document.querySelector("#form-success");
        if (panel)
            panel.hidden = true;
    });
})();
//# sourceMappingURL=contact.js.map