/* Riad Auto Luxe — tableau de bord admin
   Fonctionne sans backend : les données publiques (assets/data/*.json) sont
   chargées ici, modifiées dans le navigateur, puis publiées soit en
   commitant directement sur GitHub (API Contents, avec un token que vous
   seul détenez), soit en téléchargeant les fichiers JSON à réuploader
   manuellement. Voir GUIDE-DEPLOIEMENT.md pour la mise en place. */

(function () {
  "use strict";

  var BASE = "../";
  var PIN_KEY = "ral_admin_pin";
  var GH_KEY = "ral_admin_gh";

  var state = {
    siteContent: null,
    cars: null,
    shas: { siteContent: null, cars: null }
  };

  function qs(id) { return document.getElementById(id); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* =====================================================================
     Verrou local (PIN) — pas une sécurité forte : voir note à l'écran.
     La vraie protection vient du token GitHub, jamais partagé publiquement.
     ===================================================================== */
  function initLock() {
    var savedPin = localStorage.getItem(PIN_KEY);
    var lock = qs("admin-lock");
    var shell = qs("admin-shell");
    var input = qs("pin-input");
    var errorEl = qs("pin-error");
    var title = qs("lock-title");
    var sub = qs("lock-sub");

    if (!savedPin) {
      title.textContent = "Créez un code d'accès";
      sub.textContent = "Ce code restera enregistré uniquement sur cet appareil et vous sera redemandé la prochaine fois.";
    }

    function tryUnlock() {
      var val = input.value.trim();
      if (!val) return;
      if (!savedPin) {
        if (val.length < 4) { errorEl.textContent = "Choisissez au moins 4 caractères."; return; }
        localStorage.setItem(PIN_KEY, val);
        unlock();
        return;
      }
      if (val === savedPin) { unlock(); }
      else { errorEl.textContent = "Code incorrect."; input.value = ""; input.focus(); }
    }

    function unlock() {
      lock.style.display = "none";
      shell.classList.add("visible");
      boot();
    }

    qs("pin-submit").addEventListener("click", tryUnlock);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") tryUnlock(); });
    input.focus();

    qs("pin-reset").addEventListener("click", function () {
      if (confirm("Oublier ce code d'accès sur cet appareil ?")) {
        localStorage.removeItem(PIN_KEY);
        location.reload();
      }
    });
  }

  /* =====================================================================
     Chargement des données publiques actuelles
     ===================================================================== */
  function loadAll() {
    setStatus("Chargement des données actuelles…");
    Promise.all([
      fetch(BASE + "assets/data/site-content.json", { cache: "no-store" }).then(function (r) { return r.json(); }),
      fetch(BASE + "assets/data/cars.json", { cache: "no-store" }).then(function (r) { return r.json(); })
    ]).then(function (res) {
      state.siteContent = res[0];
      state.cars = res[1];
      renderAll();
      setStatus("Données chargées depuis le site en ligne.");
    }).catch(function (err) {
      setStatus("Erreur de chargement : " + err.message, true);
    });
  }

  function setStatus(msg, isErr) {
    var s = qs("load-status");
    if (!s) return;
    s.textContent = msg;
    s.style.color = isErr ? "#a23b2f" : "";
  }

  function renderAll() {
    renderBusiness();
    renderHero();
    renderPromo();
    renderStats();
    renderWhyUs();
    renderServices();
    renderConditions();
    renderAbout();
    renderFleet();
  }

  /* =====================================================================
     Formulaires — section "Coordonnées & réglages" (business)
     ===================================================================== */
  var BUSINESS_FIELDS = [
    ["name", "Nom de l'agence"], ["tagline", "Slogan court"],
    ["city", "Ville"], ["region", "Région"], ["addressLine", "Adresse affichée"],
    ["streetAddress", "Adresse exacte (interne)"], ["postalCode", "Code postal"],
    ["phonePrimaryDisplay", "Téléphone affiché"], ["phonePrimaryIntl", "Téléphone (format international, ex. +213...)"],
    ["phoneSecondaryDisplay", "WhatsApp affiché"], ["phoneSecondaryIntl", "WhatsApp (format international)"],
    ["whatsappPrimary", "Numéro WhatsApp pour les liens (sans +, ex. 213...)"],
    ["email", "Email"], ["instagram", "Lien Instagram"], ["instagramHandle", "@ Instagram affiché"],
    ["facebook", "Lien Facebook"], ["hoursNote", "Note de disponibilité"], ["hoursDetailed", "Horaires détaillés (interne)"]
  ];

  function renderBusiness() {
    var wrap = qs("business-fields");
    wrap.innerHTML = "";
    BUSINESS_FIELDS.forEach(function (f) {
      var key = f[0], label = f[1];
      var field = el("div", { class: "admin-field" });
      field.appendChild(el("label", {}, label));
      var input = el("input", { type: "text", "data-key": key });
      input.value = state.siteContent.business[key] || "";
      input.addEventListener("input", function () { state.siteContent.business[key] = input.value; });
      field.appendChild(input);
      wrap.appendChild(field);
    });
  }

  function renderHero() {
    var h = state.siteContent.hero;
    bindSimple("hero-title1", h, "title1");
    bindSimple("hero-title2", h, "title2");
    bindSimple("hero-subtitle", h, "subtitle");
    bindSimple("hero-cta1", h, "ctaPrimary");
    bindSimple("hero-cta2", h, "ctaSecondary");
  }

  function bindSimple(id, obj, key) {
    var input = qs(id);
    if (!input) return;
    input.value = obj[key] || "";
    input.addEventListener("input", function () { obj[key] = input.value; });
  }

  function renderPromo() {
    var p = state.siteContent.promo;
    qs("promo-active").checked = !!p.active;
    qs("promo-active").addEventListener("change", function () { p.active = qs("promo-active").checked; });
    bindSimple("promo-label", p, "label");
    bindSimple("promo-text", p, "text");
    bindSimple("promo-cta", p, "cta");
  }

  /* ---- listes dynamiques génériques (stats, why-us, conditions) ---- */
  function renderStats() {
    var wrap = qs("stats-fields");
    wrap.innerHTML = "";
    state.siteContent.stats.forEach(function (s, i) {
      var row = el("div", { class: "admin-list-item" });
      row.appendChild(itemHead("Statistique " + (i + 1), function () { state.siteContent.stats.splice(i, 1); renderStats(); }));
      var grid = el("div", { class: "admin-grid" });
      grid.appendChild(labeledInput("Valeur", s.value, function (v) { s.value = v; }));
      grid.appendChild(labeledInput("Libellé", s.label, function (v) { s.label = v; }));
      row.appendChild(grid);
      wrap.appendChild(row);
    });
    wrap.appendChild(addButton("Ajouter une statistique", function () {
      state.siteContent.stats.push({ value: "", label: "" });
      renderStats();
    }));
  }

  function renderWhyUs() {
    var wrap = qs("whyus-fields");
    wrap.innerHTML = "";
    state.siteContent.whyUs.forEach(function (item, i) {
      var row = el("div", { class: "admin-list-item" });
      row.appendChild(itemHead("Argument " + (i + 1), function () { state.siteContent.whyUs.splice(i, 1); renderWhyUs(); }));
      row.appendChild(labeledInput("Titre", item.title, function (v) { item.title = v; }, true));
      row.appendChild(labeledTextarea("Texte", item.text, function (v) { item.text = v; }));
      wrap.appendChild(row);
    });
    wrap.appendChild(addButton("Ajouter un argument", function () {
      state.siteContent.whyUs.push({ title: "", text: "" });
      renderWhyUs();
    }));
  }

  function renderConditions() {
    var wrap = qs("conditions-fields");
    wrap.innerHTML = "";
    state.siteContent.conditions.forEach(function (c, i) {
      var row = el("div", { class: "admin-list-item" });
      var grid = el("div", { style: "display:flex; gap:0.7rem; align-items:center;" });
      var input = el("input", { type: "text", style: "flex:1" });
      input.value = c;
      input.addEventListener("input", function () { state.siteContent.conditions[i] = input.value; });
      grid.appendChild(input);
      grid.appendChild(removeBtn(function () { state.siteContent.conditions.splice(i, 1); renderConditions(); }));
      row.appendChild(grid);
      wrap.appendChild(row);
    });
    wrap.appendChild(addButton("Ajouter une condition", function () {
      state.siteContent.conditions.push("");
      renderConditions();
    }));
  }

  function renderServices() {
    var wrap = qs("services-fields");
    wrap.innerHTML = "";
    state.siteContent.services.forEach(function (svc, i) {
      var row = el("div", { class: "admin-list-item" });
      row.appendChild(itemHead(svc.title || ("Service " + (i + 1)), function () { state.siteContent.services.splice(i, 1); renderServices(); }));
      var grid = el("div", { class: "admin-grid" });
      grid.appendChild(labeledInput("Identifiant (ancre URL)", svc.id, function (v) { svc.id = v; }));
      grid.appendChild(labeledInput("Titre", svc.title, function (v) { svc.title = v; }));
      row.appendChild(grid);
      row.appendChild(labeledTextarea("Résumé (page d'accueil)", svc.summary, function (v) { svc.summary = v; }));

      var detailsWrap = el("div", { class: "admin-field full" });
      detailsWrap.appendChild(el("label", {}, "Détails (page Services)"));
      svc.details.forEach(function (d, di) {
        var dr = el("div", { style: "display:flex; gap:0.6rem; margin-top:0.4rem;" });
        var input = el("input", { type: "text", style: "flex:1" });
        input.value = d;
        input.addEventListener("input", function () { svc.details[di] = input.value; });
        dr.appendChild(input);
        dr.appendChild(removeBtn(function () { svc.details.splice(di, 1); renderServices(); }));
        detailsWrap.appendChild(dr);
      });
      var addDetailBtn = el("button", { type: "button", class: "admin-add-btn", style: "margin-top:0.5rem" }, "+ Ajouter une ligne de détail");
      addDetailBtn.addEventListener("click", function () { svc.details.push(""); renderServices(); });
      detailsWrap.appendChild(addDetailBtn);
      row.appendChild(detailsWrap);

      wrap.appendChild(row);
    });
  }

  function renderAbout() {
    var a = state.siteContent.about;
    var introEl = qs("about-intro-field"); introEl.value = a.intro || ""; introEl.addEventListener("input", function () { a.intro = introEl.value; });
    var bodyEl = qs("about-body-field"); bodyEl.value = a.body || ""; bodyEl.addEventListener("input", function () { a.body = bodyEl.value; });
    var closingEl = qs("about-closing-field"); closingEl.value = a.closing || ""; closingEl.addEventListener("input", function () { a.closing = closingEl.value; });
  }

  /* ---- Flotte ---- */
  function renderFleet() {
    var wrap = qs("fleet-fields");
    wrap.innerHTML = "";
    state.cars.cars.forEach(function (car, i) {
      var row = el("div", { class: "admin-list-item" });
      row.appendChild(itemHead((car.brand || "Nouvelle") + " " + (car.model || ""), function () {
        state.cars.cars.splice(i, 1); renderFleet();
      }));
      var grid = el("div", { class: "admin-grid" });
      grid.appendChild(labeledInput("Marque", car.brand, function (v) { car.brand = v; }));
      grid.appendChild(labeledInput("Modèle", car.model, function (v) { car.model = v; }));
      grid.appendChild(labeledSelect("Catégorie", car.category, state.cars.categories, function (v) { car.category = v; }));
      grid.appendChild(labeledInput("Transmission", car.transmission, function (v) { car.transmission = v; }));
      grid.appendChild(labeledInput("Places", car.seats, function (v) { car.seats = Number(v) || v; }));
      grid.appendChild(labeledInput("Carburant", car.fuel, function (v) { car.fuel = v; }));
      grid.appendChild(labeledInput("Prix / jour", car.pricePerDay, function (v) { car.pricePerDay = v; }));
      grid.appendChild(labeledInput("Devise", car.currency, function (v) { car.currency = v; }));
      grid.appendChild(labeledInput("Image (chemin ou URL)", car.image, function (v) { car.image = v; }));
      var availField = el("div", { class: "admin-field" });
      availField.appendChild(el("label", {}, "Disponible"));
      var availInput = el("input", { type: "checkbox" });
      availInput.checked = !!car.available;
      availInput.addEventListener("change", function () { car.available = availInput.checked; });
      availField.appendChild(availInput);
      grid.appendChild(availField);
      row.appendChild(grid);
      row.appendChild(labeledTextarea("Description", car.description, function (v) { car.description = v; }));
      wrap.appendChild(row);
    });
    wrap.appendChild(addButton("Ajouter une voiture", function () {
      state.cars.cars.push({
        id: "voiture-" + Date.now(), brand: "", model: "", category: state.cars.categories[0] || "Berline",
        transmission: "Automatique", seats: 5, fuel: "Diesel", pricePerDay: "", currency: "DA",
        available: true, image: "assets/img/car-sedan.svg", imagePlaceholder: true, description: ""
      });
      renderFleet();
    }));
  }

  /* ---- petits constructeurs de champs réutilisables ---- */
  function itemHead(title, onRemove) {
    var head = el("div", { class: "admin-list-item-head" });
    head.appendChild(el("strong", {}, escapeHtml(title)));
    head.appendChild(removeBtn(onRemove, "Supprimer"));
    return head;
  }
  function removeBtn(fn, label) {
    var b = el("button", { type: "button", class: "admin-remove-btn" }, label || "Retirer");
    b.addEventListener("click", fn);
    return b;
  }
  function addButton(label, fn) {
    var b = el("button", { type: "button", class: "admin-add-btn" }, "+ " + label);
    b.addEventListener("click", fn);
    return b;
  }
  function labeledInput(label, value, onInput, full) {
    var f = el("div", { class: "admin-field" + (full ? " full" : "") });
    f.appendChild(el("label", {}, label));
    var input = el("input", { type: "text" });
    input.value = value == null ? "" : value;
    input.addEventListener("input", function () { onInput(input.value); });
    f.appendChild(input);
    return f;
  }
  function labeledTextarea(label, value, onInput) {
    var f = el("div", { class: "admin-field full" });
    f.appendChild(el("label", {}, label));
    var input = el("textarea", {});
    input.value = value == null ? "" : value;
    input.addEventListener("input", function () { onInput(input.value); });
    f.appendChild(input);
    return f;
  }
  function labeledSelect(label, value, options, onInput) {
    var f = el("div", { class: "admin-field" });
    f.appendChild(el("label", {}, label));
    var select = el("select", {});
    (options || []).forEach(function (opt) {
      var o = el("option", { value: opt }, escapeHtml(opt));
      if (opt === value) o.setAttribute("selected", "selected");
      select.appendChild(o);
    });
    select.addEventListener("change", function () { onInput(select.value); });
    f.appendChild(select);
    return f;
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* =====================================================================
     Onglets
     ===================================================================== */
  function wireTabs() {
    var btns = qsa(".admin-tab-btn");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (o) { o.setAttribute("aria-selected", "false"); });
        b.setAttribute("aria-selected", "true");
        qsa(".admin-panel").forEach(function (p) { p.classList.remove("active"); });
        qs(b.getAttribute("data-panel")).classList.add("active");
      });
    });
  }

  /* =====================================================================
     Réglages GitHub (stockés localement sur cet appareil)
     ===================================================================== */
  function loadGhSettings() {
    try {
      var saved = JSON.parse(localStorage.getItem(GH_KEY) || "{}");
      qs("gh-owner").value = saved.owner || "";
      qs("gh-repo").value = saved.repo || "";
      qs("gh-branch").value = saved.branch || "main";
      if (saved.token) { qs("gh-token").value = saved.token; qs("gh-remember").checked = true; }
    } catch (e) { /* ignore */ }
  }
  function saveGhSettingsIfNeeded() {
    var remember = qs("gh-remember").checked;
    var data = { owner: qs("gh-owner").value.trim(), repo: qs("gh-repo").value.trim(), branch: qs("gh-branch").value.trim() || "main" };
    if (remember) data.token = qs("gh-token").value.trim();
    localStorage.setItem(GH_KEY, JSON.stringify(data));
  }

  function ghSettings() {
    return {
      owner: qs("gh-owner").value.trim(),
      repo: qs("gh-repo").value.trim(),
      branch: qs("gh-branch").value.trim() || "main",
      token: qs("gh-token").value.trim()
    };
  }

  function utf8ToBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  function logLine(msg, cls) {
    var log = qs("publish-log");
    var p = el("p", cls ? { class: cls } : {}, msg);
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  function ghApi(path, opts) {
    return fetch("https://api.github.com" + path, opts).then(function (r) {
      return r.json().then(function (body) { return { ok: r.ok, status: r.status, body: body }; });
    });
  }

  function commitFile(cfg, path, contentObj, message) {
    var apiPath = "/repos/" + cfg.owner + "/" + cfg.repo + "/contents/" + path;
    var headers = {
      "Authorization": "Bearer " + cfg.token,
      "Accept": "application/vnd.github+json"
    };
    return ghApi(apiPath + "?ref=" + encodeURIComponent(cfg.branch), { headers: headers }).then(function (getRes) {
      var sha = getRes.ok ? getRes.body.sha : undefined;
      if (!getRes.ok && getRes.status !== 404) {
        throw new Error(path + " — lecture impossible (" + getRes.status + " " + (getRes.body.message || "") + ")");
      }
      var contentStr = JSON.stringify(contentObj, null, 2) + "\n";
      var payload = { message: message, content: utf8ToBase64(contentStr), branch: cfg.branch };
      if (sha) payload.sha = sha;
      return ghApi(apiPath, { method: "PUT", headers: headers, body: JSON.stringify(payload) }).then(function (putRes) {
        if (!putRes.ok) throw new Error(path + " — publication refusée (" + putRes.status + " " + (putRes.body.message || "") + ")");
        return putRes.body;
      });
    });
  }

  function publish() {
    var cfg = ghSettings();
    if (!cfg.owner || !cfg.repo || !cfg.token) {
      logLine("Renseignez le dépôt (owner/repo) et un token avant de publier.", "err");
      return;
    }
    saveGhSettingsIfNeeded();
    qs("publish-btn").setAttribute("disabled", "disabled");
    logLine("Publication en cours…", "muted");
    commitFile(cfg, "assets/data/site-content.json", state.siteContent, "Mise à jour du contenu du site (dashboard admin)")
      .then(function () {
        logLine("assets/data/site-content.json publié.", "ok");
        return commitFile(cfg, "assets/data/cars.json", state.cars, "Mise à jour de la flotte (dashboard admin)");
      })
      .then(function () {
        logLine("assets/data/cars.json publié.", "ok");
        logLine("Terminé. Le site se met à jour automatiquement dans les minutes qui suivent (GitHub Pages).", "ok");
        showToast("Modifications publiées avec succès.");
      })
      .catch(function (err) {
        logLine(err.message, "err");
        showToast("Échec de la publication — voir le journal.");
      })
      .finally(function () {
        qs("publish-btn").removeAttribute("disabled");
      });
  }

  function showToast(msg) {
    var t = qs("admin-toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 3500);
  }

  /* ---- téléchargement de secours (sans token GitHub) ---- */
  function downloadJSON(filename, obj) {
    var blob = new Blob([JSON.stringify(obj, null, 2) + "\n"], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = el("a", { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /* =====================================================================
     Démarrage
     ===================================================================== */
  function boot() {
    wireTabs();
    loadGhSettings();
    loadAll();
    qs("publish-btn").addEventListener("click", publish);
    qs("download-content").addEventListener("click", function () { downloadJSON("site-content.json", state.siteContent); });
    qs("download-cars").addEventListener("click", function () { downloadJSON("cars.json", state.cars); });
    qs("reload-btn").addEventListener("click", loadAll);
    qs("logout-btn").addEventListener("click", function () {
      qs("admin-shell").classList.remove("visible");
      qs("admin-lock").style.display = "flex";
      qs("pin-input").value = "";
      qs("pin-input").focus();
    });
  }

  document.addEventListener("DOMContentLoaded", initLock);
})();
