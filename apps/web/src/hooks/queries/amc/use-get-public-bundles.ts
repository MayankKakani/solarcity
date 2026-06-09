import { useQuery } from "@tanstack/react-query";
import getPublicBundles from "@/fetchers/amc/get-public-bundles";

export default function useGetPublicBundles(workspaceId: string) {
  return useQuery({
    queryKey: ["public-amc-bundles", workspaceId],
    queryFn: () => getPublicBundles(workspaceId),
    enabled: !!workspaceId,
  });
}
