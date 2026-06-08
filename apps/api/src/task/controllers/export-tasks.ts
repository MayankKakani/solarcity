import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { taskTable, userTable, zoneTable } from "../../database/schema";

async function exportTasks(zoneId: string) {
  const project = await db.query.zoneTable.findFirst({
    where: eq(zoneTable.id, zoneId),
  });

  if (!project) {
    throw new HTTPException(404, {
      message: "Project not found",
    });
  }

  const tasks = await db
    .select({
      id: taskTable.id,
      title: taskTable.title,
      number: taskTable.number,
      description: taskTable.description,
      status: taskTable.status,
      priority: taskTable.priority,
      startDate: taskTable.startDate,
      dueDate: taskTable.dueDate,
      position: taskTable.position,
      createdAt: taskTable.createdAt,
      userId: taskTable.userId,
      assigneeName: userTable.name,
      assigneeId: userTable.id,
    })
    .from(taskTable)
    .leftJoin(userTable, eq(taskTable.userId, userTable.id))
    .where(eq(taskTable.zoneId, zoneId))
    .orderBy(taskTable.position);

  return {
    project: {
      name: project.name,
      slug: project.slug,
      description: project.description,
      exportedAt: new Date().toISOString(),
    },
    tasks: tasks.map((task) => ({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority || "low",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      startDate: task.startDate ? new Date(task.startDate).toISOString() : null,
      userId: task.userId || null,
    })),
  };
}

export default exportTasks;
