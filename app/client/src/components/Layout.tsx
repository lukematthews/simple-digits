import { Outlet, useLocation } from "react-router-dom";
import { ProfileMenu } from "@/components/ProfileMenu";
import { useBudgetStore } from "@/store/useBudgetStore";
import { BudgetSettingsDropdown } from "./budget/settings/BudgetSettingsDropdown";
import { useEffect } from "react";

export default function Layout() {
  const location = useLocation();
  const isBudgetPage = location.pathname.startsWith("/b");
  const budget = useBudgetStore((s) => s.currentBudget);

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden w-full" style={{ height: "calc(var(--vh, 1vh) * 100)" }}>
      {/* Sticky Navbar */}
      <div className="h-20 flex-shrink-0 z-50 border-b shadow-sm px-4">
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
      <main className="flex-1 flex flex-col overflow-hidden w-full sm:max-w-screen-xl sm:mx-auto py-2" style={{ height: "calc(var(--vh, 1vh) * 100 - 5rem)" }}>
        <Outlet />
      </main>
    </div>
  );
}
