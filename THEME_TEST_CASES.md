# Shopify Theme Comprehensive Test Plan & Test Cases — Kisha Theme

**Date:** August 24, 2026  
**Target Environment:** Shopify Theme Development / Staging Store (`shopify theme dev`)  
**Scope:** Core User Journeys, Theme Customizer, Snippet Integrations, Custom Sections, and Edge Cases.

---

## 📋 Table of Contents

1. [Test Suite 1: Shopify Theme Customizer & Admin Validation](#test-suite-1-shopify-theme-customizer--admin-validation)
2. [Test Suite 2: Product Detail Page (PDP) & Sizing Systems](#test-suite-2-product-detail-page-pdp--sizing-systems)
3. [Test Suite 3: Cart Drawer, Cart Chiplet & Checkout Flows](#test-suite-3-cart-drawer-cart-chiplet--checkout-flows)
4. [Test Suite 4: Collection Pages & "Shop The Edit" Filtering](#test-suite-4-collection-pages--shop-the-edit-filtering)
5. [Test Suite 5: Customer Account & Address Management](#test-suite-5-customer-account--address-management)
6. [Test Suite 6: Custom Pages & Section Functionality](#test-suite-6-custom-pages--section-functionality)
7. [Test Suite 7: Multilingual & Social Sharing](#test-suite-7-multilingual--social-sharing)
8. [Test Suite 8: Mobile Responsiveness & Core Web Vitals](#test-suite-8-mobile-responsiveness--core-web-vitals)

---

## Test Suite 1: Shopify Theme Customizer & Admin Validation

| Test ID       | Test Scenario                        | Steps to Execute                                                                                                                                                                | Expected Result                                                                           | Pass / Fail |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------- |
| **TC-ADM-01** | Section Schema Parsing               | Open Shopify Admin → Online Store → Themes → Customize. Add/inspect all 15 modified sections (`about-banner`, `about-founders`, `cart-drawer`, `main-product`, `footer`, etc.). | The Theme Editor loads smoothly without "Invalid JSON schema" or white-screen errors.     | [ ]         |
| **TC-ADM-02** | Section Settings Modification & Save | Change banner images, heading texts, block order, and click **Save**.                                                                                                           | All schema blocks update in real-time in the preview window and persist upon page reload. | [ ]         |
| **TC-ADM-03** | Block Limit & Reordering             | Add maximum blocks (e.g. in `ceremony-carousel`, `featured-items`), drag to reorder.                                                                                            | Blocks reorder seamlessly; UI updates without layout breaks.                              | [ ]         |

---

## Test Suite 2: Product Detail Page (PDP) & Sizing Systems

| Test ID       | Test Scenario                     | Steps to Execute                                                                             | Expected Result                                                                                                           | Pass / Fail |
| ------------- | --------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **TC-PDP-01** | Variant & Option Selection        | Navigate to a product with multiple sizes & colors (e.g. Kurta Set). Click variant swatches. | Price, SKU, availability status, and featured image update instantly without page refresh.                                | [ ]         |
| **TC-PDP-02** | "Find Your Size" Widget Rendering | Open a standard apparel product (non-kids, non-gift).                                        | The Find Your Size banner renders properly below variant options; kids & gift boxes exclude the widget.                   | [ ]         |
| **TC-PDP-03** | Find Your Size Form Submission    | Complete height/weight inputs and click "Get Recommended Size" / WhatsApp CTA.               | Google Sheets webhook receives entry without CORS errors; WhatsApp message opens with correct product pre-fill.           | [ ]         |
| **TC-PDP-04** | Size Chart Modal                  | Click on the size chart link for different categories (Kurta, Kurta Set, Indowestern).       | Correct category size chart image loads with clean HTML markup (no stray `{{ tag }}` attributes in DOM).                  | [ ]         |
| **TC-PDP-05** | Out-of-Stock Variants             | Select an out-of-stock variant.                                                              | "Add to Cart" button turns disabled / displays "Sold Out"; back-in-stock notification or waitlist triggers if configured. | [ ]         |

---

## Test Suite 3: Cart Drawer, Cart Chiplet & Checkout Flows

| Test ID       | Test Scenario                           | Steps to Execute                                                                                              | Expected Result                                                                                                           | Pass / Fail |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **TC-CRT-01** | Add to Cart & Drawer Trigger            | Click "Add to Cart" from PDP or quick-add on collection grid.                                                 | Cart drawer slides open smoothly; newly added item is displayed with correct variant, price, and thumbnail.               | [ ]         |
| **TC-CRT-02** | Quantity Increment / Decrement & Remove | Adjust line item quantity (+ / -) or click remove.                                                            | Cart totals and quantities update asynchronously without full page reload; empty cart state triggers when 0 items remain. | [ ]         |
| **TC-CRT-03** | Cart Chiplet Persistence & Dismissal    | Close the cart drawer with items in cart. Verify bottom floating chiplet appears. Click close '×' on chiplet. | Chiplet closes and sets `cp_cartchiplet_closed_24h` cookie so it does not reappear repeatedly for 24 hours.               | [ ]         |
| **TC-CRT-04** | Cart Chiplet Reopen                     | Click on the chiplet pill / "View Cart".                                                                      | Drawer opens directly to current cart state; chiplet hides.                                                               | [ ]         |
| **TC-CRT-05** | Checkout Gateway Transition             | Click "Checkout" or 3rd-party quick checkout button (GoKwik / Snapmint).                                      | Redirects securely to Shopify Checkout / gateway popup with exact line items and pricing.                                 | [ ]         |

---

## Test Suite 4: Collection Pages & "Shop The Edit" Filtering

| Test ID       | Test Scenario                     | Steps to Execute                                                                              | Expected Result                                                                                        | Pass / Fail |
| ------------- | --------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------- |
| **TC-COL-01** | Rakhi Collection Banners & Layout | Open `/collections/rakhi-collection`. Inspect banners on desktop and mobile viewports.        | Desktop and mobile banners render with explicit dimensions; zero Cumulative Layout Shift (CLS).        | [ ]         |
| **TC-COL-02** | Collection Product Count          | Verify utility bar on Rakhi and standard collection pages.                                    | Product count displays formatted text (e.g. "24 products") accurately.                                 | [ ]         |
| **TC-COL-03** | Shop The Edit Filter Tabs         | On homepage/landing page with "Shop The Edit", click different category / tag filter buttons. | Corresponding product cards filter instantly with smooth CSS transitions; product count badge updates. | [ ]         |
| **TC-COL-04** | "See All Styles" Button           | Click "See All Styles ↓" button on "Shop The Edit" section.                                   | Hidden products reveal smoothly; button toggles or hides once all items are visible.                   | [ ]         |
| **TC-COL-05** | Faceted Filters & Sorting         | Select price range, size filter, and sort by "Price: Low to High".                            | URL query params update; grid filters without JavaScript console errors.                               | [ ]         |
| **TC-COL-06** | Occasion & Style Cross-Nav Pills  | Navigate to `/collections/sangeet` or `/collections/kurta-sets`. Inspect Occasion and Style pills below collection heading. | Both pill rows render with horizontal scroll on mobile/desktop; active collection pill is highlighted (`#201747`); clicks transition seamlessly to destination collection. | [ ]         |

---

## Test Suite 5: Customer Account & Address Management

| Test ID       | Test Scenario             | Steps to Execute                                                                          | Expected Result                                                                                             | Pass / Fail |
| ------------- | ------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------- |
| **TC-ACC-01** | Account Dashboard Details | Log in as a customer with a default address containing city, province/state, and country. | City, state/province code, country, and postal code display completely (verifying `province_code` bug fix). | [ ]         |
| **TC-ACC-02** | Address Management        | Add a new address and set as default.                                                     | Address saves and is correctly reflected on the main account page.                                          | [ ]         |
| **TC-ACC-03** | Order History Navigation  | Click on a previous order number.                                                         | Order status, fulfillment status, tracking link, and line items load correctly.                             | [ ]         |

---

## Test Suite 6: Custom Pages & Section Functionality

| Test ID       | Test Scenario                  | Steps to Execute                                                               | Expected Result                                                                                           | Pass / Fail |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ----------- |
| **TC-SEC-01** | Store Locator Section          | Open `/pages/store-locator` or page containing store locator.                  | Store locations, addresses, and maps load without missing asset errors (e.g. `store-locator-map.min.js`). | [ ]         |
| **TC-SEC-02** | Blog & Custom Blog Breadcrumbs | Open blog listing and article pages. Inspect `<nav class="breadcrumbs-blog">`. | `aria-label` is properly populated ("Breadcrumbs"); markup uses semantic `<ul>` structure.                | [ ]         |
| **TC-SEC-03** | Gallery & Ceremony Carousel    | Swipe / click previous and next arrows on desktop and touch devices.           | Carousel scrolls items cleanly; no unclosed HTML wrapper glitches.                                        | [ ]         |

---

## Test Suite 7: Multilingual & Social Sharing

| Test ID       | Test Scenario               | Steps to Execute                                                                                                        | Expected Result                                                                                               | Pass / Fail |
| ------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------- |
| **TC-LOC-01** | Multi-Language Social Share | Change store language to German (`de`), French (`fr`), Spanish (`es`), etc. and inspect article/product social sharing. | "Share on WhatsApp" translation key loads translated string instead of blank/missing translation placeholder. | [ ]         |
| **TC-LOC-02** | WhatsApp Share Action       | Click the WhatsApp share icon on a mobile device and desktop browser.                                                   | Pre-populates message with the active product/article URL and title.                                          | [ ]         |

---

## Test Suite 8: Mobile Responsiveness & Core Web Vitals

| Test ID       | Test Scenario              | Steps to Execute                                                                           | Expected Result                                                                                          | Pass / Fail |
| ------------- | -------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ----------- |
| **TC-PRF-01** | Parser-Blocking Scripts    | Run Google Lighthouse or inspect network waterfall.                                        | D&B script and tracking scripts load with `defer`/`async` without blocking First Contentful Paint (FCP). | [ ]         |
| **TC-PRF-02** | Mobile Viewport Layout     | Test on iPhone (iOS Safari) and Android (Chrome) across 375px, 414px, and 768px viewports. | No horizontal overflow/scrolling; hamburger menu, search bar, and cart drawer operate smoothly.          | [ ]         |
| **TC-PRF-03** | Image Dimension Attributes | Inspect all main banners and product grid images.                                          | All `<img>` tags have explicit `width` and `height` attributes or CSS aspect ratios to ensure CLS < 0.1. | [ ]         |

---

## Execution Instructions

1. Run local development server: `shopify theme dev`
2. Open the preview URL on Chrome DevTools (Desktop & Mobile Simulation).
3. Record results in the `[ ]` checklist columns above as each test passes.
