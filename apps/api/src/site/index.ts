import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import addContact from "./controllers/add-contact";
import createSite from "./controllers/create-site";
import deleteSite from "./controllers/delete-site";
import getSite from "./controllers/get-site";
import getSiteTasks from "./controllers/get-site-tasks";
import getSites from "./controllers/get-sites";
import removeContact from "./controllers/remove-contact";
import resolveZoneForSite from "./controllers/resolve-zone";
import updateSite from "./controllers/update-site";

const siteInputSchema = v.object({
  name: v.string(),
  siteCode: v.string(),
  siteType: v.picklist([
    "residential",
    "commercial",
    "industrial",
    "agricultural",
  ]),
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
  address: v.optional(v.string()),
  systemCapacityKwp: v.optional(v.string()),
  installationDate: v.optional(v.string()),
  panelCount: v.optional(v.number()),
  inverterModel: v.optional(v.string()),
  gridConnectionType: v.optional(v.picklist(["on_grid", "off_grid", "hybrid"])),
  status: v.optional(v.picklist(["active", "inactive", "under_maintenance"])),
});

const contactInputSchema = v.object({
  name: v.string(),
  role: v.picklist(["owner", "caretaker", "security", "manager", "contractor"]),
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
  isPrimary: v.optional(v.boolean()),
});

const site = new Hono<{ Variables: { userId: string; workspaceId: string } }>()
  .get(
    "/",
    describeRoute({
      operationId: "listSites",
      tags: ["Sites"],
      description: "List all sites in a workspace",
      responses: {
        200: {
          description: "List of sites",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      return c.json(await getSites(workspaceId));
    },
  )
  .post(
    "/",
    describeRoute({
      operationId: "createSite",
      tags: ["Sites"],
      description: "Create a new site in a workspace",
      responses: {
        200: {
          description: "Created site",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    validator("json", siteInputSchema),
    workspaceAccess.fromQuery(),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const body = c.req.valid("json");
      return c.json(await createSite({ workspaceId, ...body }));
    },
  )
  .get(
    "/:siteId",
    describeRoute({
      operationId: "getSite",
      tags: ["Sites"],
      description: "Get a site with its contacts",
      responses: {
        200: {
          description: "Site details",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ siteId: v.string() })),
    async (c) => {
      const { siteId } = c.req.valid("param");
      return c.json(await getSite(siteId));
    },
  )
  .put(
    "/:siteId",
    describeRoute({
      operationId: "updateSite",
      tags: ["Sites"],
      description: "Update a site",
      responses: {
        200: {
          description: "Updated site",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ siteId: v.string() })),
    validator("json", v.partial(siteInputSchema)),
    async (c) => {
      const { siteId } = c.req.valid("param");
      const body = c.req.valid("json");
      return c.json(await updateSite({ siteId, ...body }));
    },
  )
  .delete(
    "/:siteId",
    describeRoute({
      operationId: "deleteSite",
      tags: ["Sites"],
      description: "Delete a site",
      responses: {
        200: {
          description: "Deleted site",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ siteId: v.string() })),
    async (c) => {
      const { siteId } = c.req.valid("param");
      return c.json(await deleteSite(siteId));
    },
  )
  .get(
    "/:siteId/resolve-zone",
    describeRoute({
      operationId: "resolveSiteZone",
      tags: ["Sites"],
      description: "Resolve which zone a site falls into based on its location",
      responses: {
        200: {
          description: "Zone resolution result",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ siteId: v.string() })),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    async (c) => {
      const { siteId } = c.req.valid("param");
      const workspaceId = c.get("workspaceId");
      return c.json(await resolveZoneForSite(siteId, workspaceId));
    },
  )
  .get(
    "/:siteId/tasks",
    describeRoute({
      operationId: "getSiteTasks",
      tags: ["Sites"],
      description: "Get all maintenance requests (tasks) raised for a site",
      responses: {
        200: {
          description: "Site tasks",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ siteId: v.string() })),
    async (c) => {
      const { siteId } = c.req.valid("param");
      return c.json(await getSiteTasks(siteId));
    },
  )
  .post(
    "/:siteId/contacts",
    describeRoute({
      operationId: "addSiteContact",
      tags: ["Sites"],
      description: "Add a contact to a site",
      responses: {
        200: {
          description: "Created contact",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ siteId: v.string() })),
    validator("json", contactInputSchema),
    async (c) => {
      const { siteId } = c.req.valid("param");
      const body = c.req.valid("json");
      return c.json(await addContact({ siteId, ...body }));
    },
  )
  .delete(
    "/:siteId/contacts/:contactId",
    describeRoute({
      operationId: "removeSiteContact",
      tags: ["Sites"],
      description: "Remove a contact from a site",
      responses: {
        200: {
          description: "Deleted contact",
          content: { "application/json": { schema: resolver(v.any()) } },
        },
      },
    }),
    validator("param", v.object({ siteId: v.string(), contactId: v.string() })),
    async (c) => {
      const { contactId } = c.req.valid("param");
      return c.json(await removeContact(contactId));
    },
  );

export default site;
