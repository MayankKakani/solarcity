import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import acceptPhoneInvite from "./controllers/accept-phone-invite";
import getInvitationDetailsController from "./controllers/get-invitation-details";
import getUserPendingInvitations from "./controllers/get-user-pending-invitations";
import inviteByPhone from "./controllers/invite-by-phone";

const invitation = new Hono<{
  Variables: {
    userId: string;
    userEmail: string;
  };
}>()
  .get(
    "/pending",
    describeRoute({
      operationId: "getUserPendingInvitations",
      tags: ["Invitations"],
      description: "Get all pending invitations for the current user",
      responses: {
        200: {
          description: "List of pending invitations",
          content: {
            "application/json": {
              schema: resolver(
                v.array(
                  v.object({
                    id: v.string(),
                    email: v.string(),
                    workspaceId: v.string(),
                    workspaceName: v.string(),
                    inviterName: v.string(),
                    expiresAt: v.string(),
                    createdAt: v.string(),
                    status: v.string(),
                  }),
                ),
              ),
            },
          },
        },
      },
    }),
    async (c) => {
      const userEmail = c.get("userEmail");
      const invitations = await getUserPendingInvitations(userEmail);
      return c.json(invitations);
    },
  )
  .get(
    "/:id",
    describeRoute({
      operationId: "getInvitationDetails",
      tags: ["Invitations"],
      description: "Get details of a specific invitation by ID",
      responses: {
        200: {
          description: "Invitation details",
          content: {
            "application/json": {
              schema: resolver(
                v.object({
                  valid: v.boolean(),
                  invitation: v.optional(
                    v.object({
                      id: v.string(),
                      email: v.string(),
                      phoneNumber: v.optional(v.nullable(v.string())),
                      zoneIds: v.optional(v.nullable(v.string())),
                      workspaceName: v.string(),
                      inviterName: v.string(),
                      expiresAt: v.string(),
                      status: v.string(),
                      expired: v.boolean(),
                    }),
                  ),
                  error: v.optional(v.string()),
                }),
              ),
            },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const result = await getInvitationDetailsController(id);
      return c.json(result);
    },
  )
  .post(
    "/invite-by-phone",
    describeRoute({
      operationId: "inviteByPhone",
      tags: ["Invitations"],
      description:
        "Invite a user by phone number with role and project assignments",
      responses: {
        200: {
          description: "Invitation created",
          content: {
            "application/json": {
              schema: resolver(v.object({ id: v.string() })),
            },
          },
        },
      },
    }),
    validator(
      "json",
      v.object({
        phoneNumber: v.string(),
        role: v.string(),
        zoneIds: v.array(v.string()),
        workspaceId: v.string(),
      }),
    ),
    async (c) => {
      const inviterId = c.get("userId");
      const { phoneNumber, role, zoneIds, workspaceId } = c.req.valid("json");
      const inv = await inviteByPhone(
        inviterId,
        workspaceId,
        phoneNumber,
        role,
        zoneIds,
      );
      return c.json({ id: inv.id });
    },
  )
  .post(
    "/:id/accept-phone-invite",
    describeRoute({
      operationId: "acceptPhoneInvite",
      tags: ["Invitations"],
      description: "Accept a phone-based invitation and assign projects",
      responses: {
        200: {
          description: "Invitation accepted",
          content: {
            "application/json": {
              schema: resolver(v.object({ workspaceId: v.string() })),
            },
          },
        },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    async (c) => {
      const userId = c.get("userId");
      const { id } = c.req.valid("param");
      const result = await acceptPhoneInvite(id, userId);
      return c.json(result);
    },
  );

export default invitation;
