/**
 * On /search?q=… when the query matches a curated collection override, replaces the
 * results grid with products from that collection's products.json endpoint.
 */
(function () {
  function init() {
    if (!document.body.classList.contains('template-search')) return;

    const api = window.CollectionSearchOverride;
    if (!api) return;

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const override = q ? api.getOverride(q) : null;
    if (!override) return;

    const grid = document.querySelector('.search-infinite-scroll-grid');
    if (!grid) return;

    const rawLimit = parseInt(grid.getAttribute('data-size-limit'), 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(rawLimit, 250) : 48;

    api
      .fetchProductsForHandle(override.handle, limit, null)
      .then((products) => {
        if (!products.length) return;
        grid.innerHTML = '';
        const built = api.buildProductGrid(products, {
          limit,
          gridClass: grid.className,
        });
        built.removeAttribute('id');
        while (built.firstChild) {
          grid.appendChild(built.firstChild);
        }

        const sentinelWrap = document.querySelector('.search-infinite-scroll-wrap');
        if (sentinelWrap) {
          sentinelWrap.style.display = 'none';
        }

        const countEl = document.querySelector('.utility-bar__centre .utility-bar__item');
        if (countEl) {
          const n = Math.min(products.length, limit);
          const t = countEl.textContent;
          const next = t.replace(/\d+/, String(n));
          if (next !== t) countEl.textContent = next;
        }
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
