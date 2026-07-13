import { getApiUrl } from "@/fetchers/get-api-url";

export type InstanceStats = {
  organisationCount: number;
  userCount: number;
  zoneCount: number;
  taskCount: number;
  siteCount: number;
  activeAmcCount: number;
};

async function getInstanceStats(): Promise<InstanceStats> {
  const response = await fetch(getApiUrl("/admin/stats"), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default getInstanceStats;
