import { eq } from "drizzle-orm";
import db, { schema } from "../database";
import { getRazorpayCredentials } from "../utils/razorpay-env";
import { verifyRazorpaySignature } from "./verify-razorpay-signature";

type RazorpayWebhookEnvelope = {
  event: string;
  payload: {
    subscription?: { entity: RazorpaySubscriptionEntity };
    payment?: { entity: RazorpayPaymentEntity };
    order?: { entity: RazorpayOrderEntity };
  };
};

type RazorpaySubscriptionEntity = {
  id: string;
  status: string;
  current_end: number | null;
  notes?: Record<string, string | number>;
};

type RazorpayPaymentEntity = {
  id: string;
  order_id: string | null;
  notes?: Record<string, string | number>;
};

type RazorpayOrderEntity = {
  id: string;
  notes?: Record<string, string | number>;
};

export type WebhookResult =
  | { success: true }
  | { success: false; status: number; error: string };

export async function handleRazorpayWebhook(
  rawBody: string,
  signatureHeader: string | undefined,
  eventIdHeader: string | undefined,
): Promise<WebhookResult> {
  const { webhookSecret } = getRazorpayCredentials();

  if (!webhookSecret) {
    return { success: false, status: 503, error: "Billing is not configured" };
  }

  if (!verifyRazorpaySignature(rawBody, webhookSecret, signatureHeader)) {
    return { success: false, status: 400, error: "Invalid signature" };
  }

  if (!eventIdHeader) {
    return { success: false, status: 400, error: "Missing event id" };
  }

  const [existing] = await db
    .select({ id: schema.billingEventTable.id })
    .from(schema.billingEventTable)
    .where(eq(schema.billingEventTable.razorpayEventId, eventIdHeader))
    .limit(1);

  // Razorpay redelivers webhooks that didn't get a 2xx in time; the same
  // X-Razorpay-Event-Id arriving twice is expected, not an error — treat it
  // as already-handled rather than reprocessing.
  if (existing) {
    return { success: true };
  }

  let envelope: RazorpayWebhookEnvelope;
  try {
    envelope = JSON.parse(rawBody);
  } catch {
    return { success: false, status: 400, error: "Invalid JSON payload" };
  }

  const workspaceId = extractWorkspaceId(envelope);

  await db.insert(schema.billingEventTable).values({
    workspaceId,
    razorpayEventId: eventIdHeader,
    type: envelope.event,
    payload: envelope,
  });

  await applyWebhookEvent(envelope);

  return { success: true };
}

function extractWorkspaceId(envelope: RazorpayWebhookEnvelope): string | null {
  const notes =
    envelope.payload.subscription?.entity.notes ??
    envelope.payload.order?.entity.notes ??
    envelope.payload.payment?.entity.notes;
  const workspaceId = notes?.workspaceId;
  return typeof workspaceId === "string" ? workspaceId : null;
}

async function applyWebhookEvent(envelope: RazorpayWebhookEnvelope) {
  switch (envelope.event) {
    case "subscription.activated":
    case "subscription.charged": {
      const subscription = envelope.payload.subscription?.entity;
      if (!subscription) return;
      await syncSubscriptionActive(subscription);
      return;
    }
    case "subscription.cancelled":
    case "subscription.completed":
    case "subscription.expired": {
      const subscription = envelope.payload.subscription?.entity;
      if (!subscription) return;
      await setSubscriptionStatus(subscription.id, "canceled");
      return;
    }
    case "subscription.halted": {
      const subscription = envelope.payload.subscription?.entity;
      if (!subscription) return;
      await setSubscriptionStatus(subscription.id, "past_due");
      return;
    }
    case "payment.captured": {
      const payment = envelope.payload.payment?.entity;
      if (!payment) return;
      await recordAmcSeatPurchase(payment);
      return;
    }
    default:
      return;
  }
}

async function syncSubscriptionActive(
  subscription: RazorpaySubscriptionEntity,
) {
  const workspaceId = subscription.notes?.workspaceId;
  const planId = subscription.notes?.planId;
  if (typeof workspaceId !== "string" || typeof planId !== "string") return;

  const currentPeriodEnd = subscription.current_end
    ? new Date(subscription.current_end * 1000)
    : null;

  const [existing] = await db
    .select({ id: schema.workspaceSubscriptionTable.id })
    .from(schema.workspaceSubscriptionTable)
    .where(eq(schema.workspaceSubscriptionTable.workspaceId, workspaceId))
    .limit(1);

  const values = {
    planId,
    status: "active",
    razorpaySubscriptionId: subscription.id,
    currentPeriodEnd,
  };

  if (existing) {
    await db
      .update(schema.workspaceSubscriptionTable)
      .set(values)
      .where(eq(schema.workspaceSubscriptionTable.workspaceId, workspaceId));
  } else {
    await db
      .insert(schema.workspaceSubscriptionTable)
      .values({ workspaceId, ...values });
  }
}

async function setSubscriptionStatus(
  razorpaySubscriptionId: string,
  status: "canceled" | "past_due",
) {
  await db
    .update(schema.workspaceSubscriptionTable)
    .set({ status })
    .where(
      eq(
        schema.workspaceSubscriptionTable.razorpaySubscriptionId,
        razorpaySubscriptionId,
      ),
    );
}

async function recordAmcSeatPurchase(payment: RazorpayPaymentEntity) {
  const workspaceId = payment.notes?.workspaceId;
  const seatsNote = payment.notes?.seats;
  if (typeof workspaceId !== "string") return;

  const seats = Number(seatsNote);
  if (!Number.isInteger(seats) || seats < 1) return;

  const [existing] = await db
    .select({ id: schema.amcSeatPurchaseTable.id })
    .from(schema.amcSeatPurchaseTable)
    .where(eq(schema.amcSeatPurchaseTable.razorpayPaymentId, payment.id))
    .limit(1);
  if (existing) return;

  await db.insert(schema.amcSeatPurchaseTable).values({
    workspaceId,
    seats,
    razorpayPaymentId: payment.id,
    note: "Purchased via Razorpay checkout",
  });
}
