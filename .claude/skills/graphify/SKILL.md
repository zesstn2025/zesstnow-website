---
name: graphify
description: Answer "what uses this / what does this touch / what breaks if I change it" from the repo's code graph instead of reading files. Use before editing any shared component, lib helper or content module, and whenever tracing how something is wired. Triggers - "what uses", "who calls", "where is this imported", "what breaks if", "impact of changing", "how does X reach Y", "trace", "dependency", "is this still used", "safe to delete".
---

# Querying the code graph

This repository carries a graph of its own symbols and how they connect. Query
it before opening files, whenever the question is *how things are wired* rather
than *what a function does*.

Measured on this repo: asking the graph who uses `ContactSection` costs about
320 tokens and answers completely. Reading `components/ContactSection.tsx` to
find out costs about 5,000 and still does not tell you who imports it — that
needs a repo-wide grep on top.

## Setup

```bash
. /tmp/gv/bin/activate 2>/dev/null || {
  python3 -m venv /tmp/gv && . /tmp/gv/bin/activate && pip install -q graphifyy
}
```

If `graphify-out/graph.json` is missing — a fresh container always is — build
it once. It takes about a minute and **needs no API key and no LLM**:

```bash
graphify update . --no-cluster
```

`--no-cluster` skips the community-naming step, which is the only part that
would call a model. Do not drop it, and never set an API key for this.

## Asking

```bash
graphify explain "ContactSection"          # what it is, who uses it, what it calls
graphify path "app/page.tsx" "sendMail"    # how one thing reaches another
```

`explain` takes a symbol or file name. Its output is small on purpose — read it
whole, then open only the one or two files it points at.

## When it earns its keep

- **Before changing a shared component.** `explain` lists every importer, so
  you know the blast radius before you touch it, not after the build fails.
- **Before deleting anything.** Degree 0 means nothing references it. A grep
  cannot prove that as cheaply.
- **Tracing a flow** — a form submit to the mail that leaves. `path` returns
  the chain instead of you reading each hop.

## When to skip it

- You need to know *what the code does*, not what it touches. Read the file.
- The file is small, or you already know where it is. A single `Read` beats
  building a graph.
- You are editing copy in `content/site/`. Those modules are data, and
  `CLAUDE.md` already says which one holds what.

## Rules

- **Never read `graph.json` directly.** It is about 5 MB — roughly 1.3 million
  tokens. Only ever query it through the commands above. The whole point is
  that the graph stays out of the conversation.
- `graphify-out/` is gitignored and must stay that way.
- After a refactor that deleted code, refresh with
  `graphify update . --no-cluster --force`; otherwise a stale graph will name
  symbols that no longer exist.
