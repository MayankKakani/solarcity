import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireWorkspacePermission } from "../utils/require-workspace-permission";
import { workspaceAccess } from "../utils/workspace-access-middleware";
import createAmcSeatOrder from "./controllers/create-amc-seat-order";
import createSubscriptionCheckout from "./controllers/create-subscription-checkout";

const billing = new Hono<{
  Variables: {
    userId: string;
    workspaceId: string;
  };
}>()
  .post(
    "/subscriptions",
    describeRoute({
      operationId: "createBillingSubscription",
      tags: ["Billing"],
      description:
        "Create a Razorpay subscription checkout for a workspace plan upgrade",
      responses: {
        200: {
          description: "Checkout params",
          content: {
            "application/json": {
              schema: resolver(
                v.object({
                  subscriptionId: v.string(),
                  keyId: v.string(),
                }),
              ),
            },
          },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    requireWorkspacePermission({ workspace: ["update"] }),
    validator("json", v.object({ planId: v.string() })),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const { planId } = c.req.valid("json");
      const checkout = await createSubscriptionCheckout(workspaceId, planId);
      return c.json(checkout);
    },
  )
  .post(
    "/amc-seats",
    describeRoute({
      operationId: "createBillingAmcSeatOrder",
      tags: ["Billing"],
      description:
        "Create a Razorpay order checkout for a one-time AMC seat purchase",
      responses: {
        200: {
          description: "Checkout params",
          content: {
            "application/json": {
              schema: resolver(
                v.object({
                  orderId: v.string(),
                  amount: v.union([v.number(), v.string()]),
                  keyId: v.string(),
                }),
              ),
            },
          },
        },
      },
    }),
    validator("query", v.object({ workspaceId: v.string() })),
    workspaceAccess.fromQuery(),
    requireWorkspacePermission({ workspace: ["update"] }),
    validator(
      "json",
      v.object({ seats: v.pipe(v.number(), v.integer(), v.minValue(1)) }),
    ),
    async (c) => {
      const workspaceId = c.get("workspaceId");
      const { seats } = c.req.valid("json");
      const checkout = await createAmcSeatOrder(workspaceId, seats);
      return c.json(checkout);
    },
  );

export default billing;
