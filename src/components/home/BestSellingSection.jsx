// src/components/home/BestSellingSection.jsx
import { Link } from "react-router-dom";
import ProductCard from "../products/ProductCard";

/**
 * ✅ Hardcoded Best Selling (3 cards)
 * - Uses same UI layout as your current section
 * - Images must be in /public with EXACT names:
 *   1) /savagedior.jpg (or .png)
 *   2) /Invictus.jpg
 *   3) /Tobbaco.jpg
 *
 * ⚠️ If your files are .png, just change the extensions below.
 */

const BEST_SELLING = [
  {
    id: "best-savagedior",
    slug: "savagedior",
    name: "Sauvage Dior",
    price: 2150,
    actual: 2558,
    image: "/savagedior.jpeg",
    category: "Perfume",
    isActive: true,
    isBestSeller: true,
  },
  {
    id: "best-invictus",
    slug: "invictus",
    name: "Invictus",
    price: 1850,
    actual: 2267,
    image: "/invictus.jpeg",
    category: "Perfume",
    isActive: true,
    isBestSeller: true,
  },
  {
    id: "best-tobbaco",
    slug: "",
    name: "Tobbaco",
    price: 2150,
    actual: 2617,
    image: "/tobacco.jpeg",
    category: "Perfume",
    isActive: true,
    isBestSeller: true,
  },
  
];

export default function BestSellingSection() {
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

        {/* ✅ same grid layout */}
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BEST_SELLING.map((p) => (
            <ProductCard key={p.id} item={p} />
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