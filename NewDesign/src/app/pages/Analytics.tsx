import { useState } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Package, Star } from "lucide-react";

const monthlyData = {
  "Last 3 months": [
    { month: "Jan", revenue: 42000, users: 1320, orders: 580 },
    { month: "Feb", revenue: 45000, users: 1450, orders: 620 },
    { month: "Mar", revenue: 48000, users: 1680, orders: 680 },
  ],
  "Last 6 months": [
    { month: "Oct", revenue: 35000, users: 1050, orders: 450 },
    { month: "Nov", revenue: 38000, users: 1180, orders: 490 },
    { month: "Dec", revenue: 42000, users: 1320, orders: 580 },
    { month: "Jan", revenue: 45000, users: 1450, orders: 620 },
    { month: "Feb", revenue: 47000, users: 1600, orders: 650 },
    { month: "Mar", revenue: 48000, users: 1680, orders: 680 },
  ],
  "Last 7 months": [
    { month: "Sep", revenue: 28000, users: 850, orders: 320 },
    { month: "Oct", revenue: 32000, users: 920, orders: 420 },
    { month: "Nov", revenue: 35000, users: 1050, orders: 450 },
    { month: "Dec", revenue: 38000, users: 1180, orders: 490 },
    { month: "Jan", revenue: 42000, users: 1320, orders: 580 },
    { month: "Feb", revenue: 45000, users: 1450, orders: 620 },
    { month: "Mar", revenue: 48000, users: 1680, orders: 680 },
  ],
  "This year": [
    { month: "Jan", revenue: 42000, users: 1320, orders: 580 },
    { month: "Feb", revenue: 45000, users: 1450, orders: 620 },
    { month: "Mar", revenue: 48000, users: 1680, orders: 680 },
  ],
};

const dailyData = [
  { day: "Mon", revenue: 6800, orders: 95 },
  { day: "Tue", revenue: 7200, orders: 102 },
  { day: "Wed", revenue: 6500, orders: 88 },
  { day: "Thu", revenue: 7800, orders: 110 },
  { day: "Fri", revenue: 8400, orders: 118 },
  { day: "Sat", revenue: 9200, orders: 132 },
  { day: "Sun", revenue: 7600, orders: 105 },
];

const servicePerformance = [
  { name: "Birth Chart", revenue: 174965, orders: 3500, avgRating: 4.9 },
  { name: "Tarot", revenue: 83972, orders: 2800, avgRating: 4.8 },
  { name: "Compatibility", revenue: 87978, orders: 2200, avgRating: 4.7 },
  { name: "Horoscope", revenue: 35982, orders: 1800, avgRating: 4.6 },
  { name: "Career", revenue: 89985, orders: 1500, avgRating: 4.9 },
];

