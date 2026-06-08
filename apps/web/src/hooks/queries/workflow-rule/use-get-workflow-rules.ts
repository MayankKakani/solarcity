import { useQuery } from "@tanstack/react-query";
import getWorkflowRules from "@/fetchers/workflow-rule/get-workflow-rules";

export function useGetWorkflowRules(zoneId: string) {
  return useQuery({
    queryKey: ["workflow-rules", zoneId],
    queryFn: () => getWorkflowRules(zoneId),
    enabled: !!zoneId,
  });
}
