const API_URL = import.meta.env.VITE_API_URL || 'https://lumin-guide-api.onrender.com';
const BASE = `${API_URL}/api`;

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

export function setToken(token: string): void {
  localStorage.setItem('admin_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('admin_token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request(path: string, opts: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  if (res.status === 401 || res.status === 403) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  // Handle non-JSON responses (e.g. 404 HTML pages)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`API endpoint not available (${res.status})`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error?.message || 'Request failed');
  return data;
}

// ─── Auth ────────────────────────────────────────────────────────
export const login = (email: string, password: string) =>
  fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(async (r) => {
    const contentType = r.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Login endpoint not available');
    }
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Login failed');
    return data;
  });

export const logout = () => request('/auth/logout', { method: 'POST' });

// ─── Dashboard ───────────────────────────────────────────────────
export const getDashboardStats = () => request('/admin/stats');
export const getRevenueChart = (period = '30d') => request(`/admin/stats/revenue?period=${period}`);
export const getUserGrowth = (period = '30d') => request(`/admin/stats/user-growth?period=${period}`);
export const getRecentOrders = (limit = 10) => request(`/admin/stats/recent-orders?limit=${limit}`);
export const getTopServices = () => request('/admin/stats/top-services');
export const getTopProducts = () => request('/admin/stats/top-products');

// ─── Users ───────────────────────────────────────────────────────
export const getUsers = (params?: Record<string, string>) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return request(`/admin/users${q ? `?${q}` : ''}`);
};
export const getUser = (id: string) => request(`/admin/users/${id}`);
export const createUser = (data: any) =>
  request('/admin/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id: string, data: any) =>
  request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteUser = (id: string) =>
  request(`/admin/users/${id}`, { method: 'DELETE' });
export const updateUserStatus = (id: string, _status?: string) =>
  request(`/admin/users/${id}/toggle-status`, { method: 'PATCH' });
export const updateUserSubscription = (id: string, subscription: string) =>
  request(`/admin/users/${id}/subscription`, { method: 'PATCH', body: JSON.stringify({ subscription }) });
export const getUserOrders = (id: string) => request(`/admin/users/${id}/orders`);
export const getUserActivity = (id: string) => request(`/admin/users/${id}/activity`);
export const bulkDeleteUsers = (userIds: number[]) =>
  request('/admin/users/bulk-delete', { method: 'POST', body: JSON.stringify({ userIds }) });
export const exportUsers = (format = 'csv') =>
  request(`/admin/users/export?format=${format}`, { method: 'POST' });

// ─── Orders ──────────────────────────────────────────────────────
export const getOrders = (params?: Record<string, string>) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return request(`/admin/orders${q ? `?${q}` : ''}`);
};
export const getOrder = (id: string) => request(`/admin/orders/${id}`);
export const createOrder = (data: any) =>
  request('/admin/orders', { method: 'POST', body: JSON.stringify(data) });
export const updateOrder = (id: string, data: any) =>
  request(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateOrderStatus = (id: string, status: string) =>
  request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const updatePaymentStatus = (id: string, paymentStatus: string) =>
  request(`/admin/orders/${id}/payment-status`, { method: 'PATCH', body: JSON.stringify({ paymentStatus }) });
export const deleteOrder = (id: string) =>
  request(`/admin/orders/${id}`, { method: 'DELETE' });
export const refundOrder = (id: string) =>
  request(`/admin/orders/${id}/refund`, { method: 'POST' });
export const getOrderTracking = (id: string) => request(`/admin/orders/${id}/tracking`);
export const bulkUpdateOrderStatus = (data: any) =>
  request('/admin/orders/bulk-update-status', { method: 'POST', body: JSON.stringify(data) });
export const exportOrders = () => request('/admin/orders/export', { method: 'POST' });

// ─── Services ────────────────────────────────────────────────────
export const getServices = (params?: Record<string, string>) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return request(`/admin/services${q ? `?${q}` : ''}`);
};
export const getService = (id: string) => request(`/admin/services/${id}`);
export const createService = (data: any) =>
  request('/admin/services', { method: 'POST', body: JSON.stringify(data) });
