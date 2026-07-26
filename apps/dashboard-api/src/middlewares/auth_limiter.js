const rateLimit = require('express-rate-limit');
const { AppError } = require('@urbackend/common');

const shouldSkip = (req) => {
    if (process.env.NODE_ENV === 'development') return true;
    const bypassKey = process.env.LOADTEST_BYPASS_KEY;
    if (bypassKey && req.headers['x-bypass-rate-limit'] === bypassKey) return true;
    return false;
};

// limiter for sensitive auth endpoints (login, register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    handler: (req, res, next) => next(new AppError(429, "Too many attempts. Please try again in 15 minutes.")),
    skip: shouldSkip,
    standardHeaders: true,
    legacyHeaders: false,
});

const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    handler: (req, res, next) => next(new AppError(429, "Too many requests. Please try again later.")),
    skip: shouldSkip,
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, publicLimiter };
