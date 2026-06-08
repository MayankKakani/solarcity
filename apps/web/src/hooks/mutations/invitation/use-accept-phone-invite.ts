import { useMutation } from "@tanstack/react-query";
import acceptPhoneInvite from "@/fetchers/invitation/accept-phone-invite";

function useAcceptPhoneInvite() {
  return useMutation({
    mutationFn: (invitationId: string) => acceptPhoneInvite(invitationId),
  });
}

export default useAcceptPhoneInvite;
