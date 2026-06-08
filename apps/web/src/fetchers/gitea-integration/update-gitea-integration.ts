import { client } from "@solarplan/libs";
import type { InferRequestType } from "hono";

export type UpdateGiteaIntegrationRequest = InferRequestType<
  (typeof client)["gitea-integration"]["project"][":zoneId"]["$patch"]
>["json"];

async function updateGiteaIntegration(
  zoneId: string,
  json: UpdateGiteaIntegrationRequest,
) {
  const response = await client["gitea-integration"].project[":zoneId"].$patch({
    param: { zoneId },
    json,
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

export default updateGiteaIntegration;
