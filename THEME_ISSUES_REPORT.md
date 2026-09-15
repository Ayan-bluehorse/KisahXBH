# Shopify Theme Audit & Issue Report — Kisha Theme

**Date:** August 24, 2026  
**Audited Directory:** `c:\Users\senap\Shopify theme\Kisha`  
**Summary:** 329 files inspected, 12 critical errors, 151 warnings, and 15 invalid section schema JSON definitions identified.

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Category 1: Critical & Syntax Errors (Shopify Theme Editor & HTML Tree)](#category-1-critical--syntax-errors)
3. [Category 2: Liquid Logic & Template Data Bugs](#category-2-liquid-logic--template-data-bugs)
4. [Category 3: Localization & Translation Discrepancies](#category-3-localization--translation-discrepancies)
5. [Category 4: Performance, SEO & Best Practice Warnings](#category-4-performance-seo--best-practice-warnings)
6. [Prioritized Remediation Checklist](#prioritized-remediation-checklist)

---

## 1. Executive Summary

| Issue Category | Severity | File Count | Impact |
|---|---|---|---|
| **Section Schema JSON Errors** | High / Critical | 15 Sections | Breaks theme customizer in Shopify Admin for affected sections. |
| **Rogue / Stray HTML Tags** | High | 1 Section | Broken DOM hierarchy, layout rendering glitches. |
| **Liquid / HTML Syntax Conflicts** | Medium / High | 1 Asset | Syntax errors when parsed as Liquid. |
| **Liquid Logic & Undefined Variables** | Medium | 4 Sections | Features like product counts, province display, and size charts render incorrectly. |
| **Missing Translation Keys** | Low / Medium | 7 Locales | Fallback or missing text strings in non-English locales. |
| **Performance & Deprecations** | Medium | 20+ Files | CLS layout shifts, parser blocking scripts, deprecated Shopify APIs. |

---

## 2. Category 1: Critical & Syntax Errors

### 1.1 Invalid JSON in Section Schemas (15 Files)
Shopify section schemas require strict JSON (no trailing commas, double-quoted keys only, no JavaScript comments). These 15 sections have malformed schemas that prevent them from saving or rendering properly in the Theme Editor:

1. **`sections/about-banner.liquid`** (Line 27)
   - *Error:* Trailing comma / invalid property formatting.
2. **`sections/about-founders.liquid`**
   - *Error:* Trailing comma before closing square bracket `]`.
3. **`sections/banner-with-text.liquid`**
   - *Error:* C-style comment `/* ... */` present inside the JSON schema block.
4. **`sections/career-form.liquid`**
   - *Error:* Trailing comma before `]`.
5. **`sections/cart-drawer.liquid`** (Line 22)
   - *Error:* Trailing comma or syntax error.
6. **`sections/ceremony-carousel.liquid`**
   - *Error:* Trailing comma before `]`.
7. **`sections/featured-items.liquid`** (Line 54)
   - *Error:* Trailing comma in settings array.
8. **`sections/footer.liquid`**
   - *Error:* Trailing comma before `]`.
9. **`sections/main-blog-custom.liquid`**
   - *Error:* Trailing comma before presets array.
10. **`sections/main-product.liquid`** (Line 317)
    - *Error:* Syntax/comma error in block schema definition.
11. **`sections/offer-details.liquid`**
    - *Error:* Trailing comma before `]`.
12. **`sections/store-locator.liquid`** (Line 83)
    - *Error:* Trailing comma before `]`.
13. **`sections/wedding-app.liquid`** (Line 37)
    - *Error:* Trailing comma in settings block.
14. **`sections/wedding-testimonials.liquid`** (Line 15)
    - *Error:* Trailing comma in preset settings.
15. **`sections/why-kisah.liquid`** (Line 9)
    - *Error:* Trailing comma in preset settings.

---

### 1.2 Rogue Closing Tags in Shop The Edit
* **File:** `sections/shop-the-edit.liquid` (Lines 677 & 679)
* **Issue:** Stray `</script>` closing tags exist with no corresponding `<script>` open tags inside the section container.
* **Impact:** Causes DOM nesting errors and Liquid HTML syntax failures during theme compilation.

---

### 1.3 Liquid HTML Syntax Conflict in JS Asset
* **File:** `assets/collection-revamp.js.liquid` (Line 584)
* **Code:** `for (var i = 0; i < listeners.length; i++)`
* **Issue:** Because the file extension is `.liquid`, Shopify's Liquid compiler interprets `< listeners.length` as an unclosed HTML tag.
* **Fix:** Either rename file to `collection-revamp.js` (if no Liquid variables are needed) or wrap inside `{% javascript %}...{% endjavascript %}`.

---

## 3. Category 2: Liquid Logic & Template Data Bugs

### 2.1 Missing Pagination Context in Rakhi Collection
* **File:** `sections/main-collection-rakhi.liquid` (Lines 1138, 1140)
* **Code:**
  ```liquid
  {% if section.settings.show_total and paginate.items > 0 %}
    <div class="utility-bar__item">{{ 'sections.collection.product_count' | t: count: paginate.items }}</div>
  {% endif %}
  ```
* **Issue:** `paginate` is undefined because the collection loop is not wrapped in `{% paginate collection.products by ... %}`.
* **Impact:** The product counter in the utility bar never displays.

---

### 2.2 Customer Address Province Display Bug
* **File:** `sections/main-account.liquid` (Line 19)
* **Code:**
  ```liquid
  <p>{{ customer.default_address.city }}, {% if address.province_code %}{{ customer.default_address.province_code }}, {% endif %}{{ customer.default_address.country }}</p>
  ```
* **Issue:** Checks `{% if address.province_code %}` instead of `{% if customer.default_address.province_code %}`.
* **Impact:** State/Province code will never display for customer addresses.

---

### 2.3 Naked Attribute Output on Size Chart
* **File:** `sections/main-product.liquid` (Lines 1918, 1927, 1946, etc.)
* **Code:** `<span class="size-chart-content kutra" {{ tag }}>`
* **Issue:** Emits `{{ tag }}` as naked unquoted HTML attributes. Outside loops, `tag` is undefined; inside loops, it generates invalid markup like `<span class="size-chart-content" Kurta>`.
* **Fix:** Change to `data-tag="{{ tag | escape }}"` or remove the attribute.

---

### 2.4 Unassigned Breadcrumbs Variable & Invalid Semantic Markup
* **Files:** `sections/main-blog.liquid` & `sections/main-blog-custom.liquid` (Line 129)
* **Code:** `<nav class="breadcrumbs-blog" aria-label="{{ breadcrumbs_title }}">`
* **Issue:** `breadcrumbs_title` is never assigned. Also, `<li>` elements are direct children of `<nav>` without an enclosing `<ul>` or `<ol>`.

---

## 4. Category 3: Localization & Translation Discrepancies

### 4.1 Missing Social Share Key in Locale Files
* **Key:** `general.social.share_on_whatsapp`
* **Present in:** `locales/en.default.json`
* **Missing in:**
  * `locales/de.json`
  * `locales/es.json`
  * `locales/fr.json`
  * `locales/it.json`
  * `locales/ja.json`
  * `locales/nl.json`
  * `locales/pt-PT.json`
* **Fix:** Add `"share_on_whatsapp": "Share on WhatsApp"` (translated per language) under `"general.social"`.

---

## 5. Category 4: Performance, SEO & Best Practice Warnings

### 5.1 Parser-Blocking Script
* **File:** `layout/theme.liquid` (Line 793)
* **Code:** `<script language="JavaScript" src="https://dunsregistered.dnb.com" type="text/javascript"></script>`
* **Issue:** Missing `defer` or `async`, blocking initial HTML parsing and delaying Largest Contentful Paint (LCP).

---

### 5.2 Missing Image Dimensions (CLS Issue)
* **File:** `sections/main-collection-rakhi.liquid` (Lines 831 & 834)
* **Code:**
  ```liquid
  <img src="{{ desktop_banner | img_url: 'master' }}" alt="Rakhi Gift Box" class="rakhi-banner-desktop" />
  <img src="{{ mobile_banner | img_url: 'master' }}" alt="Rakhi Gift Box" class="rakhi-banner-mobile" />
  ```
* **Issue:** Lacks explicit `width` and `height` attributes, leading to layout shift (CLS).

---

### 5.3 Deprecated Fonts in Settings Data
* **File:** `config/settings_data.json`
* **Issue:** 16 font configuration entries reference deprecated Shopify font library IDs:
  * `americana_n4`, `americana_n7`
  * `basic_commercial_n4`, `basic_commercial_n7`
  * `gill_sans_nova_n6`
  * `futura_n4`, `futura_n5`
  * `helvetica_n4`, `helvetica_n7`

---

### 5.4 Deprecated Filters
* **Issue:** Use of legacy filter `| img_url: 'master'` instead of the updated `| image_url` filter across multiple section files.

---

## 6. Prioritized Remediation Checklist

- [ ] **Phase 1 (Critical):** Clean up trailing commas and comments across all 15 section schemas.
- [ ] **Phase 2 (Syntax):** Remove stray `</script>` tags in `sections/shop-the-edit.liquid` and fix `assets/collection-revamp.js.liquid`.
- [ ] **Phase 3 (Template Bugs):** Fix `main-account.liquid` address province check, `main-collection-rakhi.liquid` pagination count, and `main-product.liquid` size chart attributes.
- [ ] **Phase 4 (Locales):** Add `general.social.share_on_whatsapp` to all 7 locale JSON files.
- [ ] **Phase 5 (Performance):** Add `defer` to D&B script in `layout/theme.liquid` and add explicit width/height to banner images.
