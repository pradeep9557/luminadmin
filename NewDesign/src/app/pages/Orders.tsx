import { useState } from "react";
import { Search, Filter, Download, Eye, CheckCircle, Clock, XCircle, MoreVertical, X, Calendar } from "lucide-react";

type OrderStatus = "completed" | "pending" | "in-progress" | "cancelled";

interface Order {
  id: string;
  user: string;
  userAvatar: string;
  service: string;
  serviceType: string;
  amount: string;
  status: OrderStatus;
  date: string;
  time: string;
  astrologer: string;
}

const initialOrders: Order[] = [
  {
    id: "ORD-1234",
    user: "Sarah Johnson",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    service: "Birth Chart Reading",
    serviceType: "Astrology",
    amount: "$49.99",
    status: "completed",
    date: "2026-03-03",
    time: "10:30 AM",
    astrologer: "Dr. Maya Singh",
  },
  {
    id: "ORD-1235",
    user: "Michael Chen",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    service: "Tarot Reading",
    serviceType: "Tarot",
    amount: "$29.99",
    status: "pending",
    date: "2026-03-03",
    time: "2:00 PM",
    astrologer: "Luna Martinez",
  },
  {
    id: "ORD-1236",
    user: "Emma Williams",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    service: "Compatibility Report",
    serviceType: "Compatibility",
    amount: "$39.99",
    status: "completed",
    date: "2026-03-02",
    time: "4:15 PM",
    astrologer: "Dr. Maya Singh",
  },
  {
    id: "ORD-1237",
    user: "James Brown",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    service: "Monthly Horoscope",
    serviceType: "Horoscope",
    amount: "$19.99",
    status: "in-progress",
    date: "2026-03-02",
    time: "11:00 AM",
    astrologer: "Stella Chen",
  },
  {
    id: "ORD-1238",
    user: "Lisa Anderson",
    userAvatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    service: "Birth Chart Reading",
    serviceType: "Astrology",
    amount: "$49.99",
    status: "completed",
    date: "2026-03-01",
    time: "9:30 AM",
    astrologer: "Dr. Maya Singh",
  },
  {
    id: "ORD-1239",
    user: "David Martinez",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    service: "Career Guidance",
    serviceType: "Astrology",
    amount: "$59.99",
    status: "cancelled",
    date: "2026-03-01",
    time: "3:00 PM",
    astrologer: "Luna Martinez",
  },
  {
    id: "ORD-1240",
    user: "Sophie Taylor",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    service: "Love Reading",
    serviceType: "Tarot",
    amount: "$34.99",
    status: "in-progress",
    date: "2026-03-01",
    time: "1:45 PM",
    astrologer: "Stella Chen",
  },
  {
    id: "ORD-1241",
    user: "Alex Kim",
    userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    service: "Yearly Forecast",
    serviceType: "Horoscope",
    amount: "$79.99",
    status: "pending",
    date: "2026-02-28",
    time: "10:00 AM",
    astrologer: "Dr. Maya Singh",
  },
];

const statusConfig = {
  completed: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  "in-progress": { color: "bg-blue-100 text-blue-700", icon: Clock },
  cancelled: { color: "bg-red-100 text-red-700", icon: XCircle },
};

export function Orders() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewModal, setViewModal] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [astrologerFilter, setAstrologerFilter] = useState("all");
  const itemsPerPage = 8;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    const matchesServiceType = serviceTypeFilter === "all" || order.serviceType === serviceTypeFilter;
    const matchesDate = !dateFilter || order.date === dateFilter;
    const matchesAstrologer = astrologerFilter === "all" || order.astrologer === astrologerFilter;
    return matchesSearch && matchesStatus && matchesServiceType && matchesDate && matchesAstrologer;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const stats = [
    { label: "Total Orders", value: orders.length, color: "text-blue-600" },
    { label: "Completed", value: orders.filter((o) => o.status === "completed").length, color: "text-green-600" },
    { label: "In Progress", value: orders.filter((o) => o.status === "in-progress").length, color: "text-yellow-600" },
    { label: "Pending", value: orders.filter((o) => o.status === "pending").length, color: "text-orange-600" },
  ];

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );
    setViewModal(null);
  };

  const exportOrders = () => {
    alert(`Exporting ${filteredOrders.length} orders to CSV...`);
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
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#6b6b88]">{stat.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
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
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
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
              {paginatedOrders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
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
                          statusConfig[order.status].color
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
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-[#e1e1e7] px-3 py-1 text-sm text-[#6b6b88] hover:bg-[#f5f6fa] disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-[#e1e1e7] px-3 py-1 text-sm text-[#6b6b88] hover:bg-[#f5f6fa] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Order Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="border-b border-[#e1e1e7] p-6">
              <h2 className="text-xl font-semibold text-[#090838]">Order Details</h2>
              <p className="text-sm text-[#6b6b88]">{viewModal.id}</p>
            </div>

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
                    onChange={(e) => updateOrderStatus(viewModal.id, e.target.value as OrderStatus)}
                    className="w-full rounded-lg border border-[#e1e1e7] px-4 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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
          </div>
        </div>
      )}
    </div>
  );
}