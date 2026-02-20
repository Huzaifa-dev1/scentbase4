import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../products/ProductCard";
import { listenBestSellers } from "../../firebase/products.service";

export default function BestSellingSection() {
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Realtime best sellers listener
    const unsub = listenBestSellers((items) => {
      setTopSelling(Array.isArray(items) ? items.slice(0, 3) : []);
      setLoading(false);
    });

    return () => unsub();
  }, []);

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

        {/* ✅ LOADING STATE (skeleton cards) */}
        {loading && (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* ✅ DATA STATE */}
        {!loading && topSelling.length > 0 && (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topSelling.map((p) => (
              <ProductCard key={p.id || p.slug} item={p} />
            ))}
          </div>
        )}

        {/* ✅ EMPTY STATE (still show section, no hiding) */}
        {!loading && topSelling.length === 0 && (
          <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white font-semibold text-lg">
              Best sellers will appear here soon ✨
            </p>
            <p className="text-white/70 mt-2 text-sm">
              Go to Admin → Products and mark items as <b>Best Seller</b> to feature them here.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                to="/products"
                className="inline-flex justify-center rounded-2xl px-5 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
              >
                Browse Products →
              </Link>

              <Link
                to="/admin/products"
                className="inline-flex justify-center rounded-2xl px-5 py-3 text-sm font-medium bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
              >
                Go to Admin →
              </Link>
            </div>
          </div>
        )}

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

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 animate-pulse">
      <div className="h-40 rounded-2xl bg-white/10" />
      <div className="mt-4 h-4 w-3/4 rounded bg-white/10" />
      <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
      <div className="mt-5 h-10 w-full rounded-2xl bg-white/10" />
    </div>
  );
}