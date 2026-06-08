import { useQuery } from "@tanstack/react-query";
import getUserProjects from "@/fetchers/project/get-user-projects";
import { authClient } from "@/lib/auth-client";

type GetFullWorkspaceRequest = {
  workspaceId?: string;
  workspaceSlug?: string;
  membersLimit?: number;
};

function useGetFullWorkspace({
  workspaceId,
  workspaceSlug,
  membersLimit = 100,
}: GetFullWorkspaceRequest) {
  return useQuery({
    queryKey: ["workspace", "full", workspaceId || workspaceSlug],
    enabled: !!(workspaceId || workspaceSlug),
    queryFn: async () => {
      const { data, error } = await authClient.organization.getFullOrganization(
        {
          query: {
            organizationId: workspaceId,
            membersLimit,
          },
        },
      );

      if (error) {
        throw new Error(error.message || "Failed to get full workspace");
      }

      if (!data) return null;

      const userIds = data.members.map((m) => m.userId);
      const projectRows = userIds.length
        ? await getUserProjects({ userIds, workspaceId: data.id })
        : [];

      const memberProjectsMap = new Map<string, typeof projectRows>();
      for (const row of projectRows) {
        const existing = memberProjectsMap.get(row.userId) ?? [];
        memberProjectsMap.set(row.userId, [...existing, row]);
      }

      return {
        ...data,
        members: data.members.map((member) => ({
          ...member,
          projects: memberProjectsMap.get(member.userId) ?? [],
        })),
      };
    },
  });
}

export default useGetFullWorkspace;
