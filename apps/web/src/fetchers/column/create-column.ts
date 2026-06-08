import { client } from "@solarplan/libs";

async function createColumn(
  zoneId: string,
  data: { name: string; icon?: string; color?: string; isFinal?: boolean },
) {
  const response = await client.column[":zoneId"].$post({
    param: { zoneId },
    json: data,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default createColumn;
