import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateAmc from "@/fetchers/amc/update-amc";

function useUpdateAmc(siteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAmc,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["amc", siteId] });
      queryClient.invalidateQueries({
        queryKey: ["amc-dashboard", variables.workspaceId],
      });
    },
  });
}

export default useUpdateAmc;
