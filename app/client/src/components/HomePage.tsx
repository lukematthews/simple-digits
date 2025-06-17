import { useBudgetStore } from "@/store/useBudgetStore";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { budgetSummaries, loadBudgetSummaries } = useBudgetStore();

  useEffect(() => {
    loadBudgetSummaries();
  }, [loadBudgetSummaries]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Headline at top half */}
      <div className="flex-1 flex items-end justify-center pb-12">
        <h1 className="text-6xl font-serif font-bold text-gray-800 text-center">
          Budgets
        </h1>
      </div>

      {/* Budget cards in lower half, centered horizontally */}
      <div className="flex-1 flex items-start justify-center px-6">
        <div className="w-full max-w-5xl flex flex-wrap justify-center gap-8">
          {budgetSummaries.map((b) => (
            <div
              key={b.id}
              className="bg-blue-600 text-white rounded-2xl shadow-lg p-6 w-80 flex flex-col justify-between"
            >
              <h2 className="text-2xl font-semibold mb-4">{b.name}</h2>
              <Link
                to={`/${b.shortCode}`}
                className="mt-auto px-4 py-2 bg-white text-blue-600 text-center font-medium rounded-xl hover:bg-blue-100 transition"
              >
                Open
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
