
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/AuthMiddleware");

const {
    getDashboard
} = require("../controllers/DashboardController");

// Authentication middleware
router.use(authMiddleware);

// Get dashboard overview
router.get("/", getDashboard);

module.exports = router;
