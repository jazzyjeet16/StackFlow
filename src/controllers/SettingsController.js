
const db = require("../config/db");

// ======================================
// GET SETTINGS
// ======================================

const getSettings = (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const settings = db.prepare(`
            SELECT
                id,
                name,
                default_low_stock_threshold
            FROM organizations
            WHERE id = ?
        `).get(organizationId);

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        return res.status(200).json({
            success: true,
            settings
        });

    } catch (error) {
        console.error("Get Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch settings"
        });
    }
};


// ======================================
// UPDATE SETTINGS
// ======================================

const updateSettings = (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const { default_low_stock_threshold } = req.body;

        // Validate threshold
        const threshold = Number(default_low_stock_threshold);

        if (
            default_low_stock_threshold === undefined ||
            default_low_stock_threshold === null ||
            default_low_stock_threshold === "" ||
            !Number.isInteger(threshold) ||
            threshold < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Threshold must be a non-negative integer"
            });
        }

        // Update organization settings
        const result = db.prepare(`
            UPDATE organizations
            SET default_low_stock_threshold = ?
            WHERE id = ?
        `).run(
            threshold,
            organizationId
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        // Fetch updated settings
        const updatedSettings = db.prepare(`
            SELECT
                id,
                name,
                default_low_stock_threshold
            FROM organizations
            WHERE id = ?
        `).get(organizationId);

        return res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            settings: updatedSettings
        });

    } catch (error) {
        console.error("Update Settings Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update settings"
        });
    }
};


module.exports = {
    getSettings,
    updateSettings
};
