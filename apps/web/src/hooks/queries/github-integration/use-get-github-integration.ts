import { useQuery } from "@tanstack/react-query";
import getGithubIntegration from "@/fetchers/github-integration/get-github-integration";

function useGetGithubIntegration(zoneId: string) {
  return useQuery({
    queryKey: ["github-integration", zoneId],
    queryFn: () => getGithubIntegration(zoneId),
    enabled: !!zoneId,
  });
}

export default useGetGithubIntegration;
