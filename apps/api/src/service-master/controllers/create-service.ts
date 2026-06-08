import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { serviceMasterTable } from "../../database/schema";

type CreateServiceInput = {
  workspaceId: string;
  name: string;
  description?: string;
  defaultPrice: string;
  currency?: string;
  isActive: boolean;
};

async function createService(input: CreateServiceInput) {
  const [service] = await db
    .insert(serviceMasterTable)
    .values({
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description ?? null,
      defaultPrice: input.defaultPrice,
      currency: input.currency ?? "INR",
      isActive: input.isActive,
    })
    .returning();

  if (!service) {
    throw new HTTPException(500, { message: "Failed to create service" });
  }

  return service;
}

export default createService;
