import { useMutation, useQueryClient } from "@tanstack/react-query";
import addContact, {
  type AddContactRequest,
} from "@/fetchers/site/add-contact";

function useAddContact(siteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddContactRequest) => addContact(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site", siteId] });
    },
  });
}

export default useAddContact;
