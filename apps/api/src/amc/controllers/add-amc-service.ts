import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { amcServiceTable } from "../../database/schema";

type AddAmcServiceInput = {
  amcId: string;
  serviceMasterId: string;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

async function addAmcService(input: AddAmcServiceInput) {
  const [service] = await db
    .insert(amcServiceTable)
    .values({
      amcId: input.amcId,
      serviceMasterId: input.serviceMasterId,
      frequency: input.frequency,
      annualLimit: input.annualLimit,
      price: input.price,
      priceUnit: input.priceUnit,
    })
    .returning();

  if (!service) {
    throw new HTTPException(500, { message: "Failed to add AMC service" });
  }

  return service;
}

export default addAmcService;
