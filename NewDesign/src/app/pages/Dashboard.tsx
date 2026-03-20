import { useState } from "react";
import { 
  Users as UsersIcon, 
  Package, 
  DollarSign, 
  TrendingUp,
  Star,
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router";

const stats = [
  {
    name: "Total Users",
    value: "12,543",
    change: "+12.5%",
    trend: "up",
    icon: UsersIcon,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Paid Users",
    value: "8,342",
    change: "+18.3%",
    trend: "up",
    icon: UsersIcon,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    name: "Active Orders",
    value: "1,832",
    change: "+8.2%",
    trend: "up",
    icon: Package,
    color: "from-purple-500 to-purple-600",
  },
  {
    name: "Revenue",
    value: "$48,392",
    change: "+23.1%",
    trend: "up",
    icon: DollarSign,
    color: "from-green-500 to-green-600",
  },
];

const revenueDataSets = {
  "Last 3 months": [
    { month: "Jan", revenue: 42000, orders: 580 },
    { month: "Feb", revenue: 45000, orders: 620 },
    { month: "Mar", revenue: 48000, orders: 680 },
  ],
  "Last 6 months": [
    { month: "Jan", revenue: 32000, orders: 420 },
    { month: "Feb", revenue: 38000, orders: 490 },
    { month: "Mar", revenue: 35000, orders: 450 },
    { month: "Apr", revenue: 42000, orders: 580 },
    { month: "May", revenue: 45000, orders: 620 },
    { month: "Jun", revenue: 48000, orders: 680 },
  ],
  "This year": [
    { month: "Jan", revenue: 32000, orders: 420 },
    { month: "Feb", revenue: 38000, orders: 490 },
    { month: "Mar", revenue: 35000, orders: 450 },
    { month: "Apr", revenue: 42000, orders: 580 },
    { month: "May", revenue: 45000, orders: 620 },
    { month: "Jun", revenue: 48000, orders: 680 },
    { month: "Jul", revenue: 51000, orders: 720 },
    { month: "Aug", revenue: 49000, orders: 690 },
    { month: "Sep", revenue: 53000, orders: 750 },
  ],
};

const servicesData = [
  { name: "Birth Chart", value: 3500, color: "#8B5CF6" },
  { name: "Tarot Reading", value: 2800, color: "#3B82F6" },
  { name: "Horoscope", value: 2200, color: "#10B981" },
  { name: "Compatibility", value: 1800, color: "#F59E0B" },
  { name: "Other", value: 1200, color: "#6B7280" },
];

const recentOrders = [
  {
    id: "ORD-1234",
    user: "Sarah Johnson",
    service: "Birth Chart Reading",
    amount: "$49.99",
    status: "completed",
    date: "2026-03-03",
  },
  {
    id: "ORD-1235",
    user: "Michael Chen",
    service: "Tarot Reading",
    amount: "$29.99",
    status: "pending",
    date: "2026-03-03",
  },
  {
    id: "ORD-1236",
    user: "Emma Williams",
    service: "Compatibility Report",
    amount: "$39.99",
    status: "completed",
    date: "2026-03-02",
  },
  {
    id: "ORD-1237",
    user: "James Brown",
    service: "Monthly Horoscope",
    amount: "$19.99",
    status: "in-progress",
    date: "2026-03-02",
  },
  {
    id: "ORD-1238",
    user: "Lisa Anderson",
    service: "Birth Chart Reading",
    amount: "$49.99",
    status: "completed",
    date: "2026-03-01",
  },
];

type TimeRange = "Last 3 months" | "Last 6 months" | "This year";

export function Dashboard() {
  const navigate = useNavigate();
  const [revenueTimeRange, setRevenueTimeRange] = useState<TimeRange>("Last 6 months");
  
  const revenueData = revenueDataSets[revenueTimeRange];

  const handleViewAllOrders = () => {
    navigate("/orders");
  };

  return (
    <div className="p-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
          Dashboard Overview
        </h1>
        <p className="text-[#6b6b88]">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#6b6b88]">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-[#090838]">{stat.value}</p>
                <div className="mt-2 flex items-center gap-1">
                  {stat.trend === "up" ? (
                    <ArrowUp className="size-4 text-green-500" />
                  ) : (
                    <ArrowDown className="size-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-[#6b6b88]">vs last month</span>
                </div>
              </div>
              <div
                className={`flex size-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}
              >
                <stat.icon className="size-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#090838]">Revenue Overview</h2>
              <p className="text-sm text-[#6b6b88]">Monthly revenue and order trends</p>
            </div>
            <select 
              value={revenueTimeRange}
              onChange={(e) => setRevenueTimeRange(e.target.value as TimeRange)}
              className="rounded-lg border border-[#0048ff] bg-white px-3 py-2 text-sm text-[#0048ff] focus:border-[#0048ff] focus:outline-none"
            >
              <option value="Last 3 months">Last 3 months</option>
              <option value="Last 6 months">Last 6 months</option>
              <option value="This year">This year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e1e7" />
              <XAxis dataKey="month" stroke="#6b6b88" />
              <YAxis stroke="#6b6b88" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0048ff"
                strokeWidth={2}
                dot={{ fill: "#0048ff", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Services Distribution */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#090838]">Services Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={servicesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {servicesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {servicesData.map((service) => (
              <div key={service.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: service.color }}></div>
                  <span className="text-[#6b6b88]">{service.name}</span>
                </div>
                <span className="font-medium text-[#090838]">{service.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#090838]">Recent Orders</h2>
          <button 
            onClick={handleViewAllOrders}
            className="text-sm font-medium text-[#0048ff] hover:underline"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e1e1e7] text-left">
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">Order ID</th>
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">User</th>
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">Service</th>
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">Amount</th>
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">Status</th>
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-[#e1e1e7] last:border-0 hover:bg-[#f5f6fa]">
                  <td className="py-4 text-sm font-medium text-[#090838]">{order.id}</td>
                  <td className="py-4 text-sm text-[#6b6b88]">{order.user}</td>
                  <td className="py-4 text-sm text-[#6b6b88]">{order.service}</td>
                  <td className="py-4 text-sm font-medium text-[#090838]">{order.amount}</td>
                  <td className="py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-[#6b6b88]">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
