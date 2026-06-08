import { useMutation, useQueryClient } from "@tanstack/react-query";
import createSlackIntegration, {
  type CreateSlackIntegrationRequest,
} from "@/fetchers/slack-integration/create-slack-integration";
import deleteSlackIntegration from "@/fetchers/slack-integration/delete-slack-integration";
import updateSlackIntegration, {
  type UpdateSlackIntegrationRequest,
} from "@/fetchers/slack-integration/update-slack-integration";

export function useCreateSlackIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      data,
    }: {
      zoneId: string;
      data: CreateSlackIntegrationRequest;
    }) => createSlackIntegration(zoneId, data),
    onSuccess: (_, { zoneId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["slack-integration", zoneId],
      });
    },
  });
}

export function useUpdateSlackIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      json,
    }: {
      zoneId: string;
      json: UpdateSlackIntegrationRequest;
    }) => updateSlackIntegration(zoneId, json),
    onSuccess: (_, { zoneId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["slack-integration", zoneId],
      });
    },
  });
}

export function useDeleteSlackIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteSlackIntegration(zoneId),
    onSuccess: (_, zoneId) => {
      void queryClient.invalidateQueries({
        queryKey: ["slack-integration", zoneId],
      });
    },
  });
}
