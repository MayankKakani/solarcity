import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { describeRoute, resolver, validator } from "hono-openapi";
import * as v from "valibot";
import { requireInstanceAdmin } from "../utils/require-instance-admin";
import { PLAN_SEEDS, type PlanSeed } from "../utils/seed-plans";
import getInstanceStatsCtrl from "./controllers/get-instance-stats";
import getOrganisationDetailCtrl from "./controllers/get-organisation-detail";
import grantAmcSeatsCtrl from "./controllers/grant-amc-seats";
import listOrganisationsCtrl from "./controllers/list-organisations";
import setOrganisationPlanCtrl from "./controllers/set-organisation-plan";

const organisationSummarySchema = v.object({
  id: v.string(),
  name: v.string(),
  slug: v.string(),
  planId: v.string(),
  planName: v.string(),
  subscriptionStatus: v.string(),
  memberCount: v.number(),
  zoneCount: v.number(),
  siteCount: v.number(),
  activeAmcCount: v.number(),
  amcSeatBalance: v.number(),
  createdAt: v.date(),
});

const admin = new Hono<{
  Variables: {
    userId: string;
  };
}>()
  .use("*", requireInstanceAdmin())
  .get(
    "/stats",
    describeRoute({
      operationId: "getAdminInstanceStats",
      tags: ["Admin"],
      description: "Instance-wide totals across every organisation",
      responses: {
        200: {
          description: "Instance stats",
          content: {
            "application/json": {
              schema: resolver(
                v.object({
                  organisationCount: v.number(),
                  userCount: v.number(),
                  zoneCount: v.number(),
                  taskCount: v.number(),
                  siteCount: v.number(),
                  activeAmcCount: v.number(),
                }),
              ),
            },
          },
        },
      },
    }),
    async (c) => {
      const stats = await getInstanceStatsCtrl();
      return c.json(stats);
    },
  )
  .get(
    "/organisations",
    describeRoute({
      operationId: "listAdminOrganisations",
      tags: ["Admin"],
      description: "Paginated list of every organisation with plan and usage",
      responses: {
        200: {
          description: "Organisations",
          content: {
            "application/json": {
              schema: resolver(
                v.object({
                  organisations: v.array(organisationSummarySchema),
                  total: v.number(),
                  page: v.number(),
                  pageSize: v.number(),
                }),
              ),
            },
          },
        },
      },
    }),
    validator(
      "query",
      v.object({
        page: v.optional(v.string()),
        pageSize: v.optional(v.string()),
      }),
    ),
    async (c) => {
      const { page: pageParam, pageSize: pageSizeParam } = c.req.valid("query");
      const page = Math.max(1, Number(pageParam) || 1);
      const pageSize = Math.min(100, Math.max(1, Number(pageSizeParam) || 25));

      const result = await listOrganisationsCtrl(page, pageSize);
      return c.json({ ...result, page, pageSize });
    },
  )
  .get(
    "/organisations/:id",
    describeRoute({
      operationId: "getAdminOrganisationDetail",
      tags: ["Admin"],
      description:
        "Drill-down for a single organisation: members, usage, AMC seat history",
      responses: {
        200: { description: "Organisation detail" },
        404: { description: "Organisation not found" },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const detail = await getOrganisationDetailCtrl(id);
      if (!detail) {
        throw new HTTPException(404, { message: "Organisation not found" });
      }
      return c.json(detail);
    },
  )
  .patch(
    "/organisations/:id/plan",
    describeRoute({
      operationId: "setAdminOrganisationPlan",
      tags: ["Admin"],
      description:
        "Manually set an organisation's plan, bypassing Razorpay — for comp accounts and support fixes",
      responses: {
        200: { description: "Subscription updated" },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator(
      "json",
      v.object({
        planId: v.picklist(
          PLAN_SEEDS.map((plan: PlanSeed) => plan.id) as [string, ...string[]],
        ),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const { planId } = c.req.valid("json");
      const subscription = await setOrganisationPlanCtrl(id, planId);
      return c.json(subscription);
    },
  )
  .post(
    "/organisations/:id/amc-seats",
    describeRoute({
      operationId: "grantAdminAmcSeats",
      tags: ["Admin"],
      description:
        "Manually grant AMC seats to an organisation, bypassing Razorpay — for pilot customers and support fixes",
      responses: {
        200: { description: "Seat purchase recorded" },
        404: { description: "Organisation not found" },
      },
    }),
    validator("param", v.object({ id: v.string() })),
    validator(
      "json",
      v.object({
        seats: v.pipe(v.number(), v.integer(), v.minValue(1)),
        note: v.optional(v.string()),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const { seats, note } = c.req.valid("json");
      const purchase = await grantAmcSeatsCtrl(id, seats, note);
      return c.json(purchase);
    },
  );

export default admin;
