import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { labelTable, siteContactTable, siteTable } from "../../database/schema";

async function getSite(siteId: string) {
  const [site] = await db
    .select({
      id: siteTable.id,
      workspaceId: siteTable.workspaceId,
      name: siteTable.name,
      siteCode: siteTable.siteCode,
      siteType: siteTable.siteType,
      address: siteTable.address,
      latitude: sql<number | null>`ST_Y(${siteTable.location})`,
      longitude: sql<number | null>`ST_X(${siteTable.location})`,
      systemCapacityKwp: siteTable.systemCapacityKwp,
      installationDate: siteTable.installationDate,
      panelCount: siteTable.panelCount,
      inverterModel: siteTable.inverterModel,
      gridConnectionType: siteTable.gridConnectionType,
      status: siteTable.status,
      createdAt: siteTable.createdAt,
      updatedAt: siteTable.updatedAt,
    })
    .from(siteTable)
    .where(eq(siteTable.id, siteId))
    .limit(1);

  if (!site) {
    throw new HTTPException(404, { message: "Site not found" });
  }

  const [contacts, siteLabels] = await Promise.all([
    db
      .select()
      .from(siteContactTable)
      .where(eq(siteContactTable.siteId, siteId)),
    db.select().from(labelTable).where(eq(labelTable.siteId, siteId)),
  ]);

  const contactIds = contacts.map((c) => c.id);
  const contactLabels =
    contactIds.length > 0
      ? await db
          .select()
          .from(labelTable)
          .where(
            sql`${labelTable.contactId} = ANY(${sql.raw(`ARRAY[${contactIds.map((id) => `'${id}'`).join(",")}]`)})`,
          )
      : [];

  return {
    ...site,
    labels: siteLabels,
    contacts: contacts.map((c) => ({
      ...c,
      labels: contactLabels.filter((l) => l.contactId === c.id),
    })),
  };
}

export default getSite;
