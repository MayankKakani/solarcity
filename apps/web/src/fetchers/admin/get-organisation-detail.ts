import { getApiUrl } from "@/fetchers/get-api-url";

export type OrganisationDetail = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  createdAt: string;
  plan: {
    planId: string;
    name: string;
    maxZones: number | null;
    status: string;
  };
  usage: {
    zoneCount: number;
    activeAmcCount: number;
    amcSeatBalance: number;
  };
  members: Array<{
    userId: string;
    name: string;
    email: string;
    role: string;
    joinedAt: string;
  }>;
  amcSeatPurchases: Array<{
    id: string;
    seats: number;
    note: string | null;
    purchasedAt: string;
  }>;
};

async function getOrganisationDetail(
  workspaceId: string,
): Promise<OrganisationDetail> {
  const response = await fetch(
    getApiUrl(`/admin/organisations/${workspaceId}`),
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default getOrganisationDetail;
