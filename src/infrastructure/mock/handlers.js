import { db } from "./data";
import { getUser } from "../storage/authStorage";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

function ok(data, status = 200) {
  return { status, data, headers: { "content-type": "application/json" } };
}

function notFound(message = "Not found") {
  const err = new Error(message);
  err.response = { status: 404, data: { message } };
  throw err;
}

function fail(status, message) {
  const err = new Error(message);
  err.response = { status, data: { message } };
  throw err;
}

function match(method, urlPath, pattern) {
  if (method !== pattern.method) return null;
  const m = urlPath.match(pattern.re);
  return m ? m.slice(1) : null;
}

/**
 * Resolve mock response for apiClient request config.
 * Returns axios-like response shape { data, status, headers, config }.
 */
export async function handleMockRequest(config) {
  await delay(180);

  const method = (config.method || "get").toLowerCase();
  let urlPath = config.url || "";
  // strip baseURL leftovers / query
  try {
    if (urlPath.startsWith("http")) {
      urlPath = new URL(urlPath).pathname;
    }
  } catch {
    /* ignore */
  }
  const qIndex = urlPath.indexOf("?");
  if (qIndex >= 0) urlPath = urlPath.slice(0, qIndex);
  if (!urlPath.startsWith("/")) urlPath = `/${urlPath}`;

  const params = config.params || {};
  const body = typeof config.data === "string"
    ? JSON.parse(config.data || "{}")
    : config.data || {};

  // ----- Auth -----
  if (method === "post" && urlPath === "/api/auth/login") {
    const role = body.role || "Customer";
    const email = (body.email || "").toLowerCase().trim();
    const byEmail = db.users.find((u) => u.email.toLowerCase() === email);
    const byRole = db.users.find((u) => u.role === role);
    const user = byEmail || byRole || {
      id: 12,
      name: (email || "user").split("@")[0],
      email: body.email,
      role,
      phone: "0901234567",
      isLocked: false,
      status: "Active",
    };
    if (user.isLocked || user.status === "Locked") {
      fail(403, "Tài khoản đã bị khóa. Liên hệ quản trị viên.");
    }
    if (user.role === "Customer" || role === "Customer") {
      const cust = byEmail?.role === "Customer" ? byEmail : db.users.find((u) => u.id === 12);
      if (cust && !cust.isLocked) {
        db.profile = {
          id: cust.id,
          name: cust.name,
          fullName: cust.name,
          email: cust.email,
          phone: cust.phone,
          address:
            cust.id === 13
              ? "45 Lê Lợi, Đà Nẵng"
              : "12 Nguyễn Huệ, Q1, HCM",
          role: "Customer",
        };
      }
    }
    return ok({
      accessToken: "mock-token",
      id: user.id,
      name: user.name,
      email: user.email || body.email,
      role: byEmail ? user.role : role,
      phone: user.phone || "0901234567",
    });
  }
  if (method === "post" && urlPath === "/api/auth/register") {
    return ok({ message: "Registered", id: db.nextIds.order++ }, 201);
  }
  if (method === "post" && urlPath === "/api/auth/forgot-password") {
    return ok({ message: "Email sent" });
  }

  // ----- Products -----
  if (method === "get" && urlPath === "/api/products") {
    return ok([...db.products]);
  }
  {
    const m = match(method, urlPath, {
      method: "get",
      re: /^\/api\/products\/(\d+)$/,
    });
    if (m) {
      const p = db.products.find((x) => String(x.id) === m[0]);
      if (!p) notFound("Product not found");
      return ok(p);
    }
  }
  if (method === "get" && urlPath === "/api/products/search") {
    const kw = (params.keyword || "").toString().toLowerCase();
    return ok(
      db.products.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          (p.description || "").toLowerCase().includes(kw)
      )
    );
  }
  if (method === "post" && urlPath === "/api/products") {
    const item = {
      id: db.nextIds.product++,
      stock: 0,
      isActive: true,
      imageUrl:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      ...body,
    };
    db.products.push(item);
    return ok(item, 201);
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/products\/(\d+)$/,
    });
    if (m) {
      const i = db.products.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.products[i] = { ...db.products[i], ...body };
      return ok(db.products[i]);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/products\/(\d+)\/price$/,
    });
    if (m) {
      const i = db.products.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.products[i].price = Number(body.price);
      return ok(db.products[i]);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "delete",
      re: /^\/api\/products\/(\d+)$/,
    });
    if (m) {
      db.products = db.products.filter((x) => String(x.id) !== m[0]);
      return ok({ success: true });
    }
  }

  // ----- Reviews -----
  {
    const m = match(method, urlPath, {
      method: "get",
      re: /^\/api\/products\/(\d+)\/reviews$/,
    });
    if (m) return ok(db.reviews[m[0]] || []);
  }
  {
    const m = match(method, urlPath, {
      method: "post",
      re: /^\/api\/products\/(\d+)\/reviews$/,
    });
    if (m) {
      const list = db.reviews[m[0]] || (db.reviews[m[0]] = []);
      const item = {
        id: db.nextIds.review++,
        productId: Number(m[0]),
        userId: 12,
        userName: "Bạn",
        createdAt: new Date().toISOString(),
        ...body,
      };
      list.push(item);
      return ok(item, 201);
    }
  }

  // ----- Cart -----
  if (method === "get" && urlPath === "/api/cart") return ok([...db.cart]);
  if (method === "post" && urlPath === "/api/cart") {
    const product = db.products.find(
      (p) => String(p.id) === String(body.productId)
    );
    const existing = db.cart.find(
      (c) => String(c.productId) === String(body.productId)
    );
    if (existing) {
      existing.quantity += Number(body.quantity || 1);
      return ok(existing);
    }
    const item = {
      id: db.nextIds.cart++,
      productId: body.productId,
      productName: product?.name || "Sản phẩm",
      imageUrl: product?.imageUrl,
      price: product?.price || 0,
      quantity: Number(body.quantity || 1),
    };
    db.cart.push(item);
    return ok(item, 201);
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/cart\/(\d+)$/,
    });
    if (m) {
      const i = db.cart.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.cart[i] = { ...db.cart[i], ...body };
      return ok(db.cart[i]);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "delete",
      re: /^\/api\/cart\/(\d+)$/,
    });
    if (m) {
      db.cart = db.cart.filter((x) => String(x.id) !== m[0]);
      return ok({ success: true });
    }
  }

  // ----- Orders -----
  if (method === "post" && urlPath === "/api/orders/checkout") {
    const session = getUser();
    const customerId = session?.id || db.profile.id || 12;
    const items = db.cart.map((c) => ({
      productId: c.productId,
      productName: c.productName,
      quantity: c.quantity,
      price: c.price,
    }));
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = {
      id: db.nextIds.order++,
      customerId,
      customerName: db.profile.name || session?.name,
      customerEmail: db.profile.email || session?.email,
      customerPhone: body.phone || db.profile.phone,
      shippingAddress: body.shippingAddress || body.address || db.profile.address,
      phone: body.phone || db.profile.phone,
      address: body.shippingAddress || body.address || db.profile.address,
      status: "Pending",
      totalPrice: total,
      createdAt: new Date().toISOString(),
      items,
    };
    db.orders.unshift(order);
    db.productionOrders.push({
      id: 1000 + order.id,
      orderId: order.id,
      customerName: order.customerName,
      address: order.address,
      shippingAddress: order.shippingAddress,
      status: "Queued",
      progressStatus: "PENDING",
      progressPercent: 0,
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      createdAt: order.createdAt,
      items: items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        price: it.price,
      })),
    });
    db.cart = [];
    return ok(order, 201);
  }
  if (method === "get" && urlPath === "/api/orders") {
    const session = getUser();
    const role = (session?.role || "").toString().toLowerCase();
    if (role === "customer" || !session) {
      const cid = session?.id || db.profile?.id;
      if (cid) {
        return ok(db.orders.filter((o) => o.customerId === cid));
      }
    }
    return ok([...db.orders]);
  }
  {
    const m = match(method, urlPath, {
      method: "get",
      re: /^\/api\/orders\/(\d+)$/,
    });
    if (m) {
      const o = db.orders.find((x) => String(x.id) === m[0]);
      if (!o) notFound("Order not found");
      return ok(o);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/orders\/(\d+)\/status$/,
    });
    if (m) {
      const i = db.orders.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.orders[i].status = body.status;
      return ok(db.orders[i]);
    }
  }
  if (method === "get" && urlPath === "/api/sales/orders") {
    return ok([...db.orders]);
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/sales\/orders\/(\d+)$/,
    });
    if (m) {
      const i = db.orders.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.orders[i] = { ...db.orders[i], ...body };
      return ok(db.orders[i]);
    }
  }

  // ----- Users / profile / roles -----
  if (method === "get" && urlPath === "/api/users/profile") return ok({ ...db.profile });
  if (method === "put" && urlPath === "/api/users/profile") {
    db.profile = {
      ...db.profile,
      ...body,
      name: body.fullName || body.name || db.profile.name,
      fullName: body.fullName || body.name || db.profile.fullName,
    };
    return ok(db.profile);
  }
  if (method === "get" && urlPath === "/api/users") return ok([...db.users]);
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/users\/(\d+)\/lock$/,
    });
    if (m) {
      const i = db.users.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound("User not found");
      const isLocked = body.isLocked === true;
      db.users[i] = {
        ...db.users[i],
        isLocked,
        status: isLocked ? "Locked" : "Active",
      };
      return ok(db.users[i]);
    }
  }

  if (method === "get" && urlPath === "/api/roles") return ok([...db.roles]);
  if (method === "post" && urlPath === "/api/roles") {
    const item = { id: db.nextIds.role++, ...body };
    db.roles.push(item);
    return ok(item, 201);
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/roles\/(\d+)$/,
    });
    if (m) {
      const i = db.roles.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.roles[i] = { ...db.roles[i], ...body };
      return ok(db.roles[i]);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "delete",
      re: /^\/api\/roles\/(\d+)$/,
    });
    if (m) {
      db.roles = db.roles.filter((x) => String(x.id) !== m[0]);
      return ok({ success: true });
    }
  }

  // ----- Categories -----
  if (method === "get" && urlPath === "/api/categories") return ok([...db.categories]);
  if (method === "post" && urlPath === "/api/categories") {
    const item = { id: db.nextIds.category++, ...body };
    db.categories.push(item);
    return ok(item, 201);
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/categories\/(\d+)$/,
    });
    if (m) {
      const i = db.categories.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.categories[i] = { ...db.categories[i], ...body };
      return ok(db.categories[i]);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "delete",
      re: /^\/api\/categories\/(\d+)$/,
    });
    if (m) {
      db.categories = db.categories.filter((x) => String(x.id) !== m[0]);
      return ok({ success: true });
    }
  }

  // ----- Contents / Blog -----
  if (method === "get" && urlPath === "/api/contents") return ok([...db.contents]);
  if (method === "get" && urlPath === "/api/Blog") return ok([...db.contents]);
  if (method === "post" && urlPath === "/api/contents") {
    const item = {
      id: db.nextIds.content++,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      ...body,
    };
    db.contents.push(item);
    return ok(item, 201);
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/contents\/(\d+)$/,
    });
    if (m) {
      const i = db.contents.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.contents[i] = { ...db.contents[i], ...body };
      return ok(db.contents[i]);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "delete",
      re: /^\/api\/contents\/(\d+)$/,
    });
    if (m) {
      db.contents = db.contents.filter((x) => String(x.id) !== m[0]);
      return ok({ success: true });
    }
  }

  if (method === "get" && urlPath === "/api/systemlogs") {
    return ok([...db.systemLogs]);
  }

  // ----- Chat -----
  if (method === "get" && urlPath === "/api/chat/messages") {
    return ok(db.chatMessages[12] || []);
  }
  if (method === "get" && urlPath === "/api/chat/customers") {
    return ok([...db.chatCustomers]);
  }
  {
    const m = match(method, urlPath, {
      method: "get",
      re: /^\/api\/chat\/messages\/(\d+)$/,
    });
    if (m) return ok(db.chatMessages[m[0]] || []);
  }
  if (method === "post" && urlPath === "/api/chat/send") {
    const customerId = body.customerId || 12;
    const list =
      db.chatMessages[customerId] || (db.chatMessages[customerId] = []);
    const item = {
      id: db.nextIds.chat++,
      customerId,
      senderRole: body.senderRole || "Customer",
      content: body.content,
      createdAt: new Date().toISOString(),
    };
    list.push(item);
    return ok(item, 201);
  }

  // ----- Quotations / Design -----
  if (method === "get" && urlPath === "/api/quotation-requests") {
    return ok(
      db.quotationRequests.map((r) => {
        const products = (r.productIds || [])
          .map((pid) => db.products.find((p) => p.id === pid))
          .filter(Boolean);
        return {
          ...r,
          products,
          estimateTotal: products.reduce((s, p) => s + (p.price || 0), 0),
          marketTotal: products.reduce(
            (s, p) => s + (p.marketPrice || p.price || 0),
            0
          ),
        };
      })
    );
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/quotation-requests\/(\d+)\/reply$/,
    });
    if (m) {
      const i = db.quotationRequests.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.quotationRequests[i] = {
        ...db.quotationRequests[i],
        reply: body.reply ?? body.replyNote ?? body.message,
        replyNote: body.replyNote ?? body.reply ?? body.message,
        status: body.status || "Replied",
      };
      return ok(db.quotationRequests[i]);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/quotation-requests\/(\d+)$/,
    });
    if (m) {
      const i = db.quotationRequests.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.quotationRequests[i] = { ...db.quotationRequests[i], ...body };
      return ok(db.quotationRequests[i]);
    }
  }
  if (method === "get" && urlPath === "/api/quotations") {
    return ok(
      db.quotations.map((q) => {
        const items = (q.productIds || [])
          .map((pid) => {
            const p = db.products.find((x) => x.id === pid);
            if (!p) return null;
            return {
              productId: p.id,
              productName: p.name,
              quantity: 1,
              price: p.price,
              marketPrice: p.marketPrice,
              stock: p.stock,
              imageUrl: p.imageUrl,
              specs: p.specs,
            };
          })
          .filter(Boolean);
        const catalogTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const marketTotal = items.reduce(
          (s, i) => s + (i.marketPrice || i.price) * i.quantity,
          0
        );
        return {
          ...q,
          customerEmail:
            db.users.find((u) => u.id === q.customerId)?.email || "",
          totalPrice: q.amount || catalogTotal,
          items,
          catalogTotal,
          marketTotal,
          savings: Math.max(0, marketTotal - (q.amount || catalogTotal)),
        };
      })
    );
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/quotations\/(\d+)$/,
    });
    if (m) {
      const i = db.quotations.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.quotations[i] = { ...db.quotations[i], ...body };
      return ok(db.quotations[i]);
    }
  }

  if (method === "get" && urlPath === "/api/design-requests") {
    return ok([...db.designRequests]);
  }
  {
    const m = match(method, urlPath, {
      method: "get",
      re: /^\/api\/design-requests\/(\d+)$/,
    });
    if (m) {
      const d = db.designRequests.find((x) => String(x.id) === m[0]);
      if (!d) notFound();
      return ok(d);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/design-requests\/(\d+)$/,
    });
    if (m) {
      const i = db.designRequests.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.designRequests[i] = { ...db.designRequests[i], ...body };
      return ok(db.designRequests[i]);
    }
  }

  if (method === "get" && urlPath === "/api/interior-designs") {
    return ok([...db.interiorDesigns]);
  }
  if (method === "post" && urlPath === "/api/interior-designs") {
    const id = Math.max(0, ...db.interiorDesigns.map((d) => d.id)) + 1;
    const item = { id, ...body };
    db.interiorDesigns.push(item);
    return ok(item, 201);
  }
  {
    const m = match(method, urlPath, {
      method: "get",
      re: /^\/api\/interior-designs\/(\d+)$/,
    });
    if (m) {
      const design = db.interiorDesigns.find((x) => String(x.id) === m[0]);
      if (!design) notFound();
      const relatedProducts = (design.relatedProductIds || [])
        .map((pid) => db.products.find((p) => p.id === pid))
        .filter(Boolean);
      return ok({ ...design, relatedProducts });
    }
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/interior-designs\/(\d+)$/,
    });
    if (m) {
      const i = db.interiorDesigns.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.interiorDesigns[i] = { ...db.interiorDesigns[i], ...body, id: db.interiorDesigns[i].id };
      return ok(db.interiorDesigns[i]);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "delete",
      re: /^\/api\/interior-designs\/(\d+)$/,
    });
    if (m) {
      db.interiorDesigns = db.interiorDesigns.filter((x) => String(x.id) !== m[0]);
      return ok({ success: true });
    }
  }

  // ----- Production / Delivery -----
  if (method === "get" && urlPath === "/api/production/dashboard") {
    return ok({
      totalOrders: db.productionOrders.length,
      pending: db.productionOrders.filter((o) => o.status === "Queued").length,
      preparing: db.productionOrders.filter((o) => o.status === "InProgress")
        .length,
      shipping: db.deliveries.filter(
        (d) => (d.status || d.deliveryStatus) === "OutForDelivery"
      ).length,
      delivered:
        db.productionOrders.filter((o) => o.status === "Done").length ||
        db.deliveries.filter(
          (d) => (d.status || d.deliveryStatus) === "Delivered"
        ).length,
    });
  }
  if (method === "get" && urlPath === "/api/production/orders") {
    return ok([...db.productionOrders]);
  }
  {
    const m = match(method, urlPath, {
      method: "get",
      re: /^\/api\/production\/orders\/(\d+)$/,
    });
    if (m) {
      const o = db.productionOrders.find((x) => String(x.id) === m[0]);
      if (!o) notFound();
      return ok(o);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/production\/orders\/(\d+)\/status$/,
    });
    if (m) {
      const i = db.productionOrders.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      db.productionOrders[i].status = body.status;
      return ok(db.productionOrders[i]);
    }
  }
  if (method === "get" && urlPath === "/api/production/progress") {
    const STATUS_MAP = {
      Queued: "PENDING",
      InProgress: "PREPARING",
      Done: "DELIVERED",
    };
    return ok(
      db.productionOrders.map((o) => ({
        id: o.orderId || o.id,
        orderId: o.orderId,
        customerName: o.customerName,
        status: o.progressStatus || STATUS_MAP[o.status] || "PENDING",
        progressPercent: o.progressPercent,
      }))
    );
  }

  if (method === "get" && urlPath === "/api/delivery/orders") {
    return ok(
      db.deliveries.map((d) => ({
        ...d,
        id: d.orderId,
        status: d.status || d.deliveryStatus,
      }))
    );
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/delivery\/orders\/(\d+)$/,
    });
    if (m) {
      const i = db.deliveries.findIndex(
        (x) => String(x.orderId) === m[0] || String(x.id) === m[0]
      );
      if (i < 0) notFound();
      const nextStatus = body.status || body.deliveryStatus;
      db.deliveries[i] = {
        ...db.deliveries[i],
        ...body,
        status: nextStatus,
        deliveryStatus: nextStatus,
      };
      return ok({
        ...db.deliveries[i],
        id: db.deliveries[i].orderId,
        status: nextStatus,
      });
    }
  }

  // ----- Analytics -----
  if (method === "get" && urlPath === "/api/analytics/dashboard") {
    const soldMap = {};
    db.orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.productId;
        if (!soldMap[key]) {
          soldMap[key] = {
            productId: key,
            name: it.productName,
            sold: 0,
            revenue: 0,
          };
        }
        soldMap[key].sold += it.quantity || 0;
        soldMap[key].revenue += (it.price || 0) * (it.quantity || 0);
      });
    });
    const best = Object.values(soldMap).sort((a, b) => b.sold - a.sold)[0];
    return ok({
      totalRevenue: db.orders.reduce((s, o) => s + (o.totalPrice || 0), 0),
      totalOrders: db.orders.length,
      totalProducts: db.products.length,
      totalCustomers: db.users.filter((u) => u.role === "Customer").length,
      totalUsers: db.users.length,
      bestSellingProduct: best?.name || db.products[0]?.name || "",
    });
  }
  if (method === "get" && urlPath === "/api/analytics/best-selling-products") {
    const soldMap = {};
    db.orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const key = it.productId;
        if (!soldMap[key]) {
          soldMap[key] = {
            id: key,
            productId: key,
            name: it.productName,
            sold: 0,
            soldQuantity: 0,
            revenue: 0,
          };
        }
        soldMap[key].sold += it.quantity || 0;
        soldMap[key].soldQuantity += it.quantity || 0;
        soldMap[key].revenue += (it.price || 0) * (it.quantity || 0);
      });
    });
    const rows = Object.values(soldMap).sort(
      (a, b) => b.soldQuantity - a.soldQuantity
    );
    if (rows.length) return ok(rows);
    return ok(
      db.products.slice(0, 3).map((p, i) => ({
        id: p.id,
        productId: p.id,
        name: p.name,
        sold: 10 - i,
        soldQuantity: 10 - i,
        revenue: p.price * (10 - i),
      }))
    );
  }
  if (method === "get" && urlPath === "/api/revenue/report") {
    return ok(
      db.orders.map((o) => ({
        id: o.id,
        date: (o.createdAt || "").slice(0, 10),
        orderCode: `#${o.id}`,
        amount: o.totalPrice || 0,
      }))
    );
  }
  if (method === "get" && urlPath === "/api/sales/dashboard") {
    const reqs = db.quotationRequests || [];
    const quotes = db.quotations || [];
    return ok({
      pendingOrders: db.orders.filter((o) => o.status === "Pending").length,
      quotations: reqs.length,
      designRequests: db.designRequests.length,
      chats: db.chatCustomers.length,
      stats: {
        totalRequests: reqs.length + db.designRequests.length,
        pendingRequests:
          reqs.filter((r) => r.status === "Pending").length +
          db.designRequests.filter((d) => d.status === "New").length,
        totalQuotations: quotes.length,
        approvedQuotations: quotes.filter((q) => q.status === "Approved")
          .length,
      },
      recentRequests: [
        ...db.designRequests.map((d) => ({
          id: d.id,
          title: d.title,
          customerName: d.customerName,
          status: d.status,
        })),
        ...reqs.map((r) => ({
          id: `q-${r.id}`,
          title: r.title,
          customerName: r.customerName,
          status: r.status,
        })),
      ].slice(0, 6),
      recentQuotations: quotes.map((q) => ({
        id: q.id,
        title: q.title || q.notes || `Báo giá #${q.id}`,
        customerName: q.customerName,
        status: q.status,
      })),
    });
  }

  // Fallback for design-requests list page without id
  if (method === "get" && urlPath.startsWith("/api/design-requests")) {
    return ok([...db.designRequests]);
  }

  console.warn(`[mock] Unhandled ${method.toUpperCase()} ${urlPath}`);
  return ok({ message: "Mock stub", path: urlPath });
}
