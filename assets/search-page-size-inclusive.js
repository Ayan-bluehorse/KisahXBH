/**
 * On /search?q=… when the query matches a curated collection override, replaces the
 * results grid with products from that collection's products.json endpoint.
 */
(function () {
  function normalizeSearchQuery(query) {
    if (!query) return '';
    return query
      .trim()
      .toLowerCase()
      // Split word-to-number: e.g. "ka1176" -> "ka-1176", "sku123" -> "sku-123"
      .replace(/([a-z]{2,})(\d+)/gi, '$1-$2')
      // Split number-to-word: e.g. "1176t301" -> "1176-t301"
      .replace(/(\d+)([a-z]+)/gi, '$1-$2')
      // Normalize spaces and underscores to hyphens
      .replace(/[\s_]+/g, '-')
      // Remove duplicate hyphens
      .replace(/-+/g, '-');
  }

  function scoreProductBlock(block, rawQuery) {
    if (!block || !rawQuery) return 0;
    const qRaw = rawQuery.trim().toLowerCase();
    const qNorm = normalizeSearchQuery(rawQuery);
    const qCompact = qRaw.replace(/[\s-_]+/g, '');
    const tokens = qNorm.split('-').filter(Boolean);
    if (!tokens.length) return 0;

    const innerCard = block.matches('.product-block') ? block : (block.querySelector('.product-block') || block);

    const sku = (
      block.dataset.productSku ||
      block.getAttribute('data-product-sku') ||
      innerCard.dataset.productSku ||
      innerCard.getAttribute('data-product-sku') ||
      ''
    ).toLowerCase();
    const skuList = sku.split(',').map((s) => s.trim()).filter(Boolean);

    const handle = (
      block.dataset.productHandle ||
      block.getAttribute('data-product-handle') ||
      innerCard.dataset.productHandle ||
      innerCard.getAttribute('data-product-handle') ||
      block.querySelector('a.product-link')?.getAttribute('href') ||
      ''
    ).toLowerCase();

    const title = (
      block.dataset.productTitle ||
      block.getAttribute('data-product-title') ||
      innerCard.dataset.productTitle ||
      innerCard.getAttribute('data-product-title') ||
      block.querySelector('.product-block__title')?.innerText ||
      ''
    ).toLowerCase();

    const tags = (
      block.dataset.productTags ||
      block.getAttribute('data-product-tags') ||
      innerCard.dataset.productTags ||
      innerCard.getAttribute('data-product-tags') ||
      ''
    ).toLowerCase();
    const combined = (sku + ' ' + handle + ' ' + title + ' ' + tags).toLowerCase();

    // 1. Exact SKU match check (User searched a specific SKU / code)
    let isExactSku = false;
    let isPartialSku = false;
    for (const s of skuList) {
      const sCompact = s.replace(/[\s-_]+/g, '');
      const sWithoutSize = s.replace(/-\d{2}$/, '');
      const sWithoutSizeCompact = sWithoutSize.replace(/[\s-_]+/g, '');

      if (s === qRaw || s === qNorm || sCompact === qCompact || sWithoutSize === qNorm || sWithoutSizeCompact === qCompact) {
        isExactSku = true;
        break;
      } else if (s.startsWith(qNorm) || sCompact.startsWith(qCompact) || s.includes(qNorm) || sCompact.includes(qCompact)) {
        isPartialSku = true;
      }
    }

    // 2. Exact Title match check
    const isExactTitle = (title === qRaw);

    // 3. Stock Rank calculation (matching collection list page logic)
    const availableAttr = block.getAttribute('data-available-variants') ||
      innerCard.getAttribute('data-available-variants') ||
      innerCard.dataset.available ||
      innerCard.getAttribute('data-available');
    const totalAttr = block.getAttribute('data-total-variants') ||
      innerCard.getAttribute('data-total-variants') ||
      innerCard.dataset.total ||
      innerCard.getAttribute('data-total');

    let availableVariants = availableAttr != null ? parseInt(availableAttr, 10) : NaN;
    let totalVariants = totalAttr != null ? parseInt(totalAttr, 10) : NaN;

    // Check swatch elements in card DOM for real-time size availability
    const swatchItems = Array.from(block.querySelectorAll('.product-block-options__item[data-option-item], .product-block-options__item'));
    if (swatchItems.length > 0) {
      if (!Number.isFinite(totalVariants) || totalVariants === 0) {
        totalVariants = swatchItems.length;
      }
      const availSwatches = swatchItems.filter((el) => !el.classList.contains('product-block-options__item--unavailable'));
      availableVariants = availSwatches.length;
    }

    let sizeS = (block.getAttribute('data-size-s-available') || innerCard.getAttribute('data-size-s-available')) === 'true';
    let sizeM = (block.getAttribute('data-size-m-available') || innerCard.getAttribute('data-size-m-available')) === 'true';
    let sizeL = (block.getAttribute('data-size-l-available') || innerCard.getAttribute('data-size-l-available')) === 'true';
    let sizeXL = (block.getAttribute('data-size-xl-available') || innerCard.getAttribute('data-size-xl-available')) === 'true';

    if (swatchItems.length > 0) {
      swatchItems.forEach((swatch) => {
        const isAvail = !swatch.classList.contains('product-block-options__item--unavailable');
        const text = (swatch.getAttribute('data-option-item') || swatch.textContent || '').toLowerCase().trim().replace(/[\s/]+/g, '-');
        if (text === 's' || text === 's-38' || text === '38' || text === 'small') {
          sizeS = isAvail;
        } else if (text === 'm' || text === 'm-40' || text === '40' || text === 'medium') {
          sizeM = isAvail;
        } else if (text === 'l' || text === 'l-42' || text === '42' || text === 'large') {
          sizeL = isAvail;
        } else if (text === 'xl' || text === 'xl-44' || text === '44' || text === 'extra-large' || text === 'extralarge') {
          sizeXL = isAvail;
        }
      });
    }

    const isOOS = (Number.isFinite(availableVariants) && availableVariants === 0) ||
      block.classList.contains('stock-sort-item--oos') ||
      innerCard.classList.contains('stock-sort-item--oos') ||
      block.getAttribute('data-stock-tier') === 'out-of-stock';

    // 4. Calculate Stock Tier Base
    let stockRankBase = 100000; // Default rank 5 (broken sizes)
    if (isOOS) {
      stockRankBase = -5000000; // Out of stock: push to very end
    } else if (Number.isFinite(availableVariants) && Number.isFinite(totalVariants) && totalVariants > 0 && availableVariants === totalVariants) {
      stockRankBase = 1000000; // Rank 0: 100% all variants available
    } else if (sizeS && sizeM && sizeL && sizeXL) {
      stockRankBase = 900000; // Rank 1: Full core sizes
    } else if (sizeS && sizeM && sizeL) {
      stockRankBase = 800000; // Rank 2: S, M, L available
    } else if (sizeM && sizeL) {
      stockRankBase = 700000; // Rank 3: M, L available
    } else if (sizeM) {
      stockRankBase = 600000; // Rank 4: M available
    } else {
      stockRankBase = 100000; // Rank 5: Broken size set (missing core sizes or only 1 obscure size)
    }

    // 5. Keyword Relevance Score
    let relevanceScore = 0;

    if (isExactSku) {
      // Exact SKU match is absolute highest priority
      return (isOOS ? 5000000 : 10000000) + relevanceScore;
    }

    if (isExactTitle) {
      // Exact Title match is second highest priority
      return (isOOS ? 2000000 : 5000000) + stockRankBase;
    }

    if (isPartialSku) {
      relevanceScore += 50000;
    }

    if (title.startsWith(qRaw)) {
      relevanceScore += 40000;
    } else if (title.includes(qRaw)) {
      relevanceScore += 25000;
    } else {
      const allTokensInTitle = tokens.every((t) => title.includes(t));
      if (allTokensInTitle && tokens.length > 1) {
        relevanceScore += 20000;
      }
    }

    if (handle.endsWith('-' + qNorm) || handle.includes('-' + qNorm + '-')) {
      relevanceScore += 15000;
    } else if (handle.replace(/[\s-_]+/g, '').includes(qCompact)) {
      relevanceScore += 10000;
    }

    let matchedTokens = 0;
    for (const token of tokens) {
      const isCodeToken = /\d+/.test(token) || token.length >= 3;
      const tokenRegex = new RegExp('(?:^|[\\s-_])' + token + '(?:[\\s-_]|$)', 'i');

      if (skuList.some((s) => tokenRegex.test(s)) || tokenRegex.test(handle)) {
        matchedTokens++;
        relevanceScore += isCodeToken ? 8000 : 500;
      } else if (title.includes(token)) {
        matchedTokens++;
        relevanceScore += isCodeToken ? 5000 : 300;
      } else if (combined.includes(token)) {
        matchedTokens++;
        relevanceScore += isCodeToken ? 2000 : 100;
      }
    }

    if (matchedTokens === tokens.length && tokens.length > 1) {
      relevanceScore += 3000;
    }

    return stockRankBase + relevanceScore;
  }

  function reorderSearchGrid(grid, q) {
    if (!grid || !q) return;
    const directItems = Array.from(grid.children).filter((el) => {
      return el.classList.contains('stock-sort-item') ||
        el.classList.contains('product-block') ||
        el.tagName.toLowerCase() === 'product-block';
    });
    if (directItems.length <= 1) return;

    let needsReorder = false;
    const scored = directItems.map((item, idx) => {
      const card = item.matches('.product-block') ? item : (item.querySelector('.product-block') || item);
      const sc = scoreProductBlock(card, q);
      return { item: item, score: sc, originalIndex: idx };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.originalIndex - b.originalIndex;
    });

    for (let i = 0; i < scored.length; i++) {
      if (scored[i].originalIndex !== i) {
        needsReorder = true;
        break;
      }
    }

    if (needsReorder) {
      scored.forEach((entry) => {
        grid.appendChild(entry.item);
      });
    }
  }

  function init() {
    const isSearchPage = window.location.pathname.includes('/search') || (document.body && document.body.classList.contains('template-search'));
    if (!isSearchPage) return;

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const grid = document.querySelector('.search-infinite-scroll-grid, #product-grid, .product-grid');
    if (!grid) return;

    const api = window.CollectionSearchOverride;
    const override = q && api ? api.getOverride(q) : null;

    if (!override) {
      if (q) {
        reorderSearchGrid(grid, q);
      }
      return;
    }

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

  window.__reorderSearchGrid = function () {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const grid = document.querySelector('.search-infinite-scroll-grid, #product-grid, .product-grid');
    if (grid && q) {
      reorderSearchGrid(grid, q);
    }
  };

  document.addEventListener('infinite-scroll:loaded', function () {
    if (window.__reorderSearchGrid) window.__reorderSearchGrid();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
