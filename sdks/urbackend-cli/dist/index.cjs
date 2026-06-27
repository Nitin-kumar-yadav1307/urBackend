"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli.ts
var import_commander = require("commander");

// src/commands/login.ts
var import_promises = require("readline/promises");
var import_node_process = require("process");

// src/core/config.ts
var import_node_fs = __toESM(require("fs"), 1);

// src/core/constants.ts
var import_node_os = __toESM(require("os"), 1);
var import_node_path = __toESM(require("path"), 1);
var CONFIG_DIR = import_node_path.default.join(
  import_node_os.default.homedir(),
  ".ub"
);
var CONFIG_PATH = import_node_path.default.join(
  CONFIG_DIR,
  "config.json"
);
var DEFAULT_API_BASE = process.env.URBACKEND_API_URL ?? "https://api.urbackend.bitbros.in";

// src/core/config.ts
var DEFAULT_CONFIG = {
  apiBase: DEFAULT_API_BASE
};
function loadConfig() {
  if (!import_node_fs.default.existsSync(CONFIG_PATH)) {
    return DEFAULT_CONFIG;
  }
  try {
    const raw = import_node_fs.default.readFileSync(CONFIG_PATH, "utf8");
    return {
      ...DEFAULT_CONFIG,
      ...JSON.parse(raw)
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
function saveConfig(config) {
  if (!import_node_fs.default.existsSync(CONFIG_DIR)) {
    import_node_fs.default.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  import_node_fs.default.writeFileSync(
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
  const rl = (0, import_promises.createInterface)({
    input: import_node_process.stdin,
    output: import_node_process.stdout
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
var program = new import_commander.Command();
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
//# sourceMappingURL=index.cjs.map