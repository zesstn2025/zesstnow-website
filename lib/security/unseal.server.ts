import { createPublicKey, createPrivateKey, diffieHellman, hkdfSync, createDecipheriv } from "node:crypto";
import { SEAL_LABEL, type SealedPayload } from "./sealed";

/**
 * The server half of the enquiry encryption. Mirrors lib/security/seal.client.ts
 * exactly: ECDH over P-256, HKDF-SHA256 to a 256-bit key, AES-256-GCM with the
 * label as additional authenticated data.
 *
 * The private key exists only here. It is read from the environment, never sent
 * anywhere, and never appears in a response — including in an error.
 */

export function encryptionConfigured() {
  return !!process.env.ENQUIRY_PRIVATE_KEY?.trim();
}

export function encryptionRequired() {
  return process.env.ENQUIRY_REQUIRE_ENCRYPTION?.trim() === "1";
}

/**
 * Returns the plaintext object, or null if the payload could not be opened.
 *
 * Every failure returns the same null. A decryption routine that reports *why*
 * it failed — bad tag, bad key, bad point — hands an attacker a probe, and the
 * difference between those answers is exactly what a padding-oracle style
 * attack is built out of. The detail goes to the server log; the caller gets a
 * yes or a no.
 */
export function unseal(payload: SealedPayload): unknown | null {
  const privateKeyB64 = process.env.ENQUIRY_PRIVATE_KEY?.trim();
  if (!privateKeyB64) return null;

  try {
    const privateKey = createPrivateKey({
      key: Buffer.from(privateKeyB64, "base64"),
      format: "der",
      type: "pkcs8",
    });

    const publicKey = createPublicKey({
      key: Buffer.from(payload.epk, "base64"),
      format: "der",
      type: "spki",
    });

    // Rejects a public key from a different curve, which is one of the ways a
    // caller could try to steer the derivation.
    if (publicKey.asymmetricKeyType !== "ec") return null;

    const shared = diffieHellman({ privateKey, publicKey });
    const key = Buffer.from(
      hkdfSync("sha256", shared, Buffer.from(payload.salt, "base64"), Buffer.from(SEAL_LABEL), 32)
    );

    const iv = Buffer.from(payload.iv, "base64");
    if (iv.length !== 12) return null;

    const sealed = Buffer.from(payload.ct, "base64");
    // Web Crypto appends the 16-byte GCM tag to the ciphertext; Node wants them
    // separately.
    if (sealed.length <= 16) return null;
    const tag = sealed.subarray(sealed.length - 16);
    const body = sealed.subarray(0, sealed.length - 16);

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAAD(Buffer.from(SEAL_LABEL));
    decipher.setAuthTag(tag);

    // Throws if the tag does not verify, which is the whole point of GCM: a
    // payload that was altered in flight never becomes plaintext.
    const plaintext = Buffer.concat([decipher.update(body), decipher.final()]);
    return JSON.parse(plaintext.toString("utf8"));
  } catch (error) {
    console.error("[enquiry] sealed payload could not be opened", error);
    return null;
  }
}
