/*
 * gallery.ts — category filter for the templates gallery.
 * Compiled to js/gallery.js and loaded only by templates.html.
 *
 * Each card carries a data-category attribute (e.g. data-category="food")
 * and each filter button carries data-filter. Clicking a button shows only
 * the matching cards; "all" shows everything.
 */

(() => {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".filter-btn");
  const cards = document.querySelectorAll<HTMLElement>(".template-card");
  if (buttons.length === 0 || cards.length === 0) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.filter ?? "all";

      // Visual state of the buttons.
      buttons.forEach((b) => {
        const isActive = b === button;
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
