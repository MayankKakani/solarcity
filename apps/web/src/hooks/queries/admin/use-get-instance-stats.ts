import { useQuery } from "@tanstack/react-query";
import getInstanceStats from "@/fetchers/admin/get-instance-stats";

function useGetInstanceStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: getInstanceStats,
  });
}

export default useGetInstanceStats;
