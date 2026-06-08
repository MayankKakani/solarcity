import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { projectSchema } from "../schemas";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import addProjectMemberCtrl from "./controllers/add-project-member";
import archiveProjectCtrl from "./controllers/archive-project";
import createProjectCtrl from "./controllers/create-project";
import deleteProjectCtrl from "./controllers/delete-project";
import getProjectCtrl from "./controllers/get-project";
import getProjectMembersCtrl from "./controllers/get-project-members";
import getProjectsCtrl from "./controllers/get-projects";
import getUserProjectsCtrl from "./controllers/get-user-projects";
import removeProjectMemberCtrl from "./controllers/remove-project-member";
import unarchiveProjectCtrl from "./controllers/unarchive-project";
import updateProjectCtrl from "./controllers/update-project";

const project = new Hono<{
  Variables: {
    userId: string;
    workspaceId: string;
  };
}>()
  .get(
    "/",
    describeRoute({
      operationId: "listProjects",
      tags: ["Projects"],
      description: "Get all projects in a workspace",
      responses: {
        200: {
          description: "List of projects with statistics",
          content: {
            "application/json": { schema: resolver(v.array(projectSchema)) },
          },
        },
      },
    }),
    validator(
      "query",
      v.object({
        workspaceId: v.string(),
        includeArchived: v.optional(v.string()),
      }),
    ),
    workspaceAccess.fromQuery(),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const userId = c.get("userId");
      const { includeArchived } = c.req.valid("query");
      const projects = await getProjectsCtrl(
        workspaceId,
        userId,
        includeArchived === "true",
      );
      return c.json(projects);
    },
  )
  .post(
    "/",
    describeRoute({
      operationId: "createProject",
      tags: ["Projects"],
      description: "Create a new project in a workspace",
      responses: {
        200: {
          description: "Project created successfully",
          content: {
            "application/json": { schema: resolver(projectSchema) },
          },
        },
      },
    }),
    validator(
      "json",
      v.object({
        name: v.string(),
        workspaceId: v.string(),
        icon: v.string(),
        slug: v.string(),
        boundingBox: v.optional(
          v.object({
            type: v.literal("Polygon"),
            coordinates: v.array(v.array(v.tuple([v.number(), v.number()]))),
          }),
        ),
      }),
    ),
    workspaceAccess.fromBody(),
    requireWorkspacePermission({ project: ["create"] }),
    async (c) => {
      const { name, icon, slug, boundingBox } = c.req.valid("json");
      const workspaceId = c.get("workspaceId");
      const newProject = await createProjectCtrl(
        workspaceId,
        name,
        icon,
        slug,
        boundingBox,
      );
      return c.json(newProject);
    },
  )
  .get(
    "/user",
    describeRoute({
      operationId: "listUserProjects",
      tags: ["Projects"],
      description:
        "Get all projects the given users are assigned to in a workspace",
      responses: {
        200: {
          description: "List of { userId, ...project } rows",
        },
      },
    }),
    validator(
      "query",
      v.object({
        userIds: v.string(),
        workspaceId: v.string(),
      }),
    ),
    workspaceAccess.fromQuery(),
    async (c) => {
      const { userIds } = c.req.valid("query");
      const workspaceId = c.get("workspaceId");
      const userIdList = userIds.split(",").filter(Boolean);
      const rows = await getUserProjectsCtrl(userIdList, workspaceId);
      return c.json(rows);
    },
  )
  .get(
    "/:id",
    describeRoute({
      operationId: "getProject",
      tags: ["Projects"],
      description: "Get a specific project by ID",
      responses: {
        200: {
          description: "Project details",
          content: {
            "application/json": { schema: resolver(projectSchema) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    workspaceAccess.fromProject(),
    async (c) => {
      const { id } = c.req.valid("param");
      const workspaceId = c.get("workspaceId");
      const userId = c.get("userId");
      const projectData = await getProjectCtrl(id, workspaceId, userId);
      return c.json(projectData);
    },
  )
  .put(
    "/:id",
    describeRoute({
      operationId: "updateProject",
      tags: ["Projects"],
      description: "Update an existing project",
      responses: {
        200: {
          description: "Project updated successfully",
          content: {
            "application/json": { schema: resolver(projectSchema) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator(
      "json",
      v.object({
        name: v.string(),
        icon: v.string(),
        slug: v.string(),
        description: v.string(),
        isPublic: v.boolean(),
      }),
    ),
    workspaceAccess.fromProject(),
    requireWorkspacePermission({ project: ["update"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { name, icon, slug, description, isPublic } = c.req.valid("json");
      const workspaceId = c.get("workspaceId");
      const updatedProject = await updateProjectCtrl(
        id,
        name,
        icon,
        slug,
        description,
        isPublic,
        workspaceId,
      );
      return c.json(updatedProject);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      operationId: "deleteProject",
      tags: ["Projects"],
      description: "Delete a project by ID",
      responses: {
        200: {
          description: "Project deleted successfully",
          content: {
            "application/json": { schema: resolver(projectSchema) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    workspaceAccess.fromProject(),
    requireWorkspacePermission({ project: ["delete"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const workspaceId = c.get("workspaceId");
      const userId = c.get("userId");
      const deletedProject = await deleteProjectCtrl(id, workspaceId, userId);
      return c.json(deletedProject);
    },
  )
  .put(
    "/:id/archive",
    describeRoute({
      operationId: "archiveProject",
      tags: ["Projects"],
      description: "Archive a project by ID",
      responses: {
        200: {
          description: "Project archived successfully",
          content: {
            "application/json": { schema: resolver(projectSchema) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    workspaceAccess.fromProject(),
    requireWorkspacePermission({ project: ["update"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const workspaceId = c.get("workspaceId");
      const archivedProject = await archiveProjectCtrl(id, workspaceId);
      return c.json(archivedProject);
    },
  )
  .put(
    "/:id/unarchive",
    describeRoute({
      operationId: "unarchiveProject",
      tags: ["Projects"],
      description: "Unarchive a project by ID",
      responses: {
        200: {
          description: "Project unarchived successfully",
          content: {
            "application/json": { schema: resolver(projectSchema) },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    workspaceAccess.fromProject(),
    requireWorkspacePermission({ project: ["update"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const workspaceId = c.get("workspaceId");
      const unarchivedProject = await unarchiveProjectCtrl(id, workspaceId);
      return c.json(unarchivedProject);
    },
  )
  .get(
    "/:id/members",
    describeRoute({
      operationId: "listProjectMembers",
      tags: ["Projects"],
      description: "Get all members assigned to a project",
      responses: {
        200: {
          description: "List of project members",
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    workspaceAccess.fromProject(),
    async (c) => {
      const { id } = c.req.valid("param");
      const workspaceId = c.get("workspaceId");
      const members = await getProjectMembersCtrl(id, workspaceId);
      return c.json(members);
    },
  )
  .post(
    "/:id/members",
    describeRoute({
      operationId: "addProjectMember",
      tags: ["Projects"],
      description: "Add a user to a project",
      responses: {
        200: {
          description: "Member added successfully",
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator("json", v.object({ userId: v.string() })),
    workspaceAccess.fromProject(),
    requireWorkspacePermission({ project: ["update"] }),
    async (c) => {
      const { id } = c.req.valid("param");
      const { userId } = c.req.valid("json");
      const workspaceId = c.get("workspaceId");
      const createdBy = c.get("userId");
      const member = await addProjectMemberCtrl(
        id,
        userId,
        workspaceId,
        createdBy,
      );
      return c.json(member);
    },
  )
  .delete(
    "/:id/members/:userId",
    describeRoute({
      operationId: "removeProjectMember",
      tags: ["Projects"],
      description: "Remove a user from a project",
      responses: {
        200: {
          description: "Member removed successfully",
        },
      },
    }),
    validator("param", v.object({ id: v.string(), userId: v.string() })),
    workspaceAccess.fromProject(),
    requireWorkspacePermission({ project: ["update"] }),
    async (c) => {
      const { id, userId } = c.req.valid("param");
      const assignment = await removeProjectMemberCtrl(id, userId);
      return c.json(assignment);
    },
  );

export default project;
