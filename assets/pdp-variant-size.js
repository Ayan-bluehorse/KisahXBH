(function () {
  if (window.__PDP_VARIANT_SIZE_INIT__) return;
  window.__PDP_VARIANT_SIZE_INIT__ = true;

  (function injectCSS() {
    const css = `
fieldset.option-selector label {
  border-radius: 20px !important;
  min-width: 60px !important;
}

.variant-size-chart {
  margin: 5px 0 !important;
}
`;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  })();

  const sizeMap = {
    "34": "XXS",
    "36": "XS",
    "38": "S",
    "40": "M",
    "42": "L",
    "44": "XL",
    "46": "XXL",
    "48": "3XL",
    "50": "4XL",
    "52": "5XL",
    "54": "6XL",
    "56": "7XL",
  };

  function enhanceSpan(el) {
    if (!el || el.dataset.sizeEnhanced === "1") return;
    const original = (el.textContent || "").trim();
    const mapped = sizeMap[original];
    if (mapped) {
      el.textContent = `${mapped} - ${original}`;
      el.dataset.sizeEnhanced = "1";
    }
  }

  function apply(root) {
    if (!root) return;
    root.querySelectorAll('fieldset.option-selector label span, .product-block__size-chip').forEach(enhanceSpan);
  }

  // Auto-select preferred size on PDP from localStorage (selected in collection popup)
  function selectPreferredSize() {
    // If a specific variant was requested via URL (?variant=...), do not override it
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('variant')) return;

    const preferredNum = (localStorage.getItem('preferredSizeNum') || '').trim().toLowerCase();
    const preferredLabel = (localStorage.getItem('preferredSizeLabel') || '').trim().toLowerCase();
    if (!preferredNum && !preferredLabel) return;

    const sizeFieldset = document.querySelector('.variant-picker fieldset.option-selector, fieldset.option-selector');
    if (!sizeFieldset) return;

    const radios = sizeFieldset.querySelectorAll('input[type="radio"]');
    for (const radio of radios) {
      const val = (radio.value || '').trim().toLowerCase();
      const label = sizeFieldset.querySelector(`label[for="${radio.id}"]`) || radio.closest('label');
      const labelText = (label?.textContent || '').trim().toLowerCase();

      const isMatch = (preferredLabel && (val === preferredLabel || labelText.includes(preferredLabel))) ||
                      (preferredNum && (val === preferredNum || labelText.includes(preferredNum)));

      if (isMatch && !radio.disabled && !radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        radio.dispatchEvent(new Event('input', { bubbles: true }));
        label?.click?.();
        break;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      apply(document);
      selectPreferredSize();
    });
  } else {
    apply(document);
    selectPreferredSize();
  }

  document.addEventListener('shopify:section:load', () => {
    apply(document);
    selectPreferredSize();
  });

  // Watch for dynamically rendered cards (carousels, tabs, ajax)
  let observerTimer = null;
  const observer = new MutationObserver(() => {
    if (observerTimer) return;
    observerTimer = setTimeout(() => {
      observerTimer = null;
      apply(document);
    }, 150);
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
