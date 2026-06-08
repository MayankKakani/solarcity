import { useMutation, useQueryClient } from "@tanstack/react-query";
import deleteService from "@/fetchers/service-master/delete-service";

function useDeleteService(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceId: string) => deleteService(serviceId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", workspaceId] });
    },
  });
}

export default useDeleteService;
