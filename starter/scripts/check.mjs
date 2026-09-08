/**
 * The launch check. Run it before handing a site to a client.
 *
 * It looks for the two failures that actually happen on these sites: a
 * CONFIRM placeholder that nobody replaced, and a phone number that is not a
 * real Indian mobile. Both are invisible on the page until a customer hits
 * them, and both cost the client a real enquiry.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "content/site";
let problems = 0;

for (const f of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
  const src = readFileSync(join(dir, f), "utf8");
  src.split("\n").forEach((line, i) => {
    // A CONFIRM inside a comment is guidance for whoever fills the file in;
    // only the ones left in actual values are a problem.
    const isComment = /^\s*(\/\/|\*|\/\*)/.test(line);
    if (!isComment && line.includes("CONFIRM")) {
      console.log(`  ${dir}/${f}:${i + 1}  ${line.trim().slice(0, 78)}`);
      problems++;
    }
  });
}

const company = readFileSync(join(dir, "company.ts"), "utf8");
for (const key of ["phone", "whatsapp"]) {
  const m = company.match(new RegExp(`${key}:\\s*"([^"]*)"`));
  const v = m?.[1] ?? "";
  if (v && v !== "CONFIRM" && !/^[6-9]\d{9}$/.test(v)) {
    console.log(`  company.${key} is "${v}" — needs 10 digits starting 6-9`);
    problems++;
  }
}

if (problems) {
  console.log(`\n${problems} thing(s) to fix before launch.\n`);
  process.exit(1);
}
console.log("Ready to launch.\n");
