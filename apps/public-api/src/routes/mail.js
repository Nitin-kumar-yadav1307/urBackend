const express = require("express");
const router = express.Router();
const verifyApiKey = require("../middlewares/verifyApiKey");
const requireSecretKey = require("../middlewares/requireSecretKey");
const { checkUsageLimits } = require("../middlewares/usageGate");
const { sendMail } = require("../controllers/mail.controller");

router.post("/send", verifyApiKey, requireSecretKey, checkUsageLimits, sendMail);

module.exports = router;