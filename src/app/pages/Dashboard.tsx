import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  UserCheck,
  UserX,
  UserPlus,
  FileText,
  BookOpen,
  HelpCircle,
  Leaf,
  Gem,
  File,
  Loader,
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router";
import { getDashboardStats } from "../api";

interface RecentOrder {
  _id: string;
  orderId: string;
  user: { fullName: string; email: string } | null;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  items: { name: string; quantity: number }[];
  createdAt: string;
}

interface TopProduct {
  _id: string;
  name: string;
  type: string;
  totalSold: number;
  totalRevenue: number;
}

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  newUsersThisWeek: number;
  totalPosts: number;
  totalJournals: number;
  totalFaqs: number;
  totalHerbs: number;
  totalCrystals: number;
  totalPages: number;
  // Order stats
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  ordersThisWeek: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return d;
  }
}

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getDashboardStats();
        const data = response.data || response.stats || response;
        setStats(data);
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Order breakdown for bar chart
  const orderBreakdown = stats
    ? [
        { name: "Pending", count: stats.pendingOrders || 0, fill: "#F59E0B" },
        { name: "Confirmed", count: stats.confirmedOrders || 0, fill: "#3B82F6" },
        { name: "Shipped", count: stats.shippedOrders || 0, fill: "#06B6D4" },
        { name: "Delivered", count: stats.deliveredOrders || 0, fill: "#22C55E" },
        { name: "Cancelled", count: stats.cancelledOrders || 0, fill: "#EF4444" },
      ]
    : [];

  // User pie chart
  const userPieData = stats
    ? [
        { name: "Active Users", value: stats.activeUsers || 0, color: "#22C55E" },
        { name: "Disabled Users", value: stats.disabledUsers || 0, color: "#EF4444" },
      ].filter((d) => d.value > 0)
    : [];

  // Content pie chart
  const pieData = stats
    ? [
        { name: "Posts", value: stats.totalPosts || 0, color: "#8B5CF6" },
        { name: "Journals", value: stats.totalJournals || 0, color: "#14B8A6" },
        { name: "FAQs", value: stats.totalFaqs || 0, color: "#F59E0B" },
        { name: "Herbs", value: stats.totalHerbs || 0, color: "#22C55E" },
        { name: "Crystals", value: stats.totalCrystals || 0, color: "#3B82F6" },
        { name: "Pages", value: stats.totalPages || 0, color: "#6B7280" },
      ].filter((d) => d.value > 0)
    : [];

  const statCards = [
    { name: "Total Users", value: stats?.totalUsers ?? 0, icon: UsersIcon, color: "from-blue-500 to-blue-600" },
    { name: "Active Users", value: stats?.activeUsers ?? 0, icon: UserCheck, color: "from-green-500 to-green-600" },
    { name: "Disabled Users", value: stats?.disabledUsers ?? 0, icon: UserX, color: "from-red-400 to-red-500" },
    { name: "New This Week", value: stats?.newUsersThisWeek ?? 0, icon: UserPlus, color: "from-indigo-500 to-indigo-600" },
  ];

  const contentCards = [
    { name: "Total Posts", value: stats?.totalPosts ?? 0, icon: FileText, color: "from-purple-500 to-purple-600" },
    { name: "Journal Entries", value: stats?.totalJournals ?? 0, icon: BookOpen, color: "from-teal-500 to-teal-600" },
    { name: "FAQs", value: stats?.totalFaqs ?? 0, icon: HelpCircle, color: "from-amber-500 to-amber-600" },
    { name: "Content Pages", value: stats?.totalPages ?? 0, icon: File, color: "from-cyan-500 to-cyan-600" },
  ];

  return (
    <div className="p-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">Dashboard Overview</h1>
        <p className="text-[#6b6b88]">Welcome back! Here's what's happening today.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* ═══ Order / Revenue Highlights ═══ */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            name: "Total Revenue",
            value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`,
            icon: DollarSign,
            color: "from-emerald-500 to-emerald-600",
            raw: true,
          },
          {
            name: "Total Orders",
            value: stats?.totalOrders ?? 0,
            icon: ShoppingCart,
            color: "from-blue-500 to-blue-600",
          },
          {
            name: "Orders This Week",
            value: stats?.ordersThisWeek ?? 0,
            icon: TrendingUp,
            color: "from-violet-500 to-violet-600",
          },
          {
            name: "Pending Orders",
            value: stats?.pendingOrders ?? 0,
            icon: Clock,
            color: "from-orange-500 to-orange-600",
          },
        ].map((stat) => (
          <div key={stat.name} className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b6b88]">{stat.name}</p>
                {loading ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Loader className="size-4 animate-spin text-[#0048ff]" />
                    <span className="text-sm text-[#6b6b88]">Loading...</span>
                  </div>
                ) : (
                  <p className="mt-2 text-3xl font-semibold text-[#090838]">
                    {stat.raw ? stat.value : (stat.value as number).toLocaleString()}
                  </p>
                )}
              </div>
              <div className={`flex size-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="size-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Order Status Breakdown + Recent Orders ═══ */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Status Bar Chart */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#090838]">Order Status Breakdown</h2>
          {loading ? (
            <div className="flex h-[280px] items-center justify-center">
              <Loader className="size-8 animate-spin text-[#0048ff]" />
            </div>
          ) : (stats?.totalOrders ?? 0) === 0 ? (
            <div className="flex h-[280px] flex-col items-center justify-center">
              <Package className="size-12 text-gray-200" />
              <p className="mt-3 text-sm text-[#6b6b88]">No orders yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={orderBreakdown} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b6b88" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6b6b88" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {orderBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#090838]">Recent Orders</h2>
            <button
              onClick={() => navigate("/orders")}
              className="text-sm font-medium text-[#0048ff] hover:underline"
            >
              View All
            </button>
          </div>
          {loading ? (
            <div className="flex h-[280px] items-center justify-center">
              <Loader className="size-8 animate-spin text-[#0048ff]" />
            </div>
          ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
            <div className="flex h-[280px] flex-col items-center justify-center">
              <Package className="size-12 text-gray-200" />
              <p className="mt-3 text-sm text-[#6b6b88]">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between rounded-lg border border-[#e1e1e7] p-3 transition-colors hover:bg-[#f9f9fb] cursor-pointer"
                  onClick={() => navigate("/orders")}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#090838]">{order.orderId}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#6b6b88]">
                      {order.user?.fullName || "Unknown"} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#090838]">${order.totalAmount.toFixed(2)}</p>
                    <span className={`text-[10px] font-medium ${PAYMENT_COLORS[order.paymentStatus] || ""}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Top Products + Order Quick Stats ═══ */}
      {stats && (stats.topProducts?.length > 0) && (
        <div className="mb-8 rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#090838]">Top Selling Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e1e1e7]">
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Type</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Units Sold</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-[#6b6b88]">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p, idx) => (
                  <tr key={p._id || idx} className="border-b border-[#f0f0f5] last:border-0">
                    <td className="px-4 py-3 text-sm font-medium text-[#090838]">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.type === "herb" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {p.type === "herb" ? "🌿 Herb" : "💎 Crystal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-[#090838]">{p.totalSold}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">${p.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ User Stats ═══ */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b6b88]">{stat.name}</p>
                {loading ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Loader className="size-4 animate-spin text-[#0048ff]" />
                    <span className="text-sm text-[#6b6b88]">Loading...</span>
                  </div>
                ) : (
                  <p className="mt-2 text-3xl font-semibold text-[#090838]">{stat.value.toLocaleString()}</p>
                )}
              </div>
              <div className={`flex size-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="size-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Content Stats ═══ */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {contentCards.map((stat) => (
          <div key={stat.name} className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b6b88]">{stat.name}</p>
                {loading ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Loader className="size-4 animate-spin text-[#0048ff]" />
                    <span className="text-sm text-[#6b6b88]">Loading...</span>
                  </div>
                ) : (
                  <p className="mt-2 text-3xl font-semibold text-[#090838]">{stat.value.toLocaleString()}</p>
                )}
              </div>
              <div className={`flex size-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="size-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Charts Row ═══ */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Distribution */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#090838]">User Distribution</h2>
          {loading ? (
            <div className="flex h-[280px] items-center justify-center">
              <Loader className="size-8 animate-spin text-[#0048ff]" />
            </div>
          ) : userPieData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center">
              <p className="text-sm text-[#6b6b88]">No user data available</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={userPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {userPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {userPieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-[#6b6b88]">{item.name}</span>
                    </div>
                    <span className="font-medium text-[#090838]">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content Distribution */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#090838]">Content Distribution</h2>
          {loading ? (
            <div className="flex h-[280px] items-center justify-center">
              <Loader className="size-8 animate-spin text-[#0048ff]" />
            </div>
          ) : pieData.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center">
              <p className="text-sm text-[#6b6b88]">No content data available</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-[#6b6b88]">{item.name}</span>
                    </div>
                    <span className="font-medium text-[#090838]">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ Products ═══ */}
      {stats && (stats.totalHerbs > 0 || stats.totalCrystals > 0) && (
        <div className="mb-8 rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#090838]">Products</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-lg border border-[#e1e1e7] p-4">
              <div className="flex size-14 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                <Leaf className="size-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#6b6b88]">Total Herbs</p>
                <p className="text-2xl font-semibold text-[#090838]">{stats.totalHerbs.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-[#e1e1e7] p-4">
              <div className="flex size-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Gem className="size-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#6b6b88]">Total Crystals</p>
                <p className="text-2xl font-semibold text-[#090838]">{stats.totalCrystals.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Quick Links ═══ */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          { label: "Manage Users", path: "/users" },
          { label: "View Orders", path: "/orders" },
          { label: "Products", path: "/spiritual-elements" },
          { label: "Posts", path: "/posts" },
          { label: "Settings", path: "/settings" },
        ].map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="rounded-lg border border-[#e1e1e7] bg-white p-4 text-center text-sm font-medium text-[#090838] transition-colors hover:border-[#0048ff] hover:bg-blue-50"
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
}
