"use strict";
/*
 * pedido.ts — validation for the product order form (servicios/pedido.html).
 * Compiled to js/pedido.js and loaded only by servicios/pedido.html.
 *
 * Same idea as contact.ts: the site has no server, so the script validates
 * the fields and then shows a confirmation panel with a WhatsApp deep link
 * and a mailto: link carrying the whole message. Product pages link here
 * with ?servicio=<slug> to preselect the matching product.
 */
(() => {
    const form = document.querySelector("#contact-form");
    if (!form)
        return; // Not on the order page; do nothing.
    // --- Small helpers --------------------------------------------------------
    const valueOf = (name) => {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement ||
            field instanceof HTMLSelectElement) {
            return field.value.trim();
        }
        return "";
    };
    const labelOf = (name) => {
        const field = form.elements.namedItem(name);
        if (field instanceof HTMLSelectElement) {
            const option = field.selectedOptions[0];
            return option && option.value !== "" ? option.textContent.trim() : "";
        }
        return valueOf(name);
    };
    const setError = (name, message) => {
        const slot = form.querySelector(`[data-error-for="${name}"]`);
        const field = form.querySelector(`[name="${name}"]`);
        if (slot)
            slot.textContent = message;
        if (field)
            field.classList.toggle("invalid", message !== "");
    };
    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const PHONE_PATTERN = /^[+()0-9][0-9()\-\s]{6,}$/;
    // --- Preselect the product the visitor came from ---------------------------
    const productSelect = form.elements.namedItem("product");
    const product = new URLSearchParams(window.location.search).get("servicio");
    if (productSelect instanceof HTMLSelectElement && product) {
        productSelect.value = product;
    }
    // --- Validation rules ------------------------------------------------------
    const validate = () => {
        let ok = true;
        if (valueOf("name").length < 2) {
            setError("name", "Por favor dinos tu nombre.");
            ok = false;
        }
        else {
            setError("name", "");
        }
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
        if (valueOf("product") === "") {
            setError("product", "Elige qué producto quieres.");
            ok = false;
        }
        else {
            setError("product", "");
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
    form.addEventListener("input", (event) => {
        var _a;
        const target = event.target;
        if (target instanceof HTMLElement && target.getAttribute("name")) {
            setError((_a = target.getAttribute("name")) !== null && _a !== void 0 ? _a : "", "");
        }
    });
    // --- Submit ----------------------------------------------------------------
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!validate())
            return;
        const recipient = "vinci.websites@example.com"; // <- replace with your real email
        const subject = `Nuevo pedido de producto · ${valueOf("name")}`;
        const bodyLines = [
            `Nombre: ${valueOf("name")}`,
            `Correo: ${valueOf("email")}`,
            `WhatsApp / teléfono: ${valueOf("phone") || "(sin especificar)"}`,
            `Producto: ${labelOf("product")}`,
            "",
            valueOf("message"),
        ];
        const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(bodyLines.join("\n"))}`;
        const whatsappNumber = "18298591920"; // <- replace with your real number
        const whatsapp = `https://wa.me/${whatsappNumber}?text=` +
            encodeURIComponent(`${subject}\n\n${bodyLines.join("\n")}`);
        const mailtoLink = document.querySelector("#mailto-link");
        if (mailtoLink)
            mailtoLink.href = mailto;
        const whatsappLink = document.querySelector("#whatsapp-link");
        if (whatsappLink)
            whatsappLink.href = whatsapp;
        form.hidden = true;
        const panel = document.querySelector("#form-success");
        if (panel) {
            panel.hidden = false;
            panel.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
    const resetBtn = document.querySelector("#form-reset");
    resetBtn === null || resetBtn === void 0 ? void 0 : resetBtn.addEventListener("click", () => {
        form.reset();
        form.hidden = false;
        const panel = document.querySelector("#form-success");
        if (panel)
            panel.hidden = true;
    });
})();
//# sourceMappingURL=pedido.js.map