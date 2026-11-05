
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ======================================
// SIGNUP
// ======================================

const signup = (req, res) => {
    try {
        const {
            email,
            password,
            confirmPassword,
            organizationName
        } = req.body;

        // Validate required fields
        if (
            !email ||
            !password ||
            !confirmPassword ||
            !organizationName
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedOrganization = organizationName.trim();

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (!normalizedOrganization) {
            return res.status(400).json({
                success: false,
                message: "Organization name is required"
            });
        }

        // Check existing user
        const existingUser = db.prepare(
            "SELECT id FROM users WHERE email = ?"
        ).get(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        const defaultThreshold = Number(
            process.env.DEFAULT_LOW_STOCK_THRESHOLD || 5
        );

        // Create organization and user atomically
        const registerUser = db.transaction(() => {

            const organizationResult = db.prepare(`
                INSERT INTO organizations (
                    name,
                    default_low_stock_threshold
                )
                VALUES (?, ?)
            `).run(
                normalizedOrganization,
                defaultThreshold
            );

            const organizationId =
                organizationResult.lastInsertRowid;

            const userResult = db.prepare(`
                INSERT INTO users (
                    organization_id,
                    email,
                    password
                )
                VALUES (?, ?, ?)
            `).run(
                organizationId,
                normalizedEmail,
                hashedPassword
            );

            return {
                userId: userResult.lastInsertRowid,
                organizationId
            };
        });

        const result = registerUser();

        // Generate JWT
        const token = jwt.sign(
            {
                id: result.userId,
                organizationId: result.organizationId
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: result.userId,
                email: normalizedEmail,
                organizationId: result.organizationId,
                organizationName: normalizedOrganization
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ======================================
// LOGIN
// ======================================

const login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user and organization
        const user = db.prepare(`
            SELECT
                users.id,
                users.email,
                users.password,
                users.organization_id,
                organizations.name AS organization_name
            FROM users
            INNER JOIN organizations
                ON users.organization_id = organizations.id
            WHERE users.email = ?
        `).get(normalizedEmail);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordValid = bcrypt.compareSync(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                organizationId: user.organization_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                organizationId: user.organization_id,
                organizationName: user.organization_name
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    signup,
    login
};