export const updateService = (id: string, data: any) =>
  request(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteService = (id: string) =>
  request(`/admin/services/${id}`, { method: 'DELETE' });
export const updateServiceStatus = (id: string, status: string) =>
  request(`/admin/services/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const getServiceCategories = () => request('/admin/services/categories');
export const duplicateService = (id: string) =>
  request(`/admin/services/${id}/duplicate`, { method: 'POST' });
export const getServiceBookings = (id: string) => request(`/admin/services/${id}/bookings`);
export const getServiceRevenue = (id: string) => request(`/admin/services/${id}/revenue`);

// ─── Products (uses SpiritualElements collection) ────────────────
export const getProducts = (params?: Record<string, string>) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return request(`/admin/spiritual-elements${q ? `?${q}` : ''}`);
};
export const getProduct = (id: string) => request(`/admin/spiritual-elements/${id}`);
export const createProduct = (data: any) =>
  request('/admin/spiritual-elements', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id: string, data: any) =>
  request(`/admin/spiritual-elements/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteProduct = (id: string) =>
  request(`/admin/spiritual-elements/${id}`, { method: 'DELETE' });
export const getProductCategories = () => request('/admin/spiritual-elements/categories');

// ─── Subscriptions ───────────────────────────────────────────────
export const getSubscriptionPlans = () => request('/admin/subscriptions/plans');
export const getSubscriptionPlan = (id: string) => request(`/admin/subscriptions/plans/${id}`);
export const createSubscriptionPlan = (data: any) =>
  request('/admin/subscriptions/plans', { method: 'POST', body: JSON.stringify(data) });
export const updateSubscriptionPlan = (id: string, data: any) =>
  request(`/admin/subscriptions/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSubscriptionPlan = (id: string) =>
  request(`/admin/subscriptions/plans/${id}`, { method: 'DELETE' });
export const getSubscribers = (params?: Record<string, string>) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return request(`/admin/subscriptions/subscribers${q ? `?${q}` : ''}`);
};
export const getSubscription = (id: string) => request(`/admin/subscriptions/${id}`);
export const cancelSubscription = (id: string) =>
  request(`/admin/subscriptions/${id}/cancel`, { method: 'POST' });
export const upgradeSubscription = (id: string, data: any) =>
  request(`/admin/subscriptions/${id}/upgrade`, { method: 'POST', body: JSON.stringify(data) });
export const getSubscriptionRevenue = () => request('/admin/subscriptions/revenue');
export const getChurnRate = () => request('/admin/subscriptions/churn-rate');

// ─── Analytics ───────────────────────────────────────────────────
export const getAnalyticsOverview = (period = '30d') =>
  request(`/admin/analytics/overview?period=${period}`);
export const getRevenueAnalytics = () => request('/admin/analytics/revenue');
export const getUserAnalytics = () => request('/admin/analytics/users');
export const getOrderAnalytics = () => request('/admin/analytics/orders');
export const getServiceAnalytics = () => request('/admin/analytics/services');
export const getProductAnalytics = () => request('/admin/analytics/products');
export const getConversionAnalytics = () => request('/admin/analytics/conversion');
export const getRetentionAnalytics = () => request('/admin/analytics/retention');
export const getTopPerformers = () => request('/admin/analytics/top-performers');
export const getGeographicAnalytics = () => request('/admin/analytics/geographic');
export const exportAnalytics = () => request('/admin/analytics/export', { method: 'POST' });

// ─── Notifications ───────────────────────────────────────────────
export const getNotifications = (params?: Record<string, string>) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return request(`/admin/notifications${q ? `?${q}` : ''}`);
};
export const getUnreadCount = () => request('/admin/notifications/unread-count');
export const createNotification = (data: any) =>
  request('/admin/notifications', { method: 'POST', body: JSON.stringify(data) });
export const markNotificationRead = (id: string) =>
  request(`/admin/notifications/${id}/read`, { method: 'PATCH' });
export const markAllNotificationsRead = () =>
  request('/admin/notifications/mark-all-read', { method: 'PATCH' });
export const deleteNotification = (id: string) =>
  request(`/admin/notifications/${id}`, { method: 'DELETE' });
export const bulkDeleteNotifications = (ids: string[]) =>
  request('/admin/notifications/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) });
export const getNotificationSettings = () => request('/admin/settings/notifications');
export const updateNotificationSettings = (data: any) =>
  request('/admin/settings/notifications', { method: 'PUT', body: JSON.stringify(data) });

// ─── Settings ────────────────────────────────────────────────────
export const getGeneralSettings = () => request('/admin/settings/general');
export const updateGeneralSettings = (data: any) =>
  request('/admin/settings/general', { method: 'PUT', body: JSON.stringify(data) });
export const getEmailSettings = () => request('/admin/settings/email');
export const updateEmailSettings = (data: any) =>
  request('/admin/settings/email', { method: 'PUT', body: JSON.stringify(data) });
export const sendTestEmail = () => request('/admin/settings/email/test', { method: 'POST' });
export const getSecuritySettings = () => request('/admin/settings/security');
export const updatePassword = (data: any) =>
  request('/admin/settings/security/password', { method: 'PUT', body: JSON.stringify(data) });
export const toggle2FA = (data: any) =>
  request('/admin/settings/security/2fa', { method: 'PUT', body: JSON.stringify(data) });
export const getLoginHistory = () => request('/admin/settings/security/login-history');
export const getAppearanceSettings = () => request('/admin/settings/appearance');
export const updateAppearanceSettings = (data: any) =>
  request('/admin/settings/appearance', { method: 'PUT', body: JSON.stringify(data) });

// ─── Payments ────────────────────────────────────────────────────
export const getPaymentGateways = () => request('/admin/payments/gateways');
export const getPaymentGateway = (id: string) => request(`/admin/payments/gateways/${id}`);
export const connectPaymentGateway = (id: string, data: any) =>
  request(`/admin/payments/gateways/${id}/connect`, { method: 'POST', body: JSON.stringify(data) });
export const configurePaymentGateway = (id: string, data: any) =>
  request(`/admin/payments/gateways/${id}/configure`, { method: 'PUT', body: JSON.stringify(data) });
export const disconnectPaymentGateway = (id: string) =>
  request(`/admin/payments/gateways/${id}/disconnect`, { method: 'DELETE' });
export const getTransactions = (params?: Record<string, string>) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return request(`/admin/payments/transactions${q ? `?${q}` : ''}`);
};
export const testPaymentConnection = () =>
  request('/admin/payments/test-connection', { method: 'POST' });

// ─── File Upload ─────────────────────────────────────────────────
export const uploadImage = (file: File) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);
  return fetch(`${BASE}/upload/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  }).then(async (r) => {
    const contentType = r.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Upload endpoint not available');
    }
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Upload failed');
    return data;
  });
};

