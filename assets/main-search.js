const MainSearch = class extends HTMLElement {
  constructor() {
    super();

    // Clicking close button
    this.querySelectorAll('.main-search__close').forEach((el) => {
      el.addEventListener('click', (evt) => {
        evt.preventDefault();
        document.body.classList.remove('show-search');
      });
    });

    // Pressing escape key
    this.querySelector('.main-search__input').addEventListener('keyup', (evt) => {
      if (evt.key === 'Escape') {
        this.querySelector('.main-search__close').dispatchEvent(new Event('click'));
      }
    });

    // Search as you type
    if (this.dataset.quickSearch === 'true') {
      this.initQuickSearch();
    }
  }

  initQuickSearch() {
    const searchInput = this.querySelector('.main-search__input');
    const searchTimeoutThrottle = 500;
    const resultLimit = 8;
    const includeMeta = this.dataset.quickSearchMeta === 'true';
    let searchTimeoutID = -1;
    let searchAbortController = null;

    const normalizeSearchQuery = (query) => {
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
    };

    const resolveSmartSku = (query) => {
      if (!query) return { query: '', normalized: '' };
      const trimmed = query.trim();
      const normalized = normalizeSearchQuery(trimmed);
      return { query: normalized || trimmed, normalized };
    };

    const scoreProductBlock = (block, rawQuery) => {
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
    };

    const form = searchInput.closest('form');

    const handleInputChange = () => {
      const resultsBox = this.querySelector('.main-search__results');
      const valueToSearch = searchInput.value;

      // Only search if search string longer than 2, and it has changed
      if (valueToSearch.length && valueToSearch !== this.oldSearchValue) {
        // Save previous value
        this.oldSearchValue = valueToSearch;

        // Kill outstanding ajax request
        if (searchAbortController !== null) {
          searchAbortController.abort();
          searchAbortController = null;
        }

        // Kill previous search
        clearTimeout(searchTimeoutID);

        const smartSku = resolveSmartSku(valueToSearch);
        const queryToUse = smartSku.query;

        // Create URL for full search results (using user's search query)
        const linkURL = new URL(form ? form.action : window.location.origin + (theme.routes.search || '/search'));
        if (form) {
          const formParams = new URLSearchParams(new FormData(form));
          formParams.forEach((value, key) => {
            linkURL.searchParams.set(key, value);
          });
        }
        linkURL.searchParams.set('q', valueToSearch.trim());

        // Show loading
        this.classList.remove('main-search--has-results', 'main-search--results-on-multiple-lines', 'main-search--no-results');
        this.classList.add('main-search--loading');
        if (!this.querySelector('.main-search__results-spinner')) {
          resultsBox.innerHTML = '<div class="main-search__results-spinner"><div class="loading-spinner"></div></div>';
        }

        // Do next search (in X milliseconds)
        searchTimeoutID = setTimeout(() => {
          searchAbortController = new AbortController();
          const signal = searchAbortController.signal;

          const parseGridFromHtml = (html) => {
            const template = document.createElement('template');
            template.innerHTML = html;
            return template.content.querySelector('.product-grid, .section-search-template .product-grid, .search-infinite-scroll-grid');
          };

          const gridHasBlocks = (grid) =>
            grid &&
            (grid.querySelector('.product-block:not(.collection-block):not(.page-block)') ||
              grid.querySelector('.product-block.page-block'));

          const mergeGrids = (primaryGrid, secondaryGrid) => {
            if (!primaryGrid && !secondaryGrid) return null;
            if (!primaryGrid) return secondaryGrid;
            if (!secondaryGrid) return primaryGrid;

            const existingIds = new Set();
            primaryGrid
              .querySelectorAll('.product-block:not(.collection-block):not(.page-block)')
              .forEach((block) => {
                const id = block.dataset.productId || block.dataset.productHandle;
                if (id) existingIds.add(id);
              });

            secondaryGrid
              .querySelectorAll('.product-block:not(.collection-block):not(.page-block)')
              .forEach((block) => {
                const id = block.dataset.productId || block.dataset.productHandle;
                if (!id || !existingIds.has(id)) {
                  primaryGrid.appendChild(block.cloneNode(true));
                  if (id) existingIds.add(id);
                }
              });

            return primaryGrid;
          };

          const runGridIntoUi = (grid, opts) => {
            searchAbortController = null;
            this.classList.remove('main-search--has-results', 'main-search--results-on-multiple-lines', 'main-search--no-results');
            resultsBox.innerHTML = '';

            if (!grid) {
              this.classList.remove('main-search--loading');
              this.classList.add('main-search--no-results');
              const emptyMessage = document.createElement('div');
              emptyMessage.className = 'main-search__empty-message';
              emptyMessage.innerHTML = theme.strings.generalSearchNoResultsWithoutTerms;
              resultsBox.appendChild(emptyMessage);
              return;
            }

            const resultsProducts = document.createElement('div');
            resultsProducts.className = 'main-search__results__products collection-listing';
            resultsProducts.innerHTML = '<div></div>';
            const resultsPages = document.createElement('div');
            resultsPages.className = 'main-search__results__pages';

            resultsProducts.firstElementChild.className = grid.className;

            const productBlocks = Array.from(
              grid.querySelectorAll('.product-block:not(.collection-block):not(.page-block)')
            );

            // Re-order product blocks so exact code/SKU matches appear FIRST and score-ranked
            const scoredBlocks = productBlocks.map((block) => {
              const score = Math.max(scoreProductBlock(block, valueToSearch), scoreProductBlock(block, queryToUse));
              return { block, score };
            });

            scoredBlocks.sort((a, b) => b.score - a.score);

            // If there are in-stock products or exact SKU/title matches (score > 0), filter out any general OOS items (score < 0)
            const hasPositiveMatches = scoredBlocks.some((entry) => entry.score > 0);
            const filteredBlocks = hasPositiveMatches
              ? scoredBlocks.filter((entry) => entry.score > 0).map((entry) => entry.block)
              : scoredBlocks.map((entry) => entry.block);

            filteredBlocks.slice(0, resultLimit).forEach((block) => {
              block.classList.add('main-search-result');
              block.querySelectorAll('.btn.quickbuy-toggle').forEach((el) => el.remove());
              block.querySelectorAll('.quickbuy-toggle').forEach((el) => el.classList.remove('quickbuy-toggle'));
              resultsProducts.firstElementChild.appendChild(block);
            });

            grid.querySelectorAll('.product-block.page-block').forEach((block) => {
              const item = document.createElement('a');
              item.className = 'main-search-result main-search-result--page';
              item.href = block.querySelector('a').href;
              item.innerHTML = '<div class="main-search-result__text"></div>';
              item.firstElementChild.innerText = block.querySelector('.page-block__title').innerText;
              resultsPages.appendChild(item);
            });

            this.classList.remove('main-search--loading');

            const areProducts = !!resultsProducts.querySelector('.main-search-result');
            const arePages = !!resultsPages.querySelector('.main-search-result');
            if (areProducts || arePages) {
              this.classList.add('main-search--has-results');
              this.classList.toggle('main-search--results-on-multiple-lines', resultsProducts.querySelectorAll('.product-block').length > 4);
              if (areProducts) {
                resultsBox.appendChild(resultsProducts);
              }
              if (arePages) {
                const heading = document.createElement('h6');
                heading.className = 'main-search-result__heading';
                heading.innerHTML = theme.strings.generalSearchPages;
                resultsPages.insertAdjacentElement('afterbegin', heading);
                resultsBox.appendChild(resultsPages);
              }

              const allLink = document.createElement('a');
              allLink.className = 'main-search__results-all-link btn btn--secondary';
              allLink.href = (opts && opts.viewAllHref) || linkURL;
              allLink.innerHTML = theme.strings.generalSearchViewAll;
              resultsBox.appendChild(allLink);
            } else {
              this.classList.add('main-search--no-results');
              const emptyMessage = document.createElement('div');
              emptyMessage.className = 'main-search__empty-message';
              emptyMessage.innerHTML = theme.strings.generalSearchNoResultsWithoutTerms;
              resultsBox.appendChild(emptyMessage);
            }
          };

          const fetchSearchHtml = (term) => {
            const baseUrl = window.location.origin;
            const searchUrl = new URL(theme.routes.search || '/search', baseUrl);
            searchUrl.searchParams.set('q', term);
            searchUrl.searchParams.set('type', 'product');
            searchUrl.searchParams.set('section_id', 'main-search');

            return fetch(searchUrl, { method: 'get', signal }).then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.text();
            });
          };

          const runPredictiveFlow = () => {
            // First fetch with raw search value to get all matching results
            fetchSearchHtml(valueToSearch.trim())
              .then((responseText) => {
                let resultsList = parseGridFromHtml(responseText);

                const fetchPromises = [];

                // If normalized query differs, also fetch normalized to ensure exact SKU variant is included
                if (queryToUse && queryToUse !== valueToSearch.trim()) {
                  fetchPromises.push(
                    fetchSearchHtml(queryToUse)
                      .then((normText) => {
                        resultsList = mergeGrids(resultsList, parseGridFromHtml(normText));
                      })
                      .catch(() => {})
                  );
                }

                return Promise.all(fetchPromises).then(() => resultsList);
              })
              .then((resultsList) => {
                // If no blocks found and query has hyphens, fallback to space-separated
                if (!gridHasBlocks(resultsList) && queryToUse.includes('-')) {
                  const spaceSeparated = queryToUse.replace(/-/g, ' ');
                  return fetchSearchHtml(spaceSeparated)
                    .then((spaceText) => {
                      const spaceGrid = parseGridFromHtml(spaceText);
                      if (gridHasBlocks(spaceGrid)) {
                        return spaceGrid;
                      }
                      return resultsList;
                    })
                    .catch(() => resultsList);
                }
                return resultsList;
              })
              .then((resultsList) => {
                if (resultsList === null) return; // Handled by fallback

                const searchPath = theme.routes.search || '/search';
                const collectionSearch = window.CollectionSearchOverride;
                const searchOverride =
                  collectionSearch && collectionSearch.getOverride(valueToSearch);

                if (
                  theme.Shopify &&
                  theme.Shopify.features &&
                  theme.Shopify.features.predictiveSearch &&
                  searchOverride &&
                  !gridHasBlocks(resultsList)
                ) {
                  const fallbackUrl = new URL(searchPath, window.location.origin);
                  fallbackUrl.searchParams.set('q', valueToSearch);
                  fallbackUrl.searchParams.set('section_id', 'predictive-search');
                  return fetch(fallbackUrl.toString(), { method: 'get', signal })
                    .then((r) => r.text())
                    .then((fallbackHtml) => {
                      const fbGrid = parseGridFromHtml(fallbackHtml);
                      runGridIntoUi(gridHasBlocks(fbGrid) ? fbGrid : null, {
                        viewAllHref: collectionSearch.collectionViewAllUrl(searchOverride.handle),
                      });
                    });
                }

                runGridIntoUi(resultsList);
              })
              .catch((err) => {
                if (err.name !== 'AbortError') {
                  runGridIntoUi(null);
                }
              });
          };

          const collectionSearch = window.CollectionSearchOverride;
          const searchOverride =
            collectionSearch && collectionSearch.getOverride(valueToSearch);

          if (searchOverride) {
            collectionSearch
              .fetchProductsForHandle(searchOverride.handle, resultLimit, signal)
              .then((products) => {
                if (products.length) {
                  const grid = collectionSearch.buildProductGrid(products, {
                    limit: resultLimit,
                  });
                  runGridIntoUi(grid, {
                    viewAllHref: collectionSearch.collectionViewAllUrl(searchOverride.handle),
                  });
                  return;
                }
                runPredictiveFlow();
              })
              .catch(() => {
                runPredictiveFlow();
              });
            return;
          }

          runPredictiveFlow();
        }, searchTimeoutThrottle);
      } else if (!valueToSearch.length) {
        // Abandon current search
        this.oldSearchValue = valueToSearch;
        if (searchAbortController !== null) {
          searchAbortController.abort();
          searchAbortController = null;
        }
        clearTimeout(searchTimeoutID);

        // Clear results
        this.classList.remove('main-search--has-results', 'main-search--results-on-multiple-lines', 'main-search--loading');
        resultsBox.innerHTML = '';
      }
    };

    searchInput.addEventListener('keyup', handleInputChange.bind(this));
    searchInput.addEventListener('change', handleInputChange.bind(this));
  }
};

window.customElements.define('main-search', MainSearch);
