import { useMutation, useQueryClient } from "@tanstack/react-query";
import setOrganisationPlan, {
  type SetOrganisationPlanRequest,
} from "@/fetchers/admin/set-organisation-plan";

function useSetOrganisationPlan(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetOrganisationPlanRequest) =>
      setOrganisationPlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-organisation", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-organisations"] });
    },
  });
}

export default useSetOrganisationPlan;
