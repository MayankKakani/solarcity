import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { siteContactTable } from "../../database/schema";

type AddContactInput = {
  siteId: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
};

async function addContact(input: AddContactInput) {
  const [contact] = await db
    .insert(siteContactTable)
    .values({
      siteId: input.siteId,
      name: input.name,
      role: input.role,
      phone: input.phone,
      email: input.email,
      isPrimary: input.isPrimary ?? false,
    })
    .returning();

  if (!contact) {
    throw new HTTPException(500, { message: "Failed to add contact" });
  }

  return contact;
}

export default addContact;
