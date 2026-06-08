import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteBundle from "@/fetchers/amc/delete-bundle";

function useDeleteBundle(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bundleId: string) => deleteBundle(bundleId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amc-bundles", workspaceId] });
    },
  });
}

export default useDeleteBundle;
