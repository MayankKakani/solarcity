import { client } from "@solarplan/libs";

export type CreateGiteaIntegrationRequest = {
  baseUrl: string;
  accessToken?: string;
  repositoryOwner: string;
  repositoryName: string;
};

async function createGiteaIntegration(
  zoneId: string,
  data: CreateGiteaIntegrationRequest,
) {
  const response = await client["gitea-integration"].project[":zoneId"].$post({
    param: { zoneId },
    json: data,
  });

  if (!response.ok) {
    const error = await response
      .clone()
      .json()
      .catch(async () => ({
        message: (await response.text()) || "Request failed",
      }));
    throw new Error(
      typeof error === "object" && error && "message" in error
        ? String(error.message)
        : "Request failed",
    );
  }

  return response.json();
}

export default createGiteaIntegration;
