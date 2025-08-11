// Header.tsx
import { useLocation } from "react-router-dom";
import { BudgetSettingsDropdown } from "@/components/budget/settings/BudgetSettingsDropdown";
import { ProfileMenu } from "@/components/ProfileMenu";
import { useBudgetStore } from "@/store/useBudgetStore";

export default function Header() {
  const location = useLocation();
  const isBudgetPage = location.pathname.startsWith("/b");
  const budget = useBudgetStore((s) => s.currentBudget);

  return (
    <div className="h-20 flex-shrink-0 z-50 border-b shadow-sm px-4">
      <div className="flex justify-between items-center h-full">
        <div>
          {isBudgetPage && budget?.name && (
            <BudgetSettingsDropdown budgetName={budget.name} />
          )}
        </div>
        <div className="flex items-center gap-x-4">
          <a href="/b">
            <h2 className="text-2xl font-semibold">Simple Digits</h2>
          </a>
          <ProfileMenu />
        </div>
      </div>
    </div>
  );
}
