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
NEXT_PUBLIC_SITE_URL=https://zesstnow.com
```

Used for canonical URLs, Open Graph and `sitemap.xml`. Defaults to
`https://zesstnow.com`; set it to the real domain before launch.

## Editing content

**All user-facing copy lives in [`content/site.ts`](content/site.ts).** Nothing in
`components/` hardcodes text. To change a headline, a feature list, the phone
number or a product description, edit that one file.

Lines marked `CONFIRM:` in that file are **drafted copy that has not been
verified against the real product**. `bizgstpro.com` and
`cognitivecapitalsuite.com` were unreachable from the build environment, so the
product descriptions are written from the product names and category. Replace
them before the site goes public:

- BizGSTPro — real feature list, audience, pricing, screenshots
- Cognitive Capital Suite — confirmed positioning and launch status
- `company.email` — currently a placeholder (`hello@zesstnow.com`)
- `company.phone` — currently Adv. Nitin Kumar's number, used as a stand-in
- `company.domain` — final deployment domain

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
  products/[product]/page.tsx     one route per product
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
