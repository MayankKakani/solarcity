import { client } from "@solarplan/libs";

async function deleteGithubIntegration(zoneId: string) {
  const response = await client["github-integration"].project[
    ":zoneId"
  ].$delete({
    param: { zoneId },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const result = await response.json();
  return result;
}

export default deleteGithubIntegration;
