import { useState } from "react";
import { WHATSAPP_NUMBER } from "../../data/siteConfig";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    order: "",
    message: "",
  });

  // Existing quick-order link (keep as-is)
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I want to place an order from ScentBase. Product name: ____ , City: ____ , Address: ____"
  )}`;

  // ✅ NEW: send form message to WhatsApp (no design change)
  const handleSendWhatsApp = () => {
    // basic validation (no UI change)
    if (!form.name.trim()) return alert("Please enter your name");
    if (!form.phone.trim()) return alert("Please enter your phone");
    if (!form.message.trim()) return alert("Please write your message");

    const text =
      `ScentBase Support Message:%0A` +
      `Name: ${form.name}%0A` +
      `Phone: ${form.phone}%0A` +
      `Order No: ${form.order || "N/A"}%0A` +
      `Message: ${form.message}`;

    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(link, "_blank", "noopener,noreferrer");

    // optional: clear form after opening WhatsApp
    setForm({ name: "", phone: "", order: "", message: "" });
  };

  return (
    <section className="bg-[#0b0b0c]">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-[2.25rem] bg-white/5 border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.35)] overflow-hidden backdrop-blur-sm">
          <div className="grid lg:grid-cols-2">
            {/* LEFT: Support Form */}
            <div className="p-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                Need help?
              </h2>
              <p className="text-white/70 mt-2">
                For order issues, complaints, or queries — contact us anytime.
              </p>

              <div className="mt-6 grid gap-3">
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
                  placeholder="Your name"
                />
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
                  placeholder="Phone"
                />
                <input
                  value={form.order}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, order: e.target.value }))
                  }
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
                  placeholder="Order number (optional)"
                />
                <textarea
                  rows="4"
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/30"
                  placeholder="Write your message"
                />

                {/* ✅ UI SAME: only added onClick */}
                <button
                  onClick={handleSendWhatsApp}
                  className="rounded-2xl px-5 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition"
                >
                  Send Message
                </button>
              </div>
            </div>

            {/* RIGHT: Quick Order (unchanged) */}
            <div className="p-8 bg-gradient-to-br from-[#1b1412] via-[#0f0f10] to-[#0b0b0c] border-t lg:border-t-0 lg:border-l border-white/10">
              <p className="text-xs font-medium bg-white/10 border border-white/10 px-3 py-1 rounded-full w-fit text-white">
                Quick Order
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                Order directly on WhatsApp
              </h3>
              <p className="text-white/70 mt-2 max-w-md">
                Click WhatsApp and send product name + city + address for fastest
                COD order.
              </p>

              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-medium bg-[#b68a5a] text-black hover:opacity-90 transition w-full sm:w-fit"
              >
                WhatsApp Order →
              </a>

              <p className="text-xs text-white/50 mt-4">
                Replace number in siteConfig.js (no + sign)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
