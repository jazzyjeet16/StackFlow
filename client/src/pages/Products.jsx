
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";

import API from "../services/Api";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProducts = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await API.get("/products");

            const result = response.data;

            const list =
                Array.isArray(result) ? result :
                Array.isArray(result.products) ? result.products :
                Array.isArray(result.data) ? result.data :
                Array.isArray(result.data?.products) ? result.data.products :
                [];

            setProducts(list);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load products"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const query = search.toLowerCase().trim();

        if (!query) return products;

        return products.filter((product) =>
            product.name?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query)
        );
    }, [products, search]);

    const handleAdd = async (payload) => {
        await API.post("/products", payload);
        await fetchProducts();
    };

    const handleUpdate = async (payload) => {
        await API.put(`/products/${selectedProduct.id}`, payload);
        await fetchProducts();
        setSelectedProduct(null);
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            await API.delete(`/products/${id}`);
            await fetchProducts();
        } catch (err) {
            alert(
                err.response?.data?.message || "Unable to delete product"
            );
        }
    };

    const openAddForm = () => {
        setSelectedProduct(null);
        setShowForm(true);
    };

    const openEditForm = (product) => {
        setSelectedProduct(product);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setSelectedProduct(null);
    };

    const submitForm = (payload) => {
        return selectedProduct
            ? handleUpdate(payload)
            : handleAdd(payload);
    };

    return (
        <div>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">INVENTORY</p>
                    <h1>Products</h1>
                    <p>Manage and track all your inventory products.</p>
                </div>

                <button className="primary-button" onClick={openAddForm}>
                    <Plus size={18} />
                    Add product
                </button>
            </div>

            <section className="content-card">
                <div className="section-toolbar">
                    <div>
                        <h2>All products</h2>
                        <p>{products.length} products in your inventory</p>
                    </div>

                    <div className="toolbar-actions">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or SKU..."
                            />
                        </div>

                        <button
                            className="secondary-button refresh-button"
                            onClick={fetchProducts}
                            title="Refresh"
                        >
                            <RefreshCw size={17} />
                        </button>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading-state">Loading products...</div>
                ) : (
                    <ProductTable
                        products={filteredProducts}
                        onEdit={openEditForm}
                        onDelete={handleDelete}
                    />
                )}
            </section>

            {showForm && (
                <ProductForm
                    product={selectedProduct}
                    onClose={closeForm}
                    onSubmit={submitForm}
                />
            )}
        </div>
    );
};

export default Products;
