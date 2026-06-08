import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  invitationTable,
  workspaceUserTable,
  zoneAssignmentTable,
  zoneTable,
} from "../../database/schema";

async function acceptPhoneInvite(invitationId: string, userId: string) {
  const now = new Date();

  const [invitation] = await db
    .select({
      id: invitationTable.id,
      workspaceId: invitationTable.workspaceId,
      role: invitationTable.role,
      status: invitationTable.status,
      expiresAt: invitationTable.expiresAt,
      phoneNumber: invitationTable.phoneNumber,
      zoneIds: invitationTable.zoneIds,
    })
    .from(invitationTable)
    .where(eq(invitationTable.id, invitationId))
    .limit(1);

  if (!invitation) {
    throw new HTTPException(404, { message: "Invitation not found" });
  }

  if (!invitation.phoneNumber) {
    throw new HTTPException(400, { message: "Not a phone-based invitation" });
  }

  if (invitation.status !== "pending") {
    throw new HTTPException(400, {
      message:
        invitation.status === "accepted"
          ? "Invitation has already been accepted"
          : "Invitation is no longer valid",
    });
  }

  if (invitation.expiresAt < now) {
    throw new HTTPException(400, { message: "Invitation has expired" });
  }

  return await db.transaction(async (tx) => {
    const [existingMember] = await tx
      .select({ id: workspaceUserTable.id })
      .from(workspaceUserTable)
      .where(
        and(
          eq(workspaceUserTable.workspaceId, invitation.workspaceId),
          eq(workspaceUserTable.userId, userId),
        ),
      )
      .limit(1);

    if (!existingMember) {
      await tx.insert(workspaceUserTable).values({
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role ?? "member",
        joinedAt: now,
      });
    }

    if (invitation.zoneIds) {
      const parsedZoneIds: string[] = JSON.parse(invitation.zoneIds);
      for (const zoneId of parsedZoneIds) {
        const [zone] = await tx
          .select({ id: zoneTable.id })
          .from(zoneTable)
          .where(eq(zoneTable.id, zoneId))
          .limit(1);

        if (!zone) continue;

        const [existing] = await tx
          .select({ id: zoneAssignmentTable.id })
          .from(zoneAssignmentTable)
          .where(
            and(
              eq(zoneAssignmentTable.zoneId, zoneId),
              eq(zoneAssignmentTable.userId, userId),
            ),
          )
          .limit(1);

        if (!existing) {
          await tx
            .insert(zoneAssignmentTable)
            .values({ zoneId, userId, createdBy: null });
        }
      }
    }

    await tx
      .update(invitationTable)
      .set({ status: "accepted" })
      .where(eq(invitationTable.id, invitationId));

    return { workspaceId: invitation.workspaceId };
  });
}

export default acceptPhoneInvite;
