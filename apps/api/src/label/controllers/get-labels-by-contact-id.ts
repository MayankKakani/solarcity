import { eq } from "drizzle-orm";
import db from "../../database";
import { labelTable } from "../../database/schema";

async function getLabelsByContactId(contactId: string) {
  return db
    .select()
    .from(labelTable)
    .where(eq(labelTable.contactId, contactId));
}

export default getLabelsByContactId;
