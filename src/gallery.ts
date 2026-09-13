/*
 * gallery.ts — category filter for the templates gallery.
 * Compiled to js/gallery.js and loaded only by templates.html.
 *
 * Each card carries a data-category attribute (e.g. data-category="food")
 * and each filter button carries data-filter. Clicking a button shows only
 * the matching cards; "all" shows everything.
 *
 * TYPE NOTES:
 *   - querySelectorAll<T> is generic for compile-time narrowing only; the
 *     emitted JS is a plain querySelectorAll returning a static NodeList.
 *   - `.forEach((x) => {...})` on a NodeList calls the callback once per
 *     element; the arrow function is a closure over `button`/`category`.
 *   - `dataset.*` is a DOMStringMap view over data-* attributes: strings only.
 *   - `?? "all"` — nullish coalescing: the fallback applies only when the
 *     attribute is absent (undefined), not on empty string.
 */

(() => {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".filter-btn");
  const cards = document.querySelectorAll<HTMLElement>(".template-card");
  // Early return: on any other page this script is absent, so do nothing.
  if (buttons.length === 0 || cards.length === 0) return;

  buttons.forEach((button) => {
    // The listener registered here closes over `button` (the element it was
    // bound to) and `buttons`/`cards` (shared NodeLists).
    button.addEventListener("click", () => {
      const category = button.dataset.filter ?? "all";

      // Visual state of the buttons.
      buttons.forEach((b) => {
        // `b === button` — reference equality: identical object in memory.
        const isActive = b === button;
        // classList.toggle(name, force): force=true adds, false removes —
        // deterministic two-state set in one call.
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-pressed", String(isActive));
      });

      // Show / hide cards.
      cards.forEach((card) => {
        const show = category === "all" || card.dataset.category === category;
        card.classList.toggle("hidden", !show);
      });
    });
  });
})();
