// src/components/layout/Navbar.jsx
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const linkBase =
  "text-sm font-medium text-black/70 hover:text-black transition";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totals } = useCart(); // ✅ for badge count

  // Lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-black/5">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-16 flex items-center justify-between">
            {/* ===== Brand with Logo ===== */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="ScentBase"
                className="h-10 w-10 object-contain"
              />
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-wide">ScentBase</p>
                <p className="text-xs text-black/55">Perfume Store</p>
              </div>
            </Link>

            {/* ===== Desktop Nav ===== */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/" end className={linkBase}>
                Home
              </NavLink>
              <NavLink to="/products" className={linkBase}>
                Products
              </NavLink>
              <NavLink to="/offers" className={linkBase}>
                Offers
              </NavLink>

              <Link
                to="/cart"
                className="px-4 py-2 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition"
              >
                Cart
              </Link>
            </nav>

            {/* ===== Mobile Toggle ===== */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden h-10 w-10 rounded-xl border border-black/10 grid place-items-center transition hover:bg-black/5"
              aria-label="Toggle menu"
            >
              <span className="text-xl">{open ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={`fixed inset-0 z-[999] md:hidden transition-all duration-300 ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* Overlay */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl
                      transition-transform duration-300 ease-out
                      ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Drawer Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-black/10">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="ScentBase"
                className="h-8 w-8 object-contain"
              />
              <p className="font-semibold text-black">Menu</p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="h-10 w-10 rounded-xl border border-black/10 grid place-items-center"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Menu Items */}
          <div className="px-6 py-6 flex flex-col gap-5">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Products" },
              { to: "/offers", label: "Offers" },
              // { to: "/contact", label: "Contact" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-black text-base font-medium py-2 border-b border-black/10 transition hover:pl-2"
              >
                {item.label}
              </NavLink>
            ))}

            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="mt-4 bg-black text-white py-3 rounded-xl text-center font-medium transition hover:opacity-90"
            >
              Cart
            </Link>
          </div>
        </div>
      </div>

      {/* ================= FLOATING CART BUTTON =================
          - shows on ALL pages
          - responsive
          - hides while mobile drawer is open (to avoid overlap)
          - placed slightly left so it won’t clash with WhatsApp button
      */}
      {!open && (
        <Link
          to="/cart"
          className="fixed bottom-6 right-24 z-[998]
                     w-14 h-14 rounded-full bg-black text-white
                     border border-white/15 shadow-xl
                     flex items-center justify-center
                     hover:scale-110 transition
                     md:hidden"
          aria-label="Open cart"
        >
          {/* cart icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M2.25 3a.75.75 0 000 1.5h1.386c.213 0 .4.142.458.347l2.63 9.189a2.25 2.25 0 002.162 1.635h7.65a2.25 2.25 0 002.162-1.635l1.67-5.835a.75.75 0 00-.72-.956H6.832l-.39-1.362A2.25 2.25 0 004.28 3H2.25z" />
            <path
              fillRule="evenodd"
              d="M9 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm7.5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
              clipRule="evenodd"
            />
          </svg>

          {/* badge */}
          {totals?.itemsCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1
                         rounded-full bg-[#b68a5a] text-black text-xs font-bold
                         flex items-center justify-center"
            >
              {totals.itemsCount}
            </span>
          )}
        </Link>
      )}
    </>
  );
}