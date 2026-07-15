import apiClient from "../../infrastructure/http/apiClient";

export const productService = {
  getAll: () => apiClient.get("/api/products"),
  getById: (id) => apiClient.get(`/api/products/${id}`),
  search: (keyword) =>
    apiClient.get("/api/products/search", { params: { keyword } }),
  create: (body) => apiClient.post("/api/products", body),
  update: (id, body) => apiClient.put(`/api/products/${id}`, body),
  remove: (id) => apiClient.delete(`/api/products/${id}`),
  updatePrice: (id, price) =>
    apiClient.put(`/api/products/${id}/price`, { price }),
};

export const cartService = {
  get: () => apiClient.get("/api/cart"),
  add: (body) => apiClient.post("/api/cart", body),
  update: (id, body) => apiClient.put(`/api/cart/${id}`, body),
  remove: (id) => apiClient.delete(`/api/cart/${id}`),
};

export const orderService = {
  getMine: () => apiClient.get("/api/orders"),
  getAll: () => apiClient.get("/api/orders"),
  getById: (id) => apiClient.get(`/api/orders/${id}`),
  checkout: (body) => apiClient.post("/api/orders/checkout", body),
  updateStatus: (id, status) =>
    apiClient.put(`/api/orders/${id}/status`, { status }),
  getSalesOrders: () => apiClient.get("/api/sales/orders"),
  updateSalesOrder: (id, body) =>
    apiClient.put(`/api/sales/orders/${id}`, body),
};

export const userService = {
  getProfile: () => apiClient.get("/api/users/profile"),
  updateProfile: (body) => apiClient.put("/api/users/profile", body),
  getAll: () => apiClient.get("/api/users"),
  create: (body) => apiClient.post("/api/users", body),
  updateRole: (id, role) => apiClient.put(`/api/users/${id}/role`, { role }),
  setLocked: (id, isLocked) =>
    apiClient.put(`/api/users/${id}/lock`, { isLocked }),
};

export const roleService = {
  getAll: () => apiClient.get("/api/roles"),
  create: (body) => apiClient.post("/api/roles", body),
  update: (id, body) => apiClient.put(`/api/roles/${id}`, body),
  remove: (id) => apiClient.delete(`/api/roles/${id}`),
};

export const categoryService = {
  getAll: () => apiClient.get("/api/categories"),
  create: (body) => apiClient.post("/api/categories", body),
  update: (id, body) => apiClient.put(`/api/categories/${id}`, body),
  remove: (id) => apiClient.delete(`/api/categories/${id}`),
};

export const contentService = {
  getAll: () => apiClient.get("/api/contents"),
  create: (body) => apiClient.post("/api/contents", body),
  update: (id, body) => apiClient.put(`/api/contents/${id}`, body),
  remove: (id) => apiClient.delete(`/api/contents/${id}`),
};

export const systemLogService = {
  getAll: () => apiClient.get("/api/systemlogs"),
};

export const reviewService = {
  getByProduct: (productId) =>
    apiClient.get(`/api/products/${productId}/reviews`),
  create: (productId, body) =>
    apiClient.post(`/api/products/${productId}/reviews`, body),
};

export const chatService = {
  getMessages: () => apiClient.get("/api/chat/messages"),
  getCustomers: () => apiClient.get("/api/chat/customers"),
  getCustomerMessages: (customerId) =>
    apiClient.get(`/api/chat/messages/${customerId}`),
  send: (body) => apiClient.post("/api/chat/send", body),
};

export const quotationService = {
  getRequests: () => apiClient.get("/api/quotation-requests"),
  reply: (id, body) =>
    apiClient.put(`/api/quotation-requests/${id}/reply`, body),
  updateRequest: (id, body) =>
    apiClient.put(`/api/quotation-requests/${id}`, body),
  getQuotations: () => apiClient.get("/api/quotations"),
  updateQuotation: (id, body) =>
    apiClient.put(`/api/quotations/${id}`, body),
};

export const designRequestService = {
  getAll: () => apiClient.get("/api/design-requests"),
  getById: (id) => apiClient.get(`/api/design-requests/${id}`),
  update: (id, body) => apiClient.put(`/api/design-requests/${id}`, body),
};

export const interiorDesignService = {
  getAll: () => apiClient.get("/api/interior-designs"),
  getById: (id) => apiClient.get(`/api/interior-designs/${id}`),
  create: (body) => apiClient.post("/api/interior-designs", body),
  update: (id, body) => apiClient.put(`/api/interior-designs/${id}`, body),
  remove: (id) => apiClient.delete(`/api/interior-designs/${id}`),
};

export const productionService = {
  getDashboard: () => apiClient.get("/api/production/dashboard"),
  getOrders: () => apiClient.get("/api/production/orders"),
  getOrder: (id) => apiClient.get(`/api/production/orders/${id}`),
  updateStatus: (id, status) =>
    apiClient.put(`/api/production/orders/${id}/status`, { status }),
  getProgress: () => apiClient.get("/api/production/progress"),
};

export const deliveryService = {
  getOrders: () => apiClient.get("/api/delivery/orders"),
  update: (orderId, body) =>
    apiClient.put(`/api/delivery/orders/${orderId}`, body),
};

export const analyticsService = {
  getManagerDashboard: () => apiClient.get("/api/analytics/dashboard"),
  getBestSelling: () =>
    apiClient.get("/api/analytics/best-selling-products"),
  getRevenueReport: () => apiClient.get("/api/revenue/report"),
  getSalesDashboard: () => apiClient.get("/api/sales/dashboard"),
  getBlogPosts: () => apiClient.get("/api/Blog"),
};
