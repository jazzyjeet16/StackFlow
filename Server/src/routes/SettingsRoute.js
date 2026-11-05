
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/AuthMiddleware");

const {
    getSettings,
    updateSettings
} = require("../controllers/SettingsController");

// Authentication middleware
router.use(authMiddleware);

// Get organization settings
router.get("/", getSettings);

// Update organization settings
router.put("/", updateSettings);

module.exports = router;
