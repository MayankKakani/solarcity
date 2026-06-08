import { and, eq, notInArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { amcBundleServiceTable, amcBundleTable } from "../../database/schema";

type ServiceInput = {
  id?: string;
  serviceMasterId: string;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

type UpdateBundleInput = {
  bundleId: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  services?: ServiceInput[];
};

async function updateBundle(input: UpdateBundleInput) {
  return await db.transaction(async (tx) => {
    const [bundle] = await tx
      .update(amcBundleTable)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      })
      .where(eq(amcBundleTable.id, input.bundleId))
      .returning();

    if (!bundle) {
      throw new HTTPException(404, { message: "Bundle not found" });
    }

    if (input.services !== undefined) {
      const incoming = input.services;

      // Update existing services (those with an id)
      const toUpdate = incoming.filter((s) => s.id);
      for (const s of toUpdate) {
        await tx
          .update(amcBundleServiceTable)
          .set({
            frequency: s.frequency,
            annualLimit: s.annualLimit,
            priceUnit: s.priceUnit,
          })
          // biome-ignore lint/style/noNonNullAssertion: <id is available>
          .where(eq(amcBundleServiceTable.id, s.id!));
      }

      // Insert new services (those without an id)
      const toInsert = incoming.filter((s) => !s.id);
      if (toInsert.length > 0) {
        await tx.insert(amcBundleServiceTable).values(
          toInsert.map((s) => ({
            bundleId: input.bundleId,
            serviceMasterId: s.serviceMasterId,
            frequency: s.frequency,
            annualLimit: s.annualLimit,
            price: s.price,
            priceUnit: s.priceUnit,
          })),
        );
      }

      // Delete services that are no longer in the list
      // biome-ignore lint/style/noNonNullAssertion: <id is available>
      const keptIds = toUpdate.map((s) => s.id!);
      if (keptIds.length > 0) {
        await tx
          .delete(amcBundleServiceTable)
          .where(
            and(
              eq(amcBundleServiceTable.bundleId, input.bundleId),
              notInArray(amcBundleServiceTable.id, keptIds),
            ),
          );
      } else {
        // No existing services kept — delete all for this bundle
        await tx
          .delete(amcBundleServiceTable)
          .where(eq(amcBundleServiceTable.bundleId, input.bundleId));
      }
    }

    return db.query.amcBundleTable.findFirst({
      where: (t, { eq: eqFn }) => eqFn(t.id, input.bundleId),
      with: {
        services: {
          with: { serviceMaster: { columns: { id: true, name: true } } },
        },
      },
    });
  });
}

export default updateBundle;
