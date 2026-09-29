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

    const sku = (block.dataset.productSku || '').toLowerCase();
    const skuList = sku.split(',').map((s) => s.trim()).filter(Boolean);
    const handle = (
      block.dataset.productHandle ||
      block.querySelector('a.product-link')?.getAttribute('href') ||
      ''
    ).toLowerCase();
    const title = (
      block.dataset.productTitle ||
      block.querySelector('.product-block__title')?.innerText ||
      ''
    ).toLowerCase();
    const tags = (block.dataset.productTags || '').toLowerCase();
    const combined = (sku + ' ' + handle + ' ' + title + ' ' + tags).toLowerCase();

    let score = 0;

    // 1. Exact full SKU / code match
    for (const s of skuList) {
      const sCompact = s.replace(/[\s-_]+/g, '');
      const sWithoutSize = s.replace(/-\d{2}$/, '');
      const sWithoutSizeCompact = sWithoutSize.replace(/[\s-_]+/g, '');

      if (sWithoutSize === qNorm || sWithoutSizeCompact === qCompact) {
        score += 20000;
      } else if (s.includes(qNorm) || sCompact.includes(qCompact)) {
        score += 15000;
      }
    }

    // 2. Handle matches
    const handleCompact = handle.replace(/[\s-_]+/g, '');
    if (handle.endsWith('-' + qNorm) || handle.includes('-' + qNorm + '-')) {
      score += 12000;
    } else if (handleCompact.includes(qCompact)) {
      score += 10000;
    }

    // 3. Exact Title Match
    if (title === qRaw) {
      score += 10000;
    } else if (title.startsWith(qRaw)) {
      score += 5000;
    } else if (title.includes(qRaw)) {
      score += 3000;
    }

    // 4. Distinct token matching
    let matchedTokens = 0;
    for (const token of tokens) {
      const isCodeToken = /\d+/.test(token) || token.length >= 3;
      const tokenRegex = new RegExp('(?:^|[\\s-_])' + token + '(?:[\\s-_]|$)', 'i');

      if (skuList.some((s) => tokenRegex.test(s)) || tokenRegex.test(handle)) {
        matchedTokens++;
        score += isCodeToken ? 5000 : 100;
      } else if (combined.includes(token)) {
        matchedTokens++;
        score += isCodeToken ? 2000 : 50;
      }
    }

    // Bonus when ALL query tokens are matched
    if (matchedTokens === tokens.length && tokens.length > 1) {
      score += 1000;
    }

    return score;
  }

  function reorderSearchGrid(grid, q) {
    if (!grid || !q) return;
    const blocks = Array.from(
      grid.querySelectorAll('.product-block:not(.collection-block):not(.page-block)')
    );
    if (blocks.length <= 1) return;

    let needsReorder = false;
    const scored = blocks.map((b, idx) => {
      const sc = scoreProductBlock(b, q);
      return { block: b, score: sc, originalIndex: idx };
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
      scored.forEach((item) => {
        grid.appendChild(item.block);
      });
    }
  }

  function init() {
    if (!document.body.classList.contains('template-search')) return;

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const grid = document.querySelector('.search-infinite-scroll-grid');

    const api = window.CollectionSearchOverride;
    const override = q && api ? api.getOverride(q) : null;

    if (!override) {
      if (grid && q) {
        reorderSearchGrid(grid, q);
      }
      return;
    }

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
