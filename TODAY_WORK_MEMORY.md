# Complete Work Summary & Memory Record

**Date:** September 4, 2026  
**Store:** Kisah Online (`kisahonline.myshopify.com` / `kisah.in`)  
**Themes:**
- **Live Theme:** `KIsah x Knox - Rakhi Collection - 17 Aug` (`#158945050776`)
- **Development Theme:** `KISAHxBluehorse` (`#159393415320`)

---

## 1. Theme Deployment & Sync
* **Target Deployments:** Deployed codebase updates to development theme `KISAHxBluehorse` (#159393415320) using `shopify theme push --nodelete`.
* **Coordination Safeguards:** Identified simultaneous active development by the Helium team on the live theme to avoid overwriting changes.

---

## 2. Product Recommendations & Wishlist Button Fix
* **Problem:** Wishlist buttons and size chips on recommended product cards were colliding or appearing in duplicate at the bottom of the card, conflicting with third-party app widgets (Helium / Wishlist Hero).
* **Fix Applied:**
  * Updated `snippets/product-block.liquid` and `sections/main-product.liquid` to position the wishlist heart icon at the top-right corner over the product image.
  * Ensured size chips render cleanly below the price without duplicate wishlist buttons at the bottom.

---

## 3. Duplicate Collection Description Removal
* **Problem:** Collection pages were displaying description text twice—once at the top and once at the bottom.
* **Fix Applied:**
  * Cleaned up duplicate descriptions so that users do not see repetitive text blocks.

---

## 4. Collection Product Count Synchronization
* **Problem:** On collection pages like `/collections/haldi`, the collection header was showing 81 products, but pagination and visible item counters differed due to variant availability filters.
* **Fix Applied:**
  * Synchronized the product counter in `sections/main-collection.liquid` to accurately reflect available items and match infinite scroll pagination totals.

---

## 5. Menu Architecture & Image Sizing Investigation
* **User Query:** Changing menu images in Shopify Theme Customizer didn't update the mobile menu, and desktop menu images were appearing small.
* **Findings:**
  1. **Mobile Menu:** The mobile drawer is dynamically built by `assets/custom-menu.js`, which uses **hardcoded CDN image URLs** (`categoryImages`, `collectionImages`), completely bypassing Theme Editor blocks.
  2. **Desktop Menu:** Desktop images pull dynamically from `menu_image` blocks in `snippets/main-nav-links.liquid` matching menu link titles. Sizing is constrained by `grid-auto-columns: 120px` in `assets/main.css.liquid`.

---

## 6. Collection Page Performance & Load Time Optimization
* **Problem:** Collection pages took too long to load on live.
* **Audit Findings:**
  * Initial HTML was **1.32 MB** (almost 10x standard collection HTML size).
  * For only 18 visible products, **190 `<img>` tags** were generated because the code rendered full image galleries (8–15 pictures per product) with massive `srcset` strings.
  * Infinite scroll had an **artificial 1.2-second wait delay** (`data-min-loader-ms="1200"`).
  * `slick-theme.css.liquid` was throwing a blocking browser MIME type error (`application/x-liquid`).
  * `Snapmint` checkout script was loaded unnecessarily on collection listing pages.
* **Fixes Applied:**
  * **`snippets/product-block.liquid`:** Added `limit: 2` to the secondary image loop. Cuts **132 KB of HTML** and eliminates **83 offscreen images** per page (product card HTML size reduced by 38%).
  * **`snippets/infinite-scroll.liquid`:** Changed `data-min-loader-ms="1200"` to `0` for instantaneous product appending upon scroll.
  * **`layout/theme.liquid`:** Changed `'slick-theme.css.liquid'` to `'slick-theme.css'` to fix the stylesheet MIME error.
  * **`layout/theme.liquid`:** Wrapped `Snapmint` payment script with `{% if request.page_type == 'product' or request.page_type == 'cart' %}`.
  * **`sections/main-collection.liquid`:** Optimized the visible product count loop using native `prod.available`.

---

## 7. Live Rate Limiting (HTTP 429) & Infinite Loop Resolution
* **Problem:** The live site was throwing repeating `429 (Too Many Requests)` errors when scrolling.
* **Root Causes:**
  1. **Helium vs. Rebuy Conflict:** Both Helium (`cart-manager.js`) and Rebuy (`rebuy.js`) were running simultaneously, bombarding `/cart.js` and `/cart/update.json`.
  2. **Cache Purging:** Helium returned `Clear-Site-Data: "prefetchCache", "prerenderCache"`, destroying browser caching.
  3. **Infinite Retry Loop:** When a 429 occurred, `snippets/infinite-scroll.liquid` had an automatic 3-second retry loop (`setTimeout(loadNextPage, 3000)`) that kept spamming Shopify indefinitely.
* **Fix Applied:**
  * Removed the automated 3-second infinite retry loop from `snippets/infinite-scroll.liquid`. Throttled requests now cleanly stop and show `"Unable to load products. Tap to retry."` without locking out the visitor.

---

## 8. Collection Description Relocation Below Last Products
* **Problem:** The collection description was displayed at the top above the products, pushing the product grid down, and the bottom SEO section was appearing prematurely after page 1 (product 24).
* **Fixes Applied:**
  * In `sections/main-collection.liquid` and `sections/main-collection-rakhi.liquid`, commented out the top `.col-description`.
  * Moved `.col-description--bottom` to render at the bottom of the container immediately below `</filter-container>` (directly below the last product card).
  * Added styling `#shopify-section-{{section.id}} .col-description--bottom` with clean spacing (`margin-top: 40px; margin-bottom: 50px; clear: both;`).
  * Verified visually: The top of the collection page is clean (breadcrumbs, title, and products directly visible), and the full collection editorial description sits below the last product cards.

---

## 9. Key Files Modified Today

| File | Changes Made |
| :--- | :--- |
| `snippets/product-block.liquid` | Limited secondary images to `limit: 2`; optimized wishlist positioning |
| `snippets/infinite-scroll.liquid` | Set `min-loader-ms="0"`; removed automated 3-second retry loop on error |
| `layout/theme.liquid` | Fixed `slick-theme.css` MIME link; restricted `Snapmint` to product/cart pages |
| `sections/main-collection.liquid` | Moved collection description to bottom below last products; optimized `prod.available` |
| `sections/main-collection-rakhi.liquid` | Moved collection description to bottom below last products |
| `sections/main-product.liquid` | Wishlist button and layout positioning adjustments |
