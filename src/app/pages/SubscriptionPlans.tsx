import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check, X, AlertCircle, XCircle, CheckCircle, Loader } from "lucide-react";
import {
  getSubscriptionPlans,
  getSubscriptionPlan,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscribers,
  getSubscriptionRevenue,
  getChurnRate,
} from "../api";

interface Plan {
  id: number;
  name: string;
  price: string;
  interval: string;
  status: "active" | "inactive";
  users: number;
  description: string;
  features: { name: string; included: boolean }[];
}

type GatewayStatus = "connected" | "not-connected" | "error";

interface Gateway {
  id: number;
  name: string;
  status: GatewayStatus;
  description: string;
  apiKey: string;
  environment: string;
  lastSynced: string;
  logo: string;
  enabled: boolean;
}

interface BillingData {
  totalRevenue: number;
  totalSubscribers: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);
  const [autoRetry, setAutoRetry] = useState(true);
  const [activeGateway, setActiveGateway] = useState("Stripe");
  const [fallbackGateway, setFallbackGateway] = useState("PayPal");
  const [successMessage, setSuccessMessage] = useState("");
  const [billingData, setBillingData] = useState<BillingData>({
    totalRevenue: 0,
    totalSubscribers: 0,
    monthlyRecurringRevenue: 0,
    churnRate: 0,
  });
  const [billingLoading, setBillingLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    interval: "Monthly",
    description: "",
    features: "",
    status: "active" as "active" | "inactive",
  });

  const [gateways, setGateways] = useState<Gateway[]>([
    {
      id: 1,
      name: "Stripe",
      status: "connected",
      description: "Accept credit cards, debit cards, and digital wallets globally",
      apiKey: "sk_live_••••••••••••••4242",
      environment: "Live",
      lastSynced: "2 minutes ago",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
      enabled: true,
    },
    {
      id: 2,
      name: "PayPal",
      status: "connected",
      description: "Enable payments through PayPal accounts and cards",
      apiKey: "AZaQ••••••••••••••••xK3L",
      environment: "Sandbox",
      lastSynced: "15 minutes ago",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
      enabled: true,
    },
    {
      id: 3,
      name: "Razorpay",
      status: "not-connected",
      description: "Accept payments in India with UPI, cards, and more",
      apiKey: "",
      environment: "",
      lastSynced: "",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
      enabled: false,
    },
  ]);

  const [configureModal, setConfigureModal] = useState<Gateway | null>(null);
  const [connectModal, setConnectModal] = useState<Gateway | null>(null);
  const [testPaymentModal, setTestPaymentModal] = useState<Gateway | null>(null);
  const [logsModal, setLogsModal] = useState<Gateway | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const connectedCount = gateways.filter((g) => g.status === "connected").length;
  const availableGateways = gateways.filter((g) => g.status === "connected").map((g) => g.name);

  // Fetch plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSubscriptionPlans();
        const data = Array.isArray(response) ? response
          : response.data ? response.data
          : response.plans ? response.plans
          : [];
        setPlans(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load plans");
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchBillingData = async () => {
      try {
        setBillingLoading(true);
        const revenueResponse = await getSubscriptionRevenue();
        const churnResponse = await getChurnRate();
        const subscribersResponse = await getSubscribers();

        const revenueData = Array.isArray(revenueResponse) ? revenueResponse[0]
          : revenueResponse.data ? revenueResponse.data
          : revenueResponse;
        const churnData = Array.isArray(churnResponse) ? churnResponse[0]
          : churnResponse.data ? churnResponse.data
          : churnResponse;
        const subscribersData = Array.isArray(subscribersResponse) ? subscribersResponse[0]
          : subscribersResponse.data ? subscribersResponse.data
          : subscribersResponse;

        setBillingData({
          totalRevenue: revenueData?.totalRevenue || 0,
          totalSubscribers: subscribersData?.total || 0,
          monthlyRecurringRevenue: revenueData?.mrr || 0,
          churnRate: churnData?.rate || 0,
        });
      } catch (err) {
        console.error("Error fetching billing data:", err);
      } finally {
        setBillingLoading(false);
      }
    };

    fetchPlans();
    fetchBillingData();
  }, []);

  const toggleGateway = (id: number) => {
    setGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g))
    );
  };

  const connectGateway = (gateway: Gateway) => {
    setGateways((prev) =>
      prev.map((g) =>
        g.id === gateway.id
          ? {
              ...g,
              status: "connected",
              apiKey: `${g.name.toLowerCase()}_test_••••••••••••••1234`,
              environment: "Sandbox",
              lastSynced: "Just now",
              enabled: true,
            }
          : g
      )
    );
    setConnectModal(null);
  };

  const disconnectGateway = (id: number) => {
    setGateways((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status: "not-connected",
              apiKey: "",
              environment: "",
              lastSynced: "",
              enabled: false,
            }
          : g
      )
    );
    setConfigureModal(null);
  };

  const testPayment = (gateway: Gateway) => {
    alert(`Testing payment with ${gateway.name}...\n\nTest transaction successful! ✓\nTransaction ID: ${Math.random().toString(36).substring(7).toUpperCase()}`);
    setTestPaymentModal(null);
  };

  // Plan Management Functions
  const handleCreatePlan = async () => {
    if (!formData.name || !formData.price || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    const featuresArray = formData.features
      .split("\n")
      .filter((f) => f.trim())
      .map((feature) => ({ name: feature.trim(), included: true }));

    try {
      setIsSubmitting(true);
      setError(null);

      const newPlanData = {
        name: formData.name,
        price: parseFloat(formData.price),
        billingPeriod: formData.interval.toLowerCase(),
        features: featuresArray.map((f) => f.name),
        status: formData.status,
      };

      const createdPlan = await createSubscriptionPlan(newPlanData);

      // Fetch updated plans list
      const updatedPlans = await getSubscriptionPlans();
      setPlans(updatedPlans);

      setShowCreateModal(false);
      resetForm();
      setSuccessMessage(`"${formData.name}" has been created successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
      console.error("Error creating plan:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlan) return;

    const featuresArray = formData.features
      .split("\n")
      .filter((f) => f.trim())
      .map((feature) => ({ name: feature.trim(), included: true }));

    try {
      setIsSubmitting(true);
      setError(null);

      const updateData = {
        name: formData.name,
        price: parseFloat(formData.price),
        billingPeriod: formData.interval.toLowerCase(),
        features: featuresArray.map((f) => f.name),
        status: formData.status,
      };

      await updateSubscriptionPlan(selectedPlan.id, updateData);

      // Fetch updated plans list
      const updatedPlans = await getSubscriptionPlans();
      setPlans(updatedPlans);

      setSelectedPlan(null);
      resetForm();
      setSuccessMessage(`"${formData.name}" has been updated successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plan");
      console.error("Error updating plan:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deletePlan) return;

    try {
      setDeleteLoading(true);
      setError(null);

      await deleteSubscriptionPlan(deletePlan.id);

      // Fetch updated plans list
      const updatedPlans = await getSubscriptionPlans();
      setPlans(updatedPlans);

      setDeletePlan(null);
      setSuccessMessage(`"${deletePlan.name}" has been deleted successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete plan");
      console.error("Error deleting plan:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.replace("$", ""),
      interval: plan.interval,
      description: plan.description,
      features: plan.features.map((f) => f.name).join("\n"),
      status: plan.status,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      interval: "Monthly",
      description: "",
      features: "",
      status: "active",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-screen">
        <div className="text-center">
          <Loader className="size-8 animate-spin mx-auto mb-4 text-[#0048ff]" />
          <p className="text-[#6b6b88]">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
            Subscription Plans
          </h1>
          <p className="text-[#6b6b88]">Manage subscription tiers and pricing</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
        >
          <Plus className="size-4" />
          Create New Plan
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6b6b88]">Total Plans</p>
          <p className="mt-2 text-3xl font-semibold text-[#090838]">{plans.length}</p>
        </div>
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6b6b88]">Free Users</p>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {plans.find((p) => p.name === "Free Plan")?.users.toLocaleString() || "0"}
          </p>
        </div>
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#6b6b88]">Premium Users</p>
          <p className="mt-2 text-3xl font-semibold text-purple-600">
            {plans.find((p) => p.name === "Premium Plan")?.users.toLocaleString() || "0"}
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="overflow-hidden rounded-xl border border-[#e1e1e7] bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Plan Header */}
            <div className="border-b border-[#e1e1e7] bg-gradient-to-br from-[#090838] to-[#0048ff] p-6 text-white">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="mb-2 text-2xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-white/80">{plan.description}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    plan.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {plan.status}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-white/80">/ {plan.interval}</span>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-white/10 px-4 py-2">
                <span className="text-sm">Active Subscribers</span>
                <span className="font-semibold">{plan.users.toLocaleString()}</span>
              </div>
            </div>

            {/* Plan Features */}
            <div className="p-6">
              <h4 className="mb-4 font-semibold text-[#090838]">Features</h4>
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <Check className="size-3 text-green-600" />
                      </div>
                    ) : (
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <X className="size-3 text-gray-400" />
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-[#090838]" : "text-[#6b6b88] line-through"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Actions */}
            <div className="flex gap-2 border-t border-[#e1e1e7] p-4">
              <button
                onClick={() => openEditModal(plan)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                <Edit className="size-4" />
                Edit Plan
              </button>
              <button
                onClick={() => setDeletePlan(plan)}
                className="flex items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Gateway Integration Section */}
      <div className="mb-8 flex items-center justify-between border-t border-[#e1e1e7] pt-8">
        <div>
          <h2 className="mb-2 font-['Homenaje:Regular',sans-serif] text-2xl text-[#090838]">
            Payment Gateway Integration
          </h2>
          <p className="text-[#6b6b88]">Manage and configure payment providers for subscription billing</p>
        </div>
        <button
          onClick={() => alert("Custom gateway integration feature coming soon!")}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
        >
          <Plus className="size-4" />
          Add Custom Gateway
        </button>
      </div>

      {/* Billing Analytics Tab */}
      <div className="mb-8 rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-semibold text-[#090838]">Billing Analytics</h3>
        {billingLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="size-5 animate-spin text-[#0048ff]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] px-4 py-3">
              <span className="text-sm text-[#6b6b88]">Total Revenue</span>
              <span className="font-semibold text-[#090838]">${billingData.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] px-4 py-3">
              <span className="text-sm text-[#6b6b88]">Total Subscribers</span>
              <span className="font-semibold text-[#090838]">{billingData.totalSubscribers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] px-4 py-3">
              <span className="text-sm text-[#6b6b88]">MRR</span>
              <span className="font-semibold text-[#090838]">${billingData.monthlyRecurringRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] px-4 py-3">
              <span className="text-sm text-[#6b6b88]">Churn Rate</span>
              <span className="font-semibold text-[#090838]">{billingData.churnRate.toFixed(2)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Gateway Summary Card */}
      <div className="mb-8 rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#090838]">Active Gateway</label>
            <select
              value={activeGateway}
              onChange={(e) => setActiveGateway(e.target.value)}
              className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
            >
              {availableGateways.length > 0 ? (
                availableGateways.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))
              ) : (
                <option>No gateways connected</option>
              )}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[#090838]">Fallback Gateway</label>
            <select
              value={fallbackGateway}
              onChange={(e) => setFallbackGateway(e.target.value)}
              className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
            >
              <option value="None">None</option>
              {availableGateways.filter((name) => name !== activeGateway).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex w-full flex-col items-center justify-center rounded-lg bg-[#f5f6fa] p-3">
              <p className="text-xs text-[#6b6b88]">Connected</p>
              <p className="text-2xl font-semibold text-green-600">{connectedCount}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] px-4 py-3">
            <span className="text-sm text-[#6b6b88]">Total Connected Gateways</span>
            <span className="font-semibold text-[#090838]">{connectedCount}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] px-4 py-3">
            <span className="text-sm text-[#6b6b88]">Failed Webhooks</span>
            <span className="font-semibold text-red-600">3</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#e1e1e7] px-4 py-3">
            <span className="text-sm text-[#6b6b88]">Auto Retry Failed Payments</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={autoRetry}
                onChange={(e) => setAutoRetry(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0048ff] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Payment Gateways Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {gateways.map((gateway) => (
          <div
            key={gateway.id}
            className="overflow-hidden rounded-xl border border-[#e1e1e7] bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Gateway Header */}
            <div className="border-b border-[#e1e1e7] bg-[#f5f6fa] p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-12 w-32 items-center justify-center rounded-lg bg-white p-2">
                  <img src={gateway.logo} alt={gateway.name} className="h-full w-full object-contain" />
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    gateway.status === "connected"
                      ? "bg-green-100 text-green-700"
                      : gateway.status === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {gateway.status === "connected" ? "Connected" : gateway.status === "error" ? "Error" : "Not Connected"}
                </span>
              </div>
              <p className="text-sm text-[#6b6b88]">{gateway.description}</p>
            </div>

            {/* Gateway Body */}
            <div className="p-5">
              {gateway.status === "connected" ? (
                <>
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-[#f5f6fa] px-3 py-2">
                      <span className="text-xs text-[#6b6b88]">Enable/Disable</span>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={gateway.enabled}
                          onChange={() => toggleGateway(gateway.id)}
                          className="peer sr-only"
                        />
                        <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0048ff] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                      </label>
                    </div>
                    <div className="rounded-lg border border-[#e1e1e7] px-3 py-2">
                      <p className="mb-1 text-xs text-[#6b6b88]">API Key</p>
                      <p className="font-mono text-xs text-[#090838]">{gateway.apiKey}</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg border border-[#e1e1e7] px-3 py-2">
                        <p className="mb-1 text-xs text-[#6b6b88]">Environment</p>
                        <p className="text-xs font-medium text-[#090838]">{gateway.environment}</p>
                      </div>
                      <div className="flex-1 rounded-lg border border-[#e1e1e7] px-3 py-2">
                        <p className="mb-1 text-xs text-[#6b6b88]">Last Synced</p>
                        <p className="text-xs font-medium text-[#090838]">{gateway.lastSynced}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setConfigureModal(gateway)}
                      className="w-full rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => setTestPaymentModal(gateway)}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                    >
                      Test Payment
                    </button>
                    <button
                      onClick={() => setLogsModal(gateway)}
                      className="w-full text-center text-sm text-[#0048ff] hover:underline"
                    >
                      View Logs
                    </button>
                  </div>
                </>
              ) : gateway.status === "error" ? (
                <>
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
                      <p className="text-xs text-red-600">
                        Connection failed. Invalid API credentials or webhook configuration error.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button className="w-full rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]">
                      Retry Connection
                    </button>
                    <button className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]">
                      Configure
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4 rounded-lg bg-[#f5f6fa] p-4 text-center">
                    <XCircle className="mx-auto mb-2 size-8 text-[#6b6b88]" />
                    <p className="text-sm text-[#6b6b88]">Gateway not connected</p>
                  </div>
                  <button
                    onClick={() => setConnectModal(gateway)}
                    className="w-full rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
                  >
                    Connect {gateway.name}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Configure Gateway Modal */}
      {configureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Configure {configureModal.name}</h2>
              <p className="text-sm text-[#6b6b88]">Update gateway settings and credentials</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">API Key</label>
                  <input
                    type="text"
                    defaultValue={configureModal.apiKey}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Environment</label>
                  <select
                    defaultValue={configureModal.environment}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    <option value="Sandbox">Sandbox</option>
                    <option value="Live">Live</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Webhook URL</label>
                  <input
                    type="text"
                    defaultValue={`https://api.luminguide.com/webhooks/${configureModal.name.toLowerCase()}`}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => disconnectGateway(configureModal.id)}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Disconnect
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfigureModal(null)}
                  className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert(`${configureModal.name} configuration saved successfully!`);
                    setConfigureModal(null);
                  }}
                  className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Gateway Modal */}
      {connectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Connect {connectModal.name}</h2>
              <p className="text-sm text-[#6b6b88]">Enter your {connectModal.name} credentials</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">API Key</label>
                  <input
                    type="text"
                    placeholder={`Enter your ${connectModal.name} API key`}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Secret Key</label>
                  <input
                    type="password"
                    placeholder="Enter secret key"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Environment</label>
                  <select className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none">
                    <option value="Sandbox">Sandbox (Testing)</option>
                    <option value="Live">Live (Production)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => setConnectModal(null)}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={() => connectGateway(connectModal)}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
              >
                Connect Gateway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Payment Modal */}
      {testPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Test Payment</h2>
              <p className="text-sm text-[#6b6b88]">Run a test transaction with {testPaymentModal.name}</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">Test Amount</label>
                  <input
                    type="number"
                    defaultValue="10.00"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  />
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex gap-2">
                    <CheckCircle className="size-5 shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Test Mode</p>
                      <p className="text-xs text-blue-700">No real charges will be made</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => setTestPaymentModal(null)}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={() => testPayment(testPaymentModal)}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
              >
                Run Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Logs Modal */}
      {logsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">{logsModal.name} Transaction Logs</h2>
              <p className="text-sm text-[#6b6b88]">Recent payment transactions and webhooks</p>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-6">
              <div className="space-y-3">
                {[
                  { type: "success", message: "Payment successful - $19.99", time: "2 minutes ago" },
                  { type: "success", message: "Payment successful - $49.99", time: "15 minutes ago" },
                  { type: "webhook", message: "Webhook received: payment.succeeded", time: "15 minutes ago" },
                  { type: "success", message: "Payment successful - $19.99", time: "1 hour ago" },
                  { type: "error", message: "Payment failed - Insufficient funds", time: "2 hours ago" },
                  { type: "webhook", message: "Webhook received: payment.failed", time: "2 hours ago" },
                ].map((log, index) => (
                  <div key={index} className="flex items-start gap-3 rounded-lg border border-[#e1e1e7] p-3">
                    <div className={`mt-1 size-2 shrink-0 rounded-full ${
                      log.type === "success" ? "bg-green-500" :
                      log.type === "error" ? "bg-red-500" : "bg-blue-500"
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-[#090838]">{log.message}</p>
                      <p className="text-xs text-[#6b6b88]">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => setLogsModal(null)}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Create New Plan</h2>
              <p className="text-sm text-[#6b6b88]">Add a new subscription plan</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium Plus"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">
                      Price
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">
                      Billing Interval
                    </label>
                    <select
                      value={formData.interval}
                      onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    >
                      <option>Monthly</option>
                      <option>Yearly</option>
                      <option>Lifetime</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the plan..."
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Features (one per line)
                  </label>
                  <textarea
                    rows={6}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={isSubmitting}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Edit Plan</h2>
              <p className="text-sm text-[#6b6b88]">Update {selectedPlan.name}</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">
                      Price
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#090838]">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                      className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#090838]">
                    Features (one per line)
                  </label>
                  <textarea
                    rows={6}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 focus:border-[#0048ff] focus:outline-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  resetForm();
                }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPlan}
                disabled={isSubmitting}
                className="rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-4 py-2 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa] disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Plan Modal */}
      {deletePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#090838]">Delete Subscription Plan</h2>
              <p className="text-sm text-[#6b6b88]">
                Are you sure you want to delete "{deletePlan.name}"? This action cannot be undone and will affect all subscribers.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
              <button
                onClick={() => setDeletePlan(null)}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlan}
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed bottom-8 right-8 z-50 rounded-lg border border-green-200 bg-green-50 px-6 py-4 shadow-lg">
          <p className="text-sm font-medium text-green-900">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
