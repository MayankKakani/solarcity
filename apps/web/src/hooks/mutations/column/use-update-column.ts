import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateColumn from "@/fetchers/column/update-column";

export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      zoneId: string;
      data: {
        name?: string;
        icon?: string | null;
        color?: string | null;
        isFinal?: boolean;
      };
    }) => updateColumn(id, data),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["columns", variables.zoneId],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["tasks", variables.zoneId],
          refetchType: "all",
        }),
      ]);
    },
  });
}
