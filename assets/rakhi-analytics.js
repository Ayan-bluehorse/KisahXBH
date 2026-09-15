window.RakhiAnalytics = (function() {
  window.dataLayer = window.dataLayer || [];

  function pushEvent(eventName, payload) {
    const data = {
      event: eventName,
      timestamp: new Date().toISOString(),
      device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
      ...payload
    };
    window.dataLayer.push(data);
    console.log(`[Rakhi Analytics] ${eventName}`, data);
  }

  return {
    trackCategorySwitch: function(category) {
      pushEvent('collection_tab_clicked', {
        category: category
      });
    },

    trackGiftModalOpen: function() {
      pushEvent('gift_box_popup_view', {
        current_box_qty: document.getElementById('rakhi-boxCount') ? parseInt(document.getElementById('rakhi-boxCount').innerText, 10) : 0
      });
    },

    trackGiftQuantityChanged: function(oldQty, newQty) {
      pushEvent('gift_box_quantity_changed', {
        old_qty: oldQty,
        new_qty: newQty,
        delta: newQty - oldQty
      });
    },

    trackGiftContinue: function(boxQty, boxValue) {
      pushEvent('gift_box_continue_clicked', {
        box_qty: boxQty,
        box_value: boxValue
      });
    },

    trackProductPopupView: function(product) {
      pushEvent('product_popup_view', {
        product_id: product.id,
        SKU: product.variants.length > 0 ? product.variants[0].sku : '',
        category: document.querySelector('.rakhi-tabs .active').innerText.toLowerCase(),
        price: product.price / 100
      });
    },

    trackProductAddToBag: function(productId, variantId, size, price) {
      pushEvent('product_add_to_bag', {
        product_id: productId,
        variant_id: variantId,
        size: size,
        unit_price: price / 100
      });
    }
  };
})();
