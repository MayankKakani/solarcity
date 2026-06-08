import { useMutation, useQueryClient } from "@tanstack/react-query";
import createGenericWebhookIntegration, {
  type CreateGenericWebhookIntegrationRequest,
} from "@/fetchers/generic-webhook-integration/create-generic-webhook-integration";
import deleteGenericWebhookIntegration from "@/fetchers/generic-webhook-integration/delete-generic-webhook-integration";
import updateGenericWebhookIntegration, {
  type UpdateGenericWebhookIntegrationRequest,
} from "@/fetchers/generic-webhook-integration/update-generic-webhook-integration";

export function useCreateGenericWebhookIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      data,
    }: {
      zoneId: string;
      data: CreateGenericWebhookIntegrationRequest;
    }) => createGenericWebhookIntegration(zoneId, data),
    onSuccess: (_, { zoneId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["generic-webhook-integration", zoneId],
      });
    },
  });
}

export function useUpdateGenericWebhookIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      json,
    }: {
      zoneId: string;
      json: UpdateGenericWebhookIntegrationRequest;
    }) => updateGenericWebhookIntegration(zoneId, json),
    onSuccess: (_, { zoneId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["generic-webhook-integration", zoneId],
      });
    },
  });
}

export function useDeleteGenericWebhookIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteGenericWebhookIntegration(zoneId),
    onSuccess: (_, zoneId) => {
      void queryClient.invalidateQueries({
        queryKey: ["generic-webhook-integration", zoneId],
      });
    },
  });
}
