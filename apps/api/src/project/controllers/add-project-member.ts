import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  userTable,
  workspaceUserTable,
  zoneAssignmentTable,
  zoneTable,
} from "../../database/schema";

async function addProjectMember(
  zoneId: string,
  userId: string,
  workspaceId: string,
  createdBy: string,
) {
  const [project] = await db
    .select({ id: zoneTable.id })
    .from(zoneTable)
    .where(eq(zoneTable.id, zoneId))
    .limit(1);

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  const [workspaceMember] = await db
    .select({ userId: workspaceUserTable.userId })
    .from(workspaceUserTable)
    .where(
      and(
        eq(workspaceUserTable.workspaceId, workspaceId),
        eq(workspaceUserTable.userId, userId),
      ),
    )
    .limit(1);

  if (!workspaceMember) {
    throw new HTTPException(400, {
      message: "User is not a member of this workspace",
    });
  }

  const [existing] = await db
    .select({ id: zoneAssignmentTable.id })
    .from(zoneAssignmentTable)
    .where(
      and(
        eq(zoneAssignmentTable.zoneId, zoneId),
        eq(zoneAssignmentTable.userId, userId),
      ),
    )
    .limit(1);

  if (existing) {
    throw new HTTPException(409, {
      message: "User is already a member of this project",
    });
  }

  const [assignment] = await db
    .insert(zoneAssignmentTable)
    .values({ zoneId: zoneId, userId, createdBy })
    .returning();

  const [user] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  return { ...assignment, user };
}

export default addProjectMember;
