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
  ArrowUp,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router";
import { getDashboardStats } from "../api";

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
        // Handle different response wrappers
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

  // Build stat cards from real API data
  const statCards = [
    {
      name: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: UsersIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Active Users",
      value: stats?.activeUsers ?? 0,
      icon: UserCheck,
      color: "from-green-500 to-green-600",
    },
    {
      name: "Disabled Users",
      value: stats?.disabledUsers ?? 0,
      icon: UserX,
      color: "from-red-400 to-red-500",
    },
    {
      name: "New This Week",
      value: stats?.newUsersThisWeek ?? 0,
      icon: UserPlus,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const contentCards = [
    {
      name: "Total Posts",
      value: stats?.totalPosts ?? 0,
      icon: FileText,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Journal Entries",
      value: stats?.totalJournals ?? 0,
      icon: BookOpen,
      color: "from-teal-500 to-teal-600",
    },
    {
      name: "FAQs",
      value: stats?.totalFaqs ?? 0,
      icon: HelpCircle,
      color: "from-amber-500 to-amber-600",
    },
    {
      name: "Content Pages",
      value: stats?.totalPages ?? 0,
      icon: File,
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  // Pie chart for content distribution
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

  // Pie chart for user distribution
  const userPieData = stats
    ? [
        { name: "Active Users", value: stats.activeUsers || 0, color: "#22C55E" },
        { name: "Disabled Users", value: stats.disabledUsers || 0, color: "#EF4444" },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="p-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="mb-2 font-['Homenaje:Regular',sans-serif] text-3xl text-[#090838]">
          Dashboard Overview
        </h1>
        <p className="text-[#6b6b88]">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* User Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm"
          >
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
                    {stat.value.toLocaleString()}
                  </p>
                )}
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

      {/* Content Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {contentCards.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm"
          >
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
                    {stat.value.toLocaleString()}
                  </p>
                )}
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
                  <Pie
                    data={userPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
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
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
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

      {/* Products */}
      {stats && (stats.totalHerbs > 0 || stats.totalCrystals > 0) && (
        <div className="rounded-xl border border-[#e1e1e7] bg-white p-6 shadow-sm">
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

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <button
          onClick={() => navigate("/users")}
          className="rounded-lg border border-[#e1e1e7] bg-white p-4 text-center text-sm font-medium text-[#090838] transition-colors hover:border-[#0048ff] hover:bg-blue-50"
        >
          Manage Users
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="rounded-lg border border-[#e1e1e7] bg-white p-4 text-center text-sm font-medium text-[#090838] transition-colors hover:border-[#0048ff] hover:bg-blue-50"
        >
          Settings
        </button>
        <button
          onClick={() => navigate("/spiritual-elements")}
          className="rounded-lg border border-[#e1e1e7] bg-white p-4 text-center text-sm font-medium text-[#090838] transition-colors hover:border-[#0048ff] hover:bg-blue-50"
        >
          Products
        </button>
        <button
          onClick={() => navigate("/posts")}
          className="rounded-lg border border-[#e1e1e7] bg-white p-4 text-center text-sm font-medium text-[#090838] transition-colors hover:border-[#0048ff] hover:bg-blue-50"
        >
          Posts
        </button>
      </div>
    </div>
  );
}
