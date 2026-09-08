# Zesst Now Services Private Limited — marketing site

Next.js 15 App Router. Live at **www.cognitivecapitalsuite.com** (Vercel).
Read this file, then open only what the task needs. It exists so no session has
to rediscover the project — that rediscovery is the single largest avoidable
cost here.

## Hard rules — these are not preferences

- **Never touch `advnitinkumar-website` or `bizgst-pro`** — not their code, not
  their Supabase databases, not their deploys. They are separate projects with
  separate owners. Only their *portfolio entries* live on this site.
- **The advocate's live domain is `adnitinkumar.in`** — no "v". `advnitinkumar.in`
  does not resolve; it has been checked repeatedly. Never "correct" it.
- **Zero yellow, zero gold**, anywhere in the palette.
- **No secrets in git.** `.env*.local` is ignored and stays ignored.
- **No third-party contact data in this repo — it is public.** Prospect lists
  live in the Google Drive folder "Zesst Now — Funnel". `marketing/funnel/*.csv`
  is gitignored; the scripts rebuild it in minutes.

## Where things are

```
app/                 routes. [slug] pages are SSG from content/
components/          UI. Nothing here hardcodes user-facing text.
components/three/    R3F scenes — heavy, rarely the thing being edited.
content/site/        ALL site copy. See below.
content/blog/        blog posts, markdown. Publishing = a git commit.
content/announcements/
lib/content.ts       reads the markdown in content/
marketing/reels/     the daily Reel + Google Business system (Python)
marketing/funnel/    prospect harvest + outreach scripts (Python)
marketing/blog/      the blog topic queue
starter/             the client-site template — has its own CLAUDE.md
scripts/new-client.mjs   stands up a client site outside this repo
public/reels/        built videos, service card images, plan.json
```

## content/site/ — read the module, not the barrel

Copy used to be one 91 KB file. Reading it cost ~23,000 tokens, and a session
that only needed to fix a footer line paid all of it. It is now split:

| module | KB | holds |
|---|---|---|
| `company.ts` | 6.5 | registration facts, leadership, social accounts |
| `services.ts` | 14 | service list, USPs, verticals, process |
| `service-pages.ts` | 30 | full copy of each service page — the big one |
| `products.ts` | 18 | BizGST Pro, the suite, the roadmap |
| `pages.ts` | 21 | home, work, about, FAQ, contact, footer, legal, nav |
| `index.ts` | 1.2 | barrel — re-exports everything |

All 35 importers still use `from "@/content/site"` and must keep working.
**When editing, open the module.** Opening `index.ts` tells you nothing; opening
all five costs what the old file cost.

## Commands

```
npm run build        # the real check — must pass before any push
npx tsc --noEmit     # faster, catches type breakage alone
```

There is no test suite. The build is the gate.

## Publishing

- **Blog / announcements** — write markdown into `content/`, commit, push.
  Vercel deploys. There is no CMS and no admin step.
- **Reels and Google Business** — `marketing/reels/`. `plan.json` on the live
  site is what the scheduled job reads; regenerate it with `makeplan.py` after
  changing any post copy.
- **Funnel** — `marketing/funnel/`. State is on Drive, never here.

## Building a client site

```
node scripts/new-client.mjs <slug> "<नाम>" [phone]
```

Creates `../<slug>/` from `starter/`, fills in the name and number, and makes
the first commit. Each client gets their own repository and Vercel project —
they own it, and one client's site must never be able to break another's.

After that the work is four content modules and real photographs. Nothing in
the client's `app/` or `components/` should need touching; if it does, fix
`starter/` so every future client gets the fix too.

## Working cheaply — what actually costs tokens

Ranked by what has actually burned budget on this project:

1. **Reading a large file to change one line.** Grep for the string first, read
   with an offset. `content/site/service-pages.ts` and the `components/three/`
   scenes are the files worth being careful about.
2. **Tool output you did not need.** A directory listing that includes
   `node_modules`, an unfiltered log, a command that prints 30 KB of
   URL-encoded links. Pipe through `head`, filter, or write to a file and read
   the part you want.
3. **One long session covering unrelated work.** Everything earlier in the
   conversation is re-sent with every turn. Finish a piece of work, then
   `/clear`. One client site per session.
4. **Grepping the repo to find what uses something.** There is a code graph
   for that — see the `graphify` skill in `.claude/skills/`. Asking it who uses
   a component costs ~320 tokens; reading the component and grepping for its
   importers costs closer to 5,000 and answers less.
5. **Re-establishing context that should have been written down.** If a fact
   had to be explained twice, it belongs in this file or in a module's header
   comment — that is what they are for.

One thing a code graph does **not** buy you here: Claude Code does not read the
codebase at session start, it searches on demand, so there is no startup read to
optimise away and no "70% saving" to be had from indexing. What the graph is
actually good for is the narrower question in point 4 — who touches what — and
on that it was measured and it pays.

## House style

Comments explain **why**, never what the line already says. Match the density
already in the file. Provenance for any user-facing claim goes in the module
header — several already carry it, and it is the reason the copy can be trusted
without re-checking every launch.
