import { WHATSAPP_NUMBER } from "../../data/siteConfig";

export default function WhatsAppFloat() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! I want to place an order on ScentBase."
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[999] group"
    >
      <img
        src="/whatsapp.png"
        alt="WhatsApp"
        className="h-14 w-14 md:h-16 md:w-16 rounded-full shadow-xl transition-transform duration-300 group-hover:scale-110"
      />
    </a>
  );
}
