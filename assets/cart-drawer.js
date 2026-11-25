/* global SideDrawer */

class CartDrawer extends SideDrawer {
  connectedCallback() {
    this.bindEvents();
  }

  bindEvents() {
    this.openDrawerViaEventHandler = this.handleDrawerOpenViaEvent.bind(this);
    this.closeDrawerViaEventHandler = this.close.bind(this, null);
    this.cartRefreshHandler = this.cartRefreshHandler.bind(this);
    this.handleQuantityClick = this.handleQuantityClick.bind(this);
    this.handleVariantChange = this.handleVariantChange.bind(this);
    this.handleQuantityInputChange = this.handleQuantityInputChange.bind(this);
    this.handleSizeGuideClick = this.handleSizeGuideClick.bind(this);
    this.addEventListener('click', this.handleQuantityClick, true);
    this.addEventListener('change', this.handleVariantChange, true);
    this.addEventListener('change', this.handleQuantityInputChange, true);
    document.addEventListener('dispatch:cart-drawer:open', this.openDrawerViaEventHandler);
    document.addEventListener('dispatch:cart-drawer:close', this.closeDrawerViaEventHandler);
    document.addEventListener('dispatch:cart-drawer:refresh', this.cartRefreshHandler);
    document.addEventListener('cart:updated', this.cartRefreshHandler);
    document.addEventListener('click', this.handleSizeGuideClick, true);
    this.addEventListener('on:cart-drawer:before-open', () => {
      theme.manuallyLoadImages(this);
      this.querySelectorAll('cc-cart-cross-sell').forEach((el) => el.init());
    });
    this.addEventListener('on:cart:after-merge', () => {
      theme.manuallyLoadImages(this);
      this.querySelectorAll('cc-cart-cross-sell').forEach((el) => el.init());
    });
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleQuantityClick, true);
    this.removeEventListener('change', this.handleVariantChange, true);
    this.removeEventListener('change', this.handleQuantityInputChange, true);
    document.removeEventListener('dispatch:cart-drawer:refresh', this.cartRefreshHandler);
    document.removeEventListener('cart:updated', this.cartRefreshHandler);
    document.removeEventListener('click', this.handleSizeGuideClick, true);
    document.removeEventListener('dispatch:cart-drawer:open', this.openDrawerViaEventHandler);
    document.removeEventListener('dispatch:cart-drawer:close', this.closeDrawerViaEventHandler);
  }

  handleSizeGuideClick(evt) {
    const trigger = evt.target.closest('[data-size-guide-target]');
    const closeButton = evt.target.closest('.cart-item-size-guide .js-close-drawer');
    const overlay = evt.target.closest('[data-size-guide-overlay]');

    if (trigger) {
      evt.preventDefault();
      evt.stopPropagation();
      const targetId = trigger.dataset.sizeGuideTarget;
      const guide = document.getElementById(targetId);
      if (!guide) return;
      const overlay = document.querySelector(`[data-size-guide-overlay="${CSS.escape(targetId)}"]`);

      // Move the popup to document.body so the cart drawer's overflow and
      // transform cannot clip it when the cart is opened on a PDP.
      if (guide.parentElement !== document.body) document.body.appendChild(guide);
      if (overlay && overlay.parentElement !== document.body) document.body.appendChild(overlay);

      this.querySelectorAll('.cart-item-size-guide.open').forEach((openGuide) => {
        openGuide.classList.remove('open');
        openGuide.setAttribute('aria-hidden', 'true');
      });
      this.querySelectorAll('[data-size-guide-overlay].is-visible').forEach((openOverlay) => {
        openOverlay.classList.remove('is-visible');
      });

      guide.classList.add('open');
      guide.setAttribute('aria-hidden', 'false');
      document.querySelector(`[data-size-guide-overlay="${CSS.escape(targetId)}"]`)?.classList.add('is-visible');
      return;
    }

    if (closeButton || overlay) {
      evt.preventDefault();
      evt.stopPropagation();
      const guide = closeButton?.closest('.cart-item-size-guide') || this.querySelector(`#${CSS.escape(overlay.dataset.sizeGuideOverlay)}`);
      if (guide) {
        guide.classList.remove('open');
        guide.setAttribute('aria-hidden', 'true');
        guide.parentElement?.querySelector(`[data-size-guide-overlay="${CSS.escape(guide.id)}"]`)?.classList.remove('is-visible');
        document.querySelector(`[data-size-guide-overlay="${CSS.escape(guide.id)}"]`)?.classList.remove('is-visible');
      }
    }
  }

  trackCartEvent(eventName, params) {
    try {
      const payload = Object.assign({
        event: eventName,
        event_category: 'cart_engagement'
      }, params || {});
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
    } catch (e) {
      console.warn('[GA4 Cart Event Error]', e);
    }
  }

  handleQuantityClick(evt) {
    const control = evt.target.closest('.quantity-down, .quantity-up, .cart-item__remove');
    if (!control) return;

    const item = control.closest('.cart-item');
    const cartForm = control.closest('cart-form');
    if (!item || !cartForm || item.hasAttribute('aria-busy') || typeof cartForm.adjustItemQuantity !== 'function') return;

    evt.preventDefault();
    evt.stopPropagation();

    const itemTitle = item.querySelector('.cart-item__title')?.textContent.trim() || '';
    const qtyInput = item.querySelector('.cart-item__quantity-input');
    const currentQty = qtyInput ? parseInt(qtyInput.value, 10) : 1;

    if (control.classList.contains('quantity-down')) {
      this.trackCartEvent('cart_quantity_change', {
        action: 'decrease',
        item_title: itemTitle,
        previous_quantity: currentQty,
        new_quantity: Math.max(0, currentQty - 1)
      });
      cartForm.adjustItemQuantity(item, { decrease: true });
    } else if (control.classList.contains('quantity-up')) {
      this.trackCartEvent('cart_quantity_change', {
        action: 'increase',
        item_title: itemTitle,
        previous_quantity: currentQty,
        new_quantity: currentQty + 1
      });
      cartForm.adjustItemQuantity(item, { increase: true });
    } else {
      this.trackCartEvent('remove_from_cart', {
        item_title: itemTitle,
        quantity: currentQty
      });
      cartForm.adjustItemQuantity(item, { to: 0 });
    }
  }

  handleQuantityInputChange(evt) {
    if (!evt.target.matches('.cart-item__quantity-input')) return;

    const cartForm = evt.target.closest('cart-form');
    const item = evt.target.closest('.cart-item');
    if (!cartForm || !item || item.hasAttribute('aria-busy') || typeof cartForm.adjustItemQuantity !== 'function') return;

    evt.stopPropagation();
    cartForm.adjustItemQuantity(item, { currentValue: true });
  }

  async handleVariantChange(evt) {
    const select = evt.target.closest('.cart-item__variant-select');
    if (!select || select.disabled) return;

    const item = select.closest('.cart-item');
    const cartForm = select.closest('cart-form');
    const quantityInput = item?.querySelector('.cart-item__quantity-input');
    if (!item || !cartForm || !quantityInput || item.hasAttribute('aria-busy')) return;

    evt.stopPropagation();
    const selectedVariantId = select.value;
    if (!selectedVariantId) return;

    item.setAttribute('aria-busy', 'true');
    item.classList.add('cart-item--variant-changing');
    item.querySelectorAll('button, input, select, a').forEach((control) => { control.disabled = true; });

    try {
      const quantity = parseInt(quantityInput.value, 10) || 1;
      const addResponse = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedVariantId, quantity })
      });
      if (!addResponse.ok) throw new Error('Unable to add the selected variant');

      const removeResponse = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quantityInput.dataset.key, quantity: 0 })
      });
      if (!removeResponse.ok) throw new Error('Unable to remove the previous variant');

      document.dispatchEvent(new CustomEvent('on:cart:change', { bubbles: true }));
    } catch (error) {
      select.value = select.querySelector('option[selected]')?.value || '';
      cartForm.dispatchEvent(new CustomEvent('on:cart:error', {
        bubbles: true,
        detail: { error: error.message }
      }));
    } finally {
      if (item.isConnected) {
        item.querySelectorAll('button, input, select, a').forEach((control) => { control.disabled = false; });
        item.classList.remove('cart-item--variant-changing');
        item.removeAttribute('aria-busy');
      }
    }
  }

  /**
   * Handle when the drawer is opened via an event
   * @param {object} evt - Event object.
   */
  handleDrawerOpenViaEvent(evt) {
    this.open(evt.detail ? evt.detail.opener : null);
  }

  /**
   * Trigger refresh of contents
   */
  cartRefreshHandler() {
    const cartForm = this.querySelector('cart-form');
    if (cartForm && !cartForm.classList.contains('cart-form--refreshing')) {
      cartForm.refresh();
    }
  }

  /**
   * Update section's cart-form element with new contents
   * @param {string} html - Whole-section HTML.
   */
  updateFromCartChange(html) {
    this.querySelector('cart-form').refreshFromHtml(html);
  }
}

window.customElements.define('cart-drawer', CartDrawer);
