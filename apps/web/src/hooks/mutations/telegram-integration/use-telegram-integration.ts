import { useMutation, useQueryClient } from "@tanstack/react-query";
import createTelegramIntegration, {
  type CreateTelegramIntegrationRequest,
} from "@/fetchers/telegram-integration/create-telegram-integration";
import deleteTelegramIntegration from "@/fetchers/telegram-integration/delete-telegram-integration";
import updateTelegramIntegration, {
  type UpdateTelegramIntegrationRequest,
} from "@/fetchers/telegram-integration/update-telegram-integration";

export function useCreateTelegramIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      data,
    }: {
      zoneId: string;
      data: CreateTelegramIntegrationRequest;
    }) => createTelegramIntegration(zoneId, data),
    onSuccess: (_, { zoneId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["telegram-integration", zoneId],
      });
    },
  });
}

export function useUpdateTelegramIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      json,
    }: {
      zoneId: string;
      json: UpdateTelegramIntegrationRequest;
    }) => updateTelegramIntegration(zoneId, json),
    onSuccess: (_, { zoneId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["telegram-integration", zoneId],
      });
    },
  });
}

export function useDeleteTelegramIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteTelegramIntegration(zoneId),
    onSuccess: (_, zoneId) => {
      void queryClient.invalidateQueries({
        queryKey: ["telegram-integration", zoneId],
      });
    },
  });
}
