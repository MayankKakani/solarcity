import { desc, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import {
  serviceMasterTable,
  siteContactTable,
  siteTable,
  taskAssignmentTable,
  taskTable,
  userTable,
  zoneTable,
} from "../../database/schema";

async function getSiteTasks(siteId: string) {
  const site = await db.query.siteTable.findFirst({
    where: eq(siteTable.id, siteId),
  });

  if (!site) {
    throw new HTTPException(404, { message: "Site not found" });
  }

  const tasks = await db
    .select({
      id: taskTable.id,
      title: taskTable.title,
      number: taskTable.number,
      status: taskTable.status,
      priority: taskTable.priority,
      dueDate: taskTable.dueDate,
      createdAt: taskTable.createdAt,
      zoneId: taskTable.zoneId,
      zoneName: zoneTable.name,
      serviceMasterId: taskTable.serviceMasterId,
      serviceMasterName: serviceMasterTable.name,
      siteContactId: taskTable.siteContactId,
      siteContactName: siteContactTable.name,
      siteContactRole: siteContactTable.role,
    })
    .from(taskTable)
    .leftJoin(zoneTable, eq(taskTable.zoneId, zoneTable.id))
    .leftJoin(
      serviceMasterTable,
      eq(taskTable.serviceMasterId, serviceMasterTable.id),
    )
    .leftJoin(
      siteContactTable,
      eq(taskTable.siteContactId, siteContactTable.id),
    )
    .where(eq(taskTable.siteId, siteId))
    .orderBy(desc(taskTable.createdAt));

  const taskIds = tasks.map((t) => t.id);

  const assigneesData =
    taskIds.length > 0
      ? await db
          .select({
            taskId: taskAssignmentTable.taskId,
            userId: userTable.id,
            userName: userTable.name,
            userImage: userTable.image,
            role: taskAssignmentTable.role,
          })
          .from(taskAssignmentTable)
          .innerJoin(userTable, eq(taskAssignmentTable.userId, userTable.id))
          .where(inArray(taskAssignmentTable.taskId, taskIds))
      : [];

  const filteredAssignees = assigneesData;

  const assigneesMap = new Map<
    string,
    Array<{ id: string; name: string; image: string | null; role: string }>
  >();
  for (const a of filteredAssignees) {
    if (!assigneesMap.has(a.taskId)) assigneesMap.set(a.taskId, []);
    assigneesMap.get(a.taskId)?.push({
      id: a.userId,
      name: a.userName,
      image: a.userImage,
      role: a.role,
    });
  }

  return tasks.map((t) => ({
    ...t,
    assignees: assigneesMap.get(t.id) ?? [],
  }));
}

export default getSiteTasks;
