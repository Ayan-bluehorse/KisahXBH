# Shopify Collection Product Card & Quick Buy Implementation Guide

This guide explains how the **Quick Buy** feature is implemented and called in the collection page (`sections/main-collection.liquid`), and provides the exact code to call the full product card with all functions (Quick Buy, variant swatches, ratings, hover images, badges) and zero extra CSS needed.

---

## 1. How Quick Buy is Called in the Collection Page

In `sections/main-collection.liquid` (lines 1158–1246), products are looped through inside the `#product-grid` container:

```liquid
<div id="product-grid" class="product-grid product-grid--per-row-{{ section.settings.grid }} product-grid--per-row-mob-{{ settings.prod_thumb_mob_per_row }}">
  {% for product in collection.products %}
    <div class="stock-sort-item" ...>
      {% render 'product-block',
        product: product,
        custom_aspect_ratio: chosen_aspect_ratio,
        animate: false,
        prioritised_loading: prioritised_loading,
        product_index: collection_product_index,
        products_total: collection_products_total
      %}
    </div>
  {% endfor %}
</div>
```

The collection page delegates the rendering of the product card and its Quick Buy markup to the snippet:
📁 `snippets/product-block.liquid`

---

## 2. How Quick Buy Works Under the Hood

### A. The HTML Architecture (`snippets/product-block.liquid`)
1. **Outer Custom Element**:
   ```html
   <product-block id="jump-id{{ product.handle }}" class="product-block ..." data-product-id="{{ product.id }}">
   ```
2. **Quick Buy Trigger Button**:
   Inside `.image-cont`:
   ```liquid
   {%- if settings.quickbuy_style == 'button' -%}
     {%- unless no_quick_buy -%}
       <a class="btn btn--secondary quickbuy-toggle" href="{{ product_url }}">
         <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#000000">
           <path d="M440.39-440.39H185.87v-79.22h254.52V-774.7h79.22v255.09H774.7v79.22H519.61v254.52h-79.22v-254.52Z"/>
         </svg>
       </a>
     {%- endunless -%}
   {%- endif -%}
   ```
   *(Or on the main card `<a>` tag if theme setting `quickbuy_style == 'whole'`)*.

3. **Quick Buy Container Drawer/Dropdown**:
   At the bottom of `snippets/product-block.liquid` (lines 428–435):
   ```liquid
   {%- if settings.quickbuy_style != 'off' -%}
     {%- unless no_quick_buy_markup or no_quick_buy -%}
       <div class="quickbuy-container use-color-scheme use-color-scheme--{{ settings.quickbuy_color_scheme }}">
         <a href="#" class="close-detail" aria-label="{{ 'accessibility.close' | t }}" tabindex="-1">
           {% render 'icon-close', stroke_width: 1 %}
         </a>
         <div class="inner"></div>
       </div>
     {%- endunless -%}
   {%- endif -%}
   ```

### B. JavaScript Handler (`assets/main.js`)
- `assets/main.js` contains a global event listener:
  ```javascript
  theme.addDelegateEventListener(document, 'click', '.quickbuy-toggle', (evt, delEl) => { ... })
  ```
- **Desktop (width >= 768px)**:
  1. Prevents standard link redirect (`evt.preventDefault()`).
  2. Finds the enclosing `.product-block` and `.quickbuy-container`.
  3. Adds the `.expanded` class to `.product-block`.
  4. Injects `<div class="loading-spinner"></div>` into `.quickbuy-container .inner`.
  5. Asynchronously fetches `fetch(productUrl)` (the product page).
  6. Parses the returned HTML, isolates the `.quickbuy-content` node (with variant pickers and Add-to-Cart form), and appends it directly into `.quickbuy-container .inner`.
- **Mobile (width < 768px)**:
  - By default, mobile directly follows the link to the product page.

### C. Theme Settings Dependency
Ensure that in **Theme Settings > Product Grid / Quick buy**:
- `quickbuy_style` is set to `'button'` or `'whole'` (NOT `'off'`).

---

## 3. How to Call the Exact Card (Zero Extra CSS)

To use this exact card in any custom section, carousel, or page without writing extra CSS, use the standard `render` call:

### Standard Call
```liquid
{% render 'product-block', product: product %}
```

### Full Call (Matching the Collection Page Exactly)
```liquid
{%- liquid
  # Match the collection page image aspect ratio (portrait-23 = 0.67, square = 1.0)
  assign chosen_aspect_ratio = 0.67
-%}

<div class="product-grid product-grid--per-row-4 product-grid--per-row-mob-2">
  {% for product in collection.products %}
    {% render 'product-block',
      product: product,
      custom_aspect_ratio: chosen_aspect_ratio,
      animate: false,
      prioritised_loading: false,
      grid: 4
    %}
  {% endfor %}
</div>
```

---

## 4. Parameter Reference for `snippets/product-block.liquid`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `product` | Object | **Required** | The Shopify product object |
| `custom_aspect_ratio` | Number | `0` | Aspect ratio of image: `0.67` (2:3), `0.8` (4:5), `1.0` (square) |
| `no_quick_buy` | Boolean | `false` | Set to `true` if you want to hide the quick buy button |
| `no_quick_buy_markup` | Boolean | `false` | Set to `true` to hide the container drawer |
| `compact` | Boolean | `false` | ⚠️ **Warning**: Setting `compact: true` disables quick buy! Keep `false` |
| `card_layout` | String | `'portrait'` | `'portrait'` or `'landscape'` |
| `prioritised_loading` | Boolean | `false` | Eager load first row images (`loading="eager"`) |
| `grid` | Number | `section.settings.grid` | Desktop column count (used for responsive image srcset sizing) |
| `hide_swatches` | Boolean | `false` | Set to `true` if color/size swatches should not display |
| `product_index` | Number | `nil` | Current index in loop (for position badge like `1/24`) |
| `products_total` | Number | `nil` | Total items in loop (for position badge) |

---

## 5. Complete Standalone Example for Any Custom Section

If you are creating a custom section (e.g. `sections/custom-product-slider.liquid` or `sections/navratri-product-carousel.liquid`), place this code:

```liquid
<div class="container">
  <div class="product-grid product-grid--per-row-4 product-grid--per-row-mob-2">
    {% for product in section.settings.collection.products limit: section.settings.products_to_show %}
      {% render 'product-block',
        product: product,
        custom_aspect_ratio: 0.67,
        grid: 4
      %}
    {% endfor %}
  </div>
</div>
```

Because `.product-grid`, `.product-block`, `.quickbuy-toggle`, and `.quickbuy-container` are all styled in `assets/main.css.liquid` and powered by `assets/main.js`, **no extra CSS or JS is required**.
