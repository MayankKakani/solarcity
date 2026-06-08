type TaskLabel = {
  id: string;
  name: string;
  color: string;
};

type TaskExternalLink = {
  id: string;
  taskId: string;
  integrationId: string;
  resourceType: string;
  externalId: string;
  url: string;
  title: string | null;
  metadata: Record<string, unknown> | null;
};

type TaskAssignee = {
  id: string;
  name: string | null;
  role: string;
};

type Task = {
  id: string;
  title: string;
  number: number | null;
  description: string | null;
  status: string;
  priority: string | null;
  startDate: string | null;
  dueDate: string | null;
  position: number | null;
  createdAt: string;
  updatedAt?: string;
  assignees?: TaskAssignee[];
  zoneId: string;
  columnId?: string | null;
  siteName: string;
  siteId: string;
  siteLocation: string;
  siteAddress: string;
  labels?: TaskLabel[];
  externalLinks?: TaskExternalLink[];
};

export default Task;
