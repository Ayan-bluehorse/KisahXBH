/* Kisah Collection PLP Filter Bottom Sheet JavaScript */
(function () {
  'use strict';

  function initFilterSheet() {
    const sheet = document.getElementById('kisahSheet');
    const sortModal = document.getElementById('kisahSortModal');
    const scrim = document.getElementById('kisahScrim');
    const filterBtn = document.getElementById('kisahFilterBtn');
    const sortBtn = document.getElementById('kisahSortBtn');
    const closeBtn = document.getElementById('kisahCloseFilter');
    const closeSortBtn = document.getElementById('kisahCloseSort');
    const clearAllBtn = document.getElementById('kisahClearAll');
    const applyBtn = document.getElementById('kisahApplyBtn');
    const filterForm = document.getElementById('KisahCollectionFilterForm') || document.getElementById('CollectionFilterForm');

    if (!sheet || !scrim) return;

    let fetchAbortController = null;
    let debounceTimer = null;
    const facetCache = new Map();
    const initialCount = parseInt(applyBtn ? applyBtn.dataset.initialCount : '0', 10) || 0;

    // Snapshot initial state of all facet inputs for 0ms instant reset
    const initialInputs = [];
    sheet.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      initialInputs.push({
        name: input.getAttribute('name'),
        value: input.getAttribute('value'),
        count: input.getAttribute('data-initial-count') || input.getAttribute('data-count') || '0',
        disabled: input.getAttribute('data-initial-disabled') === '1' || input.disabled
      });
    });

    // --- Open / Close Sheet ---
    window.openKisahSheet = function (sectionKey) {
      if (sortModal) sortModal.dataset.open = '0';
      scrim.dataset.open = '1';
      sheet.dataset.open = '1';
      document.body.style.overflow = 'hidden';

      if (sectionKey) {
        const targetSec = sheet.querySelector(`.kisah-sec[data-key="${sectionKey}"]`);
        if (targetSec) {
          targetSec.dataset.open = '1';
          setTimeout(() => {
            const body = sheet.querySelector('.kisah-sheet__body');
            if (body) body.scrollTo({ top: targetSec.offsetTop - 10, behavior: 'smooth' });
          }, 150);
        }
      }
    };

    window.closeKisahSheet = function () {
      scrim.dataset.open = '0';
      sheet.dataset.open = '0';
      if (sortModal) sortModal.dataset.open = '0';
      document.body.style.overflow = '';
    };

    if (filterBtn) {
      filterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openKisahSheet();
      });
    }

    if (sortBtn && sortModal) {
      sortBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sheet.dataset.open = '0';
        scrim.dataset.open = '1';
        sortModal.dataset.open = '1';
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', window.closeKisahSheet);
    if (closeSortBtn) closeSortBtn.addEventListener('click', window.closeKisahSheet);
    if (scrim) scrim.addEventListener('click', window.closeKisahSheet);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && (sheet.dataset.open === '1' || (sortModal && sortModal.dataset.open === '1'))) {
        window.closeKisahSheet();
      }
    });

    // --- Drag To Dismiss on Mobile Grab Handle ---
    const grab = sheet.querySelector('.kisah-sheet__grab');
    if (grab) {
      let startY = null;
      const onTouchStart = (e) => {
        startY = (e.touches ? e.touches[0] : e).clientY;
        sheet.style.transition = 'none';
      };
      const onTouchMove = (e) => {
        if (startY === null) return;
        const currentY = (e.touches ? e.touches[0] : e).clientY;
        const diff = Math.max(0, currentY - startY);
        sheet.style.transform = `translate(-50%, ${diff}px)`;
      };
      const onTouchEnd = (e) => {
        if (startY === null) return;
        const endY = (e.changedTouches ? e.changedTouches[0] : e).clientY;
        const diff = Math.max(0, endY - startY);
        sheet.style.transition = '';
        sheet.style.transform = '';
        startY = null;
        if (diff > 80) {
          window.closeKisahSheet();
        }
      };

      grab.addEventListener('touchstart', onTouchStart, { passive: true });
      grab.addEventListener('touchmove', onTouchMove, { passive: true });
      grab.addEventListener('touchend', onTouchEnd);
      grab.addEventListener('mousedown', onTouchStart);
      window.addEventListener('mousemove', onTouchMove);
      window.addEventListener('mouseup', onTouchEnd);
    }

    // --- Accordion Toggle ---
    sheet.querySelectorAll('.kisah-sec__hd').forEach((hd) => {
      hd.addEventListener('click', (e) => {
        e.preventDefault();
        const sec = hd.closest('.kisah-sec');
        if (!sec) return;
        const isOpen = sec.dataset.open === '1';
        sec.dataset.open = isOpen ? '0' : '1';
      });
    });

    // --- Price Slider Handling ---
    const rngWrap = sheet.querySelector('.kisah-rng');
    if (rngWrap) {
      const minInput = rngWrap.querySelector('#kisahRngLo');
      const maxInput = rngWrap.querySelector('#kisahRngHi');
      const fill = rngWrap.querySelector('#kisahRngFill');
      const loVal = rngWrap.querySelector('#kisahRngLoV');
      const hiVal = rngWrap.querySelector('#kisahRngHiV');
      const step = 50;

      if (minInput && maxInput && fill) {
        const minBound = parseFloat(minInput.min) || 0;
        const maxBound = parseFloat(maxInput.max) || 10000;

        const updateSlider = () => {
          let lo = Math.round(parseFloat(minInput.value)) || minBound;
          let hi = Math.round(parseFloat(maxInput.value)) || maxBound;

          if (lo > hi - step) {
            lo = hi - step;
            minInput.value = lo;
          }
          if (hi < lo + step) {
            hi = lo + step;
            maxInput.value = hi;
          }

          const a = ((lo - minBound) / (maxBound - minBound)) * 100;
          const b = ((hi - minBound) / (maxBound - minBound)) * 100;

          fill.style.left = a + '%';
          fill.style.width = Math.max(0, b - a) + '%';

          if (loVal) loVal.textContent = '₹' + Math.round(lo).toLocaleString('en-IN');
          if (hiVal) hiVal.textContent = '₹' + Math.round(hi).toLocaleString('en-IN');

          const isAltered = (lo > minBound || hi < maxBound);
          if (isAltered) {
            if (minInput.dataset.name) minInput.name = minInput.dataset.name;
            if (maxInput.dataset.name) maxInput.name = maxInput.dataset.name;
          } else {
            minInput.removeAttribute('name');
            maxInput.removeAttribute('name');
          }

          // Update Section summary
          const priceSec = rngWrap.closest('.kisah-sec');
          if (priceSec) {
            const sumEl = priceSec.querySelector('.kisah-sec__sum');
            if (sumEl) {
              sumEl.textContent = isAltered ? `₹${Math.round(lo).toLocaleString('en-IN')} - ₹${Math.round(hi).toLocaleString('en-IN')}` : '';
            }
          }
        };

        minInput.addEventListener('input', () => {
          updateSlider();
          updateSectionSummaries();
          triggerDynamicCountUpdate();
        });
        maxInput.addEventListener('input', () => {
          updateSlider();
          updateSectionSummaries();
          triggerDynamicCountUpdate();
        });
        updateSlider();

        // Refine true global minimum price from collection products.json
        const formAction = filterForm.getAttribute('action') || window.location.pathname;
        if (formAction && formAction.indexOf('/collections/') >= 0) {
          const collPath = formAction.split('?')[0].replace(/\/$/, '');
          fetch(`${collPath}/products.json?limit=1&sort_by=price-ascending`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data && data.products && data.products.length > 0) {
                let trueMin = parseFloat(data.products[0].variants[0].price);
                data.products[0].variants.forEach((v) => {
                  const p = parseFloat(v.price);
                  if (p > 0 && p < trueMin) trueMin = p;
                });
                if (trueMin > 0) {
                  const roundedMin = Math.floor(trueMin / 100) * 100;
                  const currentMinBound = parseFloat(minInput.min) || 0;
                  if (roundedMin < currentMinBound || currentMinBound === 0) {
                    minInput.min = roundedMin;
                    if (!minInput.hasAttribute('name') || parseFloat(minInput.value) < roundedMin) {
                      minInput.value = roundedMin;
                    }
                    const endsMin = rngWrap.querySelector('.kisah-rng__ends span:first-child');
                    if (endsMin) endsMin.textContent = '₹' + roundedMin.toLocaleString('en-IN');
                    updateSlider();
                  }
                }
              }
            })
            .catch(() => {});
        }
      }
    }

    // --- Inputs & Summaries Update ---
    function updateSectionSummaries() {
      sheet.querySelectorAll('.kisah-sec').forEach((sec) => {
        if (sec.dataset.key === 'price') return;
        const sumEl = sec.querySelector('.kisah-sec__sum');
        if (!sumEl) return;

        const checkedLabels = [];
        sec.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
          const label = cb.dataset.label || cb.value;
          if (label) checkedLabels.push(label);
        });

        sumEl.textContent = checkedLabels.join(', ');
      });

      // Update total active filter count badge
      const activeCheckboxes = sheet.querySelectorAll('input[type="checkbox"]:checked:not([name*="availability"])').length;
      let priceActive = false;
      const minInput = sheet.querySelector('#kisahRngLo');
      const maxInput = sheet.querySelector('#kisahRngHi');
      if (minInput && maxInput) {
        if (minInput.hasAttribute('name') || maxInput.hasAttribute('name')) {
          priceActive = true;
        }
      }

      const totalCount = activeCheckboxes + (priceActive ? 1 : 0);
      if (filterBtn) {
        filterBtn.dataset.any = totalCount > 0 ? '1' : '0';
        const pip = filterBtn.querySelector('.kisah-ctrl__pip');
        if (totalCount > 0) {
          if (pip) {
            pip.textContent = totalCount;
          } else {
            const newPip = document.createElement('span');
            newPip.className = 'kisah-ctrl__pip';
            newPip.textContent = totalCount;
            filterBtn.appendChild(newPip);
          }
        } else if (pip) {
          pip.remove();
        }
      }
    }

    // --- Restore Initial Facet Counts Instantly (0ms) ---
    function restoreInitialCounts() {
      if (fetchAbortController) fetchAbortController.abort();
      if (debounceTimer) clearTimeout(debounceTimer);

      if (applyBtn) {
        applyBtn.style.opacity = '1';
        applyBtn.disabled = false;
        applyBtn.classList.remove('is-disabled');
        if (initialCount === 1) {
          applyBtn.textContent = 'Show 1 style';
        } else if (initialCount > 0) {
          applyBtn.textContent = `Show ${initialCount.toLocaleString('en-IN')} styles`;
        } else {
          applyBtn.textContent = 'Show styles';
        }
      }

      initialInputs.forEach((item) => {
        const liveInput = sheet.querySelector(`input[type="checkbox"][name="${CSS.escape(item.name)}"][value="${CSS.escape(item.value)}"]`);
        if (!liveInput) return;

        liveInput.disabled = item.disabled;
        liveInput.setAttribute('data-count', item.count);

        const chip = liveInput.closest('.kisah-chip');
        if (chip) chip.classList.toggle('is-disabled', item.disabled);

        const sw = liveInput.closest('.kisah-sw');
        if (sw) {
          sw.classList.toggle('is-disabled', item.disabled);
          const countEl = sw.querySelector('.kisah-sw-count') || sw.querySelector('b');
          if (countEl) countEl.textContent = ` ${item.count}`;
        }

        const row = liveInput.closest('.kisah-row');
        if (row) {
          row.classList.toggle('is-disabled', item.disabled);
          const countEl = row.querySelector('.kisah-row__c');
          if (countEl) countEl.textContent = item.count;
        }
      });
    }

    // Apply Cached or Fetched Facet State
    function applyFacetState(data) {
      if (!data) return;

      const { count, facets } = data;

      if (applyBtn && count !== null && !isNaN(count)) {
        applyBtn.style.opacity = '1';
        if (count === 0) {
          applyBtn.textContent = 'No styles match';
          applyBtn.disabled = true;
          applyBtn.classList.add('is-disabled');
        } else if (count === 1) {
          applyBtn.textContent = 'Show 1 style';
          applyBtn.disabled = false;
          applyBtn.classList.remove('is-disabled');
        } else {
          applyBtn.textContent = `Show ${count.toLocaleString('en-IN')} styles`;
          applyBtn.disabled = false;
          applyBtn.classList.remove('is-disabled');
        }
      }

      if (Array.isArray(facets)) {
        facets.forEach((item) => {
          const liveInput = sheet.querySelector(`input[type="checkbox"][name="${CSS.escape(item.name)}"][value="${CSS.escape(item.value)}"]`);
          if (!liveInput) return;

          liveInput.disabled = item.disabled;
          if (item.count !== null) {
            liveInput.setAttribute('data-count', item.count);
          }

          const chip = liveInput.closest('.kisah-chip');
          if (chip) chip.classList.toggle('is-disabled', item.disabled);

          const sw = liveInput.closest('.kisah-sw');
          if (sw) {
            sw.classList.toggle('is-disabled', item.disabled);
            const countEl = sw.querySelector('.kisah-sw-count') || sw.querySelector('b');
            if (countEl && item.count !== null) countEl.textContent = ` ${item.count}`;
          }

          const row = liveInput.closest('.kisah-row');
          if (row) {
            row.classList.toggle('is-disabled', item.disabled);
            const countEl = row.querySelector('.kisah-row__c');
            if (countEl && item.count !== null) countEl.textContent = item.count;
          }
        });
      }
    }

    // --- Dynamic Count Fetcher with In-Memory Caching ---
    function triggerDynamicCountUpdate() {
      if (!applyBtn || !filterForm) return;

      const checkedBoxes = Array.from(filterForm.querySelectorAll('input[type="checkbox"]:checked'));
      const minInput = sheet.querySelector('#kisahRngLo');
      const maxInput = sheet.querySelector('#kisahRngHi');
      const priceActive = (minInput && minInput.hasAttribute('name')) || (maxInput && maxInput.hasAttribute('name'));

      // If no filters are active, restore initial counts immediately in 0ms
      if (checkedBoxes.length === 0 && !priceActive) {
        restoreInitialCounts();
        return;
      }

      // Build Query String
      const params = new URLSearchParams();
      filterForm.querySelectorAll('input[type="hidden"]').forEach((input) => {
        if (input.name && input.value) params.append(input.name, input.value);
      });
      checkedBoxes.forEach((cb) => {
        if (cb.name && cb.value) params.append(cb.name, cb.value);
      });
      if (minInput && minInput.hasAttribute('name') && minInput.value) {
        params.append(minInput.name, minInput.value);
      }
      if (maxInput && maxInput.hasAttribute('name') && maxInput.value) {
        params.append(maxInput.name, maxInput.value);
      }

      const cacheKey = params.toString();

      // If already cached, apply instantly (0ms)
      if (facetCache.has(cacheKey)) {
        if (fetchAbortController) fetchAbortController.abort();
        if (debounceTimer) clearTimeout(debounceTimer);
        applyFacetState(facetCache.get(cacheKey));
        return;
      }

      // Otherwise debounce and fetch
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchDynamicCount(params, cacheKey);
      }, 70);
    }

    function fetchDynamicCount(params, cacheKey) {
      const filterContainer = filterForm.closest('[data-filter-section-id]');
      const sectionId = filterContainer ? filterContainer.dataset.filterSectionId : (filterForm.closest('[data-section-id]')?.dataset.sectionId || 'main-collection');
      
      const fetchParams = new URLSearchParams(params);
      fetchParams.set('section_id', sectionId);

      const baseUrl = filterForm.getAttribute('action') || window.location.pathname;
      const url = `${baseUrl}${baseUrl.indexOf('?') >= 0 ? '&' : '?'}${fetchParams.toString()}`;

      if (fetchAbortController) {
        fetchAbortController.abort();
      }
      fetchAbortController = new AbortController();

      applyBtn.style.opacity = '0.7';

      fetch(url, { signal: fetchAbortController.signal })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.text();
        })
        .then((html) => {
          applyBtn.style.opacity = '1';
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Extract Count
          let count = null;
          const retApplyBtn = doc.getElementById('kisahApplyBtn');
          if (retApplyBtn && retApplyBtn.dataset.initialCount !== undefined) {
            count = parseInt(retApplyBtn.dataset.initialCount, 10);
          }

          if (count === null || isNaN(count)) {
            const retCountEl = doc.getElementById('kisahCount') || doc.querySelector('.kisah-ctrl__styles') || doc.querySelector('.kisah-ctrl__n');
            if (retCountEl) {
              const m = retCountEl.textContent.match(/(\d+[\d,]*)/);
              if (m) count = parseInt(m[1].replace(/,/g, ''), 10);
            }
          }

          if (count === null || isNaN(count)) {
            const retBlocks = doc.querySelectorAll('.product-grid .product-block, [data-ajax-container] .product-block');
            if (retBlocks.length > 0) count = retBlocks.length;
          }

          // Extract facet states
          const facets = [];
          doc.querySelectorAll('input[type="checkbox"]').forEach((retInput) => {
            const rName = retInput.getAttribute('name');
            const rVal = retInput.getAttribute('value');
            if (!rName || !rVal) return;

            const liveInput = sheet.querySelector(`input[type="checkbox"][name="${CSS.escape(rName)}"][value="${CSS.escape(rVal)}"]`);
            const retCount = retInput.getAttribute('data-count');
            const retDisabled = retInput.disabled || (retCount === '0' && (!liveInput || !liveInput.checked));

            facets.push({
              name: rName,
              value: rVal,
              count: retCount,
              disabled: retDisabled
            });
          });

          const resultData = { count, facets };
          facetCache.set(cacheKey, resultData);
          applyFacetState(resultData);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            applyBtn.style.opacity = '1';
            console.warn('Filter count fetch warning:', err);
          }
        });
    }

    sheet.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      const handleCheckboxChange = () => {
        const parentChip = cb.closest('.kisah-chip');
        if (parentChip) parentChip.dataset.on = cb.checked ? '1' : '0';

        const parentSw = cb.closest('.kisah-sw');
        if (parentSw) parentSw.dataset.on = cb.checked ? '1' : '0';

        const parentRow = cb.closest('.kisah-row');
        if (parentRow) parentRow.dataset.on = cb.checked ? '1' : '0';

        updateSectionSummaries();
        triggerDynamicCountUpdate();
      };

      cb.addEventListener('change', handleCheckboxChange);
      cb.addEventListener('input', handleCheckboxChange);
    });

    // --- Apply Button / Form Submission ---
    if (applyBtn && filterForm) {
      applyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (applyBtn.disabled) return;

        window.closeKisahSheet();

        const minInput = sheet.querySelector('#kisahRngLo');
        const maxInput = sheet.querySelector('#kisahRngHi');
        if (minInput && maxInput) {
          const minBound = parseFloat(minInput.min) || 0;
          const maxBound = parseFloat(maxInput.max) || 10000;
          if (parseFloat(minInput.value) <= minBound && parseFloat(maxInput.value) >= maxBound) {
            minInput.disabled = true;
            maxInput.disabled = true;
          } else {
            minInput.disabled = false;
            maxInput.disabled = false;
          }
        }

        // Trigger change & submit
        filterForm.submit();
      });
    }

    // --- Clear All Button ---
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', (e) => {
        const clearUrl = clearAllBtn.dataset.clearUrl;
        if (clearUrl && window.location.search.length > 1) {
          window.location.href = clearUrl;
          return;
        }
        sheet.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
          cb.checked = false;
        });
        sheet.querySelectorAll('.kisah-chip, .kisah-sw, .kisah-row').forEach((el) => {
          el.dataset.on = '0';
        });
        if (rngWrap) {
          const minInput = rngWrap.querySelector('#kisahRngLo');
          const maxInput = rngWrap.querySelector('#kisahRngHi');
          if (minInput && maxInput) {
            minInput.value = minInput.min;
            maxInput.value = maxInput.max;
            minInput.dispatchEvent(new Event('input'));
          }
        }
        updateSectionSummaries();
        restoreInitialCounts();
      });
    }

    updateSectionSummaries();
  }

  // --- Sticky Filter & Sort Control Bar (Collections & Landing Pages) ---
  function initStickyFilterBar() {
    if (window.__kisahStickyCtrlInit) {
      if (typeof window.__kisahStickyCtrlRefresh === 'function') {
        window.__kisahStickyCtrlRefresh();
      }
      return;
    }
    window.__kisahStickyCtrlInit = true;

    const stateMap = new WeakMap();
    const managedBars = new Set();
    let stickyRaf = null;
    let lastHeaderEl = null;
    let headerObserver = null;

    function ensureSpacer(ctrl) {
      let state = stateMap.get(ctrl);
      if (state && state.spacer && state.spacer.isConnected) {
        return state;
      }

      let spacer = ctrl.nextElementSibling && ctrl.nextElementSibling.classList.contains('kisah-ctrl-spacer')
        ? ctrl.nextElementSibling
        : null;

      if (!spacer) {
        spacer = document.createElement('div');
        spacer.className = 'kisah-ctrl-spacer';
        spacer.setAttribute('aria-hidden', 'true');
        ctrl.insertAdjacentElement('afterend', spacer);
      }

      state = {
        ctrl,
        spacer,
        wasSticky: false,
        animateRaf: null,
        metrics: null
      };
      stateMap.set(ctrl, state);
      managedBars.add(ctrl);
      return state;
    }

    function captureMetrics(state, rect) {
      const cs = window.getComputedStyle(state.ctrl);
      state.metrics = {
        height: rect.height || state.ctrl.offsetHeight || 44,
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom,
        padLeft: parseFloat(cs.paddingLeft) || 14,
        padRight: parseFloat(cs.paddingRight) || 14
      };
    }

    function getHeaderOffset(header) {
      if (!header || !header.classList.contains('kisah-header--fixed')) {
        return 0;
      }
      if (header.classList.contains('kisah-header--hidden')) {
        return 0;
      }
      return header.offsetHeight || 0;
    }

    function getGridBound(ctrl) {
      const sectionScope = ctrl.closest('.shopify-section') || ctrl.parentElement;
      if (!sectionScope) return null;
      return sectionScope.querySelector('[data-feed-container], .filters-adjacent.collection-listing, .collection-listing, #product-grid') || sectionScope;
    }

    function observeHeader(header) {
      if (header === lastHeaderEl) return;
      if (headerObserver) {
        headerObserver.disconnect();
        headerObserver = null;
      }
      lastHeaderEl = header;
      if (!header || typeof MutationObserver === 'undefined') return;

      // Sync sticky bar immediately in the same frame when the smart header toggles visibility
      headerObserver = new MutationObserver(() => {
        if (stickyRaf !== null) {
          window.cancelAnimationFrame(stickyRaf);
          stickyRaf = null;
        }
        updateStickyBars();
      });
      headerObserver.observe(header, { attributes: true, attributeFilter: ['class'] });
    }

    function unstick(state) {
      const { ctrl, spacer } = state;
      if (state.animateRaf) {
        window.cancelAnimationFrame(state.animateRaf);
        state.animateRaf = null;
      }
      ctrl.classList.remove('kisah-ctrl--sticky', 'kisah-ctrl--animate', 'kisah-ctrl--past-end');
      ctrl.style.removeProperty('--kisah-ctrl-y');
      ctrl.style.removeProperty('--kisah-ctrl-sticky-pl');
      ctrl.style.removeProperty('--kisah-ctrl-sticky-pr');
      if (spacer) spacer.classList.remove('is-active');
      state.wasSticky = false;
    }

    function updateStickyBars() {
      stickyRaf = null;
      const header = document.querySelector('.section-header');
      observeHeader(header);
      const headerOffset = getHeaderOffset(header);
      const docWidth = document.documentElement.clientWidth || window.innerWidth;

      managedBars.forEach((ctrl) => {
        if (!ctrl.isConnected) {
          managedBars.delete(ctrl);
          return;
        }

        const state = ensureSpacer(ctrl);
        const isSticky = ctrl.classList.contains('kisah-ctrl--sticky');
        const boxEl = isSticky ? state.spacer : ctrl;
        const boxRect = boxEl.getBoundingClientRect();

        if (boxRect.width === 0 || (!isSticky && boxRect.height === 0)) {
          if (isSticky) unstick(state);
          return;
        }

        if (!isSticky && !state.metrics) {
          captureMetrics(state, boxRect);
        } else if (isSticky && !state.metrics) {
          unstick(state);
          const freshRect = ctrl.getBoundingClientRect();
          if (freshRect.width === 0 || freshRect.height === 0) return;
          captureMetrics(state, freshRect);
        }

        const barHeight = state.metrics.height || 44;
        const gridBound = getGridBound(ctrl);
        const gridRect = gridBound ? gridBound.getBoundingClientRect() : null;

        if (gridRect && gridRect.height < barHeight * 2) {
          if (state.wasSticky) unstick(state);
          return;
        }

        const anchorTop = boxRect.top;
        const shouldStick = anchorTop <= headerOffset;

        if (!shouldStick) {
          if (state.wasSticky) unstick(state);
          return;
        }

        const endThreshold = headerOffset + barHeight + 16;
        const isPastEnd = !!(gridRect && gridRect.bottom <= endThreshold);
        const padLeft = Math.max(state.metrics.padLeft, boxRect.left + state.metrics.padLeft);
        const padRight = Math.max(state.metrics.padRight, docWidth - boxRect.right + state.metrics.padRight);

        ctrl.style.setProperty('--kisah-ctrl-y', `${headerOffset}px`);
        ctrl.style.setProperty('--kisah-ctrl-sticky-pl', `${padLeft}px`);
        ctrl.style.setProperty('--kisah-ctrl-sticky-pr', `${padRight}px`);

        if (!state.wasSticky) {
          state.spacer.style.height = `${barHeight}px`;
          state.spacer.style.marginTop = state.metrics.marginTop;
          state.spacer.style.marginBottom = state.metrics.marginBottom;
          state.spacer.classList.add('is-active');
          ctrl.classList.add('kisah-ctrl--sticky');
          state.wasSticky = true;
          // Enable transform transition one frame later so initial stick never jumps from y=0
          state.animateRaf = window.requestAnimationFrame(() => {
            state.animateRaf = null;
            if (ctrl.classList.contains('kisah-ctrl--sticky')) {
              ctrl.classList.add('kisah-ctrl--animate');
            }
          });
        }

        ctrl.classList.toggle('kisah-ctrl--past-end', isPastEnd);
      });
    }

    function scheduleUpdate() {
      if (stickyRaf !== null) return;
      stickyRaf = window.requestAnimationFrame(updateStickyBars);
    }

    function scanStickyBars() {
      document.querySelectorAll('.kisah-ctrl').forEach((ctrl) => {
        ensureSpacer(ctrl);
      });
      updateStickyBars();
    }

    function onResize() {
      managedBars.forEach((ctrl) => {
        const state = stateMap.get(ctrl);
        if (!state) return;
        unstick(state);
        state.metrics = null;
      });
      updateStickyBars();
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.__kisahStickyCtrlRefresh = scanStickyBars;

    scanStickyBars();
  }

  function bootFilterSheetAndSticky() {
    initFilterSheet();
    initStickyFilterBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootFilterSheetAndSticky);
  } else {
    bootFilterSheetAndSticky();
  }

  // Support Shopify Section & AJAX re-renders
  document.addEventListener('shopify:section:load', bootFilterSheetAndSticky);
})();
