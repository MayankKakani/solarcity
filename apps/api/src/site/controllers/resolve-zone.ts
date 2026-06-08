import { and, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { siteTable, zoneTable } from "../../database/schema";

async function resolveZoneForSite(siteId: string, workspaceId: string) {
  const site = await db.query.siteTable.findFirst({
    where: eq(siteTable.id, siteId),
  });

  if (!site) {
    throw new HTTPException(404, { message: "Site not found" });
  }

  if (!site.location) {
    return { zoneId: null, reason: "site_has_no_location" };
  }

  const [match] = await db
    .select({ id: zoneTable.id, name: zoneTable.name })
    .from(zoneTable)
    .where(
      and(
        eq(zoneTable.workspaceId, workspaceId),
        sql`${zoneTable.boundingBox} IS NOT NULL AND ST_Within(${siteTable.location}, ${zoneTable.boundingBox})`,
      ),
    )
    .limit(1);

  return match
    ? { zoneId: match.id, zoneName: match.name }
    : { zoneId: null, reason: "no_zone_match" };
}

export default resolveZoneForSite;
