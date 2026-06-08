import { client } from "@solarplan/libs";

type Assignee = {
  userId: string;
  role: "supervisor" | "engineer";
};

async function updateTaskAssignee(taskId: string, assignees: Assignee[]) {
  const response = await client.task.assignee[":id"].$put({
    param: { id: taskId },
    json: { assignees },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default updateTaskAssignee;
