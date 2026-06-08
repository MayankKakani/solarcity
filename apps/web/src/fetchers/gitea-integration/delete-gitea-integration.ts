import { client } from "@solarplan/libs";

async function deleteGiteaIntegration(zoneId: string) {
  const response = await client["gitea-integration"].project[":zoneId"].$delete(
    {
      param: { zoneId },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default deleteGiteaIntegration;
