import { desc, eq } from "drizzle-orm";
import db, { schema } from "../../database";
import { getEffectivePlan } from "../../entitlements/get-effective-plan";
import { getWorkspaceUsage } from "../../entitlements/get-workspace-usage";

export type OrganisationDetail = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  createdAt: Date;
  plan: Awaited<ReturnType<typeof getEffectivePlan>>;
  usage: Awaited<ReturnType<typeof getWorkspaceUsage>>;
  members: Array<{
    userId: string;
    name: string;
    email: string;
    role: string;
    joinedAt: Date;
  }>;
  amcSeatPurchases: Array<{
    id: string;
    seats: number;
    note: string | null;
    purchasedAt: Date;
  }>;
};

async function getOrganisationDetail(
  workspaceId: string,
): Promise<OrganisationDetail | null> {
  const [workspace] = await db
    .select({
      id: schema.workspaceTable.id,
      name: schema.workspaceTable.name,
      slug: schema.workspaceTable.slug,
      currency: schema.workspaceTable.currency,
      createdAt: schema.workspaceTable.createdAt,
    })
    .from(schema.workspaceTable)
    .where(eq(schema.workspaceTable.id, workspaceId))
    .limit(1);

  if (!workspace) return null;

  const [plan, usage, members, amcSeatPurchases] = await Promise.all([
    getEffectivePlan(workspaceId),
    getWorkspaceUsage(workspaceId),
    db
      .select({
        userId: schema.userTable.id,
        name: schema.userTable.name,
        email: schema.userTable.email,
        role: schema.workspaceUserTable.role,
        joinedAt: schema.workspaceUserTable.joinedAt,
      })
      .from(schema.workspaceUserTable)
      .innerJoin(
        schema.userTable,
        eq(schema.workspaceUserTable.userId, schema.userTable.id),
      )
      .where(eq(schema.workspaceUserTable.workspaceId, workspaceId)),
    db
      .select({
        id: schema.amcSeatPurchaseTable.id,
        seats: schema.amcSeatPurchaseTable.seats,
        note: schema.amcSeatPurchaseTable.note,
        purchasedAt: schema.amcSeatPurchaseTable.purchasedAt,
      })
      .from(schema.amcSeatPurchaseTable)
      .where(eq(schema.amcSeatPurchaseTable.workspaceId, workspaceId))
      .orderBy(desc(schema.amcSeatPurchaseTable.purchasedAt)),
  ]);

  return { ...workspace, plan, usage, members, amcSeatPurchases };
}

export default getOrganisationDetail;
