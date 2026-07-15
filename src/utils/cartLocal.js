/**
 * Shared cart helpers — guest uses localStorage; logged-in also syncs API.
 */
export function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart-updated"));
}

export function getLocalCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

export function setLocalCart(items) {
  localStorage.setItem("cart", JSON.stringify(items));
  const count = items.reduce((s, i) => s + (Number(i.quantity) || 1), 0);
  localStorage.setItem("cartCount", String(count));
  notifyCartUpdated();
}

export function addLocalCartItem(product, qty = 1) {
  const cart = getLocalCart();
  const id = product.id ?? product.productId;
  const existing = cart.find((i) => (i.id ?? i.productId) === id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + qty;
  } else {
    cart.push({
      id,
      productId: id,
      name: product.name || product.productName,
      productName: product.name || product.productName,
      price: product.price,
      image: product.image || product.imageUrl,
      imageUrl: product.image || product.imageUrl,
      quantity: qty,
    });
  }
  setLocalCart(cart);
  return cart;
}
