import { client } from "@solarplan/libs";

async function upsertWorkflowRule(
  zoneId: string,
  data: { integrationType: string; eventType: string; columnId: string },
) {
  const response = await client["workflow-rule"][":zoneId"].$put({
    param: { zoneId },
    json: data,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default upsertWorkflowRule;
