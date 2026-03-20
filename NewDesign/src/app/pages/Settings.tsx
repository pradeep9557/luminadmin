import { useState } from "react";
import { Save, Bell, Lock, Globe, Mail, Palette, CreditCard, Eye, EyeOff, Copy, Check, X, ChevronDown, ChevronUp, Loader2, ExternalLink, Plus, Minus, Filter, Calendar } from "lucide-react";
import { useAppearance } from "../contexts/AppearanceContext";

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
  
  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    platformName: "Lumin Guide",
    adminEmail: "admin@luminguide.com",
    contactEmail: "support@luminguide.com",
    phoneNumber: "+1 (555) 123-4567",
    timezone: "UTC-5 (Eastern Time)",
    language: "English",
    address: "123 Astrology Street, Mystic City, CA 90210",
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
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "admin@luminguide.com",
    smtpPassword: "",
    senderName: "Lumin Guide",
    senderEmail: "noreply@luminguide.com",
  });

  const [emailNotifications, setEmailNotifications] = useState({
    newOrders: true,
    newUsers: true,
    reviews: false,
    dailySummary: true,
    weeklyAnalytics: true,
    maintenance: true,
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [loginHistory] = useState([
    { date: "2026-03-03 10:30 AM", ip: "192.168.1.1", device: "Chrome on Windows", location: "New York, USA" },
    { date: "2026-03-02 09:15 AM", ip: "192.168.1.1", device: "Safari on MacOS", location: "New York, USA" },
    { date: "2026-03-01 08:45 AM", ip: "10.0.0.5", device: "Chrome on Windows", location: "New York, USA" },
  ]);

  // Payment Gateway States
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    { id: "stripe", name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg", status: "connected", environment: "live" },
    { id: "paypal", name: "PayPal", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg", status: "disconnected" },
    { id: "razorpay", name: "Razorpay", logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg", status: "disconnected" },
  ]);

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

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

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
    setSaving(true);
    setShowError(false);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!gatewayForm.publicKey || !gatewayForm.secretKey) {
      setShowError(true);
      setSaving(false);
      return;
    }

    setGateways(gateways.map(g => 
      g.id === selectedGateway?.id 
        ? { ...g, status: "connected", environment: gatewayForm.environment }
        : g
    ));

    setSaving(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setDrawerOpen(false);
    }, 2000);
  };

  const handleDisableGateway = () => {
    if (!disableModal) return;
    setGateways(gateways.map(g => 
      g.id === disableModal.id 
        ? { ...g, status: "disconnected" }
        : g
    ));
    setDisableModal(null);
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(`https://api.luminguide.com/webhooks/${selectedGateway?.id}`);
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-[#e1e1e7] bg-white p-2 shadow-sm">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#0048ff] text-white"
                      : "text-[#6b6b88] hover:bg-[#f5f6fa]"
                  }`}
                >
                  <tab.icon className="size-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-6 lg:col-span-3">
          {/* General Tab */}
          {activeTab === "general" && (
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
                    onClick={() => setGeneralSettings({
                      platformName: "Lumin Guide",
                      adminEmail: "admin@luminguide.com",
                      contactEmail: "support@luminguide.com",
                      phoneNumber: "+1 (555) 123-4567",
                      timezone: "UTC-5 (Eastern Time)",
                      language: "English",
                      address: "123 Astrology Street, Mystic City, CA 90210",
                    })}
                    className="rounded-lg border border-[#e1e1e7] px-6 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => showSuccessMessage("General settings saved successfully!")}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
                  >
                    <Save className="size-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
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
                  onClick={() => showSuccessMessage("Notification preferences saved!")}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
                >
                  <Save className="size-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
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
                      onClick={() => {
                        if (securitySettings.newPassword === securitySettings.confirmPassword) {
                          setSecuritySettings({ ...securitySettings, currentPassword: "", newPassword: "", confirmPassword: "" });
                          showSuccessMessage("Password changed successfully!");
                        } else {
                          alert("Passwords do not match!");
                        }
                      }}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
                    >
                      <Save className="size-4" />
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
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorEnabled}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: e.target.checked })}
                    className="size-5 rounded border-[#e1e1e7] text-[#0048ff] focus:ring-[#0048ff]"
                  />
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
                  onClick={() => showSuccessMessage("Security settings saved!")}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
                >
                  <Save className="size-4" />
                  Save Changes
                </button>
              </div>

              {/* Login History */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-[#090838]">Login History</h2>
                <div className="space-y-4">
                  {loginHistory.map((login, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border border-[#e1e1e7] p-4">
                      <div>
                        <p className="font-medium text-[#090838]">{login.device}</p>
                        <p className="text-sm text-[#6b6b88]">{login.ip} • {login.location}</p>
                      </div>
                      <p className="text-sm text-[#6b6b88]">{login.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment Gateway Tab - Existing Implementation */}
          {activeTab === "payments" && (
            <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-[#090838]">Payment Gateway Integration</h2>
              
              <div className="space-y-4">
                {gateways.map((gateway) => (
                  <div
                    key={gateway.id}
                    className={`rounded-xl border p-6 transition-all ${
                      gateway.status === "connected"
                        ? "border-green-200 bg-green-50"
                        : "border-[#e1e1e7] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg border border-[#e1e1e7] bg-white p-2">
                          <img src={gateway.logo} alt={gateway.name} className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#090838]">{gateway.name}</h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${
                                gateway.status === "connected"
                                  ? "text-green-600"
                                  : "text-[#6b6b88]"
                              }`}
                            >
                              {gateway.status === "connected" ? "Connected" : "Not Connected"}
                            </span>
                            {gateway.status === "connected" && gateway.environment && (
                              <span className="rounded-full bg-[#0048ff] px-2 py-0.5 text-xs font-medium text-white">
                                {gateway.environment}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {gateway.status === "connected" && (
                          <>
                            <button
                              onClick={() => setLogsModal(true)}
                              className="rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                            >
                              View Logs
                            </button>
                            <button
                              onClick={() => setDisableModal(gateway)}
                              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                            >
                              Disable
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenDrawer(gateway)}
                          className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
                        >
                          {gateway.status === "connected" ? "Configure" : "Connect"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === "email" && (
            <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-semibold text-[#090838]">Email Configuration</h2>
              <div className="space-y-6">
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
                    type="email"
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
                    placeholder="••••••••"
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
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Make sure to enable "Less secure app access" or use an App Password for Gmail accounts.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => showSuccessMessage("Test email sent successfully!")}
                    className="rounded-lg border border-[#e1e1e7] px-6 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                  >
                    Send Test Email
                  </button>
                  <button
                    onClick={() => showSuccessMessage("Email settings saved successfully!")}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
                  >
                    <Save className="size-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              {/* Brand Colors */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#090838]">Brand Colors</h2>
                  <button
                    onClick={() => {
                      updateAppearance({ 
                        primaryColor: '#0048ff',
                        secondaryColor: '#090838'
                      });
                      showSuccessMessage("Colors reset to default!");
                    }}
                    className="flex items-center gap-2 rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                  >
                    <X className="size-4" />
                    Reset Colors
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Primary Color</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={appearanceSettings.primaryColor}
                        onChange={(e) => updateAppearance({ primaryColor: e.target.value })}
                        className="size-12 rounded-lg border border-[#e1e1e7] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={appearanceSettings.primaryColor}
                        onChange={(e) => updateAppearance({ primaryColor: e.target.value })}
                        className="flex-1 rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">Secondary Color</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={appearanceSettings.secondaryColor}
                        onChange={(e) => updateAppearance({ secondaryColor: e.target.value })}
                        className="size-12 rounded-lg border border-[#e1e1e7] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={appearanceSettings.secondaryColor}
                        onChange={(e) => updateAppearance({ secondaryColor: e.target.value })}
                        className="flex-1 rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-[#090838]">Branding</h2>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-[#090838]">Logo URL</label>
                      {appearanceSettings.logo && (
                        <button
                          onClick={() => {
                            updateAppearance({ logo: '' });
                            showSuccessMessage("Logo removed!");
                          }}
                          className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                        >
                          <X className="size-3" />
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={appearanceSettings.logo}
                      onChange={(e) => updateAppearance({ logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                    {appearanceSettings.logo && (
                      <div className="mt-3 flex items-center gap-3 rounded-lg border border-[#e1e1e7] p-3">
                        <img src={appearanceSettings.logo} alt="Logo Preview" className="h-12 object-contain" onError={(e) => e.currentTarget.style.display = "none"} />
                        <p className="text-sm text-[#6b6b88]">Logo Preview</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-[#090838]">Favicon URL</label>
                      {appearanceSettings.favicon && (
                        <button
                          onClick={() => {
                            updateAppearance({ favicon: '' });
                            showSuccessMessage("Favicon removed!");
                          }}
                          className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                        >
                          <X className="size-3" />
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={appearanceSettings.favicon}
                      onChange={(e) => updateAppearance({ favicon: e.target.value })}
                      placeholder="https://example.com/favicon.ico"
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Mode */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#090838]">Theme Mode</h2>
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#090838]">Dark Mode</p>
                    <p className="text-sm text-[#6b6b88]">Enable dark theme for the admin panel</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={appearanceSettings.darkMode}
                    onChange={(e) => updateAppearance({ darkMode: e.target.checked })}
                    className="size-5 rounded border-[#e1e1e7] text-[#0048ff] focus:ring-[#0048ff]"
                  />
                </label>
              </div>

              {/* Live Preview */}
              <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#090838]">Live Preview</h2>
                <p className="mb-4 text-sm text-[#6b6b88]">
                  Changes apply instantly! Check your sidebar and buttons to see the new colors.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border border-[#e1e1e7] p-4">
                    <div 
                      className="size-12 rounded-lg"
                      style={{ backgroundColor: appearanceSettings.primaryColor }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-[#090838]">Primary Color</p>
                      <p className="text-xs text-[#6b6b88]">Used for buttons and accents</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-[#e1e1e7] p-4">
                    <div 
                      className="size-12 rounded-lg"
                      style={{ backgroundColor: appearanceSettings.secondaryColor }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-[#090838]">Secondary Color</p>
                      <p className="text-xs text-[#6b6b88]">Used for sidebar and headers</p>
                    </div>
                  </div>
                  <button
                    style={{ 
                      background: `linear-gradient(to right, ${appearanceSettings.primaryColor}, ${appearanceSettings.secondaryColor})` 
                    }}
                    className="w-full rounded-lg px-6 py-3 text-sm font-medium text-white"
                  >
                    Preview Button Style
                  </button>
                </div>
              </div>

              {/* Info Notice */}
              <div className="flex justify-end">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-900">
                    💡 <strong>Tip:</strong> Changes are saved automatically and persist across sessions. The "Save Changes" button confirms your preferences.
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all appearance settings to default? This will remove your custom colors, logo, favicon, and dark mode preferences.')) {
                      updateAppearance({ 
                        primaryColor: '#0048ff',
                        secondaryColor: '#090838',
                        logo: '',
                        favicon: '',
                        darkMode: false
                      });
                      showSuccessMessage("All appearance settings reset to default!");
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-6 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  <X className="size-4" />
                  Reset All to Default
                </button>
                <button
                  onClick={() => showSuccessMessage("Appearance settings saved successfully! Changes are now live.")}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
                >
                  <Save className="size-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-8 right-8 z-50 rounded-lg border border-green-200 bg-green-50 px-6 py-4 shadow-lg">
          <p className="text-sm font-medium text-green-900">{successMessage}</p>
        </div>
      )}

      {/* Payment Gateway Drawer - (keeping existing code from here down) */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setDrawerOpen(false)}></div>

          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e1e1e7] bg-white p-6">
              <div>
                <h2 className="text-xl font-semibold text-[#090838]">
                  {selectedGateway?.status === "connected" ? "Configure" : "Connect"} {selectedGateway?.name}
                </h2>
                <p className="text-sm text-[#6b6b88]">Set up your payment gateway credentials</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 hover:bg-[#f5f6fa]">
                <X className="size-5 text-[#6b6b88]" />
              </button>
            </div>

            <div className="p-6">
              {showSuccess && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                  <Check className="size-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Successfully connected!</p>
                    <p className="text-sm text-green-700">Your payment gateway is now active.</p>
                  </div>
                </div>
              )}

              {showError && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <X className="size-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Connection failed</p>
                    <p className="text-sm text-red-700">Please check your credentials and try again.</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Public API Key *</label>
                  <input
                    type="text"
                    value={gatewayForm.publicKey}
                    onChange={(e) => setGatewayForm({ ...gatewayForm, publicKey: e.target.value })}
                    placeholder="pk_test_xxxxxxxxxxxx"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Secret API Key *</label>
                  <div className="relative">
                    <input
                      type={showSecretKey ? "text" : "password"}
                      value={gatewayForm.secretKey}
                      onChange={(e) => setGatewayForm({ ...gatewayForm, secretKey: e.target.value })}
                      placeholder="sk_test_xxxxxxxxxxxx"
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 pr-10 focus:border-[#0048ff] focus:outline-none"
                    />
                    <button
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b88] hover:text-[#090838]"
                    >
                      {showSecretKey ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Webhook URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`https://api.luminguide.com/webhooks/${selectedGateway?.id}`}
                      readOnly
                      className="flex-1 rounded-lg border border-[#e1e1e7] bg-[#f5f6fa] px-4 py-2"
                    />
                    <button
                      onClick={copyWebhook}
                      className="flex items-center gap-2 rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                    >
                      {webhookCopied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-[#6b6b88]">
                    Add this webhook URL to your {selectedGateway?.name} dashboard
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Environment</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGatewayForm({ ...gatewayForm, environment: "sandbox" })}
                      className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                        gatewayForm.environment === "sandbox"
                          ? "border-[#0048ff] bg-[#0048ff] text-white"
                          : "border-[#e1e1e7] bg-white text-[#6b6b88] hover:bg-[#f5f6fa]"
                      }`}
                    >
                      Sandbox
                    </button>
                    <button
                      onClick={() => setGatewayForm({ ...gatewayForm, environment: "live" })}
                      className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                        gatewayForm.environment === "live"
                          ? "border-[#0048ff] bg-[#0048ff] text-white"
                          : "border-[#e1e1e7] bg-white text-[#6b6b88] hover:bg-[#f5f6fa]"
                      }`}
                    >
                      Live
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Supported Currencies</label>
                  <div className="flex flex-wrap gap-2">
                    {["USD", "EUR", "GBP", "INR", "AUD", "CAD"].map((currency) => (
                      <button
                        key={currency}
                        onClick={() => toggleCurrency(currency)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                          gatewayForm.currencies.includes(currency)
                            ? "border-[#0048ff] bg-[#0048ff] text-white"
                            : "border-[#e1e1e7] bg-white text-[#6b6b88] hover:bg-[#f5f6fa]"
                        }`}
                      >
                        {currency}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border border-[#e1e1e7] bg-[#f5f6fa] p-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#090838]">Enable Recurring Billing</p>
                      <p className="text-xs text-[#6b6b88]">Allow subscription and recurring payments</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={gatewayForm.recurringBilling}
                      onChange={(e) => setGatewayForm({ ...gatewayForm, recurringBilling: e.target.checked })}
                      className="size-5 rounded border-[#e1e1e7] text-[#0048ff] focus:ring-[#0048ff]"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#090838]">Enable Webhooks</p>
                      <p className="text-xs text-[#6b6b88]">Receive real-time payment notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={gatewayForm.webhooksEnabled}
                      onChange={(e) => setGatewayForm({ ...gatewayForm, webhooksEnabled: e.target.checked })}
                      className="size-5 rounded border-[#e1e1e7] text-[#0048ff] focus:ring-[#0048ff]"
                    />
                  </label>
                </div>

                <div className="rounded-lg border border-[#e1e1e7]">
                  <button
                    onClick={() => setAdvancedOpen(!advancedOpen)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-[#f5f6fa]"
                  >
                    <span className="text-sm font-medium text-[#090838]">Advanced Settings</span>
                    {advancedOpen ? <ChevronUp className="size-5 text-[#6b6b88]" /> : <ChevronDown className="size-5 text-[#6b6b88]" />}
                  </button>

                  {advancedOpen && (
                    <div className="space-y-4 border-t border-[#e1e1e7] p-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#090838]">Transaction Fee Override (%)</label>
                        <input
                          type="number"
                          value={gatewayForm.transactionFee}
                          onChange={(e) => setGatewayForm({ ...gatewayForm, transactionFee: e.target.value })}
                          placeholder="2.9"
                          step="0.1"
                          className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#090838]">Retry Attempts</label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setGatewayForm({ ...gatewayForm, retryAttempts: Math.max(1, gatewayForm.retryAttempts - 1) })}
                            className="flex size-10 items-center justify-center rounded-lg border border-[#e1e1e7] bg-white hover:bg-[#f5f6fa]"
                          >
                            <Minus className="size-4" />
                          </button>
                          <input
                            type="number"
                            value={gatewayForm.retryAttempts}
                            onChange={(e) => setGatewayForm({ ...gatewayForm, retryAttempts: parseInt(e.target.value) || 1 })}
                            className="w-20 rounded-lg border border-[#e1e1e7] px-4 py-2 text-center focus:border-[#0048ff] focus:outline-none"
                          />
                          <button
                            onClick={() => setGatewayForm({ ...gatewayForm, retryAttempts: Math.min(10, gatewayForm.retryAttempts + 1) })}
                            className="flex size-10 items-center justify-center rounded-lg border border-[#e1e1e7] bg-white hover:bg-[#f5f6fa]"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#090838]">Minimum Charge</label>
                          <input
                            type="number"
                            value={gatewayForm.minCharge}
                            onChange={(e) => setGatewayForm({ ...gatewayForm, minCharge: e.target.value })}
                            placeholder="0.50"
                            step="0.01"
                            className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#090838]">Maximum Charge</label>
                          <input
                            type="number"
                            value={gatewayForm.maxCharge}
                            onChange={(e) => setGatewayForm({ ...gatewayForm, maxCharge: e.target.value })}
                            placeholder="999999"
                            step="0.01"
                            className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-[#e1e1e7] bg-white p-6">
              <div className="flex gap-3">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 rounded-lg border border-[#e1e1e7] px-6 py-3 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGateway}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-3 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      Save & Verify
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Disable Gateway Modal */}
      {disableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
                <X className="size-6 text-red-600" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#090838]">Disable Payment Gateway</h2>
              <p className="text-sm text-[#6b6b88]">
                Are you sure you want to disable {disableModal.name}? This will stop processing new payments through this gateway.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => setDisableModal(null)}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleDisableGateway}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Disable Gateway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Logs Modal */}
      {logsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e1e1e7] p-6">
              <div>
                <h2 className="text-xl font-semibold text-[#090838]">Transaction Logs</h2>
                <p className="text-sm text-[#6b6b88]">View all payment transactions</p>
              </div>
              <button onClick={() => setLogsModal(false)} className="rounded-lg p-2 hover:bg-[#f5f6fa]">
                <X className="size-5 text-[#6b6b88]" />
              </button>
            </div>

            <div className="border-b border-[#e1e1e7] p-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#6b6b88]">From Date</label>
                  <input
                    type="date"
                    value={logFilters.dateFrom}
                    onChange={(e) => setLogFilters({ ...logFilters, dateFrom: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#6b6b88]">To Date</label>
                  <input
                    type="date"
                    value={logFilters.dateTo}
                    onChange={(e) => setLogFilters({ ...logFilters, dateTo: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#6b6b88]">Status</label>
                  <select
                    value={logFilters.status}
                    onChange={(e) => setLogFilters({ ...logFilters, status: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#6b6b88]">Gateway</label>
                  <select
                    value={logFilters.gateway}
                    onChange={(e) => setLogFilters({ ...logFilters, gateway: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="Stripe">Stripe</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Razorpay">Razorpay</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto p-6">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-[#e1e1e7] text-left">
                    <th className="pb-3 text-sm font-medium text-[#6b6b88]">Transaction ID</th>
                    <th className="pb-3 text-sm font-medium text-[#6b6b88]">User</th>
                    <th className="pb-3 text-sm font-medium text-[#6b6b88]">Amount</th>
                    <th className="pb-3 text-sm font-medium text-[#6b6b88]">Status</th>
                    <th className="pb-3 text-sm font-medium text-[#6b6b88]">Gateway</th>
                    <th className="pb-3 text-sm font-medium text-[#6b6b88]">Date</th>
                    <th className="pb-3 text-sm font-medium text-[#6b6b88]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-[#e1e1e7] last:border-0 hover:bg-[#f5f6fa]">
                      <td className="py-4 text-sm font-medium text-[#090838]">{txn.id}</td>
                      <td className="py-4 text-sm text-[#6b6b88]">{txn.user}</td>
                      <td className="py-4 text-sm font-medium text-[#090838]">{txn.amount}</td>
                      <td className="py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            txn.status === "success"
                              ? "bg-green-100 text-green-700"
                              : txn.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-[#6b6b88]">{txn.gateway}</td>
                      <td className="py-4 text-sm text-[#6b6b88]">{txn.date}</td>
                      <td className="py-4">
                        <button className="flex items-center gap-1 text-sm text-[#0048ff] hover:underline">
                          <ExternalLink className="size-4" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => setLogsModal(false)}
                className="rounded-lg border border-[#e1e1e7] px-6 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
