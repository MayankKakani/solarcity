import { getApiUrl } from "@/fetchers/get-api-url";
import type { AmcService } from "./types";

type AddAmcServiceInput = {
  workspaceId: string;
  amcId: string;
  serviceMasterId: string;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

async function addAmcService(input: AddAmcServiceInput): Promise<AmcService> {
  const { workspaceId, amcId, ...body } = input;
  const response = await fetch(
    getApiUrl(
      `/amc/${amcId}/services?workspaceId=${encodeURIComponent(workspaceId)}`,
    ),
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

export default addAmcService;
