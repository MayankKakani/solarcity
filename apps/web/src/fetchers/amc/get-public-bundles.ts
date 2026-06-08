import { getApiUrl } from "@/fetchers/get-api-url";
import type { AmcBundle } from "./types";

export type PublicBundlesResponse = {
  workspace: { id: string; name: string; slug: string };
  bundles: AmcBundle[];
};

async function getPublicBundles(
  workspaceSlug: string,
): Promise<PublicBundlesResponse> {
  const response = await fetch(
    getApiUrl(`/amc/public/bundles/${encodeURIComponent(workspaceSlug)}`),
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export default getPublicBundles;
