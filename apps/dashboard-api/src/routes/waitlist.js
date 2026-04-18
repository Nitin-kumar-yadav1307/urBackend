const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/auth_limiter');
const waitlistController = require('../controllers/waitlist.controller');

router.post('/', authLimiter, waitlistController.addToWaitlist);
router.get('/count', waitlistController.getWaitlistCount);
router.get('/admin', authMiddleware, waitlistController.getWaitlist);

module.exports = router;
