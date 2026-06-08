import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateGithubIntegration, {
  type UpdateGithubIntegrationRequest,
} from "@/fetchers/github-integration/update-github-integration";

export function useUpdateGithubIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      json,
    }: {
      zoneId: string;
      json: UpdateGithubIntegrationRequest;
    }) => updateGithubIntegration(zoneId, json),
    onSuccess: (_, { zoneId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["github-integration", zoneId],
      });
    },
  });
}
