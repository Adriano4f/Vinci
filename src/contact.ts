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
  const form = document.querySelector<HTMLFormElement>("#contact-form");
  if (!form) return; // We are not on the contact page; do nothing.

  // --- Small helpers --------------------------------------------------------

  /** Returns the trimmed value of a named field. */
  const valueOf = (name: string): string => {
    const field = form.elements.namedItem(name);
    if (
      field instanceof HTMLInputElement ||
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLSelectElement
    ) {
      return field.value.trim();
    }
    return "";
  };

  /** Shows (or clears) the error message under a field. */
  const setError = (name: string, message: string): void => {
    const slot = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    const field = form.querySelector<HTMLElement>(`[name="${name}"]`);
    if (slot) slot.textContent = message;
    if (field) field.classList.toggle("invalid", message !== "");
  };

  // Reasonably strict email pattern (same idea as checking a format in C++).
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // --- Validation rules -----------------------------------------------------

  const validate = (): boolean => {
    let ok = true;

    if (valueOf("name").length < 2) {
      setError("name", "Por favor dinos tu nombre.");
      ok = false;
    } else {
      setError("name", "");
    }

    if (!EMAIL_PATTERN.test(valueOf("email"))) {
      setError("email", "Ese correo electrónico no parece correcto.");
      ok = false;
    } else {
      setError("email", "");
    }

    if (valueOf("project-type") === "") {
      setError("project-type", "Elige qué tipo de sitio necesitas.");
      ok = false;
    } else {
      setError("project-type", "");
    }

    if (valueOf("message").length < 10) {
      setError("message", "Cuéntanos un poco más sobre tu idea (mínimo 10 caracteres).");
      ok = false;
    } else {
      setError("message", "");
    }

    return ok;
  };

  // Clear a field's error as soon as the user starts fixing it.
  form.addEventListener("input", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.getAttribute("name")) {
      setError(target.getAttribute("name") ?? "", "");
    }
  });

  // --- Submit ---------------------------------------------------------------

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Never reload the page.
    if (!validate()) return;

    // Build a mailto: link containing everything the user wrote.
    const recipient = "vinci.websites@example.com"; // <- replace with your real email
    const subject = `Nueva solicitud de sitio web — ${valueOf("name")}`;
    const bodyLines = [
      `Nombre: ${valueOf("name")}`,
      `Negocio / equipo: ${valueOf("business") || "(sin especificar)"}`,
      `Correo: ${valueOf("email")}`,
      `Tipo de proyecto: ${valueOf("project-type")}`,
      `Presupuesto: ${valueOf("budget") || "(sin especificar)"}`,
      "",
      valueOf("message"),
    ];
    const mailto =
      `mailto:${recipient}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    const successLink = document.querySelector<HTMLAnchorElement>("#mailto-link");
    if (successLink) successLink.href = mailto;

    form.hidden = true;
    const panel = document.querySelector<HTMLElement>("#form-success");
    if (panel) {
      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  // "Write another message" button on the confirmation panel.
  const resetBtn = document.querySelector<HTMLButtonElement>("#form-reset");
  resetBtn?.addEventListener("click", () => {
    form.reset();
    form.hidden = false;
    const panel = document.querySelector<HTMLElement>("#form-success");
    if (panel) panel.hidden = true;
  });
})();
