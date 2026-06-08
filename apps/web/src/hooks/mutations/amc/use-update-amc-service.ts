import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateAmcService from "@/fetchers/amc/update-amc-service";

function useUpdateAmcService(siteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAmcService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amc", siteId] });
    },
  });
}

export default useUpdateAmcService;
