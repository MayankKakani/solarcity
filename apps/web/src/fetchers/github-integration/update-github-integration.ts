import { client } from "@solarplan/libs";
import type { InferRequestType } from "hono";

export type UpdateGithubIntegrationRequest = InferRequestType<
  (typeof client)["github-integration"]["project"][":zoneId"]["$patch"]
>["json"];

async function updateGithubIntegration(
  zoneId: string,
  json: UpdateGithubIntegrationRequest,
) {
  const response = await client["github-integration"].project[":zoneId"].$patch(
    {
      param: { zoneId },
      json,
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

export default updateGithubIntegration;
