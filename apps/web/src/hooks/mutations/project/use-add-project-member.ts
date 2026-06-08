import { useMutation } from "@tanstack/react-query";
import addProjectMember from "@/fetchers/project/add-project-member";

function useAddProjectMember() {
  return useMutation({
    mutationFn: addProjectMember,
  });
}

export default useAddProjectMember;
