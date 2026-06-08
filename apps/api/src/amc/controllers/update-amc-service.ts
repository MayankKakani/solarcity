import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { amcServiceTable } from "../../database/schema";

type UpdateAmcServiceInput = {
  serviceId: string;
  frequency?: string;
  annualLimit?: number;
  // price is intentionally excluded — locked at creation
};

async function updateAmcService(input: UpdateAmcServiceInput) {
  const [service] = await db
    .update(amcServiceTable)
    .set({
      ...(input.frequency !== undefined && { frequency: input.frequency }),
      ...(input.annualLimit !== undefined && {
        annualLimit: input.annualLimit,
      }),
    })
    .where(eq(amcServiceTable.id, input.serviceId))
    .returning();

  if (!service) {
    throw new HTTPException(404, { message: "AMC service not found" });
  }

  return service;
}

export default updateAmcService;