const topAstrologers = [
  { name: "Dr. Maya Singh", orders: 456, revenue: "$22,800", rating: 4.9, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" },
  { name: "Luna Martinez", orders: 389, revenue: "$19,450", rating: 4.8, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop" },
  { name: "Stella Chen", orders: 342, revenue: "$17,100", rating: 4.9, avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&h=100&fit=crop" },
  { name: "Orion Blake", orders: 298, revenue: "$14,900", rating: 4.7, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
  { name: "Aurora Lee", orders: 267, revenue: "$13,350", rating: 4.8, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
];

type TimeRange = "Last 3 months" | "Last 6 months" | "Last 7 months" | "This year";

export function Analytics() {
  const [revenueTimeRange, setRevenueTimeRange] = useState<TimeRange>("Last 7 months");
  const [userTimeRange, setUserTimeRange] = useState<TimeRange>("Last 7 months");

  const revenueData = monthlyData[revenueTimeRange];
  const userData = monthlyData[userTimeRange];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
          Analytics Dashboard
        </h1>
        <p className="text-[#6b6b88]">Track performance metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Total Revenue</p>
              <p className="mt-2 text-3xl font-semibold text-[#090838]">$268,392</p>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="size-4 text-green-500" />
                <span className="text-sm text-green-500">+23.5%</span>
                <span className="text-sm text-[#6b6b88]">vs last month</span>
              </div>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="size-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Total Users</p>
              <p className="mt-2 text-3xl font-semibold text-[#090838]">12,543</p>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="size-4 text-green-500" />
                <span className="text-sm text-green-500">+15.8%</span>
                <span className="text-sm text-[#6b6b88]">vs last month</span>
              </div>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
              <Users className="size-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Total Orders</p>
              <p className="mt-2 text-3xl font-semibold text-[#090838]">5,430</p>
              <div className="mt-2 flex items-center gap-1">
                <TrendingUp className="size-4 text-green-500" />
                <span className="text-sm text-green-500">+18.2%</span>
                <span className="text-sm text-[#6b6b88]">vs last month</span>
              </div>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-purple-100">
              <Package className="size-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#6b6b88]">Avg. Rating</p>
              <p className="mt-2 text-3xl font-semibold text-[#090838]">4.8</p>
              <div className="mt-2 flex items-center gap-1">
                <TrendingDown className="size-4 text-red-500" />
                <span className="text-sm text-red-500">-0.1</span>
                <span className="text-sm text-[#6b6b88]">vs last month</span>
              </div>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-yellow-100">
              <Star className="size-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#090838]">Revenue Trend</h2>
              <p className="text-sm text-[#6b6b88]">Last 7 months performance</p>
            </div>
            <select 
              value={revenueTimeRange}
              onChange={(e) => setRevenueTimeRange(e.target.value as TimeRange)}
              className="rounded-lg border border-[#0048ff] bg-white px-4 py-2 text-sm text-[#0048ff] focus:border-[#0048ff] focus:outline-none"
            >
              <option value="Last 3 months">Last 3 months</option>
              <option value="Last 6 months">Last 6 months</option>
              <option value="Last 7 months">Last 7 months</option>
              <option value="This year">This year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e1e7" />
              <XAxis dataKey="month" stroke="#6b6b88" />
              <YAxis stroke="#6b6b88" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0048ff"
                fill="#0048ff"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#090838]">User Growth</h2>
              <p className="text-sm text-[#6b6b88]">New user registrations</p>
            </div>
            <select 
              value={userTimeRange}
              onChange={(e) => setUserTimeRange(e.target.value as TimeRange)}
              className="rounded-lg border border-[#0048ff] bg-white px-4 py-2 text-sm text-[#0048ff] focus:border-[#0048ff] focus:outline-none"
            >
              <option value="Last 3 months">Last 3 months</option>
              <option value="Last 6 months">Last 6 months</option>
              <option value="Last 7 months">Last 7 months</option>
              <option value="This year">This year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e1e7" />
              <XAxis dataKey="month" stroke="#6b6b88" />
              <YAxis stroke="#6b6b88" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Performance */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#090838]">Daily Performance</h2>
              <p className="text-sm text-[#6b6b88]">This week's revenue and orders</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e1e7" />
              <XAxis dataKey="day" stroke="#6b6b88" />
              <YAxis stroke="#6b6b88" />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#0048ff" radius={[8, 8, 0, 0]} />
              <Bar dataKey="orders" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Astrologers */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#090838]">Top Astrologers</h2>
          <div className="space-y-4">
            {topAstrologers.map((astrologer, index) => (
              <div key={astrologer.name} className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0048ff] to-[#8B5CF6] text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <img
                  src={astrologer.avatar}
                  alt={astrologer.name}
                  className="size-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#090838]">{astrologer.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-[#6b6b88]">{astrologer.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#090838]">{astrologer.revenue}</p>
                  <p className="text-xs text-[#6b6b88]">{astrologer.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Performance Table */}
      <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-[#090838]">Service Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e1e1e7] text-left">
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">Service Name</th>
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">Total Orders</th>
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">Revenue</th>
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">Avg. Rating</th>
                <th className="pb-3 text-sm font-medium text-[#6b6b88]">Performance</th>
              </tr>
            </thead>
            <tbody>
              {servicePerformance.map((service) => (
                <tr key={service.name} className="border-b border-[#e1e1e7] last:border-0">
                  <td className="py-4 text-sm font-medium text-[#090838]">{service.name}</td>
                  <td className="py-4 text-sm text-[#6b6b88]">{service.orders.toLocaleString()}</td>
                  <td className="py-4 text-sm font-medium text-[#090838]">
                    ${service.revenue.toLocaleString()}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-[#090838]">{service.avgRating}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-[#e1e1e7]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0048ff] to-[#8B5CF6]"
                        style={{ width: `${(service.orders / 3500) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
