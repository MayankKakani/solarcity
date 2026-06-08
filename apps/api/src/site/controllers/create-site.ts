import { sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { siteTable } from "../../database/schema";

type CreateSiteInput = {
  workspaceId: string;
  name: string;
  siteCode: string;
  siteType: string;
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

async function createSite(input: CreateSiteInput) {
  const locationValue =
    input.latitude != null && input.longitude != null
      ? sql`ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)`
      : null;

  const [site] = await db
    .insert(siteTable)
    .values({
      workspaceId: input.workspaceId,
      name: input.name,
      siteCode: input.siteCode,
      siteType: input.siteType,
      location: locationValue as unknown as string,
      address: input.address,
      systemCapacityKwp: input.systemCapacityKwp,
      installationDate: input.installationDate,
      panelCount: input.panelCount,
      inverterModel: input.inverterModel,
      gridConnectionType: input.gridConnectionType ?? "on_grid",
      status: input.status ?? "active",
    })
    .returning();

  if (!site) {
    throw new HTTPException(500, { message: "Failed to create site" });
  }

  return site;
}

export default createSite;
