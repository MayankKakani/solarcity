import { getApiUrl } from "@/fetchers/get-api-url";

async function deleteAmcService(
  amcId: string,
  serviceId: string,
  workspaceId: string,
): Promise<{ success: boolean }> {
  const response = await fetch(
    getApiUrl(
      `/amc/${amcId}/services/${serviceId}?workspaceId=${encodeURIComponent(workspaceId)}`,
    ),
    { method: "DELETE", credentials: "include" },
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export default deleteAmcService;
