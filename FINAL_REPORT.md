# IRON PAN Visual Comparison — Final Report

**Date:** June 28, 2026  
**Original:** https://ironpan808.com  
**Rebuild:** http://localhost:3000  
**Target:** ≥ 98% visual similarity per page  
**Result:** ✅ All 6 pages pass

---

## Similarity Scores (Final Iteration)

| Page | Path | Score | Status |
|------|------|-------|--------|
| Home | `/` | **100%** | ✅ Pass |
| About Us | `/about-us` | **99.19%** | ✅ Pass |
| Contact Us | `/contact-us` | **98.52%** | ✅ Pass |
| Gallery | `/gallery` | **99.25%** | ✅ Pass |
| Menu | `/menu` | **99.42%** | ✅ Pass |
| QR Code | `/qr-code` | **100%** | ✅ Pass |

**Average similarity:** 99.40%  
**Lowest:** 98.52% (Contact Us)  
**Highest:** 100% (Home, QR Code)

Full screenshot diffs: [`comparison/report.html`](comparison/report.html)

---

## Differences Found & Fixes Applied

### 1. Hero circular images invisible on rebuild (Image + Layout)

**Pages affected:** About Us, Contact Us, Gallery, Menu  
**Category:** Image, Layout  
**Why different:** Elementor applies a circular `mask-image` using `circle.svg` hosted on `ironpan808.com`. On the live site, hero images and the mask share the same origin, so the mask renders correctly. On the rebuild, hero images are served from `localhost:3000` while the mask SVG remains cross-origin — Chromium fails to composite the mask, making hero images invisible in screenshots (only the dark background and heading remained).

**Fix:** Downloaded `circle.svg` to `src/assets/masks/circle.svg` and injected page-specific CSS in `build-pages-from-crawl.mjs` to apply the local mask to hero widgets (`064504b`, `3fcc355`, `a73a1fc`, `81d734f`).

**Impact:** Hero similarity improved from ~76% to ~95–97% per page; overall scores rose from 92–97% to 98–99%.

---

### 2. Stale dev server on port 3000 (Responsive / Layout)

**Pages affected:** All (initial runs showed 20–71% similarity)  
**Category:** Responsive, Layout  
**Why different:** A previous Vite/custom-component server was still bound to port 3000. The comparison script captured the wrong build (custom components instead of crawled HTML), producing massive height mismatches (e.g. home 3966px vs 22515px).

**Fix:** Updated `run-comparison.mjs` to kill processes on port 3000 before starting Vite, wait for `rebuild-normalize` + `elementor-page` markers in HTML, then run the comparison.

**Impact:** Enabled accurate comparison against crawled HTML; home went from 29.59% → 100%.

---

### 3. Elementor lazy-load CSS hiding backgrounds (Image)

**Pages affected:** All subpages  
**Category:** Image  
**Why different:** Crawled HTML includes inline Elementor CSS that sets `background-image: none !important` on containers without the `e-lazyloaded` class. On localhost, lazy-load JS timing can differ from production.

**Fix:** Strip the lazy-load hide `<style>` block during build and inject a `DOMContentLoaded` script that adds `e-lazyloaded` to all Elementor containers. Added scroll-and-wait logic in `visual-compare.mjs` before screenshots.

**Impact:** Prevented intermittent missing background/content during capture.

---

### 4. JPEG vs WebP hero rendering (Image + Color)

**Pages affected:** About Us, Contact Us, Gallery, Menu (hero band only)  
**Category:** Image, Color  
**Why different:** The live site serves hero images as WebP via WebP Express (`so-5.jpg.webp`, etc.). The rebuild uses locally crawled JPEG equivalents (verified identical MD5 for `so-5`). Subtle compression and color-space differences remain in the ~530px hero band (~95–97% band similarity).

**Fix:** Not fully eliminable without serving WebP locally or loading hero images from the CDN. Remaining delta is below the 98% page threshold and is not visually significant.

**Status:** Accepted residual difference.

---

### 5. Jet popup overlay (Layout)

**Pages affected:** All  
**Category:** Layout  
**Why different:** Jet Popup plugin injects a page-load modal (`jet-popup-486`) not present in the desired baseline screenshot.

**Fix:** Already handled — popup scripts stripped at build time; popup hidden via CSS; removed in Playwright before capture.

**Impact:** No popup-related diff pixels.

---

### 6. Menu mac-menu empty image circles (Missing content — not a rebuild bug)

**Pages affected:** Menu  
**Category:** Missing content, Image  
**Why different:** Both the **original and rebuild** menu pages show empty orange circular placeholders for Banh Mi, Coffee, and Refreshers sections during headless capture. This is identical on both sites — the mac-menu plugin renders some category images client-side after interaction or from CDN assets that don't load in the test environment.

**Fix:** No rebuild change needed; these regions match between old and new (main content band at 100% similarity).

---

## Sections That Already Matched (Unchanged)

- **Header / navigation** — logo, nav links, Order Now button (≥ 99.97% per page)
- **Footer** — contact info, business hours, social icons, copyright (≥ 99.98%)
- **Main content body** — text, spacing, layout grids on About, Contact, Gallery, Menu (≥ 98.69%)
- **Home page hero carousel, menu sections, gallery grid** — already at 100% before hero mask fix
- **QR Code page** — entire page at 100%

---

## Iteration Summary

| Iteration | Avg Score | Key Change |
|-----------|-----------|------------|
| 1 (wrong server) | ~40% | Custom components on port 3000 |
| 2 (crawled HTML) | 96.97% | Switched to crawled HTML builder |
| 3 (lazy-load + scroll) | 96.97% | No change — root cause not lazy-load |
| 4 (local mask SVG) | **99.40%** | Fixed cross-origin CSS mask on hero images |

---

## Files Modified

| File | Change |
|------|--------|
| `scripts/build-pages-from-crawl.mjs` | Local mask CSS, lazy-load strip/fix, hero widget selectors |
| `scripts/visual-compare.mjs` | Scroll-to-load, force `e-lazyloaded`, font/image wait |
| `scripts/run-comparison.mjs` | Port 3000 cleanup, server readiness check |
| `src/assets/masks/circle.svg` | **New** — Elementor circle mask shape |
| `src/pages/index.html` | Regenerated from crawl |
| `src/pages/about-us.html` | Regenerated from crawl |
| `src/pages/contact-us.html` | Regenerated from crawl |
| `src/pages/gallery.html` | Regenerated from crawl |
| `src/pages/menu.html` | Regenerated from crawl |
| `src/pages/qr-code.html` | Regenerated from crawl |
| `comparison/report.html` | Updated with final scores and screenshots |

---

## Remaining Differences (Non-Significant)

All pages exceed 98%. Residual diffs are concentrated in the **hero band (120–650px)**:

| Page | Hero Band Similarity | Cause |
|------|---------------------|-------|
| Contact Us | ~95% | JPEG vs WebP color/compression |
| About Us | ~97% | JPEG vs WebP color/compression |
| Gallery | ~95% | JPEG vs WebP color/compression |
| Menu | ~95% | JPEG vs WebP color/compression |

These do not affect overall page scores and are not visible to the naked eye at normal viewing distance.

---

## How to Re-run Comparison

```bash
npm run compare
```

This will rebuild pages, start Vite on port 3000, capture screenshots, and update `comparison/report.html`.
