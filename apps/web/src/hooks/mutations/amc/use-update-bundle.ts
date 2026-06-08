import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateBundle from "@/fetchers/amc/update-bundle";

function useUpdateBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBundle,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["amc-bundles", variables.workspaceId],
      });
    },
  });
}

export default useUpdateBundle;
