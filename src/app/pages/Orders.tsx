import { useState, useEffect } from "react";
import {
  Search, Filter, Download, Eye, CheckCircle, Clock, XCircle, X,
  Calendar, Loader, Package, Truck, MapPin, CreditCard, ChevronDown,
} from "lucide-react";
import { getOrders, getOrder, updateOrderStatus, updatePaymentStatus } from "../api";

// We'll call tracking update directly
const API_URL = import.meta.env.VITE_API_URL || "https://lumin-guide-api.onrender.com";
const BASE = `${API_URL}/api`;

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

async function apiRequest(path: string, opts: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const updateOrderTracking = (id: string, trackingData: any) =>
  apiRequest(`/admin/orders/${id}/tracking`, {
    method: "PATCH",
    body: JSON.stringify(trackingData),
  });

// ── Types ─────────────────────────────────────────────────────
type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface OrderItem {
  product: string;
  name: string;
  type: "herb" | "crystal";
  price: number;
  quantity: number;
  image: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  trackingUrl: string;
  shippedAt: string | null;
  estimatedDelivery: string;
  notes: string;
}

interface OrderData {
  _id: string;
  orderId: string;
  user: { _id: string; fullName: string; email: string; phone?: string } | null;
  items: OrderItem[];
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingInfo?: TrackingInfo;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStats {
  totalOrders: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// ── Config ────────────────────────────────────────────────────
const statusConfig: Record<OrderStatus, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  pending: { color: "text-orange-700", bg: "bg-orange-100", icon: Clock, label: "Pending" },
  confirmed: { color: "text-blue-700", bg: "bg-blue-100", icon: CheckCircle, label: "Confirmed" },
  processing: { color: "text-purple-700", bg: "bg-purple-100", icon: Clock, label: "Processing" },
  shipped: { color: "text-cyan-700", bg: "bg-cyan-100", icon: Truck, label: "Shipped" },
  delivered: { color: "text-green-700", bg: "bg-green-100", icon: CheckCircle, label: "Delivered" },
  cancelled: { color: "text-red-700", bg: "bg-red-100", icon: XCircle, label: "Cancelled" },
};

const paymentConfig: Record<PaymentStatus, { color: string; bg: string; label: string }> = {
  pending: { color: "text-orange-700", bg: "bg-orange-100", label: "Unpaid" },
  paid: { color: "text-green-700", bg: "bg-green-100", label: "Paid" },
  failed: { color: "text-red-700", bg: "bg-red-100", label: "Failed" },
  refunded: { color: "text-gray-700", bg: "bg-gray-100", label: "Refunded" },
};

const CARRIER_OPTIONS = [
  "FedEx",
  "UPS",
  "USPS",
  "DHL",
  "Amazon Logistics",
  "Blue Dart",
  "India Post",
  "Delhivery",
  "Other",
];

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ── Component ─────────────────────────────────────────────────
export function Orders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);

  // Modal states
  const [viewOrder, setViewOrder] = useState<OrderData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Tracking modal
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [trackingForm, setTrackingForm] = useState({
    trackingNumber: "",
    carrier: "",
    trackingUrl: "",
    estimatedDelivery: "",
    notes: "",
  });
  const [savingTracking, setSavingTracking] = useState(false);

  // ── Fetch orders ──────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {
        page: String(currentPage),
        limit: String(itemsPerPage),
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedStatus !== "all") params.status = selectedStatus;

      const response = await getOrders(params);
      setOrders(response.orders || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
      if (response.stats) setStats(response.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchQuery, selectedStatus]);

  // ── Open order detail modal ───────────────────────────────
  const openOrderModal = async (order: OrderData) => {
    setViewOrder(order);
    try {
      setModalLoading(true);
      const response = await getOrder(order._id);
      const detail = response.order || response;
      setViewOrder(detail);
    } catch {
      // Keep the basic order data we already have
    } finally {
      setModalLoading(false);
    }
  };

  // ── Status change ─────────────────────────────────────────
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingStatus(true);

      // If changing to "shipped", open tracking modal instead
      if (newStatus === "shipped") {
        const order = orders.find((o) => o._id === orderId) || viewOrder;
        setTrackingOrderId(orderId);
        setTrackingForm({
          trackingNumber: order?.trackingInfo?.trackingNumber || "",
          carrier: order?.trackingInfo?.carrier || "",
          trackingUrl: order?.trackingInfo?.trackingUrl || "",
          estimatedDelivery: order?.trackingInfo?.estimatedDelivery || "",
          notes: order?.trackingInfo?.notes || "",
        });
        setShowTrackingModal(true);
        setUpdatingStatus(false);
        return;
      }

      const response = await updateOrderStatus(orderId, newStatus);
      const updated = response.order || response;

      // Update in list
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o)));
      // Update modal if open
      if (viewOrder && viewOrder._id === orderId) {
        setViewOrder((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Payment status change ─────────────────────────────────
  const handlePaymentStatusChange = async (orderId: string, newStatus: PaymentStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await updatePaymentStatus(orderId, newStatus);
      const updated = response.order || response;

      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o)));
      if (viewOrder && viewOrder._id === orderId) {
        setViewOrder((prev) => (prev ? { ...prev, ...updated } : prev));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update payment status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Save tracking info ────────────────────────────────────
  const handleSaveTracking = async () => {
    if (!trackingOrderId) return;
    if (!trackingForm.trackingNumber.trim()) {
      alert("Please enter a tracking number");
      return;
    }
    if (!trackingForm.carrier.trim()) {
      alert("Please select a carrier");
      return;
    }

    try {
      setSavingTracking(true);
      const response = await updateOrderTracking(trackingOrderId, trackingForm);
      const updated = response.order || response;

      // Update in list
      setOrders((prev) => prev.map((o) => (o._id === trackingOrderId ? { ...o, ...updated } : o)));
      // Update modal if open
      if (viewOrder && viewOrder._id === trackingOrderId) {
        setViewOrder((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      setShowTrackingModal(false);
      setTrackingOrderId(null);
      fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save tracking info");
    } finally {
      setSavingTracking(false);
    }
  };

  // ── Open tracking modal for editing ───────────────────────
  const openTrackingEdit = (order: OrderData) => {
    setTrackingOrderId(order._id);
    setTrackingForm({
      trackingNumber: order.trackingInfo?.trackingNumber || "",
      carrier: order.trackingInfo?.carrier || "",
      trackingUrl: order.trackingInfo?.trackingUrl || "",
      estimatedDelivery: order.trackingInfo?.estimatedDelivery || "",
      notes: order.trackingInfo?.notes || "",
    });
    setShowTrackingModal(true);
  };

  // ── Step tracker for order detail ─────────────────────────
  const ORDER_STEPS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

  const renderStepTracker = (status: OrderStatus) => {
    const isCancelled = status === "cancelled";
    const currentIdx = ORDER_STEPS.indexOf(status);

    return (
      <div className="flex items-center justify-between py-4">
        {ORDER_STEPS.map((step, idx) => {
          const isCompleted = !isCancelled && idx <= currentIdx;
          const conf = statusConfig[step];
          return (
            <div key={step} className="flex flex-1 items-center">
              {idx > 0 && (
                <div className={`h-0.5 flex-1 ${isCompleted ? "bg-[#0048ff]" : "bg-gray-200"}`} />
              )}
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    isCompleted
                      ? "border-[#0048ff] bg-[#0048ff] text-white"
                      : isCancelled
                        ? "border-red-400 bg-red-50 text-red-600"
                        : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span
                  className={`mt-1 text-[10px] ${
                    isCompleted ? "font-medium text-[#0048ff]" : "text-gray-400"
                  }`}
                >
                  {conf.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
          Orders Management
        </h1>
        <p className="text-[#6b6b88]">View and manage all customer orders, update status, and add tracking details</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total", value: stats?.totalOrders ?? 0, color: "text-[#090838]", bg: "bg-white" },
          { label: "Pending", value: stats?.pending ?? 0, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Confirmed", value: stats?.confirmed ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Shipped", value: stats?.shipped ?? 0, color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Delivered", value: stats?.delivered ?? 0, color: "text-green-600", bg: "bg-green-50" },
          { label: "Cancelled", value: stats?.cancelled ?? 0, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border border-[#e1e1e7] ${s.bg} p-5 shadow-sm`}>
            <p className="text-xs font-medium text-[#6b6b88]">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-lg border border-[#e1e1e7] bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
          className="rounded-lg border border-[#e1e1e7] bg-white px-4 py-2.5 text-sm focus:border-[#0048ff] focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-[#e1e1e7] bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="size-8 animate-spin text-[#0048ff]" />
            <span className="ml-3 text-[#6b6b88]">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchOrders} className="mt-4 rounded-lg bg-[#0048ff] px-4 py-2 text-sm text-white hover:bg-[#0037cc]">
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto size-12 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-[#090838]">No orders found</p>
            <p className="mt-1 text-sm text-[#6b6b88]">Orders placed by users will appear here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e1e1e7] bg-[#f5f6fa]">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Order ID</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Customer</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Items</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Amount</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Payment</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const sc = statusConfig[order.status] || statusConfig.pending;
                    const pc = paymentConfig[order.paymentStatus] || paymentConfig.pending;
                    const StatusIcon = sc.icon;
                    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

                    return (
                      <tr key={order._id} className="border-b border-[#e1e1e7] last:border-0 hover:bg-[#f9f9fb] transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-[#090838]">{order.orderId}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-[#090838]">
                              {order.user?.fullName || order.shippingInfo.fullName}
                            </p>
                            <p className="text-xs text-[#6b6b88]">
                              {order.user?.email || order.shippingInfo.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-[#6b6b88]">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-[#090838]">${order.totalAmount.toFixed(2)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${sc.bg} ${sc.color}`}>
                            <StatusIcon className="size-3" />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${pc.bg} ${pc.color}`}>
                            {pc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-[#6b6b88]">{formatDate(order.createdAt)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openOrderModal(order)}
                              title="View details"
                              className="rounded-lg p-2 hover:bg-[#e1e1e7] transition-colors"
                            >
                              <Eye className="size-4 text-[#6b6b88]" />
                            </button>
                            {(order.status === "shipped" || order.trackingInfo?.trackingNumber) && (
                              <button
                                onClick={() => openTrackingEdit(order)}
                                title="Edit tracking"
                                className="rounded-lg p-2 hover:bg-cyan-50 transition-colors"
                              >
                                <Truck className="size-4 text-cyan-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#e1e1e7] px-6 py-4">
              <p className="text-sm text-[#6b6b88]">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-[#e1e1e7] px-3 py-1 text-sm text-[#6b6b88] hover:bg-[#f5f6fa] disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages || page < 1) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-lg px-3 py-1 text-sm ${
                        currentPage === page
                          ? "bg-[#0048ff] text-white"
                          : "border border-[#e1e1e7] text-[#6b6b88] hover:bg-[#f5f6fa]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-[#e1e1e7] px-3 py-1 text-sm text-[#6b6b88] hover:bg-[#f5f6fa] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ Order Detail Modal ═══ */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-[#e1e1e7] px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-[#090838]">Order Details</h2>
                <p className="text-sm text-[#6b6b88]">{viewOrder.orderId}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="size-5 text-[#6b6b88]" />
              </button>
            </div>

            {modalLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="size-8 animate-spin text-[#0048ff]" />
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto p-6">
                {/* Step tracker */}
                <div className="mb-6 rounded-xl bg-[#f5f6fa] p-4">
                  {renderStepTracker(viewOrder.status)}
                </div>

                {/* Status + Payment controls */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">
                      Order Status
                    </label>
                    <select
                      value={viewOrder.status}
                      onChange={(e) => handleStatusChange(viewOrder._id, e.target.value as OrderStatus)}
                      disabled={updatingStatus}
                      className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2.5 text-sm font-medium focus:border-[#0048ff] focus:outline-none disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped (+ Add Tracking)</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">
                      Payment Status
                    </label>
                    <select
                      value={viewOrder.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(viewOrder._id, e.target.value as PaymentStatus)}
                      disabled={updatingStatus}
                      className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2.5 text-sm font-medium focus:border-[#0048ff] focus:outline-none disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Customer & Shipping info */}
                <div className="mb-6 grid grid-cols-2 gap-6">
                  <div className="rounded-xl border border-[#e1e1e7] p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#090838]">
                      <CreditCard className="size-4" /> Customer Info
                    </h3>
                    <div className="space-y-1.5 text-sm">
                      <p><span className="text-[#6b6b88]">Name:</span> <span className="font-medium text-[#090838]">{viewOrder.user?.fullName || viewOrder.shippingInfo.fullName}</span></p>
                      <p><span className="text-[#6b6b88]">Email:</span> <span className="font-medium text-[#090838]">{viewOrder.user?.email || viewOrder.shippingInfo.email}</span></p>
                      <p><span className="text-[#6b6b88]">Phone:</span> <span className="font-medium text-[#090838]">{viewOrder.user?.phone || viewOrder.shippingInfo.phone}</span></p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#e1e1e7] p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#090838]">
                      <MapPin className="size-4" /> Shipping Address
                    </h3>
                    <div className="text-sm leading-relaxed text-[#090838]">
                      <p>{viewOrder.shippingInfo.fullName}</p>
                      <p>{viewOrder.shippingInfo.address}</p>
                      <p>{viewOrder.shippingInfo.city}, {viewOrder.shippingInfo.state} {viewOrder.shippingInfo.zipCode}</p>
                      <p>{viewOrder.shippingInfo.country || "US"}</p>
                    </div>
                  </div>
                </div>

                {/* Order items */}
                <div className="mb-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#090838]">
                    <Package className="size-4" /> Order Items
                  </h3>
                  <div className="rounded-xl border border-[#e1e1e7]">
                    {viewOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-4 px-4 py-3 ${idx < viewOrder.items.length - 1 ? "border-b border-[#e1e1e7]" : ""}`}
                      >
                        {item.image && (
                          <img src={item.image} alt={item.name} className="size-12 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#090838]">{item.name}</p>
                          <p className="text-xs text-[#6b6b88]">
                            {item.type === "herb" ? "🌿 Herb" : "💎 Crystal"} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-[#090838]">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-[#e1e1e7] bg-[#f5f6fa] px-4 py-3">
                      <span className="text-sm font-medium text-[#6b6b88]">Total</span>
                      <span className="text-lg font-bold text-[#0048ff]">${viewOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Tracking Info (if shipped) */}
                {viewOrder.trackingInfo?.trackingNumber && (
                  <div className="mb-6 rounded-xl border-2 border-cyan-200 bg-cyan-50 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
                        <Truck className="size-4" /> Tracking Information
                      </h3>
                      <button
                        onClick={() => openTrackingEdit(viewOrder)}
                        className="text-xs font-medium text-cyan-700 underline hover:text-cyan-900"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-cyan-600">Tracking #:</span>{" "}
                        <span className="font-semibold text-cyan-900">{viewOrder.trackingInfo.trackingNumber}</span>
                      </div>
                      <div>
                        <span className="text-cyan-600">Carrier:</span>{" "}
                        <span className="font-medium text-cyan-900">{viewOrder.trackingInfo.carrier}</span>
                      </div>
                      {viewOrder.trackingInfo.trackingUrl && (
                        <div className="col-span-2">
                          <span className="text-cyan-600">Tracking URL:</span>{" "}
                          <a
                            href={viewOrder.trackingInfo.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#0048ff] underline"
                          >
                            {viewOrder.trackingInfo.trackingUrl}
                          </a>
                        </div>
                      )}
                      {viewOrder.trackingInfo.estimatedDelivery && (
                        <div>
                          <span className="text-cyan-600">Est. Delivery:</span>{" "}
                          <span className="font-medium text-cyan-900">{viewOrder.trackingInfo.estimatedDelivery}</span>
                        </div>
                      )}
                      {viewOrder.trackingInfo.shippedAt && (
                        <div>
                          <span className="text-cyan-600">Shipped:</span>{" "}
                          <span className="font-medium text-cyan-900">{formatDate(viewOrder.trackingInfo.shippedAt)}</span>
                        </div>
                      )}
                      {viewOrder.trackingInfo.notes && (
                        <div className="col-span-2">
                          <span className="text-cyan-600">Notes:</span>{" "}
                          <span className="text-cyan-900">{viewOrder.trackingInfo.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {viewOrder.notes && (
                  <div className="rounded-xl bg-[#f5f6fa] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Order Notes</p>
                    <p className="mt-1 text-sm text-[#090838]">{viewOrder.notes}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="mt-4 flex gap-6 text-xs text-[#6b6b88]">
                  <span>Created: {formatDate(viewOrder.createdAt)}</span>
                  <span>Updated: {formatDate(viewOrder.updatedAt)}</span>
                </div>
              </div>
            )}

            {/* Modal footer */}
            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-4">
              {!viewOrder.trackingInfo?.trackingNumber && ["pending", "confirmed", "processing"].includes(viewOrder.status) && (
                <button
                  onClick={() => openTrackingEdit(viewOrder)}
                  className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
                >
                  <Truck className="size-4" />
                  Add Tracking & Ship
                </button>
              )}
              <button
                onClick={() => setViewOrder(null)}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tracking Modal ═══ */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-[#e1e1e7] px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#090838]">
                <Truck className="size-5 text-cyan-600" />
                Shipping & Tracking Details
              </h2>
              <p className="mt-1 text-xs text-[#6b6b88]">
                Enter tracking details below. The order will be marked as "Shipped" and the customer will be able to track their package.
              </p>
            </div>

            <div className="space-y-4 p-6">
              {/* Tracking Number */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#090838]">
                  Tracking Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={trackingForm.trackingNumber}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                  placeholder="e.g. 1Z999AA10123456784"
                  className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2.5 text-sm focus:border-[#0048ff] focus:outline-none"
                />
              </div>

              {/* Carrier */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#090838]">
                  Carrier <span className="text-red-500">*</span>
                </label>
                <select
                  value={trackingForm.carrier}
                  onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                  className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2.5 text-sm focus:border-[#0048ff] focus:outline-none"
                >
                  <option value="">Select a carrier...</option>
                  {CARRIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Tracking URL */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#090838]">Tracking URL</label>
                <input
                  type="url"
                  value={trackingForm.trackingUrl}
                  onChange={(e) => setTrackingForm({ ...trackingForm, trackingUrl: e.target.value })}
                  placeholder="https://www.fedex.com/tracking?tracknumbers=..."
                  className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2.5 text-sm focus:border-[#0048ff] focus:outline-none"
                />
              </div>

              {/* Estimated Delivery */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#090838]">Estimated Delivery</label>
                <input
                  type="text"
                  value={trackingForm.estimatedDelivery}
                  onChange={(e) => setTrackingForm({ ...trackingForm, estimatedDelivery: e.target.value })}
                  placeholder="e.g. 3-5 business days or April 10, 2026"
                  className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2.5 text-sm focus:border-[#0048ff] focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#090838]">Shipping Notes</label>
                <textarea
                  value={trackingForm.notes}
                  onChange={(e) => setTrackingForm({ ...trackingForm, notes: e.target.value })}
                  placeholder="Any additional notes about this shipment..."
                  rows={2}
                  className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2.5 text-sm focus:border-[#0048ff] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e1e1e7] px-6 py-4">
              <button
                onClick={() => { setShowTrackingModal(false); setTrackingOrderId(null); }}
                className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTracking}
                disabled={savingTracking}
                className="flex items-center gap-2 rounded-lg bg-[#0048ff] px-5 py-2 text-sm font-medium text-white hover:bg-[#0037cc] disabled:opacity-50"
              >
                {savingTracking ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Truck className="size-4" />
                    Save & Mark Shipped
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
