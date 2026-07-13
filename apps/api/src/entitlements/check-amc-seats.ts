import { HTTPException } from "hono/http-exception";
import { getActiveAmcCount, getAmcSeatBalance } from "./get-workspace-usage";

export async function assertCanActivateAmc(workspaceId: string) {
  const [seatBalance, activeCount] = await Promise.all([
    getAmcSeatBalance(workspaceId),
    getActiveAmcCount(workspaceId),
  ]);

  if (activeCount >= seatBalance) {
    throw new HTTPException(402, {
      message: `AMC seat limit reached: ${activeCount}/${seatBalance} in use. Buy more seats to activate another contract.`,
    });
  }
}
