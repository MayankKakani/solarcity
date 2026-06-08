import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { amcServiceTable, amcTable } from "../../database/schema";

type AmcServiceInput = {
  serviceMasterId: string;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

type CreateAmcInput = {
  siteId: string;
  bundleId?: string;
  startDate: Date;
  durationYears: number;
  contractReference?: string;
  notes?: string;
  services: AmcServiceInput[];
};

async function createAmc(input: CreateAmcInput) {
  // Enforce one active AMC per site
  const existing = await db.query.amcTable.findFirst({
    where: and(
      eq(amcTable.siteId, input.siteId),
      eq(amcTable.status, "active"),
    ),
    columns: { id: true },
  });

  if (existing) {
    throw new HTTPException(409, {
      message:
        "An active AMC already exists for this site. Cancel it before creating a new one.",
    });
  }

  const endDate = new Date(input.startDate);
  endDate.setFullYear(endDate.getFullYear() + input.durationYears);

  const [amc] = await db
    .insert(amcTable)
    .values({
      siteId: input.siteId,
      bundleId: input.bundleId ?? null,
      startDate: input.startDate,
      endDate,
      durationYears: input.durationYears,
      status: "active",
      contractReference: input.contractReference ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  if (!amc) {
    throw new HTTPException(500, { message: "Failed to create AMC" });
  }

  if (input.services.length > 0) {
    await db.insert(amcServiceTable).values(
      input.services.map((s) => ({
        amcId: amc.id,
        serviceMasterId: s.serviceMasterId,
        frequency: s.frequency,
        annualLimit: s.annualLimit,
        price: s.price,
        priceUnit: s.priceUnit,
      })),
    );
  }

  return db.query.amcTable.findFirst({
    where: (t, { eq: eq_ }) => eq_(t.id, amc.id),
    with: {
      services: {
        with: { serviceMaster: { columns: { id: true, name: true } } },
      },
    },
  });
}

export default createAmc;
