import { useMutation, useQueryClient } from "@tanstack/react-query";
import createGithubIntegration, {
  type CreateGithubIntegrationRequest,
} from "@/fetchers/github-integration/create-github-integration";
import deleteGithubIntegration from "@/fetchers/github-integration/delete-github-integration";
import verifyGithubInstallation, {
  type VerifyGithubInstallationRequest,
} from "@/fetchers/github-integration/verify-github-installation";

export function useCreateGithubIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      data,
    }: {
      zoneId: string;
      data: CreateGithubIntegrationRequest;
    }) => createGithubIntegration(zoneId, data),
    onSuccess: (_, { zoneId }) => {
      queryClient.invalidateQueries({
        queryKey: ["github-integration", zoneId],
      });
    },
  });
}

export function useDeleteGithubIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteGithubIntegration(zoneId),
    onSuccess: (_, zoneId) => {
      queryClient.invalidateQueries({
        queryKey: ["github-integration", zoneId],
      });
    },
  });
}

export function useVerifyGithubInstallation() {
  return useMutation({
    mutationFn: (data: VerifyGithubInstallationRequest) =>
      verifyGithubInstallation(data),
  });
}
