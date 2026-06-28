# IRON PAN Website Rebuild

Static rebuild of [ironpan808.com](https://ironpan808.com) generated from crawled content in `/output`. No WordPress, no hotlinked images — all media is served locally from `/src/assets`.

## Stack

- **Vite** — multi-page static site (MPA)
- **Vanilla HTML/CSS/JS** — no framework runtime
- **Component modules** — reusable `render()` functions in `/src/components`
- **Google Fonts** — EB Garamond (headings) + Poppins (body), matching the original site

## Project structure

```
src/
├── components/     Navbar, Hero, MenuSection, Gallery, About, Contact, Footer
├── pages/          Generated HTML (6 pages)
├── assets/
│   ├── images/     Content photos (from /output/images)
│   └── logos/      Logos & favicons (from /output/assets)
├── styles/         CSS design system
├── data/           Site copy, menu data, image paths
└── js/             Nav, carousel, lightbox
output/             Crawl source of truth (do not edit for site content)
dist/               Production build output
scripts/
├── build-pages.mjs Compose components → HTML
└── prepare-assets.mjs Sync /output → /src/assets
```

## Pages

| Page | File | Source path |
|------|------|-------------|
| Home | `index.html` | `/` |
| About | `about-us.html` | `/about-us` |
| Menu | `menu.html` | `/menu` |
| Gallery | `gallery.html` | `/gallery` |
| Contact | `contact-us.html` | `/contact-us` |
| QR Code | `qr-code.html` | `/qr-code` |

## Commands

```bash
# Sync images from /output (after re-crawl)
npm run prepare:assets

# Regenerate HTML from components + data
npm run pages

# Development server
npm run dev

# Production build → /dist
npm run build

# Preview production build
npm run preview
```

## Development workflow

1. Content changes → edit `/src/data/` (text must match crawl extracts)
2. Layout/component changes → edit `/src/components/` and `/src/styles/`
3. Run `npm run pages` to regenerate HTML
4. Run `npm run dev` to preview

## Deployment

Build with `npm run build` and deploy the `/dist` folder to any static host (Netlify, Vercel, Cloudflare Pages, S3, etc.).

For clean URLs (`/menu` instead of `/menu.html`), configure your host to rewrite paths or rename outputs during deploy.

## Visual comparison (Playwright)

Compare the live site against the local rebuild:

```bash
# Full pipeline: build → preview on :3000 → capture → diff → report
npm run compare

# Or manually:
npm run preview:3000          # terminal 1
npm run compare:visual          # terminal 2 (after server is up)
```

Output:

```
comparison/
├── old/          Screenshots from ironpan808.com
├── new/          Screenshots from localhost:3000
├── diff/         Pixel diff images
└── report.html   Similarity report per page
```

Pages compared are read from `/output/sitemap.json`.

## SEO

Each page includes:

- Unique `<title>` and meta description (from crawl)
- Canonical URLs
- Open Graph tags
- JSON-LD `Restaurant` schema
- Semantic HTML with full text content server-rendered in HTML (not JS-only)

## Credits

Content and imagery © IRON PAN. Rebuilt from owner-provided crawl data.
