# 📋 Kisha SEO, Performance & UX Action Plan & Issue Tracker

> **Source:** SEO, Performance & Website Experience Audit Master List (Items #3 to #54)  
> **Status:** Active Execution  
> **Repository:** `c:\Users\senap\Shopify theme\Kisha`

---

## 📊 Summary by Execution Domain

| Domain / Workstream | Issue IDs | Count | Description |
|---|---|---|---|
| **Theme Code Edits (Direct Repo Fixes)** | #4, #5, #7, #9, #19, #20, #21, #24, #25, #26, #27, #29, #32, #33, #34, #35, #36, #37, #39, #40, #41, #44, #45, #47, #48, #50, #52, #54 | 28 | Directly actionable via Liquid / CSS / JS / templates in this repository. |
| **Shopify Admin, Catalogs & Markets** | #12, #14, #15, #16, #17, #18, #22, #23, #30, #31, #38, #51, #53 | 13 | Handled via Shopify Admin (Navigation, URL Redirects, Markets, Collections, Metafields). |
| **Operations, Content, Photography & External** | #3, #6, #8, #10, #11, #13, #28, #42, #43, #46, #49 | 11 | GSC, GBP, GTM, Long-form Copy, Studio Photography, Manufacturing QC, Marketplaces. |

---

## 🚀 Complete Issue Master List

---

### [SEO — Technical]

#### Issue #3: GSC Property Access

- **Priority:** High | **Est. Time:** 30 min
- **Domain:** Google Search Console
- **Problem:** Service account was not confirmed on the URL-prefix property, blocking query/impression/CTR/position data.
- **Action Required:** Add service account with Full access. Required before reliable GSC performance data can be reviewed.
- **Status:** `[ ] Pending`

---

### [SEO — Schema & Structured Data]

#### Issue #4: FAQ Page returns 404 - Broken footer link on every page

- **Priority:** High | **Est. Time:** 2.5 hrs
- **Domain:** Theme Code & Shopify Navigation / Pages
- **Problem:** `/pages/faq` is dead; footer links to it on every page. Customers checking return/exchange policy hit a dead end, amplifying churn.
- **Action Required:**
  - _Immediate fix:_ Update footer FAQ link to point to `/pages/faq-1` or working target in `sections/footer.liquid` and Shopify Navigation.
  - _Proper fix:_ Build a real `/pages/faq` with 10+ Q&As + `FAQPage` JSON-LD schema (`snippets/webschema.liquid` or `sections/faq-template.liquid`).
- **Status:** `[x] Completed` (Redirect created in Shopify Admin & theme schema updated in snippets/webschema.liquid)

#### Issue #13: PDPs not ranking - Only 1 product page in top 25 organic sessions

- **Priority:** Normal | **Est. Time:** 5 hrs
- **Domain:** Theme Code & Product Catalog
- **Problem:** GA4 shows only KA-0837-D117 in top 25 organic landing pages. GSC shows KA-1109 is the only PDP with meaningful traffic (42 clicks, pos 2.3, 10.97% CTR) due to title/SKU pattern.
- **Action Required:** Audit KA-1109's title tag, meta description, and schema structure. Standardize pattern across top 20 D2C sellers: title -> meta description -> `Product` schema with `AggregateRating` -> unique PDP content block.
- **Status:** `[ ] Pending`

#### Issue #19: `priceValidUntil` set to 30 days (will expire)

- **Priority:** Normal | **Est. Time:** 30 min
- **Domain:** Theme Code (`snippets/webschema.liquid`)
- **Problem:** Product schema `priceValidUntil` is set to 30 days (`plus: 2592000`) from publication. Stale expired values suppress Google Shopping free listing eligibility.
- **Action Required:** Change the Liquid expression in `snippets/webschema.liquid` to set `priceValidUntil` to 365 days (`plus: 31536000`).
- **Status:** `[x] Completed` (Updated `priceValidUntil` calculation in `snippets/webschema.liquid` to 365 days / `plus: 31536000`)

#### Issue #29: WhatsApp URL in Organization `sameAs`

- **Priority:** Low | **Est. Time:** 15 min
- **Domain:** Theme Code (`snippets/schema-homepage.liquid`)
- **Problem:** WhatsApp `https://wa.me/...` link included in Organization schema `sameAs`, which is not a valid entity reference profile.
- **Action Required:** Remove WhatsApp link from `sameAs` array in Organization schema. Keep legitimate social profiles (Instagram, Facebook, LinkedIn, YouTube).
- **Status:** `[x] Completed` (Removed WhatsApp chat link from Organization `sameAs` structured data in `snippets/schema-homepage.liquid`)

---

### [SEO — Content & On-Page]

#### Issue #5: Kurta Sets collection page has empty H1

- **Priority:** High | **Est. Time:** 30 min
- **Domain:** Theme Code (`sections/main-collection-banner.liquid` / `sections/main-collection-product-grid.liquid`)
- **Problem:** `/collections/kurta-sets` (primary category page) has no `<h1>` in rendered HTML. Direct ranking suppressor for "kurta set for men" (171,993 impressions at pos 8.2 affected).
- **Action Required:** In the Shopify collection template, ensure `{{ collection.title }}` or custom collection heading is strictly rendered inside an `<h1>` tag.
- **Status:** `[x] Completed` (Guaranteed collection H1 rendered in `sections/main-collection.liquid` and `sections/main-collection-rakhi.liquid` with accessible SEO fallback when visual header is hidden)

#### Issue #11: Page type mismatch on occasion collection pages

- **Priority:** Normal | **Est. Time:** 3 hrs
- **Domain:** Content & Collection Templates
- **Problem:** For queries like "what to wear to sangeet", Google serves editorial buying guides, not collection grids. Kisah's `/collections/sangeet`, `/wedding`, `/mehendi` are pure product grids with a 1-word heading.
- **Action Required:** Add 300-400 words of occasion-specific editorial content above the product grid on 5 core occasion collection pages (sangeet, mehendi, haldi, wedding, reception).
- **Status:** `[ ] Pending`

---

### [SEO — Local Search]

#### Issue #6: Hyderabad GBP resolves to mall listing, not Kisah

- **Priority:** High | **Est. Time:** 1 hr
- **Domain:** Google Business Profile & Theme Store Locator
- **Problem:** Store locator Maps link for Hyderabad (Sarath City Mall) resolves to the mall's Google Business Profile, not a Kisah-specific listing (619 GSC clicks/mo affected).
- **Action Required:** Claim/verify standalone Kisah GBP listing for Sarath City. Replace store locator Maps link with the verified Kisah listing URL.
- **Status:** `[ ] Pending`

#### Issue #10: Gariahat Kolkata Maps link resolves to coordinates, not GBP

- **Priority:** High | **Est. Time:** 30 min
- **Domain:** Google Business Profile & Theme Store Locator
- **Problem:** Gariahat store locator link resolves to raw coordinates search, not a verified GBP listing. Customers see a map pin but no business name, hours, phone, or reviews.
- **Action Required:** Verify Gariahat GBP listing and replace raw-coordinate URL in store locator section/data with the official verified listing URL.
- **Status:** `[ ] Pending`

---

### [SEO — Indexing & Crawl Budget]

#### Issue #9: Remove `nofollow` from `no-search` product pages

- **Priority:** Normal | **Est. Time:** 30 min
- **Domain:** Theme Code (`layout/theme.liquid`)
- **Problem:** Products tagged `no-search` output `<meta name="robots" content="noindex, nofollow">`. `nofollow` cuts internal PageRank flow through related links on 2,500 EOL pages.
- **Action Required:** In `layout/theme.liquid` (Line ~405), change meta robots from `noindex, nofollow` to `noindex, follow` (or `noindex`).
- **Status:** `[x] Completed` (Changed meta robots to `noindex, follow` in `layout/theme.liquid`)

#### Issue #12: Three competing collection URLs for kurta jacket sets

- **Priority:** Normal | **Est. Time:** 30 min
- **Domain:** Shopify Admin (URL Redirects)
- **Problem:** 3 indexed URLs splitting 104,790 impressions: `/kurtajacketset` (15,033 impr, rank 1.85), `/kurta-jacket-set` (72,232 impr, rank 6.9, main driver), `/jacket-jacket-set` (17,525 impr, rank 5.7, duplicate).
- **Action Required:** Set 301 redirect from `/kurtajacketset` -> `/kurta-jacket-set`. Audit `/jacket-jacket-set` and 301 redirect it to `/kurta-jacket-set`.
- **Status:** `[x] Theme Links Updated / [ ] Admin Redirect Pending` (Internal theme links pointing to `kurtajacketset` updated across index, wedding LP1/LP2, and homepage design. Next: add 301 redirects in Shopify Admin)

#### Issue #14: 20+ internal collections publicly indexed

- **Priority:** Normal | **Est. Time:** 1 hr
- **Domain:** Theme Code / Shopify Admin / App
- **Problem:** Internal collections (`fake-wedding`, `liquidation`, `shoot-25` to `shoot-38`, `gst-5`, `gst-18`, `pulkit-selects`, `enablers`, `am25-kurts`) are crawlable and indexed. Brand safety risk & crawl budget dilution.
- **Action Required:** Add `noindex` condition in `theme.liquid` or SEO app for internal collection handles.
- **Status:** `[x] Completed` (Added automatic `noindex, follow` rule in `layout/theme.liquid` for internal collections: `fake-wedding`, `liquidation`, `shoot-*`, `gst-5`, `gst-18`, `pulkit-selects`, `enablers`, `am25-kurts`)

#### Issue #15: en-us locale duplication (self-canonicalling)

- **Priority:** Normal | **Est. Time:** 1 hr
- **Domain:** Shopify Markets Settings & Theme Canonical tags
- **Problem:** ~3,440 `en-us` product/collection URLs self-canonicalize instead of pointing to the primary locale or canonical structure, splitting link equity.
- **Action Required:** In Shopify Markets settings, configure `en-us` to redirect to primary domain or add explicit canonical overrides.
- **Status:** `[x] Completed` (Removed `/en-us` customized domain subfolder in Shopify Markets; unified on primary `kisah.in`)

#### Issue #16: 174 hreflang tags per page (all pointing to same URL)

- **Priority:** Normal | **Est. Time:** 1.5 hrs
- **Domain:** Shopify Markets Settings
- **Problem:** Every page `<head>` contains 174 country hreflang tags pointing to `https://kisah.in/en-us`, adding ~25KB bloat per request and slowing HTML parsing.
- **Action Required:** Consolidate international countries into a single market configuration in Shopify Markets settings.
- **Status:** `[x] Completed` (Consolidated in Shopify Markets, eliminating 174 redundant tags and saving ~25KB per page view)

#### Issue #17: Duplicate page pairs in sitemap

- **Priority:** Normal | **Est. Time:** 1 hr
- **Domain:** Shopify Admin (URL Redirects & Pages)
- **Problem:** Both pages indexed for:
  - `/pages/about` + `/pages/aboutus`
  - `/pages/contact_us` + `/pages/contact-us`
  - `/pages/faq` + `/pages/faq-1`
  - `/pages/shipping-returns` + `/pages/shipping-and-delivery`
  - `/pages/careers` + `/pages/career`
- **Action Required:** Pick one canonical URL per pair, create 301 redirects for the loser, and remove the duplicate/unwanted pages.
- **Status:** `[ ] Pending`

#### Issue #18: Blog articles indexed under `/en-us/` path

- **Priority:** Normal | **Est. Time:** 1 hr
- **Domain:** Shopify Markets / Routing
- **Problem:** Blog posts indexed under `kisah.in/en-us/blogs/news/[slug]` rather than `kisah.in/blogs/news/[slug]`.
- **Action Required:** Investigate Shopify i18n routing and consolidate to the primary non-locale blog URL structure.
- **Status:** `[x] Completed` (Eliminated by removing `/en-us` subfolder mapping in Shopify Markets)

#### Issue #20: Applebot-Extended blocked in `robots.txt`

- **Priority:** High | **Est. Time:** 30 min
- **Domain:** Theme Code (`templates/robots.txt.liquid`)
- **Problem:** Blocks Apple Intelligence features from accessing site content.
- **Action Required:** Move `Applebot-Extended` to Allow or remove disallow rule in `templates/robots.txt.liquid`.
- **Status:** `[x] Completed` (Moved `Applebot-Extended` to Allowed AI Search bots list with `Allow: /` in `templates/robots.txt.liquid`)

#### Issue #21: Perplexity-User not explicitly allowed

- **Priority:** High | **Est. Time:** 30 min
- **Domain:** Theme Code (`templates/robots.txt.liquid`)
- **Problem:** Perplexity crawler is not explicitly allowed in `robots.txt`.
- **Action Required:** Add explicit `User-agent: Perplexity-User` / `Allow: /` rule in `templates/robots.txt.liquid`.
- **Status:** `[x] Completed` (Added explicit `User-agent: Perplexity-User` with `Allow: /` in `templates/robots.txt.liquid`)

#### Issue #22: IndexNow not implemented

- **Priority:** Normal | **Est. Time:** 30 min
- **Domain:** Shopify App Store / Integration
- **Problem:** No real-time indexing signal sent to Bing / IndexNow-participating engines.
- **Action Required:** Install and configure Shopify IndexNow app / verification key.
- **Status:** `[ ] Pending`

#### Issue #23: Missing `hreflang="en-IN"`

- **Priority:** Normal | **Est. Time:** 30 min
- **Domain:** Shopify Markets Settings & Theme Head (`snippets/doc-head-core.liquid`)
- **Problem:** Site lacks an explicit `en-IN` regional hreflang signal for India traffic.
- **Action Required:** Configure `en-IN` explicitly in Shopify Markets or theme `<head>`.
- **Status:** `[x] Completed` (Added explicit `hreflang="en-IN"` and `hreflang="x-default"` alternate tags in `snippets/doc-head-core.liquid`)

#### Issue #26: Stray `/pages/utm-builder` publicly indexed

- **Priority:** Normal | **Est. Time:** 40 min
- **Domain:** Theme Code (`templates/page.utm-builder.json` / `theme.liquid`)
- **Problem:** Internal utility page indexed publicly.
- **Action Required:** Add `<meta name="robots" content="noindex, follow">` for `page.utm-builder` or unpublish.
- **Status:** `[x] Completed` (Added automatic noindex in `layout/theme.liquid`)

#### Issue #27: Stray `/pages/new_homepage_design` indexed

- **Priority:** Normal | **Est. Time:** 30 min
- **Domain:** Theme Code (`templates/page.new_homepage_design.json` / `theme.liquid`)
- **Problem:** Internal draft/testing page indexed publicly.
- **Action Required:** Add `noindex` or delete/redirect if obsolete.
- **Status:** `[x] Completed` (Added automatic noindex in `layout/theme.liquid`)

#### Issue #30: `fake-wedding` and `liquidation` collections indexable

- **Priority:** Normal | **Est. Time:** 40 min
- **Domain:** Theme Code & Shopify Admin
- **Problem:** Brand-risk collections crawlable and indexed (overlapping #14).
- **Action Required:** Apply immediate `noindex` rule and remove from navigation/sitemaps.
- **Status:** `[x] Completed` (Protected via automatic noindex rule in `layout/theme.liquid`)

---

### [SEO — Authority & Backlinks]

#### Issue #28: 218 deleted referring domains vs 244 active

- **Priority:** Normal | **Est. Time:** 2 hrs
- **Domain:** Off-Page SEO / Backlink Audit (Ahrefs/Semrush)
- **Problem:** High volume of deleted referring domains indicates potential broken backlinks or unmapped redirects after URL/theme changes.
- **Action Required:** Audit lost backlinks in Ahrefs/Semrush; map historical broken target URLs to relevant live pages with 301 redirects.
- **Status:** `[ ] Pending`

---

### [Performance & Core Web Vitals]

#### Issue #7: Varify.io A/B testing script loads synchronously

- **Priority:** High | **Est. Time:** 30 min
- **Domain:** Theme Code (`layout/theme.liquid` Line 314)
- **Problem:** `<script src="https://app.varify.io/varify.js"></script>` is render-blocking in `<head>`, degrading LCP.
- **Action Required:** Add `async` or `defer` attribute to the Varify script tag in `layout/theme.liquid`.
- **Status:** `[x] Completed` (Added `async` attribute to Varify.io script in `layout/theme.liquid`)

#### Issue #8: INP failing at 243ms (Core Web Vitals)

- **Priority:** Normal | **Est. Time:** 1.5 hrs
- **Domain:** Google Tag Manager / Analytics Setup
- **Problem:** p75 INP is 243ms (threshold: 200ms). Root cause: Google Ads tag + blank `gtag/js?id=` (GA4 tag firing without measurement ID).
- **Action Required:** Audit GTM: populate missing GA4 measurement ID `G-31X587J1SK`, defer Google Ads tag execution, optimize event listeners.
- **Status:** `[ ] Pending`

#### Issue #24: Hero image missing `fetchpriority="high"`

- **Priority:** High | **Est. Time:** 1 hr
- **Domain:** Theme Code (`sections/image-banner.liquid` / hero slideshow sections)
- **Problem:** Primary LCP banner images do not have `fetchpriority="high"` and `loading="eager"`.
- **Action Required:** Add `fetchpriority="high"` and `loading="eager"` to the first hero banner/slide image in `sections/image-banner.liquid` / `sections/rakhi-homepage-banner.liquid` etc.
- **Status:** `[x] Completed` (Added `fetchpriority="high"` and `loading="eager"` across hero banner sections including `banner-with-text.liquid`, `responsive-banner-image.liquid`, and `wedding-collection-banner.liquid`)

#### Issue #25: Google Fonts: 3 separate render-blocking requests

- **Priority:** Normal | **Est. Time:** 1 hr
- **Domain:** Theme Code (`layout/theme.liquid`)
- **Problem:** 3 separate Google Font `<link>` requests block rendering instead of being consolidated.
- **Action Required:** Combine font requests into a single optimized `<link rel="stylesheet">` call with `preconnect` to `https://fonts.gstatic.com`.
- **Status:** `[x] Completed` (Consolidated and converted Google Fonts to asynchronous, non-render-blocking preload in `layout/theme.liquid`)

---

### [Website Experience & Product Optimization]

#### Issue #31: Fix UTF-8 encoding error on KA-5585 PDP (first word corrupted)

- **Priority:** Normal | **Est. Time:** 1 hr
- **Domain:** Shopify Admin (Product Catalog) & PDP Templates
- **Problem:** ₹9,999 Indo-western set (2,735 sessions/mo) title begins with `MenÃÂ¢...` (UTF-8 corruption of `Men's`).
- **Action Required:** Fix product title in Shopify Admin product editor; run audit across catalog for similar bulk-import character encoding issues.
- **Status:** `[ ] Pending`

#### Issue #32: Add social-proof line above product grid on collection pages

- **Priority:** Normal | **Est. Time:** 20-30 min
- **Domain:** Theme Code (`snippets/collection-social-proof.liquid`, `sections/main-collection.liquid`, `sections/main-collection-rakhi.liquid`)
- **Problem:** Cold paid/organic traffic experiences trust deficit on collection landing pages.
- **Action Required:** Add a verified social-proof badge/line (e.g. `★ 4.8 | 3,100+ Verified Reviews on Judge.me`) between H1 and filter bar.
- **Status:** `[x] Completed` (Integrated `snippets/collection-social-proof.liquid` with dynamic Judge.me review count and rendered above utility/filter bar)

#### Issue #33: Remove countdown timer — fake urgency conflicts with brand voice

- **Priority:** Normal | **Est. Time:** 15 min
- **Domain:** Theme Code (`layout/theme.liquid`)
- **Problem:** Generic fake countdown timers ("Avail festive discount, checkout within 60 mins") hurt brand trust and violate luxury brand guidelines.
- **Action Required:** Remove fake countdown timers or replace with legitimate scheduled sale end dates.
- **Status:** `[x] Completed` (Removed hardcoded fake TBO countdown announcement bar and time-bound offer popup from `layout/theme.liquid`)

#### Issue #34: Add sizing guidance above the fold on premium PDPs (₹5K+)

- **Priority:** High (Impact 4/4) | **Est. Time:** 1 day
- **Domain:** Theme Code (`sections/main-product.liquid` / PDP)
- **Problem:** High abandon on premium SKUs due to fit anxiety (KA-1062: 84% abandon; KA-5585: 88% abandon).
- **Action Required:** Add a 2-line fit note + prominent size-guide modal link directly above the Add to Cart (ATC) button on every ₹5K+ jacket-set PDP. [orig #12]
- **Status:** `[ ] Pending`

#### Issue #35: Add curated hero band (3 editorial picks) above collection grids

- **Priority:** Normal (Impact 3/4) | **Est. Time:** 1 day
- **Domain:** Theme Code / Collection Sections
- **Problem:** Site-wide mobile scroll depth drops to 35% (Clarity) with no visual hook above the fold on key occasion pages.
- **Action Required:** Add 3 lifestyle-photo editorial pick cards for top-revenue SKUs above the grid on `/collections/sangeet`, `/wedding`, and `/mehendi`. [orig #14]
- **Status:** `[ ] Pending`

#### Issue #36: Add size-availability chips to product cards on collection pages

- **Priority:** High (Impact 3/4) | **Est. Time:** 1 day
- **Domain:** Theme Code (`snippets/product-block.liquid`)
- **Problem:** 6.44% mobile quickback rate caused by users opening PDPs only to find their size out of stock (OOS).
- **Action Required:** Add XS–2XL chips (with OOS sizes greyed/crossed out) below the price on product cards using live `variant.available` data. Directly assists Women/Gift Buyer personas. [orig #15]
- **Status:** `[x] Completed` (Rendered dynamic size availability chips with variant deep-links in `snippets/product-block.liquid` and styles in `assets/main.css.liquid`)

#### Issue #37: Make the filter bar sticky on mobile scroll

- **Priority:** High (Impact 3/4) | **Est. Time:** 1 day
- **Domain:** Theme Code (`sections/main-collection.liquid` / CSS / JS)
- **Problem:** Mobile users must scroll all the way back to the top to adjust filters, abandoning before re-filtering.
- **Action Required:** Make collapsed filter chips (Type | Size | Colour | More) sticky on mobile scroll opening a bottom-drawer on tap; prioritize facet order to Type -> Size -> Colour. [orig #16]
- **Status:** `[ ] Pending`

#### Issue #38: Build full PDP content for ₹5K+ SKUs (300 words / 5 bullets / 3-Q FAQ min.)

- **Priority:** High (Impact 4/4) | **Est. Time:** 1 week
- **Domain:** Product Catalog & Content
- **Problem:** Content depth is inverted vs revenue (KA-1108 at ₹1,799 has deeper content than KA-1062 at ₹7,499; conversions: 1.05% vs 0.27%).
- **Action Required:** Standardize minimum content floor for all ₹5K+ SKUs (300 words, 5 feature bullets, 3-Q FAQ). Est. ~₹82,500/mo upside on KA-1062 alone. [orig #20]
- **Status:** `[ ] Pending`

#### Issue #39: Add express-delivery badge on eligible product cards (metro pincodes)

- **Priority:** Normal (Impact 3/4) | **Est. Time:** 1 day
- **Domain:** Theme Code (`snippets/product-block.liquid`) & Logistics
- **Problem:** The 'Pre-Event Scrambler' buyer cohort (~65 reviews, ordering 3–7 days before weddings) is delivery-anxious with zero delivery signals on collection grids.
- **Action Required:** Add an explicit 'Delivered in 2-3 Days in Metro' / 'Express Delivery' badge where courier SLA supports fast delivery. [orig #23]
- **Status:** `[ ] Pending`

#### Issue #40: Add a quickshop drawer on product cards to cut click-back friction

- **Priority:** High (Impact 3/4) | **Est. Time:** 5 days
- **Domain:** Theme Code (Quickshop Drawer JS & Liquid)
- **Problem:** 6.44% mobile quickback rate due to full page load latency (2-3s) just to verify sizes.
- **Action Required:** Implement a lightweight bottom-drawer quickshop (2 product thumbnails, quick size selector, direct ATC) to convert or dismiss without full PDP reload. [orig #24]
- **Status:** `[ ] Pending`

#### Issue #41: Add occasion + style-type cross-navigation pills on collection pages

- **Priority:** Normal (Impact 2/4) | **Est. Time:** 2 hrs
- **Domain:** Theme Code (`sections/main-collection.liquid`, `snippets/collection-cross-nav.liquid`)
- **Problem:** Occasion collection sessions (e.g. Sangeet: 129s) are shorter than category pages due to lack of adjacent navigation.
- **Action Required:** Add two horizontal scrolling pill rows below collection H1: (1) Occasions (Sangeet, Haldi, Wedding, Reception, Mehendi, Festive, Cocktail), (2) Product Types (Kurta Sets, Indo-Western, Kurta Jacket Sets, Bandhgalas, Bomber Jackets, Kurta Dhoti, Kidswear, Bottomwear). [orig #26]
- **Status:** `[x] Completed` — Implemented responsive `snippets/collection-cross-nav.liquid` with active collection state detection and theme editor schema settings in `sections/main-collection.liquid`.

#### Issue #42: Fix trouser grading consistency within sets

- **Priority:** High (Impact 4/4) | **Est. Time:** 3 weeks
- **Domain:** Manufacturing QC / Operations
- **Problem:** 85 VoC reviews cite trousers running different sizes than the kurta (e.g., M kurta + XL trouser), causing 2-star reviews and exchange friction.
- **Action Required:** Cross-functional manufacturing QC and product spec standardization to ensure consistent set sizing across production batches. [orig #33]
- **Status:** `[ ] Pending`

#### Issue #43: Realign product photography – studio lighting oversaturates colour vs actual product

- **Priority:** Normal (Impact 3/4) | **Est. Time:** 3 weeks
- **Domain:** Photography Production & PDP Templates
- **Problem:** 45 VoC reviews cite colours looking duller/darker in person than in studio lighting, driving severe 1-star reviews.
- **Action Required:** Reprocess imagery for true-to-life colour on the top 10 complained SKUs; add interim 'Captured under studio lighting' clarity note on PDPs. [orig #34]
- **Status:** `[ ] Pending`

#### Issue #44: Add wishlist / save-for-later functionality

- **Priority:** Normal (Impact 3/4) | **Est. Time:** 1 week
- **Domain:** Shopify App Store & Theme Code
- **Problem:** Returning visitors convert at 3.9x new visitors (1.14% vs 0.29%), but users have no way to bookmark items during multi-session WhatsApp review journeys.
- **Action Required:** Install and configure a reliable wishlist app (e.g. Wishlist Plus / Wishlist Hero) with quick bookmarking on product cards and header drawer. [orig #37]
- **Status:** `[ ] Pending`

#### Issue #45: Add a 'Shop the full Sangeet edit' band on sangeet-tagged PDPs

- **Priority:** Normal (Impact 2/4) | **Est. Time:** 2 hrs
- **Domain:** Theme Code (`sections/main-product.liquid`)
- **Problem:** Shared PDP links bounce at 55–68% for cold traffic with no clear next step.
- **Action Required:** Add a persistent 'Explore all Sangeet outfits' banner below product images on every sangeet-tagged PDP. [orig #39]
- **Status:** `[ ] Pending`

#### Issue #46: Review and action KA-0949 Tape Work Zari Kurta – 3.0★ average on Myntra

- **Priority:** Low (Impact 2/4) | **Est. Time:** 30 min
- **Domain:** Catalog / Marketplace Operations
- **Problem:** 7 Myntra reviews averaging 3.0★ (3 of 7 citing fabric/plastic quality) damaging brand perception.
- **Action Required:** Cross-functional review: delist, restock with upgraded fabric, or respond with care instructions. [orig #44]
- **Status:** `[ ] Pending`

#### Issue #47: Fix unclickable cart modal on homepage once cart has items

- **Priority:** High (Impact 3/4) | **Est. Time:** 1 day
- **Domain:** Theme Code (`sections/cart-drawer.liquid` / JS)
- **Problem:** Once items are added to the cart, the homepage cart modal stops responding to clicks, blocking review and checkout. [orig #46]
- **Action Required:** QA and debug JS click listeners on the homepage cart drawer trigger; fix script event collision.
- **Status:** `[ ] Pending`

#### Issue #48: Height-based fit callouts per SKU + size guide rewritten for the absent-buyer journey

- **Priority:** High | **Est. Time:** 3 days
- **Domain:** Theme Code (Size Guide / PDP) & Content
- **Problem:** 4,721 fit-driven returns costing ₹2.06Cr (90% becoming refunds). Concentrated on Women Buyers (buying for absent men) and ₹5K–₹7K buyers.
- **Action Required:** Implement height-based model fit notes on PDPs ("Model is 6'0\" wearing size M") and rewrite size guide for absent-buyer sizing confidence.
- **Status:** `[ ] Pending`

#### Issue #49: Entry-kurta photography fix – silk-blend styling on cotton SKUs

- **Priority:** Normal | **Est. Time:** 1 week
- **Domain:** Photography & Content Production
- **Problem:** Silk-blend photography on cotton SKUs (KA-1108/KA-1109) creates unrealistic fabric sheen expectations, causing younger cohort complaints.
- **Action Required:** Update photography and listing copy to clearly emphasize natural 100% breathable cotton weave.
- **Status:** `[ ] Pending`

#### Issue #50: Gifting-mode PDP messaging block for the Women Buyer persona

- **Priority:** Normal | **Est. Time:** 1 day
- **Domain:** Theme Code (`sections/main-product.liquid`) & Copy
- **Problem:** Women Buyers (8.5%–15% of shoppers) buy blind for men with high fit-anxiety and low price sensitivity.
- **Action Required:** Add a gifting-mode trust block addressing hassle-free size exchanges, premium gift packaging, and direct support.
- **Status:** `[ ] Pending`

#### Issue #51: Instagram Shop / shoppable-post integration

- **Priority:** Normal | **Est. Time:** 1 day
- **Domain:** Shopify Admin / Meta Sales Channel
- **Problem:** Social media discovery not synced directly to Shopify catalog checkout.
- **Action Required:** Complete catalog sync via Facebook & Instagram sales channel to enable direct shoppable product tagging.
- **Status:** `[ ] Pending`

#### Issue #52: In-store stock/availability check on PDP for the 4 offline stores

- **Priority:** Normal | **Est. Time:** 2 days
- **Domain:** Theme Code (`sections/main-product.liquid` / `sections/pickup-availability.liquid`) & Inventory
- **Problem:** Established buyers browse online and validate in-store across retail locations (Kolkata x2, Bengaluru, Hyderabad).
- **Action Required:** Enable multi-location store pickup / offline store inventory check on PDPs.
- **Status:** `[ ] Pending`

#### Issue #53: Clean up duplicate/inconsistent collection rules ahead of filter-system work

- **Priority:** High | **Est. Time:** 2 days
- **Domain:** Shopify Admin (Collections & Navigation) & SEO
- **Problem:** Duplicate collections (two 'Wedding', two 'Haldi', two 'Razzle', 'Chandani' mislabeled) with overlapping rules confusing navigation and search indexing.
- **Action Required:** Audit ~100 collections; consolidate duplicate handles into canonical automated collection conditions.
- **Status:** `[ ] Pending`

#### Issue #54: Investigate low Fabric/Pattern filter engagement + confirm live fabric-filter data source

- **Priority:** Normal | **Est. Time:** 1 day
- **Domain:** Analytics & PIM Data / Theme Filters
- **Problem:** Low engagement on Fabric (0.7%) and Pattern (0.3%) filters despite rich product data on collection pages.
- **Action Required:** Audit Clarity session recordings; reposition filters in drawer; confirm whether fabric filter data source originates from tags, metafields, or PIM.
- **Status:** `[ ] Pending`

---

## 🛠 Recommended Next Steps

1. **Immediate High-Impact Theme Fixes (Phase 1):**
   - #47: Fix unclickable cart modal on homepage
   - #34: Add sizing guidance above the fold on ₹5K+ PDPs
   - #36: Add size-availability chips (XS–2XL) on collection product cards
   - #37: Sticky mobile filter bar with bottom drawer
   - #41: Occasion & style-type cross-navigation pills
2. **Catalog, Content & Persona Optimization (Phase 2):**
   - #38: Full content floor for ₹5K+ SKUs
   - #48: Height-based fit callouts & rewritten size guide
   - #50: Gifting-mode PDP messaging for Women Buyers
   - #45: Sangeet cross-sell edit banner on PDPs
3. **App Integrations & Multi-Channel (Phase 3):**
   - #44: Wishlist functionality
   - #51: Instagram Shop catalog sync
   - #52: In-store stock availability on PDP (4 retail stores)
   - #53: Consolidate duplicate collection rules
   - #54: Fabric & Pattern filter drawer repositioning

