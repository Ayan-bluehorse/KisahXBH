
(function () {
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = `
.product__media-wrapper,
.product-media-wrapper {
  position: relative;
}
  .cp-size-popup.active ~ * {
  pointer-events: none; 
}
.cp-size-popup-inner, .cp-size-popup-inner * {
  pointer-events: auto; 
}
.similar-product {
    position: absolute;
    bottom: 60px;
    right: 20px;
    z-index: 45;
    cursor: pointer;
    background: white;
    padding: 5px 8px;
    border-radius: 12px;
    visibility: visible !important;
    display: flex;
    gap: 5px;
    align-items: center;
}
.cp-atc-btn img {
  aspect-ratio: unset !important;
}
.similar-product img {
  width: 22px;
  height: 22px;
  object-fit: contain;
  display: block;
}
  .similar-product-text {
    font-size: 12px;
    font-family: var(--base-font-family);
}
.zoom-icon {
  display: none;
}
.cp-similar-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 500;
  height: 100%;
}
.cp-similar-inner {
  background: white;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 10px 0 10px 10px;
  position: absolute;
  bottom: 0;
}
.cp-similar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 28px;
  color: #000;
  margin-right: 12px;
  height: auto;
  max-height: 28px;
  margin-bottom: 10px;
}
.cp-similar-header span {
  color: #000;
  font-family: var(--base-font-family);
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.cp-similar-items {
  position: relative;
  padding: 10px 0;
}
.swiper-slide {
  width: 150px !important;
}
.cp-similar-card img {
  width: 100%;
  border-radius: 5px;
  cursor: pointer;
  aspect-ratio: 1 / 1.3;
}
.cp-similar-title {
  margin-top: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #000;
  -webkit-text-stroke-width: 0.2px;
  -webkit-text-stroke-color: #000;
  font-family: var(--base-font-family);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  cursor: pointer;
}
.cp-similar-price {
  margin-top: 5px;
  color: #181818;
  font-family: var(--base-font-family);
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.cp-original {
  text-decoration: line-through;
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}
.cp-atc-btn {
  background: #201847;
  color: white;
  border: none;
  padding: 8px 0px;
  margin-top: 10px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: var(--base-font-family);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 10px;
  text-transform: capitalize;
}
.cart-icon {
  width: 14px !important;
  height: auto !important;
  margin-right: 5px;
}
.cp-size-popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 501;
  display: none;
}
.cp-size-popup.active {
  display: block;
}
.cp-size-popup-inner {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 0px 20px 20px 20px;
  transition: transform 0.3s ease-out;
}
.cp-size-popup.active .cp-size-popup-inner {
  transform: translateY(0);
}
.cp-size-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 15px;
  padding-bottom: 10px;
}
.cp-size-header span {
  color: #000;
  font-family: var(--base-font-family);
  font-size: 22px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
}
.cp-size-actions {
  display: flex;
  align-items: flex-end;
  gap: 0;
  flex-direction: column-reverse;
}
.cp-size-chart-link {
  text-decoration: underline;
  color: #7A7A81;
  font-family: var(--base-font-family);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
}
.cp-size-close {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 28px;
  color: #000;
  max-height: 28px;
  margin-bottom: 22px;
  height: 28px;
  padding-top: 0;
  margin-top: 0;
}
.cp-sizes {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 15px;
}
.cp-sizes p {
  cursor: pointer;
  padding: 10px;
  margin: 5px;
  border: 2px solid #ccc;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.cp-sizes p.active {
  background: #2b1b61;
  color: white;
  border-color: #2b1b61;
}
.cp-size-done {
  background: #7A7A81 !important;
  color: #fff;
  pointer-events: none;
  opacity: .6;
  cursor: not-allowed;
  border: none;
  padding: 12px;
  margin-top: 10px;
  width: 100%;
  border-radius: 8px;
  text-align: center;
  font-family: var(--base-font-family);
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 15px;
  text-transform: capitalize;
}
.cp-size-popup:has(.cp-sizes p.active) .cp-size-done {
  background: #201847 !important;
  pointer-events: auto;
  opacity: 1;
  cursor: pointer;
}
.cp-chart-open .cp-similar-drawer {
  z-index: 440 !important;
  pointer-events: none;
}
.cp-chart-open .cp-size-popup {
  z-index: 441 !important;
  pointer-events: none;
}
.cp-stop-scroll {
  overflow: hidden;
}`;
  document.head.appendChild(style);


  // Utility function to wait for an element
  const waitFor = (selector, cb, timeout = 30000) => {
    const start = Date.now();
    const check = () => {
      const el = document.querySelector(selector);
      if (el) {
        console.log(`Element found: ${selector}`); 
        return cb(el);
      }
      if (Date.now() - start < timeout) {
        console.log(`Retrying to find ${selector}...`);
        requestAnimationFrame(check);
      } else {
        console.warn(`Timeout: Could not find ${selector}`);
      }
    };
    check();
  };

  // Block zoom on specific elements
  const blockZoomOnly = (el) => {
    ['pointerdown', 'touchstart'].forEach(type => {
      el.addEventListener(type, (e) => {
        if (!e.target.closest('.cp-similar-card img, .cp-similar-title')) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }, { capture: true });
    });
  };

  // Check if size chart is open
  const chartSelectors = '.mfp-wrap, .fancybox-container, .size-chart-modal, .sizechart, .popup--sizechart, .modal.size-chart, [data-size-chart], [aria-label*="Size Chart"], .modal--size-chart, .drawer--size-chart';
  const chartOpen = () => !!document.querySelector(chartSelectors);

  // Handle size chart visibility
  let chartHoldUntil = 0, chartTick = null, chartSettleTo = null;
  const holdChart = (ms = 4000) => {
    const now = Date.now();
    chartHoldUntil = Math.max(chartHoldUntil, now + ms);
    if (!chartTick) {
      document.documentElement.classList.add('cp-chart-open');
      chartTick = setInterval(() => {
        if (Date.now() <= chartHoldUntil || chartOpen()) {
          document.documentElement.classList.add('cp-chart-open');
        } else {
          clearInterval(chartTick);
          chartTick = null;
          if (chartSettleTo) clearTimeout(chartSettleTo);
          chartSettleTo = setTimeout(() => {
            if (!chartOpen()) document.documentElement.classList.remove('cp-chart-open');
          }, 200);
        }
      }, 120);
    }
  };

  // Ensure global size popup exists
  const ensureGlobalSizePopup = () => {
    if (document.querySelector('.cp-size-popup.global')) return;
    const popup = document.createElement('div');
    popup.className = 'cp-size-popup global';
    popup.innerHTML = `
      <div class="cp-size-popup-inner">
        <div class="cp-size-header">
          <span>Select Size</span>
          <div class="cp-size-actions">
            <a href="#" class="cp-size-chart-link">Size Chart</a>
            <button class="cp-size-close">×</button>
          </div>
        </div>
        <div class="cp-sizes"></div>
        <button class="cp-size-done">Done</button>
      </div>`;
    document.body.appendChild(popup);
    console.log('Size popup created'); // Debug
  };

  // Inject similar products icon
  const injectSimilarIcon = () => {
    const mainImage = document.querySelector('media-gallery .main-image');
    let wrap = mainImage || document.querySelector('.product__media-wrapper') || document.querySelector('.product-media-wrapper');
    if (!wrap) {
      console.warn('No suitable container found for similar products icon');
      return;
    }
    console.log('Container found:', wrap); // Debug

    const anchor = wrap.closest && wrap.closest('a.show-gallery');
    const container = anchor && anchor.parentElement ? anchor.parentElement : wrap;
    console.log('Appending icon to:', container); // Debug

    if (container.querySelector('.similar-product')) {
      console.log('Similar product icon already exists');
      return;
    }

    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
      console.log('Set container position to relative'); // Debug
    }

    const icon = document.createElement('div');
    icon.className = 'similar-product';
    icon.setAttribute('role', 'button');
    icon.setAttribute('aria-label', 'Similar Products');
    icon.innerHTML = `
  <img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Mask_group_36.png?v=1754375620" alt="Similar Products" />
  <span class="similar-product-text">View Similar</span>
`;

    blockZoomOnly(icon);

    icon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Similar products icon clicked'); // Debug
      openDrawer();
    }, { capture: false });

    container.appendChild(icon);
    console.log('Icon appended to DOM'); // Debug
  };

  // Open similar products drawer
  const openDrawer = () => {
    if (document.querySelector('.cp-similar-drawer')) return;

    const blocks = document.querySelectorAll('.rebuy-widget-content .rebuy-product-block');
    if (!blocks.length) {
      console.warn('No similar products found'); // Debug
      return alert('No similar products found');
    }

    const drawer = document.createElement('div');
    drawer.className = 'cp-similar-drawer';
    drawer.innerHTML = `
      <div class="cp-similar-inner">
        <div class="cp-similar-header">
          <span>Similar Products</span>
          <button class="cp-close">×</button>
        </div>
        <div class="cp-similar-items swiper">
          <div class="swiper-wrapper">
            ${[...blocks]
              .map((b) => {
                const title = b.querySelector('.rebuy-product-title')?.textContent?.trim() || '';
                const img = b.querySelector('img')?.src || '';
                const price =
                  b.querySelector('.rebuy-money.sale span[tabindex]')?.textContent?.trim() ||
                  b.querySelector('.rebuy-money')?.textContent?.trim() ||
                  b.querySelector('.rebuy-product-price')?.textContent?.trim() ||
                  '';
                const originalPrice = b.querySelector('.rebuy-money.original')?.textContent?.trim() || '';
                const variantSelect = b.querySelector('select');
                const variantsArr = variantSelect ? [...variantSelect.options].map((opt) => ({ id: opt.value, label: opt.textContent.split(' - ')[0] })) : [];
                const variantsJson = JSON.stringify(variantsArr).replace(/"/g, '&quot;');
                const hasVariants = !!variantsArr.length;
                const productLink = b.querySelector('a.rebuy-product-title')?.href || '';
                console.log('Product link for card:', productLink); // Debug

                return `
                  <div class="cp-similar-card swiper-slide" data-vid="${variantSelect?.value || ''}" data-has-variants="${hasVariants}" data-variants="${variantsJson}" data-url="${productLink}">
                    <img src="${img}" class="cp-product-link" />
                    <div class="cp-similar-title cp-product-link">${title}</div>
                    <div class="cp-similar-price">${price} ${originalPrice ? `<span class="cp-original">${originalPrice}</span>` : ''}</div>
                    <button class="cp-atc-btn"><img src="https://cdn.shopify.com/s/files/1/0496/1003/1256/files/Cart.png?v=1754650774" alt="Cart" class="cart-icon" /> Add to Bag</button>
                  </div>`;
              })
              .join('')}
          </div>
        </div>
      </div>`;
    document.body.appendChild(drawer);
    document.body.classList.add('cp-stop-scroll');
    console.log('Drawer appended to DOM'); // Debug
    ensureGlobalSizePopup();

 const swiper = new Swiper('.cp-similar-items', {
  slidesPerView: 2.5,
  spaceBetween: 10,
  freeMode: { enabled: true, momentum: false }, // no overshoot
  observeParents: true,
  observer: true,
  roundLengths: true,
  on: {
    init(sw) {
      maybeLoadMore(sw);         // prime once
    },
    slideChange(sw) {
      maybeLoadMore(sw);         // load ahead as we approach end
    },
    resize(sw) {
      sw.update();
    }
  }
});

    document.querySelectorAll('.cp-similar-card .cp-product-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = e.target.closest('.cp-similar-card');
        const url = card.dataset.url;
        console.log('Navigating to product PDP:', url); // Debug
        if (url) {
          window.location.href = url;
        } else {
          console.warn('Product URL not found for this card');
        }
      });
    });
  };

  // Add to cart function
  const addToCart = (id) => {
    console.log('Adding to cart, variant ID:', id); // Debug
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity: 1 }),
    })
      .then(response => {
        if (response.ok) {
          console.log('Item added to cart successfully'); // Debug
          document.querySelector('.cp-size-popup')?.classList.remove('active');
          document.querySelector('.cp-similar-drawer')?.remove();
          document.body.classList.remove('cp-stop-scroll');
          document.documentElement.classList.remove('cp-chart-open');
          document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
          document.querySelector('button.cart-icon-bubble, .cart-link, .header__icon--cart')?.click();
        } else {
          console.error('Failed to add to cart:', response.status); // Debug
          alert('Failed to add to cart');
        }
      })
      .catch(error => {
        console.error('Error adding to cart:', error); // Debug
        alert('Error adding to cart');
      });
  };

  // Event listener for clicks
  document.addEventListener('click', (e) => {
    // Close drawer when clicking outside
    if (e.target.classList.contains('cp-similar-drawer') && !e.target.closest('.cp-similar-inner') && !document.querySelector('.cp-size-popup.active') && !chartOpen()) {
      console.log('Closing drawer due to outside click'); // Debug
      document.querySelector('.cp-similar-drawer')?.remove();
      document.body.classList.remove('cp-stop-scroll');
      document.documentElement.classList.remove('cp-chart-open');
      return;
    }

    // Close button for drawer
    if (e.target.classList.contains('cp-close')) {
      if (document.querySelector('.cp-size-popup.active')) {
        console.log('Preventing drawer close due to active size popup'); // Debug
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      console.log('Closing drawer via close button'); // Debug
      document.querySelector('.cp-similar-drawer')?.remove();
      if (!document.querySelector('.cp-size-popup.active')) document.body.classList.remove('cp-stop-scroll');
      document.documentElement.classList.remove('cp-chart-open');
    }

    // Add to cart button
    if (e.target.classList.contains('cp-atc-btn') || e.target.closest('.cp-atc-btn')) {
      console.log('Add to cart button clicked'); // Debug
      const card = e.target.closest('.cp-similar-card');
      const hasVariants = card.dataset.hasVariants === 'true';

      if (hasVariants) {
        console.log('Opening size popup for product with variants'); // Debug
        ensureGlobalSizePopup();
        const popup = document.querySelector('.cp-size-popup.global');
        const list = popup.querySelector('.cp-sizes');
        const variants = JSON.parse((card.getAttribute('data-variants') || '[]').replace(/&quot;/g, '"'));
        list.innerHTML = variants.map(v => `<p data-id="${v.id}">${v.label}</p>`).join('');
        popup.classList.add('active');
        document.body.classList.add('cp-stop-scroll');
      } else {
        const id = card.dataset.vid;
        if (!id) {
          console.warn('Product ID not found'); // Debug
          return alert('Product ID not found');
        }
        addToCart(id);
      }
    }

    // Size selection done button
    if (e.target.classList.contains('cp-size-done')) {
      console.log('Size done button clicked'); // Debug
      const popup = document.querySelector('.cp-size-popup');
      const active = popup.querySelector('p.active');
      const id = active?.dataset.id;
      if (!id) {
        console.warn('No size selected'); // Debug
        return alert('Please select a size');
      }
      addToCart(id);
    }

    // Close size popup
    if (e.target.classList.contains('cp-size-close')) {
      console.log('Closing size popup'); // Debug
      const popup = document.querySelector('.cp-size-popup');
      popup.classList.remove('active');
      if (!document.querySelector('.cp-similar-drawer')) document.body.classList.remove('cp-stop-scroll');
      document.documentElement.classList.remove('cp-chart-open');
    }

    // Size selection
    if (e.target.matches('.cp-sizes p')) {
      console.log('Size selected:', e.target.textContent); // Debug
      const parent = e.target.parentElement;
      parent.querySelectorAll('p').forEach((el) => el.classList.remove('active'));
      e.target.classList.add('active');
    }

    // Close size popup when clicking outside
    if (e.target.classList.contains('cp-size-popup') && !e.target.closest('.cp-size-popup-inner') && !chartOpen()) {
      console.log('Closing size popup due to outside click'); // Debug
      const popup = document.querySelector('.cp-size-popup');
      popup.classList.remove('active');
      if (!document.querySelector('.cp-similar-drawer')) document.body.classList.remove('cp-stop-scroll');
      document.documentElement.classList.remove('cp-chart-open');
    }

    // Size chart link
    if (e.target.classList.contains('cp-size-chart-link')) {
      console.log('Size chart link clicked'); // Debug
      e.preventDefault();
      const trigger = document.querySelector('a.trigger-pop-up.option-selector');
      if (trigger) {
        holdChart(8000);
        trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      } else {
        console.warn('Size chart trigger not found'); // Debug
      }
    }
    
  }, true);

  // Size chart event listeners
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest(chartSelectors)) {
      console.log('Size chart interaction detected (pointerdown)'); // Debug
      holdChart(4000);
    }
  }, true);
  document.addEventListener('touchstart', (e) => {
    if (e.target.closest(chartSelectors)) {
      console.log('Size chart interaction detected (touchstart)'); // Debug
      holdChart(4000);
    }
  }, true);

  // Mutation observer for size chart
  const mo = new MutationObserver(() => {
    if (chartOpen()) {
      console.log('Size chart detected via mutation observer'); // Debug
      holdChart(3000);
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

  // Add to cart for collection cards
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      console.log('Collection card add to cart clicked'); // Debug
      const card = this.closest('.collection-card');
      const variantId = card.querySelector('.rebuy-select').value;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
        .then(() => {
          console.log('Item added to cart from collection card'); // Debug
          document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
          document.querySelector('button.cart-icon-bubble, .cart-link, .header__icon--cart')?.click();
        })
        .catch(error => console.error('Error adding to cart from collection:', error)); // Debug
    });
  });

  // Initialize with retry for container
  const waitForContainer = (cb, timeout = 15000) => {
    const start = Date.now();
    const check = () => {
      const mainImage = document.querySelector('media-gallery .main-image');
      const wrap = mainImage || document.querySelector('.product__media-wrapper') || document.querySelector('.product-media-wrapper');
      if (wrap) {
        console.log('Container for icon found:', wrap); // Debug
        return cb();
      }
      if (Date.now() - start < timeout) {
        console.log('Retrying to find container for icon...'); // Debug
        requestAnimationFrame(check);
      } else {
        console.warn('Timeout: Could not find container for similar products icon');
      }
    };
    check();
  };

  waitFor('.rebuy-widget-content', () => {
    waitForContainer(injectSimilarIcon);
  });
})();


