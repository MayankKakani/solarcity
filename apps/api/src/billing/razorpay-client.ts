import { HTTPException } from "hono/http-exception";
import Razorpay from "razorpay";
import {
  getRazorpayCredentials,
  isRazorpayConfigured,
} from "../utils/razorpay-env";

export function getRazorpayClient(): Razorpay {
  if (!isRazorpayConfigured()) {
    throw new HTTPException(503, {
      message: "Billing is not configured on this instance.",
    });
  }

  const { keyId, keySecret } = getRazorpayCredentials();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
