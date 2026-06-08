import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { columnTable, taskTable } from "../../database/schema";
import { publishEvent } from "../../events";
import { assertValidTaskStatus } from "../validate-task-fields";

async function updateTaskStatus({
  id,
  status,
  currentUserId,
}: {
  id: string;
  status: string;
  currentUserId: string;
}) {
  const existingTask = await db.query.taskTable.findFirst({
    where: eq(taskTable.id, id),
  });

  if (!existingTask) {
    throw new HTTPException(404, {
      message: "Task not found",
    });
  }

  await assertValidTaskStatus(status, existingTask.zoneId);

  const column = await db.query.columnTable.findFirst({
    where: and(
      eq(columnTable.zoneId, existingTask.zoneId),
      eq(columnTable.slug, status),
    ),
  });

  const [updatedTask] = await db
    .update(taskTable)
    .set({ status, columnId: column?.id ?? null })
    .where(eq(taskTable.id, id))
    .returning();

  if (!updatedTask) {
    throw new HTTPException(500, {
      message: "Failed to update task status",
    });
  }

  await publishEvent("task.status_changed", {
    taskId: updatedTask.id,
    zoneId: updatedTask.zoneId,
    userId: currentUserId,
    oldStatus: existingTask.status,
    newStatus: status,
    title: updatedTask.title,
    assigneeId: updatedTask.userId,
    type: "status_changed",
  });

  await publishEvent("task-relation.refresh", {
    zoneId: updatedTask.zoneId,
    userId: currentUserId,
  });

  return updatedTask;
}

export default updateTaskStatus;
