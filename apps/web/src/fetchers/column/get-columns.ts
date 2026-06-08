import { client } from "@solarplan/libs";

async function getColumns(zoneId: string) {
  const response = await client.column[":zoneId"].$get({
    param: { zoneId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getColumns;
