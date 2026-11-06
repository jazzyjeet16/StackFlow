
const db = require("../config/db");

// ======================================
// CREATE PRODUCT
// ======================================

const createProduct = (req, res) => {
    try {
        const {
            name,
            sku,
            description,
            quantity = 0
        } = req.body;

        // Accept both camelCase and snake_case
        const cost_price =
            req.body.cost_price ?? req.body.costPrice;

        const selling_price =
            req.body.selling_price ?? req.body.sellingPrice;

        const low_stock_threshold =
            req.body.low_stock_threshold ??
            req.body.lowStockThreshold;

        const organizationId = req.user.organizationId;

        // Required fields
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

        // Validate quantity
        const stockQuantity = Number(quantity);

        if (
            !Number.isInteger(stockQuantity) ||
            stockQuantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a non-negative integer"
            });
        }

        // Validate optional numeric fields
        const costPrice =
            cost_price == null || cost_price === ""
                ? null
                : Number(cost_price);

        const sellingPrice =
            selling_price == null || selling_price === ""
                ? null
                : Number(selling_price);

        const threshold =
            low_stock_threshold == null ||
            low_stock_threshold === ""
                ? null
                : Number(low_stock_threshold);

        if (
            (costPrice !== null &&
                (!Number.isFinite(costPrice) || costPrice < 0)) ||
            (sellingPrice !== null &&
                (!Number.isFinite(sellingPrice) || sellingPrice < 0)) ||
            (threshold !== null &&
                (!Number.isInteger(threshold) || threshold < 0))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid price or low-stock threshold"
            });
        }

        // Insert product
        const result = db.prepare(`
            INSERT INTO products (
                organization_id,
                name,
                sku,
                description,
                quantity,
                cost_price,
                selling_price,
                low_stock_threshold
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            organizationId,
            name.trim(),
            sku.trim(),
            description || null,
            stockQuantity,
            costPrice,
            sellingPrice,
            threshold
        );

        const product = db.prepare(`
            SELECT *
            FROM products
            WHERE id = ? AND organization_id = ?
        `).get(result.lastInsertRowid, organizationId);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                message: "SKU already exists in your organization"
            });
        }

        console.error("Create Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create product"
        });
    }
};


// ======================================
// GET ALL PRODUCTS
// ======================================

const getProducts = (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        const search = (req.query.search || "").trim();

        const products = db.prepare(`
            SELECT *
            FROM products
            WHERE organization_id = ?
            AND (
                name LIKE ?
                OR sku LIKE ?
            )
            ORDER BY created_at DESC
        `).all(
            organizationId,
            `%${search}%`,
            `%${search}%`
        );

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get Products Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};


// ======================================
// GET SINGLE PRODUCT
// ======================================

const getProductById = (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const productId = Number(req.params.id);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = db.prepare(`
            SELECT *
            FROM products
            WHERE id = ? AND organization_id = ?
        `).get(productId, organizationId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error("Get Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch product"
        });
    }
};


// ======================================
// UPDATE PRODUCT
// ======================================

const updateProduct = (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const productId = Number(req.params.id);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Find existing product
        const existingProduct = db.prepare(`
            SELECT *
            FROM products
            WHERE id = ? AND organization_id = ?
        `).get(productId, organizationId);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const {
            name,
            sku,
            description,
            quantity
        } = req.body;

        // Accept both camelCase and snake_case
        const cost_price = req.body.cost_price !== undefined
            ? req.body.cost_price
            : req.body.costPrice;

        const selling_price = req.body.selling_price !== undefined
            ? req.body.selling_price
            : req.body.sellingPrice;

        const low_stock_threshold =
            req.body.low_stock_threshold !== undefined
                ? req.body.low_stock_threshold
                : req.body.lowStockThreshold;

        const updatedName = name === undefined
            ? existingProduct.name
            : name;

        const updatedSku = sku === undefined
            ? existingProduct.sku
            : sku;

        if (
            typeof updatedName !== "string" ||
            !updatedName.trim() ||
            typeof updatedSku !== "string" ||
            !updatedSku.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Product name and SKU cannot be empty"
            });
        }

        const updatedQuantity = quantity === undefined
            ? existingProduct.quantity
            : Number(quantity);

        const updatedCost = cost_price === undefined
            ? existingProduct.cost_price
            : (cost_price === null || cost_price === ""
                ? null
                : Number(cost_price));

        const updatedSelling = selling_price === undefined
            ? existingProduct.selling_price
            : (selling_price === null || selling_price === ""
                ? null
                : Number(selling_price));

        const updatedThreshold = low_stock_threshold === undefined
            ? existingProduct.low_stock_threshold
            : (low_stock_threshold === null ||
                low_stock_threshold === ""
                ? null
                : Number(low_stock_threshold));

        if (
            !Number.isInteger(updatedQuantity) ||
            updatedQuantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity"
            });
        }

        if (
            (updatedCost !== null &&
                (!Number.isFinite(updatedCost) || updatedCost < 0)) ||
            (updatedSelling !== null &&
                (!Number.isFinite(updatedSelling) || updatedSelling < 0)) ||
            (updatedThreshold !== null &&
                (!Number.isInteger(updatedThreshold) || updatedThreshold < 0))
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid price or threshold"
            });
        }

        // Update product
        db.prepare(`
            UPDATE products
            SET
                name = ?,
                sku = ?,
                description = ?,
                quantity = ?,
                cost_price = ?,
                selling_price = ?,
                low_stock_threshold = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND organization_id = ?
        `).run(
            updatedName.trim(),
            updatedSku.trim(),
            description === undefined
                ? existingProduct.description
                : description,
            updatedQuantity,
            updatedCost,
            updatedSelling,
            updatedThreshold,
            productId,
            organizationId
        );

        const updatedProduct = db.prepare(`
            SELECT *
            FROM products
            WHERE id = ? AND organization_id = ?
        `).get(productId, organizationId);

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                message: "SKU already exists in your organization"
            });
        }

        console.error("Update Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product"
        });
    }
};


// ======================================
// DELETE PRODUCT
// ======================================

const deleteProduct = (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const productId = Number(req.params.id);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const result = db.prepare(`
            DELETE FROM products
            WHERE id = ? AND organization_id = ?
        `).run(productId, organizationId);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete Product Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product"
        });
    }
};


// ======================================
// EXPORT CONTROLLER FUNCTIONS
// ======================================

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
