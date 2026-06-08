import { eq, sql } from "drizzle-orm";
import db from "../../database";
import { labelTable, siteContactTable, siteTable } from "../../database/schema";

async function getSites(workspaceId: string) {
  const sites = await db
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
    .where(eq(siteTable.workspaceId, workspaceId))
    .orderBy(siteTable.name);

  if (sites.length === 0) return [];

  const siteIds = sites.map((s) => s.id);

  const [contacts, labels] = await Promise.all([
    db
      .select()
      .from(siteContactTable)
      .where(
        sql`${siteContactTable.siteId} = ANY(${sql.raw(`ARRAY[${siteIds.map((id) => `'${id}'`).join(",")}]`)})`,
      ),
    db
      .select()
      .from(labelTable)
      .where(
        sql`${labelTable.siteId} = ANY(${sql.raw(`ARRAY[${siteIds.map((id) => `'${id}'`).join(",")}]`)})`,
      ),
  ]);

  const contactsBySite = new Map<string, typeof contacts>();
  for (const c of contacts) {
    if (!contactsBySite.has(c.siteId)) contactsBySite.set(c.siteId, []);
    contactsBySite.get(c.siteId)?.push(c);
  }

  const labelsBySite = new Map<string, typeof labels>();
  for (const l of labels) {
    if (!l.siteId) continue;
    if (!labelsBySite.has(l.siteId)) labelsBySite.set(l.siteId, []);
    labelsBySite.get(l.siteId)?.push(l);
  }

  return sites.map((site) => ({
    ...site,
    contacts: (contactsBySite.get(site.id) ?? []).map((c) => ({
      ...c,
      labels: labels.filter((l) => l.contactId === c.id),
    })),
    labels: labelsBySite.get(site.id) ?? [],
  }));
}

export default getSites;
