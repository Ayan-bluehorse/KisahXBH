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
            if (theme.Shopify.features.predictiveSearch) {
              return template.content.querySelector('.product-grid');
            }
            return template.content.querySelector('.section-search-template .product-grid');
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

            // Re-order product blocks so exact code/SKU matches appear FIRST
            productBlocks.sort((a, b) => {
              const scoreB = Math.max(scoreProductBlock(b, valueToSearch), scoreProductBlock(b, queryToUse));
              const scoreA = Math.max(scoreProductBlock(a, valueToSearch), scoreProductBlock(a, queryToUse));
              return scoreB - scoreA;
            });

            productBlocks.slice(0, resultLimit).forEach((block) => {
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
            let ajaxUrl;
            const baseUrl = window.location.origin;
            if (theme.Shopify && theme.Shopify.features && theme.Shopify.features.predictiveSearch) {
              ajaxUrl = new URL(theme.routes.predictiveSearch || '/search/suggest', baseUrl);
              ajaxUrl.searchParams.set('q', term);
              ajaxUrl.searchParams.set('section_id', 'predictive-search');
              ajaxUrl.searchParams.set('resources[limit]', resultLimit);
              ajaxUrl.searchParams.set(
                'resources[options][fields]',
                'title,product_type,variants.title,vendor,tag,variants.sku'
              );
              ajaxUrl.searchParams.set('resources[options][unavailable_products]', 'show');
            } else {
              ajaxUrl = new URL(linkURL.toString());
              ajaxUrl.searchParams.set('q', term);
              ajaxUrl.searchParams.set('section_id', 'main-search');
            }

            return fetch(ajaxUrl, { method: 'get', signal }).then((response) => {
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
