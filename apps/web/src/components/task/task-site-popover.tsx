import { useNavigate } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type Task from "@/types/task";

type TaskSitePopoverProps = {
  task: Task;
  workspaceId: string;
  children: React.ReactNode;
};

export default function TaskSitePopover({
  task,
  workspaceId,
  children,
}: TaskSitePopoverProps) {
  const navigate = useNavigate();
  // const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const handleSiteClick = () => {
    navigate({
      to: `/dashboard/workspace/${workspaceId}/sites/${task.siteId}`,
    });
  };
  const handleMapClick = () => {
    navigate({
      to: `/dashboard/workspace/${workspaceId}/sites/${task.siteId}`,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <div className="flex-1 p-2">
          <div className="flex items-center gap-3">
            <MapPin />
            <div className="min-w-0 flex-1">
              <h4 className="line-clamp-1 font-medium text-sm">
                {task.siteName}
              </h4>
              <div className="flex items-center gap-3 text-muted-foreground text-xs">
                {task.siteAddress}
              </div>
            </div>
          </div>
          <div className="align-middle flex gap-2.5 p-2">
            <Button size={"xs"} onClick={handleSiteClick}>
              Go to site
            </Button>
            <Button size={"xs"} onClick={handleMapClick}>
              Go to map
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
