import { useState, useEffect } from "react";
import { Save, Bell, Lock, Globe, Mail, Palette, CreditCard, Eye, EyeOff, Copy, Check, X, ChevronDown, ChevronUp, Loader2, ExternalLink, Plus, Minus, Filter, Calendar } from "lucide-react";
import { useAppearance } from "../contexts/AppearanceContext";
import {
  getGeneralSettings,
  updateGeneralSettings,
  getEmailSettings,
  updateEmailSettings,
  sendTestEmail,
  getSecuritySettings,
  updatePassword,
  toggle2FA,
  getLoginHistory,
  getAppearanceSettings,
  updateAppearanceSettings,
  getPaymentGateways,
  connectPaymentGateway,
  disconnectPaymentGateway,
  getNotificationSettings,
  updateNotificationSettings,
} from "../api";

type SettingsTab = "general" | "notifications" | "security" | "payments" | "email" | "appearance";

interface PaymentGateway {
  id: string;
  name: string;
  logo: string;
  status: "connected" | "disconnected";
  environment?: "sandbox" | "live";
}

interface Transaction {
  id: string;
  user: string;
  amount: string;
  status: "success" | "failed" | "pending";
  gateway: string;
  date: string;
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const { settings: appearanceSettings, updateSettings: updateAppearance } = useAppearance();

