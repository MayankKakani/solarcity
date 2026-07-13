import { useQuery } from "@tanstack/react-query";
import listOrganisations from "@/fetchers/admin/list-organisations";

function useListOrganisations(page: number, pageSize: number) {
  return useQuery({
    queryKey: ["admin-organisations", page, pageSize],
    queryFn: () => listOrganisations(page, pageSize),
  });
}

export default useListOrganisations;
