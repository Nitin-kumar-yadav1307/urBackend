/**
 * configLog.controller.js
 *
 * Handles API requests for the Project Configuration Change Log feature.
 */

const { ProjectConfigLog, AppError, getProjectAccessQuery } = require('@urbackend/common');

/**
 * GET /api/projects/:projectId/config-logs
 *
 * Returns paginated configuration change logs for a project.
 * Accessible by any project member (admin or viewer).
 *
 * Query params:
 *   page     {number}  1-indexed page number (default: 1)
 *   limit    {number}  items per page, max 100 (default: 30)
 *   category {string}  optional filter by category
 */
module.exports.getConfigLogs = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const skip  = (page - 1) * limit;

    const filter = { projectId };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const [logs, total] = await Promise.all([
      ProjectConfigLog.find(filter)
        .sort({ changedAt: -1 })
        .skip(skip)
        .limit(limit)
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
