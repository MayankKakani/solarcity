import { getApiUrl } from "@/fetchers/get-api-url";
import type { ServiceMaster } from "./types";

type UpdateServiceInput = {
  workspaceId: string;
  serviceId: string;
  name?: string;
  description?: string;
  defaultPrice: string;
  currency?: string;
  isActive: boolean;
};

async function updateService(
  input: UpdateServiceInput,
): Promise<ServiceMaster> {
  const { workspaceId, serviceId, ...body } = input;
  const response = await fetch(
    getApiUrl(
      `/services/${serviceId}?workspaceId=${encodeURIComponent(workspaceId)}`,
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

export default updateService;
