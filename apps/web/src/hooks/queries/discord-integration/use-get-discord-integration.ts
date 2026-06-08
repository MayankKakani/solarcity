import { useQuery } from "@tanstack/react-query";
import getDiscordIntegration from "@/fetchers/discord-integration/get-discord-integration";

function useGetDiscordIntegration(zoneId: string) {
  return useQuery({
    queryKey: ["discord-integration", zoneId],
    queryFn: () => getDiscordIntegration(zoneId),
    enabled: Boolean(zoneId),
  });
}

export default useGetDiscordIntegration;
