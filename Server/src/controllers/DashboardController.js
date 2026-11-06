
const db = require("../config/db");

// ======================================
// GET DASHBOARD OVERVIEW
// ======================================

const getDashboard = (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        // Get total products and total inventory quantity
        const summary = db.prepare(`
            SELECT
                COUNT(*) AS totalProducts,
                COALESCE(SUM(quantity), 0) AS totalQuantity
            FROM products
            WHERE organization_id = ?
        `).get(organizationId);

        // Get organization's default threshold
        const organization = db.prepare(`
            SELECT default_low_stock_threshold
            FROM organizations
            WHERE id = ?
        `).get(organizationId);

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        const defaultThreshold =
            organization.default_low_stock_threshold;

        // Get low-stock products
        const lowStockProducts = db.prepare(`
            SELECT
                id,
                name,
                sku,
                quantity,
                COALESCE(
                    low_stock_threshold,
                    ?
                ) AS low_stock_threshold
            FROM products
            WHERE organization_id = ?
            AND quantity <= COALESCE(
                low_stock_threshold,
                ?
            )
            ORDER BY quantity ASC
        `).all(
            defaultThreshold,
            organizationId,
            defaultThreshold
        );

        // Send dashboard response
        return res.status(200).json({
            success: true,
            dashboard: {
                totalProducts: summary.totalProducts,
                totalQuantity: summary.totalQuantity,
                lowStockCount: lowStockProducts.length,
                lowStockProducts
            }
        });

    } catch (error) {
        console.error("Dashboard Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data"
        });
    }
};


module.exports = {
    getDashboard
};
