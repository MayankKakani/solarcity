import { useQuery } from "@tanstack/react-query";
import getBundles from "@/fetchers/amc/get-bundles";

function useGetBundles(workspaceId: string) {
  return useQuery({
    queryKey: ["amc-bundles", workspaceId],
    queryFn: () => getBundles(workspaceId),
    enabled: !!workspaceId,
  });
}

export default useGetBundles;
