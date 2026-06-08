import { and, eq, inArray, sql } from "drizzle-orm";
import db from "../../database";
import {
  columnTable,
  workspaceUserTable,
  zoneAssignmentTable,
  zoneTable,
} from "../../database/schema";

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

export const DEFAULT_PROJECT_COLUMNS = [
  { name: "To Do", slug: "to-do", position: 0, isFinal: false },
  { name: "In Progress", slug: "in-progress", position: 1, isFinal: false },
  { name: "In Review", slug: "in-review", position: 2, isFinal: false },
  { name: "Done", slug: "done", position: 3, isFinal: true },
] as const;

async function createProject(
  workspaceId: string,
  name: string,
  icon: string,
  slug: string,
  boundingBox?: GeoJsonPolygon,
) {
  return db.transaction(async (tx) => {
    const boundingBoxValue = boundingBox
      ? sql`ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(boundingBox)}), 4326)`
      : null;

    const [createdZone] = await tx
      .insert(zoneTable)
      .values({
        workspaceId,
        name,
        icon,
        slug,
        boundingBox: boundingBoxValue as unknown as string,
      })
      .returning();

    if (createdZone) {
      for (const col of DEFAULT_PROJECT_COLUMNS) {
        await tx.insert(columnTable).values({
          zoneId: createdZone.id,
          name: col.name,
          slug: col.slug,
          position: col.position,
          isFinal: col.isFinal,
        });
      }

      const adminMembers = await tx
        .select({ userId: workspaceUserTable.userId })
        .from(workspaceUserTable)
        .where(
          and(
            eq(workspaceUserTable.workspaceId, workspaceId),
            inArray(workspaceUserTable.role, ["owner", "admin"]),
          ),
        );

      if (adminMembers.length > 0) {
        await tx.insert(zoneAssignmentTable).values(
          adminMembers.map((m) => ({
            zoneId: createdZone.id,
            userId: m.userId,
          })),
        );
      }
    }

    return createdZone;
  });
}

export default createProject;
