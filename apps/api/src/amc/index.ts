import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireAmcSeatLimit } from "../entitlements/require-amc-seat-limit";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import addAmcService from "./controllers/add-amc-service";
import createAmc from "./controllers/create-amc";
import createBundle from "./controllers/create-bundle";
import deleteAmc from "./controllers/delete-amc";
import deleteAmcService from "./controllers/delete-amc-service";
import getAmcBySite from "./controllers/get-amc-by-site";
import getAmcDashboard from "./controllers/get-amc-dashboard";
import getBundles from "./controllers/get-bundles";
import updateAmc from "./controllers/update-amc";
import updateAmcService from "./controllers/update-amc-service";
import updateBundle from "./controllers/update-bundle";

const bundleServiceSchema = v.object({
  serviceMasterId: v.string(),
  frequency: v.picklist(["monthly", "quarterly", "half_yearly", "yearly"]),
  annualLimit: v.number(),
  price: v.string(),
  priceUnit: v.picklist(["per_visit", "per_unit", "lump_sum"]),
});

const amcServiceSchema = v.object({
  serviceMasterId: v.string(),
  frequency: v.picklist(["monthly", "quarterly", "half_yearly", "yearly"]),
  annualLimit: v.number(),
  price: v.string(),
  priceUnit: v.picklist(["per_visit", "per_unit", "lump_sum"]),
});

