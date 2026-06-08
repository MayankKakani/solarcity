import { and, asc, eq } from "drizzle-orm";
import db from "../../../database";
import { columnTable, workflowRuleTable } from "../../../database/schema";

export async function resolveTargetStatus(
  zoneId: string,
  eventType: string,
  fallbackStatus: string,
): Promise<string> {
  const projectColumns = await db
    .select({
      id: columnTable.id,
      slug: columnTable.slug,
    })
    .from(columnTable)
    .where(eq(columnTable.zoneId, zoneId))
    .orderBy(asc(columnTable.position));

  if (projectColumns.length === 0) {
    return fallbackStatus;
  }

  const rule = await db.query.workflowRuleTable.findFirst({
    where: and(
      eq(workflowRuleTable.zoneId, zoneId),
      eq(workflowRuleTable.integrationType, "gitea"),
      eq(workflowRuleTable.eventType, eventType),
    ),
  });

  if (rule) {
    const mappedColumn = projectColumns.find(
      (column) => column.id === rule.columnId,
    );
    if (mappedColumn) {
      return mappedColumn.slug;
    }
  }

  const fallbackColumn = projectColumns.find(
    (column) => column.slug === fallbackStatus,
  );
  if (fallbackColumn) {
    return fallbackColumn.slug;
  }

  return projectColumns[0]?.slug ?? fallbackStatus;
}
