import { Outlet, useLocation } from "react-router-dom";
import { ProfileMenu } from "@/components/ProfileMenu";
import { useBudgetStore } from "@/store/useBudgetStore";
import { BudgetSettingsDropdown } from "./budget/settings/BudgetSettingsDropdown";

export default function Layout() {
  const location = useLocation();
  const isBudgetPage = location.pathname.startsWith("/b");
  const budget = useBudgetStore((s) => s.currentBudget);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden w-full">
      {/* Sticky Navbar */}
      <div className="h-20 flex-shrink-0 z-50 bg-white border-b shadow-sm px-4">
        <div className="flex justify-between items-center h-full max-w-screen-xl mx-auto">
          {/* Left: Budget Name (only on /b routes and when loaded) */}
          <div>
            {isBudgetPage && budget?.name && (
              <h1 className="text-3xl font-bold text-gray-700">
                <BudgetSettingsDropdown />
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
      <main className="flex-1 flex flex-col overflow-hidden w-full sm:max-w-screen-xl sm:mx-auto py-2">
        <Outlet />
      </main>
    </div>
  );
}
