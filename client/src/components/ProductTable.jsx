
import { Edit, Trash2, Package } from "lucide-react";

const ProductTable = ({ products, onEdit, onDelete }) => {
    if (!products.length) {
        return (
            <div className="empty-state">
                <Package size={40} />
                <h3>No products found</h3>
                <p>Add your first product to get started.</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Cost Price</th>
                        <th>Selling Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((product) => {
                        const threshold =
                            Number(product.lowStockThreshold ?? 5);

                        const isLowStock =
                            Number(product.quantity) <= threshold;

                        // Support both camelCase and snake_case
                        const costPrice =
                            product.costPrice ?? product.cost_price;

                        const sellingPrice =
                            product.sellingPrice ?? product.selling_price;

                        return (
                            <tr key={product.id}>
                                <td>
                                    <div className="product-name">
                                        <div className="product-avatar">
                                            <Package size={18} />
                                        </div>

                                        <div>
                                            <strong>{product.name}</strong>
                                            <span>
                                                {product.description || "No description"}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td>{product.sku}</td>

                                <td>
                                    <strong>{product.quantity}</strong>
                                </td>

                                <td>
                                    {costPrice != null && costPrice !== ""
                                        ? `₹${Number(costPrice).toLocaleString("en-IN")}`
                                        : "—"}
                                </td>

                                <td>
                                    {sellingPrice != null && sellingPrice !== ""
                                        ? `₹${Number(sellingPrice).toLocaleString("en-IN")}`
                                        : "—"}
                                </td>

                                <td>
                                    <span className={
                                        isLowStock
                                            ? "status-badge low"
                                            : "status-badge healthy"
                                    }>
                                        {isLowStock ? "Low stock" : "In stock"}
                                    </span>
                                </td>

                                <td>
                                    <div className="table-actions">
                                        <button
                                            className="action-button edit"
                                            onClick={() => onEdit(product)}
                                            title="Edit product"
                                        >
                                            <Edit size={17} />
                                        </button>

                                        <button
                                            className="action-button delete"
                                            onClick={() => onDelete(product.id)}
                                            title="Delete product"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
