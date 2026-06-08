import { client } from "@solarplan/libs";

async function getGithubIntegration(zoneId: string) {
  const response = await client["github-integration"].project[":zoneId"].$get({
    param: { zoneId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();
  return data;
}

export default getGithubIntegration;
