import { eq } from "drizzle-orm";
import db, { schema } from "../database";
import {
  DEFAULT_PLAN_ID,
  PLAN_SEEDS,
  type PlanSeed,
} from "../utils/seed-plans";

export type EffectivePlan = {
  planId: string;
  name: string;
  maxZones: number | null;
  status: string;
};

const FALLBACK_PLAN: PlanSeed =
  PLAN_SEEDS.find((plan: PlanSeed) => plan.id === DEFAULT_PLAN_ID) ??
  PLAN_SEEDS[0];

/**
 * Every workspace should have a workspace_subscription row (seeded on
 * creation and backfilled at boot — see seedPlansAndSubscriptions), but
 * this falls back to the free plan's limits if one is somehow missing
 * rather than letting an entitlement check throw on a lookup miss.
 */
export async function getEffectivePlan(
  workspaceId: string,
): Promise<EffectivePlan> {
  const [row] = await db
    .select({
      planId: schema.planTable.id,
      name: schema.planTable.name,
      maxZones: schema.planTable.maxZones,
      status: schema.workspaceSubscriptionTable.status,
    })
    .from(schema.workspaceSubscriptionTable)
    .innerJoin(
      schema.planTable,
      eq(schema.workspaceSubscriptionTable.planId, schema.planTable.id),
    )
    .where(eq(schema.workspaceSubscriptionTable.workspaceId, workspaceId))
    .limit(1);

  if (row) {
    return row;
  }

  return {
    planId: FALLBACK_PLAN.id,
    name: FALLBACK_PLAN.name,
    maxZones: FALLBACK_PLAN.maxZones,
    status: "active",
  };
}
