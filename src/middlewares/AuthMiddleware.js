
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const AuthMiddleware = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token not provided"
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is missing"
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        // Verify user exists in database
        const user = db.prepare(`
            SELECT
                id,
                organization_id
            FROM users
            WHERE id = ?
        `).get(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        // Attach trusted user information
        req.user = {
            id: user.id,
            organizationId: user.organization_id
        };

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again"
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        next(error);
    }
};

module.exports = AuthMiddleware;
