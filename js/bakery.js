"use strict";
/* La Miga Dorada demo · shared script for all bakery pages.
   Page behavior is selected via <body data-page="home|menu|nosotros|visitanos|pedido">. */
(() => {
    "use strict";
    var _a;
    const PRODUCTS = [
        {
            slug: "masa-madre",
            name: "Pan de masa madre",
            desc: "Fermentado lentamente durante 48 horas.",
            price: 4.0,
            cat: "Panes",
            img: "img/lmd-masamadre.jpg",
        },
        {
            slug: "baguette",
            name: "Baguette rústica",
            desc: "Corteza crujiente y miga ligera.",
            price: 2.0,
            cat: "Panes",
            img: "img/lmd-panes.jpg",
        },
        {
            slug: "integral-semillas",
            name: "Pan integral de semillas",
            desc: "Avena, linaza y girasol tostado.",
            price: 3.5,
            cat: "Panes",
            img: "img/lmd-panes.jpg",
        },
        {
            slug: "croissant",
            name: "Croissant de mantequilla",
            desc: "Hojaldrado, dorado y crujiente.",
            price: 1.5,
            cat: "Bollería",
            img: "img/lmd-croissant.jpg",
            tag: "Más vendido",
        },
        {
            slug: "espiral-canela",
            name: "Espiral de canela",
            desc: "Canela cálida, centro suave y glaseado.",
            price: 2.0,
            cat: "Bollería",
            img: "img/lmd-canela.jpg",
            tag: "Favorito",
        },
        {
            slug: "pain-chocolat",
            name: "Pain au chocolat",
            desc: "Hojaldre con centro de chocolate.",
            price: 2.2,
            cat: "Bollería",
            img: "img/lmd-panchoco.jpg",
            out: true,
        },
        {
            slug: "brownie",
            name: "Brownie de chocolate",
            desc: "Denso, húmedo y con borde crujiente.",
            price: 2.5,
            cat: "Dulces",
            img: "img/lmd-dulces.jpg",
        },
        {
            slug: "galletas-avena",
            name: "Galletas de avena",
            desc: "De las que se comen de a dos.",
            price: 1.2,
            cat: "Dulces",
            img: "img/lmd-dulces.jpg",
        },
        {
            slug: "pan-chocolate",
            name: "Pan de chocolate",
            desc: "Masa suave, chocolate y una corteza ligeramente dorada.",
            price: 2.5,
            cat: "Especiales",
            img: "img/lmd-panchoco.jpg",
            tag: "Nuevo",
        },
        {
            slug: "concha-vainilla",
            name: "Concha de vainilla",
            desc: "Cubierta dulce sobre miga tierna.",
            price: 1.8,
            cat: "Especiales",
            img: "img/lmd-dulces.jpg",
        },
    ];
    const product = (slug) => PRODUCTS.find((p) => p.slug === slug);
    const money = (n) => `$${n.toFixed(2)}`;
    /* ---------- storage (resilient) ---------- */
    const CART_KEY = "lmd-cart";
    const FAV_KEY = "lmd-favs";
    const memStore = {};
    const getItem = (key) => {
        var _a, _b, _c;
        try {
            return (_b = (_a = localStorage.getItem(key)) !== null && _a !== void 0 ? _a : memStore[key]) !== null && _b !== void 0 ? _b : null;
        }
        catch (_d) {
            return (_c = memStore[key]) !== null && _c !== void 0 ? _c : null;
        }
    };
    const setItem = (key, value) => {
        memStore[key] = value;
        try {
            localStorage.setItem(key, value);
        }
        catch (_a) {
            /* in-memory copy already updated */
        }
    };
    const readMap = (key) => {
        try {
            const raw = getItem(key);
            const parsed = raw ? JSON.parse(raw) : {};
            return typeof parsed === "object" && parsed ? parsed : {};
        }
        catch (_a) {
            return {};
        }
    };
    const getCart = () => readMap(CART_KEY);
    const saveCart = (cart) => setItem(CART_KEY, JSON.stringify(cart));
    const getFavs = () => {
        var _a;
        try {
            return JSON.parse((_a = getItem(FAV_KEY)) !== null && _a !== void 0 ? _a : "[]");
        }
        catch (_b) {
            return [];
        }
    };
    const saveFavs = (favs) => setItem(FAV_KEY, JSON.stringify(favs));
    const cartCount = () => Object.entries(getCart())
        .filter(([slug]) => product(slug))
        .reduce((t, [, q]) => t + q, 0);
    const updateBadge = () => {
        document.querySelectorAll("[data-cart-count]").forEach((el) => {
            const n = cartCount();
            el.textContent = String(n);
            el.classList.toggle("is-empty", n === 0);
        });
    };
    const bumpBadge = () => {
        const badge = document.querySelector("[data-cart-count]");
        if (!badge)
            return;
        badge.classList.remove("bump");
        void badge.offsetWidth;
        badge.classList.add("bump");
    };
    /* ---------- cart drawer ---------- */
    const buildCart = () => {
        const wrap = document.createElement("div");
        wrap.innerHTML = `
      <div class="lmd-cart-overlay" data-cart-close></div>
      <aside class="lmd-cart" aria-label="Carrito">
        <header class="lmd-cart-head">
          <h3>Tu pedido</h3>
          <button class="lmd-icon-btn" type="button" data-cart-close aria-label="Cerrar carrito">&times;</button>
        </header>
        <ul class="lmd-cart-list" data-cart-list></ul>
        <footer class="lmd-cart-foot" data-cart-foot>
          <div class="lmd-cart-total"><span>Total</span><strong data-cart-total>$0.00</strong></div>
          <a class="lmd-btn lmd-btn-primary lmd-btn-block" href="bakery-pedido.html">Finalizar pedido</a>
          <p class="lmd-cart-note">Recoges en el puesto #4.</p>
        </footer>
      </aside>`;
        document.body.appendChild(wrap);
        wrap.querySelectorAll("[data-cart-close]").forEach((el) => el.addEventListener("click", closeCart));
    };
    const renderCart = () => {
        const list = document.querySelector("[data-cart-list]");
        const totalEl = document.querySelector("[data-cart-total]");
        const foot = document.querySelector("[data-cart-foot]");
        if (!list || !totalEl || !foot)
            return;
        const entries = Object.entries(getCart()).filter(([slug]) => product(slug));
        if (entries.length === 0) {
            list.innerHTML = `<li class="lmd-cart-empty">Tu pedido está vacío.<br /><span>Agrega algo desde <a href="bakery-menu.html">el menú</a>.</span></li>`;
            foot.classList.add("hidden");
            updateBadge();
            return;
        }
        foot.classList.remove("hidden");
        let total = 0;
        list.innerHTML = entries
            .map(([slug, qty]) => {
            const p = product(slug);
            const line = p.price * qty;
            total += line;
            return `<li class="lmd-cart-item">
          <img src="${p.img}" alt="${p.name}" />
          <div class="lmd-cart-info">
            <strong>${p.name}</strong>
            <span class="lmd-cart-price">${money(p.price)} · subtotal ${money(line)}</span>
            <div class="lmd-qty">
              <button type="button" data-qty="-1" data-slug="${slug}" aria-label="Quitar uno">−</button>
              <span>${qty}</span>
              <button type="button" data-qty="1" data-slug="${slug}" aria-label="Agregar uno">+</button>
              <button type="button" class="lmd-remove" data-remove="${slug}">Quitar</button>
            </div>
          </div>
        </li>`;
        })
            .join("");
        totalEl.textContent = money(total);
        list.querySelectorAll("[data-qty]").forEach((b) => b.addEventListener("click", () => {
            var _a;
            const cart = getCart();
            const slug = b.dataset.slug;
            cart[slug] = ((_a = cart[slug]) !== null && _a !== void 0 ? _a : 0) + Number(b.dataset.qty);
            if (cart[slug] <= 0)
                delete cart[slug];
            saveCart(cart);
            renderCart();
            updateBadge();
        }));
        list.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => {
            const cart = getCart();
            delete cart[b.dataset.remove];
            saveCart(cart);
            renderCart();
            updateBadge();
        }));
        updateBadge();
    };
    const openCart = () => {
        renderCart();
        document.body.classList.add("cart-open");
    };
    const closeCart = () => document.body.classList.remove("cart-open");
    const addToCart = (slug, qty = 1) => {
        var _a;
        const cart = getCart();
        cart[slug] = ((_a = cart[slug]) !== null && _a !== void 0 ? _a : 0) + qty;
        saveCart(cart);
        updateBadge();
        bumpBadge();
        toast(`Agregado: ${product(slug).name}`);
    };
    const toast = (msg) => {
        const t = document.createElement("div");
        t.className = "lmd-toast";
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add("show"));
        window.setTimeout(() => {
            t.classList.remove("show");
            window.setTimeout(() => t.remove(), 350);
        }, 2200);
    };
    /* ---------- product card ---------- */
    const card = (p) => {
        const fav = getFavs().includes(p.slug) ? " is-fav" : "";
        return `<article class="lmd-card reveal">
      <div class="lmd-card-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${p.tag ? `<span class="lmd-tag">${p.tag}</span>` : ""}
        ${p.out ? `<span class="lmd-tag lmd-tag-out">Agotado</span>` : ""}
      </div>
      <button class="lmd-fav${fav}" type="button" data-fav="${p.slug}" aria-label="Marcar como favorito">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <h3 class="lmd-card-name">${p.name}</h3>
      <p class="lmd-card-desc">${p.desc}</p>
      <div class="lmd-card-row">
        <span class="lmd-card-price">${money(p.price)}</span>
        ${p.out
            ? `<button class="lmd-btn lmd-btn-ghost" type="button" disabled>Agotado</button>`
            : `<button class="lmd-btn lmd-btn-ghost" type="button" data-add="${p.slug}">Agregar</button>`}
      </div>
    </article>`;
    };
    const bindCards = (root) => {
        root.querySelectorAll("[data-add]").forEach((b) => {
            if (b.dataset.bound)
                return;
            b.dataset.bound = "1";
            b.addEventListener("click", () => addToCart(b.dataset.add));
        });
        root.querySelectorAll("[data-fav]").forEach((b) => {
            if (b.dataset.favBound)
                return;
            b.dataset.favBound = "1";
            b.addEventListener("click", () => {
                const slug = b.dataset.fav;
                const favs = getFavs();
                const i = favs.indexOf(slug);
                if (i >= 0)
                    favs.splice(i, 1);
                else
                    favs.push(slug);
                saveFavs(favs);
                b.classList.toggle("is-fav", i < 0);
            });
        });
        observeReveals(root);
    };
    /* ---------- reveal on scroll ---------- */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("visible");
                revealObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });
    const observeReveals = (root) => {
        root.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
    };
    /* ---------- navbar ---------- */
    const initNav = () => {
        document.querySelectorAll("[data-cart-open]").forEach((b) => b.addEventListener("click", openCart));
        const nav = document.querySelector(".lmd-nav");
        const shrink = () => {
            nav === null || nav === void 0 ? void 0 : nav.classList.toggle("scrolled", window.scrollY > 30);
        };
        window.addEventListener("scroll", shrink, { passive: true });
        shrink();
        const toggle = document.querySelector(".lmd-burger");
        const links = document.querySelector(".lmd-nav-links");
        if (toggle && links) {
            toggle.addEventListener("click", () => {
                const open = links.classList.toggle("open");
                toggle.setAttribute("aria-expanded", String(open));
            });
            links.addEventListener("click", (event) => {
                if (event.target.closest("a")) {
                    links.classList.remove("open");
                    toggle.setAttribute("aria-expanded", "false");
                }
            });
        }
        const searchBtn = document.querySelector("[data-search]");
        searchBtn === null || searchBtn === void 0 ? void 0 : searchBtn.addEventListener("click", () => {
            sessionStorage.setItem("lmd-focus-search", "1");
        });
        // Scroll-spy: mark the nav link of the section being read.
        const navAnchors = Array.from(document.querySelectorAll(".lmd-nav-links a[href^='#']"));
        if (navAnchors.length > 0) {
            const navIds = new Set(navAnchors.map((a) => { var _a, _b; return (_b = (_a = a.getAttribute("href")) === null || _a === void 0 ? void 0 : _a.slice(1)) !== null && _b !== void 0 ? _b : ""; }));
            const sections = Array.from(document.querySelectorAll("section[id], header[id]")).filter((s) => navIds.has(s.id));
            const updateSpy = () => {
                var _a, _b, _c, _d;
                const line = window.scrollY + window.innerHeight * 0.4;
                let current = (_b = (_a = sections[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : "";
                sections.forEach((s) => {
                    if (s.offsetTop <= line)
                        current = s.id;
                });
                const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
                if (atBottom)
                    current = (_d = (_c = sections[sections.length - 1]) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : current;
                navAnchors.forEach((a) => {
                    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
                });
            };
            window.addEventListener("scroll", updateSpy, { passive: true });
            updateSpy();
        }
    };
    /* ---------- page: home ---------- */
    const initHome = () => {
        const grid = document.querySelector("[data-today-grid]");
        if (grid) {
            const today = ["croissant", "espiral-canela", "masa-madre", "pan-chocolate"];
            grid.innerHTML = today.map((s) => card(product(s))).join("");
            bindCards(grid);
        }
        document.querySelectorAll("[data-add]").forEach((b) => {
            if (b.dataset.bound)
                return;
            b.dataset.bound = "1";
            b.addEventListener("click", () => addToCart(b.dataset.add));
        });
    };
    /* ---------- page: menu ---------- */
    const initMenu = () => {
        const grid = document.querySelector("[data-menu-grid]");
        const search = document.querySelector("[data-search-input]");
        const chips = document.querySelectorAll("[data-cat]");
        if (!grid)
            return;
        let cat = "all";
        const apply = () => {
            var _a;
            const q = ((_a = search === null || search === void 0 ? void 0 : search.value) !== null && _a !== void 0 ? _a : "").trim().toLowerCase();
            let list = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
            if (cat !== "all")
                list = list.filter((p) => p.cat === cat);
            grid.innerHTML = list.length
                ? list.map(card).join("")
                : `<p class="lmd-empty">Sin resultados para esa búsqueda.</p>`;
            bindCards(grid);
        };
        search === null || search === void 0 ? void 0 : search.addEventListener("input", apply);
        chips.forEach((c) => c.addEventListener("click", () => {
            var _a;
            chips.forEach((x) => x.classList.remove("active"));
            c.classList.add("active");
            cat = (_a = c.dataset.cat) !== null && _a !== void 0 ? _a : "all";
            apply();
        }));
        apply();
        if (sessionStorage.getItem("lmd-focus-search") === "1" && search) {
            sessionStorage.removeItem("lmd-focus-search");
            search.focus();
            search.scrollIntoView({ block: "center" });
        }
    };
    /* ---------- page: pedido ---------- */
    const initPedido = () => {
        const wrap = document.querySelector("[data-order-summary]");
        const form = document.querySelector("[data-order-form]");
        const done = document.querySelector("[data-order-done]");
        if (!wrap)
            return;
        const renderSummary = () => {
            const entries = Object.entries(getCart()).filter(([slug]) => product(slug));
            const submit = form === null || form === void 0 ? void 0 : form.querySelector("button[type='submit']");
            if (submit)
                submit.disabled = entries.length === 0;
            if (entries.length === 0) {
                wrap.innerHTML = `<p class="lmd-empty">Tu pedido está vacío. Agrega algo desde <a href="bakery-menu.html">el menú</a>.</p>`;
                return;
            }
            let total = 0;
            const rows = entries
                .map(([slug, qty]) => {
                const p = product(slug);
                const line = p.price * qty;
                total += line;
                return `<li class="lmd-order-line">
            <img src="${p.img}" alt="${p.name}" />
            <div>
              <strong>${p.name}</strong>
              <span>${qty} x ${money(p.price)}</span>
            </div>
            <div class="lmd-qty">
              <button type="button" data-oq="-1" data-slug="${slug}">−</button>
              <span>${qty}</span>
              <button type="button" data-oq="1" data-slug="${slug}">+</button>
            </div>
            <b>${money(line)}</b>
          </li>`;
            })
                .join("");
            wrap.innerHTML = `<ul class="lmd-order-list">${rows}</ul>
        <div class="lmd-order-total"><span>Subtotal</span><strong>${money(total)}</strong></div>
        <div class="lmd-order-total"><span>Total</span><strong>${money(total)}</strong></div>`;
            wrap.querySelectorAll("[data-oq]").forEach((b) => b.addEventListener("click", () => {
                var _a;
                const cart = getCart();
                const slug = b.dataset.slug;
                cart[slug] = ((_a = cart[slug]) !== null && _a !== void 0 ? _a : 0) + Number(b.dataset.oq);
                if (cart[slug] <= 0)
                    delete cart[slug];
                saveCart(cart);
                renderSummary();
                updateBadge();
            }));
        };
        renderSummary();
        form === null || form === void 0 ? void 0 : form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!form.reportValidity())
                return;
            // Demo site: the order is only simulated, nothing is sent anywhere.
            saveCart({});
            updateBadge();
            renderSummary();
            form.classList.add("hidden");
            done === null || done === void 0 ? void 0 : done.classList.remove("hidden");
            done === null || done === void 0 ? void 0 : done.scrollIntoView({ block: "center", behavior: "smooth" });
        });
    };
    /* ---------- boot ---------- */
    buildCart();
    initNav();
    updateBadge();
    observeReveals(document);
    const page = (_a = document.body.dataset.page) !== null && _a !== void 0 ? _a : "home";
    if (page === "home")
        initHome();
    if (page === "menu")
        initMenu();
    if (page === "pedido")
        initPedido();
})();
//# sourceMappingURL=bakery.js.map