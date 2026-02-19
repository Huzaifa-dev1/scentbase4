import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden h-[90vh] min-h-[600px]">
      
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          src="/herovid.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Luxury dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 h-full flex items-center">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white backdrop-blur">
            ✦ Premium Inspired Fragrances
          </p>

          <h1 className="mt-5 text-4xl md:text-6xl font-semibold leading-tight text-white">
            Smell expensive.
            <span className="block text-white/70">Pay on delivery.</span>
          </h1>

          <p className="mt-4 text-base md:text-lg text-white/70 leading-relaxed">
            Luxury vibes, long-lasting performance, and fast COD ordering —
            no delays, no complicated checkout.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              to="/products"
              className="rounded-2xl px-6 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:scale-105 hover:opacity-90 transition shadow-lg shadow-black/30"
            >
              Explore Products
            </Link>

            <Link
              to="/offers"
              className="rounded-2xl px-6 py-3 text-sm font-medium border border-white/20 text-white hover:bg-white/10 hover:scale-105 transition"
            >
              View Deals
            </Link>
          </div>

          {/* Quick stats */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            <Stat title="Fast COD" desc="Simple checkout" />
            <Stat title="Long Lasting" desc="Strong projection" />
            <Stat title="Support" desc="Quick response" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ title, desc }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-sm transition hover:scale-105 duration-300">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-white/70 mt-1">{desc}</p>
    </div>
  );
}
