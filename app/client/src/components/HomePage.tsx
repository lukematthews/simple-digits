import { useBudgetStore } from "@/store/useBudgetStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BudgetWizard from "./budget/BudgetWizard";
import { useIsMobile } from "@/hooks/useIsMobile";
import BudgetWizardMobile from "./mobile/BudgetWizardMobile";
import { Button } from "./ui/button";

export default function HomePage() {
  const navigate = useNavigate();
  const { budgetSummaries, loadBudgetSummaries } = useBudgetStore();
  const [showWizard, setShowWizard] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadBudgetSummaries();
  }, [loadBudgetSummaries]);

  return (
    <div className={`flex ${!isMobile ? "h-screen" : ""} flex-col overflow-y-auto max-w-screen-xl mx-auto`}>
      <div className="flex-1 flex items-end justify-center pb-12 mt-4">
        <h1 className="text-6xl font-serif font-bold text-center">Your Budgets</h1>
      </div>

      <div className="flex-1 flex items-start justify-center px-6">
        {budgetSummaries.length === 0 ? (
          <div className="text-center space-y-4">
            <p className="">No budgets found.</p>
          </div>
        ) : (
          <div className="w-full max-w-5xl flex flex-wrap justify-center gap-8">
            {budgetSummaries.map((b) => (
              <div key={b.id} className="bg-blue-600 text-white rounded-2xl shadow-lg p-6 w-80 flex flex-col justify-between">
                <h2 className="text-2xl font-semibold mb-4">{b.name}</h2>
                <Button variant="secondary" className="mt-auto" onClick={() => navigate(`/b/${b.shortCode}`)}>
                  Open
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {!showWizard ? (
        <div className="text-center my-8">
          <Button className="px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition" onClick={() => setShowWizard(true)}>
            Create budget...
          </Button>
        </div>
      ) : (
        <div className="mt-6 px-6 my-8">{isMobile ? <BudgetWizardMobile onCancel={() => setShowWizard(false)} /> : <BudgetWizard onCancel={() => setShowWizard(false)} />}</div>
      )}
    </div>
  );
}
