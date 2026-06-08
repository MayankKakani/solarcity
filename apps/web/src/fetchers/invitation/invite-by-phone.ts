import { client } from "@solarplan/libs";

export type InviteByPhoneRequest = {
  phoneNumber: string;
  role: string;
  zoneIds: string[];
  workspaceId: string;
};

async function inviteByPhone({
  phoneNumber,
  role,
  zoneIds,
  workspaceId,
}: InviteByPhoneRequest) {
  const response = await client.invitation["invite-by-phone"].$post({
    json: { phoneNumber, role, zoneIds, workspaceId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to send phone invitation");
  }

  return await response.json();
}

export default inviteByPhone;
