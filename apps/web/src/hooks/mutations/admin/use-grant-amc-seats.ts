import { useMutation, useQueryClient } from "@tanstack/react-query";
import grantAmcSeats, {
  type GrantAmcSeatsRequest,
} from "@/fetchers/admin/grant-amc-seats";

function useGrantAmcSeats(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GrantAmcSeatsRequest) => grantAmcSeats(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-organisation", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-organisations"] });
    },
  });
}

export default useGrantAmcSeats;
