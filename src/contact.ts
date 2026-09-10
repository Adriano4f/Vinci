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

  /** For a <select>, returns the visible label of the chosen option
      ("" when the placeholder is selected); other fields fall back to valueOf. */
  const labelOf = (name: string): string => {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLSelectElement) {
      const option = field.selectedOptions[0];
      return option && option.value !== "" ? option.textContent.trim() : "";
    }
    return valueOf(name);
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
  // Digits, spaces and the usual phone punctuation; only checked when filled.
  const PHONE_PATTERN = /^[+()0-9][0-9()\-\s]{6,}$/;

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

    if (valueOf("phone") !== "" && !PHONE_PATTERN.test(valueOf("phone"))) {
      setError("phone", "Ese número no parece correcto.");
      ok = false;
    } else {
      setError("phone", "");
    }

    if (valueOf("project-type") === "") {
      setError("project-type", "Elige qué plan te interesa.");
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

  // The budget select only makes sense for the personalized plan, so it
  // stays hidden until that option is chosen.
  const budgetField = form.querySelector<HTMLElement>("#budget-field");
  const typeSelect = form.elements.namedItem("project-type");
  const syncBudgetVisibility = (): void => {
    if (!budgetField || !(typeSelect instanceof HTMLSelectElement)) return;
    budgetField.hidden = typeSelect.value !== "custom";
  };
  if (typeSelect instanceof HTMLSelectElement) {
    typeSelect.addEventListener("change", syncBudgetVisibility);
  }
  syncBudgetVisibility();

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
      `WhatsApp / teléfono: ${valueOf("phone") || "(sin especificar)"}`,
      `Plan que le interesa: ${labelOf("project-type")}`,
      `Presupuesto: ${labelOf("budget") || "(sin especificar)"}`,
      "",
      valueOf("message"),
    ];
    const mailto =
      `mailto:${recipient}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    // WhatsApp deep link — opens a chat with our number, message prefilled.
    const whatsappNumber = "18298591920"; // <- replace with your real number
    const whatsapp =
      `https://wa.me/${whatsappNumber}?text=` +
      encodeURIComponent(`${subject}\n\n${bodyLines.join("\n")}`);

    const successLink = document.querySelector<HTMLAnchorElement>("#mailto-link");
    if (successLink) successLink.href = mailto;
    const whatsappLink = document.querySelector<HTMLAnchorElement>("#whatsapp-link");
    if (whatsappLink) whatsappLink.href = whatsapp;

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
