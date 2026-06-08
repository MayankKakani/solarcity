import { getApiUrl } from "@/fetchers/get-api-url";
import type { Amc } from "./types";

type UpdateAmcInput = {
  workspaceId: string;
  amcId: string;
  status?: "active" | "expired" | "cancelled";
  contractReference?: string;
  notes?: string;
};

async function updateAmc(input: UpdateAmcInput): Promise<Amc> {
  const { workspaceId, amcId, ...body } = input;
  const response = await fetch(
    getApiUrl(`/amc/${amcId}?workspaceId=${encodeURIComponent(workspaceId)}`),
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

export default updateAmc;
