/**
 * Find Your Size (FYS) — Global Smart Sizing & Filter Engine
 * Handles cross-session size persistence, collection auto-filtering,
 * chip bar UI, low inventory guardrails, PDP out-of-stock guidance, and telemetry.
 */
(function () {
  'use strict';

  var SIZES = ['36', '38', '40', '42', '44', '46', '48', '50', '52'];
  var SIZE_NAMES = {
    '36': 'XS — 36',
    '38': 'S — 38',
    '40': 'M — 40',
    '42': 'L — 42',
    '44': 'XL — 44',
    '46': 'XXL — 46',
    '48': '3XL — 48',
    '50': '4XL — 50',
    '52': '5XL — 52'
  };

  var SIZE_FILTER_MAP = {
    '36': 'XS-36',
    '38': 'S-38',
    '40': 'M-40',
    '42': 'L-42',
    '44': 'XL-44',
    '46': '2XL-46',
    '48': '3XL-48',
    '50': '4XL-50',
    '52': '5XL-52'
  };

  function normalizeSize(val) {
    if (!val) return null;
    val = String(val).trim();
    var m = val.match(/(?:^|[^\d])(36|38|40|42|44|46|48|50|52)(?:$|[^\d])/);
    if (m) return m[1];
    return val;
  }

  function getFilterParamValue(size) {
    var norm = normalizeSize(size);
    return SIZE_FILTER_MAP[norm] || size;
  }

  var STORAGE_KEY_SIZE = 'fys_saved_size';
  var STORAGE_KEY_BUILD = 'fys_saved_build';
  var STORAGE_KEY_DISMISSED = 'fys_filter_dismissed';
  var COOKIE_NAME = '_fys_size';
  var WA_NUMBER = '918100993480';

  /* ---------------- Cookie Helpers ---------------- */
  function getCookie(name) {
    try {
      var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[1]) : null;
    } catch (e) {
      return null;
    }
  }

  function setCookie(name, val, days) {
    try {
      var maxAge = (days || 365) * 86400;
      document.cookie = name + '=' + encodeURIComponent(val) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
    } catch (e) {}
  }

  function deleteCookie(name) {
    try {
      document.cookie = name + '=; path=/; max-age=0; SameSite=Lax';
    } catch (e) {}
  }

  /* ---------------- A/B Test Variant Assignment (50/50 Split + URL Override) ---------------- */
  function getAbVariant() {
    // 1. URL parameter override: ?fys_ab=b or ?fys_ab=a (allows immediate manual QA)
    var urlParams = new URLSearchParams(window.location.search);
    var forced = urlParams.get('fys_ab');
    if (forced) {
      forced = (forced.toLowerCase() === 'b' || forced.toLowerCase() === 'variant_b') ? 'variant_b' : 'variant_a';
      setCookie('_fys_ab_variant', forced, 30);
      return forced;
    }

    // 2. Cookie lookup
    var variant = getCookie('_fys_ab_variant');
    if (!variant) {
      variant = Math.random() < 0.5 ? 'variant_a' : 'variant_b';
      setCookie('_fys_ab_variant', variant, 30);
    }
    return variant;
  }

  var abVariant = getAbVariant();

  // Returns Attribution: Stamp cart with _fys_ab_variant once per session
  if (!sessionStorage.getItem('fys_cart_ab_stamped')) {
    fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes: { '_fys_ab_variant': abVariant } })
    }).then(function () {
      sessionStorage.setItem('fys_cart_ab_stamped', '1');
    }).catch(function () {});
  }

  /* ---------------- Telemetry Tracking ---------------- */
  function trackEvent(eventName, payload) {
    payload = payload || {};
    payload.event = eventName;
    payload.fys_ab_variant = abVariant;
    payload.timestamp = new Date().toISOString();

    // Prefer dataLayer (GTM / GA4 single source of truth to avoid duplicate events)
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push(payload);
    } else if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }

    // Debug log in dev
    if (window.__FYS_DEBUG__) {
      console.log('[FYS Event]', eventName, payload);
    }
  }

  // GA4 User Property & Experiment Impression
  if (!sessionStorage.getItem('fys_exp_logged')) {
    trackEvent('experiment_impression', {
      experiment_name: 'find_my_size_pilot',
      variant_id: abVariant
    });
    if (typeof window.gtag === 'function') {
      window.gtag('set', 'user_properties', { fys_ab_variant: abVariant });
    }
    sessionStorage.setItem('fys_exp_logged', '1');
  }

  /* ---------------- Core Engine Definition ---------------- */
  var FYS = {
    sizes: SIZES,
    sizeNames: SIZE_NAMES,

    /* Retrieve saved size across LocalStorage, Cookie, or Customer Metafield */
    getSavedSize: function () {
      var size = null;
      try {
        size = localStorage.getItem(STORAGE_KEY_SIZE);
      } catch (e) {}

      if (!size) {
        size = getCookie(COOKIE_NAME);
      }

      if (!size && window.__fys_customer_saved_size) {
        size = String(window.__fys_customer_saved_size);
      }

      if (size) {
        size = String(size).trim();
        if (SIZES.indexOf(size) !== -1) {
          return size;
        }
      }
      return null;
    },

    getSavedBuild: function () {
      try {
        return localStorage.getItem(STORAGE_KEY_BUILD) || 'regular';
      } catch (e) {
        return 'regular';
      }
    },

    /* Save size across LocalStorage + Cookie + Cart Attributes */
    saveSize: function (size, build) {
      size = String(size).trim();
      if (SIZES.indexOf(size) === -1) return;
      build = build || 'regular';

      try {
        localStorage.setItem(STORAGE_KEY_SIZE, size);
        localStorage.setItem(STORAGE_KEY_BUILD, build);
      } catch (e) {}

      setCookie(COOKIE_NAME, size, 365);

      // Reset session dismissal so active filter kicks in for new size
      FYS.undismissFilter();

      // Stamp Shopify Cart Attributes so checkout & backend can see it
      try {
        fetch('/cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attributes: {
              'Recommended Size': size,
              'Recommended Build': build
            }
          })
        }).catch(function () {});
      } catch (e) {}

      window.dispatchEvent(new CustomEvent('fys:size-saved', {
        detail: { size: size, build: build }
      }));
    },

    clearSavedSize: function () {
      try {
        localStorage.removeItem(STORAGE_KEY_SIZE);
        localStorage.removeItem(STORAGE_KEY_BUILD);
      } catch (e) {}
      deleteCookie(COOKIE_NAME);
    },

    isFilterDismissed: function () {
      var d = false;
      try {
        d = sessionStorage.getItem(STORAGE_KEY_DISMISSED) === 'true';
      } catch (e) {}
      if (!d) {
        d = /(?:^|;\s*)_fys_dismissed=1/.test(document.cookie);
      }
      return d;
    },

    dismissFilter: function () {
      try {
        sessionStorage.setItem(STORAGE_KEY_DISMISSED, 'true');
      } catch (e) {}
      document.cookie = '_fys_dismissed=1; path=/; max-age=86400; SameSite=Lax';
    },

    undismissFilter: function () {
      try {
        sessionStorage.removeItem(STORAGE_KEY_DISMISSED);
      } catch (e) {}
      document.cookie = '_fys_dismissed=; path=/; max-age=0; SameSite=Lax';
    },

    trackEvent: trackEvent
  };

  window.FYS = FYS;

  /* ---------------- Modal Component (Size Switcher) ---------------- */
  function renderSizeModal() {
    if (document.getElementById('fysSizeModal')) return;

    var backdrop = document.createElement('div');
    backdrop.id = 'fysModalBackdrop';
    backdrop.className = 'fys-modal-backdrop';

    var modal = document.createElement('div');
    modal.id = 'fysSizeModal';
    modal.className = 'fys-size-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'fysModalTitle');

    var currentSize = FYS.getSavedSize();

    var html = '';
    html += '<div class="fys-modal-head">';
    html += '  <h3 id="fysModalTitle">Select Your Size</h3>';
    html += '  <button type="button" class="fys-modal-close" id="fysModalClose" aria-label="Close">&times;</button>';
    html += '</div>';
    html += '<p class="fys-modal-sub">We’ll automatically filter styles in stock in your selected size.</p>';
    html += '<div class="fys-size-grid">';

    SIZES.forEach(function (s) {
      var isSelected = (currentSize === s);
      html += '<button type="button" class="fys-size-opt' + (isSelected ? ' is-active' : '') + '" data-size="' + s + '">';
      html += '  <span class="fys-size-num">' + s + '</span>';
      html += '  <span class="fys-size-label">' + (SIZE_NAMES[s] ? SIZE_NAMES[s].split(' — ')[0] : s) + '</span>';
      html += '</button>';
    });

    html += '</div>';
    html += '<div class="fys-modal-footer">';
    html += '  <button type="button" class="fys-modal-clear-link" id="fysModalClearAll">Clear size filter &amp; show all</button>';
    html += '  <span class="fys-modal-help-text">Sizes 36 &ndash; 52</span>';
    html += '</div>';

    modal.innerHTML = html;
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    function closeModal() {
      modal.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    backdrop.addEventListener('click', closeModal);
    var closeBtn = modal.querySelector('#fysModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    var clearAllBtn = modal.querySelector('#fysModalClearAll');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function () {
        closeModal();
        FYS.dismissFilter();
        var p = new URLSearchParams(window.location.search);
        p.delete('filter.v.option.size');
        p.delete('page');
        window.location.href = window.location.pathname + (p.toString() ? ('?' + p.toString()) : '');
      });
    }

    // Size option click
    modal.querySelectorAll('.fys-size-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var oldSize = FYS.getSavedSize();
        var newSize = this.getAttribute('data-size');
        closeModal();

        if (newSize === oldSize) return;

        FYS.saveSize(newSize);

        trackEvent('fys_filter_changed', {
          old_size: oldSize,
          new_size: newSize,
          collection: window.location.pathname
        });

        // Apply new size in current collection/search URL
        var p = new URLSearchParams(window.location.search);
        p.set('filter.v.option.size', getFilterParamValue(newSize));
        p.set('filter.v.availability', '1');
        p.delete('page'); // return to page 1
        window.location.href = window.location.pathname + '?' + p.toString() + window.location.hash;
      });
    });

    FYS.openSizeModal = function () {
      var activeSize = FYS.getSavedSize();
      modal.querySelectorAll('.fys-size-opt').forEach(function (b) {
        if (b.getAttribute('data-size') === activeSize) {
          b.classList.add('is-active');
        } else {
          b.classList.remove('is-active');
        }
      });
      backdrop.classList.add('is-open');
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
  }

  /* ---------------- Collection & Search Page Handling ---------------- */
  function initCollectionOrSearch() {
    var isCollection = window.location.pathname.indexOf('/collections/') !== -1;
    var isSearch = window.location.pathname.indexOf('/search') !== -1;

    if (!isCollection && !isSearch) return;

    // Control Group: In Variant A, do not auto-filter or show chip bar
    if (abVariant === 'variant_a') return;

    var search = window.location.search;
    var params = new URLSearchParams(search);
    var activeSizeInUrl = params.get('filter.v.option.size');
    var isAvailabilityFiltered = params.get('filter.v.availability') === '1';
    var savedSize = FYS.getSavedSize();
    var isDismissed = FYS.isFilterDismissed();

    // 1. Auto-filtering: If user has a saved size, not dismissed, and URL lacks size filter:
    if (savedSize && !isDismissed && !activeSizeInUrl) {
      params.set('filter.v.option.size', getFilterParamValue(savedSize));
      params.set('filter.v.availability', '1');
      params.delete('page');

      trackEvent('fys_filter_applied', {
        size: savedSize,
        collection: window.location.pathname,
        source: 'auto'
      });

      window.location.replace(window.location.pathname + '?' + params.toString() + window.location.hash);
      return;
    }

    if (activeSizeInUrl) {
      renderChipBar(normalizeSize(activeSizeInUrl));
    }
  }

  /* ---------------- Render Chip Bar ---------------- */
  function renderChipBar(size) {
    renderSizeModal();

    var existing = document.getElementById('fysSizeChipBar');
    if (existing) existing.remove();

    var chipBar = document.createElement('div');
    chipBar.id = 'fysSizeChipBar';
    chipBar.className = 'fys-size-chip-bar';

    var sizeLabel = SIZE_NAMES[size] || ('Size ' + size);

    chipBar.innerHTML = [
      '<div class="fys-size-chip-inner">',
      '  <span class="fys-size-chip-label">',
      '    <svg class="fys-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
      '      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>',
      '      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>',
      '    </svg>',
      '    <span>Showing in-stock styles in <strong>' + sizeLabel + '</strong></span>',
      '  </span>',
      '  <div class="fys-size-chip-actions">',
      '    <button type="button" class="fys-chip-btn fys-chip-btn--change" id="fysChipChangeBtn">change</button>',
      '    <span class="fys-chip-divider">·</span>',
      '    <button type="button" class="fys-chip-btn fys-chip-btn--clear" id="fysChipClearBtn" title="Show all sizes">show all ✕</button>',
      '  </div>',
      '</div>'
    ].join('');

    // Place chipBar where appropriate
    var container = document.getElementById('fysSizeChipContainer');
    if (container) {
      container.innerHTML = '';
      container.appendChild(chipBar);
    } else {
      var target = document.querySelector('.kisah-ctrl') ||
                   document.querySelector('#kisahApplied') ||
                   document.querySelector('.collection-listing') ||
                   document.querySelector('.product-grid');
      if (target && target.parentNode) {
        target.parentNode.insertBefore(chipBar, target);
      }
    }

    // Bind Change button
    var changeBtn = chipBar.querySelector('#fysChipChangeBtn');
    if (changeBtn) {
      changeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (FYS.openSizeModal) {
          FYS.openSizeModal();
        }
      });
    }

    // Bind Clear/Dismiss button
    var clearBtn = chipBar.querySelector('#fysChipClearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        FYS.dismissFilter();

        trackEvent('fys_filter_cleared', {
          size: size,
          collection: window.location.pathname
        });

        var p = new URLSearchParams(window.location.search);
        var keysToDelete = [];
        p.forEach(function (val, key) {
          if (key.indexOf('size') !== -1) {
            keysToDelete.push(key);
          }
        });
        keysToDelete.forEach(function (k) { p.delete(k); });
        p.delete('page');

        if (!p.has('filter.v.availability')) {
          p.set('filter.v.availability', '1');
        }

        var queryStr = p.toString();
        var targetUrl = window.location.pathname + (queryStr ? ('?' + queryStr) : '') + window.location.hash;
        window.location.href = targetUrl;
      });
    }
  }

  /* ---------------- PDP Size Auto-Selection (Clean, No intrusive banners) ---------------- */
  function initPDP() {
    var savedSize = FYS.getSavedSize();
    if (!savedSize) return;

    // Check if variant picker exists on this product
    autoSelectVariantRadio(savedSize);
  }

  function autoSelectVariantRadio(size) {
    var sizeStr = String(size).trim();
    var radios = document.querySelectorAll('.option-selector__btns input[type="radio"].js-option');
    for (var i = 0; i < radios.length; i++) {
      var radio = radios[i];
      var val = (radio.value || '').trim();
      // Match "40", "M-40", etc.
      if (val === sizeStr || val.endsWith('-' + sizeStr) || ('-' + val).indexOf('-' + sizeStr) !== -1) {
        var label = document.querySelector('label[for="' + radio.id + '"]');
        if (label) {
          label.click();
        } else {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return;
      }
    }
  }

  /* ---------------- Initialization on DOM Ready & Custom Events ---------------- */
  function onReady() {
    initCollectionOrSearch();
    initPDP();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // Re-run on size saved or theme section renders
  window.addEventListener('fys:size-saved', function () {
    initPDP();
  });

  // Re-run if theme replaces collection listing via AJAX
  document.addEventListener('shopify:section:load', onReady);
})();

