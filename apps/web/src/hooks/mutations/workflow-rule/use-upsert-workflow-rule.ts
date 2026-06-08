import { useMutation, useQueryClient } from "@tanstack/react-query";
import upsertWorkflowRule from "@/fetchers/workflow-rule/upsert-workflow-rule";

export function useUpsertWorkflowRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      zoneId,
      data,
    }: {
      zoneId: string;
      data: { integrationType: string; eventType: string; columnId: string };
    }) => upsertWorkflowRule(zoneId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workflow-rules", variables.zoneId],
      });
    },
  });
}
