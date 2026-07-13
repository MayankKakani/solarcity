import { getApiUrl } from "@/fetchers/get-api-url";

export type SetOrganisationPlanRequest = {
  workspaceId: string;
  planId: string;
};

async function setOrganisationPlan({
  workspaceId,
  planId,
}: SetOrganisationPlanRequest) {
  const response = await fetch(
    getApiUrl(`/admin/organisations/${workspaceId}/plan`),
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default setOrganisationPlan;
