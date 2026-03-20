import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Settings,
  Menu,
  Bell,
  Search,
  User,
  Sparkles,
  CreditCard,
  ShoppingBag,
  X,
  Check,
  AlertCircle,
  LogOut,
  MessageSquare,
  BookOpen,
  FileText,
  HelpCircle,
  Gem
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAppearance } from "../contexts/AppearanceContext";
import { clearToken, getNotifications as fetchNotificationsAPI, markNotificationRead, markAllNotificationsRead, deleteNotification as deleteNotificationAPI, globalSearch } from "../api";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning";
  read: boolean;
}

const initialNotifications: Notification[] = [];

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useAppearance();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Fetch notifications from API
  useEffect(() => {
    fetchNotificationsAPI({ limit: '10' })
      .then((res) => {
        const data = res.data || res;
        if (Array.isArray(data)) {
          setNotifications(data.map((n: any) => ({
            id: n.id || n._id,
            title: n.title,
            message: n.message,
            time: n.time || n.createdAt || '',
            type: n.type || 'info',
            read: n.read || false,
          })));
        }
      })
      .catch(() => {/* keep empty if API fails */});
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Orders", href: "/orders", icon: Package },
    { name: "Services", href: "/services", icon: Sparkles },
    { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
    { name: "Products", href: "/products", icon: ShoppingBag },
    { name: "Posts", href: "/posts", icon: MessageSquare },
    { name: "Journals", href: "/journals", icon: BookOpen },
    { name: "Pages", href: "/pages", icon: FileText },
    { name: "FAQs", href: "/faqs", icon: HelpCircle },
    { name: "Spiritual Elements", href: "/spiritual-elements", icon: Gem },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    markNotificationRead(String(id)).catch(() => {});
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    markAllNotificationsRead().catch(() => {});
  };

  const clearNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    deleteNotificationAPI(String(id)).catch(() => {});
  };

  return (
    <div className="flex h-screen bg-[#f5f6fa]">
      {/* Sidebar */}
      <aside 
        className={`text-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
        style={{ backgroundColor: settings.secondaryColor }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="h-10 object-contain" />
                ) : (
                  <>
                    <div 
                      className="flex size-10 items-center justify-center rounded-lg"
                      style={{ 
                        background: `linear-gradient(to bottom right, ${settings.primaryColor}, ${settings.secondaryColor})` 
                      }}
                    >
                      <Sparkles className="size-6 text-white" />
                    </div>
                    <span className="font-['Homenaje:Regular',sans-serif] text-xl">Lumin Guide</span>
                  </>
                )}
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 hover:bg-white/10"
            >
              <Menu className="size-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-white/20 to-white/10 text-white"
                      : "text-[#6b6b88] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="size-5 shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Admin Profile */}
          <div className="border-t border-white/10 px-3 py-4">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#b0b0b0]">
                <User className="size-5 text-[#090838]" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">Admin User</p>
                  <p className="truncate text-xs text-[#6b6b88]">admin@luminguide.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-[#e1e1e7] bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
                <input
                  type="text"
                  placeholder="Search users, orders, services..."
                  className="w-full rounded-lg border border-[#e1e1e7] py-2 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative rounded-lg p-2 hover:bg-[#f5f6fa]"
                >
                  <Bell className="size-5 text-[#6b6b88]" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-[#0048ff] text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationOpen(false)}
                    ></div>

                    {/* Dropdown Panel */}
                    <div className="absolute right-0 top-12 z-50 w-96 rounded-xl border border-[#e1e1e7] bg-white shadow-xl">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-[#e1e1e7] p-4">
                        <div>
                          <h3 className="font-semibold text-[#090838]">Notifications</h3>
                          <p className="text-xs text-[#6b6b88]">{unreadCount} unread</p>
                        </div>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs text-[#0048ff] hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="mx-auto mb-2 size-12 text-[#6b6b88]" />
                            <p className="text-sm text-[#6b6b88]">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              className={`cursor-pointer border-b border-[#e1e1e7] p-4 transition-colors last:border-0 ${
                                !notification.read ? "bg-blue-50" : "hover:bg-[#f5f6fa]"
                              }`}
                            >
                              <div className="flex gap-3">
                                {/* Icon */}
                                <div
                                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                                    notification.type === "success"
                                      ? "bg-green-100"
                                      : notification.type === "warning"
                                      ? "bg-yellow-100"
                                      : "bg-blue-100"
                                  }`}
                                >
                                  {notification.type === "success" ? (
                                    <Check className="size-5 text-green-600" />
                                  ) : notification.type === "warning" ? (
                                    <AlertCircle className="size-5 text-yellow-600" />
                                  ) : (
                                    <Bell className="size-5 text-blue-600" />
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-[#090838]">
                                        {notification.title}
                                      </p>
                                      <p className="mt-1 text-xs text-[#6b6b88]">
                                        {notification.message}
                                      </p>
                                      <p className="mt-2 text-xs text-[#6b6b88]">
                                        {notification.time}
                                      </p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearNotification(notification.id);
                                      }}
                                      className="ml-2 rounded p-1 hover:bg-white"
                                    >
                                      <X className="size-4 text-[#6b6b88]" />
                                    </button>
                                  </div>
                                  {!notification.read && (
                                    <div className="mt-2 flex items-center gap-2">
                                      <span className="size-2 rounded-full bg-[#0048ff]"></span>
                                      <span className="text-xs font-medium text-[#0048ff]">New</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="border-t border-[#e1e1e7] p-3">
                          <button 
                            onClick={() => {
                              setNotificationOpen(false);
                              navigate('/notifications');
                            }}
                            className="w-full rounded-lg py-2 text-sm font-medium text-[#0048ff] hover:bg-[#f5f6fa]"
                          >
                            View all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  clearToken();
                  navigate("/login");
                }}
                className="rounded-lg p-2 text-[#6b6b88] transition-colors hover:bg-red-50 hover:text-red-500"
                title="Logout"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}