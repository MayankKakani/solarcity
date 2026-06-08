import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/zone/$zoneId/",
)({
  beforeLoad: () => {
    throw redirect({
      to: "/dashboard/workspace/$workspaceId/zone/$zoneId/board",
      replace: true,
    });
  },
});
