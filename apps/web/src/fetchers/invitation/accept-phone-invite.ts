import { client } from "@solarplan/libs";

async function acceptPhoneInvite(invitationId: string) {
  const response = await client.invitation[":id"]["accept-phone-invite"].$post({
    param: { id: invitationId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to accept invitation");
  }

  return await response.json();
}

export default acceptPhoneInvite;
