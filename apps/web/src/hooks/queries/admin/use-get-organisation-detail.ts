import { useQuery } from "@tanstack/react-query";
import getOrganisationDetail from "@/fetchers/admin/get-organisation-detail";

function useGetOrganisationDetail(workspaceId: string) {
  return useQuery({
    queryKey: ["admin-organisation", workspaceId],
    queryFn: () => getOrganisationDetail(workspaceId),
    enabled: !!workspaceId,
  });
}

export default useGetOrganisationDetail;
