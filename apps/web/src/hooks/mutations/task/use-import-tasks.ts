import { useMutation } from "@tanstack/react-query";
import importTasks, { type TaskToImport } from "@/fetchers/task/import-tasks";

const useImportTasks = () => {
  return useMutation({
    mutationFn: ({
      zoneId,
      tasks,
    }: {
      zoneId: string;
      tasks: TaskToImport[];
    }) => importTasks(zoneId, tasks),
  });
};

export default useImportTasks;
