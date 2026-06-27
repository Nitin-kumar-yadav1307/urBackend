import fs from "node:fs";
import type { CLIConfig } from "../types/config.js";
import {
  CONFIG_DIR,
  CONFIG_PATH,
  DEFAULT_API_BASE,
} from "./constants.js";

const DEFAULT_CONFIG: CLIConfig = {
  apiBase: DEFAULT_API_BASE,
};

export function loadConfig(): CLIConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    return DEFAULT_CONFIG;
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");

    return {
      ...DEFAULT_CONFIG,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: CLIConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify(config, null, 2),
  );
}

export function saveToken(token: string): void {
  const config = loadConfig();

  saveConfig({
    ...config,
    pat: token,
  });
}

export function clearToken(): void {
  const config = loadConfig();

  delete config.pat;

  saveConfig(config);
}

export function getToken(): string | undefined {
  return loadConfig().pat;
}