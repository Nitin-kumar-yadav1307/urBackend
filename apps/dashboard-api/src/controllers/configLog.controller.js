/**
 * configLog.controller.js
 *
 * Handles API requests for the Project Configuration Change Log feature.
 */

const { ProjectConfigLog, AppError } = require('@urbackend/common');

/**
 * Exhaustive list of valid category values that can be stored by logConfigChange.
 * Used to whitelist the `category` query param and prevent NoSQL operator injection.
 */
const ALLOWED_CATEGORIES = new Set([
  'project_info',
  'api_key',
  'auth',
  'public_signup',
  'auth_providers',
  'allowed_domains',
  'byod_db',
  'byod_storage',
  'collection_schema',
  'collection_rls',
  'mail_template',
  'resend',
  'member',
]);

/**
 * GET /api/projects/:projectId/config-logs
 *
 * Returns paginated configuration change logs for a project.
 * Accessible by any project member (admin or viewer).
 *
 * Query params:
 *   page     {number}  1-indexed page number (default: 1)
 *   limit    {number}  items per page, max 100 (default: 30)
 *   category {string}  optional filter by category — must be a known category value
 */
module.exports.getConfigLogs = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const skip  = (page - 1) * limit;

    // Build filter with a safe, scalar projectId (already validated by authorizeProject middleware).
    const filter = { projectId };

    if (req.query.category !== undefined) {
      // Reject non-string values (e.g. objects from ?category[$ne]=null) and
      // unknown category names to prevent NoSQL operator injection.
      if (typeof req.query.category !== 'string' || !ALLOWED_CATEGORIES.has(req.query.category)) {
        return next(new AppError(400, `Invalid category. Allowed values: ${[...ALLOWED_CATEGORIES].join(', ')}`));
      }
      filter.category = req.query.category;
    }

    const [logs, total] = await Promise.all([
      ProjectConfigLog.find(filter)
        .sort({ changedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('changedBy', 'email')
        .select('-__v')
        .lean(),
      ProjectConfigLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message: 'Configuration change logs retrieved successfully.',
    });
  } catch (err) {
    next(err);
  }
};
