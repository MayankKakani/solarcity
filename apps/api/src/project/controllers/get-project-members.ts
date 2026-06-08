import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { zoneAssignmentTable, zoneTable } from "../../database/schema";

async function getProjectMembers(zoneId: string) {
  const [project] = await db
    .select({ id: zoneTable.id })
    .from(zoneTable)
    .where(eq(zoneTable.id, zoneId))
    .limit(1);

  if (!project) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  const members = await db.query.zoneAssignmentTable.findMany({
    where: eq(zoneAssignmentTable.zoneId, zoneId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return members;
}

export default getProjectMembers;
