import { useMutation, useQueryClient } from "@tanstack/react-query";
import createService from "@/fetchers/service-master/create-service";

function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["services", variables.workspaceId],
      });
    },
  });
}

export default useCreateService;
