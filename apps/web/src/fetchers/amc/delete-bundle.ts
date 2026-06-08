import { getApiUrl } from "@/fetchers/get-api-url";

async function deleteBundle(
  bundleId: string,
  workspaceId: string,
): Promise<{ success: boolean }> {
  const response = await fetch(
    getApiUrl(
      `/amc/bundles/${bundleId}?workspaceId=${encodeURIComponent(workspaceId)}`,
    ),
    { method: "DELETE", credentials: "include" },
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export default deleteBundle;
