import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { siteTable } from "../../database/schema";

async function deleteSite(siteId: string) {
  const [deleted] = await db
    .delete(siteTable)
    .where(eq(siteTable.id, siteId))
    .returning();

  if (!deleted) {
    throw new HTTPException(404, { message: "Site not found" });
  }

  return deleted;
}

export default deleteSite;
