import { getApiUrl } from "@/fetchers/get-api-url";
import type { Amc } from "./types";

async function getAmcBySite(siteId: string): Promise<Amc | null> {
  const response = await fetch(
    getApiUrl(`/amc?siteId=${encodeURIComponent(siteId)}`),
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export default getAmcBySite;
