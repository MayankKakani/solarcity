import { getApiUrl } from "@/fetchers/get-api-url";

async function removeContact(siteId: string, contactId: string) {
  const response = await fetch(
    getApiUrl(`/site/${siteId}/contacts/${contactId}`),
    { method: "DELETE", credentials: "include" },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default removeContact;
