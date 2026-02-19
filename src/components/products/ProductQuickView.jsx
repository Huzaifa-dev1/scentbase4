// src/components/products/ProductQuickView.jsx
import { useEffect } from "react";
import { useCart } from "../../context/CartContext";

export default function ProductQuickView({ open, item, onClose }) {
  const { addToCart } = useCart();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  const image = item.imageUrl || item.image || "/hero.jpg";
  const tag = item.isBestSeller ? "Best Seller" : (item.tag || "Perfume");
  const family = item.family || `${item.size || "100ml"} • ${item.category || "Perfume"}`;

  const priceNum = Number(String(item.price ?? 0).replaceAll(",", ""));
  const actualNum = Number(String(item.actual ?? item.price ?? 0).replaceAll(",", ""));

  const cartItem = {
    id: item.id || item.slug,
    slug: item.slug,
    name: item.name,
    price: priceNum,
    actual: actualNum,
    image,
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10
                   bg-gradient-to-br from-[#141416] to-[#0f0f10]
                   shadow-[0_0_80px_rgba(0,0,0,0.6)]
                   animate-[sbZoom_220ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          {/* image */}
          <div className="relative h-72 md:h-full">
            <img src={image} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-black/40 text-white border border-white/15 backdrop-blur">
              {tag}
            </div>
          </div>

          {/* details */}
          <div className="p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/50">{family}</p>
                <h2 className="text-2xl font-semibold text-white mt-1">{item.name}</h2>
              </div>

              <button
                onClick={onClose}
                className="rounded-xl px-3 py-2 border border-white/15 bg-white/5 text-white hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              {actualNum > priceNum ? (
                <p className="text-sm text-white/40 line-through">Rs {actualNum.toLocaleString()}</p>
              ) : (
                <span />
              )}
              <p className="text-xl font-semibold text-[#b68a5a]">Rs {priceNum.toLocaleString()}</p>
            </div>

            <p className="mt-4 text-white/70 leading-relaxed">
              {item.description || item.desc || "No description added yet."}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => addToCart(cartItem)}
                className="flex-1 rounded-2xl px-5 py-3 text-sm font-medium
                           bg-[#b68a5a] text-black
                           transition duration-300
                           hover:scale-[1.02] hover:shadow-lg"
              >
                Add to Cart
              </button>

              <button
                onClick={onClose}
                className="rounded-2xl px-5 py-3 text-sm font-medium
                           border border-white/20 text-white
                           transition duration-300
                           hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-white/50">Size</p>
                <p className="text-white mt-1">{item.size || "—"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-white/50">Stock</p>
                <p className="text-white mt-1">{item.stock ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes sbZoom {
            from { transform: translateY(14px) scale(.98); opacity: .0; }
            to   { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
