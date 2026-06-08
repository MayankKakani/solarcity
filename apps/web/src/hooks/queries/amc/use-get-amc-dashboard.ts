import { useQuery } from "@tanstack/react-query";
import getAmcDashboard from "@/fetchers/amc/get-amc-dashboard";

function useGetAmcDashboard(workspaceId: string) {
  return useQuery({
    queryKey: ["amc-dashboard", workspaceId],
    queryFn: () => getAmcDashboard(workspaceId),
    enabled: !!workspaceId,
  });
}

export default useGetAmcDashboard;
