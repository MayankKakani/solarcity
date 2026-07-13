import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db, { schema } from "../../database";

async function setOrganisationPlan(workspaceId: string, planId: string) {
  const [plan] = await db
    .select({ id: schema.planTable.id })
    .from(schema.planTable)
    .where(eq(schema.planTable.id, planId))
    .limit(1);

  if (!plan) {
    throw new HTTPException(400, { message: `Unknown plan: ${planId}` });
  }

  const [existing] = await db
    .select({ id: schema.workspaceSubscriptionTable.id })
    .from(schema.workspaceSubscriptionTable)
    .where(eq(schema.workspaceSubscriptionTable.workspaceId, workspaceId))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(schema.workspaceSubscriptionTable)
      .set({ planId, status: "active" })
      .where(eq(schema.workspaceSubscriptionTable.workspaceId, workspaceId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(schema.workspaceSubscriptionTable)
    .values({ workspaceId, planId, status: "active" })
    .returning();
  return created;
}

export default setOrganisationPlan;
