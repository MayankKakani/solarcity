import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateGiteaIntegration, {
  type UpdateGiteaIntegrationRequest,
} from "@/fetchers/gitea-integration/update-gitea-integration";

export function useUpdateGiteaIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      json,
    }: {
      zoneId: string;
      json: UpdateGiteaIntegrationRequest;
    }) => updateGiteaIntegration(zoneId, json),
    onSuccess: (_, { zoneId }) => {
      queryClient.invalidateQueries({
        queryKey: ["gitea-integration", zoneId],
      });
    },
  });
}
