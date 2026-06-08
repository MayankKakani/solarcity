import { useMutation, useQueryClient } from "@tanstack/react-query";
import importGiteaIssues from "@/fetchers/gitea-integration/import-gitea-issues";

export default function useImportGiteaIssues() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zoneId: string) => importGiteaIssues(zoneId),
    onSuccess: (_, zoneId) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", zoneId] });
      queryClient.invalidateQueries({ queryKey: ["project", zoneId] });
    },
  });
}
