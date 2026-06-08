import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { serviceMasterTable } from "../../database/schema";

type UpdateServiceInput = {
  serviceId: string;
  name?: string;
  description?: string;
  defaultPrice?: string;
  currency?: string;
  labels?: string[];
};

async function updateService(input: UpdateServiceInput) {
  const [service] = await db
    .update(serviceMasterTable)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.defaultPrice !== undefined && {
        defaultPrice: input.defaultPrice,
      }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.labels !== undefined && { labels: input.labels }),
    })
    .where(eq(serviceMasterTable.id, input.serviceId))
    .returning();

  if (!service) {
    throw new HTTPException(404, { message: "Service not found" });
  }

  return service;
}

export default updateService;
