const mongoose = require('mongoose');

/**
 * ProjectConfigLog — Audit trail for all project-level configuration changes.
 *
 * Every time a developer (or team member) changes a project setting via the
 * dashboard-api, a document is inserted here capturing:
 *   - which project was affected
 *   - which setting category changed (e.g. "auth", "rls", "allowed_domains")
 *   - a human-readable label describing the change
 *   - the before/after values (sensitive values are masked automatically)
 *   - who made the change (developer reference)
 *   - their email at the time of the change (denormalized for fast display)
 *   - the exact timestamp
 */
const projectConfigLogSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },

    /** Developer who performed the action */
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Developer',
      required: true,
    },

    /** Denormalized email so we can display it even if the account is deleted */
    changedByEmail: {
      type: String,
      default: '',
    },

    /**
     * High-level setting category.
     * Possible values:
     *   project_info | api_key | auth | public_signup | auth_providers |
     *   allowed_domains | byod_db | byod_storage | collection_schema |
     *   collection_rls | mail_template | member | resend
     */
    category: {
      type: String,
      required: true,
    },

    /** Short human-readable description, e.g. "Enabled GitHub OAuth provider" */
    label: {
      type: String,
      required: true,
    },

    /**
     * Optional structured diff.
     * Sensitive values (keys, tokens, URIs) MUST be masked before storage.
     * Shape: { field: string, from: any, to: any }[]
     */
    diff: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /** ISO timestamp of the change — defaults to insertion time */
    changedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    // No automatic createdAt/updatedAt — changedAt is the single timestamp
    timestamps: false,
    // Capped collection: max 10 000 entries, 10 MB per project would ideally
    // use a partial index but Mongo capped collections don't support TTL.
    // We keep it as a regular collection with a compound index for efficient
    // per-project queries.
  },
);

// Compound index: fetch all logs for a project ordered newest-first
projectConfigLogSchema.index({ projectId: 1, changedAt: -1 });

module.exports = mongoose.model('ProjectConfigLog', projectConfigLogSchema);
