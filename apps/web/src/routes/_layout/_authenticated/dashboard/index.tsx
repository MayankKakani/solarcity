import { createFileRoute, redirect } from "@tanstack/react-router";
import { getPendingInvitations } from "@/fetchers/invitation/get-pending-invitations";
import getWorkspaces from "@/fetchers/workspace/get-workspaces";
import { authClient } from "@/lib/auth-client";
import type Workspace from "@/types/workspace";

export const Route = createFileRoute("/_layout/_authenticated/dashboard/")({
  beforeLoad: async () => {
    const workspaces: Workspace[] = await getWorkspaces();
    const invitations = await getPendingInvitations();

    if (invitations && invitations.length > 0 && !workspaces.length) {
      throw redirect({ to: "/invitations" });
    }

    const session = await authClient.getSession();
    const activeWorkspaceId = session?.data?.session?.activeOrganizationId;

    if (workspaces && workspaces.length > 0) {
      if (
        activeWorkspaceId &&
        workspaces.some((ws) => ws.id === activeWorkspaceId)
      ) {
        throw redirect({
          to: "/dashboard/workspace/$workspaceId",
          params: { workspaceId: activeWorkspaceId },
        });
      }

      const firstWorkspace = workspaces[0];

      authClient.organization.setActive({
        organizationId: firstWorkspace.id,
      });

      throw redirect({
        to: "/dashboard/workspace/$workspaceId",
        params: { workspaceId: firstWorkspace.id },
      });
    }
  },
  component: NoOrganisationMessage,
});

function NoOrganisationMessage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center w-full">
      <p className="text-base font-medium text-neutral-800 dark:text-neutral-200">
        You are not assigned to any Organisation
      </p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Please reach out to your admin.
      </p>
    </div>
  );
}
