import { getApiUrl } from "@/fetchers/get-api-url";

export type OrganisationSummary = {
  id: string;
  name: string;
  slug: string;
  planId: string;
  planName: string;
  subscriptionStatus: string;
  memberCount: number;
  zoneCount: number;
  siteCount: number;
  activeAmcCount: number;
  amcSeatBalance: number;
  createdAt: string;
};

export type ListOrganisationsResponse = {
  organisations: OrganisationSummary[];
  total: number;
  page: number;
  pageSize: number;
};

async function listOrganisations(
  page: number,
  pageSize: number,
): Promise<ListOrganisationsResponse> {
  const response = await fetch(
    getApiUrl(`/admin/organisations?page=${page}&pageSize=${pageSize}`),
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default listOrganisations;
