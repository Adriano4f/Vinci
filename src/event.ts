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

interface ScheduleItem {
  time: string;
  title: string;
  where: string;
  type: "conferencia" | "taller" | "networking" | "general";
}

const SCHEDULE: ScheduleItem[] = [
  { time: "09:00", title: "Registro y bienvenida", where: "Salón Principal · Apertura", type: "general" },
  { time: "10:00", title: "Inteligencia Artificial en la vida real", where: "Juan Pérez · Conferencia", type: "conferencia" },
  { time: "11:30", title: "Desarrollo de aplicaciones web", where: "María Gómez · Taller", type: "taller" },
  { time: "13:00", title: "Receso", where: "Área de alimentos", type: "general" },
  { time: "14:00", title: "Ciberseguridad: un mundo más seguro", where: "Carlos Ramírez · Conferencia", type: "conferencia" },
  { time: "16:00", title: "Panel: El futuro del trabajo", where: "Moderadora: Laura Torres · Panel", type: "networking" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Cuándo y dónde será el evento?",
    a: "Del 25 al 27 de abril de 2027 en el Centro de Convenciones, Santo Domingo, RD. Puertas abiertas de 8:00 a.m. a 6:00 p.m. cada día.",
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
  if (!document.querySelector("[data-event-page]")) return;

  // --- Agenda timeline ----------------------------------------------------

  const agenda = document.querySelector<HTMLElement>("[data-agenda]");
  if (agenda) {
    agenda.innerHTML = SCHEDULE.map(
      (item) => `
      <li class="agenda-item reveal" data-type="${item.type}">
        <span class="agenda-time">${item.time}</span>
        <span class="agenda-dot" aria-hidden="true"></span>
        <div class="agenda-body">
          <h3>${item.title}</h3>
          <p>${item.where}</p>
        </div>
      </li>`
    ).join("");
  }

  const agendaFilters = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-agenda-filter]")
  );
  agendaFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      agendaFilters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.agendaFilter ?? "todos";
      document
        .querySelectorAll<HTMLElement>(".agenda-item")
        .forEach((item) => {
          const type = item.dataset.type ?? "";
          item.hidden = filter !== "todos" && type !== filter;
        });
    });
  });

  // --- Countdown -----------------------------------------------------------

  const units: Record<string, HTMLElement | null> = {};
  ["days", "hours", "minutes", "seconds"].forEach((u) => {
    units[u] = document.querySelector<HTMLElement>(`[data-count="${u}"]`);
  });
  if (units.days) units.days.textContent = COUNTDOWN.days;
  if (units.hours) units.hours.textContent = COUNTDOWN.hours;
  if (units.minutes) units.minutes.textContent = COUNTDOWN.minutes;
  if (units.seconds) units.seconds.textContent = COUNTDOWN.seconds;

  // --- Participants arrows --------------------------------------------------

  const track = document.querySelector<HTMLElement>("[data-people-track]");
  document.querySelectorAll<HTMLButtonElement>("[data-people-nav]").forEach(
    (btn) => {
      btn.addEventListener("click", () => {
        if (!track) return;
        const dir = btn.dataset.peopleNav === "next" ? 1 : -1;
        track.scrollBy({ left: dir * (track.clientWidth * 0.8), behavior: "smooth" });
      });
    }
  );

  // --- FAQ accordion ----------------------------------------------------------

  const faqList = document.querySelector<HTMLElement>("[data-faq]");
  if (faqList) {
    faqList.innerHTML = FAQS.map(
      (f, i) => `
      <div class="faq-item reveal">
        <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
          <span>${f.q}</span><span class="faq-icon" aria-hidden="true">+</span>
        </button>
        <div class="faq-a" id="faq-a-${i}"><p>${f.a}</p></div>
      </div>`
    ).join("");

    faqList.addEventListener("click", (event) => {
      const btn = (event.target as HTMLElement).closest<HTMLButtonElement>(".faq-q");
      if (!btn) return;
      const item = btn.closest<HTMLElement>(".faq-item");
      const open = item?.classList.toggle("open") ?? false;
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  // --- Header + mobile nav -------------------------------------------------

  const header = document.querySelector<HTMLElement>(".ev-header");
  const onScroll = (): void => {
    header?.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector<HTMLButtonElement>(".ev-nav-toggle");
  const links = document.querySelector<HTMLElement>(".ev-nav-links");
  toggle?.addEventListener("click", () => {
    const open = links?.classList.toggle("open") ?? false;
    toggle.setAttribute("aria-expanded", String(open));
  });
  links?.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).tagName === "A") {
      links.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });

  // Active link underline on scroll (scroll-spy): marks the last section
  // whose top has passed the reading line (40% down the viewport).
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("section[id]")
  );
  const navAnchors = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".ev-nav-links a[href^='#']")
  );
  const updateSpy = (): void => {
    const line = window.scrollY + window.innerHeight * 0.4;
    let current = sections[0]?.id ?? "";
    sections.forEach((s) => {
      if (s.offsetTop <= line) current = s.id;
    });
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom) current = sections[sections.length - 1]?.id ?? current;
    navAnchors.forEach((a) => {
      const active = a.getAttribute("href") === `#${current}`;
      if (!a.classList.contains("ev-btn")) a.classList.toggle("active", active);
    });
  };
  window.addEventListener("scroll", updateSpy, { passive: true });
  updateSpy();

  // --- Scroll reveal ---------------------------------------------------------

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document
    .querySelectorAll<HTMLElement>(".reveal")
    .forEach((el) => revealObserver.observe(el));
})();
