import { sql } from "drizzle-orm";
import db, { schema } from "../../database";

export type OrganisationSummary = {
  id: string;
  name: string;
  slug: string;
  planId: string;
  planName: string;
  subscriptionStatus: string;
  memberCount: number;
  zoneCount: number;
  siteCount: number;
  activeAmcCount: number;
  amcSeatBalance: number;
  createdAt: Date;
};

export type ListOrganisationsResult = {
  organisations: OrganisationSummary[];
  total: number;
};

async function listOrganisations(
  page: number,
  pageSize: number,
): Promise<ListOrganisationsResult> {
  const offset = (page - 1) * pageSize;

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        id: schema.workspaceTable.id,
        name: schema.workspaceTable.name,
        slug: schema.workspaceTable.slug,
        planId: schema.planTable.id,
        planName: schema.planTable.name,
        subscriptionStatus: schema.workspaceSubscriptionTable.status,
        createdAt: schema.workspaceTable.createdAt,
        memberCount: sql<number>`(
          select count(*)::int from ${schema.workspaceUserTable}
          where ${schema.workspaceUserTable.workspaceId} = ${schema.workspaceTable.id}
        )`,
        zoneCount: sql<number>`(
          select count(*)::int from ${schema.zoneTable}
          where ${schema.zoneTable.workspaceId} = ${schema.workspaceTable.id}
        )`,
        siteCount: sql<number>`(
          select count(*)::int from ${schema.siteTable}
          where ${schema.siteTable.workspaceId} = ${schema.workspaceTable.id}
        )`,
        activeAmcCount: sql<number>`(
          select count(*)::int from ${schema.amcTable}
          inner join ${schema.siteTable} on ${schema.siteTable.id} = ${schema.amcTable.siteId}
          where ${schema.siteTable.workspaceId} = ${schema.workspaceTable.id}
            and ${schema.amcTable.status} = 'active'
        )`,
        amcSeatBalance: sql<number>`(
          select coalesce(sum(${schema.amcSeatPurchaseTable.seats}), 0)::int
          from ${schema.amcSeatPurchaseTable}
          where ${schema.amcSeatPurchaseTable.workspaceId} = ${schema.workspaceTable.id}
        )`,
      })
      .from(schema.workspaceTable)
      .leftJoin(
        schema.workspaceSubscriptionTable,
        sql`${schema.workspaceSubscriptionTable.workspaceId} = ${schema.workspaceTable.id}`,
      )
      .leftJoin(
        schema.planTable,
        sql`${schema.planTable.id} = ${schema.workspaceSubscriptionTable.planId}`,
      )
      .orderBy(schema.workspaceTable.createdAt)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.workspaceTable),
  ]);

  return {
    organisations: rows.map((row: (typeof rows)[number]) => ({
      ...row,
      planId: row.planId ?? "free",
      planName: row.planName ?? "Free",
      subscriptionStatus: row.subscriptionStatus ?? "active",
    })),
    total: totalRow?.value ?? 0,
  };
}

export default listOrganisations;
