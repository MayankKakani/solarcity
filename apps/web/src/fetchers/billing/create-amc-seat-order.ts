import { getApiUrl } from "@/fetchers/get-api-url";

export type AmcSeatOrder = {
  orderId: string;
  amount: number | string;
  keyId: string;
};

async function createAmcSeatOrder(
  workspaceId: string,
  seats: number,
): Promise<AmcSeatOrder> {
  const response = await fetch(
    getApiUrl(
      `/billing/amc-seats?workspaceId=${encodeURIComponent(workspaceId)}`,
    ),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seats }),
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default createAmcSeatOrder;
