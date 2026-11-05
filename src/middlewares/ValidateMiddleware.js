
// ======================================
// SIGNUP VALIDATION
// ======================================

const validateSignup = (req, res, next) => {
    const {
        email,
        password,
        confirmPassword,
        organizationName
    } = req.body || {};

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string" ||
        typeof organizationName !== "string" ||
        !email.trim() ||
        !password ||
        !confirmPassword ||
        !organizationName.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must have at least 6 characters"
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match"
        });
    }

    next();
};


// ======================================
// LOGIN VALIDATION
// ======================================

const validateLogin = (req, res, next) => {
    const { email, password } = req.body || {};

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    next();
};


// ======================================
// PRODUCT VALIDATION
// ======================================

const validateProduct = (req, res, next) => {
    const {
        name,
        sku,
        quantity,
        cost_price,
        selling_price,
        low_stock_threshold
    } = req.body || {};

    // Name and SKU are required on creation
    if (req.method === "POST") {
        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof sku !== "string" ||
            !sku.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Product name and SKU are required"
            });
        }
    }

    // Validate optional name and SKU on update
    if (
        (name !== undefined &&
            (typeof name !== "string" || !name.trim())) ||
        (sku !== undefined &&
            (typeof sku !== "string" || !sku.trim()))
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid product name or SKU"
        });
    }

    // Quantity validation
    if (
        quantity !== undefined &&
        (
            quantity === null ||
            quantity === "" ||
            typeof quantity === "boolean" ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 0
        )
    ) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a non-negative integer"
        });
    }

    // Numeric field validation
    const numericFields = [
        cost_price,
        selling_price,
        low_stock_threshold
    ];

    for (const value of numericFields) {
        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            if (
                typeof value === "boolean" ||
                !Number.isFinite(Number(value)) ||
                Number(value) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Price and threshold must be non-negative numbers"
                });
            }
        }
    }

    if (
        low_stock_threshold !== undefined &&
        low_stock_threshold !== null &&
        low_stock_threshold !== "" &&
        !Number.isInteger(Number(low_stock_threshold))
    ) {
        return res.status(400).json({
            success: false,
            message: "Low-stock threshold must be an integer"
        });
    }

    next();
};


module.exports = {
    validateSignup,
    validateLogin,
    validateProduct
};
