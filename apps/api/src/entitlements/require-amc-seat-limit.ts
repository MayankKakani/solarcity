import type { Context, Next } from "hono";
import { assertCanActivateAmc } from "./check-amc-seats";

/**
 * Hono middleware wrapping assertCanActivateAmc, so plan enforcement can be
 * chained onto a route the same way requireZoneLimit is for project creation.
 */
export function requireAmcSeatLimit() {
  return async (c: Context, next: Next) => {
    const workspaceId = c.get("workspaceId");
    await assertCanActivateAmc(workspaceId);
    return next();
  };
}
