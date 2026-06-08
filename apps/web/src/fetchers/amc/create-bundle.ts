import { getApiUrl } from "@/fetchers/get-api-url";
import type { AmcBundle } from "./types";

type BundleServiceInput = {
  serviceMasterId: string;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

type CreateBundleInput = {
  workspaceId: string;
  name: string;
  description?: string;
  isActive: boolean;
  services: BundleServiceInput[];
};

async function createBundle(input: CreateBundleInput): Promise<AmcBundle> {
  const { workspaceId, ...body } = input;
  const response = await fetch(
    getApiUrl(`/amc/bundles?workspaceId=${encodeURIComponent(workspaceId)}`),
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

export default createBundle;
