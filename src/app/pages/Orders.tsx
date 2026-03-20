import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, CheckCircle, Clock, XCircle, MoreVertical, X, Calendar, Loader } from "lucide-react";
import { getOrders, getOrder, updateOrderStatus, getDashboardStats } from "../api";

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  user: string;
  userAvatar: string;
  service: string;
  serviceType: string;
  amount: string;
  status: OrderStatus;
  paymentStatus: string;
  date: string;
  time: string;
  astrologer: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface Stat {
  label: string;
  value: number;
  color: string;
}

const statusConfig: Record<OrderStatus, { color: string; icon: typeof CheckCircle }> = {
  delivered: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  processing: { color: "bg-blue-100 text-blue-700", icon: Clock },
  shipped: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  cancelled: { color: "bg-red-100 text-red-700", icon: XCircle },
};

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewModal, setViewModal] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [astrologerFilter, setAstrologerFilter] = useState("all");

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
  });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await getDashboardStats();
        const statsData = Array.isArray(response) ? response[0]
          : response.data ? response.data
          : response.stats ? response.stats
          : response;
        setStats([
          { label: "Total Orders", value: statsData.totalOrders || 0, color: "text-blue-600" },
          { label: "Completed", value: statsData.completed || 0, color: "text-green-600" },
          { label: "In Progress", value: statsData.inProgress || 0, color: "text-yellow-600" },
          { label: "Pending", value: statsData.pending || 0, color: "text-orange-600" },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setStats([
          { label: "Total Orders", value: 0, color: "text-blue-600" },
          { label: "Completed", value: 0, color: "text-green-600" },
          { label: "In Progress", value: 0, color: "text-yellow-600" },
          { label: "Pending", value: 0, color: "text-orange-600" },
        ]);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch orders when filters or page changes
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: Record<string, any> = {
          page: currentPage,
          limit: pagination.itemsPerPage,
        };

        if (searchQuery) {
          params.search = searchQuery;
        }

        if (selectedStatus !== "all") {
          params.status = selectedStatus;
        }

        if (dateFilter) {
          params.startDate = dateFilter;
          params.endDate = dateFilter;
        }

        const response = await getOrders(params);
        const ordersData = Array.isArray(response) ? response
          : response.data ? response.data
          : response.orders ? response.orders
          : [];
        const paginationData = response.pagination || {
          currentPage: response.page || response.currentPage || currentPage,
          totalPages: response.totalPages || Math.ceil((response.total || response.totalItems || ordersData.length) / 8),
          totalItems: response.total || response.totalItems || ordersData.length,
          itemsPerPage: response.limit || 8,
        };
        setOrders(ordersData);
        setPagination(paginationData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch orders";
        setError(errorMessage);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, searchQuery, selectedStatus, dateFilter, pagination.itemsPerPage]);

  // Fetch order details for modal
  useEffect(() => {
    if (viewModal) {
      const fetchOrderDetails = async () => {
        try {
          setModalLoading(true);
          setModalError(null);
          const response = await getOrder(viewModal.id);
          const orderDetails = Array.isArray(response) ? response[0]
            : response.data ? response.data
            : response.order ? response.order
            : response;
          setViewModal(orderDetails);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to fetch order details";
          setModalError(errorMessage);
        } finally {
          setModalLoading(false);
        }
      };

      fetchOrderDetails();
    }
  }, [viewModal?.id]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, newStatus);

      // Update the modal view
      if (viewModal && viewModal.id === orderId) {
        setViewModal({ ...viewModal, status: newStatus });
      }

      // Refetch orders to update the table
      const params: Record<string, any> = {
        page: currentPage,
        limit: pagination.itemsPerPage,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedStatus !== "all") {
        params.status = selectedStatus;
      }

      const response = await getOrders(params);
      const refreshedOrders = Array.isArray(response) ? response
        : response.data ? response.data
        : response.orders ? response.orders
        : [];
      setOrders(refreshedOrders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update order status";
      setModalError(errorMessage);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const exportOrders = () => {
    alert(`Exporting ${orders.length} orders to CSV...`);
  };

  const clearFilters = () => {
    setSelectedStatus("all");
    setSearchQuery("");
    setServiceTypeFilter("all");
    setDateFilter("");
    setAstrologerFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
          Orders Management
        </h1>
        <p className="text-[#6b6b88]">Track and manage all service orders</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <div className="col-span-4 flex items-center justify-center py-8">
            <Loader className="size-6 animate-spin text-[#0048ff]" />
          </div>
        ) : (
          stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
              <p className="text-sm text-[#6b6b88]">{stat.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
          <input
            type="text"
            placeholder="Search by order ID, user, or service..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-[#e1e1e7] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="flex items-center gap-2 rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm text-[#6b6b88] hover:bg-[#f5f6fa]"
          >
            <Filter className="size-4" />
            More Filters
          </button>
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm text-[#6b6b88] hover:bg-[#f5f6fa]"
          >
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      {/* More Filters */}
      {showMoreFilters && (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-[#e1e1e7] bg-white py-2 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
            />
          </div>
          <div className="relative flex-1">
            <MoreVertical className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
            <select
              value={serviceTypeFilter}
              onChange={(e) => {
                setServiceTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
            >
              <option value="all">All Service Types</option>
              <option value="Astrology">Astrology</option>
              <option value="Tarot">Tarot</option>
              <option value="Compatibility">Compatibility</option>
              <option value="Horoscope">Horoscope</option>
            </select>
          </div>
          <div className="relative flex-1">
            <MoreVertical className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
            <select
              value={astrologerFilter}
              onChange={(e) => {
                setAstrologerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
            >
              <option value="all">All Astrologers</option>
              <option value="Dr. Maya Singh">Dr. Maya Singh</option>
              <option value="Luna Martinez">Luna Martinez</option>
              <option value="Stella Chen">Stella Chen</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 rounded-lg border border-[#e1e1e7] bg-white px-4 py-2 text-sm text-[#6b6b88] hover:bg-[#f5f6fa]"
          >
            <X className="size-4" />
            Clear Filters
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-xl border border-[#e1e1e7] bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="mx-auto size-8 animate-spin text-[#0048ff]" />
              <p className="mt-4 text-[#6b6b88]">Loading orders...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-[#0048ff] px-4 py-2 text-sm text-white hover:bg-[#0037cc]"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e1e1e7] bg-[#f5f6fa]">
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">User</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Astrologer</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#6b6b88]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const StatusIcon = statusConfig[order.status as OrderStatus]?.icon || Clock;
                    return (
                      <tr key={order.id} className="border-b border-[#e1e1e7] last:border-0 hover:bg-[#f5f6fa]">
                        <td className="px-6 py-4 text-sm font-medium text-[#090838]">{order.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={order.userAvatar}
                              alt={order.user}
                              className="size-8 rounded-full object-cover"
                            />
                            <span className="text-sm text-[#6b6b88]">{order.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-[#090838]">{order.service}</p>
                            <p className="text-xs text-[#6b6b88]">{order.serviceType}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#6b6b88]">{order.astrologer}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-[#090838]">{order.date}</p>
                            <p className="text-xs text-[#6b6b88]">{order.time}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#090838]">{order.amount}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                              statusConfig[order.status as OrderStatus]?.color || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <StatusIcon className="size-3" />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setViewModal(order)}
                            className="rounded-lg p-2 hover:bg-[#e1e1e7]"
                          >
                            <Eye className="size-4 text-[#6b6b88]" />
                          </button>
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
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                {pagination.totalItems} orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-[#e1e1e7] px-3 py-1 text-sm text-[#6b6b88] hover:bg-[#f5f6fa] disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
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
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="rounded-lg border border-[#e1e1e7] px-3 py-1 text-sm text-[#6b6b88] hover:bg-[#f5f6fa] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Order Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Order Details</h2>
              <p className="text-sm text-[#6b6b88]">{viewModal.id}</p>
            </div>

            {modalLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="mx-auto size-8 animate-spin text-[#0048ff]" />
                  <p className="mt-4 text-[#6b6b88]">Loading order details...</p>
                </div>
              </div>
            ) : modalError ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-red-600">{modalError}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#6b6b88]">Customer</label>
                      <div className="flex items-center gap-3">
                        <img src={viewModal.userAvatar} alt={viewModal.user} className="size-10 rounded-full" />
                        <p className="font-medium text-[#090838]">{viewModal.user}</p>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#6b6b88]">Service</label>
                      <p className="font-medium text-[#090838]">{viewModal.service}</p>
                      <p className="text-sm text-[#6b6b88]">{viewModal.serviceType}</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#6b6b88]">Astrologer</label>
                      <p className="font-medium text-[#090838]">{viewModal.astrologer}</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#6b6b88]">Amount</label>
                      <p className="text-xl font-bold text-[#090838]">{viewModal.amount}</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#6b6b88]">Date & Time</label>
                      <p className="font-medium text-[#090838]">{viewModal.date}</p>
                      <p className="text-sm text-[#6b6b88]">{viewModal.time}</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#6b6b88]">Status</label>
                      <select
                        value={viewModal.status}
                        onChange={(e) => handleStatusChange(viewModal.id, e.target.value as OrderStatus)}
                        disabled={updatingOrderId === viewModal.id}
                        className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none disabled:opacity-50"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {updatingOrderId === viewModal.id && (
                        <p className="mt-2 flex items-center gap-2 text-xs text-[#0048ff]">
                          <Loader className="size-3 animate-spin" />
                          Updating...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#e1e1e7] p-6">
                  <button
                    onClick={() => setViewModal(null)}
                    className="rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm font-medium text-[#6b6b88] hover:bg-[#f5f6fa]"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