const amc = new Hono<{ Variables: { userId: string; workspaceId: string } }>()

  // ─── AMC Dashboard ───────────────────────────────────────────────────────────
  .get(
    "/dashboard",
    describeRoute({
      operationId: "getAmcDashboard",
      tags: ["AMC"],
      description:
        "Get all AMC contracts in the workspace with status and expiry info",
      responses: {
        200: {
          description: "AMC dashboard",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      return c.json(await getAmcDashboard(workspaceId));
    },
  )

  // ─── AMC Bundles ─────────────────────────────────────────────────────────────
  .get(
    "/bundles",
    describeRoute({
      operationId: "listAmcBundles",
      tags: ["AMC"],
      description: "List AMC bundle templates for the workspace",
      responses: {
        200: {
          description: "Bundles",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      return c.json(await getBundles(workspaceId));
    },
  )
  .post(
    "/bundles",
    describeRoute({
      operationId: "createAmcBundle",
      tags: ["AMC"],
      description: "Create an AMC bundle template",
      responses: {
        200: {
          description: "Created bundle",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    validator(
      "json",
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
        isActive: v.boolean(),
        services: v.array(bundleServiceSchema),
      }),
    ),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const body = c.req.valid("json");
      return c.json(await createBundle({ workspaceId, ...body }));
    },
  )
  .put(
    "/bundles/:bundleId",
    describeRoute({
      operationId: "updateAmcBundle",
      tags: ["AMC"],
      description:
        "Update an AMC bundle template (name, isActive, description) and optionally replace its service lines in one call",
      responses: {
        200: {
          description: "Updated bundle",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    validator("param", v.object({ bundleId: v.string() })),
    validator(
      "json",
      v.object({
        name: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        description: v.optional(v.string()),
        services: v.optional(
          v.array(
            v.object({
              id: v.optional(v.string()),
              serviceMasterId: v.string(),
              frequency: v.picklist([
                "monthly",
                "quarterly",
                "half_yearly",
                "yearly",
              ]),
              annualLimit: v.number(),
              price: v.string(),
              priceUnit: v.picklist(["per_visit", "per_unit", "lump_sum"]),
            }),
          ),
        ),
      }),
    ),
    async (c) => {
      const { bundleId } = c.req.valid("param");
      const body = c.req.valid("json");
      return c.json(await updateBundle({ bundleId, ...body }));
    },
  )
  // .delete(
  //   "/bundles/:bundleId",
  //   describeRoute({
  //     operationId: "deleteAmcBundle",
  //     tags: ["AMC"],
  //     description: "Delete an AMC bundle template",
  //     responses: { 200: { description: "Deletion result", content: { "application/json": { schema: resolver(v.any()) } } } },
  //   }),
  //   validator("query", v.object({ workspaceId: v.string() })),
  //   workspaceAccess.fromQuery(),
  //   validator("param", v.object({ bundleId: v.string() })),
  //   async (c) => {
  //     const { bundleId } = c.req.valid("param");
  //     return c.json(await deleteBundle(bundleId));
  //   },
  // )

  // ─── AMC Contracts ───────────────────────────────────────────────────────────
  .get(
    "/",
    describeRoute({
      operationId: "getAmcBySite",
      tags: ["AMC"],
      description:
        "Get the active AMC for a site (with service usage for current year)",
      responses: {
        200: {
          description: "AMC or null",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ siteId: v.string() })),
    async (c) => {
      const { siteId } = c.req.valid("query");
      return c.json(await getAmcBySite(siteId));
    },
  )
  .post(
    "/",
    describeRoute({
      operationId: "createAmc",
      tags: ["AMC"],
      description: "Create an AMC contract for a site",
      responses: {
        200: {
          description: "Created AMC",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    requireAmcSeatLimit(),
    validator(
      "json",
      v.object({
        siteId: v.string(),
        bundleId: v.optional(v.string()),
        startDate: v.string(),
        durationYears: v.number(),
        contractReference: v.optional(v.string()),
        notes: v.optional(v.string()),
        services: v.array(amcServiceSchema),
      }),
    ),
    async (c) => {
      const body = c.req.valid("json");
      return c.json(
        await createAmc({
          ...body,
          startDate: new Date(body.startDate),
        }),
      );
    },
  )
  .put(
    "/:amcId",
    describeRoute({
      operationId: "updateAmc",
      tags: ["AMC"],
      description: "Update an AMC contract (status, reference, notes only)",
      responses: {
        200: {
          description: "Updated AMC",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    validator("param", v.object({ amcId: v.string() })),
    validator(
      "json",
      v.object({
        status: v.optional(v.picklist(["active", "expired", "cancelled"])),
        contractReference: v.optional(v.string()),
        notes: v.optional(v.string()),
      }),
    ),
    async (c) => {
      const { amcId } = c.req.valid("param");
      const body = c.req.valid("json");
      return c.json(await updateAmc({ amcId, ...body }));
    },
  )
  .delete(
    "/:amcId",
    describeRoute({
      operationId: "deleteAmc",
      tags: ["AMC"],
      description: "Delete an AMC contract",
      responses: {
        200: {
          description: "Deletion result",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    validator("param", v.object({ amcId: v.string() })),
    async (c) => {
      const { amcId } = c.req.valid("param");
      return c.json(await deleteAmc(amcId));
    },
  )

  // ─── AMC Service Lines ───────────────────────────────────────────────────────
  .post(
    "/:amcId/services",
    describeRoute({
      operationId: "addAmcService",
      tags: ["AMC"],
      description: "Add a service line to an AMC (price is locked on insert)",
      responses: {
        200: {
          description: "Added service",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    validator("param", v.object({ amcId: v.string() })),
    validator("json", amcServiceSchema),
    async (c) => {
      const { amcId } = c.req.valid("param");
      const body = c.req.valid("json");
      return c.json(await addAmcService({ amcId, ...body }));
    },
  )
  .put(
    "/:amcId/services/:serviceId",
    describeRoute({
      operationId: "updateAmcService",
      tags: ["AMC"],
      description:
        "Update frequency or annualLimit of an AMC service (price is immutable)",
      responses: {
        200: {
          description: "Updated service",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    validator("param", v.object({ amcId: v.string(), serviceId: v.string() })),
    validator(
      "json",
      v.object({
        frequency: v.optional(
          v.picklist(["monthly", "quarterly", "half_yearly", "yearly"]),
        ),
        annualLimit: v.optional(v.number()),
      }),
    ),
    async (c) => {
      const { serviceId } = c.req.valid("param");
      const body = c.req.valid("json");
      return c.json(await updateAmcService({ serviceId, ...body }));
    },
  )
  .delete(
    "/:amcId/services/:serviceId",
    describeRoute({
      operationId: "deleteAmcService",
      tags: ["AMC"],
      description: "Remove a service line from an AMC",
      responses: {
        200: {
          description: "Deletion result",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    validator("param", v.object({ amcId: v.string(), serviceId: v.string() })),
    async (c) => {
      const { serviceId } = c.req.valid("param");
      return c.json(await deleteAmcService(serviceId));
    },
  );

export default amc;
