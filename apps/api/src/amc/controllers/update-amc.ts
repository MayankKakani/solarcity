import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { amcTable } from "../../database/schema";

type UpdateAmcInput = {
  amcId: string;
  status?: string;
  contractReference?: string;
  notes?: string;
};

async function updateAmc(input: UpdateAmcInput) {
  const [amc] = await db
    .update(amcTable)
    .set({
      ...(input.status !== undefined && { status: input.status }),
      ...(input.contractReference !== undefined && {
        contractReference: input.contractReference,
      }),
      ...(input.notes !== undefined && { notes: input.notes }),
    })
    .where(eq(amcTable.id, input.amcId))
    .returning();

  if (!amc) {
    throw new HTTPException(404, { message: "AMC not found" });
  }

  return amc;
}

export default updateAmc;
