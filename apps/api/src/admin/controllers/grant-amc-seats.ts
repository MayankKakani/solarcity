import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db, { schema } from "../../database";

async function grantAmcSeats(
  workspaceId: string,
  seats: number,
  note?: string,
) {
  const [workspace] = await db
    .select({ id: schema.workspaceTable.id })
    .from(schema.workspaceTable)
    .where(eq(schema.workspaceTable.id, workspaceId))
    .limit(1);

  if (!workspace) {
    throw new HTTPException(404, { message: "Organisation not found" });
  }

  const [purchase] = await db
    .insert(schema.amcSeatPurchaseTable)
    .values({
      workspaceId,
      seats,
      note: note ?? "Granted manually by instance admin",
    })
    .returning();

  return purchase;
}

export default grantAmcSeats;
