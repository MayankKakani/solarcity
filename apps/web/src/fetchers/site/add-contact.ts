import { getApiUrl } from "@/fetchers/get-api-url";

export type AddContactRequest = {
  siteId: string;
  name: string;
  role: "owner" | "caretaker" | "security" | "manager" | "contractor";
  phone?: string;
  email?: string;
  isPrimary?: boolean;
};

async function addContact({ siteId, ...body }: AddContactRequest) {
  const response = await fetch(getApiUrl(`/site/${siteId}/contacts`), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default addContact;
