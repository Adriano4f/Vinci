/*
 * restaurant.ts — interactive menu logic for the "Brasa & Sabor" demo
 * (examples/restaurant.html). Compiled to js/restaurant.js.
 *
 * The whole menu lives in the MENU data structure below, so adding or
 * removing a dish only means editing this array — the HTML renders itself.
 */

interface Dish {
  name: string;
  description: string;
  price: string;
  ingredients: string[];
  tags?: string[];   // e.g. "FAVORITO", "NUEVO", "PICANTE"
  image?: string;    // big photo shown in the dish modal
  group?: string;    // sub-heading inside a category (used by Bebidas)
}

interface Category {
  id: string;
  name: string;
  tagline: string;
  dishes: Dish[];
}

// The 4 "house favorites" rendered as big photo cards before the menu.
const FEATURED: Dish[] = [
  {
    name: "Costilla Brasa",
    description:
      "Costilla de cerdo cocinada lentamente, glaseada con nuestra salsa de la casa.",
    price: "$14.50",
    tags: ["FAVORITO"],
    ingredients: ["costilla de cerdo", "salsa de la casa", "especias ahumadas", "miel de caña"],
    image: "img/costilla.jpg",
  },
  {
    name: "Burger Brasa",
    description:
      "Carne de res, queso cheddar, cebolla caramelizada y salsa especial.",
    price: "$11.90",
    tags: ["FAVORITO"],
    ingredients: ["carne de res", "cheddar", "cebolla caramelizada", "pan brioche"],
    image: "img/burger.jpg",
  },
  {
    name: "Pasta Cremosa",
    description:
      "Pasta artesanal con salsa cremosa, parmesano y hierbas frescas.",
    price: "$12.50",
    tags: ["NUEVO"],
    ingredients: ["pasta artesanal", "crema", "parmesano", "albahaca", "pimienta negra"],
    image: "img/pasta.jpg",
  },
  {
    name: "Pollo Ahumado",
    description:
      "Pollo marinado con especias de la casa y terminado a la brasa.",
    price: "$13.90",
    tags: ["ESPECIAL DE LA CASA"],
    ingredients: ["pollo de corral", "especias de la casa", "limón asado", "romero"],
    image: "img/pollo.jpg",
  },
];

