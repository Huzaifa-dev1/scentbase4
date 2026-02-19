import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../products/ProductCard";
import { listenBestSellers } from "../../firebase/products.service";

export default function BestSellingSection() {
  const [topSelling, setTopSelling] = useState([]);

  useEffect(() => {
    // listens only (isActive=true AND isBestSeller=true)
    const unsub = listenBestSellers((items) => {
      // show only 3 (same as your previous layout)
      setTopSelling(items.slice(0, 3));
    });

    return () => unsub();
  }, []);

  // If no best sellers yet, keep section hidden (no UI mess)
  if (!topSelling.length) return null;

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
