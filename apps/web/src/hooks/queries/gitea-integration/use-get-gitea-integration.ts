import { useQuery } from "@tanstack/react-query";
import getGiteaIntegration from "@/fetchers/gitea-integration/get-gitea-integration";

function useGetGiteaIntegration(zoneId: string) {
  return useQuery({
    queryKey: ["gitea-integration", zoneId],
    queryFn: () => getGiteaIntegration(zoneId),
    enabled: !!zoneId,
  });
}

export default useGetGiteaIntegration;
