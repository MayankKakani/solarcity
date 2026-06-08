import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateService from "@/fetchers/service-master/update-service";

function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateService,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["services", variables.workspaceId],
      });
    },
  });
}

export default useUpdateService;
