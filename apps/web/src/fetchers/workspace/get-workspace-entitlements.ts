import { getApiUrl } from "@/fetchers/get-api-url";

export type WorkspaceEntitlements = {
  plan: {
    id: string;
    name: string;
    status: string;
  };
  zones: {
    used: number;
    limit: number | null;
  };
  amcSeats: {
    used: number;
    balance: number;
  };
};

async function getWorkspaceEntitlements(
  workspaceId: string,
): Promise<WorkspaceEntitlements> {
  const response = await fetch(
    getApiUrl(`/workspace/${workspaceId}/entitlements`),
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default getWorkspaceEntitlements;
