import { asc, eq } from "drizzle-orm";
import db from "../../database";
import { columnTable } from "../../database/schema";

async function getColumns(zoneId: string) {
  const columns = await db
    .select()
    .from(columnTable)
    .where(eq(columnTable.zoneId, zoneId))
    .orderBy(asc(columnTable.position));

  return columns;
}

export default getColumns;
