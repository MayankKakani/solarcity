import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { amcBundleServiceTable, amcBundleTable } from "../../database/schema";

type BundleServiceInput = {
  bundleId: string;
  serviceMasterId: string;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

type CreateBundleInput = {
  workspaceId: string;
  name: string;
  description?: string;
  services: BundleServiceInput[];
};

async function createBundle(input: CreateBundleInput) {
  const [bundle] = await db
    .insert(amcBundleTable)
    .values({
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description ?? null,
    })
    .returning();

  if (!bundle) {
    throw new HTTPException(500, { message: "Failed to create bundle" });
  }

  if (input.services.length > 0) {
    const serviceRows = input.services.map((s) => ({
      bundleId: bundle.id,
      serviceMasterId: s.serviceMasterId,
      frequency: s.frequency,
      annualLimit: s.annualLimit,
      price: s.price,
      priceUnit: s.priceUnit,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    await db
      .insert(amcBundleServiceTable)
      .values(serviceRows as BundleServiceInput[]);
  }

  return db.query.amcBundleTable.findFirst({
    where: (t, { eq }) => eq(t.id, bundle.id),
    with: {
      services: {
        with: { serviceMaster: { columns: { id: true, name: true } } },
      },
    },
  });
}

export default createBundle;
