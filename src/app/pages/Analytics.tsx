import { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Package, Star } from "lucide-react";
import {
  getAnalyticsOverview,
  getRevenueAnalytics,
  getUserAnalytics,
  getOrderAnalytics,
  getTopPerformers,
  getServiceAnalytics,
} from "../api";

type TimeRange = "7d" | "30d" | "90d" | "1y";

interface OverviewData {
  revenue: number;
  revenueChange: number;
  users: number;
  usersChange: number;
  orders: number;
  ordersChange: number;
  rating: number;
  ratingChange: number;
}

interface ChartDataPoint {
  month?: string;
  day?: string;
  revenue: number;
  orders?: number;
  users?: number;
}

interface Astrologer {
  name: string;
  orders: number;
  revenue: string;
  rating: number;
  avatar: string;
}

interface Service {
  name: string;
  orders: number;
  revenue: number;
  avgRating: number;
}

export function Analytics() {
  const [revenueTimeRange, setRevenueTimeRange] = useState<TimeRange>("90d");
  const [userTimeRange, setUserTimeRange] = useState<TimeRange>("90d");

  // Overview data
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  // Revenue data
  const [revenueData, setRevenueData] = useState<ChartDataPoint[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);

  // User data
  const [userData, setUserData] = useState<ChartDataPoint[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Order data
  const [orderData, setOrderData] = useState<ChartDataPoint[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Top performers
  const [topPerformers, setTopPerformers] = useState<Astrologer[]>([]);
  const [performersLoading, setPerformersLoading] = useState(false);
  const [performersError, setPerformersError] = useState<string | null>(null);

  // Service analytics
  const [servicePerformance, setServicePerformance] = useState<Service[]>([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Fetch overview on mount
  useEffect(() => {
    const fetchOverview = async () => {
      setOverviewLoading(true);
      setOverviewError(null);
      try {
        const response = await getAnalyticsOverview("90d");
        const data = Array.isArray(response) ? response[0]
          : response.data ? response.data
          : response.overview ? response.overview
          : response;
        setOverview(data);
      } catch (error) {
        setOverviewError(error instanceof Error ? error.message : "Failed to fetch overview");
      } finally {
        setOverviewLoading(false);
      }
    };

    fetchOverview();
  }, []);

  // Fetch revenue data when time range changes
  useEffect(() => {
    const fetchRevenueData = async () => {
      setRevenueLoading(true);
      setRevenueError(null);
      try {
        const response = await getRevenueAnalytics();
        const data = Array.isArray(response) ? response
          : response.data ? response.data
          : response.revenue ? response.revenue
          : [];
        setRevenueData(data);
      } catch (error) {
        setRevenueError(error instanceof Error ? error.message : "Failed to fetch revenue data");
      } finally {
        setRevenueLoading(false);
      }
    };

    fetchRevenueData();
  }, [revenueTimeRange]);

  // Fetch user data when time range changes
  useEffect(() => {
    const fetchUserData = async () => {
      setUserLoading(true);
      setUserError(null);
      try {
        const response = await getUserAnalytics();
        const data = Array.isArray(response) ? response
          : response.data ? response.data
          : response.users ? response.users
          : [];
        setUserData(data);
      } catch (error) {
        setUserError(error instanceof Error ? error.message : "Failed to fetch user data");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [userTimeRange]);

  // Fetch order data on mount
  useEffect(() => {
    const fetchOrderData = async () => {
      setOrderLoading(true);
      setOrderError(null);
      try {
        const response = await getOrderAnalytics();
        const data = Array.isArray(response) ? response
          : response.data ? response.data
          : response.orders ? response.orders
          : [];
        setOrderData(data);
      } catch (error) {
        setOrderError(error instanceof Error ? error.message : "Failed to fetch order data");
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  // Fetch top performers on mount
  useEffect(() => {
    const fetchPerformers = async () => {
      setPerformersLoading(true);
      setPerformersError(null);
      try {
        const response = await getTopPerformers();
        const data = Array.isArray(response) ? response
          : response.data ? response.data
          : response.performers ? response.performers
          : response.astrologers ? response.astrologers
          : [];
        setTopPerformers(data);
      } catch (error) {
        setPerformersError(error instanceof Error ? error.message : "Failed to fetch top performers");
      } finally {
        setPerformersLoading(false);
      }
    };

    fetchPerformers();
  }, []);

  // Fetch service analytics on mount
  useEffect(() => {
    const fetchServiceData = async () => {
      setServiceLoading(true);
      setServiceError(null);
      try {
        const response = await getServiceAnalytics();
        const data = Array.isArray(response) ? response
          : response.data ? response.data
          : response.services ? response.services
          : response.analytics ? response.analytics
          : [];
        setServicePerformance(data);
      } catch (error) {
        setServiceError(error instanceof Error ? error.message : "Failed to fetch service analytics");
      } finally {
        setServiceLoading(false);
      }
    };

    fetchServiceData();
  }, []);

  const renderMetricCard = (
    label: string,
    value: string | number,
    change: number,
    icon: React.ReactNode,
    iconBgColor: string,
    iconColor: string,
    loading: boolean
  ) => (
    <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6b6b88]">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200" />
          ) : (
            <>
              <p className="mt-2 text-3xl font-semibold text-[#090838]">{value}</p>
              <div className="mt-2 flex items-center gap-1">
                {change >= 0 ? (
                  <TrendingUp className="size-4 text-green-500" />
                ) : (
                  <TrendingDown className="size-4 text-red-500" />
                )}
                <span className={`text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                </span>
                <span className="text-sm text-[#6b6b88]">vs last period</span>
              </div>
            </>
          )}
        </div>
        <div className={`flex size-12 items-center justify-center rounded-lg ${iconBgColor}`}>
          <div className={`${iconColor}`}>{icon}</div>
        </div>
      </div>
    </div>
  );

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
        {renderMetricCard(
          "Total Revenue",
          overview ? `$${overview.revenue.toLocaleString()}` : "-",
          overview?.revenueChange ?? 0,
          <DollarSign className="size-6 text-green-600" />,
          "bg-green-100",
          "text-green-600",
          overviewLoading
        )}

        {renderMetricCard(
          "Total Users",
          overview ? overview.users.toLocaleString() : "-",
          overview?.usersChange ?? 0,
          <Users className="size-6 text-blue-600" />,
          "bg-blue-100",
          "text-blue-600",
          overviewLoading
        )}

        {renderMetricCard(
          "Total Orders",
          overview ? overview.orders.toLocaleString() : "-",
          overview?.ordersChange ?? 0,
          <Package className="size-6 text-purple-600" />,
          "bg-purple-100",
          "text-purple-600",
          overviewLoading
        )}

        {renderMetricCard(
          "Avg. Rating",
          overview ? overview.rating.toFixed(1) : "-",
          overview?.ratingChange ?? 0,
          <Star className="size-6 text-yellow-600" />,
          "bg-yellow-100",
          "text-yellow-600",
          overviewLoading
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#090838]">Revenue Trend</h2>
              <p className="text-sm text-[#6b6b88]">Performance over time</p>
            </div>
            <select
              value={revenueTimeRange}
              onChange={(e) => setRevenueTimeRange(e.target.value as TimeRange)}
              className="rounded-lg border border-[#0048ff] bg-white px-4 py-2 text-sm text-[#0048ff] focus:border-[#0048ff] focus:outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          {revenueError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {revenueError}
            </div>
          )}
          {revenueLoading ? (
            <div className="h-80 animate-pulse rounded bg-gray-100" />
          ) : (
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
          )}
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
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          {userError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {userError}
            </div>
          )}
          {userLoading ? (
            <div className="h-80 animate-pulse rounded bg-gray-100" />
          ) : (
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
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Performance */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#090838]">Daily Performance</h2>
              <p className="text-sm text-[#6b6b88]">Revenue and orders</p>
            </div>
          </div>
          {orderError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {orderError}
            </div>
          )}
          {orderLoading ? (
            <div className="h-80 animate-pulse rounded bg-gray-100" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e1e7" />
                <XAxis dataKey="day" stroke="#6b6b88" />
                <YAxis stroke="#6b6b88" />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#0048ff" radius={[8, 8, 0, 0]} />
                <Bar dataKey="orders" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Astrologers */}
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#090838]">Top Astrologers</h2>
          {performersError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {performersError}
            </div>
          )}
          {performersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {topPerformers.map((astrologer, index) => (
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
          )}
        </div>
      </div>

      {/* Service Performance Table */}
      <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-[#090838]">Service Performance</h2>
        {serviceError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {serviceError}
          </div>
        )}
        {serviceLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
