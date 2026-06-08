import { useMutation, useQueryClient } from "@tanstack/react-query";
import removeContact from "@/fetchers/site/remove-contact";

function useRemoveContact(siteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId }: { contactId: string }) =>
      removeContact(siteId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site", siteId] });
    },
  });
}

export default useRemoveContact;
