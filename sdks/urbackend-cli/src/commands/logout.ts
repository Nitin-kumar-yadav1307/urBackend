import { clearToken } from "../core/config.js";
import { logger } from "../core/logger.js";

export async function logoutCommand() {
  clearToken();

  logger.success("Logged out successfully.");
}