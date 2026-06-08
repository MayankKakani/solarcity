import { useMutation, useQueryClient } from "@tanstack/react-query";
import createSite, {
  type CreateSiteRequest,
} from "@/fetchers/site/create-site";

function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSiteRequest) => createSite(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sites", variables.workspaceId],
      });
    },
  });
}

export default useCreateSite;
