import { getApiUrl } from "@/fetchers/get-api-url";
import type { AmcDashboardRow } from "./types";

async function getAmcDashboard(
  workspaceId: string,
): Promise<AmcDashboardRow[]> {
  const response = await fetch(
    getApiUrl(`/amc/dashboard?workspaceId=${encodeURIComponent(workspaceId)}`),
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export default getAmcDashboard;
