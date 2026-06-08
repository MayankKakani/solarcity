import { eq } from "drizzle-orm";
import db from "../../database";
import { amcBundleTable } from "../../database/schema";

async function getBundles(workspaceId: string) {
  const bundles = await db.query.amcBundleTable.findMany({
    where: eq(amcBundleTable.workspaceId, workspaceId),
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

  return bundles;
}

export default getBundles;
