import { getApiUrl } from "@/fetchers/get-api-url";
import type { ServiceMaster } from "./types";

async function getServices(workspaceId: string): Promise<ServiceMaster[]> {
  const response = await fetch(
    getApiUrl(`/services?workspaceId=${encodeURIComponent(workspaceId)}`),
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export default getServices;
