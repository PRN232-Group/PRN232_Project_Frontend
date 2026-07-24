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
    const email = (body.email || "").toLowerCase().trim();
    const byEmail = db.users.find((u) => u.email.toLowerCase() === email);
    const user = byEmail || {
      id: 12,
      name: (email || "user").split("@")[0],
      email: body.email,
      role: "Customer",
      phone: "0901234567",
      isLocked: false,
      status: "Active",
    };
    if (user.isLocked || user.status === "Locked") {
      fail(403, "Tài khoản đã bị khóa. Liên hệ quản trị viên.");
    }
    if (user.role === "Customer") {
      const cust =
        byEmail?.role === "Customer"
          ? byEmail
          : db.users.find((u) => u.id === 12);
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
      role: user.role,
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
    return ok(db.products.map((p) => ({ ...p, inStock: (p.stock ?? 0) > 0 })));
  }
  {
    const m = match(method, urlPath, {
      method: "get",
      re: /^\/api\/products\/(\d+)$/,
    });
    if (m) {
      const p = db.products.find((x) => String(x.id) === m[0]);
      if (!p) notFound("Product not found");
      return ok({ ...p, inStock: (p.stock ?? 0) > 0 });
    }
  }
  if (method === "get" && urlPath === "/api/products/search") {
    const kw = (params.keyword || "").toString().toLowerCase();
    return ok(
      db.products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(kw) ||
            (p.description || "").toLowerCase().includes(kw)
        )
        .map((p) => ({ ...p, inStock: (p.stock ?? 0) > 0 }))
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
    if (!product) notFound();
    const qty = Number(body.quantity || 1);
    if (qty <= 0) fail(400, "Số lượng phải lớn hơn 0.");
    if ((product.stock ?? 0) <= 0) {
      fail(400, `«${product.name}» đã hết hàng.`);
    }
    const existing = db.cart.find(
      (c) => String(c.productId) === String(body.productId)
    );
    const desired = (existing?.quantity || 0) + qty;
    if (desired > product.stock) {
      fail(
        400,
        `«${product.name}» chỉ còn đủ cho ${product.stock} sản phẩm trong giỏ.`
      );
    }
    if (existing) {
      existing.quantity = desired;
      return ok(existing);
    }
    const item = {
      id: db.nextIds.cart++,
      productId: body.productId,
      productName: product?.name || "Sản phẩm",
      imageUrl: product?.imageUrl,
      price: product?.price || 0,
      quantity: qty,
      inStock: true,
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
      const product = db.products.find(
        (p) => String(p.id) === String(db.cart[i].productId)
      );
      const newQty = Number(body.quantity ?? db.cart[i].quantity);
      if (product && newQty > (product.stock ?? 0)) {
        fail(
          400,
          `«${product.name}» chỉ còn đủ cho ${product.stock} sản phẩm trong giỏ.`
        );
      }
      db.cart[i] = { ...db.cart[i], ...body, quantity: newQty };
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
  if (method === "post" && urlPath === "/api/users") {
    const actor = getUser();
    if (!actor) fail(401, "Unauthorized");
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    if (!body.name?.trim() || !email) {
      fail(400, "Nhập họ tên và email");
    }
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      fail(400, "Email đã tồn tại");
    }
    const role = body.role || "Customer";
    const ranks = { Customer: 1, Sales: 2, Manager: 3, Admin: 4 };
    const actorRank = ranks[actor.role] || 0;
    const targetRank = ranks[role] || 0;
    if (targetRank >= actorRank) {
      fail(403, "Không thể gán role ngang hoặc cao hơn mình");
    }
    const item = {
      id: db.nextIds.user++,
      name: body.name.trim(),
      email,
      phone: body.phone || "",
      role,
      status: "Active",
      isLocked: false,
    };
    db.users.push(item);
    return ok(item, 201);
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/users\/(\d+)\/role$/,
    });
    if (m) {
      const actor = getUser();
      if (!actor) fail(401, "Unauthorized");
      const i = db.users.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound("User not found");
      const target = db.users[i];
      const ranks = { Customer: 1, Sales: 2, Manager: 3, Admin: 4 };
      const actorRank = ranks[actor.role] || 0;
      if (Number(actor.id) === Number(target.id)) {
        fail(403, "Không thể đổi role của chính mình");
      }
      if ((ranks[target.role] || 0) >= actorRank) {
        fail(403, "Không thể đổi role ngang hoặc cao hơn mình");
      }
      const nextRole = body.role;
      if (!ranks[nextRole]) fail(400, "Role không hợp lệ");
      if ((ranks[nextRole] || 0) >= actorRank) {
        fail(403, "Không thể gán role ngang hoặc cao hơn mình");
      }
      db.users[i] = { ...target, role: nextRole };
      return ok(db.users[i]);
    }
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/users\/(\d+)\/lock$/,
    });
    if (m) {
      const actor = getUser();
      if (!actor) fail(401, "Unauthorized");
      const i = db.users.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound("User not found");
      const target = db.users[i];
      const ranks = { Customer: 1, Sales: 2, Manager: 3, Admin: 4 };
      const actorRank = ranks[actor.role] || 0;
      if (Number(actor.id) === Number(target.id)) {
        fail(403, "Không thể khóa chính mình");
      }
      if ((ranks[target.role] || 0) >= actorRank) {
        fail(403, "Không thể khóa tài khoản role ngang hoặc cao hơn");
      }
      const isLocked = body.isLocked === true;
      db.users[i] = {
        ...target,
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
  if (method === "get" && urlPath === "/api/Blog") {
    return ok(
      db.contents.filter(
        (c) =>
          (c.type || "Blog") === "Blog" && c.isPublished !== false
      )
    );
  }
  {
    const m = match(method, urlPath, {
      method: "get",
      re: /^\/api\/contents\/by-slug\/(.+)$/,
    });
    if (m) {
      const slug = decodeURIComponent(m[0]);
      const item = db.contents.find(
        (c) => c.slug === slug && c.isPublished !== false
      );
      if (!item) notFound();
      return ok(item);
    }
  }
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
    const page = Number(config.params?.page) || 1;
    const pageSize = Math.min(Number(config.params?.pageSize) || 20, 50);
    let rows = [...db.systemLogs];
    const actionQ = (config.params?.action || "").toString().trim();
    const entityQ = (config.params?.entity || "").toString().trim();
    if (actionQ) {
      rows = rows.filter((x) =>
        (x.action || "").toLowerCase().includes(actionQ.toLowerCase())
      );
    }
    if (entityQ) {
      rows = rows.filter((x) =>
        (x.entity || "").toLowerCase().includes(entityQ.toLowerCase())
      );
    }
    rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const total = rows.length;
    const start = (page - 1) * pageSize;
    return ok({
      items: rows.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    });
  }

  // ----- Chat (DTO khớp BE: ChatMessageDto / ChatCustomerDto) -----
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
    const customerId = Number(body.customerId) || 12;
    const list =
      db.chatMessages[customerId] || (db.chatMessages[customerId] = []);
    const isFromCustomer = body.customerId == null;
    const item = {
      id: db.nextIds.chat++,
      senderId: isFromCustomer ? customerId : 2,
      senderName: isFromCustomer ? "Khách" : "Sales",
      customerId,
      content: body.content,
      sentAt: new Date().toISOString(),
      isFromCustomer,
    };
    list.push(item);
    const cust = db.chatCustomers.find((c) => c.customerId === customerId);
    if (cust) {
      cust.lastMessage = body.content;
      cust.lastMessageAt = item.sentAt;
    }
    return ok(item);
  }

  // ----- Quotations / Design -----
  const enrichRequest = (r) => {
    const lineQty = new Map();
    for (const it of r.items || []) {
      const pid = Number(it.productId);
      if (!pid) continue;
      lineQty.set(pid, Math.max(1, Number(it.quantity) || 1));
    }
    const productIds =
      (r.productIds || []).length > 0
        ? r.productIds
        : [...lineQty.keys()];
    const lines = productIds
      .map((pid) => {
        const p = db.products.find((x) => x.id === Number(pid));
        if (!p) return null;
        const quantity = lineQty.get(Number(pid)) || 1;
        return {
          productId: p.id,
          name: p.name,
          price: p.price,
          marketPrice: p.marketPrice,
          quantity,
          stock: p.stock,
          imageUrl: p.imageUrl,
        };
      })
      .filter(Boolean);
    const products = lines.map((l) => ({
      id: l.productId,
      name: l.name,
      price: l.price,
      marketPrice: l.marketPrice,
      quantity: l.quantity,
      stock: l.stock,
      imageUrl: l.imageUrl,
    }));
    return {
      ...r,
      productIds,
      lines,
      products,
      estimateTotal: lines.reduce((s, l) => s + l.price * l.quantity, 0),
      marketTotal: lines.reduce(
        (s, l) => s + (l.marketPrice || l.price) * l.quantity,
        0
      ),
    };
  };

  const enrichQuotation = (q) => {
    const lineQty = new Map();
    for (const it of q.items || []) {
      const pid = Number(it.productId);
      if (!pid) continue;
      lineQty.set(pid, Math.max(1, Number(it.quantity) || 1));
    }
    const productIds =
      (q.productIds || []).length > 0
        ? q.productIds
        : [...lineQty.keys()];
    const items = productIds
      .map((pid) => {
        const p = db.products.find((x) => x.id === Number(pid));
        if (!p) return null;
        return {
          productId: p.id,
          productName: p.name,
          quantity: lineQty.get(Number(pid)) || 1,
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
    const amount = Number(q.amount) || 0;
    return {
      ...q,
      productIds,
      customerEmail: db.users.find((u) => u.id === q.customerId)?.email || "",
      totalPrice: amount || catalogTotal,
      items,
      catalogTotal,
      marketTotal,
      savings: Math.max(0, marketTotal - (amount || catalogTotal)),
    };
  };

  if (method === "get" && urlPath === "/api/quotation-requests") {
    return ok(db.quotationRequests.map(enrichRequest));
  }
  if (method === "get" && urlPath === "/api/quotation-requests/mine") {
    const session = getUser();
    const cid = session?.id || db.profile?.id;
    const mine = (db.quotationRequests || []).filter(
      (r) => !cid || Number(r.customerId) === Number(cid)
    );
    return ok(mine.map(enrichRequest));
  }
  if (method === "post" && urlPath === "/api/quotation-requests") {
    const session = getUser();
    const itemsIn = Array.isArray(body.items) ? body.items : [];
    const lineMap = new Map();
    for (const it of itemsIn) {
      const pid = Number(it.productId);
      if (!pid) continue;
      lineMap.set(pid, Math.max(1, Number(it.quantity) || 1));
    }
    let productIds = (body.productIds || []).map(Number).filter(Boolean);
    if (lineMap.size) {
      productIds = [...lineMap.keys()];
    } else {
      for (const pid of productIds) lineMap.set(pid, 1);
    }
    if (!productIds.length) {
      return fail(400, "Chọn ít nhất một sản phẩm");
    }
    const item = {
      id: db.nextIds.quotationReq++,
      customerId: session?.id || db.profile?.id || 12,
      customerName:
        session?.name || session?.fullName || db.profile?.name || "Khách",
      title: body.title || "Yêu cầu báo giá",
      description: body.description || "",
      productIds,
      items: [...lineMap.entries()].map(([productId, quantity]) => ({
        productId,
        quantity,
      })),
      status: "Pending",
      reply: null,
      replyNote: null,
      createdAt: new Date().toISOString(),
    };
    db.quotationRequests.push(item);
    return ok(item, 201);
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
    return ok(db.quotations.map(enrichQuotation));
  }
  if (method === "get" && urlPath === "/api/quotations/mine") {
    const session = getUser();
    const cid = session?.id || db.profile?.id;
    const mine = (db.quotations || []).filter(
      (q) => !cid || Number(q.customerId) === Number(cid)
    );
    return ok(mine.map(enrichQuotation));
  }
  if (method === "post" && urlPath === "/api/quotations") {
    const session = getUser();
    const reqId = body.quotationRequestId;
    const req = reqId
      ? db.quotationRequests.find((r) => String(r.id) === String(reqId))
      : null;
    const itemsIn = Array.isArray(body.items) ? body.items : [];
    const lineMap = new Map();
    for (const it of itemsIn) {
      const pid = Number(it.productId);
      if (!pid) continue;
      lineMap.set(pid, Math.max(1, Number(it.quantity) || 1));
    }
    if (!lineMap.size && req?.items?.length) {
      for (const it of req.items) {
        lineMap.set(Number(it.productId), Math.max(1, Number(it.quantity) || 1));
      }
    }
    let productIds = (body.productIds || req?.productIds || [])
      .map(Number)
      .filter(Boolean);
    if (lineMap.size) productIds = [...lineMap.keys()];
    else for (const pid of productIds) lineMap.set(pid, 1);

    const item = {
      id: db.nextIds.quotation++,
      quotationRequestId: reqId || null,
      customerId: body.customerId || req?.customerId || session?.id || 12,
      customerName:
        body.customerName ||
        req?.customerName ||
        session?.name ||
        "Khách",
      title: body.title || req?.title || "Báo giá",
      amount: Number(body.amount) || 0,
      productIds,
      items: [...lineMap.entries()].map(([productId, quantity]) => ({
        productId,
        quantity,
      })),
      status: body.status || "PendingApproval",
      notes: body.notes || body.note || "",
      createdAt: new Date().toISOString(),
    };
    db.quotations.push(item);
    if (req) {
      const i = db.quotationRequests.findIndex((x) => x.id === req.id);
      if (i >= 0) {
        db.quotationRequests[i] = {
          ...db.quotationRequests[i],
          status: "Replied",
          replyNote:
            db.quotationRequests[i].replyNote ||
            body.notes ||
            `Đã tạo báo giá #${item.id}`,
        };
      }
    }
    return ok(item, 201);
  }
  {
    const m = match(method, urlPath, {
      method: "put",
      re: /^\/api\/quotations\/(\d+)$/,
    });
    if (m) {
      const i = db.quotations.findIndex((x) => String(x.id) === m[0]);
      if (i < 0) notFound();
      const next = { ...db.quotations[i], ...body };
      if (body.amount != null) next.amount = Number(body.amount) || 0;
      if (body.notes != null || body.note != null) {
        next.notes = body.notes ?? body.note;
      }
      db.quotations[i] = next;
      return ok(db.quotations[i]);
    }
  }

  if (method === "get" && urlPath === "/api/design-requests") {
    return ok([...db.designRequests]);
  }
  if (method === "get" && urlPath === "/api/design-requests/mine") {
    return ok(db.designRequests.filter((r) => Number(r.customerId) === 12));
  }
  if (method === "post" && urlPath === "/api/design-requests") {
    const item = {
      id: Math.max(0, ...db.designRequests.map((r) => r.id)) + 1,
      customerId: 12,
      customerName: "Nguyễn Văn An",
      title: body.title,
      style: body.style || null,
      interiorDesignId: body.interiorDesignId || null,
      relatedProductIds: body.relatedProductIds || [],
      budget: body.budget ?? null,
      notes: body.notes || null,
      status: "New",
      attachments: body.attachments || [],
      createdAt: new Date().toISOString(),
    };
    db.designRequests.unshift(item);
    return ok(item, 201);
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
      const current = db.designRequests[i];
      const nextMap = {
        New: "InReview",
        InReview: "Quoted",
        Quoted: "Done",
      };
      const expected = nextMap[current.status];
      if (!expected || expected !== body.status) {
        fail(400, `Chỉ được chuyển sang '${expected}'`);
      }
      db.designRequests[i] = { ...current, status: expected };
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
      totalRevenue: db.orders
        .filter((o) => o.status !== "Cancelled")
        .reduce((s, o) => s + (o.totalPrice || 0), 0),
      totalOrders: db.orders.filter((o) => o.status !== "Cancelled").length,
      totalProducts: db.products.length,
      totalCustomers: db.users.filter((u) => u.role === "Customer").length,
      totalUsers: db.users.length,
      bestSellingProduct: best
        ? {
            id: best.productId,
            productId: best.productId,
            name: best.name,
            sold: best.sold,
            soldQuantity: best.sold,
            revenue: best.revenue,
          }
        : null,
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
    return ok(rows);
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
