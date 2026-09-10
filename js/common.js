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
 */
(() => {
    var _a;
    // --- 1. Mobile menu -------------------------------------------------------
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-links");
    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }
    // --- 2. "Otros servicios" dropdown -----------------------------------------
    // Desktop opens it on hover/focus (pure CSS). On mobile there is no hover,
    // so the first tap expands the submenu; once it is open the link behaves
    // normally and navigates to the services hub.
    const dropToggle = document.querySelector(".nav-drop");
    const dropParent = dropToggle === null || dropToggle === void 0 ? void 0 : dropToggle.closest(".has-dropdown");
    // Must match the navbar collapse breakpoint in main.css.
    const mobileQuery = window.matchMedia("(max-width: 820px)");
    if (dropToggle && dropParent) {
        // On desktop the menu opens via CSS :hover/:focus-within, so keep the
        // announced state in sync with what is actually shown.
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
    const segments = window.location.pathname.split("/").filter(Boolean);
    const lastSegment = (_a = segments[segments.length - 1]) !== null && _a !== void 0 ? _a : "";
    let route = "inicio";
    if (segments.includes("servicios"))
        route = "servicios";
    else if (lastSegment === "templates.html")
        route = "plantillas";
    else if (lastSegment === "contact.html")
        route = "contacto";
    document.querySelectorAll("[data-route]").forEach((link) => {
        if (link.dataset.route === route)
            link.classList.add("active");
    });
    // --- 4. Footer year --------------------------------------------------------
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = String(new Date().getFullYear());
    });
    // --- 5. Reveal on scroll ----------------------------------------------------
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length > 0 && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach((el) => observer.observe(el));
    }
    else {
        revealEls.forEach((el) => el.classList.add("visible"));
    }
})();
//# sourceMappingURL=common.js.map