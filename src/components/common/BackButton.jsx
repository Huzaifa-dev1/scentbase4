import { useNavigate } from "react-router-dom";

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/15 hover:border-black/30 hover:bg-black hover:text-white transition text-sm font-medium ${className}`}
    >
      <span>←</span> Back
    </button>
  );
}
