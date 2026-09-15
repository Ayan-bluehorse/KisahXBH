/**
 * Dependencies:
 * - Custom select component
 *
 * Required translation strings:
 * - addToCart
 * - noStock
 * - noVariant
 * - onlyXLeft
 */

window.cartIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" class="add-to-cart-bag" style="margin-left:15px">
                      <g clip-path="url(#clip0_99_80)">
                      <path d="M21 6H18C18 4.4087 17.3679 2.88258 16.2426 1.75736C15.1174 0.632141 13.5913 0 12 0C10.4087 0 8.88258 0.632141 7.75736 1.75736C6.63214 2.88258 6 4.4087 6 6H3C2.20435 6 1.44129 6.31607 0.87868 6.87868C0.31607 7.44129 0 8.20435 0 9L0 19C0.00158786 20.3256 0.528882 21.5964 1.46622 22.5338C2.40356 23.4711 3.67441 23.9984 5 24H19C20.3256 23.9984 21.5964 23.4711 22.5338 22.5338C23.4711 21.5964 23.9984 20.3256 24 19V9C24 8.20435 23.6839 7.44129 23.1213 6.87868C22.5587 6.31607 21.7956 6 21 6ZM12 2C13.0609 2 14.0783 2.42143 14.8284 3.17157C15.5786 3.92172 16 4.93913 16 6H8C8 4.93913 8.42143 3.92172 9.17157 3.17157C9.92172 2.42143 10.9391 2 12 2ZM22 19C22 19.7956 21.6839 20.5587 21.1213 21.1213C20.5587 21.6839 19.7956 22 19 22H5C4.20435 22 3.44129 21.6839 2.87868 21.1213C2.31607 20.5587 2 19.7956 2 19V9C2 8.73478 2.10536 8.48043 2.29289 8.29289C2.48043 8.10536 2.73478 8 3 8H6V10C6 10.2652 6.10536 10.5196 6.29289 10.7071C6.48043 10.8946 6.73478 11 7 11C7.26522 11 7.51957 10.8946 7.70711 10.7071C7.89464 10.5196 8 10.2652 8 10V8H16V10C16 10.2652 16.1054 10.5196 16.2929 10.7071C16.4804 10.8946 16.7348 11 17 11C17.2652 11 17.5196 10.8946 17.7071 10.7071C17.8946 10.5196 18 10.2652 18 10V8H21C21.2652 8 21.5196 8.10536 21.7071 8.29289C21.8946 8.48043 22 8.73478 22 9V19Z" fill="#ffffff"/>
                      </g>
                      <defs>
                      <clipPath id="clip0_99_80">
                      <rect width="24" height="24" fill="white"/>
                      </clipPath>
                      </defs>
                      </svg>`;

if (!customElements.get('variant-picker')) {
  class VariantPicker extends HTMLElement {
    constructor() {
      super();
      this.section = this.closest('.js-product');
      this.productForm = this.section.querySelector('.js-product-form');
      this.optionSelectors = this.querySelectorAll('.option-selector:not(.option-selector--custom)');
      this.nativeSelector = document.getElementById(`variants-${this.section.dataset.section}`);
      this.data = this.getVariantData();
      this.selectedOptions = this.getSelectedOptions();
      this.variant = this.getSelectedVariant();

      this.updateAvailability();
      this.updateAddToCartButton();
      this.addEventListener('change', this.handleVariantChange.bind(this));

      this.setAttribute('loaded', '');
    }

    /**
     * Handles 'change' events on the variant picker element.
     * @param {object} evt - Event object.
     */
    handleVariantChange(evt) {
      this.selectedOptions = this.getSelectedOptions();
      this.variant = this.getSelectedVariant();

      this.preSelection = !this.variant && this.selectedOptions.find((o) => o === null) === null;

      this.updateUrl(evt);
      this.updateVariantInput();
      this.updateAddToCartButton();
      this.updateAvailability();
      this.updatePrice();
      this.updateBackorderText();
      this.updatePickupAvailability();
      this.updateSku();
      this.updateBarcode();
      VariantPicker.updateLabelText(evt);

      this.dispatchEvent(new CustomEvent('on:variant:change', {
        bubbles: true,
        detail: {
          form: this.productForm,
          variant: this.variant,
          allVariants: this.data.variants,
          selectedOptions: this.selectedOptions
        }
      }));
    }

    /**
     * Updates the "Add to Cart" button label and status.
     */
    updateAddToCartButton() {
      if (!this.productForm) return;
      if (this.selectedOptions.indexOf(null) > -1) return;

      this.addBtn = this.addBtn || this.productForm.querySelector('[name="add"]');
      const variantAvailable = this.variant && this.variant.available;
      const unavailableStr = this.variant ? theme.strings.noStock : theme.strings.noVariant;

      this.addBtn.disabled = !variantAvailable;
      // this.addBtn.textContent = variantAvailable
      //   ? this.addBtn.dataset.addToCartText
      //   : unavailableStr;
      this.addBtn.innerHTML = variantAvailable
         ? this.addBtn.dataset.addToCartText + window.cartIcon
        : unavailableStr;
    
    }

    /**
     * Updates the availability status of an option.
     * @param {Element} optionEl - Option element.
     * @param {boolean} exists - Does this option lead to a variant that exists?
     * @param {boolean} available - Does this option lead to a variant that is available to buy?
     */
    static updateOptionAvailability(optionEl, exists, available) {
      const el = optionEl;
      const unavailableText = exists ? theme.strings.noStock : theme.strings.noVariant;
      el.classList.toggle('is-unavailable', !available);
      el.classList.toggle('is-nonexistent', !exists);

      if (optionEl.classList.contains('custom-select__option')) {
        const em = el.querySelector('em');

        if (em) {
          em.hidden = available;
        }

        if (!available) {
          if (em) {
            em.textContent = unavailableText;
          } else {
            el.innerHTML = `${el.innerHTML} <em class="pointer-events-none">${unavailableText}</em>`;
          }
        }
      } else if (!available) {
        el.nextElementSibling.title = unavailableText;
      } else {
        el.nextElementSibling.removeAttribute('title');
      }
    }

    /**
     * Updates the availability status in option selectors.
     */
    updateAvailability() {
      if (this.dataset.showAvailability === 'false') return;
      const { availabilityMode } = this.dataset; // 'down' or 'selection'
      let currVariant = this.variant;

      if (!this.variant) {
        currVariant = { options: this.selectedOptions };
      }

      if (availabilityMode === 'selection') {
        // Flag all options as unavailable
        this.querySelectorAll('.js-option').forEach((optionEl) => {
          VariantPicker.updateOptionAvailability(optionEl, false, false);
        });

        // Flag selector options as available or sold out, depending on the variant availability
        this.optionSelectors.forEach((selector, selectorIndex) => {
          this.data.variants.forEach((variant) => {
            let matchCount = 0;

            variant.options.forEach((option, optionIndex) => {
              if (option === currVariant.options[optionIndex] && optionIndex !== selectorIndex) {
                matchCount += 1;
              }
            });

            if (matchCount === currVariant.options.length - 1) {
              const options = selector.querySelectorAll('.js-option');
              const optionEl = Array.from(options).find((opt) => {
                if (selector.dataset.selectorType === 'dropdown') {
                  return opt.dataset.value === variant.options[selectorIndex];
                }
                return opt.value === variant.options[selectorIndex];
              });

              if (optionEl) {
                VariantPicker.updateOptionAvailability(optionEl, true, variant.available);
              }
            }
          });
        });
      } else {
        this.optionSelectors.forEach((selector, selectorIndex) => {
          const options = selector.querySelectorAll('.js-option:not([data-value=""])');
          options.forEach((option) => {
            const optionValue = selector.dataset.selectorType === 'dropdown' ? option.dataset.value : option.value;
            // any available variants with previous options and this one locked in?
            let variantsExist = false;
            let variantsAvailable = false;
            this.data.variants.forEach((v) => {
              let matches = 0;
              for (let i = 0; i < selectorIndex; i += 1) {
                if (v.options[i] === this.selectedOptions[i] || this.selectedOptions[i] === null) {
                  matches += 1;
                }
              }
              if (v.options[selectorIndex] === optionValue && matches === selectorIndex) {
                variantsExist = true;
                if (v.available) {
                  variantsAvailable = true;
                }
              }
            });
            VariantPicker.updateOptionAvailability(option, variantsExist, variantsAvailable);
          });
        });
      }
    }

    /**
     * Updates the backorder text and visibility.
     */
    updateBackorderText() {
      this.backorder = this.backorder || this.section.querySelector('.backorder');
      if (!this.backorder) return;

      let hideBackorder = true;

      if (this.variant && this.variant.available) {
        const { inventory } = this.data.formatted[this.variant.id];

        if (this.variant.inventory_management && inventory === 'none') {
          const backorderProdEl = this.backorder.querySelector('.backorder__product');
          const prodTitleEl = this.section.querySelector('.product-title');
          const variantTitle = this.variant.title.includes('Default') ? '' : ` - ${this.variant.title}`;

          backorderProdEl.textContent = `${prodTitleEl.textContent}${variantTitle}`;
          hideBackorder = false;
        }
      }

      this.backorder.hidden = hideBackorder;
    }

    /**
     * Updates the colour option label text.
     * @param {object} evt - Event object
     */
    static updateLabelText(evt) {
      const selector = evt.target.closest('.option-selector');
      if (selector.dataset.selectorType === 'dropdown') return;

      const colorText = selector.querySelector('.js-color-text');
      if (!colorText) return;

      colorText.textContent = evt.target.nextElementSibling.querySelector('.js-value').textContent;
    }

    /**
     * Updates the pick up availability.
     */
    updatePickupAvailability() {
      this.pickUpAvailability = this.pickUpAvailability || this.section.querySelector('pickup-availability');
      if (!this.pickUpAvailability) return;

      if (this.variant && this.variant.available) {
        this.pickUpAvailability.getAvailability(this.variant.id);
      } else {
        this.pickUpAvailability.removeAttribute('available');
        this.pickUpAvailability.innerHTML = '';
      }
    }

    /**
     * Updates the price.
     */
    updatePrice() {
      this.price = this.price || this.section.querySelector('.product-price .price');
      if (!this.price) return;

      let { variant } = this;
      if (this.preSelection) {
        variant = this.data.variants[0];
        for (let i = 1; i < this.data.variants.length; i += 1) {
          if (this.data.variants[i].price < variant.price) variant = this.data.variants[i];
        }
      }

      if (variant) {
        const priceCurrentEl = this.price.querySelector('.price__current');
        const priceWasEl = this.price.querySelector('.price__was');
        const unitPriceEl = this.price.querySelector('.unit-price');

        // Update current price and original price if on sale.
        priceCurrentEl.innerHTML = this.data.formatted[variant.id].price;
        if (priceWasEl) priceWasEl.innerHTML = this.data.formatted[variant.id].compareAtPrice || '';

        // Update unit price, if specified.
        if (variant.unit_price_measurement) {
          const valueEl = this.price.querySelector('.unit-price__price');
          const unitEl = this.price.querySelector('.unit-price__unit');
          const value = variant.unit_price_measurement.reference_value;
          const unit = variant.unit_price_measurement.reference_unit;

          valueEl.innerHTML = this.data.formatted[variant.id].unitPrice;
          unitEl.textContent = value === 1 ? unit : `${value} ${unit}`;
          unitPriceEl.hidden = false;
        } else if (unitPriceEl) {
          unitPriceEl.hidden = true;
        }

        this.price.classList.toggle('price--on-sale', variant.compare_at_price > variant.price);
        this.price.classList.toggle('price--sold-out', !variant.available && !this.preSelection);
      }

      this.price.querySelector('.price__default').hidden = !this.variant && !this.preSelection;
      this.price.querySelector('.price__no-variant').hidden = this.variant || this.preSelection;
      const from = this.price.querySelector('.price__from');
      if (from) {
        from.hidden = !this.preSelection;
      }
    }

    /**
     * Updates the SKU.
     */
    updateSku() {
      this.sku = this.sku || this.section.querySelector('.product-sku__value');
      if (!this.sku) return;

      const skuAvailable = this.variant && this.variant.sku;
      this.sku.textContent = skuAvailable ? this.variant.sku : '';
      this.sku.parentNode.hidden = !skuAvailable;
    }

    /**
     * Updates the Barcode.
     */
    updateBarcode() {
      this.barcode = this.barcode || this.section.querySelector('.product-barcode__value');
      if (!this.barcode) return;

      const barcodeAvailable = this.variant && this.variant.barcode;
      this.barcode.textContent = barcodeAvailable ? this.variant.barcode : '';
      this.barcode.parentNode.hidden = !barcodeAvailable;
    }

    /**
     * Updates the url with the selected variant id.
     * @param {object} evt - Event object.
     */
    updateUrl(evt) {
      if (!evt || evt.type !== 'change' || this.dataset.updateUrl === 'false') return;
      const url = this.variant ? `${this.dataset.url}?variant=${this.variant.id}` : this.dataset.url;
      window.history.replaceState({ }, '', url);
    }

    /**
     * Updates the value of the hidden [name="id"] form inputs.
     */
    updateVariantInput() {
      this.forms = this.forms || this.section.querySelectorAll('.js-product-form, .js-instalments-form');

      this.forms.forEach((form) => {
        const input = form.querySelector('[name="id"]');
        input.value = this.variant ? this.variant.id : '';
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    /**
     * Gets the variant data for a product.
     * @returns {?object}
     */
    getVariantData() {
      const dataEl = this.querySelector('[type="application/json"]');
      return JSON.parse(dataEl.textContent);
    }

    /**
     * Get the selected values from a list of variant options.
     * @returns {Array} Array of selected option values, value is null if not selected.
     */
    getSelectedOptions() {
      const selectedOptions = [];

      this.optionSelectors.forEach((selector) => {
        if (selector.dataset.selectorType === 'dropdown') {
          const selected = selector.querySelector('.custom-select__option[aria-selected="true"]');
          selectedOptions.push(selected && selected.dataset.value !== '' ? selected.dataset.value : null);
        } else {
          const selected = selector.querySelector('input:checked');
          selectedOptions.push(selected ? selected.value : null);
        }
      });

      return selectedOptions;
    }

    /**
     * Get selected variant data.
     * @returns {?object} Variant object, or null if one is not selected.
     */
    getSelectedVariant() {
      return this.data.variants.find(
        (v) => v.options.every((val, index) => val === this.selectedOptions[index])
      );
    }
  }

  customElements.define('variant-picker', VariantPicker);
}
