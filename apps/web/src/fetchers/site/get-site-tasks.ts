import { getApiUrl } from "@/fetchers/get-api-url";

export type SiteTask = {
  id: string;
  title: string;
  number: number | null;
  status: string;
  priority: string | null;
  dueDate: string | null;
  createdAt: string;
  zoneId: string;
  zoneName: string | null;
  serviceMasterId: string | null;
  serviceMasterName: string | null;
  siteContactId: string | null;
  siteContactName: string | null;
  siteContactRole: string | null;
  assignees: Array<{
    id: string;
    name: string;
    image: string | null;
    role: string;
  }>;
};

async function getSiteTasks(siteId: string): Promise<SiteTask[]> {
  const response = await fetch(getApiUrl(`/site/${siteId}/tasks`), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export default getSiteTasks;