  // Loading and Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [tabLoading, setTabLoading] = useState<{ [key: string]: boolean }>({});

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "",
    adminEmail: "",
    contactEmail: "",
    phoneNumber: "",
    timezone: "",
    language: "",
    address: "",
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    sessionTimeout: "30",
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    senderName: "",
    senderEmail: "",
  });

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState({
    newOrders: false,
    newUsers: false,
    reviews: false,
    dailySummary: false,
    weeklyAnalytics: false,
    maintenance: false,
  });

  // Appearance Settings State
  const [appearanceForm, setAppearanceForm] = useState({
    primaryColor: "",
    secondaryColor: "",
    darkMode: false,
    logo: "",
    favicon: "",
  });

  const [loginHistory, setLoginHistory] = useState([
    { date: "", ip: "", device: "", location: "" },
  ]);

  // Payment Gateway States
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [disableModal, setDisableModal] = useState<PaymentGateway | null>(null);
  const [logsModal, setLogsModal] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const [gatewayForm, setGatewayForm] = useState({
    publicKey: "",
    secretKey: "",
    environment: "sandbox" as "sandbox" | "live",
    currencies: ["USD"],
    recurringBilling: false,
    webhooksEnabled: true,
    transactionFee: "",
    retryAttempts: 3,
    minCharge: "",
    maxCharge: "",
  });

  const [logFilters, setLogFilters] = useState({
    dateFrom: "",
    dateTo: "",
    status: "all",
    gateway: "all",
  });

  const transactions: Transaction[] = [
    { id: "TXN-1234", user: "Sarah Johnson", amount: "$49.99", status: "success", gateway: "Stripe", date: "2026-03-03 10:30 AM" },
    { id: "TXN-1235", user: "Michael Chen", amount: "$29.99", status: "success", gateway: "Stripe", date: "2026-03-03 09:15 AM" },
    { id: "TXN-1236", user: "Emma Williams", amount: "$39.99", status: "failed", gateway: "Stripe", date: "2026-03-02 04:20 PM" },
    { id: "TXN-1237", user: "James Brown", amount: "$19.99", status: "pending", gateway: "Stripe", date: "2026-03-02 02:10 PM" },
    { id: "TXN-1238", user: "Lisa Anderson", amount: "$49.99", status: "success", gateway: "Stripe", date: "2026-03-01 11:45 AM" },
  ];

  const tabs = [
    { id: "general" as SettingsTab, label: "General", icon: Globe },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { id: "security" as SettingsTab, label: "Security", icon: Lock },
    { id: "payments" as SettingsTab, label: "Payment Gateways", icon: CreditCard },
    { id: "email" as SettingsTab, label: "Email", icon: Mail },
    { id: "appearance" as SettingsTab, label: "Appearance", icon: Palette },
  ];

  // Fetch data when tab changes
  useEffect(() => {
    const loadTabData = async () => {
      setError(null);
      setTabLoading(prev => ({ ...prev, [activeTab]: true }));

      try {
        if (activeTab === "general") {
          const response = await getGeneralSettings();
          const data = Array.isArray(response) ? response[0]
            : response.data ? response.data
            : response.general ? response.general
            : response;
          setGeneralSettings(data);
        } else if (activeTab === "notifications") {
          const response = await getNotificationSettings();
          const data = Array.isArray(response) ? response[0]
            : response.data ? response.data
            : response.notifications ? response.notifications
            : response;
          setEmailNotifications(data);
        } else if (activeTab === "security") {
          const response = await getSecuritySettings();
          const data = Array.isArray(response) ? response[0]
            : response.data ? response.data
            : response.security ? response.security
            : response;
          setSecuritySettings(prev => ({ ...prev, ...data, currentPassword: "", newPassword: "", confirmPassword: "" }));
          try {
            const history = await getLoginHistory();
            setLoginHistory(Array.isArray(history) ? history : []);
          } catch { /* login history optional */ }
        } else if (activeTab === "email") {
          const response = await getEmailSettings();
          const data = Array.isArray(response) ? response[0]
            : response.data ? response.data
            : response.email ? response.email
            : response;
          setEmailSettings(data);
        } else if (activeTab === "appearance") {
          const response = await getAppearanceSettings();
          const data = Array.isArray(response) ? response[0]
            : response.data ? response.data
            : response.appearance ? response.appearance
            : response;
          setAppearanceForm(data);
        } else if (activeTab === "payments") {
          const response = await getPaymentGateways();
          const data = Array.isArray(response) ? response
            : response.data ? response.data
            : response.gateways ? response.gateways
            : [];
          setGateways(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setTabLoading(prev => ({ ...prev, [activeTab]: false }));
      }
    };

    loadTabData();
  }, [activeTab]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // GENERAL SETTINGS
  const handleSaveGeneralSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateGeneralSettings(generalSettings);
      showSuccessMessage("General settings saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save general settings");
    } finally {
      setLoading(false);
    }
  };

  // NOTIFICATIONS SETTINGS
  const handleSaveNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateNotificationSettings(emailNotifications);
      showSuccessMessage("Notification preferences saved!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save notification settings");
    } finally {
      setLoading(false);
    }
  };

  // SECURITY SETTINGS - Update Password
  const handleUpdatePassword = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!securitySettings.currentPassword || !securitySettings.newPassword) {
      setError("Please fill in all password fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updatePassword({
        currentPassword: securitySettings.currentPassword,
        newPassword: securitySettings.newPassword,
      });
      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      showSuccessMessage("Password updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // SECURITY SETTINGS - Toggle 2FA
  const handleToggle2FA = async () => {
    setLoading(true);
    setError(null);
    try {
      await toggle2FA({ enabled: !securitySettings.twoFactorEnabled });
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled,
      }));
      showSuccessMessage(`Two-factor authentication ${!securitySettings.twoFactorEnabled ? "enabled" : "disabled"}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update 2FA settings");
    } finally {
      setLoading(false);
    }
  };

  // SECURITY SETTINGS - Save Session Timeout
  const handleSaveSecuritySettings = async () => {
    setLoading(true);
    setError(null);
    try {
      await toggle2FA({ enabled: securitySettings.twoFactorEnabled });
      showSuccessMessage("Security settings saved!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save security settings");
    } finally {
      setLoading(false);
    }
  };

  // EMAIL SETTINGS
  const handleSaveEmailSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateEmailSettings(emailSettings);
      showSuccessMessage("Email settings saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save email settings");
    } finally {
      setLoading(false);
    }
  };

  // TEST EMAIL
  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    setError(null);
    try {
      await sendTestEmail();
      showSuccessMessage("Test email sent successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send test email");
    } finally {
      setTestingEmail(false);
    }
  };

  // APPEARANCE SETTINGS
  const handleSaveAppearance = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateAppearanceSettings(appearanceForm);
      // Update the AppearanceContext locally as well
      updateAppearance({
        primaryColor: appearanceForm.primaryColor,
        secondaryColor: appearanceForm.secondaryColor,
        darkMode: appearanceForm.darkMode,
        logo: appearanceForm.logo,
        favicon: appearanceForm.favicon,
      });
      showSuccessMessage("Appearance settings saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save appearance settings");
    } finally {
      setLoading(false);
    }
  };

  // PAYMENT GATEWAYS
  const handleOpenDrawer = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    if (gateway.status === "connected") {
      setGatewayForm({
        ...gatewayForm,
        publicKey: "pk_live_xxxxxxxxxxxx",
        secretKey: "sk_live_xxxxxxxxxxxx",
        environment: gateway.environment || "sandbox",
      });
    } else {
      setGatewayForm({
        publicKey: "",
        secretKey: "",
        environment: "sandbox",
        currencies: ["USD"],
        recurringBilling: false,
        webhooksEnabled: true,
        transactionFee: "",
        retryAttempts: 3,
        minCharge: "",
        maxCharge: "",
      });
    }
    setDrawerOpen(true);
  };

  const handleSaveGateway = async () => {
    if (!selectedGateway) return;

    setSaving(true);
    setShowError(false);

    try {
      if (!gatewayForm.publicKey || !gatewayForm.secretKey) {
        setShowError(true);
        setSaving(false);
        return;
      }

      await connectPaymentGateway(selectedGateway.id, gatewayForm);

      setGateways(gateways.map(g =>
        g.id === selectedGateway.id
          ? { ...g, status: "connected", environment: gatewayForm.environment }
          : g
      ));

      setSaving(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setDrawerOpen(false);
      }, 2000);
    } catch (err) {
      setShowError(true);
      setSaving(false);
    }
  };

  const handleDisableGateway = async () => {
    if (!disableModal) return;

    try {
      await disconnectPaymentGateway(disableModal.id);
      setGateways(gateways.map(g =>
        g.id === disableModal.id
          ? { ...g, status: "disconnected" }
          : g
      ));
      setDisableModal(null);
      showSuccessMessage(`${disableModal.name} disconnected successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect gateway");
    }
  };

  const copyWebhook = () => {
    if (!selectedGateway) return;
    navigator.clipboard.writeText(`https://api.luminguide.com/webhooks/${selectedGateway.id}`);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  };

  const toggleCurrency = (currency: string) => {
    if (gatewayForm.currencies.includes(currency)) {
      setGatewayForm({
        ...gatewayForm,
        currencies: gatewayForm.currencies.filter(c => c !== currency),
      });
    } else {
      setGatewayForm({
        ...gatewayForm,
        currencies: [...gatewayForm.currencies, currency],
      });
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
          Settings
        </h1>
        <p className="text-[#6b6b88]">Manage your admin panel preferences</p>
      </div>

      {/* Global Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Global Success Message */}
      {successMessage && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-[#e1e1e7] bg-white p-2 shadow-sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tabLoading[tab.id]}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors disabled:opacity-50 ${
                    activeTab === tab.id
                      ? "bg-[#0048ff] text-white"
                      : "text-[#6b6b88] hover:bg-[#f5f6fa]"
                  }`}
                >
                  <tab.icon className="size-5" />
                  {tab.label}
                  {tabLoading[tab.id] && <Loader2 className="ml-auto size-4 animate-spin" />}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-6 lg:col-span-3">
          {/* Loading State */}
          {tabLoading[activeTab] && (
            <div className="rounded-xl border border-[#e1e1e7] bg-white p-12 shadow-sm flex justify-center items-center">
              <Loader2 className="size-8 animate-spin text-[#0048ff]" />
            </div>
          )}

          {/* General Tab */}
          {activeTab === "general" && !tabLoading[activeTab] && (
            <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-[#090838]">General Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Platform Name</label>
                  <input
                    type="text"
                    value={generalSettings.platformName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Admin Email</label>
                    <input
                      type="email"
                      value={generalSettings.adminEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, adminEmail: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Contact Email</label>
                    <input
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Phone Number</label>
                  <input
                    type="tel"
                    value={generalSettings.phoneNumber}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, phoneNumber: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Timezone</label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    >
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-6 (Central Time)</option>
                      <option>UTC-7 (Mountain Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+5:30 (India)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Language</label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Hindi</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Business Address</label>
                  <textarea
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg border border-[#e1e1e7] px-6 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGeneralSettings}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && !tabLoading[activeTab] && (
            <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-[#090838]">Notification Preferences</h2>
              <div className="space-y-4">
                {Object.entries({
                  newOrders: "Email notifications for new orders",
                  newUsers: "Email notifications for new users",
                  reviews: "Email notifications for reviews",
                  dailySummary: "Daily summary report",
                  weeklyAnalytics: "Weekly analytics report",
                  maintenance: "Maintenance updates",
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-sm text-[#6b6b88]">{label}</span>
                    <input
                      type="checkbox"
                      checked={emailNotifications[key as keyof typeof emailNotifications]}
                      onChange={(e) =>
                        setEmailNotifications({ ...emailNotifications, [key]: e.target.checked })
                      }
                      className="size-5 rounded border-[#e1e1e7] text-[#0048ff] focus:ring-[#0048ff]"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && !tabLoading[activeTab] && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-[#090838]">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Current Password</label>
                    <input
                      type="password"
                      value={securitySettings.currentPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">New Password</label>
                    <input
                      type="password"
                      value={securitySettings.newPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Confirm New Password</label>
                    <input
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdatePassword}
                      disabled={loading}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#090838]">Two-Factor Authentication</h2>
                <p className="mb-6 text-sm text-[#6b6b88]">Add an extra layer of security to your account</p>
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#090838]">Enable 2FA</p>
                    <p className="text-sm text-[#6b6b88]">Require authentication code for login</p>
                  </div>
                  <button
                    onClick={handleToggle2FA}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      securitySettings.twoFactorEnabled ? "bg-[#0048ff]" : "bg-gray-300"
                    } disabled:opacity-50`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        securitySettings.twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Session Management */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-[#090838]">Session Management</h2>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Auto Logout After (minutes)</label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="never">Never</option>
                  </select>
                </div>
                <button
                  onClick={handleSaveSecuritySettings}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Changes
                </button>
              </div>

              {/* Login History */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-[#090838]">Login History</h2>
                <div className="space-y-3">
                  {loginHistory.length > 0 ? (
                    loginHistory.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg border border-[#e1e1e7] p-4">
                        <div className="flex flex-1 items-center gap-4">
                          <div>
                            <p className="text-sm font-medium text-[#090838]">{entry.device}</p>
                            <p className="text-xs text-[#6b6b88]">{entry.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#090838]">{entry.ip}</p>
                          <p className="text-xs text-[#6b6b88]">{entry.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#6b6b88]">No login history available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === "email" && !tabLoading[activeTab] && (
            <div className="space-y-6">
              {/* Email Configuration */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-[#090838]">Email Configuration</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#090838]">SMTP Host</label>
                      <input
                        type="text"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#090838]">SMTP Port</label>
                      <input
                        type="text"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                        className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">SMTP Username</label>
                    <input
                      type="text"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">SMTP Password</label>
                    <input
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#090838]">Sender Name</label>
                      <input
                        type="text"
                        value={emailSettings.senderName}
                        onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                        className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#090838]">Sender Email</label>
                      <input
                        type="email"
                        value={emailSettings.senderEmail}
                        onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })}
                        className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={handleSendTestEmail}
                    disabled={testingEmail}
                    className="flex items-center gap-2 rounded-lg border border-[#0048ff] px-6 py-2 text-sm font-medium text-[#0048ff] hover:bg-blue-50 disabled:opacity-50"
                  >
                    {testingEmail ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                    Send Test Email
                  </button>
                  <button
                    onClick={handleSaveEmailSettings}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && !tabLoading[activeTab] && (
            <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-[#090838]">Appearance Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Primary Color</label>
                    <input
                      type="color"
                      value={appearanceForm.primaryColor}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, primaryColor: e.target.value })}
                      className="h-10 w-full rounded-lg border border-[#e1e1e7]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Secondary Color</label>
                    <input
                      type="color"
                      value={appearanceForm.secondaryColor}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, secondaryColor: e.target.value })}
                      className="h-10 w-full rounded-lg border border-[#e1e1e7]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Logo URL</label>
                  <input
                    type="text"
                    value={appearanceForm.logo}
                    onChange={(e) => setAppearanceForm({ ...appearanceForm, logo: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Favicon URL</label>
                  <input
                    type="text"
                    value={appearanceForm.favicon}
                    onChange={(e) => setAppearanceForm({ ...appearanceForm, favicon: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#090838]">Dark Mode</span>
                  <button
                    onClick={() => setAppearanceForm({ ...appearanceForm, darkMode: !appearanceForm.darkMode })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appearanceForm.darkMode ? "bg-[#0048ff]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appearanceForm.darkMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </label>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg border border-[#e1e1e7] px-6 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAppearance}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Gateways Tab */}
          {activeTab === "payments" && !tabLoading[activeTab] && (
            <div className="space-y-6">
              {/* Connected Gateways */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-[#090838]">Payment Gateways</h2>
                <div className="grid grid-cols-3 gap-4">
                  {gateways.map((gateway) => (
                    <div
                      key={gateway.id}
                      className="flex flex-col justify-between rounded-lg border border-[#e1e1e7] p-4 transition-all hover:border-[#0048ff]"
                    >
                      <div>
                        <img src={gateway.logo} alt={gateway.name} className="mb-4 h-8 object-contain" />
                        <p className="mb-2 text-sm font-medium text-[#090838]">{gateway.name}</p>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            gateway.status === "connected"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {gateway.status === "connected" ? "Connected" : "Disconnected"}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleOpenDrawer(gateway)}
                          className="flex-1 rounded-lg bg-[#0048ff] px-3 py-2 text-xs font-medium text-white hover:bg-[#0036cc]"
                        >
                          {gateway.status === "connected" ? "Configure" : "Connect"}
                        </button>
                        {gateway.status === "connected" && (
                          <button
                            onClick={() => setDisableModal(gateway)}
                            className="rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Disconnect
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#090838]">Recent Transactions</h2>
                  <button
                    onClick={() => setLogsModal(!logsModal)}
                    className="flex items-center gap-2 text-sm text-[#0048ff] hover:underline"
                  >
                    <Filter className="size-4" />
                    Filters
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e1e1e7]">
                        <th className="px-4 py-3 text-left font-medium text-[#090838]">Transaction ID</th>
                        <th className="px-4 py-3 text-left font-medium text-[#090838]">User</th>
                        <th className="px-4 py-3 text-left font-medium text-[#090838]">Amount</th>
                        <th className="px-4 py-3 text-left font-medium text-[#090838]">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-[#090838]">Gateway</th>
                        <th className="px-4 py-3 text-left font-medium text-[#090838]">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#e1e1e7] hover:bg-[#f5f6fa]">
                          <td className="px-4 py-3 font-medium text-[#090838]">{tx.id}</td>
                          <td className="px-4 py-3 text-[#6b6b88]">{tx.user}</td>
                          <td className="px-4 py-3 font-medium text-[#090838]">{tx.amount}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                tx.status === "success"
                                  ? "bg-green-100 text-green-700"
                                  : tx.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#6b6b88]">{tx.gateway}</td>
                          <td className="px-4 py-3 text-[#6b6b88]">{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gateway Configuration Drawer */}
      {drawerOpen && selectedGateway && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-lg">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#e1e1e7] bg-white p-6">
              <h3 className="text-lg font-semibold text-[#090838]">
                {selectedGateway.status === "connected" ? "Configure" : "Connect"} {selectedGateway.name}
              </h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-[#6b6b88] hover:text-[#090838]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#090838]">Public Key</label>
                <input
                  type="text"
                  value={gatewayForm.publicKey}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, publicKey: e.target.value })}
                  placeholder="pk_live_xxxxxxxxxxxx"
                  className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#090838]">Secret Key</label>
                <div className="relative">
                  <input
                    type={showSecretKey ? "text" : "password"}
                    value={gatewayForm.secretKey}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, secretKey: e.target.value })}
                    placeholder="sk_live_xxxxxxxxxxxx"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 pr-10 focus:border-[#0048ff] focus:outline-none"
                  />
                  <button
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b88]"
                  >
                    {showSecretKey ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#090838]">Environment</label>
                <div className="flex gap-3">
                  {(["sandbox", "live"] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => setGatewayForm({ ...gatewayForm, environment: env })}
                      className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                        gatewayForm.environment === env
                          ? "bg-[#0048ff] text-white"
                          : "border border-[#e1e1e7] text-[#6b6b88] hover:border-[#0048ff]"
                      }`}
                    >
                      {env.charAt(0).toUpperCase() + env.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-[#090838]">Supported Currencies</label>
                <div className="space-y-2">
                  {["USD", "EUR", "GBP", "INR"].map((currency) => (
                    <button
                      key={currency}
                      onClick={() => toggleCurrency(currency)}
                      className={`block w-full rounded-lg border px-4 py-2 text-left text-sm transition-colors ${
                        gatewayForm.currencies.includes(currency)
                          ? "border-[#0048ff] bg-blue-50 text-[#0048ff]"
                          : "border-[#e1e1e7] text-[#6b6b88] hover:border-[#0048ff]"
                      }`}
                    >
                      {currency}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <button
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="flex w-full items-center gap-2 text-sm font-medium text-[#0048ff]"
              >
                {advancedOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                Advanced Settings
              </button>

              {advancedOpen && (
                <div className="space-y-4 border-t border-[#e1e1e7] pt-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Transaction Fee (%)</label>
                    <input
                      type="text"
                      value={gatewayForm.transactionFee}
                      onChange={(e) => setGatewayForm({ ...gatewayForm, transactionFee: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Retry Attempts</label>
                    <input
                      type="number"
                      value={gatewayForm.retryAttempts}
                      onChange={(e) => setGatewayForm({ ...gatewayForm, retryAttempts: parseInt(e.target.value) })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#090838]">Min Charge</label>
                      <input
                        type="text"
                        value={gatewayForm.minCharge}
                        onChange={(e) => setGatewayForm({ ...gatewayForm, minCharge: e.target.value })}
                        className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#090838]">Max Charge</label>
                      <input
                        type="text"
                        value={gatewayForm.maxCharge}
                        onChange={(e) => setGatewayForm({ ...gatewayForm, maxCharge: e.target.value })}
                        className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                      />
                    </div>
                  </div>
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#090838]">Recurring Billing</span>
                    <button
                      onClick={() => setGatewayForm({ ...gatewayForm, recurringBilling: !gatewayForm.recurringBilling })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        gatewayForm.recurringBilling ? "bg-[#0048ff]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          gatewayForm.recurringBilling ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#090838]">Webhooks Enabled</span>
                    <button
                      onClick={() => setGatewayForm({ ...gatewayForm, webhooksEnabled: !gatewayForm.webhooksEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        gatewayForm.webhooksEnabled ? "bg-[#0048ff]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          gatewayForm.webhooksEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </label>
                  {gatewayForm.webhooksEnabled && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#090838]">Webhook URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={`https://api.luminguide.com/webhooks/${selectedGateway.id}`}
                          readOnly
                          className="flex-1 rounded-lg border border-[#e1e1e7] bg-[#f5f6fa] px-4 py-2 text-[#090838]"
                        />
                        <button
                          onClick={copyWebhook}
                          className="rounded-lg border border-[#e1e1e7] px-3 py-2 text-[#6b6b88] hover:bg-[#f5f6fa]"
                        >
                          {webhookCopied ? <Check className="size-5 text-green-600" /> : <Copy className="size-5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  Gateway connected successfully!
                </div>
              )}
              {showError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Please fill in all required fields
                </div>
              )}

              <div className="flex gap-3 border-t border-[#e1e1e7] pt-6">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGateway}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Gateway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Gateway Modal */}
      {disableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-[#090838]">Disconnect Gateway?</h3>
            <p className="mb-6 text-sm text-[#6b6b88]">
              Are you sure you want to disconnect {disableModal.name}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDisableModal(null)}
                className="flex-1 rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleDisableGateway}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
