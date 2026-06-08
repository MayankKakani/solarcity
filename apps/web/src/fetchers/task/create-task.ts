import { client } from "@solarplan/libs";

export type TaskAssignee = {
  userId: string;
  role: "supervisor" | "engineer";
};

export type CreateTaskRequest = {
  title: string;
  description: string;
  zoneId: string;
  status: string;
  startDate?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high" | "no-priority" | "urgent";
  assignees?: TaskAssignee[];
  siteId?: string;
  siteContactId?: string;
  raisedByExecutiveId?: string;
  serviceMasterId?: string;
};

async function createTask({
  title,
  description,
  zoneId,
  status,
  startDate,
  dueDate,
  priority,
  assignees,
  siteId,
  siteContactId,
  raisedByExecutiveId,
  serviceMasterId,
}: CreateTaskRequest) {
  if (!zoneId) {
    throw new Error("No project selected for task creation");
  }

  const response = await client.task[":zoneId"].$post({
    json: {
      title,
      description,
      status,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      priority,
      assignees,
      siteId,
      siteContactId,
      raisedByExecutiveId,
      serviceMasterId,
    } as Parameters<(typeof client)["task"][":zoneId"]["$post"]>[0]["json"],
    param: { zoneId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();

  return data;
}

export default createTask;
