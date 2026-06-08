import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { zoneTable } from "../../database/schema";

async function unarchiveProject(id: string, workspaceId: string) {
  const [existingProject] = await db
    .select()
    .from(zoneTable)
    .where(and(eq(zoneTable.id, id), eq(zoneTable.workspaceId, workspaceId)));

  if (!existingProject) {
    throw new HTTPException(404, {
      message:
        "Project doesn't exist or doesn't belong to the specified workspace",
    });
  }

  const [unarchivedProject] = await db
    .update(zoneTable)
    .set({ archivedAt: null })
    .where(eq(zoneTable.id, id))
    .returning();

  if (!unarchivedProject) {
    throw new HTTPException(500, {
      message: "Failed to unarchive project",
    });
  }

  return unarchivedProject;
}

export default unarchiveProject;
