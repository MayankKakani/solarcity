import { useQuery } from "@tanstack/react-query";
import getSite from "@/fetchers/site/get-site";

function useGetSite(siteId: string) {
  return useQuery({
    queryKey: ["site", siteId],
    queryFn: () => getSite(siteId),
    enabled: !!siteId,
  });
}

export default useGetSite;
