import { and, eq, isNull, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { labelTable, taskTable, zoneTable } from "../../database/schema";
import { publishEvent } from "../../events";
import { syncLabelToGitea } from "../../plugins/gitea/utils/sync-label-to-gitea";
import { syncLabelToGitHub } from "../../plugins/github/utils/sync-label-to-github";

async function createLabel(
  name: string,
  color: string,
  taskId: string | undefined,
  workspaceId: string,
  userId: string,
  siteId?: string,
  contactId?: string,
) {
  if (taskId) {
    const [task] = await db
      .select({
        id: taskTable.id,
        zoneId: taskTable.zoneId,
        workspaceId: zoneTable.workspaceId,
      })
      .from(taskTable)
      .innerJoin(zoneTable, eq(taskTable.zoneId, zoneTable.id))
      .where(eq(taskTable.id, taskId))
      .limit(1);

    if (!task) {
      throw new HTTPException(404, {
        message: "Task not found",
      });
    }

    const [inserted] = await db
      .insert(labelTable)
      .values({ name, color, taskId, workspaceId: task.workspaceId })
      .onConflictDoNothing({
        target: [labelTable.taskId, labelTable.name],
      })
      .returning();

    const label =
      inserted ??
      (await db.query.labelTable.findFirst({
        where: and(eq(labelTable.taskId, taskId), eq(labelTable.name, name)),
      }));

    if (!label) {
      throw new Error("Failed to create or resolve label");
    }

    if (inserted) {
      syncLabelToGitHub(taskId, name, color).catch((error) => {
        console.error("Failed to sync label to GitHub:", error);
      });
      syncLabelToGitea(taskId, name, color).catch((error) => {
        console.error("Failed to sync label to Gitea:", error);
      });

      await publishEvent("task.label_created", {
        zoneId: task.zoneId,
        taskId: task.id,
        userId: userId,
        type: "label_created",
      });
    }
    return label;
  }

  if (siteId) {
    const [inserted] = await db
      .insert(labelTable)
      .values({ name, color, siteId, workspaceId })
      .onConflictDoNothing({ target: [labelTable.siteId, labelTable.name] })
      .returning();
    const label =
      inserted ??
      (await db.query.labelTable.findFirst({
        where: and(eq(labelTable.siteId, siteId), eq(labelTable.name, name)),
      }));
    if (!label) throw new Error("Failed to create or resolve site label");
    return label;
  }

  if (contactId) {
    const [inserted] = await db
      .insert(labelTable)
      .values({ name, color, contactId, workspaceId })
      .onConflictDoNothing({ target: [labelTable.contactId, labelTable.name] })
      .returning();
    const label =
      inserted ??
      (await db.query.labelTable.findFirst({
        where: and(
          eq(labelTable.contactId, contactId),
          eq(labelTable.name, name),
        ),
      }));
    if (!label) throw new Error("Failed to create or resolve contact label");
    return label;
  }

  const [inserted] = await db
    .insert(labelTable)
    .values({ name, color, taskId: null, workspaceId })
    .onConflictDoNothing({
      target: [labelTable.workspaceId, labelTable.name],
      where: sql`${labelTable.taskId} is null`,
    })
    .returning();

  const label =
    inserted ??
    (await db.query.labelTable.findFirst({
      where: and(
        eq(labelTable.workspaceId, workspaceId),
        eq(labelTable.name, name),
        isNull(labelTable.taskId),
      ),
    }));

  if (!label) {
    throw new Error("Failed to create or resolve label");
  }

  return label;
}

export default createLabel;
