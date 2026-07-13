import { getApiUrl } from "@/fetchers/get-api-url";

export type SubscriptionCheckout = {
  subscriptionId: string;
  keyId: string;
};

async function createSubscriptionCheckout(
  workspaceId: string,
  planId: string,
): Promise<SubscriptionCheckout> {
  const response = await fetch(
    getApiUrl(
      `/billing/subscriptions?workspaceId=${encodeURIComponent(workspaceId)}`,
    ),
    {
      method: "POST",
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

export default createSubscriptionCheckout;
