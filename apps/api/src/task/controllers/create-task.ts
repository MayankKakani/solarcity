import { and, count, eq, gte, lt, max, not } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  amcServiceTable,
  columnTable,
  serviceMasterTable,
  taskAssignmentTable,
  taskTable,
  userTable,
} from "../../database/schema";
import { publishEvent } from "../../events";
import { computeCurrentAmcYear } from "../../utils/amc-year";
import { assertValidTaskStatus } from "../validate-task-fields";
import getNextTaskNumber from "./get-next-task-number";

type TaskAssignee = {
  userId: string;
  role: "supervisor" | "engineer";
};

async function createTask({
  zoneId,
  currentUserId,
  assignees,
  title,
  status,
  startDate,
  dueDate,
  description,
  priority,
  siteId,
  siteContactId,
  raisedByExecutiveId,
  serviceMasterId,
  amcServiceId,
}: {
  zoneId: string;
  currentUserId: string;
  assignees?: TaskAssignee[];
  title: string;
  status: string;
  startDate?: Date;
  dueDate?: Date;
  description?: string;
  priority?: string;
  siteId?: string;
  siteContactId?: string;
  raisedByExecutiveId?: string;
  serviceMasterId?: string;
  amcServiceId?: string;
}) {
  const resolvedStatus = status || "to-do";
  const resolvedPriority = priority || "no-priority";

  await assertValidTaskStatus(resolvedStatus, zoneId);

  const firstAssigneeId = assignees?.[0]?.userId ?? "";
  const [assignee] = firstAssigneeId
    ? await db
        .select({ name: userTable.name })
        .from(userTable)
        .where(eq(userTable.id, firstAssigneeId))
    : [];

  const nextTaskNumber = await getNextTaskNumber(zoneId);

  const column = await db.query.columnTable.findFirst({
    where: and(
      eq(columnTable.zoneId, zoneId),
      eq(columnTable.slug, resolvedStatus),
    ),
  });

  const [maxPositionResult] = await db
    .select({ maxPosition: max(taskTable.position) })
    .from(taskTable)
    .where(
      and(
        eq(taskTable.zoneId, zoneId),
        column?.id
          ? eq(taskTable.columnId, column.id)
          : eq(taskTable.status, resolvedStatus),
      ),
    );

  const nextPosition = (maxPositionResult?.maxPosition ?? 0) + 1;

  let costSnapshot: string | null = null;
  let costUnitSnapshot: string | null = null;
  if (serviceMasterId) {
    const serviceMaster = await db.query.serviceMasterTable.findFirst({
      where: eq(serviceMasterTable.id, serviceMasterId),
      columns: { defaultPrice: true, currency: true },
    });
    costSnapshot = serviceMaster?.defaultPrice ?? null;
    costUnitSnapshot = serviceMaster?.currency ?? null;
  }

  // AMC limit check — flag task as out-of-AMC if service limit is reached
  let outOfAmc = false;
  const resolvedAmcServiceId: string | null = amcServiceId ?? null;
  if (amcServiceId) {
    const amcService = await db.query.amcServiceTable.findFirst({
      where: eq(amcServiceTable.id, amcServiceId),
      with: {
        amc: {
          columns: {
            status: true,
            startDate: true,
            endDate: true,
            siteId: true,
          },
        },
      },
    });

    if (
      !amcService ||
      amcService.amc.status !== "active" ||
      (siteId && amcService.amc.siteId !== siteId)
    ) {
      throw new HTTPException(400, {
        message: "Invalid or inactive AMC service for this site",
      });
    }

    const now = new Date();
    if (now < amcService.amc.startDate || now > amcService.amc.endDate) {
      throw new HTTPException(400, {
        message: "AMC contract period has ended",
      });
    }

    if (amcService.annualLimit > 0) {
      const { currentYearStart, nextYearStart } = computeCurrentAmcYear(
        amcService.amc.startDate,
      );
      const [usageRow] = await db
        .select({ used: count() })
        .from(taskTable)
        .where(
          and(
            eq(taskTable.amcServiceId, amcServiceId),
            not(eq(taskTable.status, "cancelled")),
            gte(taskTable.createdAt, currentYearStart),
            lt(taskTable.createdAt, nextYearStart),
          ),
        );
      outOfAmc = (usageRow?.used ?? 0) >= amcService.annualLimit;
    }
  }

  const [createdTask] = await db
    .insert(taskTable)
    .values({
      zoneId,
      title: title || "",
      status: resolvedStatus,
      columnId: column?.id ?? null,
      startDate: startDate || null,
      dueDate: dueDate || null,
      description: description || "",
      priority: resolvedPriority,
      number: nextTaskNumber + 1,
      position: nextPosition,
      siteId: siteId || null,
      siteContactId: siteContactId || null,
      raisedByExecutiveId: raisedByExecutiveId || null,
      serviceMasterId: serviceMasterId || null,
      costSnapshot,
      costUnitSnapshot,
      amcServiceId: resolvedAmcServiceId,
      outOfAmc,
    })
    .returning();

  if (!createdTask) {
    throw new HTTPException(500, {
      message: "Failed to create task",
    });
  }

  if (assignees && assignees.length > 0) {
    await db.insert(taskAssignmentTable).values(
      assignees.map((a) => ({
        taskId: createdTask.id,
        userId: a.userId,
        role: a.role,
        assignedBy: currentUserId,
      })),
    );
  }

  await publishEvent("task.created", {
    ...createdTask,
    taskId: createdTask.id,
    userId: firstAssigneeId,
    currentUserId: currentUserId,
    type: "created",
    content: null,
  });

  return {
    ...createdTask,
    assigneeName: assignee?.name,
  };
}

export default createTask;
