#!/usr/bin/env node
/**
 * Save a client's work back into this repository.
 *
 *   node scripts/save-client.mjs sharda-guest-house
 *
 * Copies the four content modules out of ../<slug>/ into clients/<slug>/ and
 * commits them. Run it before the session ends — the generated project lives in
 * a container that is destroyed afterwards, and these four files are the only
 * part of a client's site that is not already in starter/.
 *
 * Photographs are not copied. They are the client's own files, they are large,
 * and this repository is public; they belong in the deployment and in whatever
 * the client keeps, not here.
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2];

if (!slug) {
  console.error("  node scripts/save-client.mjs <slug>");
  process.exit(1);
}

const from = resolve(REPO, "..", slug, "content/site");
if (!existsSync(from)) {
  console.error(`  ${from} not found — was the project created with new-client.mjs?`);
  process.exit(1);
}

const to = join(REPO, "clients", slug);
mkdirSync(to, { recursive: true });
cpSync(from, to, { recursive: true });

// A saved site full of CONFIRM is a half-finished job, not a launched one.
// Saying so here is cheaper than discovering it on the client's phone.
const left = readdirSync(to)
  .filter((f) => f.endsWith(".ts"))
  .reduce((n, f) => {
    const src = readFileSync(join(to, f), "utf8");
    return n + src.split("\n").filter((l) =>
      !/^\s*(\/\/|\*|\/\*)/.test(l) && l.includes("CONFIRM")).length;
  }, 0);

try {
  execFileSync("git", ["add", `clients/${slug}`], { cwd: REPO });
  execFileSync("git", ["commit", "-qm",
    `${slug}: save the client's content modules`], { cwd: REPO });
  console.log(`  saved clients/${slug}/ and committed`);
} catch {
  console.log(`  saved clients/${slug}/ — nothing new to commit`);
}
if (left) console.log(`  ⚠ ${left} CONFIRM placeholder(s) still in there`);
console.log("  अब push कर दीजिए, वरना container के साथ चला जाएगा।");
