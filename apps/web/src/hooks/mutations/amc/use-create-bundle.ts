import { useMutation, useQueryClient } from "@tanstack/react-query";
import createBundle from "@/fetchers/amc/create-bundle";

function useCreateBundle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBundle,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["amc-bundles", variables.workspaceId],
      });
    },
  });
}

export default useCreateBundle;
