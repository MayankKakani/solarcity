import { useQuery } from "@tanstack/react-query";
import getSlackIntegration from "@/fetchers/slack-integration/get-slack-integration";

function useGetSlackIntegration(zoneId: string) {
  return useQuery({
    queryKey: ["slack-integration", zoneId],
    queryFn: () => getSlackIntegration(zoneId),
    enabled: Boolean(zoneId),
  });
}

export default useGetSlackIntegration;
