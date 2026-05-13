import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Layout from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../config/api";
import { logger } from "../lib/logger";
import LoadingSpinner from "../components/common/LoadingSpinner";

const ProfileSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileData, setProfileData] = useState(null);

    // Profile Tab State
    const [profile, setProfile] = useState({
        cardName: "",
        cardCode: "",
        emailAddress: "",
        phone1: "",
        address: ""
    });

    // Security Tab State
    const [security, setSecurity] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Preferences Tab State
    const [preferences, setPreferences] = useState({
        newsletter: true,
        notifications: true,
        productUpdates: false,
        promotions: true,
        language: "en"
    });

    // Address Tab State
    const [addresses, setAddresses] = useState<any[]>([]);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                if (!user || user.customer?.isVisitor) {
                    setLoadingProfile(false);
                    return;
                }

                const cardCode = user.customer?.cardCode;
                if (!cardCode) {
                    setLoadingProfile(false);
                    return;
                }

                // Populate from user context (has full details after login)
                const customerData = user.customer as any;
                setProfile({
                    cardName: customerData?.cardName || user.userName || "",
                    cardCode: cardCode,
                    emailAddress: customerData?.email || customerData?.emailAddress || "",
                    phone1: customerData?.phone1 || customerData?.phone || "",
                    address: customerData?.address || ""
                });

                // Set addresses from context
                if (customerData?.address) {
                    setAddresses([{
                        id: "address-1",
                        type: "Address",
                        street: customerData.address || "",
                        city: customerData?.city || "",
                        country: customerData?.country || "",
                        state: customerData?.state || "",
                        postalCode: customerData?.postalCode || "",
                        isDefault: true
                    }]);
                }

                // TRY: Fetch additional details from API if needed
                try {
                    const bp = await (apiClient as any).getBusinessPartnerDetails(cardCode);
                    if (bp) {
                        setProfileData(bp);

                        const apiAddresses = bp.addresses || bp.Addresses || [];
                        if (Array.isArray(apiAddresses) && apiAddresses.length > 0) {
                            setAddresses(apiAddresses.map((addr, index) => ({
                                id: addr.id || `${addr.addressName || addr.AddressName || 'address'}-${index}`,
                                type: addr.addressName || addr.AddressName || addr.type || "Address",
                                street: addr.street || addr.Street || "",
                                city: addr.city || addr.City || "",
                                country: addr.country || addr.Country || "",
                                state: addr.state || addr.State || "",
                                postalCode: addr.zipCode || addr.ZipCode || addr.postalCode || "",
                                isDefault: addr.isDefault || index === 0
                            })));
                        }
                    }
                } catch (apiError: any) {
                    logger.warn("Could not fetch additional profile details from API:", apiError?.message);
                    // Continue with data from context
                }
            } catch (error) {
                logger.error("Failed to load profile settings:", error);
                toast.error("Failed to load profile settings");
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, [user?.customer?.cardCode]);

    const handleProfileChange = (e: any) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });

        if (name === "address") {
            setAddresses((prev) => {
                if (prev.length === 0) {
                    return [{
                        id: "address-1",
                        type: "Address",
                        street: value,
                        city: "",
                        country: "",
                        state: "",
                        postalCode: "",
                        isDefault: true
                    }];
                }
                return prev.map((addr, i) => (i === 0 ? { ...addr, street: value } : addr));
            });
        }
    };

    const handleSecurityChange = (e: any) => {
        const { name, value } = e.target;
        setSecurity({ ...security, [name]: value });
    };

    const handlePreferenceChange = (e: any) => {
        const { name, type, checked, value } = e.target;
        setPreferences({
            ...preferences,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const buildPayload = () => {
        const payload = { ...(profileData || {}) } as any;
        payload.cardName = profile.cardName;
        payload.CardName = profile.cardName;
        payload.cardCode = profile.cardCode;
        payload.CardCode = profile.cardCode;
        payload.phone1 = profile.phone1;
        payload.Phone1 = profile.phone1;
        payload.emailAddress = profile.emailAddress;
        payload.EmailAddress = profile.emailAddress;
        payload.address = profile.address;
        payload.Address = profile.address;

        let nextAddresses = [...addresses];
        if (nextAddresses.length === 0 && profile.address) {
            nextAddresses = [{
                id: "address-1",
                type: "Address",
                street: profile.address,
                city: "",
                country: "",
                state: "",
                postalCode: "",
                isDefault: true
            }];
        }

        payload.addresses = nextAddresses.map((address: any) => ({
            addressName: address.type || "Address",
            AddressName: address.type || "Address",
            street: address.street,
            Street: address.street,
            city: address.city,
            City: address.city,
            country: address.country,
            Country: address.country,
            state: address.state || "",
            State: address.state || "",
            zipCode: address.postalCode || "",
            ZipCode: address.postalCode || "",
            isDefault: address.isDefault
        }));
        return payload;
    };

    const handleSaveProfile = async (e: any) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload = buildPayload();
            await ( apiClient as any).put(`StoreBusinessPartners/${profile.cardCode}`, payload);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAddresses = async () => {
        setIsSaving(true);
        try {
            const payload = buildPayload();
            await ( apiClient as any).put(`StoreBusinessPartners/${profile.cardCode}`, payload);
            toast.success("Addresses updated successfully!");
        } catch (error) {
            toast.error("Failed to update addresses");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddAddress = () => {
        setAddresses((prev) => [
            ...prev,
            {
                id: `address-${Date.now()}`,
                type: "Address",
                street: "",
                city: "",
                country: "",
                state: "",
                postalCode: "",
                isDefault: prev.length === 0
            }
        ]);
    };

    const handleAddressChange = (index: any, field: any, value: any) => {
        setAddresses((prev) => prev.map((addr, i) => (i === index ? { ...addr, [field]: value } : addr)));
    };

    const handleDeleteAddress = (index: any) => {
        setAddresses((prev) => {
            const next = prev.filter((_, i) => i !== index);
            if (next.length > 0 && !next.some((addr) => addr.isDefault)) {
                next[0].isDefault = true;
            }
            return [...next];
        });
    };

    const handleSetDefaultAddress = (index: any) => {
        setAddresses((prev) => prev.map((addr, i) => ({ ...addr, isDefault: i === index })));
    };

    const handleSavePassword = async (e: any) => {
        e.preventDefault();

        if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
            toast.error("Please fill in all password fields");
            return;
        }

        if (security.newPassword !== security.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (security.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        setIsSaving(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast.success("Password updated successfully!");
            setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error("Failed to update password");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePreferences = async (e: any) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast.success("Preferences updated successfully!");
        } catch (error) {
            toast.error("Failed to update preferences");
        } finally {
            setIsSaving(false);
        }
    };

    const InputField = ({ label, name, type = "text", placeholder, value, onChange, disabled = false }: any) => (
        <div className="sf-form-group">
            <label className="sf-label">{label}</label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="sf-input sf-input--lg"
                style={{ opacity: disabled ? 0.65 : 1 }}
            />
        </div>
    );

    const ToggleSwitch = ({ checked, onChange, name }: any) => (
        <label style={{
            position: "relative",
            display: "inline-block",
            width: "52px",
            height: "28px",
            flexShrink: 0,
            cursor: "pointer"
        }}>
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: checked ? "#1a5c38" : "#dfe4ea",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRadius: "28px",
                boxShadow: checked ? "0 2px 8px rgba(26, 92, 56, 0.25)" : "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}>
                <span style={{
                    position: "absolute",
                    content: "",
                    height: "22px",
                    width: "22px",
                    left: checked ? "26px" : "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    borderRadius: "50%",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)"
                }} />
            </span>
        </label>
    );

    const PreferenceRow = ({ title, description, checked, onChange, name }: any) => (
        <div className="sf-form-group">
            <div className="sf-card--hoverable" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                borderRadius: "12px",
                border: "2px solid #f0f2f5",
                background: "white",
                transition: "var(--sf-transition)"
            }}>
                <div>
                    <p className="sf-fw-600" style={{ color: "#253d4e", fontSize: "15px", margin: "0 0 4px 0" }}>
                        {title}
                    </p>
                    <p className="sf-text-muted" style={{ fontSize: "13px", margin: 0, lineHeight: "1.5" }}>
                        {description}
                    </p>
                </div>
                <ToggleSwitch checked={checked} onChange={onChange} name={name} />
            </div>
        </div>
    );

    return (
        <>
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            <Layout parent="Pages" sub="Account" subChild="Settings">
                <section className="page-content pt-150 pb-150" style={{ background: "#f5f7fa" }}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-10 m-auto">
                                <div className="row">
                                    {/* Sidebar Menu */}
                                    <div className="col-md-3 mb-4">
                                        <div className="sf-card sf-card--flat" style={{ padding: "16px" }}>
                                            <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                {[
                                                    { id: 1, label: "Profile Info", icon: "👤" },
                                                    { id: 2, label: "Security", icon: "🔐" },
                                                    { id: 3, label: "Preferences", icon: "⚙️" },
                                                    { id: 4, label: "Addresses", icon: "📍" }
                                                ].map((item: any) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => setActiveTab(item.id)}
                                                        className={activeTab === item.id ? "sf-filter-tab sf-filter-tab--active" : "sf-filter-tab"}
                                                        style={{
                                                            textAlign: "left",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "10px",
                                                            width: "100%"
                                                        }}
                                                    >
                                                        <span style={{ fontSize: "18px" }}>{item.icon}</span>
                                                        <span>{item.label}</span>
                                                    </button>
                                                ))}
                                            </nav>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="col-md-9">
                                        <div className="tab-content account dashboard-content pl-50">
                                            {/* Profile Info Tab */}
                                            {activeTab === 1 && (
                                                <div className="sf-card" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                                                    <div className="sf-card__header sf-card__header--gradient">
                                                        <h3 className="sf-card__section-title sf-mb-0">Personal Information</h3>
                                                        <p className="sf-text-muted" style={{ fontSize: "13px", margin: "6px 0 0 0" }}>
                                                            Update your personal details and contact information
                                                        </p>
                                                    </div>
                                                    <div className="sf-card__body--lg">
                                                        {loadingProfile ? (
                                                            <LoadingSpinner text="Loading profile..." />
                                                        ) : (
                                                            <form onSubmit={handleSaveProfile}>
                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <InputField
                                                                            label="Customer Name"
                                                                            name="cardName"
                                                                            value={profile.cardName}
                                                                            onChange={handleProfileChange}
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <InputField
                                                                            label="Customer Code"
                                                                            name="cardCode"
                                                                            value={profile.cardCode}
                                                                            onChange={handleProfileChange}
                                                                            disabled={true}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <InputField
                                                                            label="Email Address"
                                                                            name="emailAddress"
                                                                            type="email"
                                                                            value={profile.emailAddress}
                                                                            onChange={handleProfileChange}
                                                                        />
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <InputField
                                                                            label="Phone Number"
                                                                            name="phone1"
                                                                            value={profile.phone1}
                                                                            onChange={handleProfileChange}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <InputField
                                                                    label="Address"
                                                                    name="address"
                                                                    value={profile.address}
                                                                    onChange={handleProfileChange}
                                                                />

                                                                <div className="sf-divider sf-flex-end">
                                                                    <button type="button" className="sf-btn sf-btn--outline-gray sf-btn--lg">
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        type="submit"
                                                                        disabled={isSaving}
                                                                        className="sf-btn sf-btn--green sf-btn--lg"
                                                                    >
                                                                        {isSaving ? "Saving..." : "Save Changes"}
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Security Tab */}
                                            {activeTab === 2 && (
                                                <div className="sf-card" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                                                    <div className="sf-card__header sf-card__header--gradient">
                                                        <h3 className="sf-card__section-title sf-mb-0">Change Password</h3>
                                                        <p className="sf-text-muted" style={{ fontSize: "13px", margin: "6px 0 0 0" }}>
                                                            Secure your account with a strong password
                                                        </p>
                                                    </div>
                                                    <div className="sf-card__body--lg">
                                                        <form onSubmit={handleSavePassword}>
                                                            <InputField
                                                                label="Current Password"
                                                                name="currentPassword"
                                                                type="password"
                                                                placeholder="Enter current password"
                                                                value={security.currentPassword}
                                                                onChange={handleSecurityChange}
                                                            />

                                                            <InputField
                                                                label="New Password"
                                                                name="newPassword"
                                                                type="password"
                                                                placeholder="Enter new password (min 8 characters)"
                                                                value={security.newPassword}
                                                                onChange={handleSecurityChange}
                                                            />

                                                            <InputField
                                                                label="Confirm Password"
                                                                name="confirmPassword"
                                                                type="password"
                                                                placeholder="Confirm new password"
                                                                value={security.confirmPassword}
                                                                onChange={handleSecurityChange}
                                                            />

                                                            <div className="sf-alert sf-alert--warning sf-mb-6" style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                                                                <span style={{ fontSize: "18px" }}>💡</span>
                                                                <div>
                                                                    <strong style={{ display: "block", marginBottom: "4px" }}>Security Tip:</strong>
                                                                    Use a strong password with uppercase, lowercase, numbers, and special characters.
                                                                </div>
                                                            </div>

                                                            <div className="sf-divider sf-flex-end">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                                                                    className="sf-btn sf-btn--outline-gray sf-btn--lg"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    disabled={isSaving}
                                                                    className="sf-btn sf-btn--green sf-btn--lg"
                                                                >
                                                                    {isSaving ? "Updating..." : "Update Password"}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Preferences Tab */}
                                            {activeTab === 3 && (
                                                <div className="sf-card" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                                                    <div className="sf-card__header sf-card__header--gradient">
                                                        <h3 className="sf-card__section-title sf-mb-0">Preferences & Notifications</h3>
                                                        <p className="sf-text-muted" style={{ fontSize: "13px", margin: "6px 0 0 0" }}>
                                                            Manage your communication preferences
                                                        </p>
                                                    </div>
                                                    <div className="sf-card__body--lg">
                                                        <form onSubmit={handleSavePreferences}>
                                                            <PreferenceRow
                                                                title="Newsletter"
                                                                description="Receive our newsletter with new deals and updates"
                                                                checked={preferences.newsletter}
                                                                onChange={handlePreferenceChange}
                                                                name="newsletter"
                                                            />
                                                            <PreferenceRow
                                                                title="Order Notifications"
                                                                description="Get updates about your orders via email"
                                                                checked={preferences.notifications}
                                                                onChange={handlePreferenceChange}
                                                                name="notifications"
                                                            />
                                                            <PreferenceRow
                                                                title="Product Updates"
                                                                description="Be notified when products you like are back in stock"
                                                                checked={preferences.productUpdates}
                                                                onChange={handlePreferenceChange}
                                                                name="productUpdates"
                                                            />
                                                            <PreferenceRow
                                                                title="Promotional Offers"
                                                                description="Receive exclusive promotions and special offers"
                                                                checked={preferences.promotions}
                                                                onChange={handlePreferenceChange}
                                                                name="promotions"
                                                            />

                                                            <div className="sf-form-group" style={{ marginBottom: "32px" }}>
                                                                <label className="sf-label">Language</label>
                                                                <select
                                                                    name="language"
                                                                    value={preferences.language}
                                                                    onChange={handlePreferenceChange}
                                                                    className="sf-input sf-input--lg"
                                                                    style={{ cursor: "pointer" }}
                                                                >
                                                                    <option value="en">English</option>
                                                                    <option value="es">Spanish</option>
                                                                    <option value="fr">French</option>
                                                                </select>
                                                            </div>

                                                            <div className="sf-divider sf-flex-end">
                                                                <button type="button" className="sf-btn sf-btn--outline-gray sf-btn--lg">
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    disabled={isSaving}
                                                                    className="sf-btn sf-btn--green sf-btn--lg"
                                                                >
                                                                    {isSaving ? "Saving..." : "Save Preferences"}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Addresses Tab */}
                                            {activeTab === 4 && (
                                                <div className="sf-card" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                                                    <div className="sf-card__header sf-card__header--gradient" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <h3 className="sf-card__section-title sf-mb-0">Saved Addresses</h3>
                                                            <p className="sf-text-muted" style={{ fontSize: "13px", margin: "6px 0 0 0" }}>
                                                                Manage your delivery addresses
                                                            </p>
                                                        </div>
                                                        <button
                                                            className="sf-btn sf-btn--green sf-btn--md"
                                                            onClick={handleAddAddress}
                                                        >
                                                            <span style={{ fontSize: "16px", lineHeight: "1" }}>+</span>
                                                            <span>Add Address</span>
                                                        </button>
                                                    </div>
                                                    <div className="sf-card__body--lg">
                                                        {loadingProfile ? (
                                                            <LoadingSpinner text="Loading addresses..." />
                                                        ) : (
                                                            <>
                                                                {addresses.length === 0 && (
                                                                    <div className="sf-empty">
                                                                        <p className="sf-empty__text">No addresses saved yet.</p>
                                                                    </div>
                                                                )}
                                                                {addresses.map((address, index) => (
                                                                    <div key={address.id} style={{
                                                                        background: address.isDefault ? "var(--sf-green-50)" : "white",
                                                                        borderRadius: "12px",
                                                                        padding: "24px",
                                                                        marginBottom: "16px",
                                                                        border: address.isDefault ? "2px solid var(--sf-green-500)" : "2px solid #e8ecef",
                                                                        position: "relative",
                                                                        transition: "var(--sf-transition)"
                                                                    }}>
                                                                        {address.isDefault && (
                                                                            <span className="sf-badge sf-badge--green" style={{
                                                                                position: "absolute",
                                                                                top: "-12px",
                                                                                right: "20px",
                                                                                boxShadow: "0 2px 8px rgba(26, 92, 56, 0.3)"
                                                                            }}>
                                                                                DEFAULT
                                                                            </span>
                                                                        )}
                                                                        <div className="row">
                                                                            <div className="col-md-6">
                                                                                <InputField
                                                                                    label="Address Name"
                                                                                    name="type"
                                                                                    value={address.type}
                                                                                    onChange={(e: any) => handleAddressChange(index, "type", e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-6">
                                                                                <InputField
                                                                                    label="Street"
                                                                                    name="street"
                                                                                    value={address.street}
                                                                                    onChange={(e: any) => handleAddressChange(index, "street", e.target.value)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="row">
                                                                            <div className="col-md-4">
                                                                                <InputField
                                                                                    label="City"
                                                                                    name="city"
                                                                                    value={address.city}
                                                                                    onChange={(e: any) => handleAddressChange(index, "city", e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-4">
                                                                                <InputField
                                                                                    label="Country"
                                                                                    name="country"
                                                                                    value={address.country}
                                                                                    onChange={(e: any) => handleAddressChange(index, "country", e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-4">
                                                                                <InputField
                                                                                    label="Postal Code"
                                                                                    name="postalCode"
                                                                                    value={address.postalCode}
                                                                                    onChange={(e: any) => handleAddressChange(index, "postalCode", e.target.value)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="sf-divider" style={{ display: "flex", gap: "10px" }}>
                                                                            <button
                                                                                type="button"
                                                                                className="sf-btn sf-btn--sm"
                                                                                style={{
                                                                                    background: address.isDefault ? "#e8f5ed" : "var(--sf-green-50)",
                                                                                    border: "2px solid var(--sf-green-200)",
                                                                                    color: "var(--sf-green-500)",
                                                                                    opacity: address.isDefault ? 0.6 : 1
                                                                                }}
                                                                                onClick={() => !address.isDefault && handleSetDefaultAddress(index)}
                                                                                disabled={address.isDefault}
                                                                            >
                                                                                {address.isDefault ? "✓ Default" : "Set Default"}
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="sf-btn sf-btn--sm"
                                                                                style={{
                                                                                    background: "white",
                                                                                    border: "2px solid #fee2e2",
                                                                                    color: "#dc2626"
                                                                                }}
                                                                                onClick={() => handleDeleteAddress(index)}
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <div className="sf-divider" style={{ display: "flex", justifyContent: "flex-end" }}>
                                                                    <button
                                                                        type="button"
                                                                        disabled={isSaving}
                                                                        className="sf-btn sf-btn--green sf-btn--lg"
                                                                        onClick={handleSaveAddresses}
                                                                    >
                                                                        {isSaving ? "Saving..." : "Save Addresses"}
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    );
};

export default ProfileSettings;
