/* Riad Auto Luxe — script principal
   Toutes les pages publiques partagent ce fichier. Le contenu réellement
   affiché (téléphone, promo, flotte, textes) vient de assets/data/*.json,
   modifiable depuis /admin/. */

(function () {
  "use strict";

  var BASE = window.SITE_BASE || "";

  function qs(id) { return document.getElementById(id); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function waLink(number, text) {
    return "https://wa.me/" + number + (text ? ("?text=" + encodeURIComponent(text)) : "");
  }

  function telLink(intl) { return "tel:" + intl.replace(/\s+/g, ""); }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------------------------------------------------------------
     Icônes (sprite inline, pas de dépendance externe)
     ------------------------------------------------------------------- */
  var ICONS = {
    whatsapp: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.23.6 4.32 1.65 6.12L4 29l8.06-1.6a12.9 12.9 0 0 0 3.96.62c6.62 0 12.02-5.4 12.02-12.02C28.04 8.4 22.64 3 16.02 3zm0 21.9c-1.32 0-2.6-.26-3.78-.77l-.27-.11-4.79.95.99-4.62-.18-.29a9.86 9.86 0 0 1-1.55-5.34c0-5.46 4.44-9.9 9.9-9.9 5.46 0 9.9 4.44 9.9 9.9-.02 5.46-4.46 9.9-9.92 9.9zm5.42-7.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.74-1.63-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.75-.71 2-1.4.24-.68.24-1.27.17-1.4-.07-.13-.27-.2-.57-.35z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 5c0-.6.4-1 1-1h3l2 5-2 1.2a10 10 0 0 0 5.8 5.8L15 14l5 2v3c0 .6-.4 1-1 1A15 15 0 0 1 4 5z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.3"/></svg>',
    seats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 10V6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v4"/><path d="M13 10V6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v4"/><path d="M4 10h16l-1.4 8.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 10z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><path d="M12 8v4l2.5 2.5"/></svg>',
    fuel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 20V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v14"/><path d="M4 20h10"/><path d="M13 9h2l2.5 2.5V17a1.5 1.5 0 0 1-3 0v-1"/></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.9" cy="7.1" r="0.9" fill="currentColor" stroke="none"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M14 21v-7h2.5l.5-3H14V9c0-.9.3-1.6 1.7-1.6H17V4.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V11H8v3h2.6v7"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/></svg>'
  };

  /* ---------------------------------------------------------------------
     Chargement des données
     ------------------------------------------------------------------- */
  function loadJSON(path) {
    return fetch(BASE + path, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("Impossible de charger " + path);
      return r.json();
    });
  }

  function init(content, fleet) {
    var biz = content.business;
    populateBusinessBindings(biz);
    populateHero(content.hero, biz);
    populateStats(content.stats);
    populateWhyUs(content.whyUs);
    populatePromo(content.promo, biz);
    populateServicesSummary(content.services);
    populateServicesDetail(content.services);
    populateConditions(content.conditions);
    populateAbout(content.about, biz);
    populateFooterContact(biz);
    populateSchema(content, fleet);
    if (fleet && fleet.cars) {
      renderFleet(qs("fleet-featured"), fleet.cars.filter(function (c) { return c.available; }).slice(0, 4).length ? fleet.cars.slice(0, 4) : fleet.cars.slice(0, 4), biz);
      renderFleetPage(fleet, biz);
    }
    wireContactForm(biz);
  }

  function bindText(id, value) { var el = qs(id); if (el && value != null) el.textContent = value; }
  function bindHref(el, href) { if (el) el.setAttribute("href", href); }

  function populateBusinessBindings(biz) {
    qsa("[data-bind='phonePrimaryDisplay']").forEach(function (el) { el.textContent = biz.phonePrimaryDisplay; });
    qsa("[data-bind='phoneSecondaryDisplay']").forEach(function (el) { el.textContent = biz.phoneSecondaryDisplay; });
    qsa("[data-bind='addressLine']").forEach(function (el) { el.textContent = biz.addressLine; });
    qsa("[data-bind='email']").forEach(function (el) { el.textContent = biz.email; });
    qsa("[data-bind='hoursNote']").forEach(function (el) { el.textContent = biz.hoursNote; });
    qsa("[data-bind='instagramHandle']").forEach(function (el) { el.textContent = biz.instagramHandle; });

    qsa("[data-href='tel-primary']").forEach(function (el) { bindHref(el, telLink(biz.phonePrimaryIntl)); });
    qsa("[data-href='tel-secondary']").forEach(function (el) { bindHref(el, telLink(biz.phoneSecondaryIntl)); });
    qsa("[data-href='whatsapp-generic']").forEach(function (el) {
      bindHref(el, waLink(biz.whatsappPrimary, "Bonjour Riad Auto Luxe, je souhaite avoir des informations sur la location d'une voiture."));
    });
    qsa("[data-href='instagram']").forEach(function (el) { bindHref(el, biz.instagram); });
    qsa("[data-href='facebook']").forEach(function (el) { bindHref(el, biz.facebook); });
    qsa("[data-href='mailto']").forEach(function (el) { bindHref(el, "mailto:" + biz.email); });

    qsa("[data-icon]").forEach(function (el) {
      var name = el.getAttribute("data-icon");
      if (ICONS[name]) el.innerHTML = ICONS[name];
    });

    var yearEl = qs("year"); if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function populateHero(hero, biz) {
    if (!hero) return;
    bindText("hero-title-1", hero.title1);
    bindText("hero-title-2", hero.title2);
    bindText("hero-sub", hero.subtitle);
    var p = qs("hero-cta-primary"); if (p) p.textContent = hero.ctaPrimary;
    var s = qs("hero-cta-secondary"); if (s) {
      s.textContent = hero.ctaSecondary;
      bindHref(s, waLink(biz.whatsappPrimary, "Bonjour Riad Auto Luxe, je souhaite réserver une voiture."));
    }
  }

  function populateStats(stats) {
    var wrap = qs("stats-row");
    if (!wrap || !stats) return;
    wrap.innerHTML = stats.map(function (s) {
      return '<div class="trust-item"><span class="val">' + escapeHtml(s.value) + '</span><span class="lbl">' + escapeHtml(s.label) + "</span></div>";
    }).join("");
  }

  function populateWhyUs(items) {
    var wrap = qs("why-us-list");
    if (!wrap || !items) return;
    wrap.innerHTML = items.map(function (it) {
      return '<div class="ledger-item"><h3>' + escapeHtml(it.title) + "</h3><p>" + escapeHtml(it.text) + "</p></div>";
    }).join("");
  }

  function populatePromo(promo, biz) {
    var wrap = qs("promo-ribbon");
    if (!wrap || !promo) return;
    if (!promo.active) { wrap.style.display = "none"; return; }
    wrap.innerHTML =
      '<div><span class="label">' + escapeHtml(promo.label) + '</span><p class="text">' + escapeHtml(promo.text) + "</p></div>" +
      '<a class="btn btn-gold" href="' + waLink(biz.whatsappPrimary, "Bonjour, je vous contacte au sujet de la promotion en cours.") + '">' + ICONS.whatsapp + "<span>" + escapeHtml(promo.cta) + "</span></a>";
  }

  function populateServicesSummary(services) {
    var wrap = qs("services-summary");
    if (!wrap || !services) return;
    wrap.innerHTML = services.map(function (s) {
      return '<div class="service-panel"><h3>' + escapeHtml(s.title) + "</h3><p>" + escapeHtml(s.summary) + '</p><a class="btn btn-outline-dark btn-small" href="services.html#' + s.id + '">En savoir plus</a></div>';
    }).join("");
  }

  function populateServicesDetail(services) {
    var wrap = qs("services-detail");
    if (!wrap || !services) return;
    wrap.innerHTML = services.map(function (s) {
      var items = s.details.map(function (d) { return "<li>" + escapeHtml(d) + "</li>"; }).join("");
      return '<div class="service-detail" id="' + s.id + '"><div><h3>' + escapeHtml(s.title) + "</h3><p>" + escapeHtml(s.summary) + '</p></div><ul class="list">' + items + "</ul></div>";
    }).join("");
  }

  function populateConditions(conditions) {
    var wrap = qs("conditions-list");
    if (!wrap || !conditions) return;
    wrap.innerHTML = conditions.map(function (c) { return "<li>" + escapeHtml(c) + "</li>"; }).join("");
  }

  function populateAbout(about, biz) {
    if (!about) return;
    bindText("about-intro", about.intro);
    bindText("about-body", about.body);
    bindText("about-closing", about.closing);
  }

  function populateFooterContact(biz) {
    var wrap = qs("footer-contact");
    if (!wrap) return;
    wrap.innerHTML =
      '<li><a data-href="tel-primary" href="#">' + escapeHtml(biz.phonePrimaryDisplay) + "</a></li>" +
      '<li><a data-href="whatsapp-generic" href="#">WhatsApp : ' + escapeHtml(biz.phoneSecondaryDisplay) + "</a></li>" +
      "<li>" + escapeHtml(biz.addressLine) + "</li>" +
      '<li><a data-href="mailto" href="#">' + escapeHtml(biz.email) + "</a></li>";
    populateBusinessBindings({ // re-bind the two freshly-injected links
      phonePrimaryIntl: biz.phonePrimaryIntl, phoneSecondaryIntl: biz.phoneSecondaryIntl,
      whatsappPrimary: biz.whatsappPrimary, email: biz.email,
      phonePrimaryDisplay: biz.phonePrimaryDisplay, phoneSecondaryDisplay: biz.phoneSecondaryDisplay,
      addressLine: biz.addressLine, hoursNote: biz.hoursNote, instagramHandle: biz.instagramHandle,
      instagram: biz.instagram, facebook: biz.facebook
    });
  }

  function populateSchema(content, fleet) {
    var el = qs("schema-localbusiness");
    if (!el) return;
    var biz = content.business;
    var data = {
      "@context": "https://schema.org",
      "@type": "AutoRental",
      "name": biz.name,
      "image": (window.SITE_ORIGIN || "") + BASE + "assets/img/og-image.png",
      "url": window.SITE_ORIGIN || undefined,
      "telephone": biz.phonePrimaryIntl,
      "priceRange": "DA",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": biz.streetAddress,
        "addressLocality": biz.city,
        "addressRegion": biz.region,
        "postalCode": biz.postalCode,
        "addressCountry": "DZ"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": biz.latitude, "longitude": biz.longitude },
      "sameAs": [biz.instagram, biz.facebook],
      "areaServed": "Alger",
      "openingHours": "Mo-Su 09:00-19:00"
    };
    el.textContent = JSON.stringify(data, null, 2);
  }

  /* ---------------------------------------------------------------------
     Flotte
     ------------------------------------------------------------------- */
  function carCardHtml(car, biz) {
    var msg = "Bonjour, je suis intéressé(e) par la " + car.brand + " " + car.model + " (à partir de " + car.pricePerDay + " " + car.currency + "/jour). Est-elle disponible ?";
    return (
      '<article class="car-card" data-category="' + escapeHtml(car.category) + '">' +
        '<div class="car-card-media">' +
          '<span class="car-tag' + (car.available ? "" : " unavailable") + '">' + (car.available ? "Disponible" : "Sur demande") + "</span>" +
          '<div class="arch-clip"><img src="' + BASE + car.image + '" alt="' + escapeHtml(car.brand + " " + car.model) + '" loading="lazy"></div>' +
        "</div>" +
        '<div class="car-card-body">' +
          '<h3 class="car-name"><span class="brand">' + escapeHtml(car.brand) + '</span>' + escapeHtml(car.model) + "</h3>" +
          '<div class="car-specs">' +
            "<span>" + ICONS.gear + escapeHtml(car.transmission) + "</span>" +
            "<span>" + ICONS.seats + escapeHtml(car.seats) + " places</span>" +
            "<span>" + ICONS.fuel + escapeHtml(car.fuel) + "</span>" +
          "</div>" +
          '<p class="car-desc">' + escapeHtml(car.description) + "</p>" +
          '<div class="car-footer">' +
            '<div class="car-price"><span class="amount">' + escapeHtml(car.pricePerDay) + " " + escapeHtml(car.currency) + '</span><span class="unit">par jour</span></div>' +
            '<a class="btn btn-gold btn-small" href="' + waLink(biz.whatsappPrimary, msg) + '">' + ICONS.whatsapp + "<span>Demander</span></a>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderFleet(container, cars, biz) {
    if (!container) return;
    container.innerHTML = cars.map(function (c) { return carCardHtml(c, biz); }).join("");
  }

  function renderFleetPage(fleet, biz) {
    var grid = qs("fleet-grid");
    if (!grid) return;
    var filters = qs("fleet-filters");
    var all = fleet.cars;

    function draw(category) {
      var list = category === "Toutes" ? all : all.filter(function (c) { return c.category === category; });
      renderFleet(grid, list, biz);
    }

    if (filters) {
      var cats = ["Toutes"].concat(fleet.categories || []);
      filters.innerHTML = cats.map(function (c, i) {
        return '<button type="button" class="filter-btn" data-cat="' + escapeHtml(c) + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' + escapeHtml(c) + "</button>";
      }).join("");
      qsa(".filter-btn", filters).forEach(function (btn) {
        btn.addEventListener("click", function () {
          qsa(".filter-btn", filters).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
          btn.setAttribute("aria-pressed", "true");
          draw(btn.getAttribute("data-cat"));
        });
      });
    }
    draw("Toutes");
  }

  /* ---------------------------------------------------------------------
     Formulaire de contact (Formspree — voir GUIDE-DEPLOIEMENT.md)
     ------------------------------------------------------------------- */
  function wireContactForm(biz) {
    var form = qs("contact-form");
    if (!form) return;
    var status = qs("form-status");
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      if (action.indexOf("VOTRE_ID_FORMSPREE") !== -1) {
        e.preventDefault();
        if (status) {
          status.className = "form-status show err";
          status.textContent = "Le formulaire n'est pas encore connecté. En attendant, contactez-nous directement sur WhatsApp ou par téléphone ci-contre.";
        }
        return;
      }
      e.preventDefault();
      var data = new FormData(form);
      if (status) { status.className = "form-status show"; status.textContent = "Envoi en cours…"; }
      fetch(action, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (r.ok) {
            form.reset();
            status.className = "form-status show ok";
            status.textContent = "Message envoyé. Nous vous répondons rapidement, sinon écrivez-nous directement sur WhatsApp.";
          } else {
            status.className = "form-status show err";
            status.textContent = "L'envoi a échoué. Merci de nous contacter sur WhatsApp ou par téléphone.";
          }
        })
        .catch(function () {
          status.className = "form-status show err";
          status.textContent = "L'envoi a échoué. Merci de nous contacter sur WhatsApp ou par téléphone.";
        });
    });
  }

  /* ---------------------------------------------------------------------
     Navigation mobile
     ------------------------------------------------------------------- */
  function updateHeaderStackHeight() {
    var bar = document.querySelector(".utility-bar");
    var header = document.querySelector(".site-header");
    var h = (bar ? bar.offsetHeight : 0) + (header ? header.offsetHeight : 0);
    if (h > 0) document.documentElement.style.setProperty("--header-stack-h", h + "px");
  }

  function wireNav() {
    var toggle = qs("nav-toggle");
    var nav = qs("main-nav");
    updateHeaderStackHeight();
    window.addEventListener("resize", updateHeaderStackHeight);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(updateHeaderStackHeight); }
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    qsa("a", nav).forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireNav();
    Promise.all([loadJSON("assets/data/site-content.json"), loadJSON("assets/data/cars.json")])
      .then(function (res) { init(res[0], res[1]); })
      .catch(function (err) { console.error("Riad Auto Luxe — erreur de chargement des données :", err); });
  });
})();
