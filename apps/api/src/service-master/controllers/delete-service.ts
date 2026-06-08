import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { serviceMasterTable } from "../../database/schema";

async function deleteService(serviceId: string) {
  const [deleted] = await db
    .delete(serviceMasterTable)
    .where(eq(serviceMasterTable.id, serviceId))
    .returning({ id: serviceMasterTable.id });

  if (!deleted) {
    throw new HTTPException(404, { message: "Service not found" });
  }

  return { success: true };
}

export default deleteService;
