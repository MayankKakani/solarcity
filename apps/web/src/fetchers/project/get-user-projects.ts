import { client } from "@solarplan/libs";

export type GetUserProjectsRequest = {
  userIds: string[];
  workspaceId: string;
};

async function getUserProjects({
  userIds,
  workspaceId,
}: GetUserProjectsRequest) {
  const response = await client.project.user.$get({
    query: { userIds: userIds.join(","), workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getUserProjects;
