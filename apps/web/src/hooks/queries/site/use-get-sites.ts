import { useQuery } from "@tanstack/react-query";
import getSites from "@/fetchers/site/get-sites";

function useGetSites(workspaceId: string) {
  return useQuery({
    queryKey: ["sites", workspaceId],
    queryFn: () => getSites(workspaceId),
    enabled: !!workspaceId,
  });
}

export default useGetSites;
