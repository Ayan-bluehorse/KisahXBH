/**
 * Find Your Size — PDP Sizing Widget (v3 final design)
 * Self-initializing IIFE. Discovers all [data-fys-container] on the page.
 */
(function () {
  'use strict';

  /* ==========================================================================
     CONFIG
     ========================================================================== */
  var CONFIG = {
    // Two-stage model coefficients (size_lookup.json v1, 2026-08-07)
    A0: 30.5317, A1: -0.06684, A2: 0.26733,   // chest_in = A0 + A1*h_cm + A2*w_kg
    B0: 9.6504,  B1: 0.77847,                   // raw_size = B0 + B1*chest_in
    FIT_THRESHOLD: { slim: 0.65, regular: 0.50, broad: 0.35 },
    MIN_SIZE: 36,
    MAX_SIZE: 52,
    // Crosswalk lookup tables (size_lookup.json v1 → crosswalks)
    CROSSWALK_KURTA: {
      S:   { size: 36, share: 0.64 },
      M:   { size: 38, share: 0.47 },
      L:   { size: 40, share: 0.44 },
      XL:  { size: 42, share: 0.57 },
      XXL: { size: 44, share: 1.0 }
    },
    CROSSWALK_SHIRT: {
      '39': { size: 36, share: 0.42 },
      '40': { size: 40, share: 0.64 },
      '42': { size: 42, share: 0.75 },
      '44': { size: 44, share: 1.0 }
    },
    WHATSAPP_NUMBER: '918100993481',
    COOKIE_NAME: '_fys_cid',
    COOKIE_DAYS: 365 * 2,
    LS_KEY: 'fys_inputs',
    LS_COUNTER_KEY: 'fys_widget_opens'
  };

  var SIZES = [36, 38, 40, 42, 44, 46, 48, 50, 52];
  var SIZE_NAMES = {
    36: 'XS', 38: 'S', 40: 'M', 42: 'L', 44: 'XL',
    46: 'XXL', 48: '3XL', 50: '4XL', 52: '5XL'
  };

  var LIMITS = { feet: [4, 7], inch: [0, 11], kg: [42, 135] };

  /* ==========================================================================
     UTILITIES
     ========================================================================== */
  function feetInchesToCm(ft, inch) { return (ft * 12 + inch) * 2.54; }

  /**
   * Crosswalk refiner: if the crosswalk-mapped Kisah size differs from the
   * primary (height/weight) prediction by exactly one size (±2), return the
   * crosswalk size when its share >= 0.6, otherwise return null.
   * Never overrides by more than one size step.
   */
  function applyCrosswalk(primarySize, crosswalkEntry) {
    if (!crosswalkEntry) return null;
    var xSize = crosswalkEntry.size;
    var diff = Math.abs(xSize - primarySize);
    // Only nudge by exactly one size step (sizes are even: 36,38,40...)
    if (diff !== 2) return null;
    return xSize;
  }

  function predictSize(ft, inch, kg, fitPref) {
    var hCm = feetInchesToCm(ft, inch);
    // Stage A: predict chest from height + weight
    var chest = CONFIG.A0 + CONFIG.A1 * hCm + CONFIG.A2 * kg;
    // Stage B: predict raw size from chest
    var raw = CONFIG.B0 + CONFIG.B1 * chest;
    // Fit-preference snapping (slim rounds up later, broad rounds up earlier)
    var threshold = CONFIG.FIT_THRESHOLD[fitPref] || 0.5;
    var lower = Math.floor(raw / 2) * 2;
    var frac = (raw - lower) / 2;
    var size = frac >= threshold ? lower + 2 : lower;
    return Math.max(CONFIG.MIN_SIZE, Math.min(CONFIG.MAX_SIZE, size));
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function getGuestId() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + CONFIG.COOKIE_NAME + '=([^;]*)'));
    if (m) return decodeURIComponent(m[1]);
    var id = 'guest_' + uuid();
    var exp = new Date(Date.now() + CONFIG.COOKIE_DAYS * 86400000).toUTCString();
    document.cookie = CONFIG.COOKIE_NAME + '=' + encodeURIComponent(id) + '; expires=' + exp + '; path=/; SameSite=Lax';
    return id;
  }

  function getCustomerId() {
    return window.__fys_customer_id ? String(window.__fys_customer_id) : getGuestId();
  }

  function getCustomerName() {
    return window.__fys_customer_name ? String(window.__fys_customer_name) : '';
  }

  function getCustomerEmail() {
    return window.__fys_customer_email ? String(window.__fys_customer_email) : '';
  }

  /* Fire to dataLayer (GTM / Elevar) + gtag (GA4 G-31X587J1SK) */
  function trackFysEvent(eventName, params) {
    params = params || {};
    try {
      window.dataLayer = window.dataLayer || [];
      var dlPayload = { event: eventName };
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k)) dlPayload[k] = params[k];
      }
      window.dataLayer.push(dlPayload);
    } catch (e) {}
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }
    } catch (e) {}
  }

  function saveInputs(d) { try { localStorage.setItem(CONFIG.LS_KEY, JSON.stringify(d)); } catch (e) {} }
  function loadInputs() { try { var r = localStorage.getItem(CONFIG.LS_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }

  function incrementOpenCounter() {
    try {
      var c = parseInt(localStorage.getItem(CONFIG.LS_COUNTER_KEY), 10) || 0;
      localStorage.setItem(CONFIG.LS_COUNTER_KEY, String(c + 1));
    } catch (e) {}
  }

  /* ==========================================================================
     INIT — per-container
     ========================================================================== */
  var containers = document.querySelectorAll('[data-fys-container]');

  for (var ci = 0; ci < containers.length; ci++) {
    initWidget(containers[ci]);
  }

  // Expose for dynamic use (e.g. navratri quick view popup)
  window.__fysInitWidget = initWidget;

  function initWidget(root) {
    var productId     = root.getAttribute('data-product-id');
    var productTitle  = root.getAttribute('data-product-title');
    var productHandle = root.getAttribute('data-product-handle');
    var whatsapp      = root.getAttribute('data-whatsapp-number') || CONFIG.WHATSAPP_NUMBER;
    var logEndpoint   = root.getAttribute('data-log-endpoint') || '';

    var availableSizesRaw = [];
    try { availableSizesRaw = JSON.parse(root.getAttribute('data-available-sizes') || '[]'); } catch (e) {}
    // Normalise: extract just the number from labels like "S - 38"
    var availableSizes = availableSizesRaw.map(function (s) {
      var m = String(s).match(/(\d+)/);
      return m ? m[1] : s;
    });

    var fys     = root.querySelector('.fys');
    var trigger = root.querySelector('.fys-trigger');
    var track   = root.querySelector('[data-fys-track]');
    var stepBtns = Array.prototype.slice.call(root.querySelectorAll('.fys-step-btn'));
    var screens  = Array.prototype.slice.call(root.querySelectorAll('.fys-screen'));

    var inFeet = root.querySelector('[data-fys-feet]');
    var inInch = root.querySelector('[data-fys-inch]');
    var inKg   = root.querySelector('[data-fys-kg]');

    var state = { step: 0, feet: 5, inch: 8, kg: 70, build: null, result: null };

    // Load saved inputs
    var saved = loadInputs();
    if (saved) {
      state.feet = saved.feet || 5;
      state.inch = saved.inch || 8;
      state.kg   = saved.kg || 70;
      inFeet.value = state.feet;
      inInch.value = state.inch;
      inKg.value   = state.kg;
    }

    /* ---- Toggle ---- */
    trigger.addEventListener('click', function () {
      var open = fys.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        incrementOpenCounter();
        goTo(state.step);
        trackFysEvent('fys_open', {
          product_id: productId,
          product_title: productTitle,
          product_handle: productHandle
        });
      }
    });

    /* ---- Stepper painting ---- */
    function paintStepper() {
      stepBtns.forEach(function (s, i) {
        s.classList.toggle('is-active', i === state.step);
        s.classList.toggle('is-done', i < state.step);
        s.tabIndex = (i < state.step) ? 0 : -1;
      });
      var pct = state.step / (stepBtns.length - 1);
      track.style.width = 'calc((100% - 12px) * ' + pct + ')';
    }

    /* ---- Navigation ---- */
    function goTo(n) {
      state.step = n;
      screens.forEach(function (sc) {
        sc.classList.toggle('is-active', Number(sc.dataset.screen) === n);
      });
      paintStepper();
      if (n === 3) renderResult();
    }

    stepBtns.forEach(function (s) {
      s.addEventListener('click', function () {
        var n = Number(s.dataset.step);
        if (n < state.step) goTo(n);
      });
    });

    /* ---- Spin buttons ---- */
    function clampField(key) {
      var el = key === 'feet' ? inFeet : key === 'inch' ? inInch : inKg;
      var v = parseInt(el.value, 10);
      if (isNaN(v)) v = LIMITS[key][0];
      v = Math.max(LIMITS[key][0], Math.min(LIMITS[key][1], v));
      el.value = v;
      state[key] = v;
    }

    var spinBtns = root.querySelectorAll('[data-spin]');
    for (var si = 0; si < spinBtns.length; si++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.dataset.spin;
          var dir = Number(btn.dataset.dir);
          var el = key === 'feet' ? inFeet : key === 'inch' ? inInch : inKg;
          el.value = (parseInt(el.value, 10) || LIMITS[key][0]) + dir;
          clampField(key);
        });
      })(spinBtns[si]);
    }

    [
      [inFeet, 'feet'],
      [inInch, 'inch'],
      [inKg, 'kg']
    ].forEach(function (pair) {
      pair[0].addEventListener('change', function () { clampField(pair[1]); });
      pair[0].addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { clampField(pair[1]); advance(); }
      });
    });

    function advance() {
      if (state.step === 0) {
        clampField('feet');
        clampField('inch');
        trackFysEvent('fys_height', {
          product_id: productId,
          product_handle: productHandle,
          feet: state.feet,
          inches: state.inch,
          height: state.feet + "' " + state.inch + '"'
        });
        goTo(1);
      } else if (state.step === 1) {
        clampField('kg');
        trackFysEvent('fys_weight', {
          product_id: productId,
          product_handle: productHandle,
          weight_kg: state.kg
        });
        goTo(2);
      }
    }

    var nextBtns = root.querySelectorAll('[data-next]');
    for (var ni = 0; ni < nextBtns.length; ni++) {
      nextBtns[ni].addEventListener('click', advance);
    }
    var backBtns = root.querySelectorAll('[data-back]');
    for (var bi = 0; bi < backBtns.length; bi++) {
      (function (b) {
        b.addEventListener('click', function () { goTo(state.step - 1); });
      })(backBtns[bi]);
    }

    /* ---- Build cards ---- */
    var builds = Array.prototype.slice.call(root.querySelectorAll('.fys-build'));
    builds.forEach(function (b) {
      b.addEventListener('click', function () {
        builds.forEach(function (x) {
          x.classList.remove('is-selected');
          x.setAttribute('aria-checked', 'false');
        });
        b.classList.add('is-selected');
        b.setAttribute('aria-checked', 'true');
        state.build = b.dataset.build;
        trackFysEvent('fys_build', {
          product_id: productId,
          product_handle: productHandle,
          body_type: state.build
        });
        setTimeout(function () { goTo(3); }, 180);
      });
    });

    /* ---- Crosswalk refiner ---- */
    var crosswalkWrap   = root.querySelector('[data-fys-crosswalk]');
    var crosswalkToggle = root.querySelector('[data-fys-crosswalk-toggle]');
    var crosswalkBody   = root.querySelector('[data-fys-crosswalk-body]');
    var crosswalkNote   = root.querySelector('[data-fys-crosswalk-note]');
    var kurtaPills      = Array.prototype.slice.call(root.querySelectorAll('[data-kurta]'));
    var shirtPills      = Array.prototype.slice.call(root.querySelectorAll('[data-shirt]'));

    if (crosswalkToggle) {
      crosswalkToggle.addEventListener('click', function () {
        var isOpen = crosswalkWrap.classList.toggle('is-open');
        crosswalkBody.hidden = !isOpen;
      });
    }

    function handleCrosswalkSelection(table, key) {
      var entry = table[key];
      var primarySize = state.result;
      var nudged = applyCrosswalk(primarySize, entry);
      if (nudged !== null && nudged !== primarySize) {
        var sizeName = SIZE_NAMES[nudged] || '';
        var lead = entry.share >= 0.6;
        if (lead) {
          crosswalkNote.innerHTML = 'Based on your input, we\'d suggest size <b>' + sizeName + ' — ' + nudged + '</b>. ' +
            'Your measurements point to ' + primarySize + '.';
        } else {
          crosswalkNote.innerHTML = 'You might also consider size <b>' + sizeName + ' — ' + nudged + '</b> based on your input.';
        }
        crosswalkNote.hidden = false;
      } else {
        crosswalkNote.hidden = true;
      }
    }

    kurtaPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        kurtaPills.forEach(function (p) { p.classList.remove('is-selected'); });
        pill.classList.add('is-selected');
        // Deselect shirt pills
        shirtPills.forEach(function (p) { p.classList.remove('is-selected'); });
        handleCrosswalkSelection(CONFIG.CROSSWALK_KURTA, pill.dataset.kurta);
      });
    });

    shirtPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        shirtPills.forEach(function (p) { p.classList.remove('is-selected'); });
        pill.classList.add('is-selected');
        // Deselect kurta pills
        kurtaPills.forEach(function (p) { p.classList.remove('is-selected'); });
        handleCrosswalkSelection(CONFIG.CROSSWALK_SHIRT, pill.dataset.shirt);
      });
    });

    /* ---- Size data -> order --------------------------------------------
       Sent as custom attributes on two channels, never as the order note:

         1. Line item properties  -> ride along with THIS product's line, so
            the size data sits against the item the shopper actually bought.
         2. Cart attributes       -> order-level "Additional details"
            (pre-existing behaviour, left intact).

       Keys keep the underscore prefix, so Shopify hides them from the
       customer in cart/checkout while the admin order still shows them.
    --------------------------------------------------------------------- */
    function buildSizeAttrs(st, size) {
      return {
        '_sr_height': st.feet + "'" + st.inch + '"',
        '_sr_weight': st.kg + 'kg',
        '_sr_pref': st.build || 'regular',
        '_sr_reco': String(size),
        '_sr_version': 'v1'
      };
    }

    var FYS_PROPS_KEY = 'fys_props_' + productId;

    function saveSizeProps(props) {
      try { sessionStorage.setItem(FYS_PROPS_KEY, JSON.stringify(props)); } catch (e) {}
    }

    function loadSizeProps() {
      try {
        var raw = sessionStorage.getItem(FYS_PROPS_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    }

    // The widget renders just outside the <form>, so scope up to the
    // surrounding <product-form> element and take its add-to-cart form.
    function getProductForm() {
      var scope = root.closest('product-form') || document;
      return scope.querySelector('form.js-product-form') ||
             scope.querySelector('form[action*="/cart/add"]');
    }

    // Hidden inputs are matched on data-fys-prop rather than their name, to
    // avoid escaping the square brackets in a selector.
    function writeSizeProps(form, props) {
      if (!form || !props) return;
      Object.keys(props).forEach(function (key) {
        var value = props[key];
        if (value === null || value === undefined || value === '') return;
        var input = form.querySelector('input[data-fys-prop="' + key + '"]');
        if (!input) {
          input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'properties[' + key + ']';
          input.setAttribute('data-fys-prop', key);
          form.appendChild(input);
        }
        input.value = value;
      });
    }

    function stampCartAttributes(st, size) {
      var attrs = buildSizeAttrs(st, size);

      // 1. Line item properties
      saveSizeProps(attrs);
      writeSizeProps(getProductForm(), attrs);

      // 2. Cart attributes (unchanged)
      fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributes: attrs })
      }).catch(function () {});
    }

    // Restore on load: the shopper may have picked a size, browsed away and
    // come back before adding to cart.
    writeSizeProps(getProductForm(), loadSizeProps());

    // Selecting a variant can re-render the form and drop the inputs, so
    // re-assert them in the capture phase. This runs before the theme's own
    // submit handler builds its FormData, and covers the sticky add-to-cart
    // bar too, since that clicks the real button.
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || form.tagName !== 'FORM') return;
      if ((form.getAttribute('action') || '').indexOf('/cart/add') === -1) return;
      if (form !== getProductForm()) return;
      writeSizeProps(form, loadSizeProps());
    }, true);

    /* ---- Render result ---- */
    function renderResult() {
      var build = state.build || 'regular';
      var size = predictSize(state.feet, state.inch, state.kg, build);
      state.result = size;

      // Reset crosswalk state on each result render
      kurtaPills.forEach(function (p) { p.classList.remove('is-selected'); });
      shirtPills.forEach(function (p) { p.classList.remove('is-selected'); });
      if (crosswalkNote) crosswalkNote.hidden = true;
      if (crosswalkWrap) crosswalkWrap.classList.remove('is-open');
      if (crosswalkBody) crosswalkBody.hidden = true;

      // Save inputs
      saveInputs({ feet: state.feet, inch: state.inch, kg: state.kg });

      // Badge
      var badge = root.querySelector('[data-fys-badge]');
      badge.textContent = size;

      // Label
      var label = root.querySelector('[data-fys-size-label]');
      label.textContent = (SIZE_NAMES[size] || '') + ' — ' + size;

      // Answer chips (editable)
      var answersWrap = root.querySelector('[data-fys-answers]');
      answersWrap.innerHTML = '';
      var penSvg = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
      var answers = [
        { txt: state.feet + "' " + state.inch + '"', step: 0 },
        { txt: state.kg + ' kg', step: 1 },
        { txt: build.charAt(0).toUpperCase() + build.slice(1), step: 2 }
      ];
      answers.forEach(function (a) {
        var btn = document.createElement('button');
        btn.className = 'fys-answer';
        btn.innerHTML = a.txt + penSvg;
        btn.setAttribute('aria-label', 'Edit: ' + a.txt);
        btn.addEventListener('click', function () { goTo(a.step); });
        answersWrap.appendChild(btn);
      });

      // Slim note
      var note = root.querySelector('[data-fys-slim-note]');
      var slimSize = root.querySelector('[data-fys-slim-size]');
      var idx = SIZES.indexOf(size);
      if (idx > 0) {
        note.hidden = false;
        slimSize.textContent = SIZES[idx - 1];
      } else {
        note.hidden = true;
      }

      // Support link — WhatsApp
      var supportLink = root.querySelector('[data-fys-support-link]');
      if (supportLink) {
        var waMsg = encodeURIComponent(
          'Hi, I just used the Find Your Size tool for ' + productTitle +
          ' and got size ' + size + '. I have some questions.'
        );
        supportLink.href = 'https://wa.me/' + whatsapp + '?text=' + waMsg;
        supportLink.target = '_blank';
        supportLink.rel = 'noopener';
      }

      // Auto-select size in PDP variant picker
      autoSelectVariant(size);

      // Log to Google Sheets
      logSubmission(size, build);

      // GA4 / GTM — result shown
      trackFysEvent('find_your_size_complete', {
        product_id: productId,
        product_title: productTitle,
        product_handle: productHandle,
        recommended_size: size,
        size_label: (SIZE_NAMES[size] || '') + ' — ' + size,
        body_type: build,
        feet: state.feet,
        inches: state.inch,
        weight_kg: state.kg,
        size_available: availableSizes.indexOf(String(size)) !== -1,
        device: window.innerWidth <= 749 ? 'mobile' : 'desktop'
      });
    }

    /* ---- Auto-select size in the PDP variant picker ---- */
    function autoSelectVariant(size) {
      var sizeStr = String(size);

      // Find the matching radio input inside the variant picker
      var radios = document.querySelectorAll('.option-selector__btns input[type="radio"].js-option');
      for (var i = 0; i < radios.length; i++) {
        var radio = radios[i];
        var val = (radio.value || '').trim();
        // The radio value is the raw size number, e.g. "42"
        if (val === sizeStr) {
          // Click the associated label (which checks the radio and fires change)
          var label = document.querySelector('label[for="' + radio.id + '"]');
          if (label) {
            label.click();
          } else {
            // Fallback: programmatically check + dispatch
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
          }
          return;
        }
      }
    }

    /* ---- Use size button ---- */
    var useSizeBtn = root.querySelector('[data-fys-use-size]');
    if (useSizeBtn) {
      useSizeBtn.addEventListener('click', function () {
        trackFysEvent('find_your_size_select', {
          product_id: productId,
          product_handle: productHandle,
          recommended_size: state.result,
          body_type: state.build || 'regular'
        });
        autoSelectVariant(state.result);
        stampCartAttributes(state, state.result);
        fys.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      });
    }

    /* ---- Start over ---- */
    var startOverBtn = root.querySelector('[data-fys-start-over]');
    if (startOverBtn) {
      startOverBtn.addEventListener('click', function () {
        state = { step: 0, feet: 5, inch: 8, kg: 70, build: null, result: null };
        inFeet.value = 5; inInch.value = 8; inKg.value = 70;
        builds.forEach(function (x) {
          x.classList.remove('is-selected');
          x.setAttribute('aria-checked', 'false');
        });
        // Reset crosswalk
        kurtaPills.forEach(function (p) { p.classList.remove('is-selected'); });
        shirtPills.forEach(function (p) { p.classList.remove('is-selected'); });
        if (crosswalkNote) crosswalkNote.hidden = true;
        if (crosswalkWrap) crosswalkWrap.classList.remove('is-open');
        if (crosswalkBody) crosswalkBody.hidden = true;
        goTo(0);
      });
    }

    /* ---- Logging → Google Sheets (via Apps Script Web App) ---- */
    function logSubmission(size, build) {
      if (!logEndpoint || logEndpoint.indexOf('REPLACE_WITH_YOUR_DEPLOYMENT_ID') !== -1) return;
      try {
        var isLoggedIn = !!(window.__fys_customer_id);
        var payload = {
          event: 'fys_submission',
          timestamp: new Date().toISOString(),
          customer_name: getCustomerName(),
          customer_id: isLoggedIn ? String(window.__fys_customer_id) : '',
          customer_email: getCustomerEmail(),
          guest_id: isLoggedIn ? '' : getGuestId(),
          product_id: productId,
          product_title: productTitle,
          product_handle: productHandle,
          feet: state.feet,
          inches: state.inch,
          height: state.feet + "' " + state.inch + '"',
          weight_kg: state.kg,
          body_type: build,
          recommended_size: size,
          size_label: (SIZE_NAMES[size] || '') + ' — ' + size,
          available: availableSizes.indexOf(String(size)) !== -1,
          device: window.innerWidth <= 749 ? 'mobile' : 'desktop',
          page_url: window.location.href
        };
        // text/plain + no-cors avoids CORS preflight with Google Apps Script
        fetch(logEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        }).catch(function () {});
      } catch (e) {}
    }

    /* ---- Initial paint ---- */
    paintStepper();
  }
})();
