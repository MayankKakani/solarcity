import { getApiUrl } from "@/fetchers/get-api-url";
import type { AmcBundle } from "./types";

type ServiceInput = {
  id?: string;
  serviceMasterId: string;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

type UpdateBundleInput = {
  workspaceId: string;
  bundleId: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  services?: ServiceInput[];
};

async function updateBundle(input: UpdateBundleInput): Promise<AmcBundle> {
  const { workspaceId, bundleId, ...body } = input;
  const response = await fetch(
    getApiUrl(
      `/amc/bundles/${bundleId}?workspaceId=${encodeURIComponent(workspaceId)}`,
    ),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export default updateBundle;
