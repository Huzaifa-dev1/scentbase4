import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import { useCart } from "../context/CartContext";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function Cart() {
  const navigate = useNavigate();
  const { items, totals, inc, dec, remove, clear } = useCart();
  const [code, setCode] = useState("");

  // simple voucher logic (later we can move it to Firebase)
  const discount = useMemo(() => {
    const c = code.trim().toUpperCase();
    if (!c) return 0;

    if (c === "SCENT10") return Math.round(totals.subtotal * 0.1);
    if (c === "FIRST200") return 200;

    return -1; // invalid
  }, [code, totals.subtotal]);

  // ✅ Delivery rule:
  // Above 5000 => Free
  // Otherwise fixed 190 (only if cart has items)
  const deliveryFee = totals.subtotal > 5000 ? 0 : items.length ? 190 : 0;

  const finalTotal =
    totals.subtotal + deliveryFee - (discount > 0 ? discount : 0);

  const applyVoucher = () => {
    if (!code.trim()) return toast.error("Enter a voucher code");
    if (discount === -1) return toast.error("Invalid voucher code");
    toast.success("Voucher applied!");
  };

  // ✅ safer checkout navigation
  const goCheckout = () => {
    if (!items.length) return toast.error("Cart is empty");
    navigate("/checkout");
  };

  return (
    <PageShell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black">Cart</h1>
          <p className="text-black/60 mt-2">
            Review your items before checkout (COD only).
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clear}
            className="rounded-2xl px-4 py-2 text-sm font-medium border border-black/10 text-black hover:bg-black/5 transition"
          >
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
          <p className="text-black/70">Your cart is empty.</p>
          <Link
            to="/products"
            className="mt-5 inline-flex rounded-2xl px-6 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl border border-black/10 bg-white p-5 flex flex-col sm:flex-row gap-4 shadow-sm"
              >
                {/* image placeholder safe */}
                <div className="h-24 w-24 rounded-2xl border border-black/10 bg-gradient-to-br from-[#f7efe8] to-white flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "";
                      }}
                    />
                  ) : (
                    <span className="text-xs text-black/50 px-2 text-center">
                      No Image
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-black">{p.name}</p>
                  <p className="text-sm text-black/60 mt-1">
                    Rs {p.price} each
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {/* qty controls */}
                    <div className="inline-flex items-center rounded-2xl border border-black/10 overflow-hidden">
                      <button
                        onClick={() => dec(p.id)}
                        className="px-4 py-2 text-black hover:bg-black/5 transition"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 text-black/80 text-sm">
                        {p.qty}
                      </span>
                      <button
                        onClick={() => inc(p.id)}
                        className="px-4 py-2 text-black hover:bg-black/5 transition"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => remove(p.id)}
                      className="rounded-2xl px-4 py-2 text-sm font-medium border border-black/10 text-black hover:bg-black/5 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-black/50 text-xs">Total</p>
                  <p className="text-black font-semibold">
                    Rs {p.price * p.qty}
                  </p>
                  {p.actual ? (
                    <p className="text-xs text-black/40 line-through mt-1">
                      Rs {p.actual * p.qty}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-3xl border border-black/10 bg-white p-6 h-fit shadow-sm">
            <p className="text-lg font-semibold text-black">Summary</p>

            {/* Voucher */}
            <div className="mt-4">
              <p className="text-sm font-medium text-black">Discount Voucher</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SCENT10"
                  className="flex-1 rounded-2xl border border-black/10 px-4 py-2 text-sm focus:outline-none focus:border-black/30"
                />
                <button
                  onClick={applyVoucher}
                  className="rounded-2xl px-4 py-2 text-sm font-medium bg-black text-white hover:opacity-90 transition"
                >
                  Apply
                </button>
              </div>

              {discount === -1 ? (
                <p className="text-xs text-red-600 mt-2">
                  Invalid code. Try SCENT10 or FIRST200
                </p>
              ) : discount > 0 ? (
                <p className="text-xs text-green-700 mt-2">
                  Discount applied: Rs {discount}
                </p>
              ) : (
                <p className="text-xs text-black/50 mt-2">
                  Try: <b>SCENT10</b> (10%) or <b>FIRST200</b> (Rs 200)
                </p>
              )}
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <Row label="Items" value={totals.itemsCount} />
              <Row label="Subtotal" value={`Rs ${totals.subtotal}`} />
              <Row label="Savings" value={`Rs ${totals.savings}`} />
              <Row
                label="Delivery"
                value={deliveryFee === 0 ? "Free" : `Rs ${deliveryFee}`}
              />
              {discount > 0 ? (
                <Row label="Voucher Discount" value={`- Rs ${discount}`} />
              ) : null}

              <div className="border-t border-black/10 my-3" />

              <Row label="Final Total" value={`Rs ${finalTotal}`} strong />
            </div>

            {/* ✅ button instead of Link */}
            <button
              onClick={goCheckout}
              className="mt-5 inline-flex w-full justify-center rounded-2xl px-6 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
            >
              Continue to Checkout →
            </button>

            <p className="text-xs text-black/50 mt-3 text-center">
              Payment method: Cash on Delivery (COD)
            </p>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-black/60">{label}</p>
      <p className={strong ? "text-black font-semibold" : "text-black/80"}>
        {value}
      </p>
    </div>
  );
}