// ─── Search ──────────────────────────────────────────────────────
export const globalSearch = (q: string, type?: string, limit = 10) => {
  const params = new URLSearchParams({ q, limit: String(limit) });
  if (type) params.set('type', type);
  return request(`/admin/search?${params}`);
};

// ─── Legacy endpoints (from original admin) ──────────────────────
export const getPages = () => request('/admin/pages');
export const updatePage = (slug: string, data: any) =>
  request(`/admin/pages/${slug}`, { method: 'PUT', body: JSON.stringify(data) });

export const getFaqs = () => request('/admin/faqs');
export const createFaq = (data: any) =>
  request('/admin/faqs', { method: 'POST', body: JSON.stringify(data) });
export const updateFaq = (id: string, data: any) =>
  request(`/admin/faqs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteFaq = (id: string) =>
  request(`/admin/faqs/${id}`, { method: 'DELETE' });

export const getSpiritualElements = (params?: Record<string, string>) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return request(`/admin/spiritual-elements?${q}`);
};
export const getSpiritualElement = (id: string) => request(`/admin/spiritual-elements/${id}`);
export const createSpiritualElement = (data: any) =>
  request('/admin/spiritual-elements', { method: 'POST', body: JSON.stringify(data) });
export const updateSpiritualElement = (id: string, data: any) =>
  request(`/admin/spiritual-elements/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteSpiritualElement = (id: string) =>
  request(`/admin/spiritual-elements/${id}`, { method: 'DELETE' });

export const getJournals = (params?: Record<string, string>) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return request(`/admin/journals?${q}`);
};
export const getJournal = (id: string) => request(`/admin/journals/${id}`);
export const updateJournal = (id: string, data: any) =>
  request(`/admin/journals/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteJournal = (id: string) =>
  request(`/admin/journals/${id}`, { method: 'DELETE' });

export const getPosts = (params?: Record<string, string>) => {
  const q = params ? new URLSearchParams(params).toString() : '';
  return request(`/admin/posts?${q}`);
};
export const getPost = (id: string) => request(`/admin/posts/${id}`);
export const updatePost = (id: string, data: any) =>
  request(`/admin/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deletePost = (id: string) =>
  request(`/admin/posts/${id}`, { method: 'DELETE' });
export const deleteComment = (postId: string, commentId: string) =>
  request(`/admin/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
