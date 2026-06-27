import { apiFetch } from "../core/api.js";
import type { CLIProfile } from "../types/auth.js";

export async function authenticate(
  token: string,
): Promise<CLIProfile> {
  return apiFetch("/api/user/cli/me", {
    method: "GET",
    token,
  });
}

export async function getProfile(): Promise<CLIProfile> {
  return apiFetch("/api/user/cli/me", {
    method: "GET",
  });
}