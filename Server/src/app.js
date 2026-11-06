
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/AuthRoutes");
const productRoutes = require("./routes/ProductRoutes");
const dashboardRoutes = require("./routes/DashboardRoutes");
const settingsRoutes = require("./routes/SettingsRoute");

const {
    notFound,
    errorHandler
} = require("./middlewares/ErrorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "StockFlow API is running"
    });
});

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
