
import { Menu, Bell, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();

    const email = user?.email || "Admin";
    const initial = email.charAt(0).toUpperCase();

    return (
        <header className="navbar">
            <button className="menu-button" onClick={onMenuClick}>
                <Menu size={22} />
            </button>

            <div className="navbar-search-placeholder">
                Inventory Management
            </div>

            <div className="navbar-actions">
                <button className="icon-button" title="Notifications">
                    <Bell size={19} />
                </button>

                <div className="user-profile">
                    <div className="avatar">{initial}</div>

                    <div className="user-info">
                        <strong>{email}</strong>
                        <span>Administrator</span>
                    </div>
                </div>

                <button
                    className="icon-button logout-button"
                    onClick={logout}
                    title="Logout"
                >
                    <LogOut size={19} />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
