import { apiFetch } from "../core/api.js";
import type { GlobalStats, RecentActivityLog } from "../types/analytics.js";

interface GlobalStatsResponse {
  data: GlobalStats;
}

interface RecentActivityResponse {
  data: RecentActivityLog[];
}

interface ProjectAnalyticsResponse {
  data: {
    totalRequests: number;
    successRequests: number;
    errorRequests: number;
    topCollections?: { name: string; requests: number }[];
  };
}

/**
 * Fetches global usage stats across all developer projects.
 * Endpoint: GET /analytics/stats
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const res = await apiFetch<GlobalStatsResponse>("/analytics/stats", {
    method: "GET",
  });
  return res.data;
}

/**
 * Fetches the 20 most recent API logs across all projects.
 * Endpoint: GET /analytics/activity
 */
export async function getRecentActivity(): Promise<RecentActivityLog[]> {
  const res = await apiFetch<RecentActivityResponse>("/analytics/activity", {
    method: "GET",
  });
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * Fetches per-project analytics.
 * Endpoint: GET /projects/:projectId/analytics?range=last24h
 */
export async function getProjectAnalytics(
  projectId: string,
  range: "last1h" | "last24h" | "last7d" | "last30d" | "allTime" = "last24h",
): Promise<ProjectAnalyticsResponse["data"]> {
  const res = await apiFetch<ProjectAnalyticsResponse>(
    `/projects/${projectId}/analytics?range=${range}`,
    { method: "GET" },
  );
  return res.data;
}
