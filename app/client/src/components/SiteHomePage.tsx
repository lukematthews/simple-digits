import { WS_URL } from "@/config";

export default function SiteHomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Headline at top half */}
      <div className="flex-1 flex items-end justify-center pb-12">
        <h1 className="text-6xl font-serif font-bold text-gray-800 text-center">Budgets</h1>
      </div>

      <div className="flex justify-center mb-6">
        <a href={`${WS_URL}/auth/google`} className="px-6 py-3 bg-blue-600 text-white text-lg rounded-xl shadow hover:bg-blue-700 transition">
          Sign in
        </a>
      </div>
    </div>
  );
}
