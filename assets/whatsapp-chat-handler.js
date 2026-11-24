/**
 * WhatsApp Chat Link Handler — Kisah
 * Dynamically customizes WhatsApp message queries with current page context (PDP, Collection, etc.),
 * product title, selected variant/size, exact page URL, and unique inquiry ID.
 */
(function () {
  'use strict';

  var PHONE = '918100993480';

  function getInquiryId() {
    try {
      var id = sessionStorage.getItem('kisah_wa_inquiry_id');
      if (!id) {
        id = '#' + Math.random().toString(36).substring(2, 8).toLowerCase();
        sessionStorage.setItem('kisah_wa_inquiry_id', id);
      }
      return id;
    } catch (e) {
      return '#' + Math.random().toString(36).substring(2, 8).toLowerCase();
    }
  }

  function getSelectedSize() {
    try {
      // 1. Radio option button
      var checked = document.querySelector('.option-selector__btns input[type="radio"]:checked, .variant-picker input[type="radio"]:checked, .js-option:checked');
      if (checked && checked.value) {
        return checked.value.trim();
      }
      // 2. Dropdown selector
      var select = document.querySelector('.option-selector select, .product-form select.js-option');
      if (select && select.value) {
        return select.value.trim();
      }
      // 3. Saved FYS size if available
      if (window.FYS && typeof window.FYS.getSavedSize === 'function') {
        var s = window.FYS.getSavedSize();
        if (s) return s;
      }
    } catch (e) {}
    return '';
  }

  function buildWhatsAppUrl() {
    var inquiryId = getInquiryId();
    var isProductPage = window.location.pathname.indexOf('/products/') !== -1 ||
                        !!document.querySelector('meta[property="og:type"][content="product"]');
    var isCollectionPage = window.location.pathname.indexOf('/collections/') !== -1;

    var currentUrl = window.location.href;
    var msg = '';

    if (isProductPage) {
      var titleEl = document.querySelector('.product-title, h1.product-title, .product__title, h1');
      var title = titleEl ? titleEl.textContent.trim() : document.title.split('|')[0].trim();
      var selectedSize = getSelectedSize();

      // Ensure variant ID is reflected in URL if selected
      var variantInput = document.querySelector('select[name="id"], input[name="id"]');
      var variantId = variantInput ? variantInput.value : '';
      if (variantId && currentUrl.indexOf('variant=') === -1) {
        var sep = currentUrl.indexOf('?') !== -1 ? '&' : '?';
        currentUrl = currentUrl + sep + 'variant=' + variantId;
      }

      msg = 'Hello ! I was browsing through your website and wanted to know more about this product:\n' +
            title + (selectedSize ? ' (Size: ' + selectedSize + ')' : '') + '\n' +
            currentUrl + '\n' +
            'Inquiry id : ' + inquiryId;
    } else if (isCollectionPage) {
      var colTitleEl = document.querySelector('.collection-title, h1.collection-title, h1');
      var colTitle = colTitleEl ? colTitleEl.textContent.trim() : '';

      msg = 'Hello ! I was browsing through your website and wanted to know more about ' + (colTitle ? colTitle : 'your products') + ':\n' +
            currentUrl + '\n' +
            'Inquiry id : ' + inquiryId;
    } else {
      msg = 'Hello ! I was browsing through your website and wanted to know more about your products\n' +
            currentUrl + '\n' +
            'Inquiry id : ' + inquiryId;
    }

    return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg);
  }

  function updateLinks() {
    var url = buildWhatsAppUrl();

    // 1. Floating WhatsApp icon
    var floatingLink = document.querySelector('#sy-whatshelp a');
    if (floatingLink) {
      floatingLink.href = url;
    }

    // 2. Footer WhatsApp links
    var footerLinks = document.querySelectorAll('.whats-app-only, .whats-img-para a');
    footerLinks.forEach(function (el) {
      el.href = url;
    });

    // 3. PDP help chat links
    var pdpHelpLinks = document.querySelectorAll('.kpdp-help-chat__link');
    pdpHelpLinks.forEach(function (el) {
      el.href = url;
    });
  }

  function handleInteraction(e) {
    var link = e.target && e.target.closest && e.target.closest('#sy-whatshelp a, a.sywh-open-services, .whats-app-only, .whats-img-para a, .kpdp-help-chat__link');
    if (link) {
      link.href = buildWhatsAppUrl();
    }
  }

  // Intercept click / pointerdown to always capture latest URL & selected size at click moment
  document.addEventListener('pointerdown', handleInteraction, true);
  document.addEventListener('click', handleInteraction, true);

  // Update on DOM ready and after variant changes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLinks);
  } else {
    updateLinks();
  }

  document.addEventListener('change', function (e) {
    if (e.target && e.target.matches && e.target.matches('.option-selector__btns input[type="radio"], select.js-option, select[name="id"]')) {
      setTimeout(updateLinks, 50);
    }
  });

  window.addEventListener('popstate', updateLinks);
  document.addEventListener('shopify:section:load', updateLinks);
})();
