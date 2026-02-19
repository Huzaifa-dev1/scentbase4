import { Link } from "react-router-dom";

export default function CollectionsSection() {
  return (
    <section className="bg-[#0b0b0c]">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <CollectionCard
            title="Women’s Collection"
            desc="Soft florals, musks, and elegant daily wear."
            btn="Shop Women"
            to="/products"
            gradient="from-[#2a111a] via-[#140a12] to-[#0b0b0c]"
            accent="bg-[#d9a7b2]"
            glow="shadow-[0_0_60px_rgba(217,167,178,0.15)]"
          />
          <CollectionCard
            title="Men’s Collection"
            desc="Fresh citrus, woody, oud — confident and bold."
            btn="Shop Men"
            to="/products"
            gradient="from-[#1c170f] via-[#0f0f10] to-[#0b0b0c]"
            accent="bg-[#b68a5a]"
            glow="shadow-[0_0_60px_rgba(182,138,90,0.15)]"
          />
        </div>
      </div>
    </section>
  );
}

function CollectionCard({
  title,
  desc,
  btn,
  to,
  gradient,
  accent,
  glow,
}) {
  return (
    <div
      className={`group relative rounded-[2rem] border border-white/10 
      bg-gradient-to-br ${gradient} ${glow}
      overflow-hidden transition-all duration-500 ease-out
      hover:scale-[1.03] hover:-translate-y-2`}
    >
      {/* subtle animated shine */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

      <div className="relative p-8 md:p-10">
        <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white">
          Collection
        </span>

        <h3 className="mt-5 text-2xl md:text-3xl font-semibold text-white">
          {title}
        </h3>

        <p className="text-white/70 mt-2 max-w-md">{desc}</p>

        <div className="mt-7 flex items-center gap-3">
          <Link
            to={to}
            className={`rounded-2xl px-6 py-3 text-sm font-medium text-black ${accent}
              transition-all duration-300
              hover:scale-105 hover:shadow-lg`}
          >
            {btn}
          </Link>

          <Link
            to="/offers"
            className="rounded-2xl px-6 py-3 text-sm font-medium border border-white/20 text-white
              transition-all duration-300
              hover:bg-white/10 hover:scale-105"
          >
            Deals →
          </Link>
        </div>
      </div>
    </div>
  );
}
