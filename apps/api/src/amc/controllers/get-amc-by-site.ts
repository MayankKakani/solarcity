import { and, count, eq, gte, lt, not } from "drizzle-orm";
import db from "../../database";
import { amcTable, taskTable } from "../../database/schema";
import { computeCurrentAmcYear } from "../../utils/amc-year";

async function getAmcBySite(siteId: string) {
  const amc = await db.query.amcTable.findFirst({
    where: and(eq(amcTable.siteId, siteId), eq(amcTable.status, "active")),
    with: {
      bundle: { columns: { id: true, name: true } },
      services: {
        with: {
          serviceMaster: { columns: { id: true, name: true, currency: true } },
        },
      },
    },
  });

  if (!amc) return null;

  const { currentYearStart, nextYearStart } = computeCurrentAmcYear(
    amc.startDate,
  );

  // Compute per-service usage for the current AMC year
  const usageCounts = await db
    .select({ amcServiceId: taskTable.amcServiceId, used: count() })
    .from(taskTable)
    .where(
      and(
        not(eq(taskTable.status, "cancelled")),
        gte(taskTable.createdAt, currentYearStart),
        lt(taskTable.createdAt, nextYearStart),
      ),
    )
    .groupBy(taskTable.amcServiceId);

  const usageMap = new Map<string, number>();
  for (const row of usageCounts) {
    if (row.amcServiceId) usageMap.set(row.amcServiceId, Number(row.used));
  }

  return {
    ...amc,
    currentYearStart,
    nextYearStart,
    services: amc.services.map((s) => ({
      ...s,
      used: usageMap.get(s.id) ?? 0,
      remaining:
        s.annualLimit === 0
          ? null
          : Math.max(0, s.annualLimit - (usageMap.get(s.id) ?? 0)),
    })),
  };
}

export default getAmcBySite;
