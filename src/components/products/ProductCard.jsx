// src/components/products/ProductCard.jsx
import { useCart } from "../../context/CartContext";

export default function ProductCard({ item, onView, compact = false }) {
  const { addToCart } = useCart();

  const productId = item.id || item.slug;
  const image = item.imageUrl || item.image || "/hero.jpg";
  const tag = item.isBestSeller ? "Best Seller" : item.tag || "Perfume";
  const family =
    item.family || `${item.size || "100ml"} • ${item.category || "Perfume"}`;

  const priceNum = Number(String(item.price ?? 0).replaceAll(",", ""));

  // 🔥 Stable 400–500 offset
  function stableOffset(seed) {
    const s = String(seed || "x");
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 400 + (Math.abs(hash) % 101);
  }

  const firebaseActual = Number(String(item.actual ?? 0).replaceAll(",", ""));
  const actualNum =
    firebaseActual && firebaseActual > priceNum
      ? firebaseActual
      : priceNum + stableOffset(productId);

  const cartItem = {
    id: productId,
    slug: item.slug,
    name: item.name,
    price: priceNum,
    actual: actualNum,
    image,
  };

  const imgHeight = compact ? "h-44" : "h-56";
  const pad = compact ? "p-5" : "p-6";

  return (
    <div
      className="group relative rounded-[2rem] border border-white/10 
      bg-gradient-to-br from-[#141416] to-[#0f0f10]
      shadow-[0_0_50px_rgba(0,0,0,0.35)]
      overflow-hidden
      transition-all duration-500 ease-out
      hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_0_60px_rgba(182,138,90,0.18)]"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

      <button
        type="button"
        onClick={() => onView?.(item)}
        className="block relative w-full text-left"
      >
        <div className={`relative ${imgHeight} overflow-hidden`}>
          <img
            src={image}
            alt={item.name}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-black/40 text-white border border-white/15 backdrop-blur">
            {tag}
          </div>
        </div>
      </button>

      <div className={`${pad} relative`}>
        <p className="text-sm text-white/50">{family}</p>
        <h3 className="font-semibold text-lg text-white mt-1">{item.name}</h3>

        {/* ✅ Improved Price Section */}
        <div className="mt-3 flex items-end gap-3">
          <p className="text-2xl font-bold text-[#b68a5a]">
            Rs {priceNum.toLocaleString()}
          </p>

          <p className="text-base text-white/40 line-through mb-[3px]">
            Rs {actualNum.toLocaleString()}
          </p>
        </div>

        <p className="text-sm text-white/60 mt-3 line-clamp-2">
          {item.description || item.desc || ""}
        </p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => addToCart(cartItem)}
            className="flex-1 rounded-2xl px-4 py-2 text-sm font-medium
                       bg-[#b68a5a] text-black
                       transition duration-300
                       hover:scale-105 hover:shadow-lg"
          >
            Add to Cart
          </button>

          <button
            type="button"
            onClick={() => onView?.(item)}
            className="rounded-2xl px-4 py-2 text-sm font-medium
                       border border-white/20 text-white
                       transition duration-300
                       hover:bg-white/10 hover:scale-105"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}