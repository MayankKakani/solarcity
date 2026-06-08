import { eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  taskAssignmentTable,
  taskTable,
  userTable,
} from "../../database/schema";
import { publishEvent } from "../../events";

async function updateTaskAssignee({
  id,
  assignees,
  currentUserId,
}: {
  id: string;
  assignees: { userId: string; role: string }[];
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

  await db
    .delete(taskAssignmentTable)
    .where(eq(taskAssignmentTable.taskId, id));

  if (assignees.length > 0) {
    await db.insert(taskAssignmentTable).values(
      assignees.map((a) => ({
        taskId: id,
        userId: a.userId,
        role: a.role,
        assignedBy: currentUserId,
      })),
    );
  }

  const newAssigneeNames =
    assignees.length > 0
      ? await db
          .select({
            id: userTable.id,
            name: userTable.name,
            role: taskAssignmentTable.role,
          })
          .from(userTable)
          .innerJoin(
            taskAssignmentTable,
            eq(taskAssignmentTable.userId, userTable.id),
          )
          .where(
            inArray(
              userTable.id,
              assignees.map((a) => a.userId),
            ),
          )
      : [];

  if (assignees.length === 0) {
    await publishEvent("task.unassigned", {
      taskId: id,
      zoneId: existingTask.zoneId,
      userId: currentUserId,
      title: existingTask.title,
      type: "unassigned",
    });
  } else {
    await publishEvent("task.assignee_changed", {
      taskId: id,
      zoneId: existingTask.zoneId,
      userId: currentUserId,
      newAssignees: newAssigneeNames,
      title: existingTask.title,
      type: "assignee_changed",
    });
  }

  return { ...existingTask, assignees: newAssigneeNames };
}

export default updateTaskAssignee;