const MENU: Category[] = [
  {
    id: "entradas",
    name: "Entradas",
    tagline: "Para comenzar la experiencia.",
    dishes: [
      {
        name: "Croquetas de la Casa",
        description: "Croquetas crujientes rellenas de queso y especias.",
        price: "$7.50",
        ingredients: ["queso", "bechamel", "especias de la casa", "panko"],
        tags: ["FAVORITO"],
      },
      {
        name: "Carpaccio de Res",
        description: "Láminas finas de res, parmesano, rúcula y aceite de oliva.",
        price: "$9.90",
        ingredients: ["lomo de res", "parmesano", "rúcula", "aceite de oliva", "limón"],
      },
      {
        name: "Sopa de Cebolla Gratinada",
        description: "Cebolla caramelizada, caldo de la casa y queso gratinado.",
        price: "$6.80",
        ingredients: ["cebolla", "caldo de res", "queso gruyere", "pan tostado"],
      },
      {
        name: "Tostones Brasa",
        description: "Tostones con mojo criollo y aguacate machacado.",
        price: "$5.50",
        ingredients: ["plátano verde", "mojo criollo", "aguacate", "sal de ahumar"],
        tags: ["VEGETARIANO"],
      },
    ],
  },
  {
    id: "carnes",
    name: "Carnes",
    tagline: "Fuego lento y corte honesto.",
    dishes: [
      {
        name: "Costilla Brasa",
        description: "Costilla de cerdo cocinada lentamente, glaseada con nuestra salsa de la casa.",
        price: "$14.50",
        ingredients: ["costilla de cerdo", "salsa de la casa", "especias ahumadas", "miel de caña"],
        tags: ["FAVORITO"],
        image: "img/costilla.jpg",
      },
      {
        name: "Churrasco a la Parrilla",
        description: "Corte a la parrilla con chimichurri y papas rústicas.",
        price: "$18.90",
        ingredients: ["churrasco", "chimichurri", "papas rústicas", "ajo confitado"],
      },
      {
        name: "Entraña al Ajillo Picante",
        description: "Entraña sellada al momento con ajillo y un toque de picante.",
        price: "$16.50",
        ingredients: ["entraña", "ajo", "chile", "aceite de oliva", "perejil"],
        tags: ["PICANTE"],
      },
    ],
  },
  {
    id: "hamburguesas",
    name: "Hamburguesas",
    tagline: "Pan brioche, brasa y punto.",
    dishes: [
      {
        name: "Burger Brasa",
        description: "Carne de res, queso cheddar, cebolla caramelizada y salsa especial.",
        price: "$11.90",
        ingredients: ["carne de res", "cheddar", "cebolla caramelizada", "pan brioche"],
        tags: ["FAVORITO"],
        image: "img/burger.jpg",
      },
      {
        name: "Burger Ahumada Doble",
        description: "Doble carne ahumada, doble cheddar y tocineta crocante.",
        price: "$13.50",
        ingredients: ["doble res", "doble cheddar", "tocineta", "pepinillos", "pan brioche"],
      },
      {
        name: "Burger de la Huerta",
        description: "Portobello a la brasa, queso de cabra y rúcula fresca.",
        price: "$10.90",
        ingredients: ["portobello", "queso de cabra", "rúcula", "pan brioche"],
        tags: ["VEGETARIANO"],
      },
    ],
  },
  {
    id: "pastas",
    name: "Pastas",
    tagline: "Hechas a mano, servidas calientes.",
    dishes: [
      {
        name: "Pasta Cremosa",
        description: "Pasta artesanal con salsa cremosa, parmesano y hierbas frescas.",
        price: "$12.50",
        ingredients: ["pasta artesanal", "crema", "parmesano", "albahaca"],
        tags: ["NUEVO"],
        image: "img/pasta.jpg",
      },
      {
        name: "Ñoquis al Pesto",
        description: "Ñoquis suaves con pesto de albahaca y piñones tostados.",
        price: "$11.90",
        ingredients: ["ñoquis", "pesto", "piñones", "parmesano"],
        tags: ["VEGETARIANO"],
      },
      {
        name: "Pasta de la Brasa",
        description: "Fettuccine con tiras de res braseada y salsa de la casa.",
        price: "$13.90",
        ingredients: ["fettuccine", "res braseada", "salsa de la casa", "parmesano"],
      },
    ],
  },
  {
    id: "platos-fuertes",
    name: "Platos fuertes",
    tagline: "Lo que se sirve cuando hay hambre de verdad.",
    dishes: [
      {
        name: "Pollo Ahumado",
        description: "Pollo marinado con especias de la casa y terminado a la brasa.",
        price: "$13.90",
        ingredients: ["pollo de corral", "especias de la casa", "limón asado", "romero"],
        tags: ["ESPECIAL DE LA CASA"],
        image: "img/pollo.jpg",
      },
      {
        name: "Salmón a la Leña",
        description: "Lomo de salmón a la leña con mantequilla de eneldo.",
        price: "$17.50",
        ingredients: ["salmón", "mantequilla de eneldo", "limón", "espárragos"],
      },
      {
        name: "Arroz Brasa",
        description: "Arroz cremoso con vegetales asados al fuego.",
        price: "$12.90",
        ingredients: ["arroz", "vegetales asados", "caldo de la casa", "parmesano"],
        tags: ["VEGETARIANO"],
      },
    ],
  },
  {
    id: "ensaladas",
    name: "Ensaladas",
    tagline: "Frescas, de temporada y con carácter.",
    dishes: [
      {
        name: "Ensalada de la Huerta",
        description: "Hojas frescas, tomate, pepino y vinagreta de la casa.",
        price: "$8.50",
        ingredients: ["hojas verdes", "tomate", "pepino", "vinagreta de la casa"],
        tags: ["VEGETARIANO"],
      },
      {
        name: "César a la Brasa",
        description: "Lechuga asada, parmesano, crutones y aderezo césar.",
        price: "$9.90",
        ingredients: ["lechuga romana", "parmesano", "crutones", "aderezo césar"],
      },
      {
        name: "Quinoa y Aguacate",
        description: "Quinoa, aguacate, mango y limón fresco.",
        price: "$9.50",
        ingredients: ["quinoa", "aguacate", "mango", "limón", "cilantro"],
        tags: ["VEGETARIANO", "NUEVO"],
      },
    ],
  },
  {
    id: "bebidas",
    name: "Bebidas",
    tagline: "Para acompañar, o para quedarse un rato más.",
    dishes: [
      { name: "Refresco de la Casa", description: "Limón, hierbabuena y un toque de jengibre.", price: "$2.50", ingredients: ["limón", "hierbabuena", "jengibre", "soda"], group: "Refrescos" },
      { name: "Refresco Cola", description: "Bien frío, con hielo y rodaja de limón.", price: "$2.00", ingredients: ["refresco", "hielo", "limón"], group: "Refrescos" },
      { name: "Jugo de Chinola", description: "Chinola natural batida al momento.", price: "$3.50", ingredients: ["chinola", "agua", "azúcar"], group: "Jugos naturales" },
      { name: "Jugo Verde", description: "Piña, apio, pepino y limón.", price: "$3.90", ingredients: ["piña", "apio", "pepino", "limón"], group: "Jugos naturales" },
      { name: "Mojito de Frutos Rojos", description: "Sin alcohol: frutos rojos, hierbabuena y soda.", price: "$5.50", ingredients: ["frutos rojos", "hierbabuena", "soda", "limón"], group: "Cócteles sin alcohol" },
      { name: "Piña Colada Virgen", description: "Piña y coco batidos, sin alcohol.", price: "$5.90", ingredients: ["piña", "crema de coco", "hielo"], tags: ["NUEVO"], group: "Cócteles sin alcohol" },
      { name: "Espresso", description: "Café de tueste medio, servido corto.", price: "$2.50", ingredients: ["café de tueste medio"], group: "Café" },
      { name: "Cortado", description: "Espresso con un toque de leche espumada.", price: "$3.00", ingredients: ["espresso", "leche"], group: "Café" },
      { name: "Agua Mineral", description: "Botella fría, con o sin gas.", price: "$1.50", ingredients: ["agua mineral"], group: "Agua" },
      { name: "Agua con Gas y Lima", description: "Con rodaja de lima y mucho hielo.", price: "$2.00", ingredients: ["agua con gas", "lima", "hielo"], group: "Agua" },
    ],
  },
  {
    id: "postres",
    name: "Postres",
    tagline: "El final también cuenta la historia.",
    dishes: [
      {
        name: "Volcán de Chocolate",
        description: "Bizcocho tibio con corazón de chocolate y helado de vainilla.",
        price: "$7.50",
        ingredients: ["chocolate", "mantequilla", "helado de vainilla", "caramelo"],
        tags: ["ESPECIAL DE LA CASA"],
        image: "img/postre.jpg",
      },
      {
        name: "Flan de la Casa",
        description: "Flan cremoso con caramelo oscuro.",
        price: "$5.50",
        ingredients: ["leche", "huevo", "caramelo", "vainilla"],
      },
      {
        name: "Tres Leches de Coco",
        description: "Bizcocho esponjoso bañado en tres leches y coco tostado.",
        price: "$6.50",
        ingredients: ["bizcocho", "tres leches", "coco tostado"],
      },
      {
        name: "Cheesecake de Maracuyá",
        description: "Cremoso, con coulis de maracuyá y base crocante.",
        price: "$6.90",
        ingredients: ["queso crema", "maracuyá", "galleta", "mantequilla"],
        tags: ["NUEVO"],
      },
    ],
  },
];

