import { getApiUrl } from "@/fetchers/get-api-url";
import type { ServiceMaster } from "./types";

type CreateServiceInput = {
  workspaceId: string;
  name: string;
  description?: string;
  defaultPrice: string;
  currency?: string;
  isActive: boolean;
};

async function createService(
  input: CreateServiceInput,
): Promise<ServiceMaster> {
  const { workspaceId, ...body } = input;
  const response = await fetch(
    getApiUrl(`/services?workspaceId=${encodeURIComponent(workspaceId)}`),
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

export default createService;
