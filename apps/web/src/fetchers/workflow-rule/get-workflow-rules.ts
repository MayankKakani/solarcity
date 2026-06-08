import { client } from "@solarplan/libs";

async function getWorkflowRules(zoneId: string) {
  const response = await client["workflow-rule"][":zoneId"].$get({
    param: { zoneId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default getWorkflowRules;
