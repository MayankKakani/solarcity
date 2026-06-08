import { useMutation, useQueryClient } from "@tanstack/react-query";
import addAmcService from "@/fetchers/amc/add-amc-service";

function useAddAmcService(siteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAmcService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amc", siteId] });
    },
  });
}

export default useAddAmcService;
