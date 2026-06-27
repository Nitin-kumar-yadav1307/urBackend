import { getProfile } from "../services/auth.service.js";
import { APIError } from "../core/errors.js";
import { logger } from "../core/logger.js";

export async function whoamiCommand() {
  try {
    const profile = await getProfile();

    console.log(`Email      : ${profile.developer.email}`);
    console.log(`Plan       : ${profile.developer.plan}`);

    if (profile.developer.githubUsername) {
      console.log(
        `GitHub     : ${profile.developer.githubUsername}`,
      );
    }

    console.log(
      `Token Type : ${profile.auth.tokenType}`,
    );
  } catch (error) {
    if (error instanceof APIError) {
      logger.error(error.message);
      return;
    }

    logger.error("Unable to connect to urBackend.");
  }
}