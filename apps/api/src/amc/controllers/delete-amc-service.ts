import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { amcServiceTable } from "../../database/schema";

async function deleteAmcService(serviceId: string) {
  const [deleted] = await db
    .delete(amcServiceTable)
    .where(eq(amcServiceTable.id, serviceId))
    .returning({ id: amcServiceTable.id });

  if (!deleted) {
    throw new HTTPException(404, { message: "AMC service not found" });
  }

  return { success: true };
}

export default deleteAmcService;
