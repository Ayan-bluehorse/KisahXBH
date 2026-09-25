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

    const resolveSmartSku = (query) => {
      if (!query) return { query, isPureNumber: false };
      const trimmed = query.trim();
      const explicitMatch = trimmed.match(/^(ka|kk)[\s-]?(\d{3,6})$/i);
      if (explicitMatch) {
        return { query: `${explicitMatch[1].toLowerCase()}-${explicitMatch[2]}`, isPureNumber: false };
      }
      if (/^\d{3,6}$/.test(trimmed)) {
        return { query: `ka-${trimmed}`, isPureNumber: true, rawNumber: trimmed };
      }
      return { query: trimmed, isPureNumber: false };
    };

    const form = searchInput.closest('form');
    if (form) {
      form.addEventListener('submit', () => {
        const smart = resolveSmartSku(searchInput.value);
        if (smart.query && smart.query !== searchInput.value) {
          searchInput.value = smart.query;
        }
      });
    }

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

        // Create URL for full search results
        const linkURL = new URL(form ? form.action : window.location.origin + (theme.routes.search || '/search'));
        if (form) {
          const formParams = new URLSearchParams(new FormData(form));
          formParams.forEach((value, key) => {
            linkURL.searchParams.set(key, value);
          });
        }
        linkURL.searchParams.set('q', queryToUse);

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

            grid.querySelectorAll('.product-block:not(.collection-block):not(.page-block)').forEach((block, index) => {
              if (index <= resultLimit) {
                block.classList.add('main-search-result');
                block.querySelectorAll('.btn.quickbuy-toggle').forEach((el) => el.remove());
                block.querySelectorAll('.quickbuy-toggle').forEach((el) => el.classList.remove('quickbuy-toggle'));
                resultsProducts.firstElementChild.appendChild(block);
              }
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
            fetchSearchHtml(queryToUse)
              .then((responseText) => {
                let resultsList = parseGridFromHtml(responseText);

                // 1. If pure number (e.g. 0637) returned no products for KA-, try KK- (kids) fallback
                if (!gridHasBlocks(resultsList) && smartSku.isPureNumber) {
                  return fetchSearchHtml(`kk-${smartSku.rawNumber}`)
                    .then((kkText) => {
                      const kkGrid = parseGridFromHtml(kkText);
                      if (gridHasBlocks(kkGrid)) {
                        linkURL.searchParams.set('q', `kk-${smartSku.rawNumber}`);
                        runGridIntoUi(kkGrid);
                        return null;
                      }
                      return resultsList;
                    })
                    .catch(() => resultsList);
                }

                // 2. If multi-hyphen SKU without size suffix (e.g. KA-1099-5641-T140) returned no products,
                // try standard variant size suffixes since Shopify variant SKUs include sizes
                if (!gridHasBlocks(resultsList) && /^k[ak]-/i.test(queryToUse) && !/-\d{1,2}$/.test(queryToUse)) {
                  const sizeTry = `${queryToUse}-38`;
                  return fetchSearchHtml(sizeTry)
                    .then((sizeText) => {
                      const sizeGrid = parseGridFromHtml(sizeText);
                      if (gridHasBlocks(sizeGrid)) {
                        linkURL.searchParams.set('q', sizeTry);
                        runGridIntoUi(sizeGrid);
                        return null;
                      }
                      return doHyphenFallback();
                    })
                    .catch(() => doHyphenFallback());
                }

                function doHyphenFallback() {
                  if (queryToUse.includes('-')) {
                    const spaceSeparated = queryToUse.replace(/-/g, ' ');
                    return fetchSearchHtml(spaceSeparated)
                      .then((spaceText) => {
                        const spaceGrid = parseGridFromHtml(spaceText);
                        if (gridHasBlocks(spaceGrid)) {
                          linkURL.searchParams.set('q', spaceSeparated);
                          runGridIntoUi(spaceGrid);
                          return null;
                        }

                        // Try stripped prefix without leading KA- (e.g. 1258-5588-T301)
                        const withoutPrefix = queryToUse.replace(/^k[ak]-/i, '');
                        if (withoutPrefix !== queryToUse) {
                          return fetchSearchHtml(withoutPrefix).then((wpText) => {
                            const wpGrid = parseGridFromHtml(wpText);
                            if (gridHasBlocks(wpGrid)) {
                              linkURL.searchParams.set('q', withoutPrefix);
                              runGridIntoUi(wpGrid);
                              return null;
                            }
                            return resultsList;
                          });
                        }

                        return resultsList;
                      })
                      .catch(() => resultsList);
                  }
                  return resultsList;
                }

                if (!gridHasBlocks(resultsList) && queryToUse.includes('-')) {
                  return doHyphenFallback();
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
