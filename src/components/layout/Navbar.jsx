import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const linkBase =
  "text-sm font-medium text-black/70 hover:text-black transition";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
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
                <p className="text-sm font-semibold tracking-wide">
                  ScentBase
                </p>
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
              {/* <NavLink to="/contact" className={linkBase}>
                Contact
              </NavLink> */}

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
            >
              <span className="text-xl">
                {open ? "✕" : "☰"}
              </span>
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
              { to: "/contact", label: "Contact" },
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
    </>
  );
}
