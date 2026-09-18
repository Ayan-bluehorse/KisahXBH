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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFilterSheet);
  } else {
    initFilterSheet();
  }

  // Support Shopify Section & AJAX re-renders
  document.addEventListener('shopify:section:load', initFilterSheet);
})();
