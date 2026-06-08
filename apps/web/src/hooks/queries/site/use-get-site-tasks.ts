import { useQuery } from "@tanstack/react-query";
import getSiteTasks from "@/fetchers/site/get-site-tasks";

function useGetSiteTasks(siteId: string) {
  return useQuery({
    queryKey: ["site-tasks", siteId],
    queryFn: () => getSiteTasks(siteId),
    enabled: !!siteId,
  });
}

export default useGetSiteTasks;