(() => {
  const root = document.querySelector<HTMLElement>("[data-menu-root]");
  if (!root) return; // Not on the restaurant demo page.

  // --- Render ---------------------------------------------------------------

  const tagBadge = (tag: string): string =>
    `<span class="dish-tag">${tag}</span>`;

  const dishRow = (dish: Dish, index: number, catId: string): string => `
    <li class="dish reveal" data-dish="${catId}:${index}" tabindex="0" role="button"
        aria-haspopup="dialog" aria-label="Ver detalles de ${dish.name}">
      <div class="dish-line">
        <span class="dish-name">${dish.name}${dish.tags ? " " + dish.tags.map(tagBadge).join("") : ""}</span>
        <span class="dish-dots" aria-hidden="true"></span>
        <span class="dish-price">${dish.price}</span>
      </div>
      <p class="dish-desc">${dish.description}</p>
    </li>`;

  const categorySection = (cat: Category): string => {
    // Split dishes into sub-groups when they carry one (Bebidas).
    const groups = new Map<string, Dish[]>();
    cat.dishes.forEach((d) => {
      const key = d.group ?? "";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(d);
    });
    const lists = [...groups.entries()]
      .map(([group, dishes]) => `
        ${group ? `<h4 class="dish-group">${group}</h4>` : ""}
        <ul class="dish-list">
          ${dishes.map((d) => dishRow(d, cat.dishes.indexOf(d), cat.id)).join("")}
        </ul>`)
      .join("");
    return `
      <section class="menu-category" data-category="${cat.id}">
        <header class="menu-category-head reveal">
          <h3>${cat.name}</h3>
          <p>${cat.tagline}</p>
        </header>
        ${lists}
      </section>`;
  };

  // Food categories render in "El Menú"; bebidas and postres get their own
  // visually different sections further down the page.
  const drinksRoot = document.querySelector<HTMLElement>("[data-menu-drinks]");
  const dessertsRoot = document.querySelector<HTMLElement>("[data-menu-desserts]");
  const renderInto = (el: HTMLElement | null, ids: string[]): void => {
    if (!el) return;
    el.innerHTML = MENU.filter((c) => ids.includes(c.id))
      .map(categorySection)
      .join("");
  };
  renderInto(root, ["entradas", "carnes", "hamburguesas", "pastas", "platos-fuertes", "ensaladas"]);
  renderInto(drinksRoot, ["bebidas"]);
  renderInto(dessertsRoot, ["postres"]);

  // The search field lives in the menu section but should filter everything,
  // so applyFilters queries all three roots below.

  // Featured cards (big photos, hover zoom).
  const featuredRoot = document.querySelector<HTMLElement>("[data-featured]");
  if (featuredRoot) {
    featuredRoot.innerHTML = FEATURED.map((d) => `
      <article class="fav-card reveal" data-fav="${d.name}" tabindex="0" role="button"
          aria-haspopup="dialog" aria-label="Ver detalles de ${d.name}">
        <div class="fav-img"><img src="${d.image}" alt="${d.name}" loading="lazy" /></div>
        <div class="fav-body">
          <div class="fav-top">
            <h3>${d.name}</h3>
            <span class="dish-price">${d.price}</span>
          </div>
          ${d.tags ? `<div class="fav-tags">${d.tags.map(tagBadge).join("")}</div>` : ""}
          <p>${d.description}</p>
        </div>
      </article>`).join("");
  }

  // --- Helpers --------------------------------------------------------------

  const findDish = (ref: string): Dish | undefined => {
    const [catId, indexStr] = ref.split(":");
    const cat = MENU.find((c) => c.id === catId);
    return cat ? cat.dishes[Number(indexStr)] : undefined;
  };

  // --- Category filter + search --------------------------------------------

  const filterButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-filter]")
  );
  const searchInput = document.querySelector<HTMLInputElement>("#dish-search");
  const emptyNote = document.querySelector<HTMLElement>("[data-menu-empty]");
  let activeFilter = "all";

  const applyFilters = (): void => {
    const query = (searchInput?.value ?? "").trim().toLowerCase();
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(".menu-category")
    );
    let anyVisible = false;

    sections.forEach((section) => {
      const catId = section.dataset.category ?? "";
      const inCategory = activeFilter === "all" || catId === activeFilter;
      let visibleDishes = 0;

      section.querySelectorAll<HTMLElement>(".dish").forEach((row) => {
        const text = row.textContent?.toLowerCase() ?? "";
        const match = inCategory && (query === "" || text.includes(query));
        row.hidden = !match;
        if (match) visibleDishes += 1;
      });

      section.querySelectorAll<HTMLElement>(".dish-group").forEach((h) => {
        let el = h.nextElementSibling;
        let groupHasVisible = false;
        while (el && !el.classList.contains("dish-group")) {
          if (el instanceof HTMLElement && el.classList.contains("dish-list")) {
            groupHasVisible = Array.from(el.querySelectorAll<HTMLElement>(".dish"))
              .some((r) => !r.hidden);
          }
          el = el.nextElementSibling;
        }
        h.hidden = !groupHasVisible;
      });

      section.hidden = visibleDishes === 0;
      if (!section.hidden) anyVisible = true;
    });

    if (emptyNote) emptyNote.hidden = anyVisible;
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter ?? "all";
      applyFilters();
      if (activeFilter !== "all") {
        const target = document.querySelector(`[data-category="${activeFilter}"]`);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  searchInput?.addEventListener("input", applyFilters);

  // --- Dish modal -----------------------------------------------------------

  const modal = document.querySelector<HTMLElement>("#dish-modal");
  const modalImg = document.querySelector<HTMLImageElement>("#dish-modal img");
  const modalName = document.querySelector<HTMLElement>("#dish-modal-name");
  const modalDesc = document.querySelector<HTMLElement>("#dish-modal-desc");
  const modalPrice = document.querySelector<HTMLElement>("#dish-modal-price");
  const modalTags = document.querySelector<HTMLElement>("#dish-modal-tags");
  const modalIngs = document.querySelector<HTMLElement>("#dish-modal-ings");
  let lastFocused: HTMLElement | null = null;

  const openModal = (dish: Dish, trigger: HTMLElement): void => {
    if (!modal) return;
    lastFocused = trigger;
    if (modalImg) {
      if (dish.image) {
        modalImg.src = dish.image;
        modalImg.alt = dish.name;
        modalImg.parentElement?.classList.remove("no-img");
      } else {
        modalImg.parentElement?.classList.add("no-img");
        modalImg.removeAttribute("src");
        modalImg.alt = "";
      }
    }
    if (modalName) modalName.textContent = dish.name;
    if (modalDesc) modalDesc.textContent = dish.description;
    if (modalPrice) modalPrice.textContent = dish.price;
    if (modalTags) {
      modalTags.innerHTML = dish.tags ? dish.tags.map(tagBadge).join("") : "";
    }
    if (modalIngs) {
      modalIngs.innerHTML = dish.ingredients
        .map((i) => `<li>${i}</li>`)
        .join("");
    }
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector<HTMLElement>(".modal-close")?.focus();
  };

  const closeModal = (): void => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    lastFocused?.focus();
  };

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const row = target.closest<HTMLElement>("[data-dish],[data-fav]");
    if (row) {
      const dish = row.dataset.dish
        ? findDish(row.dataset.dish)
        : FEATURED.find((d) => d.name === row.dataset.fav);
      if (dish) openModal(dish, row);
      return;
    }
    if (target.closest(".modal-close") || target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
    if (event.key === "Enter" || event.key === " ") {
      const row = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-dish],[data-fav]"
      );
      if (row) {
        event.preventDefault();
        const dish = row.dataset.dish
          ? findDish(row.dataset.dish)
          : FEATURED.find((d) => d.name === row.dataset.fav);
        if (dish) openModal(dish, row);
      }
    }
  });

  // --- Header state + mobile nav -------------------------------------------

  const header = document.querySelector<HTMLElement>(".rest-header");
  const onScroll = (): void => {
    header?.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navToggle = document.querySelector<HTMLButtonElement>(".rest-nav-toggle");
  const navLinks = document.querySelector<HTMLElement>(".rest-nav-links");
  navToggle?.addEventListener("click", () => {
    const open = navLinks?.classList.toggle("open") ?? false;
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks?.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).tagName === "A") {
      navLinks.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });

  // --- Scroll reveal --------------------------------------------------------

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document
    .querySelectorAll<HTMLElement>(".reveal")
    .forEach((el) => observer.observe(el));
})();
