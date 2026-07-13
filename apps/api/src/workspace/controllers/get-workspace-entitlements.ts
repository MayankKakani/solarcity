import { getEffectivePlan } from "../../entitlements/get-effective-plan";
import { getWorkspaceUsage } from "../../entitlements/get-workspace-usage";

async function getWorkspaceEntitlements(workspaceId: string) {
  const [plan, usage] = await Promise.all([
    getEffectivePlan(workspaceId),
    getWorkspaceUsage(workspaceId),
  ]);

  return {
    plan: {
      id: plan.planId,
      name: plan.name,
      status: plan.status,
    },
    zones: {
      used: usage.zoneCount,
      limit: plan.maxZones,
    },
    amcSeats: {
      used: usage.activeAmcCount,
      balance: usage.amcSeatBalance,
    },
  };
}

export default getWorkspaceEntitlements;
