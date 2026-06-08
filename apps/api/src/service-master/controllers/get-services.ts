import { eq } from "drizzle-orm";
import db from "../../database";
import { serviceMasterTable } from "../../database/schema";

async function getServices(workspaceId: string) {
  return db
    .select()
    .from(serviceMasterTable)
    .where(eq(serviceMasterTable.workspaceId, workspaceId))
    .orderBy(serviceMasterTable.name);
}

export default getServices;
