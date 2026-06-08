import { eq } from "drizzle-orm";
import db from "../../database";
import { labelTable } from "../../database/schema";

async function getLabelsBySiteId(siteId: string) {
  return db.select().from(labelTable).where(eq(labelTable.siteId, siteId));
}

export default getLabelsBySiteId;
