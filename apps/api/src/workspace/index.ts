import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import getWorkspaceEntitlementsCtrl from "./controllers/get-workspace-entitlements";
import getWorkspaceMembersCtrl from "./controllers/get-workspace-members";

const workspace = new Hono<{
  Variables: {
    userId: string;
    workspaceId: string;
  };
}>()
  .get(
    "/:workspaceId/members",
    describeRoute({
      operationId: "getWorkspaceMembers",
      tags: ["Workspaces"],
      description: "Get all members of a workspace",
      responses: {
        200: {
          description: "List of workspace members",
          content: {
            "application/json": {
              schema: resolver(
                v.array(
                  v.object({
                    id: v.string(),
                    name: v.string(),
                    email: v.string(),
                    image: v.nullable(v.string()),
                    role: v.string(),
                  }),
                ),
              ),
            },
          },
        },
      },
    }),
    validator("param", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromParam("workspaceId"),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const members = await getWorkspaceMembersCtrl(workspaceId);
      return c.json(members);
    },
  )
  .get(
    "/:workspaceId/entitlements",
    describeRoute({
      operationId: "getWorkspaceEntitlements",
      tags: ["Workspaces"],
      description:
        "Current plan and usage against plan limits (zones, AMC seats) for a workspace",
      responses: {
        200: {
          description: "Entitlements",
          content: {
            "application/json": {
              schema: resolver(
                v.object({
                  plan: v.object({
                    id: v.string(),
                    name: v.string(),
                    status: v.string(),
                  }),
                  zones: v.object({
                    used: v.number(),
                    limit: v.nullable(v.number()),
                  }),
                  amcSeats: v.object({
                    used: v.number(),
                    balance: v.number(),
                  }),
                }),
              ),
            },
          },
        },
      },
    }),
    validator("param", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromParam("workspaceId"),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const entitlements = await getWorkspaceEntitlementsCtrl(workspaceId);
      return c.json(entitlements);
    },
  );

export default workspace;
