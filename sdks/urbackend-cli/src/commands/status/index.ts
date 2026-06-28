import { getGlobalStats, getRecentActivity } from "../../services/analytics.service.js";
import { getProject } from "../../services/project.service.js";
import { getToken, getCurrentProject } from "../../core/config.js";
import { formatBytes, label, formatDate } from "../../utils/format.js";
import { APIError } from "../../core/errors.js";
import { logger } from "../../core/logger.js";

function statusIcon(status: number): string {
  if (status < 300) return "✓";
  if (status < 400) return "→";
  if (status < 500) return "⚠";
  return "✖";
}

export async function statusCommand(): Promise<void> {
  const token = getToken();
  if (!token) {
    logger.error("You are not logged in. Run 'ub login' first.");
    return;
  }

  const currentProjectId = getCurrentProject();

  try {
    // Fetch global stats (works without a current project)
    const stats = await getGlobalStats();

    console.log("\n── Account ─────────────────────────────────────");
    console.log(`${label("Plan")} ${stats.plan.toUpperCase()}`);

    if (stats.planExpiresAt) {
      console.log(`${label("Plan expires")} ${formatDate(stats.planExpiresAt)}`);
    }

    console.log("\n── Usage ────────────────────────────────────────");
    console.log(
      `${label("Projects")} ${stats.usage.totalProjects} / ${stats.limits.maxProjects}`,
    );
    console.log(
      `${label("Collections")} ${stats.usage.totalCollections} / ${stats.limits.maxCollections}`,
    );
    console.log(
      `${label("Database")} ${formatBytes(stats.usage.totalDatabaseUsed)} / ${formatBytes(stats.limits.databaseLimit ?? 0)}`,
    );
    console.log(
      `${label("Storage")} ${formatBytes(stats.usage.totalStorageUsed)} / ${formatBytes(stats.limits.storageLimit ?? 0)}`,
    );
    console.log(`${label("Total requests")} ${stats.usage.totalRequests.toLocaleString()}`);
    console.log(`${label("Total users")} ${stats.usage.totalUsers.toLocaleString()}`);
    console.log(`${label("Webhooks")} ${stats.usage.totalWebhooks}`);

    // Per-project detail if a project is active
    if (currentProjectId) {
      try {
        const project = await getProject(currentProjectId);
        console.log("\n── Active project ───────────────────────────────");
        console.log(`${label("Name")} ${project.name}`);
        console.log(`${label("ID")} ${project._id}`);
        console.log(
          `${label("Collections")} ${project.collections?.length ?? 0}`,
        );
        console.log(`${label("Auth")} ${project.isAuthEnabled ? "Enabled" : "Disabled"}`);
      } catch {
        // Non-fatal — global stats already displayed
      }
    } else {
      console.log(
        "\nTip: Run 'ub project use' to select a project and see per-project details.",
      );
    }

    // Recent activity
    try {
      const activity = await getRecentActivity();

      if (activity.length > 0) {
        console.log("\n── Recent activity (last 10) ────────────────────");
        for (const log of activity.slice(0, 10)) {
          const icon = statusIcon(log.status);
          const time = new Date(log.timestamp).toLocaleTimeString();
          console.log(
            `  ${icon} [${log.status}] ${log.method.padEnd(6)} ${log.path.padEnd(32)} ${log.projectName}  ${time}`,
          );
        }
      }
    } catch {
      // Non-fatal — skip activity if it fails
    }

    console.log();
  } catch (error) {
    if (error instanceof APIError) {
      if (error.status === 401) {
        logger.error("Token is invalid or expired. Run 'ub login' to re-authenticate.");
      } else {
        logger.error(error.message);
      }
      return;
    }
    logger.error("Unable to connect to the urBackend API.");
  }
}
