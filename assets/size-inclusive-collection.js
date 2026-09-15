/**
 * Curated collection search overrides (Plus size, Jamai Sashti, etc.).
 * Fetches via GET /collections/{handle}/products.json when Liquid search
 * context is empty or unreliable.
 */
(function () {
  function normalizeTerms(raw) {
    return String(raw)
      .toLowerCase()
      .trim()
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ');
  }

  const OVERRIDES = [
    {
      id: 'jamai-sashti',
      handle: 'jamai-sashti-ethincwear-for-men',
      heading: 'Jamai Sashti',
      matchesTerms(raw) {
        const pad = ` ${normalizeTerms(raw)} `;
        return pad.includes(' jamai sasthi ') || pad.includes(' jamai sashti ');
      },
    },
    {
      id: 'size-inclusive',
      handle: 'size-inclusive',
      heading: 'Available Sizes',
      matchesTerms(raw) {
        const pad = ` ${normalizeTerms(raw)} `;
        return (
          pad.includes(' plus size ') ||
          pad.includes(' extended size ') ||
          pad.includes(' big size ') ||
          pad.includes(' plus ')
        );
      },
    },
  ];

  function getOverride(raw) {
    return OVERRIDES.find((o) => o.matchesTerms(raw)) || null;
  }

  function shopifyRoot() {
    const root =
      (typeof window !== 'undefined' &&
        window.Shopify &&
        window.Shopify.routes &&
        window.Shopify.routes.root) ||
      '/';
    return root.endsWith('/') ? root : `${root}/`;
  }

  function collectionProductsUrl(handle, page, perPage) {
    const params = new URLSearchParams();
    params.set('limit', String(Math.min(perPage, 250)));
    params.set('page', String(Math.max(1, page)));
    params.set('filter.v.availability', '1');
    return `${shopifyRoot()}collections/${handle}/products.json?${params.toString()}`;
  }

  function variantIsAvailable(v) {
    if (!v) return false;
    return v.available === true || v.available === 'true';
  }

  function productIsAvailable(product) {
    if (!product) return false;
    if (product.available === false) return false;
    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (!variants.length) return false;
    return variants.some(variantIsAvailable);
  }

  function imageSrc(product) {
    if (product.featured_image) {
      return typeof product.featured_image === 'string'
        ? product.featured_image
        : product.featured_image.src;
    }
    if (product.images && product.images[0]) {
      return product.images[0].src;
    }
    return '';
  }

  function pickVariant(product) {
    if (!product || !Array.isArray(product.variants) || !product.variants.length) {
      return null;
    }
    return product.variants.find(variantIsAvailable) || null;
  }

  function formatPrice(amountStr) {
    const n = parseFloat(String(amountStr), 10);
    if (Number.isNaN(n)) return '';
    const cur =
      (window.Shopify &&
        window.Shopify.currency &&
        window.Shopify.currency.active) ||
      'INR';
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: cur,
      }).format(n);
    } catch (e) {
      return `₹ ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
  }

  function productUrl(handle) {
    return `${shopifyRoot()}products/${handle}`;
  }

  function collectionViewAllUrl(handle) {
    return `${shopifyRoot()}collections/${handle}?filter.v.availability=1`;
  }

  function fetchProductsForHandle(handle, limit, signal) {
    const want = Math.min(Math.max(1, Number(limit) || 50), 500);
    const collected = [];
    let page = 1;
    const perPage = 250;

    function fetchPage() {
      if (signal && signal.aborted) {
        return Promise.resolve(collected.slice(0, want));
      }
      const url = collectionProductsUrl(handle, page, perPage);
      return fetch(url, { signal, credentials: 'same-origin' })
        .then((res) => {
          if (!res.ok) return { products: [] };
          return res.json();
        })
        .then((data) => {
          const products = Array.isArray(data.products) ? data.products : [];
          products.filter(productIsAvailable).forEach((p) => {
            if (collected.length < want) collected.push(p);
          });

          const lastPage = products.length < perPage;
          if (collected.length >= want || lastPage || page >= 15) {
            return collected.slice(0, want);
          }
          page += 1;
          return fetchPage();
        });
    }

    return fetchPage().then((products) =>
      products.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    );
  }

  function fetchProductsForTerms(raw, limit, signal) {
    const override = getOverride(raw);
    if (!override) return Promise.resolve([]);
    return fetchProductsForHandle(override.handle, limit, signal);
  }

  function buildProductGrid(products, options) {
    const opts = options || {};
    const limit = opts.limit || 8;
    const gridClass =
      opts.gridClass ||
      'product-grid product-grid--per-row-4 product-grid--per-row-mob-2';

    const root = document.createElement('div');
    root.id = 'predictive-search-results';
    root.setAttribute('data-collection-search-grid', '1');
    root.className = gridClass;

    products.slice(0, limit).forEach((product) => {
      const variant = pickVariant(product);
      if (!variant) return;

      const imgUrl = imageSrc(product);
      const price = formatPrice(variant.price);
      const href = productUrl(product.handle);

      const block = document.createElement('div');
      block.className = 'product-block main-search-result';
      const inner = document.createElement('div');
      inner.className = 'block-inner';
      const inner2 = document.createElement('div');
      inner2.className = 'block-inner-inner';
      const imageCont = document.createElement('div');
      imageCont.className = 'image-cont';
      const linkImg = document.createElement('a');
      linkImg.className = 'product-link';
      linkImg.href = href;
      linkImg.setAttribute('tabindex', '-1');
      linkImg.setAttribute('aria-hidden', 'true');
      const imgWrap = document.createElement('div');
      imgWrap.className =
        'product-block__image product-block__image--primary product-block__image--active';
      if (imgUrl) {
        const im = document.createElement('img');
        im.src = imgUrl;
        im.alt = product.title || '';
        im.loading = 'lazy';
        im.width = 540;
        im.height = 720;
        im.style.width = '100%';
        im.style.height = 'auto';
        im.style.objectFit = 'contain';
        imgWrap.appendChild(im);
      }
      linkImg.appendChild(imgWrap);
      imageCont.appendChild(linkImg);
      const detail = document.createElement('div');
      detail.className = 'product-block__detail';
      const titleEl = document.createElement('div');
      titleEl.className = 'product-block__title';
      const titleA = document.createElement('a');
      titleA.href = href;
      titleA.textContent = product.title || '';
      titleEl.appendChild(titleA);
      const priceRow = document.createElement('div');
      priceRow.className = 'product-price--block';
      const priceSpan = document.createElement('span');
      priceSpan.className = 'price__current';
      priceSpan.textContent = price;
      priceRow.appendChild(priceSpan);
      detail.appendChild(titleEl);
      detail.appendChild(priceRow);
      inner2.appendChild(imageCont);
      inner2.appendChild(detail);
      inner.appendChild(inner2);
      block.appendChild(inner);
      root.appendChild(block);
    });

    return root;
  }

  function buildSuggestionsWrapper(products, limit, headingText) {
    const wrap = document.createElement('div');
    wrap.className = 'search-suggestions-wrapper';
    const inner = document.createElement('div');
    inner.className = 'search-suggestions';

    const h = document.createElement('span');
    h.className = 'search-suggestions__heading';
    h.setAttribute('role', 'heading');
    h.setAttribute('aria-level', '2');
    h.textContent = `${headingText}:`;

    const ul = document.createElement('ul');
    ul.className =
      'search-suggestions__results-list search-suggestions__results-list--products';

    products.slice(0, limit).forEach((p) => {
      const v = pickVariant(p);
      if (!v) return;
      const li = document.createElement('li');
      li.className =
        'search-suggestions__list-item search-suggestions__list-item--product';
      const a = document.createElement('a');
      a.href = productUrl(p.handle);
      a.className = 'search-suggestions__item';
      a.textContent = p.title;
      li.appendChild(a);
      ul.appendChild(li);
    });

    inner.appendChild(h);
    inner.appendChild(ul);
    wrap.appendChild(inner);
    return wrap;
  }

  function headingForTerms(raw) {
    const override = getOverride(raw);
    if (!override) return '';
    if (
      override.id === 'size-inclusive' &&
      window.theme &&
      window.theme.strings &&
      window.theme.strings.sizeInclusiveHeading
    ) {
      return window.theme.strings.sizeInclusiveHeading;
    }
    return override.heading;
  }

  window.CollectionSearchOverride = {
    OVERRIDES,
    getOverride,
    matchesTerms(raw) {
      return !!getOverride(raw);
    },
    fetchProductsForHandle,
    fetchProductsForTerms,
    buildProductGrid,
    buildSuggestionsWrapper,
    collectionViewAllUrl,
    productUrl,
    headingForTerms,
  };

  window.SizeInclusiveCollection = {
    COLLECTION_HANDLE: 'size-inclusive',
    matchesTerms(raw) {
      const o = getOverride(raw);
      return o && o.id === 'size-inclusive';
    },
    fetchProducts(_baseUrlIgnored, limit, signal) {
      return fetchProductsForHandle('size-inclusive', limit, signal);
    },
    buildProductGrid,
    buildSuggestionsWrapper,
    collectionViewAllUrl() {
      return collectionViewAllUrl('size-inclusive');
    },
    productUrl,
  };

  window.JamaiSashtiCollection = {
    COLLECTION_HANDLE: 'jamai-sashti-ethincwear-for-men',
    matchesTerms(raw) {
      const o = getOverride(raw);
      return o && o.id === 'jamai-sashti';
    },
    fetchProducts(_baseUrlIgnored, limit, signal) {
      return fetchProductsForHandle('jamai-sashti-ethincwear-for-men', limit, signal);
    },
    buildProductGrid,
    buildSuggestionsWrapper,
    collectionViewAllUrl() {
      return collectionViewAllUrl('jamai-sashti-ethincwear-for-men');
    },
    productUrl,
  };
})();
