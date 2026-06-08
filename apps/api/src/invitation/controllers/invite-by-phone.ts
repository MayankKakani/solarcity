import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { invitationTable, workspaceUserTable } from "../../database/schema";

const INVITATION_EXPIRY_DAYS = 7;

async function inviteByPhone(
  inviterId: string,
  workspaceId: string,
  phoneNumber: string,
  role: string,
  zoneIds: string[],
) {
  const [inviterMember] = await db
    .select({ role: workspaceUserTable.role })
    .from(workspaceUserTable)
    .where(
      and(
        eq(workspaceUserTable.workspaceId, workspaceId),
        eq(workspaceUserTable.userId, inviterId),
      ),
    )
    .limit(1);

  if (!inviterMember) {
    throw new HTTPException(403, {
      message: "You are not a member of this workspace",
    });
  }

  const digits = phoneNumber.replace(/[^0-9]/g, "");
  const tempEmail = `${digits}@phone.solarcity`;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

  const [invitation] = await db
    .insert(invitationTable)
    .values({
      workspaceId,
      email: tempEmail,
      phoneNumber,
      role,
      zoneIds: JSON.stringify(zoneIds),
      status: "pending",
      expiresAt,
      inviterId,
    })
    .returning();

  return invitation;
}

export default inviteByPhone;
