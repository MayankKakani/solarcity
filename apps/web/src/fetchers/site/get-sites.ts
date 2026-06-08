import { getApiUrl } from "@/fetchers/get-api-url";

export type SiteLabel = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type SiteContact = {
  id: string;
  siteId: string;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  isPrimary: boolean;
  labels: SiteLabel[];
  createdAt: string;
  updatedAt: string;
};

export type Site = {
  id: string;
  workspaceId: string;
  name: string;
  siteCode: string;
  siteType: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  systemCapacityKwp: string | null;
  installationDate: string | null;
  panelCount: number | null;
  inverterModel: string | null;
  gridConnectionType: string | null;
  status: string;
  contacts: SiteContact[];
  labels: SiteLabel[];
  createdAt: string;
  updatedAt: string;
};

async function getSites(workspaceId: string): Promise<Site[]> {
  const response = await fetch(
    getApiUrl(`/site?workspaceId=${encodeURIComponent(workspaceId)}`),
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default getSites;
