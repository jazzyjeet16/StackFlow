
import { useEffect, useState } from "react";
import { Save, Settings as SettingsIcon } from "lucide-react";
import API from "../services/api";

const Settings = () => {
    const [threshold, setThreshold] = useState(5);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await API.get("/settings");
                const result = response.data?.data || response.data;

                const organization =
                    result.organization || result.settings || result;

                setThreshold(
                    organization.defaultLowStockThreshold ??
                    organization.default_low_stock_threshold ??
                    5
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load organization settings"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!Number.isInteger(Number(threshold)) || Number(threshold) < 0) {
            setError("Threshold must be a non-negative whole number");
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await API.put("/settings", {
                defaultLowStockThreshold: Number(threshold)
            });

            setMessage("Settings updated successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to update settings"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-state">Loading settings...</div>;
    }

    return (
        <div>
            <div className="page-heading">
                <div>
                    <p className="eyebrow">PREFERENCES</p>
                    <h1>Settings</h1>
                    <p>Manage your organization inventory preferences.</p>
                </div>
            </div>

            <section className="content-card settings-card">
                <div className="settings-title">
                    <div className="stat-icon blue">
                        <SettingsIcon size={22} />
                    </div>

                    <div>
                        <h2>Inventory settings</h2>
                        <p>Configure your default inventory threshold.</p>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <form onSubmit={handleSave}>
                    <div className="form-group settings-field">
                        <label>Default low-stock threshold</label>

                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={threshold}
                            onChange={(e) => setThreshold(e.target.value)}
                            required
                        />

                        <small>
                            Products with quantities at or below this value
                            will be marked as low stock, unless they have
                            their own threshold.
                        </small>
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={saving}
                    >
                        <Save size={17} />
                        {saving ? "Saving..." : "Save changes"}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default Settings;
