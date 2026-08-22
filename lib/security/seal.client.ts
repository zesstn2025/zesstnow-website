"use client";

import { SEAL_LABEL, toBase64, fromBase64, type SealedPayload } from "./sealed";

/**
 * The browser half of the enquiry encryption. See lib/security/sealed.ts for
 * what this does and does not protect against — the short version is that it
 * is defence in depth underneath TLS, not a replacement for it, and it is not
 * end-to-end encryption.
 *
 * Everything here degrades. `crypto.subtle` exists only in a secure context, so
 * a site opened over plain http on a LAN has no Web Crypto at all; a browser
 * without P-256 ECDH would throw on the first call. Both cases return null and
 * the form posts plain JSON over TLS, which is the ordinary arrangement and
 * perfectly safe. A contact form that silently stops working because a crypto
 * primitive was missing is a worse outcome than one that sends over TLS alone.
 */
export async function seal(
  data: unknown,
  publicKeyB64: string
): Promise<SealedPayload | null> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return null;

    const serverKey = await subtle.importKey(
      "spki",
      fromBase64(publicKeyB64) as unknown as ArrayBuffer,
      { name: "ECDH", namedCurve: "P-256" },
      false,
      []
    );

    // A fresh keypair per submission. Nothing is kept, so nothing can leak
    // later, and two enquiries never share a key.
    const ephemeral = await subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"]
    );

    const shared = await subtle.deriveBits(
      { name: "ECDH", public: serverKey },
      ephemeral.privateKey,
      256
    );

    // The raw ECDH output is not uniformly distributed and should never be used
    // as a key directly; HKDF is what turns it into one.
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hkdfKey = await subtle.importKey("raw", shared, "HKDF", false, ["deriveKey"]);
    const aesKey = await subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: salt as unknown as ArrayBuffer,
        info: new TextEncoder().encode(SEAL_LABEL) as unknown as ArrayBuffer,
      },
      hkdfKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv as unknown as ArrayBuffer,
        // Authenticated but not encrypted: the tag then covers the label too,
        // so a payload cannot be lifted into a different protocol.
        additionalData: new TextEncoder().encode(SEAL_LABEL) as unknown as ArrayBuffer,
      },
      aesKey,
      new TextEncoder().encode(JSON.stringify(data)) as unknown as ArrayBuffer
    );

    const epk = await subtle.exportKey("spki", ephemeral.publicKey);

    return {
      v: 1,
      epk: toBase64(epk),
      salt: toBase64(salt),
      iv: toBase64(iv),
      ct: toBase64(ct),
    };
  } catch {
    // Deliberately silent. The reason a browser could not do ECDH is of no use
    // to the visitor, and logging it puts a security-shaped message in a console
    // where it only looks alarming.
    return null;
  }
}
