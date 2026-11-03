/**
 * Searchanise & Store Search Telemetry Bridge + Searchanise UX Enhancer
 * Kisah Online - D2C GA4 & Merchandising Optimization
 * 
 * 1. Autocomplete Product & Suggestion Clicks -> Sends GA4 'search', 'select_item', and 'search_autocomplete_click'
 * 2. 0-Result Search Detection -> Sends GA4 'view_search_results' (results_count: 0) & 'search_zero_results'
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

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_search_results', {
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
   * 4. SEARCHANISE SIZE-INCLUSIVENESS RE-RANKING (S/M/L/XL Prioritization)
   * ------------------------------------------------------------------------- */
  function scoreSnizeCard(card) {
    if (!card) return 0;

    // Check availability markers on Searchanise product cards
    var isOOS = card.classList.contains('snize-out-of-stock') ||
      card.querySelector('.snize-out-of-stock') !== null ||
      card.getAttribute('data-stock') === '0';

    if (isOOS) return -100000;

    // Inspect size chips/swatches if Searchanise renders them
    var swatches = Array.from(card.querySelectorAll(
      '.snize-swatch, .snize-option-value, [data-option-name="Size"] span, .product-block-options__item'
    ));

    var sizeS = false;
    var sizeM = false;
    var sizeL = false;
    var sizeXL = false;
    var availableCount = 0;

    if (swatches.length > 0) {
      swatches.forEach(function (sw) {
        var isUnavailable = sw.classList.contains('snize-disabled') ||
          sw.classList.contains('snize-out-of-stock') ||
          sw.classList.contains('snize-unavailable') ||
          sw.classList.contains('product-block-options__item--unavailable');

        if (!isUnavailable) availableCount++;

        var txt = (sw.textContent || '').toLowerCase().trim();
        if (!isUnavailable) {
          if (txt === 's' || txt === 's-38' || txt === '38' || txt === 'small') sizeS = true;
          if (txt === 'm' || txt === 'm-40' || txt === '40' || txt === 'medium') sizeM = true;
          if (txt === 'l' || txt === 'l-42' || txt === '42' || txt === 'large') sizeL = true;
          if (txt === 'xl' || txt === 'xl-44' || txt === '44' || txt === 'extra large') sizeXL = true;
        }
      });

      // Rank according to core size completeness
      if (sizeS && sizeM && sizeL && sizeXL) return 10000; // Rank 1: Full core run (S, M, L, XL)
      if (sizeS && sizeM && sizeL) return 8000;            // Rank 2: S, M, L
      if (sizeM && sizeL) return 6000;                    // Rank 3: M, L
      if (sizeM) return 4000;                             // Rank 4: M
      if (availableCount > 1) return 2000;                // Rank 5: Multi-size broken
      return 1000;                                        // Rank 6: Single obscure size only
    }

    return 5000; // Neutral if no swatches rendered in DOM
  }

  function reorderSnizeGrid() {
    var grid = document.querySelector(
      '#snize-search-results-grid, ' +
      '#snize_results .snize-horizontal-view, ' +
      '#snize_results .snize-main-panel ul, ' +
      '.snize-search-results-main-content ul'
    );
    if (!grid) return;

    var items = Array.from(grid.children).filter(function (el) {
      return el.classList.contains('snize-product') ||
        el.classList.contains('snize-item') ||
        el.hasAttribute('data-id');
    });

    if (items.length <= 1) return;

    var scored = items.map(function (item, idx) {
      return {
        item: item,
        score: scoreSnizeCard(item),
        originalIndex: idx
      };
    });

    // Sort descending by score, preserving original order on tie
    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
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
      scored.forEach(function (entry) {
        grid.appendChild(entry.item);
      });
    }
  }

  function initSnizeReordering() {
    // 1. Hook Searchanise callback if available
    if (window.Searchanise && window.Searchanise.Callbacks) {
      try {
        window.Searchanise.Callbacks.Add('AfterSearch', function () {
          setTimeout(reorderSnizeGrid, 150);
        });
      } catch (e) {}
    }

    // 2. Observer for Searchanise search results mount
    var searchContainer = document.getElementById('snize_results') || document.querySelector('.snize-search-results');
    if (searchContainer) {
      var gridObserver = new MutationObserver(function () {
        reorderSnizeGrid();
      });
      gridObserver.observe(searchContainer, { childList: true, subtree: true });
    }
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

