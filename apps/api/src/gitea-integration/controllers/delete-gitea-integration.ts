import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { integrationTable } from "../../database/schema";

async function deleteGiteaIntegration(zoneId: string) {
  const integration = await db.query.integrationTable.findFirst({
    where: and(
      eq(integrationTable.zoneId, zoneId),
      eq(integrationTable.type, "gitea"),
    ),
  });

  if (!integration) {
    throw new HTTPException(404, { message: "Gitea integration not found" });
  }

  await db
    .delete(integrationTable)
    .where(
      and(
        eq(integrationTable.zoneId, zoneId),
        eq(integrationTable.type, "gitea"),
      ),
    );

  return { success: true, message: "Gitea integration deleted" };
}

export default deleteGiteaIntegration;
