import { useQuery } from "@tanstack/react-query";
import getTelegramIntegration from "@/fetchers/telegram-integration/get-telegram-integration";

function useGetTelegramIntegration(zoneId: string) {
  return useQuery({
    queryKey: ["telegram-integration", zoneId],
    queryFn: () => getTelegramIntegration(zoneId),
    enabled: Boolean(zoneId),
  });
}

export default useGetTelegramIntegration;
