"use strict";
/* ByteShop demo · shared script for all techstore pages.
   Page behavior is selected via <body data-page="home|products|product|why|order">. */
(() => {
    "use strict";
    var _a;
    const PRODUCTS = [
        {
            slug: "cable-usb-c",
            name: "Cable USB-C trenzado",
            desc: "1.5 m, sobrevive a cualquier mochila.",
            price: 6,
            cat: "Cables",
            img: "img/byteshop-cable.jpg",
            tag: "BYTE VERIFIED",
            extras: ["1.5 m", "Trenzado", "Pensado para el uso diario"],
        },
        {
            slug: "soporte-telefono",
            name: "Soporte para teléfono",
            desc: "Se pliega plano y sostiene cualquier teléfono en dos ángulos.",
            price: 8,
            cat: "Soportes",
            img: "img/byteshop-soporte.jpg",
            extras: ["Plegable", "Dos ángulos", "Pensado para el uso diario"],
        },
        {
            slug: "kit-organizador",
            name: "Kit organizador de cables",
            desc: "Correas de velcro + estuche. Tu escritorio te lo agradecerá.",
            price: 5,
            cat: "Organización",
            img: "img/byteshop-organizador.jpg",
            extras: ["Correas de velcro", "Estuche incluido", "Pensado para el uso diario"],
        },
        {
            slug: "set-limpieza",
            name: "Set de limpieza de pantallas",
            desc: "Spray + paño de microfibra, seguro para laptops.",
            price: 4,
            cat: "Limpieza",
            img: "img/byteshop-limpieza.jpg",
            extras: ["Spray + microfibra", "Seguro para laptops", "Pensado para el uso diario"],
        },
        {
            slug: "pack-stickers",
            name: "Pack de stickers",
            desc: "10 stickers de vinil para laptop, diseñados por nosotros.",
            price: 3,
            cat: "Personalización",
            img: "img/byteshop-stickers.jpg",
            extras: ["10 stickers", "Vinil resistente", "Diseños propios"],
        },
        {
            slug: "caja-misteriosa",
            name: "Caja misteriosa de gadgets",
            desc: "Una mezcla sorpresa que vale más que su precio.",
            price: 10,
            cat: "Sorpresa",
            img: "img/byteshop-caja.jpg",
            tag: "MYSTERY",
            extras: ["Contenido sorpresa", "Vale más que su precio", "Edición de la feria"],
        },
    ];
    const product = (slug) => PRODUCTS.find((p) => p.slug === slug);
    const money = (n) => `$${n}`;
    /* ---------- cart state ---------- */
    const CART_KEY = "byteshop-cart";
    const FAV_KEY = "byteshop-favs";
    const readMap = (key) => {
        try {
            const raw = localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : {};
            return typeof parsed === "object" && parsed ? parsed : {};
        }
        catch (_a) {
            return {};
        }
    };
    const getCart = () => readMap(CART_KEY);
    const saveCart = (cart) => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    };
    const getFavs = () => {
        var _a;
        try {
            return JSON.parse((_a = localStorage.getItem(FAV_KEY)) !== null && _a !== void 0 ? _a : "[]");
        }
        catch (_b) {
            return [];
        }
    };
    const saveFavs = (favs) => localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    const cartCount = () => Object.values(getCart()).reduce((a, b) => a + b, 0);
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
    /* ---------- cart drawer (injected on every page) ---------- */
    const buildCart = () => {
        const wrap = document.createElement("div");
        wrap.innerHTML = `
      <div class="ts-cart-overlay" data-cart-close></div>
      <aside class="ts-cart" aria-label="Carrito de compras">
        <header class="ts-cart-head">
          <h3>Tu carrito</h3>
          <button class="ts-icon-btn" type="button" data-cart-close aria-label="Cerrar carrito">&times;</button>
        </header>
        <ul class="ts-cart-list" data-cart-list></ul>
        <footer class="ts-cart-foot" data-cart-foot>
          <div class="ts-cart-total"><span>Total</span><strong data-cart-total>$0</strong></div>
          <a class="ts-btn ts-btn-primary ts-btn-block" href="techstore-pedir.html">Realizar pedido</a>
          <p class="ts-cart-note">Pagas al recoger.</p>
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
        const cart = getCart();
        const entries = Object.entries(cart).filter(([slug]) => product(slug));
        if (entries.length === 0) {
            list.innerHTML = `<li class="ts-cart-empty">Tu carrito está vacío.<br /><span>Agrega algo desde <a href="techstore-productos.html">productos</a>.</span></li>`;
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
            return `<li class="ts-cart-item">
          <img src="${p.img}" alt="${p.name}" />
          <div class="ts-cart-info">
            <strong>${p.name}</strong>
            <span class="ts-cart-price">${money(p.price)} · subtotal ${money(line)}</span>
            <div class="ts-qty">
              <button type="button" data-qty="-1" data-slug="${slug}" aria-label="Quitar uno">−</button>
              <span>${qty}</span>
              <button type="button" data-qty="1" data-slug="${slug}" aria-label="Agregar uno">+</button>
              <button type="button" class="ts-remove" data-remove="${slug}" aria-label="Quitar del carrito">Quitar</button>
            </div>
          </div>
        </li>`;
        })
            .join("");
        totalEl.textContent = money(total);
        list.querySelectorAll("[data-qty]").forEach((b) => b.addEventListener("click", () => {
            var _a;
            const cart2 = getCart();
            const slug = b.dataset.slug;
            cart2[slug] = ((_a = cart2[slug]) !== null && _a !== void 0 ? _a : 0) + Number(b.dataset.qty);
            if (cart2[slug] <= 0)
                delete cart2[slug];
            saveCart(cart2);
            renderCart();
            updateBadge();
        }));
        list.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => {
            const cart2 = getCart();
            delete cart2[b.dataset.remove];
            saveCart(cart2);
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
        t.className = "ts-toast";
        t.textContent = msg;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add("show"));
        window.setTimeout(() => {
            t.classList.remove("show");
            window.setTimeout(() => t.remove(), 350);
        }, 2200);
    };
    /* ---------- product card markup ---------- */
    const card = (p) => {
        const fav = getFavs().includes(p.slug) ? " is-fav" : "";
        return `<article class="ts-card reveal">
      <a class="ts-card-img" href="techstore-producto.html?p=${p.slug}">
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
        ${p.tag ? `<span class="ts-tag">${p.tag}</span>` : ""}
      </a>
      <button class="ts-fav${fav}" type="button" data-fav="${p.slug}" aria-label="Marcar como favorito">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <span class="ts-card-cat">${p.cat}</span>
      <h3 class="ts-card-name"><a href="techstore-producto.html?p=${p.slug}">${p.name}</a></h3>
      <p class="ts-card-desc">${p.desc}</p>
      <div class="ts-card-row">
        <span class="ts-card-price">${money(p.price)}</span>
        <button class="ts-btn ts-btn-ghost" type="button" data-add="${p.slug}">Agregar al carrito</button>
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
        root.querySelectorAll("[data-fav]").forEach((b) => b.addEventListener("click", () => {
            const slug = b.dataset.fav;
            const favs = getFavs();
            const i = favs.indexOf(slug);
            if (i >= 0)
                favs.splice(i, 1);
            else
                favs.push(slug);
            saveFavs(favs);
            b.classList.toggle("is-fav", i < 0);
        }));
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
        const toggle = document.querySelector(".ts-burger");
        const links = document.querySelector(".ts-nav-links");
        if (toggle && links) {
            toggle.addEventListener("click", () => {
                const open = links.classList.toggle("open");
                toggle.setAttribute("aria-expanded", String(open));
            });
        }
        const searchBtn = document.querySelector("[data-search]");
        if (searchBtn) {
            searchBtn.addEventListener("click", () => {
                sessionStorage.setItem("byteshop-focus-search", "1");
            });
        }
        // Scroll-spy: mark the nav link of the section being read.
        const navAnchors = Array.from(document.querySelectorAll(".ts-nav-links a[href^='#']"));
        if (navAnchors.length > 0) {
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
        const grid = document.querySelector("[data-grid]");
        if (grid) {
            grid.innerHTML = PRODUCTS.map(card).join("");
            bindCards(grid);
        }
        document.querySelectorAll("[data-add]").forEach((b) => {
            if (b.dataset.bound)
                return;
            b.dataset.bound = "1";
            b.addEventListener("click", () => addToCart(b.dataset.add));
        });
    };
    /* ---------- page: products ---------- */
    const initProducts = () => {
        const grid = document.querySelector("[data-grid]");
        const search = document.querySelector("[data-search-input]");
        const sort = document.querySelector("[data-sort]");
        const chips = document.querySelectorAll("[data-price]");
        const count = document.querySelector("[data-count]");
        if (!grid)
            return;
        let priceBand = "all";
        const apply = () => {
            var _a, _b;
            const q = ((_a = search === null || search === void 0 ? void 0 : search.value) !== null && _a !== void 0 ? _a : "").trim().toLowerCase();
            let list = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
            if (priceBand === "low")
                list = list.filter((p) => p.price <= 5);
            if (priceBand === "mid")
                list = list.filter((p) => p.price > 5 && p.price <= 8);
            if (priceBand === "high")
                list = list.filter((p) => p.price > 8);
            const s = (_b = sort === null || sort === void 0 ? void 0 : sort.value) !== null && _b !== void 0 ? _b : "featured";
            if (s === "price-asc")
                list = [...list].sort((a, b) => a.price - b.price);
            if (s === "price-desc")
                list = [...list].sort((a, b) => b.price - a.price);
            if (s === "name")
                list = [...list].sort((a, b) => a.name.localeCompare(b.name));
            grid.innerHTML = list.length
                ? list.map(card).join("")
                : `<p class="ts-empty">Sin resultados para esa búsqueda.</p>`;
            if (count)
                count.textContent = `${list.length} producto${list.length === 1 ? "" : "s"}`;
            bindCards(grid);
        };
        search === null || search === void 0 ? void 0 : search.addEventListener("input", apply);
        sort === null || sort === void 0 ? void 0 : sort.addEventListener("change", apply);
        chips.forEach((c) => c.addEventListener("click", () => {
            var _a;
            chips.forEach((x) => x.classList.remove("active"));
            c.classList.add("active");
            priceBand = (_a = c.dataset.price) !== null && _a !== void 0 ? _a : "all";
            apply();
        }));
        apply();
        if (sessionStorage.getItem("byteshop-focus-search") === "1" && search) {
            sessionStorage.removeItem("byteshop-focus-search");
            search.focus();
            search.scrollIntoView({ block: "center" });
        }
    };
    /* ---------- page: product detail ---------- */
    const initProduct = () => {
        var _a, _b;
        const slug = (_a = new URLSearchParams(location.search).get("p")) !== null && _a !== void 0 ? _a : "";
        const p = product(slug);
        const root = document.querySelector("[data-product]");
        if (!root)
            return;
        if (!p) {
            document.title = "Producto no encontrado · ByteShop";
            root.innerHTML = `<div class="ts-pd-info" style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;">
        <h1>Producto no encontrado</h1>
        <p class="ts-pd-desc">Ese producto no existe o ya no está disponible.</p>
        <a class="ts-btn ts-btn-primary" href="techstore-productos.html">Ver catálogo</a>
      </div>`;
            return;
        }
        document.title = `${p.name} · ByteShop`;
        root.innerHTML = `
      <div class="ts-pd-img reveal visible">
        <img src="${p.img}" alt="${p.name}" />
        ${p.tag ? `<span class="ts-tag">${p.tag}</span>` : ""}
      </div>
      <div class="ts-pd-info">
        <span class="ts-card-cat">${p.cat}</span>
        <h1>${p.name}</h1>
        <p class="ts-pd-desc">${p.desc}</p>
        <ul class="ts-pd-extras">${p.extras.map((x) => `<li>${x}</li>`).join("")}</ul>
        <div class="ts-pd-buy">
          <span class="ts-pd-price">${money(p.price)}</span>
          <div class="ts-qty ts-qty-lg">
            <button type="button" data-pq="-1" aria-label="Menos">−</button>
            <span data-pq-val>1</span>
            <button type="button" data-pq="1" aria-label="Más">+</button>
          </div>
          <button class="ts-btn ts-btn-primary" type="button" data-pd-add>Agregar al carrito</button>
        </div>
        <p class="ts-pd-note">Pagas al recoger · Garantía de reemplazo el primer mes.</p>
      </div>`;
        let qty = 1;
        const val = root.querySelector("[data-pq-val]");
        root.querySelectorAll("[data-pq]").forEach((b) => b.addEventListener("click", () => {
            qty = Math.max(1, qty + Number(b.dataset.pq));
            if (val)
                val.textContent = String(qty);
        }));
        (_b = root.querySelector("[data-pd-add]")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => addToCart(p.slug, qty));
    };
    /* ---------- page: order ---------- */
    const initOrder = () => {
        const sel = document.querySelector("[data-product-select]");
        if (sel) {
            sel.innerHTML = `<option value="">Elige un producto</option>` +
                PRODUCTS.map((p) => `<option value="${p.slug}">${p.name} · ${money(p.price)}</option>`).join("") +
                `<option value="otro">Otro / varios</option>`;
        }
        const form = document.querySelector("[data-order-form]");
        const done = document.querySelector("[data-order-done]");
        if (!form)
            return;
        // If the cart has items, carry them into the order: mark "Otro / varios"
        // and prefill the message with the cart lines and total.
        const cart = getCart();
        const entries = Object.entries(cart).filter(([slug]) => product(slug));
        const msg = form.querySelector("#mensaje");
        if (entries.length > 0) {
            const lines = entries.map(([slug, qty]) => {
                const p = product(slug);
                return `${qty} x ${p.name} (${money(p.price)} c/u, subtotal ${money(p.price * qty)})`;
            });
            const total = entries.reduce((acc, [slug, qty]) => acc + product(slug).price * qty, 0);
            if (sel)
                sel.value = "otro";
            if (msg) {
                msg.value = `Mi carrito:\n${lines.join("\n")}\nTotal: ${money(total)}`;
            }
        }
        form.addEventListener("submit", (e) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            e.preventDefault();
            if (!form.reportValidity())
                return;
            const nombre = ((_b = (_a = form.querySelector("#nombre")) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "").trim();
            const prodSel = form.querySelector("[data-product-select]");
            const prodLabel = (_d = (_c = prodSel === null || prodSel === void 0 ? void 0 : prodSel.selectedOptions[0]) === null || _c === void 0 ? void 0 : _c.textContent) !== null && _d !== void 0 ? _d : "";
            const cantidad = (_f = (_e = form.querySelector("#cantidad")) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : "1";
            const metodo = (_h = (_g = form.querySelector("#contacto-met")) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : "";
            const mensaje = ((_j = msg === null || msg === void 0 ? void 0 : msg.value) !== null && _j !== void 0 ? _j : "").trim();
            const text = `¡Hola ByteShop! Quiero hacer un pedido:\n\n` +
                `Nombre: ${nombre}\nProducto: ${prodLabel}\nCantidad: ${cantidad}\n` +
                `Método de contacto: ${metodo}${mensaje ? `\n\n${mensaje}` : ""}`;
            window.open(`https://wa.me/18298591920?text=${encodeURIComponent(text)}`, "_blank");
            saveCart({});
            updateBadge();
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
    if (page === "products")
        initProducts();
    if (page === "product")
        initProduct();
    if (page === "order")
        initOrder();
})();
//# sourceMappingURL=techstore.js.map