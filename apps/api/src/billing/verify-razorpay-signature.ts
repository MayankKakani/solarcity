import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyRazorpaySignature(
  payload: string,
  secret: string,
  signatureHeader: string | undefined,
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    const a = Buffer.from(signatureHeader.trim(), "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return signatureHeader.trim() === expected;
  }
}
