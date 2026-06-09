import { eq } from "drizzle-orm";
import db from "../../database";
import { amcBundleTable, workspaceTable } from "../../database/schema";

async function getPublicBundles(workspaceId: string) {
  const [ws] = await db
    .select({
      id: workspaceTable.id,
      name: workspaceTable.name,
      slug: workspaceTable.slug,
    })
    .from(workspaceTable)
    .where(eq(workspaceTable.id, workspaceId))
    .limit(1);

  if (!ws) return null;

  const bundles = await db.query.amcBundleTable.findMany({
    where: eq(amcBundleTable.workspaceId, ws.id),
    with: {
      services: {
        with: {
          serviceMaster: {
            columns: {
              id: true,
              name: true,
              defaultPrice: true,
              currency: true,
            },
          },
        },
      },
    },
    orderBy: (t, { asc }) => [asc(t.name)],
  });

  return { workspace: ws, bundles: bundles.filter((b) => b.isActive) };
}

export default getPublicBundles;
