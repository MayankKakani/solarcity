import { useMutation, useQueryClient } from "@tanstack/react-query";
import createColumn from "@/fetchers/column/create-column";

export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      data,
    }: {
      zoneId: string;
      data: { name: string; icon?: string; color?: string; isFinal?: boolean };
    }) => createColumn(zoneId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ refetchType: "all" });
    },
  });
}
