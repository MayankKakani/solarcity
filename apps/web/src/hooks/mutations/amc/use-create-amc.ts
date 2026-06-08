import { useMutation, useQueryClient } from "@tanstack/react-query";
import createAmc from "@/fetchers/amc/create-amc";

function useCreateAmc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAmc,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["amc", variables.siteId] });
      queryClient.invalidateQueries({
        queryKey: ["amc-dashboard", variables.workspaceId],
      });
    },
  });
}

export default useCreateAmc;
