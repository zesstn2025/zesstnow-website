/**
 * Generates the P-256 keypair the contact form uses to encrypt submissions.
 *
 *   node scripts/enquiry-keys.mjs
 *
 * Prints two lines to paste into .env.local (and into the host's environment
 * settings). The public half is published to the browser on purpose — that is
 * what makes this safe, and it is why the variable carries the NEXT_PUBLIC_
 * prefix. The private half must never be committed, pasted into a chat, or
 * given a NEXT_PUBLIC_ name; anything with that prefix is inlined into the
 * JavaScript every visitor downloads.
 *
 * Rotating is safe and cheap: generate a new pair, replace both variables, and
 * redeploy. Nothing is stored under the old key, because nothing is stored at
 * all — the endpoint decrypts, notifies, and forgets.
 */
import { generateKeyPairSync } from "node:crypto";

const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });

const pub = publicKey.export({ format: "der", type: "spki" }).toString("base64");
const priv = privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");

console.log(`
Add these to .env.local, and to the environment settings of every deployment
that should accept encrypted submissions.

  NEXT_PUBLIC_ENQUIRY_PUBLIC_KEY=${pub}

  ENQUIRY_PRIVATE_KEY=${priv}

Once both are in place and you have confirmed the form still submits, you can
add ENQUIRY_REQUIRE_ENCRYPTION=1 to refuse plaintext submissions. Do that step
second, not first: a browser that cannot do Web Crypto falls back to plain TLS,
and turning this on before checking would turn those visitors away.
`);
