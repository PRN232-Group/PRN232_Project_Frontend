/**
 * Build checkout / cart lines from an approved quotation.
 * If deal `amount` ≠ sum of line catalog prices, scale unit prices to match.
 */
export function buildQuoteCheckoutItems(quote) {
  const raw = quote?.items || [];
  const lines = raw.map((i) => ({
    productId: Number(i.productId),
    name: i.productName || i.name || `SP #${i.productId}`,
    productName: i.productName || i.name,
    quantity: Math.max(1, Number(i.quantity) || 1),
    price: Number(i.price ?? i.unitPrice ?? 0),
    imageUrl: i.imageUrl,
  }));

  if (!lines.length && Array.isArray(quote?.productIds)) {
    return (quote.productIds || []).map((pid) => ({
      productId: Number(pid),
      name: `SP #${pid}`,
      productName: `SP #${pid}`,
      quantity: 1,
      price: 0,
    }));
  }

  const catalogSum = lines.reduce((s, i) => s + i.price * i.quantity, 0);
  const target = Number(quote?.amount ?? quote?.totalPrice ?? catalogSum);
  if (catalogSum > 0 && Math.abs(catalogSum - target) >= 1) {
    const ratio = target / catalogSum;
    return lines.map((i) => ({
      ...i,
      price: Math.round(i.price * ratio),
    }));
  }
  return lines;
}

export function quoteLinesToCart(quote) {
  return buildQuoteCheckoutItems(quote).map((i) => ({
    id: i.productId,
    productId: i.productId,
    name: i.name,
    productName: i.productName,
    price: i.price,
    quantity: i.quantity,
    imageUrl: i.imageUrl,
    fromQuotationId: quote.id,
  }));
}
