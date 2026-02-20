import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../products/ProductCard";
import { listenBestSellers, getBestSellersOnce } from "../../firebase/products.service";

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 animate-pulse">
      <div className="h-40 rounded-2xl bg-white/10" />
      <div className="mt-4 h-4 w-3/4 rounded bg-white/10" />
      <div className="mt-2 h-4 w-1/2 rounded bg-white/10" />
      <div className="mt-5 h-10 rounded-2xl bg-white/10" />
    </div>
  );
}

export default function BestSellingSection() {
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [softError, setSoftError] = useState("");

  useEffect(() => {
    let unsub = null;
    let cancelled = false;

    // ✅ Hard timeout so skeleton never stays forever
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
      }
    }, 5000);

    // ✅ Listener (real-time)
    unsub = listenBestSellers(
      (items) => {
        if (cancelled) return;
        setTopSelling(items.slice(0, 3));
        setSoftError("");
        setLoading(false);
      },
      async (err) => {
        // ✅ If index missing or permission issue, fallback to one-time fetch
        if (cancelled) return;

        console.error("BestSelling listener failed:", err);
        setSoftError("Best sellers temporarily unavailable.");
        setLoading(true);

        try {
          const once = await getBestSellersOnce();
          if (cancelled) return;
          setTopSelling(once.slice(0, 3));
          setLoading(false);
        } catch (e) {
          console.error("BestSelling fallback fetch failed:", e);
          if (cancelled) return;
          setTopSelling([]);
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (unsub) unsub();
    };
  }, []);

  // ✅ If still loading → show skeleton
  if (loading) {
    return (
      <section className="bg-[#0b0b0c]">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                Best Selling
              </h2>
              <p className="text-white/70 mt-1">
                Premium picks people reorder again and again.
              </p>
            </div>

            <div className="hidden sm:inline-flex rounded-2xl px-5 py-2 text-sm font-medium bg-white/10 border border-white/15 text-white/60">
              Loading…
            </div>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>
    );
  }

  // ✅ After loading, if no items → show clean section (NOT hidden)
  if (!topSelling.length) {
    return (
      <section className="bg-[#0b0b0c]">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                Best Selling
              </h2>
              <p className="text-white/70 mt-1">
                Premium picks people reorder again and again.
              </p>
              {softError ? (
                <p className="text-xs text-white/50 mt-2">{softError}</p>
              ) : (
                <p className="text-xs text-white/50 mt-2">
                  No best sellers marked yet. Add “Best Seller” from Admin Products.
                </p>
              )}
            </div>

            <Link
              to="/products"
              className="hidden sm:inline-flex rounded-2xl px-5 py-2 text-sm font-medium bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
            >
              Explore All →
            </Link>
          </div>

          <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/70 text-sm">
              Best sellers will appear here automatically once you mark products as:
              <b className="text-white"> isActive = true</b> and{" "}
              <b className="text-white">isBestSeller = true</b>.
            </p>

            <div className="mt-4 sm:hidden">
              <Link
                to="/products"
                className="inline-flex rounded-2xl px-5 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
              >
                Explore All Products →
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ✅ Normal render
  return (
    <section className="bg-[#0b0b0c]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              Best Selling
            </h2>
            <p className="text-white/70 mt-1">
              Premium picks people reorder again and again.
            </p>
          </div>

          <Link
            to="/products"
            className="hidden sm:inline-flex rounded-2xl px-5 py-2 text-sm font-medium bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
          >
            Explore All →
          </Link>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topSelling.map((p) => (
            <ProductCard key={p.id || p.slug} item={p} />
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            to="/products"
            className="inline-flex rounded-2xl px-5 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
          >
            Explore All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}