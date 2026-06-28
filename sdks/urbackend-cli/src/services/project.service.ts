import { apiFetch } from "../core/api.js";
import type { Project, ProjectListItem } from "../types/project.js";

interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export async function listProjects(): Promise<ProjectListItem[]> {
  const res = await apiFetch<APIResponse<ProjectListItem[]>>("/projects", {
    method: "GET",
  });
  return res.data ?? [];
}

export async function getProject(projectId: string): Promise<Project> {
  const res = await apiFetch<APIResponse<Project>>(`/projects/${projectId}`, {
    method: "GET",
  });
  return res.data;
}

export async function createProject(payload: {
  name: string;
  description?: string;
}): Promise<Project> {
  const res = await apiFetch<APIResponse<Project>>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  return apiFetch<void>(`/projects/${projectId}`, {
    method: "DELETE",
  });
}