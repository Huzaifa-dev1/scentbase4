// src/pages/Products.jsx
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/products/ProductCard";
import ProductQuickView from "../components/products/ProductQuickView";
import { listenProducts } from "../firebase/products.service";
import PageShell from "../components/layout/PageShell"; // ✅ use your existing shell

export default function Products() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    const unsub = listenProducts((all) => {
      // show only active products on frontend
      setItems((all || []).filter((p) => p.isActive !== false));
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((p) =>
      (p.name || "").toLowerCase().includes(s) ||
      (p.slug || "").toLowerCase().includes(s) ||
      (p.category || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <PageShell showBack={false} container={false}>
      {/* page background kept, but within RootLayout + Footer */}
      <div className="bg-[#0b0b0c] min-h-[calc(100vh-120px)]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-white">
                Products
              </h1>
              <p className="text-white/70 mt-1">
                Fresh drops, best sellers, and premium picks.
              </p>
            </div>

            <div className="w-full sm:w-[320px]">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name / slug / category..."
                className="w-full rounded-2xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white outline-none
                           focus:border-white/20 focus:ring-4 focus:ring-white/5"
              />
            </div>
          </div>

          {/* ✅ smaller cards + tighter grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <div key={p.id} className="scale-[0.93] origin-top">
                <ProductCard item={p} onView={setViewItem} compact />
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-14 text-center text-white/60">
              No products found.
            </div>
          ) : null}
        </div>

        <ProductQuickView
          open={!!viewItem}
          item={viewItem}
          onClose={() => setViewItem(null)}
        />
      </div>
    </PageShell>
  );
}
