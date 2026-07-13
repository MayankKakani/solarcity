import { and, count, eq, sql } from "drizzle-orm";
import db, { schema } from "../database";

export type WorkspaceUsage = {
  zoneCount: number;
  activeAmcCount: number;
  amcSeatBalance: number;
};

export async function getZoneCount(workspaceId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(schema.zoneTable)
    .where(eq(schema.zoneTable.workspaceId, workspaceId));
  return row?.value ?? 0;
}

export async function getActiveAmcCount(workspaceId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(schema.amcTable)
    .innerJoin(
      schema.siteTable,
      eq(schema.amcTable.siteId, schema.siteTable.id),
    )
    .where(
      and(
        eq(schema.siteTable.workspaceId, workspaceId),
        eq(schema.amcTable.status, "active"),
      ),
    );
  return row?.value ?? 0;
}

export async function getAmcSeatBalance(workspaceId: string): Promise<number> {
  const [row] = await db
    .select({
      value: sql<number>`coalesce(sum(${schema.amcSeatPurchaseTable.seats}), 0)`,
    })
    .from(schema.amcSeatPurchaseTable)
    .where(eq(schema.amcSeatPurchaseTable.workspaceId, workspaceId));
  return Number(row?.value ?? 0);
}

export async function getWorkspaceUsage(
  workspaceId: string,
): Promise<WorkspaceUsage> {
  const [zoneCount, activeAmcCount, amcSeatBalance] = await Promise.all([
    getZoneCount(workspaceId),
    getActiveAmcCount(workspaceId),
    getAmcSeatBalance(workspaceId),
  ]);

  return { zoneCount, activeAmcCount, amcSeatBalance };
}
