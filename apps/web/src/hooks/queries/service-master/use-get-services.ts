import { useQuery } from "@tanstack/react-query";
import getServices from "@/fetchers/service-master/get-services";

function useGetServices(workspaceId: string) {
  return useQuery({
    queryKey: ["services", workspaceId],
    queryFn: () => getServices(workspaceId),
    enabled: !!workspaceId,
  });
}

export default useGetServices;
