import { useMutation, useQueryClient } from "@tanstack/react-query";
import updateTaskAssignee from "@/fetchers/task/update-task-assignee";

type UpdateTaskAssigneeVariables = {
  taskId: string;
  zoneId: string;
  assignees: { userId: string; role: "supervisor" | "engineer" }[];
};

export function useUpdateTaskAssignee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, assignees }: UpdateTaskAssigneeVariables) =>
      updateTaskAssignee(taskId, assignees),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["task", variables.taskId], data);
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.zoneId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["activities", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-relations"],
      });
    },
  });
}
