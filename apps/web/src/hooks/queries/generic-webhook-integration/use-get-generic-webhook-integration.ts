import { useQuery } from "@tanstack/react-query";
import getGenericWebhookIntegration from "@/fetchers/generic-webhook-integration/get-generic-webhook-integration";

function useGetGenericWebhookIntegration(zoneId: string) {
  return useQuery({
    queryKey: ["generic-webhook-integration", zoneId],
    queryFn: () => getGenericWebhookIntegration(zoneId),
    enabled: Boolean(zoneId),
  });
}

export default useGetGenericWebhookIntegration;
