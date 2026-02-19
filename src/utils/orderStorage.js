export const MAIN_ORDERS_KEY = "scentbase_orders_v1";

// If your checkout accidentally stored orders in any of these keys,
// admin will still read them and show them.
export const FALLBACK_KEYS = [
  "scentbase_orders_v1",
  "scentbase_orders",
  "scentbaseOrders",
  "orders",
  "orderList",
];

export function normalizeOrder(raw) {
  const orderNumber = String(
    raw?.orderNumber || raw?.orderNo || raw?.id || raw?.order_id || ""
  ).trim();

  const createdAt = raw?.createdAt || raw?.timestamp || raw?.created_on || Date.now();
  const status = raw?.status || "pending";

  return {
    ...raw,
    orderNumber,
    createdAt,
    status,
    customer: raw?.customer || raw?.user || raw?.shipping || {},
    items: Array.isArray(raw?.items) ? raw.items : Array.isArray(raw?.cartItems) ? raw.cartItems : [],
    pricing: raw?.pricing || raw?.totals || raw?.bill || {},
  };
}

export function readOrdersFromKey(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeOrdersToMain(orders) {
  localStorage.setItem(MAIN_ORDERS_KEY, JSON.stringify(orders));
}

export function readAllOrdersMerged() {
  let merged = [];

  for (const key of FALLBACK_KEYS) {
    const list = readOrdersFromKey(key);
    merged = merged.concat(list);
  }

  // normalize + remove invalid empty orderNumber
  const normalized = merged
    .map(normalizeOrder)
    .filter((o) => o.orderNumber);

  // dedupe by orderNumber (keep newest)
  const map = new Map();
  for (const o of normalized) {
    const existing = map.get(o.orderNumber);
    if (!existing) map.set(o.orderNumber, o);
    else {
      const a = existing.createdAt || 0;
      const b = o.createdAt || 0;
      map.set(o.orderNumber, b > a ? o : existing);
    }
  }

  const finalList = Array.from(map.values());
  finalList.sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));

  return finalList;
}

export function syncToMainKey() {
  const merged = readAllOrdersMerged();
  writeOrdersToMain(merged);
  return merged;
}

export function findOrderByNumber(orderNumber) {
  const target = String(orderNumber || "").trim();
  if (!target) return null;

  const merged = readAllOrdersMerged();

  return (
    merged.find((o) => String(o.orderNumber).trim() === target) ||
    merged.find((o) => String(o.orderNumber).trim().toLowerCase() === target.toLowerCase()) ||
    null
  );
}
