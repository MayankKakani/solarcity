import { client } from "@solarplan/libs";

async function reorderColumns(
  zoneId: string,
  columns: Array<{ id: string; position: number }>,
) {
  const response = await client.column.reorder[":zoneId"].$put({
    param: { zoneId },
    json: { columns },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default reorderColumns;
