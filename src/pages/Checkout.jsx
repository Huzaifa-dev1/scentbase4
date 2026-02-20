import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import PageShell from "../components/layout/PageShell";
import { useCart } from "../context/CartContext";
import { WHATSAPP_NUMBER } from "../data/siteConfig";

// ✅ Must exist in: src/firebase/orders.service.js
import { createOrderOneStep } from "../firebase/orders.service";

// -------------------------
// Helpers
// -------------------------
function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}

// Strict 11-digit Pak number rule: 03XXXXXXXXX
function isValidPkMobile11(v) {
  const d = digitsOnly(v);
  return d.length === 11 && d.startsWith("03");
}

function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function formatOrderForWhatsApp(order) {
  const lines = [];
  lines.push(`ScentBase COD Order`);
  lines.push(`Order No: ${order.orderNumber}`);
  lines.push(`Name: ${order.customer.name}`);
  lines.push(`Phone: ${order.customer.phone}`);
  if (order.customer.altPhone) lines.push(`Alt Phone: ${order.customer.altPhone}`);
  lines.push(`City: ${order.customer.city}`);
  lines.push(`Address: ${order.customer.address}`);
  if (order.customer.note) lines.push(`Note: ${order.customer.note}`);
  lines.push(`--------------------`);
  lines.push(`Items:`);
  order.items.forEach((x) => {
    lines.push(`• ${x.name} x${x.qty} = Rs ${Number(x.price) * Number(x.qty)}`);
  });
  lines.push(`--------------------`);
  lines.push(`Subtotal: Rs ${order.pricing.subtotal}`);
  lines.push(`Delivery: Rs ${order.pricing.delivery}`);
  lines.push(`Final Total: Rs ${order.pricing.total}`);
  return lines.join("\n");
}

function formatChangeRequestForWhatsApp(orderNumber) {
  return `Hi ScentBase! I want to update my order details.\nOrder No: ${orderNumber}\nChange needed: (write here)\n`;
}

