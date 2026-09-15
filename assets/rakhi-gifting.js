window.RakhiGifting = (function() {
  let boxCount = 0;
  let giftVariantId = null;

  document.addEventListener('click', (e) => {
    if (!document.getElementById('rakhi-gifting-app')) return;



    // 2. Intercept Tab Clicks for SPA navigation
    const tabLink = e.target.closest('.rakhi-tabs a');
    if (tabLink) {
      e.preventDefault();
      RakhiGifting.switchCollection(tabLink.href);
      return;
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const appEl = document.getElementById('rakhi-gifting-app');
    if (appEl) {
      giftVariantId = appEl.getAttribute('data-gift-variant-id');
    }
  });

  function formatMoney(cents) {
    return '₹' + (cents / 100).toLocaleString('en-IN');
  }

  return {
    switchCollection: function(url) {
      const currentParams = window.location.search;
      let targetUrl = url;
      if (currentParams) {
        const separator = targetUrl.includes('?') ? '&' : '?';
        targetUrl = targetUrl + separator + currentParams.substring(1);
      }

      const appEl = document.getElementById('rakhi-gifting-app');
      if (appEl) appEl.style.opacity = '0.5';

      fetch(targetUrl)
        .then(res => res.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          const newSection = doc.querySelector('.rakhi-gifting-app').closest('[data-section-id]');
          const currentSection = document.querySelector('.rakhi-gifting-app').closest('[data-section-id]');
          
          if(newSection && currentSection) {
            currentSection.innerHTML = newSection.innerHTML;
            window.history.pushState({}, '', targetUrl);
            
            // Re-fetch the giftVariantId just in case
            giftVariantId = document.getElementById('rakhi-gifting-app').getAttribute('data-gift-variant-id');
          }
          
          const newAppEl = document.getElementById('rakhi-gifting-app');
          if (newAppEl) newAppEl.style.opacity = '1';
        })
        .catch(err => {
          console.error('Error fetching collection', err);
          window.location.href = targetUrl; // Fallback to normal navigation
        });
    },

    openGiftModal: function() {
      boxCount = 0;
      this.updateGiftUI();
      document.getElementById('rakhi-gift-popup').style.display = 'block';
      document.getElementById('rakhi-modal').classList.add('on');
      
      if(window.RakhiAnalytics) window.RakhiAnalytics.trackGiftModalOpen();
    },

    closeModal: function() {
      document.getElementById('rakhi-modal').classList.remove('on');
    },

    changeBoxes: function(delta) {
      const oldQty = boxCount;
      boxCount = Math.max(0, boxCount + delta);
      this.updateGiftUI();

      if(window.RakhiAnalytics && oldQty !== boxCount) {
        window.RakhiAnalytics.trackGiftQuantityChanged(oldQty, boxCount);
      }
    },

    updateGiftUI: function() {
      document.getElementById('rakhi-boxCount').innerText = boxCount;
      const price = window.RakhiCollectionData.giftBoxPrice || 999;
      document.getElementById('rakhi-giftTotalPrice').innerText = formatMoney(boxCount * price * 100);
      document.getElementById('rakhi-minusBox').style.color = boxCount === 0 ? '#bbb' : '#111';
      document.getElementById('rakhi-continue-btn').disabled = boxCount === 0;
    },

    continueGift: function() {
      if (boxCount === 0) return;
      
      if(window.RakhiAnalytics) window.RakhiAnalytics.trackGiftContinue(boxCount, boxCount * (window.RakhiCollectionData.giftBoxPrice || 999));

      const btn = document.getElementById('rakhi-continue-btn');
      btn.innerText = 'ADDING...';

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: giftVariantId, quantity: boxCount }]
        })
      })
      .then(res => res.json())
      .then(() => {
        btn.innerText = 'CONTINUE';
        this.closeModal();
        // Fire custom event to trigger theme's cart update/drawer if exists
        document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
        
        // Scroll down to the products so user can shop
        const tabsSection = document.querySelector('.rakhi-tabs');
        if (tabsSection) {
          tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Update Shopify bag icon if possible
        this.fetchCartCount();
      })
      .catch(err => {
        console.error('Error adding gift boxes', err);
        btn.innerText = 'CONTINUE';
        this.closeModal();
      });
    },



    fetchCartCount: function() {
      fetch('/cart.js')
        .then(res => res.json())
        .then(cart => {
          const countEl = document.getElementById('rakhi-toastCount');
          if (countEl) countEl.innerText = `Bag total: ${cart.item_count} item(s)`;
        });
    }
  };
})();
