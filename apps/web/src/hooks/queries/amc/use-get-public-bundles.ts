import { useQuery } from "@tanstack/react-query";
import getPublicBundles from "@/fetchers/amc/get-public-bundles";

export default function useGetPublicBundles(workspaceSlug: string) {
  return useQuery({
    queryKey: ["public-amc-bundles", workspaceSlug],
    queryFn: () => getPublicBundles(workspaceSlug),
    enabled: !!workspaceSlug,
  });
}
