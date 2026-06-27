import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { authenticate } from "../services/auth.service.js";
import { saveToken } from "../core/config.js";
import { isValidPAT } from "../utils/token.js";
import { APIError } from "../core/errors.js";
import { logger } from "../core/logger.js";

export async function loginCommand() {
  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  const token = (
    await rl.question("Paste your Personal Access Token: ")
  ).trim();

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
        `Scopes     : ${profile.auth.scopes.join(", ")}`,
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