import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { amcTable } from "../../database/schema";

async function deleteAmc(amcId: string) {
  const [deleted] = await db
    .delete(amcTable)
    .where(eq(amcTable.id, amcId))
    .returning({ id: amcTable.id });

  if (!deleted) {
    throw new HTTPException(404, { message: "AMC not found" });
  }

  return { success: true };
}

export default deleteAmc;
