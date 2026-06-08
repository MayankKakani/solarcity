import { useQuery } from "@tanstack/react-query";
import getTasks from "@/fetchers/task/get-tasks";

export function useGetTasks(zoneId: string) {
  return useQuery({
    queryKey: ["tasks", zoneId],
    queryFn: () => getTasks(zoneId),
    refetchInterval: 30000,
    enabled: !!zoneId,
  });
}