// -------------------------
// Component
// -------------------------
export default function Checkout() {
  const navigate = useNavigate();
  const { items, totals, clear } = useCart();

  const [loading, setLoading] = useState(false);

  // confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);

  // slip after order placed
  const [placedOrder, setPlacedOrder] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    altPhone: "",
    city: "",
    address: "",
    note: "",
  });

  // ✅ Delivery rule:
  // Above 5000 => Free
  // Otherwise fixed 190 (only if cart has items)
  const deliveryFee = items.length ? (totals.subtotal > 5000 ? 0 : 190) : 0;

  const finalTotal = useMemo(
    () => totals.subtotal + deliveryFee,
    [totals.subtotal, deliveryFee]
  );

  // Redirect if cart empty (and no slip)
  useEffect(() => {
    if (!items.length && !placedOrder) navigate("/products");
  }, [items.length, placedOrder, navigate]);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.phone.trim()) return "Phone is required (11 digits)";

    if (!isValidPkMobile11(form.phone)) {
      return "Phone must be 11 digits in format 03XXXXXXXXX";
    }

    if (form.altPhone.trim() && !isValidPkMobile11(form.altPhone)) {
      return "Optional number must also be 11 digits (03XXXXXXXXX)";
    }

    if (!form.city.trim()) return "City is required";
    if (!form.address.trim()) return "Address is required";
    if (!items.length) return "Cart is empty";
    return "";
  };

  // Step 1: open confirmation modal
  const openConfirmation = () => {
    const err = validate();
    if (err) return toast.error(err);
    setShowConfirm(true);
  };

  // ✅ Step 2: confirm & place order (Firestore one-step write)
  const confirmAndPlaceOrder = async () => {
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);

    try {
      // build payload for Firestore
      const payload = {
        status: "pending",
        paymentMethod: "COD",
        customer: {
          name: form.name.trim(),
          phone: digitsOnly(form.phone),
          altPhone: form.altPhone.trim() ? digitsOnly(form.altPhone) : "",
          city: form.city.trim(),
          address: form.address.trim(),
          note: form.note.trim(),
        },
        items: items.map((x) => ({
          id: x.id,
          name: x.name,
          price: Number(x.price),
          qty: Number(x.qty),
          image: x.image || "",
        })),
        pricing: {
          subtotal: Number(totals.subtotal),
          delivery: Number(deliveryFee),
          total: Number(finalTotal),
        },
      };

      // ✅ ONE step create (no update after)
      const { id, orderNumber } = await createOrderOneStep(payload);

      // close modal + clear cart
      setShowConfirm(false);
      clear();

      // slip data (UI-only createdAt for display)
      setPlacedOrder({
        id,
        orderNumber,
        ...payload,
        createdAt: Date.now(),
      });

      toast.success(`Order confirmed! ${orderNumber}`);
    } catch (e) {
      console.error("Order failed:", e);
      toast.error("Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const printSlip = () => window.print();

  const copyOrderNo = async () => {
    if (!placedOrder?.orderNumber) return;
    try {
      await navigator.clipboard.writeText(placedOrder.orderNumber);
      toast.success("Order number copied!");
    } catch {
      toast.error("Copy failed (browser restriction)");
    }
  };

  // -------------------------
  // Slip screen
  // -------------------------
  if (placedOrder) {
    const orderMsg = formatOrderForWhatsApp(placedOrder);
    const changeMsg = formatChangeRequestForWhatsApp(placedOrder.orderNumber);

    return (
      <PageShell>
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm print:shadow-none print:border-black/20">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium inline-flex px-3 py-1 rounded-full bg-black text-white">
                Order Confirmed
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-black mt-3">
                Confirmation Slip
              </h1>
              <p className="text-black/60 mt-2">
                Save this slip for your record. You can print or save as PDF.
              </p>
            </div>

            <div className="flex gap-2 print:hidden">
              <button
                onClick={copyOrderNo}
                className="rounded-2xl px-4 py-2 text-sm font-medium border border-black/10 text-black hover:bg-black/5 transition"
              >
                Copy Order #
              </button>
              <button
                onClick={printSlip}
                className="rounded-2xl px-4 py-2 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
              >
                Print / Save PDF
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Left */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-3xl border border-black/10 p-5">
                <p className="text-sm text-black/60">Order Number</p>
                <p className="text-xl font-semibold text-black mt-1">{placedOrder.orderNumber}</p>
                <p className="text-xs text-black/50 mt-2">
                  Status: <b className="text-black">Pending</b> (Admin will confirm)
                </p>
              </div>

              <div className="rounded-3xl border border-black/10 p-5">
                <p className="text-lg font-semibold text-black">Customer Details</p>

                <div className="mt-3 grid gap-2 text-sm">
                  <Info label="Name" value={placedOrder.customer.name} />
                  <Info label="Phone" value={placedOrder.customer.phone} />
                  <Info label="Optional Phone" value={placedOrder.customer.altPhone || "—"} />
                  <Info label="City" value={placedOrder.customer.city} />
                  <Info label="Address" value={placedOrder.customer.address} />
                  <Info label="Note" value={placedOrder.customer.note || "—"} />
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2 print:hidden">
                  <a
                    href={waLink(changeMsg)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl px-5 py-3 text-sm font-medium bg-black text-white hover:opacity-90 transition text-center"
                  >
                    WhatsApp to Change Details →
                  </a>

                  <a
                    href={waLink(orderMsg)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl px-5 py-3 text-sm font-medium border border-black/10 text-black hover:bg-black/5 transition text-center"
                  >
                    Send Slip on WhatsApp →
                  </a>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="rounded-3xl border border-black/10 p-5 h-fit">
              <p className="text-lg font-semibold text-black">Order Summary</p>

              <div className="mt-4 space-y-3">
                {placedOrder.items.map((x) => (
                  <div key={x.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="text-black font-medium">{x.name}</p>
                      <p className="text-black/60 text-xs">Qty: {x.qty}</p>
                    </div>
                    <p className="text-black/80">Rs {Number(x.price) * Number(x.qty)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/10 my-4" />

              <div className="space-y-2 text-sm">
                <Row label="Subtotal" value={`Rs ${placedOrder.pricing.subtotal}`} />
                <Row label="Delivery (Standard)" value={`Rs ${placedOrder.pricing.delivery}`} />
                <div className="border-t border-black/10 my-2" />
                <Row label="Final Total" value={`Rs ${placedOrder.pricing.total}`} strong />
              </div>

              <p className="text-xs text-black/50 mt-4">
                Payment method: <b>Cash on Delivery (COD)</b>
              </p>

              <div className="mt-4 print:hidden">
                <Link
                  to="/products"
                  className="inline-flex w-full justify-center rounded-2xl px-6 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
                >
                  Continue Shopping →
                </Link>
              </div>
            </div>
          </div>

          <p className="text-xs text-black/50 mt-6">
            Keep your order number safe. For changes/support, contact ScentBase with your Order No.
          </p>
        </div>
      </PageShell>
    );
  }

  // -------------------------
  // Checkout screen
  // -------------------------
  return (
    <PageShell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black">Checkout</h1>
          <p className="text-black/60 mt-2">
            COD only. Please enter correct details and confirm before placing.
          </p>
        </div>

        <Link
          to="/cart"
          className="rounded-2xl px-4 py-2 text-sm font-medium border border-black/10 text-black hover:bg-black/5 transition"
        >
          Back to Cart
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-black">Delivery Details</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" name="name" value={form.name} onChange={onChange} placeholder="Your name" />

            <Input
              label="Phone (11 digits)"
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="03XXXXXXXXX"
              hint="Format: 03XXXXXXXXX (11 digits)"
            />

            <Input
              label="Optional Phone (11 digits)"
              name="altPhone"
              value={form.altPhone}
              onChange={onChange}
              placeholder="03XXXXXXXXX"
              hint="Optional backup number"
            />

            <Input label="City" name="city" value={form.city} onChange={onChange} placeholder="Lahore" />

            <div className="sm:col-span-2">
              <Input
                label="Address"
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="House no, street, area"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-black">Note (optional)</label>
              <textarea
                name="note"
                value={form.note}
                onChange={onChange}
                rows="4"
                className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-black/30"
                placeholder="Any instructions (timing, landmarks, etc.)"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={openConfirmation}
              disabled={loading}
              className="rounded-2xl px-6 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Please wait..." : "Review & Confirm Order"}
            </button>

            <a
              href={waLink("Hi ScentBase! I want to place an order (COD).")}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl px-6 py-3 text-sm font-medium border border-black/10 text-black hover:bg-black/5 transition text-center"
            >
              Quick WhatsApp Order →
            </a>
          </div>

          <p className="text-xs text-black/50 mt-3">
            You’ll see a confirmation slip after placing. You can save it as PDF.
          </p>
        </div>

        {/* Summary */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 h-fit shadow-sm">
          <h2 className="text-lg font-semibold text-black">Order Summary</h2>

          <div className="mt-4 space-y-3">
            {items.map((x) => (
              <div key={x.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="text-black font-medium">{x.name}</p>
                  <p className="text-black/60 text-xs">Qty: {x.qty}</p>
                </div>
                <p className="text-black/80">Rs {Number(x.price) * Number(x.qty)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-black/10 my-4" />

          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={`Rs ${totals.subtotal}`} />
            <Row label="Delivery (Standard)" value={deliveryFee === 0 ? "Free" : `Rs ${deliveryFee}`} />
            <div className="border-t border-black/10 my-2" />
            <Row label="Final Total" value={`Rs ${finalTotal}`} strong />
          </div>

          <p className="text-xs text-black/50 mt-4">
            Payment method: <b>Cash on Delivery</b>
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-black/10 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-black/10">
              <p className="text-xs font-medium inline-flex px-3 py-1 rounded-full bg-black text-white">
                Confirm Order
              </p>
              <h3 className="text-xl font-semibold text-black mt-3">
                Please double-check your details
              </h3>
              <p className="text-sm text-black/60 mt-1">
                Once confirmed, your order number will be generated.
              </p>
            </div>

            <div className="p-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-black/10 p-4">
                <p className="font-semibold text-black">Delivery Info</p>
                <div className="mt-3 space-y-2 text-sm">
                  <Info label="Name" value={form.name.trim()} />
                  <Info label="Phone" value={digitsOnly(form.phone)} />
                  <Info
                    label="Optional Phone"
                    value={form.altPhone.trim() ? digitsOnly(form.altPhone) : "—"}
                  />
                  <Info label="City" value={form.city.trim()} />
                  <Info label="Address" value={form.address.trim()} />
                  <Info label="Note" value={form.note.trim() || "—"} />
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 p-4">
                <p className="font-semibold text-black">Order Summary</p>
                <div className="mt-3 space-y-2 text-sm max-h-44 overflow-auto pr-1">
                  {items.map((x) => (
                    <div key={x.id} className="flex justify-between gap-3">
                      <span className="text-black/80">{x.name} x{x.qty}</span>
                      <span className="text-black">Rs {Number(x.price) * Number(x.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-black/10 my-3" />

                <div className="space-y-2 text-sm">
                  <Row label="Subtotal" value={`Rs ${totals.subtotal}`} />
                  <Row label="Delivery (Standard)" value={deliveryFee === 0 ? "Free" : `Rs ${deliveryFee}`} />
                  <Row label="Final Total" value={`Rs ${finalTotal}`} strong />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-black/10 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="rounded-2xl px-5 py-3 text-sm font-medium border border-black/10 text-black hover:bg-black/5 transition disabled:opacity-60"
              >
                Edit Details
              </button>

              <button
                onClick={confirmAndPlaceOrder}
                disabled={loading}
                className="rounded-2xl px-5 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Placing..." : "Confirm & Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

// -------------------------
// UI pieces
// -------------------------
function Input({ label, hint, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-black">{label}</label>
      <input
        {...props}
        className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-black/30"
      />
      {hint ? <p className="text-xs text-black/50 mt-1">{hint}</p> : null}
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-black/60">{label}</p>
      <p className={strong ? "text-black font-semibold" : "text-black/80"}>{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-black/60">{label}</p>
      <p className="text-black text-right break-words">{value}</p>
    </div>
  );
}