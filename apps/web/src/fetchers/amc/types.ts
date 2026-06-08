export type AmcServiceMasterRef = {
  id: string;
  name: string;
  currency?: string | null;
};

export type AmcService = {
  id: string;
  amcId: string;
  serviceMasterId: string;
  serviceMaster: AmcServiceMasterRef;
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
  used: number;
  remaining: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Amc = {
  id: string;
  siteId: string;
  bundleId: string | null;
  bundle?: { id: string; name: string } | null;
  startDate: string;
  endDate: string;
  durationYears: number;
  status: string;
  contractReference: string | null;
  notes: string | null;
  services: AmcService[];
  currentYearStart: string;
  nextYearStart: string;
  createdAt: string;
  updatedAt: string;
};

export type AmcBundleService = {
  id: string;
  bundleId: string;
  serviceMasterId: string;
  serviceMaster: { id: string; name: string; defaultPrice?: string | null };
  frequency: string;
  annualLimit: number;
  price: string;
  priceUnit: string;
};

export type AmcBundle = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  services: AmcBundleService[];
  createdAt: string;
  updatedAt: string;
};

export type AmcDashboardRow = {
  id: string;
  siteId: string;
  siteName: string;
  siteCode: string;
  bundleId: string | null;
  startDate: string;
  endDate: string;
  durationYears: number;
  status: string;
  contractReference: string | null;
  notes: string | null;
  totalValue: number;
  visitsTotalLimit: number;
  visitsCompleted: number;
  daysToExpiry: number | null;
  expiryUrgency: "none" | "ok" | "warning" | "critical";
  createdAt: string;
};
