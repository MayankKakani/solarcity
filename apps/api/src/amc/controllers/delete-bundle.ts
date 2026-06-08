import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { amcBundleTable } from "../../database/schema";

async function deleteBundle(bundleId: string) {
  const [deleted] = await db
    .delete(amcBundleTable)
    .where(eq(amcBundleTable.id, bundleId))
    .returning({ id: amcBundleTable.id });

  if (!deleted) {
    throw new HTTPException(404, { message: "Bundle not found" });
  }

  return { success: true };
}

export default deleteBundle;
