import { useQuery } from "@tanstack/react-query";
import getColumns from "@/fetchers/column/get-columns";

export function useGetColumns(zoneId: string) {
  return useQuery({
    queryKey: ["columns", zoneId],
    queryFn: () => getColumns(zoneId),
    enabled: !!zoneId,
  });
}
