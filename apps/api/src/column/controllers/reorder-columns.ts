import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { columnTable } from "../../database/schema";

async function reorderColumns(
  zoneId: string,
  columns: Array<{ id: string; position: number }>,
) {
  for (const col of columns) {
    const [updated] = await db
      .update(columnTable)
      .set({ position: col.position })
      .where(and(eq(columnTable.id, col.id), eq(columnTable.zoneId, zoneId)))
      .returning({ id: columnTable.id });

    if (!updated) {
      throw new HTTPException(400, {
        message: `Column ${col.id} does not belong to this project`,
      });
    }
  }

  const updated = await db.query.columnTable.findMany({
    where: eq(columnTable.zoneId, zoneId),
    orderBy: (columns, { asc }) => [asc(columns.position)],
  });

  return updated;
}

export default reorderColumns;
