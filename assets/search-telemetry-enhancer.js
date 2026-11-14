/**
 * Searchanise & Store Search Telemetry Bridge + Searchanise UX Enhancer
 * Kisah Online - D2C GA4 & Merchandising Optimization
 * 
 * 1. Autocomplete Product & Suggestion Clicks -> Sends GA4 'search', 'select_item', and 'search_autocomplete_click'
 * 2. 0-Result Search Detection -> Sends GA4 'search_zero_results' (gtag) + dataLayer 'view_search_results' / 'search_zero_results'
 * 3. Pageview De-duplication Guard -> Prevents Searchanise virtual pageviews on scroll/filter changes
 * 4. Size-Inclusiveness Sorter -> Re-orders Searchanise results so core sizes (S, M, L, XL) rank highest
 */

(function () {
  'use strict';

  var GA4_MEASUREMENT_ID = 'G-31X587J1SK';

  function getActiveSearchQuery() {
    // 1. From Searchanise active input
    var snizeInput = document.querySelector('.snize-input, input.snize-focused');
    if (snizeInput && snizeInput.value) return snizeInput.value.trim();

    // 2. From standard theme search input
    var searchInput = document.querySelector('input[name="q"], .main-search__input, [data-predictive-search-input]');
    if (searchInput && searchInput.value) return searchInput.value.trim();

    // 3. From URL parameter
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  /* -------------------------------------------------------------------------
   * 1. AUTOCOMPLETE INTERACTION TRACKING (Product & Suggestion Clicks)
   * ------------------------------------------------------------------------- */
  function initAutocompleteTracking() {
    document.addEventListener('click', function (e) {
      // A. Check for Autocomplete Product Click (Searchanise or Native Predictive)
      var productCard = e.target.closest(
        '.snize-ac-results .snize-item, ' +
        '.snize-ac-results a[href*="/products/"], ' +
        '#snize_autocomplete a[href*="/products/"], ' +
        '.snize-product a[href*="/products/"], ' +
        '.predictive-search a[href*="/products/"], ' +
        '#predictive-search-results a[href*="/products/"]'
      );

      if (productCard) {
        var query = getActiveSearchQuery();
        var href = productCard.getAttribute('href') || (productCard.tagName === 'A' ? productCard.href : '');
        if (!href) {
          var innerLink = productCard.querySelector('a[href*="/products/"]');
          if (innerLink) href = innerLink.getAttribute('href') || innerLink.href;
        }

        var titleEl = productCard.querySelector('.snize-title, .snize-item-title, .product-block__title, .title') || productCard;
        var title = (titleEl ? (titleEl.textContent || titleEl.innerText) : '').trim();

        var priceEl = productCard.querySelector('.snize-price, .snize-item-price, .product-price, .theme-money');
        var priceText = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, '') : '';
        var price = priceText ? parseFloat(priceText) : undefined;

        // Determine item index in dropdown list
        var container = productCard.closest('.snize-ac-results-content, .snize-ac-results, #predictive-search-results, .predictive-search') || productCard.parentElement;
        var allProductItems = container ? Array.from(container.querySelectorAll('.snize-item, a[href*="/products/"]')) : [];
        var position = allProductItems.indexOf(productCard) + 1;
        if (position <= 0) position = 1;

        var productHandle = href ? href.split('/products/')[1]?.split('?')[0]?.replace(/\/$/, '') : '';

        // 1. Send dataLayer event for GTM / Elevar
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'search_autocomplete_click',
          search_term: query,
          item_name: title,
          item_id: productHandle,
          item_url: href,
          item_position: position,
          price: price,
          timestamp: new Date().toISOString()
        });

        // 2. Send standard GA4 events
        if (typeof window.gtag === 'function') {
          // Register that a search was performed
          if (query) {
            window.gtag('event', 'search', {
              search_term: query
            });
          }

          // Register e-commerce select_item from autocomplete list
          window.gtag('event', 'select_item', {
            item_list_id: 'searchanise_autocomplete',
            item_list_name: 'Searchanise Autocomplete',
            items: [{
              item_id: productHandle,
              item_name: title,
              index: position,
              price: price
            }]
          });
        }

        // 3. Stash in sessionStorage for PDP conversion attribution
        try {
          sessionStorage.setItem('_kisah_search_query', query);
          sessionStorage.setItem('_kisah_search_source', 'autocomplete');
          sessionStorage.setItem('_kisah_search_item_clicked', title);
          sessionStorage.setItem('_kisah_search_time', String(Date.now()));
        } catch (err) {}

        return;
      }

      // B. Check for Suggestion Query Click (e.g. user clicks "black kurta" suggestion chip)
      var suggestionItem = e.target.closest(
        '.snize-ac-results .snize-suggestion, ' +
        '.snize-ac-results [class*="suggestion"], ' +
        '#predictive-search-results a[href*="/search?q="]'
      );

      if (suggestionItem) {
        var suggestionText = (suggestionItem.textContent || suggestionItem.innerText || '').trim();
        if (suggestionText) {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'search_suggestion_click',
            search_term: suggestionText,
            timestamp: new Date().toISOString()
          });

          if (typeof window.gtag === 'function') {
            window.gtag('event', 'search', {
              search_term: suggestionText
            });
          }
        }
      }
    }, true);
  }

  /* -------------------------------------------------------------------------
   * 2. ZERO-RESULT SEARCH TRACKING
   * ------------------------------------------------------------------------- */
  var reportedZeroQueries = {};

  function logZeroResults(query) {
    if (!query) return;
    var normQuery = query.toLowerCase().trim();
    if (!normQuery || reportedZeroQueries[normQuery]) return;

    // Throttle per session using sessionStorage
    var storageKey = '_logged_0res_' + encodeURIComponent(normQuery);
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, '1');
    } catch (e) {}

    reportedZeroQueries[normQuery] = true;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'view_search_results',
      search_term: query,
      results_count: 0
    });
    window.dataLayer.push({
      event: 'search_zero_results',
      search_term: query,
      results_count: 0,
      timestamp: new Date().toISOString()
    });

    // GA4 - sent directly with gtag (GTM has no tag for these dataLayer events, so they never reach
    // GA4 on their own). Sent as one distinct event so zero-result searches don't inflate the
    // existing view_search_results count.
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'search_zero_results', {
        search_term: query,
        results_count: 0
      });
    }
  }

  function monitorZeroResults() {
    // Check Searchanise callbacks if Searchanise API is present
    if (window.Searchanise && window.Searchanise.Callbacks) {
      try {
        window.Searchanise.Callbacks.Add('AfterSearch', function (res) {
          if (res && (res.total_items === 0 || (Array.isArray(res.items) && res.items.length === 0))) {
            var q = res.q || getActiveSearchQuery();
            logZeroResults(q);
          }
        });
      } catch (e) {}
    }

    // Fallback: MutationObserver watching Searchanise results or native search page
    var observer = new MutationObserver(function () {
      // 1. Searchanise zero-result DOM indicators
      var snizeNoResults = document.querySelector(
        '.snize-no-products-found, ' +
        '#snize_results .snize-no-products-found, ' +
        '.snize-ac-results-empty, ' +
        '[data-total-products="0"]'
      );
      if (snizeNoResults && snizeNoResults.offsetParent !== null) {
        logZeroResults(getActiveSearchQuery());
      }

      // 2. Native theme zero-result indicator
      var nativeNoResults = document.querySelector('.main-search__no-results, [data-empty-search]');
      if (nativeNoResults && nativeNoResults.offsetParent !== null) {
        logZeroResults(getActiveSearchQuery());
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* -------------------------------------------------------------------------
   * 3. PAGEVIEW DE-DUPLICATION GUARD FOR SEARCHANISE
   * ------------------------------------------------------------------------- */
  function guardPageviewInflation() {
    // Searchanise often triggers synthetic history.pushState when customer scrolls or applies facets.
    // We mark synthetic search sub-navigation so GTM / GA4 History Change triggers don't treat infinite scroll as a new pageview.
    var origPushState = history.pushState;
    if (origPushState) {
      history.pushState = function (state, title, url) {
        if (url && typeof url === 'string') {
          var isSearchScrollOrFacet = (
            (url.indexOf('/search') !== -1 || window.location.pathname.indexOf('/search') !== -1) &&
            (url.indexOf('page=') !== -1 || url.indexOf('snize_') !== -1 || url.indexOf('filter.') !== -1)
          );
          if (isSearchScrollOrFacet) {
            window.__searchanise_is_subpage_ajax = true;
            setTimeout(function () {
              window.__searchanise_is_subpage_ajax = false;
            }, 300);
          }
        }
        return origPushState.apply(this, arguments);
      };
    }
  }

  /* -------------------------------------------------------------------------
   * 4. SEARCHANISE SIZE-INCLUSIVENESS & STOCK-TIER RE-RANKING
   *    Parity with collection infinite-scroll.liquid:
   *    Supports all 28+ sizes (Kids, Adult S-5XL, Plus 6XL-7XL, Footwear, One-Size):
   *    - Rank 0: 100% available variants (all sizes of the product in stock)
   *    - Rank 1: High Availability (>= 75% in stock OR all core S/M/L/XL in stock)
   *    - Rank 2: Primary Tier (>= 50% variants in stock - matches infinite-scroll.liquid)
   *    - Rank 3: Moderate (>= 33% variants in stock)
   *    - Rank 4: Broken Run (< 33% in stock, e.g. only 1 or 2 sizes left out of many)
   *    - Rank 99: Fully out of stock (0 variants available) -> Bottom
   * ------------------------------------------------------------------------- */
  var snizeItemDataCache = {};
  var isReorderingSnize = false;

  function normalizeSizeTokens(sizeStr) {
    if (!sizeStr) return '';
    return String(sizeStr).toLowerCase().trim();
  }

  function computeItemStockRank(itemData) {
    if (!itemData) return 4;

    var variants = itemData.shopify_variants;
    if (!Array.isArray(variants) || variants.length === 0) {
      if (itemData.quantity_total === 0 || itemData.quantity === 0) return 99;
      return 4;
    }

    var totalVariants = variants.length;
    var availableVariants = 0;
    var sizeS = false;
    var sizeM = false;
    var sizeL = false;
    var sizeXL = false;

    variants.forEach(function (v) {
      var isAvail = (v.available === '1' || v.available === 1 || v.available === true);
      if (isAvail) {
        availableVariants++;
        var sizeVal = '';
        if (v.options && v.options.Size) {
          sizeVal = normalizeSizeTokens(v.options.Size);
        } else if (v.options) {
          for (var opt in v.options) {
            if (/size/i.test(opt)) {
              sizeVal = normalizeSizeTokens(v.options[opt]);
              break;
            }
          }
        }
        if (!sizeVal && v.title) {
          sizeVal = normalizeSizeTokens(v.title);
        }

        // Check standard core sizes if product has them
        if (sizeVal === 's' || sizeVal === 's-38' || sizeVal === '38' || sizeVal.indexOf('s-') === 0 || sizeVal.indexOf('s ') === 0) {
          sizeS = true;
        }
        if (sizeVal === 'm' || sizeVal === 'm-40' || sizeVal === '40' || sizeVal.indexOf('m-') === 0 || sizeVal.indexOf('m ') === 0) {
          sizeM = true;
        }
        if (sizeVal === 'l' || sizeVal === 'l-42' || sizeVal === '42' || sizeVal.indexOf('l-') === 0 || sizeVal.indexOf('l ') === 0) {
          sizeL = true;
        }
        if (sizeVal === 'xl' || sizeVal === 'xl-44' || sizeVal === '44' || sizeVal.indexOf('xl-') === 0 || sizeVal.indexOf('xl ') === 0) {
          sizeXL = true;
        }
      }
    });

    // 1. Fully out of stock -> Absolute bottom
    if (availableVariants === 0) return 99;

    // 2. 100% of variants in stock (works for Kids, Plus Size, Mojaris, and Mens!) -> Top priority
    if (totalVariants > 0 && availableVariants === totalVariants) return 0;

    var ratio = totalVariants > 0 ? (availableVariants / totalVariants) : 0;

    // 3. Core run full (S, M, L, XL in stock) OR >= 75% of variants in stock
    if ((sizeS && sizeM && sizeL && sizeXL) || ratio >= 0.75) return 1;

    // 4. Primary tier (at least 50% of variants in stock - infinite-scroll.liquid standard)
    if (ratio >= 0.50 || (sizeM && sizeL && sizeS)) return 2;

    // 5. Moderate tier (at least 33% in stock)
    if (ratio >= 0.33 || (sizeM && sizeL) || sizeM) return 3;

    // 6. Severely broken run (e.g. 1 single size left out of 4+ sizes) -> Demoted
    return 4;
  }

  function getCardStockRank(card) {
    if (!card) return 4;

    // Check DOM out of stock markers first
    if (card.classList.contains('snize-out-of-stock') || card.getAttribute('data-stock') === '0') {
      return 99;
    }

    var pid = card.getAttribute('data-original-product-id') ||
      card.getAttribute('data-product-id') ||
      (card.id && card.id.indexOf('snize-product-') === 0 ? card.id.replace('snize-product-', '') : null) ||
      (card.id && card.id.indexOf('snize-ac-product-') === 0 ? card.id.replace('snize-ac-product-', '') : null);

    // Try live Searchanise item data cache
    var itemData = pid ? snizeItemDataCache[String(pid)] : null;

    // Try jQuery data attached by Searchanise widget
    if (!itemData && window.Searchanise && window.Searchanise.$) {
      try {
        itemData = window.Searchanise.$(card).data('snize_item_data');
      } catch (e) {}
    }
    if (!itemData && window.jQuery) {
      try {
        itemData = window.jQuery(card).data('snize_item_data');
      } catch (e) {}
    }

    if (itemData) {
      var calculatedRank = computeItemStockRank(itemData);
      card.setAttribute('data-stock-rank', calculatedRank);
      return calculatedRank;
    }

    if (card.hasAttribute('data-stock-rank')) {
      return parseInt(card.getAttribute('data-stock-rank'), 10);
    }

    return 4; // default fallback rank
  }

  function reorderSnizeGrids() {
    if (isReorderingSnize) return;

    // Target both Search Results page and Autocomplete dropdown grids
    var gridSelectors = [
      'ul.snize-search-results-content',
      '#snize-search-results-grid',
      '#snize_results .snize-horizontal-view',
      '#snize_results .snize-main-panel ul',
      '.snize-search-results-main-content ul',
      '#snize-ac-items-container-4',
      '#snize-ac-items-container-1',
      'ul.snize-ac-results-singlecolumn-list',
      'ul.snize-ac-results-list'
    ];

    var grids = document.querySelectorAll(gridSelectors.join(', '));
    if (!grids || grids.length === 0) return;

    grids.forEach(function (grid) {
      var items = Array.from(grid.children).filter(function (el) {
        return el.classList.contains('snize-product') ||
          (el.id && (el.id.indexOf('snize-product-') === 0 || el.id.indexOf('snize-ac-product-') === 0)) ||
          el.hasAttribute('data-id');
      });

      if (items.length <= 1) return;

      var scored = items.map(function (item, idx) {
        return {
          item: item,
          rank: getCardStockRank(item),
          originalIndex: idx
        };
      });

      // Sort ascending by rank: 0 (100% in stock) -> 1 (>=75%) -> 2 (>=50%) -> 3 -> 4 (Broken/single size) -> 99 (OOS)
      scored.sort(function (a, b) {
        if (a.rank !== b.rank) return a.rank - b.rank;
        return a.originalIndex - b.originalIndex;
      });

      var needsReorder = false;
      for (var i = 0; i < scored.length; i++) {
        if (scored[i].originalIndex !== i) {
          needsReorder = true;
          break;
        }
      }

      if (needsReorder) {
        isReorderingSnize = true;
        try {
          scored.forEach(function (entry) {
            grid.appendChild(entry.item);
          });
        } finally {
          setTimeout(function () {
            isReorderingSnize = false;
          }, 50);
        }
      }
    });
  }

  function registerSnizeItems(data) {
    if (data && Array.isArray(data.items)) {
      data.items.forEach(function (item) {
        if (item && item.product_id) {
          snizeItemDataCache[String(item.product_id)] = item;
        }
      });
      setTimeout(reorderSnizeGrids, 50);
      setTimeout(reorderSnizeGrids, 200);
    }
  }

  function initSnizeReordering() {
    // 1. Hook Searchanise DataRequestEnd document event (native + jQuery)
    document.addEventListener('Searchanise.DataRequestEnd', function (e) {
      var data = e.detail && e.detail.data ? e.detail.data : null;
      if (data) registerSnizeItems(data);
    });

    // Searchanise fires jQuery custom events on document
    var hookJQueryEvent = function ($jq) {
      if ($jq && $jq(document) && $jq(document).on) {
        $jq(document).on('Searchanise.DataRequestEnd', function (event, type, params, data) {
          registerSnizeItems(data);
        });
        $jq(document).on('Searchanise.ResultsUpdated Searchanise.AutocompleteUpdated', function () {
          setTimeout(reorderSnizeGrids, 80);
        });
      }
    };

    if (window.Searchanise && window.Searchanise.$) {
      hookJQueryEvent(window.Searchanise.$);
    }
    if (window.jQuery) {
      hookJQueryEvent(window.jQuery);
    }

    // 2. Hook Searchanise Callback API if present
    if (window.Searchanise && window.Searchanise.Callbacks) {
      try {
        window.Searchanise.Callbacks.Add('AfterSearch', function (res) {
          if (res) registerSnizeItems(res);
          setTimeout(reorderSnizeGrids, 80);
        });
      } catch (e) {}
    }

    // 3. Observer for Searchanise search results mount and mutation
    var observerTargets = document.querySelectorAll('#snize_results, .snize-search-results, .snize-ac-results');
    if (observerTargets.length > 0) {
      var gridObserver = new MutationObserver(function () {
        if (!isReorderingSnize) {
          reorderSnizeGrids();
        }
      });
      observerTargets.forEach(function (t) {
        gridObserver.observe(t, { childList: true, subtree: true });
      });
    }

    // Also observe document.body for dynamic mounting of autocomplete dropdown
    var bodyObserver = new MutationObserver(function () {
      if (!isReorderingSnize) {
        var acDropdown = document.querySelector('.snize-ac-results, #snize_autocomplete');
        if (acDropdown) {
          reorderSnizeGrids();
        }
      }
    });
    bodyObserver.observe(document.body, { childList: true });
  }

  /* -------------------------------------------------------------------------
   * INITIALIZATION
   * ------------------------------------------------------------------------- */
  function boot() {
    initAutocompleteTracking();
    monitorZeroResults();
    guardPageviewInflation();
    initSnizeReordering();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

