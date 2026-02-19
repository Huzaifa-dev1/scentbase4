import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppFloat from "../common/WhatsAppFloat";

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      {children}
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
