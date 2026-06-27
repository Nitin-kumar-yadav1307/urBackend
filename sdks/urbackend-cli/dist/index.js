// src/cli.ts
import { Command } from "commander";

// src/commands/login.ts
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";

// src/core/config.ts
import fs from "fs";

// src/core/constants.ts
import os from "os";
import path from "path";
var CONFIG_DIR = path.join(
  os.homedir(),
  ".ub"
);
var CONFIG_PATH = path.join(
  CONFIG_DIR,
  "config.json"
);
var DEFAULT_API_BASE = process.env.URBACKEND_API_URL ?? "https://api.urbackend.bitbros.in";

// src/core/config.ts
var DEFAULT_CONFIG = {
  apiBase: DEFAULT_API_BASE
};
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return DEFAULT_CONFIG;
  }
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    return {
      ...DEFAULT_CONFIG,
      ...JSON.parse(raw)
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
function saveConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify(config, null, 2)
  );
}
function saveToken(token) {
  const config = loadConfig();
  saveConfig({
    ...config,
    pat: token
  });
}
function clearToken() {
  const config = loadConfig();
  delete config.pat;
  saveConfig(config);
}

// src/core/errors.ts
var APIError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "APIError";
  }
  status;
};

// src/core/api.ts
async function apiFetch(endpoint, options = {}) {
  const config = loadConfig();
  const headers = new Headers(
    options.headers
  );
  if (options.body && !headers.has("Content-Type")) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }
  const token = options.token ?? config.pat;
  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }
  const response = await fetch(
    `${config.apiBase}${endpoint}`,
    {
      ...options,
      headers
    }
  );
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.message ?? body.error ?? message;
    } catch {
    }
    throw new APIError(
      response.status,
      message
    );
  }
  if (response.status === 204) {
    return void 0;
  }
  return await response.json();
}

// src/services/auth.service.ts
async function authenticate(token) {
  return apiFetch("/api/user/cli/me", {
    method: "GET",
    token
  });
}
async function getProfile() {
  return apiFetch("/api/user/cli/me", {
    method: "GET"
  });
}

// src/utils/token.ts
function isValidPAT(token) {
  return token.startsWith("ubpat_");
}

// src/core/logger.ts
var PREFIX = "ub";
var logger = {
  info(message) {
    console.log(`${PREFIX}: ${message}`);
  },
  success(message) {
    console.log(`\u2713 ${message}`);
  },
  warn(message) {
    console.warn(`\u26A0 ${message}`);
  },
  error(message) {
    console.error(`\u2716 ${message}`);
  }
};

// src/commands/login.ts
async function loginCommand() {
  const rl = createInterface({
    input: stdin,
    output: stdout
  });
  const token = (await rl.question("Paste your Personal Access Token: ")).trim();
  rl.close();
  if (!isValidPAT(token)) {
    logger.error("Invalid Personal Access Token.");
    return;
  }
  try {
    const profile = await authenticate(token);
    saveToken(token);
    logger.success("Successfully logged in.");
    console.log("");
    console.log(`Email      : ${profile.developer.email}`);
    console.log(`Plan       : ${profile.developer.plan}`);
    if (profile.auth.scopes.length > 0) {
      console.log(
        `Scopes     : ${profile.auth.scopes.join(", ")}`
      );
    }
  } catch (error) {
    if (error instanceof APIError) {
      logger.error(error.message);
      return;
    }
    logger.error("Unable to connect to urBackend.");
  }
}

// src/commands/logout.ts
async function logoutCommand() {
  clearToken();
  logger.success("Logged out successfully.");
}

// src/commands/whoami.ts
async function whoamiCommand() {
  try {
    const profile = await getProfile();
    console.log(`Email      : ${profile.developer.email}`);
    console.log(`Plan       : ${profile.developer.plan}`);
    if (profile.developer.githubUsername) {
      console.log(
        `GitHub     : ${profile.developer.githubUsername}`
      );
    }
    console.log(
      `Token Type : ${profile.auth.tokenType}`
    );
  } catch (error) {
    if (error instanceof APIError) {
      logger.error(error.message);
      return;
    }
    logger.error("Unable to connect to urBackend.");
  }
}

// src/cli.ts
var program = new Command();
program.name("ub").description("Official CLI for urBackend").version("0.1.0");
program.command("login").description(
  "Authenticate using a Personal Access Token"
).action(loginCommand);
program.command("logout").description(
  "Remove the local authentication"
).action(logoutCommand);
program.command("whoami").description(
  "Display the authenticated developer"
).action(whoamiCommand);
program.parse();
//# sourceMappingURL=index.js.map