import { client } from "@solarplan/libs";

async function importGiteaIssues(zoneId: string) {
  const response = await client["gitea-integration"]["import-issues"].$post({
    json: { zoneId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default importGiteaIssues;
