/**
 * Payload encryption between the browser and the enquiry endpoint.
 *
 * ── What this is, and what it is not ─────────────────────────────────
 *
 * The browser generates a throwaway P-256 keypair, does ECDH against a public
 * key baked into the page, runs the shared secret through HKDF-SHA256, and
 * encrypts the enquiry with AES-256-GCM. Only the holder of the matching
 * private key — the server, and nothing else — can read it. That is standard
 * hybrid encryption (ECIES), and it is real.
 *
 * It is *not* end-to-end encryption, and calling it that would be a lie worth
 * catching before it reaches a client-facing page. End-to-end means only the
 * two endpoints can read the message. The endpoint here is an email inbox and a
 * WhatsApp number, and the server has to hold the plaintext to compose both —
 * so the server can read every enquiry, by design and by necessity. There is no
 * arrangement of keys that changes that while the form still emails anybody.
 *
 * It is also not what protects the data in transit. TLS already does that, and
 * TLS 1.3 is stronger than anything a page can bolt on top of it: a key shipped
 * to a browser is a key an attacker can read out of the bundle, so client-side
 * encryption with a shipped *secret* would be theatre. This works only because
 * the key in the bundle is a PUBLIC key and the private half never leaves the
 * server.
 *
 * What it genuinely buys, as defence in depth:
 *
 *   - A proxy, CDN or WAF that terminates TLS sees ciphertext, not names and
 *     phone numbers.
 *   - Request-body logging — the platform's, an APM agent's, or an accidental
 *     one — captures ciphertext.
 *   - A replayed or intercepted body is useless without the private key.
 *
 * What it does not buy: protection from a compromised server, or from anything
 * running in the visitor's own browser.
 *
 * If no public key is configured the form posts plain JSON over TLS, which is
 * the ordinary, safe arrangement. Set ENQUIRY_REQUIRE_ENCRYPTION=1 to make the
 * server refuse plaintext once the keys are in place.
 */

/** Bound into the key derivation and the AEAD, so a payload cannot be replayed
 *  into some other protocol that happens to share the key. */
export const SEAL_LABEL = "zesstnow-enquiry-v1";

export type SealedPayload = {
  v: 1;
  /** The browser's ephemeral public key, SPKI DER, base64. */
  epk: string;
  /** HKDF salt, base64. */
  salt: string;
  /** AES-GCM nonce, 12 bytes, base64. */
  iv: string;
  /** Ciphertext with the GCM tag appended, base64. */
  ct: string;
};

export function isSealed(value: unknown): value is SealedPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.v === 1 &&
    typeof v.epk === "string" &&
    typeof v.salt === "string" &&
    typeof v.iv === "string" &&
    typeof v.ct === "string"
  );
}

export function toBase64(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < view.length; i++) binary += String.fromCharCode(view[i]);
  return btoa(binary);
}

export function fromBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
