import { and, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { zoneAssignmentTable, zoneTable } from "../../database/schema";

async function getProject(id: string, workspaceId: string, userId: string) {
  const assignedZoneIds = db
    .select({ zoneId: zoneAssignmentTable.zoneId })
    .from(zoneAssignmentTable)
    .where(eq(zoneAssignmentTable.userId, userId));

  const project = await db.query.zoneTable.findFirst({
    where: and(
      eq(zoneTable.id, id),
      eq(zoneTable.workspaceId, workspaceId),
      inArray(zoneTable.id, assignedZoneIds),
    ),
    with: {
      tasks: true,
    },
  });

  if (!project) {
    throw new HTTPException(404, {
      message: "Project not found",
    });
  }

  return project;
}

export default getProject;
