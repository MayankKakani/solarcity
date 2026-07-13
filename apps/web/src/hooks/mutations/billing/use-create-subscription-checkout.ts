import { useMutation } from "@tanstack/react-query";
import createSubscriptionCheckout from "@/fetchers/billing/create-subscription-checkout";

function useCreateSubscriptionCheckout(workspaceId: string) {
  return useMutation({
    mutationFn: (planId: string) =>
      createSubscriptionCheckout(workspaceId, planId),
  });
}

export default useCreateSubscriptionCheckout;
