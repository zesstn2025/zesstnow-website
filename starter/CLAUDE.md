# Client site — built from the Zesst Now starter

A small-business site: one town, one phone, a form that reaches somebody.
Next.js 15 App Router, plain CSS, no framework, no 3D. About 104 KB of JS on
first load — these pages are opened on mid-range phones on weak signal, and a
visitor who leaves before it paints costs the client the same as no site.

## The whole job is four files

```
content/site/brand.ts      colours, fonts, radius — the entire visual identity
content/site/company.ts    name, phone, WhatsApp, address, hours, accounts
content/site/services.ts   what they sell, and why this shop
content/site/pages.ts      hero, gallery, testimonials, about, FAQ, legal, nav
```

**Nothing in `app/` or `components/` should need changing for a normal client.**
If you are editing a component to get a client result, stop — either it belongs
in `brand.ts` as a token, or it is a real gap in the starter and should be fixed
there so every future client gets it.

`content/site/index.ts` is only a barrel. Open the module.

## Before launch

```
npm run check     # every leftover CONFIRM, and a malformed phone number
npm run build     # the gate — must pass
```

`check` exists because the two failures that actually happen on these sites are
invisible on the page: a placeholder nobody replaced, and a phone number that is
not a real mobile. A customer finds both before the client does.

## Rules

- **No yellow, no gold.** Company standard.
- **Real photographs only.** No stock. A visitor from two streets away can tell,
  and once they can, the site stops being proof of anything.
- **Never invent a testimonial, a rating or a year.** In a town this size the
  people it was meant to convince are the ones who will spot it.
- **Phone numbers are ten digits**, no +91 and no spaces. The code adds the
  country code where it is needed; a stored "+91 " produces broken `tel:` and
  `wa.me` links.
- **Don't add dependencies** without a reason that survives being said out loud.
  The starter is four packages. That is a feature.

## How enquiries reach the client

`app/api/enquiry/route.ts` mails through the SMTP set in `.env.local` (see
`.env.example`). If that is missing or fails, the API answers `fallback: true`
and the form hands the customer a WhatsApp link carrying the same text — the
enquiry still arrives. Configure SMTP if you can; the site works if you cannot.

The floating WhatsApp button hides itself when `company.whatsapp` is empty.
