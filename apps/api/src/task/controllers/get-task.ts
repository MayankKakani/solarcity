import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  serviceMasterTable,
  siteTable,
  taskAssignmentTable,
  taskTable,
  userTable,
} from "../../database/schema";

// import site from "../../site";
// import serviceMaster from "../../service-master";

async function getTask(taskId: string) {
  const rows = await db
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
      zoneId: taskTable.zoneId,
      siteId: taskTable.siteId,
      siteName: siteTable.name,
      siteAddress: siteTable.address,
      siteCode: siteTable.siteCode,
      serviceId: taskTable.serviceMasterId,
      serviceName: serviceMasterTable.name,
      siteLocation: siteTable.location,
      siteContactId: taskTable.siteContactId,
      assigneeId: userTable.id,
      assigneeName: userTable.name,
      assigneeRole: taskAssignmentTable.role,
    })
    .from(taskTable)
    .leftJoin(taskAssignmentTable, eq(taskAssignmentTable.taskId, taskTable.id))
    .leftJoin(userTable, eq(userTable.id, taskAssignmentTable.userId))
    .leftJoin(siteTable, eq(siteTable.id, taskTable.siteId))
    .leftJoin(
      serviceMasterTable,
      eq(serviceMasterTable.id, taskTable.serviceMasterId),
    )
    .where(eq(taskTable.id, taskId));

  if (!rows.length || !rows[0]) {
    throw new HTTPException(404, {
      message: "Task not found",
    });
  }

  const {
    id,
    title,
    number,
    description,
    status,
    priority,
    startDate,
    dueDate,
    position,
    createdAt,
    zoneId,
    siteName,
    siteAddress,
    siteLocation,
    siteId,
    siteCode,
    serviceId,
    serviceName,
  } = rows[0];

  const assignees = rows
    .filter((r) => r.assigneeId !== null)
    .map((r) => ({
      // biome-ignore lint/style/noNonNullAssertion: <assigneeId is available>
      id: r.assigneeId!,
      name: r.assigneeName,
      role: r.assigneeRole,
    }));

  return {
    id,
    title,
    number,
    description,
    status,
    priority,
    startDate,
    dueDate,
    position,
    createdAt,
    zoneId,
    siteAddress,
    siteId,
    siteName,
    siteLocation,
    siteCode,
    assignees,
    serviceId,
    serviceName,
  };
}

export default getTask;
