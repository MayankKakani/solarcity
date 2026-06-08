import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteAmcService from "@/fetchers/amc/delete-amc-service";

function useDeleteAmcService(siteId: string, workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ amcId, serviceId }: { amcId: string; serviceId: string }) =>
      deleteAmcService(amcId, serviceId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amc", siteId] });
    },
  });
}

export default useDeleteAmcService;
