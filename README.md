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

**Structural copy lives in [`content/site.ts`](content/site.ts)** — headlines,
services, products, verticals, legal pages. Nothing in `components/` hardcodes
text.

**Blog posts and announcements are markdown files** in `content/blog/` and
`content/announcements/`, edited through the admin at `/admin` or directly in
the repo. Publishing is a git commit, so the live site always matches what is in
version control.

### The admin

`/admin` runs Sveltia CMS against this repository. Anyone with push access can
publish; nobody else can, so the repo's collaborator list is the access control
and there is no separate user table to maintain.

Two ways in, and **the token is the one that works with nothing configured**:

- **Sign In with Token** — the login screen links to GitHub's token page with
  the right scopes pre-selected. Paste the token back; it lives in that
  browser's local storage. No OAuth app, no environment variables, no redeploy.
- **Sign in with GitHub** (OAuth) — nicer for several editors, but it needs
  `GITHUB_OAUTH_CLIENT_ID` and `GITHUB_OAUTH_CLIENT_SECRET` on the Vercel
  project, from an OAuth App whose callback is
  `https://www.cognitivecapitalsuite.com/api/admin/callback`.
  `app/api/admin/auth` and `app/api/admin/callback` implement the handshake;
  the token reaches the CMS tab and is never stored server-side. If the
  variables are absent, `/api/admin/auth` returns a 500 that names which of
  them the running deployment can actually see.

Deliberately **not** a database: the company already runs two Supabase projects
for its other products, and a free-tier org only keeps two active. A third would
have put those at risk for no gain here.

BizGST Pro's copy — features, plans, contact details — is read from the
product's own pages (`bizgstpro.com`, `/pricing`, `/contact`, `/about`), not
invented. Company registration facts come from MCA records.

### On cognitivecapitalsuite.com

**This site ships on that domain**, on the `www` host — Vercel redirects the apex to it, so every canonical URL names `www`. It is not a product — it is the company's
own domain, and this site is both the Zesst Now company site and its portfolio:
BizGST Pro, adnitinkumar.in, and every future site, CRM and SaaS listed in one
place, in the `portfolio` section of `content/site.ts`.

The advocate site's domain is **adnitinkumar.in** — no `v`. An earlier version of
this repo said `advnitinkumar.in`, which does not resolve; the correct spelling is
noted in `content/site.ts` so it does not get "corrected" back.

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

## The 3D

Decoration, never content. Everything the page says is real HTML that reads
correctly with the canvas absent.

**One canvas, one WebGL context, for the entire site.** `components/three/Stage3D.tsx`
mounts a single fixed `<Canvas>` in the root layout, and every scene on every
page is a drei `<View>` drawn into it as a scissored rectangle. Navigating does
not create or destroy a context. Measured across seven client-side navigations:
2 contexts created, 1 released, 1 live — and the released one is the throwaway
probe that asks whether WebGL works at all.

That matters more than it sounds. A browser keeps only a handful of live
contexts, around eight on a desktop and fewer on a phone, and silently discards
the oldest when the limit is passed. Nothing is logged; canvases just go black
after a minute of browsing.

Two consequences worth knowing before adding a scene:

- **A `<View>` gives its children their own scene.** Anything scene-level — an
  `<Environment>` above all — has to be declared *inside* the view. Put it beside
  `<View.Port />` and every metal surface renders pure black. See
  `components/three/Studio.tsx`.
- **Postprocessing cannot run inside a view.** An `EffectComposer` takes over the
  whole frame. The hero's bloom and vignette were dropped for this reason; the
  vignette is now a CSS gradient over the same box.

The scenes:

- `components/three/Field.tsx` — the ambient starfield and wireframe solids, the
  one thing rendered into the *root* scene rather than a view, so it fills the
  frame behind everything. It also has to draw itself: `View` subscribes to the
  frame loop with a render priority, and any priority above zero switches off
  R3F's automatic render, so `FieldPass` renders the root scene at a lower
  priority than the views.
- `components/three/Scene.tsx` — the hero subject: `Core.tsx` (refractive
  centrepiece), `Satellites.tsx`, `AuroraRibbons.tsx` (custom GLSL)
- `components/three/Morph.tsx` — the superformula shape on the services chapter
- `components/three/scenes/` — one file per section scene: the portal spheres,
  the agent orb, the vault, the dashboard, the storefront, the funnel, the
  envelope

`components/Motion.tsx` adds the pointer layer: a cursor glow, magnetic pills and
scroll parallax on the portfolio frames. Each effect writes a transform to a
*leaf* element — a transform on a container would break the `position: sticky`
panel on the about page.

Guards that keep it honest on slow hardware:

- Mounts only after `load` + an idle callback, so it never competes with first paint
- Skipped entirely for `prefers-reduced-motion`, missing WebGL, ≤2 CPU cores, or
  a narrow viewport on a weak device — those get the static poster in `Stage.tsx`
- `frameloop="never"` whenever the canvas is off-screen or the tab is hidden
- DPR capped at 1.5, with `AdaptiveDpr` and `PerformanceMonitor` degrading further
- `frameloop="never"` whenever the tab is hidden
- Lighting uses drei `Lightformer`s, not a CDN-hosted HDRI — no third-party runtime dependency

## Security

