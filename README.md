# Zesst Now — official website

Marketing site for **Zesst Now Services Private Limited** (CIN U47110UP2025PTC217212),
a product and engineering studio in Kaushambi, Uttar Pradesh.

Static Next.js site with a real WebGL hero scene. No database, no backend — it
deploys as pure static output.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS 3 + a hand-written design system in `app/globals.css` |
| 3D | three.js · @react-three/fiber · @react-three/drei · @react-three/postprocessing |
| Motion | Lenis (smooth scroll) · IntersectionObserver reveals · CSS-3D tilt |

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build — must pass clean before deploying
npm start
```

Optional environment variable:

```
NEXT_PUBLIC_SITE_URL=https://www.cognitivecapitalsuite.com
```

Used for canonical URLs, Open Graph and `sitemap.xml`. Defaults to
`https://www.cognitivecapitalsuite.com`, so it only needs setting for preview
deployments that should not claim the canonical domain.

## Editing content

**All user-facing copy lives in [`content/site.ts`](content/site.ts).** Nothing in
`components/` hardcodes text. To change a headline, a feature list, the phone
number or a product description, edit that one file.

BizGST Pro's copy — features, plans, contact details — is read from the
product's own pages (`bizgstpro.com`, `/pricing`, `/contact`, `/about`), not
invented. Company registration facts come from MCA records.

### On cognitivecapitalsuite.com

**This site ships on that domain**, on the `www` host — Vercel redirects the apex to it, so every canonical URL names `www`. It is not a product — it is the company's
own domain, and this site is both the Zesst Now company site and its portfolio:
BizGST Pro, advnitinkumar.in, and every future site, CRM and SaaS listed in one
place, in the `portfolio` section of `content/site.ts`.

An earlier draft of this site invented an "AI financial intelligence" product
under that name, with features and an FAQ, none of which came from the company.
That was wrong and has been removed.

## Brand

The logo is generated, not hand-drawn, so the site and the exported files can
never drift apart:

```bash
pip install fonttools brotli
python3 brand/wordmark.py    # Sora 600 "ZESST NOW" -> brand/wordmark.svg
python3 brand/brandgen.py    # composes every mark and lockup from it
node   brand/render.js       # PNG exports (optional; needs playwright)
```

`wordmark.py` finds Sora inside `.next/static/media` after a build — those
filenames are content hashes, so it identifies the font by its name table and
checks the subset actually covers the letters, rather than trusting a path.
Pass a `.woff2` explicitly to override. `render.js` uses whatever Chromium
Playwright resolves; set `CHROMIUM_PATH` to point at another one.

Re-running the two Python scripts reproduces the committed SVGs byte for byte.

`brand/brandgen.py` holds the mark's geometry as numbers — change those, re-run,
and the mark, mono cuts, favicon and lockups all follow. `components/Mark.tsx`
inlines the same path for the site; if you edit the geometry, update that path
too (it is the one place the value is duplicated, deliberately, to keep the nav
free of a network request).

Files land in `brand/` (SVG) and `brand/png/`:

| File | Use |
| --- | --- |
| `zesst-now-mark.svg` | primary — gradient tile, ink Z |
| `zesst-now-lockup.svg` | mark + wordmark, for dark backgrounds |
| `zesst-now-lockup-mono.svg` | single colour, for light backgrounds and print |
| `zesst-now-mark-mono.svg` | **black on transparent — the cut to file with the CA** |
| `zesst-now-mark-mono-tile.svg` | reversed, for stamps |
| `zesst-now-favicon.svg` | same Z, used at 32px and below |

The wordmark is converted to outlines, so no file depends on Sora being
installed anywhere.

## The 3D scene

The hero canvas is decoration, never content. Everything the page says is real
HTML that reads correctly with the canvas absent.

- `components/three/Scene.tsx` — canvas, camera rig, lighting, performance guards
- `components/three/Core.tsx` — the refractive centrepiece
- `components/three/Satellites.tsx` — orbiting glass chips and shards
- `components/three/AuroraRibbons.tsx` — shader ribbons (custom GLSL)
- `components/three/Effects.tsx` — bloom, chromatic aberration, vignette

Guards that keep it honest on slow hardware:

- Mounts only after `load` + an idle callback, so it never competes with first paint
- Skipped entirely for `prefers-reduced-motion`, missing WebGL, ≤2 CPU cores, or
  a narrow viewport on a weak device — those get the static poster in `Stage.tsx`
- `frameloop="never"` whenever the canvas is off-screen or the tab is hidden
- DPR capped at 1.5, with `AdaptiveDpr` and `PerformanceMonitor` degrading further
- Lighting uses drei `Lightformer`s, not a CDN-hosted HDRI — no third-party runtime dependency

## Structure

```
app/
  layout.tsx                      fonts, metadata, Organization JSON-LD
  page.tsx                        homepage
  globals.css                     design tokens + every component style
  products/bizgstpro/page.tsx     one route per product
  sitemap.ts  robots.ts  not-found.tsx
components/
  three/                          WebGL scene
  Nav Footer Ticker Preloader Stage HeroStage
  TiltCard Faq ContactSection ProductVisual ProductPage RevealObserver
content/site.ts                   ★ all copy
lib/motion.ts                     3D gating, reveal + scroll hooks
```

## Notes

- The contact form has no backend. It composes a WhatsApp message and opens it —
  nothing is stored or transmitted by this site.
- The footer carries the legal name and CIN. Directors' names are deliberately
  not published.
