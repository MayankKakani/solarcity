import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import PageTitle from "@/components/page-title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import useAddProjectMember from "@/hooks/mutations/project/use-add-project-member";
import useRemoveProjectMember from "@/hooks/mutations/project/use-remove-project-member";
import useGetProjectMembers from "@/hooks/queries/project/use-get-project-members";
import useGetFullWorkspace from "@/hooks/queries/workspace/use-get-full-workspace";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { toast } from "@/lib/toast";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/settings/zones/$zoneId/members",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { zoneId } = useParams({ strict: false });
  const { workspace } = useWorkspacePermission();
  const { data: fullWorkspace } = useGetFullWorkspace({
    workspaceId: workspace?.id ?? "",
  });
  const { canManageProjects } = useWorkspacePermission();
  const canEdit = canManageProjects();

  const queryClient = useQueryClient();
  const { data: members = [] } = useGetProjectMembers({
    zoneId: zoneId ?? "",
  });

  const { mutateAsync: addMember, isPending: isAdding } = useAddProjectMember();
  const { mutateAsync: removeMember, isPending: isRemoving } =
    useRemoveProjectMember();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [removeUserId, setRemoveUserId] = useState<string | null>(null);

  const workspaceMembers = fullWorkspace?.members ?? [];
  const assignedUserIds = new Set(members.map((m) => m.userId));
  const availableMembers = workspaceMembers.filter(
    (wm) => !assignedUserIds.has(wm.userId),
  );

  const handleAdd = async () => {
    if (!zoneId || !selectedUserId) return;
    try {
      await addMember({ zoneId: zoneId, userId: selectedUserId });
      await queryClient.invalidateQueries({
        queryKey: ["project-members", zoneId],
      });
      toast.success("Member added to project");
      setAddDialogOpen(false);
      setSelectedUserId("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add member",
      );
    }
  };

  const handleRemove = async () => {
    if (!zoneId || !removeUserId) return;
    try {
      await removeMember({ zoneId: zoneId, userId: removeUserId });
      await queryClient.invalidateQueries({
        queryKey: ["project-members", zoneId],
      });
      toast.success("Member removed from project");
      setRemoveUserId(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove member",
      );
    }
  };

  return (
    <>
      <PageTitle title="Project Members" />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Members</h1>
          <p className="text-muted-foreground">
            Manage who has access to this project.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-md font-medium">Project Members</h2>
                <p className="text-xs text-muted-foreground">
                  {members.length} member{members.length !== 1 ? "s" : ""}{" "}
                  assigned to this project
                </p>
              </div>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setSelectedUserId("");
                    setAddDialogOpen(true);
                  }}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Add Member
                </Button>
              )}
            </div>
          </div>

          <div className="border border-border rounded-md bg-sidebar divide-y divide-border">
            {members.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No members assigned to this project yet.
              </div>
            ) : (
              members.map((member) => {
                const initials =
                  member.user?.name
                    ?.split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join("") ?? "?";

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={member.user?.image ?? ""}
                          alt={member.user?.name ?? ""}
                        />
                        <AvatarFallback className="text-[11px] font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {member.user?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        onClick={() => setRemoveUserId(member.userId)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Select a workspace member to add to this project.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full">
                <span className="text-sm">
                  {selectedUserId
                    ? (availableMembers.find((m) => m.userId === selectedUserId)
                        ?.user?.name ?? selectedUserId)
                    : "Select a member..."}
                </span>
              </SelectTrigger>
              <SelectContent>
                {availableMembers.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    All workspace members are already in this project.
                  </div>
                ) : (
                  availableMembers.map((wm) => (
                    <SelectItem key={wm.userId} value={wm.userId}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={wm.user?.image ?? ""}
                            alt={wm.user?.name ?? ""}
                          />
                          <AvatarFallback className="text-[9px]">
                            {wm.user?.name?.[0]?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{wm.user?.name ?? wm.userId}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!selectedUserId || isAdding}
            >
              {isAdding ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!removeUserId}
        onOpenChange={(open) => !open && setRemoveUserId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the project?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
