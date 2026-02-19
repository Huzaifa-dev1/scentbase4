export default function RatingsSection() {
  return (
    <section className="bg-gradient-to-b from-[#0b0b0c] to-[#0f0f10] border-y border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              Loved by customers
            </h2>
            <p className="text-white/70 mt-2">
              Add your rating after receiving your order.
            </p>

            <div className="mt-6 grid gap-3">
              <ReviewMini name="Areeba" text="Smells premium, lasts long. Packaging was clean." />
              <ReviewMini name="Hassan" text="Fast COD delivery. Strong projection. Worth it." />
              <ReviewMini name="Maha" text="Super elegant and smooth. Daily wear perfect." />
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
            <p className="font-semibold text-white">Leave a rating</p>
            <p className="text-sm text-white/70 mt-1">
              (We’ll connect this to Firebase ratings next.)
            </p>

            <div className="mt-5 grid gap-3">
              <input
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
                placeholder="Your name"
              />
              <input
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
                placeholder="Stars (1-5)"
              />
              <textarea
                rows="4"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
                placeholder="Short feedback"
              />
              <button className="rounded-2xl px-5 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition">
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewMini({ name, text }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <p className="font-medium text-white">{name}</p>
        <p className="text-sm text-[#b68a5a]">★★★★★</p>
      </div>
      <p className="text-sm text-white/70 mt-2">{text}</p>
    </div>
  );
}
