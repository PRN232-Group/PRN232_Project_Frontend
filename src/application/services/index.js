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
  getById: (id) => apiClient.get(`/api/roles/${id}`),
};

export const permissionService = {
  getMine: () => apiClient.get("/api/permissions/me"),
  getMatrix: () => apiClient.get("/api/permissions/matrix"),
  setRolePermissions: (roleId, pageKeys) =>
    apiClient.put(`/api/permissions/roles/${roleId}`, { pageKeys }),
};

export const categoryService = {
  getAll: () => apiClient.get("/api/categories"),
  create: (body) => apiClient.post("/api/categories", body),
  update: (id, body) => apiClient.put(`/api/categories/${id}`, body),
  remove: (id) => apiClient.delete(`/api/categories/${id}`),
};

export const contentService = {
  getAll: () => apiClient.get("/api/contents"),
  /** Phú: alias published Blog only — dùng cho storefront /blog */
  getPublishedBlogs: () => apiClient.get("/api/Blog"),
  getById: (id) => apiClient.get(`/api/contents/${id}`),
  getBySlug: (slug) =>
    apiClient.get(`/api/contents/by-slug/${encodeURIComponent(slug)}`),
  create: (body) => apiClient.post("/api/contents", body),
  update: (id, body) => apiClient.put(`/api/contents/${id}`, body),
  remove: (id) => apiClient.delete(`/api/contents/${id}`),
};

export const systemLogService = {
  /** @param {object} [params] action, entity, from, to, page, pageSize */
  getAll: (params) => apiClient.get("/api/systemlogs", { params }),
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
  getMyRequests: () => apiClient.get("/api/quotation-requests/mine"),
  createRequest: (body) => apiClient.post("/api/quotation-requests", body),
  reply: (id, body) =>
    apiClient.put(`/api/quotation-requests/${id}/reply`, body),
  updateRequest: (id, body) =>
    apiClient.put(`/api/quotation-requests/${id}`, body),
  getQuotations: () => apiClient.get("/api/quotations"),
  getMyQuotations: () => apiClient.get("/api/quotations/mine"),
  createQuotation: (body) => apiClient.post("/api/quotations", body),
  updateQuotation: (id, body) =>
    apiClient.put(`/api/quotations/${id}`, body),
};

export const designRequestService = {
  getAll: () => apiClient.get("/api/design-requests"),
  getMine: () => apiClient.get("/api/design-requests/mine"),
  getById: (id) => apiClient.get(`/api/design-requests/${id}`),
  create: (body) => apiClient.post("/api/design-requests", body),
  /** BE chỉ nhận { status } — forward-only New→InReview→Quoted→Done */
  updateStatus: (id, status) =>
    apiClient.put(`/api/design-requests/${id}`, { status }),
};

export const interiorDesignService = {
  getAll: () => apiClient.get("/api/interior-designs"),
  getById: (id) => apiClient.get(`/api/interior-designs/${id}`),
  create: (body) => apiClient.post("/api/interior-designs", body),
  update: (id, body) => apiClient.put(`/api/interior-designs/${id}`, body),
  remove: (id) => apiClient.delete(`/api/interior-designs/${id}`),
};

export const analyticsService = {
  getManagerDashboard: () => apiClient.get("/api/analytics/dashboard"),
  getBestSelling: () =>
    apiClient.get("/api/analytics/best-selling-products"),
  getRevenueReport: (params) =>
    apiClient.get("/api/revenue/report", { params }),
  getSalesDashboard: () => apiClient.get("/api/sales/dashboard"),
};
