
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
    name: "",
    sku: "",
    description: "",
    quantity: 0,
    costPrice: "",
    sellingPrice: "",
    lowStockThreshold: ""
};

const ProductForm = ({ product, onClose, onSubmit }) => {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Populate form when editing an existing product
    useEffect(() => {
        if (product) {
            setForm({
                name: product.name || "",
                sku: product.sku || "",
                description: product.description || "",
                quantity: product.quantity ?? 0,

                costPrice:
                    product.costPrice ??
                    product.cost_price ??
                    "",

                sellingPrice:
                    product.sellingPrice ??
                    product.selling_price ??
                    "",

                lowStockThreshold:
                    product.lowStockThreshold ??
                    product.low_stock_threshold ??
                    ""
            });
        } else {
            setForm(initialForm);
        }
    }, [product]);

    // Handle input changes
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const payload = {
            ...form,
            quantity: Number(form.quantity),

            costPrice: form.costPrice === ""
                ? null
                : Number(form.costPrice),

            sellingPrice: form.sellingPrice === ""
                ? null
                : Number(form.sellingPrice),

            lowStockThreshold: form.lowStockThreshold === ""
                ? null
                : Number(form.lowStockThreshold)
        };

        try {
            await onSubmit(payload);
            onClose();
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to save product"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onMouseDown={onClose}>
            <div
                className="modal-card"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <h2>
                            {product ? "Edit Product" : "Add Product"}
                        </h2>
                        <p>Enter your product information below.</p>
                    </div>

                    <button
                        type="button"
                        className="icon-button"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="error-message">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">

                        {/* Product Name */}
                        <div className="form-group">
                            <label>Product name *</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        {/* SKU */}
                        <div className="form-group">
                            <label>SKU *</label>
                            <input
                                name="sku"
                                value={form.sku}
                                onChange={handleChange}
                                placeholder="Enter SKU"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group full-span">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Enter product description"
                                rows="3"
                            />
                        </div>

                        {/* Quantity */}
                        <div className="form-group">
                            <label>Quantity *</label>
                            <input
                                type="number"
                                name="quantity"
                                min="0"
                                step="1"
                                value={form.quantity}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Low Stock Threshold */}
                        <div className="form-group">
                            <label>Low-stock threshold</label>
                            <input
                                type="number"
                                name="lowStockThreshold"
                                min="0"
                                step="1"
                                value={form.lowStockThreshold}
                                onChange={handleChange}
                                placeholder="Use organization default"
                            />
                        </div>

                        {/* Cost Price */}
                        <div className="form-group">
                            <label>Cost price (₹)</label>
                            <input
                                type="number"
                                name="costPrice"
                                min="0"
                                step="0.01"
                                value={form.costPrice}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                        </div>

                        {/* Selling Price */}
                        <div className="form-group">
                            <label>Selling price (₹)</label>
                            <input
                                type="number"
                                name="sellingPrice"
                                min="0"
                                step="0.01"
                                value={form.sellingPrice}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                        </div>

                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : product
                                    ? "Update product"
                                    : "Add product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
