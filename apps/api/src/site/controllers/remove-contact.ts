import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { siteContactTable } from "../../database/schema";

async function removeContact(contactId: string) {
  const [deleted] = await db
    .delete(siteContactTable)
    .where(eq(siteContactTable.id, contactId))
    .returning();

  if (!deleted) {
    throw new HTTPException(404, { message: "Contact not found" });
  }

  return deleted;
}

export default removeContact;
