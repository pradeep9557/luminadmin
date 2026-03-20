import { useState, useEffect } from "react";
import { Bell, Check, AlertCircle, X, Search, Filter, Trash2, CheckCircle, Loader } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, bulkDeleteNotifications } from "../api";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  date: string;
  type: "info" | "success" | "warning";
  read: boolean;
  category: "order" | "payment" | "user" | "inventory" | "service";
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "read">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [operationLoading, setOperationLoading] = useState(false);

  // Fetch notifications on mount and when filters change
  useEffect(() => {
    fetchNotifications();
  }, [filterType, filterCategory, searchQuery]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        read: filterType === "unread" ? false : filterType === "read" ? true : undefined,
        category: filterCategory === "all" ? undefined : filterCategory,
        startDate: undefined, // Can be extended if needed
      };

      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined)
      );

      const response = await getNotifications(cleanParams as any);
      const notificationsData = Array.isArray(response) ? response
        : response.data ? response.data
        : response.notifications ? response.notifications
        : [];
      const paginationData = response.pagination || { page: 1, limit: 20, total: notificationsData.length, totalPages: Math.ceil(notificationsData.length / 20) };
      setNotifications(notificationsData);
      setPagination(paginationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Client-side search filtering (search is applied on top of API results)
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const markAsRead = async (id: number) => {
    try {
      setOperationLoading(true);
      await markNotificationRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark notification as read");
    } finally {
      setOperationLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setOperationLoading(true);
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all notifications as read");
    } finally {
      setOperationLoading(false);
    }
  };

  const deleteNotificationItem = async (id: number) => {
    try {
      setOperationLoading(true);
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notification");
    } finally {
      setOperationLoading(false);
    }
  };

  const deleteSelected = async () => {
    try {
      setOperationLoading(true);
      await bulkDeleteNotifications(selectedNotifications);
      setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete selected notifications");
    } finally {
      setOperationLoading(false);
    }
  };

  const toggleSelectNotification = (id: number) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(nId => nId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  return (
    <div className="h-full overflow-auto bg-[#f5f6fa] p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-[#090838]">Notifications</h1>
          <p className="text-[#6b6b88]">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-[#e1e1e7] bg-white p-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6b6b88]" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#e1e1e7] py-2 pl-10 pr-4 text-sm focus:border-[#0048ff] focus:outline-none"
            />
          </div>

          {/* Filter by Read Status */}
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-[#6b6b88]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "unread" | "read")}
              className="rounded-xl border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Filter by Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="order">Orders</option>
            <option value="payment">Payments</option>
            <option value="user">Users</option>
            <option value="inventory">Inventory</option>
            <option value="service">Services</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[#0048ff]/20 bg-[#0048ff]/5 p-4">
            <p className="text-sm font-medium text-[#090838]">
              {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={deleteSelected}
                disabled={operationLoading}
                className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={selectAll}
            disabled={loading || filteredNotifications.length === 0}
            className="text-sm text-[#0048ff] hover:underline disabled:opacity-50"
          >
            {selectedNotifications.length === filteredNotifications.length ? "Deselect All" : "Select All"}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={operationLoading}
              className="flex items-center gap-2 rounded-xl bg-[#0048ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#0036cc] disabled:opacity-50"
            >
              <CheckCircle className="size-4" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-xl border border-[#e1e1e7] bg-white p-12 text-center">
              <Loader className="mx-auto mb-3 size-8 animate-spin text-[#6b6b88]" />
              <p className="text-lg font-medium text-[#090838]">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-xl border border-[#e1e1e7] bg-white p-12 text-center">
              <Bell className="mx-auto mb-3 size-16 text-[#6b6b88]" />
              <p className="text-lg font-medium text-[#090838]">No notifications found</p>
              <p className="mt-1 text-sm text-[#6b6b88]">
                {searchQuery ? "Try adjusting your search or filters" : "You're all caught up!"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border border-[#e1e1e7] bg-white p-5 transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-[#0048ff]" : ""
                } ${
                  selectedNotifications.includes(notification.id) ? "ring-2 ring-[#0048ff]" : ""
                }`}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelectNotification(notification.id)}
                    className="mt-1 size-5 rounded border-[#e1e1e7] text-[#0048ff] focus:ring-[#0048ff]"
                  />

                  {/* Icon */}
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                      notification.type === "success"
                        ? "bg-green-100"
                        : notification.type === "warning"
                        ? "bg-yellow-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {notification.type === "success" ? (
                      <Check className="size-6 text-green-600" />
                    ) : notification.type === "warning" ? (
                      <AlertCircle className="size-6 text-yellow-600" />
                    ) : (
                      <Bell className="size-6 text-blue-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#090838]">{notification.title}</h3>
                          {!notification.read && (
                            <span className="rounded-full bg-[#0048ff] px-2 py-0.5 text-xs font-medium text-white">
                              New
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[#6b6b88]">{notification.message}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <p className="text-xs text-[#6b6b88]">{notification.time}</p>
                          <span className="rounded-full bg-[#f5f6fa] px-2 py-0.5 text-xs capitalize text-[#6b6b88]">
                            {notification.category}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            disabled={operationLoading}
                            className="rounded-xl p-2 text-[#0048ff] hover:bg-blue-50 disabled:opacity-50"
                            title="Mark as read"
                          >
                            <Check className="size-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotificationItem(notification.id)}
                          disabled={operationLoading}
                          className="rounded-xl p-2 text-[#6b6b88] hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Delete"
                        >
                          <X className="size-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results Count */}
        {filteredNotifications.length > 0 && !loading && (
          <div className="mt-6 text-center">
            <p className="text-sm text-[#6b6b88]">
              Showing {filteredNotifications.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
