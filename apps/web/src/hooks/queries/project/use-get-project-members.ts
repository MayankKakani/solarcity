import { useQuery } from "@tanstack/react-query";
import getProjectMembers from "@/fetchers/project/get-project-members";

function useGetProjectMembers({ zoneId }: { zoneId: string }) {
  return useQuery({
    queryFn: () => getProjectMembers({ zoneId }),
    queryKey: ["project-members", zoneId],
    enabled: !!zoneId,
  });
}

export default useGetProjectMembers;
