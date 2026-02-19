import { useEffect, useMemo, useState } from "react";
import PageShell from "../../components/layout/PageShell";
import toast from "react-hot-toast";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const ORDERS_KEY = "scentbase_orders_v1";
const STATUSES = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

function safeReadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function safeWriteOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

function money(n) {
  return `Rs ${Number(n || 0)}`;
}

function downloadOrdersPDF(list) {
  const rows = list
    .map((o) => {
      const items = (o.items || [])
        .map((x) => `${x.name} x${x.qty} (Rs ${Number(x.price || 0) * Number(x.qty || 0)})`)
        .join("<br/>");

      return `
        <div class="card">
          <div class="top">
            <div>
              <div class="title">${o.orderNumber || "-"}</div>
              <div class="muted">Created: ${fmtDate(o.createdAt || Date.now())}</div>
              <div class="muted">Status: <b>${String(o.status || "pending").toUpperCase()}</b></div>
            </div>
            <div class="total">Total: Rs ${o.pricing?.total ?? 0}</div>
          </div>

          <div class="grid">
            <div>
              <div class="label">Customer</div>
              <div><b>${o.customer?.name || "-"}</b></div>
              <div class="muted">${o.customer?.phone || "-"}</div>
              ${o.customer?.altPhone ? `<div class="muted">${o.customer.altPhone}</div>` : ""}
              <div class="muted">${o.customer?.city || "-"}</div>
              <div class="muted">${o.customer?.address || "-"}</div>
            </div>
            <div>
              <div class="label">Items</div>
              <div class="muted">${items || "-"}</div>
            </div>
          </div>

          <div class="line"></div>

          <div class="priceRow"><span>Subtotal</span><b>Rs ${o.pricing?.subtotal ?? 0}</b></div>
          <div class="priceRow"><span>Delivery</span><b>Rs ${o.pricing?.delivery ?? 0}</b></div>
          <div class="priceRow big"><span>Final Total</span><b>Rs ${o.pricing?.total ?? 0}</b></div>
        </div>
      `;
    })
    .join("");

  const html = `
    <html>
      <head>
        <title>ScentBase Orders</title>
        <style>
          body { font-family: Arial; padding: 24px; color: #111; }
          h1 { margin: 0 0 8px; }
          .muted { color: #555; font-size: 12px; margin-top: 3px; }
          .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; margin: 12px 0; }
          .top { display:flex; justify-content:space-between; gap: 12px; align-items: flex-start; }
          .title { font-size: 16px; font-weight: 700; }
          .total { font-size: 14px; font-weight: 700; }
          .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
          .label { font-size: 12px; font-weight: 700; margin-bottom: 6px; }
          .line { border-top: 1px solid #eee; margin: 12px 0; }
          .priceRow { display:flex; justify-content:space-between; font-size: 12px; padding: 3px 0; }
          .priceRow.big { font-size: 14px; }
          @media print { body { padding: 0; } .card { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <h1>ScentBase Orders</h1>
        <div class="muted">Generated: ${new Date().toLocaleString()}</div>
        ${rows || "<p>No orders found.</p>"}
        <script>window.print()</script>
      </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.open();
  win.document.write(html);
  win.document.close();
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [openOrder, setOpenOrder] = useState(null); // ✅ modal order

  const loadOrders = () => {
    const loaded = safeReadOrders();
    loaded.sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
    setOrders(loaded);
  };

  useEffect(() => {
    loadOrders();
    const onStorage = () => loadOrders();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return orders.filter((o) => {
      const okStatus = status === "all" ? true : String(o.status || "").trim() === status;
      if (!okStatus) return false;
      if (!query) return true;

      const orderNo = String(o.orderNumber || "").toLowerCase();
      const name = String(o.customer?.name || "").toLowerCase();
      const phone = String(o.customer?.phone || "").toLowerCase();
      const alt = String(o.customer?.altPhone || "").toLowerCase();

      return (
        orderNo.includes(query) ||
        name.includes(query) ||
        phone.includes(query) ||
        alt.includes(query)
      );
    });
  }, [orders, status, q]);

  const counts = useMemo(() => {
    const map = { all: orders.length };
    ["pending", "confirmed", "shipped", "delivered", "cancelled"].forEach((s) => {
      map[s] = orders.filter((o) => String(o.status || "").trim() === s).length;
    });
    return map;
  }, [orders]);

  const updateStatus = (orderNumber, newStatus) => {
    const updated = orders.map((o) =>
      String(o.orderNumber) === String(orderNumber) ? { ...o, status: newStatus } : o
    );
    updated.sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
    setOrders(updated);
    safeWriteOrders(updated);

    // also update open modal view
    if (openOrder?.orderNumber === orderNumber) {
      setOpenOrder({ ...openOrder, status: newStatus });
    }

    toast.success(`Status updated → ${newStatus}`);
  };

  const deleteOrder = (orderNumber) => {
    if (!confirm(`Delete order ${orderNumber}? This cannot be undone.`)) return;
    const updated = orders.filter((o) => String(o.orderNumber) !== String(orderNumber));
    setOrders(updated);
    safeWriteOrders(updated);
    if (openOrder?.orderNumber === orderNumber) setOpenOrder(null);
    toast("Order deleted", { icon: "🗑️" });
  };

  return (
    <PageShell container={false}>
      <div className="bg-[#0b0b0c] min-h-[calc(100vh-64px)]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="inline-flex text-xs font-medium px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white">
                Admin Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Orders</h1>
              <p className="text-white/70 mt-2">Recent first • COD only</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  loadOrders();
                  toast.success("Orders refreshed");
                }}
                className="rounded-2xl px-4 py-2 text-sm font-medium border border-white/15 text-white hover:bg-white/10 transition"
              >
                Refresh
              </button>

              <button
                onClick={() => downloadOrdersPDF(filtered)}
                className="rounded-2xl px-4 py-2 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
              >
                Download PDF
              </button>
             
             <button onClick={() => signOut(auth)} className="rounded-2xl px-4 py-2 text-sm font-medium border bg-red-700  border-white/15 text-white hover:bg-white/10 transition">
                Sign Out
             </button>
            </div>
          </div>

          {/* Status chips */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  status === s
                    ? "border-[#b68a5a] bg-[#b68a5a]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="text-xs text-white/60 capitalize">{s}</p>
                <p className="text-lg font-semibold text-white">{counts[s] ?? 0}</p>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-xs text-white/60">Search</label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by order #, name, phone..."
                  className="mt-2 w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/25"
                />
              </div>

              <div>
                <label className="text-xs text-white/60">Status filter</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orders list */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/10 text-xs text-white/60">
              <div className="col-span-3">Order</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-8">
                <p className="text-white/70">No orders found.</p>
              </div>
            ) : (
              filtered.map((o) => (
                <div
                  key={o.orderNumber}
                  className="grid md:grid-cols-12 gap-3 px-5 py-5 border-b border-white/10 hover:bg-white/5 transition"
                >
                  <div className="md:col-span-3">
                    <p className="text-white font-semibold">{o.orderNumber}</p>
                    <p className="text-xs text-white/50 mt-1">{fmtDate(o.createdAt)}</p>
                    <p className="text-xs text-white/50 mt-1">
                      Items: {o.items?.reduce((s, x) => s + (x.qty || 0), 0) || 0}
                    </p>
                  </div>

                  <div className="md:col-span-3">
                    <p className="text-white/90">{o.customer?.name || "—"}</p>
                    <p className="text-xs text-white/50 mt-1">
                      {o.customer?.phone || "—"}
                      {o.customer?.altPhone ? ` • ${o.customer.altPhone}` : ""}
                    </p>
                    <p className="text-xs text-white/50 mt-1">{o.customer?.city || "—"}</p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-white font-semibold">{money(o.pricing?.total)}</p>
                    <p className="text-xs text-white/50 mt-1">
                      Delivery: {money(o.pricing?.delivery)}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-white/60">Update</p>
                    <select
                      value={o.status || "pending"}
                      onChange={(e) => updateStatus(o.orderNumber, e.target.value)}
                      className="mt-2 w-full rounded-2xl bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25"
                    >
                      {STATUSES.filter((s) => s !== "all").map((s) => (
                        <option key={s} value={s}>
                          {s.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 flex md:justify-end items-start gap-2">
                    {/* ✅ Open Order modal (NO ROUTE) */}
                    <button
                      onClick={() => setOpenOrder(o)}
                      className="rounded-2xl px-4 py-2 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
                    >
                      Open Order
                    </button>

                    <button
                      onClick={() => deleteOrder(o.orderNumber)}
                      className="rounded-2xl px-4 py-2 text-sm font-medium border border-white/15 text-white hover:bg-white/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ✅ Simple order detail popup */}
          {openOrder && (
            <OrderModal
              order={openOrder}
              onClose={() => setOpenOrder(null)}
              onUpdateStatus={updateStatus}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}

/** ✅ Simple, clean order detail modal */
function OrderModal({ order, onClose, onUpdateStatus }) {
  const itemsCount = order.items?.reduce((s, x) => s + (x.qty || 0), 0) || 0;

  const printSlip = () => window.print();

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#0b0b0c] shadow-2xl shadow-black/60 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <p className="text-white font-semibold text-lg">{order.orderNumber}</p>
            <p className="text-white/60 text-sm mt-1">
              {fmtDate(order.createdAt)} • {itemsCount} items
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={printSlip}
              className="rounded-2xl px-4 py-2 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-2xl px-4 py-2 text-sm font-medium border border-white/15 text-white hover:bg-white/10 transition"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-5 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-white font-semibold">Customer</p>
              <div className="mt-3 text-sm space-y-2">
                <Info label="Name" value={order.customer?.name || "—"} />
                <Info label="Phone" value={order.customer?.phone || "—"} />
                <Info label="Alt Phone" value={order.customer?.altPhone || "—"} />
                <Info label="City" value={order.customer?.city || "—"} />
                <Info label="Address" value={order.customer?.address || "—"} />
                <Info label="Note" value={order.customer?.note || "—"} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-white font-semibold">Items</p>
              <div className="mt-3 space-y-2">
                {order.items?.map((x) => (
                  <div
                    key={x.id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-3"
                  >
                    <div>
                      <p className="text-white">{x.name}</p>
                      <p className="text-xs text-white/60 mt-1">
                        Qty: {x.qty} • Price: {money(x.price)}
                      </p>
                    </div>
                    <p className="text-white font-semibold">{money(x.price * x.qty)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-white font-semibold">Status</p>
              <p className="text-white/60 text-sm mt-2">
                Current: <b className="text-white">{String(order.status || "pending").toUpperCase()}</b>
              </p>

              <select
                value={order.status || "pending"}
                onChange={(e) => onUpdateStatus(order.orderNumber, e.target.value)}
                className="mt-3 w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/25"
              >
                {STATUSES.filter((s) => s !== "all").map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-white font-semibold">Pricing</p>
              <div className="mt-3 text-sm space-y-2">
                <Row label="Subtotal" value={money(order.pricing?.subtotal)} />
                <Row label="Delivery" value={money(order.pricing?.delivery)} />
                <div className="border-t border-white/10 my-2" />
                <Row label="Total" value={money(order.pricing?.total)} strong />
              </div>
              <p className="text-xs text-white/50 mt-4">
                Payment: <b>COD</b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-white/60">{label}</p>
      <p className={strong ? "text-white font-semibold" : "text-white/90"}>{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-white/60">{label}</p>
      <p className="text-white text-right break-words">{value}</p>
    </div>
  );
}
