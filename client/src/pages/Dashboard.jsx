
import { useEffect, useState } from "react";
import {
    Package,
    Boxes,
    AlertTriangle,
    TrendingUp,
    RefreshCw
} from "lucide-react";

import API from "../services/api";

const Dashboard = () => {
    const [dashboard, setDashboard] = useState({
        totalProducts: 0,
        totalQuantity: 0,
        lowStockProducts: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await API.get("/dashboard");

            // Backend returns data inside response.data.dashboard
            const result = response.data.dashboard;

            setDashboard({
                totalProducts: Number(result.totalProducts || 0),
                totalQuantity: Number(result.totalQuantity || 0),
                lowStockProducts: Array.isArray(result.lowStockProducts)
                    ? result.lowStockProducts
                    : [],
                lowStockCount: Number(result.lowStockCount || 0)
            });

        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const stats = [
        {
            title: "Total Products",
            value: dashboard.totalProducts,
            icon: Package,
            color: "blue"
        },
        {
            title: "Total Quantity",
            value: dashboard.totalQuantity,
            icon: Boxes,
            color: "purple"
        },
        {
            title: "Low Stock Products",
            value: dashboard.lowStockCount,
            icon: AlertTriangle,
            color: "orange"
        }
    ];

    if (loading) {
        return <div className="loading-state">Loading dashboard...</div>;
    }

    return (
        <div>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">OVERVIEW</p>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's your inventory overview.</p>
                </div>

                <button
                    className="secondary-button"
                    onClick={fetchDashboard}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div className="stat-card" key={stat.title}>
                            <div className="stat-top">
                                <span>{stat.title}</span>

                                <div className={`stat-icon ${stat.color}`}>
                                    <Icon size={21} />
                                </div>
                            </div>

                            <h2>{stat.value.toLocaleString("en-IN")}</h2>

                            <p className="stat-description">
                                <TrendingUp size={14} />
                                Current inventory overview
                            </p>
                        </div>
                    );
                })}
            </div>

            <section className="content-card dashboard-table-card">
                <div className="section-toolbar">
                    <div>
                        <h2>Low stock alerts</h2>
                        <p>Products that need restocking</p>
                    </div>

                    <span className="alert-count">
                        {dashboard.lowStockProducts.length} alerts
                    </span>
                </div>

                {dashboard.lowStockProducts.length === 0 ? (
                    <div className="empty-state">
                        <Package size={40} />
                        <h3>All products are well stocked!</h3>
                        <p>There are currently no low-stock products.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Available quantity</th>
                                    <th>Threshold</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {dashboard.lowStockProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <strong>{product.name}</strong>
                                        </td>

                                        <td>{product.sku}</td>

                                        <td>
                                            <strong>{product.quantity}</strong>
                                        </td>

                                        <td>
                                            {product.lowStockThreshold ?? "Default"}
                                        </td>

                                        <td>
                                            <span className="status-badge low">
                                                Low stock
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
