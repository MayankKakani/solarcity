import { getApiUrl } from "@/fetchers/get-api-url";
import type { Amc } from "./types";

type AmcServiceInput = {
  serviceMasterId: string;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

type CreateAmcInput = {
  workspaceId: string;
  siteId: string;
  bundleId?: string;
  startDate: string;
  durationYears: number;
  contractReference?: string;
  notes?: string;
  services: AmcServiceInput[];
};

async function createAmc(input: CreateAmcInput): Promise<Amc> {
  const { workspaceId, ...body } = input;
  const response = await fetch(
    getApiUrl(`/amc?workspaceId=${encodeURIComponent(workspaceId)}`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export default createAmc;
