import type { Context, Next } from "hono";
import { assertCanCreateZone } from "./check-zone-limit";

/**
 * Hono middleware wrapping assertCanCreateZone, so plan enforcement can be
 * chained onto a route the same way requireWorkspacePermission is.
 */
export function requireZoneLimit() {
  return async (c: Context, next: Next) => {
    const workspaceId = c.get("workspaceId");
    await assertCanCreateZone(workspaceId);
    return next();
  };
}
