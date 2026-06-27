import os from "node:os";
import path from "node:path";

export const CLI_NAME = "ub";

export const CONFIG_DIR = path.join(
  os.homedir(),
  ".ub",
);

export const CONFIG_PATH = path.join(
  CONFIG_DIR,
  "config.json",
);

/**
 * Default production API.
 *
 * Can be overridden during development by
 * URBACKEND_API_URL.
 */
export const DEFAULT_API_BASE =
  process.env.URBACKEND_API_URL ??
  "https://api.urbackend.bitbros.in";