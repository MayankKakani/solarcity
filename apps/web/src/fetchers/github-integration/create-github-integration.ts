import { client } from "@solarplan/libs";
import type { InferRequestType } from "hono";

export type CreateGithubIntegrationRequest = InferRequestType<
  (typeof client)["github-integration"]["project"][":zoneId"]["$post"]
>["json"];

async function createGithubIntegration(
  zoneId: string,
  data: CreateGithubIntegrationRequest,
) {
  const response = await client["github-integration"].project[":zoneId"].$post({
    param: { zoneId },
    json: data,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const result = await response.json();
  return result;
}

export default createGithubIntegration;
