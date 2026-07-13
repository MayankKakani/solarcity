import { HTTPException } from "hono/http-exception";
import { getEffectivePlan } from "./get-effective-plan";
import { getZoneCount } from "./get-workspace-usage";

export async function assertCanCreateZone(workspaceId: string) {
  const { maxZones } = await getEffectivePlan(workspaceId);
  if (maxZones === null) return;

  const zoneCount = await getZoneCount(workspaceId);
  if (zoneCount >= maxZones) {
    throw new HTTPException(402, {
      message: `Plan limit reached: ${maxZones} zone${maxZones === 1 ? "" : "s"}. Upgrade to add more.`,
    });
  }
}
