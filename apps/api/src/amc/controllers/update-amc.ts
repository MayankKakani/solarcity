import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { amcTable, siteTable } from "../../database/schema";
import { assertCanActivateAmc } from "../../entitlements/check-amc-seats";

type UpdateAmcInput = {
  amcId: string;
  status?: string;
  contractReference?: string;
  notes?: string;
};

async function updateAmc(input: UpdateAmcInput) {
  if (input.status === "active") {
    const [current] = await db
      .select({
        status: amcTable.status,
        workspaceId: siteTable.workspaceId,
      })
      .from(amcTable)
      .innerJoin(siteTable, eq(amcTable.siteId, siteTable.id))
      .where(eq(amcTable.id, input.amcId))
      .limit(1);

    if (!current) {
      throw new HTTPException(404, { message: "AMC not found" });
    }

    // A seat is consumed per activation, not per lifetime of the contract —
    // reactivating a lapsed/cancelled contract for a new term competes for
    // seats the same way creating a brand-new one does. Only re-check when
    // actually transitioning into "active"; a no-op update that leaves an
    // already-active AMC active shouldn't burn a seat check.
    if (current.status !== "active") {
      await assertCanActivateAmc(current.workspaceId);
    }
  }

  const [amc] = await db
    .update(amcTable)
    .set({
      ...(input.status !== undefined && { status: input.status }),
      ...(input.contractReference !== undefined && {
        contractReference: input.contractReference,
      }),
      ...(input.notes !== undefined && { notes: input.notes }),
    })
    .where(eq(amcTable.id, input.amcId))
    .returning();

  if (!amc) {
    throw new HTTPException(404, { message: "AMC not found" });
  }

  return amc;
}

export default updateAmc;
