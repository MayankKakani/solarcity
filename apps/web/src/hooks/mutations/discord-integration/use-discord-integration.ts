import { useMutation, useQueryClient } from "@tanstack/react-query";
import createDiscordIntegration, {
  type CreateDiscordIntegrationRequest,
} from "@/fetchers/discord-integration/create-discord-integration";
import deleteDiscordIntegration from "@/fetchers/discord-integration/delete-discord-integration";
import updateDiscordIntegration, {
  type UpdateDiscordIntegrationRequest,
} from "@/fetchers/discord-integration/update-discord-integration";

export function useCreateDiscordIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      data,
    }: {
      zoneId: string;
      data: CreateDiscordIntegrationRequest;
    }) => createDiscordIntegration(zoneId, data),
    onSuccess: (_, { zoneId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["discord-integration", zoneId],
      });
    },
  });
}

export function useUpdateDiscordIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      json,
    }: {
      zoneId: string;
      json: UpdateDiscordIntegrationRequest;
    }) => updateDiscordIntegration(zoneId, json),
    onSuccess: (_, { zoneId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["discord-integration", zoneId],
      });
    },
  });
}

export function useDeleteDiscordIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => deleteDiscordIntegration(zoneId),
    onSuccess: (_, zoneId) => {
      void queryClient.invalidateQueries({
        queryKey: ["discord-integration", zoneId],
      });
    },
  });
}
