export interface GlobalStats {
  plan: "free" | "pro";
  planExpiresAt: string | null;
  limits: {
    maxProjects: number;
    maxCollections: number;
    storageLimit: number;
    databaseLimit: number;
  };
  usage: {
    totalProjects: number;
    totalCollections: number;
    totalStorageUsed: number;
    totalDatabaseUsed: number;
    totalRequests: number;
    totalWebhooks: number;
    totalUsers: number;
  };
}

export interface RecentActivityLog {
  id: string;
  projectName: string;
  projectId: string;
  method: string;
  path: string;
  status: number;
  timestamp: string;
}

export interface ProjectAnalytics {
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  avgResponseTime?: number;
}
