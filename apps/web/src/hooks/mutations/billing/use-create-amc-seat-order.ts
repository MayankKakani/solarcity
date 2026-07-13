import { useMutation } from "@tanstack/react-query";
import createAmcSeatOrder from "@/fetchers/billing/create-amc-seat-order";

function useCreateAmcSeatOrder(workspaceId: string) {
  return useMutation({
    mutationFn: (seats: number) => createAmcSeatOrder(workspaceId, seats),
  });
}

export default useCreateAmcSeatOrder;
