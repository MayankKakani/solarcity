export type ServiceMaster = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  defaultPrice: string | null;
  currency: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
