import { and, eq, isNull } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db, { schema } from "../database";
import { getRazorpayClient } from "./razorpay-client";

/**
 * Razorpay Plans are provisioned lazily on first checkout rather than via a
 * one-off setup script — the first workspace to upgrade to a given tier
 * creates the Razorpay Plan and the id is cached on plan.razorpayPlanId for
 * every subsequent checkout.
 */
export async function getOrCreateRazorpayPlan(planId: string) {
  const [plan] = await db
    .select()
    .from(schema.planTable)
    .where(eq(schema.planTable.id, planId))
    .limit(1);

  if (!plan) {
    throw new HTTPException(400, { message: `Unknown plan: ${planId}` });
  }

  if (!plan.selfServeCheckout) {
    throw new HTTPException(400, {
      message: `${plan.name} is not available for self-serve checkout. Contact sales.`,
    });
  }

  if (plan.razorpayPlanId) {
    return plan.razorpayPlanId;
  }

  const razorpay = getRazorpayClient();
  const razorpayPlan = await razorpay.plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: `Solarplan ${plan.name}`,
      amount: plan.monthlyPrice,
      currency: "INR",
    },
  });

  // Guard against a concurrent first-checkout creating a second Razorpay
  // Plan for the same tier: only persist this id if the column is still
  // unset. If another request won the race, defer to whichever id it wrote
  // rather than overwrite it with ours.
  await db
    .update(schema.planTable)
    .set({ razorpayPlanId: razorpayPlan.id })
    .where(
      and(
        eq(schema.planTable.id, planId),
        isNull(schema.planTable.razorpayPlanId),
      ),
    );

  const [updated] = await db
    .select({ razorpayPlanId: schema.planTable.razorpayPlanId })
    .from(schema.planTable)
    .where(eq(schema.planTable.id, planId))
    .limit(1);

  return updated?.razorpayPlanId ?? razorpayPlan.id;
}
