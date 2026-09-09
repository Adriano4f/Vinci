"use strict";
/*
 * contact.ts — validation for the "Contact us" form.
 * Compiled to js/contact.js and loaded only by contact.html.
 *
 * The site has no server, so instead of sending data anywhere the script:
 *   1. Checks every field and shows an inline error message when something
 *      is missing or invalid.
 *   2. On success, hides the form and shows a confirmation panel that
 *      contains a ready-made mailto: link, so pressing it opens the user's
 *      email app with the whole message already filled in.
 */
(() => {
    const form = document.querySelector("#contact-form");
    if (!form)
        return; // We are not on the contact page; do nothing.
    // --- Small helpers --------------------------------------------------------
    /** Returns the trimmed value of a named field. */
    const valueOf = (name) => {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement ||
            field instanceof HTMLSelectElement) {
            return field.value.trim();
        }
        return "";
    };
    /** Shows (or clears) the error message under a field. */
    const setError = (name, message) => {
        const slot = form.querySelector(`[data-error-for="${name}"]`);
        const field = form.querySelector(`[name="${name}"]`);
        if (slot)
            slot.textContent = message;
        if (field)
            field.classList.toggle("invalid", message !== "");
    };
    // Reasonably strict email pattern (same idea as checking a format in C++).
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    // --- Validation rules -----------------------------------------------------
    const validate = () => {
        let ok = true;
        if (valueOf("name").length < 2) {
            setError("name", "Please tell us your name.");
            ok = false;
        }
        else {
            setError("name", "");
        }
        if (!EMAIL_PATTERN.test(valueOf("email"))) {
            setError("email", "That email address does not look right.");
            ok = false;
        }
        else {
            setError("email", "");
        }
        if (valueOf("project-type") === "") {
            setError("project-type", "Please choose what kind of site you need.");
            ok = false;
        }
        else {
            setError("project-type", "");
        }
        if (valueOf("message").length < 10) {
            setError("message", "Tell us a little more about your idea (10+ characters).");
            ok = false;
        }
        else {
            setError("message", "");
        }
        return ok;
    };
    // Clear a field's error as soon as the user starts fixing it.
    form.addEventListener("input", (event) => {
        var _a;
        const target = event.target;
        if (target instanceof HTMLElement && target.getAttribute("name")) {
            setError((_a = target.getAttribute("name")) !== null && _a !== void 0 ? _a : "", "");
        }
    });
    // --- Submit ---------------------------------------------------------------
    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Never reload the page.
        if (!validate())
            return;
        // Build a mailto: link containing everything the user wrote.
        const recipient = "vinci.websites@example.com"; // <- replace with your real email
        const subject = `New website request — ${valueOf("name")}`;
        const bodyLines = [
            `Name: ${valueOf("name")}`,
            `Business / team: ${valueOf("business") || "(not given)"}`,
            `Email: ${valueOf("email")}`,
            `Project type: ${valueOf("project-type")}`,
            `Budget: ${valueOf("budget") || "(not given)"}`,
            "",
            valueOf("message"),
        ];
        const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(bodyLines.join("\n"))}`;
        const successLink = document.querySelector("#mailto-link");
        if (successLink)
            successLink.href = mailto;
        form.hidden = true;
        const panel = document.querySelector("#form-success");
        if (panel) {
            panel.hidden = false;
            panel.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
    // "Write another message" button on the confirmation panel.
    const resetBtn = document.querySelector("#form-reset");
    resetBtn === null || resetBtn === void 0 ? void 0 : resetBtn.addEventListener("click", () => {
        form.reset();
        form.hidden = false;
        const panel = document.querySelector("#form-success");
        if (panel)
            panel.hidden = true;
    });
})();
//# sourceMappingURL=contact.js.map