import { client } from "@solarplan/libs";

async function getTasks(zoneId: string) {
  const response = await client.task.tasks[":zoneId"].$get({
    param: { zoneId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const json = await response.json();

  return json.data;
}

export default getTasks;
