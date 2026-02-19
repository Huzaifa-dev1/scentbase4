import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { listenActiveProducts } from "../../firebase/products.service";

export default function ProductGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenActiveProducts((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="text-white/60 py-16 text-center">
        Loading products...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-white/60 py-16 text-center">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}
