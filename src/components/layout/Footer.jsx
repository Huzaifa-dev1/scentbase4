import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-semibold">ScentBase</p>
            <p className="text-sm text-black/60 mt-2 leading-relaxed">
              Premium inspired fragrances with fast COD ordering and quick support.
            </p>
          </div>

          

          <div>
            <p className="font-semibold">Support</p>
            <p className="text-sm text-black/60 mt-3">
              For complaints or order issues, use the Contact form or whatsapp us directly at : 03344448185
            </p>
            <p className="text-sm text-black/60 mt-2">
              Response time: <span className="text-black">Fast</span>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-black/10 pt-6">
          <p className="text-xs text-black/50">
            © {new Date().getFullYear()} ScentBase. All rights reserved.
          </p>
          <p className="text-xs text-black/50">
            Built with React + Firebase
          </p>
        </div>
      </div>
    </footer>
  );
}
