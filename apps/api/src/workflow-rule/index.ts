import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import deleteWorkflowRule from "./controllers/delete-workflow-rule";
import getWorkflowRules from "./controllers/get-workflow-rules";
import upsertWorkflowRule from "./controllers/upsert-workflow-rule";

const workflowRule = new Hono<{
  Variables: {
    userId: string;
  };
}>()
  .get(
    "/:zoneId",
    describeRoute({
      operationId: "getWorkflowRules",
      tags: ["Workflow Rules"],
      description: "Get all workflow rules for a project",
      responses: {
        200: {
          description: "List of workflow rules",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ zoneId: v.string() })),
    workspaceAccess.fromProject("zoneId"),
    async (c) => {
      const { zoneId } = c.req.valid("param");
      const rules = await getWorkflowRules(zoneId);
      return c.json(rules);
    },
  )
  .put(
    "/:zoneId",
    describeRoute({
      operationId: "upsertWorkflowRule",
      tags: ["Workflow Rules"],
      description: "Create or update a workflow rule",
      responses: {
        200: {
          description: "Workflow rule upserted successfully",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ zoneId: v.string() })),
    validator(
      "json",
      v.object({
        integrationType: v.string(),
        eventType: v.string(),
        columnId: v.string(),
      }),
    ),
    workspaceAccess.fromProject("zoneId"),
    requireWorkspacePermission({ project: ["update"] }),
    async (c) => {
      const { zoneId } = c.req.valid("param");
      const { integrationType, eventType, columnId } = c.req.valid("json");
      const result = await upsertWorkflowRule({
        zoneId,
        integrationType,
        eventType,
        columnId,
      });
      return c.json(result);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      operationId: "deleteWorkflowRule",
      tags: ["Workflow Rules"],
      description: "Delete a workflow rule",
      responses: {
        200: {
          description: "Workflow rule deleted successfully",
          content: {
            "application/json": { schema: resolver(v.any()) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    workspaceAccess.fromWorkflowRule("id"),
    requireWorkspacePermission({ project: ["update"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const result = await deleteWorkflowRule(id);
      return c.json(result);
    },
  );

export default workflowRule;
