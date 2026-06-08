import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createService from "./controllers/create-service";
import deleteService from "./controllers/delete-service";
import getServices from "./controllers/get-services";
import updateService from "./controllers/update-service";

const serviceInputSchema = v.object({
  name: v.string(),
  description: v.optional(v.string()),
  defaultPrice: v.string(),
  currency: v.optional(v.string()),
  // labels: v.optional(v.array(v.string())),
  isActive: v.boolean(),
});

const serviceMaster = new Hono<{
  Variables: { userId: string; workspaceId: string };
}>()
  .get(
    "/",
    describeRoute({
      operationId: "listServices",
      tags: ["Services"],
      description: "List all services in the workspace catalogue",
      responses: {
        200: {
          description: "List of services",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      return c.json(await getServices(workspaceId));
    },
  )
  .post(
    "/",
    describeRoute({
      operationId: "createService",
      tags: ["Services"],
      description: "Create a new service in the workspace catalogue",
      responses: {
        200: {
          description: "Created service",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    validator("json", serviceInputSchema),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const body = c.req.valid("json");
      return c.json(await createService({ workspaceId, ...body }));
    },
  )
  .put(
    "/:serviceId",
    describeRoute({
      operationId: "updateService",
      tags: ["Services"],
      description: "Update a service in the workspace catalogue",
      responses: {
        200: {
          description: "Updated service",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    validator("param", v.object({ serviceId: v.string() })),
    validator("json", v.partial(serviceInputSchema)),
    async (c) => {
      const { serviceId } = c.req.valid("param");
      const body = c.req.valid("json");
      return c.json(await updateService({ serviceId, ...body }));
    },
  )
  .delete(
    "/:serviceId",
    describeRoute({
      operationId: "deleteService",
      tags: ["Services"],
      description: "Delete a service from the workspace catalogue",
      responses: {
        200: {
          description: "Deletion result",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    validator("param", v.object({ serviceId: v.string() })),
    async (c) => {
      const { serviceId } = c.req.valid("param");
      return c.json(await deleteService(serviceId));
    },
  );

export default serviceMaster;
