import { getApiUrl } from "@/fetchers/get-api-url";
import type { AmcBundle } from "./types";

async function getBundles(workspaceId: string): Promise<AmcBundle[]> {
  const response = await fetch(
    getApiUrl(`/amc/bundles?workspaceId=${encodeURIComponent(workspaceId)}`),
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export default getBundles;
