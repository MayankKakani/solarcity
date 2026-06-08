import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteAmc from "@/fetchers/amc/delete-amc";

function useDeleteAmc(siteId: string, workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amcId: string) => deleteAmc(amcId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amc", siteId] });
      queryClient.invalidateQueries({
        queryKey: ["amc-dashboard", workspaceId],
      });
    },
  });
}

export default useDeleteAmc;
