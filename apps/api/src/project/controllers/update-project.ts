import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import db from "../../database";
import { zoneTable } from "../../database/schema";

async function updateProject(
  id: string,
  name: string,
  icon: string,
  slug: string,
  description: string,
  isPublic: boolean,
  workspaceId: string,
) {
  const [existingProject] = await db
    .select()
    .from(zoneTable)
    .where(and(eq(zoneTable.id, id), eq(zoneTable.workspaceId, workspaceId)));

  const isProjectExisting = Boolean(existingProject);

  if (!isProjectExisting) {
    throw new HTTPException(404, {
      message:
        "Project doesn't exist or doesn't belong to the specified workspace",
    });
  }

  const [updatedWorkspace] = await db
    .update(zoneTable)
    .set({
      name,
      icon,
      slug,
      description,
      isPublic,
    })
    .where(eq(zoneTable.id, id))
    .returning();

  return updatedWorkspace;
}

export default updateProject;
