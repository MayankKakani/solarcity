import { client } from "@solarplan/libs";

export type AddProjectMemberRequest = {
  zoneId: string;
  userId: string;
};

async function addProjectMember({ zoneId, userId }: AddProjectMemberRequest) {
  const response = await client.project[":id"].members.$post({
    param: { id: zoneId },
    json: { userId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default addProjectMember;
