import { getApiUrl } from "@/fetchers/get-api-url";
import type { Site } from "./get-sites";

async function getSite(siteId: string): Promise<Site> {
  const response = await fetch(getApiUrl(`/site/${siteId}`), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default getSite;
