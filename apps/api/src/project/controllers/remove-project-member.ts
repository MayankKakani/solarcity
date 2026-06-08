import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  workspaceUserTable,
  zoneAssignmentTable,
  zoneTable,
} from "../../database/schema";

async function removeProjectMember(zoneId: string, userId: string) {
  const [project] = await db
    .select({ id: zoneTable.id, workspaceId: zoneTable.workspaceId })
    .from(zoneTable)
    .where(eq(zoneTable.id, zoneId))
    .limit(1);

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  const [member] = await db
    .select({ role: workspaceUserTable.role })
    .from(workspaceUserTable)
    .where(
      and(
        eq(workspaceUserTable.workspaceId, project.workspaceId),
        eq(workspaceUserTable.userId, userId),
      ),
    )
    .limit(1);

  if (member?.role === "owner" || member?.role === "admin") {
    throw new HTTPException(403, {
      message: "Admin members cannot be removed from a project",
    });
  }

  const [assignment] = await db
    .delete(zoneAssignmentTable)
    .where(
      and(
        eq(zoneAssignmentTable.zoneId, zoneId),
        eq(zoneAssignmentTable.userId, userId),
      ),
    )
    .returning();

  if (!assignment) {
    throw new HTTPException(404, {
      message: "User is not a member of this project",
    });
  }

  return assignment;
}

export default removeProjectMember;
