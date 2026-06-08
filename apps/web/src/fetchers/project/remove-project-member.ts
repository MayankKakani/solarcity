import { client } from "@solarplan/libs";

export type RemoveProjectMemberRequest = {
  zoneId: string;
  userId: string;
};

async function removeProjectMember({
  zoneId,
  userId,
}: RemoveProjectMemberRequest) {
  const response = await client.project[":id"].members[":userId"].$delete({
    param: { id: zoneId, userId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default removeProjectMember;
