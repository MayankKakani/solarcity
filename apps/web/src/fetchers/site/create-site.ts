import { getApiUrl } from "@/fetchers/get-api-url";

export type CreateSiteRequest = {
  workspaceId: string;
  name: string;
  siteCode: string;
  siteType: "residential" | "commercial" | "industrial" | "agricultural";
  latitude?: number;
  longitude?: number;
  address?: string;
  systemCapacityKwp?: string;
  installationDate?: string;
  panelCount?: number;
  inverterModel?: string;
  gridConnectionType?: "on_grid" | "off_grid" | "hybrid";
  status?: "active" | "inactive" | "under_maintenance";
};

async function createSite(input: CreateSiteRequest) {
  const { workspaceId, ...body } = input;

  const response = await fetch(
    getApiUrl(`/site?workspaceId=${encodeURIComponent(workspaceId)}`),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default createSite;
