import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteColumn from "@/fetchers/column/delete-column";

export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; zoneId: string }) => deleteColumn(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ refetchType: "all" });
    },
  });
}
