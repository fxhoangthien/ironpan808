# IRON PAN Rebuild — TODO

## Before launch

- [ ] Replace Yelp `#` placeholder with real Yelp business URL (original site used `#link_yelp`)
- [ ] Wire up feedback form on Contact / QR pages (original used WordPress Contact Form 7)
- [ ] Confirm Google Maps embed and `maps.app.goo.gl` link still resolve correctly
- [ ] Set production `og:image` to absolute URL on deployed domain
- [ ] Configure hosting for clean URLs (`/menu` → `menu.html`)
- [ ] Add `robots.txt` and `sitemap.xml` for the new static site
- [ ] Run Lighthouse audit and optimize any flagged images (large Pan-* files)

## Optional enhancements

- [ ] Add WebP/AVIF variants with `<picture>` for faster loading (webp copies exist in crawl)
- [ ] Implement QR code popup from original homepage (Jet Popup)
- [ ] Add promo popup modal (original had scheduled popup)
- [ ] Connect online ordering if a third-party platform is used
- [ ] Add analytics (Site Kit / GA4 was on original WordPress site)

## Content sync

- [ ] Re-run crawler if live site content changes
- [ ] Run `npm run prepare:assets` then `npm run pages` after crawl updates
- [ ] Diff `/output/content.md` against `/src/data/` to verify text parity

## QA checklist

- [ ] All 6 pages render on mobile, tablet, desktop
- [ ] Navigation highlights active page
- [ ] Mobile menu opens/closes
- [ ] Home gallery carousel autoplays and dots work
- [ ] Gallery page lightbox opens/closes
- [ ] All menu items and prices match `content.md`
- [ ] Phone `tel:` link dials on mobile
- [ ] No requests to `ironpan808.com/wp-content` in Network tab

## Known gaps vs original

- Decorative SVG icons simplified (original used inline Elementor icons)
- Template background image from macusaone.com not crawled (decorative only)
- Mac Marketing footer credit preserved on QR page only (as extracted)
- Menu side item images on full menu page: sides section has no images in crawl HTML
