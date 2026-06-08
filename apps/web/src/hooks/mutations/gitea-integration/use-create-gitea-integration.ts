import { useMutation, useQueryClient } from "@tanstack/react-query";
import createGiteaIntegration, {
  type CreateGiteaIntegrationRequest,
} from "@/fetchers/gitea-integration/create-gitea-integration";
import deleteGiteaIntegration from "@/fetchers/gitea-integration/delete-gitea-integration";
import verifyGiteaAccess, {
  type VerifyGiteaAccessRequest,
} from "@/fetchers/gitea-integration/verify-gitea-access";

export function useCreateGiteaIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      data,
    }: {
      zoneId: string;
      data: CreateGiteaIntegrationRequest;
    }) => createGiteaIntegration(zoneId, data),
    onSuccess: (_, { zoneId }) => {
      queryClient.invalidateQueries({
        queryKey: ["gitea-integration", zoneId],
      });
    },
  });
}

export function useDeleteGiteaIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteGiteaIntegration(zoneId),
    onSuccess: (_, zoneId) => {
      queryClient.invalidateQueries({
        queryKey: ["gitea-integration", zoneId],
      });
    },
  });
}

export function useVerifyGiteaAccess() {
  return useMutation({
    mutationFn: (data: VerifyGiteaAccessRequest) => verifyGiteaAccess(data),
  });
}
