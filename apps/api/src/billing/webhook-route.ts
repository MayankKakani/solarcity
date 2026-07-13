import type { Context } from "hono";
import { handleRazorpayWebhook } from "./webhook-handler";

export async function handleRazorpayWebhookRoute(c: Context) {
  const arrayBuffer = await c.req.arrayBuffer();
  const body = Buffer.from(arrayBuffer).toString("utf8");

  const signature =
    c.req.header("x-razorpay-signature") ||
    c.req.header("X-Razorpay-Signature");
  const eventId =
    c.req.header("x-razorpay-event-id") || c.req.header("X-Razorpay-Event-Id");

  const result = await handleRazorpayWebhook(body, signature, eventId);

  if (!result.success) {
    return c.json({ error: result.error }, result.status as 400 | 503);
  }

  return c.json({ status: "success" });
}
