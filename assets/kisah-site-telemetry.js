/**
 * Kisah Global Site Telemetry
 * Captures core user interactions (navigation, PDP controls, cart additions, search actions, and social clicks)
 * and streams them directly into GA4 (gtag) and Google Tag Manager (dataLayer).
 */
(function () {
  'use strict';

  function trackEvent(eventName, params) {
    try {
      var payload = Object.assign({
        event: eventName,
        timestamp: Date.now()
      }, params || {});

      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
    } catch (err) {
      console.warn('[GA4 Telemetry Error]', err);
    }
  }

  document.addEventListener('click', function (e) {
    var target = e.target;
    if (!target) return;

    // 1. Add to Cart Main Button
    var atcBtn = target.closest('button[name="add"], .product-form__add-button, .js-ajax-add-to-cart');
    if (atcBtn) {
      var form = atcBtn.closest('form');
      var titleEl = document.querySelector('h1.product-title, .product__title, h1');
      trackEvent('add_to_cart', {
        event_category: 'ecommerce',
        product_title: titleEl ? titleEl.textContent.trim() : document.title.split('|')[0].trim(),
        page_url: window.location.href
      });
      return;
    }

    // 2. Buy Now Direct Checkout Button
    var buyNowBtn = target.closest('.shopify-payment-button__button, [data-testid="Checkout-button"]');
    if (buyNowBtn) {
      trackEvent('buy_now_click', {
        event_category: 'ecommerce',
        page_url: window.location.href
      });
      return;
    }

    // 3. Product Card Click (Catalog Navigation)
    var productCardLink = target.closest('.product-block a:not(.CP-quick-view-btn):not(.wishlist-hero-custom-button), .product-card a');
    if (productCardLink && productCardLink.getAttribute('href') && productCardLink.getAttribute('href').indexOf('/products/') !== -1) {
      var cardBlock = productCardLink.closest('.product-block, .product-card');
      var cardTitle = cardBlock ? (cardBlock.querySelector('.product-block__title, .title')?.textContent || '').trim() : '';
      trackEvent('select_item', {
        event_category: 'catalog_discovery',
        item_name: cardTitle,
        item_url: productCardLink.href
      });
      return;
    }

    // 4. Accordion Expand (Details, Care, Returns)
    var accordionHeader = target.closest('.disclosure__title, summary.disclosure__title, .product-accordion summary');
    if (accordionHeader) {
      var titleText = accordionHeader.textContent.trim();
      trackEvent('product_tab_expand', {
        event_category: 'pdp_engagement',
        tab_name: titleText
      });
      return;
    }

    // 5. Mobile Menu Toggle
    var menuToggle = target.closest('.nav-mobile-toggle, #kisahHamburgerBtn, .site-header__menu-toggle, .mobile-nav-toggle');
    if (menuToggle) {
      trackEvent('mobile_menu_toggle', {
        event_category: 'navigation'
      });
      return;
    }

    // 6. Mega Menu / Header Nav Click
    var navLink = target.closest('.header-mega-menu a, .navigation__item a, .mega-menu a');
    if (navLink) {
      trackEvent('navigation_click', {
        event_category: 'navigation',
        menu_title: navLink.textContent.trim(),
        destination_url: navLink.href
      });
      return;
    }

    // 7. Social Profile Links
    var socialLink = target.closest('a[href*="instagram.com"], a[href*="facebook.com"], a[href*="youtube.com"], a[href*="pinterest.com"]');
    if (socialLink) {
      var platform = 'social_media';
      if (socialLink.href.indexOf('instagram') !== -1) platform = 'instagram';
      else if (socialLink.href.indexOf('facebook') !== -1) platform = 'facebook';
      else if (socialLink.href.indexOf('youtube') !== -1) platform = 'youtube';
      trackEvent('social_profile_click', {
        event_category: 'social',
        platform: platform,
        destination_url: socialLink.href
      });
      return;
    }

    // 8. Newsletter Email Subscribe CTA
    var newsBtn = target.closest('.newsletter-form button, .footer__newsletter button, form[action*="contact#contact_form"] button');
    if (newsBtn) {
      trackEvent('newsletter_signup', {
        event_category: 'engagement'
      });
      return;
    }

    // 9. Account / Login Icon
    var accountLink = target.closest('a[href*="/account"]');
    if (accountLink) {
      trackEvent('account_link_click', {
        event_category: 'navigation',
        destination_url: accountLink.href
      });
      return;
    }

    // 10. Track Order Link
    var trackLink = target.closest('a[href*="track"], a[href*="order"]');
    if (trackLink && trackLink.closest('header, footer')) {
      trackEvent('track_order_click', {
        event_category: 'navigation',
        destination_url: trackLink.href
      });
      return;
    }

    // 11. Announcement Bar Click
    var announceLink = target.closest('.announcement-bar a, .announcement a');
    if (announceLink) {
      trackEvent('announcement_bar_click', {
        event_category: 'promotion',
        text: announceLink.textContent.trim()
      });
      return;
    }

    // 12. Grid View Layout Switcher
    var gridBtn = target.closest('.view-mode button, .grid-view-btn, .layout-switch button');
    if (gridBtn) {
      trackEvent('grid_layout_change', {
        event_category: 'catalog_discovery'
      });
      return;
    }

    // 13. Pagination / Load More Click
    var pageLink = target.closest('.pagination a, a[href*="page="]');
    if (pageLink && pageLink.closest('.pagination, .load-more')) {
      trackEvent('load_more_products', {
        event_category: 'catalog_discovery',
        destination_url: pageLink.href
      });
      return;
    }

    // 14. Image Gallery Thumbnails
    var thumb = target.closest('.thumbnails a, .product-media-thumbnail, .carousel-slider__bullet');
    if (thumb) {
      trackEvent('gallery_image_view', {
        event_category: 'pdp_engagement'
      });
      return;
    }

    // 15. Image Zoom / Lightbox
    var zoomBtn = target.closest('.product-media-zoom, .zoom-icon, .product-zoom');
    if (zoomBtn) {
      trackEvent('image_zoom_click', {
        event_category: 'pdp_engagement'
      });
      return;
    }

    // 16. Search Clear Button
    var clearSearchBtn = target.closest('.predictive-search__clear-button, button.search-clear');
    if (clearSearchBtn) {
      trackEvent('search_clear', {
        event_category: 'search'
      });
      return;
    }

    // 17. Search Drawer Close
    var searchCloseBtn = target.closest('.search-drawer__close, .search-modal__close');
    if (searchCloseBtn) {
      trackEvent('search_close', {
        event_category: 'search'
      });
      return;
    }

    // 18. Cart Note / Gift Wrap Addon
    var cartAddon = target.closest('.cart-drawer__note-toggle, .gift-wrap-toggle, input[name="attributes[gift_wrap]"]');
    if (cartAddon) {
      trackEvent('cart_addon_toggle', {
        event_category: 'cart_engagement'
      });
      return;
    }
  }, true);
})();
