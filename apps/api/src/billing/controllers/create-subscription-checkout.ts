import { HTTPException } from "hono/http-exception";
import { getRazorpayCredentials } from "../../utils/razorpay-env";
import { getOrCreateRazorpayPlan } from "../get-or-create-razorpay-plan";
import { getRazorpayClient } from "../razorpay-client";

const SUBSCRIPTION_TOTAL_COUNT = 12; // 12 monthly cycles; renews via a fresh subscription after

async function createSubscriptionCheckout(workspaceId: string, planId: string) {
  const razorpayPlanId = await getOrCreateRazorpayPlan(planId);
  const razorpay = getRazorpayClient();

  const subscription = await razorpay.subscriptions.create({
    plan_id: razorpayPlanId,
    total_count: SUBSCRIPTION_TOTAL_COUNT,
    notes: { workspaceId, planId },
  });

  if (!subscription.id) {
    throw new HTTPException(502, {
      message: "Razorpay did not return a subscription id.",
    });
  }

  const { keyId } = getRazorpayCredentials();

  return {
    subscriptionId: subscription.id,
    keyId,
  };
}

export default createSubscriptionCheckout;
