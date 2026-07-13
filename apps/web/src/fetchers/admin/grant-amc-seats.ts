import { getApiUrl } from "@/fetchers/get-api-url";

export type GrantAmcSeatsRequest = {
  workspaceId: string;
  seats: number;
  note?: string;
};

async function grantAmcSeats({
  workspaceId,
  seats,
  note,
}: GrantAmcSeatsRequest) {
  const response = await fetch(
    getApiUrl(`/admin/organisations/${workspaceId}/amc-seats`),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seats, note }),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default grantAmcSeats;
