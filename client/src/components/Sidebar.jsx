
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Settings,
    Boxes,
    X
} from "lucide-react";

const Sidebar = ({ open, onClose }) => {
    const links = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        },
        {
            name: "Products",
            path: "/products",
            icon: Package
        },
        {
            name: "Settings",
            path: "/settings",
            icon: Settings
        }
    ];

    return (
        <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
            <div className="sidebar-brand">
                <div className="brand-icon">
                    <Boxes size={23} />
                </div>

                <span>StockFlow</span>

                <button className="mobile-close" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className="sidebar-section">
                <p className="sidebar-label">WORKSPACE</p>

                <nav className="sidebar-nav">
                    {links.map((link) => {
                        const Icon = link.icon;

                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    isActive ? "nav-link active" : "nav-link"
                                }
                                onClick={onClose}
                            >
                                <Icon size={19} />
                                <span>{link.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-bottom">
                <div className="sidebar-help">
                    <div className="help-icon">?</div>
                    <div>
                        <strong>Need help?</strong>
                        <p>Manage your inventory easily.</p>
                    </div>
                </div>

                <p className="sidebar-version">StockFlow v1.0.0</p>
            </div>
        </aside>
    );
};

export default Sidebar;
