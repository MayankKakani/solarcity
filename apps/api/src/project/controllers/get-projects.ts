import { and, eq, inArray, isNull } from "drizzle-orm";
import db from "../../database";
import { zoneAssignmentTable, zoneTable } from "../../database/schema";

async function getProjects(
  workspaceId: string,
  userId: string,
  includeArchived = false,
) {
  const assignedZoneIds = db
    .select({ zoneId: zoneAssignmentTable.zoneId })
    .from(zoneAssignmentTable)
    .where(eq(zoneAssignmentTable.userId, userId));

  const projects = await db.query.zoneTable.findMany({
    where: includeArchived
      ? and(
          eq(zoneTable.workspaceId, workspaceId),
          inArray(zoneTable.id, assignedZoneIds),
        )
      : and(
          eq(zoneTable.workspaceId, workspaceId),
          isNull(zoneTable.archivedAt),
          inArray(zoneTable.id, assignedZoneIds),
        ),
    with: {
      tasks: true,
    },
  });

  const projectsWithStatistics = projects.map((project) => {
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(
      (task) => task.status === "done" || task.status === "archived",
    ).length;
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const dueDate = project.tasks.reduce((earliest: Date | null, task) => {
      if (!earliest || (task.dueDate && task.dueDate < earliest))
        return task.dueDate;
      return earliest;
    }, null);

    return {
      ...project,
      statistics: {
        completionPercentage,
        totalTasks,
        dueDate,
      },
      archivedTasks: [],
      plannedTasks: [],
      columns: [],
    };
  });

  return projectsWithStatistics;
}

export default getProjects;
