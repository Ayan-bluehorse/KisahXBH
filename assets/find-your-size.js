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
    // Two-stage model coefficients & thresholds (v2, size_fit/size_reco_v2.py)
    A0: 30.5317, A1: -0.06684, A2: 0.26733,   // chest_in = A0 + A1*h_cm + A2*w_kg
    B0: 9.6504,  B1: 0.77847,                   // raw_size = B0 + B1*chest_in
    ROUND_UP_AT: { regular: 0.75, broad: 0.75, slim: 0.85 },
    MIN_SIZE: 36,
    MAX_SIZE: 52,
    MIN_HEIGHT_CM: 145,
    MAX_HEIGHT_CM: 200,
    MIN_WEIGHT_KG: 42,
    MAX_WEIGHT_KG: 135,
    WHATSAPP_NUMBER: '918100993480',
    COOKIE_NAME: '_fys_cid',
    COOKIE_DAYS: 365 * 2,
    LS_KEY: 'fys_inputs',
    LS_COUNTER_KEY: 'fys_widget_opens',
    AB_LS_KEY: 'fys_ab_variant',
    AB_COOKIE_NAME: '_fys_ab_variant'
  };

  var SIZES = [36, 38, 40, 42, 44, 46, 48, 50, 52];

  // Garment specs shown on the result screen, expressed as offsets from the
  // recommended size (size 38 -> chest 40, kurta 40, waist 34-36).
  var GARMENT = {
    jacketChest: 2,
    kurtaSize: 2,
    waistLow: -4,
    waistHigh: -2
  };
  var SIZE_NAMES = {
    36: 'XS', 38: 'S', 40: 'M', 42: 'L', 44: 'XL',
    46: 'XXL', 48: '3XL', 50: '4XL', 52: '5XL'
  };

  var LIMITS = { feet: [4, 7], inch: [0, 11], kg: [42, 135] };

  /* ==========================================================================
     UTILITIES
     ========================================================================== */
  function ftInToCm(ft, inch) {
    return (ft * 12 + inch) * 2.54;
  }

  function recommendSize(heightCm, weightKg, build) {
    build = (build || 'regular').toLowerCase();
    if (heightCm < CONFIG.MIN_HEIGHT_CM || heightCm > CONFIG.MAX_HEIGHT_CM ||
        weightKg < CONFIG.MIN_WEIGHT_KG || weightKg > CONFIG.MAX_WEIGHT_KG) {
      return { size: null, band: null, version: 'v2' };
    }
    var chest = CONFIG.A0 + CONFIG.A1 * heightCm + CONFIG.A2 * weightKg;
    var raw = CONFIG.B0 + CONFIG.B1 * chest;
    var lower = Math.floor(raw / 2) * 2;
    var frac = (raw - lower) / 2;
    var threshold = (CONFIG.ROUND_UP_AT && CONFIG.ROUND_UP_AT[build] !== undefined)
      ? CONFIG.ROUND_UP_AT[build]
      : 0.75;
    var size = frac >= threshold ? lower + 2 : lower;
    size = Math.min(Math.max(size, CONFIG.MIN_SIZE), CONFIG.MAX_SIZE);
    var band = size >= 46 ? [size, Math.min(size + 2, CONFIG.MAX_SIZE)] : null;
    return { size: size, band: band, version: 'v2' };
  }

  /* 50/50 sticky A/B variant assignment */
  function getOrAssignAbVariant() {
    try {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('fys_ab');
      if (q) {
        var v = q.toUpperCase() === 'B' ? 'B' : 'A';
        try { localStorage.setItem(CONFIG.AB_LS_KEY, v); } catch (e) {}
        setAbCookie(CONFIG.AB_COOKIE_NAME, v, 365);
        return v;
      }
    } catch (e) {}

    try {
      var ls = localStorage.getItem(CONFIG.AB_LS_KEY);
      if (ls === 'A' || ls === 'B') return ls;
    } catch (e) {}

    var m = document.cookie.match(new RegExp('(?:^|; )' + CONFIG.AB_COOKIE_NAME + '=([^;]*)'));
    if (m && (m[1] === 'A' || m[1] === 'B')) {
      try { localStorage.setItem(CONFIG.AB_LS_KEY, m[1]); } catch (e) {}
      return m[1];
    }

    var assigned = Math.random() < 0.5 ? 'A' : 'B';
    try { localStorage.setItem(CONFIG.AB_LS_KEY, assigned); } catch (e) {}
    setAbCookie(CONFIG.AB_COOKIE_NAME, assigned, 365);
    return assigned;
  }

  function setAbCookie(name, val, days) {
    try {
      var exp = new Date(Date.now() + (days || 365) * 86400000).toUTCString();
      document.cookie = name + '=' + val + '; expires=' + exp + '; path=/; SameSite=Lax';
    } catch (e) {}
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
    // GA4 - sent directly with gtag. GTM has no tags for fys_* events, so this is the only path into
    // GA4. Keep it independent of the dataLayer push (window.dataLayer always exists on kisah.in,
    // so an else-branch here never runs - that is what broke fys_* tracking on 2026-11-03).
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }
    } catch (e) {}
    // dataLayer - for GTM triggers only (does not send anything to GA4 by itself)
    try {
      window.dataLayer = window.dataLayer || [];
      var dlPayload = { event: eventName };
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k)) dlPayload[k] = params[k];
      }
      window.dataLayer.push(dlPayload);
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
    // find-your-size.liquid includes this script, so it runs once per rendered
    // copy of the widget (PDP + size chart drawer). Initialising a container
    // twice would bind the trigger twice and cancel every toggle out.
    if (root.getAttribute('data-fys-ready') === 'true') return;
    root.setAttribute('data-fys-ready', 'true');

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

    var state = {
      step: 0,
      feet: 5,
      inch: 8,
      kg: 70,
      build: null,
      usualSize: '',
      result: null,
      variant: getOrAssignAbVariant()
    };

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
      if (n === 4) renderResult();
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

    /* ---- Build cards (Screen 2 -> Screen 3) ---- */
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

    /* ---- Usual kurta size (Screen 3 -> Screen 4) ---- */
    var usualPills = Array.prototype.slice.call(root.querySelectorAll('.fys-usual-pill'));
    var skipUsualBtn = root.querySelector('[data-fys-skip-usual]');

    usualPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        usualPills.forEach(function (p) {
          p.classList.remove('is-selected');
          p.setAttribute('aria-checked', 'false');
        });
        pill.classList.add('is-selected');
        pill.setAttribute('aria-checked', 'true');
        state.usualSize = pill.dataset.usual || '';
        trackFysEvent('fys_usual_size', {
          product_id: productId,
          product_handle: productHandle,
          usual_size: state.usualSize
        });
        setTimeout(function () { goTo(4); }, 180);
      });
    });

    if (skipUsualBtn) {
      skipUsualBtn.addEventListener('click', function () {
        state.usualSize = '';
        usualPills.forEach(function (p) {
          p.classList.remove('is-selected');
          p.setAttribute('aria-checked', 'false');
        });
        trackFysEvent('fys_usual_size_skipped', {
          product_id: productId,
          product_handle: productHandle
        });
        goTo(4);
      });
    }

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
        '_sr_reco': size ? String(size) : '',
        '_sr_version': 'v2',
        '_sr_variant': st.variant || 'A',
        '_sr_usual': st.usualSize || ''
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
      var heightCm = ftInToCm(state.feet, state.inch);
      var build = state.build || 'regular';
      var res = recommendSize(heightCm, state.kg, build);
      state.result = res;

      // Save inputs
      saveInputs({ feet: state.feet, inch: state.inch, kg: state.kg });

      var normalView = root.querySelector('[data-fys-result-normal]');
      var oorView = root.querySelector('[data-fys-result-oor]');

      // Helper for editable answer chips
      function renderAnswerChips(targetEl) {
        if (!targetEl) return;
        targetEl.innerHTML = '';
        var penSvg = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
        var answers = [
          { txt: state.feet + "' " + state.inch + '"', step: 0 },
          { txt: state.kg + ' kg', step: 1 },
          { txt: build.charAt(0).toUpperCase() + build.slice(1), step: 2 }
        ];
        if (state.usualSize) {
          answers.push({ txt: 'Usually ' + state.usualSize, step: 3 });
        }
        answers.forEach(function (a) {
          var btn = document.createElement('button');
          btn.className = 'fys-answer';
          btn.innerHTML = a.txt + penSvg;
          btn.setAttribute('aria-label', 'Edit: ' + a.txt);
          btn.addEventListener('click', function () { goTo(a.step); });
          targetEl.appendChild(btn);
        });
      }

      // OUT OF BOUNDS HANDLING
      if (!res.size) {
        if (normalView) normalView.hidden = true;
        if (oorView) oorView.hidden = false;

        var oorAnswersWrap = root.querySelector('[data-fys-oor-answers]');
        renderAnswerChips(oorAnswersWrap);

        var oorWaBtn = root.querySelector('[data-fys-oor-whatsapp]');
        if (oorWaBtn) {
          var waOorMsg = encodeURIComponent(
            'Hi, I used the Find Your Size tool for ' + productTitle +
            ' with height ' + state.feet + "'" + state.inch + '" and weight ' + state.kg +
            'kg, but my measurements fall outside the standard range. Could you help me with sizing?'
          );
          oorWaBtn.href = 'https://wa.me/' + whatsapp + '?text=' + waOorMsg;
        }

        var oorSizeChartBtn = root.querySelector('[data-fys-oor-size-chart]');
        if (oorSizeChartBtn) {
          oorSizeChartBtn.onclick = function () {
            var chartTrigger = document.querySelector('.size-chart-link button, .size-chart-trigger, .ss-size-chart-trigger, [data-modal*="size-chart"] button');
            if (chartTrigger) {
              chartTrigger.click();
            } else {
              var scDrawer = document.querySelector('.size-chart-drawer, .variant-size-chart, .size-chart-content');
              if (scDrawer) scDrawer.scrollIntoView({ behavior: 'smooth' });
            }
          };
        }

        // GA4 / GTM
        trackFysEvent('find_your_size_complete', {
          product_id: productId,
          product_title: productTitle,
          product_handle: productHandle,
          recommended_size: 'out_of_range',
          size_label: 'Out of range',
          body_type: build,
          feet: state.feet,
          inches: state.inch,
          weight_kg: state.kg,
          version: 'v2',
          variant: state.variant,
          fys_ab_variant: state.variant,
          usual_size: state.usualSize || '',
          size_available: false,
          device: window.innerWidth <= 749 ? 'mobile' : 'desktop'
        });

        logSubmission(null, build);
        return;
      }

      // NORMAL SIZE RECOMMENDATION
      if (normalView) normalView.hidden = false;
      if (oorView) oorView.hidden = true;

      var size = res.size;

      // Badge
      var badge = root.querySelector('[data-fys-badge]');
      if (badge) badge.textContent = size;

      // Label with band support
      var label = root.querySelector('[data-fys-size-label]');
      var sizeName = SIZE_NAMES[size] || '';
      var labelText = sizeName + ' — ' + size;
      if (res.band) {
        labelText += ' (band ' + res.band[0] + '–' + res.band[1] + ')';
      }
      if (label) label.textContent = labelText;

      // 50/50 A/B Test Variant B copy
      var variantBNote = root.querySelector('[data-fys-variant-b-note]');
      if (variantBNote) {
        variantBNote.hidden = (state.variant !== 'B');
      }

      // Answer chips (editable)
      var answersWrap = root.querySelector('[data-fys-answers]');
      renderAnswerChips(answersWrap);

      // Save globally across sessions (LocalStorage + Cookie + Cart attribute)
      if (window.FYS && typeof window.FYS.saveSize === 'function') {
        window.FYS.saveSize(size, build);
      }

      var isAvailable = checkSizeAvailable(size);

      // Garment breakdown
      var breakdown = root.querySelector('[data-fys-breakdown]');
      if (breakdown) {
        var waistLow = size + GARMENT.waistLow;
        var waistHigh = size + GARMENT.waistHigh;
        var specs = [
          'Jacket - for a ' + (size + GARMENT.jacketChest) + '-inch body chest; regular fit',
          'Kurta - size ' + (size + GARMENT.kurtaSize) + '; regular fit',
          'Trouser - for a ' + waistLow + String.fromCharCode(8211) + waistHigh +
            '-inch body waist; partially elasticated with drawstring'
        ];
        breakdown.innerHTML = '';
        specs.forEach(function (txt) {
          var li = document.createElement('li');
          li.textContent = txt;
          breakdown.appendChild(li);
        });
      }

      // Size on the primary button / OOS handling
      var useBtn = root.querySelector('[data-fys-use-size]');
      var btnSize = root.querySelector('[data-fys-btn-size]');
      var note = root.querySelector('[data-fys-slim-note]');
      var slimSize = root.querySelector('[data-fys-slim-size]');

      if (!isAvailable) {
        // Out of Stock in this style: DO NOT push into another size or suggest slim
        if (note) note.hidden = true;
        if (useBtn) {
          useBtn.innerHTML = 'View In-Stock Styles in Size ' + size + ' &rarr;';
          useBtn.classList.add('fys-btn--oos');
        }

        var resultH = root.querySelector('.fys-result-h');
        if (resultH) {
          resultH.innerHTML = 'Your recommended size is <span data-fys-size-label>' + labelText + '</span><span class="fys-oos-inline-pill">Sold Out in this style</span>';
        }

        // Track OOS shown
        trackFysEvent('fys_pdp_oos_shown', {
          product_id: productId,
          product_handle: productHandle,
          recommended_size: size,
          version: 'v2',
          variant: state.variant
        });
      } else {
        if (btnSize) btnSize.textContent = size;
        if (useBtn) {
          useBtn.innerHTML = 'Select Size <span data-fys-btn-size>' + size + '</span>';
          useBtn.classList.remove('fys-btn--oos');
        }

        // Slim note (only if in stock)
        var idx = SIZES.indexOf(size);
        if (idx > 0 && note && slimSize) {
          note.hidden = false;
          slimSize.textContent = SIZES[idx - 1];
        } else if (note) {
          note.hidden = true;
        }

        // Auto-select size in PDP variant picker
        autoSelectVariant(size);
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

      // Order stamping (line item properties + cart attributes)
      stampCartAttributes(state, size);

      // Log to Google Sheets
      logSubmission(size, build);

      // GA4 / GTM — result shown
      trackFysEvent('find_your_size_complete', {
        product_id: productId,
        product_title: productTitle,
        product_handle: productHandle,
        recommended_size: size,
        size_band: res.band ? (res.band[0] + '-' + res.band[1]) : null,
        size_label: labelText,
        body_type: build,
        feet: state.feet,
        inches: state.inch,
        weight_kg: state.kg,
        version: 'v2',
        variant: state.variant,
        fys_ab_variant: state.variant,
        usual_size: state.usualSize || '',
        size_available: isAvailable,
        device: window.innerWidth <= 749 ? 'mobile' : 'desktop'
      });
    }

    /* ---- Check if size is in available sizes (handles "40" and "M-40") ---- */
    function checkSizeAvailable(size) {
      var sStr = String(size).trim();
      return availableSizes.some(function (v) {
        var str = String(v).trim();
        return str === sStr || str.endsWith('-' + sStr) || ('-' + str).indexOf('-' + sStr) !== -1;
      });
    }

    /* ---- Auto-select size in the PDP variant picker ---- */
    function autoSelectVariant(size) {
      var sizeStr = String(size).trim();

      // Find the matching radio input inside the variant picker
      var radios = document.querySelectorAll('.option-selector__btns input[type="radio"].js-option');
      for (var i = 0; i < radios.length; i++) {
        var radio = radios[i];
        var val = (radio.value || '').trim();
        // Matches e.g. "40" or "M-40"
        if (val === sizeStr || val.endsWith('-' + sizeStr) || ('-' + val).indexOf('-' + sizeStr) !== -1) {
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
        var sizeVal = state.result ? state.result.size : null;
        if (!sizeVal) return;
        var isAvailable = checkSizeAvailable(sizeVal);
        if (!isAvailable) {
          var destUrl = '/collections/all?filter.v.option.size=' + sizeVal + '&filter.v.availability=1';
          trackFysEvent('fys_pdp_oos_redirect', {
            product_id: productId,
            product_handle: productHandle,
            recommended_size: sizeVal,
            destination_url: destUrl
          });
          window.location.href = destUrl;
          return;
        }

        trackFysEvent('find_your_size_select', {
          product_id: productId,
          product_handle: productHandle,
          recommended_size: sizeVal,
          body_type: state.build || 'regular',
          version: 'v2',
          variant: state.variant,
          usual_size: state.usualSize || ''
        });
        autoSelectVariant(sizeVal);
        stampCartAttributes(state, sizeVal);
        fys.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      });
    }

    /* ---- Start over ---- */
    var startOverBtns = root.querySelectorAll('[data-fys-start-over]');
    for (var oi = 0; oi < startOverBtns.length; oi++) {
      startOverBtns[oi].addEventListener('click', function () {
        state = {
          step: 0,
          feet: 5,
          inch: 8,
          kg: 70,
          build: null,
          usualSize: '',
          result: null,
          variant: state.variant
        };
        inFeet.value = 5; inInch.value = 8; inKg.value = 70;
        builds.forEach(function (x) {
          x.classList.remove('is-selected');
          x.setAttribute('aria-checked', 'false');
        });
        usualPills.forEach(function (p) {
          p.classList.remove('is-selected');
          p.setAttribute('aria-checked', 'false');
        });
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
          recommended_size: size || 'out_of_range',
          size_label: size ? ((SIZE_NAMES[size] || '') + ' — ' + size) : 'Out of range',
          version: 'v2',
          variant: state.variant,
          usual_size: state.usualSize || '',
          available: size ? (availableSizes.indexOf(String(size)) !== -1) : false,
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
