/**
 * logConfigChange.js
 *
 * Thin helper that inserts a ProjectConfigLog document.
 * Call this after any successful project-level configuration mutation.
 *
 * Usage:
 *   const { logConfigChange } = require('../utils/logConfigChange');
 *
 *   await logConfigChange({
 *     projectId: req.params.projectId,
 *     user: req.user,           // { _id, email }
 *     category: 'auth',
 *     label: 'Authentication toggled ON',
 *     diff: [{ field: 'isAuthEnabled', from: false, to: true }],
 *   });
 *
 * All DB errors are swallowed so that a logging failure never breaks the
 * primary API response.
 */

const { ProjectConfigLog, Developer } = require('@urbackend/common');

/**
 * @param {Object} opts
 * @param {string|Object} opts.projectId
 * @param {{ _id: string|Object, email?: string }} opts.user
 * @param {string} opts.category
 * @param {string} opts.label
 * @param {Array<{field:string,from:*,to:*}>|null} [opts.diff]
 * @returns {Promise<void>}
 */
async function logConfigChange({ projectId, user, category, label, diff = null }) {
  try {
    let email = user?.email;
    if (!email && user?._id) {
      try {
        const dev = await Developer.findById(user._id).select('email').lean();
        email = dev?.email || '';
      } catch (lookupErr) {
        email = '';
      }
    }

    await ProjectConfigLog.create({
      projectId,
      changedBy: user?._id,
      changedByEmail: email || '',
      category,
      label,
      diff,
    });
  } catch (err) {
    // Never let audit logging crash a successful mutation
    console.error('[ConfigLog] Failed to write config log:', err.message);
  }
}

module.exports = { logConfigChange };
