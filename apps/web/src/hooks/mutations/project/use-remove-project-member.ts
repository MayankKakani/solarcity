import { useMutation } from "@tanstack/react-query";
import removeProjectMember from "@/fetchers/project/remove-project-member";

function useRemoveProjectMember() {
  return useMutation({
    mutationFn: removeProjectMember,
  });
}

export default useRemoveProjectMember;
