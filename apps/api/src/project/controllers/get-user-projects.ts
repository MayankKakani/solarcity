import { and, eq, inArray } from "drizzle-orm";
import db from "../../database";
import { zoneAssignmentTable, zoneTable } from "../../database/schema";

async function getUserProjects(userIds: string[], workspaceId: string) {
  if (userIds.length === 0) return [];

  const rows = await db
    .select({
      userId: zoneAssignmentTable.userId,
      id: zoneTable.id,
      workspaceId: zoneTable.workspaceId,
      name: zoneTable.name,
      slug: zoneTable.slug,
      icon: zoneTable.icon,
      description: zoneTable.description,
      isPublic: zoneTable.isPublic,
      archivedAt: zoneTable.archivedAt,
      createdAt: zoneTable.createdAt,
    })
    .from(zoneAssignmentTable)
    .innerJoin(zoneTable, eq(zoneAssignmentTable.zoneId, zoneTable.id))
    .where(
      and(
        inArray(zoneAssignmentTable.userId, userIds),
        eq(zoneTable.workspaceId, workspaceId),
      ),
    );

  return rows;
}

export default getUserProjects;
