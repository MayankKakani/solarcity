import { useMutation } from "@tanstack/react-query";
import inviteByPhone, {
  type InviteByPhoneRequest,
} from "@/fetchers/invitation/invite-by-phone";
import queryClient from "@/query-client";

function useInviteByPhone() {
  return useMutation({
    mutationFn: (req: InviteByPhoneRequest) => inviteByPhone(req),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invites", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-users", workspaceId],
      });
    },
  });
}

export default useInviteByPhone;
