
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/AuthMiddleware");

const {
    validateProduct
} = require("../middlewares/ValidateMiddleware");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/ProductController");

router.use(authMiddleware);

router.post("/", validateProduct, createProduct);

router.get("/", getProducts);

router.get("/:id", getProductById);

router.put("/:id", validateProduct, updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;
