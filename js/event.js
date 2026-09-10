"use strict";
/*
 * event.ts — interactions for the "Nexus Summit" event demo
 * (examples/event.html). Compiled to js/event.js.
 *
 * What it does:
 *   - live countdown to the event date
 *   - agenda filters (Todos / Conferencias / Talleres / Networking)
 *   - participants row with scroll arrows
 *   - FAQ accordion
 *   - sticky header state, mobile nav, scroll reveal
 */
// Fixed countdown values for this fictional demo event.
const COUNTDOWN = { days: "676", hours: "07", minutes: "06", seconds: "07" };
const SCHEDULE = [
    { time: "09:00", title: "Registro y bienvenida", where: "Salón Principal · Apertura", type: "general" },
    { time: "10:00", title: "Inteligencia Artificial en la vida real", where: "Juan Pérez · Conferencia", type: "conferencia" },
    { time: "11:30", title: "Desarrollo de aplicaciones web", where: "María Gómez · Taller", type: "taller" },
    { time: "13:00", title: "Receso", where: "Área de alimentos", type: "general" },
    { time: "14:00", title: "Ciberseguridad: un mundo más seguro", where: "Carlos Ramírez · Conferencia", type: "conferencia" },
    { time: "16:00", title: "Panel: El futuro del trabajo", where: "Moderadora: Laura Torres · Panel", type: "networking" },
];
const FAQS = [
    {
        q: "¿Cuándo y dónde será el evento?",
        a: "Del 25 al 27 de abril de 2027 en el Instituto Politécnico Loyola, San Cristóbal, RD. Puertas abiertas de 8:00 a.m. a 6:00 p.m. cada día.",
    },
    {
        q: "¿La entrada tiene algún costo?",
        a: "Sí. La entrada general cuesta RD$2,500 y la experiencia VIP RD$4,500. Ambas incluyen acceso a todas las conferencias.",
    },
    {
        q: "¿Necesito registrarme?",
        a: "Sí, el cupo es limitado. Regístrate con el botón «Reservar mi lugar» y recibirás tu confirmación por correo o WhatsApp.",
    },
    {
        q: "¿Qué incluye la entrada?",
        a: "Acceso al evento, todas las conferencias, talleres y la zona de networking. La VIP suma zona exclusiva y meet & greet con los ponentes.",
    },
    {
        q: "¿Puedo cancelar mi registro?",
        a: "Sí. Escríbenos por WhatsApp o correo hasta una semana antes del evento y gestionamos la cancelación o el cambio de nombre.",
    },
];
(() => {
    if (!document.querySelector("[data-event-page]"))
        return;
    // --- Agenda timeline ----------------------------------------------------
    const agenda = document.querySelector("[data-agenda]");
    if (agenda) {
        agenda.innerHTML = SCHEDULE.map((item) => `
      <li class="agenda-item reveal" data-type="${item.type}">
        <span class="agenda-time">${item.time}</span>
        <span class="agenda-dot" aria-hidden="true"></span>
        <div class="agenda-body">
          <h3>${item.title}</h3>
          <p>${item.where}</p>
        </div>
      </li>`).join("");
    }
    const agendaFilters = Array.from(document.querySelectorAll("[data-agenda-filter]"));
    agendaFilters.forEach((btn) => {
        btn.addEventListener("click", () => {
            var _a;
            agendaFilters.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = (_a = btn.dataset.agendaFilter) !== null && _a !== void 0 ? _a : "todos";
            document
                .querySelectorAll(".agenda-item")
                .forEach((item) => {
                var _a;
                const type = (_a = item.dataset.type) !== null && _a !== void 0 ? _a : "";
                item.hidden = filter !== "todos" && type !== filter;
            });
        });
    });
    // --- Countdown -----------------------------------------------------------
    const units = {};
    ["days", "hours", "minutes", "seconds"].forEach((u) => {
        units[u] = document.querySelector(`[data-count="${u}"]`);
    });
    if (units.days)
        units.days.textContent = COUNTDOWN.days;
    if (units.hours)
        units.hours.textContent = COUNTDOWN.hours;
    if (units.minutes)
        units.minutes.textContent = COUNTDOWN.minutes;
    if (units.seconds)
        units.seconds.textContent = COUNTDOWN.seconds;
    // --- Participants arrows --------------------------------------------------
    const track = document.querySelector("[data-people-track]");
    document.querySelectorAll("[data-people-nav]").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (!track)
                return;
            const dir = btn.dataset.peopleNav === "next" ? 1 : -1;
            track.scrollBy({ left: dir * (track.clientWidth * 0.8), behavior: "smooth" });
        });
    });
    // --- FAQ accordion ----------------------------------------------------------
    const faqList = document.querySelector("[data-faq]");
    if (faqList) {
        faqList.innerHTML = FAQS.map((f, i) => `
      <div class="faq-item reveal">
        <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
          <span>${f.q}</span><span class="faq-icon" aria-hidden="true">+</span>
        </button>
        <div class="faq-a" id="faq-a-${i}"><p>${f.a}</p></div>
      </div>`).join("");
        faqList.addEventListener("click", (event) => {
            var _a;
            const btn = event.target.closest(".faq-q");
            if (!btn)
                return;
            const item = btn.closest(".faq-item");
            const open = (_a = item === null || item === void 0 ? void 0 : item.classList.toggle("open")) !== null && _a !== void 0 ? _a : false;
            btn.setAttribute("aria-expanded", String(open));
        });
    }
    // --- Header + mobile nav -------------------------------------------------
    const header = document.querySelector(".ev-header");
    const onScroll = () => {
        header === null || header === void 0 ? void 0 : header.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const toggle = document.querySelector(".ev-nav-toggle");
    const links = document.querySelector(".ev-nav-links");
    toggle === null || toggle === void 0 ? void 0 : toggle.addEventListener("click", () => {
        var _a;
        const open = (_a = links === null || links === void 0 ? void 0 : links.classList.toggle("open")) !== null && _a !== void 0 ? _a : false;
        toggle.setAttribute("aria-expanded", String(open));
    });
    links === null || links === void 0 ? void 0 : links.addEventListener("click", (event) => {
        if (event.target.tagName === "A") {
            links.classList.remove("open");
            toggle === null || toggle === void 0 ? void 0 : toggle.setAttribute("aria-expanded", "false");
        }
    });
    // Active link underline on scroll (scroll-spy): marks the last section
    // whose top has passed the reading line (40% down the viewport).
    // Sections without a nav entry (countdown, galeria, CTA) keep the
    // nearest previous nav item highlighted; Entradas highlights the
    // "Registrarme" button instead of a text link.
    const navAnchors = Array.from(document.querySelectorAll(".ev-nav-links a[href^='#']"));
    const navIds = new Set(navAnchors.map((a) => { var _a, _b; return (_b = (_a = a.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : ""; }));
    const sections = Array.from(document.querySelectorAll("section[id]")).filter((s) => navIds.has(s.id));
    const updateSpy = () => {
        var _a, _b, _c, _d;
        const line = window.scrollY + window.innerHeight * 0.4;
        let current = (_b = (_a = sections[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : "";
        sections.forEach((s) => {
            if (s.offsetTop <= line)
                current = s.id;
        });
        const atBottom = window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 2;
        if (atBottom)
            current = (_d = (_c = sections[sections.length - 1]) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : current;
        navAnchors.forEach((a) => {
            a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
        });
    };
    window.addEventListener("scroll", updateSpy, { passive: true });
    updateSpy();
    // --- Scroll reveal ---------------------------------------------------------
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document
        .querySelectorAll(".reveal")
        .forEach((el) => revealObserver.observe(el));
})();
//# sourceMappingURL=event.js.map