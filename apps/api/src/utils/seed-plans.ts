import { eq, inArray } from "drizzle-orm";
import db, { schema } from "../database";

export type PlanSeed = {
  id: string;
  name: string;
  maxZones: number | null;
  monthlyPrice: number;
  /** Whether this plan can be self-serve upgraded to via Razorpay Checkout. */
  selfServeCheckout: boolean;
};

// Placeholder pricing — update before going live. monthlyPrice is in paise
// (Razorpay's minor unit for INR): 99900 = ₹999.00.
export const PLAN_SEEDS: PlanSeed[] = [
  {
    id: "free",
    name: "Free",
    maxZones: 1,
    monthlyPrice: 0,
    selfServeCheckout: false,
  },
  {
    id: "pro",
    name: "Pro",
    maxZones: 5,
    monthlyPrice: 99900,
    selfServeCheckout: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    maxZones: null,
    monthlyPrice: 0,
    selfServeCheckout: false,
  },
];

export const DEFAULT_PLAN_ID = "free";

// Placeholder pricing for one AMC seat (one activation-term), in paise.
export const AMC_SEAT_PRICE_PAISE = 49900;

/**
 * Seed the fixed plan catalog and backfill a workspace_subscription row
 * (defaulting to the free plan) for every workspace that doesn't have one
 * yet. Runs on API startup after Drizzle migrations, mirroring
 * seedDefaultWorkspaceRoles.
 *
 * Keeping every workspace on exactly one subscription row means entitlement
 * checks never need an "or else assume free" branch — the row is always
 * there to read.
 *
 * Idempotent: only inserts rows that aren't already present.
 */
export async function seedPlansAndSubscriptions() {
  try {
    const existingPlans = await db
      .select({ id: schema.planTable.id })
      .from(schema.planTable);
    const existingPlanIds = new Set(existingPlans.map((p) => p.id));

    for (const plan of PLAN_SEEDS) {
      if (existingPlanIds.has(plan.id)) {
        // Keep the fixed catalog (name/limits/price/checkout eligibility) in
        // sync with PLAN_SEEDS on every boot — this table isn't admin-edited
        // in the UI, so the seed constants are the single source of truth.
        // razorpayPlanId is intentionally left untouched: it's lazily
        // populated by getOrCreateRazorpayPlan on first checkout, not seeded.
        await db
          .update(schema.planTable)
          .set({
            name: plan.name,
            maxZones: plan.maxZones,
            monthlyPrice: plan.monthlyPrice,
            selfServeCheckout: plan.selfServeCheckout,
          })
          .where(eq(schema.planTable.id, plan.id));
        continue;
      }
      await db.insert(schema.planTable).values(plan);
    }

    const workspaces = await db
      .select({ id: schema.workspaceTable.id })
      .from(schema.workspaceTable);

    if (workspaces.length === 0) {
      return;
    }

    const workspaceIds = workspaces.map((w) => w.id);

    const existingSubscriptions = await db
      .select({ workspaceId: schema.workspaceSubscriptionTable.workspaceId })
      .from(schema.workspaceSubscriptionTable)
      .where(
        inArray(schema.workspaceSubscriptionTable.workspaceId, workspaceIds),
      );

    const subscribed = new Set(existingSubscriptions.map((s) => s.workspaceId));

    const rows: Array<typeof schema.workspaceSubscriptionTable.$inferInsert> =
      workspaceIds
        .filter((id) => !subscribed.has(id))
        .map((workspaceId) => ({
          workspaceId,
          planId: DEFAULT_PLAN_ID,
          status: "active",
        }));

    if (rows.length === 0) {
      return;
    }

    const BATCH_SIZE = 1000;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      await db
        .insert(schema.workspaceSubscriptionTable)
        .values(rows.slice(i, i + BATCH_SIZE));
    }
    console.log(
      `✅ Seeded ${rows.length} default workspace subscription row(s) on the free plan.`,
    );
  } catch (error) {
    console.error("❌ Failed to seed plans/subscriptions:", error);
    throw error;
  }
}

export async function getPlanById(planId: string) {
  const [plan] = await db
    .select()
    .from(schema.planTable)
    .where(eq(schema.planTable.id, planId))
    .limit(1);
  return plan;
}
