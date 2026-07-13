import { useQuery } from "@tanstack/react-query";
import getWorkspaceEntitlements from "@/fetchers/workspace/get-workspace-entitlements";

function useGetWorkspaceEntitlements(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-entitlements", workspaceId],
    queryFn: () => getWorkspaceEntitlements(workspaceId),
    enabled: !!workspaceId,
  });
}

export default useGetWorkspaceEntitlements;
