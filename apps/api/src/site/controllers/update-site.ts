import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { siteTable } from "../../database/schema";

type UpdateSiteInput = {
  siteId: string;
  name?: string;
  siteCode?: string;
  siteType?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  systemCapacityKwp?: string;
  installationDate?: string;
  panelCount?: number;
  inverterModel?: string;
  gridConnectionType?: string;
  status?: string;
};

async function updateSite({
  siteId,
  latitude,
  longitude,
  ...rest
}: UpdateSiteInput) {
  const locationUpdate =
    latitude != null && longitude != null
      ? {
          location:
            sql`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)` as unknown as string,
        }
      : {};

  const [updated] = await db
    .update(siteTable)
    .set({ ...rest, ...locationUpdate })
    .where(eq(siteTable.id, siteId))
    .returning();

  if (!updated) {
    throw new HTTPException(404, { message: "Site not found" });
  }

  return updated;
}

export default updateSite;
