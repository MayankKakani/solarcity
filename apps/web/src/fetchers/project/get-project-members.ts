import { client } from "@solarplan/libs";

export type GetProjectMembersRequest = {
  zoneId: string;
};

async function getProjectMembers({ zoneId }: GetProjectMembersRequest) {
  const response = await client.project[":id"].members.$get({
    param: { id: zoneId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getProjectMembers;
