import { getApiUrl } from "@/fetchers/get-api-url";
import type { AmcService } from "./types";

type UpdateAmcServiceInput = {
  workspaceId: string;
  amcId: string;
  serviceId: string;
  frequency?: string;
  annualLimit?: number;
};

async function updateAmcService(
  input: UpdateAmcServiceInput,
): Promise<AmcService> {
  const { workspaceId, amcId, serviceId, ...body } = input;
  const response = await fetch(
    getApiUrl(
      `/amc/${amcId}/services/${serviceId}?workspaceId=${encodeURIComponent(workspaceId)}`,
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

export default updateAmcService;