Headers are set in `middleware.ts` for every response: a Content-Security-Policy,
`X-Frame-Options: DENY` and `frame-ancestors 'none'` against clickjacking,
`X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`,
HSTS for two years including subdomains, and the cross-origin isolation pair.

The CSP carries `'unsafe-inline'` on `script-src`, and that is a documented
choice rather than an oversight — the reasoning is in the file. In short: the
strict form needs a per-request nonce, a nonce needs per-request HTML, and every
page here is prerendered at build time. Nothing on the site renders
attacker-supplied HTML, so what the policy still enforces is the part that
contains an attack: script from this origin only, `object-src 'none'`,
`base-uri 'self'`, `form-action 'self'`, `connect-src 'self'`.

On the contact endpoint, in the order they run — cheap and certain first, so
abuse is rejected before it costs anything:

1. **Body size**, refused before it is parsed.
2. **CSRF** — `Sec-Fetch-Site`, `Origin` against the request's own host, and a
   double-submit token from a `SameSite=Strict` cookie middleware issues.
3. **Rate limit**, two windows: three a minute, twenty an hour. In memory, so on
   a serverless platform it is per warm instance — it makes one attacker
   expensive and does not stop a distributed one.
4. **Decrypt**, if the payload is sealed (below).
5. **Honeypot**, answered with a 200 so a bot learns nothing.
6. **Normalise, then validate** — NFKC, control characters and Unicode bidi
   overrides stripped, every field length-capped.
7. **Send.**

Nothing is stored: no database, so there is no data at rest and no SQL to
inject into. Rejections never say which check failed, and no stack trace or
provider response body reaches the browser — that all goes to the server log.

**Payload encryption** (`lib/security/sealed.ts`) is optional and off until you
generate keys with `npm run enquiry:keys`. The browser encrypts the submission
with AES-256-GCM under a key derived per submission by ECDH against a published
public key; only the server's private key opens it.

It is defence in depth *underneath* TLS, not a replacement for it, and it is
**not** end-to-end encryption — the server has to hold the plaintext to compose
an email and a WhatsApp message. What it buys is that a proxy terminating TLS,
or a platform logging request bodies, sees ciphertext instead of names and phone
numbers. The file says so at length, and the security badge on the fintech page
is worded to match: no "zero-knowledge", no "end-to-end", no "bank-grade",
because none of those would be true.

## The contact form

Submitting posts to `app/api/enquiry/route.ts`, which emails the desk through
Resend and pings the founder's WhatsApp. Both sets of credentials are read from
the server environment and never reach the browser — that endpoint exists for
exactly that reason.

Copy `.env.example` to `.env.local` and fill it in; the file documents every
variable, including which WhatsApp provider you are choosing between and the
24-hour-window rule that is the usual reason a working integration sends
nothing.

**With nothing configured the form still works.** It falls back to composing the
enquiry and handing it to WhatsApp from the browser, which is how it worked
before the endpoint existed. Nobody loses a lead over an unset variable.

The panel after submitting says one of three things and never guesses:
delivered (and by which channel), ready for you to send yourself (nothing is
configured), or we could not deliver it (the providers were tried and failed).
The 3D envelope only flies once the server has answered.

## Structure

```
app/
  layout.tsx                      fonts, metadata, Organization JSON-LD,
                                  FieldStage + Motion mounted once for every route
  page.tsx                        homepage
  globals.css                     design tokens + every component style
  about/  services/  work/  contact/  products/
  products/bizgstpro/page.tsx     one route per product
  legal/[slug]/page.tsx           privacy · terms · refunds, from content/site.ts
  sitemap.ts  robots.ts  not-found.tsx
components/
  three/Scene Core Satellites AuroraRibbons Effects    hero canvas
  three/Field                                          site-wide ambient canvas
  Nav Footer Ticker Preloader Stage HeroStage PageHero
  WorkCard Motion TiltCard Faq ContactSection ProductVisual ProductPage
content/site.ts                   ★ all copy
lib/motion.ts                     3D gating, reveal + scroll hooks
scripts/                          portfolio screenshot pipeline
public/portfolio/                 the screenshots it produces
```

## Portfolio screenshots

The portfolio shows **real screenshots of the live sites**, not mockups. They are
regenerated, not hand-collected:

```bash
python3 scripts/mirror.py https://bizgstpro.com out / /pricing
cd out && python3 -m http.server 8801
node scripts/shots.js public/portfolio
```

`mirror.py` pulls a page and its same-origin asset tree down with curl and serves
it from localhost; `shots.js` drives headless Chromium over the local copy and
writes JPEGs. The detour through a local mirror exists because a sandboxed
Chromium often cannot use an egress proxy that curl can — screenshotting
localhost sidesteps the problem entirely. Point `shots.js` at the live URLs
directly if your environment has no such restriction.

Output is JPEG at quality 82: these render at card size, and PNG screenshots of a
dark gradient page run to 3 MB each.

## Notes

- The contact form has no backend. It composes a WhatsApp message and opens it —
  nothing is stored or transmitted by this site.
- The footer carries the legal name and CIN. Directors' names are deliberately
  not published.
- Loan and insurance copy says *facilitation* throughout, and each card carries a
  disclaimer: the company sources and documents, it does not lend or underwrite.
  Do not loosen that wording — it is what keeps the claims accurate.
- The four AI Academy course titles in `roadmap` are marked `CONFIRM:` and are
  descriptive placeholders. Replace them with the real course names.
