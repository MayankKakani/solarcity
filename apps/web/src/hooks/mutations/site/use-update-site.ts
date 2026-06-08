import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateSite, {
  type UpdateSiteRequest,
} from "@/fetchers/site/update-site";

function useUpdateSite(siteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSiteRequest) => updateSite(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site", siteId] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}

export default useUpdateSite;
