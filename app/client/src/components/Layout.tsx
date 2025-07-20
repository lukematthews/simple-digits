import { Outlet, useLocation } from "react-router-dom";
import { ProfileMenu } from "@/components/ProfileMenu";
import { useBudgetStore } from "@/store/useBudgetStore";
import { BudgetSettingsDropdown } from "./budget/settings/BudgetSettingsDropdown";

export default function Layout() {
  const location = useLocation();
  const isBudgetPage = location.pathname.startsWith("/b");
  const budget = useBudgetStore((s) => s.currentBudget);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm px-4">
        <div className="flex justify-between items-center py-4 max-w-screen-xl mx-auto">
          {/* Left: Budget Name (only on /b routes and when loaded) */}
          <div>
            {isBudgetPage && budget?.name && (
              <h1 className="text-3xl font-bold text-gray-700">
                <BudgetSettingsDropdown/>
                {budget.name}
              </h1>
            )}
          </div>

          {/* Right: App Name + Profile */}
          <div className="flex items-center gap-x-4">
            <a href="/b">
              <h2 className="text-2xl font-semibold text-gray-800">Simple Digits</h2>
            </a>
            <ProfileMenu />
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="flex-1 px-4 max-w-screen-xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
