import { useMutation } from "@tanstack/react-query";
import exportTasks from "@/fetchers/task/export-tasks";

const useExportTasks = () => {
  return useMutation({
    mutationFn: (zoneId: string) => exportTasks(zoneId),
  });
};

export default useExportTasks;
